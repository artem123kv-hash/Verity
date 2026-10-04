/* Verity Service Worker — обработка пушей */

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

/* Приём пуш-уведомлений */
self.addEventListener('push', event => {
  let data = { title: 'Verity', body: 'Я тут. Жду тебя.' };
  try {
    if (event.data) data = event.data.json();
  } catch(e) {
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Verity', {
      body: data.body || '',
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'verity-message',
      renotify: true
    })
  );
});

/* Клик по уведомлению — открыть сайт */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('Verity') && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});

/* Не кэшируем API — всегда свежие данные */
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/ai/chat')) return;
  if (event.request.url.includes('/subscribe')) return;
  if (event.request.url.includes('/ping')) return;
});
