import React, { useEffect, useMemo, useState } from 'react';
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
import { Copy, Loader2, RefreshCw, Sparkles, Check, Lightbulb, Star, Download, CopyPlus } from 'lucide-react';
import SEO from '@/components/SEO';

const defaultKeywords = ['Quality', 'Trusted', 'Pro', 'Smart', 'Innovative', 'Elite'];
const FAVORITES_KEY = 'tth_slogan_creator_favorites';

const SloganCreator: React.FC = () => {
  const [businessName, setBusinessName] = useState<string>('Acme Labs');
  const [industry, setIndustry] = useState<string>('Technology');
  const [targetAudience, setTargetAudience] = useState<string>('Small businesses');
  const [tone, setTone] = useState<string>('professional');
  const [keywordsInput, setKeywordsInput] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [query, setQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

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

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const handleCopy = async (slogan: string, index: number) => {
    await copyText(slogan);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  const filteredSlogans: string[] = useMemo(() => {
    const list = sloganData?.slogans || [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((s: string) => s.toLowerCase().includes(q));
  }, [sloganData, query]);

  const toggleFavorite = (slogan: string) => {
    setFavorites(prev => prev.includes(slogan) ? prev.filter(s => s !== slogan) : [...prev, slogan]);
  };

  const exportCSV = () => {
    const rows = [['Slogan']].concat(filteredSlogans.map(s => [s]));
    const csv = rows.map(r => r.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slogans-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyAll = async () => {
    await copyText(filteredSlogans.join('\n'));
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Slogan Creator - Tiktalkhub',
    url: window.location.origin + '/tools/smartbiz/slogan-creator',
    applicationCategory: 'BusinessApplication',
    offers: { '@type': 'Offer', price: '0.00', priceCurrency: 'USD' },
    operatingSystem: 'Any',
    description: 'Generate memorable slogans tailored to your brand voice and audience, with favorites and export.'
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Slogan Creator | Tiktalkhub"
        description="Generate 15+ memorable slogans tailored to your brand voice and audience. Save favorites, filter, and export to CSV."
        keywords={["slogan generator","tagline creator","brand slogans","smartbiz tools"]}
        canonical="/tools/smartbiz/slogan-creator"
        openGraph={{ title: 'Slogan Creator | Tiktalkhub', description: 'Create catchy taglines with AI-assisted suggestions', type: 'website', url: window.location.href }}
        twitter={{ card: 'summary_large_image', title: 'Slogan Creator | Tiktalkhub', description: 'Create catchy taglines with AI-assisted suggestions' }}
        jsonLd={jsonLd}
      />

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

              <div className="flex flex-col md:flex-row md:items-end gap-3">
                <div className="flex-1">
                  <Label htmlFor="filter">Filter results</Label>
                  <Input id="filter" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type to filter results..." />
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
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="tiktok-card">
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <CardTitle>Results</CardTitle>
                    <CardDescription>
                      {isPending ? 'Generating suggestions…' : sloganData?.slogans ? `Found ${filteredSlogans.length} suggestions` : 'Run the generator to see slogans'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={copyAll} disabled={!filteredSlogans?.length}>
                      <CopyPlus className="mr-2 h-4 w-4" /> Copy All
                    </Button>
                    <Button size="sm" variant="outline" onClick={exportCSV} disabled={!filteredSlogans?.length}>
                      <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {filteredSlogans?.map((slogan: string, idx: number) => (
                      <div key={`${slogan}-${idx}`} className="flex items-center justify-between rounded-md border p-3">
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => toggleFavorite(slogan)} aria-label="Toggle favorite">
                            <Star className={`h-4 w-4 ${favorites.includes(slogan) ? 'text-yellow-500 fill-yellow-400' : ''}`} />
                          </Button>
                          <span className="font-medium">{slogan}</span>
                        </div>
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

              {favorites.length > 0 && (
                <Card className="tiktok-card">
                  <CardHeader>
                    <CardTitle>Favorites</CardTitle>
                    <CardDescription>Your saved slogans</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {favorites.map((s, idx) => (
                        <div key={`fav-${s}-${idx}`} className="flex items-center justify-between rounded-md border p-3">
                          <span className="font-medium">{s}</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => copyText(s)}>
                              <Copy className="mr-1 h-4 w-4" /> Copy
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => toggleFavorite(s)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="tiktok-card">
                <CardHeader>
                  <CardTitle>How to Use This Tool</CardTitle>
                  <CardDescription>Best practices and FAQs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Tips</p>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      <li>Keep slogans concise and benefit-driven.</li>
                      <li>Test different tones for audience fit.</li>
                      <li>Use the filter to shortlist by themes/keywords.</li>
                      <li>Save favorites and export for team reviews.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">FAQs</p>
                    <p className="mt-2"><span className="text-foreground">How many slogans are generated?</span> Typically 15 per run.</p>
                    <p className="mt-2"><span className="text-foreground">Can I use them commercially?</span> Verify originality and trademarks before use.</p>
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