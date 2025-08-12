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

const PDFToImage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'png'|'jpg'>('png');
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [images, setImages] = useState<{ page: number; url: string }[]>([]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please select a PDF file');
      const res = await api.pdfToImage({ file, format, width, height });
      return res.data as any;
    },
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

  return (
    <div className="min-h-screen">
      <SEO
        title="PDF to Image Converter | PDF Tools | Tiktalkhub"
        description="Convert PDFs to PNG or JPG images with custom dimensions and previews."
        keywords={["pdf to image","pdf to png","pdf to jpg"]}
        canonical="/tools/utility/pdf-to-image"
      />
      <Header />
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
                <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
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