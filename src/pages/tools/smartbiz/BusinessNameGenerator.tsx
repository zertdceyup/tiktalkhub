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
import api, { getErrorMessage } from '@/lib/api';
import { Copy, Loader2, RefreshCw, Sparkles, Check, Building2, Star, Download, CopyPlus } from 'lucide-react';
import SEO from '@/components/SEO';

const defaultKeywords = ['Tech', 'Digital', 'Pro', 'Studio', 'Cloud', 'Creative'];

const FAVORITES_KEY = 'tth_business_name_favorites';

const BusinessNameGenerator: React.FC = () => {
  const [industry, setIndustry] = useState<string>('Technology');
  const [keywordsInput, setKeywordsInput] = useState<string>('');
  const [style, setStyle] = useState<string>('modern');
  const [lengthPref, setLengthPref] = useState<string>('medium');
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

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const handleCopy = async (name: string, index: number) => {
    await copyText(name);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  const filteredNames: string[] = useMemo(() => {
    const list = namesData?.businessNames || [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((n: string) => n.toLowerCase().includes(q));
  }, [namesData, query]);

  const toggleFavorite = (name: string) => {
    setFavorites(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const exportCSV = () => {
    const rows = [['Name']].concat(filteredNames.map(n => [n]));
    const csv = rows.map(r => r.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-names-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyAll = async () => {
    await copyText(filteredNames.join('\n'));
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Business Name Generator - Tiktalkhub',
    url: window.location.origin + '/tools/smartbiz/business-name-generator',
    applicationCategory: 'BusinessApplication',
    offers: { '@type': 'Offer', price: '0.00', priceCurrency: 'USD' },
    operatingSystem: 'Any',
    description: 'Generate memorable business names with AI, filter, export, and save favorites.'
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Business Name Generator | Tiktalkhub"
        description="Generate 20+ brandable business name ideas tailored to your industry, style, and length preference. Save favorites and export to CSV."
        keywords={["business name generator","brand name ideas","startup names","smartbiz tools"]}
        canonical="/tools/smartbiz/business-name-generator"
        openGraph={{ title: 'Business Name Generator | Tiktalkhub', description: 'Generate brandable business names with AI', type: 'website', url: window.location.href }}
        twitter={{ card: 'summary_large_image', title: 'Business Name Generator | Tiktalkhub', description: 'Generate brandable business names with AI' }}
        jsonLd={jsonLd}
      />

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
                        <Sparkles className="mr-2 h-4 w-4" /> Generate Names
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
                      {isPending ? 'Generating suggestions…' : namesData?.businessNames ? `Found ${filteredNames.length} suggestions` : 'Run the generator to see names'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={copyAll} disabled={!filteredNames?.length}>
                      <CopyPlus className="mr-2 h-4 w-4" /> Copy All
                    </Button>
                    <Button size="sm" variant="outline" onClick={exportCSV} disabled={!filteredNames?.length}>
                      <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {filteredNames?.map((name: string, idx: number) => (
                      <div key={`${name}-${idx}`} className="flex items-center justify-between rounded-md border p-3">
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => toggleFavorite(name)} aria-label="Toggle favorite">
                            <Star className={`h-4 w-4 ${favorites.includes(name) ? 'text-yellow-500 fill-yellow-400' : ''}`} />
                          </Button>
                          <span className="font-medium">{name}</span>
                        </div>
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

              {favorites.length > 0 && (
                <Card className="tiktok-card">
                  <CardHeader>
                    <CardTitle>Favorites</CardTitle>
                    <CardDescription>Your saved names</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {favorites.map((name, idx) => (
                        <div key={`fav-${name}-${idx}`} className="flex items-center justify-between rounded-md border p-3">
                          <span className="font-medium">{name}</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => copyText(name)}>
                              <Copy className="mr-1 h-4 w-4" /> Copy
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => toggleFavorite(name)}>
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
                      <li>Try multiple styles to broaden name variety.</li>
                      <li>Keep keywords short and evocative.</li>
                      <li>Use the filter to shortlist based on themes.</li>
                      <li>Save favorites and export the list for stakeholders.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">FAQs</p>
                    <p className="mt-2"><span className="text-foreground">How many names are generated?</span> Typically 20 per run. Use multiple runs for more variety.</p>
                    <p className="mt-2"><span className="text-foreground">Are these names unique?</span> They are generated suggestions. Verify brand and domain availability before use.</p>
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