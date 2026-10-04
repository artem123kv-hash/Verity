const CACHE_NAME = 'verity-v1';
const ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Не кэшируем запросы к API — они всегда должны идти в сеть
  if (e.request.url.includes('/api/ai/chat')) return;

  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});