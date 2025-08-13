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

const ShortsVerticalCropper: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [aspect, setAspect] = useState<'9:16'|'1:1'|'4:5'>('9:16');
  const [strategy, setStrategy] = useState<'center'|'smart-face'|'smart-motion'|'manual'>('center');
  const [gravity, setGravity] = useState<'center'|'top'|'bottom'|'left'|'right'>('center');
  const [background, setBackground] = useState<'blur'|'black'|'white'>('blur');
  const [resolution, setResolution] = useState<'720x1280'|'1080x1920'|'1440x2560'>('1080x1920');
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [safeTop, setSafeTop] = useState<number>(0);
  const [safeBottom, setSafeBottom] = useState<number>(0);
  const [safeLeft, setSafeLeft] = useState<number>(0);
  const [safeRight, setSafeRight] = useState<number>(0);

  const [outputUrl, setOutputUrl] = useState<string>('');
  const [meta, setMeta] = useState<any>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please select a video file');
      const res = await api.shortsVerticalCropper({
        file,
        aspect,
        strategy,
        gravity,
        background,
        resolution,
        startTime,
        endTime,
        safeZones: { top: safeTop, bottom: safeBottom, left: safeLeft, right: safeRight }
      });
      return res.data as any;
    },
    onSuccess: (data) => {
      setOutputUrl(data.output?.url || '');
      setMeta(data.output || null);
    },
    onError: (err) => alert(getErrorMessage(err))
  });

  return (
    <div className="min-h-screen">
      <SEO
        title="Shorts Vertical Cropper | Video Tools | Tiktalkhub"
        description="Convert landscape videos into vertical shorts with smart framing, safe zones, and background options."
        keywords={["shorts cropper","vertical crop","smart framing","9:16 video"]}
        canonical="/tools/video/shorts-vertical-cropper"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="tiktok-card">
                <CardHeader>
                  <CardTitle>Shorts Vertical Cropper</CardTitle>
                  <CardDescription>Auto-crop your video to vertical formats with smart options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Video file</Label>
                    <Input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Aspect</Label>
                      <select className="w-full h-10 rounded-md border bg-background px-3" value={aspect} onChange={(e) => setAspect(e.target.value as any)}>
                        <option value="9:16">9:16</option>
                        <option value="1:1">1:1</option>
                        <option value="4:5">4:5</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Strategy</Label>
                      <select className="w-full h-10 rounded-md border bg-background px-3" value={strategy} onChange={(e) => setStrategy(e.target.value as any)}>
                        <option value="center">Center</option>
                        <option value="smart-face">Smart: Face</option>
                        <option value="smart-motion">Smart: Motion</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Gravity</Label>
                      <select className="w-full h-10 rounded-md border bg-background px-3" value={gravity} onChange={(e) => setGravity(e.target.value as any)}>
                        <option value="center">Center</option>
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Background</Label>
                      <select className="w-full h-10 rounded-md border bg-background px-3" value={background} onChange={(e) => setBackground(e.target.value as any)}>
                        <option value="blur">Blur</option>
                        <option value="black">Black</option>
                        <option value="white">White</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Resolution</Label>
                      <select className="w-full h-10 rounded-md border bg-background px-3" value={resolution} onChange={(e) => setResolution(e.target.value as any)}>
                        <option value="720x1280">720x1280</option>
                        <option value="1080x1920">1080x1920</option>
                        <option value="1440x2560">1440x2560</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Time range (s)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="number" min={0} placeholder="Start" value={startTime} onChange={(e) => setStartTime(Number(e.target.value))} />
                        <Input type="number" min={0} placeholder="End" value={endTime} onChange={(e) => setEndTime(Number(e.target.value))} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Safe Top (px)</Label>
                      <Input type="number" value={safeTop} onChange={(e) => setSafeTop(Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Safe Bottom (px)</Label>
                      <Input type="number" value={safeBottom} onChange={(e) => setSafeBottom(Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Safe Left (px)</Label>
                      <Input type="number" value={safeLeft} onChange={(e) => setSafeLeft(Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Safe Right (px)</Label>
                      <Input type="number" value={safeRight} onChange={(e) => setSafeRight(Number(e.target.value))} />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !file}>Crop to Vertical</Button>
                    <Button variant="outline" onClick={() => { setOutputUrl(''); setMeta(null); }}>Reset</Button>
                  </div>

                  {outputUrl && (
                    <div className="space-y-4 mt-4">
                      <video controls className="w-full rounded" src={outputUrl}></video>
                      {meta && (
                        <pre className="text-xs bg-secondary/40 p-3 rounded overflow-auto max-h-60">{JSON.stringify(meta, null, 2)}</pre>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="tiktok-card">
                <CardHeader>
                  <CardTitle>Guides & Tips</CardTitle>
                  <CardDescription>Learn how to frame perfect shorts</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Keep key subjects within center-safe area</li>
                    <li>Use blurred background to preserve context</li>
                    <li>Prefer 1080x1920 for best platform support</li>
                    <li>Smart Face strategy prioritizes faces</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <TikoAI />
    </div>
  );
};

export default ShortsVerticalCropper;