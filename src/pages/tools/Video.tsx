import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SEO from '@/components/SEO';
import { 
  Video, Scissors, ImageIcon, Volume2, 
  Crop, Download, ArrowRight, TrendingUp 
} from 'lucide-react';

const VideoTools = () => {
  const tools = [
    {
      name: "Smart Caption Generator",
      description: "AI-powered captions that boost engagement",
      icon: Video,
      features: ["Auto-sync timing", "Multiple languages", "Style customization"],
      popular: true
    },
    {
      name: "Thumbnail Optimizer",
      description: "Create click-worthy thumbnails that drive views",
      icon: ImageIcon,
      features: ["A/B testing", "CTR optimization", "Template library"]
    },
    {
      name: "Batch Trimmer",
      description: "Trim multiple videos simultaneously",
      icon: Scissors,
      features: ["Bulk processing", "Custom presets", "Quality preservation"],
      popular: true
    },
    {
      name: "Noise Remover",
      description: "Clean audio with AI noise reduction",
      icon: Volume2,
      features: ["Background noise removal", "Echo cancellation", "Voice enhancement"],
      popular: false
    },
    {
      name: "Shorts Vertical Cropper",
      description: "Convert landscape videos to vertical shorts",
      icon: Crop,
      features: ["Smart framing", "Face detection", "Auto-crop"],
      popular: true
    },
    {
      name: "GIF Converter",
      description: "Convert videos to high-quality GIFs",
      icon: Download,
      features: ["Size optimization", "Frame rate control", "Loop settings"]
    }
  ];

  const blogPosts = [
    {
      id: 1,
      title: "Video SEO: Rank Higher on YouTube",
      excerpt: "Optimize your videos for search with these proven techniques that top creators use.",
      readTime: "9 min",
      trending: true
    },
    {
      id: 2,
      title: "Creating Viral TikTok Content",
      excerpt: "Master the art of short-form video content that captures attention and goes viral.",
      readTime: "7 min",
      trending: false
    },
    {
      id: 3,
      title: "Audio Quality Tips for Creators",
      excerpt: "Improve your video audio quality with these simple but effective techniques.",
      readTime: "6 min",
      trending: true
    },
    {
      id: 4,
      title: "Thumbnail Design Psychology",
      excerpt: "The science behind thumbnails that get clicked and how to design them.",
      readTime: "8 min",
      trending: false
    },
    {
      id: 5,
      title: "Video Editing Workflow Optimization",
      excerpt: "Streamline your editing process and save hours with these workflow tips.",
      readTime: "11 min",
      trending: true
    },
    {
      id: 6,
      title: "Repurposing Content Across Platforms",
      excerpt: "Transform one video into multiple pieces of content for different platforms.",
      readTime: "10 min",
      trending: false
    }
  ];

  return (
    <div className="min-h-screen">
      <SEO
        title="Video Tools Suite | Tiktalkhub"
        description="Trim videos, extract thumbnails, create GIFs, add captions, and more. Fast, free, and creator-friendly."
        keywords={["video trimmer","thumbnail extractor","gif maker","caption overlay","shorts cropper"]}
        canonical="/tools/video"
        openGraph={{ title: 'Video Tools Suite | Tiktalkhub', description: 'Trim, extract, and create with fast online tools', type: 'website', url: typeof window !== 'undefined' ? window.location.href : '' }}
        twitter={{ card: 'summary_large_image', title: 'Video Tools Suite | Tiktalkhub', description: 'Trim, extract, and create with fast online tools' }}
      />
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(138,43,226,0.1),transparent_50%)]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-neon-purple/20 to-primary/20 text-neon-purple border-neon-purple/30">
              <Video className="w-4 h-4 mr-2" />
              Video Toolkit
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-neon-purple via-primary to-gold-bright bg-clip-text text-transparent">
                Video Toolkit
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Professional video editing tools powered by AI. Create, edit, and optimize 
              your videos for maximum impact across all platforms.
            </p>
            
            <Button size="lg" className="btn-gold">
              Start Creating Videos
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
                    <div className="p-3 rounded-xl bg-gradient-to-r from-neon-purple/20 to-primary/20">
                      <tool.icon className="h-6 w-6 text-neon-purple" />
                    </div>
                    {tool.popular && (
                      <Badge className="bg-red-500 text-white">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="group-hover:text-neon-purple transition-colors">
                    {tool.name}
                  </CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {tool.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-neon-purple rounded-full mr-2" />
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
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-neon-purple bg-clip-text text-transparent">
              Video Creation Insights
            </h2>
            <p className="text-muted-foreground">Master video creation with expert tips and strategies</p>
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
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-neon-purple transition-colors">
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

export default VideoTools;