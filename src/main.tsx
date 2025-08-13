import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

async function injectScripts() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/public/settings`);
    const j = await res.json();
    const s = j?.settings || {};
    if (s.analytics_code) {
      const el = document.createElement('script');
      el.defer = true;
      el.innerHTML = s.analytics_code;
      document.head.appendChild(el);
    }
    if (s.ad_header_code) {
      const el = document.createElement('script');
      el.defer = true;
      el.innerHTML = s.ad_header_code;
      document.head.appendChild(el);
    }
    if (s.ad_footer_code) {
      const el = document.createElement('script');
      el.defer = true;
      el.innerHTML = s.ad_footer_code;
      document.body.appendChild(el);
    }
  } catch {}

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/public/brand-kit`);
    const j = await res.json();
    const logo = j?.kit?.logo_url || j?.brand?.logo_url;
    const href = logo ? (logo.startsWith('http') ? logo : `${location.origin}${logo}`) : '/icon-192.png';
    const existing = document.querySelector("link[rel='icon']");
    if (existing) existing.parentElement?.removeChild(existing);
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = href;
    document.head.appendChild(link);
  } catch {}
}

function enableRoutePrefetch() {
  const map: Record<string, () => Promise<any>> = {
    '/tools/video/trimmer': () => import('./pages/tools/video/VideoTrimmer'),
    '/tools/video/gif-maker': () => import('./pages/tools/video/GifMaker'),
    '/tools/utility/image-optimizer': () => import('./pages/tools/utility/ImageOptimizer'),
    '/tools/video/pro': () => import('./pages/tools/video/VideoPro'),
  };
  document.addEventListener('mouseover', (e) => {
    const t = e.target as HTMLElement;
    if (!t) return;
    const a = t.closest('a[href]') as HTMLAnchorElement | null;
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (map[href]) map[href]();
  }, { passive: true });
}

enableRoutePrefetch();

injectScripts().finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
