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
        if (window.app && window.app.showToast) window.app.showToast(message, type);
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

if (typeof window !== 'undefined') {
    window.WorkerUtils = WorkerUtils;
}
