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
import { useMutation, useQuery } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import { FileText, Lightbulb, Rocket, Download } from 'lucide-react';
import SEO from '@/components/SEO';

const BusinessPlanGenerator: React.FC = () => {
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [tone, setTone] = useState<'professional'|'friendly'|'concise'|'visionary'>('professional');
  const [length, setLength] = useState<'short'|'medium'|'long'>('medium');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [revenueStreams, setRevenueStreams] = useState<string>('');
  const [channels, setChannels] = useState<string>('');
  const [costStructure, setCostStructure] = useState<string>('');
  const [plan, setPlan] = useState<any | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const { data: blogData } = useQuery({
    queryKey: ['smartbiz-blogs-plan'],
    queryFn: async () => (await api.getBlogPosts({ category: 'smartbiz', limit: 6 })).data,
  });

  const { mutate: generatePlan, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.generateBusinessPlan({
        businessName,
        industry,
        targetMarket,
        tone,
        length,
        problem,
        solution,
        revenueStreams: revenueStreams.split(',').map(s => s.trim()).filter(Boolean),
        channels: channels.split(',').map(s => s.trim()).filter(Boolean),
        costStructure: costStructure.split(',').map(s => s.trim()).filter(Boolean),
        generatePDF: false,
      });
      return res.data as any;
    },
    onSuccess: (data: any) => {
      setPlan(data.plan);
      setPdfUrl(null);
    },
    onError: (err) => alert(getErrorMessage(err))
  });

  const { mutate: generatePDF, isPending: pdfPending } = useMutation({
    mutationFn: async () => {
      const res = await api.generateBusinessPlan({
        businessName,
        industry,
        targetMarket,
        tone,
        length,
        problem,
        solution,
        revenueStreams: revenueStreams.split(',').map(s => s.trim()).filter(Boolean),
        channels: channels.split(',').map(s => s.trim()).filter(Boolean),
        costStructure: costStructure.split(',').map(s => s.trim()).filter(Boolean),
        generatePDF: true,
      });
      return res.data as any;
    },
    onSuccess: (data: any) => {
      setPlan(data.plan);
      if (data.pdfUrl) setPdfUrl(data.pdfUrl);
    },
    onError: (err) => alert(getErrorMessage(err))
  });

  const sectionOrder = useMemo(() => [
    'Executive Summary','Company Overview','Market Analysis','Products & Services','Marketing & Sales Strategy','Operations Plan','Team','Financial Plan','SWOT','Milestones & KPIs'
  ], []);

  const exportMarkdown = () => {
    if (!plan) return;
    const lines: string[] = [`# ${plan.title || 'Business Plan'}`];
    sectionOrder.forEach((key) => {
      if (plan.sections?.[key]) {
        lines.push(`\n## ${key}\n`);
        lines.push(String(plan.sections[key]).trim());
      }
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(businessName || 'business-plan').toLowerCase().replace(/[^a-z0-9]+/g,'-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Business Plan Generator | SmartBiz | Tiktalkhub"
        description="Generate a complete, professional business plan with market analysis, financials, SWOT, and milestones. Free and AI-assisted."
        keywords={["business plan generator","free business plan","startup plan","SWOT","financial plan","go-to-market"]}
        canonical="/tools/smartbiz/business-plan-generator"
        openGraph={{ title: 'Business Plan Generator | Tiktalkhub', description: 'Generate professional business plans with AI assistance', type: 'website', url: typeof window !== 'undefined' ? window.location.href : '' }}
        twitter={{ card: 'summary_large_image', title: 'Business Plan Generator | Tiktalkhub', description: 'Generate professional business plans with AI assistance' }}
        jsonLd={{ '@context':'https://schema.org', '@type':'WebApplication', name:'Business Plan Generator - Tiktalkhub', applicationCategory:'BusinessApplication', operatingSystem:'Any' }}
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="tiktok-card">
                <CardHeader>
                  <CardTitle>Business Plan Generator</CardTitle>
                  <CardDescription>Describe your business and get a complete plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Business Name</Label>
                      <Input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g., Nova Studio" />
                    </div>
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g., Design, SaaS, Retail" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Target Market</Label>
                      <Input value={targetMarket} onChange={e => setTargetMarket(e.target.value)} placeholder="e.g., SMBs in North America" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tone</Label>
                      <select className="w-full h-10 rounded-md border bg-background px-3" value={tone} onChange={e => setTone(e.target.value as any)}>
                        <option value="professional">Professional</option>
                        <option value="friendly">Friendly</option>
                        <option value="concise">Concise</option>
                        <option value="visionary">Visionary</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Length</Label>
                      <select className="w-full h-10 rounded-md border bg-background px-3" value={length} onChange={e => setLength(e.target.value as any)}>
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                        <option value="long">Long</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Problem (optional)</Label>
                      <Textarea rows={3} value={problem} onChange={e => setProblem(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Solution (optional)</Label>
                      <Textarea rows={3} value={solution} onChange={e => setSolution(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Revenue Streams (comma-separated)</Label>
                      <Input value={revenueStreams} onChange={e => setRevenueStreams(e.target.value)} placeholder="e.g., subscription, services, ads" />
                    </div>
                    <div className="space-y-2">
                      <Label>Channels (comma-separated)</Label>
                      <Input value={channels} onChange={e => setChannels(e.target.value)} placeholder="e.g., content, partnerships, outbound" />
                    </div>
                    <div className="space-y-2">
                      <Label>Cost Structure (comma-separated)</Label>
                      <Input value={costStructure} onChange={e => setCostStructure(e.target.value)} placeholder="e.g., payroll, hosting, ads" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="btn-gold" onClick={() => generatePlan()} disabled={isPending}>
                      <Rocket className="w-4 h-4 mr-2" /> Generate Plan
                    </Button>
                    <Button variant="outline" onClick={() => generatePDF()} disabled={pdfPending}>
                      <Download className="w-4 h-4 mr-2" /> Download PDF
                    </Button>
                    <Button variant="outline" onClick={exportMarkdown} disabled={!plan}>
                      <FileText className="w-4 h-4 mr-2" /> Export Markdown
                    </Button>
                  </div>

                  {pdfUrl && (
                    <a href={pdfUrl} target="_blank" rel="noreferrer" className="block text-sm text-primary mt-2">Download latest PDF</a>
                  )}
                </CardContent>
              </Card>

              <Card className="tiktok-card">
                <CardHeader>
                  <CardTitle>Plan Preview</CardTitle>
                  <CardDescription>Review and refine your plan</CardDescription>
                </CardHeader>
                <CardContent>
                  {!plan && (
                    <div className="text-sm text-muted-foreground">No plan yet. Generate one to preview.</div>
                  )}
                  {plan && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">{plan.title}</h2>
                      {sectionOrder.map((title) => (
                        plan.sections?.[title] ? (
                          <div key={title} className="space-y-2">
                            <h3 className="font-semibold">{title}</h3>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">{plan.sections[title]}</p>
                          </div>
                        ) : null
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="tiktok-card">
                <CardHeader>
                  <CardTitle>SmartBiz Insights</CardTitle>
                  <CardDescription>Curated posts for planning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {blogData?.posts?.slice(0, 6).map((post: any) => (
                      <div key={post.id} className="group cursor-pointer">
                        <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">{post.title}</h4>
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

export default BusinessPlanGenerator;