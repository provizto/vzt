const CACHE_NAME = 'vzt-dashboard-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css', // Sesuaikan dengan nama file CSS Anda
  '/icon-192.png',
  '/icon-512.png'
];

// Tahap Instalasi: Menyimpan aset ke dalam cache browser
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Tahap Fetch: Mengambil data dari cache jika jaringan offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
