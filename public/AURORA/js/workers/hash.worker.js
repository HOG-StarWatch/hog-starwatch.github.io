let ready = Promise.reject(new Error('初始化失败'));
try {
    importScripts('../loader.js');
    if (typeof ResourceLoader !== 'undefined') {
        ready = ResourceLoader.load('crypto-js');
    } else {
        ready = Promise.reject(new Error('ResourceLoader 未加载'));
    }
} catch (e) {
    ready = Promise.reject(e);
}

self.onmessage = async function(e) {
    const { type, payload } = e.data;

    if (type === 'calc') {
        const { data, isFile, algos, hmacKey, requestId } = payload;
        
        try {
            await ready;
            if (typeof CryptoJS === 'undefined') {
                throw new Error('CryptoJS 未加载');
            }
            let inputData;
            
            // For files, data is an ArrayBuffer
            if (isFile) {
                // CryptoJS handles ArrayBuffers via WordArray.create
                // Note: For very large files, chunked processing is ideal, 
                // but standard CryptoJS is synchronous. Running in worker avoids UI freeze.
                inputData = CryptoJS.lib.WordArray.create(data);
            } else {
                inputData = data;
            }

            const results = {};

            algos.forEach(algo => {
                let hash;
                if (algo.startsWith('Hmac')) {
                    // algo e.g., 'HmacMD5'
                    hash = CryptoJS[algo](inputData, hmacKey);
                } else {
                    hash = CryptoJS[algo](inputData);
                }
                results[algo] = hash.toString(CryptoJS.enc.Hex);
            });

            self.postMessage({ type: 'result', results: results, requestId: requestId });

        } catch (error) {
            const msg = error && error.message ? error.message : 'Unknown error';
            self.postMessage({ type: 'error', error: msg, requestId: requestId });
        }
    }
};
