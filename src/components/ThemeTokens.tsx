import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

const fetchTokens = async (path: string) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/page-settings`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}` }
    });
    if (!res.ok) return {} as Record<string, string>;
    const json = await res.json();
    const hit = (json.pages || []).find((p: any) => p.page_path === path);
    if (!hit) return {} as Record<string, string>;
    try { return JSON.parse(hit.tokens_json || '{}'); } catch { return {} as Record<string, string>; }
  } catch { return {} as Record<string, string>; }
};

const ThemeTokens: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const [tokens, setTokens] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTokens(pathname).then(setTokens);
  }, [pathname]);

  const styleVars = useMemo(() => {
    const entries = Object.entries(tokens || {});
    const out: React.CSSProperties = {};
    for (const [k, v] of entries) {
      if (k.startsWith('--')) {
        // Accept either hsl tuple or color string
        (out as any)[k] = v;
      }
    }
    return out;
  }, [tokens]);

  return (
    <div style={styleVars}>
      {children}
    </div>
  );
};

export default ThemeTokens;