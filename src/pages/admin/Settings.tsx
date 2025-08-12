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
                        <Input value={s.value || ''} onChange={(e) => update(category, s.key, e.target.value)} />
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
    </div>
  );
};

export default SettingsPage;