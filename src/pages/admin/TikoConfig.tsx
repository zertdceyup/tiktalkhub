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

const AdminTikoConfig: React.FC = () => {
  const { data, isLoading, refetch } = useQuery({ queryKey: ['adminSettings'], queryFn: fetchSettings });
  const [local, setLocal] = useState<Record<string, any[]>>({});
  const { mutate, isPending } = useMutation({ mutationFn: saveSettings, onSuccess: () => refetch() });

  useEffect(() => { if (data?.settings) setLocal(data.settings); }, [data]);

  const setVal = (key: string, value: string) => {
    const cat = key.startsWith('tiko_') ? 'tiko' : 'ai';
    const arr = (local[cat] || []).map((s: any) => s.key === key ? { ...s, value } : s);
    setLocal({ ...local, [cat]: arr });
  };

  const flatten = () => Object.values(local).flat().filter((s: any) => ['enable_local_ai','ai_model_path','whisper_bin','whisper_model','tts_bin','tts_voice','tiko_persona','tiko_suggestions_enabled'].includes(s.key));

  return (
    <div className="container mx-auto px-6 py-8">
      <Card>
        <CardHeader><CardTitle>Admin • Tiko & AI Configuration</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? 'Loading…' : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">enable_local_ai</div>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={local.ai?.find((s:any)=>s.key==='enable_local_ai')?.value || 'true'} onChange={(e) => setVal('enable_local_ai', e.target.value)}>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">ai_model_path</div>
                  <Input value={local.ai?.find((s:any)=>s.key==='ai_model_path')?.value || ''} onChange={(e) => setVal('ai_model_path', e.target.value)} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">whisper_bin</div>
                  <Input value={local.ai?.find((s:any)=>s.key==='whisper_bin')?.value || ''} onChange={(e) => setVal('whisper_bin', e.target.value)} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">whisper_model</div>
                  <Input value={local.ai?.find((s:any)=>s.key==='whisper_model')?.value || ''} onChange={(e) => setVal('whisper_model', e.target.value)} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">tts_bin</div>
                  <Input value={local.ai?.find((s:any)=>s.key==='tts_bin')?.value || ''} onChange={(e) => setVal('tts_bin', e.target.value)} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">tts_voice</div>
                  <Input value={local.ai?.find((s:any)=>s.key==='tts_voice')?.value || ''} onChange={(e) => setVal('tts_voice', e.target.value)} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">tiko_persona</div>
                  <Input value={local.tiko?.find((s:any)=>s.key==='tiko_persona')?.value || ''} onChange={(e) => setVal('tiko_persona', e.target.value)} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">tiko_suggestions_enabled</div>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={local.tiko?.find((s:any)=>s.key==='tiko_suggestions_enabled')?.value || 'true'} onChange={(e) => setVal('tiko_suggestions_enabled', e.target.value)}>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                </div>
              </div>
              <div className="pt-2">
                <Button className="btn-gold" disabled={isPending} onClick={() => mutate(flatten())}>Save</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTikoConfig;