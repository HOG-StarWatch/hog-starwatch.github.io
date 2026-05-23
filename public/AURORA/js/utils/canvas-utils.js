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

if (typeof window !== 'undefined') {
    window.CanvasUtils = CanvasUtils;
}
