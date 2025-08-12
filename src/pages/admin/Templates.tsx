import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const fetchTemplates = async () => {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/templates`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
};

const createTemplate = async (data: any) => {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/templates`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create template');
  return res.json();
};

const updateTemplate = async ({ id, data }: { id: number; data: any }) => {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/templates/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update template');
  return res.json();
};

const deleteTemplate = async (id: number) => {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/templates/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to delete template');
  return res.json();
};

const AdminTemplates: React.FC = () => {
  const { data, refetch, isLoading } = useQuery({ queryKey: ['adminTemplates'], queryFn: fetchTemplates });
  const [draft, setDraft] = useState<any>({ name: '', type: '', category: '' });
  const createMut = useMutation({ mutationFn: createTemplate, onSuccess: () => { setDraft({ name: '', type: '', category: '' }); refetch(); } });
  const upd = useMutation({ mutationFn: updateTemplate, onSuccess: () => refetch() });
  const del = useMutation({ mutationFn: deleteTemplate, onSuccess: () => refetch() });

  return (
    <div className="container mx-auto px-6 py-8">
      <Card>
        <CardHeader><CardTitle>Admin • Templates</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">New Template</h3>
              <div className="space-y-2">
                <Input placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                <Input placeholder="Type (e.g., video, flyer)" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} />
                <Input placeholder="Category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
                <Button className="btn-gold" onClick={() => createMut.mutate(draft)} disabled={createMut.isPending}>Create</Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Templates</h3>
              {isLoading ? 'Loading…' : (
                <div className="space-y-3">
                  {data?.templates?.map((t: any) => (
                    <Card key={t.id}>
                      <CardContent className="p-4 grid md:grid-cols-5 gap-2 items-center">
                        <div className="font-medium md:col-span-2">{t.name} <span className="text-xs text-muted-foreground">({t.type})</span></div>
                        <Input defaultValue={t.category || ''} onBlur={(e) => upd.mutate({ id: t.id, data: { category: e.target.value } })} />
                        <Button variant="outline" onClick={() => del.mutate(t.id)} disabled={del.isPending}>Delete</Button>
                      </CardContent>
                    </Card>
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

export default AdminTemplates;