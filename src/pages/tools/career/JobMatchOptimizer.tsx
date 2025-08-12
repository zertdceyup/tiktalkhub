import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import SEO from '@/components/SEO';
import { useMutation } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';

const JobMatchOptimizer: React.FC = () => {
  const [jobDescription, setJobDescription] = useState<string>('Paste the job description here...');
  const [resume, setResume] = useState<string>('Paste your resume content here...');
  const [result, setResult] = useState<any>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.jobMatchOptimizer({ jobDescription, resume });
      return res.data as any;
    },
    onSuccess: (data) => setResult(data),
    onError: (err) => alert(getErrorMessage(err))
  });

  return (
    <div className="min-h-screen">
      <SEO title="Job Match + Resume Optimizer | Career Tools | Tiktalkhub" description="Analyze job description vs resume, get ATS score, missing keywords, and optimized summary." keywords={["ATS score","resume optimizer","job match"]} canonical="/tools/career/job-match-optimizer" />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-6xl">
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle>Job Match Scraper + Resume Optimizer</CardTitle>
              <CardDescription>Get ATS score, missing keywords, and tailored summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Description</Label>
                  <Textarea rows={12} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Resume</Label>
                  <Textarea rows={12} value={resume} onChange={(e) => setResume(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || jobDescription.length < 50 || resume.length < 50}>Analyze</Button>
                <Button variant="outline" onClick={() => setResult(null)}>Reset</Button>
              </div>
              {result && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 border rounded">
                    <div className="font-medium">ATS Score</div>
                    <div className="text-2xl">{result.atsScore}</div>
                    <div className="mt-2"><span className="font-medium">Overlap:</span> {result.overlap?.join(', ') || '—'}</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="font-medium">Missing Keywords</div>
                    <div>{result.missing?.slice(0, 20).join(', ') || 'None'}</div>
                  </div>
                  <div className="p-3 border rounded md:col-span-1">
                    <div className="font-medium">Suggestions</div>
                    <ul className="list-disc ml-5 space-y-1 mt-1">
                      {result.suggestions?.map((s: string, i: number) => (<li key={i}>{s}</li>))}
                    </ul>
                  </div>
                  <div className="p-3 border rounded md:col-span-3">
                    <div className="font-medium">Optimized Summary</div>
                    <div className="mt-1">{result.optimizedSummary}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
      <TikoAI />
    </div>
  );
};

export default JobMatchOptimizer;