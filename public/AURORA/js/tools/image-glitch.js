/* Extracted from image-glitch.html (refactor script). Tool logic. */

        // --- Core Variables ---
        let srcImg = new Image();
        let srcLoaded = false;
        const cvs = document.getElementById('cvs-main');
        const ctx = cvs.getContext('2d', { willReadFrequently: true });
        let currentMode = 'layer';
        let gifLibLoaded = false;
        
        // Load GIF Library
        ResourceLoader.loadDeps('@gif').then(() => {
            gifLibLoaded = true;
            console.log('GIF Library Loaded');
        });

        // Worker Init (WorkerRpc, unified protocol {type:'process'} → {type:'success'})
        let glitchRpc = null;
        if (window.Worker && window.WorkerRpc) {
            glitchRpc = WorkerRpc.create('../js/workers/glitch.worker.js');
        }

        // --- UI Utils ---
        function updateVal(id, val) { document.getElementById(id).innerText = val; }
        
        const idMap = {
            'rgb-amount': 'val-rgb',
            'rgb-angle': 'val-rgb-y',
            'slice-amount': 'val-slice',
            'slice-height': 'val-slice-h',
            'slice-offset': 'val-slice-o',
            'scan-density': 'val-scan',
            'scan-opacity': 'val-scan-o',
            'data-seed': 'val-data-seed',
            'data-amount': 'val-data-amt',
            'data-iter': 'val-data-iter',
            'gif-frames': 'val-gif-frames',
            'gif-delay': 'val-gif-delay',
            'gif-amount': 'val-gif-amt',
            'gif-iter': 'val-gif-iter'
        };

        Object.keys(idMap).forEach(id => {
            const el = document.getElementById(id);
            const span = document.getElementById(idMap[id]);
            if(el && span) {
                el.oninput = () => { span.innerText = el.value; if(currentMode === 'layer') requestAnimationFrame(renderLayerGlitch); };
            }
        });
        
        document.querySelectorAll('input[type=checkbox]').forEach(el => {
            el.onchange = () => { if(currentMode === 'layer') renderLayerGlitch(); };
        });

        // --- Mode Switching ---
        window.setMode = (mode) => {
            currentMode = mode;
            document.querySelectorAll('.sub-tab').forEach(el => el.classList.remove('active'));
            event.target.classList.add('active');
            
            document.getElementById('controls-layer').style.display = mode === 'layer' ? 'block' : 'none';
            document.getElementById('controls-data').style.display = mode === 'data' ? 'block' : 'none';
            document.getElementById('controls-gif').style.display = mode === 'gif' ? 'block' : 'none';
            
            // Reset Preview Visibility
            cvs.style.display = 'none';
            document.getElementById('img-mosh').style.display = 'none';
            document.getElementById('img-gif').style.display = 'none';

            if(mode === 'layer') {
                if(srcLoaded) {
                    cvs.style.display = 'block';
                    renderLayerGlitch();
                }
            } else if (mode === 'data') {
                if(srcLoaded && document.getElementById('img-mosh').src) {
                    document.getElementById('img-mosh').style.display = 'block';
                } else if (srcLoaded) {
                    // Show original if no result yet
                    document.getElementById('img-mosh').src = srcImg.src;
                    document.getElementById('img-mosh').style.display = 'block';
                }
            } else if (mode === 'gif') {
                if(srcLoaded && document.getElementById('img-gif').src) {
                    document.getElementById('img-gif').style.display = 'block';
                } else if (srcLoaded) {
                     document.getElementById('img-gif').src = srcImg.src;
                     document.getElementById('img-gif').style.display = 'block';
                }
            }
        };

        // --- File Loading ---
        const uploadArea = document.getElementById('uploadArea');
        const inputFile = document.getElementById('input-file');

        uploadArea.addEventListener('click', () => inputFile.click());
        uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.style.borderColor = 'var(--primary)'; });
        uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = 'var(--border)'; });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border)';
            if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
        });

        inputFile.onchange = (e) => {
            if(e.target.files[0]) handleFile(e.target.files[0]);
        };

        function handleFile(file) {
            if(!file) return;
            
            document.getElementById('placeholder-text').style.display = 'none';
            
            const reader = new FileReader();
            reader.onload = (ev) => {
                srcImg.onload = () => {
                    srcLoaded = true;
                    // Reset Canvas size
                    const maxW = 800; // Limit size for performance
                    const scale = Math.min(1, maxW / srcImg.width);
                    cvs.width = srcImg.width * scale;
                    cvs.height = srcImg.height * scale;
                    
                    // Always draw initial image to canvas to ensure data exists for other modes
                    ctx.drawImage(srcImg, 0, 0, cvs.width, cvs.height);
                    
                    if(currentMode === 'layer') {
                        cvs.style.display = 'block';
                        renderLayerGlitch();
                    } else if (currentMode === 'data') {
                        document.getElementById('img-mosh').src = srcImg.src;
                        document.getElementById('img-mosh').style.display = 'block';
                    } else if (currentMode === 'gif') {
                        document.getElementById('img-gif').src = srcImg.src;
                        document.getElementById('img-gif').style.display = 'block';
                    }
                };
                srcImg.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        }

        // --- Layer Glitch Logic ---
        function renderLayerGlitch() {
            if(!srcLoaded) return;
            
            const w = cvs.width;
            const h = cvs.height;
            
            // 1. Draw Original
            ctx.drawImage(srcImg, 0, 0, w, h);
            
            // A. Slice & Displace (Draw parts shifted) - KEEP IN MAIN THREAD (Faster with drawImage)
            if(document.getElementById('chk-slice').checked) {
                const amount = parseInt(document.getElementById('slice-amount').value);
                const height = parseInt(document.getElementById('slice-height').value);
                const maxOffset = parseInt(document.getElementById('slice-offset').value);
                
                for(let i=0; i<amount; i++) {
                    const y = Math.random() * h;
                    const sh = Math.random() * height + 2;
                    const off = (Math.random() - 0.5) * maxOffset * 2;
                    
                    // Draw a slice shifted
                    ctx.drawImage(srcImg, 
                        0, y / (h/srcImg.height), srcImg.width, sh / (h/srcImg.height), // Source
                        off, y, w, sh // Dest
                    );
                }
            }

            // If no pixel manip needed, stop here
            if(!document.getElementById('chk-rgb').checked && !document.getElementById('chk-scan').checked) {
                updateDownload(cvs.toDataURL('image/jpeg', 0.9));
                return;
            }

            // Use Worker for Pixel Manipulation (RGB & Scanlines)
            if (glitchRpc) {
                const btn = document.getElementById('btn-render');
                btn.innerText = "处理中...";
                btn.disabled = true;

                const imgData = ctx.getImageData(0, 0, w, h);
                
                const config = {
                    rgb: {
                        enabled: document.getElementById('chk-rgb').checked,
                        amount: parseInt(document.getElementById('rgb-amount').value),
                        angle: parseInt(document.getElementById('rgb-angle').value)
                    },
                    scan: {
                        enabled: document.getElementById('chk-scan').checked,
                        density: parseInt(document.getElementById('scan-density').value),
                        opacity: parseInt(document.getElementById('scan-opacity').value) / 100
                    }
                };

                glitchRpc.call({
                    imageData: imgData,
                    config: config
                }, [imgData.data.buffer]).then((d) => {
                    ctx.putImageData(d.imageData, 0, 0);
                    updateDownload(cvs.toDataURL('image/jpeg', 0.9));
                    btn.innerText = "重新渲染";
                    btn.disabled = false;
                }).catch((err) => {
                    const msg = err && err.message ? err.message : err;
                    console.error(msg);
                    alert('Worker Error: ' + msg);
                    btn.disabled = false;
                });
                
                return; // Worker handles the rest
            }

            // Fallback for no worker (Original Code)
            // B. RGB Shift (Composite Operation)
            if(document.getElementById('chk-rgb').checked) {
                const offX = parseInt(document.getElementById('rgb-amount').value);
                const offY = parseInt(document.getElementById('rgb-angle').value);
                
                if(offX !== 0 || offY !== 0) {
                    const imgData = ctx.getImageData(0, 0, w, h);
                    const original = ctx.getImageData(0, 0, w, h); // Copy
                    const d = imgData.data;
                    const s = original.data;
                    
                    for(let y=0; y<h; y++) {
                        for(let x=0; x<w; x++) {
                            const idx = (y * w + x) * 4;
                            
                            // Red Channel: Shift Left/Up
                            let rx = x - offX;
                            let ry = y - offY;
                            if(rx >= 0 && rx < w && ry >= 0 && ry < h) {
                                d[idx] = s[(ry * w + rx) * 4]; 
                            }
                            
                            // Blue Channel: Shift Right/Down
                            let bx = x + offX;
                            let by = y + offY;
                            if(bx >= 0 && bx < w && by >= 0 && by < h) {
                                d[idx+2] = s[(by * w + bx) * 4 + 2];
                            }
                        }
                    }
                    ctx.putImageData(imgData, 0, 0);
                }
            }
            
            // C. Scanlines
            if(document.getElementById('chk-scan').checked) {
                const density = parseInt(document.getElementById('scan-density').value);
                const opacity = parseInt(document.getElementById('scan-opacity').value) / 100;
                
                ctx.fillStyle = `rgba(0,0,0,${opacity})`;
                for(let y=0; y<h; y+=density) {
                    ctx.fillRect(0, y, w, 1);
                }
            }
            
            updateDownload(cvs.toDataURL('image/jpeg', 0.9));
        }

        // --- Data Mosh Logic ---
        function performDataMosh(uint8, seed, amount, iter) {
             const corrupted = new Uint8Array(uint8);
             // Simple PRNG for reproducibility if needed (but we use Math.random for now)
             
             for(let i=0; i<iter; i++) {
                // Pick a random spot, strictly after header (assume ~5% header safe zone)
                const maxIdx = corrupted.length - 100;
                const minIdx = Math.floor(corrupted.length / 20); 
                
                const idx = Math.floor(minIdx + Math.random() * (maxIdx - minIdx));
                
                // Action: Replace byte
                const val = Math.floor(Math.random() * 256);
                corrupted[idx] = val;
                
                // Action: Replace chunk with 0
                if(Math.random() > 0.5) {
                    for(let j=0; j<amount; j++) {
                        if(idx+j < maxIdx) corrupted[idx+j] = 0;
                    }
                }
            }
            return corrupted;
        }

        document.getElementById('btn-mosh').onclick = () => {
            if(!srcLoaded) return alert("请先上传图片！");
            
            const btn = document.getElementById('btn-mosh');
            btn.disabled = true;
            btn.innerText = "破坏中...";
            
            cvs.toBlob(blob => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const buffer = e.target.result; // ArrayBuffer
                    const uint8 = new Uint8Array(buffer);
                    
                    const amount = parseInt(document.getElementById('data-amount').value); 
                    const iter = parseInt(document.getElementById('data-iter').value); 
                    
                    const corrupted = performDataMosh(uint8, 0, amount, iter);
                    
                    const newBlob = new Blob([corrupted], {type: 'image/jpeg'});
                    const url = URL.createObjectURL(newBlob);
                    
                    const imgMosh = document.getElementById('img-mosh');
                    imgMosh.src = url;
                    
                    updateDownload(url);
                    btn.disabled = false;
                    btn.innerText = "破坏数据 (MOSH)";
                };
                reader.readAsArrayBuffer(blob);
            }, 'image/jpeg', 0.8);
        };

        // --- GIF Generation Logic ---
        let generatedFrames = []; // Stores { blob, url, seed, params }

        // 1. Generate Frames Step
        document.getElementById('btn-gen-frames').onclick = async () => {
             if(!srcLoaded) return alert("请先上传图片！");
             
             const btn = document.getElementById('btn-gen-frames');
             const status = document.getElementById('gif-status');
             
             btn.disabled = true;
             btn.innerText = "生成中...";
             status.innerText = "生成帧数据...";
             
             try {
                 const framesCount = parseInt(document.getElementById('gif-frames').value);
                 const amount = parseInt(document.getElementById('gif-amount').value);
                 const iter = parseInt(document.getElementById('gif-iter').value);
                 const randomSeed = document.getElementById('gif-seed-random').checked;
                 
                 // Clear existing if needed? Or append? Let's clear for now based on "Generate Frames" usually implies fresh set
                 // But user might want to add more. Let's Append if Shift key pressed? No, keep simple: Clear first.
                 // Actually, let's just clear for simplicity unless we add "Add Frames" button.
                 generatedFrames = []; 
                 
                 // Get Source Blob
                 const srcBlob = await new Promise(resolve => cvs.toBlob(resolve, 'image/jpeg', 0.8));
                 const srcBuffer = await srcBlob.arrayBuffer();
                 const srcUint8 = new Uint8Array(srcBuffer);
                 
                 for(let i=0; i<framesCount; i++) {
                     // status.innerText = `生成帧 ${i+1}/${framesCount}...`;
                     // Allow UI to update
                     await new Promise(r => requestAnimationFrame(r));
                     
                     const seed = randomSeed ? Math.floor(Math.random() * 10000) : i;
                     const corrupted = performDataMosh(srcUint8, seed, amount, iter); 
                     const blob = new Blob([corrupted], {type: 'image/jpeg'});
                     const url = URL.createObjectURL(blob);
                     
                     generatedFrames.push({
                         blob: blob,
                         url: url,
                         seed: seed,
                         amount: amount,
                         iter: iter,
                         srcUint8: srcUint8 // Keep ref to source for regeneration
                     });
                 }
                 
                 renderFrameEditor();
                 status.innerText = `已生成 ${generatedFrames.length} 帧`;
                 
             } catch (e) {
                 console.error(e);
                 alert('帧生成失败: ' + e.message);
             } finally {
                 btn.disabled = false;
                 btn.innerHTML = (Ui.icon ? Ui.icon('camera') : '') + ' 生成帧序列';
             }
        };

        // 2. Render Frame Editor UI
        function renderFrameEditor() {
            const container = document.getElementById('frame-editor');
            const list = document.getElementById('frame-list');
            const countDisplay = document.getElementById('frame-count-display');
            const renderBtn = document.getElementById('btn-render-gif');
            
            if(generatedFrames.length > 0) {
                container.style.display = 'block';
                renderBtn.disabled = false;
            } else {
                container.style.display = 'none';
                renderBtn.disabled = true;
            }
            
            countDisplay.innerText = generatedFrames.length;
            list.innerHTML = '';
            
            generatedFrames.forEach((frame, index) => {
                 const item = document.createElement('div');
                 item.id = `frame-item-${index}`;
                 item.className = 'frame-item';
                 item.onclick = (e) => {
                    // Ignore clicks on buttons inside
                    if(e.target.tagName === 'BUTTON') return;
                    previewFrame(index);
                 };
                 
                 // Image
                 const img = document.createElement('img');
                 img.src = frame.url;
                 img.style.width = '100%';
                 img.style.height = '100%';
                 img.style.objectFit = 'cover';
                 
                 // Overlay Controls
                 const overlay = document.createElement('div');
                 overlay.className = 'frame-overlay';
                 
                 // Regenerate Btn
                 const btnRegen = document.createElement('button');
                 btnRegen.innerHTML = Ui.icon ? Ui.icon('rotate-cw') : '';
                 btnRegen.setAttribute('aria-label', '重新生成');
                 btnRegen.title = '重新生成此帧';
                 btnRegen.onclick = (e) => { e.stopPropagation(); regenerateFrame(index); };
                 styleMiniBtn(btnRegen);

                 // Delete Btn
                 const btnDel = document.createElement('button');
                 btnDel.innerHTML = '×';
                 btnDel.style.color = '#ff4d4d';
                 btnDel.title = '删除此帧';
                 btnDel.onclick = (e) => { e.stopPropagation(); deleteFrame(index); };
                 styleMiniBtn(btnDel);
                 
                 // Move Left
                 const btnLeft = document.createElement('button');
                 btnLeft.innerHTML = '‹';
                 btnLeft.onclick = (e) => { e.stopPropagation(); moveFrame(index, -1); };
                 styleMiniBtn(btnLeft);
                 if(index === 0) btnLeft.style.visibility = 'hidden';

                 // Move Right
                 const btnRight = document.createElement('button');
                 btnRight.innerHTML = '›';
                 btnRight.onclick = (e) => { e.stopPropagation(); moveFrame(index, 1); };
                 styleMiniBtn(btnRight);
                 if(index === generatedFrames.length - 1) btnRight.style.visibility = 'hidden';

                 overlay.appendChild(btnLeft);
                 overlay.appendChild(btnRegen);
                 overlay.appendChild(btnDel);
                 overlay.appendChild(btnRight);
                 
                 item.appendChild(img);
                 item.appendChild(overlay);
                 list.appendChild(item);
             });
         }

         window.previewFrame = (index) => {
             // Highlight
             document.querySelectorAll('.frame-item').forEach(el => el.classList.remove('active'));
             const item = document.getElementById(`frame-item-${index}`);
             if(item) item.classList.add('active');
             
             // Show Image
             if(generatedFrames[index]) {
                 const imgGif = document.getElementById('img-gif');
                 imgGif.src = generatedFrames[index].url;
                 imgGif.style.display = 'block';
                 
                 // Update status text just for feedback
                 document.getElementById('gif-status').innerText = `预览第 ${index+1} 帧`;
             }
         };

        function styleMiniBtn(btn) {
            btn.style.background = 'none';
            btn.style.border = 'none';
            btn.style.color = '#fff';
            btn.style.cursor = 'pointer';
            btn.style.fontSize = '12px';
            btn.style.padding = '2px 4px';
            btn.onmouseover = () => btn.style.opacity = '1';
            btn.onmouseout = () => btn.style.opacity = '0.7';
            btn.style.opacity = '0.7';
        }

        window.clearFrames = () => {
            generatedFrames.forEach(f => URL.revokeObjectURL(f.url));
            generatedFrames = [];
            renderFrameEditor();
        };

        window.deleteFrame = (index) => {
            URL.revokeObjectURL(generatedFrames[index].url);
            generatedFrames.splice(index, 1);
            renderFrameEditor();
        };

        window.moveFrame = (index, dir) => {
            if(index + dir < 0 || index + dir >= generatedFrames.length) return;
            const temp = generatedFrames[index];
            generatedFrames[index] = generatedFrames[index+dir];
            generatedFrames[index+dir] = temp;
            renderFrameEditor();
        };

        window.regenerateFrame = (index) => {
            const frame = generatedFrames[index];
            const newSeed = Math.floor(Math.random() * 10000); // New random seed
            const corrupted = performDataMosh(frame.srcUint8, newSeed, frame.amount, frame.iter);
            
            URL.revokeObjectURL(frame.url); // Free old
            const blob = new Blob([corrupted], {type: 'image/jpeg'});
            
            generatedFrames[index] = {
                ...frame,
                blob: blob,
                url: URL.createObjectURL(blob),
                seed: newSeed
            };
            renderFrameEditor();
        };

        // 3. Render Final GIF
        document.getElementById('btn-render-gif').onclick = async () => {
             if(generatedFrames.length === 0) return;
             if(!gifLibLoaded) return alert("GIF 库尚未加载，请稍候...");
             
             const btn = document.getElementById('btn-render-gif');
             const status = document.getElementById('gif-status');
             const progressContainer = document.getElementById('gif-progress-container');
             const progressBar = document.getElementById('gif-progress-bar');
             const progressText = document.getElementById('gif-progress-text');

             btn.disabled = true;
             btn.innerText = "生成中...";
             status.innerText = "开始渲染 GIF...";
             
             // Reset & Show Progress
             progressContainer.style.display = 'block';
             progressBar.style.width = '0%';
             progressText.innerText = '0%';

             try {
                 const delay = parseInt(document.getElementById('gif-delay').value);
                 
                 // Initialize GIF Encoder with local worker
                 const gif = new GIF({
                    workers: 2,
                    quality: 10,
                    workerScript: '../js/workers/gif.worker.js'
                 });
                 
                 // Progress Event
                 gif.on('progress', function(p) {
                    const pct = Math.round(p * 100);
                    progressBar.style.width = pct + '%';
                    progressText.innerText = `渲染中... ${pct}%`;
                 });

                 // Add frames from generated list
                 for(let i=0; i<generatedFrames.length; i++) {
                     const frame = generatedFrames[i];
                     const img = new Image();
                     await new Promise((resolve) => {
                         img.onload = resolve;
                         img.onerror = resolve; 
                         img.src = frame.url;
                     });
                     
                     if(img.width > 0) {
                         gif.addFrame(img, {delay: delay});
                     }
                 }
                 
                 status.innerText = "编码 GIF 中 (可能需要几秒)...";
                 
                 gif.on('finished', function(blob) {
                    const url = URL.createObjectURL(blob);
                    const imgGif = document.getElementById('img-gif');
                    imgGif.src = url;
                    imgGif.style.display = 'block';
                    
                    updateDownload(url, 'glitch.gif');
                    btn.disabled = false;
                    btn.innerText = "导出 GIF";
                    status.innerText = "完成!";
                    
                    // Hide Progress after delay
                    setTimeout(() => {
                        progressContainer.style.display = 'none';
                    }, 2000);
                 });
                 
                 gif.render();
                 
             } catch (e) {
                 console.error(e);
                 alert('GIF 生成失败: ' + e.message);
                 btn.disabled = false;
                 btn.innerText = "导出 GIF";
                 status.innerText = "出错";
                 progressContainer.style.display = 'none';
             }
        };

        // --- Utils ---
        document.getElementById('btn-render').onclick = renderLayerGlitch;
        
        document.getElementById('btn-random').onclick = () => {
            document.getElementById('rgb-amount').value = Math.random() * 50;
            document.getElementById('slice-amount').value = Math.random() * 20;
            document.getElementById('slice-offset').value = Math.random() * 100;
            updateVal('val-rgb', parseInt(document.getElementById('rgb-amount').value));
            updateVal('val-slice', parseInt(document.getElementById('slice-amount').value));
            updateVal('val-slice-o', parseInt(document.getElementById('slice-offset').value));
            renderLayerGlitch();
        };

        function updateDownload(url, filename) {
            const btn = document.getElementById('btn-download');
            btn.style.display = 'flex';
            btn.href = url;
            btn.download = filename || `glitch_${Date.now()}.jpg`;
        }
    
if (window.app && app.action) {
    app.action('setMode', function (el) {
        setMode(el.dataset.mode);
    });
}
    
