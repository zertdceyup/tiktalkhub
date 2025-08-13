import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import SEO from '@/components/SEO';
import { useMutation } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';

interface CaptionItem { start: number; end: number; text: string }

const CaptionOverlay: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [captionsText, setCaptionsText] = useState<string>('0-2: Welcome to the video!\n2-5: This is a demo caption.');
  const [font, setFont] = useState<string>('Inter');
  const [size, setSize] = useState<number>(24);
  const [color, setColor] = useState<string>('#ffffff');
  const [background, setBackground] = useState<string>('rgba(0,0,0,0.5)');
  const [position, setPosition] = useState<'top'|'bottom'|'middle'>('bottom');
  const [outputUrl, setOutputUrl] = useState<string>('');
  const [srt, setSrt] = useState<string>('');
  const [useBrandKit, setUseBrandKit] = useState<boolean>(true);
  const [brand, setBrand] = useState<any>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/public/brand-kit`);
        const j = await res.json();
        const kit = j?.brand || null;
        setBrand(kit);
        if (kit && useBrandKit) {
          if (kit.font_family) setFont(kit.font_family);
          if (kit.colors?.text) setColor(kit.colors.text);
          if (kit.colors?.caption_bg) setBackground(kit.colors.caption_bg);
        }
      } catch {}
    })();
  }, [useBrandKit]);

  const parseCaptions = (): CaptionItem[] => {
    return captionsText.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
      // format: start-end: text
      const [time, ...rest] = line.split(':');
      const [startStr, endStr] = time.split('-');
      const text = rest.join(':').trim();
      const start = parseFloat(startStr);
      const end = parseFloat(endStr);
      return { start: isNaN(start) ? 0 : start, end: isNaN(end) ? 0 : end, text };
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please select a video file');
      const captions = parseCaptions();
      const res = await api.captionOverlay({ file, captions, font, size, color, background, position });
      return res.data as any;
    },
    onSuccess: (data) => { setOutputUrl(data.output?.url || ''); setSrt(data.output?.srt || ''); },
    onError: (err) => alert(getErrorMessage(err))
  });

  const downloadSrt = () => {
    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `captions_${Date.now()}.srt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Caption Overlay | Video Tools | Tiktalkhub"
        description="Add styled captions to your videos with font, size, color, background, and position controls."
        keywords={["caption overlay","subtitle burn-in","video captions"]}
        canonical="/tools/video/caption-overlay"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Caption Overlay</CardTitle>
              <CardDescription>Overlay styled captions onto your video</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Video file</Label>
                <Input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <div className="flex items-center gap-2">
                <input id="brand-toggle" type="checkbox" checked={useBrandKit} onChange={(e) => setUseBrandKit(e.target.checked)} />
                <Label htmlFor="brand-toggle">Use brand kit defaults</Label>
              </div>
              <div className="space-y-2">
                <Label>Captions (format: start-end: text per line)</Label>
                <Textarea rows={6} value={captionsText} onChange={(e) => setCaptionsText(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Font</Label>
                  <Input value={font} onChange={(e) => setFont(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Input type="number" min={10} max={96} value={size} onChange={(e) => setSize(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input type="text" value={color} onChange={(e) => setColor(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Background</Label>
                  <Input type="text" value={background} onChange={(e) => setBackground(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={position} onChange={(e) => setPosition(e.target.value as any)}>
                    <option value="top">Top</option>
                    <option value="middle">Middle</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !file}>Overlay</Button>
                <Button variant="outline" onClick={downloadSrt} disabled={!srt}>Download SRT</Button>
                <Button variant="outline" onClick={() => alert('Local preview coming soon') } disabled={!file}>Preview locally</Button>
              </div>
              {outputUrl && (
                <div className="space-y-2 mt-4">
                  <video controls className="w-full rounded" src={outputUrl}></video>
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

export default CaptionOverlay;