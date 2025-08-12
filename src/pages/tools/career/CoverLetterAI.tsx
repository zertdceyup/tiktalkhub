import React, { useState } from 'react';
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
import { Download, Sparkles, Loader2, FileText, ClipboardCopy } from 'lucide-react';

const CoverLetterAI: React.FC = () => {
  const [personalInfo, setPersonalInfo] = useState<any>({ name: 'Alex Carter', email: 'alex@example.com' });
  const [jobTitle, setJobTitle] = useState<string>('Frontend Engineer');
  const [companyName, setCompanyName] = useState<string>('TechCorp');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [tone, setTone] = useState<string>('professional');

  const { data: blogData } = useQuery({ queryKey: ['career-blogs'], queryFn: async () => (await api.getBlogPosts({ category: 'career', limit: 6 })).data });

  const { mutate, data: result, isPending } = useMutation({
    mutationFn: async () => (await api.generateCoverLetter({ personalInfo, jobTitle, companyName, jobDescription, tone })).data
  });

  const copyLetter = async () => { if (result?.coverLetter) await navigator.clipboard.writeText(result.coverLetter); };

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Cover Letter AI - Tiktalkhub',
    url: window.location.origin + '/tools/career/cover-letter-ai', applicationCategory: 'BusinessApplication',
    offers: { '@type': 'Offer', price: '0.00', priceCurrency: 'USD' }, operatingSystem: 'Any',
    description: 'Generate tailored cover letters with tone control and export.'
  };

  return (
    <div className="min-h-screen">
      <SEO title="Cover Letter AI | Tiktalkhub" description="Generate tailored cover letters with tone control, job-specific hooks, and export."
        keywords={["cover letter generator","job application letter","FlowCV cover letter"]}
        canonical="/tools/career/cover-letter-ai"
        openGraph={{ title: 'Cover Letter AI | Tiktalkhub', description: 'Generate tailored cover letters', type: 'website', url: window.location.href }}
        twitter={{ card: 'summary_large_image', title: 'Cover Letter AI | Tiktalkhub', description: 'Generate tailored cover letters' }}
        jsonLd={jsonLd}
      />
      <Header />
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-gold/20 text-primary border-primary/30">
              <FileText className="w-4 h-4 mr-2" /> Career • Cover Letter AI
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground via-primary to-gold-bright bg-clip-text text-transparent">Write a Tailored Cover Letter</span>
            </h1>
            <p className="text-muted-foreground">Tone variants, company hooks, and job description alignment.</p>
          </div>

          <Card className="tiktok-card mb-10">
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
              <CardDescription>We’ll personalize your letter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={personalInfo.name} onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={personalInfo.email} onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Job Description (optional)</Label>
                  <Textarea rows={5} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description for better alignment" />
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <select className="input border rounded-md p-2 w-full" value={tone} onChange={(e) => setTone(e.target.value)}>
                    <option value="professional">Professional</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="confident">Confident</option>
                    <option value="friendly">Friendly</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => mutate()} disabled={isPending} className="btn-gold">
                  {isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating</>) : (<><Sparkles className="mr-2 h-4 w-4" /> Generate Letter</>)}
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
                      <CardTitle>Cover Letter</CardTitle>
                      <CardDescription>Tailored content with suggested improvements</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={async () => copyLetter()}><ClipboardCopy className="h-4 w-4 mr-2" /> Copy</Button>
                      <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-2" /> Export PDF</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                      {result.coverLetter}
                    </div>
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

export default CoverLetterAI;