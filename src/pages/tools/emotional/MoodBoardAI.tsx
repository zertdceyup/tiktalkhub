import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import SEO from '@/components/SEO';
import { useMutation } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';

const MoodBoardAI: React.FC = () => {
  const [colors, setColors] = useState<string>('blue, pink, white');
  const [description, setDescription] = useState<string>('');
  const [analysis, setAnalysis] = useState<any | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.moodboardAI({ colors: colors.split(',').map(s => s.trim()).filter(Boolean), description });
      return res.data as any;
    },
    onSuccess: (data) => setAnalysis(data),
    onError: (err) => alert(getErrorMessage(err))
  });

  return (
    <div className="min-h-screen">
      <SEO
        title="MoodBoard AI | Emotional Tools | Tiktalkhub"
        description="Analyze mood from color palettes and get music, activities, and quotes recommendations."
        keywords={["moodboard ai","color mood","emotional analysis"]}
        canonical="/tools/emotional/moodboard-ai"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>MoodBoard AI</CardTitle>
              <CardDescription>Colors → Mood → Recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Colors (comma-separated)</Label>
                  <Input value={colors} onChange={(e) => setColors(e.target.value)} placeholder="e.g., red, blue" />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your mood or imagery..." />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending}>Analyze</Button>
              </div>
              {analysis && (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">Dominant Mood: {analysis.moodAnalysis?.dominantMood} • Energy: {analysis.moodAnalysis?.energyLevel}</div>
                  <div>
                    <p className="font-medium">Music</p>
                    <ul className="list-disc pl-6 text-sm text-muted-foreground">
                      {analysis.recommendations?.music?.map((m: string, i: number) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Activities</p>
                    <ul className="list-disc pl-6 text-sm text-muted-foreground">
                      {analysis.recommendations?.activities?.map((m: string, i: number) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Quotes</p>
                    <ul className="list-disc pl-6 text-sm text-muted-foreground">
                      {analysis.recommendations?.quotes?.map((m: string, i: number) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>
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

export default MoodBoardAI;