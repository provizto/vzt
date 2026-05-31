// Service Worker Minimalis untuk Syarat PWA Android
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    // Membiarkan dApp mengambil data secara online seperti biasa
    event.respondWith(fetch(event.request));
});
