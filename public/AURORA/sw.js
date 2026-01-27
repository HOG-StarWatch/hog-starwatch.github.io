const CACHE_NAME = 'aurora-toolbox-v1';
const DYNAMIC_LIBS = [
    'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
    'https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js',
    'https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js',
    'https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.min.js',
    'https://unpkg.com/opencc-js@1.0.5/dist/umd/full.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.7/beautify.min.js',
    'https://cdn.jsdelivr.net/npm/js-beautify@1.14.7/js/lib/beautify.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.7/beautify-css.min.js',
    'https://cdn.jsdelivr.net/npm/js-beautify@1.14.7/js/lib/beautify-css.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.7/beautify-html.min.js',
    'https://cdn.jsdelivr.net/npm/js-beautify@1.14.7/js/lib/beautify-html.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/diff_match_patch/20121119/diff_match_patch.js',
    'https://cdn.bootcdn.net/ajax/libs/diff_match_patch/20121119/diff_match_patch.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js',
    'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/uuid/8.3.2/uuid.min.js',
    'https://cdn.jsdelivr.net/npm/uuid@8.3.2/dist/umd/uuid.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/punycode/1.4.1/punycode.min.js',
    'https://cdn.jsdelivr.net/npm/punycode@1.4.1/punycode.min.js',
    'https://cdn.jsdelivr.net/npm/easyqrcodejs@4.4.13/dist/easy.qrcode.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
    'https://cdn.jsdelivr.net/npm/fflate@0.8.0/umd/index.min.js',
    'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js'
];

const APP_SHELL = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/loader.js',
    './favicon.svg',
    './tools/home.html'
];

self.addEventListener('install', event => {
    self.skipWaiting(); // Force new SW to activate immediately
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[ServiceWorker] Pre-caching App Shell');
                return cache.addAll(APP_SHELL);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim()); // Take control of all clients immediately
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Cache First for Dynamic Libs (CDN)
    if (DYNAMIC_LIBS.includes(url.href) || DYNAMIC_LIBS.some(lib => url.href.startsWith(lib))) {
        event.respondWith(
            caches.match(event.request).then(response => {
                if (response) return response;
                return fetch(event.request).then(networkResponse => {
                    // Clone safely
                    try {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    } catch (e) { console.warn('Cache clone failed:', e); }
                    return networkResponse;
                });
            })
        );
        return;
    }

    // Stale-While-Revalidate for App Shell & Tools
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                try {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                } catch (e) { console.warn('Cache clone failed:', e); }
                return networkResponse;
            });
            return cachedResponse || fetchPromise;
        })
    );
});
