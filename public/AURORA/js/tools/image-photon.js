/* Extracted from image-photon.html (refactor script). Tool logic. */

        // Setup Drag and Drop
        const uploadArea = document.getElementById('uploadArea');
        const imageUpload = document.getElementById('imageUpload');

        if(uploadArea && imageUpload) {
            uploadArea.addEventListener('click', () => imageUpload.click());
            uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.style.borderColor = 'var(--primary)'; });
            uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = 'var(--border)'; });
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--border)';
                photonTool.handleFile(e.dataTransfer.files[0]);
            });
        }

        // Pure JS Image Processing Tool with Multi-Filter State
        window.photonTool = {
            originalImage: null,
            ctx: null,
            canvas: null,
            
            // State
            activeFilters: new Set(),
            values: {
                brightness: 0,
                contrast: 0,
                saturation: 0,
                hue: 0
            },
            transform: {
                scalePercent: 100,
                scaleW: 0,
                scaleH: 0,
                cropEnabled: false,
                crop: { x: 0, y: 0, w: 0, h: 0 }
            },

            init: function() {
                this.canvas = document.getElementById('canvas');
                this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
                if(window.app && app.showToast) app.showToast('JS 引擎就绪');
            },
            
            handleFile: function(file) {
                if(!file || !file.type.startsWith('image/')) return;
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        this.originalImage = img;
                        this.reset();
                        document.getElementById('placeholder').style.display = 'none';
                        if(app && app.showToast) app.showToast('图片已加载');
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            },

            switchTab: function(tabName) {
                document.querySelectorAll('.sub-tab').forEach(t => {
                    if(t.dataset.tab === tabName) t.classList.add('active');
                    else t.classList.remove('active');
                });
                document.querySelectorAll('.tab-content').forEach(c => c.hidden = true);
                document.getElementById('tab-' + tabName).hidden = false;
            },

            reset: function() {
                if(!this.originalImage) return;
                this.activeFilters.clear();
                this.values = { brightness: 0, contrast: 0, saturation: 0, hue: 0 };
                
                // Reset Transform
                this.transform = {
                    scalePercent: 100,
                    scaleW: this.originalImage.width,
                    scaleH: this.originalImage.height,
                    cropEnabled: false,
                    crop: { x: 0, y: 0, w: this.originalImage.width, h: this.originalImage.height }
                };

                // Update UI
                document.querySelectorAll('.btn-grid .btn').forEach(b => {
                    b.classList.remove('active');
                    b.innerHTML = b.innerHTML.replace(/<svg[\s\S]*?<\/svg>\s*/g, '');
                });
                document.querySelectorAll('input[type="range"]').forEach(i => i.value = 0);
                ['brightness', 'contrast', 'saturation', 'hue'].forEach(k => {
                    const el = document.getElementById('val-' + k);
                    if(el) el.innerText = '0';
                });

                // Update Transform UI
                document.getElementById('scale-percent').value = 100;
                document.getElementById('scale-width').value = this.originalImage.width;
                document.getElementById('scale-height').value = this.originalImage.height;
                document.getElementById('original-size').innerText = `${this.originalImage.width} x ${this.originalImage.height}`;
                
                document.getElementById('crop-enabled').checked = false;
                this.toggleCrop(false);
                document.getElementById('crop-x').value = 0;
                document.getElementById('crop-y').value = 0;
                document.getElementById('crop-w').value = this.originalImage.width;
                document.getElementById('crop-h').value = this.originalImage.height;

                this.render();
            },

            toggle: function(filter) {
                const btn = document.getElementById('btn-' + filter);
                if (this.activeFilters.has(filter)) {
                    this.activeFilters.delete(filter);
                    if(btn) {
                        btn.classList.remove('active');
                        btn.innerHTML = btn.innerHTML.replace(/<svg[\s\S]*?<\/svg>\s*/, '');
                    }
                } else {
                    this.activeFilters.add(filter);
                    if(btn) {
                        btn.classList.add('active');
                        if(!btn.querySelector('svg')) {
                            btn.innerHTML = (Ui.icon ? Ui.icon('check') : '') + ' ' + btn.innerText;
                        }
                    }
                }
                this.render();
            },

            updateValue: function(key, val) {
                this.values[key] = parseInt(val);
                document.getElementById('val-' + key).innerText = val;
                this.render();
            },

            updateScale: function(type, val) {
                if(!this.originalImage) return;
                const aspect = this.originalImage.width / this.originalImage.height;
                
                if(type === 'percent') {
                    this.transform.scalePercent = parseFloat(val);
                    this.transform.scaleW = Math.round(this.originalImage.width * (this.transform.scalePercent / 100));
                    this.transform.scaleH = Math.round(this.originalImage.height * (this.transform.scalePercent / 100));
                } else if(type === 'width') {
                    this.transform.scaleW = parseInt(val);
                    this.transform.scaleH = Math.round(this.transform.scaleW / aspect);
                    this.transform.scalePercent = Math.round((this.transform.scaleW / this.originalImage.width) * 100);
                } else if(type === 'height') {
                    this.transform.scaleH = parseInt(val);
                    this.transform.scaleW = Math.round(this.transform.scaleH * aspect);
                    this.transform.scalePercent = Math.round((this.transform.scaleH / this.originalImage.height) * 100);
                }

                // Update UI inputs
                document.getElementById('scale-percent').value = this.transform.scalePercent;
                document.getElementById('scale-width').value = this.transform.scaleW;
                document.getElementById('scale-height').value = this.transform.scaleH;

                this.render();
            },

            toggleCrop: function(enabled) {
                this.transform.cropEnabled = enabled;
                const controls = document.getElementById('crop-controls');
                if(enabled) {
                    controls.style.opacity = '1';
                    controls.style.pointerEvents = 'auto';
                } else {
                    controls.style.opacity = '0.5';
                    controls.style.pointerEvents = 'none';
                }
                this.render();
            },

            updateCrop: function() {
                this.transform.crop.x = parseInt(document.getElementById('crop-x').value) || 0;
                this.transform.crop.y = parseInt(document.getElementById('crop-y').value) || 0;
                this.transform.crop.w = parseInt(document.getElementById('crop-w').value) || this.originalImage.width;
                this.transform.crop.h = parseInt(document.getElementById('crop-h').value) || this.originalImage.height;
                this.render();
            },

            render: function() {
                if(!this.originalImage) return;

                const timerId = PerfMonitor.start('render');
                
                // 1. Calculate Dimensions
                // If crop is enabled, we crop from original, then scale
                // But for simplicity, let's assume Scale applies to the Cropped result
                
                let srcX = 0, srcY = 0, srcW = this.originalImage.width, srcH = this.originalImage.height;
                
                if (this.transform.cropEnabled) {
                    srcX = this.transform.crop.x;
                    srcY = this.transform.crop.y;
                    srcW = this.transform.crop.w;
                    srcH = this.transform.crop.h;
                }

                // Ensure src bounds are valid
                if(srcW <= 0) srcW = 1;
                if(srcH <= 0) srcH = 1;

                // Determine Destination Size (Scale)
                // If user changed Scale, we need to respect that ratio
                // But Scale is based on Original Size. 
                // If we crop, should Scale Percent apply to Crop Size?
                // Usually "Scale 50%" means "50% of current view".
                // Let's re-calculate Dest Size based on Scale Percent of the SOURCE region
                
                const destW = Math.round(srcW * (this.transform.scalePercent / 100));
                const destH = Math.round(srcH * (this.transform.scalePercent / 100));

                this.canvas.width = destW;
                this.canvas.height = destH;
                
                const w = this.canvas.width;
                const h = this.canvas.height;

                // 2. Draw with Transform (Mirror -> Draw)
                this.ctx.save();
                this.ctx.clearRect(0, 0, w, h);

                let scaleX = 1, scaleY = 1;
                let transX = 0, transY = 0;

                if (this.activeFilters.has('mirror_h')) {
                    scaleX = -1;
                    transX = w;
                }
                if (this.activeFilters.has('mirror_v')) {
                    scaleY = -1;
                    transY = h;
                }

                this.ctx.translate(transX, transY);
                this.ctx.scale(scaleX, scaleY);

                // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
                this.ctx.drawImage(
                    this.originalImage, 
                    srcX, srcY, srcW, srcH, 
                    0, 0, w, h
                );
                
                this.ctx.restore();

                const imageData = this.ctx.getImageData(0, 0, w, h);
                const data = imageData.data;

                // Pre-calculate Hue Matrix if needed
                let hueMatrix = null;
                if (this.values.hue !== 0) {
                    const angle = this.values.hue * Math.PI / 180;
                    const c = Math.cos(angle);
                    const s = Math.sin(angle);
                    const rw = 0.213, gw = 0.715, bw = 0.072;
                    
                    hueMatrix = [
                        rw + c * (1 - rw) + s * (-rw),       gw + c * (-gw) + s * (-gw),       bw + c * (-bw) + s * (1 - bw),
                        rw + c * (-rw) + s * 0.143,          gw + c * (1 - gw) + s * 0.140,    bw + c * (-bw) + s * (-0.283),
                        rw + c * (-rw) + s * (-(1 - rw)),    gw + c * (-gw) + s * 0.283,       bw + c * (1 - bw) + s * 0.283
                    ];
                }

                // 2. Apply Pixel Filters (Loop once for performance)
                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i], g = data[i+1], b = data[i+2];

                    // --- Value Adjustments ---
                    
                    // Brightness
                    if (this.values.brightness !== 0) {
                        const v = this.values.brightness;
                        r += v; g += v; b += v;
                    }

                    // Contrast
                    if (this.values.contrast !== 0) {
                        const v = this.values.contrast;
                        const factor = (259 * (v + 255)) / (255 * (259 - v));
                        r = factor * (r - 128) + 128;
                        g = factor * (g - 128) + 128;
                        b = factor * (b - 128) + 128;
                    }

                    // Saturation
                    if (this.values.saturation !== 0) {
                        const v = this.values.saturation / 100; // -1 to 1
                        const gray = 0.299*r + 0.587*g + 0.114*b;
                        const satMult = 1 + v;
                        r = gray + (r - gray) * satMult;
                        g = gray + (g - gray) * satMult;
                        b = gray + (b - gray) * satMult;
                    }

                    // Hue Rotate
                    if (hueMatrix) {
                        const newR = r * hueMatrix[0] + g * hueMatrix[1] + b * hueMatrix[2];
                        const newG = r * hueMatrix[3] + g * hueMatrix[4] + b * hueMatrix[5];
                        const newB = r * hueMatrix[6] + g * hueMatrix[7] + b * hueMatrix[8];
                        r = newR; g = newG; b = newB;
                    }

                    // --- Boolean Filters ---

                    // Grayscale
                    if (this.activeFilters.has('grayscale')) {
                        const v = 0.299*r + 0.587*g + 0.114*b;
                        r = v; g = v; b = v;
                    }

                    // Invert
                    if (this.activeFilters.has('invert')) {
                        r = 255 - r; g = 255 - g; b = 255 - b;
                    }

                    // Sepia
                    if (this.activeFilters.has('sepia')) {
                        const nr = (r * 0.393) + (g * 0.769) + (b * 0.189);
                        const ng = (r * 0.349) + (g * 0.686) + (b * 0.168);
                        const nb = (r * 0.272) + (g * 0.534) + (b * 0.131);
                        r = nr; g = ng; b = nb;
                    }

                    // Solarize
                    if (this.activeFilters.has('solarize')) {
                        const threshold = 128;
                        r = r > threshold ? 255 - r : r;
                        g = g > threshold ? 255 - g : g;
                        b = b > threshold ? 255 - b : b;
                    }

                    // Posterize
                    if (this.activeFilters.has('posterize')) {
                        const levels = 4;
                        const step = 255 / (levels - 1);
                        r = Math.floor(r / step) * step;
                        g = Math.floor(g / step) * step;
                        b = Math.floor(b / step) * step;
                    }

                    // Threshold (Binary)
                    if (this.activeFilters.has('threshold')) {
                        const threshold = 128;
                        const v = (0.299*r + 0.587*g + 0.114*b >= threshold) ? 255 : 0;
                        r = v; g = v; b = v;
                    }

                    // Warm
                    if (this.activeFilters.has('warm')) {
                        r += 30;
                        b -= 10;
                    }

                    // Cool
                    if (this.activeFilters.has('cool')) {
                        b += 30;
                        r -= 10;
                    }

                    // Duotone
                    if (this.activeFilters.has('duotone')) {
                        const avg = (r + g + b) / 3;
                        const r1=0, g1=0, b1=255; 
                        const r2=255, g2=165, b2=0;
                        const ratio = avg / 255;
                        r = r1 + (r2 - r1) * ratio;
                        g = g1 + (g2 - g1) * ratio;
                        b = b1 + (b2 - b1) * ratio;
                    }

                    // Colorize (Tint)
                    if (this.activeFilters.has('colorize')) {
                        r += 50; 
                    }

                    // Clamp values
                    data[i] = Math.min(255, Math.max(0, r));
                    data[i+1] = Math.min(255, Math.max(0, g));
                    data[i+2] = Math.min(255, Math.max(0, b));
                }
                
                this.ctx.putImageData(imageData, 0, 0);

                // 3. Apply Convolution / Complex Filters
                if (this.activeFilters.has('blur')) {
                    this.applyConvolution([ 1/16, 2/16, 1/16, 2/16, 4/16, 2/16, 1/16, 2/16, 1/16 ]);
                }
                if (this.activeFilters.has('sharpen')) {
                    this.applyConvolution([ 0, -1, 0, -1, 5, -1, 0, -1, 0 ]);
                }
                if (this.activeFilters.has('emboss')) {
                    this.applyConvolution([ -2, -1, 0, -1, 1, 1, 0, 1, 2 ]);
                }
                if (this.activeFilters.has('edge_detection')) {
                    this.applyConvolution([ -1, -1, -1, -1, 8, -1, -1, -1, -1 ]);
                }
                if (this.activeFilters.has('noise_reduction')) {
                    this.applyConvolution([ 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9 ]);
                }

                // 4. Special Effects
                if (this.activeFilters.has('mosaic')) {
                    this.applyMosaic(10);
                }
                if (this.activeFilters.has('scanlines')) {
                    this.applyScanlines();
                }
                if (this.activeFilters.has('rgb_split')) {
                    this.applyRGBSplit(10);
                }
                if (this.activeFilters.has('vignette') || this.activeFilters.has('vintage')) {
                    this.applyVignette();
                }
                if (this.activeFilters.has('vintage')) {
                    this.applyNoise(30);
                }

                const duration = PerfMonitor.end(timerId, 'js', true);
                document.getElementById('perf-time').innerText = `Time: ${duration.toFixed(2)}ms`;
            },

            applyConvolution: function(kernel) {
                const w = this.canvas.width, h = this.canvas.height;
                const srcData = this.ctx.getImageData(0, 0, w, h);
                const src = srcData.data;
                const output = this.ctx.createImageData(w, h);
                const dst = output.data;
                const side = Math.round(Math.sqrt(kernel.length));
                const halfSide = Math.floor(side/2);

                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        const dstOff = (y * w + x) * 4;
                        let r = 0, g = 0, b = 0;
                        for (let cy = 0; cy < side; cy++) {
                            for (let cx = 0; cx < side; cx++) {
                                const scy = y + cy - halfSide;
                                const scx = x + cx - halfSide;
                                if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
                                    const srcOff = (scy * w + scx) * 4;
                                    const wt = kernel[cy * side + cx];
                                    r += src[srcOff] * wt;
                                    g += src[srcOff+1] * wt;
                                    b += src[srcOff+2] * wt;
                                }
                            }
                        }
                        dst[dstOff] = r;
                        dst[dstOff+1] = g;
                        dst[dstOff+2] = b;
                        dst[dstOff+3] = src[dstOff+3];
                    }
                }
                this.ctx.putImageData(output, 0, 0);
            },

            applyMosaic: function(size) {
                const w = this.canvas.width, h = this.canvas.height;
                const tempCvs = document.createElement('canvas');
                tempCvs.width = Math.ceil(w / size);
                tempCvs.height = Math.ceil(h / size);
                const tempCtx = tempCvs.getContext('2d');
                tempCtx.imageSmoothingEnabled = false;
                tempCtx.drawImage(this.canvas, 0, 0, tempCvs.width, tempCvs.height);
                this.ctx.imageSmoothingEnabled = false;
                this.ctx.drawImage(tempCvs, 0, 0, tempCvs.width, tempCvs.height, 0, 0, w, h);
                this.ctx.imageSmoothingEnabled = true;
            },

            applyRGBSplit: function(offset) {
                const w = this.canvas.width, h = this.canvas.height;
                const srcData = this.ctx.getImageData(0, 0, w, h);
                const d = srcData.data;
                const output = this.ctx.createImageData(w, h);
                const out = output.data;

                for (let i = 0; i < d.length; i += 4) {
                    const r = d[i];
                    const g = d[i+1];
                    const b = d[i+2];
                    const a = d[i+3];
                    const pixelIdx = i / 4;
                    const y = Math.floor(pixelIdx / w);
                    const x = pixelIdx % w;

                    let rVal = r;
                    const rx = x - offset;
                    if(rx >= 0) rVal = d[(y * w + rx) * 4];

                    let bVal = b;
                    const bx = x + offset;
                    if(bx < w) bVal = d[(y * w + bx) * 4 + 2];

                    out[i] = rVal;
                    out[i+1] = g;
                    out[i+2] = bVal;
                    out[i+3] = a;
                }
                this.ctx.putImageData(output, 0, 0);
            },

            applyVignette: function() {
                const w = this.canvas.width, h = this.canvas.height;
                const gradient = this.ctx.createRadialGradient(w/2, h/2, w/4, w/2, h/2, w/1.2);
                gradient.addColorStop(0, "rgba(0,0,0,0)");
                gradient.addColorStop(1, "rgba(0,0,0,0.6)");
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, w, h);
            },

            applyNoise: function(amount) {
                const w = this.canvas.width, h = this.canvas.height;
                const imgData = this.ctx.getImageData(0, 0, w, h);
                const d = imgData.data;
                for (let i = 0; i < d.length; i += 4) {
                    const noise = (Math.random() - 0.5) * amount;
                    d[i] += noise;
                    d[i+1] += noise;
                    d[i+2] += noise;
                }
                this.ctx.putImageData(imgData, 0, 0);
            },

            applyScanlines: function() {
                const w = this.canvas.width, h = this.canvas.height;
                const imgData = this.ctx.getImageData(0, 0, w, h);
                const d = imgData.data;
                for (let y = 0; y < h; y++) {
                    if (y % 3 === 0) {
                        for (let x = 0; x < w; x++) {
                            const i = (y * w + x) * 4;
                            d[i] *= 0.7;
                            d[i+1] *= 0.7;
                            d[i+2] *= 0.7;
                        }
                    }
                }
                this.ctx.putImageData(imgData, 0, 0);
            },

            download: function() {
                if(!this.originalImage) return;
                const format = document.getElementById('export-format').value;
                const quality = parseFloat(document.getElementById('export-quality').value);
                
                const link = document.createElement('a');
                let ext = 'png';
                if(format === 'image/jpeg') ext = 'jpg';
                if(format === 'image/webp') ext = 'webp';
                
                link.download = `edited_image.${ext}`;
                link.href = this.canvas.toDataURL(format, quality);
                link.click();
            }
        };

        window.onload = () => {
            photonTool.init();
        };
    

if (window.app && app.action) {
    app.action('photon.download', function () {
        photonTool.download();
    });
    app.action('photon.handle-file', function (el) {
        photonTool.handleFile(el.files[0]);
    });
    app.action('photon.switch-tab', function (el) {
        photonTool.switchTab(el.dataset.tab);
    });
    app.action('photon.toggle', function (el) {
        photonTool.toggle(el.dataset.filter);
    });
    app.action('photon.update-value', function (el) {
        photonTool.updateValue(el.dataset.key, el.value);
    });
    app.action('photon.update-scale', function (el) {
        photonTool.updateScale(el.dataset.type, el.value);
    });
    app.action('photon.toggle-crop', function (el) {
        photonTool.toggleCrop(el.checked);
    });
    app.action('photon.update-crop', function () {
        photonTool.updateCrop();
    });
    app.action('photon.reset', function () {
        photonTool.reset();
    });
}
    
