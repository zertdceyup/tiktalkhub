import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FaqEntry { id?: number; page_path: string; items: { q: string; a: string }[] }

const AdminFAQs: React.FC = () => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const [faqs, setFaqs] = useState<FaqEntry[]>([]);
  const [editing, setEditing] = useState<FaqEntry>({ page_path: '', items: [{ q: '', a: '' }] });
  const [loading, setLoading] = useState<boolean>(false);

  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${base}/admin/faqs`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const j = await res.json();
      setFaqs((j.faqs || []).map((r: any) => ({ id: r.id, page_path: r.page_path, items: safeJson(r.items_json) })));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addItem = () => setEditing(e => ({ ...e, items: [...e.items, { q: '', a: '' }] }));
  const removeItem = (idx: number) => setEditing(e => ({ ...e, items: e.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx: number, field: 'q'|'a', value: string) => setEditing(e => ({ ...e, items: e.items.map((it, i) => i === idx ? { ...it, [field]: value } : it) }));

  const resetForm = () => setEditing({ page_path: '', items: [{ q: '', a: '' }] });

  const save = async () => {
    try {
      if (!editing.page_path || editing.items.length === 0) return alert('Please provide a page path and at least one FAQ');
      if (editing.id) {
        const res = await fetch(`${base}/admin/faqs/${editing.id}`, { method: 'PUT', headers, body: JSON.stringify({ items: editing.items }) });
        if (!res.ok) throw new Error('Update failed');
      } else {
        const res = await fetch(`${base}/admin/faqs`, { method: 'POST', headers, body: JSON.stringify({ page_path: editing.page_path, items: editing.items }) });
        if (!res.ok) throw new Error('Create failed');
      }
      resetForm(); load();
    } catch (e: any) { alert(e?.message || 'Save failed'); }
  };

  const edit = (f: FaqEntry) => setEditing(JSON.parse(JSON.stringify(f)));
  const del = async (id?: number) => { if (!id) return; if (!confirm('Delete FAQs for this page?')) return; const res = await fetch(`${base}/admin/faqs/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} }); if (!res.ok) { alert('Delete failed'); return; } load(); };

  return (
    <div className="container mx-auto px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>FAQs Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium mb-2">Create / Edit FAQs</div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Page path (example: /tools/video/trimmer)</div>
                  <Input placeholder="/tools/..." value={editing.page_path} onChange={(e) => setEditing({ ...editing, page_path: e.target.value })} disabled={!!editing.id} />
                </div>
                <div className="space-y-3">
                  {editing.items.map((it, idx) => (
                    <div key={idx} className="border rounded p-3 space-y-2">
                      <Input placeholder={`Question #${idx+1}`} value={it.q} onChange={(e) => updateItem(idx, 'q', e.target.value)} />
                      <textarea className="w-full h-24 rounded border p-2 text-sm" placeholder="Answer" value={it.a} onChange={(e) => updateItem(idx, 'a', e.target.value)} />
                      <div className="flex justify-end"><Button variant="destructive" onClick={() => removeItem(idx)} disabled={editing.items.length === 1}>Remove</Button></div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addItem}>Add Question</Button>
                </div>
                <div className="flex gap-2">
                  <Button className="btn-gold" onClick={save}>Save</Button>
                  <Button variant="outline" onClick={resetForm}>Clear</Button>
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Existing FAQs</div>
              {loading ? 'Loading…' : (
                <div className="space-y-2">
                  {faqs.length === 0 && <div className="text-sm text-muted-foreground">No FAQs yet</div>}
                  {faqs.map((f) => (
                    <div key={f.id} className="border rounded p-3 text-sm">
                      <div className="font-medium mb-1">{f.page_path}</div>
                      <ul className="list-disc pl-5">
                        {f.items.map((it, i) => (<li key={i}><span className="font-medium">Q:</span> {it.q}</li>))}
                      </ul>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" onClick={() => edit(f)}>Edit</Button>
                        <Button variant="destructive" onClick={() => del(f.id)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function safeJson(s: string) { try { return JSON.parse(s || '[]'); } catch { return []; } }

export default AdminFAQs;