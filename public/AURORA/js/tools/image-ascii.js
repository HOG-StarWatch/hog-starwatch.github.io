/* Extracted from image-ascii.html (refactor script). Tool logic. */

        const fileInput = document.getElementById('fileInput');
        const densitySelect = document.getElementById('densitySelect');
        const widthInput = document.getElementById('widthInput');
        const colorMode = document.getElementById('colorMode');
        const textColor = document.getElementById('textColor');
        const outputDiv = document.getElementById('ascii-output');
        const hiddenText = document.getElementById('ascii-text-hidden');
        const canvas = document.getElementById('processCanvas');
        const ctx = canvas.getContext('2d');
        const videoEl = document.getElementById('sourceVideo');
        const videoControls = document.getElementById('video-controls');
        const playPauseBtn = document.getElementById('playPauseBtn');
        const uploadArea = document.getElementById('uploadArea');
        
        // Setup Drag and Drop
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.style.borderColor = 'var(--primary)'; });
        uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = 'var(--border)'; });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border)';
            if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
        });
        
        let currentSource = null; // 'image' or 'video'
        let currentImg = null;
        let isVideoPlaying = false;
        let animationFrameId = null;
        
        // Worker Init (WorkerRpc, unified protocol {type:'process'} → {type:'success'})
        let asciiRpc = null;
        let isWorkerBusy = false;
        
        if (window.Worker && window.WorkerRpc) {
            asciiRpc = WorkerRpc.create('../js/workers/ascii.worker.js');
        }

        function applyOutput(html, text) {
            outputDiv.classList.add('has-content');
            const isColor = colorMode.value === 'color';
            outputDiv.style.color = isColor ? 'inherit' : textColor.value;
            
            if (isColor) {
                outputDiv.innerHTML = html;
            } else {
                outputDiv.innerText = text;
            }
            hiddenText.value = text;
            
            // Font adjustment
            const containerWidth = outputDiv.clientWidth;
            const width = parseInt(widthInput.value);
            const estFontSize = Math.max(4, Math.floor(containerWidth / width * 1.6));
            outputDiv.style.fontSize = `${estFontSize}px`;
            outputDiv.style.lineHeight = `${estFontSize}px`;
        }

        fileInput.addEventListener('change', (e) => {
            if(e.target.files[0]) handleFile(e.target.files[0]);
        });

        function handleFile(file) {
            if(!file) return;
            
            // Stop previous video if any
            stopVideo();
            
            const url = URL.createObjectURL(file);
            
            if (file.type.startsWith('video/')) {
                currentSource = 'video';
                videoEl.src = url;
                videoEl.onloadeddata = () => {
                    videoEl.play();
                    isVideoPlaying = true;
                    videoControls.style.display = 'block';
                    playPauseBtn.innerText = '暂停';
                    renderLoop();
                    app.showToast('视频已加载');
                };
            } else {
                currentSource = 'image';
                videoControls.style.display = 'none';
                const img = new Image();
                img.onload = () => {
                    currentImg = img;
                    app.showToast('图片已加载');
                    generateASCII(); // Auto generate for image
                };
                img.src = url;
            }
        }
        
        playPauseBtn.addEventListener('click', () => {
            if (videoEl.paused) {
                videoEl.play();
                playPauseBtn.innerText = '暂停';
                isVideoPlaying = true;
                renderLoop();
            } else {
                videoEl.pause();
                playPauseBtn.innerText = '播放';
                isVideoPlaying = false;
                cancelAnimationFrame(animationFrameId);
            }
        });
        
        function stopVideo() {
            if (currentSource === 'video') {
                videoEl.pause();
                videoEl.src = '';
                cancelAnimationFrame(animationFrameId);
                isVideoPlaying = false;
            }
        }
        
        colorMode.addEventListener('change', () => {
            document.getElementById('color-picker-group').style.display = colorMode.value === 'text' ? 'block' : 'none';
        });

        function renderLoop() {
            if (!isVideoPlaying || currentSource !== 'video') return;
            
            processFrame(videoEl);
            animationFrameId = requestAnimationFrame(renderLoop);
        }

        function generateASCII() {
            if (currentSource === 'image' && currentImg) {
                processFrame(currentImg);
            } else if (currentSource === 'video') {
                // If video is paused, render current frame
                processFrame(videoEl);
            } else {
                app.showToast('请先选择媒体文件');
            }
        }

        function processFrame(source) {
            // Drop frame if worker is busy
            if (isWorkerBusy && currentSource === 'video') return;

            const width = parseInt(widthInput.value);
            // Safety check for width
            if (width < 10) return;
            
            let srcWidth, srcHeight;
            if (source.videoWidth) {
                srcWidth = source.videoWidth;
                srcHeight = source.videoHeight;
            } else {
                srcWidth = source.width;
                srcHeight = source.height;
            }
            
            const aspectRatio = srcHeight / srcWidth;
            const height = Math.floor(width * aspectRatio * 0.55);
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(source, 0, 0, width, height);
            const imageData = ctx.getImageData(0, 0, width, height);
            
            const config = {
                chars: densitySelect.value,
                isColor: colorMode.value === 'color'
            };

            if (asciiRpc) {
                isWorkerBusy = true;
                // Transfer buffer
                asciiRpc.call({
                    imageData: imageData,
                    config: config
                }, [imageData.data.buffer]).then((d) => {
                    isWorkerBusy = false;
                    applyOutput(d.html, d.text);
                }).catch((err) => {
                    isWorkerBusy = false;
                    console.error(err && err.message ? err.message : err);
                });
            } else {
                // Fallback (Original Logic)
                const data = imageData.data;
                const chars = config.chars;
                const isColor = config.isColor;
                
                let htmlOutput = '';
                let rawText = '';
                
                for(let y = 0; y < height; y++) {
                    let lineHtml = '';
                    let lineText = '';
                    for(let x = 0; x < width; x++) {
                        const offset = (y * width + x) * 4;
                        const r = data[offset];
                        const g = data[offset+1];
                        const b = data[offset+2];
                        
                        const avg = (r + g + b) / 3;
                        const charIndex = Math.floor((avg / 255) * (chars.length - 1));
                        const char = chars[charIndex];
                        
                        let displayChar = char;
                        if (isColor) {
                             if (char === '<') displayChar = '&lt;';
                             else if (char === '>') displayChar = '&gt;';
                             else if (char === '&') displayChar = '&amp;';
                             else if (char === ' ') displayChar = '&nbsp;';
                        }
                        
                        if(isColor) {
                            lineHtml += `<span style="color: rgb(${r},${g},${b})">${displayChar}</span>`;
                        } else {
                            lineHtml += displayChar;
                        }
                        lineText += char;
                    }
                    htmlOutput += lineHtml + (isColor ? '<br>' : '\n');
                    rawText += lineText + '\n';
                }
                
                outputDiv.classList.add('has-content');
                outputDiv.style.color = isColor ? 'inherit' : textColor.value;
                
                if (isColor) {
                    outputDiv.innerHTML = htmlOutput;
                } else {
                    outputDiv.innerText = rawText;
                }
                hiddenText.value = rawText;
                
                const containerWidth = outputDiv.clientWidth;
                const estFontSize = Math.max(4, Math.floor(containerWidth / width * 1.6));
                outputDiv.style.fontSize = `${estFontSize}px`;
                outputDiv.style.lineHeight = `${estFontSize}px`;
            }
        }
        
        function downloadText() {
            if(!hiddenText.value) return;
            const link = document.createElement('a');
            link.download = 'ascii_art.txt';
            link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(hiddenText.value);
            link.click();
        }
    
