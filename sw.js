// Service Worker for PhotoStore PWA
const CACHE_NAME = 'photostore-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/data.js',
    '/js/state.js',
    '/js/gallery.js',
    '/js/toast.js',
    '/js/auth.js',
    '/js/darkmode.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});
