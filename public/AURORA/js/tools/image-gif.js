/* Extracted from image-gif.html (refactor script). Tool logic. */

        let uploadedFiles = []; // Array of { file, url, id }
        let gif = null;

        // Initialize
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                await ResourceLoader.loadDeps('@gif');
                console.log('GIF.js loaded');
            } catch (err) {
                console.error('Failed to load libraries:', err);
                alert('资源加载失败，请检查网络连接');
            }

            initUI();
        });

        function initUI() {
            // Upload handling
            const uploadArea = document.getElementById('uploadArea');
            const fileInput = document.getElementById('input-files');

            uploadArea.addEventListener('click', () => fileInput.click());
            
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--primary)';
                uploadArea.style.background = 'rgba(var(--primary-rgb), 0.1)';
            });

            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--border)';
                uploadArea.style.background = 'transparent';
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--border)';
                uploadArea.style.background = 'transparent';
                handleFiles(e.dataTransfer.files);
            });

            fileInput.addEventListener('change', (e) => {
                handleFiles(e.target.files);
                fileInput.value = ''; // Reset
            });

            // Sliders
            setupSlider('gif-delay', 'val-gif-delay');
            setupSlider('gif-quality', 'val-gif-quality');

            // Generate Button
            document.getElementById('btn-generate').addEventListener('click', generateGIF);
        }

        function setupSlider(id, valId) {
            const slider = document.getElementById(id);
            const display = document.getElementById(valId);
            slider.addEventListener('input', () => {
                display.innerText = slider.value;
            });
        }

        function handleFiles(files) {
            if (!files || files.length === 0) return;

            const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
            if (newFiles.length === 0) {
                alert('请上传有效的图片文件');
                return;
            }

            // Process new files
            newFiles.forEach(file => {
                const url = URL.createObjectURL(file);
                uploadedFiles.push({
                    file: file,
                    url: url,
                    id: Math.random().toString(36).substr(2, 9)
                });
            });

            updateFileList();
        }

        function updateFileList() {
            const container = document.getElementById('file-list-container');
            const list = document.getElementById('file-list');
            const count = document.getElementById('file-count');

            if (uploadedFiles.length > 0) {
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
            }

            count.innerText = `(${uploadedFiles.length})`;
            list.innerHTML = '';

            uploadedFiles.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'file-item';
                div.innerHTML = `
                    <img src="${item.url}" alt="thumb">
                    <div class="info" title="${item.file.name}">${item.file.name}</div>
                    <div class="actions">
                        <button onclick="moveFile(${index}, -1)" title="上移" ${index === 0 ? 'disabled' : ''}>↑</button>
                        <button onclick="moveFile(${index}, 1)" title="下移" ${index === uploadedFiles.length - 1 ? 'disabled' : ''}>↓</button>
                        <button onclick="removeFile(${index})" title="删除" style="color:var(--danger)">×</button>
                    </div>
                `;
                list.appendChild(div);
            });
        }

        function moveFile(index, direction) {
            if (index + direction < 0 || index + direction >= uploadedFiles.length) return;
            
            const temp = uploadedFiles[index];
            uploadedFiles[index] = uploadedFiles[index + direction];
            uploadedFiles[index + direction] = temp;
            
            updateFileList();
        }

        function removeFile(index) {
            URL.revokeObjectURL(uploadedFiles[index].url);
            uploadedFiles.splice(index, 1);
            updateFileList();
        }

        function clearFiles() {
            uploadedFiles.forEach(f => URL.revokeObjectURL(f.url));
            uploadedFiles = [];
            updateFileList();
            
            // Clear preview
            document.getElementById('img-preview').style.display = 'none';
            document.getElementById('btn-download').style.display = 'none';
            document.getElementById('placeholder-text').style.display = 'block';
        }

        async function generateGIF() {
            if (uploadedFiles.length === 0) {
                alert('请先上传图片');
                return;
            }

            const btn = document.getElementById('btn-generate');
            const progressContainer = document.getElementById('progress-container');
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            const preview = document.getElementById('img-preview');
            const downloadBtn = document.getElementById('btn-download');

            btn.disabled = true;
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            progressText.innerText = '准备中...';

            try {
                const widthInput = document.getElementById('gif-width').value;
                const heightInput = document.getElementById('gif-height').value;
                const delay = parseInt(document.getElementById('gif-delay').value);
                const quality = parseInt(document.getElementById('gif-quality').value);
                const loop = document.getElementById('gif-loop').checked ? 0 : -1; // 0 = infinite
                const transparent = document.getElementById('gif-transparent').checked ? 'rgba(0,0,0,0)' : null;

                // Determine output dimensions based on first image or input
                let width = parseInt(widthInput) || 0;
                let height = parseInt(heightInput) || 0;

                // Load all images to get dimensions if needed
                const images = await Promise.all(uploadedFiles.map(f => {
                    return new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.onerror = reject;
                        img.src = f.url;
                    });
                }));

                if (width === 0 || height === 0) {
                    // Default to first image dimensions if not set
                    if (images.length > 0) {
                        width = width || images[0].naturalWidth;
                        height = height || images[0].naturalHeight;
                    }
                }

                // Initialize GIF
                const gif = new GIF({
                    workers: 2,
                    quality: quality,
                    width: width,
                    height: height,
                    workerScript: '../js/workers/gif.worker.js',
                    repeat: loop,
                    transparent: transparent
                });

                // Add frames
                images.forEach(img => {
                    // We might need to draw to a canvas first to resize if dimensions don't match
                    if (img.naturalWidth !== width || img.naturalHeight !== height) {
                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        
                        // Fill background if not transparent? Or let it be transparent
                        // if (!transparent) {
                        //     ctx.fillStyle = '#ffffff';
                        //     ctx.fillRect(0, 0, width, height);
                        // }
                        
                        // Fit image (contain)
                        const scale = Math.min(width / img.naturalWidth, height / img.naturalHeight);
                        const x = (width - img.naturalWidth * scale) / 2;
                        const y = (height - img.naturalHeight * scale) / 2;
                        ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);
                        
                        gif.addFrame(canvas, { delay: delay });
                    } else {
                        gif.addFrame(img, { delay: delay });
                    }
                });

                gif.on('progress', (p) => {
                    const pct = Math.round(p * 100);
                    progressBar.style.width = pct + '%';
                    progressText.innerText = `渲染中... ${pct}%`;
                });

                gif.on('finished', (blob) => {
                    const url = URL.createObjectURL(blob);
                    preview.src = url;
                    preview.style.display = 'block';
                    document.getElementById('placeholder-text').style.display = 'none';
                    
                    downloadBtn.href = url;
                    downloadBtn.download = `animation_${Date.now()}.gif`;
                    downloadBtn.style.display = 'flex'; // flex to center content
                    
                    btn.disabled = false;
                    progressText.innerText = '完成!';
                    setTimeout(() => {
                        progressContainer.style.display = 'none';
                    }, 2000);
                });

                gif.render();

            } catch (err) {
                console.error(err);
                alert('GIF 生成出错: ' + err.message);
                btn.disabled = false;
                progressContainer.style.display = 'none';
            }
        }
    
