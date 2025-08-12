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

const NoiseRemover: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'mild'|'moderate'|'aggressive'>('moderate');
  const [humHz, setHumHz] = useState<number>(0);
  const [dereverb, setDereverb] = useState<boolean>(false);
  const [outputUrl, setOutputUrl] = useState<string>('');
  const [stats, setStats] = useState<any>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please select a video file');
      const res = await api.removeNoise({ file, mode, humHz: humHz || undefined, dereverb });
      return res.data as any;
    },
    onSuccess: (data) => { setOutputUrl(data.output?.url || ''); setStats(data.output?.stats || null); },
    onError: (err) => alert(getErrorMessage(err))
  });

  return (
    <div className="min-h-screen">
      <SEO
        title="Noise Remover | Video Tools | Tiktalkhub"
        description="Clean your video audio with AI-style noise reduction, hum removal, and dereverb."
        keywords={["noise remover","audio denoise","hum removal","dereverb"]}
        canonical="/tools/video/noise-remover"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Noise Remover</CardTitle>
              <CardDescription>Reduce background noise, hum, and echo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Video file</Label>
                <Input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Mode</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={mode} onChange={(e) => setMode(e.target.value as any)}>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Hum Frequency (Hz)</Label>
                  <Input type="number" min={0} max={20000} value={humHz} onChange={(e) => setHumHz(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Dereverb</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={dereverb ? 'true' : 'false'} onChange={(e) => setDereverb(e.target.value === 'true')}>
                    <option value="false">Off</option>
                    <option value="true">On</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !file}>Clean Audio</Button>
                <Button variant="outline" onClick={() => { setOutputUrl(''); setStats(null); }}>Reset</Button>
              </div>
              {outputUrl && (
                <div className="space-y-3 mt-4">
                  <video controls className="w-full rounded" src={outputUrl}></video>
                  {stats && (
                    <div className="text-sm text-muted-foreground">
                      <p>Baseline noise: {stats.baselineNoiseDb} dBFS</p>
                      <p>Reduction: {stats.reductionDb} dB</p>
                      <p>Post noise: {stats.postNoiseDb} dBFS</p>
                      <p>Hum removed: {stats.humRemoved ? 'Yes' : 'No'}</p>
                      <p>Dereverb applied: {stats.dereverbApplied ? 'Yes' : 'No'}</p>
                    </div>
                  )}
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

export default NoiseRemover;