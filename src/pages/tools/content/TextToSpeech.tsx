import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import SEO from '@/components/SEO';
import { Volume2, Loader2, Sparkles } from 'lucide-react';

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState<string>('Hello! This is a demo of Tiktalkhub text-to-speech.');
  const [voice, setVoice] = useState<'male'|'female'|'child'>('female');
  const [speed, setSpeed] = useState<number>(1.0);
  const [language, setLanguage] = useState<'en'|'es'|'fr'|'de'|'it'>('en');

  const { data: blogData } = useQuery({ queryKey: ['content-blogs'], queryFn: async () => (await api.getBlogPosts({ category: 'content', limit: 6 })).data });

  const { mutate, data: result, isPending } = useMutation({
    mutationFn: async () => (await api.textToSpeech({ text, voice, speed, language })).data
  });

  const audioData = result?.audioData;
  const textAnalysis = result?.textAnalysis;

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Text-to-Speech - Tiktalkhub',
    url: window.location.origin + '/tools/content/text-to-speech', applicationCategory: 'BusinessApplication',
    offers: { '@type': 'Offer', price: '0.00', priceCurrency: 'USD' }, operatingSystem: 'Any',
    description: 'Convert text to speech with voice, speed, and language controls.'
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Text-to-Speech (TTS) | Content Tools | Tiktalkhub"
        description="Convert text to natural-sounding speech with voice, speed, and language controls."
        keywords={["text to speech","tts","voice generator","audio from text"]}
        canonical="/tools/content/text-to-speech"
      />
      <Header />
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-gold/20 text-primary border-primary/30">
              <Volume2 className="w-4 h-4 mr-2" /> Content • Text-to-Speech
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground via-primary to-gold-bright bg-clip-text text-transparent">Turn Text into Voice</span>
            </h1>
            <p className="text-muted-foreground">Choose voice, speed, and language. Get quick audio with analysis.</p>
          </div>

          <Card className="tiktok-card mb-10">
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
              <CardDescription>We’ll generate audio with your settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Text</Label>
                <Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Voice</Label>
                  <select className="input border rounded-md p-2 w-full" value={voice} onChange={(e) => setVoice(e.target.value as any)}>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="child">Child</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Speed</Label>
                  <Input type="number" min={0.5} max={2.0} step={0.1} value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value || '1'))} />
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <select className="input border rounded-md p-2 w-full" value={language} onChange={(e) => setLanguage(e.target.value as any)}>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => mutate()} disabled={isPending} className="btn-gold">
                  {isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating</>) : (<><Sparkles className="mr-2 h-4 w-4" /> Generate Audio</>)}
                </Button>
              </div>
            </CardContent>
          </Card>

          {audioData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="tiktok-card">
                  <CardHeader>
                    <CardTitle>Audio</CardTitle>
                    <CardDescription>Mock URL and details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>URL: <span className="text-primary">{audioData.url}</span></div>
                    <div>Duration: {audioData.duration}s • Format: {audioData.format} • Bitrate: {audioData.bitrate} • Sample Rate: {audioData.sampleRate}</div>
                  </CardContent>
                </Card>

                {textAnalysis && (
                  <Card className="tiktok-card">
                    <CardHeader>
                      <CardTitle>Text Analysis</CardTitle>
                      <CardDescription>Before generating audio</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Word Count</span><span>{textAnalysis.wordCount}</span></div>
                      <div className="flex justify-between"><span>Characters</span><span>{textAnalysis.characterCount}</span></div>
                      <div className="flex justify-between"><span>Estimated Duration</span><span>{textAnalysis.estimatedDuration}</span></div>
                      <div className="flex justify-between"><span>Complexity</span><span>{textAnalysis.complexity}</span></div>
                      <div className="flex justify-between"><span>Readability</span><span>{textAnalysis.readability.level || textAnalysis.readability.score}</span></div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-4">
                <Card className="tiktok-card">
                  <CardHeader>
                    <CardTitle>Content Insights</CardTitle>
                    <CardDescription>Hand-picked reads on content strategy</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {blogData?.posts?.slice(0, 6).map((post: any) => (
                        <div key={post.id} className="group cursor-pointer">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                              {post.title}
                            </h4>
                            {post.featured && (
                              <Badge className="ml-2">Featured</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <TikoAI />
    </div>
  );
};

export default TextToSpeech;