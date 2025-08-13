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
import Breadcrumbs from '@/components/Breadcrumbs';
import { convertToGifClient } from '@/lib/ffmpegWasm';

const GifMaker: React.FC = () => { const [progress, setProgress] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(3);
  const [fps, setFps] = useState<number>(15);
  const [quality, setQuality] = useState<'low'|'medium'|'high'>('medium');
  const [gif, setGif] = useState<any | null>(null);
  const [clientUrl, setClientUrl] = useState<string>('');

  const uploadWithProgress = (): Promise<any> => new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file'));
    const form = new FormData();
    form.append('video', file);
    if (startTime !== undefined) form.append('startTime', String(startTime));
    if (duration !== undefined) form.append('duration', String(duration));
    form.append('fps', String(fps));
    form.append('quality', quality);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/tools/video/gif-maker`);
    const token = localStorage.getItem('auth_token'); if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onreadystatechange = () => { if (xhr.readyState === 4) { try { const res = JSON.parse(xhr.responseText); if (xhr.status >= 200 && xhr.status < 300 && res?.success) resolve(res.data); else reject(new Error(res?.message || 'Upload failed')); } catch (err) { reject(err); } } };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(form);
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => uploadWithProgress(),
    onSuccess: (data) => setGif(data.gif),
    onError: (err) => alert(getErrorMessage(err))
  });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen">
      <SEO
        title="GIF Maker | Video Tools | Tiktalkhub"
        description="Convert videos to high-quality GIFs with control over duration, FPS, and quality."
        keywords={["gif maker","video to gif","create gif"]}
        canonical="/tools/video/gif-maker"
        jsonLd={{ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'GIF Maker', applicationCategory: 'MultimediaApplication', operatingSystem: 'Web', url: (typeof window !== 'undefined' ? window.location.href : ''), offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }}
      />
      <Header />
      <div className="container mx-auto px-6">
        <Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'Video Tools', href: '/tools/video' }, { name: 'GIF Maker' }]} jsonLdBaseUrl={baseUrl} />
      </div>
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
                <div className="border rounded p-4 text-center hover:bg-secondary/30 cursor-pointer" onDragOver={(e) => { e.preventDefault(); }} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}>
                  <div>Drag & drop or click to select</div>
                  <Input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
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
                <Button variant="outline" onClick={async () => { if (!file) return; setClientUrl(''); try { const url = await convertToGifClient(file, { start: startTime, duration, fps, quality }); setClientUrl(url); } catch (e: any) { alert(e?.message || 'Client fallback failed'); } }} disabled={!file}>Client-side (WASM) Fallback</Button>
              </div>
              {isPending && (
                <div className="w-full bg-secondary rounded h-2 overflow-hidden">
                  <div className="bg-primary h-2 transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
              {gif && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Frames: {gif.output?.frames}, Size: {Math.round((gif.output?.size||0)/1024)} KB</p>
                  <img src={gif.url} alt="Generated GIF" className="max-w-full rounded" loading="lazy" />
                </div>
              )}
              {clientUrl && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Client-side preview</p>
                  <img src={clientUrl} alt="Client GIF" className="max-w-full rounded" loading="lazy" />
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