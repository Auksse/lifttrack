const CACHE = 'lifttrack-v5';
const BASE = '/lifttrack';

// Files always fetched fresh from network (app code that changes)
const NETWORK_FIRST = [
  BASE + '/app.js',
  BASE + '/style.css',
  BASE + '/exerciseDatabase.js',
  BASE + '/index.html',
  BASE + '/',
];

// Static assets cached indefinitely (icons, manifest)
const STATIC_ASSETS = [
  BASE + '/manifest.json',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => {
        self.clients.matchAll({ type: 'window' }).then(clients => {
          clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
        });
      })
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // External CDN / fonts: always network, no cache
  if (url.hostname.includes('cdn.jsdelivr') || url.hostname.includes('fonts.')) {
    e.respondWith(fetch(e.request).catch(() => new Response('offline', { status: 503 })));
    return;
  }

  // App files: network-first so updates are always picked up when online
  const isNetworkFirst = NETWORK_FIRST.some(p => url.pathname === p || url.pathname.endsWith(p));
  if (isNetworkFirst) {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Everything else (data files, exercise assets): cache-first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }))
  );
});
