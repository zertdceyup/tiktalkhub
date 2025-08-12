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
import { Sparkles, Loader2, Linkedin, ClipboardCopy } from 'lucide-react';

const LinkedInSummary: React.FC = () => {
  const [personalInfo, setPersonalInfo] = useState<any>({ name: 'Alex Carter' });
  const [currentRole, setCurrentRole] = useState<string>('Software Engineer');
  const [industry, setIndustry] = useState<string>('Technology');
  const [skills, setSkills] = useState<string>('React, TypeScript, Node.js');
  const [goals, setGoals] = useState<string>('Grow into a staff engineer role and lead impactful projects');
  const [tone, setTone] = useState<string>('professional');

  const { data: blogData } = useQuery({ queryKey: ['career-blogs'], queryFn: async () => (await api.getBlogPosts({ category: 'career', limit: 6 })).data });

  const { mutate, data: result, isPending } = useMutation({
    mutationFn: async () => (await api.generateLinkedInSummary({ personalInfo, currentRole, industry, experience: [], skills: skills.split(',').map(s => s.trim()).filter(Boolean), goals, tone })).data
  });

  const keywordStats = useMemo(() => {
    const text = (result?.linkedinSummary || '').toLowerCase();
    const words = skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const counts: Record<string, number> = {};
    words.forEach(w => { counts[w] = (text.match(new RegExp(`\\b${w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g')) || []).length; });
    return counts;
  }, [result?.linkedinSummary, skills]);

  const copySummary = async () => { if (result?.linkedinSummary) await navigator.clipboard.writeText(result.linkedinSummary); };

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'WebApplication', name: 'LinkedIn Summary - Tiktalkhub',
    url: window.location.origin + '/tools/career/linkedin-summary', applicationCategory: 'BusinessApplication',
    offers: { '@type': 'Offer', price: '0.00', priceCurrency: 'USD' }, operatingSystem: 'Any',
    description: 'Create engaging LinkedIn summaries with persona presets and keyword optimization.'
  };

  return (
    <div className="min-h-screen">
      <SEO title="LinkedIn Summary | Tiktalkhub" description="Create engaging LinkedIn summaries and headlines with persona presets and keyword optimization."
        keywords={["linkedin summary","headline generator","profile optimization"]}
        canonical="/tools/career/linkedin-summary"
        openGraph={{ title: 'LinkedIn Summary | Tiktalkhub', description: 'Create engaging LinkedIn summaries', type: 'website', url: window.location.href }}
        twitter={{ card: 'summary_large_image', title: 'LinkedIn Summary | Tiktalkhub', description: 'Create engaging LinkedIn summaries' }}
        jsonLd={jsonLd}
      />
      <Header />
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-gold/20 text-primary border-primary/30">
              <Linkedin className="w-4 h-4 mr-2" /> Career • LinkedIn Summary
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground via-primary to-gold-bright bg-clip-text text-transparent">Polish Your LinkedIn Story</span>
            </h1>
            <p className="text-muted-foreground">Persona presets, keyword density meter, and headline suggestions.</p>
          </div>

          <Card className="tiktok-card mb-10">
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
              <CardDescription>We’ll craft your summary and headline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={personalInfo.name} onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Current Role</Label>
                  <Input value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input value={industry} onChange={(e) => setIndustry(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Key Skills (comma-separated)</Label>
                  <Input value={skills} onChange={(e) => setSkills(e.target.value)} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Goals (optional)</Label>
                  <Textarea rows={3} value={goals} onChange={(e) => setGoals(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <select className="input border rounded-md p-2 w-full" value={tone} onChange={(e) => setTone(e.target.value)}>
                    <option value="professional">Professional</option>
                    <option value="personal">Personal</option>
                    <option value="creative">Creative</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => mutate()} disabled={isPending} className="btn-gold">
                  {isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating</>) : (<><Sparkles className="mr-2 h-4 w-4" /> Generate Summary</>)}
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="tiktok-card">
                  <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <CardTitle>LinkedIn Summary</CardTitle>
                      <CardDescription>Copy ready content optimized for your tone</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={async () => copySummary()}><ClipboardCopy className="h-4 w-4 mr-2" /> Copy</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                      {result.linkedinSummary}
                    </div>
                  </CardContent>
                </Card>

                <Card className="tiktok-card">
                  <CardHeader>
                    <CardTitle>Keyword Density</CardTitle>
                    <CardDescription>Ensure important skills are included</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {Object.entries(keywordStats).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-muted-foreground">{k}</span>
                        <span className="font-medium text-foreground">{v}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="tiktok-card">
                  <CardHeader>
                    <CardTitle>Career Insights</CardTitle>
                    <CardDescription>Hand-picked reads for job seekers</CardDescription>
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
                        <p className="text-sm text-muted-foreground">No posts yet. Add Career posts from the admin dashboard.</p>
                      )}
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

export default LinkedInSummary;