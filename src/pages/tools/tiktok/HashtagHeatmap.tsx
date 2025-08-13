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

const HashtagHeatmap: React.FC = () => {
  const [hashtags, setHashtags] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'24h'|'7d'|'30d'>('7d');
  const [data, setData] = useState<any[] | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const tags = hashtags.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.tiktokHashtagHeatmap({ hashtags: tags, timeframe });
      return res.data as any;
    },
    onSuccess: (d) => setData(d.heatmapData || []),
    onError: (err) => alert(getErrorMessage(err))
  });

  return (
    <div className="min-h-screen">
      <SEO
        title="TikTok Hashtag Heatmap | TikTok Tools | Tiktalkhub"
        description="Analyze hashtag popularity, trend, reach, and best posting times on TikTok."
        keywords={["tiktok hashtag heatmap","tiktok trends","best posting time"]}
        canonical="/tools/tiktok/hashtag-heatmap"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>TikTok Hashtag Heatmap</CardTitle>
              <CardDescription>Enter hashtags (comma-separated)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Hashtags</Label>
                <Input value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder="#fashion, #ootd, #style" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Timeframe</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={timeframe} onChange={(e) => setTimeframe(e.target.value as any)}>
                    <option value="24h">24h</option>
                    <option value="7d">7 days</option>
                    <option value="30d">30 days</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !hashtags}>Analyze</Button>
              </div>
              {data && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2">Hashtag</th>
                        <th className="py-2">Popularity</th>
                        <th className="py-2">Trend</th>
                        <th className="py-2">Estimated Reach</th>
                        <th className="py-2">Competition</th>
                        <th className="py-2">Best Times</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2">{row.hashtag}</td>
                          <td className="py-2">{row.popularity}</td>
                          <td className="py-2 capitalize">{row.trend}</td>
                          <td className="py-2">{row.estimatedReach}</td>
                          <td className="py-2 capitalize">{row.competitionLevel}</td>
                          <td className="py-2">{row.bestPostingTimes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

export default HashtagHeatmap;