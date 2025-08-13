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

const BioLinkBuilder: React.FC = () => {
  const [title, setTitle] = useState('My Links');
  const [bio, setBio] = useState('Creator • Educator • Building daily');
  const [theme, setTheme] = useState<'light'|'dark'|'neon'>('neon');
  const [links, setLinks] = useState<{ label: string; url: string }[]>([
    { label: 'YouTube', url: 'https://youtube.com' },
    { label: 'Website', url: 'https://example.com' },
  ]);
  const [share, setShare] = useState<{ shareId: string; preview: any } | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.buildBioLink({ title, bio, theme, links });
      return res.data as any;
    },
    onSuccess: (data) => setShare({ shareId: data.shareId, preview: data.preview }),
    onError: (err) => alert(getErrorMessage(err))
  });

  const addLink = () => setLinks([...links, { label: '', url: '' }]);
  const updateLink = (i: number, key: 'label'|'url', v: string) => setLinks(links.map((l, idx) => idx === i ? { ...l, [key]: v } : l));
  const removeLink = (i: number) => setLinks(links.filter((_, idx) => idx !== i));

  return (
    <div className="min-h-screen">
      <SEO title="Instagram Bio Link Builder | Social Tools | Tiktalkhub" description="Create a beautiful bio link landing page with themes and analytics-ready setup." keywords={["bio link","link in bio","landing page"]} canonical="/tools/social/bio-link-builder" />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Instagram Bio Link Builder</CardTitle>
              <CardDescription>Create a themed landing page aggregating your links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={theme} onChange={(e) => setTheme(e.target.value as any)}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="neon">Neon</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Input value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Links</Label>
                <div className="space-y-2">
                  {links.map((l, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2">
                      <Input className="col-span-2" placeholder="Label" value={l.label} onChange={(e) => updateLink(i, 'label', e.target.value)} />
                      <Input className="col-span-3" placeholder="https://" value={l.url} onChange={(e) => updateLink(i, 'url', e.target.value)} />
                      <Button variant="outline" onClick={() => removeLink(i)}>Remove</Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={addLink}>Add Link</Button>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending}>Build</Button>
                {share?.preview?.url && (
                  <a className="underline text-primary" href={share.preview.url} target="_blank" rel="noreferrer">View JSON</a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
      <TikoAI />
    </div>
  );
};

export default BioLinkBuilder;