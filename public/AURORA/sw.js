const CACHE_NAME = 'aurora-toolbox-v17';
const BASE_PATH = new URL('./', self.location).pathname;
const TOOL_PATH = BASE_PATH.endsWith('/') ? `${BASE_PATH}tools/` : `${BASE_PATH}/tools/`;
const LOADER_URL = BASE_PATH.endsWith('/') ? `${BASE_PATH}js/loader.js` : `${BASE_PATH}/js/loader.js`;

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

const EXTRA_CDN_KEY = './__offline_cdn_prefs__';
const TOOL_PREFS_KEY = './__offline_tool_prefs__';
let extraCdnLibs = new Set();
let extraToolUrls = new Set();
let dynamicLibs = [];

async function extractLibsFromLoader() {
    try {
        const res = await fetch(LOADER_URL);
        if (!res.ok) throw new Error('Failed to fetch loader');
        const text = await res.text();

        const libs = [];
        const seenUrls = new Set();

        const addUrl = (url) => {
            if (url && url.startsWith('http') && !seenUrls.has(url)) {
                seenUrls.add(url);
                libs.push(url);
            }
        };

        const libKeyPattern = /registry\s*=\s*\{([\s\S]*?)\n\s*\};/;
        const libBlockMatch = text.match(libKeyPattern);
        if (!libBlockMatch) {
            throw new Error('Could not find registry block');
        }
        const libBlock = libBlockMatch[1];

        const entryPattern = /'([a-z0-9-]+)':\s*\[([^\]]+)\]/gi;
        let entryMatch;
        while ((entryMatch = entryPattern.exec(libBlock)) !== null) {
            const [, libName, sourcesStr] = entryMatch;
            if (libName.startsWith('@') || libName === 'groups' || libName === 'loaded') continue;

            const urlPattern = /['"](https?:\/\/[^'"]+)['"]/g;
            let urlMatch;
            while ((urlMatch = urlPattern.exec(sourcesStr)) !== null) {
                addUrl(urlMatch[1]);
            }
        }

        const groupPattern = /groups\s*:\s*\{([\s\S]*?)\n\s*\}/;
        const groupBlockMatch = text.match(groupPattern);
        if (groupBlockMatch) {
            const groupBlock = groupBlockMatch[1];
            const groupEntryPattern = /'@([a-z-]+)':\s*\[([^\]]+)\]/gi;
            let groupEntry;
            while ((groupEntry = groupEntryPattern.exec(groupBlock)) !== null) {
                const [, groupName, depsStr] = groupEntry;
                const depPattern = /'([a-z0-9-]+)'/g;
                let depMatch;
                while ((depMatch = depPattern.exec(depsStr)) !== null) {
                    const dep = depMatch[1];
                    const depSearchPattern = new RegExp(`'${dep}':\\s*\\[([^\\]]+)\\]`);
                    const depBlockMatch = libBlock.match(depSearchPattern);
                    if (depBlockMatch) {
                        const urlsInDep = depBlockMatch[1].match(/['"](https?:\/\/[^'"]+)['"]/g) || [];
                        urlsInDep.forEach(u => addUrl(u.replace(/['"]/g, '')));
                    }
                }
            }
        }

        return libs;
    } catch (e) {
        console.warn('[ServiceWorker] Failed to extract libs from loader, using minimal set', e);
        return [
            'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        ];
    }
}

function normalizeToolUrl(url) {
    try {
        const abs = new URL(url, self.location.origin + BASE_PATH);
        if (abs.origin !== self.location.origin) return '';
        if (!abs.pathname.startsWith(TOOL_PATH)) return '';
        if (!abs.pathname.endsWith('.html')) return '';
        return abs.href;
    } catch (e) {
        return '';
    }
}

function normalizeCdnUrl(url) {
    try {
        const abs = new URL(url, self.location.origin + BASE_PATH);
        if (abs.origin === self.location.origin) return '';
        if (abs.protocol !== 'https:' && abs.protocol !== 'http:') return '';
        return abs.href;
    } catch (e) {
        return '';
    }
}

async function loadExtraCdnPrefs() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const res = await cache.match(EXTRA_CDN_KEY);
        if (!res) return;
        const data = await res.json();
        if (Array.isArray(data)) extraCdnLibs = new Set(data);
    } catch (e) {}
}

async function loadToolPrefs() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const res = await cache.match(TOOL_PREFS_KEY);
        if (!res) return;
        const data = await res.json();
        if (Array.isArray(data)) {
            extraToolUrls = new Set(data.map(normalizeToolUrl).filter(Boolean));
        }
    } catch (e) {}
}

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil((async () => {
        dynamicLibs = await extractLibsFromLoader();
        try {
            const cache = await caches.open(CACHE_NAME);
            console.log('[ServiceWorker] Pre-caching App Shell');
            for (const url of APP_SHELL) {
                try {
                    const abs = new URL(url, self.location.origin + BASE_PATH).href;
                    const res = await fetch(abs, { cache: 'reload' });
                    if (res && res.ok) await cache.put(abs, res);
                } catch (e) {}
            }
        } catch (e) {}
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        await caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        });
        await loadExtraCdnPrefs();
        await loadToolPrefs();
        dynamicLibs = await extractLibsFromLoader();
        await clients.claim();
    })());
});

self.addEventListener('message', event => {
    const data = event.data || {};

    if (data.type === 'REFRESH_ALL_CACHED') {
        event.waitUntil((async () => {
            dynamicLibs = await extractLibsFromLoader();
            const cache = await caches.open(CACHE_NAME);
            const keepTools = new Set(Array.from(extraToolUrls));
            const keepShell = new Set(APP_SHELL.map(u => {
                try { return new URL(u, self.location.origin + BASE_PATH).href; } catch (e) { return ''; }
            }).filter(Boolean));

            for (const url of APP_SHELL) {
                try {
                    const abs = new URL(url, self.location.origin + BASE_PATH).href;
                    const res = await fetch(abs, { cache: 'reload' });
                    if (res && res.ok) await cache.put(abs, res);
                } catch (e) {}
            }
            for (const url of keepTools) {
                try {
                    const res = await fetch(url, { cache: 'reload' });
                    if (res && (res.ok || res.type === 'opaque')) await cache.put(url, res);
                } catch (e) {}
            }
            const cdnKeep = new Set(Array.from(extraCdnLibs));
            for (const lib of cdnKeep) {
                try {
                    const res = await fetch(lib, { mode: 'no-cors' });
                    if (res && (res.ok || res.type === 'opaque')) await cache.put(lib, res);
                } catch (e) {}
            }
            const keys = await cache.keys();
            for (const req of keys) {
                try {
                    const u = new URL(req.url);
                    if (u.origin === self.location.origin) {
                        if (u.pathname.startsWith(TOOL_PATH) && !keepTools.has(u.href)) {
                            await cache.delete(req);
                        } else if (!keepShell.has(u.href) && !keepTools.has(u.href)) {
                            await cache.delete(req);
                        }
                        continue;
                    }
                    const keepCdn = cdnKeep.has(u.href);
                    if (!keepCdn) await cache.delete(req);
                } catch (e) {}
            }
            try {
                const list = await clients.matchAll({ includeUncontrolled: true });
                list.forEach(c => c.postMessage({ type: 'REFRESH_DONE' }));
            } catch (e) {}
        })());
        return;
    }

    if (data.type === 'REFRESH_SELECTED') {
        const urls = Array.isArray(data.urls) ? data.urls : [];
        const cdnUrls = Array.isArray(data.cdnUrls) ? data.cdnUrls : [];
        const normalized = urls.map(normalizeToolUrl).filter(Boolean);
        const cdnNormalized = cdnUrls.map(normalizeCdnUrl).filter(Boolean);
        event.waitUntil((async () => {
            const cache = await caches.open(CACHE_NAME);
            for (const url of normalized) {
                try {
                    const res = await fetch(url, { cache: 'reload' });
                    if (res && (res.ok || res.type === 'opaque')) await cache.put(url, res);
                } catch (e) {}
            }
            for (const lib of cdnNormalized) {
                try {
                    const res = await fetch(lib, { mode: 'no-cors' });
                    if (res && (res.ok || res.type === 'opaque')) await cache.put(lib, res);
                } catch (e) {}
            }
            try {
                const list = await clients.matchAll({ includeUncontrolled: true });
                list.forEach(c => c.postMessage({ type: 'REFRESH_DONE' }));
            } catch (e) {}
        })());
        return;
    }

    if (data.type === 'PURGE_CACHE') {
        event.waitUntil((async () => {
            await caches.delete(CACHE_NAME);
            const cache = await caches.open(CACHE_NAME);
            extraCdnLibs = new Set();
            extraToolUrls = new Set();
            for (const url of APP_SHELL) {
                try {
                    const abs = new URL(url, self.location.origin + BASE_PATH).href;
                    const res = await fetch(abs, { cache: 'reload' });
                    if (res && res.ok) await cache.put(abs, res);
                } catch (e) {}
            }
            try {
                await cache.put(EXTRA_CDN_KEY, new Response(JSON.stringify([]), {
                    headers: { 'Content-Type': 'application/json' }
                }));
            } catch (e) {}
            try {
                await cache.put(TOOL_PREFS_KEY, new Response(JSON.stringify([]), {
                    headers: { 'Content-Type': 'application/json' }
                }));
            } catch (e) {}
            try {
                const list = await clients.matchAll({ includeUncontrolled: true });
                list.forEach(c => c.postMessage({ type: 'PURGE_DONE' }));
            } catch (e) {}
        })());
        return;
    }

    if (data.type === 'REBUILD_CACHE') {
        const urls = Array.isArray(data.urls) ? data.urls : [];
        const cdnUrls = Array.isArray(data.cdnUrls) ? data.cdnUrls : [];
        const normalized = urls.map(normalizeToolUrl).filter(Boolean);
        const cdnNormalized = cdnUrls.map(normalizeCdnUrl).filter(Boolean);
        event.waitUntil((async () => {
            await caches.delete(CACHE_NAME);
            const cache = await caches.open(CACHE_NAME);
            dynamicLibs = await extractLibsFromLoader();
            extraCdnLibs = new Set(cdnNormalized);
            extraToolUrls = new Set(normalized);
            try {
                await cache.put(EXTRA_CDN_KEY, new Response(JSON.stringify(cdnNormalized), {
                    headers: { 'Content-Type': 'application/json' }
                }));
            } catch (e) {}
            try {
                await cache.put(TOOL_PREFS_KEY, new Response(JSON.stringify(Array.from(extraToolUrls)), {
                    headers: { 'Content-Type': 'application/json' }
                }));
            } catch (e) {}
            for (const url of APP_SHELL) {
                try {
                    const abs = new URL(url, self.location.origin + BASE_PATH).href;
                    const res = await fetch(abs, { cache: 'reload' });
                    if (res && res.ok) await cache.put(abs, res);
                } catch (e) {}
            }
            try {
                const list = await clients.matchAll({ includeUncontrolled: true });
                list.forEach(c => c.postMessage({ type: 'REBUILD_DONE' }));
            } catch (e) {}
        })());
        return;
    }

    if (data.type !== 'OFFLINE_PREFS') return;
    const urls = Array.isArray(data.urls) ? data.urls : [];
    const cdnUrls = Array.isArray(data.cdnUrls) ? data.cdnUrls : [];
    const normalized = urls.map(normalizeToolUrl).filter(Boolean);
    const keep = new Set(normalized);
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cdnNormalized = cdnUrls.map(normalizeCdnUrl).filter(Boolean);
        extraCdnLibs = new Set(cdnNormalized);
        try {
            await cache.put(EXTRA_CDN_KEY, new Response(JSON.stringify(cdnNormalized), {
                headers: { 'Content-Type': 'application/json' }
            }));
        } catch (e) {}
        extraToolUrls = new Set(normalized);
        try {
            await cache.put(TOOL_PREFS_KEY, new Response(JSON.stringify(Array.from(extraToolUrls)), {
                headers: { 'Content-Type': 'application/json' }
            }));
        } catch (e) {}
        for (const url of normalized) {
            try {
                const res = await fetch(url, { cache: 'reload' });
                if (res && res.ok) await cache.put(url, res);
            } catch (e) {}
        }
        for (const lib of extraCdnLibs) {
            try {
                const res = await fetch(lib, { mode: 'no-cors' });
                if (res && (res.ok || res.type === 'opaque')) {
                    await cache.put(lib, res);
                }
            } catch (e) {}
        }
        const keys = await cache.keys();
        for (const req of keys) {
            try {
                const u = new URL(req.url);
                if (u.origin === self.location.origin) {
                    if (u.pathname.startsWith(TOOL_PATH) && !keep.has(u.href)) {
                        await cache.delete(req);
                        continue;
                    }
                    const keepShell = new Set(APP_SHELL.map(p => new URL(p, self.location.origin + BASE_PATH).href));
                    if (!keepShell.has(u.href) && !keep.has(u.href)) {
                        await cache.delete(req);
                    }
                    continue;
                }
                const keepCdn = dynamicLibs.some(lib => u.href.startsWith(lib)) || extraCdnLibs.has(u.href);
                if (!keepCdn) await cache.delete(req);
            } catch (e) {}
        }
    })());
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    const isSameOrigin = url.origin === self.location.origin;
    const isCdnLib = dynamicLibs.some(lib => url.href.startsWith(lib)) || extraCdnLibs.has(url.href);
    const isProxyService = url.hostname.includes('cors') || url.hostname.includes('allorigins') || url.hostname.includes('thingproxy') || url.hostname.includes('codetabs');

    if (isProxyService || (!isSameOrigin && !isCdnLib)) {
        return;
    }

    const isHtml = event.request.destination === 'document' || url.pathname.endsWith('.html');

    if (isSameOrigin && isHtml) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return fetch(event.request).then(networkResponse => {
                    if (networkResponse.ok) {
                        try { cache.put(event.request, networkResponse.clone()); } catch (e) {}
                    }
                    return networkResponse;
                }).catch(() => {
                    return cache.match(event.request).then(cached => {
                        if (cached) return cached;
                        const homeUrl = new URL('tools/home.html', self.location.origin + BASE_PATH).href;
                        const indexUrl = new URL('index.html', self.location.origin + BASE_PATH).href;
                        return cache.match(homeUrl).then(homeCached => {
                            if (homeCached) return homeCached;
                            return cache.match(indexUrl);
                        });
                    });
                });
            })
        );
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    if (networkResponse.ok || networkResponse.type === 'opaque') {
                        try { cache.put(event.request, networkResponse.clone()); } catch (e) {}
                    }
                    return networkResponse;
                }).catch(() => {
                    if (cachedResponse) return cachedResponse;
                    if (event.request.destination === 'script' || event.request.destination === 'style') {
                        return new Response('', { status: 204 });
                    }
                    return new Response('', { status: 504, statusText: 'Network error' });
                });
                return cachedResponse || fetchPromise;
            });
        })
    );
});