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
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => this.highlight(), false);
        });
        ['dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => this.unhighlight(), false);
        });
        this.dropZone.addEventListener('drop', (e) => this.handleDrop(e), false);
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

if (typeof window !== 'undefined') {
    window.DragDropHandler = DragDropHandler;
}
