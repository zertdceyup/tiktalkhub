import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const BlogSection = () => {
  const { data } = useQuery({
    queryKey: ['home-blogs'],
    queryFn: async () => (await api.getBlogPosts({ featured: true, limit: 9 })).data,
  });

  const posts = data?.posts || [];
  const featuredPosts = posts.filter((p: any) => p.featured);
  const mainFeatured = featuredPosts[0];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              🔥 Hot Reads
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay ahead with insights, tips, and strategies from industry experts
          </p>
        </div>

        {/* Featured Posts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Featured Post */}
          <div className="lg:col-span-2">
            {mainFeatured && (
              <Link to={`/blog/${mainFeatured.slug}`} className="group">
                <Card className="tiktok-card h-full border-0 overflow-hidden group-hover:scale-[1.02] transition-all duration-500">
                  <div className="relative">
                    {mainFeatured.featured_image && (
                      <img 
                        src={mainFeatured.featured_image} 
                        alt={mainFeatured.title}
                        className="w-full h-64 object-cover"
                      />
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                      {mainFeatured.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {mainFeatured.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{mainFeatured.published_at?.slice(0,10) || ''}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{mainFeatured.views || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>

          {/* Side Featured Posts */}
          <div className="space-y-4">
            {featuredPosts.slice(1, 3).map((post: any) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                <Card className="tiktok-card border-0 overflow-hidden group-hover:scale-[1.02] transition-all duration-500">
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      {post.featured_image && (
                        <img 
                          src={post.featured_image} 
                          alt={post.title}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                          {post.title}
                        </h4>
                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                          <span>{post.published_at?.slice(0,10) || ''}</span>
                          <span>{post.views || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {posts.slice(0, 8).map((post: any, index: number) => (
            <Link 
              key={post.id} 
              to={`/blog/${post.slug}`} 
              className="group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card className="tiktok-card border-0 overflow-hidden group-hover:scale-105 transition-all duration-500 animate-fade-in">
                <div className="relative">
                  {post.featured_image && (
                    <img 
                      src={post.featured_image} 
                      alt={post.title}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="absolute bottom-2 left-2 right-2">
                    <h4 className="text-white font-semibold text-sm line-clamp-2 drop-shadow-lg">
                      {post.title}
                    </h4>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.published_at?.slice(0,10) || ''}</span>
                    <span>{post.views || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/blog"
            className="inline-flex items-center space-x-2 text-lg font-semibold text-primary hover:text-gold transition-colors duration-300 group"
          >
            <span>Read More Insights</span>
            <svg 
              className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;