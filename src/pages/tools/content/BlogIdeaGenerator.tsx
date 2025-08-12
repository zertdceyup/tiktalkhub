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
import { Sparkles, Loader2, Lightbulb, Download, CopyPlus, Copy } from 'lucide-react';

const BlogIdeaGenerator: React.FC = () => {
  const [niche, setNiche] = useState<string>('Productivity');
  const [targetAudience, setTargetAudience] = useState<string>('Students and professionals');
  const [contentType, setContentType] = useState<'how-to'|'listicle'|'review'|'tutorial'|'news'|'opinion'>('how-to');
  const [keywordsInput, setKeywordsInput] = useState<string>('time management, habits');

  const keywords = useMemo(() => keywordsInput.split(',').map(s => s.trim()).filter(Boolean), [keywordsInput]);

  const { data: blogData } = useQuery({ queryKey: ['content-blogs'], queryFn: async () => (await api.getBlogPosts({ category: 'content', limit: 6 })).data });

  const { mutate, data: result, isPending } = useMutation({
    mutationFn: async () => (await api.generateBlogIdeas({ niche, targetAudience, contentType, keywords, count: 12 })).data
  });

  const ideas = result?.blogIdeas || [];
  const copyAll = async () => { await navigator.clipboard.writeText(ideas.map((i: any) => i.title).join('\n')); };
  const exportCSV = () => {
    const rows = [['Title','Type','Difficulty','Est. Words']].concat(ideas.map((i: any) => [i.title, i.type, i.difficulty, i.estimatedWords]));
    const csv = rows.map(r => r.map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `blog-ideas-${Date.now()}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Blog Idea Generator - Tiktalkhub',
    url: window.location.origin + '/tools/content/blog-idea-generator', applicationCategory: 'BusinessApplication',
    offers: { '@type': 'Offer', price: '0.00', priceCurrency: 'USD' }, operatingSystem: 'Any',
    description: 'Generate SEO-friendly blog ideas with metadata and export.'
  };

  return (
    <div className="min-h-screen">
      <SEO title="Blog Idea Generator | Tiktalkhub" description="Generate SEO-friendly blog ideas with metadata, copy-all and CSV export."
        keywords={["blog ideas","content strategy","SEO topics"]}
        canonical="/tools/content/blog-idea-generator"
        openGraph={{ title: 'Blog Idea Generator | Tiktalkhub', description: 'Generate SEO-friendly blog ideas', type: 'website', url: window.location.href }}
        twitter={{ card: 'summary_large_image', title: 'Blog Idea Generator | Tiktalkhub', description: 'Generate SEO-friendly blog ideas' }}
        jsonLd={jsonLd}
      />
      <Header />
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-gold/20 text-primary border-primary/30">
              <Lightbulb className="w-4 h-4 mr-2" /> Content • Blog Idea Generator
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground via-primary to-gold-bright bg-clip-text text-transparent">Generate High-Impact Blog Ideas</span>
            </h1>
            <p className="text-muted-foreground">Niche-specific titles with type, difficulty, and estimated word count.</p>
          </div>

          <Card className="tiktok-card mb-10">
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
              <CardDescription>We’ll craft ideas tailored to your audience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Niche</Label>
                  <Input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g., Productivity, AI, Fitness" />
                </div>
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <select className="input border rounded-md p-2 w-full" value={contentType} onChange={(e) => setContentType(e.target.value as any)}>
                    <option value="how-to">How-To</option>
                    <option value="listicle">Listicle</option>
                    <option value="review">Review</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="news">News</option>
                    <option value="opinion">Opinion</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g., Students, Founders" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Keywords (comma-separated)</Label>
                  <Textarea rows={3} value={keywordsInput} onChange={(e) => setKeywordsInput(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => mutate()} disabled={isPending} className="btn-gold">
                  {isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating</>) : (<><Sparkles className="mr-2 h-4 w-4" /> Generate Ideas</>)}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {ideas.length > 0 && (
                <Card className="tiktok-card">
                  <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <CardTitle>Results</CardTitle>
                      <CardDescription>SEO-ready titles with helpful metadata</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={copyAll}><CopyPlus className="h-4 w-4 mr-2" /> Copy All</Button>
                      <Button size="sm" variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {ideas.map((idea: any, idx: number) => (
                        <div key={idx} className="rounded-md border p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold">{idea.title}</div>
                              <div className="text-xs text-muted-foreground">Type: {idea.type} • Difficulty: {idea.difficulty} • Est. words: {idea.estimatedWords}</div>
                            </div>
                            <Button size="sm" variant="ghost" onClick={async () => await navigator.clipboard.writeText(idea.title)}>
                              <Copy className="h-4 w-4 mr-1" /> Copy
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
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
                    {!blogData?.posts?.length && (
                      <p className="text-sm text-muted-foreground">No posts yet. Add Content posts from the admin dashboard.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <TikoAI />
    </div>
  );
};

export default BlogIdeaGenerator;