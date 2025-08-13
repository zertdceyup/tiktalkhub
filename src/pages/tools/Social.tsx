import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import SEO from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Hash, Twitter, Instagram, Link, 
  QrCode, PenTool, ArrowRight, TrendingUp 
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import AdSlot from '@/components/AdSlot';
import { useCuratedPosts } from '@/hooks/useCuratedPosts';

const SocialTools = () => {
  const tools = [
    {
      name: "Hashtag Generator",
      description: "Research and generate trending hashtags for any platform",
      icon: Hash,
      features: ["Trending analysis", "Competition tracking", "Performance metrics"],
      popular: true,
      route: "/tools/social/hashtag-generator"
    },
    {
      name: "Twitter/X Formatter",
      description: "Format and optimize your Twitter threads",
      icon: Twitter,
      features: ["Thread templates", "Character counting", "Engagement optimization"],
      route: "/tools/social/twitter-thread-formatter"
    },
    {
      name: "Caption Writer",
      description: "AI-powered captions for Instagram, Facebook, and X",
      icon: PenTool,
      features: ["Platform-specific styles", "Emoji suggestions", "CTA optimization"],
      popular: true,
      route: "/tools/social/facebook-caption-creator"
    },
    {
      name: "Instagram Bio Link Builder",
      description: "Create beautiful landing pages for your bio link",
      icon: Instagram,
      features: ["Custom themes", "Analytics tracking", "Mobile optimized"],
      route: "/tools/social/bio-link-builder"
    },
    {
      name: "QR Code Generator",
      description: "Generate custom QR codes for any purpose",
      icon: QrCode,
      features: ["Custom styling", "Logo embedding", "High resolution"],
      popular: true,
      route: "/tools/utility/qr-code-generator"
    },
    {
      name: "Link Shortener",
      description: "Shorten and track your social media links",
      icon: Link,
      features: ["Custom domains", "Click analytics", "UTM parameters"],
      route: "/tools/social/link-shortener"
    }
  ];

  const { posts: blogPosts } = useCuratedPosts({ context: 'category:social', fallbackLimit: 6 });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const collection = {
    '@type': 'CollectionPage',
    name: 'Social Media Tools',
    url: typeof window !== 'undefined' ? window.location.href : '',
    hasPart: tools.map(t => ({ '@type': 'SoftwareApplication', name: t.name, applicationCategory: 'SocialNetworkingApplication', operatingSystem: 'Web', url: `${baseUrl}${t.route}` }))
  };
  const articles = (blogPosts || []).map((p: any) => ({
    '@type': 'Article',
    headline: p.title,
    description: p.excerpt,
    author: { '@type': 'Organization', name: 'Tiktalkhub' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': typeof window !== 'undefined' ? window.location.href : '' }
  }));
  const jsonLd = { '@context': 'https://schema.org', '@graph': [collection, ...articles] };

  return (
    <div className="min-h-screen">
      <SEO
        title="Social Media Tools | Tiktalkhub"
        description="Hashtag generator, Twitter thread formatter, Facebook captions and more for social growth."
        keywords={["hashtag generator","twitter thread formatter","facebook caption","social media tools"]}
        canonical="/tools/social"
        jsonLd={jsonLd}
      />
      <Header />
      <div className="container mx-auto px-6">
        <Breadcrumbs trail={[{ name: 'Home', href: '/' }, { name: 'Social Tools' }]} jsonLdBaseUrl={baseUrl} />
      </div>
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,20,147,0.1),transparent_50%)]" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-magic-pink/20 to-primary/20 text-magic-pink border-magic-pink/30">
              <Hash className="w-4 h-4 mr-2" />
              Social Toolkit
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-magic-pink via-primary to-gold-bright bg-clip-text text-transparent">
                Social Toolkit
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Supercharge your social media presence with AI-powered tools. Create engaging content, 
              optimize for algorithms, and grow your audience across all platforms.
            </p>
            <Button size="lg" className="btn-gold">
              Boost Your Social Presence
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
      {/* Ad Slot */}
      <div className="container mx-auto px-6">
        <AdSlot id="ad-social-top" height={120} className="mb-8" />
      </div>
      {/* Tools Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, index) => (
              <Card key={tool.name} className="tiktok-card group cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-magic-pink/20 to-primary/20">
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
              Social Media Insights
            </h2>
            <p className="text-muted-foreground">Expert strategies to dominate social media</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(blogPosts || []).map((post: any) => (
              <Card key={post.id} className="tiktok-card group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">{post.published_at?.slice(0,10) || ''}</Badge>
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

export default SocialTools;