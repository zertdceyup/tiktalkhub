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
import { Palette, Loader2, Sparkles, PenTool } from 'lucide-react';
import SEO from '@/components/SEO';

const LogoSketchWizard: React.FC = () => {
  const [businessName, setBusinessName] = useState<string>('Acme Labs');
  const [industry, setIndustry] = useState<string>('Technology');
  const [style, setStyle] = useState<string>('modern');
  const [colorsInput, setColorsInput] = useState<string>('');
  const [symbolsInput, setSymbolsInput] = useState<string>('');

  const colors = useMemo(() => colorsInput.split(',').map(c => c.trim()).filter(Boolean), [colorsInput]);
  const symbols = useMemo(() => symbolsInput.split(',').map(s => s.trim()).filter(Boolean), [symbolsInput]);

  const { data: blogData } = useQuery({
    queryKey: ['smartbiz-blogs'],
    queryFn: async () => (await api.getBlogPosts({ category: 'smartbiz', limit: 6 })).data
  });

  const { mutate, data: result, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.generateLogoConcepts({ businessName, industry, style, colors, symbols });
      return res.data;
    }
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Logo Sketch Wizard - Tiktalkhub',
    url: window.location.origin + '/tools/smartbiz/logo-sketch-wizard',
    applicationCategory: 'DesignApplication',
    offers: { '@type': 'Offer', price: '0.00', priceCurrency: 'USD' },
    operatingSystem: 'Any',
    description: 'Generate logo concepts and design suggestions tailored to your brand.'
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Logo Sketch Wizard | Tiktalkhub"
        description="Generate logo concepts and design suggestions tailored to your brand. Choose style, colors, and symbols."
        keywords={["logo generator","logo concepts","brand design","smartbiz tools"]}
        canonical="/tools/smartbiz/logo-sketch-wizard"
        openGraph={{ title: 'Logo Sketch Wizard | Tiktalkhub', description: 'Generate logo concepts and design suggestions', type: 'website', url: window.location.href }}
        twitter={{ card: 'summary_large_image', title: 'Logo Sketch Wizard | Tiktalkhub', description: 'Generate logo concepts and design suggestions' }}
        jsonLd={jsonLd}
      />

      <Header />

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-gold/20 text-primary border-primary/30">
              <PenTool className="w-4 h-4 mr-2" />
              SmartBiz • Logo Sketch Wizard
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground via-primary to-gold-bright bg-clip-text text-transparent">
                Design AI-Assisted Logo Concepts
              </span>
            </h1>
            <p className="text-muted-foreground">
              Generate concept directions, color palettes, and typography suggestions based on your brand.
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
                  <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="vintage">Vintage</SelectItem>
                      <SelectItem value="playful">Playful</SelectItem>
                      <SelectItem value="elegant">Elegant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Colors (comma-separated)</Label>
                  <Textarea value={colorsInput} onChange={(e) => setColorsInput(e.target.value)} rows={3} placeholder="#2563eb, #f59e0b" />
                </div>
                <div className="space-y-2">
                  <Label>Symbols/Icons (comma-separated)</Label>
                  <Textarea value={symbolsInput} onChange={(e) => setSymbolsInput(e.target.value)} rows={3} placeholder="circle, triangle, star" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => mutate()} disabled={isPending} className="btn-gold">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Generate Concepts
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {result?.logoConcepts && (
                <Card className="tiktok-card">
                  <CardHeader>
                    <CardTitle>Concepts</CardTitle>
                    <CardDescription>Style directions and design suggestions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {result.logoConcepts.map((concept: any) => (
                        <div key={concept.id} className="rounded-md border p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4 text-primary" />
                            <p className="font-semibold capitalize">{concept.type.replace('-', ' ')}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{concept.description}</p>
                          <div className="text-sm">
                            {concept.suggestions.fonts && (
                              <p><span className="font-medium">Fonts:</span> {concept.suggestions.fonts.join(', ')}</p>
                            )}
                            {concept.suggestions.colors && (
                              <p><span className="font-medium">Colors:</span> {concept.suggestions.colors.join(', ')}</p>
                            )}
                            {concept.suggestions.icons && (
                              <p><span className="font-medium">Icons:</span> {concept.suggestions.icons.join(', ')}</p>
                            )}
                            {concept.suggestions.layout && (
                              <p><span className="font-medium">Layout:</span> {concept.suggestions.layout}</p>
                            )}
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
                  <CardTitle>SmartBiz Insights</CardTitle>
                  <CardDescription>Hand-picked reads for entrepreneurs</CardDescription>
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
                      <p className="text-sm text-muted-foreground">No posts yet. Add SmartBiz posts from the admin dashboard.</p>
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

export default LogoSketchWizard;