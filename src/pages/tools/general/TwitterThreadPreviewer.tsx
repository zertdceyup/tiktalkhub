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

const TwitterThreadPreviewer: React.FC = () => {
  const [content, setContent] = useState('Write your long tweet content here...');
  const [max, setMax] = useState<number>(280);
  const [thread, setThread] = useState<string[]>([]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.formatTwitterThread({ content, maxTweetLength: max });
      return res.data as any;
    },
    onSuccess: (data) => setThread(data.thread || []),
    onError: (err) => alert(getErrorMessage(err))
  });

  return (
    <div className="min-h-screen">
      <SEO title="Twitter Thread Previewer | General Tools | Tiktalkhub" description="Preview and split your long tweet into a clean thread with counts." keywords={["twitter thread","tweet preview","x previewer"]} canonical="/tools/general/twitter-thread-previewer" />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Twitter Thread Previewer</CardTitle>
              <CardDescription>Split and preview your thread before posting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} />
              </div>
              <div className="space-y-2 max-w-xs">
                <Label>Max characters per tweet</Label>
                <input className="w-full h-10 rounded-md border bg-background px-3" type="number" min={100} max={280} value={max} onChange={(e) => setMax(Number(e.target.value))} />
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || content.length < 1}>Preview</Button>
              </div>
              {thread.length > 0 && (
                <div className="mt-4 space-y-3">
                  {thread.map((t, i) => (
                    <div key={i} className="border rounded p-3 text-sm">
                      <div className="text-xs text-muted-foreground mb-1">{i+1}/{thread.length} • {t.length}/280</div>
                      <div>{t}</div>
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

export default TwitterThreadPreviewer;