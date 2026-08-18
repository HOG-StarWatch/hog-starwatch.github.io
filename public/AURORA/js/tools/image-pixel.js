/* Extracted from image-pixel.html (refactor script). Tool logic. */

        ResourceLoader.loadDeps('@icons');
        const imageUpload = document.getElementById('imageUpload');
        const uploadArea = document.getElementById('uploadArea');
        const pixelSize = document.getElementById('pixelSize');
        const pixelValue = document.getElementById('pixelValue');
        const processBtn = document.getElementById('processBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const resetBtn = document.getElementById('resetBtn');
        const originalCanvas = document.getElementById('originalCanvas');
        const pixelatedCanvas = document.getElementById('pixelatedCanvas');
        const previewPlaceholder = document.getElementById('previewPlaceholder');
        
        let originalCtx = originalCanvas.getContext('2d');
        let pixelatedCtx = pixelatedCanvas.getContext('2d');
        let originalImage = null;
        let pixelSizeValue = 8;

        pixelSize.addEventListener('input', (e) => {
            pixelSizeValue = parseInt(e.target.value);
            pixelValue.innerText = pixelSizeValue + 'px';
        });

        uploadArea.addEventListener('click', () => imageUpload.click());
        imageUpload.addEventListener('change', (e) => handleFile(e.target.files[0]));

        uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.style.borderColor = 'var(--primary)'; });
        uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = 'var(--border)'; });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border)';
            handleFile(e.dataTransfer.files[0]);
        });

        function handleFile(file) {
            if(!file || !file.type.startsWith('image/')) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    originalImage = img;
                    processBtn.disabled = false;
                    
                    // Show original
                    resizeCanvas(originalCanvas, img.width, img.height);
                    originalCtx.drawImage(img, 0, 0);
                    
                    previewPlaceholder.style.display = 'none';
                    originalCanvas.style.display = 'block';
                    pixelatedCanvas.style.display = 'none';
                    downloadBtn.disabled = true;

                    if (app && app.showToast) app.showToast('图片已加载');
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function resizeCanvas(canvas, w, h) {
            canvas.width = w;
            canvas.height = h;
        }

        processBtn.addEventListener('click', () => {
            if(!originalImage) return;
            
            const w = originalImage.width;
            const h = originalImage.height;
            
            resizeCanvas(pixelatedCanvas, w, h);
            
            // Pixelation Logic
            // Draw small
            const scaledW = Math.ceil(w / pixelSizeValue);
            const scaledH = Math.ceil(h / pixelSizeValue);
            
            // We can use a temporary canvas to scale down then up
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = scaledW;
            tempCanvas.height = scaledH;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Turn off smoothing
            tempCtx.imageSmoothingEnabled = false;
            pixelatedCtx.imageSmoothingEnabled = false;
            
            tempCtx.drawImage(originalImage, 0, 0, scaledW, scaledH);
            
            // Draw back to large canvas
            pixelatedCtx.drawImage(tempCanvas, 0, 0, scaledW, scaledH, 0, 0, w, h);
            
            originalCanvas.style.display = 'none';
            pixelatedCanvas.style.display = 'block';
            downloadBtn.disabled = false;
            if (app && app.showToast) app.showToast('处理完成');
        });

        downloadBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = 'pixelated.png';
            link.href = pixelatedCanvas.toDataURL();
            link.click();
        });

        resetBtn.addEventListener('click', () => {
            originalImage = null;
            processBtn.disabled = true;
            downloadBtn.disabled = true;
            originalCanvas.style.display = 'none';
            pixelatedCanvas.style.display = 'none';
            previewPlaceholder.style.display = 'block';
            imageUpload.value = '';
            
            // Reset border
            uploadArea.style.borderColor = 'var(--border)';
        });
    
