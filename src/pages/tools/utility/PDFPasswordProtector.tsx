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

const PDFPasswordProtector: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [protectedPdf, setProtectedPdf] = useState<string>('');

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please select a PDF file');
      const res = await api.protectPDF({ file, password });
      return res.data as any;
    },
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

  return (
    <div className="min-h-screen">
      <SEO
        title="PDF Password Protector | PDF Tools | Tiktalkhub"
        description="Apply password protection (demo watermark-based) to your PDFs."
        keywords={["pdf password","protect pdf","pdf security"]}
        canonical="/tools/utility/pdf-password-protector"
      />
      <Header />
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
                <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
              </div>
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