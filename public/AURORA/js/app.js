const app = window.app || {};

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
                this._copyFallback(el, text);
            });
            return;
        }
        this._copyFallback(el, text);
    },

    _copyFallback: function(el, text) {
        try {
            el.select();
            document.execCommand('copy');
        } catch (e) {}
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
            const statIn = document.getElementById('text-in-stat');
            const statOut = document.getElementById('text-out-stat');
            if (statIn) statIn.innerText = '0 字符';
            if (statOut) statOut.innerText = '0 字符';
        }
        this.showToast('已清空');
    },

    notifyParentResize: function(delay = 100) {
        setTimeout(() => {
            const height = document.body.scrollHeight;
            window.parent.postMessage({ type: 'resize', height: height }, '*');
        }, delay);
    }
});

/* ============================================================
 * data-action delegation
 * Replaces inline onclick attributes: <button data-action="...">
 * Resolves against a per-tool registry (app.action) first, then
 * falls back to global functions (window[name]).
 * Handlers receive (element, event); parameters come from data-* attrs.
 * ============================================================ */
(function () {
    const actions = new Map();

    app.action = function (name, fn) {
        actions.set(name, fn);
    };
    app.runAction = function (name, el, evt) {
        const fn = actions.get(name) || window[name];
        if (typeof fn !== 'function') return false;
        fn.call(el, el, evt);
        return true;
    };

    // ----- built-in actions -----
    app.action('copy', (el) => {
        const id = el.dataset.copyTarget || el.dataset.target;
        if (id) app.copy(id);
    });
    app.action('clear', (el) => {
        const prefix = el.dataset.clearPrefix || el.dataset.prefix;
        if (prefix) app.clear(prefix);
    });
    app.action('file-click', (el) => {
        const id = el.dataset.fileTarget || el.dataset.target;
        const input = id && document.getElementById(id);
        if (input) input.click();
    });
    app.action('window-open', (el) => {
        const url = el.dataset.href || el.href;
        if (url) window.open(url, '_blank');
    });

    document.addEventListener('click', (e) => {
        const target = e.target;
        const trigger = target && target.closest ? target.closest('[data-action]') : null;
        if (!trigger) return;
        const name = trigger.dataset.action;
        if (!name) return;
        const handled = app.runAction(name, trigger, e);
        if (handled && trigger.tagName === 'A') e.preventDefault();
    }, true);

    // change / input events (selects, ranges, text inputs)
    ['change', 'input'].forEach(evtType => {
        document.addEventListener(evtType, (e) => {
            const target = e.target;
            const trigger = target && target.closest ? target.closest('[data-action]') : null;
            if (!trigger) return;
            const name = trigger.dataset.action;
            if (!name) return;
            app.runAction(name, trigger, e);
        }, true);
    });
})();

/* ============================================================
 * aurora-theme channel
 * The shell pushes theme vars / meltdown CSS into tool documents
 * via postMessage (no cross-frame DOM poking).
 * ============================================================ */
(function () {
    function rebroadcast(data) {
        // nested tool iframes (e.g. image-fun -> image-phantom) get the same payload
        document.querySelectorAll('iframe').forEach(f => {
            try {
                if (f.contentWindow) f.contentWindow.postMessage(data, '*');
            } catch (e) {}
        });
    }
    window.addEventListener('message', (e) => {
        const d = e.data;
        if (!d || typeof d !== 'object') return;
        if (d.type === 'aurora-theme' && d.vars) {
            const root = document.documentElement;
            for (const [key, value] of Object.entries(d.vars)) {
                root.style.setProperty(key, value);
            }
            rebroadcast(d);
        } else if (d.type === 'aurora-meltdown' && typeof d.css === 'string') {
            let el = document.getElementById('meltdown-style');
            if (!el) {
                el = document.createElement('style');
                el.id = 'meltdown-style';
                document.head.appendChild(el);
            }
            el.textContent = d.css;
            rebroadcast(d);
        } else if (d.type === 'aurora-meltdown-remove') {
            const el = document.getElementById('meltdown-style');
            if (el) el.remove();
            rebroadcast(d);
        }
    });
})();

window.app = app;