const CACHE_NAME = 'trip-planner-v2';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './js/main.js',
  './js/storage.js',
  './js/events.js',
  './js/map.js',
  './js/config.js',
  './js/ui.js',
  './js/trips.js',
  './js/expenses.js',
  './js/checklist.js',
  './js/search.js',
  './js/importExport.js',
  './js/onboarding.js',
  './js/pwa.js',
  './js/share.js',
  './js/theme.js',
  './js/timeline.js',
  './navigation.js'
];

// Install event - cache assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => {
        console.log('Some assets failed to cache:', err);
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (e) => {
  // Skip non-GET requests
  if (e.request.method !== 'GET') return;
  
  // Skip external requests
  if (!e.request.url.startsWith(self.location.origin)) return;
  
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Return cached response or fetch from network
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        // Clone the response for caching
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseClone);
        });
        return networkResponse;
      }).catch(() => {
        // Return offline page for navigation requests
        if (e.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return null;
      });
      
      return response || fetchPromise;
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Message handler for skip waiting
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});