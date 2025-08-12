import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const fetchPosts = async () => {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/blog`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
};

const createPost = async (data: any) => {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/blog`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create post');
  return res.json();
};

const updatePost = async ({ id, data }: { id: number; data: any }) => {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/blog/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update post');
  return res.json();
};

const deletePost = async (id: number) => {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/blog/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to delete post');
  return res.json();
};

const AdminPosts: React.FC = () => {
  const { data, refetch, isLoading } = useQuery({ queryKey: ['adminPosts'], queryFn: fetchPosts });
  const [draft, setDraft] = useState<any>({ title: '', content: '', excerpt: '', status: 'draft', category: '' });
  const createMut = useMutation({ mutationFn: createPost, onSuccess: () => { setDraft({ title: '', content: '', excerpt: '', status: 'draft', category: '' }); refetch(); } });

  return (
    <div className="container mx-auto px-6 py-8">
      <Card>
        <CardHeader><CardTitle>Admin • Blog Posts</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">New Post</h3>
              <div className="space-y-2">
                <Input placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                <Input placeholder="Category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
                <Textarea rows={4} placeholder="Excerpt" value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} />
                <Textarea rows={8} placeholder="Content" value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
                <div className="flex gap-2">
                  <select className="h-10 rounded-md border bg-background px-3" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <Button className="btn-gold" onClick={() => createMut.mutate(draft)} disabled={createMut.isPending}>Create</Button>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Posts</h3>
              {isLoading ? 'Loading…' : (
                <div className="space-y-3">
                  {data?.posts?.map((p: any) => (
                    <PostItem key={p.id} post={p} onChange={refetch} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PostItem: React.FC<{ post: any; onChange: () => void }> = ({ post, onChange }) => {
  const [local, setLocal] = useState<any>({ ...post });
  const upd = useMutation({ mutationFn: (data: any) => updatePost({ id: post.id, data }), onSuccess: onChange });
  const del = useMutation({ mutationFn: () => deletePost(post.id), onSuccess: onChange });

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <Input value={local.title} onChange={(e) => setLocal({ ...local, title: e.target.value })} />
        <Input value={local.category || ''} onChange={(e) => setLocal({ ...local, category: e.target.value })} />
        <Textarea rows={3} value={local.excerpt || ''} onChange={(e) => setLocal({ ...local, excerpt: e.target.value })} />
        <Textarea rows={5} value={local.content || ''} onChange={(e) => setLocal({ ...local, content: e.target.value })} />
        <div className="flex gap-2">
          <select className="h-10 rounded-md border bg-background px-3" value={local.status} onChange={(e) => setLocal({ ...local, status: e.target.value })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <Button variant="outline" onClick={() => upd.mutate(local)} disabled={upd.isPending}>Save</Button>
          <Button variant="destructive" onClick={() => del.mutate()} disabled={del.isPending}>Delete</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPosts;