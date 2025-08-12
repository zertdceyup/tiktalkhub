import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import SEO from '@/components/SEO';

const ThumbnailSelector: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState<number>(6);
  const [thumbs, setThumbs] = useState<any[]>([]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please select a video file');
      const res = await api.extractThumbnail({ file, count });
      return res.data as any;
    },
    onSuccess: (data) => setThumbs(data.thumbnails || []),
    onError: (err) => alert(getErrorMessage(err))
  });

  return (
    <div className="min-h-screen">
      <SEO
        title="Thumbnail Selector | Video Tools | Tiktalkhub"
        description="Extract multiple high-quality thumbnails from your video automatically."
        keywords={["video thumbnail extractor","thumbnail picker"]}
        canonical="/tools/video/thumbnail-selector"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Thumbnail Selector</CardTitle>
              <CardDescription>Upload a video and extract candidate thumbnails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Video file</Label>
                <Input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Count</Label>
                  <Input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending}>Extract</Button>
              </div>
              {thumbs.length > 0 && (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {thumbs.map((t, idx) => (
                    <div key={idx} className="rounded border overflow-hidden">
                      <img src={t.url} alt={`thumb-${idx}`} className="w-full h-auto" />
                      <div className="p-2 text-xs text-muted-foreground">{Math.round(t.timestamp)}s</div>
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

export default ThumbnailSelector;