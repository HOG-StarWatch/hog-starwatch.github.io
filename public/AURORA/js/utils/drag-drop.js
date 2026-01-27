/**
 * 拖拽文件处理工具
 * 提供统一的拖拽交互和文件验证
 * @ts-check
 */

class DragDropHandler {
    /**
     * @param {Object} options
     * @param {HTMLElement} options.dropZone - 拖拽区域元素
     * @param {HTMLInputElement} options.input - 隐藏的文件输入框
     * @param {(file: File) => void} options.onFile - 文件接收回调
     * @param {string[]} [options.accept] - 允许的文件类型 (如 ['image/png', 'image/jpeg'])
     * @param {number} [options.maxSize] - 最大文件大小 (字节)
     * @param {(err: Error) => void} [options.onError] - 错误回调
     */
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
        // 点击触发
        this.dropZone.addEventListener('click', () => this.input.click());

        // Input 变化
        this.input.addEventListener('change', (e) => {
            const file = this.input.files?.[0];
            if (file) this.handleFile(file);
        });

        // 拖拽事件
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, this.preventDefaults, false);
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
        this.dropZone.style.borderColor = 'var(--primary)';
        this.dropZone.style.background = 'rgba(192, 132, 252, 0.1)';
    }

    unhighlight() {
        this.dropZone.classList.remove('drag-active');
        this.dropZone.style.borderColor = '';
        this.dropZone.style.background = '';
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt?.files[0];
        if (file) this.handleFile(file);
    }

    /**
     * @param {File} file 
     */
    handleFile(file) {
        // 类型检查
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

        // 大小检查
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

// 导出
if (typeof self !== 'undefined') {
    self.DragDropHandler = DragDropHandler;
}
