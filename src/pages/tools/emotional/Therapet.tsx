import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import SEO from '@/components/SEO';
import { useMutation } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';

const Therapet: React.FC = () => {
  const [mood, setMood] = useState<'happy'|'sad'|'anxious'|'excited'|'angry'|'calm'|'stressed'|'neutral'>('neutral');
  const [petType, setPetType] = useState<'cat'|'dog'|'bird'|'fish'|'hamster'>('cat');
  const [interaction, setInteraction] = useState<'feed'|'play'|'pet'|'talk'|'exercise'>('talk');
  const [result, setResult] = useState<any | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.therapet({ currentMood: mood, petType, interaction });
      return res.data as any;
    },
    onSuccess: (data) => setResult(data),
    onError: (err) => alert(getErrorMessage(err))
  });

  return (
    <div className="min-h-screen">
      <SEO
        title="Therapet | Emotional Tools | Tiktalkhub"
        description="Interact with a mood-based virtual pet for gentle emotional support."
        keywords={["therapet","virtual pet","mood support"]}
        canonical="/tools/emotional/therapet"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Therapet</CardTitle>
              <CardDescription>Mood-based virtual pet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Current Mood</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={mood} onChange={(e) => setMood(e.target.value as any)}>
                    {['happy','sad','anxious','excited','angry','calm','stressed','neutral'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Pet Type</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={petType} onChange={(e) => setPetType(e.target.value as any)}>
                    {['cat','dog','bird','fish','hamster'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Interaction</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3" value={interaction} onChange={(e) => setInteraction(e.target.value as any)}>
                    {['feed','play','pet','talk','exercise'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending}>Interact</Button>
              </div>
              {result && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Pet mood: {result.pet?.mood} • Happiness: {result.pet?.happiness} • Energy: {result.pet?.energy}</div>
                  <div className="border rounded p-3 text-sm whitespace-pre-wrap">{result.response}</div>
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

export default Therapet;