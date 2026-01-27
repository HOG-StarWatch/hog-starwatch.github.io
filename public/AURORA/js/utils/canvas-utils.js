/**
 * Canvas 操作工具库
 * 提供高性能的图像数据处理和 Canvas 辅助方法
 * @ts-check
 */

/**
 * @typedef {Object} PixelData
 * @property {Uint8ClampedArray} data - 像素数据 (RGBA)
 * @property {number} width - 宽度
 * @property {number} height - 高度
 */

const CanvasUtils = {
    /**
     * 将 File 对象转换为 Image 对象
     * @param {File} file - 图片文件
     * @returns {Promise<HTMLImageElement>}
     */
    loadImage(file) {
        return new Promise((resolve, reject) => {
            if (!file) return reject(new Error('No file provided'));
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = /** @type {string} */ (e.target.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * 从 Image 对象获取像素数据
     * @param {HTMLImageElement|HTMLCanvasElement} source - 图片或 Canvas 源
     * @param {number} [w] - 指定宽度 (可选)
     * @param {number} [h] - 指定高度 (可选)
     * @returns {PixelData}
     */
    getImageData(source, w, h) {
        const width = w || source.width;
        const height = h || source.height;
        
        // 使用 OffscreenCanvas 如果支持 (Worker 中可用)
        if (typeof OffscreenCanvas !== 'undefined' && source instanceof OffscreenCanvas) {
            const ctx = source.getContext('2d');
            if (!ctx) throw new Error('Failed to get context');
            return ctx.getImageData(0, 0, width, height);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Failed to get context');
        ctx.drawImage(source, 0, 0, width, height);
        return ctx.getImageData(0, 0, width, height);
    },

    /**
     * 将像素数据转换回 DataURL
     * @param {Uint8ClampedArray} data - 像素数组
     * @param {number} width 
     * @param {number} height 
     * @param {string} [format='image/png'] 
     * @returns {string}
     */
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

    /**
     * 触发下载
     * @param {string} url - DataURL 或 Blob URL
     * @param {string} filename - 文件名
     */
    download(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    /**
     * 简单的像素访问器工厂
     * @param {Uint8ClampedArray} data 
     * @param {number} width 
     * @returns {(x: number, y: number) => [number, number, number, number]}
     */
    createPixelGetter(data, width) {
        return (x, y) => {
            const i = (y * width + x) * 4;
            return [data[i], data[i+1], data[i+2], data[i+3]];
        };
    }
};

// 兼容 Worker 环境导出
if (typeof self !== 'undefined') {
    self.CanvasUtils = CanvasUtils;
}
