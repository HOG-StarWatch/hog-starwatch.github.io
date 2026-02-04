/**
 * Resource Loader for Aurora Toolbox
 * Handles dynamic loading of third-party libraries with caching, dependency management, and multi-source fallback.
 * @ts-check
 */

const ResourceLoader = {
    // Library Registry with Multi-Source Support
    registry: {
        'svgo': [
            'https://unpkg.com/svgo@2.8.0/dist/svgo.browser.js',
            'https://cdn.jsdelivr.net/npm/svgo@2.8.0/dist/svgo.browser.js',
            'https://npm.elemecdn.com/svgo@2.8.0/dist/svgo.browser.js',
            'https://cdnjs.cloudflare.com/ajax/libs/svgo/2.8.0/svgo.browser.min.js',
            'https://lib.baomitu.com/svgo/2.8.0/svgo.browser.min.js'
        ],
        'crypto-js': [
            'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
            'https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js',
            'https://unpkg.com/crypto-js@4.1.1/crypto-js.min.js',
            'https://cdn.bootcdn.net/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
            'https://lib.baomitu.com/crypto-js/4.1.1/crypto-js.min.js',
            'https://npm.elemecdn.com/crypto-js@4.1.1/crypto-js.min.js'
        ],
        'lz-string': [
            'https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js',
            'https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js',
            'https://unpkg.com/lz-string@1.4.4/libs/lz-string.min.js',
            'https://cdn.bootcdn.net/ajax/libs/lz-string/1.4.4/lz-string.min.js',
            'https://lib.baomitu.com/lz-string/1.4.4/lz-string.min.js',
            'https://npm.elemecdn.com/lz-string@1.4.4/libs/lz-string.min.js'
        ],
        'opencc-js': [
            'https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.min.js',
            'https://unpkg.com/opencc-js@1.0.5/dist/umd/full.min.js',
            'https://npm.elemecdn.com/opencc-js@1.0.5/dist/umd/full.min.js',
            'https://unpkg.zhimg.com/opencc-js@1.0.5/dist/umd/full.min.js',
            'https://fastly.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.min.js'
        ],
        'js-beautify': [
            'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.7/beautify.min.js',
            'https://cdn.jsdelivr.net/npm/js-beautify@1.14.7/js/lib/beautify.min.js',
            'https://unpkg.com/js-beautify@1.14.7/js/lib/beautify.min.js',
            'https://cdn.bootcdn.net/ajax/libs/js-beautify/1.14.7/beautify.min.js',
            'https://lib.baomitu.com/js-beautify/1.14.7/beautify.min.js',
            'https://npm.elemecdn.com/js-beautify@1.14.7/js/lib/beautify.min.js'
        ],
        'js-beautify-css': [
            'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.7/beautify-css.min.js',
            'https://cdn.jsdelivr.net/npm/js-beautify@1.14.7/js/lib/beautify-css.min.js',
            'https://unpkg.com/js-beautify@1.14.7/js/lib/beautify-css.min.js',
            'https://cdn.bootcdn.net/ajax/libs/js-beautify/1.14.7/beautify-css.min.js',
            'https://lib.baomitu.com/js-beautify/1.14.7/beautify-css.min.js',
            'https://npm.elemecdn.com/js-beautify@1.14.7/js/lib/beautify-css.min.js'
        ],
        'js-beautify-html': [
            'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.7/beautify-html.min.js',
            'https://cdn.jsdelivr.net/npm/js-beautify@1.14.7/js/lib/beautify-html.min.js',
            'https://unpkg.com/js-beautify@1.14.7/js/lib/beautify-html.min.js',
            'https://cdn.bootcdn.net/ajax/libs/js-beautify/1.14.7/beautify-html.min.js',
            'https://lib.baomitu.com/js-beautify/1.14.7/beautify-html.min.js',
            'https://npm.elemecdn.com/js-beautify@1.14.7/js/lib/beautify-html.min.js'
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
            'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
            'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js',
            'https://cdn.bootcdn.net/ajax/libs/jszip/3.10.1/jszip.min.js',
            'https://lib.baomitu.com/jszip/3.10.1/jszip.min.js',
            'https://npm.elemecdn.com/jszip@3.10.1/dist/jszip.min.js'
        ],
        'file-saver': [
            'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js',
            'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js',
            'https://unpkg.com/file-saver@2.0.5/dist/FileSaver.min.js',
            'https://cdn.bootcdn.net/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js',
            'https://lib.baomitu.com/FileSaver.js/2.0.5/FileSaver.min.js',
            'https://npm.elemecdn.com/file-saver@2.0.5/dist/FileSaver.min.js'
        ],
        'uuid': [
            'https://cdnjs.cloudflare.com/ajax/libs/uuid/8.3.2/uuid.min.js',
            'https://cdn.jsdelivr.net/npm/uuid@8.3.2/dist/umd/uuid.min.js',
            'https://unpkg.com/uuid@8.3.2/dist/umd/uuid.min.js',
            'https://cdn.bootcdn.net/ajax/libs/uuid/8.3.2/uuid.min.js',
            'https://lib.baomitu.com/uuid/8.3.2/uuid.min.js',
            'https://npm.elemecdn.com/uuid@8.3.2/dist/umd/uuid.min.js'
        ],
        'punycode': [
            'https://cdnjs.cloudflare.com/ajax/libs/punycode/1.4.1/punycode.min.js',
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
            'https://unpkg.zhimg.com/easyqrcodejs@4.4.13/dist/easy.qrcode.min.js',
            'https://fastly.jsdelivr.net/npm/easyqrcodejs@4.4.13/dist/easy.qrcode.min.js'
        ],
        'mammoth': [
            'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
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
            'https://unpkg.zhimg.com/fflate@0.8.0/umd/index.min.js',
            'https://fastly.jsdelivr.net/npm/fflate@0.8.0/umd/index.min.js'
        ],
        'qrcode': [
            'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js',
            'https://unpkg.com/qrcode@1.5.1/build/qrcode.min.js',
            'https://npm.elemecdn.com/qrcode@1.5.1/build/qrcode.min.js',
            'https://unpkg.zhimg.com/qrcode@1.5.1/build/qrcode.min.js',
            'https://fastly.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js'
        ],
        'hash-wasm': [
            'https://cdn.jsdelivr.net/npm/hash-wasm@4.9.0/dist/index.umd.min.js',
            'https://unpkg.com/hash-wasm@4.9.0/dist/index.umd.min.js',
            'https://npm.elemecdn.com/hash-wasm@4.9.0/dist/index.umd.min.js',
            'https://unpkg.zhimg.com/hash-wasm@4.9.0/dist/index.umd.min.js',
            'https://fastly.jsdelivr.net/npm/hash-wasm@4.9.0/dist/index.umd.min.js'
        ],
        'hash-wasm-esm': [
            'https://cdn.jsdelivr.net/npm/hash-wasm@4.9.0/dist/index.esm.min.js',
            'https://unpkg.com/hash-wasm@4.9.0/dist/index.esm.min.js',
            'https://npm.elemecdn.com/hash-wasm@4.9.0/dist/index.esm.min.js',
            'https://unpkg.zhimg.com/hash-wasm@4.9.0/dist/index.esm.min.js',
            'https://fastly.jsdelivr.net/npm/hash-wasm@4.9.0/dist/index.esm.min.js'
        ],
        'jsondiffpatch': [
            'https://cdn.jsdelivr.net/npm/jsondiffpatch@0.4.1/dist/jsondiffpatch.umd.min.js',
            'https://unpkg.com/jsondiffpatch@0.4.1/dist/jsondiffpatch.umd.min.js',
            'https://npm.elemecdn.com/jsondiffpatch@0.4.1/dist/jsondiffpatch.umd.min.js'
        ],
        'markdown-wasm': [
            'https://cdn.jsdelivr.net/npm/markdown-wasm@1.2.0/dist/markdown.js',
            'https://unpkg.com/markdown-wasm@1.2.0/dist/markdown.js',
            'https://npm.elemecdn.com/markdown-wasm@1.2.0/dist/markdown.js',
            'https://unpkg.zhimg.com/markdown-wasm@1.2.0/dist/markdown.js',
            'https://fastly.jsdelivr.net/npm/markdown-wasm@1.2.0/dist/markdown.js'
        ],
        'markdown-wasm-esm': [
            'https://cdn.jsdelivr.net/npm/markdown-wasm@1.2.0/dist/markdown.es.js',
            'https://unpkg.com/markdown-wasm@1.2.0/dist/markdown.es.js',
            'https://npm.elemecdn.com/markdown-wasm@1.2.0/dist/markdown.es.js',
            'https://unpkg.zhimg.com/markdown-wasm@1.2.0/dist/markdown.es.js',
            'https://fastly.jsdelivr.net/npm/markdown-wasm@1.2.0/dist/markdown.es.js'
        ],
        'brotli-wasm': [
            'https://unpkg.com/brotli-wasm@1.3.1/index.web.js',
            'https://cdn.jsdelivr.net/npm/brotli-wasm@1.3.1/index.web.js',
            'https://npm.elemecdn.com/brotli-wasm@1.3.1/index.web.js',
            'https://unpkg.zhimg.com/brotli-wasm@1.3.1/index.web.js',
            'https://fastly.jsdelivr.net/npm/brotli-wasm@1.3.1/index.web.js'
        ],
        'brotli-wasm-esm': [
            'https://unpkg.com/brotli-wasm@1.3.1/index.web.js',
            'https://cdn.jsdelivr.net/npm/brotli-wasm@1.3.1/index.web.js',
            'https://npm.elemecdn.com/brotli-wasm@1.3.1/index.web.js',
            'https://unpkg.zhimg.com/brotli-wasm@1.3.1/index.web.js',
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
            'https://unpkg.zhimg.com/zstd-wasm@0.0.21/dist/zstd-wasm.js',
            'https://fastly.jsdelivr.net/npm/zstd-wasm@0.0.21/dist/zstd-wasm.js'
        ],
        'gif.js': [
            'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js',
            'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js',
            'https://unpkg.com/gif.js@0.2.0/dist/gif.js'
        ],
        'marked': [
            'https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.2/marked.min.js',
            'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
            'https://unpkg.com/marked@9.1.2/marked.min.js'
        ],
        'font-awesome': [
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
            'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css',
            'https://unpkg.com/@fortawesome/fontawesome-free@6.4.0/css/all.min.css',
            'https://npm.elemecdn.com/@fortawesome/fontawesome-free@6.4.0/css/all.min.css',
            'https://cdn.bootcdn.net/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        ]
    },

    // Track loaded libraries to avoid duplicates
    loaded: new Set(),

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

            const urls = Array.isArray(sources) ? sources : [sources];
            
            // Backward compatibility for old registry format {url, fallback}
            if (sources.url) {
                const arr = [sources.url];
                if (sources.fallback) arr.push(sources.fallback);
                return this._loadWithFallback(libName, arr);
            }

            return this._loadWithFallback(libName, urls);
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
        
        const urls = Array.isArray(sources) ? sources : [sources];
        
        for (const url of urls) {
            try {
                const module = await import(url);
                this.loaded.add(libName);
                console.log(`[ResourceLoader] Successfully imported ${libName} from ${url}`);
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
    _loadWithFallback: function(libName, urls) {
        return new Promise((resolve, reject) => {
            let index = 0;

            const tryLoad = () => {
                if (index >= urls.length) {
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
                        tryLoad();
                    }
                    return;
                }

                // Browser Environment
                const isCss = url.endsWith('.css');
                const element = isCss ? document.createElement('link') : document.createElement('script');

                if (isCss) {
                    element.rel = 'stylesheet';
                    element.href = url;
                } else {
                    element.type = 'text/javascript';
                    element.async = true;
                    element.src = url;
                }

                element.onload = () => {
                    console.log(`[ResourceLoader] Successfully loaded ${libName} from ${url}`);
                    this.loaded.add(libName);
                    resolve();
                };

                element.onerror = () => {
                    console.warn(`[ResourceLoader] Failed to load ${libName} from ${url}, trying next source...`);
                    index++;
                    element.remove(); // Clean up failed element
                    tryLoad();
                };

                document.head.appendChild(element);
            };

            tryLoad();
        });
    }
};
