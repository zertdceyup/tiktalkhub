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

const PDFPasswordProtector: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [protectedPdf, setProtectedPdf] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  const uploadWithProgress = (): Promise<any> => new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Please select a PDF file'));
    const form = new FormData();
    form.append('pdf', file);
    if (password) form.append('password', password);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/tools/utility/pdf-password-protector`);
    const token = localStorage.getItem('auth_token'); if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onreadystatechange = () => { if (xhr.readyState === 4) { try { const res = JSON.parse(xhr.responseText); if (xhr.status >= 200 && xhr.status < 300 && res?.success) resolve(res.data); else reject(new Error(res?.message || 'Upload failed')); } catch (err) { reject(err); } } };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(form);
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => uploadWithProgress(),
    onSuccess: (data) => setProtectedPdf(data.protectedPdf || ''),
    onError: (err) => alert(getErrorMessage(err))
  });

  const download = () => {
    if (!protectedPdf) return;
    const a = document.createElement('a');
    a.href = protectedPdf;
    a.download = `protected_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen">
      <SEO
        title="PDF Password Protector | PDF Tools | Tiktalkhub"
        description="Apply password protection (demo watermark-based) to your PDFs."
        keywords={["pdf password","protect pdf","pdf security"]}
        canonical="/tools/utility/pdf-password-protector"
        jsonLd={{ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'PDF Password Protector', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', url: (typeof window !== 'undefined' ? window.location.href : ''), offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }}
      />
      <Header />
      <div className="container mx-auto px-6">
        <Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'PDF Tools', href: '/tools/pdf' }, { name: 'PDF Password Protector' }]} jsonLdBaseUrl={baseUrl} />
      </div>
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>PDF Password Protector</CardTitle>
              <CardDescription>Demo watermark-based protection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>PDF file</Label>
                <div className="border rounded p-4 text-center hover:bg-secondary/30 cursor-pointer" onDragOver={(e) => { e.preventDefault(); }} onDrop={(e) => { e.preventDefault(); const item = Array.from(e.dataTransfer.files || []).find(f => f.type === 'application/pdf'); if (item) setFile(item); }}>
                  <div>Drag & drop or click to select</div>
                  <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
              </div>
              {isPending && (
                <div className="w-full bg-secondary rounded h-2 overflow-hidden">
                  <div className="bg-primary h-2 transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !file}>Protect</Button>
                <Button variant="outline" onClick={download} disabled={!protectedPdf}>Download</Button>
              </div>
              {protectedPdf && (
                <div className="text-sm text-muted-foreground">Note: Demo watermark applied; no encryption. Suitable for preview/testing.</div>
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

export default PDFPasswordProtector;