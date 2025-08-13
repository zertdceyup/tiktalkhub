import React, { useEffect, useRef, useState } from 'react';

const AdSlot: React.FC<{ id: string; height?: number; className?: string }> = ({ id, height = 250, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [injected, setInjected] = useState(false);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    const run = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/public/settings`);
        const j = await res.json();
        const s = j?.settings || {};
        const client = s.adsense_client;
        const slot = s.adsense_slot;
        const cmpMode = s.cmp_mode || 'basic';
        const cmpRaw = localStorage.getItem('cmp_consent');
        const cmp = cmpRaw ? JSON.parse(cmpRaw) : { ads: true };
        if (!client || !slot) return;
        // If TCF v2 mode, require consent via __tcfapi
        if (cmpMode === 'tcfv2') {
          // @ts-ignore
          const tcf = (window as any).__tcfapi;
          if (!tcf) return; // CMP not present
          const hasConsent = await new Promise<boolean>((resolve) => {
            try {
              // @ts-ignore
              (window as any).__tcfapi('getTCData', 2, (tcData: any, success: boolean) => {
                if (!success || !tcData) return resolve(false);
                // Purpose 1 (Storage and/or access of information)
                const p1 = tcData.purpose?.consents?.[1] === true;
                resolve(!!p1);
              });
            } catch { resolve(false); }
          });
          if (!hasConsent) return;
        } else {
          if (!cmp.ads) return;
        }
        const inject = () => {
          if (!ref.current || injected) return;
          ref.current.innerHTML = '';
          const ins = document.createElement('ins');
          ins.className = 'adsbygoogle';
          ins.style.display = 'block';
          ins.setAttribute('data-ad-client', client);
          ins.setAttribute('data-ad-slot', slot);
          ins.setAttribute('data-ad-format', 'auto');
          ins.setAttribute('data-full-width-responsive', 'true');
          ref.current.appendChild(ins);
          const scriptId = 'adsbygooglejs';
          if (!document.getElementById(scriptId)) {
            const s = document.createElement('script'); s.id = scriptId; s.async = true;
            s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
            document.head.appendChild(s);
          }
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setInjected(true);
        };
        observer = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              inject();
              // viewability tracking
              const start = Date.now();
              setTimeout(() => {
                const ms = Date.now() - start;
                if (ms > 1000) {
                  // send beacon (optional)
                  navigator.sendBeacon?.('/ad-view', JSON.stringify({ id, ms }));
                }
              }, 1000);
              observer?.disconnect();
            }
          });
        }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
      } catch {}
    };
    run();
    return () => { observer?.disconnect(); };
  }, [id, injected]);

  return (
    <div className={className}>
      <div id={id} ref={ref} style={{ minHeight: height, width: '100%' }} className="bg-secondary/30 rounded flex items-center justify-center text-xs text-muted-foreground">
        Ad space
      </div>
    </div>
  );
};

export default AdSlot;