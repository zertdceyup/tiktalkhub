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

const ContentRepurposer: React.FC = () => {
  const [text, setText] = useState('');
  const [target, setTarget] = useState<'tweet-thread'|'linkedin-post'|'tiktok-script'|'instagram-caption'|'blog-outline'>('tweet-thread');
  const [output, setOutput] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: async () => (await api.repurposeContent({ text, target })).data as any,
    onSuccess: (data) => setOutput(data.output || ''),
    onError: (err) => alert(getErrorMessage(err))
  });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const jsonLd = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Content Repurposer', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', url: typeof window !== 'undefined' ? window.location.href : '' };

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };

  return (
    <div className="min-h-screen">
      <SEO title="Content Repurposer | Content Tools | Tiktalkhub" description="Turn one piece of content into multiple formats like tweet threads, LinkedIn posts, or TikTok scripts." keywords={["content repurpose","tweet thread","linkedin post","tiktok script"]} canonical="/tools/content/content-repurposer" jsonLd={jsonLd} />
      <Header />
      <div className="container mx-auto px-6"><Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'Content Tools', href: '/tools/text-tools' }, { name: 'Content Repurposer' }]} jsonLdBaseUrl={baseUrl} /></div>
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="tiktok-card">
              <CardHeader>
                <CardTitle>Content Repurposer</CardTitle>
                <CardDescription>Transform content into platform-ready formats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Source Content</Label>
                  <Textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your content here..." />
                </div>
                <div className="space-y-2">
                  <Label>Target Format</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={target} onChange={(e) => setTarget(e.target.value as any)}>
                    <option value="tweet-thread">Tweet Thread</option>
                    <option value="linkedin-post">LinkedIn Post</option>
                    <option value="tiktok-script">TikTok Script</option>
                    <option value="instagram-caption">Instagram Caption</option>
                    <option value="blog-outline">Blog Outline</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || text.length < 50}>Repurpose</Button>
                  <Button variant="outline" onClick={copy} disabled={!output}>Copy</Button>
                </div>
                {output && (
                  <pre className="whitespace-pre-wrap text-sm border rounded p-3 bg-secondary/30">{output}</pre>
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="tiktok-card">
              <CardHeader><CardTitle>Tips</CardTitle><CardDescription>Make it platform-ready</CardDescription></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Use hooks, short sentences, and clear CTAs.</p>
                <p>• Adapt tone to the platform and audience.</p>
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

export default ContentRepurposer;