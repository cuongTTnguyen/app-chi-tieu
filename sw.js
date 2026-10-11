/* Finance Buddy PWA service worker. Bump CACHE_NAME when publishing a new package. */
const CACHE_NAME = 'finance-buddy-g5-ui-v2';
const APP_SHELL = [
  './', './index.html', './tai-khoan.html', './edit.html', './user.html',
  './app.js', './layout.js', './style.css', './firebase-config.js',
  './firebase-sync.js', './manifest.json', './icon-192.png', './icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('finance-buddy-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(request).then(cached => {
    if (cached) return cached;
    return fetch(request).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }).catch(() => caches.match('./index.html'));
  }));
});
