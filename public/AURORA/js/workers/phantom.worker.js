self.onmessage = function(e) {
    const { cmd, imgFront, imgBack, width, height } = e.data;

    if (cmd === 'process') {
        try {
            const d1 = new Uint8ClampedArray(imgFront);
            const d2 = new Uint8ClampedArray(imgBack);
            const outputData = new Uint8ClampedArray(width * height * 4);

            for(let i=0; i<d1.length; i+=4) {
                const g1 = 0.299*d1[i] + 0.587*d1[i+1] + 0.114*d1[i+2];
                const g2 = 0.299*d2[i] + 0.587*d2[i+1] + 0.114*d2[i+2];

                let a = 255 - (g1 - g2);
                if (a < 0) a = 0;
                if (a > 255) a = 255;

                let gray = 0;
                if (a > 0) gray = 255 * g2 / a;
                if (gray > 255) gray = 255;

                outputData[i] = gray;
                outputData[i+1] = gray;
                outputData[i+2] = gray;
                outputData[i+3] = a * (e.data.alphaBoost || 1);
            }

            self.postMessage({ type: 'success', outputData: outputData.buffer, width, height }, [outputData.buffer]);
        } catch (error) {
            self.postMessage({ type: 'error', error: error.message });
        }
    } else if (cmd === 'prism') {
        try {
            const d1 = new Uint8ClampedArray(imgFront);
            const d2 = new Uint8ClampedArray(imgBack);
            const outputData = new Uint8ClampedArray(width * height * 4);

            const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
            const sourceBrightness = e.data.sourceBrightness;
            const sourceContrast = e.data.sourceContrast;
            const hiddenBrightness = e.data.hiddenBrightness;
            const hiddenContrast = e.data.hiddenContrast;

            const originalBrightnessFactor = 1 + sourceBrightness / 100;
            const hiddenBrightnessFactor = 1 - hiddenBrightness / 100;
            const originalContrastFactor = sourceContrast / 100;
            const hiddenContrastFactor = hiddenContrast / 100;

            for (let i = 0; i < d1.length; i += 4) {
                const pixelIndex = i / 4;
                const x = pixelIndex % width;
                const y = Math.floor(pixelIndex / width);

                const adjustPixel = (r, g, b, brightnessFactor, contrastFactor) => {
                    const brightR = r * brightnessFactor;
                    const brightG = g * brightnessFactor;
                    const brightB = b * brightnessFactor;
                    const adjustContrast = (value) => clamp((value - 128) * contrastFactor + 128, 0, 255);
                    return [adjustContrast(brightR), adjustContrast(brightG), adjustContrast(brightB)];
                };

                if ((x + y) % 2 === 0) {
                    const pixel = adjustPixel(d1[i], d1[i + 1], d1[i + 2], originalBrightnessFactor, originalContrastFactor);
                    outputData[i] = pixel[0];
                    outputData[i + 1] = pixel[1];
                    outputData[i + 2] = pixel[2];
                } else {
                    const pixel = adjustPixel(d2[i], d2[i + 1], d2[i + 2], hiddenBrightnessFactor, hiddenContrastFactor);
                    outputData[i] = pixel[0];
                    outputData[i + 1] = pixel[1];
                    outputData[i + 2] = pixel[2];
                }
                outputData[i + 3] = 255;
            }

            self.postMessage({ type: 'success', outputData: outputData.buffer, width, height }, [outputData.buffer]);
        } catch (error) {
            self.postMessage({ type: 'error', error: error.message });
        }
    } else if (cmd === 'shadow') {
        try {
            const innerPixels = new Uint8ClampedArray(imgBack);
            const coverPixels = new Uint8ClampedArray(imgFront);
            const outputData = new Uint8ClampedArray(innerPixels.length);

            const isColored = e.data.isColored;
            const scaleInner = e.data.scaleInner;
            const scaleCover = e.data.scaleCover;
            const desatInner = e.data.desatInner;
            const desatCover = e.data.desatCover;
            const weightInner = e.data.weightInner;

            const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

            const innerGray = new Uint8ClampedArray(innerPixels.length / 4);
            const coverGray = new Uint8ClampedArray(coverPixels.length / 4);

            for (let i = 0; i < innerPixels.length; i += 4) {
                const idx = i >> 2;
                innerGray[idx] = 0.299 * innerPixels[i] + 0.587 * innerPixels[i + 1] + 0.114 * innerPixels[i + 2];
                coverGray[idx] = 0.299 * coverPixels[i] + 0.587 * coverPixels[i + 1] + 0.114 * coverPixels[i + 2];
            }

            const innerScale = scaleInner;
            const coverScale = 1 - scaleCover;

            if (isColored) {
                const innerCache = new Uint8ClampedArray(innerPixels.length);
                const coverCache = new Uint8ClampedArray(coverPixels.length);
                const alphaCache = new Float32Array(innerGray.length);

                for (let i = 0; i < innerPixels.length; i += 4) {
                    const gray = innerGray[i >> 2] * innerScale;
                    const r = innerPixels[i] * innerScale;
                    const g = innerPixels[i + 1] * innerScale;
                    const b = innerPixels[i + 2] * innerScale;
                    innerCache[i] = r + (gray - r) * desatInner;
                    innerCache[i + 1] = g + (gray - g) * desatInner;
                    innerCache[i + 2] = b + (gray - b) * desatInner;
                }

                for (let i = 0; i < coverPixels.length; i += 4) {
                    const gray = 255 - (255 - coverGray[i >> 2]) * coverScale;
                    const r = 255 - (255 - coverPixels[i]) * coverScale;
                    const g = 255 - (255 - coverPixels[i + 1]) * coverScale;
                    const b = 255 - (255 - coverPixels[i + 2]) * coverScale;
                    coverCache[i] = r + (gray - r) * desatCover;
                    coverCache[i + 1] = g + (gray - g) * desatCover;
                    coverCache[i + 2] = b + (gray - b) * desatCover;
                }

                for (let i = 0; i < innerGray.length; i++) {
                    alphaCache[i] = Math.min(Math.max((255 + innerGray[i] * innerScale - (255 - (255 - coverGray[i]) * coverScale)) / 255, 0), 1);
                }

                for (let i = 0; i < innerPixels.length; i += 4) {
                    const alpha = alphaCache[i >> 2];
                    const alphaColor = 255 * alpha;
                    const safeAlpha = Math.max(alpha, 0.0001);
                    outputData[i] = clamp(((innerCache[i] - alphaColor + 255 - coverCache[i]) * weightInner + alphaColor - 255 + coverCache[i]) / safeAlpha, 0, 255);
                    outputData[i + 1] = clamp(((innerCache[i + 1] - alphaColor + 255 - coverCache[i + 1]) * weightInner + alphaColor - 255 + coverCache[i + 1]) / safeAlpha, 0, 255);
                    outputData[i + 2] = clamp(((innerCache[i + 2] - alphaColor + 255 - coverCache[i + 2]) * weightInner + alphaColor - 255 + coverCache[i + 2]) / safeAlpha, 0, 255);
                    outputData[i + 3] = clamp(255 * alpha, 0, 255);
                }
            } else {
                for (let i = 0; i < innerGray.length; i++) {
                    const inner = innerGray[i] * innerScale;
                    const alpha = 255 + inner - (255 - (255 - coverGray[i]) * coverScale);
                    const safeAlpha = Math.max(alpha, 0.0001);
                    const color = clamp((255 * inner) / safeAlpha, 0, 255);
                    outputData[i << 2] = color;
                    outputData[(i << 2) + 1] = color;
                    outputData[(i << 2) + 2] = color;
                    outputData[(i << 2) + 3] = clamp(alpha, 0, 255);
                }
            }

            self.postMessage({ type: 'success', outputData: outputData.buffer, width, height }, [outputData.buffer]);
        } catch (error) {
            self.postMessage({ type: 'error', error: error.message });
        }
    }
};