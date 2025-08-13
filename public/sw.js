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

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
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