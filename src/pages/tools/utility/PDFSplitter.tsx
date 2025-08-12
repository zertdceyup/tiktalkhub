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
import Breadcrumbs from '@/components/Breadcrumbs';
import api, { getErrorMessage } from '@/lib/api';

const PDFSplitter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'ranges'|'every'>('ranges');
  const [ranges, setRanges] = useState<string>('1-3,5');
  const [everyN, setEveryN] = useState<number>(1);
  const [parts, setParts] = useState<{ label: string; pdf: string }[]>([]);
  const [progress, setProgress] = useState<number>(0);

  const uploadWithProgress = (): Promise<any> => new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Please select a PDF file'));
    const form = new FormData();
    form.append('pdf', file);
    form.append('mode', mode);
    if (mode === 'ranges' && ranges) form.append('ranges', ranges);
    if (mode === 'every' && everyN) form.append('everyN', String(everyN));
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/tools/utility/pdf-splitter`);
    const token = localStorage.getItem('auth_token'); if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onreadystatechange = () => { if (xhr.readyState === 4) { try { const res = JSON.parse(xhr.responseText); if (xhr.status >= 200 && xhr.status < 300 && res?.success) resolve(res.data); else reject(new Error(res?.message || 'Upload failed')); } catch (err) { reject(err); } } };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(form);
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => uploadWithProgress(),
    onSuccess: (data) => setParts(data.parts || []),
    onError: (err) => alert(getErrorMessage(err))
  });

  const download = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `split_${name}_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen">
      <SEO
        title="PDF Splitter | PDF Tools | Tiktalkhub"
        description="Split PDF files by ranges or every N pages, with instant previews."
        keywords={["pdf splitter","split pdf","pdf pages"]}
        canonical="/tools/utility/pdf-splitter"
        jsonLd={{ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'PDF Splitter', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', url: (typeof window !== 'undefined' ? window.location.href : ''), offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }}
      />
      <Header />
      <div className="container mx-auto px-6">
        <Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'PDF Tools', href: '/tools/pdf' }, { name: 'PDF Splitter' }]} jsonLdBaseUrl={baseUrl} />
      </div>
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>PDF Splitter</CardTitle>
              <CardDescription>Split by page ranges or every N pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>PDF file</Label>
                <div className="border rounded p-4 text-center hover:bg-secondary/30 cursor-pointer" onDragOver={(e) => { e.preventDefault(); }} onDrop={(e) => { e.preventDefault(); const item = Array.from(e.dataTransfer.files || []).find(f => f.type === 'application/pdf'); if (item) setFile(item); }}>
                  <div>Drag & drop or click to select</div>
                  <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Mode</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={mode} onChange={(e) => setMode(e.target.value as any)}>
                    <option value="ranges">Ranges</option>
                    <option value="every">Every N pages</option>
                  </select>
                </div>
                {mode === 'ranges' ? (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Ranges (e.g., 1-3,5,7-8)</Label>
                    <Input value={ranges} onChange={(e) => setRanges(e.target.value)} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Every N pages</Label>
                    <Input type="number" min={1} value={everyN} onChange={(e) => setEveryN(Number(e.target.value))} />
                  </div>
                )}
              </div>
              {isPending && (
                <div className="w-full bg-secondary rounded h-2 overflow-hidden">
                  <div className="bg-primary h-2 transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !file}>Split PDF</Button>
              </div>
              {parts.length > 0 && (
                <div className="space-y-2 mt-4">
                  {parts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between border rounded p-3 text-sm">
                      <span>Part {i + 1} ({p.label})</span>
                      <Button size="sm" variant="outline" onClick={() => download(p.pdf, p.label)}>Download</Button>
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

export default PDFSplitter;