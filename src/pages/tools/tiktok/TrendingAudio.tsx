import React, { useMemo, useState } from 'react';
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

const TrendingAudio: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'24h'|'7d'|'30d'>('7d');
  const [limit, setLimit] = useState<number>(15);
  const [results, setResults] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'usage'|'growth'|'date'>('usage');

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.tiktokTrendingAudio({ query, timeframe, limit });
      return res.data as any;
    },
    onSuccess: (data) => setResults(data.results || []),
    onError: (err) => alert(getErrorMessage(err))
  });

  const sorted = useMemo(() => {
    const list = [...results];
    if (sortBy === 'usage') list.sort((a,b) => b.usageCount - a.usageCount);
    if (sortBy === 'growth') list.sort((a,b) => parseFloat(b.weeklyGrowth) - parseFloat(a.weeklyGrowth));
    if (sortBy === 'date') list.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [results, sortBy]);

  return (
    <div className="min-h-screen">
      <SEO
        title="Trending Audio Detector | TikTok Tools | Tiktalkhub"
        description="Discover trending audio and music for TikTok with usage and growth metrics."
        keywords={["tiktok trending audio","viral sounds","audio trends"]}
        canonical="/tools/tiktok/trending-audio"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Trending Audio Detector</CardTitle>
              <CardDescription>Find trending TikTok sounds quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Query (optional)</Label>
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="keyword or mood" />
                </div>
                <div className="space-y-2">
                  <Label>Timeframe</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={timeframe} onChange={(e) => setTimeframe(e.target.value as any)}>
                    <option value="24h">24 hours</option>
                    <option value="7d">7 days</option>
                    <option value="30d">30 days</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Limit</Label>
                  <Input type="number" min={1} max={50} value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending}>Find Trending Audio</Button>
                <div className="ml-auto flex items-center gap-2">
                  <Label>Sort by</Label>
                  <select className="h-10 rounded-md border bg-background px-3" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                    <option value="usage">Usage</option>
                    <option value="growth">Growth</option>
                    <option value="date">New</option>
                  </select>
                </div>
              </div>
              {sorted.length > 0 && (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {sorted.map((a) => (
                    <div key={a.id} className="border rounded p-3 text-sm space-y-2">
                      <div className="font-medium">{a.title}</div>
                      <audio controls src={a.previewUrl} className="w-full" />
                      <div className="flex justify-between text-muted-foreground text-xs">
                        <span>Usage: {a.usageCount}</span>
                        <span>Weekly: {a.weeklyGrowth}%</span>
                        <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                      </div>
                      {a.categories?.length > 0 && (
                        <div className="text-xs">Tags: {a.categories.join(', ')}</div>
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

export default TrendingAudio;