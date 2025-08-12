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

const PDFSplitter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'ranges'|'every'>('ranges');
  const [ranges, setRanges] = useState<string>('1-3,5');
  const [everyN, setEveryN] = useState<number>(1);
  const [parts, setParts] = useState<{ label: string; pdf: string }[]>([]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please select a PDF file');
      const res = await api.splitPDF({ file, mode, ranges, everyN });
      return res.data as any;
    },
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

  return (
    <div className="min-h-screen">
      <SEO
        title="PDF Splitter | PDF Tools | Tiktalkhub"
        description="Split PDF files by ranges or every N pages, with instant previews."
        keywords={["pdf splitter","split pdf","pdf pages"]}
        canonical="/tools/utility/pdf-splitter"
      />
      <Header />
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
                <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
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