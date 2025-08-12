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
import Breadcrumbs from '@/components/Breadcrumbs';
import api, { getErrorMessage } from '@/lib/api';

const PDFToImage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'png'|'jpg'>('png');
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [images, setImages] = useState<{ page: number; url: string }[]>([]);
  const [progress, setProgress] = useState<number>(0);

  const uploadWithProgress = (): Promise<any> => new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Please select a PDF file'));
    const form = new FormData();
    form.append('pdf', file);
    form.append('format', format);
    form.append('width', String(width));
    form.append('height', String(height));
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/tools/utility/pdf-to-image`);
    const token = localStorage.getItem('auth_token'); if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onreadystatechange = () => { if (xhr.readyState === 4) { try { const res = JSON.parse(xhr.responseText); if (xhr.status >= 200 && xhr.status < 300 && res?.success) resolve(res.data); else reject(new Error(res?.message || 'Upload failed')); } catch (err) { reject(err); } } };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(form);
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => uploadWithProgress(),
    onSuccess: (data) => setImages(data.images || []),
    onError: (err) => alert(getErrorMessage(err))
  });

  const download = (url: string, page: number) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `page_${page}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen">
      <SEO
        title="PDF to Image Converter | PDF Tools | Tiktalkhub"
        description="Convert PDFs to PNG or JPG images with custom dimensions and previews."
        keywords={["pdf to image","pdf to png","pdf to jpg"]}
        canonical="/tools/utility/pdf-to-image"
        jsonLd={{ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'PDF to Image Converter', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', url: (typeof window !== 'undefined' ? window.location.href : ''), offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }}
      />
      <Header />
      <div className="container mx-auto px-6">
        <Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'PDF Tools', href: '/tools/pdf' }, { name: 'PDF to Image' }]} jsonLdBaseUrl={baseUrl} />
      </div>
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>PDF to Image Converter</CardTitle>
              <CardDescription>Convert pages to images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>PDF file</Label>
                <div className="border rounded p-4 text-center hover:bg-secondary/30 cursor-pointer" onDragOver={(e) => { e.preventDefault(); }} onDrop={(e) => { e.preventDefault(); const item = Array.from(e.dataTransfer.files || []).find(f => f.type === 'application/pdf'); if (item) setFile(item); }}>
                  <div>Drag & drop or click to select</div>
                  <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Format</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={format} onChange={(e) => setFormat(e.target.value as any)}>
                    <option value="png">PNG</option>
                    <option value="jpg">JPG</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Width (px)</Label>
                  <Input type="number" min={100} value={width} onChange={(e) => setWidth(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Height (px)</Label>
                  <Input type="number" min={100} value={height} onChange={(e) => setHeight(Number(e.target.value))} />
                </div>
              </div>
              {isPending && (
                <div className="w-full bg-secondary rounded h-2 overflow-hidden">
                  <div className="bg-primary h-2 transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !file}>Convert</Button>
              </div>
              {images.length > 0 && (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {images.map((img) => (
                    <div key={img.page} className="border rounded overflow-hidden">
                      <img key={img.page} src={img.url} alt={`Page ${img.page}`} className="w-full rounded" loading="lazy" />
                      <div className="p-2 text-xs text-muted-foreground flex justify-between">
                        <span>Page {img.page}</span>
                        <button className="text-primary" onClick={() => download(img.url, img.page)}>Download</button>
                      </div>
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

export default PDFToImage;