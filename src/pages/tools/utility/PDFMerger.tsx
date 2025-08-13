import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import api, { getErrorMessage } from '@/lib/api';

const PDFMerger: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [merged, setMerged] = useState<any | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const uploadWithProgress = (): Promise<any> => new Promise((resolve, reject) => {
    if (files.length < 2) return reject(new Error('Please add at least two PDF files'));
    const form = new FormData();
    files.forEach((f) => form.append('pdfs', f));
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/tools/utility/pdf-merger`);
    const token = localStorage.getItem('auth_token'); if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onreadystatechange = () => { if (xhr.readyState === 4) { try { const res = JSON.parse(xhr.responseText); if (xhr.status >= 200 && xhr.status < 300 && res?.success) resolve(res.data); else reject(new Error(res?.message || 'Upload failed')); } catch (err) { reject(err); } } };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(form);
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => uploadWithProgress(),
    onSuccess: (data) => setMerged(data),
    onError: (err) => alert(getErrorMessage(err))
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files; if (!list) return; setFiles((prev) => [...prev, ...Array.from(list)]);
  };

  const download = () => { if (!merged) return; const a = document.createElement('a'); a.href = merged.mergedPdf; a.download = `merged_${Date.now()}.pdf`; document.body.appendChild(a); a.click(); document.body.removeChild(a); };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen">
      <SEO
        title="PDF Merger | Utility Tools | Tiktalkhub"
        description="Merge multiple PDF files into a single document."
        keywords={["pdf merger","combine pdfs","merge pdf online"]}
        canonical="/tools/utility/pdf-merger"
        jsonLd={{ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'PDF Merger', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', url: (typeof window !== 'undefined' ? window.location.href : ''), offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }}
      />
      <Header />
      <div className="container mx-auto px-6">
        <Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'PDF Tools', href: '/tools/pdf' }, { name: 'PDF Merger' }]} jsonLdBaseUrl={baseUrl} />
      </div>
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
                <div className="border rounded p-4 text-center hover:bg-secondary/30 cursor-pointer" onDragOver={(e) => { e.preventDefault(); }} onDrop={(e) => { e.preventDefault(); const items = Array.from(e.dataTransfer.files || []).filter(f => f.type === 'application/pdf'); if (items.length) setFiles(prev => [...prev, ...items]); }}>
                  <div>Drag & drop or click to select</div>
                  <input type="file" accept="application/pdf" multiple onChange={onFileChange} />
                </div>
              </div>
              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{files.length} file(s) selected</p>
                  <ul className="list-disc pl-6 text-sm">
                    {files.map((f, i) => <li key={`${f.name}-${i}`}>{f.name}</li>)}
                  </ul>
                </div>
              )}
              {isPending && (
                <div className="w-full bg-secondary rounded h-2 overflow-hidden">
                  <div className="bg-primary h-2 transition-all" style={{ width: `${progress}%` }} />
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