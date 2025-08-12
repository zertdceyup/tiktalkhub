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
  FileText, Merge, Split, Lock, 
  Download, Image, ArrowRight, TrendingUp 
} from 'lucide-react';

const PDF = () => {
  const tools = [
    {
      name: "PDF Merger",
      description: "Combine multiple PDF files into one document",
      icon: Merge,
      features: ["Drag & drop interface", "Custom page order", "Bookmark preservation"],
      popular: true
    },
    {
      name: "PDF Splitter",
      description: "Split large PDFs into smaller files",
      icon: Split,
      features: ["Page range selection", "Custom split points", "Batch processing"]
    },
    {
      name: "PDF Compressor",
      description: "Reduce PDF file size without quality loss",
      icon: Download,
      features: ["Smart compression", "Quality control", "Batch optimization"],
      popular: true
    },
    {
      name: "PDF Password Protector",
      description: "Secure your PDFs with password protection",
      icon: Lock,
      features: ["256-bit encryption", "User permissions", "Digital signatures"]
    },
    {
      name: "PDF to Image Converter",
      description: "Convert PDF pages to high-quality images",
      icon: Image,
      features: ["Multiple formats", "Custom DPI", "Batch conversion"],
      popular: true
    },
    {
      name: "PDF Editor Pro",
      description: "Edit text, images, and annotations in PDFs",
      icon: FileText,
      features: ["Text editing", "Image insertion", "Form creation"]
    }
  ];

  const blogPosts = [
    {
      id: 1,
      title: "PDF Best Practices for Business",
      excerpt: "Essential tips for creating, managing, and securing PDF documents in professional environments.",
      readTime: "8 min",
      trending: true,
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop"
    },
    {
      id: 2,
      title: "Digital Document Security Guide",
      excerpt: "How to protect sensitive information in PDF documents with advanced security features.",
      readTime: "10 min",
      trending: false,
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop"
    },
    {
      id: 3,
      title: "PDF Optimization Techniques",
      excerpt: "Advanced methods to reduce PDF file sizes while maintaining document quality and readability.",
      readTime: "7 min",
      trending: true,
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=200&fit=crop"
    }
  ];

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'PDF Toolkit',
    url: typeof window !== 'undefined' ? window.location.href : '',
    hasPart: tools.map(t => ({ '@type': 'SoftwareApplication', name: t.name, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', url: `${baseUrl}/tools/pdf` }))
  };

  return (
    <div className="min-h-screen">
      <Header />
      <SEO 
        title="PDF Tools - Manage, Edit, Convert, and Secure Your PDFs" 
        description="A comprehensive toolkit for managing, editing, converting, and securing your PDF documents. Combine, split, compress, and protect your files with ease." 
        keywords="PDF tools, PDF management, PDF editing, PDF conversion, PDF security, PDF optimization" 
        jsonLd={jsonLd}
      />
      <div className="container mx-auto px-6">
        <Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'PDF Tools' }]} jsonLdBaseUrl={baseUrl} />
      </div>
      
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(239,68,68,0.1),transparent_50%)]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-red-500/20 to-primary/20 text-red-500 border-red-500/30">
              <FileText className="w-4 h-4 mr-2" />
              PDF Toolkit
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-red-500 via-primary to-gold-bright bg-clip-text text-transparent">
                PDF Toolkit
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Complete PDF solution for all your document needs. Edit, convert, compress, 
              and secure your PDFs with professional-grade tools.
            </p>
            
            <Button size="lg" className="btn-gold">
              Start Managing PDFs
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
                    <div className="p-3 rounded-xl bg-gradient-to-r from-red-500/20 to-primary/20">
                      <tool.icon className="h-6 w-6 text-red-500" />
                    </div>
                    {tool.popular && (
                      <Badge className="bg-red-500 text-white">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="group-hover:text-red-500 transition-colors">
                    {tool.name}
                  </CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {tool.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant="outline" onClick={() => window.location.assign('/tools/utility/pdf-merger')}>
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
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-red-500 bg-clip-text text-transparent">
              PDF Management Insights
            </h2>
            <p className="text-muted-foreground">Master digital document workflows and security</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Card key={post.id} className="tiktok-card group cursor-pointer overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-red-500 transition-colors">
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

export default PDF;