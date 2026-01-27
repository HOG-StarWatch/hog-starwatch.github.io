/**
 * Resource Loader for Aurora Toolbox
 * Handles dynamic loading of third-party libraries with caching, dependency management, and multi-source fallback.
 * @ts-check
 */

const ResourceLoader = {
    // Library Registry with Multi-Source Support
    registry: {
        'crypto-js': [
            'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
            'https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js',
            'https://unpkg.com/crypto-js@4.1.1/crypto-js.min.js'
        ],
        'lz-string': [
            'https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js',
            'https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js'
        ],
        'opencc-js': [
            'https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.min.js',
            'https://unpkg.com/opencc-js@1.0.5/dist/umd/full.min.js'
        ],
        'js-beautify': [
            'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.7/beautify.min.js',
            'https://cdn.jsdelivr.net/npm/js-beautify@1.14.7/js/lib/beautify.min.js'
        ],
        'js-beautify-css': [
            'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.7/beautify-css.min.js',
            'https://cdn.jsdelivr.net/npm/js-beautify@1.14.7/js/lib/beautify-css.min.js'
        ],
        'js-beautify-html': [
            'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.7/beautify-html.min.js',
            'https://cdn.jsdelivr.net/npm/js-beautify@1.14.7/js/lib/beautify-html.min.js'
        ],
        'diff_match_patch': [
            'https://cdnjs.cloudflare.com/ajax/libs/diff_match_patch/20121119/diff_match_patch.js',
            'https://cdn.bootcdn.net/ajax/libs/diff_match_patch/20121119/diff_match_patch.js'
        ],
        'jszip': [
            'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
            'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js'
        ],
        'file-saver': [
            'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js',
            'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js'
        ],
        'uuid': [
            'https://cdnjs.cloudflare.com/ajax/libs/uuid/8.3.2/uuid.min.js',
            'https://cdn.jsdelivr.net/npm/uuid@8.3.2/dist/umd/uuid.min.js'
        ],
        'punycode': [
            'https://cdnjs.cloudflare.com/ajax/libs/punycode/1.4.1/punycode.min.js',
            'https://cdn.jsdelivr.net/npm/punycode@1.4.1/punycode.min.js'
        ],
        'easyqrcodejs': [
            'https://cdn.jsdelivr.net/npm/easyqrcodejs@4.4.13/dist/easy.qrcode.min.js'
        ],
        'mammoth': [
            'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js'
        ],
        'fflate': [
            'https://cdn.jsdelivr.net/npm/fflate@0.8.0/umd/index.min.js'
        ],
        'qrcode': [
            'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js'
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

            // Normalize to array
            const urls = Array.isArray(sources) ? sources : [sources]; // Backward compatibility if registry has objects

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
     * Try loading from a list of URLs sequentially
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
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.async = true;

                script.onload = () => {
                    console.log(`[ResourceLoader] Successfully loaded ${libName} from ${url}`);
                    this.loaded.add(libName);
                    resolve();
                };

                script.onerror = () => {
                    console.warn(`[ResourceLoader] Failed to load ${libName} from ${url}, trying next source...`);
                    index++;
                    script.remove(); // Clean up failed script tag
                    tryLoad();
                };

                script.src = url;
                document.head.appendChild(script);
            };

            tryLoad();
        });
    }
};
