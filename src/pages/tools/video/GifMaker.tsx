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

const GifMaker: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(3);
  const [fps, setFps] = useState<number>(15);
  const [quality, setQuality] = useState<'low'|'medium'|'high'>('medium');
  const [gif, setGif] = useState<any | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please select a video file');
      const res = await api.createGif({ file, startTime, duration, fps, quality });
      return res.data as any;
    },
    onSuccess: (data) => setGif(data.gif),
    onError: (err) => alert(getErrorMessage(err))
  });

  return (
    <div className="min-h-screen">
      <SEO
        title="GIF Maker | Video Tools | Tiktalkhub"
        description="Convert videos to high-quality GIFs with control over duration, FPS, and quality."
        keywords={["gif maker","video to gif","create gif"]}
        canonical="/tools/video/gif-maker"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>GIF Maker</CardTitle>
              <CardDescription>Select a clip range and convert to GIF</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Video file</Label>
                <Input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Start (s)</Label>
                  <Input type="number" min={0} value={startTime} onChange={(e) => setStartTime(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Duration (s)</Label>
                  <Input type="number" min={0.1} step="0.1" max={10} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>FPS</Label>
                  <Input type="number" min={5} max={30} value={fps} onChange={(e) => setFps(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Quality</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={quality} onChange={(e) => setQuality(e.target.value as any)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending}>Create GIF</Button>
              </div>
              {gif && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Frames: {gif.output?.frames}, Size: {Math.round((gif.output?.size||0)/1024)} KB</p>
                  <img src={gif.url} alt="Generated GIF" className="max-w-full rounded" loading="lazy" />
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

export default GifMaker;