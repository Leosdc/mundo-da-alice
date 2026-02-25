const CACHE_NAME = 'biblioteca-v6.6.0';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './js/app.js',
    './js/state.js',
    './js/ui.js',
    './js/auth.js',
    './js/database.js',
    './js/ai.js',
    './js/utils.js',
    './js/constants.js',
    './manifest.json',
    './icon.png'
];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((res) => {
            return res || fetch(e.request);
        })
    );
});
