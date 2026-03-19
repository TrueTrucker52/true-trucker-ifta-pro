// TrueTrucker IFTA Pro Service Worker v5
const CACHE_VERSION = 'v5';
const CACHE_NAME = `truetrucker-ifta-${CACHE_VERSION}`;

const STATIC_CACHE = [
  '/lovable-uploads/truetrucker-app-icon.png',
  '/lovable-uploads/truetrucker-app-icon-512.png',
  '/lovable-uploads/ifta-favicon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json',
  '/offline.html'
];

// Install — cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        STATIC_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Failed to cache ${url}:`, err.message);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n.startsWith('truetrucker-') && n !== CACHE_NAME)
          .map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — strategy per content type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin, non-GET, OAuth callbacks
  if (url.origin !== location.origin || request.method !== 'GET' || url.pathname.startsWith('/~oauth')) return;

  // API / Supabase — network only
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase')) {
    event.respondWith(fetch(request));
    return;
  }

  // Images & static assets — cache first
  if (/\.(png|jpg|jpeg|webp|svg|gif|ico|woff2?|ttf|css|js)$/.test(url.pathname) || url.pathname.startsWith('/icons/') || url.pathname.startsWith('/lovable-uploads/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          }).catch(() => cached);
        })
      )
    );
    return;
  }

  // HTML pages — network first, offline fallback
  event.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return res;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match('/offline.html'))
      )
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-trips') event.waitUntil(syncOfflineData('trips'));
  if (event.tag === 'sync-messages') event.waitUntil(syncOfflineData('messages'));
  if (event.tag === 'sync-receipts') event.waitUntil(syncOfflineData('receipts'));
});

async function syncOfflineData(type) {
  console.log(`[SW] Syncing offline ${type}...`);
  const clients = await self.clients.matchAll();
  clients.forEach((client) => client.postMessage({ type: 'SYNC_COMPLETE', dataType: type }));
}
