import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const fetchSettings = async () => {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/settings`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
};

const saveSettings = async (settings: any[]) => {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ settings }) });
  if (!res.ok) throw new Error('Failed to save settings');
  return res.json();
};

const SettingsPage: React.FC = () => {
  const { data, isLoading, refetch } = useQuery({ queryKey: ['adminSettings'], queryFn: fetchSettings });
  const [local, setLocal] = useState<Record<string, any[]>>({});
  const { mutate, isPending } = useMutation({ mutationFn: saveSettings, onSuccess: () => refetch() });

  useEffect(() => { if (data?.settings) setLocal(data.settings); }, [data]);

  const update = (category: string, key: string, value: string) => {
    const arr = local[category].map((s: any) => s.key === key ? { ...s, value } : s);
    setLocal({ ...local, [category]: arr });
  };

  const flatten = () => Object.values(local).flat();

  return (
    <div className="container mx-auto px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? 'Loading…' : (
            <div className="space-y-6">
              {Object.entries(local).map(([category, items]) => (
                <div key={category}>
                  <h3 className="font-semibold mb-2 capitalize">{category}</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {(items as any[]).map((s) => (
                      <div key={s.key} className="space-y-1">
                        <div className="text-xs text-muted-foreground">{s.key}</div>
                        {s.key === 'search_console_meta' ? (
                          <textarea className="w-full h-24 rounded border p-2 text-sm font-mono" value={s.value || ''} onChange={(e) => update(category, s.key, e.target.value)} placeholder='<meta name="google-site-verification" content="..." /> or code' />
                        ) : (
                          <Input value={s.value || ''} onChange={(e) => update(category, s.key, e.target.value)} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <Button className="btn-gold" disabled={isPending} onClick={() => mutate(flatten())}>Save</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Page Design Tokens Manager */}
      <PageTokensManager />
      <BlogCurationManager />
    </div>
  );
};

const PageTokensManager: React.FC = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [path, setPath] = useState<string>('');
  const [tokens, setTokens] = useState<string>('{}');

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const fetchPages = async () => {
    const res = await fetch(`${base}/admin/page-settings`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Failed to load page settings');
    const j = await res.json();
    setPages(j.pages || []);
  };

  useEffect(() => { fetchPages(); }, []);

  const save = async () => {
    const res = await fetch(`${base}/admin/page-settings`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ page_path: path, tokens_json: tokens }) });
    if (!res.ok) { alert('Save failed'); return; }
    setPath(''); setTokens('{}'); fetchPages();
  };

  const remove = async (id: number) => {
    const res = await fetch(`${base}/admin/page-settings/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) { alert('Delete failed'); return; }
    fetchPages();
  };

  return (
    <Card className="mt-8">
      <CardHeader><CardTitle>Page Design Tokens</CardTitle></CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="text-sm font-medium">Create / Update</div>
            <Input placeholder="Page path (e.g., /tools/video)" value={path} onChange={(e) => setPath(e.target.value)} />
            <textarea className="w-full h-40 rounded border p-2 text-sm font-mono" value={tokens} onChange={(e) => setTokens(e.target.value)} placeholder='{"--brand":"#111","--accent":"#a78bfa"}' />
            <Button className="btn-gold" onClick={save}>Save Tokens</Button>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Existing Pages</div>
            <div className="space-y-2">
              {pages.map((p) => (
                <div key={p.id} className="border rounded p-3 text-sm flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{p.page_path}</div>
                    <pre className="whitespace-pre-wrap break-all text-muted-foreground">{p.tokens_json}</pre>
                  </div>
                  <Button variant="destructive" onClick={() => remove(p.id)}>Delete</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BlogCurationManager: React.FC = () => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const [rules, setRules] = useState<any[]>([]);
  const [context, setContext] = useState<string>('home');
  const [rule, setRule] = useState<string>('{}');

  const load = async () => {
    const res = await fetch(`${base}/admin/blog-curation`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return; const j = await res.json(); setRules(j.rules || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const res = await fetch(`${base}/admin/blog-curation`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ context, rule: safeJson(rule) }) });
    if (!res.ok) { alert('Create failed'); return; }
    setRule('{}'); load();
  };
  const remove = async (id: number) => {
    const res = await fetch(`${base}/admin/blog-curation/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) { alert('Delete failed'); return; }
    load();
  };

  return (
    <Card className="mt-8">
      <CardHeader><CardTitle>Blog Curation Rules</CardTitle></CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input value={context} onChange={(e) => setContext(e.target.value)} placeholder="home | category:video | path:/tools/video" />
            <textarea className="w-full h-32 rounded border p-2 text-sm font-mono" value={rule} onChange={(e) => setRule(e.target.value)} placeholder='{"limit":6,"category":"video","pin":["post-slug-1"]}' />
            <Button className="btn-gold" onClick={add}>Add Rule</Button>
          </div>
          <div className="space-y-2">
            {rules.map((r) => (
              <div key={r.id} className="border rounded p-3 text-sm flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{r.context}</div>
                  <pre className="whitespace-pre-wrap break-all text-muted-foreground">{r.rule_json}</pre>
                </div>
                <Button variant="destructive" onClick={() => remove(r.id)}>Delete</Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPage;