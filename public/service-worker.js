/// <reference lib="webworker" />

const CACHE_NAME = 'inspira-cache-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/icon-192.png',
  '/icon-512.png'
];

// INSTALL
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// FETCH
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request)
          .then((res) => {
            if (!res || res.status !== 200) return res;

            const cloned = res.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, cloned);
            });

            return res;
          })
          .catch(() => new Response("Offline"))
      );
    })
  );
});

// ACTIVATE
self.addEventListener('activate', (event) => {
  const whitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((n) => {
          if (!whitelist.includes(n)) return caches.delete(n);
        })
      )
    )
  );
});
