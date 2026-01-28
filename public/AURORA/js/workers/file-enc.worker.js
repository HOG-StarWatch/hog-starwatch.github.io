
// Import ResourceLoader
importScripts('../loader.js');

const handlers = {
    /**
     * Encode files to Base64/JSON with optional compression
     */
    encode: async ({ files, compressFmt }) => {
        const list = [];
        
        for (const file of files) {
            const result = await processFile(file, compressFmt);
            list.push(result);
        }
        
        return list;
    },

    /**
     * Stream Encode files to Base64/JSON
     * Emits 'chunk' messages to build the JSON file on main thread
     */
    encode_stream: async ({ files, compressFmt }) => {
        // 1. Send JSON Start
        const header = {
            version: '1.0',
            createdAt: new Date().toISOString(),
            files: [] // We will manually open this array
        };
        // Construct header string: '{"version":"1.0",...,"files":['
        const headerStr = JSON.stringify(header).slice(0, -1); 
        self.postMessage({ type: 'chunk', data: headerStr });

        // 2. Process Files
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Separator
            if (i > 0) self.postMessage({ type: 'chunk', data: ',' });

            // File Header
            // We can't know the final compression size/format easily if we stream native compression.
            // But JSON format expects: { name, type, size, compression, data }
            // If we stream, we might not know 'data' length or 'compression' result ahead of time?
            // Wait, 'compression' is the format name (e.g. 'gzip'). That is known.
            // 'size' is usually original size.
            
            // Start File Object
            const fileMeta = {
                name: file.name,
                type: file.type || '',
                size: file.size,
                compression: compressFmt,
                // data: ... (we will append this manually)
            };
            
            // Stringify meta, remove closing '}' to append data
            let metaStr = JSON.stringify(fileMeta); 
            metaStr = metaStr.slice(0, -1) + ',"data":"';
            self.postMessage({ type: 'chunk', data: metaStr });

            // Stream Data
            await processFileStream(file, compressFmt, (chunk) => {
                self.postMessage({ type: 'chunk', data: chunk });
            });

            // Close File Object
            self.postMessage({ type: 'chunk', data: '"}' });
            
            // Yield to event loop
            await new Promise(r => setTimeout(r, 0));
        }

        // 3. Send JSON End
        self.postMessage({ type: 'chunk', data: ']}' });
        return { success: true };
    }
};

// --- Helpers ---

// Helper: Process single file (Full Memory - Legacy/Wasm)
const processFile = async (file, compressFmt) => {
    // Read file content
    const buf = await file.arrayBuffer();
    let raw = new Uint8Array(buf);
    let usedFmt = 'none';
    let payloadBytes = raw;
    
    if (compressFmt !== 'none') {
        try {
            self.postMessage({ type: 'status', msg: `Compressing ${file.name} with ${compressFmt}...` });
            payloadBytes = await compressBytes(raw, compressFmt);
            usedFmt = compressFmt;
        } catch(e) {
            console.warn("Compression failed, falling back to none", e);
            self.postMessage({ type: 'warning', msg: `Compression failed for ${file.name}: ${e.message}` });
            payloadBytes = raw; // Revert
            usedFmt = 'none';
        }
    }
    
    self.postMessage({ type: 'status', msg: `Encoding ${file.name}...` });
    const b64Data = bytesToBase64(payloadBytes);

    return {
        name: file.name,
        type: file.type || '',
        size: file.size,
        compression: usedFmt,
        data: b64Data
    };
};

// Helper: Process file with Streaming (where possible)
// onData: callback(stringChunk)
const processFileStream = async (file, compressFmt, onData) => {
    self.postMessage({ type: 'status', msg: `Processing ${file.name} (${compressFmt})...` });

    // Case 1: Native Streaming (Gzip/Deflate)
    if ((compressFmt === 'gzip' || compressFmt === 'deflate') && typeof CompressionStream !== 'undefined') {
        try {
            const cs = new CompressionStream(compressFmt);
            const stream = file.stream().pipeThrough(cs);
            await streamToBase64Chunks(stream, onData);
            return;
        } catch (e) {
            console.warn("Stream compression failed, fallback to memory", e);
            // Fallback to memory below
        }
    }

    // Case 2: Wasm or None (Memory based for compression, but chunked Base64)
    // For 'none', we could stream read, but for now let's reuse logic or optimize 'none' later.
    // Actually 'none' should definitely be streamed to avoid reading 100MB!
    
    if (compressFmt === 'none') {
        // Stream read file without compression
        await streamToBase64Chunks(file.stream(), onData);
        return;
    }

    // Case 3: Wasm (Brotli/Zstd) - Full Load -> Compress -> Chunked Base64
    // We load full file, compress it (result is buffer), then chunk-encode the buffer.
    try {
        const buf = await file.arrayBuffer();
        const compressed = await compressBytes(new Uint8Array(buf), compressFmt);
        // Convert compressed buffer to Base64 chunks
        const blob = new Blob([compressed]);
        await streamToBase64Chunks(blob.stream(), onData);
    } catch (e) {
        console.warn("Wasm compression failed, fallback to none", e);
        self.postMessage({ type: 'warning', msg: `Compression failed for ${file.name}, using uncompressed` });
        // Fallback: Stream original file
        await streamToBase64Chunks(file.stream(), onData);
    }
};

// Helper: Convert ReadableStream to Base64 chunks and emit
const streamToBase64Chunks = async (readableStream, onData) => {
    const reader = readableStream.getReader();
    let buffer = new Uint8Array(0);
    const CHUNK_LIMIT = 1024 * 1024 * 3; // 3MB chunks (multiple of 3)

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Append new data to buffer
        const newBuffer = new Uint8Array(buffer.length + value.length);
        newBuffer.set(buffer);
        newBuffer.set(value, buffer.length);
        buffer = newBuffer;

        // Process full chunks
        while (buffer.length >= CHUNK_LIMIT) {
            const chunk = buffer.slice(0, CHUNK_LIMIT);
            buffer = buffer.slice(CHUNK_LIMIT);
            onData(bytesToBase64(chunk));
        }
    }

    // Process remaining
    if (buffer.length > 0) {
        onData(bytesToBase64(buffer));
    }
};


// Helper: Stream compression
const compressBytes = async (bytes, fmt) => {
    if (fmt === 'brotli') {
        try {
            // Try ESM first
            try {
                const brotli = await ResourceLoader.import('brotli-wasm-esm');
                await brotli.default(); 
                return brotli.compress(bytes);
            } catch (e) {
                console.warn("Brotli ESM failed in worker, trying UMD...", e);
                // Fallback UMD
                throw e;
            }
        } catch(e) {
            throw new Error("Brotli Wasm load failed: " + e.message);
        }
    }
    
    if (fmt === 'zstd') {
        try {
            try {
                const zstd = await ResourceLoader.import('zstd-wasm-esm');
                await zstd.init();
                return zstd.compress(bytes);
            } catch(e) {
                // Fallback logic
                await ResourceLoader.load('zstd-wasm');
                await Zstd.init();
                return Zstd.compress(bytes);
            }
        } catch(e) {
            throw new Error("Zstd Wasm load failed: " + e.message);
        }
    }

    if (fmt === 'gzip' || fmt === 'deflate') {
        if (typeof CompressionStream === 'undefined') throw new Error("Worker: CompressionStream unsupported");
        const blob = new Blob([bytes]);
        const cs = new CompressionStream(fmt);
        const stream = blob.stream().pipeThrough(cs);
        const response = new Response(stream);
        return new Uint8Array(await response.arrayBuffer());
    }

    return bytes; // none
};

// Manual Base64 encoding for better performance control in worker
const bytesToBase64 = (bytes) => {
    // Small chunks: use iteration or String.fromCharCode apply
    // Large chunks: use FileReaderSync
    if (typeof FileReaderSync !== 'undefined') {
        const blob = new Blob([bytes]);
        const reader = new FileReaderSync();
        const dataUrl = reader.readAsDataURL(blob);
        return dataUrl.split(',')[1];
    }
    
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

    /**
     * Decode JSON/Base64 to file blobs (returned as Buffers)
     */
    decode: async ({ jsonStr }) => {
        let dataObj;
        try {
            dataObj = JSON.parse(jsonStr);
        } catch(e) {
            throw new Error("Invalid JSON format");
        }
        
        if(!dataObj.files) throw new Error("JSON missing 'files' field");

        const results = [];
        
        const decompressBytes = async (bytes, fmt) => {
            if (fmt === 'brotli') {
               const brotli = await ResourceLoader.import('brotli-wasm-esm');
               await brotli.default(); 
               return brotli.decompress(bytes);
            }
            
            if (fmt === 'zstd') {
                try {
                    const zstd = await ResourceLoader.import('zstd-wasm-esm');
                    await zstd.init();
                    return zstd.decompress(bytes);
                } catch(e) {
                    await ResourceLoader.load('zstd-wasm');
                    await Zstd.init();
                    return Zstd.decompress(bytes);
                }
            }

            if (fmt === 'gzip' || fmt === 'deflate') {
                if (typeof DecompressionStream === 'undefined') throw new Error("DecompressionStream unsupported");
                const blob = new Blob([bytes]);
                const ds = new DecompressionStream(fmt);
                const stream = blob.stream().pipeThrough(ds);
                const response = new Response(stream);
                return new Uint8Array(await response.arrayBuffer());
            }
            return bytes;
        };

        for (const f of dataObj.files) {
            self.postMessage({ type: 'status', msg: `Decoding ${f.name}...` });
            
            // Base64 to Bytes
            const binString = atob(f.data);
            const len = binString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binString.charCodeAt(i);
            }
            
            let outBytes = bytes;
            if (f.compression && f.compression !== 'none') {
                self.postMessage({ type: 'status', msg: `Decompressing ${f.name} (${f.compression})...` });
                outBytes = await decompressBytes(bytes, f.compression);
            }
            
            results.push({
                name: f.name,
                type: f.type,
                data: outBytes // Transferable? We'll send back as is
            });
        }
        
        return results;
    }
};

self.onmessage = async (e) => {
    const { id, action, payload } = e.data;
    
    if (handlers[action]) {
        try {
            const result = await handlers[action](payload);
            self.postMessage({ id, status: 'success', result });
        } catch (error) {
            self.postMessage({ id, status: 'error', error: error.message });
        }
    } else {
        self.postMessage({ id, status: 'error', error: `Unknown action: ${action}` });
    }
};
