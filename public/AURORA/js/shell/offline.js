/* ============================================================
 * Aurora Toolbox shell — offline.js
 * Offline cache preference manager: per-tool selection, dependency
 * resolution, cache size stats, clear-site-data. Attaches to
 * window.Shell.offline. Requires core.js (and loader.js) first.
 * ============================================================ */
(function () {
    'use strict';

    const OFFLINE_PREF_KEY = 'aurora_offline_optional_v1';
    const OFFLINE_REQUIRED = new Set(['./tools/home.html']);

    function normalizeToolUrl(url) {
        if (!url) return '';
        if (url.startsWith('./')) return url;
        if (url.startsWith('/')) return '.' + url;
        return './' + url;
    }

    function collectOfflineGroups() {
        const groups = [];
        const map = new Map();
        const seen = new Set();
        document.querySelectorAll('.tab-btn[data-src]').forEach(btn => {
            const raw = btn.dataset.src;
            const url = normalizeToolUrl(raw);
            if (!url || !url.endsWith('.html')) return;
            if (seen.has(url)) return;
            seen.add(url);
            let group = '基础';
            const dropdown = btn.closest('.dropdown');
            if (dropdown) {
                const toggle = dropdown.querySelector('.dropdown-toggle');
                if (toggle && toggle.innerText.trim()) group = toggle.innerText.trim();
            }
            if (!map.has(group)) {
                const entry = { group, items: [] };
                map.set(group, entry);
                groups.push(entry);
            }
            map.get(group).items.push({ url, label: btn.innerText.trim() || url });
        });
        return groups;
    }

    function getToolMetaMap() {
        const meta = new Map();
        const groups = collectOfflineGroups();
        groups.forEach(group => {
            group.items.forEach(item => {
                meta.set(item.url, { label: item.label, group: group.group });
            });
        });
        return meta;
    }

    function getAvailableOfflineUrls(groups) {
        const list = [];
        groups.forEach(g => g.items.forEach(item => list.push(item.url)));
        return list;
    }

    function buildToolDepsMap() {
        if (!window.ResourceLoader) return { toolDeps: new Map(), depUsage: new Map() };
        const loader = ResourceLoader;
        const toolDeps = new Map();
        const depUsage = new Map();
        const groups = collectOfflineGroups();
        const tools = [];
        groups.forEach(g => g.items.forEach(item => tools.push(item.url)));
        tools.forEach(toolUrl => {
            const key = loader.getToolId ? loader.getToolId(toolUrl) : toolUrl;
            const deps = (loader.toolDeps && loader.toolDeps[key]) ? loader.toolDeps[key] : [];
            const resolved = loader._resolveDeps ? loader._resolveDeps(deps) : deps;
            if (!resolved || !resolved.length) return;
            toolDeps.set(toolUrl, resolved);
            resolved.forEach(lib => {
                if (!depUsage.has(lib)) depUsage.set(lib, new Set());
                depUsage.get(lib).add(toolUrl);
            });
        });
        return { toolDeps, depUsage };
    }

    function getOfflinePrefs() {
        try {
            const raw = localStorage.getItem(OFFLINE_PREF_KEY);
            const list = JSON.parse(raw || '[]');
            return Array.isArray(list) ? list : [];
        } catch (e) {
            return [];
        }
    }

    function setOfflinePrefs(urls) {
        try {
            localStorage.setItem(OFFLINE_PREF_KEY, JSON.stringify(urls || []));
        } catch (e) {}
    }

    function toggleOfflineModal() {
        const modal = document.getElementById('offline-modal');
        if (modal.style.display === 'flex') {
            modal.style.opacity = '0';
            modal.querySelector('div').style.transform = 'scale(0.95)';
            setTimeout(() => modal.style.display = 'none', 300);
        } else {
            renderOfflineList();
            refreshOfflineStatus();
            modal.style.display = 'flex';
            modal.offsetHeight;
            modal.style.opacity = '1';
            modal.querySelector('div').style.transform = 'scale(1)';
            console.log('[Offline] modal opened');
        }
    }

    function renderOfflineList() {
        const container = document.getElementById('offline-list');
        if (!container) return;
        container.innerHTML = '';
        const groups = collectOfflineGroups();
        const available = new Set(getAvailableOfflineUrls(groups));
        const saved = getOfflinePrefs().filter(u => available.has(u));
        if (saved.length !== getOfflinePrefs().length) setOfflinePrefs(saved);
        const selected = new Set(saved);
        groups.forEach(group => {
            const wrap = document.createElement('div');
            const title = document.createElement('div');
            title.style.cssText = 'font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px; font-weight:600; margin-bottom:8px;';
            title.innerText = group.group;
            const grid = document.createElement('div');
            grid.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:10px;';
            group.items.forEach(item => {
                const label = document.createElement('label');
                label.style.cssText = 'display:flex; flex-direction:column; gap:6px; background:var(--bg-panel); border:1px solid var(--border); border-radius:var(--radius-sm); padding:8px 10px; cursor:pointer;';
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.dataset.url = item.url;
                cb.checked = selected.has(item.url) || OFFLINE_REQUIRED.has(item.url);
                if (OFFLINE_REQUIRED.has(item.url)) cb.disabled = true;
                const text = document.createElement('span');
                text.style.cssText = 'font-size:0.85rem; color:var(--text-main);';
                text.innerText = item.label;
                const badge = document.createElement('span');
                badge.dataset.url = item.url;
                badge.dataset.role = 'offline-badge';
                badge.style.cssText = 'font-size:0.7rem; color:var(--text-dim);';
                const info = document.createElement('span');
                info.style.cssText = 'font-size:0.7rem; color:var(--text-dim);';
                const deps = (buildToolDepsMap().toolDeps.get(item.url) || []).length;
                info.innerText = deps ? `依赖: ${deps}` : '';
                const row = document.createElement('div');
                row.style.cssText = 'display:flex; align-items:center; gap:8px;';
                row.appendChild(cb);
                row.appendChild(text);
                const meta = document.createElement('div');
                meta.style.cssText = 'display:flex; align-items:center; gap:10px;';
                meta.appendChild(badge);
                if (info.innerText) meta.appendChild(info);
                label.appendChild(row);
                label.appendChild(meta);
                grid.appendChild(label);
            });
            wrap.appendChild(title);
            wrap.appendChild(grid);
            container.appendChild(wrap);
        });
        if (!container.dataset.bound) {
            container.addEventListener('change', () => {
                const urls = getSelectedOfflineUrls(false);
                setOfflinePrefs(urls);
            });
            container.dataset.bound = '1';
        }
    }

    function getOfflineCheckboxes() {
        return Array.from(document.querySelectorAll('#offline-list input[type="checkbox"][data-url]'));
    }

    function getSelectedOfflineUrls(usePrefsFallback = true) {
        const selected = getOfflineCheckboxes().filter(cb => cb.checked && !cb.disabled).map(cb => cb.dataset.url);
        if (selected.length) return selected;
        if (!usePrefsFallback) return [];
        const prefs = getOfflinePrefs();
        return Array.isArray(prefs) ? prefs : [];
    }

    function setAllOfflineCheckboxes(checked) {
        getOfflineCheckboxes().forEach(cb => { if (!cb.disabled) cb.checked = checked; });
        const urls = getSelectedOfflineUrls(false);
        setOfflinePrefs(urls);
    }

    async function refreshOfflineStatus() {
        const status = document.getElementById('offline-status');
        if (!('caches' in window)) {
            if (status) status.innerText = '当前浏览器不支持缓存接口';
            return;
        }
        const badges = Array.from(document.querySelectorAll('#offline-list [data-role="offline-badge"]'));
        let cachedCount = 0;
        for (const badge of badges) {
            const url = badge.dataset.url;
            try {
                const abs = new URL(url, window.location.href).href;
                const match = await caches.match(abs);
                if (match) {
                    badge.innerText = '已缓存';
                    badge.style.color = 'var(--primary)';
                    cachedCount++;
                } else {
                    badge.innerText = '未缓存';
                    badge.style.color = 'var(--text-dim)';
                }
            } catch (e) {
                badge.innerText = '未知';
                badge.style.color = 'var(--text-dim)';
            }
        }
        if (status) status.innerText = `已缓存 ${cachedCount} / ${badges.length}`;
        showCacheStats();
    }

    async function getCacheName() {
        try {
            const names = await caches.keys();
            if (!names || !names.length) return '';
            const preferred = names.find(n => n.includes('aurora-toolbox'));
            return preferred || names[0];
        } catch (e) {
            return '';
        }
    }

    async function showCacheStats() {
        const summary = document.getElementById('offline-cache-summary');
        const details = document.getElementById('offline-cache-details');
        if (!('caches' in window)) {
            if (summary) summary.innerText = '缓存接口不可用';
            return;
        }
        try {
            const formatBytes = (value) => {
                if (value === 0) return '0 B';
                if (!value || Number.isNaN(value)) return '未知';
                const units = ['B', 'KB', 'MB', 'GB'];
                let v = value;
                let i = 0;
                while (v >= 1024 && i < units.length - 1) {
                    v /= 1024;
                    i++;
                }
                return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
            };
            let storageUsage = null;
            let storageQuota = null;
            if (navigator.storage && navigator.storage.estimate) {
                try {
                    const estimate = await navigator.storage.estimate();
                    storageUsage = estimate.usage;
                    storageQuota = estimate.quota;
                } catch (e) {}
            }
            const name = await getCacheName();
            if (!name) {
                if (summary) {
                    const usageText = storageUsage != null ? ` • 浏览器占用 ${formatBytes(storageUsage)}${storageQuota ? ` / ${formatBytes(storageQuota)}` : ''}` : '';
                    summary.innerText = `暂无缓存${usageText}`;
                }
                if (details) details.innerHTML = '';
                return;
            }
            const cache = await caches.open(name);
            const keys = await cache.keys();
            let total = 0;
            let unknownCount = 0;
            const group = {
                required: { count: 0, size: 0 },
                optional: { count: 0, size: 0 },
                cdn: { count: 0, size: 0 }
            };
            const requiredRel = [
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
                './js/ui/icons.js',
                './js/ui/worker-rpc.js',
                './js/ui/file-drop.js',
                './js/ui/result-card.js',
                './js/utils/canvas-utils.js',
                './favicon.svg',
                './tools/home.html'
            ];
            const requiredAbs = new Set(requiredRel.map(p => new URL(p, window.location.href).href));
            const items = [];
            for (const req of keys) {
                try {
                    const res = await cache.match(req);
                    let size = 0;
                    let known = false;
                    if (res && res.headers && res.headers.get('content-length')) {
                        const len = Number(res.headers.get('content-length'));
                        if (!Number.isNaN(len)) {
                            size = len;
                            total += len;
                            known = true;
                        }
                    }
                    if (!known && res && res.body && res.type !== 'opaque') {
                        const reader = res.body.getReader();
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            total += value.byteLength;
                            size += value.byteLength;
                        }
                        known = true;
                    }
                    if (!known) unknownCount++;
                    const u = new URL(req.url);
                    const isSame = u.origin === window.location.origin;
                    const isRequired = isSame && requiredAbs.has(req.url);
                    if (isSame) {
                        if (isRequired) {
                            group.required.count++;
                            group.required.size += size;
                        } else {
                            group.optional.count++;
                            group.optional.size += size;
                            items.push({ url: req.url, size });
                        }
                    } else {
                        group.cdn.count++;
                        group.cdn.size += size;
                        items.push({ url: req.url, size });
                    }
                } catch (e) {}
            }
            if (summary) {
                const usageText = storageUsage != null ? ` • 浏览器占用 ${formatBytes(storageUsage)}${storageQuota ? ` / ${formatBytes(storageQuota)}` : ''}` : '';
                summary.innerText = `必需项 ${group.required.count}（${formatBytes(group.required.size)}） • 可选项 ${group.optional.count}（${formatBytes(group.optional.size)}） • 可读总计 ${formatBytes(total)}${usageText}`;
            }
            if (details) {
                details.innerHTML = '';
                const reqLine = document.createElement('div');
                reqLine.innerText = `必须项：${group.required.count} 条 — ${formatBytes(group.required.size)}`;
                details.appendChild(reqLine);
                if (unknownCount) {
                    const unknownLine = document.createElement('div');
                    unknownLine.innerText = `未知大小：${unknownCount} 条`;
                    details.appendChild(unknownLine);
                }
                items.sort((a, b) => b.size - a.size);
                items.slice(0, 50).forEach(item => {
                    const div = document.createElement('div');
                    div.innerText = `${item.url}  —  ${formatBytes(item.size)}`;
                    details.appendChild(div);
                });
            }
        } catch (e) {
            if (summary) summary.innerText = '统计失败';
        }
    }

    function postOfflinePrefs(urls) {
        if (!('serviceWorker' in navigator)) return;
        const payload = { type: 'OFFLINE_PREFS', urls: urls || [] };
        navigator.serviceWorker.ready.then(reg => {
            const sw = navigator.serviceWorker.controller || reg.active;
            if (sw) sw.postMessage(payload);
        }).catch(() => {});
    }

    function syncOfflinePrefs() {
        const groups = collectOfflineGroups();
        const available = new Set(getAvailableOfflineUrls(groups));
        const prefs = getOfflinePrefs().filter(u => available.has(u));
        if (prefs.length !== getOfflinePrefs().length) setOfflinePrefs(prefs);
        postOfflinePrefs(prefs);
    }

    function applyOfflinePrefs() {
        const urls = getSelectedOfflineUrls(false);
        setOfflinePrefs(urls);
        postOfflinePrefs(urls);
        refreshOfflineStatus();
        const status = document.getElementById('offline-status');
        if (status) status.innerText = '正在应用选择并缓存...';
        if (window.app && app.showToast) app.showToast('已开始缓存选中工具与依赖');
    }

    async function clearSiteData() {
        const status = document.getElementById('offline-status');
        if (status) status.innerText = '正在清除网站数据...';
        try {
            const names = await caches.keys();
            await Promise.all(names.map(n => caches.delete(n)));
        } catch (e) {}
        try {
            if ('serviceWorker' in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                await Promise.all(regs.map(r => r.unregister()));
            }
        } catch (e) {}
        try {
            if (window.indexedDB && indexedDB.databases) {
                const dbs = await indexedDB.databases();
                await Promise.all((dbs || []).map(db => new Promise(resolve => {
                    try {
                        const req = indexedDB.deleteDatabase(db.name || '');
                        req.onsuccess = req.onerror = req.onblocked = () => resolve();
                    } catch (e) {
                        resolve();
                    }
                })));
            }
        } catch (e) {}
        try { localStorage.clear(); } catch (e) {}
        try { sessionStorage.clear(); } catch (e) {}
        if (status) status.innerText = '网站数据已清除';
        if (window.app && app.showToast) app.showToast('网站数据已清除');
        setTimeout(() => location.reload(), 200);
    }

    // ----- public API -----
    window.Shell.offline = {
        normalizeToolUrl,
        collectOfflineGroups,
        getToolMetaMap,
        getAvailableOfflineUrls,
        buildToolDepsMap,
        getOfflinePrefs,
        setOfflinePrefs,
        toggleOfflineModal,
        renderOfflineList,
        getOfflineCheckboxes,
        getSelectedOfflineUrls,
        setAllOfflineCheckboxes,
        refreshOfflineStatus,
        getCacheName,
        showCacheStats,
        postOfflinePrefs,
        syncPrefs: syncOfflinePrefs,
        applyPrefs: applyOfflinePrefs,
        clearSiteData,

        // Runs once from nav.js after all modules are loaded.
        init: function () {
            const byId = (id) => document.getElementById(id);

            // Close modal when clicking outside
            const offlineModal = byId('offline-modal');
            if (offlineModal) offlineModal.addEventListener('click', function (e) {
                if (e.target === this) toggleOfflineModal();
            });
            const statsRefresh = byId('offline-stats-refresh');
            if (statsRefresh) statsRefresh.addEventListener('click', showCacheStats);
        }
    };
})();