import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Type, CheckCircle, Globe, FileText, 
  Search, Languages, ArrowRight, TrendingUp 
} from 'lucide-react';
import { useCuratedPosts } from '@/hooks/useCuratedPosts';

const TextTools = () => {
  const tools = [
    {
      name: "Grammar Checker",
      description: "Advanced grammar and style checking with AI corrections",
      icon: CheckCircle,
      features: ["Real-time checking", "Style suggestions", "Contextual corrections"],
      popular: true
    },
    {
      name: "Plagiarism Detector",
      description: "Detect duplicate content and ensure originality",
      icon: Search,
      features: ["Deep web scanning", "Similarity reports", "Citation suggestions"]
    },
    {
      name: "Smart Translator",
      description: "AI-powered translation with context awareness",
      icon: Languages,
      features: ["100+ languages", "Context preservation", "Bulk translation"],
      popular: true
    },
    {
      name: "Text Summarizer",
      description: "Intelligent text summarization and key point extraction",
      icon: FileText,
      features: ["Key points", "Multiple lengths", "Bullet format"],
      popular: true
    },
    {
      name: "Readability Analyzer",
      description: "Analyze and improve text readability scores",
      icon: Type,
      features: ["Multiple metrics", "Improvement suggestions", "Grade level analysis"]
    },
    {
      name: "Content Expander",
      description: "Expand short texts into comprehensive content",
      icon: Globe,
      features: ["AI expansion", "Tone matching", "Research integration"]
    }
  ];

  const { posts: blogPosts } = useCuratedPosts({ context: 'category:text', fallbackLimit: 6 });

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(34,197,94,0.1),transparent_50%)]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-500 border-green-500/30">
              <Type className="w-4 h-4 mr-2" />
              Text Tools
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Text Processing Tools
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Advanced text processing tools for writers, editors, and content creators. 
              Enhance your writing with AI-powered grammar, translation, and analysis tools.
            </p>
            
            <Button size="lg" className="btn-gold">
              Start Writing Better
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
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                      <tool.icon className="h-6 w-6 text-green-500" />
                    </div>
                    {tool.popular && (
                      <Badge className="bg-red-500 text-white">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="group-hover:text-green-500 transition-colors">
                    {tool.name}
                  </CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {tool.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant="outline">
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
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-green-500 bg-clip-text text-transparent">
              Writing & Language Insights
            </h2>
            <p className="text-muted-foreground">Master the art of effective writing and communication</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(blogPosts || []).map((post: any) => (
              <Card key={post.id} className="tiktok-card group cursor-pointer overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.featured_image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">{post.published_at?.slice(0,10) || ''}</Badge>
                    {post.trending && (
                      <Badge className="bg-red-500 text-white text-xs">
                        🔥 Trending
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-green-500 transition-colors">
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

export default TextTools;