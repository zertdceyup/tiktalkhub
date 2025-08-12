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

const QRCodeGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState<number>(300);
  const [format, setFormat] = useState<'png'|'svg'>('png');
  const [level, setLevel] = useState<'L'|'M'|'Q'|'H'>('M');
  const [color, setColor] = useState<string>('#000000');
  const [bg, setBg] = useState<string>('#FFFFFF');
  const [qr, setQr] = useState<any | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.generateQRCode({ text, size, format, errorCorrectionLevel: level, color, backgroundColor: bg });
      return res.data as any;
    },
    onSuccess: (data) => setQr(data),
    onError: (err) => alert(getErrorMessage(err))
  });

  const download = () => {
    if (!qr) return;
    const a = document.createElement('a');
    a.href = qr.qrCode;
    a.download = `qrcode_${Date.now()}.${format === 'svg' ? 'svg' : 'png'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="QR Code Generator | Utility Tools | Tiktalkhub"
        description="Create custom QR codes with colors, size, and error correction. Download PNG or SVG."
        keywords={["qr code generator","create qr","svg qr","png qr"]}
        canonical="/tools/utility/qr-code-generator"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>QR Code Generator</CardTitle>
              <CardDescription>Create custom QR codes and download</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Content</Label>
                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="https://example.com" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Size (px)</Label>
                  <Input type="number" min={100} max={1000} value={size} onChange={(e) => setSize(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={format} onChange={(e) => setFormat(e.target.value as any)}>
                    <option value="png">PNG</option>
                    <option value="svg">SVG</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Error Correction</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={level} onChange={(e) => setLevel(e.target.value as any)}>
                    <option value="L">L</option>
                    <option value="M">M</option>
                    <option value="Q">Q</option>
                    <option value="H">H</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Foreground</Label>
                  <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Background</Label>
                  <Input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !text}>Generate</Button>
                <Button variant="outline" onClick={download} disabled={!qr}>Download</Button>
              </div>
              {qr && (
                <div className="mt-4">
                  {format === 'svg' ? (
                    <div dangerouslySetInnerHTML={{ __html: qr.qrCode }} />
                  ) : (
                    <img src={qr.qrCode} alt="QR" className="max-w-xs" />
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

export default QRCodeGenerator;