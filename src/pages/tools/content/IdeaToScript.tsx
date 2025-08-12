import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import api, { getErrorMessage } from '@/lib/api';

const IdeaToScript: React.FC = () => {
  const [idea, setIdea] = useState('');
  const [platform, setPlatform] = useState<'tiktok'|'youtube'|'reels'|'shorts'|'podcast'>('tiktok');
  const [script, setScript] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: async () => (await api.ideaToScript({ idea, platform })).data as any,
    onSuccess: (data) => setScript(data.script || ''),
    onError: (err) => alert(getErrorMessage(err))
  });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const jsonLd = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Idea to Script', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', url: typeof window !== 'undefined' ? window.location.href : '' };

  const copy = async () => { if (script) await navigator.clipboard.writeText(script); };

  return (
    <div className="min-h-screen">
      <SEO title="Idea to Script Generator | Content Tools | Tiktalkhub" description="Turn ideas into platform-specific scripts with a strong hook, clear beats, and CTA." keywords={["idea to script","tiktok script","youtube script"]} canonical="/tools/content/idea-to-script" jsonLd={jsonLd} />
      <Header />
      <div className="container mx-auto px-6"><Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'Content Tools', href: '/tools/text-tools' }, { name: 'Idea to Script' }]} jsonLdBaseUrl={baseUrl} /></div>
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Idea to Script</CardTitle>
              <CardDescription>Generate short-form scripts with hook, beats, and CTA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Idea</Label>
                <Input value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="e.g., Productivity hack for busy creators" />
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3" value={platform} onChange={(e) => setPlatform(e.target.value as any)}>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="reels">Instagram Reels</option>
                  <option value="shorts">YouTube Shorts</option>
                  <option value="podcast">Podcast</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || idea.length < 10}>Generate</Button>
                <Button variant="outline" onClick={copy} disabled={!script}>Copy</Button>
              </div>
              {script && (
                <Textarea rows={10} value={script} onChange={(e) => setScript(e.target.value)} />
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

export default IdeaToScript;