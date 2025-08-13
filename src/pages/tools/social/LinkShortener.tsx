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

const LinkShortener: React.FC = () => {
  const [url, setUrl] = useState('https://example.com/very/long/path?with=params');
  const [customCode, setCustomCode] = useState('');
  const [expireDays, setExpireDays] = useState<number>(90);
  const [result, setResult] = useState<any>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.shortenLink({ url, customCode: customCode || undefined, expireDays });
      return res.data as any;
    },
    onSuccess: (data) => setResult(data),
    onError: (err) => alert(getErrorMessage(err))
  });

  return (
    <div className="min-h-screen">
      <SEO title="Link Shortener | Social Tools | Tiktalkhub" description="Shorten and track shareable links with optional custom codes and expirations." keywords={["link shortener","custom short link","UTM tracking"]} canonical="/tools/social/link-shortener" />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Link Shortener</CardTitle>
              <CardDescription>Create short, shareable links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Long URL</Label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Custom code (optional)</Label>
                  <Input value={customCode} onChange={(e) => setCustomCode(e.target.value)} placeholder="my-link" />
                </div>
                <div className="space-y-2">
                  <Label>Expire (days)</Label>
                  <Input type="number" min={1} max={365} value={expireDays} onChange={(e) => setExpireDays(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !url}>Shorten</Button>
                {result?.shortUrl && (
                  <a className="underline text-primary" href={result.shortUrl} target="_blank" rel="noreferrer">Open Short Link</a>
                )}
              </div>
              {result && (
                <div className="text-sm text-muted-foreground mt-2">
                  <p>Short URL: {result.shortUrl}</p>
                  <p>Expires: {new Date(result.expiresAt).toLocaleString()}</p>
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

export default LinkShortener;