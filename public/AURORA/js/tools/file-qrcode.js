/* Extracted from file-qrcode.html (refactor script). Tool logic. */

        let selectedFiles = [];

        // --- Tab Switching ---
        function switchTab(tab) {
            document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
            
            if(tab === 'embed') {
                document.querySelector('.sub-tab:nth-child(1)').classList.add('active');
                document.getElementById('section-embed').style.display = 'flex';
            } else {
                document.querySelector('.sub-tab:nth-child(2)').classList.add('active');
                document.getElementById('section-extract').style.display = 'flex';
            }
        }

        // --- UI Utils ---
        function toggleCustomLink() {
            document.getElementById('customLinkInput').style.display = 
                document.getElementById('qrLinkSelect').value === 'custom' ? 'block' : 'none';
        }
        function toggleExtraInfo() {
            document.getElementById('extraInfoContainer').style.display = 
                document.getElementById('extraInfoToggle').checked ? 'block' : 'none';
        }
        document.getElementById('convertToJpg').onchange = (e) => {
            document.getElementById('jpgQualityContainer').style.display = e.target.checked ? 'block' : 'none';
        };

        // --- File Inputs & List Handling ---
        const filesInput = document.getElementById('filesInput');
        filesInput.onchange = (e) => {
            handleFiles(e.target.files);
            filesInput.value = ''; // Reset to allow re-selecting same files
        };

        const dropZone = document.getElementById('drop-zone');
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--primary)';
            dropZone.style.background = 'rgba(255,255,255,0.05)';
        });
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--border)';
            dropZone.style.background = 'rgba(0,0,0,0.2)';
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--border)';
            dropZone.style.background = 'rgba(0,0,0,0.2)';
            if(e.dataTransfer.files.length > 0) {
                handleFiles(e.dataTransfer.files);
            }
        });

        function handleFiles(files) {
            const newFiles = Array.from(files);
            selectedFiles = [...selectedFiles, ...newFiles];
            updateFileListUI();
        }

        function removeFile(index) {
            selectedFiles.splice(index, 1);
            updateFileListUI();
        }

        function updateFileListUI() {
            const container = document.getElementById('file-list-widget');
            container.innerHTML = '';
            
            if (selectedFiles.length === 0) {
                container.style.display = 'none';
                return;
            }
            
            container.style.display = 'block';
            
            selectedFiles.forEach((file, index) => {
                const div = document.createElement('div');
                div.className = 'file-list-item';
                div.innerHTML = `
                    <div class="file-info">
                        <span class="file-name" title="${file.name}">${file.name}</span>
                        <span class="file-meta">${(file.size / 1024).toFixed(1)} KB | ${file.type || 'Unknown'}</span>
                    </div>
                    <button class="remove-btn" onclick="removeFile(${index})" title="移除文件" aria-label="删除">${Ui.icon ? Ui.icon('close') : ''}</button>
                `;
                container.appendChild(div);
            });
        }

        document.getElementById('imageInput').onchange = (e) => {
            const file = e.target.files[0];
            document.getElementById('imageInputName').innerText = file ? file.name : '点击上传图片...';
        };

        // --- Core Logic ---
        const setProgress = (type, pct, text) => {
            const wrap = document.getElementById(type + 'ProgressWrap');
            const bar = document.getElementById(type + 'ProgressBar');
            const txt = document.getElementById(type + 'ProgressText');
            wrap.style.display = 'block';
            bar.style.width = pct + '%';
            txt.innerText = text;
        };
        const uiTick = () => new Promise(r => setTimeout(r, 0));

        // ================= EMBED LOGIC =================
        document.getElementById("generateButton").onclick = async function () {
            if (selectedFiles.length === 0) return alert("请选择文件");

            const button = document.getElementById("generateButton");
            button.disabled = true;
            button.innerText = "处理中…";

            try {
                if(app && app.showToast) app.showToast('正在加载组件...', 'info');
                await ResourceLoader.loadDeps('@file-qrcode');
                await generateDataQRCodeFromFiles(selectedFiles);
            } catch (err) {
                console.error(err);
                alert("处理失败：" + err.message);
            }

            button.disabled = false;
            button.innerText = "生成二维码图像";
        };

        async function generateDataQRCodeFromFiles(fileList) {
            setProgress("encode", 1, "准备开始…");
            await uiTick();

            // 1. Zip
            setProgress("encode", 5, "压缩文件…");
            const entries = {};
            const convertToJpg = document.getElementById('convertToJpg').checked;
            
            for(let file of fileList) {
                let data = new Uint8Array(await file.arrayBuffer());
                let name = file.name;
                
                if(convertToJpg && file.type.startsWith('image/') && !file.type.includes('jpeg')) {
                    try {
                        const bmp = await createImageBitmap(file);
                        const cvs = document.createElement('canvas');
                        cvs.width = bmp.width; cvs.height = bmp.height;
                        const ctx = cvs.getContext('2d');
                        ctx.fillStyle='#fff'; ctx.fillRect(0,0,bmp.width,bmp.height);
                        ctx.drawImage(bmp,0,0);
                        const blob = await new Promise(r => cvs.toBlob(r, 'image/jpeg', parseFloat(document.getElementById('jpgQuality').value)));
                        data = new Uint8Array(await blob.arrayBuffer());
                        name = name.substring(0, name.lastIndexOf('.')) + '.jpg';
                    } catch(e) { console.warn("Image conversion failed, using original", e); }
                }
                entries[name] = data;
            }
            
            const zipped = await new Promise((resolve, reject) => {
                 fflate.zip(entries, { level: 9 }, (err, data) => err ? reject(err) : resolve(data));
            });
            
            // 2. Prepare Data
            const checksum = zipped.reduce((acc, b) => acc ^ b, 0) & 0xff;
            const mode = document.getElementById("embedMode").value;
            let fullData, bytesPerPixel=1, bitsPerPixel=8, qrSize;
            
            // Header Construction
            if (mode === "anticomp") {
                fullData = new Uint8Array(10 + zipped.length);
                fullData.set([0x01, 0xFC, checksum, 0,0,0, ...new Uint8Array(new Uint32Array([zipped.length]).buffer).reverse()], 0); 
                fullData[6] = (zipped.length >>> 24) & 0xFF;
                fullData[7] = (zipped.length >>> 16) & 0xFF;
                fullData[8] = (zipped.length >>> 8) & 0xFF;
                fullData[9] = zipped.length & 0xFF;
                fullData.set(zipped, 10);
                bitsPerPixel = 2; 
            } else {
                fullData = new Uint8Array(8 + zipped.length);
                fullData[0] = checksum;
                fullData[4] = (zipped.length >>> 24) & 0xFF;
                fullData[5] = (zipped.length >>> 16) & 0xFF;
                fullData[6] = (zipped.length >>> 8) & 0xFF;
                fullData[7] = zipped.length & 0xFF;
                fullData.set(zipped, 8);
                bytesPerPixel = (mode === 'pair41') ? 2 : 1;
            }

            // 3. Calc Size
            let neededPixels;
            if (mode === "anticomp") neededPixels = Math.ceil(fullData.length * 8 / 2);
            else neededPixels = Math.ceil(fullData.length / bytesPerPixel) + 3; 

            qrSize = Math.max(512, Math.ceil(Math.sqrt(neededPixels)));
            
            // Write Size to Header
            if (mode === "anticomp") {
                fullData[3] = (qrSize >> 16) & 0xFF;
                fullData[4] = (qrSize >> 8) & 0xFF;
                fullData[5] = qrSize & 0xFF;
            } else {
                fullData[1] = (qrSize >> 16) & 0xFF;
                fullData[2] = (qrSize >> 8) & 0xFF;
                fullData[3] = qrSize & 0xFF;
            }

            // 4. Generate QR Base
            setProgress("encode", 20, "生成基础二维码...");
            const canvas = document.createElement("canvas");
            canvas.width = qrSize; canvas.height = qrSize;
            
            let url = document.getElementById("qrLinkSelect").value;
            if(url === 'custom') url = document.getElementById("customLinkInput").value || 'http://localhost';
            
            await QRCode.toCanvas(canvas, url, { errorCorrectionLevel: 'L', margin: 1, width: qrSize });
            
            // 5. Embed Data
            setProgress("encode", 30, "写入数据...");
            const ctx = canvas.getContext('2d');
            const imgData = ctx.getImageData(0,0,qrSize,qrSize);
            const px = imgData.data;

            if (mode === "anticomp") {
                const LEVELS = [0, 30, 60, 90];
                let bitIndex = 0;
                const totalBits = fullData.length * 8;
                for(let y=0; y<qrSize; y++) {
                    for(let x=0; x<qrSize; x++) {
                        const idx = (y*qrSize+x)*4;
                        let twoBits = 0;
                        if(bitIndex < totalBits) {
                            const b1 = (fullData[bitIndex>>>3] >>> (7-(bitIndex&7))) & 1;
                            bitIndex++;
                            const b2 = (fullData[bitIndex>>>3] >>> (7-(bitIndex&7))) & 1;
                            bitIndex++;
                            twoBits = (b1<<1)|b2;
                        } else {
                            twoBits = Math.floor(Math.random()*4);
                        }
                        
                        const lum = (px[idx]+px[idx+1]+px[idx+2])/3;
                        const base = LEVELS[twoBits];
                        const v = (lum >= 128) ? (255-base) : base;
                        px[idx]=px[idx+1]=px[idx+2]=v;
                        px[idx+3]=255;
                    }
                    if(y%10===0) await uiTick();
                }

            } else {
                let dataIdx = 0;
                const isPair = (mode === 'pair41');
                const setPx = (i, r,g,b) => { px[i]=r; px[i+1]=g; px[i+2]=b; px[i+3]=255; };
                setPx(0, 250,251,252); 
                setPx(4, 253,254,255); 
                setPx(8, 255,255, (isPair?255:254)); 
                
                for(let i=3; i<qrSize*qrSize; i++) { 
                    const idx = i*4;
                    let c1,c2,c3;
                    
                    if(dataIdx < fullData.length) {
                        if(isPair) {
                            const b1 = fullData[dataIdx++] || 0;
                            const b2 = fullData[dataIdx++] || 0;
                            let v = (b1<<8)|b2;
                            c3 = v%41; v=Math.floor(v/41);
                            c2 = v%41; v=Math.floor(v/41);
                            c1 = v;
                        } else {
                            let v = fullData[dataIdx++] || 0;
                            c3 = v%7; v=Math.floor(v/7);
                            c2 = v%7; v=Math.floor(v/7);
                            c1 = v;
                        }
                    } else {
                         if(isPair) { c1=Math.random()*41|0; c2=Math.random()*41|0; c3=Math.random()*41|0; }
                         else { c1=Math.random()*7|0; c2=Math.random()*7|0; c3=Math.random()*7|0; }
                    }
                    
                    const writeCh = (orig, v) => (orig < 128 ? v : 255-v);
                    px[idx] = writeCh(px[idx], c1);
                    px[idx+1] = writeCh(px[idx+1], c2);
                    px[idx+2] = writeCh(px[idx+2], c3);
                    px[idx+3] = 255;
                }
            }
            
            ctx.putImageData(imgData, 0, 0);
            
            // 6. Composition (Extra Info)
            setProgress("encode", 90, "合成最终图片...");
            const finalCanvas = await composeFinal(canvas);
            
            // Display
            const container = document.getElementById('qrPreviewContainer');
            container.innerHTML = '';
            finalCanvas.style.maxWidth = '100%';
            finalCanvas.style.height = 'auto';
            container.appendChild(finalCanvas);
            
            const dl = document.getElementById('downloadLink');
            dl.href = finalCanvas.toDataURL('image/png');
            dl.download = `qrcode_${Date.now()}.png`;
            dl.style.display = 'flex';
            
            setProgress("encode", 100, "完成！");
        }

        async function composeFinal(qrCvs) {
            if(!document.getElementById('extraInfoToggle').checked) return qrCvs;
            
            const n = qrCvs.width;
            const extraH = Math.floor(n * 0.25);
            const cvs = document.createElement('canvas');
            cvs.width = n; cvs.height = n + extraH;
            const ctx = cvs.getContext('2d');
            
            // Get Theme Colors
            const style = getComputedStyle(document.body);
            const bgPanel = style.getPropertyValue('--bg-panel').trim() || '#fff';
            const textMain = style.getPropertyValue('--text-main').trim() || '#000';
            
            // Background
            ctx.fillStyle = bgPanel; 
            ctx.fillRect(0,0,n,cvs.height);
            
            // Draw QR
            ctx.drawImage(qrCvs, 0, 0);
            
            const desc = document.getElementById('descriptionInput').value;
            const file = document.getElementById('previewImageInput').files[0];
            
            if(file) {
                const img = await createImageBitmap(file);
                const boxSize = n * 0.2;
                const scale = Math.min(boxSize/img.width, boxSize/img.height);
                const w = img.width*scale, h = img.height*scale;
                ctx.drawImage(img, (boxSize-w)/2, n+(extraH-h)/2, w, h);
                
                if(desc) {
                    ctx.font = `${Math.floor(n*0.05)}px sans-serif`;
                    ctx.fillStyle = textMain;
                    ctx.textBaseline = 'middle';
                    ctx.fillText(desc, n*0.25, n+extraH/2);
                }
            } else if(desc) {
                ctx.font = `${Math.floor(n*0.05)}px sans-serif`;
                ctx.fillStyle = textMain;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(desc, n/2, n+extraH/2);
            }
            
            return cvs;
        }

        // ================= DECODE LOGIC =================
        document.getElementById("decodeButton").onclick = () => {
             alert("解码功能在此版本暂未移植 (TODO: Port Decode Logic)");
        };

        // Theme Propagation Listener
        window.addEventListener('message', (e) => {
            if(e.data && e.data.type === 'theme-update') {
                // Force redraw if needed, but since we rely on getComputedStyle, 
                // just re-rendering (if something was generated) might be needed.
                // However, style.css usually handles CSS vars. 
                // This is just a placeholder if parent pushes specific values.
            }
        });

/* ============================================================
 * data-action registrations (refactor)
 * ============================================================ */
if (window.app && app.action) {

    app.action('switchTab', function (el) {
        switchTab(el.dataset.mode);
    });

}

    
