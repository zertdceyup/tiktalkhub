import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import api, { getErrorMessage } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { useJobPoller } from '@/hooks/useJobPoller';

const VideoPro: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [jobId, setJobId] = useState<number | undefined>(undefined);
  const job = useJobPoller(jobId);

  const silence = useMutation({ mutationFn: async () => { if (!file) throw new Error('No file'); return (await api.videoProSilenceStrip({ file })).data; }, onError: (e) => alert(getErrorMessage(e)) });
  const loudnorm = useMutation({ mutationFn: async () => { if (!file) throw new Error('No file'); return (await api.videoProLoudnorm({ file })).data; }, onError: (e) => alert(getErrorMessage(e)) });
  const colorfix = useMutation({ mutationFn: async () => { if (!file) throw new Error('No file'); return (await api.videoProColorFix({ file })).data; }, onError: (e) => alert(getErrorMessage(e)) });
  const autocrop = useMutation({ mutationFn: async () => { if (!file) throw new Error('No file'); return (await api.videoProSmartAutoCrop({ file })).data; }, onError: (e) => alert(getErrorMessage(e)) });

  const batch = useMutation({
    mutationFn: async (op: 'silence-strip'|'loudnorm'|'color-fix') => {
      if (!files.length) throw new Error('No files');
      return (await api.videoProBatch(op, files)).data;
    },
    onSuccess: (d) => setJobId(d.jobId), onError: (e) => alert(getErrorMessage(e))
  });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen">
      <SEO title="Video Pro | Tiktalkhub" description="Silence strip, loudness normalize, color fix, and smart auto-crop. Batch queue with progress." canonical="/tools/video/pro" jsonLd={{ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Video Pro', applicationCategory: 'MultimediaApplication', operatingSystem: 'Web' }} />
      <Header />
      <div className="container mx-auto px-6"><Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'Video Tools', href: '/tools/video' }, { name: 'Video Pro' }]} jsonLdBaseUrl={baseUrl} /></div>
      <section className="py-12">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-6">
          <Card className="tiktok-card">
            <CardHeader><CardTitle>Single File Operations</CardTitle><CardDescription>Run pro filters on one file</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Video file</Label>
                <Input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => silence.mutate()} disabled={!file || silence.isPending}>Silence Strip</Button>
                <Button onClick={() => loudnorm.mutate()} disabled={!file || loudnorm.isPending}>Loudness Normalize</Button>
                <Button onClick={() => colorfix.mutate()} disabled={!file || colorfix.isPending}>Color Fix</Button>
                <Button onClick={() => autocrop.mutate()} disabled={!file || autocrop.isPending}>Smart Auto-Crop</Button>
              </div>
              <div className="space-y-2">
                {[silence, loudnorm, colorfix, autocrop].map((m, i) => m.data?.url ? (
                  <video key={i} controls className="w-full rounded" src={m.data.url}></video>
                ) : null)}
              </div>
            </CardContent>
          </Card>

          <Card className="tiktok-card">
            <CardHeader><CardTitle>Batch Queue</CardTitle><CardDescription>Queue operations for multiple files</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Videos</Label>
                <Input type="file" accept="video/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => batch.mutate('silence-strip')} disabled={!files.length || batch.isPending}>Queue Silence Strip</Button>
                <Button onClick={() => batch.mutate('loudnorm')} disabled={!files.length || batch.isPending}>Queue Loudnorm</Button>
                <Button onClick={() => batch.mutate('color-fix')} disabled={!files.length || batch.isPending}>Queue Color Fix</Button>
              </div>
              {jobId && (
                <div className="text-sm">
                  <div>Job #{jobId}: {job.status}</div>
                  {job.result && job.status === 'completed' && (
                    <ul className="list-disc pl-5">
                      {(job.result.outputs || []).map((o: any, i: number) => (
                        <li key={i}><a className="underline" href={o.output} target="_blank">Output {i+1}</a></li>
                      ))}
                    </ul>
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

export default VideoPro;