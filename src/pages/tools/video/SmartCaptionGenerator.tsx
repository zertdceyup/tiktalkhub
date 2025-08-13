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

const SmartCaptionGenerator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<'en'|'es'|'fr'|'de'|'it'>('en');
  const [maxLineLength, setMaxLineLength] = useState<number>(42);
  const [includePunctuation, setIncludePunctuation] = useState<boolean>(true);
  const [captions, setCaptions] = useState<{ start: number; end: number; text: string }[]>([]);
  const [srt, setSrt] = useState<string>('');

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please select a video file');
      const res = await api.generateSmartCaptions({ file, language, maxLineLength, includePunctuation });
      return res.data as any;
    },
    onSuccess: (data) => { setCaptions(data.captions || []); setSrt(data.srt || ''); },
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
        title="Smart Caption Generator | Video Tools | Tiktalkhub"
        description="Auto-generate captions from your video with language selection and formatting controls."
        keywords={["smart captions","auto captions","SRT generator"]}
        canonical="/tools/video/smart-caption-generator"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Smart Caption Generator</CardTitle>
              <CardDescription>Transcribe and format captions automatically</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Video file</Label>
                <Input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={language} onChange={(e) => setLanguage(e.target.value as any)}>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Max line length</Label>
                  <Input type="number" min={20} max={80} value={maxLineLength} onChange={(e) => setMaxLineLength(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Punctuation</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={includePunctuation ? 'true' : 'false'} onChange={(e) => setIncludePunctuation(e.target.value === 'true')}>
                    <option value="true">Include</option>
                    <option value="false">Remove</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !file}>Generate</Button>
                <Button variant="outline" onClick={downloadSrt} disabled={!srt}>Download SRT</Button>
              </div>
              {captions.length > 0 && (
                <div className="space-y-2 mt-4 text-sm">
                  {captions.map((c, i) => (
                    <div key={i} className="flex gap-2"><div className="text-muted-foreground">[{c.start.toFixed(1)} - {c.end.toFixed(1)}]</div><div>{c.text}</div></div>
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

export default SmartCaptionGenerator;