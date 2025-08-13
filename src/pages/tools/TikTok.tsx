import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Music, Hash, Crop, Lightbulb, 
  Edit3, TrendingUp, ArrowRight 
} from 'lucide-react';
import { useCuratedPosts } from '@/hooks/useCuratedPosts';

const TikTokTools = () => {
  const tools = [
    {
      name: "Trending Audio Detector",
      description: "Discover trending sounds and music for your TikTok videos",
      icon: Music,
      features: ["Real-time trends", "Audio analytics", "Viral predictions"],
      popular: true
    },
    {
      name: "Hashtag Heatmap",
      description: "Find the hottest hashtags for maximum reach",
      icon: Hash,
      features: ["Trending analysis", "Competition insights", "Optimal timing"],
      popular: true
    },
    {
      name: "Shorts Auto-Crop",
      description: "Automatically crop videos for TikTok format",
      icon: Crop,
      features: ["Smart cropping", "Face detection", "Batch processing"]
    },
    {
      name: "Caption & Hook Generator",
      description: "Generate engaging captions and hooks that convert",
      icon: Lightbulb,
      features: ["AI-powered hooks", "Trend-based captions", "A/B testing"],
      popular: true
    },
    {
      name: "TikTok AI Editor",
      description: "Complete video editing suite for TikTok creators",
      icon: Edit3,
      features: ["Templates", "Effects library", "Auto-sync beats"]
    },
    {
      name: "Viral Content Analyzer",
      description: "Analyze what makes content go viral on TikTok",
      icon: TrendingUp,
      features: ["Pattern recognition", "Viral metrics", "Success predictions"]
    }
  ];

  const { posts: blogPosts } = useCuratedPosts({ context: 'category:tiktok', fallbackLimit: 6 });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const collection = {
    '@type': 'CollectionPage',
    name: 'TikTok Toolkit',
    url: typeof window !== 'undefined' ? window.location.href : '',
    hasPart: tools.map(t => ({ '@type': 'SoftwareApplication', name: t.name, applicationCategory: 'MultimediaApplication', operatingSystem: 'Web', url: `${baseUrl}/tools/tiktok` }))
  };
  const articles = (blogPosts || []).map((p: any) => ({
    '@type': 'Article',
    headline: p.title,
    description: p.excerpt,
    image: p.featured_image ? [p.featured_image] : undefined,
    author: { '@type': 'Organization', name: 'Tiktalkhub' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': typeof window !== 'undefined' ? window.location.href : '' }
  }));
  const jsonLd = { '@context': 'https://schema.org', '@graph': [collection, ...articles] };

  return (
    <div className="min-h-screen">
      <SEO title="TikTok Tools | Tiktalkhub" description="Trending audio, hashtag heatmap, viral hooks, and more for TikTok creators." keywords={["tiktok tools","trending audio","viral hook", "hashtag heatmap"]} canonical="/tools/tiktok" jsonLd={jsonLd} />
      <Header />
      <div className="container mx-auto px-6">
        <Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'TikTok Tools' }]} jsonLdBaseUrl={baseUrl} />
      </div>
      
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,0,80,0.1),transparent_50%)]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-pink-500/20 to-red-500/20 text-pink-500 border-pink-500/30">
              <Music className="w-4 h-4 mr-2" />
              TikTok Toolkit
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 bg-clip-text text-transparent">
                TikTok Creator Suite
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Everything you need to create viral TikTok content. From trending audio detection 
              to AI-powered captions, dominate the TikTok algorithm.
            </p>
            
            <Button size="lg" className="btn-gold">
              Start Creating Viral Content
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
                    <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500/20 to-red-500/20">
                      <tool.icon className="h-6 w-6 text-pink-500" />
                    </div>
                    {tool.popular && (
                      <Badge className="bg-red-500 text-white">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="group-hover:text-pink-500 transition-colors">
                    {tool.name}
                  </CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {tool.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mr-2" />
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
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-pink-500 bg-clip-text text-transparent">
              TikTok Growth Insights
            </h2>
            <p className="text-muted-foreground">Master TikTok with insider tips and viral strategies</p>
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
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-pink-500 transition-colors">
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

export default TikTokTools;