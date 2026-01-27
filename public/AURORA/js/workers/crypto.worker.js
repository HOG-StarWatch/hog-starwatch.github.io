/**
 * Aurora Image Crypto Worker
 * Handles heavy image processing tasks off the main thread.
 * @ts-check
 */

self.onmessage = function(e) {
    const { command, id, ...args } = e.data;
    
    try {
        let result;
        let transferables = [];

        switch(command) {
            case 'gilbert-encrypt':
                result = gilbertProcess(args.pixels, args.width, args.height, args.key, true);
                break;
            case 'gilbert-decrypt':
                result = gilbertProcess(args.pixels, args.width, args.height, args.key, false);
                break;
            case 'visual-encrypt':
                result = visualEncrypt(args.pixels, args.width, args.height, args.style, args.size, args.algo, args.noise, id);
                break;
            case 'visual-decrypt':
                result = visualDecrypt(args.pixelsB, args.pixelsC, args.width, args.height, args.algo, args.noise, id);
                break;
            case 'diff-encrypt':
                result = diffEncrypt(args);
                break;
            case 'diff-decrypt':
                result = diffDecrypt(args);
                break;
            default:
                throw new Error(`Unknown command: ${command}`);
        }

        // Identify transferables to avoid copying
        if (result.pixels) transferables.push(result.pixels.buffer);
        if (result.pixelsA) transferables.push(result.pixelsA.buffer);
        if (result.pixelsB) transferables.push(result.pixelsB.buffer);

        self.postMessage({ id, success: true, ...result }, transferables);

    } catch (err) {
        console.error(err);
        self.postMessage({ id, success: false, error: err.message });
    }
};

// ==========================================
// 1. Gilbert Shuffle Algorithms
// ==========================================

/**
 * Generate Gilbert Curve coordinates as flat indices
 * @param {number} width 
 * @param {number} height 
 * @returns {Uint32Array} Flat indices array
 */
function gilbert2d(width, height) {
    const total = width * height;
    // Use Uint32Array to store indices directly, saving massive memory compared to [x,y] arrays
    const indices = new Uint32Array(total);
    let cursor = 0;

    function generate2d(x, y, ax, ay, bx, by) {
        const w = Math.abs(ax + ay);
        const h = Math.abs(bx + by);
        const dax = Math.sign(ax), day = Math.sign(ay);
        const dbx = Math.sign(bx), dby = Math.sign(by);

        if (h === 1) {
            for (let i = 0; i < w; i++) {
                indices[cursor++] = y * width + x;
                x += dax; y += day;
            }
            return;
        }
        if (w === 1) {
            for (let i = 0; i < h; i++) {
                indices[cursor++] = y * width + x;
                x += dbx; y += dby;
            }
            return;
        }

        let ax2 = Math.floor(ax / 2), ay2 = Math.floor(ay / 2);
        let bx2 = Math.floor(bx / 2), by2 = Math.floor(by / 2);
        const w2 = Math.abs(ax2 + ay2), h2 = Math.abs(bx2 + by2);

        if (2 * w > 3 * h) {
            if ((w2 % 2) && (w > 2)) { ax2 += dax; ay2 += day; }
            generate2d(x, y, ax2, ay2, bx, by);
            generate2d(x + ax2, y + ay2, ax - ax2, ay - ay2, bx, by);
        } else {
            if ((h2 % 2) && (h > 2)) { bx2 += dbx; by2 += dby; }
            generate2d(x, y, bx2, by2, ax2, ay2);
            generate2d(x + bx2, y + by2, ax, ay, bx - bx2, by - by2);
            generate2d(x + (ax - dax) + (bx2 - dbx), y + (ay - day) + (by2 - dby), -bx2, -by2, -(ax - ax2), -(ay - ay2));
        }
    }

    if (width >= height) generate2d(0, 0, width, 0, 0, height);
    else generate2d(0, 0, 0, height, width, 0);

    return indices;
}

function gilbertProcess(srcPixels, width, height, keySeed, isEncrypt) {
    const curveIndices = gilbert2d(width, height);
    const total = width * height;
    const destPixels = new Uint8ClampedArray(total * 4);
    
    // Simple deterministic random generator based on key
    // Note: JS numbers are double, bitwise ops are 32-bit.
    // We use the same offset logic as original code.
    const key = parseInt(keySeed) || 0;
    const offset = Math.round(((Math.sqrt(5) - 1) / 2 * total) + key) % total;

    for (let i = 0; i < total; i++) {
        const p1_idx = curveIndices[i] * 4;
        const p2_idx = curveIndices[(i + offset) % total] * 4;
        
        // Encrypt: Source(p1) -> Dest(p2)
        // Decrypt: Source(p2) -> Dest(p1)
        
        if (isEncrypt) {
            destPixels[p2_idx]   = srcPixels[p1_idx];
            destPixels[p2_idx+1] = srcPixels[p1_idx+1];
            destPixels[p2_idx+2] = srcPixels[p1_idx+2];
            destPixels[p2_idx+3] = srcPixels[p1_idx+3];
        } else {
            destPixels[p1_idx]   = srcPixels[p2_idx];
            destPixels[p1_idx+1] = srcPixels[p2_idx+1];
            destPixels[p1_idx+2] = srcPixels[p2_idx+2];
            destPixels[p1_idx+3] = srcPixels[p2_idx+3];
        }
    }

    return { pixels: destPixels };
}

// ==========================================
// 2. Visual Crypto Algorithms
// ==========================================

// Simple deterministic PRNG based on coordinates and seed
function getNoise(x, y, seed) {
    let h = seed ^ x ^ (y << 16);
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    return (h ^ (h >>> 16)) >>> 0; // Return unsigned 32-bit integer
}

function visualEncrypt(srcPixels, w, h, style, param, algo, seed, id) {
    // 1. Generate Visual Share B (Mask Layer)
    const bPixels = new Uint8ClampedArray(w * h * 4);
    
    const getPx = (x, y) => {
        if(x<0||x>=w||y<0||y>=h) return [0,0,0,0];
        const i = (y*w+x)*4;
        return [srcPixels[i], srcPixels[i+1], srcPixels[i+2], srcPixels[i+3]];
    };

    const reportProgress = (percent) => {
        if (id) self.postMessage({ id, progress: percent });
    };

    // --- Phase 1: Generate Visual Style (Share B) ---
    // This logic creates the "Visual" part (Mosaic, Blur, etc.)
    // No changes to style generation logic, just ensuring it populates bPixels
    
    // Safety check for empty pixels
    if (!srcPixels) throw new Error("Source pixels is null/undefined");
    if (srcPixels.length === 0) throw new Error("Source pixels has length 0");
    if (srcPixels.byteLength === 0) throw new Error("Source pixels byteLength is 0");

    if(style === 'blur') {
        const r = Math.max(1, Math.floor(param/2));
        for(let y=0; y<h; y++) {
            if (y % 20 === 0) reportProgress(Math.floor((y / h) * 45));
            for(let x=0; x<w; x++) {
                let sr=0, sg=0, sb=0, cnt=0;
                for(let dy=-r; dy<=r; dy+=2) {
                    for(let dx=-r; dx<=r; dx+=2) {
                        const px = getPx(x+dx, y+dy);
                        if(px[3]>0) { sr+=px[0]; sg+=px[1]; sb+=px[2]; cnt++; }
                    }
                }
                const i = (y*w+x)*4;
                bPixels[i] = cnt?sr/cnt:0; bPixels[i+1] = cnt?sg/cnt:0; bPixels[i+2] = cnt?sb/cnt:0; bPixels[i+3] = 255;
            }
        }
    } else if(style === 'mosaic') {
        const bs = Math.max(2, param);
        for(let y=0; y<h; y+=bs) {
            if (y % (bs*5) === 0) reportProgress(Math.floor((y / h) * 45));
            for(let x=0; x<w; x+=bs) {
                let sr=0, sg=0, sb=0, cnt=0;
                for(let dy=0; dy<bs && y+dy<h; dy++) {
                    for(let dx=0; dx<bs && x+dx<w; dx++) {
                        const px = getPx(x+dx, y+dy);
                        sr+=px[0]; sg+=px[1]; sb+=px[2]; cnt++;
                    }
                }
                const r=sr/cnt, g=sg/cnt, b=sb/cnt;
                for(let dy=0; dy<bs && y+dy<h; dy++) {
                    for(let dx=0; dx<bs && x+dx<w; dx++) {
                        const i = ((y+dy)*w+(x+dx))*4;
                        bPixels[i]=r; bPixels[i+1]=g; bPixels[i+2]=b; bPixels[i+3]=255;
                    }
                }
            }
        }
    } else if(style === 'edge') {
        for(let y=0; y<h; y++) {
            if (y % 20 === 0) reportProgress(Math.floor((y / h) * 45));
            for(let x=0; x<w; x++) {
                const i = (y*w+x)*4;
                const p = getPx(x,y);
                const pr = getPx(x+1,y);
                const pd = getPx(x,y+1);
                const val = (Math.abs(p[0]-pr[0]) + Math.abs(p[0]-pd[0])) * (param/5);
                bPixels[i]=bPixels[i+1]=bPixels[i+2]=Math.min(255, val); bPixels[i+3]=255;
            }
        }
    } else if(style === 'invert') {
        for(let i=0; i<srcPixels.length; i+=4) {
             bPixels[i]=255-srcPixels[i]; bPixels[i+1]=255-srcPixels[i+1]; bPixels[i+2]=255-srcPixels[i+2]; bPixels[i+3]=255;
        }
        reportProgress(45);
    } else {
        // Pattern styles (dot, stripe, cross)
        const s = Math.max(2, param);
        for(let y=0; y<h; y++) {
            if (y % 20 === 0) reportProgress(Math.floor((y / h) * 45));
            for(let x=0; x<w; x++) {
                const i = (y*w+x)*4;
                let keep = false;
                if(style === 'stripe') keep = (y % s < s/2);
                else if(style === 'cross') keep = (x % s < 1 || y % s < 1);
                else if(style === 'dot') {
                    const cx = (x%s - s/2), cy = (y%s - s/2);
                    keep = (cx*cx + cy*cy < (s/3)*(s/3));
                }
                if(keep) {
                    bPixels[i]=srcPixels[i]; bPixels[i+1]=srcPixels[i+1]; bPixels[i+2]=srcPixels[i+2]; bPixels[i+3]=255;
                } else {
                    bPixels[i]=240; bPixels[i+1]=240; bPixels[i+2]=240; bPixels[i+3]=255;
                }
            }
        }
    }

    reportProgress(50); // Phase 1 done

    // 2. Generate Key Share C (Hidden Layer)
    // We iterate by pixel to apply deterministic noise
    const cPixels = new Uint8ClampedArray(w * h * 4);
    const totalPixels = w * h;
    const chunkSize = Math.max(2000, Math.floor(totalPixels / 50)); 
    
    const useXor = (algo === 'lsb' || algo === 'xor'); // 'lsb' key is repurposed for XOR
    const safeSeed = parseInt(seed) || 0;

    let pIndex = 0; // Pixel index (0 to totalPixels-1)
    
    for(let i=0; i<srcPixels.length; i+=4) {
        if ((i/4) % chunkSize === 0) {
            reportProgress(50 + Math.floor(((i/4) / totalPixels) * 50)); 
        }

        const x = pIndex % w;
        const y = Math.floor(pIndex / w);
        pIndex++;

        // Generate deterministic noise for this pixel
        const n = getNoise(x, y, safeSeed) % 256;

        if (!useXor) {
            // Arithmetic: C = A - B - noise
            // (A = B + C + noise)
            cPixels[i]   = (srcPixels[i]   - bPixels[i]   - n + 512) % 256;
            cPixels[i+1] = (srcPixels[i+1] - bPixels[i+1] - n + 512) % 256;
            cPixels[i+2] = (srcPixels[i+2] - bPixels[i+2] - n + 512) % 256;
        } else {
            // XOR: C = A ^ B ^ noise
            // (A = B ^ C ^ noise)
            cPixels[i]   = srcPixels[i]   ^ bPixels[i]   ^ n;
            cPixels[i+1] = srcPixels[i+1] ^ bPixels[i+1] ^ n;
            cPixels[i+2] = srcPixels[i+2] ^ bPixels[i+2] ^ n;
        }
        cPixels[i+3] = 255; // Always opaque
    }

    reportProgress(100);
    return { pixelsA: bPixels, pixelsB: cPixels };
}

function visualDecrypt(bPixels, cPixels, w, h, algo, seed, id) {
    const aPixels = new Uint8ClampedArray(w * h * 4);
    const totalPixels = w * h;
    const chunkSize = Math.max(2000, Math.floor(totalPixels / 100));

    const reportProgress = (percent) => {
        if (id) self.postMessage({ id, progress: percent });
    };

    const useXor = (algo === 'lsb' || algo === 'xor');
    const safeSeed = parseInt(seed) || 0;
    
    let pIndex = 0;

    for(let i=0; i<bPixels.length; i+=4) {
        if ((i/4) % chunkSize === 0) {
            reportProgress(Math.floor(((i/4) / totalPixels) * 100));
        }

        const x = pIndex % w;
        const y = Math.floor(pIndex / w);
        pIndex++;

        const n = getNoise(x, y, safeSeed) % 256;

        if (!useXor) {
            // Arithmetic Restore: A = B + C + noise
            aPixels[i]   = (bPixels[i]   + cPixels[i]   + n) % 256;
            aPixels[i+1] = (bPixels[i+1] + cPixels[i+1] + n) % 256;
            aPixels[i+2] = (bPixels[i+2] + cPixels[i+2] + n) % 256;
        } else {
            // XOR Restore: A = B ^ C ^ noise
            aPixels[i]   = bPixels[i]   ^ cPixels[i]   ^ n;
            aPixels[i+1] = bPixels[i+1] ^ cPixels[i+1] ^ n;
            aPixels[i+2] = bPixels[i+2] ^ cPixels[i+2] ^ n;
        }
        aPixels[i+3] = 255;
    }

    return { pixels: aPixels };
}

// ==========================================
// 3. Difference Separation Algorithms
// ==========================================

function diffEncrypt({ targetPixels, refPixels, overlayPixels, useGuided, width, height }) {
    const totalPixels = width * height;
    const resultA = new Uint8ClampedArray(totalPixels * 4);
    const resultB = new Uint8ClampedArray(totalPixels * 4);
    
    for (let i = 0; i < totalPixels; i++) {
        const idx = i * 4;
        const O = [targetPixels[idx], targetPixels[idx+1], targetPixels[idx+2]];
        let isMasked = false;
        if (overlayPixels && overlayPixels[idx+3] > 0) isMasked = true;

        let A, B;

        if (isMasked) {
            // High security masking
            if (Math.random() < 0.5) {
                A = [Math.random()*255, Math.random()*255, Math.random()*255];
                B = [
                    (A[0] - O[0] + 255) % 256,
                    (A[1] - O[1] + 255) % 256,
                    (A[2] - O[2] + 255) % 256
                ];
            } else {
                B = [Math.random()*255, Math.random()*255, Math.random()*255];
                A = [
                    (B[0] + O[0]) % 256,
                    (B[1] + O[1]) % 256,
                    (B[2] + O[2]) % 256
                ];
            }
        } else if (useGuided && refPixels) {
            const R = [refPixels[idx], refPixels[idx+1], refPixels[idx+2]];
            // Guided Logic
            A = [0,0,0]; B = [0,0,0];
            for (let c = 0; c < 3; c++) {
                let Ov = O[c];
                let Rv = R[c];
                let minX = Ov / 2.0;
                let maxX = 255 - Ov / 2.0;
                let X;
                if (Rv >= minX && Rv <= maxX) X = Rv;
                else X = (Math.abs(minX - Rv) < Math.abs(maxX - Rv)) ? minX : maxX;

                let lowVal  = Math.round(X - Ov / 2.0);
                let highVal = Math.round(X + Ov / 2.0);

                if (Math.random() < 0.5) { A[c] = lowVal; B[c] = highVal; }
                else { A[c] = highVal; B[c] = lowVal; }
            }
        } else {
            // Standard Logic
            A = [0,0,0]; B = [0,0,0];
            let L = (O[0]+O[1]+O[2])/3.0/255.0;
            let modeBrightProb = L / 2 + 0.5;
            let modeBright = Math.random() < modeBrightProb;
            let specialChannel = Math.floor(Math.random() * 3);
            for (let c=0;c<3;c++){
                if(modeBright){
                    if(c===specialChannel){ A[c]=0; B[c]=O[c]; }
                    else { A[c]=255; B[c]=255-O[c]; }
                } else {
                    if(c===specialChannel){ A[c]=255; B[c]=255-O[c]; }
                    else { A[c]=0; B[c]=O[c]; }
                }
            }
            if (Math.random() < 0.5) { const t=A; A=B; B=t; }
        }

        resultA[idx] = A[0]; resultA[idx+1] = A[1]; resultA[idx+2] = A[2]; resultA[idx+3] = 255;
        resultB[idx] = B[0]; resultB[idx+1] = B[1]; resultB[idx+2] = B[2]; resultB[idx+3] = 255;
    }

    return { pixelsA: resultA, pixelsB: resultB };
}

function diffDecrypt({ pixelsA, pixelsB, width, height }) {
    const totalPixels = width * height;
    const result = new Uint8ClampedArray(totalPixels * 4);
    
    for (let i = 0; i < totalPixels; i++) {
        const idx = i * 4;
        result[idx]   = Math.abs(pixelsA[idx]   - pixelsB[idx]);
        result[idx+1] = Math.abs(pixelsA[idx+1] - pixelsB[idx+1]);
        result[idx+2] = Math.abs(pixelsA[idx+2] - pixelsB[idx+2]);
        result[idx+3] = 255;
    }
    return { pixels: result };
}
