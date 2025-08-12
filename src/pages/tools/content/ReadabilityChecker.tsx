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

const ReadabilityChecker: React.FC = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => (await api.analyzeReadabilityText({ text })).data as any,
    onSuccess: (data) => setResult(data),
    onError: (err) => alert(getErrorMessage(err))
  });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const jsonLd = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Readability Checker', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', url: typeof window !== 'undefined' ? window.location.href : '' };

  return (
    <div className="min-h-screen">
      <SEO title="Readability Checker | Content Tools | Tiktalkhub" description="Analyze readability, sentiment, and keywords with instant insights and suggestions." keywords={["readability checker","flesch","text analysis"]} canonical="/tools/content/readability-checker" jsonLd={jsonLd} />
      <Header />
      <div className="container mx-auto px-6"><Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'Content Tools', href: '/tools/text-tools' }, { name: 'Readability Checker' }]} jsonLdBaseUrl={baseUrl} /></div>
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="tiktok-card">
              <CardHeader>
                <CardTitle>Readability Checker</CardTitle>
                <CardDescription>Instant readability, sentiment, and keyword insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Text</Label>
                  <Textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste or type your text here..." />
                </div>
                <div className="flex gap-3">
                  <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || text.length < 20}>Analyze</Button>
                </div>
                {result && (
                  <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
                    <div className="border rounded p-3"><p className="font-medium">Readability</p><div className="text-muted-foreground">Score: {Math.round(result.readability.score)} • Level: {result.readability.level}</div></div>
                    <div className="border rounded p-3"><p className="font-medium">Sentiment</p><div className="text-muted-foreground">{result.sentiment.label} (score {result.sentiment.score})</div></div>
                    <div className="border rounded p-3"><p className="font-medium">Keywords</p><div className="text-muted-foreground line-clamp-3">{result.keywords.join(', ')}</div></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="tiktok-card">
              <CardHeader><CardTitle>Tips</CardTitle><CardDescription>Boost readability</CardDescription></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Shorten sentences and use simple words.</p>
                <p>• Prefer active voice and clear structure.</p>
                <p>• Break text with headings and bullet points.</p>
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

export default ReadabilityChecker;