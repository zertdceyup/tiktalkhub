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

const SocialHookAnalyzer: React.FC = () => {
  const [hook, setHook] = useState('');
  const [analysis, setAnalysis] = useState<any | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => (await api.analyzeSocialHook({ hook })).data as any,
    onSuccess: (data) => setAnalysis(data),
    onError: (err) => alert(getErrorMessage(err))
  });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const jsonLd = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Social Hook Analyzer', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', url: typeof window !== 'undefined' ? window.location.href : '' };

  return (
    <div className="min-h-screen">
      <SEO title="Social Hook Analyzer | Content Tools | Tiktalkhub" description="Analyze and score your social media hooks. Get sentiment, readability, and patterns that improve CTR." keywords={["hook analyzer","social hook","headline analyzer"]} canonical="/tools/content/social-hook-analyzer" jsonLd={jsonLd} />
      <Header />
      <div className="container mx-auto px-6"><Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'Content Tools', href: '/tools/text-tools' }, { name: 'Social Hook Analyzer' }]} jsonLdBaseUrl={baseUrl} /></div>
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Social Hook Analyzer</CardTitle>
              <CardDescription>Improve your hooks for higher engagement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Hook</Label>
                <Input value={hook} onChange={(e) => setHook(e.target.value)} placeholder="e.g., What if I told you you’re wasting 2 hours daily?" />
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || hook.length < 5}>Analyze</Button>
              </div>
              {analysis && (
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="border rounded p-3">
                    <p className="font-medium">Score</p>
                    <div className="text-muted-foreground">{analysis.score}/100 • Styles: {analysis.styles.join(', ') || '—'}</div>
                  </div>
                  <div className="border rounded p-3">
                    <p className="font-medium">Readability</p>
                    <div className="text-muted-foreground">{analysis.readability.level} • {Math.round(analysis.readability.score)}</div>
                  </div>
                  <div className="border rounded p-3">
                    <p className="font-medium">Sentiment</p>
                    <div className="text-muted-foreground">{analysis.sentiment.label} ({analysis.sentiment.score})</div>
                  </div>
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

export default SocialHookAnalyzer;