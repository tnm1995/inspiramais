/// <reference lib="webworker" />

// This is a basic service worker for offline caching.

const CACHE_NAME = 'inspira-cache-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/index.js', // Ensure the main script is cached as .js
  '/vite.svg', // App icon
  'https://cdn.tailwindcss.com', // Tailwind CSS CDN
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap', // Font CSS
  'https://fonts.gstatic.com', // Font assets
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0', // Material Icons CSS
  // Add other critical static assets here
];

// Cache all the static assets on install
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache during install:', error);
      })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and can only be consumed once. We need to consume it
            // once to cache it and once by the browser for use.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(error => {
        console.error('Fetch failed; returning offline page or generic fallback:', error);
        // This is where you could return an offline page
        // For now, it will just let the browser handle the network error
        return new Response('Offline Content Here', { headers: { 'Content-Type': 'text/plain' } });
      })
  );
});

// Update a service worker
self.addEventListener('activate', (event: ExtendableEvent) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});