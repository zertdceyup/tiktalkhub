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

const ImageOptimizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const [format, setFormat] = useState<string>('jpeg');
  const [width, setWidth] = useState<number | ''>('' as any);
  const [height, setHeight] = useState<number | ''>('' as any);
  const [result, setResult] = useState<any | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const uploadWithProgress = (): Promise<any> => new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file'));
    const form = new FormData();
    form.append('image', file);
    if (quality !== undefined) form.append('quality', String(quality));
    if (format) form.append('format', format);
    if (width) form.append('width', String(width));
    if (height) form.append('height', String(height));
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/tools/utility/image-optimizer`);
    const token = localStorage.getItem('auth_token'); if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onreadystatechange = () => { if (xhr.readyState === 4) { try { const res = JSON.parse(xhr.responseText); if (xhr.status >= 200 && xhr.status < 300 && res?.success) resolve(res.data); else reject(new Error(res?.message || 'Upload failed')); } catch (err) { reject(err); } } };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(form);
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => uploadWithProgress(),
    onSuccess: (data) => setResult(data),
    onError: (err: any) => alert(err?.message || 'Error')
  });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen">
      <SEO
        title="Image Optimizer | Utility Tools | Tiktalkhub"
        description="Compress and resize images with configurable quality and format."
        keywords={["image optimizer","compress image","resize image"]}
        canonical="/tools/utility/image-optimizer"
        jsonLd={{ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Image Optimizer', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', url: (typeof window !== 'undefined' ? window.location.href : ''), offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }}
      />
      <Header />
      <div className="container mx-auto px-6">
        <Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'General Tools', href: '/tools/general' }, { name: 'Image Optimizer' }]} jsonLdBaseUrl={baseUrl} />
      </div>
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Image Optimizer</CardTitle>
              <CardDescription>Compress, convert, and resize images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Image file</Label>
                <div className="border rounded p-4 text-center hover:bg-secondary/30 cursor-pointer" onDragOver={(e) => { e.preventDefault(); }} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}>
                  <div>Drag & drop or click to select</div>
                  <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Quality</Label>
                  <Input type="number" min={1} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={format} onChange={(e) => setFormat(e.target.value)}>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WEBP</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Width (px)</Label>
                  <Input type="number" min={1} value={width} onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : '' as any)} />
                </div>
                <div className="space-y-2">
                  <Label>Height (px)</Label>
                  <Input type="number" min={1} value={height} onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '' as any)} />
                </div>
              </div>
              {isPending && (
                <div className="w-full bg-secondary rounded h-2 overflow-hidden">
                  <div className="bg-primary h-2 transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending}>Optimize</Button>
                <Button variant="outline" onClick={() => { if (!result) return; const a = document.createElement('a'); a.href = result.optimizedImage; a.download = `optimized_${Date.now()}.${format}`; document.body.appendChild(a); a.click(); document.body.removeChild(a); }} disabled={!result}>Download</Button>
              </div>
              {result && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Original: {Math.round((result.originalSize||0)/1024)} KB</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Optimized: {Math.round((result.optimizedSize||0)/1024)} KB ({result.compressionRatio})</p>
                    <img src={result.optimizedImage} alt="Optimized" className="max-w-full rounded mt-2" />
                  </div>
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

export default ImageOptimizer;