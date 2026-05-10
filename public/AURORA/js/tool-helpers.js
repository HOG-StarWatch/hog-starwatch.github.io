/**
 * Aurora 工具辅助模块
 * 提供统一的工具开发辅助函数，可选使用，不强制
 */

const ToolHelpers = {
    /**
     * 安全显示 Toast 消息
     * @param {string} msg - 消息内容
     * @param {string} [type='success'] - 类型: 'success' | 'error' | 'info'
     */
    toast: function(msg, type) {
        if (app && app.showToast) {
            app.showToast(msg, type || 'success');
        }
    },

    /**
     * 安全获取 Worker
     * @param {string} url - Worker 路径
     * @returns {Worker|null}
     */
    getWorker: function(url) {
        if (!window.Worker) return null;
        
        try {
            return (app && app.getWorker) 
                ? app.getWorker(url) 
                : new Worker(url);
        } catch (e) {
            console.error('[ToolHelpers] Worker creation failed:', e);
            return null;
        }
    },

    /**
     * 安全释放 Worker
     * @param {string} url - Worker 路径
     * @param {Worker} worker - Worker 实例
     */
    releaseWorker: function(url, worker) {
        if (!worker) return;
        
        if (app && app.releaseWorker) {
            app.releaseWorker(url);
        } else {
            try {
                worker.terminate();
            } catch (e) {}
        }
    },

    /**
     * 获取元素
     * @param {string} id - 元素 ID
     * @returns {HTMLElement|null}
     */
    el: function(id) {
        return document.getElementById(id);
    },

    /**
     * 获取元素值
     * @param {string} id - 元素 ID
     * @returns {string}
     */
    val: function(id) {
        const el = this.el(id);
        return el ? el.value : '';
    },

    /**
     * 设置元素值
     * @param {string} id - 元素 ID
     * @param {*} value - 值
     */
    setVal: function(id, value) {
        const el = this.el(id);
        if (el) el.value = value;
    },

    /**
     * 显示元素
     * @param {string|HTMLElement} target - 元素 ID 或元素
     */
    show: function(target) {
        const el = typeof target === 'string' ? this.el(target) : target;
        if (el) el.classList.remove('hidden');
    },

    /**
     * 隐藏元素
     * @param {string|HTMLElement} target - 元素 ID 或元素
     */
    hide: function(target) {
        const el = typeof target === 'string' ? this.el(target) : target;
        if (el) el.classList.add('hidden');
    },

    /**
     * 切换元素显示
     * @param {string|HTMLElement} target - 元素 ID 或元素
     */
    toggle: function(target) {
        const el = typeof target === 'string' ? this.el(target) : target;
        if (el) el.classList.toggle('hidden');
    },

    /**
     * 设置按钮加载状态
     * @param {string|HTMLElement} target - 按钮元素 ID 或元素
     * @param {boolean} loading - 是否加载中
     * @param {string} [loadingText='处理中...'] - 加载中文本
     * @param {string} [normalText] - 正常文本
     */
    setLoading: function(target, loading, loadingText, normalText) {
        const el = typeof target === 'string' ? this.el(target) : target;
        if (!el) return;
        
        if (loading) {
            el.dataset.loading = 'true';
            el.disabled = true;
            if (loadingText && el.tagName === 'BUTTON') {
                el.dataset.originalText = el.textContent;
                el.textContent = loadingText;
            }
        } else {
            el.dataset.loading = 'false';
            el.disabled = false;
            if (normalText && el.tagName === 'BUTTON') {
                el.textContent = normalText;
            } else if (el.dataset.originalText) {
                el.textContent = el.dataset.originalText;
                delete el.dataset.originalText;
            }
        }
    },

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string}
     */
    formatSize: function(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * 下载 Canvas 为图片
     * @param {HTMLCanvasElement} canvas - Canvas 元素
     * @param {string} [filename='image.png'] - 文件名
     * @param {string} [format='image/png'] - 格式
     */
    downloadCanvas: function(canvas, filename, format) {
        const link = document.createElement('a');
        link.download = filename || 'image.png';
        link.href = canvas.toDataURL(format || 'image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    /**
     * 下载文本文件
     * @param {string} content - 文件内容
     * @param {string} filename - 文件名
     * @param {string} [mimeType='text/plain'] - MIME 类型
     */
    downloadText: function(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType || 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * 读取文件为文本
     * @param {File} file - 文件对象
     * @returns {Promise<string>}
     */
    readFileAsText: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsText(file);
        });
    },

    /**
     * 读取文件为 DataURL
     * @param {File} file - 文件对象
     * @returns {Promise<string>}
     */
    readFileAsDataURL: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsDataURL(file);
        });
    },

    /**
     * 读取文件为 ArrayBuffer
     * @param {File} file - 文件对象
     * @returns {Promise<ArrayBuffer>}
     */
    readFileAsArrayBuffer: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * 加载图片
     * @param {string} src - 图片地址或 DataURL
     * @returns {Promise<HTMLImageElement>}
     */
    loadImage: function(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('图片加载失败'));
            img.src = src;
        });
    },

    /**
     * 复制文本到剪贴板
     * @param {string} text - 要复制的文本
     * @returns {Promise<boolean>}
     */
    copyToClipboard: async function(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // 降级方案
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return true;
            }
        } catch (e) {
            console.error('[ToolHelpers] Copy failed:', e);
            return false;
        }
    },

    /**
     * 防抖函数
     * @param {Function} fn - 要执行的函数
     * @param {number} [delay=300] - 延迟时间（毫秒）
     * @returns {Function}
     */
    debounce: function(fn, delay) {
        let timer = null;
        return function(...args) {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay || 300);
        };
    },

    /**
     * 节流函数
     * @param {Function} fn - 要执行的函数
     * @param {number} [interval=300] - 间隔时间（毫秒）
     * @returns {Function}
     */
    throttle: function(fn, interval) {
        let lastTime = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastTime >= (interval || 300)) {
                lastTime = now;
                fn.apply(this, args);
            }
        };
    },

    /**
     * 生成唯一 ID
     * @param {string} [prefix=''] - 前缀
     * @returns {string}
     */
    generateId: function(prefix) {
        return (prefix || '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    },

    /**
     * 深拷贝对象
     * @param {*} obj - 要拷贝的对象
     * @returns {*}
     */
    deepClone: function(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Object) {
            const copy = {};
            Object.keys(obj).forEach(key => {
                copy[key] = this.deepClone(obj[key]);
            });
            return copy;
        }
        return obj;
    }
};

// 导出到全局
if (typeof window !== 'undefined') {
    window.ToolHelpers = ToolHelpers;
}
