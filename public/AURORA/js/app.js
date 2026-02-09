/**
 * Core Application Logic
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
        for (const url in this._workers) {
            const w = this._workers[url];
            try { w.terminate(); } catch (e) {}
        }
        this._workers = {};
    },

    switchTab: function(tabId) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        const btn = document.querySelector(`.tab-btn[data-target="${tabId}"]`) || 
                    document.querySelector(`.tab-btn[onclick*="'${tabId}'"]`);
        if(btn) btn.classList.add('active');
        const pane = document.getElementById(`tab-${tabId}`);
        if(pane) pane.classList.add('active');
    },

    showToast: function(msg, type = 'success') {
        const t = document.getElementById('toast');
        if(!t) return;
        t.className = `toast toast-${type} show`;
        t.innerText = msg;
        setTimeout(() => t.classList.remove('show'), 2000);
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
            const blocked = new Set(['script','iframe','object','embed','link','meta','base','form','input','textarea','button']);
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
            const blocked = new Set(['script','iframe','object','embed','foreignobject','audio','video']);
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
        if(inp) inp.value = '';
        const out = document.getElementById(`${prefix}-output`);
        if(out) out.value = '';
        if(prefix === 'text') {
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
    }
});
window.app = app;
try { app.bindInlineEvents(); } catch (e) {}
try {
    window.addEventListener('beforeunload', function() {
        app.releaseAllWorkers();
    });
} catch (e) {}
