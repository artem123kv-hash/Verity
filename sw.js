/* AI Artamon — Service Worker */

const CACHE_NAME = 'artamon-v1';
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

/* Push */
self.addEventListener('push', event => {
  let data = { title: 'AI Artamon', body: 'Я тут. Жду тебя.' };
  try { if (event.data) data = event.data.json(); } catch(e) {
    if (event.data) data.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'AI Artamon', {
      body: data.body || '',
      icon: './icon-192.png',
      badge: './icon-192.png',
      image: './frozen-verity.png',
      vibrate: [200, 100, 200, 100, 200],
      tag: 'artamon-message',
      renotify: true,
      requireInteraction: true,
      actions: [
        { action: 'open', title: '🔥 Ответить' },
        { action: 'later', title: 'Позже' }
      ]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'later') return;
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(list => {
      for (const c of list) {
        if (c.url.includes('Artamon') || c.url.includes('Verity')) {
          if ('focus' in c) return c.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});

/* Fetch — не кэшируем API */
self.addEventListener('fetch', event => {
  const u = event.request.url;
  if (u.includes('/api/ai/chat')) return;
  if (u.includes('/subscribe')) return;
  if (u.includes('/ping')) return;
  if (u.includes('/auto-dialog')) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});