import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import SEO from '@/components/SEO';

const PDFMerger: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [merged, setMerged] = useState<any | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (files.length < 2) throw new Error('Please add at least two PDF files');
      const res = await api.mergePDFs({ files });
      return res.data as any;
    },
    onSuccess: (data) => setMerged(data),
    onError: (err) => alert(getErrorMessage(err))
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  };

  const download = () => {
    if (!merged) return;
    const a = document.createElement('a');
    a.href = merged.mergedPdf;
    a.download = `merged_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="PDF Merger | Utility Tools | Tiktalkhub"
        description="Merge multiple PDF files into a single document."
        keywords={["pdf merger","combine pdfs","merge pdf online"]}
        canonical="/tools/utility/pdf-merger"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>PDF Merger</CardTitle>
              <CardDescription>Combine multiple PDFs into one document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Choose PDF files</Label>
                <input type="file" accept="application/pdf" multiple onChange={onFileChange} />
              </div>
              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{files.length} file(s) selected</p>
                  <ul className="list-disc pl-6 text-sm">
                    {files.map((f, i) => <li key={`${f.name}-${i}`}>{f.name}</li>)}
                  </ul>
                </div>
              )}
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || files.length < 2}>Merge PDFs</Button>
                <Button variant="outline" onClick={download} disabled={!merged}>Download</Button>
              </div>
              {merged && (
                <div className="text-sm text-muted-foreground">
                  Pages: {merged.totalPages} • Size: {Math.round((merged.mergedSize||0)/1024)} KB
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

export default PDFMerger;