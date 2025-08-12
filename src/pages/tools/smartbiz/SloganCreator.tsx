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
import api from '@/lib/api';
import { Copy, Loader2, RefreshCw, Sparkles, Check, Lightbulb } from 'lucide-react';

const defaultKeywords = ['Quality', 'Trusted', 'Pro', 'Smart', 'Innovative', 'Elite'];

const SloganCreator: React.FC = () => {
  const [businessName, setBusinessName] = useState<string>('Acme Labs');
  const [industry, setIndustry] = useState<string>('Technology');
  const [targetAudience, setTargetAudience] = useState<string>('Small businesses');
  const [tone, setTone] = useState<string>('professional');
  const [keywordsInput, setKeywordsInput] = useState<string>('');
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

  const { mutate, data: sloganData, isPending } = useMutation({
    mutationFn: async () => {
      const result = await api.generateSlogans({
        businessName,
        industry,
        targetAudience,
        tone,
        keywords
      });
      return result.data;
    }
  });

  const handleGenerate = () => mutate();

  const handleCopy = async (slogan: string, index: number) => {
    await navigator.clipboard.writeText(slogan);
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
              <Lightbulb className="w-4 h-4 mr-2" />
              SmartBiz • Slogan Creator
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground via-primary to-gold-bright bg-clip-text text-transparent">
                Craft Catchy Taglines in Seconds
              </span>
            </h1>
            <p className="text-muted-foreground">
              Generate 15+ memorable slogans tailored to your brand voice and audience. Tweak tone, audience, and keywords.
            </p>
          </div>

          <Card className="tiktok-card mb-10">
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
              <CardDescription>Describe your brand and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g., Acme Labs" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., Technology, Fitness, Food" />
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g., Small businesses, Students" />
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="trustworthy">Trustworthy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Textarea id="keywords" value={keywordsInput} onChange={(e) => setKeywordsInput(e.target.value)} placeholder="e.g., quality, trusted, innovation" rows={3} />
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
                      <Sparkles className="mr-2 h-4 w-4" /> Generate Slogans
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
                    {isPending ? 'Generating suggestions…' : sloganData?.slogans ? `Found ${sloganData.slogans.length} suggestions` : 'Run the generator to see slogans'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {sloganData?.slogans?.map((slogan: string, idx: number) => (
                      <div key={idx} className="flex items-center justify-between rounded-md border p-3">
                        <span className="font-medium">{slogan}</span>
                        <Button size="sm" variant="ghost" onClick={() => handleCopy(slogan, idx)}>
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
                Tip: Keep slogans short, benefit-driven, and easy to remember.
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

export default SloganCreator;