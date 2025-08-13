import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import SEO from '@/components/SEO';

const MindMirror: React.FC = () => {
  const [journalEntry, setJournalEntry] = useState('');
  const [mood, setMood] = useState<'happy' | 'sad' | 'anxious' | 'excited' | 'angry' | 'calm' | 'stressed' | 'neutral' | ''>('');
  const [result, setResult] = useState<any | null>(null);

  const { data: blogData } = useQuery({
    queryKey: ['emotional-blogs'],
    queryFn: async () => (await api.getBlogPosts({ category: 'emotional', limit: 6 })).data,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.mindMirror({ journalEntry, mood: mood || undefined });
      return res.data as any;
    },
    onSuccess: (data) => setResult(data),
    onError: (err) => alert(getErrorMessage(err))
  });

  return (
    <div className="min-h-screen">
      <SEO
        title="MindMirror | Emotional Tools | Tiktalkhub"
        description="Write a journal entry and get AI-powered reflection, sentiment, and suggestions."
        keywords={["mindmirror","journal ai","emotion reflection"]}
        canonical="/tools/emotional/mindmirror"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="tiktok-card">
              <CardHeader>
                <CardTitle>MindMirror</CardTitle>
                <CardDescription>Journal → Emotion → AI Reflection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Journal Entry</Label>
                  <Textarea rows={8} value={journalEntry} onChange={(e) => setJournalEntry(e.target.value)} placeholder="Write your thoughts..." />
                </div>
                <div className="space-y-2">
                  <Label>Mood (optional)</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={mood} onChange={(e) => setMood(e.target.value as any)}>
                    <option value="">Select mood</option>
                    {['happy','sad','anxious','excited','angry','calm','stressed','neutral'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !journalEntry}>Reflect</Button>
                </div>
                {result && (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">Sentiment: {result.sentiment?.label || result.sentiment?.sentiment}</div>
                    <div className="border rounded p-3 text-sm whitespace-pre-wrap">{result.reflection}</div>
                    <div>
                      <p className="text-sm font-medium">Suggestions</p>
                      <ul className="list-disc pl-6 text-sm text-muted-foreground">
                        {result.suggestions?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="tiktok-card">
              <CardHeader>
                <CardTitle>Emotional Wellness</CardTitle>
                <CardDescription>Curated reads for mental health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {blogData?.posts?.slice(0, 6).map((post: any) => (
                    <div key={post.id} className="group cursor-pointer">
                      <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">{post.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
      <TikoAI />
    </div>
  );
};

export default MindMirror;