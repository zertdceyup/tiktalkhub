import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, User, Linkedin, BrainCircuit, 
  Target, Briefcase, ArrowRight, TrendingUp, Sparkles, Mic 
} from 'lucide-react';

const Career = () => {
  const tools = [
    {
      name: "Resume Builder",
      description: "Build ATS-friendly resumes with AI suggestions",
      icon: Briefcase,
      features: ["ATS score", "Templates", "Keyword targeting"],
      href: "/tools/career/resume-builder",
      popular: true
    },
    {
      name: "Cover Letter AI",
      description: "Generate tailored cover letters for each job",
      icon: FileText,
      features: ["Tone variants", "Company-specific hooks", "Export"],
      href: "/tools/career/cover-letter-ai"
    },
    {
      name: "LinkedIn Summary",
      description: "Create engaging LinkedIn summaries and headlines",
      icon: Sparkles,
      features: ["Persona presets", "Keyword density", "Length tuning"],
      href: "/tools/career/linkedin-summary",
      popular: true
    },
          {
        name: "Interview Coach",
        description: "Practice interviews with timed sessions and tips",
        icon: Mic,
        features: ["Question bank", "STAR assistant", "Progress tracking"],
        href: "/tools/career/interview-coach"
      },
      {
        name: "Job Match + Resume Optimizer",
        description: "Analyze JD vs resume; get ATS score and keyword gaps",
        icon: Target,
        features: ["ATS score", "Missing keywords", "Optimized summary"],
        href: "/tools/career/job-match-optimizer",
        popular: true
      }
  ];

  const blogPosts = [
    {
      id: 1,
      title: "Resume Keywords That Actually Work in 2024",
      excerpt: "The exact keywords and phrases that will get your resume past ATS systems and into human hands.",
      readTime: "8 min",
      trending: true
    },
    {
      id: 2,
      title: "How to Ace Your Next Virtual Interview",
      excerpt: "Master video interviews with these professional tips and technical setup guidelines.",
      readTime: "6 min",
      trending: false
    },
    {
      id: 3,
      title: "LinkedIn Profile Optimization Guide",
      excerpt: "Transform your LinkedIn profile into a powerful career tool that attracts recruiters.",
      readTime: "10 min",
      trending: true
    },
    {
      id: 4,
      title: "Salary Negotiation Strategies That Work",
      excerpt: "Proven techniques to negotiate higher salaries and better benefits packages.",
      readTime: "12 min",
      trending: false
    },
    {
      id: 5,
      title: "Building a Portfolio That Gets Noticed",
      excerpt: "Showcase your skills effectively with these portfolio design and content strategies.",
      readTime: "9 min",
      trending: true
    },
    {
      id: 6,
      title: "Career Change at Any Age",
      excerpt: "Successfully transition to a new career field with strategic planning and skill development.",
      readTime: "11 min",
      trending: false
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(0,191,255,0.1),transparent_50%)]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-electric-blue/20 to-primary/20 text-electric-blue border-electric-blue/30">
              <Target className="w-4 h-4 mr-2" />
              Career Toolkit
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-electric-blue via-primary to-gold-bright bg-clip-text text-transparent">
                Career Toolkit
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Land your dream job faster with AI-powered career tools. From resumes to interviews, 
              we'll help you stand out in today's competitive job market.
            </p>
            
            <Button size="lg" className="btn-gold">
              Boost Your Career
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, index) => (
              <Card key={tool.name} className="tiktok-card group cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-electric-blue/20 to-primary/20">
                      <tool.icon className="h-6 w-6 text-electric-blue" />
                    </div>
                    {tool.popular && (
                      <Badge className="bg-red-500 text-white">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="group-hover:text-electric-blue transition-colors">
                    {tool.name}
                  </CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {tool.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-electric-blue rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant="outline" onClick={() => window.location.href = tool.href }>
                    Try Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-electric-blue bg-clip-text text-transparent">
              Career Insights
            </h2>
            <p className="text-muted-foreground">Expert advice to accelerate your career growth</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Card key={post.id} className="tiktok-card group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {post.readTime}
                    </Badge>
                    {post.trending && (
                      <Badge className="bg-red-500 text-white text-xs">
                        🔥 Trending
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-electric-blue transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <TikoAI />
    </div>
  );
};

export default Career;