import React, { useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import { Copy, Loader2, RefreshCw, Sparkles, Check, Building2 } from 'lucide-react';

const defaultKeywords = ['Tech', 'Digital', 'Pro', 'Studio', 'Cloud', 'Creative'];

const BusinessNameGenerator: React.FC = () => {
  const [industry, setIndustry] = useState<string>('Technology');
  const [keywordsInput, setKeywordsInput] = useState<string>('');
  const [style, setStyle] = useState<string>('modern');
  const [lengthPref, setLengthPref] = useState<string>('medium');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const keywords = useMemo(() => {
    const manual = keywordsInput
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);
    return manual.length > 0 ? manual : defaultKeywords;
  }, [keywordsInput]);

  const { data: blogData, isLoading: blogsLoading } = useQuery({
    queryKey: ['smartbiz-blogs'],
    queryFn: async () => {
      const res = await api.getBlogPosts({ category: 'smartbiz', limit: 6 });
      return res.data;
    }
  });

  const { mutate, data: namesData, isPending } = useMutation({
    mutationFn: async () => {
      const result = await api.generateBusinessNames({
        industry,
        keywords,
        style,
        length: lengthPref
      });
      return result.data;
    }
  });

  const handleGenerate = () => mutate();

  const handleCopy = async (name: string, index: number) => {
    await navigator.clipboard.writeText(name);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-gold/20 text-primary border-primary/30">
              <Building2 className="w-4 h-4 mr-2" />
              SmartBiz • Business Name Generator
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground via-primary to-gold-bright bg-clip-text text-transparent">
                Generate Memorable Business Names
              </span>
            </h1>
            <p className="text-muted-foreground">
              Get 20 brandable, on-style names powered by our local AI engine. Fine-tune by industry, style, and preferred length.
            </p>
          </div>

          <Card className="tiktok-card mb-10">
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
              <CardDescription>Describe your business and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., Technology, Food, Fitness" />
                </div>
                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="tech">Tech</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Length</Label>
                  <Select value={lengthPref} onValueChange={setLengthPref}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Textarea id="keywords" value={keywordsInput} onChange={(e) => setKeywordsInput(e.target.value)} placeholder="e.g., cloud, studio, atlas" rows={3} />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleGenerate} disabled={isPending} className="btn-gold">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Generate Names
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setKeywordsInput('')} disabled={isPending}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="tiktok-card">
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                  <CardDescription>
                    {isPending ? 'Generating suggestions…' : namesData?.businessNames ? `Found ${namesData.businessNames.length} suggestions` : 'Run the generator to see names'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {namesData?.businessNames?.map((name: string, idx: number) => (
                      <div key={idx} className="flex items-center justify-between rounded-md border p-3">
                        <span className="font-medium">{name}</span>
                        <Button size="sm" variant="ghost" onClick={() => handleCopy(name, idx)}>
                          {copiedIndex === idx ? (
                            <>
                              <Check className="mr-1 h-4 w-4 text-green-600" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1 h-4 w-4" /> Copy
                            </>
                          )}
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
                  <CardTitle>SmartBiz Insights</CardTitle>
                  <CardDescription>Hand-picked reads for entrepreneurs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {blogsLoading && (
                      <div className="text-sm text-muted-foreground">Loading posts…</div>
                    )}
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
                    {!blogsLoading && (!blogData?.posts || blogData.posts.length === 0) && (
                      <p className="text-sm text-muted-foreground">No posts yet. Add SmartBiz posts from the admin dashboard.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="text-xs text-muted-foreground">
                Tip: Use concise, evocative words. Test out multiple styles for breadth, then refine.
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <TikoAI />
    </div>
  );
};

export default BusinessNameGenerator;