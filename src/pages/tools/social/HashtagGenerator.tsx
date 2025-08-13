import React, { useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import SEO from '@/components/SEO';
import { Copy, Download } from 'lucide-react';

const HashtagGenerator: React.FC = () => {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [count, setCount] = useState(20);
  const [tags, setTags] = useState<string[]>([]);

  const { data: blogData } = useQuery({
    queryKey: ['social-blogs'],
    queryFn: async () => (await api.getBlogPosts({ category: 'social', limit: 6 })).data,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.generateHashtags({ content, platform, count });
      return res.data as any;
    },
    onSuccess: (data) => setTags(data.hashtags || []),
    onError: (err) => alert(getErrorMessage(err))
  });

  const copyAll = async () => {
    await navigator.clipboard.writeText(tags.join(' '));
  };

  const exportCSV = () => {
    const csv = 'Hashtag\n' + tags.map(t => t).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hashtags_${platform}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Hashtag Generator | Social Tools | Tiktalkhub"
        description="Generate platform-optimized hashtags based on your content. Copy and export easily."
        keywords={["hashtag generator","instagram hashtags","tiktok hashtags","twitter hashtags"]}
        canonical="/tools/social/hashtag-generator"
      />
      <Header />
      <section className="py-12">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="tiktok-card">
              <CardHeader>
                <CardTitle>Hashtag Generator</CardTitle>
                <CardDescription>Enter your post content and pick a platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Describe your post..." />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <select className="w-full h-10 rounded-md border bg-background px-3" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                      <option value="instagram">Instagram</option>
                      <option value="twitter">Twitter/X</option>
                      <option value="tiktok">TikTok</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Count</Label>
                    <Input type="number" min={1} max={50} value={count} onChange={(e) => setCount(Number(e.target.value))} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="btn-gold" onClick={() => mutate()} disabled={isPending || !content}>Generate</Button>
                  <Button variant="outline" onClick={copyAll} disabled={!tags.length}><Copy className="w-4 h-4 mr-1" /> Copy All</Button>
                  <Button variant="outline" onClick={exportCSV} disabled={!tags.length}><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
                </div>
                {tags.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    {tags.map((t, i) => (
                      <div key={`${t}-${i}`} className="border rounded p-2">{t}</div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="tiktok-card">
              <CardHeader>
                <CardTitle>Social Growth Insights</CardTitle>
                <CardDescription>Hand-picked reads for social media</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {blogData?.posts?.slice(0, 6).map((post: any) => (
                    <div key={post.id} className="group cursor-pointer">
                      <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">{post.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    </div>
                  ))}
                  {!blogData?.posts?.length && (
                    <p className="text-sm text-muted-foreground">No posts yet. Add Social posts from the admin dashboard.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
      <TikoAI />
    </div>
  );
};

export default HashtagGenerator;