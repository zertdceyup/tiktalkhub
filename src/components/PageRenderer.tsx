import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PageRenderer: React.FC = () => {
  const { pathname } = useLocation();
  const [blocks, setBlocks] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/public/page-blocks?path=${encodeURIComponent(pathname)}`);
      const json = await res.json();
      setBlocks(json.blocks || []);
    })();
  }, [pathname]);

  const renderBlock = (b: any) => {
    const cfg = b.config || {};
    switch (b.block_type) {
      case 'hero':
        return (
          <section key={b.id} className="py-16">
            <div className="container mx-auto px-6 text-center">
              <h1 className="text-4xl font-bold mb-4">{cfg.title || 'Hero Title'}</h1>
              <p className="text-muted-foreground">{cfg.subtitle || ''}</p>
            </div>
          </section>
        );
      case 'ad':
        return (
          <div key={b.id} className="container mx-auto px-6 my-6">
            <div className="border rounded h-24 flex items-center justify-center text-xs text-muted-foreground">Ad Slot ({cfg.id || 'slot'})</div>
          </div>
        );
      case 'tools-grid':
        return (
          <section key={b.id} className="py-12">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(cfg.tools || []).map((t: any, i: number) => (
                  <a key={i} href={t.href} className="tiktok-card p-4 block">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.description}</div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        );
      case 'blog':
        return (
          <section key={b.id} className="py-12 bg-secondary/30">
            <div className="container mx-auto px-6">
              <h2 className="text-2xl font-bold mb-4">{cfg.title || 'Latest Posts'}</h2>
              {/* In a full impl, fetch category/limit; using client BlogSection or api.getBlogPosts */}
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  if (!blocks.length) return null;
  return <>{blocks.map(renderBlock)}</>;
};

export default PageRenderer;