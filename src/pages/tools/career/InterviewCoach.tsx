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
import { BrainCircuit, Loader2, Sparkles, Timer, ClipboardCopy, CheckCircle2, Star } from 'lucide-react';

const DRAFT_KEY = 'tth_interview_coach_session';

const InterviewCoach: React.FC = () => {
  const [jobTitle, setJobTitle] = useState<string>('Software Engineer');
  const [industry, setIndustry] = useState<string>('Technology');
  const [interviewType, setInterviewType] = useState<'behavioral' | 'technical' | 'case-study' | 'general'>('behavioral');
  const [difficulty, setDifficulty] = useState<'entry' | 'mid' | 'senior' | 'executive'>('mid');
  const [duration, setDuration] = useState<number>(90); // seconds per question
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [showStarGuide, setShowStarGuide] = useState<boolean>(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setNotes(s.notes || {});
        setRatings(s.ratings || {});
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ notes, ratings }));
    } catch {}
  }, [notes, ratings]);

  const { data: blogData } = useQuery({ queryKey: ['career-blogs'], queryFn: async () => (await api.getBlogPosts({ category: 'career', limit: 6 })).data });

  const { mutate, data: result, isPending } = useMutation({
    mutationFn: async () => (await api.interviewCoach({ jobTitle, industry, interviewType, difficulty })).data
  });

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration, activeIdx]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const questions: string[] = result?.questions || [];
  const tips: string[] = result?.tips || [];
  const checklist: string[] = result?.preparationChecklist || [];

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const nextQuestion = () => setActiveIdx((idx) => Math.min(idx + 1, Math.max(0, questions.length - 1)));
  const prevQuestion = () => setActiveIdx((idx) => Math.max(idx - 1, 0));

  const onRate = (idx: number, val: number) => setRatings((r) => ({ ...r, [idx]: val }));

  const starGuide = (
    <div className="text-sm text-muted-foreground space-y-1">
      <div><span className="font-medium text-foreground">S</span>ituation – Set the context</div>
      <div><span className="font-medium text-foreground">T</span>ask – Define your responsibility</div>
      <div><span className="font-medium text-foreground">A</span>ction – Describe what you did</div>
      <div><span className="font-medium text-foreground">R</span>esult – Quantify outcomes</div>
    </div>
  );

  const sessionSummary = useMemo(() => {
    const answered = Object.keys(notes).length;
    const avgRating = Object.values(ratings).length ? (Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length) : 0;
    return { answered, avgRating: Math.round(avgRating * 10) / 10 };
  }, [notes, ratings]);

  const copyChecklist = async () => { await navigator.clipboard.writeText(checklist.join('\n')); };

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Interview Coach - Tiktalkhub',
    url: window.location.origin + '/tools/career/interview-coach', applicationCategory: 'BusinessApplication',
    offers: { '@type': 'Offer', price: '0.00', priceCurrency: 'USD' }, operatingSystem: 'Any',
    description: 'Practice interview questions with a timer, STAR guide, notes, and progress tracking.'
  };

  return (
    <div className="min-h-screen">
      <SEO title="Interview Coach | Tiktalkhub" description="Practice interviews with a timer, STAR assistant, tips, and progress tracking."
        keywords={["interview coach","behavioral questions","STAR method","mock interview"]}
        canonical="/tools/career/interview-coach"
        openGraph={{ title: 'Interview Coach | Tiktalkhub', description: 'Practice interviews with a timer and coaching', type: 'website', url: window.location.href }}
        twitter={{ card: 'summary_large_image', title: 'Interview Coach | Tiktalkhub', description: 'Practice interviews with a timer and coaching' }}
        jsonLd={jsonLd}
      />

      <Header />
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-gold/20 text-primary border-primary/30">
              <BrainCircuit className="w-4 h-4 mr-2" /> Career • Interview Coach
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground via-primary to-gold-bright bg-clip-text text-transparent">Ace Your Interview Practice</span>
            </h1>
            <p className="text-muted-foreground">Timer, STAR framework, coaching tips, and progress tracking.</p>
          </div>

          <Card className="tiktok-card mb-10">
            <CardHeader>
              <CardTitle>Setup</CardTitle>
              <CardDescription>We’ll tailor the session to your role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input value={industry} onChange={(e) => setIndustry(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Interview Type</Label>
                  <select className="input border rounded-md p-2 w-full" value={interviewType} onChange={(e) => setInterviewType(e.target.value as any)}>
                    <option value="behavioral">Behavioral</option>
                    <option value="technical">Technical</option>
                    <option value="case-study">Case Study</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <select className="input border rounded-md p-2 w-full" value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
                    <option value="entry">Entry</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Seconds per Question</Label>
                  <Input type="number" min={30} max={600} value={duration} onChange={(e) => setDuration(parseInt(e.target.value || '60'))} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => mutate()} disabled={isPending} className="btn-gold">
                  {isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing</>) : (<><Sparkles className="mr-2 h-4 w-4" /> Start Session</>)}
                </Button>
              </div>
            </CardContent>
          </Card>

          {questions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="tiktok-card">
                  <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <CardTitle>Question {activeIdx + 1} of {questions.length}</CardTitle>
                      <CardDescription>{interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} • {difficulty.toUpperCase()}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Timer className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{formatTime(timeLeft)}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-md border p-4 text-foreground font-medium">
                      {questions[activeIdx]}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Your Answer Notes (private)</Label>
                        <Textarea rows={6} value={notes[activeIdx] || ''} onChange={(e) => setNotes((n) => ({ ...n, [activeIdx]: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>STAR Assistant</Label>
                          <Button variant="ghost" size="sm" onClick={() => setShowStarGuide(v => !v)}>
                            {showStarGuide ? 'Hide' : 'Show'}
                          </Button>
                        </div>
                        {showStarGuide && (
                          <div className="glass rounded-md p-3">
                            {starGuide}
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label>Self Rating</Label>
                          <div className="flex items-center gap-2">
                            {[1,2,3,4,5].map(v => (
                              <Button key={v} size="icon" variant={ratings[activeIdx] === v ? 'default' : 'outline'} onClick={() => onRate(activeIdx, v)}>
                                <Star className={`h-4 w-4 ${ratings[activeIdx] && ratings[activeIdx] >= v ? 'text-yellow-500 fill-yellow-400' : ''}`} />
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={prevQuestion} disabled={activeIdx === 0}>Previous</Button>
                      <Button variant="outline" onClick={nextQuestion} disabled={activeIdx >= questions.length - 1}>Next</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="tiktok-card">
                  <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <CardTitle>Session Summary</CardTitle>
                      <CardDescription>Track your practice progress</CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" /> Answered: <span className="text-foreground font-semibold">{sessionSummary.answered}</span> / {questions.length}
                      <span className="mx-2">•</span>
                      Avg Rating: <span className="text-foreground font-semibold">{sessionSummary.avgRating}</span> / 5
                    </div>
                  </CardHeader>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="tiktok-card">
                  <CardHeader>
                    <CardTitle>Preparation Checklist</CardTitle>
                    <CardDescription>Before and after the interview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {checklist.map((c) => (
                        <div key={c} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                    <Button size="sm" variant="outline" className="mt-3" onClick={copyChecklist}>
                      <ClipboardCopy className="h-4 w-4 mr-2" /> Copy Checklist
                    </Button>
                  </CardContent>
                </Card>

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

export default InterviewCoach;