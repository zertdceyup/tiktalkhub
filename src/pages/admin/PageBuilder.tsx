import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PageBuilder: React.FC = () => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const [pagePath, setPagePath] = useState<string>('/');
  const [blocks, setBlocks] = useState<any[]>([]);
  const [newBlockType, setNewBlockType] = useState<string>('hero');
  const [newBlockConfig, setNewBlockConfig] = useState<string>('{"title":"Welcome","subtitle":"Your subtitle"}');

  const loadBlocks = async () => {
    const res = await fetch(`${base}/public/page-blocks?path=${encodeURIComponent(pagePath)}`);
    const j = await res.json();
    setBlocks(j.blocks || []);
  };

  useEffect(() => { loadBlocks(); }, [pagePath]);

  const addBlock = async () => {
    const res = await fetch(`${base}/admin/page-blocks`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ page_path: pagePath, block_type: newBlockType, config: JSON.parse(newBlockConfig), position: (blocks[blocks.length-1]?.position || 0) + 1 }) });
    if (!res.ok) { alert('Failed to add block'); return; }
    setNewBlockConfig('{}'); loadBlocks();
  };

  const saveBlock = async (id: number, cfg: any, position: number) => {
    const res = await fetch(`${base}/admin/page-blocks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ config: cfg, position }) });
    if (!res.ok) { alert('Save failed'); return; }
    loadBlocks();
  };

  const deleteBlock = async (id: number) => {
    const res = await fetch(`${base}/admin/page-blocks/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) { alert('Delete failed'); return; }
    loadBlocks();
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin • Page Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <Input value={pagePath} onChange={(e) => setPagePath(e.target.value)} placeholder="/tools/video" />
            </div>
            <Button className="btn-gold" onClick={loadBlocks}>Load Blocks</Button>
          </div>

          <div className="grid md:grid-cols-3 gap-3 items-start">
            <div className="space-y-2">
              <div className="text-sm font-medium">Add Block</div>
              <select className="w-full h-10 rounded-md border bg-background px-3" value={newBlockType} onChange={(e) => setNewBlockType(e.target.value)}>
                <option value="hero">Hero</option>
                <option value="tools-grid">Tools Grid</option>
                <option value="blog">Blog</option>
                <option value="ad">Ad</option>
              </select>
              <textarea className="w-full h-32 rounded border p-2 text-sm font-mono" value={newBlockConfig} onChange={(e) => setNewBlockConfig(e.target.value)} />
              <Button onClick={addBlock}>Add Block</Button>
            </div>

            <div className="md:col-span-2 space-y-3">
              {blocks.map((b) => (
                <BlockEditor key={b.id} block={b} onSave={saveBlock} onDelete={deleteBlock} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const BlockEditor: React.FC<{ block: any; onSave: (id: number, cfg: any, pos: number) => void; onDelete: (id: number) => void }> = ({ block, onSave, onDelete }) => {
  const [cfg, setCfg] = useState<string>(JSON.stringify(block.config || {}, null, 2));
  const [pos, setPos] = useState<number>(block.position || 0);
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="text-sm text-muted-foreground">{block.block_type} • id {block.id}</div>
        <div className="grid md:grid-cols-5 gap-2 items-center">
          <Input className="md:col-span-1" type="number" value={pos} onChange={(e) => setPos(Number(e.target.value))} />
          <textarea className="md:col-span-3 h-40 rounded border p-2 text-sm font-mono" value={cfg} onChange={(e) => setCfg(e.target.value)} />
          <div className="flex gap-2 md:justify-end">
            <Button variant="outline" onClick={() => onSave(block.id, safeJson(cfg), pos)}>Save</Button>
            <Button variant="destructive" onClick={() => onDelete(block.id)}>Delete</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function safeJson(s: string) { try { return JSON.parse(s); } catch { return {}; } }

export default PageBuilder;