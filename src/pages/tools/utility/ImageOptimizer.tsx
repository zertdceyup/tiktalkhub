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

const ImageOptimizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const [format, setFormat] = useState<string>('jpeg');
  const [width, setWidth] = useState<number | ''>('' as any);
  const [height, setHeight] = useState<number | ''>('' as any);
  const [result, setResult] = useState<any | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please select an image file');
      const res = await api.optimizeImage({ file, quality, format, resize: { width: width ? Number(width) : undefined, height: height ? Number(height) : undefined } });
      return res.data as any;
    },
    onSuccess: (data) => setResult(data),
    onError: (err) => alert(getErrorMessage(err))
  });

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.optimizedImage;
    a.download = `optimized_${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Image Optimizer | Utility Tools | Tiktalkhub"
        description="Compress and resize images with configurable quality and format."
        keywords={["image optimizer","compress image","resize image"]}
        canonical="/tools/utility/image-optimizer"
      />
      <Header />
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
                <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
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
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending}>Optimize</Button>
                <Button variant="outline" onClick={download} disabled={!result}>Download</Button>
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