import { useEffect, useState } from 'react';
import api from '@/lib/api';

export interface CuratedOptions {
  context: string; // 'home' | `category:${string}` | `path:${string}`
  fallbackLimit?: number;
}

export function useCuratedPosts({ context, fallbackLimit = 6 }: CuratedOptions) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Fetch rules
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/public/blog-curation?context=${encodeURIComponent(context)}`);
        const j = await res.json();
        const rule = j?.rules?.[0]?.rule || {};
        const limit = rule.limit || fallbackLimit;
        const category = rule.category || undefined;
        // Pins: if specific slugs pinned, fetch them first
        let pinned: any[] = [];
        if (rule.pin && Array.isArray(rule.pin) && rule.pin.length > 0) {
          // In a full impl, add endpoint to fetch by slugs; here, just ignore or future-work
        }
        const data = (await api.getBlogPosts({ category, limit })).data;
        const items = data?.posts || [];
        if (!mounted) return;
        setPosts([...(pinned || []), ...items]);
      } catch {
        if (!mounted) return; setPosts([]);
      } finally {
        if (!mounted) return; setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [context, fallbackLimit]);

  return { posts, loading };
}