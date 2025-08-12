import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SEO from '@/components/SEO';
import { useMutation } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';

const ViralHookGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState<'question'|'shocking'|'storytelling'|'tutorial'|'trend'>('question');
  const [count, setCount] = useState<number>(10);
  const [hooks, setHooks] = useState<any[] | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.tiktokViralHookGenerator({ topic, style, count });
      return res.data as any;
    },
    onSuccess: (d) => setHooks(d.hooks || []),
    onError: (err) => alert(getErrorMessage(err))
  });

  const copyAll = async () => {
    if (!hooks) return;
    await navigator.clipboard.writeText(hooks.map(h => h.hook).join('\n'));
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Viral Hook Generator | TikTok Tools | Tiktalkhub"
        description="Generate scroll-stopping TikTok hooks in multiple styles."
        keywords={["tiktok hooks","viral hook generator","video hooks"]}
        canonical="/tools/tiktok/viral-hook-generator"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Viral Hook Generator</CardTitle>
              <CardDescription>Enter your topic and pick a style</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Morning routines" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Style</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={style} onChange={(e) => setStyle(e.target.value as any)}>
                    <option value="question">Question</option>
                    <option value="shocking">Shocking</option>
                    <option value="storytelling">Storytelling</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="trend">Trend</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Count</Label>
                  <Input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !topic}>Generate</Button>
                <Button variant="outline" onClick={copyAll} disabled={!hooks?.length}>Copy All</Button>
              </div>
              {hooks && hooks.length > 0 && (
                <div className="space-y-2 mt-4">
                  {hooks.map((h, i) => (
                    <div key={i} className="border rounded p-3 text-sm whitespace-pre-wrap">{h.hook}</div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
      <TikoAI />
    </div>
  );
};

export default ViralHookGenerator;