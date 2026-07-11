// ===================== PhotoStore PWA Service Worker =====================
// Version: 2.0 — Full offline-capable PWA
const CACHE_NAME = 'photostore-v2';
const STATIC_CACHE = 'photostore-static-v2';
const IMAGE_CACHE = 'photostore-images-v2';
const DYNAMIC_CACHE = 'photostore-dynamic-v2';

// Assets to pre-cache on install (core app shell)
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/styles.css',
    '/js/data.js',
    '/js/state.js',
    '/js/gallery.js',
    '/js/filters.js',
    '/js/search.js',
    '/js/trending.js',
    '/js/favorites.js',
    '/js/lightbox.js',
    '/js/download.js',
    '/js/infinite.js',
    '/js/loadMore.js',
    '/js/toast.js',
    '/js/auth.js',
    '/js/ai.js',
    '/js/darkmode.js',
    '/js/init.js',
    '/js/comments.js',
    '/js/ratings.js',
    '/js/tags.js',
    '/js/albums.js',
    '/js/notifications.js',
    '/js/dashboard.js',
    '/js/explore.js',
    '/js/filters-ui.js',
    '/js/batch-download.js',
    '/js/collage.js',
    '/js/i18n.js',
    '/js/themes.js',
    '/js/share.js',
    '/js/slideshow.js',
    '/js/music.js',
    '/js/profiles.js',
    '/js/parallax.js',
    '/js/videos.js',
    '/js/color-match.js',
    '/js/editor.js',
    '/js/heatmap.js',
    '/js/upload.js',
    '/js/chat.js'
];

// Install event - pre-cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        }).then(() => {
            // Skip waiting so the new SW activates immediately
            return self.skipWaiting();
        }).catch((err) => {
            console.error('Pre-cache failed (some assets may be missing):', err.message);
        })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    const validCaches = [CACHE_NAME, STATIC_CACHE, IMAGE_CACHE, DYNAMIC_CACHE];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (!validCaches.includes(name)) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => {
            // Take control of all clients immediately
            return self.clients.claim();
        })
    );
});

// Helper: is this a same-origin request?
function isSameOrigin(url) {
    return url.startsWith(self.location.origin) || url.startsWith('/');
}

// Helper: is this an image request?
function isImageRequest(url) {
    return url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|bmp|avif)(\?.*)?$/i) ||
           url.includes('picsum.photos') ||
           url.includes('pollinations.ai');
}

// Helper: is this an API request?
function isApiRequest(url) {
    return url.includes('/api/');
}

// Helper: is this a Google Fonts request?
function isGoogleFont(url) {
    return url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com');
}

// Helper: put item in cache with size limit
async function cacheWithLimit(cacheName, request, response, maxItems = 100) {
    const cache = await caches.open(cacheName);
    // Remove oldest entries if over limit
    const keys = await cache.keys();
    if (keys.length >= maxItems) {
        const oldest = keys.slice(0, keys.length - maxItems + 1);
        await Promise.all(oldest.map(key => cache.delete(key)));
    }
    cache.put(request, response.clone());
}

// Fetch event - smart caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = request.url;

    // Skip non-GET requests and browser extension requests
    if (request.method !== 'GET' || url.startsWith('chrome-extension://')) {
        return;
    }

    // Same-origin static assets: Cache-first strategy
    if (isSameOrigin(url) && !isApiRequest(url) && !isImageRequest(url)) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                return cachedResponse || fetch(request).then((response) => {
                    if (response.ok) {
                        const cacheCopy = response.clone();
                        caches.open(STATIC_CACHE).then((cache) => cache.put(request, cacheCopy));
                    }
                    return response;
                }).catch(() => {
                    // If offline and not cached, show fallback
                    return caches.match('/');
                });
            })
        );
        return;
    }

    // Image requests: Cache-first (picsum.photos, pollinations.ai, etc.)
    if (isImageRequest(url)) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;
                
                return fetch(request, { mode: 'cors' }).then((response) => {
                    if (response.ok) {
                        const cacheCopy = response.clone();
                        cacheWithLimit(IMAGE_CACHE, request, cacheCopy, 200);
                    }
                    return response;
                }).catch(() => {
                    // Return a placeholder SVG if image fails
                    return new Response(
                        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
                            <rect width="400" height="300" fill="#f0f0f0"/>
                            <text x="200" y="150" text-anchor="middle" fill="#999" font-size="16">Image offline</text>
                        </svg>`,
                        { headers: { 'Content-Type': 'image/svg+xml' } }
                    );
                });
            })
        );
        return;
    }

    // API requests: Network-first with timeout, fallback to cache or offline response
    if (isApiRequest(url)) {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        event.respondWith(
            fetch(request, { signal: controller.signal }).then((response) => {
                clearTimeout(timeoutId);
                if (response.ok) {
                    const cacheCopy = response.clone();
                    cacheWithLimit(DYNAMIC_CACHE, request, cacheCopy, 50);
                }
                return response;
            }).catch(async () => {
                // Try cache first
                clearTimeout(timeoutId);
                const cachedResponse = await caches.match(request);
                if (cachedResponse) return cachedResponse;
                
                // Return a JSON offline response for API calls
                return new Response(
                    JSON.stringify({ 
                        offline: true, 
                        error: 'Server is offline. Some features may be limited.',
                        message: 'Using offline data from local storage.'
                    }),
                    { 
                        headers: { 'Content-Type': 'application/json' },
                        status: 503
                    }
                );
            })
        );
        return;
    }

    // Google Fonts: Cache-first
    if (isGoogleFont(url)) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                return cachedResponse || fetch(request).then((response) => {
                    const cacheCopy = response.clone();
                    caches.open(STATIC_CACHE).then((cache) => cache.put(request, cacheCopy));
                    return response;
                });
            })
        );
        return;
    }

    // Everything else: Network-first, fallback to cache
    event.respondWith(
        fetch(request).then((response) => {
            if (response.ok) {
                const cacheCopy = response.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, cacheCopy));
            }
            return response;
        }).catch(async () => {
            const cachedResponse = await caches.match(request);
            return cachedResponse || new Response('Offline', { status: 503 });
        })
    );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
