const CACHE_NAME = 'aurora-toolbox-v3';
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
    'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js',
    'https://cdn.jsdelivr.net/npm/hash-wasm@4.9.0/dist/index.umd.min.js',
    'https://cdn.jsdelivr.net/npm/jsondiffpatch@0.4.1/dist/jsondiffpatch.umd.min.js',
    'https://cdn.jsdelivr.net/npm/jsondiffpatch@0.4.1/dist/formatters-styles/html.css',
    'https://unpkg.com/brotli-wasm@1.3.1/index.web.js',
    'https://unpkg.com/brotli-wasm@1.3.1/brotli_wasm_bg.wasm',
    'https://cdn.jsdelivr.net/npm/markdown-wasm/dist/markdown.js',
    'https://cdn.jsdelivr.net/npm/markdown-wasm/dist/markdown.wasm',
    'https://cdn.jsdelivr.net/npm/@silvia-odwyer/photon@0.3.2/photon_rs.js',
    'https://cdn.jsdelivr.net/npm/@silvia-odwyer/photon@0.3.2/photon_rs_bg.wasm',
    'https://unpkg.com/zstd-wasm@0.0.21/dist/zstd-wasm.js',
    'https://unpkg.com/zstd-wasm@0.0.21/dist/zstd-wasm.wasm',
    'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.2/marked.min.js',
    'https://unpkg.com/marked@9.1.2/marked.min.js'
];

const APP_SHELL = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/loader.js',
    './js/perf-monitor.js',
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
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Bypass SW for API/Proxy requests (prevent CORS issues and caching of dynamic data)
    // We only cache same-origin assets and specific CDNs
    const isSameOrigin = url.origin === self.location.origin;
    const isCdnLib = DYNAMIC_LIBS.some(lib => url.href.startsWith(lib));
    
    // Explicitly exclude known proxy services to be safe
    const isProxyService = url.hostname.includes('cors') || 
                          url.hostname.includes('allorigins') || 
                          url.hostname.includes('thingproxy') ||
                          url.hostname.includes('codetabs');

    if (isProxyService || (!isSameOrigin && !isCdnLib)) {
        return; // Fallback to browser's default network behavior
    }

    // Stale-While-Revalidate Strategy
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    // Update cache with new response
                    if (networkResponse.ok) {
                        try {
                            cache.put(event.request, networkResponse.clone());
                        } catch (e) { console.warn('Cache update failed:', e); }
                    }
                    return networkResponse;
                }).catch(err => {
                    console.warn('Network fetch failed:', err);
                    // If cachedResponse exists, this error is swallowed (we use stale data).
                    // If cachedResponse is undefined, we need to make sure we don't return undefined to respondWith.
                    // However, returning undefined here causes the outer promise to resolve to undefined,
                    // which is then caught by 'return cachedResponse || fetchPromise' ??
                    // Actually, if catch returns undefined, fetchPromise resolves to undefined.
                    // If cachedResponse is undefined, then 'undefined || undefined' is undefined.
                    // respondWith(undefined) throws.
                    
                    // We must throw here if we want the outer catch/fallback to handle it, 
                    // or return a fallback response.
                    if (cachedResponse) return; // Swallowing error is fine if we have cache
                    throw err; // Re-throw if no cache so browser sees network error
                });

                return cachedResponse || fetchPromise;
            });
        })
    );
});
