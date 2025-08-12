import React, { useState } from 'react';
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
import { FileText, Loader2, Sparkles } from 'lucide-react';
import SEO from '@/components/SEO';

const SmartFlyerDesigner: React.FC = () => {
  const [title, setTitle] = useState<string>('Grand Opening');
  const [description, setDescription] = useState<string>('Join us for our grand opening event!');
  const [phone, setPhone] = useState<string>('(555) 555-5555');
  const [email, setEmail] = useState<string>('hello@example.com');
  const [template, setTemplate] = useState<string>('business');
  const [primary, setPrimary] = useState<string>('');
  const [secondary, setSecondary] = useState<string>('');
  const [accent, setAccent] = useState<string>('');
  const [background, setBackground] = useState<string>('');

  const { data: blogData } = useQuery({
    queryKey: ['smartbiz-blogs'],
    queryFn: async () => (await api.getBlogPosts({ category: 'smartbiz', limit: 6 })).data
  });

  const { mutate, data: result, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.request('/tools/smartbiz/smart-flyer-designer', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          contactInfo: { phone, email },
          template,
          colors: { primary, secondary, accent, background }
        })
      } as any);
      return (res as any).data;
    }
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Smart Flyer Designer - Tiktalkhub',
    url: window.location.origin + '/tools/smartbiz/smart-flyer-designer',
    applicationCategory: 'DesignApplication',
    offers: { '@type': 'Offer', price: '0.00', priceCurrency: 'USD' },
    operatingSystem: 'Any',
    description: 'Generate flyer layouts with AI suggestions, color schemes, and content placement.'
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Smart Flyer Designer | Tiktalkhub"
        description="Generate flyer layouts with AI suggestions, color schemes, and content placement."
        keywords={["flyer designer","template manager","marketing materials","smartbiz tools"]}
        canonical="/tools/smartbiz/smart-flyer-designer"
        openGraph={{ title: 'Smart Flyer Designer | Tiktalkhub', description: 'Generate flyer layouts with AI suggestions', type: 'website', url: window.location.href }}
        twitter={{ card: 'summary_large_image', title: 'Smart Flyer Designer | Tiktalkhub', description: 'Generate flyer layouts with AI suggestions' }}
        jsonLd={jsonLd}
      />

      <Header />

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-gold/20 text-primary border-primary/30">
              <FileText className="w-4 h-4 mr-2" />
              SmartBiz • Smart Flyer Designer
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground via-primary to-gold-bright bg-clip-text text-transparent">
                Create Polished Flyers in Minutes
              </span>
            </h1>
            <p className="text-muted-foreground">
              Enter your content and preferences to get a tailored layout with color scheme suggestions.
            </p>
          </div>

          <Card className="tiktok-card mb-10">
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
              <CardDescription>Describe your flyer and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <Input value={primary} onChange={(e) => setPrimary(e.target.value)} placeholder="#3b82f6" />
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <Input value={secondary} onChange={(e) => setSecondary(e.target.value)} placeholder="#e5e7eb" />
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <Input value={accent} onChange={(e) => setAccent(e.target.value)} placeholder="#f59e0b" />
                </div>
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <Input value={background} onChange={(e) => setBackground(e.target.value)} placeholder="#ffffff" />
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
                      <Sparkles className="mr-2 h-4 w-4" /> Generate Layout
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {result?.flyerDesign && (
                <Card className="tiktok-card">
                  <CardHeader>
                    <CardTitle>Suggested Layout</CardTitle>
                    <CardDescription>Header, body, and footer structure</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <p className="font-medium">Header</p>
                      <pre className="glass p-3 rounded-md overflow-auto">{JSON.stringify(result.flyerDesign.layout.header, null, 2)}</pre>
                    </div>
                    <div>
                      <p className="font-medium">Body</p>
                      <pre className="glass p-3 rounded-md overflow-auto">{JSON.stringify(result.flyerDesign.layout.body, null, 2)}</pre>
                    </div>
                    <div>
                      <p className="font-medium">Footer</p>
                      <pre className="glass p-3 rounded-md overflow-auto">{JSON.stringify(result.flyerDesign.layout.footer, null, 2)}</pre>
                    </div>
                    <div>
                      <p className="font-medium">Color Scheme</p>
                      <pre className="glass p-3 rounded-md overflow-auto">{JSON.stringify(result.flyerDesign.colorScheme, null, 2)}</pre>
                    </div>
                    <div>
                      <p className="font-medium">Suggestions</p>
                      <ul className="list-disc pl-5 mt-2">
                        {result.flyerDesign.suggestions.map((s: string) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
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

export default SmartFlyerDesigner;