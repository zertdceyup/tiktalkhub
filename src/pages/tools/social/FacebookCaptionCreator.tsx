import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import SEO from '@/components/SEO';

const FacebookCaptionCreator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<'professional'|'casual'|'engaging'|'promotional'>('engaging');
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [cta, setCta] = useState('');
  const [caption, setCaption] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.generateFacebookCaption({ topic, tone, includeEmojis, callToAction: cta });
      return res.data as any;
    },
    onSuccess: (data) => setCaption(data.caption || ''),
    onError: (err) => alert(getErrorMessage(err))
  });

  const copy = async () => {
    await navigator.clipboard.writeText(caption);
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Facebook Caption Creator | Social Tools | Tiktalkhub"
        description="Create engaging Facebook captions with tone, emoji, and CTA options."
        keywords={["facebook caption","social caption maker"]}
        canonical="/tools/social/facebook-caption-creator"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Facebook Caption Creator</CardTitle>
              <CardDescription>Enter topic and customize</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What is your post about?" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={tone} onChange={(e) => setTone(e.target.value as any)}>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="engaging">Engaging</option>
                    <option value="promotional">Promotional</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Include Emojis</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={includeEmojis ? 'yes' : 'no'} onChange={(e) => setIncludeEmojis(e.target.value === 'yes')}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Call To Action (optional)</Label>
                  <Input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="e.g., Learn more at our site" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !topic}>Generate</Button>
                <Button variant="outline" onClick={copy} disabled={!caption}>Copy</Button>
              </div>
              {caption && (
                <div className="border rounded p-3 text-sm whitespace-pre-wrap">{caption}</div>
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

export default FacebookCaptionCreator;