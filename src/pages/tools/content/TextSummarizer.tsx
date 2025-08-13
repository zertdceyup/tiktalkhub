import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import SEO from '@/components/SEO';
import { useMutation } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';

const TextSummarizer: React.FC = () => {
  const [text, setText] = useState('Paste your text here to get a concise summary.');
  const [length, setLength] = useState<'short'|'medium'|'long'>('medium');
  const [summary, setSummary] = useState('');
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.summarizeText({ text, length });
      return res.data as any;
    },
    onSuccess: (data) => setSummary(data.summary || ''),
    onError: (err) => alert(getErrorMessage(err))
  });

  return (
    <div className="min-h-screen">
      <SEO title="Text Summarizer | Content Tools | Tiktalkhub" description="Condense long texts into clear summaries with key points and keywords." keywords={["text summarizer","auto summarize","key points"]} canonical="/tools/content/text-summarizer" />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Text Summarizer</CardTitle>
              <CardDescription>Summarize and extract key insights from long content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Text</Label>
                <Textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Length</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 max-w-xs" value={length} onChange={(e) => setLength(e.target.value as any)}>
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || text.length < 50}>Summarize</Button>
              </div>
              {summary && (
                <div className="mt-4 whitespace-pre-wrap text-sm">{summary}</div>
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

export default TextSummarizer;