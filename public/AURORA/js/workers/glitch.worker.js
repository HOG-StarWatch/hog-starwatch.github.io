/**
 * Web Worker for Image Glitch Processing
 * Handles pixel manipulation for Layer Glitch effects
 */

self.onmessage = function(e) {
    const { type, imageData, config } = e.data;

    if (type === 'process') {
        try {
            const width = imageData.width;
            const height = imageData.height;
            const data = imageData.data;
            const originalData = new Uint8ClampedArray(data); // Copy original

            // 1. RGB Shift
            if (config.rgb.enabled) {
                const offX = config.rgb.amount;
                const offY = config.rgb.angle;

                if (offX !== 0 || offY !== 0) {
                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < width; x++) {
                            const idx = (y * width + x) * 4;

                            // Red Channel: Shift Left/Up
                            let rx = x - offX;
                            let ry = y - offY;
                            if (rx >= 0 && rx < width && ry >= 0 && ry < height) {
                                data[idx] = originalData[(ry * width + rx) * 4];
                            }

                            // Blue Channel: Shift Right/Down
                            let bx = x + offX;
                            let by = y + offY;
                            if (bx >= 0 && bx < width && by >= 0 && by < height) {
                                data[idx + 2] = originalData[(by * width + bx) * 4 + 2];
                            }
                        }
                    }
                }
            }

            // Note: Scanlines and Slicing are easier to do in Canvas context drawImage/fillRect
            // But if we want to do pure pixel manipulation here, we can.
            // For performance, Slicing is actually faster with drawImage in main thread.
            // However, let's implement Scanlines here as it is pixel iter.

            // 2. Scanlines
            if (config.scan.enabled) {
                const density = config.scan.density;
                const opacity = config.scan.opacity; // 0-1

                for (let y = 0; y < height; y += density) {
                    for (let x = 0; x < width; x++) {
                        const idx = (y * width + x) * 4;
                        // Darken the line
                        data[idx] = data[idx] * (1 - opacity);     // R
                        data[idx + 1] = data[idx + 1] * (1 - opacity); // G
                        data[idx + 2] = data[idx + 2] * (1 - opacity); // B
                    }
                }
            }

            self.postMessage({ type: 'complete', imageData: imageData }, [imageData.data.buffer]);

        } catch (error) {
            self.postMessage({ type: 'error', error: error.message });
        }
    }
};
