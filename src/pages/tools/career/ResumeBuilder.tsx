import React, { useEffect, useMemo, useState } from 'react';
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
import { Download, Sparkles, Loader2, FileText, Plus, Trash2, Star, ClipboardCopy } from 'lucide-react';

interface ExperienceItem { company: string; position: string; start: string; end: string; description: string; }
interface EducationItem { school: string; degree: string; year: string; }

const DRAFT_KEY = 'tth_resume_builder_draft';

const ResumeBuilder: React.FC = () => {
  const [personalInfo, setPersonalInfo] = useState<any>({ name: 'Alex Carter', email: 'alex@example.com', phone: '(555) 555-5555', location: 'NY, USA' });
  const [experience, setExperience] = useState<ExperienceItem[]>([
    { company: 'Acme Inc.', position: 'Software Engineer', start: '2021', end: 'Present', description: 'Built features and improved performance.' }
  ]);
  const [education, setEducation] = useState<EducationItem[]>([{ school: 'Tech University', degree: 'B.Sc. Computer Science', year: '2020' }]);
  const [skills, setSkills] = useState<string[]>(['JavaScript', 'React', 'Node.js']);
  const [template, setTemplate] = useState<string>('modern');
  const [jobKeywords, setJobKeywords] = useState<string>('React, Node.js, TypeScript, API');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        setPersonalInfo(draft.personalInfo || personalInfo);
        setExperience(draft.experience || experience);
        setEducation(draft.education || education);
        setSkills(draft.skills || skills);
        setTemplate(draft.template || template);
        setJobKeywords(draft.jobKeywords || jobKeywords);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ personalInfo, experience, education, skills, template, jobKeywords }));
    } catch {}
  }, [personalInfo, experience, education, skills, template, jobKeywords]);

  const { data: blogData } = useQuery({
    queryKey: ['career-blogs'],
    queryFn: async () => (await api.getBlogPosts({ category: 'career', limit: 6 })).data
  });

  const { mutate, data: result, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.buildResume({ personalInfo, experience, education, skills, template });
      return res.data;
    }
  });

  const keywordSet = useMemo(() => new Set(jobKeywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean)), [jobKeywords]);

  const atsScore = useMemo(() => {
    // simple ATS score heuristic: keyword match, length, and section presence
    let score = 50;
    const allText = [personalInfo?.name, ...experience.map(e => e.description), skills.join(', ')].join(' ').toLowerCase();
    let hits = 0;
    keywordSet.forEach(k => { if (k && allText.includes(k)) hits += 1; });
    score += Math.min(30, hits * 5);
    if (experience.length >= 2) score += 5;
    if (education.length >= 1) score += 5;
    if (skills.length >= 6) score += 5;
    return Math.min(100, score);
  }, [personalInfo, experience, education, skills, keywordSet]);

  const addExperience = () => setExperience(prev => [...prev, { company: '', position: '', start: '', end: '', description: '' }]);
  const deleteExperience = (idx: number) => setExperience(prev => prev.filter((_, i) => i !== idx));
  const updateExperience = (idx: number, field: keyof ExperienceItem, value: string) => setExperience(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));

  const addEducation = () => setEducation(prev => [...prev, { school: '', degree: '', year: '' }]);
  const deleteEducation = (idx: number) => setEducation(prev => prev.filter((_, i) => i !== idx));
  const updateEducation = (idx: number, field: keyof EducationItem, value: string) => setEducation(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));

  const copySummary = async () => {
    const summary = result?.resume?.professionalSummary || '';
    if (summary) await navigator.clipboard.writeText(summary);
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Resume Builder - Tiktalkhub',
    url: window.location.origin + '/tools/career/resume-builder',
    applicationCategory: 'BusinessApplication',
    offers: { '@type': 'Offer', price: '0.00', priceCurrency: 'USD' },
    operatingSystem: 'Any',
    description: 'Build ATS-friendly resumes with AI suggestions, keyword targeting, and export.'
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Resume Builder | Tiktalkhub"
        description="Build ATS-friendly resumes with AI suggestions, templates, keyword targeting, and export."
        keywords={["resume builder","ATS score","FlowCV alternative","Novoresume alternative"]}
        canonical="/tools/career/resume-builder"
        openGraph={{ title: 'Resume Builder | Tiktalkhub', description: 'Build ATS-friendly resumes with AI suggestions', type: 'website', url: window.location.href }}
        twitter={{ card: 'summary_large_image', title: 'Resume Builder | Tiktalkhub', description: 'Build ATS-friendly resumes with AI suggestions' }}
        jsonLd={jsonLd}
      />

      <Header />

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-gold/20 text-primary border-primary/30">
              <FileText className="w-4 h-4 mr-2" />
              Career • Resume Builder
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground via-primary to-gold-bright bg-clip-text text-transparent">
                Build an ATS-Friendly Resume
              </span>
            </h1>
            <p className="text-muted-foreground">
              Optimize for keywords, highlight achievements, and export. Make it better than FlowCV and Novorésumé.
            </p>
          </div>

          <Card className="tiktok-card mb-10">
            <CardHeader>
              <CardTitle>Resume Details</CardTitle>
              <CardDescription>Fill out the sections and generate suggestions</CardDescription>
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
                  <Label>Phone</Label>
                  <Input value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={personalInfo.location} onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })} />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Experience</Label>
                {experience.map((exp, idx) => (
                  <div key={idx} className="rounded-md border p-3 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input placeholder="Company" value={exp.company} onChange={e => updateExperience(idx, 'company', e.target.value)} />
                      <Input placeholder="Position" value={exp.position} onChange={e => updateExperience(idx, 'position', e.target.value)} />
                      <Input placeholder="Start" value={exp.start} onChange={e => updateExperience(idx, 'start', e.target.value)} />
                      <Input placeholder="End" value={exp.end} onChange={e => updateExperience(idx, 'end', e.target.value)} />
                      <Textarea placeholder="Description (use action verbs and metrics)" value={exp.description} onChange={e => updateExperience(idx, 'description', e.target.value)} />
                    </div>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => deleteExperience(idx)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addExperience}><Plus className="h-4 w-4 mr-1" /> Add Experience</Button>
              </div>

              <div className="space-y-3">
                <Label>Education</Label>
                {education.map((ed, idx) => (
                  <div key={idx} className="rounded-md border p-3 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input placeholder="School" value={ed.school} onChange={e => updateEducation(idx, 'school', e.target.value)} />
                      <Input placeholder="Degree" value={ed.degree} onChange={e => updateEducation(idx, 'degree', e.target.value)} />
                      <Input placeholder="Year" value={ed.year} onChange={e => updateEducation(idx, 'year', e.target.value)} />
                    </div>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => deleteEducation(idx)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addEducation}><Plus className="h-4 w-4 mr-1" /> Add Education</Button>
              </div>

              <div className="space-y-2">
                <Label>Skills (comma-separated)</Label>
                <Input value={skills.join(', ')} onChange={(e) => setSkills(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Target Job Keywords (comma-separated)</Label>
                  <Input value={jobKeywords} onChange={(e) => setJobKeywords(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Template</Label>
                  <select className="input border rounded-md p-2 w-full" value={template} onChange={(e) => setTemplate(e.target.value)}>
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="creative">Creative</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <Button onClick={() => mutate()} disabled={isPending} className="btn-gold">
                  {isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating</>) : (<><Sparkles className="mr-2 h-4 w-4" /> Generate Summary & Suggestions</>)}
                </Button>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" /> ATS Score: <span className="font-semibold text-foreground">{atsScore}</span>/100
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {result?.resume && (
                <Card className="tiktok-card">
                  <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <CardTitle>Professional Summary</CardTitle>
                      <CardDescription>Use this in your resume and LinkedIn</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={copySummary}><ClipboardCopy className="h-4 w-4 mr-2" /> Copy</Button>
                      <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-2" /> Export PDF</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                      {result.resume.professionalSummary}
                    </div>
                  </CardContent>
                </Card>
              )}

              {result?.resume?.experience && (
                <Card className="tiktok-card">
                  <CardHeader>
                    <CardTitle>Experience (AI-polished bullets)</CardTitle>
                    <CardDescription>Action verbs and quantified achievements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.resume.experience.map((e: any, idx: number) => (
                      <div key={idx} className="rounded-md border p-3">
                        <div className="font-semibold">{e.position} — {e.company}</div>
                        <div className="text-xs text-muted-foreground">{e.start} - {e.end}</div>
                        <div className="mt-2">
                          <div className="text-sm"><span className="font-medium">Improved:</span> {e.enhancedDescription}</div>
                          <div className="text-xs text-muted-foreground">Original: {e.originalDescription}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
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
        </div>
      </section>

      <Footer />
      <TikoAI />
    </div>
  );
};

export default ResumeBuilder;