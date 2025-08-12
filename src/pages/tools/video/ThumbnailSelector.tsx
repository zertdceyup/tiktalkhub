import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';

const ThumbnailSelector: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState<number>(6);
  const [thumbs, setThumbs] = useState<any[]>([]);
  const [progress, setProgress] = useState<number>(0);

  const uploadWithProgress = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('No file'));
      const form = new FormData();
      form.append('video', file);
      form.append('count', String(count));
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/tools/video/thumbnail-selector`);
      const token = localStorage.getItem('auth_token');
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && res?.success) resolve(res.data);
            else reject(new Error(res?.message || 'Upload failed'));
          } catch (err) { reject(err); }
        }
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(form);
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const data = await uploadWithProgress();
      return data;
    },
    onSuccess: (data) => setThumbs(data.thumbnails || []),
    onError: (err: any) => alert(err?.message || 'Error')
  });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen">
      <SEO
        title="Thumbnail Selector | Video Tools | Tiktalkhub"
        description="Extract evenly spaced thumbnails from your video using FFmpeg."
        keywords={["thumbnail extractor","video thumbnails","ffmpeg"]}
        canonical="/tools/video/thumbnail-selector"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Thumbnail Selector',
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'Web',
          url: (typeof window !== 'undefined' ? window.location.href : ''),
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
        }}
      />
      <Header />
      <div className="container mx-auto px-6">
        <Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'Video Tools', href: '/tools/video' }, { name: 'Thumbnail Selector' }]} jsonLdBaseUrl={baseUrl} />
      </div>
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Thumbnail Selector</CardTitle>
              <CardDescription>Extract evenly spaced thumbnails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Video file</Label>
                <div
                  className="border rounded p-4 text-center hover:bg-secondary/30 cursor-pointer"
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
                >
                  <div>Drag & drop or click to select</div>
                  <Input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Count</Label>
                  <Input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} />
                </div>
              </div>
              {isPending && (
                <div className="w-full bg-secondary rounded h-2 overflow-hidden">
                  <div className="bg-primary h-2 transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !file}>Extract</Button>
              </div>
              {thumbs.length > 0 && (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {thumbs.map((t) => (
                    <div key={t.id} className="border rounded overflow-hidden">
                      <img src={t.url} alt={`Thumb ${t.id}`} className="w-full h-auto" loading="lazy" />
                      <div className="p-2 text-xs text-muted-foreground">t={Math.round(t.timestamp)}s</div>
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