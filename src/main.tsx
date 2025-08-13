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
}

injectScripts().finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
