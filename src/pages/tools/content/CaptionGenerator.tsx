import React, { useMemo, useState } from 'react';
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
import { Sparkles, Loader2, MessageSquare, Copy } from 'lucide-react';

const CaptionGenerator: React.FC = () => {
  const [platform, setPlatform] = useState<'instagram'|'facebook'|'twitter'|'linkedin'|'tiktok'|'general'>('instagram');
  const [content, setContent] = useState<string>('Announcing our new product launch next week!');
  const [tone, setTone] = useState<'professional'|'casual'|'funny'|'inspirational'|'promotional'>('promotional');
  const [includeHashtags, setIncludeHashtags] = useState<boolean>(true);
  const [includeEmojis, setIncludeEmojis] = useState<boolean>(true);
  const [callToAction, setCallToAction] = useState<string>('Learn more at the link in bio.');

  const { data: blogData } = useQuery({ queryKey: ['content-blogs'], queryFn: async () => (await api.getBlogPosts({ category: 'content', limit: 6 })).data });

  const { mutate, data: result, isPending } = useMutation({
    mutationFn: async () => (await api.generateCaptions({ platform, content, tone, includeHashtags, includeEmojis, callToAction })).data
  });

  const caption = result?.caption || '';
  const hashtags = result?.hashtags || [];
  const analysis = result?.analysis;

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Caption Generator - Tiktalkhub',
    url: window.location.origin + '/tools/content/caption-generator', applicationCategory: 'BusinessApplication',
    offers: { '@type': 'Offer', price: '0.00', priceCurrency: 'USD' }, operatingSystem: 'Any',
    description: 'Generate platform-optimized captions with tone, hashtags, emojis, and analysis.'
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Caption Generator | Content Tools | Tiktalkhub"
        description="Create platform-optimized captions with hashtags, emojis, and CTAs."
        keywords={["caption generator","social captions","instagram captions","tiktok captions"]}
        canonical="/tools/content/caption-generator"
      />
      <Header />
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-gold/20 text-primary border-primary/30">
              <MessageSquare className="w-4 h-4 mr-2" /> Content • Caption Generator
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground via-primary to-gold-bright bg-clip-text text-transparent">Create Captions That Engage</span>
            </h1>
            <p className="text-muted-foreground">Platform-specific optimization with hashtags, emojis, and sentiment/readability analysis.</p>
          </div>

          <Card className="tiktok-card mb-10">
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
              <CardDescription>We’ll tailor it for your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <select className="input border rounded-md p-2 w-full" value={platform} onChange={(e) => setPlatform(e.target.value as any)}>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="tiktok">TikTok</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <select className="input border rounded-md p-2 w-full" value={tone} onChange={(e) => setTone(e.target.value as any)}>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="funny">Funny</option>
                    <option value="inspirational">Inspirational</option>
                    <option value="promotional">Promotional</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Content</Label>
                  <Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Call To Action (optional)</Label>
                  <Input value={callToAction} onChange={(e) => setCallToAction(e.target.value)} placeholder="e.g., Learn more at the link in bio." />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><input type="checkbox" checked={includeHashtags} onChange={(e) => setIncludeHashtags(e.target.checked)} /> Include Hashtags</Label>
                  <Label className="flex items-center gap-2"><input type="checkbox" checked={includeEmojis} onChange={(e) => setIncludeEmojis(e.target.checked)} /> Include Emojis</Label>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => mutate()} disabled={isPending} className="btn-gold">
                  {isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating</>) : (<><Sparkles className="mr-2 h-4 w-4" /> Generate Caption</>)}
                </Button>
              </div>
            </CardContent>
          </Card>

          {caption && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="tiktok-card">
                  <CardHeader>
                    <CardTitle>Caption</CardTitle>
                    <CardDescription>Platform-optimized with your settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border p-3 whitespace-pre-wrap text-sm">
                      {caption}
                    </div>
                    {hashtags.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {hashtags.join(' ')}
                      </div>
                    )}
                    <div className="mt-3">
                      <Button size="sm" variant="outline" onClick={async () => await navigator.clipboard.writeText([caption, hashtags.join(' ')].join('\n'))}><Copy className="h-4 w-4 mr-2" /> Copy All</Button>
                    </div>
                  </CardContent>
                </Card>

                {analysis && (
                  <Card className="tiktok-card">
                    <CardHeader>
                      <CardTitle>Analysis</CardTitle>
                      <CardDescription>Sentiment, readability, and platform fit</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Sentiment</span><span>{analysis.sentiment.sentiment} ({analysis.sentiment.score})</span></div>
                      <div className="flex justify-between"><span>Readability</span><span>{analysis.readability.level || analysis.readability.score}</span></div>
                      <div className="flex justify-between"><span>Length Optimal</span><span>{analysis.platformOptimized.lengthOptimal ? 'Yes' : 'No'}</span></div>
                      <div className="flex justify-between"><span>Within Limits</span><span>{analysis.platformOptimized.withinLimits ? 'Yes' : 'No'}</span></div>
                      <div className="flex justify-between"><span>Has Hashtags</span><span>{analysis.platformOptimized.hasHashtags ? 'Yes' : 'No'}</span></div>
                      <div className="flex justify-between"><span>Has Emojis</span><span>{analysis.platformOptimized.hasEmojis ? 'Yes' : 'No'}</span></div>
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

export default CaptionGenerator;