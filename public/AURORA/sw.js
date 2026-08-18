/* ============================================================
 * Aurora Toolbox — Service Worker（无 CDN：全部资源同源本地）
 *  - install:  预缓存 APP_SHELL + vendor（读 vendor/manifest.json）
 *  - 工具偏好:  离线面板勾选工具 → 缓存其 html + 本地 css/js/worker（cacheToolGraph）
 *  - prune:     只删除"未勾选工具"及其专属 js/css；共享/壳/vendor/worker 永不清
 *  - fetch:     html 网络优先（失败回缓存）；其余同源 缓存优先 + 网络回填
 * ============================================================ */
const CACHE_NAME = 'aurora-toolbox-v21';
const BASE_PATH = new URL('./', self.location).pathname;
const TOOL_PATH = BASE_PATH.endsWith('/') ? `${BASE_PATH}tools/` : `${BASE_PATH}/tools/`;

const APP_SHELL = [
    './',
    './index.html',
    './css/style.css',
    './css/shell/layout.css',
    './css/shell/modals.css',
    './js/app.js',
    './js/theme-boot.js',
    './js/loader.js',
    './js/perf-monitor.js',
    './js/shell/core.js',
    './js/shell/theme.js',
    './js/shell/offline.js',
    './js/shell/nav.js',
    './js/ui/worker-rpc.js',
    './js/ui/file-drop.js',
    './js/ui/result-card.js',
    './js/ui/icons.js',
    './js/utils/canvas-utils.js',
    './favicon.svg',
    './tools/home.html'
];

const TOOL_PREFS_KEY = './__offline_tool_prefs__';
let extraToolUrls = new Set();

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

function toolBaseName(htmlUrl) {
    try {
        const m = new URL(htmlUrl).pathname.match(/tools\/([\w][\w.-]*)\.html$/);
        return m ? m[1] : '';
    } catch (e) { return ''; }
}

async function loadToolPrefs() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const res = await cache.match(TOOL_PREFS_KEY);
        if (!res) return;
        const data = await res.json();
        if (Array.isArray(data)) extraToolUrls = new Set(data.map(normalizeToolUrl).filter(Boolean));
    } catch (e) {}
}

async function precacheVendor(cache) {
    // Pre-cache every vendored library listed in vendor/manifest.json
    try {
        const manifestUrl = new URL('vendor/manifest.json', self.location.origin + BASE_PATH).href;
        const res = await fetch(manifestUrl);
        if (!res.ok) return;
        const manifest = await res.json();
        const base = new URL('./', self.location.origin + BASE_PATH).href;
        for (const lib of (manifest.libs || [])) {
            for (const f of (lib.files || [])) {
                if (!f.localPath) continue;
                try {
                    const abs = new URL(f.localPath, base).href;
                    const fres = await fetch(abs, { cache: 'reload' });
                    if (fres && fres.ok) await cache.put(abs, fres);
                } catch (e) {}
            }
        }
    } catch (e) {}
}

async function cacheToolGraph(cache, htmlUrl) {
    // Cache a tool page's same-origin local assets (css/tools/x.css,
    // js/tools/x.js, js/workers/*.worker.js, js/utils/*) so "select for
    // offline" works even for tools never visited.
    let res;
    try { res = await fetch(htmlUrl, { cache: 'reload' }); } catch (e) { return; }
    if (!res.ok) return;
    try { await cache.put(htmlUrl, res.clone()); } catch (e) {}
    const text = await res.text();
    const refRe = /(?:src|href)="([^"]+)"/g;
    const found = new Set();
    for (const m of text.matchAll(refRe)) {
        const u = m[1];
        if (/^(?:https?:)?\/\//.test(u)) continue;
        if (/^(?:data:|#|javascript:|mailto:)/.test(u)) continue;
        try {
            const abs = new URL(u.replace(/^\.\//, ''), htmlUrl).href;
            if (new URL(abs).origin !== self.location.origin) continue;
            if (/\.(?:js|mjs|css|json)$/.test(new URL(abs).pathname)) found.add(abs);
        } catch (e) {}
    }
    for (const abs of found) {
        try {
            const r = await fetch(abs, { cache: 'reload' });
            if (r && r.ok) await cache.put(abs, r);
        } catch (e) {}
    }
}

// Remove only deselected tools: their entry html + per-tool js/css assets.
// Never touches shell, shared assets, vendor/, workers, utils, theme-data.
async function pruneDeselectedTools(cache, keptToolNames) {
    const keys = await cache.keys();
    const assetRe = /(?:js|css)\/tools\/([\w][\w.-]*?)(?:__\d+)?\.(?:js|css)$/;
    for (const req of keys) {
        try {
            const u = new URL(req.url);
            if (u.origin !== self.location.origin) continue;
            if (u.pathname.startsWith(TOOL_PATH) && u.pathname.endsWith('.html')) {
                if (!keptToolNames.has(toolBaseName(u.href))) await cache.delete(req);
                continue;
            }
            const m = u.pathname.match(assetRe);
            if (m && !keptToolNames.has(m[1])) await cache.delete(req);
        } catch (e) {}
    }
}

async function cacheToolsAndGraph(cache, normalized) {
    for (const url of normalized) {
        try {
            const res = await fetch(url, { cache: 'reload' });
            if (res && res.ok) await cache.put(url, res);
        } catch (e) {}
        await cacheToolGraph(cache, url);
    }
}

async function writeToolPrefs(cache, urls) {
    try {
        await cache.put(TOOL_PREFS_KEY, new Response(JSON.stringify(urls), {
            headers: { 'Content-Type': 'application/json' }
        }));
    } catch (e) {}
}

async function notice(type) {
    try {
        const list = await clients.matchAll({ includeUncontrolled: true });
        list.forEach((c) => c.postMessage({ type }));
    } catch (e) {}
}

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        for (const url of APP_SHELL) {
            try {
                const abs = new URL(url, self.location.origin + BASE_PATH).href;
                const res = await fetch(abs, { cache: 'reload' });
                if (res && res.ok) await cache.put(abs, res);
            } catch (e) {}
        }
        await precacheVendor(cache);
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        await caches.keys().then(names => Promise.all(names.map(n => {
            if (n !== CACHE_NAME) return caches.delete(n);
        })));
        await loadToolPrefs();
        await clients.claim();
    })());
});

self.addEventListener('message', event => {
    const data = event.data || {};

    const applyOffline = (urls, doneType) => event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        const normalized = urls.map(normalizeToolUrl).filter(Boolean);
        extraToolUrls = new Set(normalized);
        await writeToolPrefs(cache, Array.from(normalized));
        await cacheToolsAndGraph(cache, normalized);
        await pruneDeselectedTools(cache, new Set(normalized.map(toolBaseName)));
        if (doneType) await notice(doneType);
    })());

    if (data.type === 'OFFLINE_PREFS') {
        applyOffline(data.urls || [], '');
        return;
    }
    if (data.type === 'REFRESH_SELECTED') {
        applyOffline(data.urls || [], 'REFRESH_DONE');
        return;
    }
    if (data.type === 'REFRESH_ALL_CACHED') {
        event.waitUntil((async () => {
            const cache = await caches.open(CACHE_NAME);
            await cacheToolsAndGraph(cache, Array.from(extraToolUrls));
            for (const url of APP_SHELL) {
                try {
                    const abs = new URL(url, self.location.origin + BASE_PATH).href;
                    const res = await fetch(abs, { cache: 'reload' });
                    if (res && res.ok) await cache.put(abs, res);
                } catch (e) {}
            }
            await precacheVendor(cache);
            await pruneDeselectedTools(cache, new Set(Array.from(extraToolUrls).map(toolBaseName)));
            await notice('REFRESH_DONE');
        })());
        return;
    }
    if (data.type === 'PURGE_CACHE') {
        event.waitUntil((async () => {
            await caches.delete(CACHE_NAME);
            const cache = await caches.open(CACHE_NAME);
            extraToolUrls = new Set();
            for (const url of APP_SHELL) {
                try {
                    const abs = new URL(url, self.location.origin + BASE_PATH).href;
                    const res = await fetch(abs, { cache: 'reload' });
                    if (res && res.ok) await cache.put(abs, res);
                } catch (e) {}
            }
            await precacheVendor(cache);
            await writeToolPrefs(cache, []);
            await notice('PURGE_DONE');
        })());
        return;
    }
    if (data.type === 'REBUILD_CACHE') {
        event.waitUntil((async () => {
            await caches.delete(CACHE_NAME);
            const cache = await caches.open(CACHE_NAME);
            const normalized = (data.urls || []).map(normalizeToolUrl).filter(Boolean);
            extraToolUrls = new Set(normalized);
            await writeToolPrefs(cache, normalized);
            for (const url of APP_SHELL) {
                try {
                    const abs = new URL(url, self.location.origin + BASE_PATH).href;
                    const res = await fetch(abs, { cache: 'reload' });
                    if (res && res.ok) await cache.put(abs, res);
                } catch (e) {}
            }
            await precacheVendor(cache);
            await cacheToolsAndGraph(cache, normalized);
            await notice('REBUILD_DONE');
        })());
        return;
    }
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    const isHtml = event.request.destination === 'document' || url.pathname.endsWith('.html');

    if (isHtml) {
        // 网络优先，失败回缓存；命中缓存时回写
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
                        return cache.match(homeUrl).then(homeCached => homeCached || cache.match(indexUrl));
                    });
                });
            })
        );
        return;
    }

    // 其余同源资源：缓存优先，未命中则网络并回填
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