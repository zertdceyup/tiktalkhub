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

const ImageRemixer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [effect, setEffect] = useState<'grayscale'|'sepia'|'blur'|'pixelate'|'invert'|'none'>('none');
  const [intensity, setIntensity] = useState<number>(5);
  const [hue, setHue] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(0);
  const [output, setOutput] = useState<string>('');

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please select an image');
      const res = await api.remixImage({ file, effect, intensity, hue, saturation });
      return res.data as any;
    },
    onSuccess: (data) => setOutput(data.remixed || ''),
    onError: (err) => alert(getErrorMessage(err))
  });

  return (
    <div className="min-h-screen">
      <SEO title="Image Remixer | General Tools | Tiktalkhub" description="Transform images with effects like sepia, blur, pixelate, and more." keywords={["image remixer","image effects","photo editor"]} canonical="/tools/general/image-remixer" />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Image Remixer</CardTitle>
              <CardDescription>Apply quick effects to your images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Image</Label>
                <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Effect</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={effect} onChange={(e) => setEffect(e.target.value as any)}>
                    <option value="none">None</option>
                    <option value="grayscale">Grayscale</option>
                    <option value="sepia">Sepia</option>
                    <option value="blur">Blur</option>
                    <option value="pixelate">Pixelate</option>
                    <option value="invert">Invert</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Intensity</Label>
                  <Input type="number" min={1} max={20} value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Hue</Label>
                  <Input type="number" min={-180} max={180} value={hue} onChange={(e) => setHue(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Saturation</Label>
                  <Input type="number" min={-100} max={100} value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !file}>Remix</Button>
                <Button variant="outline" onClick={() => setOutput('')}>Reset</Button>
              </div>
              {output && (
                <div className="mt-4">
                  <img className="max-w-full rounded" src={output} />
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

export default ImageRemixer;