/**
 * Aurora Toolbox - Core Application
 * 整合了 Canvas/Drop/Worker 等工具库的完整核心应用
 */
var app = window.app || {};

Object.assign(app, {
    init: function() {
        console.log('App initialized');
    },

    _workers: app._workers || {},

    getWorker: function(url) {
        if (this._workers[url]) return this._workers[url];
        const w = new Worker(url);
        this._workers[url] = w;
        return w;
    },

    releaseWorker: function(url) {
        const w = this._workers[url];
        if (!w) return;
        try { w.terminate(); } catch (e) {}
        delete this._workers[url];
    },

    releaseAllWorkers: function() {
        Object.keys(this._workers).forEach(url => {
            const w = this._workers[url];
            if (w) {
                try { w.terminate(); } catch (e) {}
            }
        });
        this._workers = {};
    },

    switchTab: function(tabId) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        const btn = document.querySelector(`.tab-btn[data-target="${tabId}"]`) ||
                    document.querySelector(`.tab-btn[onclick*="'${tabId}'"]`);
        if (btn) btn.classList.add('active');
        const pane = document.getElementById(`tab-${tabId}`);
        if (pane) pane.classList.add('active');
    },

    handleError: function(error, context, showToast = true) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`[Error] ${context}:`, error);
        if (showToast) {
            this.showToast(`${context}失败: ${msg}`, 'error');
        }
        return msg;
    },

    showToast: function(msg, type = 'success') {
        const t = document.getElementById('toast');
        if (!t) return;
        t.className = `toast toast-${type} show`;
        t.innerText = msg;
        setTimeout(() => t.classList.remove('show'), type === 'error' ? 3000 : 2000);
    },

    setLoading: function(elementOrId, loading) {
        const el = typeof elementOrId === 'string' 
            ? document.getElementById(elementOrId) 
            : elementOrId;
        if (!el) return;
        if (loading) {
            el.dataset.loading = 'true';
            el.disabled = true;
        } else {
            delete el.dataset.loading;
            el.disabled = false;
        }
    },

    copy: function(elementId) {
        const el = document.getElementById(elementId);
        if (!el || !el.value) return;
        const text = el.value;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('已复制到剪贴板');
            }).catch(() => {
                el.select();
                document.execCommand('copy');
                this.showToast('已复制到剪贴板');
            });
            return;
        }
        el.select();
        document.execCommand('copy');
        this.showToast('已复制到剪贴板');
    },

    escapeHtml: function(text) {
        return String(text || '')
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    sanitizeHtml: function(html) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(String(html || ''), 'text/html');
            const blocked = new Set(['script', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form', 'input', 'textarea', 'button']);
            const nodes = Array.from(doc.querySelectorAll('*'));
            nodes.forEach(node => {
                if (blocked.has(node.tagName.toLowerCase())) {
                    node.remove();
                    return;
                }
                Array.from(node.attributes).forEach(attr => {
                    const name = attr.name.toLowerCase();
                    const value = String(attr.value || '');
                    if (name.startsWith('on')) {
                        node.removeAttribute(attr.name);
                        return;
                    }
                    if (name === 'href' || name === 'src' || name === 'xlink:href' || name === 'srcset') {
                        const v = value.trim().toLowerCase();
                        if (v.startsWith('javascript:') || v.startsWith('data:text/html')) {
                            node.removeAttribute(attr.name);
                        }
                    }
                });
            });
            return doc.body.innerHTML;
        } catch (e) {
            return this.escapeHtml(html);
        }
    },

    sanitizeSvg: function(svg) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(String(svg || ''), 'image/svg+xml');
            const blocked = new Set(['script', 'iframe', 'object', 'embed', 'foreignobject', 'audio', 'video']);
            const nodes = Array.from(doc.querySelectorAll('*'));
            nodes.forEach(node => {
                if (blocked.has(node.tagName.toLowerCase())) {
                    node.remove();
                    return;
                }
                Array.from(node.attributes).forEach(attr => {
                    const name = attr.name.toLowerCase();
                    const value = String(attr.value || '');
                    if (name.startsWith('on')) {
                        node.removeAttribute(attr.name);
                        return;
                    }
                    if (name === 'href' || name === 'xlink:href' || name === 'src') {
                        const v = value.trim().toLowerCase();
                        if (v.startsWith('javascript:') || v.startsWith('data:text/html')) {
                            node.removeAttribute(attr.name);
                        }
                    }
                });
            });
            return new XMLSerializer().serializeToString(doc.documentElement);
        } catch (e) {
            return '';
        }
    },

    clear: function(prefix) {
        const inp = document.getElementById(`${prefix}-input`);
        if (inp) inp.value = '';
        const out = document.getElementById(`${prefix}-output`);
        if (out) out.value = '';
        if (prefix === 'text') {
            document.getElementById('text-in-stat').innerText = '0 字符';
            document.getElementById('text-out-stat').innerText = '0 字符';
        }
        this.showToast('已清空');
    },

    migrateInlineEvents: function(root) {
        if (!root || !root.querySelectorAll) return;
        const map = this._inlineHandlerMap || (this._inlineHandlerMap = new WeakMap());
        root.querySelectorAll('*').forEach(el => {
            if (!el.attributes) return;
            const attrs = Array.from(el.attributes);
            attrs.forEach(attr => {
                const name = String(attr.name || '').toLowerCase();
                if (!name.startsWith('on')) return;
                const code = String(attr.value || '');
                const type = name.slice(2);
                if (!type) {
                    el.removeAttribute(attr.name);
                    return;
                }
                let handler;
                try {
                    handler = new Function('event', code);
                } catch (e) {
                    el.removeAttribute(attr.name);
                    return;
                }
                let set = map.get(el);
                if (!set) {
                    set = new Set();
                    map.set(el, set);
                }
                const key = name + '::' + code;
                if (set.has(key)) {
                    el.removeAttribute(attr.name);
                    return;
                }
                if (name === 'onclick') {
                    const m = code.match(/switchTab\((['"])(.+?)\1/);
                    if (m && !el.dataset.target) el.dataset.target = m[2];
                }
                set.add(key);
                el.addEventListener(type, function(event) {
                    return handler.call(el, event);
                });
                el.removeAttribute(attr.name);
            });
        });
    },

    bindInlineEvents: function() {
        const run = () => this.migrateInlineEvents(document);
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', run, { once: true });
        } else {
            run();
        }
        if (this._inlineObserver) return;
        this._inlineObserver = new MutationObserver(muts => {
            muts.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (node && node.nodeType === 1) this.migrateInlineEvents(node);
                });
            });
        });
        try {
            this._inlineObserver.observe(document.documentElement, { childList: true, subtree: true });
        } catch (e) {}
    },

    notifyParentResize: function(delay = 100) {
        setTimeout(() => {
            const height = document.body.scrollHeight;
            window.parent.postMessage({ type: 'resize', height: height }, '*');
        }, delay);
    }
});

window.app = app;
try { app.bindInlineEvents(); } catch (e) {}
try {
    window.addEventListener('beforeunload', function() {
        app.releaseAllWorkers();
        if (app._inlineObserver) {
            try { app._inlineObserver.disconnect(); } catch (e) {}
        }
    });
} catch (e) {}

/**
 * CanvasUtils - 图像处理工具
 */
const CanvasUtils = {
    loadImage(file) {
        return new Promise((resolve, reject) => {
            if (!file) return reject(new Error('No file provided'));
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    getImageData(source, w, h) {
        const width = w || source.width;
        const height = h || source.height;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Failed to get context');
        ctx.drawImage(source, 0, 0, width, height);
        return ctx.getImageData(0, 0, width, height);
    },

    pixelsToDataURL(data, width, height, format = 'image/png') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get context');
        const imageData = new ImageData(data, width, height);
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL(format);
    },

    download(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

/**
 * DragDropHandler - 拖拽文件处理
 */
class DragDropHandler {
    constructor({ dropZone, input, onFile, accept, maxSize, onError }) {
        this.dropZone = dropZone;
        this.input = input;
        this.onFile = onFile;
        this.accept = accept;
        this.maxSize = maxSize;
        this.onError = onError || console.error;
        this.init();
    }

    init() {
        this.dropZone.addEventListener('click', () => this.input.click());
        this.input.addEventListener('change', (e) => {
            const file = this.input.files?.[0];
            if (file) this.handleFile(file);
        });
        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, preventDefaults, false);
        });
        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => this.highlight(), false);
        });
        ['dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => this.unhighlight(), false);
        });
        this.dropZone.addEventListener('drop', (e) => this.handleDrop(e), false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlight() {
        this.dropZone.classList.add('drag-active');
    }

    unhighlight() {
        this.dropZone.classList.remove('drag-active');
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt?.files[0];
        if (file) this.handleFile(file);
    }

    handleFile(file) {
        if (this.accept && this.accept.length > 0) {
            const fileType = file.type;
            const valid = this.accept.some(type => {
                if (type.endsWith('/*')) return fileType.startsWith(type.replace('/*', ''));
                return fileType === type;
            });
            if (!valid) {
                this.onError(new Error(`不支持的文件类型: ${fileType}`));
                return;
            }
        }
        if (this.maxSize && file.size > this.maxSize) {
            this.onError(new Error(`文件过大 (最大 ${this.formatSize(this.maxSize)})`));
            return;
        }
        this.onFile(file);
    }

    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

/**
 * WorkerUtils - Worker 通信封装
 */
const WorkerUtils = {
    createWorkerHandler({ workerUrl, onComplete, onError, onProgress, maxRetries = 3 }) {
        let worker = null;
        let retryCount = 0;
        
        const handleMessage = (e) => {
            const { type, outputData, error, progress, width, height, imageData } = e.data;
            if (type === 'success' || type === 'complete') {
                retryCount = 0;
                if (onComplete) {
                    if (outputData) {
                        onComplete(new Uint8ClampedArray(outputData), width, height);
                    } else if (imageData) {
                        onComplete(imageData, width, height);
                    }
                }
            } else if (type === 'error') {
                if (retryCount < maxRetries) {
                    retryCount++;
                    console.warn(`Worker error, retrying (${retryCount}/${maxRetries})...`);
                    createNewWorker();
                    return;
                }
                if (onError) onError(error || 'Unknown error');
                worker = null;
            } else if (type === 'progress' && onProgress) {
                onProgress(progress);
            }
        };
        
        const handleError = (e) => {
            console.error('Worker Error:', e);
            if (retryCount < maxRetries) {
                retryCount++;
                console.warn(`Worker error, retrying (${retryCount}/${maxRetries})...`);
                createNewWorker();
                return;
            }
            if (onError) onError(e.message || 'Worker error');
            worker = null;
        };
        
        const createNewWorker = () => {
            if (worker) {
                try { worker.terminate(); } catch (e) {}
            }
            try {
                worker = new Worker(workerUrl);
                worker.onmessage = handleMessage;
                worker.onerror = handleError;
            } catch (err) {
                console.error('Failed to create worker:', err);
                if (onError) onError('Worker 创建失败');
            }
        };
        
        createNewWorker();
        
        return {
            get worker() { return worker; },
            postMessage(data, transfer) {
                if (worker) worker.postMessage(data, transfer || []);
            },
            terminate() {
                if (worker) {
                    worker.terminate();
                    worker = null;
                }
            },
            getRetryCount: () => retryCount
        };
    },

    toast(message, type) {
        if (app && app.showToast) app.showToast(message, type);
    },

    notifyParentResize(delay = 100) {
        app.notifyParentResize(delay);
    },

    createWorkerCallback(canvas, onComplete) {
        return (e) => {
            const { type, outputData, error, width, height } = e.data;
            if (type === 'success' || type === 'complete') {
                const ctx = canvas.getContext('2d');
                if (outputData) {
                    const imgData = new ImageData(new Uint8ClampedArray(outputData), width, height);
                    ctx.putImageData(imgData, 0, 0);
                }
                if (onComplete) onComplete();
            } else if (type === 'error') {
                this.toast(error || '处理失败', 'error');
            }
        };
    },

    processWithFallback({ worker, cmd, data, fallback, transfer }) {
        if (worker) {
            worker.postMessage({ cmd, ...data }, transfer || []);
        } else if (fallback) {
            fallback();
        }
    }
};
