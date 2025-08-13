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
import { convertTrimClient } from '@/lib/ffmpegWasm';

const VideoTrimmer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [result, setResult] = useState<any | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please select a video file');
      const res = await api.trimVideo({ file, startTime, endTime });
      return res.data as any;
    },
    onSuccess: (data) => setResult(data),
    onError: (err) => alert(getErrorMessage(err))
  });

  return (
    <div className="min-h-screen">
      <SEO
        title="Video Trimmer | Video Tools | Tiktalkhub"
        description="Trim videos precisely with FFmpeg-powered processing and instant download."
        keywords={["video trimmer","cut video","ffmpeg"]}
        canonical="/tools/video/trimmer"
        jsonLd={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'SoftwareApplication',
              name: 'Video Trimmer',
              applicationCategory: 'MultimediaApplication',
              operatingSystem: 'Web',
              url: (typeof window !== 'undefined' ? window.location.href : ''),
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                { '@type': 'Question', name: 'Is trimming done locally or on server?', acceptedAnswer: { '@type': 'Answer', text: 'Instant preview can run locally in your browser for quick validation. Final processing uses FFmpeg on our server for highest quality.' } },
                { '@type': 'Question', name: 'Are my files stored?', acceptedAnswer: { '@type': 'Answer', text: 'Files are processed on the fly and stored locally only to deliver your download. You can delete files anytime.' } }
              ]
            }
          ]
        }}
      />
      <Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'Video Tools', href: '/tools/video' }, { name: 'Video Trimmer' }]} jsonLdBaseUrl={typeof window !== 'undefined' ? window.location.origin : ''} />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Video Trimmer</CardTitle>
              <CardDescription>Upload a video and specify the clip range</CardDescription>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time (s)</Label>
                  <Input type="number" min={0} value={startTime} onChange={(e) => setStartTime(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>End Time (s)</Label>
                  <Input type="number" min={0} value={endTime} onChange={(e) => setEndTime(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending}>Trim Video</Button>
                <Button variant="outline" onClick={async () => { if (!file) return; const url = await convertTrimClient(file, { start: startTime, end: endTime }); setResult({ trimmedVideo: { url } }); }}>Preview locally</Button>
              </div>
              {result && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Trimmed duration: {result.trimmedVideo?.duration}s</p>
                  <video controls className="w-full rounded" src={result.trimmedVideo?.url}></video>
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

export default VideoTrimmer;