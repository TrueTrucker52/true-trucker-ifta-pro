// TrueTrucker IFTA Pro Service Worker
// Version increment forces cache refresh on deploy
const CACHE_VERSION = 'v4';
const CACHE_NAME = `truetrucker-ifta-${CACHE_VERSION}`;

// Only cache actual files that exist - NOT SPA routes
// SPA routes like /dashboard will be handled by the app shell
const STATIC_CACHE = [
  '/lovable-uploads/truetrucker-app-icon.png',
  '/lovable-uploads/truetrucker-app-icon-512.png',
  '/lovable-uploads/ifta-favicon.png',
  '/manifest.json'
];

// Install event - cache critical assets with error handling
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching critical assets');
        // Use individual cache.add with error handling instead of addAll
        return Promise.allSettled(
          STATIC_CACHE.map((url) => 
            cache.add(url).catch((err) => {
              console.warn(`[SW] Failed to cache ${url}:`, err.message);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Fetch event - network-first for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Network-first for API calls and dynamic content
  if (url.pathname.startsWith('/api') || 
      url.pathname.includes('supabase') ||
      request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }
  
  // Stale-while-revalidate for everything else
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => cachedResponse);
        
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('truetrucker-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Background sync for offline trip logging
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-trips') {
    event.waitUntil(syncTrips());
  }
});

async function syncTrips() {
  console.log('[SW] Syncing offline trips...');
  // Placeholder for offline sync logic
}