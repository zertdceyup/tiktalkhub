import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, Lightbulb, PenTool, FileText, 
  Calculator, Sparkles, ArrowRight, TrendingUp 
} from 'lucide-react';

const SmartBiz = () => {
  const tools = [
    {
      name: "Business Name Generator",
      description: "Generate catchy, memorable business names with AI",
      icon: Building2,
      features: ["AI-powered suggestions", "Domain availability check", "Brand analysis"],
      popular: true
    },
    {
      name: "Slogan Generator", 
      description: "Create powerful slogans that capture your brand essence",
      icon: Lightbulb,
      features: ["Multiple variations", "Industry-specific", "Emotional impact analysis"]
    },
    {
      name: "Logo Sketch Wizard",
      description: "Design professional logos with AI assistance",
      icon: PenTool,
      features: ["Vector graphics", "Color palettes", "Style variations"],
      popular: true
    },
    {
      name: "Smart Flyer Designer",
      description: "100+ customizable flyer templates for any business",
      icon: FileText,
      features: ["100+ templates", "Drag & drop editor", "Print-ready exports"]
    },
    {
      name: "Business Plan Generator",
      description: "Comprehensive business plans in minutes",
      icon: Calculator,
      features: ["Financial projections", "Market analysis", "Executive summary"],
      popular: true
    },
    {
      name: "Invoice Maker",
      description: "Professional invoices with automated calculations",
      icon: Sparkles,
      features: ["Custom branding", "Payment tracking", "Tax calculations"]
    }
  ];

  const blogPosts = [
    {
      id: 1,
      title: "10 Business Name Ideas That Actually Work",
      excerpt: "Real examples of successful business names and the psychology behind why they work so well.",
      readTime: "5 min",
      trending: true
    },
    {
      id: 2,
      title: "Logo Design Trends for 2024",
      excerpt: "Stay ahead with the latest logo design trends that are dominating the business world.",
      readTime: "7 min",
      trending: false
    },
    {
      id: 3,
      title: "Creating Your First Business Plan",
      excerpt: "Step-by-step guide to writing a business plan that actually gets funded.",
      readTime: "12 min",
      trending: true
    },
    {
      id: 4,
      title: "Small Business Marketing on a Budget",
      excerpt: "Proven marketing strategies that don't require a huge advertising budget.",
      readTime: "8 min",
      trending: false
    },
    {
      id: 5,
      title: "Invoice Best Practices for Freelancers",
      excerpt: "Get paid faster with these professional invoicing tips and templates.",
      readTime: "6 min",
      trending: true
    },
    {
      id: 6,
      title: "Building Brand Identity from Scratch",
      excerpt: "Complete guide to developing a cohesive brand identity that resonates with customers.",
      readTime: "10 min",
      trending: false
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,215,0,0.1),transparent_50%)]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-primary/20 to-gold/20 text-primary border-primary/30">
              <Building2 className="w-4 h-4 mr-2" />
              SmartBiz Suite
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-foreground via-primary to-gold-bright bg-clip-text text-transparent">
                SmartBiz Suite
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Everything you need to start, brand, and grow your business. From naming to invoicing, 
              we've got your entrepreneurial journey covered.
            </p>
            
            <Button size="lg" className="btn-gold">
              Start Building Your Business
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
                    <div className="p-3 rounded-xl bg-gradient-to-r from-primary/20 to-gold/20">
                      <tool.icon className="h-6 w-6 text-primary" />
                    </div>
                    {tool.popular && (
                      <Badge className="bg-red-500 text-white">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {tool.name}
                  </CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {tool.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant="outline" onClick={() => window.location.href = `/tools/smartbiz/${tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` }>
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
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Business Insights
            </h2>
            <p className="text-muted-foreground">Learn from experts and grow your business</p>
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
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
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

export default SmartBiz;