self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open('tth-shell-v1');
    await cache.addAll(['/','/index.html']);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

function isCacheableApi(url) {
  try {
    const u = new URL(url);
    if (!u.pathname.startsWith('/api')) return false;
    return (
      u.pathname.includes('/api/public/blog-curation') ||
      u.pathname.includes('/api/public/settings') ||
      u.pathname.includes('/api/blog')
    );
  } catch { return false; }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = request.url;
  if (isCacheableApi(url)) {
    event.respondWith((async () => {
      const cache = await caches.open('tth-data-v1');
      try {
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      } catch (_) {
        const cached = await cache.match(request);
        if (cached) return cached;
        return new Response(JSON.stringify({ success: false, message: 'Offline' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open('tth-shell-v1');
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const res = await fetch(request);
      if (res.ok && request.url.startsWith(self.location.origin)) cache.put(request, res.clone());
      return res;
    } catch (_) {
      const fallback = await cache.match('/');
      return fallback || new Response('Offline', { status: 503 });
    }
  })());
});