// service-worker.js
const CACHE = 'zahn-jonas-v2';
const ASSETS = [
  './', './index.html', './styles.css', './manifest.webmanifest',
  './src/app.js', './src/kai-config.js', './src/kai-sequence.js', './src/timer.js',
  './src/progress.js', './src/schedule.js', './src/speeches.js', './src/push-client.js',
  './src/svg/hero.js', './src/svg/mouth.js', './src/svg/ring.js',
  './src/svg/cauldron.js', './src/svg/village.js',
  './assets/icon-192.png', './assets/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});

// Push-Empfang: elmex-Erinnerung
self.addEventListener('push', (e) => {
  let data = { title: 'elmex-Tag!', body: 'Heute ist elmex-Tag, Jonas!' };
  try { if (e.data) data = e.data.json(); } catch { /* default */ }
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: './assets/icon-192.png',
    badge: './assets/icon-192.png',
    vibrate: [200, 100, 200],
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.openWindow('./index.html'));
});
