import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import SEO from '@/components/SEO';
import { Sparkles, Loader2, Type, Copy } from 'lucide-react';

const HeadlineAnalyzer: React.FC = () => {
  const [headline, setHeadline] = useState<string>('10 Productivity Hacks That Actually Work');
  const [type, setType] = useState<'blog'|'email'|'ad'|'social'|'news'>('blog');

  const { data: blogData } = useQuery({ queryKey: ['content-blogs'], queryFn: async () => (await api.getBlogPosts({ category: 'content', limit: 6 })).data });

  const { mutate, data: result, isPending } = useMutation({
    mutationFn: async () => (await api.analyzeHeadline({ headline, type })).data
  });

  const analysis = result?.analysis;
  const suggestions = result?.suggestions || [];
  const alternatives = result?.alternatives || [];

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Headline Analyzer - Tiktalkhub',
    url: window.location.origin + '/tools/content/headline-analyzer', applicationCategory: 'BusinessApplication',
    offers: { '@type': 'Offer', price: '0.00', priceCurrency: 'USD' }, operatingSystem: 'Any',
    description: 'Analyze and improve headlines with scoring breakdown, suggestions, and alternatives.'
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Headline Analyzer | Content Tools | Tiktalkhub"
        description="Analyze and improve your headlines with sentiment, power words, readability and more."
        keywords={["headline analyzer","title score","copy optimization"]}
        canonical="/tools/content/headline-analyzer"
      />
      <Header />
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-gold/20 text-primary border-primary/30">
              <Type className="w-4 h-4 mr-2" /> Content • Headline Analyzer
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground via-primary to-gold-bright bg-clip-text text-transparent">Optimize Headlines That Convert</span>
            </h1>
            <p className="text-muted-foreground">Score breakdown, actionable suggestions, and alternative titles.</p>
          </div>

          <Card className="tiktok-card mb-10">
            <CardHeader>
              <CardTitle>Analyze Headline</CardTitle>
              <CardDescription>We’ll score it and propose improvements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label>Headline</Label>
                  <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select className="input border rounded-md p-2 w-full" value={type} onChange={(e) => setType(e.target.value as any)}>
                    <option value="blog">Blog</option>
                    <option value="email">Email</option>
                    <option value="ad">Ad</option>
                    <option value="social">Social</option>
                    <option value="news">News</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => mutate()} disabled={isPending} className="btn-gold">
                  {isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing</>) : (<><Sparkles className="mr-2 h-4 w-4" /> Analyze</>)}
                </Button>
              </div>
            </CardContent>
          </Card>

          {analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="tiktok-card">
                  <CardHeader>
                    <CardTitle>Score Breakdown</CardTitle>
                    <CardDescription>Overall score: <span className="font-semibold">{analysis.overallScore}</span>/100</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Length</span><span>{analysis.length.score}</span></div>
                    <div className="flex justify-between"><span>Power Words</span><span>{analysis.powerWords}</span></div>
                    <div className="flex justify-between"><span>Emotional Words</span><span>{analysis.emotionalWords}</span></div>
                    <div className="flex justify-between"><span>Numbers</span><span>{analysis.numbers}</span></div>
                    <div className="flex justify-between"><span>Sentiment</span><span>{analysis.sentiment.sentiment}</span></div>
                    <div className="flex justify-between"><span>Readability</span><span>{analysis.readability.level || analysis.readability.fleschScore}</span></div>
                  </CardContent>
                </Card>

                <Card className="tiktok-card">
                  <CardHeader>
                    <CardTitle>Suggestions</CardTitle>
                    <CardDescription>Actionable improvements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {suggestions.map((s: string) => <li key={s}>{s}</li>)}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="tiktok-card">
                  <CardHeader>
                    <CardTitle>Alternatives</CardTitle>
                    <CardDescription>Copy alternative titles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {alternatives.map((a: string, i: number) => (
                        <div key={i} className="flex items-center justify-between rounded-md border p-2 text-sm">
                          <span>{a}</span>
                          <Button size="sm" variant="ghost" onClick={async () => await navigator.clipboard.writeText(a)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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

export default HeadlineAnalyzer;