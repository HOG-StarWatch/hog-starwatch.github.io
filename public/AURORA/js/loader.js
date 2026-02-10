/**
 * Resource Loader for Aurora Toolbox
 * Handles dynamic loading of third-party libraries with caching, dependency management, and multi-source fallback.
 * @ts-check
 */

const ResourceLoader = {
    // Library Registry with Multi-Source Support
    registry: {
        'svgo': [
            'https://esm.sh/svgo@2.8.0',
            'https://cdn.skypack.dev/svgo@2.8.0',
            'https://unpkg.com/svgo@2.8.0?module',
            'https://cdn.jsdelivr.net/npm/svgo@2.8.0/dist/svgo.browser.js'
        ],
        'crypto-js': [
            'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
            'https://cdn.staticfile.org/crypto-js/4.1.1/crypto-js.min.js',
            'https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.js',
            'https://unpkg.com/crypto-js@4.1.1/crypto-js.js',
            'https://npm.elemecdn.com/crypto-js@4.1.1/crypto-js.js',
            'https://lib.baomitu.com/crypto-js/4.1.1/crypto-js.min.js',
            'https://cdn.bootcdn.net/ajax/libs/crypto-js/4.1.1/crypto-js.min.js'
        ],
        'lz-string': [
            'https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js',
            'https://cdn.staticfile.org/lz-string/1.4.4/lz-string.min.js',
            'https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js',
            'https://unpkg.com/lz-string@1.4.4/libs/lz-string.min.js',
            'https://npm.elemecdn.com/lz-string@1.4.4/libs/lz-string.min.js',
            'https://lib.baomitu.com/lz-string/1.4.4/lz-string.min.js',
            'https://cdn.bootcdn.net/ajax/libs/lz-string/1.4.4/lz-string.min.js'
        ],
        'opencc-js': [
            'https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.min.js',
            'https://unpkg.com/opencc-js@1.0.5/dist/umd/full.min.js',
            'https://npm.elemecdn.com/opencc-js@1.0.5/dist/umd/full.min.js',
            'https://fastly.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.min.js'
        ],
        'js-beautify': [
            'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.7/beautify.min.js',
            'https://cdn.staticfile.org/js-beautify/1.14.7/beautify.min.js',
            'https://cdn.jsdelivr.net/npm/js-beautify@1.14.7/js/lib/beautify.js',
            'https://unpkg.com/js-beautify@1.14.7/js/lib/beautify.js',
            'https://npm.elemecdn.com/js-beautify@1.14.7/js/lib/beautify.js',
            'https://lib.baomitu.com/js-beautify/1.14.7/beautify.min.js',
            'https://cdn.bootcdn.net/ajax/libs/js-beautify/1.14.7/beautify.min.js'
        ],
        'js-beautify-css': [
            'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.7/beautify-css.min.js',
            'https://cdn.staticfile.org/js-beautify/1.14.7/beautify-css.min.js',
            'https://cdn.jsdelivr.net/npm/js-beautify@1.14.7/js/lib/beautify-css.js',
            'https://unpkg.com/js-beautify@1.14.7/js/lib/beautify-css.js',
            'https://npm.elemecdn.com/js-beautify@1.14.7/js/lib/beautify-css.js',
            'https://lib.baomitu.com/js-beautify/1.14.7/beautify-css.min.js',
            'https://cdn.bootcdn.net/ajax/libs/js-beautify/1.14.7/beautify-css.min.js'
        ],
        'js-beautify-html': [
            'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.7/beautify-html.min.js',
            'https://cdn.staticfile.org/js-beautify/1.14.7/beautify-html.min.js',
            'https://cdn.jsdelivr.net/npm/js-beautify@1.14.7/js/lib/beautify-html.js',
            'https://unpkg.com/js-beautify@1.14.7/js/lib/beautify-html.js',
            'https://npm.elemecdn.com/js-beautify@1.14.7/js/lib/beautify-html.js',
            'https://lib.baomitu.com/js-beautify/1.14.7/beautify-html.min.js',
            'https://cdn.bootcdn.net/ajax/libs/js-beautify/1.14.7/beautify-html.min.js'
        ],
        'diff_match_patch': [
            'https://cdnjs.cloudflare.com/ajax/libs/diff_match_patch/20121119/diff_match_patch.js',
            'https://cdn.bootcdn.net/ajax/libs/diff_match_patch/20121119/diff_match_patch.js',
            'https://lib.baomitu.com/diff_match_patch/20121119/diff_match_patch.js',
            'https://cdn.staticfile.org/diff_match_patch/20121119/diff_match_patch.js',
            'https://cdn.jsdelivr.net/cdnjs/diff_match_patch/20121119/diff_match_patch.js'
        ],
        'jszip': [
            'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
            'https://cdn.staticfile.org/jszip/3.10.1/jszip.min.js',
            'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
            'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js',
            'https://cdn.bootcdn.net/ajax/libs/jszip/3.10.1/jszip.min.js',
            'https://lib.baomitu.com/jszip/3.10.1/jszip.min.js',
            'https://npm.elemecdn.com/jszip@3.10.1/dist/jszip.min.js'
        ],
        'file-saver': [
            'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js',
            'https://cdn.staticfile.org/FileSaver.js/2.0.5/FileSaver.min.js',
            'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js',
            'https://unpkg.com/file-saver@2.0.5/dist/FileSaver.min.js',
            'https://cdn.bootcdn.net/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js',
            'https://lib.baomitu.com/FileSaver.js/2.0.5/FileSaver.min.js',
            'https://npm.elemecdn.com/file-saver@2.0.5/dist/FileSaver.min.js'
        ],
        'uuid': [
            'https://cdnjs.cloudflare.com/ajax/libs/uuid/8.3.2/uuid.min.js',
            'https://cdn.staticfile.org/uuid/8.3.2/uuid.min.js',
            'https://cdn.jsdelivr.net/npm/uuid@8.3.2/dist/umd/uuid.min.js',
            'https://unpkg.com/uuid@8.3.2/dist/umd/uuid.min.js',
            'https://cdn.bootcdn.net/ajax/libs/uuid/8.3.2/uuid.min.js',
            'https://lib.baomitu.com/uuid/8.3.2/uuid.min.js',
            'https://npm.elemecdn.com/uuid@8.3.2/dist/umd/uuid.min.js'
        ],
        'punycode': [
            'https://cdnjs.cloudflare.com/ajax/libs/punycode/1.4.1/punycode.min.js',
            'https://cdn.staticfile.org/punycode/1.4.1/punycode.min.js',
            'https://cdn.jsdelivr.net/npm/punycode@1.4.1/punycode.min.js',
            'https://unpkg.com/punycode@1.4.1/punycode.min.js',
            'https://cdn.bootcdn.net/ajax/libs/punycode/1.4.1/punycode.min.js',
            'https://lib.baomitu.com/punycode/1.4.1/punycode.min.js',
            'https://npm.elemecdn.com/punycode@1.4.1/punycode.min.js'
        ],
        'easyqrcodejs': [
            'https://cdn.jsdelivr.net/npm/easyqrcodejs@4.4.13/dist/easy.qrcode.min.js',
            'https://unpkg.com/easyqrcodejs@4.4.13/dist/easy.qrcode.min.js',
            'https://npm.elemecdn.com/easyqrcodejs@4.4.13/dist/easy.qrcode.min.js',
            'https://fastly.jsdelivr.net/npm/easyqrcodejs@4.4.13/dist/easy.qrcode.min.js'
        ],
        'mammoth': [
            'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
            'https://cdn.staticfile.org/mammoth/1.6.0/mammoth.browser.min.js',
            'https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js',
            'https://unpkg.com/mammoth@1.6.0/mammoth.browser.min.js',
            'https://cdn.bootcdn.net/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
            'https://lib.baomitu.com/mammoth/1.6.0/mammoth.browser.min.js',
            'https://npm.elemecdn.com/mammoth@1.6.0/mammoth.browser.min.js'
        ],
        'fflate': [
            'https://cdn.jsdelivr.net/npm/fflate@0.8.0/umd/index.min.js',
            'https://unpkg.com/fflate@0.8.0/umd/index.min.js',
            'https://npm.elemecdn.com/fflate@0.8.0/umd/index.min.js',
            'https://fastly.jsdelivr.net/npm/fflate@0.8.0/umd/index.min.js'
        ],
        'qrcode': [
            'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js',
            'https://unpkg.com/qrcode@1.5.1/build/qrcode.min.js',
            'https://npm.elemecdn.com/qrcode@1.5.1/build/qrcode.min.js',
            'https://fastly.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js'
        ],
        'hash-wasm': [
            'https://cdn.jsdelivr.net/npm/hash-wasm@4.9.0/dist/index.umd.min.js',
            'https://unpkg.com/hash-wasm@4.9.0/dist/index.umd.min.js',
            'https://npm.elemecdn.com/hash-wasm@4.9.0/dist/index.umd.min.js',
            'https://fastly.jsdelivr.net/npm/hash-wasm@4.9.0/dist/index.umd.min.js'
        ],
        'hash-wasm-esm': [
            'https://cdn.jsdelivr.net/npm/hash-wasm@4.9.0/dist/index.esm.min.js',
            'https://unpkg.com/hash-wasm@4.9.0/dist/index.esm.min.js',
            'https://npm.elemecdn.com/hash-wasm@4.9.0/dist/index.esm.min.js',
            'https://fastly.jsdelivr.net/npm/hash-wasm@4.9.0/dist/index.esm.min.js'
        ],
        'jsondiffpatch': [
            'https://cdn.jsdelivr.net/npm/jsondiffpatch@0.4.1/dist/jsondiffpatch.umd.min.js',
            'https://unpkg.com/jsondiffpatch@0.4.1/dist/jsondiffpatch.umd.min.js',
            'https://npm.elemecdn.com/jsondiffpatch@0.4.1/dist/jsondiffpatch.umd.min.js'
        ],
        'jsondiffpatch-css': [
            'https://cdnjs.cloudflare.com/ajax/libs/jsondiffpatch/0.4.1/formatters-styles/html.css',
            'https://cdn.jsdelivr.net/npm/jsondiffpatch@0.4.1/dist/formatters-styles/html.css'
        ],
        'markdown-wasm': [
            'https://cdn.jsdelivr.net/npm/markdown-wasm@1.2.0/dist/markdown.js',
            'https://unpkg.com/markdown-wasm@1.2.0/dist/markdown.js',
            'https://npm.elemecdn.com/markdown-wasm@1.2.0/dist/markdown.js',
            'https://fastly.jsdelivr.net/npm/markdown-wasm@1.2.0/dist/markdown.js'
        ],
        'markdown-wasm-esm': [
            'https://cdn.jsdelivr.net/npm/markdown-wasm@1.2.0/dist/markdown.es.js',
            'https://unpkg.com/markdown-wasm@1.2.0/dist/markdown.es.js',
            'https://npm.elemecdn.com/markdown-wasm@1.2.0/dist/markdown.es.js',
            'https://fastly.jsdelivr.net/npm/markdown-wasm@1.2.0/dist/markdown.es.js'
        ],
        'brotli-wasm': [
            'https://unpkg.com/brotli-wasm@1.3.1/index.web.js',
            'https://cdn.jsdelivr.net/npm/brotli-wasm@1.3.1/index.web.js',
            'https://npm.elemecdn.com/brotli-wasm@1.3.1/index.web.js',
            'https://fastly.jsdelivr.net/npm/brotli-wasm@1.3.1/index.web.js'
        ],
        'brotli-wasm-esm': [
            'https://unpkg.com/brotli-wasm@1.3.1/index.web.js',
            'https://cdn.jsdelivr.net/npm/brotli-wasm@1.3.1/index.web.js',
            'https://npm.elemecdn.com/brotli-wasm@1.3.1/index.web.js',
            'https://fastly.jsdelivr.net/npm/brotli-wasm@1.3.1/index.web.js'
        ],
        'photon': [
            // No reliable UMD source found for photon currently. 
            // The ones below are likely ESM and will fail in script tags.
            // Keeping them as placeholder or if user has local setup.
            'https://cdn.jsdelivr.net/npm/@silvia-odwyer/photon@0.3.2/photon_rs.js' 
        ],
        'photon-esm': [
            // Use @cf-wasm/photon which has better browser support via 'others' submodule
            'https://esm.sh/@cf-wasm/photon@0.5.1/others',
            // Fallbacks
            'https://cdn.skypack.dev/@silvia-odwyer/photon@0.3.2', 
            'https://esm.sh/@silvia-odwyer/photon@0.3.2?target=es2022'
        ],
        'zstd-wasm': [
            'https://unpkg.com/zstd-wasm@0.0.21/dist/zstd-wasm.js',
            'https://cdn.jsdelivr.net/npm/zstd-wasm@0.0.21/dist/zstd-wasm.js',
            'https://npm.elemecdn.com/zstd-wasm@0.0.21/dist/zstd-wasm.js',
            'https://fastly.jsdelivr.net/npm/zstd-wasm@0.0.21/dist/zstd-wasm.js'
        ],
        'gif.js': [
            'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js',
            'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js',
            'https://unpkg.com/gif.js@0.2.0/dist/gif.js'
        ],
        'imagetracerjs': [
            'https://unpkg.com/imagetracerjs@1.2.6/imagetracer_v1.2.6.js',
            'https://cdn.jsdelivr.net/npm/imagetracerjs@1.2.6/imagetracer_v1.2.6.min.js'
        ],
        'marked': [
            'https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.2/marked.min.js',
            'https://cdn.staticfile.org/marked/9.1.2/marked.min.js',
            'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
            'https://unpkg.com/marked@9.1.2/marked.min.js'
        ],
        'font-awesome': [
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
            'https://cdn.staticfile.org/font-awesome/6.4.0/css/all.min.css',
            'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css',
            'https://unpkg.com/@fortawesome/fontawesome-free@6.4.0/css/all.min.css',
            'https://npm.elemecdn.com/@fortawesome/fontawesome-free@6.4.0/css/all.min.css',
            'https://cdn.bootcdn.net/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        ]
    },

    // Track loaded libraries to avoid duplicates
    loaded: new Set(),
    secure: true,
    maxParallel: 3,
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
     * Load one or more libraries by name
     * @param {string|string[]} libs - Library name(s) defined in registry
     * @returns {Promise<void>} Resolves when all libs are loaded
     */
    load: function(libs) {
        if (!Array.isArray(libs)) libs = [libs];

        const promises = libs.map(libName => {
            if (this.loaded.has(libName)) return Promise.resolve();

            const sources = this.registry[libName];
            if (!sources) {
                console.error(`Library '${libName}' not found in registry.`);
                return Promise.reject(new Error(`Library '${libName}' not found`));
            }

            let urls = Array.isArray(sources) ? sources : [sources];
            urls = this._prioritizeUrls(urls);
            urls = this._reorderUrls(libName, urls);
            
            // Backward compatibility for old registry format {url, fallback}
            if (sources.url) {
                const arr = [sources.url];
                if (sources.fallback) arr.push(sources.fallback);
                return this._loadWithParallel(libName, arr);
            }

            return this._loadWithParallel(libName, urls);
        });

        return Promise.all(promises).then(() => {});
    },

    /**
     * Dynamically Import an ESM module (e.g. Wasm glue code)
     * @param {string} libName - Library name in registry
     * @returns {Promise<Module>} - The imported module
     */
    import: async function(libName) {
        if (this.loaded.has(libName)) {
            // ESM modules can't be "retrieved" from registry once loaded like scripts
            // We usually need the module object returned by import()
            // So we re-import (browser handles caching)
            // But we need the URL that worked.
            // For simplicity, we just run the fallback logic again, browser cache makes it fast.
        }

        const sources = this.registry[libName];
        if (!sources) throw new Error(`Library '${libName}' not found in registry`);
        
        let urls = Array.isArray(sources) ? sources : [sources];
        urls = this._prioritizeUrls(urls);
        urls = this._reorderUrls(libName, urls);
        
        for (const url of urls) {
            try {
                const module = await import(url);
                this.loaded.add(libName);
                console.log(`[ResourceLoader] Successfully imported ${libName} from ${url}`);
                this._recordSuccess(libName, url);
                return module;
            } catch (e) {
                console.warn(`[ResourceLoader] Failed to import ${libName} from ${url}, trying next...`, e);
            }
        }
        throw new Error(`Failed to import ${libName} from all sources`);
    },

    /**
     * Try loading from a list of URLs sequentially (Script Tag or importScripts)
     * @param {string} libName
     * @param {string[]} urls
     * @returns {Promise<void>}
     */
    _loadWithParallel: function(libName, urls) {
        return new Promise((resolve, reject) => {
            let index = 0;

            const trySequential = () => {
                if (index >= urls.length) {
                    this._notifyOffline(libName);
                    reject(new Error(`Failed to load ${libName} from all provided sources.`));
                    return;
                }

                const url = urls[index];

                // Worker Environment Support
                if (typeof importScripts === 'function' && typeof document === 'undefined') {
                    try {
                        importScripts(url);
                        console.log(`[ResourceLoader] Successfully loaded ${libName} from ${url} (Worker)`);
                        this.loaded.add(libName);
                        resolve();
                    } catch (e) {
                        console.warn(`[ResourceLoader] Failed to load ${libName} from ${url} (Worker), trying next...`);
                        index++;
                        trySequential();
                    }
                    return;
                }

                // Browser Environment
                const isCss = url.endsWith('.css');
                if (!isCss && this.secure && typeof fetch === 'function' && window.crypto && crypto.subtle) {
                    this._loadSecureScript(libName, url).then(() => {
                        this.loaded.add(libName);
                        this._recordSuccess(libName, url);
                        resolve();
                    }).catch(() => {
                        index++;
                        trySequential();
                    });
                    return;
                }
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
                    console.log(`[ResourceLoader] Successfully loaded ${libName} from ${url}`);
                    this.loaded.add(libName);
                    this._recordSuccess(libName, url);
                    resolve();
                };

                element.onerror = () => {
                    clearTimeout(timeout);
                    console.warn(`[ResourceLoader] Failed to load ${libName} from ${url}, trying next source...`);
                    index++;
                    element.remove(); // Clean up failed element
                    trySequential();
                };

                document.head.appendChild(element);
            };

            const trySecureParallel = () => {
                const firstUrl = urls[0] || '';
                const isCssFirst = firstUrl.endsWith('.css');
                if (isCssFirst) {
                    tryCssParallel();
                    return;
                }
                if (!this.secure || typeof fetch !== 'function' || !window.crypto || !crypto.subtle) {
                    trySequential();
                    return;
                }
                const slice = urls.slice(0, this.maxParallel);
                let done = false;
                let finished = 0;
                slice.forEach((u) => {
                    this._loadSecureScript(libName, u).then(() => {
                        if (done) return;
                        done = true;
                        this.loaded.add(libName);
                        this._recordSuccess(libName, u);
                        resolve();
                    }).catch(() => {
                        finished++;
                        if (finished >= slice.length && !done) {
                            index = this.maxParallel;
                            trySequential();
                        }
                    });
                });
            };
            const tryCssParallel = () => {
                const slice = urls.slice(0, this.maxParallel);
                let resolved = false;
                const elements = [];
                const cleanupOthers = (keep) => {
                    elements.forEach(el => {
                        if (el !== keep) {
                            try { el.remove(); } catch (e) {}
                        }
                    });
                };
                slice.forEach((u) => {
                    const el = document.createElement('link');
                    elements.push(el);
                    el.rel = 'stylesheet';
                    el.href = u;
                    const timeout = setTimeout(() => {
                        el.onerror();
                    }, 8000);
                    el.onload = () => {
                        if (resolved) return;
                        clearTimeout(timeout);
                        resolved = true;
                        this.loaded.add(libName);
                        this._recordSuccess(libName, u);
                        cleanupOthers(el);
                        resolve();
                    };
                    el.onerror = () => {
                        clearTimeout(timeout);
                        const i = elements.indexOf(el);
                        if (i !== -1) elements.splice(i, 1);
                        try { el.remove(); } catch (e) {}
                        if (!elements.length && !resolved) {
                            index = this.maxParallel;
                            trySequential();
                        }
                    };
                    document.head.appendChild(el);
                });
            };

            trySecureParallel();
        });
    },
    _loadSecureScript: async function(libName, url) {
        const hashKey = `RL_hash_${libName}_${url}`;
        const textKey = `RL_text_${libName}_${url}`;
        let cachedText = null;
        try {
            cachedText = localStorage.getItem(textKey);
        } catch (e) {}
        if (cachedText) {
            try {
                if (this._looksLikeEsm(cachedText)) {
                    try { localStorage.removeItem(textKey); } catch (e) {}
                    throw new Error('ESM format not supported');
                }
                const cachedHash = await this._sha256(cachedText);
                const storedHash = localStorage.getItem(hashKey);
                if (storedHash && storedHash !== cachedHash) {
                    try { localStorage.removeItem(textKey); } catch (e) {}
                } else {
                    if (!storedHash) {
                        try { localStorage.setItem(hashKey, cachedHash); } catch (e) {}
                    }
                    await this._injectScriptText(cachedText);
                    console.log(`[ResourceLoader] Securely loaded ${libName} from cache`);
                    return;
                }
            } catch (e) {
                try { localStorage.removeItem(textKey); } catch (err) {}
            }
        }
        const res = await fetch(url, { cache: 'force-cache' });
        if (!res.ok) throw new Error(`Failed to fetch ${url}`);
        const text = await res.text();
        if (this._looksLikeEsm(text)) {
            throw new Error('ESM format not supported');
        }
        const hash = await this._sha256(text);
        const stored = localStorage.getItem(hashKey);
        if (stored && stored !== hash) {
            throw new Error('Integrity mismatch');
        }
        try { localStorage.setItem(hashKey, hash); } catch (e) {}
        try {
            if (text.length <= 1024 * 1024) localStorage.setItem(textKey, text);
        } catch (e) {}
        try {
            await this._injectScriptText(text);
            console.log(`[ResourceLoader] Securely loaded ${libName} from ${url}`);
        } catch (e) {
            try { localStorage.removeItem(textKey); } catch (err) {}
            throw e;
        }
    },
    _injectScriptText: function(text) {
        return new Promise((resolve, reject) => {
            const blob = new Blob([text], { type: 'text/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            const element = document.createElement('script');
            element.type = 'text/javascript';
            element.async = true;
            element.src = blobUrl;
            const cleanup = () => {
                try { URL.revokeObjectURL(blobUrl); } catch (e) {}
            };
            const timeout = setTimeout(() => {
                element.onerror();
            }, 8000);
            element.onload = () => {
                clearTimeout(timeout);
                cleanup();
                resolve();
            };
            element.onerror = () => {
                clearTimeout(timeout);
                cleanup();
                element.remove();
                reject(new Error('Secure script load failed'));
            };
            document.head.appendChild(element);
        });
    },
    _sha256: async function(text) {
        const data = new TextEncoder().encode(text);
        const digest = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
    },
    _looksLikeEsm: function(text) {
        return /\bexport\b|\bimport\b/.test(text);
    },
    _notifyOffline: function(libName) {
        try {
            if (typeof navigator !== 'undefined' && navigator.onLine === false) {
                if (window.app && app.showToast) app.showToast(`离线状态，依赖 ${libName} 加载失败`, 'error');
                return;
            }
        } catch (e) {}
    },
    _reorderUrls: function(libName, urls) {
        try {
            const key = 'RL_best_' + libName;
            const best = localStorage.getItem(key);
            if (!best) return urls;
            const i = urls.indexOf(best);
            if (i === -1) return urls;
            return [best].concat(urls.filter(u => u !== best));
        } catch (e) {
            return urls;
        }
    },
    _prioritizeUrls: function(urls) {
        const scored = urls.map((url, index) => {
            let host = '';
            try {
                host = new URL(url, typeof location !== 'undefined' ? location.href : 'https://example.com').host;
            } catch (e) {
                host = '';
            }
            let rank = 3;
            if (host.includes('cloudflare') || host.includes('cdnjs.cloudflare.com')) rank = 0;
            else if (host.includes('jsdelivr')) rank = 1;
            else if (host.includes('unpkg')) rank = 2;
            return { url, rank, index };
        });
        scored.sort((a, b) => (a.rank - b.rank) || (a.index - b.index));
        return scored.map(item => item.url);
    },
    _recordSuccess: function(libName, url) {
        try {
            localStorage.setItem('RL_best_' + libName, url);
        } catch (e) {}
    }
};
if (typeof window !== 'undefined') {
    window.ResourceLoader = ResourceLoader;
}
