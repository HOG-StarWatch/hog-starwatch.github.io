/**
 * Web Worker for Hash Calculation
 * Handles CPU-intensive hash computations off the main thread.
 */

importScripts('https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js');

self.onmessage = function(e) {
    const { type, payload } = e.data;

    if (type === 'calc') {
        const { data, isFile, algos, hmacKey } = payload;
        
        try {
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

            self.postMessage({ type: 'result', results: results });

        } catch (error) {
            self.postMessage({ type: 'error', error: error.message });
        }
    }
};
