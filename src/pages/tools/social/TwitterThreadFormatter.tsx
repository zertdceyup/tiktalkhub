import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import SEO from '@/components/SEO';
import { useMutation } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';

const TwitterThreadFormatter: React.FC = () => {
  const [content, setContent] = useState('');
  const [maxLen, setMaxLen] = useState<number>(280);
  const [thread, setThread] = useState<string[]>([]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.formatTwitterThread({ content, maxTweetLength: maxLen });
      return res.data as any;
    },
    onSuccess: (data) => setThread(data.thread || []),
    onError: (err) => alert(getErrorMessage(err))
  });

  const copyAll = async () => {
    await navigator.clipboard.writeText(thread.join('\n\n'));
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Twitter Thread Formatter | Social Tools | Tiktalkhub"
        description="Split long content into a clean Twitter/X thread under the character limit."
        keywords={["twitter thread formatter","x thread maker","split tweets"]}
        canonical="/tools/social/twitter-thread-formatter"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Twitter Thread Formatter</CardTitle>
              <CardDescription>Paste content and format into a thread</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste your content here" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">Max tweet length</label>
                  <Input type="number" min={100} max={280} value={maxLen} onChange={(e) => setMaxLen(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !content}>Format Thread</Button>
                <Button variant="outline" onClick={copyAll} disabled={!thread.length}>Copy All</Button>
              </div>
              {thread.length > 0 && (
                <div className="space-y-3 mt-4">
                  {thread.map((t, i) => (
                    <div key={i} className="border rounded p-3 text-sm whitespace-pre-wrap">{t}</div>
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

export default TwitterThreadFormatter;