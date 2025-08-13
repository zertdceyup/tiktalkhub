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

const VoiceNotesToText: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<'en'|'es'|'fr'|'de'|'it'>('en');
  const [transcript, setTranscript] = useState('');
  const [meta, setMeta] = useState<any>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Please select an audio file');
      const res = await api.voiceNotesToText({ file, language });
      return res.data as any;
    },
    onSuccess: (data) => { setTranscript(data.transcript || ''); setMeta(data); },
    onError: (err) => alert(getErrorMessage(err))
  });

  return (
    <div className="min-h-screen">
      <SEO title="Voice Notes to Text | Content Tools | Tiktalkhub" description="Convert voice recordings to accurate text transcriptions with language selection." keywords={["voice to text","transcription","speech to text"]} canonical="/tools/content/voice-notes-to-text" />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Voice Notes to Text</CardTitle>
              <CardDescription>Transcribe your audio notes quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Audio file (mp3, wav, m4a, webm)</Label>
                <Input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <div className="space-y-2 max-w-xs">
                <Label>Language</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3" value={language} onChange={(e) => setLanguage(e.target.value as any)}>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !file}>Transcribe</Button>
              </div>
              {transcript && (
                <div className="mt-4 text-sm whitespace-pre-wrap">
                  {transcript}
                  {meta && (
                    <div className="text-xs text-muted-foreground mt-2">Confidence: {(meta.confidence*100).toFixed(0)}% • Words: {meta.wordCount}</div>
                  )}
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

export default VoiceNotesToText;