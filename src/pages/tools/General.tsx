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
  Settings, Download, Upload, Search, 
  FileText, Calculator, QrCode, ArrowRight, TrendingUp 
} from 'lucide-react';

const GeneralTools = () => {
  const tools = [
    {
      name: "YouTube Thumbnail Downloader",
      description: "Download high-quality thumbnails from any YouTube video",
      icon: Download,
      features: ["HD quality", "Multiple formats", "Instant download"],
      popular: true,
      route: "/tools/utility/youtube-thumbnail-downloader"
    },
    {
      name: "Twitter Thread Previewer",
      description: "Preview how your Twitter thread will look before posting",
      icon: FileText,
      features: ["Real-time preview", "Character count", "Thread formatting"],
      route: "/tools/general/twitter-thread-previewer"
    },
    {
      name: "Image Remixer",
      description: "Transform and remix images with AI-powered effects",
      icon: Upload,
      features: ["AI-powered", "Multiple styles", "Batch processing"],
      popular: true,
      route: "/tools/general/image-remixer"
    },
    {
      name: "Text Summarizer",
      description: "Condense long texts into key points instantly",
      icon: FileText,
      features: ["AI summarization", "Key points extraction", "Multiple lengths"],
      route: "/tools/content/text-summarizer"
    },
    {
      name: "Voice Notes to Text",
      description: "Convert voice recordings to accurate text transcriptions",
      icon: Search,
      features: ["High accuracy", "Multiple languages", "Fast processing"],
      popular: true,
      route: "/tools/content/voice-notes-to-text"
    },
    {
      name: "QR Code Generator",
      description: "Create custom QR codes for any purpose",
      icon: QrCode,
      features: ["Custom designs", "Multiple formats", "Bulk generation"],
      route: "/tools/utility/qr-code-generator"
    }
  ];

  const blogPosts = [
    {
      id: 1,
      title: "Essential Digital Tools for 2025",
      excerpt: "Discover the must-have digital tools that will transform your productivity this year.",
      readTime: "8 min",
      trending: true,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Workflow Automation Secrets",
      excerpt: "Learn how to automate repetitive tasks and focus on what matters most.",
      readTime: "6 min",
      trending: false,
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Digital Organization Tips",
      excerpt: "Master the art of digital organization with these proven strategies.",
      readTime: "7 min",
      trending: true,
      image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      title: "Time-Saving Tool Combinations",
      excerpt: "Discover powerful tool combinations that work together seamlessly.",
      readTime: "9 min",
      trending: false,
      image: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&h=300&fit=crop"
    },
    {
      id: 5,
      title: "Future of Digital Productivity",
      excerpt: "Explore upcoming trends in digital productivity and automation.",
      readTime: "10 min",
      trending: true,
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop"
    },
    {
      id: 6,
      title: "Cross-Platform Integration Guide",
      excerpt: "Learn how to integrate tools across different platforms for maximum efficiency.",
      readTime: "12 min",
      trending: false,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop"
    }
  ];

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const collection = {
    '@type': 'CollectionPage',
    name: 'General Tools',
    url: typeof window !== 'undefined' ? window.location.href : '',
    hasPart: tools.map(t => ({ '@type': 'SoftwareApplication', name: t.name, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', url: `${baseUrl}${t.route}` }))
  };
  const articles = blogPosts.map((p) => ({
    '@type': 'Article',
    headline: p.title,
    description: p.excerpt,
    image: p.image ? [p.image] : undefined,
    author: { '@type': 'Organization', name: 'Tiktalkhub' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': typeof window !== 'undefined' ? window.location.href : '' }
  }));
  const jsonLd = { '@context': 'https://schema.org', '@graph': [collection, ...articles] };

  return (
    <div className="min-h-screen">
      <SEO
        title="General Tools | Tiktalkhub"
        description="Handy utility tools including QR code, image optimizer, and more."
        keywords={["qr code generator","image optimizer","meme generator","file tools"]}
        canonical="/tools/general"
        jsonLd={jsonLd}
      />
      <Header />
      <div className="container mx-auto px-6">
        <Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'General Tools' }]} jsonLdBaseUrl={baseUrl} />
      </div>
      
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.1),transparent_50%)]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-magic-pink/20 to-aurora-cyan/20 text-magic-pink border-magic-pink/30">
              <Settings className="w-4 h-4 mr-2" />
              General Tools
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-magic-pink via-aurora-cyan to-gold-bright bg-clip-text text-transparent">
                General Productivity Tools
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Essential tools for everyday tasks. From file conversions to quick utilities, 
              streamline your workflow with our versatile toolkit.
            </p>
            
            <Button size="lg" className="btn-gold">
              Start Using Tools
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
                    <div className="p-3 rounded-xl bg-gradient-to-r from-magic-pink/20 to-aurora-cyan/20">
                      <tool.icon className="h-6 w-6 text-magic-pink" />
                    </div>
                    {tool.popular && (
                      <Badge className="bg-red-500 text-white">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="group-hover:text-magic-pink transition-colors">
                    {tool.name}
                  </CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {tool.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-magic-pink rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant="outline" onClick={() => (tool as any).route ? window.location.assign((tool as any).route) : null}>
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
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-magic-pink bg-clip-text text-transparent">
              Productivity Insights
            </h2>
            <p className="text-muted-foreground">Master productivity with expert tips and strategies</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Card key={post.id} className="tiktok-card group cursor-pointer overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
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
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-magic-pink transition-colors">
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

export default GeneralTools;