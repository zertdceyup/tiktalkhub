import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import api, { getErrorMessage } from '@/lib/api';

const HookLab: React.FC = () => {
  const [seed, setSeed] = useState('');
  const [count, setCount] = useState<number>(8);
  const [variants, setVariants] = useState<{ text: string; score: number; reasons?: string[] }[]>([]);
  const [picked, setPicked] = useState<number[]>([]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => (await (api as any).hookLab({ seed, count })).data as any,
    onSuccess: (data) => setVariants(data.variants || []),
    onError: (err) => alert(getErrorMessage(err))
  });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const jsonLd = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Hook Lab', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', url: typeof window !== 'undefined' ? window.location.href : '' };

  return (
    <div className="min-h-screen">
      <SEO title="Hook Lab | Content Tools | Tiktalkhub" description="Generate, score, and iterate hooks to maximize CTR and watch time." keywords={["hook lab","hook variants","content hooks"]} canonical="/tools/content/hook-lab" jsonLd={jsonLd} />
      <Header />
      <div className="container mx-auto px-6"><Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'Content Tools', href: '/tools/text-tools' }, { name: 'Hook Lab' }]} jsonLdBaseUrl={baseUrl} /></div>
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Hook Lab</CardTitle>
              <CardDescription>Generate multiple hooks, score, and pick winners</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Seed idea or topic</Label>
                  <Input value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="e.g., Time management for freelancers" />
                </div>
                <div className="space-y-2">
                  <Label>Variants</Label>
                  <Input type="number" min={3} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || seed.length < 3}>Generate</Button>
              </div>
              {variants.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4">
                  {variants.map((v, idx) => (
                    <div key={idx} className={`border rounded p-3 ${picked.includes(idx) ? 'ring-2 ring-primary' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Score: {Math.round(v.score)}/100</span>
                        <Button size="sm" variant="outline" onClick={() => setPicked(p => p.includes(idx) ? p.filter(i => i!==idx) : [...p, idx])}>{picked.includes(idx) ? 'Picked' : 'Pick'}</Button>
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{v.text}</div>
                      {v.reasons && v.reasons.length > 0 && (
                        <ul className="list-disc pl-5 text-xs text-muted-foreground mt-2">
                          {v.reasons.map((r, i) => (<li key={i}>{r}</li>))}
                        </ul>
                      )}
                    </div>
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

export default HookLab;