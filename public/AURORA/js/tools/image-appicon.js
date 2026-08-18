/* Extracted from image-appicon.html (refactor script). Tool logic. */

        // State
        const defaultState = {
            size: 1024,
            bgColor: '#3b82f6',
            borderRadius: 22,
            mode: 'text',
            text: 'A',
            textSize: 600,
            textColor: '#ffffff',
            font: 'Arial',
            image: null,
            imageScale: 80,
            offsetY: 0,
            shadowColor: '#000000',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            borderWidth: 0,
            borderColor: '#000000'
        };

        let state = { ...defaultState };

        // Elements
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        // Inputs map
        const inputs = {
            size: document.getElementById('sizeInput'),
            bgColor: document.getElementById('bgColor'),
            borderRadius: document.getElementById('borderRadius'),
            textInput: document.getElementById('textInput'),
            textSize: document.getElementById('textSize'),
            textColor: document.getElementById('textColor'),
            fontFamily: document.getElementById('fontFamily'),
            imageInput: document.getElementById('imageInput'),
            imageScale: document.getElementById('imageScale'),
            offsetY: document.getElementById('offsetY'),
            shadowColor: document.getElementById('shadowColor'),
            shadowBlur: document.getElementById('shadowBlur'),
            shadowOffsetX: document.getElementById('shadowOffsetX'),
            shadowOffsetY: document.getElementById('shadowOffsetY'),
            borderWidth: document.getElementById('borderWidth'),
            borderColor: document.getElementById('borderColor'),
            downloadBtn: document.getElementById('downloadBtn')
        };

        // Helper to update color labels
        function updateColorLabel(id, val) {
            const el = document.getElementById(id + 'Val');
            if(el) el.innerText = val;
        }

        // Initialize listeners
        function initListeners() {
            inputs.size.addEventListener('input', (e) => {
                state.size = parseInt(e.target.value) || 1024;
                document.getElementById('outputSizeDisplay').innerText = `${state.size}x${state.size}`;
                render();
            });

            inputs.bgColor.addEventListener('input', (e) => {
                state.bgColor = e.target.value;
                updateColorLabel('bgColor', state.bgColor);
                render();
            });

            inputs.borderRadius.addEventListener('input', (e) => {
                state.borderRadius = parseInt(e.target.value);
                document.getElementById('borderRadiusVal').innerText = `${state.borderRadius}%`;
                render();
            });

            inputs.textInput.addEventListener('input', (e) => {
                state.text = e.target.value;
                render();
            });

            inputs.textSize.addEventListener('input', (e) => {
                state.textSize = parseInt(e.target.value);
                render();
            });

            inputs.textColor.addEventListener('input', (e) => {
                state.textColor = e.target.value;
                updateColorLabel('textColor', state.textColor);
                render();
            });

            inputs.fontFamily.addEventListener('change', (e) => {
                state.font = e.target.value;
                render();
            });

            inputs.imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                            state.image = img;
                            render();
                            app.showToast('图片已加载');
                        };
                        img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });

            inputs.imageScale.addEventListener('input', (e) => {
                state.imageScale = parseInt(e.target.value);
                render();
            });

            inputs.offsetY.addEventListener('input', (e) => {
                state.offsetY = parseInt(e.target.value);
                render();
            });

            inputs.shadowColor.addEventListener('input', (e) => {
                state.shadowColor = e.target.value;
                updateColorLabel('shadowColor', state.shadowColor);
                render();
            });

            inputs.shadowBlur.addEventListener('input', (e) => {
                state.shadowBlur = parseInt(e.target.value);
                render();
            });

            inputs.shadowOffsetX.addEventListener('input', (e) => {
                state.shadowOffsetX = parseInt(e.target.value);
                render();
            });

            inputs.shadowOffsetY.addEventListener('input', (e) => {
                state.shadowOffsetY = parseInt(e.target.value);
                render();
            });

            inputs.borderWidth.addEventListener('input', (e) => {
                state.borderWidth = parseInt(e.target.value);
                render();
            });

            inputs.borderColor.addEventListener('input', (e) => {
                state.borderColor = e.target.value;
                updateColorLabel('borderColor', state.borderColor);
                render();
            });

            inputs.downloadBtn.addEventListener('click', download);
        }

        // Tab Switching
        window.switchTab = (tab) => {
            state.mode = tab;
            
            document.getElementById('tab-text').classList.remove('active');
            document.getElementById('tab-image').classList.remove('active');
            document.getElementById(`tab-${tab}`).classList.add('active');

            document.getElementById('textContent').style.display = 'none';
            document.getElementById('imageContent').style.display = 'none';
            
            if (tab === 'text') {
                document.getElementById('textContent').style.display = 'block';
            } else {
                document.getElementById('imageContent').style.display = 'block';
            }
            render();
        };

        window.resetDefaults = () => {
            state = { ...defaultState };
            // Reset Inputs
            inputs.size.value = state.size;
            inputs.bgColor.value = state.bgColor;
            inputs.borderRadius.value = state.borderRadius;
            inputs.textInput.value = state.text;
            inputs.textSize.value = state.textSize;
            inputs.textColor.value = state.textColor;
            inputs.imageScale.value = state.imageScale;
            inputs.offsetY.value = state.offsetY;
            inputs.shadowColor.value = state.shadowColor;
            inputs.shadowBlur.value = state.shadowBlur;
            inputs.shadowOffsetX.value = state.shadowOffsetX;
            inputs.shadowOffsetY.value = state.shadowOffsetY;
            inputs.borderWidth.value = state.borderWidth;
            inputs.borderColor.value = state.borderColor;
            
            // Update UI Labels
            updateColorLabel('bgColor', state.bgColor);
            updateColorLabel('textColor', state.textColor);
            updateColorLabel('shadowColor', state.shadowColor);
            updateColorLabel('borderColor', state.borderColor);
            document.getElementById('borderRadiusVal').innerText = `${state.borderRadius}%`;
            document.getElementById('outputSizeDisplay').innerText = `${state.size}x${state.size}`;
            
            switchTab('text');
            app.showToast('已重置');
        };

        // Render Function
        function render() {
            canvas.width = state.size;
            canvas.height = state.size;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Background (Rounded Rect)
            const r = (state.borderRadius / 100) * state.size / 2;
            
            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.lineTo(state.size - r, 0);
            ctx.quadraticCurveTo(state.size, 0, state.size, r);
            ctx.lineTo(state.size, state.size - r);
            ctx.quadraticCurveTo(state.size, state.size, state.size - r, state.size);
            ctx.lineTo(r, state.size);
            ctx.quadraticCurveTo(0, state.size, 0, state.size - r);
            ctx.lineTo(0, r);
            ctx.quadraticCurveTo(0, 0, r, 0);
            ctx.closePath();
            
            ctx.fillStyle = state.bgColor;
            ctx.fill();

            // Clip for content
            ctx.save();
            ctx.clip();

            const centerX = state.size / 2;
            const centerY = state.size / 2 + (state.offsetY * (state.size / 1024));

            // Shadow
            const scaleFactor = state.size / 1024;
            ctx.shadowColor = state.shadowColor;
            ctx.shadowBlur = state.shadowBlur * scaleFactor;
            ctx.shadowOffsetX = state.shadowOffsetX * scaleFactor;
            ctx.shadowOffsetY = state.shadowOffsetY * scaleFactor;

            if (state.mode === 'text') {
                const fontSize = state.textSize * scaleFactor;
                ctx.font = `bold ${fontSize}px ${state.font}`;
                ctx.fillStyle = state.textColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(state.text, centerX, centerY + (fontSize * 0.05));
            } else if (state.mode === 'image' && state.image) {
                const scale = state.imageScale / 100;
                const imgW = state.image.width;
                const imgH = state.image.height;
                const aspect = imgW / imgH;
                
                let drawW, drawH;
                if (aspect > 1) {
                    drawW = state.size * scale;
                    drawH = drawW / aspect;
                } else {
                    drawH = state.size * scale;
                    drawW = drawH * aspect;
                }
                ctx.drawImage(state.image, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
            }

            ctx.restore();

            // Border
            if (state.borderWidth > 0) {
                const bw = state.borderWidth * (state.size / 1024);
                ctx.lineWidth = bw;
                ctx.strokeStyle = state.borderColor;
                
                ctx.beginPath();
                ctx.moveTo(r, 0);
                ctx.lineTo(state.size - r, 0);
                ctx.quadraticCurveTo(state.size, 0, state.size, r);
                ctx.lineTo(state.size, state.size - r);
                ctx.quadraticCurveTo(state.size, state.size, state.size - r, state.size);
                ctx.lineTo(r, state.size);
                ctx.quadraticCurveTo(0, state.size, 0, state.size - r);
                ctx.lineTo(0, r);
                ctx.quadraticCurveTo(0, 0, r, 0);
                ctx.closePath();
                ctx.stroke();
            }
        }

        function download() {
            const link = document.createElement('a');
            link.download = 'app-icon.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            if (app && app.showToast) {
                app.showToast('下载已开始');
            }
        }

        initListeners();
        render();

    
if (window.app && app.action) {
    app.action('switchTab', function (el) {
        switchTab(el.dataset.mode);
    });
}

    
