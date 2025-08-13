import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import api, { getErrorMessage } from '@/lib/api';

const allTargets = ['tweet-thread','linkedin-post','tiktok-script','instagram-caption','blog-outline'] as const;

type Target = typeof allTargets[number];

const ContentRepurposePacks: React.FC = () => {
  const [text, setText] = useState('');
  const [selected, setSelected] = useState<Record<Target, boolean>>({
    'tweet-thread': true,
    'linkedin-post': true,
    'tiktok-script': true,
    'instagram-caption': false,
    'blog-outline': false,
  });
  const [outputs, setOutputs] = useState<Record<Target, string>>({} as any);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const targets: Target[] = allTargets.filter(t => selected[t]);
      const results = await Promise.all(targets.map(async (t) => ({ t, res: await api.repurposeContent({ text, target: t }) })));
      const mapped: Record<Target, string> = {} as any;
      for (const r of results) mapped[r.t] = r.res.data?.output || '';
      return mapped;
    },
    onSuccess: (data) => setOutputs(data),
    onError: (err) => alert(getErrorMessage(err))
  });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const jsonLd = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Repurpose Packs', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', url: typeof window !== 'undefined' ? window.location.href : '' };

  return (
    <div className="min-h-screen">
      <SEO title="Repurpose Packs | Content Tools | Tiktalkhub" description="Generate multiple platform-ready outputs from one piece of content in one click." keywords={["repurpose packs","multi-output","social formats"]} canonical="/tools/content/repurpose-packs" jsonLd={jsonLd} />
      <Header />
      <div className="container mx-auto px-6"><Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'Content Tools', href: '/tools/text-tools' }, { name: 'Repurpose Packs' }]} jsonLdBaseUrl={baseUrl} /></div>
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="tiktok-card">
              <CardHeader><CardTitle>Repurpose Packs</CardTitle><CardDescription>Create multi-channel outputs instantly</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Source Content</Label>
                  <Textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your content here..." />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allTargets.map((t) => (
                    <label key={t} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!selected[t]} onChange={(e) => setSelected(s => ({ ...s, [t]: e.target.checked }))} />
                      {t.replace('-', ' ')}
                    </label>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || text.length < 50}>Generate Pack</Button>
                </div>
              </CardContent>
            </Card>
            {Object.keys(outputs).length > 0 && (
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                {allTargets.filter(t => outputs[t as Target]).map((t) => (
                  <Card key={t} className="tiktok-card">
                    <CardHeader><CardTitle className="capitalize">{t.replace('-', ' ')}</CardTitle></CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-wrap text-sm border rounded p-3 bg-secondary/30">{outputs[t as Target]}</pre>
                      <div className="mt-2"><Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(outputs[t as Target])}>Copy</Button></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <div>
            <Card className="tiktok-card">
              <CardHeader><CardTitle>Tips</CardTitle><CardDescription>Platform specifics</CardDescription></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Threads: short sentences, cliffhangers.</p>
                <p>• LinkedIn: value-first, add CTA.</p>
                <p>• TikTok: hook, problem, solution, CTA.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
      <TikoAI />
    </div>
  );
};

export default ContentRepurposePacks;