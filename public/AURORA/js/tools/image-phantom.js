/* Extracted from image-phantom.html (refactor script). Tool logic. */

        const DEFAULT_SOURCE_BRIGHTNESS = 100;
        const DEFAULT_SOURCE_CONTRAST = 20;
        const DEFAULT_HIDDEN_BRIGHTNESS = 90;
        const DEFAULT_HIDDEN_CONTRAST = 100;
        const DEFAULT_SHADOWS = {
            isColored: true,
            scaleInner: 0.3,
            scaleCover: 0.2,
            desatInner: 0,
            desatCover: 0,
            weightInner: 0.7,
            maxSize: 1200,
        };

        const modeMetaMap = {
            prism: {
                name: "光棱坦克",
                description: "保留棋盘格幻影图算法，适合制作需要全局拉高亮度后才更容易识别隐藏图的 PNG。",
                sourceLabel: "原图",
                hiddenLabel: "隐藏图",
                sourceCta: "点击上传原图",
                hiddenCta: "点击上传隐藏图",
                sourceHint: "支持常见图片格式，生成时将以这张图片的宽高作为最终输出尺寸。",
                hiddenHint: "隐藏图会在生成时按原图尺寸统一缩放，并参与棋盘格交错合成。",
                emptyResultHint: "尚未生成结果。上传两张图片并调整参数后，点击生成图像即可在此处预览并下载 PNG。",
            },
            shadow: {
                name: "幻影坦克",
                description: "支持全彩输出、黑白双背景预览，以及亮度/去色/权重控制。",
                sourceLabel: "白底图",
                hiddenLabel: "黑底图",
                sourceCta: "点击上传白底图",
                hiddenCta: "点击上传黑底图",
                sourceHint: "对应表图，会在生成时按黑底图的画幅进行居中裁切适配。",
                hiddenHint: "对应里图，输出尺寸和最大尺寸缩放以这张图为基准。",
                emptyResultHint: "尚未生成结果。上传白底图与黑底图后，点击生成图像即可查看同一 PNG 在白底/黑底下的差异。",
            },
        };

        let mode = "prism";
        let sourceImage = null;
        let hiddenImage = null;
        let isGenerating = false;
        let currentResult = null;

        let sourceBrightness = DEFAULT_SOURCE_BRIGHTNESS;
        let sourceContrast = DEFAULT_SOURCE_CONTRAST;
        let hiddenBrightness = DEFAULT_HIDDEN_BRIGHTNESS;
        let hiddenContrast = DEFAULT_HIDDEN_CONTRAST;

        let shadowIsColored = DEFAULT_SHADOWS.isColored;
        let shadowInnerScale = DEFAULT_SHADOWS.scaleInner;
        let shadowCoverScale = DEFAULT_SHADOWS.scaleCover;
        let shadowInnerDesat = DEFAULT_SHADOWS.desatInner;
        let shadowCoverDesat = DEFAULT_SHADOWS.desatCover;
        let shadowInnerWeight = DEFAULT_SHADOWS.weightInner;
        let shadowMaxSize = DEFAULT_SHADOWS.maxSize;

        let phantomRpc = null;

        function initWorker() {
            if (!window.Worker || !window.WorkerRpc) return;
            try {
                phantomRpc = WorkerRpc.create('../js/workers/phantom.worker.js', {
                    onFatal: () => { phantomRpc = null; } // main-thread fallback after worker crash
                });
            } catch (e) {
                console.error('Worker Init Failed', e);
                phantomRpc = null;
            }
        }

        initWorker();

        function applyWorkerOutput(d) {
            const cvs = document.getElementById('resultCanvas');
            const ctx = cvs.getContext('2d');
            const imgData = new ImageData(new Uint8ClampedArray(d.outputData), d.width, d.height);
            ctx.putImageData(imgData, 0, 0);
            enableDownload(d.width, d.height);
        }

        function setMode(nextMode) {
            mode = nextMode;
            updateUI();
        }

        function updateUI() {
            const meta = modeMetaMap[mode];

            document.getElementById('btn-prism').classList.toggle('is-active', mode === 'prism');
            document.getElementById('btn-shadow').classList.toggle('is-active', mode === 'shadow');
            document.getElementById('mode-description').textContent = meta.description;

            document.getElementById('source-label').textContent = meta.sourceLabel;
            document.getElementById('hidden-label').textContent = meta.hiddenLabel;
            document.getElementById('source-cta').textContent = sourceImage ? `更换${meta.sourceLabel}` : meta.sourceCta;
            document.getElementById('hidden-cta').textContent = hiddenImage ? `更换${meta.hiddenLabel}` : meta.hiddenCta;
            document.getElementById('source-hint').textContent = meta.sourceHint;
            document.getElementById('hidden-hint').textContent = meta.hiddenHint;

            document.getElementById('upload-hint').textContent = mode === 'prism'
                ? "原图会作为输出尺寸基准；如果隐藏图尺寸不同，生成时会自动缩放到原图尺寸。"
                : "白底图对应表图，黑底图对应里图；以黑底图为尺寸基准并对白底图做居中裁切适配。";

            document.getElementById('prism-controls').classList.toggle('hidden', mode !== 'prism');
            document.getElementById('shadow-controls').classList.toggle('hidden', mode !== 'shadow');

            document.getElementById('prism-result').classList.toggle('hidden', mode !== 'prism');
            document.getElementById('shadow-result').classList.toggle('hidden', mode !== 'shadow');
            document.getElementById('shadow-result-grid').classList.toggle('hidden', mode !== 'shadow' || !currentResult);

            document.getElementById('resultPlaceholder').textContent = meta.emptyResultHint;
            document.getElementById('resultPlaceholder').innerHTML = `<i class="fas fa-image"></i><div>${meta.emptyResultHint}</div>`;

            updateGenerateButton();
            updateSizeMismatch();
        }

        function updateGenerateButton() {
            document.getElementById('generate-btn').disabled = !sourceImage || !hiddenImage || isGenerating;
        }

        function updateSizeMismatch() {
            const el = document.getElementById('size-mismatch');
            if (sourceImage && hiddenImage && (sourceImage.width !== hiddenImage.width || sourceImage.height !== hiddenImage.height)) {
                el.textContent = mode === 'prism'
                    ? `检测到两张图片尺寸不一致：当前会按原图尺寸 ${sourceImage.width} × ${sourceImage.height} 统一缩放隐藏图后再生成。`
                    : `检测到两张图片尺寸不一致：当前暗影模式会按黑底图尺寸基准生成，并对白底图执行居中裁切适配。`;
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }

        function showError(message) {
            const el = document.getElementById('error-message');
            el.textContent = message;
            el.classList.remove('hidden');
            if (app && app.showToast) {
                app.showToast(message, 'error');
            }
        }

        function showStatus(message) {
            const el = document.getElementById('status-message');
            el.textContent = message;
        }

        function clamp(value, min, max) {
            return Math.min(max, Math.max(min, value));
        }

        function handleImage(input, idx) {
            const file = input.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                showError('仅支持上传图片文件。');
                input.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const data = {
                        file: file,
                        name: file.name,
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        url: e.target.result,
                        image: img
                    };

                    if (idx === 1) {
                        sourceImage = data;
                        const preview = document.getElementById('preview1');
                        preview.src = e.target.result;
                        preview.classList.add('is-visible');
                        document.getElementById('preview1-placeholder').classList.add('hidden');
                        const info = document.getElementById('preview1-info');
                        info.textContent = `${file.name} (${img.naturalWidth} × ${img.naturalHeight})`;
                        info.classList.remove('hidden');
                    } else {
                        hiddenImage = data;
                        const preview = document.getElementById('preview2');
                        preview.src = e.target.result;
                        preview.classList.add('is-visible');
                        document.getElementById('preview2-placeholder').classList.add('hidden');
                        const info = document.getElementById('preview2-info');
                        info.textContent = `${file.name} (${img.naturalWidth} × ${img.naturalHeight})`;
                        info.classList.remove('hidden');
                    }

                    updateGenerateButton();
                    updateSizeMismatch();
                    showStatus(sourceImage && hiddenImage ? '图片已加载，可点击生成图像。' : '请继续上传另一张图片。');
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function enableDownload(width, height) {
            isGenerating = false;
            updateGenerateButton();

            document.getElementById('download-btn').disabled = false;
            document.getElementById('resultPlaceholder').style.display = 'none';
            const canvas = document.getElementById('resultCanvas');
            canvas.style.display = 'block';

            if (mode === 'shadow') {
                const grid = document.getElementById('shadow-result-grid');
                grid.classList.remove('hidden');
                document.getElementById('result-img-white').src = canvas.toDataURL('image/png');
                document.getElementById('result-img-black').src = canvas.toDataURL('image/png');
                canvas.style.display = 'none';
            }

            const sizeInfo = document.getElementById('output-size');
            sizeInfo.textContent = `输出尺寸：${width} × ${height}`;
            sizeInfo.classList.remove('hidden');

            showStatus(mode === 'prism' ? '生成完成，请切换白底/黑底预览查看隐藏效果。' : '生成完成，已提供白底/黑底双预览。');

            if (app && app.showToast) {
                app.showToast('生成成功！');
            }

            setTimeout(() => {
                const height = document.body.scrollHeight;
                window.parent.postMessage({ type: 'resize', height: height }, '*');
            }, 100);
        }

        function generateImage() {
            if (!sourceImage || !hiddenImage) {
                showError('请先上传两张图片。');
                return;
            }

            isGenerating = true;
            updateGenerateButton();
            document.getElementById('error-message').classList.add('hidden');

            if (mode === 'prism') {
                generatePrismImage();
            } else {
                generateShadowImage();
            }
        }

        function generatePrismImage() {
            const w = sourceImage.width;
            const h = sourceImage.height;

            const cvs = document.getElementById('resultCanvas');
            cvs.width = w;
            cvs.height = h;
            const ctx = cvs.getContext('2d');

            const c1 = document.createElement('canvas'); c1.width = w; c1.height = h;
            const x1 = c1.getContext('2d');
            x1.drawImage(sourceImage.image, 0, 0, w, h);

            const c2 = document.createElement('canvas'); c2.width = w; c2.height = h;
            const x2 = c2.getContext('2d');
            x2.drawImage(hiddenImage.image, 0, 0, w, h);

            const d1 = x1.getImageData(0, 0, w, h).data;
            const d2 = x2.getImageData(0, 0, w, h).data;

            if (phantomRpc) {
                phantomRpc.call({
                    sub: 'prism',
                    imgFront: d1.buffer,
                    imgBack: d2.buffer,
                    width: w,
                    height: h,
                    sourceBrightness: sourceBrightness,
                    sourceContrast: sourceContrast,
                    hiddenBrightness: hiddenBrightness,
                    hiddenContrast: hiddenContrast
                }, [d1.buffer, d2.buffer]).then(applyWorkerOutput).catch((err) => {
                    const msg = err && err.message ? err.message : err;
                    console.error('Worker Error:', msg);
                    showError('生成失败: ' + msg);
                });
            } else {
                processPrismMain(d1, d2, w, h);
            }
        }

        function processPrismMain(d1, d2, w, h) {
            const cvs = document.getElementById('resultCanvas');
            const ctx = cvs.getContext('2d');
            const out = ctx.createImageData(w, h);
            const dOut = out.data;

            const originalBrightnessFactor = 1 + sourceBrightness / 100;
            const hiddenBrightnessFactor = 1 - hiddenBrightness / 100;
            const originalContrastFactor = sourceContrast / 100;
            const hiddenContrastFactor = hiddenContrast / 100;

            for (let i = 0; i < d1.length; i += 4) {
                const pixelIndex = i / 4;
                const x = pixelIndex % w;
                const y = Math.floor(pixelIndex / w);

                const adjustPixel = (r, g, b, brightnessFactor, contrastFactor) => {
                    const brightR = r * brightnessFactor;
                    const brightG = g * brightnessFactor;
                    const brightB = b * brightnessFactor;
                    const adjustContrast = (value) => clamp((value - 128) * contrastFactor + 128, 0, 255);
                    return [adjustContrast(brightR), adjustContrast(brightG), adjustContrast(brightB)];
                };

                if ((x + y) % 2 === 0) {
                    const pixel = adjustPixel(d1[i], d1[i + 1], d1[i + 2], originalBrightnessFactor, originalContrastFactor);
                    dOut[i] = pixel[0];
                    dOut[i + 1] = pixel[1];
                    dOut[i + 2] = pixel[2];
                } else {
                    const pixel = adjustPixel(d2[i], d2[i + 1], d2[i + 2], hiddenBrightnessFactor, hiddenContrastFactor);
                    dOut[i] = pixel[0];
                    dOut[i + 1] = pixel[1];
                    dOut[i + 2] = pixel[2];
                }
                dOut[i + 3] = 255;
            }

            ctx.putImageData(out, 0, 0);
            enableDownload(w, h);
        }

        function generateShadowImage() {
            const innerImage = hiddenImage;
            const coverImage = sourceImage;

            let width = innerImage.width;
            let height = innerImage.height;
            const maxSize = Math.max(0, Math.floor(shadowMaxSize || 0));

            if (maxSize !== 0) {
                if (innerImage.width > innerImage.height) {
                    width = maxSize;
                    height = Math.ceil((innerImage.height * maxSize) / innerImage.width);
                } else {
                    height = maxSize;
                    width = Math.ceil((innerImage.width * maxSize) / innerImage.height);
                }
            }

            const cvs = document.getElementById('resultCanvas');
            cvs.width = width;
            cvs.height = height;
            const ctx = cvs.getContext('2d');

            const c1 = document.createElement('canvas'); c1.width = width; c1.height = height;
            const x1 = c1.getContext('2d');
            x1.drawImage(innerImage.image, 0, 0, width, height);

            const coverRatio = coverImage.width / coverImage.height;
            const targetRatio = width / height;
            let drawX = 0, drawY = 0, drawWidth = width, drawHeight = height;

            if (coverRatio < targetRatio) {
                drawHeight = Math.ceil(width / coverRatio);
                drawY = Math.ceil((height - drawHeight) / 2);
            } else {
                drawWidth = Math.ceil(height * coverRatio);
                drawX = Math.ceil((width - drawWidth) / 2);
            }

            const c2 = document.createElement('canvas'); c2.width = width; c2.height = height;
            const x2 = c2.getContext('2d');
            x2.drawImage(coverImage.image, drawX, drawY, drawWidth, drawHeight);

            const d1 = x1.getImageData(0, 0, width, height).data;
            const d2 = x2.getImageData(0, 0, width, height).data;

            if (phantomRpc) {
                phantomRpc.call({
                    sub: 'shadow',
                    imgFront: d2.buffer,
                    imgBack: d1.buffer,
                    width: width,
                    height: height,
                    isColored: shadowIsColored,
                    scaleInner: shadowInnerScale,
                    scaleCover: shadowCoverScale,
                    desatInner: shadowInnerDesat,
                    desatCover: shadowCoverDesat,
                    weightInner: shadowInnerWeight
                }, [d1.buffer, d2.buffer]).then(applyWorkerOutput).catch((err) => {
                    const msg = err && err.message ? err.message : err;
                    console.error('Worker Error:', msg);
                    showError('生成失败: ' + msg);
                });
            } else {
                processShadowMain(d1, d2, width, height);
            }
        }

        function processShadowMain(d1, d2, width, height) {
            const cvs = document.getElementById('resultCanvas');
            const ctx = cvs.getContext('2d');
            const outputData = new Uint8ClampedArray(d1.length);

            const innerPixels = d1;
            const coverPixels = d2;
            const innerGray = new Uint8ClampedArray(d1.length / 4);
            const coverGray = new Uint8ClampedArray(d2.length / 4);

            for (let i = 0; i < d1.length; i += 4) {
                const idx = i >> 2;
                innerGray[idx] = 0.299 * d1[i] + 0.587 * d1[i + 1] + 0.114 * d1[i + 2];
                coverGray[idx] = 0.299 * d2[i] + 0.587 * d2[i + 1] + 0.114 * d2[i + 2];
            }

            const innerScale = shadowInnerScale;
            const coverScale = 1 - shadowCoverScale;

            if (shadowIsColored) {
                const innerCache = new Uint8ClampedArray(innerPixels.length);
                const coverCache = new Uint8ClampedArray(coverPixels.length);
                const alphaCache = new Float32Array(innerGray.length);

                for (let i = 0; i < innerPixels.length; i += 4) {
                    const gray = innerGray[i >> 2] * innerScale;
                    const r = innerPixels[i] * innerScale;
                    const g = innerPixels[i + 1] * innerScale;
                    const b = innerPixels[i + 2] * innerScale;
                    innerCache[i] = r + (gray - r) * shadowInnerDesat;
                    innerCache[i + 1] = g + (gray - g) * shadowInnerDesat;
                    innerCache[i + 2] = b + (gray - b) * shadowInnerDesat;
                }

                for (let i = 0; i < coverPixels.length; i += 4) {
                    const gray = 255 - (255 - coverGray[i >> 2]) * coverScale;
                    const r = 255 - (255 - coverPixels[i]) * coverScale;
                    const g = 255 - (255 - coverPixels[i + 1]) * coverScale;
                    const b = 255 - (255 - coverPixels[i + 2]) * coverScale;
                    coverCache[i] = r + (gray - r) * shadowCoverDesat;
                    coverCache[i + 1] = g + (gray - g) * shadowCoverDesat;
                    coverCache[i + 2] = b + (gray - b) * shadowCoverDesat;
                }

                for (let i = 0; i < innerGray.length; i++) {
                    alphaCache[i] = Math.min(Math.max((255 + innerGray[i] * innerScale - (255 - (255 - coverGray[i]) * coverScale)) / 255, 0), 1);
                }

                for (let i = 0; i < innerPixels.length; i += 4) {
                    const alpha = alphaCache[i >> 2];
                    const alphaColor = 255 * alpha;
                    const safeAlpha = Math.max(alpha, 0.0001);
                    outputData[i] = clamp(((innerCache[i] - alphaColor + 255 - coverCache[i]) * shadowInnerWeight + alphaColor - 255 + coverCache[i]) / safeAlpha, 0, 255);
                    outputData[i + 1] = clamp(((innerCache[i + 1] - alphaColor + 255 - coverCache[i + 1]) * shadowInnerWeight + alphaColor - 255 + coverCache[i + 1]) / safeAlpha, 0, 255);
                    outputData[i + 2] = clamp(((innerCache[i + 2] - alphaColor + 255 - coverCache[i + 2]) * shadowInnerWeight + alphaColor - 255 + coverCache[i + 2]) / safeAlpha, 0, 255);
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

            ctx.putImageData(new ImageData(outputData, width, height), 0, 0);
            enableDownload(width, height);
        }

        function changeBg(type) {
            const c = document.getElementById('canvasContainer');
            c.classList.remove('bg-white-preview', 'bg-black-preview');
            if (type === 'white') c.classList.add('bg-white-preview');
            else if (type === 'black') c.classList.add('bg-black-preview');
        }

        function downloadImage() {
            const canvas = document.getElementById('resultCanvas');
            if (canvas.style.display === 'none' && mode === 'shadow') {
                const link = document.createElement('a');
                link.download = 'shadow-tank.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            } else {
                const link = document.createElement('a');
                link.download = mode === 'prism' ? 'prism-tank.png' : 'shadow-tank.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        }

        document.getElementById('source-brightness').addEventListener('input', (e) => {
            sourceBrightness = parseInt(e.target.value);
            document.getElementById('source-brightness-val').textContent = sourceBrightness;
        });

        document.getElementById('source-contrast').addEventListener('input', (e) => {
            sourceContrast = parseInt(e.target.value);
            document.getElementById('source-contrast-val').textContent = sourceContrast;
        });

        document.getElementById('hidden-brightness').addEventListener('input', (e) => {
            hiddenBrightness = parseInt(e.target.value);
            document.getElementById('hidden-brightness-val').textContent = hiddenBrightness;
        });

        document.getElementById('hidden-contrast').addEventListener('input', (e) => {
            hiddenContrast = parseInt(e.target.value);
            document.getElementById('hidden-contrast-val').textContent = hiddenContrast;
        });

        document.getElementById('shadow-is-colored').addEventListener('change', (e) => {
            shadowIsColored = e.target.checked;
        });

        document.getElementById('shadow-inner-scale').addEventListener('input', (e) => {
            shadowInnerScale = parseFloat(e.target.value);
            document.getElementById('shadow-inner-scale-val').textContent = shadowInnerScale.toFixed(2);
        });

        document.getElementById('shadow-cover-scale').addEventListener('input', (e) => {
            shadowCoverScale = parseFloat(e.target.value);
            document.getElementById('shadow-cover-scale-val').textContent = shadowCoverScale.toFixed(2);
        });

        document.getElementById('shadow-inner-desat').addEventListener('input', (e) => {
            shadowInnerDesat = parseFloat(e.target.value);
            document.getElementById('shadow-inner-desat-val').textContent = shadowInnerDesat.toFixed(2);
        });

        document.getElementById('shadow-cover-desat').addEventListener('input', (e) => {
            shadowCoverDesat = parseFloat(e.target.value);
            document.getElementById('shadow-cover-desat-val').textContent = shadowCoverDesat.toFixed(2);
        });

        document.getElementById('shadow-inner-weight').addEventListener('input', (e) => {
            shadowInnerWeight = parseFloat(e.target.value);
            document.getElementById('shadow-inner-weight-val').textContent = shadowInnerWeight.toFixed(2);
        });

        document.getElementById('shadow-max-size').addEventListener('input', (e) => {
            shadowMaxSize = parseInt(e.target.value);
            document.getElementById('shadow-max-size-val').textContent = shadowMaxSize;
        });

        updateUI();
    

if (window.app && app.action) {
    app.action('image-phantom.set-mode', function (el) {
        setMode(el.dataset.mode);
    });
    app.action('image-phantom.handle-image', function (el) {
        handleImage(el, parseInt(el.dataset.idx, 10));
    });
    app.action('image-phantom.change-bg', function (el) {
        changeBg(el.dataset.bg);
    });
}
    
