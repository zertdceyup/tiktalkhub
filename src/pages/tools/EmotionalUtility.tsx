import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, Brain, Smile, Moon, 
  Activity, MessageCircle, ArrowRight, TrendingUp 
} from 'lucide-react';
import { useCuratedPosts } from '@/hooks/useCuratedPosts';

const EmotionalUtility = () => {
  const tools = [
    {
      name: "Mood Tracker",
      description: "Track and analyze your daily emotional patterns",
      icon: Heart,
      features: ["Daily check-ins", "Mood analytics", "Trend visualization"],
      popular: true
    },
    {
      name: "Stress Relief Generator",
      description: "Personalized relaxation techniques and exercises",
      icon: Brain,
      features: ["Breathing exercises", "Meditation guides", "Quick relief tips"]
    },
    {
      name: "Gratitude Journal",
      description: "Build positivity with daily gratitude practice",
      icon: Smile,
      features: ["Daily prompts", "Reflection insights", "Progress tracking"],
      popular: true
    },
    {
      name: "Sleep Wellness Tracker",
      description: "Monitor and improve your sleep quality",
      icon: Moon,
      features: ["Sleep pattern analysis", "Bedtime routines", "Quality metrics"]
    },
    {
      name: "Mindfulness Reminder",
      description: "Gentle reminders for mindful moments",
      icon: Activity,
      features: ["Custom schedules", "Meditation timers", "Mindful activities"],
      popular: true
    },
    {
      name: "Emotional Support Chat",
      description: "AI-powered emotional support and guidance",
      icon: MessageCircle,
      features: ["24/7 availability", "Crisis resources", "Coping strategies"]
    }
  ];

  const { posts: blogPosts } = useCuratedPosts({ context: 'category:emotional', fallbackLimit: 6 });

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(236,72,153,0.1),transparent_50%)]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-pink-500/20 to-primary/20 text-pink-500 border-pink-500/30">
              <Heart className="w-4 h-4 mr-2" />
              Emotional Utility
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-500 via-primary to-gold-bright bg-clip-text text-transparent">
                Emotional Utility
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Nurture your mental health and emotional well-being with compassionate tools 
              designed to support your emotional journey every day.
            </p>
            
            <Button size="lg" className="btn-gold">
              Start Your Wellness Journey
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
                    <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500/20 to-primary/20">
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
              Wellness Insights
            </h2>
            <p className="text-muted-foreground">Expert guidance for emotional and mental well-being</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(blogPosts || []).map((post: any) => (
              <Card key={post.id} className="tiktok-card group cursor-pointer overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.featured_image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

export default EmotionalUtility;