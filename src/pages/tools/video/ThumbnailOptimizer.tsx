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

const ThumbnailOptimizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState<number>(6);
  const [title, setTitle] = useState<string>('This One Trick Changed Everything');
  const [style, setStyle] = useState<'clean'|'bold'|'minimal'|'vibrant'>('bold');
  const [colorScheme, setColorScheme] = useState<string>('red');
  const [addBorder, setAddBorder] = useState<boolean>(true);
  const [badgeText, setBadgeText] = useState<string>('NEW');
  const [candidates, setCandidates] = useState<any[]>([]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please select a video file');
      const res = await api.optimizeThumbnails({ file, count, title, style, colorScheme, addBorder, badgeText });
      return res.data as any;
    },
    onSuccess: (data) => setCandidates(data.candidates || []),
    onError: (err) => alert(getErrorMessage(err))
  });

  return (
    <div className="min-h-screen">
      <SEO
        title="Thumbnail Optimizer | Video Tools | Tiktalkhub"
        description="Create click-worthy thumbnails with CTR scoring, styles, colors, borders, and badges."
        keywords={["thumbnail optimizer","CTR thumbnails","YouTube thumbnail"]}
        canonical="/tools/video/thumbnail-optimizer"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-6xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Thumbnail Optimizer</CardTitle>
              <CardDescription>Create multiple styled options and pick the best</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Video file</Label>
                <Input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Title overlay</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Count</Label>
                  <Input type="number" min={1} max={12} value={count} onChange={(e) => setCount(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Style</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={style} onChange={(e) => setStyle(e.target.value as any)}>
                    <option value="clean">Clean</option>
                    <option value="bold">Bold</option>
                    <option value="minimal">Minimal</option>
                    <option value="vibrant">Vibrant</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={colorScheme} onChange={(e) => setColorScheme(e.target.value)}>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Border</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={addBorder ? 'true' : 'false'} onChange={(e) => setAddBorder(e.target.value === 'true')}>
                    <option value="true">On</option>
                    <option value="false">Off</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Badge</Label>
                  <Input value={badgeText} onChange={(e) => setBadgeText(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !file}>Generate</Button>
                <Button variant="outline" onClick={() => setCandidates([])}>Reset</Button>
              </div>

              {candidates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {candidates.map((c) => (
                    <div key={c.id} className="border rounded overflow-hidden">
                      <img src={c.url} alt={`Candidate ${c.id}`} className="w-full" loading="lazy" />
                      <div className="p-3 text-sm">
                        <div className="font-medium">Score: {c.score}</div>
                        <div className="text-muted-foreground text-xs">t={c.timestamp}s • {c.size.width}x{c.size.height}</div>
                        <div className="text-xs mt-1">Text pos: {c.recommended.textPosition}, Safe: top {c.recommended.safeZone.top*100}%</div>
                        <Button className="mt-2 w-full" variant="outline">Download</Button>
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

export default ThumbnailOptimizer;