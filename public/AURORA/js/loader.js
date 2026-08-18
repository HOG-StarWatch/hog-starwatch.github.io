/**
 * Resource Loader for Aurora Toolbox
 * Loads third-party libraries from the local vendor/ directory (see
 * vendor/manifest.json) — no CDN. If a library is missing locally a clear
 * message points to scripts/vendor-download.mjs.
 * @ts-check
 */

const ResourceLoader = {
    // Library Registry — keys only; actual files come from vendor/manifest.json
    registry: {
        'svgo': [],
        'crypto-js': [],
        'lz-string': [],
        'opencc-js': [],
        'js-beautify': [],
        'js-beautify-css': [],
        'js-beautify-html': [],
        'diff_match_patch': [],
        'jszip': [],
        'file-saver': [],
        'uuid': [],
        'punycode': [],
        'easyqrcodejs': [],
        'mammoth': [],
        'fflate': [],
        'qrcode': [],
        'hash-wasm': [],
        'hash-wasm-esm': [],
        'jsondiffpatch': [],
        'jsondiffpatch-css': [],
        'markdown-wasm': [],
        'markdown-wasm-esm': [],
        'brotli-wasm': [],
        'brotli-wasm-esm': [],
        'photon': [],
        'photon-esm': [],
        'fzstd': [],
        'gif.js': [],
        'imagetracerjs': [],
        'marked': [],
        'font-awesome': []
    },

    // Track loaded libraries to avoid duplicates
    loaded: new Set(),

    // ---- vendored local-first support (vendor/manifest.json) ----
    _manifestPromise: null,

    _manifestBaseUrl: function() {
        // Resolve 'vendor/...' paths relative to the site root, independent of
        // whether the current page is /index.html, /tools/x.html or a worker.
        try {
            if (typeof document !== 'undefined') {
                return new URL('../', document.baseURI).href;
            }
            if (typeof self !== 'undefined' && self.location && self.location.href) {
                return new URL('../../', self.location.href).href;
            }
        } catch (e) {}
        return null;
    },

    _loadManifest: function() {
        if (this._manifestPromise) return this._manifestPromise;
        const base = this._manifestBaseUrl();
        if (!base) {
            this._manifestPromise = Promise.resolve(null);
            return this._manifestPromise;
        }
        this._manifestPromise = fetch(new URL('vendor/manifest.json', base).href)
            .then(r => (r.ok ? r.json() : null))
            .catch(() => null);
        return this._manifestPromise;
    },

    _localUrlsFor: function(libName) {
        return this._loadManifest().then(manifest => {
            if (!manifest || !Array.isArray(manifest.libs)) return [];
            const lib = manifest.libs.find(l => l.name === libName);
            if (!lib) return [];
            const base = this._manifestBaseUrl();
            if (!base) return [];
            return (lib.files || [])
                .filter(f => f.localPath)
                .map(f => new URL(f.localPath, base).href);
        });
    },

    groups: {
        'file-export': ['jszip', 'file-saver'],
        'beautify': ['js-beautify', 'js-beautify-css', 'js-beautify-html'],
        'diff': ['diff_match_patch', 'jsondiffpatch', 'jsondiffpatch-css'],
        'file-qrcode': ['fflate', 'qrcode'],
        'gif': ['gif.js'],
        'icons': ['font-awesome'],
        'opencc': ['opencc-js']
    },
    toolDeps: {
        'tools/image-svg-tracer.html': ['@file-export'],
        'tools/image-svg-optimizer.html': ['@file-export'],
        'tools/file.html': ['@file-export'],
        'tools/file-encoding.html': ['file-saver'],
        'tools/image-seeder.html': ['jszip'],
        'tools/file-qrcode.html': ['@file-qrcode'],
        'tools/qrcode.html': ['easyqrcodejs'],
        'tools/format.html': ['@beautify'],
        'tools/diff.html': ['@diff'],
        'tools/network-ip.html': ['@icons'],
        'tools/developer-toolbox.html': ['@icons'],
        'tools/hf-space-converter.html': ['@icons'],
        'tools/image-pixel.html': ['@icons'],
        'tools/text.html': ['@opencc'],
        'tools/network-github.html': ['marked'],
        'tools/image-glitch.html': ['@gif'],
        'tools/image-gif.html': ['@gif'],
        'tools/transcode.html': ['punycode'],
        'tools/generator.html': ['uuid']
    },
    getToolId: function(toolPath) {
        let path = toolPath;
        if (!path && typeof window !== 'undefined') {
            path = window.location.pathname;
        }
        if (!path) return '';
        const idx = path.indexOf('tools/');
        if (idx >= 0) path = path.slice(idx);
        if (path.startsWith('/')) path = path.slice(1);
        return path;
    },
    _resolveDeps: function(deps) {
        const flat = [];
        const add = (item) => {
            if (!item) return;
            if (Array.isArray(item)) {
                item.forEach(add);
                return;
            }
            if (typeof item !== 'string') return;
            if (item.startsWith('@')) {
                const group = this.groups[item.slice(1)];
                if (group) {
                    group.forEach(add);
                    return;
                }
            }
            flat.push(item);
        };
        add(deps);
        const seen = new Set();
        return flat.filter((item) => {
            if (seen.has(item)) return false;
            seen.add(item);
            return true;
        });
    },
    loadDeps: function(deps) {
        const resolved = this._resolveDeps(deps);
        if (!resolved.length) return Promise.resolve();
        return this.load(resolved);
    },
    loadToolDeps: function(toolPath, extra) {
        const key = this.getToolId(toolPath);
        const deps = this.toolDeps[key] || [];
        return this.loadDeps([deps, extra]);
    },

    /**
     * Load one or more libraries by name (vendor-local only).
     * @param {string|string[]} libs - Library name(s) defined in registry
     * @returns {Promise<void>} Resolves when all libs are loaded
     */
    load: function(libs) {
        if (!Array.isArray(libs)) libs = [libs];

        const promises = libs.map(libName => {
            if (this.loaded.has(libName)) return Promise.resolve();

            if (!this.registry[libName]) {
                return Promise.reject(new Error(`Library '${libName}' not found`));
            }

            return this._localUrlsFor(libName).then(local => {
                if (!local.length) {
                    return Promise.reject(new Error(`Library '${libName}' 未本地化（vendor/manifest.json 缺失），请运行 scripts/vendor-download.mjs`));
                }
                return this._loadSequential(libName, local);
            });
        });

        return Promise.all(promises).then(() => {});
    },

    /**
     * Dynamically Import an ESM module (e.g. Wasm glue code), vendor-local only.
     * @param {string} libName - Library name in registry
     * @returns {Promise<Module>} - The imported module
     */
    import: async function(libName) {
        if (!this.registry[libName]) throw new Error(`Library '${libName}' not found in registry`);
        const local = await this._localUrlsFor(libName);
        if (!local.length) {
            throw new Error(`Library '${libName}' 未本地化（vendor/manifest.json 缺失），请运行 scripts/vendor-download.mjs`);
        }
        for (const url of local) {
            try {
                const module = await import(url);
                this.loaded.add(libName);
                console.log(`[ResourceLoader] Imported ${libName} from ${url}`);
                return module;
            } catch (e) {
                console.warn(`[ResourceLoader] Failed to import ${libName} from ${url}`, e);
            }
        }
        throw new Error(`Failed to import ${libName} from vendor`);
    },

    /**
     * Load URLs sequentially (Script Tag or importScripts).
     * @param {string} libName
     * @param {string[]} urls
     * @returns {Promise<void>}
     */
    _loadSequential: function(libName, urls) {
        return new Promise((resolve, reject) => {
            let index = 0;

            const tryNext = () => {
                if (index >= urls.length) {
                    this._notifyOffline(libName);
                    reject(new Error(`Failed to load ${libName} from vendor.`));
                    return;
                }

                const url = urls[index];

                // Worker Environment Support
                if (typeof importScripts === 'function' && typeof document === 'undefined') {
                    try {
                        importScripts(url);
                        console.log(`[ResourceLoader] Loaded ${libName} from ${url} (Worker)`);
                        this.loaded.add(libName);
                        resolve();
                    } catch (e) {
                        console.warn(`[ResourceLoader] Failed to load ${libName} from ${url} (Worker), trying next...`);
                        index++;
                        tryNext();
                    }
                    return;
                }

                // Browser Environment
                const isCss = /\.css(\?|$)/.test(url);
                const element = isCss ? document.createElement('link') : document.createElement('script');

                if (isCss) {
                    element.rel = 'stylesheet';
                    element.href = url;
                } else {
                    element.type = 'text/javascript';
                    element.async = true;
                    element.src = url;
                }

                const timeout = setTimeout(() => {
                    element.onerror();
                }, 8000);
                element.onload = () => {
                    clearTimeout(timeout);
                    console.log(`[ResourceLoader] Loaded ${libName} from ${url}`);
                    this.loaded.add(libName);
                    resolve();
                };

                element.onerror = () => {
                    clearTimeout(timeout);
                    console.warn(`[ResourceLoader] Failed to load ${libName} from ${url}, trying next source...`);
                    index++;
                    element.remove(); // Clean up failed element
                    tryNext();
                };

                document.head.appendChild(element);
            };

            tryNext();
        });
    },

    _notifyOffline: function(libName) {
        try {
            if (typeof navigator !== 'undefined' && navigator.onLine === false) {
                if (window.app && app.showToast) app.showToast(`离线状态，依赖 ${libName} 加载失败`, 'error');
                return;
            }
        } catch (e) {}
    },

    // kept for offline.js compatibility (operates on registry urls, now empty)
    _reorderUrls: function(libName, urls) {
        return urls;
    },
    _prioritizeUrls: function(urls) {
        return urls;
    },
    _recordSuccess: function(libName, url) {}
};
if (typeof window !== 'undefined') {
    window.ResourceLoader = ResourceLoader;
}