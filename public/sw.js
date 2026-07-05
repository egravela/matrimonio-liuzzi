const CACHE = 'et-wedding-v1';
const PRECACHE = ['/', '/carica', '/galleria'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // mai intercettare API/Storage Supabase o richieste non-GET (upload!)
  if (request.method !== 'GET' || url.hostname.endsWith('supabase.co')) return;

  // asset statici di Next: cache-first (hanno hash nel nome)
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const fresh = await fetch(request);
        if (fresh.ok) cache.put(request, fresh.clone());
        return fresh;
      }),
    );
    return;
  }

  // pagine: network-first con fallback alla cache (offline)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((fresh) => {
          const copy = fresh.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return fresh;
        })
        .catch(async () => (await caches.match(request)) ?? (await caches.match('/'))),
    );
  }
});
