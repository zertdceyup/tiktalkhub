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

const BatchTrimmer: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [outputFormat, setOutputFormat] = useState<'mp4'|'webm'|'mov'>('mp4');
  const [items, setItems] = useState<any[]>([]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!files.length) throw new Error('Please select one or more video files');
      const res = await api.batchTrimVideos({ files, startTime, endTime, outputFormat });
      return res.data as any;
    },
    onSuccess: (data) => setItems(data.items || []),
    onError: (err) => alert(getErrorMessage(err))
  });

  return (
    <div className="min-h-screen">
      <SEO
        title="Batch Trimmer | Video Tools | Tiktalkhub"
        description="Trim multiple videos at once with a shared time range and format."
        keywords={["batch trimmer","trim multiple videos","video batch processing"]}
        canonical="/tools/video/batch-trimmer"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Batch Trimmer</CardTitle>
              <CardDescription>Trim multiple videos simultaneously</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Video files</Label>
                <Input type="file" accept="video/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Start (s)</Label>
                  <Input type="number" min={0} value={startTime} onChange={(e) => setStartTime(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>End (s)</Label>
                  <Input type="number" min={0} value={endTime} onChange={(e) => setEndTime(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as any)}>
                    <option value="mp4">MP4</option>
                    <option value="webm">WebM</option>
                    <option value="mov">MOV</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !files.length}>Trim All</Button>
                <Button variant="outline" onClick={() => setItems([])}>Reset</Button>
              </div>
              {items.length > 0 && (
                <div className="space-y-3 mt-4">
                  {items.map((it) => (
                    <div key={it.id} className="p-3 border rounded">
                      <div className="text-sm text-muted-foreground">{it.original.name} → {Math.round((it.trimmed.estimatedSize||0)/1024)} KB</div>
                      <div className="text-xs">Duration: {it.trimmed.duration}s • {it.trimmed.format}</div>
                      <video controls className="w-full mt-2 rounded" src={it.trimmed.url}></video>
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

export default BatchTrimmer;