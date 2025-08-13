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

const YouTubeThumbnailDownloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [thumbs, setThumbs] = useState<any[]>([]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.youtubeThumbnail({ url: url || undefined, videoId: videoId || undefined });
      return res.data as any;
    },
    onSuccess: (data) => setThumbs(data.thumbnails || []),
    onError: (err) => alert(getErrorMessage(err))
  });

  return (
    <div className="min-h-screen">
      <SEO
        title="YouTube Thumbnail Downloader | General Tools | Tiktalkhub"
        description="Download HD thumbnails from YouTube videos in multiple resolutions."
        keywords={["youtube thumbnail downloader","download youtube thumbnail","maxresdefault"]}
        canonical="/tools/utility/youtube-thumbnail-downloader"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>YouTube Thumbnail Downloader</CardTitle>
              <CardDescription>Paste a YouTube URL or video ID</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                </div>
                <div className="space-y-2">
                  <Label>Video ID</Label>
                  <Input value={videoId} onChange={(e) => setVideoId(e.target.value)} placeholder="11-char ID (optional)" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || (!url && !videoId)}>Get Thumbnails</Button>
              </div>
              {thumbs.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {thumbs.map((t, idx) => (
                    <a key={t.url} href={t.url} target="_blank" rel="noreferrer" className="block border rounded overflow-hidden">
                      <img src={t.url} alt={t.label} className="w-full" loading="lazy" />
                      <div className="px-2 py-1 text-xs">{t.label} • {t.width}x{t.height}</div>
                    </a>
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

export default YouTubeThumbnailDownloader;