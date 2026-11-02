self.addEventListener('install', (e) => {
  e.waitUntil(caches.open('gharbawy-v1').then((cache) => cache.addAll(['./', './index.html', './logo-01.png'])));
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((response) => response || fetch(e.request)));
});
