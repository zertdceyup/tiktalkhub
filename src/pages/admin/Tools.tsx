import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const fetchTools = async () => {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/tools`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch tools');
  return res.json();
};

const updateTool = async ({ id, data }: { id: number; data: any }) => {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/tools/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update tool');
  return res.json();
};

const AdminTools: React.FC = () => {
  const { data, refetch, isLoading } = useQuery({ queryKey: ['adminTools'], queryFn: fetchTools });
  const mut = useMutation({ mutationFn: updateTool, onSuccess: () => refetch() });

  return (
    <div className="container mx-auto px-6 py-8">
      <Card>
        <CardHeader><CardTitle>Admin • Tools</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? 'Loading…' : (
            <div className="space-y-3">
              {data?.tools?.map((t: any) => (
                <div key={t.id} className="border rounded p-3 grid md:grid-cols-6 gap-2 items-center">
                  <div className="md:col-span-2 font-medium">{t.name} <span className="text-xs text-muted-foreground">({t.category})</span></div>
                  <Input className="md:col-span-2" defaultValue={t.description || ''} onBlur={(e) => mut.mutate({ id: t.id, data: { description: e.target.value } })} />
                  <div className="flex gap-2 md:justify-end">
                    <Button variant={t.is_active ? 'default' : 'outline'} onClick={() => mut.mutate({ id: t.id, data: { is_active: !t.is_active } })}>{t.is_active ? 'Active' : 'Inactive'}</Button>
                    <Button variant={t.is_featured ? 'default' : 'outline'} onClick={() => mut.mutate({ id: t.id, data: { is_featured: !t.is_featured } })}>{t.is_featured ? 'Featured' : 'Feature'}</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTools;