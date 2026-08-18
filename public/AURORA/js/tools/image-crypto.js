/* Extracted from image-crypto.html (refactor script). Tool logic. */

// --- Worker Manager (WorkerRpc, unified protocol {type:'process'} → {type:'success'|'error'|'progress'}) ---
const cryptoRpc = (window.Worker && window.WorkerRpc) ? WorkerRpc.create('../js/workers/crypto.worker.js') : null;
const worker = {
    run: function(command, args, transferables, onProgress) {
        if (!cryptoRpc) return Promise.reject(new Error('Worker 不可用'));
        return cryptoRpc.call(
            Object.assign({ command: command }, args || {}),
            transferables,
            onProgress ? (d) => { if (d && d.progress !== undefined) onProgress(d.progress); } : undefined
        );
    }
};

// --- Navigation ---
function showTool(id) {
    document.querySelectorAll('.tool-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('tool-' + id).classList.add('active');
    
    const btns = document.querySelectorAll('.nav-btn');
    if(id === 'gilbert') btns[0].classList.add('active');
    if(id === 'visual') btns[1].classList.add('active');
    if(id === 'diff') btns[2].classList.add('active');
}

function switchTab(tool, mode) {
    const container = document.getElementById('tool-' + tool);
    container.querySelectorAll(`.${tool}-tab-content`).forEach(el => el.style.display = 'none');
    container.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`${tool}-${mode}`).style.display = 'block';
    event.currentTarget.classList.add('active');
}

// ==========================================
// TOOL 1: Gilbert Shuffle
// ==========================================
(function(){
    const imgPreview = document.getElementById("gb-img-preview");
    const keyInput = document.getElementById("gb-key");
    const dlBtn = document.getElementById("gb-download");
    const loading = document.getElementById("gb-loading");
    let currentImg = null;

    new DragDropHandler({
        dropZone: document.getElementById('gb-dropzone'),
        input: document.getElementById('gb-input'),
        accept: ['image/*'],
        onFile: async (file) => {
            currentImg = await CanvasUtils.loadImage(file);
            imgPreview.src = currentImg.src;
            imgPreview.style.display = 'block';
            dlBtn.style.display = 'none';
        }
    });

    async function process(isEncrypt) {
        if (!currentImg) return alert("请先上传图片");
        
        loading.style.display = 'block';
        imgPreview.style.opacity = '0.5';

        try {
            const imageData = CanvasUtils.getImageData(currentImg);
            const key = parseInt(keyInput.value) || 0;

            const result = await worker.run(
                isEncrypt ? 'gilbert-encrypt' : 'gilbert-decrypt', 
                {
                    pixels: imageData.data,
                    width: imageData.width,
                    height: imageData.height,
                    key: key
                },
                [imageData.data.buffer] // Transfer ownership
            );

            const url = CanvasUtils.pixelsToDataURL(result.pixels, imageData.width, imageData.height);
            imgPreview.src = url;
            imgPreview.style.display = 'block';
            
            dlBtn.href = url;
            dlBtn.download = (isEncrypt?"gb_enc_":"gb_dec_") + Date.now() + ".png";
            dlBtn.style.display = 'inline-flex';
            
            // Update currentImg so we can chain operations
            currentImg = new Image();
            currentImg.src = url;

        } catch (e) {
            alert('Error: ' + e.message);
        } finally {
            loading.style.display = 'none';
            imgPreview.style.opacity = '1';
        }
    }

    document.getElementById("gb-btn-enc").onclick = () => process(true);
    document.getElementById("gb-btn-dec").onclick = () => process(false);
})();

// ==========================================
// TOOL 2: Visual Crypto
// ==========================================
(function(){
    const p1 = document.getElementById('vs-param-1');
    const p2 = document.getElementById('vs-param-2');
    const v1 = document.getElementById('vs-val-1');
    const v2 = document.getElementById('vs-val-2');
    
    p1.oninput = () => v1.innerText = p1.value;
    p2.oninput = () => v2.innerText = p2.value;

    let sourceImg = null;
    let decB = null, decC = null;

    // --- Descriptions ---
    const descriptions = {
        algo: {
            'arithmetic': '<strong>标准视觉加密 (Arithmetic):</strong> 基于加法模运算 (A = B + C) 的无损加密。生成的密钥层 C 为确定性噪点，安全性极高，还原后无画质损失。',
            'xor': '<strong>异或视觉加密 (XOR):</strong> 基于位运算 (A = B ^ C) 的无损加密。计算速度快，同样支持完美还原。'
        },
        style: {
            'mosaic': '<strong>马赛克 (Mosaic):</strong> 将图像划分为方块，取平均色，产生像素化效果。适合模糊细节。',
            'blur': '<strong>高斯模糊 (Gaussian Blur):</strong> 对图像进行平滑处理，去除细节和噪点，产生朦胧感。',
            'dot': '<strong>半调点阵 (Halftone Dot):</strong> 模拟印刷效果，用点的大小或密度表现灰度。具有艺术感。',
            'stripe': '<strong>线性条纹 (Linear Stripe):</strong> 添加水平扫描线，类似旧电视效果。',
            'cross': '<strong>网格纹理 (Crosshatching):</strong> 叠加交叉线条，产生素描般的阴影效果。',
            'edge': '<strong>边缘检测 (Sobel Edge):</strong> 仅保留图像的边缘轮廓，隐藏色彩和填充细节。',
            'invert': '<strong>反色 (Invert):</strong> 反转图像颜色，产生底片效果。'
        }
    };

    function updateDesc() {
        const algo = document.getElementById('vs-algo').value;
        const style = document.getElementById('vs-style').value;
        document.getElementById('vs-desc').innerHTML = descriptions.algo[algo] + '<br><br>' + descriptions.style[style];
    }
    updateDesc();

    ['vs-algo', 'vs-style', 'vs-param-1', 'vs-param-2'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            if(id === 'vs-algo' || id === 'vs-style') updateDesc();
            runEncrypt();
        });
    });

    new DragDropHandler({
        dropZone: document.getElementById('vs-dropzone-a'),
        input: document.getElementById('vs-input-a'),
        accept: ['image/*'],
        onFile: async (file) => {
            sourceImg = await CanvasUtils.loadImage(file);
            runEncrypt();
        }
    });

    async function runEncrypt() {
        if(!sourceImg) return;
        
        const algo = document.getElementById('vs-algo').value;
        const style = document.getElementById('vs-style').value;
        const size = parseInt(p1.value);
        const noise = parseInt(p2.value);

        // Progress UI
        const progDiv = document.getElementById('vs-progress-enc');
        const progBar = document.getElementById('vs-bar-enc');
        progDiv.style.display = 'block';
        progBar.value = 0;

        try {
            const imgData = CanvasUtils.getImageData(sourceImg);
            
            const result = await worker.run('visual-encrypt', {
                pixels: imgData.data,
                width: imgData.width,
                height: imgData.height,
                style, size, algo, noise
            }, [imgData.data.buffer], (progress) => {
                progBar.value = progress;
            });

            const urlB = CanvasUtils.pixelsToDataURL(result.pixelsA, imgData.width, imgData.height);
            const bImg = document.getElementById('vs-img-b');
            bImg.src = urlB;
            bImg.style.display = 'block';
            const dlB = document.getElementById('vs-dl-b');
            dlB.href = urlB;
            dlB.download = 'visual_B.png';
            dlB.style.display = 'inline-flex';

            const urlC = CanvasUtils.pixelsToDataURL(result.pixelsB, imgData.width, imgData.height);
            const cImg = document.getElementById('vs-img-c');
            cImg.src = urlC;
            cImg.style.display = 'block';
            const dlC = document.getElementById('vs-dl-c');
            dlC.href = urlC;
            dlC.download = 'key_C.png';
            dlC.style.display = 'inline-flex';

            if(window.parent && window.parent.app && window.parent.app.showToast) {
                window.parent.app.showToast('加密完成！');
            }

        } catch (e) {
            console.error(e);
            alert('Processing failed: ' + e.message);
        } finally {
            setTimeout(() => progDiv.style.display = 'none', 1000);
        }
    }

    // Decrypt handlers
    const checkDecReady = () => {
        const btn = document.getElementById('vs-btn-dec');
        const err = document.getElementById('vs-err');
        if(decB && decC) {
            if(decB.naturalWidth !== decC.naturalWidth || decB.naturalHeight !== decC.naturalHeight) {
                err.style.display = 'block';
                btn.disabled = true;
            } else {
                err.style.display = 'none';
                btn.disabled = false;
            }
        }
    };

    new DragDropHandler({
        dropZone: document.getElementById('vs-dropzone-b'),
        input: document.getElementById('vs-input-b'),
        accept: ['image/*'],
        onFile: async (file) => {
            decB = await CanvasUtils.loadImage(file);
            document.getElementById('vs-dropzone-b').querySelector('p').innerText = "B Ready";
            checkDecReady();
        }
    });

    new DragDropHandler({
        dropZone: document.getElementById('vs-dropzone-c'),
        input: document.getElementById('vs-input-c'),
        accept: ['image/*'],
        onFile: async (file) => {
            decC = await CanvasUtils.loadImage(file);
            document.getElementById('vs-dropzone-c').querySelector('p').innerText = "C Ready";
            checkDecReady();
        }
    });

    document.getElementById('vs-btn-dec').onclick = async () => {
        if (!decB || !decC) return;
        
        const progDiv = document.getElementById('vs-progress-dec');
        const progBar = document.getElementById('vs-bar-dec');
        progDiv.style.display = 'block';
        progBar.value = 0;

        try {
            const dataB = CanvasUtils.getImageData(decB);
            const dataC = CanvasUtils.getImageData(decC);
            const algo = document.getElementById('vs-algo-dec').value;
            const noise = parseInt(p2.value); // Use same noise slider

            const result = await worker.run('visual-decrypt', {
                pixelsB: dataB.data,
                pixelsC: dataC.data,
                width: dataB.width,
                height: dataB.height,
                algo, noise
            }, [dataB.data.buffer, dataC.data.buffer], (progress) => {
                progBar.value = progress;
            });

            const url = CanvasUtils.pixelsToDataURL(result.pixels, dataB.width, dataB.height);
            const resImg = document.getElementById('vs-img-result');
            resImg.src = url;
            resImg.style.display = 'block';
            const dlRes = document.getElementById('vs-dl-result');
            dlRes.href = url;
            dlRes.download = 'restored.png';
            dlRes.style.display = 'inline-flex';

            if(window.parent && window.parent.app && window.parent.app.showToast) {
                window.parent.app.showToast('解密完成！');
            }
        } catch(e) {
            alert('Decrypt failed: ' + e.message);
        } finally {
            setTimeout(() => progDiv.style.display = 'none', 1000);
        }
    };
})();

// ==========================================
// TOOL 3: Difference Separation
// ==========================================
(function(){
    // --- State & UI Elements ---
    let targetImg = null, refImg = null;
    let brushSize = 30, brushColor = '#000000', isDrawing = false;
    
    // Encrypt UI
    const cvsEnc = document.getElementById('diff-preview-enc');
    const ctxEnc = cvsEnc.getContext('2d');
    const cvsRef = document.getElementById('diff-preview-ref');
    const ctxRef = cvsRef.getContext('2d');
    const overlayCvs = document.getElementById('diff-overlay');
    const overlayCtx = overlayCvs.getContext('2d');
    
    // Decrypt UI
    let decImgA = null, decImgB = null;
    const cvsDecA = document.getElementById('diff-preview-dec-a');
    const cvsDecB = document.getElementById('diff-preview-dec-b');

    // --- Encrypt Handlers ---
    document.getElementById('diff-file-enc').onchange = async (e) => {
        if(!e.target.files[0]) return;
        targetImg = await CanvasUtils.loadImage(e.target.files[0]);
        // Resize canvas
        cvsEnc.width = targetImg.width; cvsEnc.height = targetImg.height;
        overlayCvs.width = targetImg.width; overlayCvs.height = targetImg.height;
        overlayCvs.style.display = 'block';
        ctxEnc.drawImage(targetImg, 0, 0);
        overlayCtx.clearRect(0, 0, targetImg.width, targetImg.height);
    };

    document.getElementById('diff-file-ref').onchange = async (e) => {
        if(!e.target.files[0]) return;
        refImg = await CanvasUtils.loadImage(e.target.files[0]);
        cvsRef.width = refImg.width; cvsRef.height = refImg.height;
        ctxRef.drawImage(refImg, 0, 0);
    };

    // Painting Logic
    overlayCvs.onmousedown = (e) => { isDrawing = true; paint(e); };
    overlayCvs.onmousemove = (e) => { if(isDrawing) paint(e); };
    overlayCvs.onmouseup = () => { isDrawing = false; pushHistory(); };
    overlayCvs.onmouseout = () => { isDrawing = false; };

    function paint(e) {
        const rect = overlayCvs.getBoundingClientRect();
        const scaleX = overlayCvs.width / rect.width;
        const scaleY = overlayCvs.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        overlayCtx.fillStyle = "rgba(255, 0, 0, 0.5)"; 
        overlayCtx.beginPath();
        overlayCtx.arc(x, y, document.getElementById('diff-brush-size').value, 0, Math.PI * 2);
        overlayCtx.fill();
    }

    let history = [];
    function pushHistory() {
        if (history.length > 5) history.shift();
        history.push(overlayCtx.getImageData(0,0, overlayCvs.width, overlayCvs.height));
    }
    document.getElementById('diff-undo-btn').onclick = () => {
        if(history.length > 0) {
            history.pop();
            const prev = history[history.length-1];
            overlayCtx.clearRect(0,0, overlayCvs.width, overlayCvs.height);
            if(prev) overlayCtx.putImageData(prev, 0, 0);
        }
    };
    document.getElementById('diff-clear-btn').onclick = () => {
        overlayCtx.clearRect(0,0, overlayCvs.width, overlayCvs.height);
        history = [];
    };

    // Process Encrypt
    document.getElementById('diff-start-enc').onclick = async () => {
        if(!targetImg) return alert('请先选择目标图片');
        
        const w = targetImg.width, h = targetImg.height;
        const format = document.getElementById('diff-format-enc').value;
        const useGuided = document.getElementById('diff-use-guided').checked;
        const mergeSide = document.getElementById('diff-merge-side').checked;

        const targetData = ctxEnc.getImageData(0,0,w,h).data;
        const overlayData = overlayCtx.getImageData(0,0,w,h).data;
        
        let refData = null;
        if(useGuided && refImg) {
            // Need to resize ref image to match target? 
            // Simplified: Draw to temp canvas of target size
            const tmp = document.createElement('canvas');
            tmp.width = w; tmp.height = h;
            tmp.getContext('2d').drawImage(refImg, 0, 0, w, h);
            refData = tmp.getContext('2d').getImageData(0,0,w,h).data;
        }

        try {
            const result = await worker.run('diff-encrypt', {
                targetPixels: targetData,
                refPixels: refData,
                overlayPixels: overlayData,
                useGuided: useGuided,
                width: w, height: h
            }, [targetData.buffer]); // overlayData and refData buffer transfer logic skipped for simplicity, but can be added

            // Show Result Card
            const resCard = document.getElementById('diff-result-card');
            const resSplit = document.getElementById('diff-result-split');
            const resMerged = document.getElementById('diff-result-merged');
            
            resCard.style.display = 'block';

            if (mergeSide) {
                resSplit.style.display = 'none';
                resMerged.style.display = 'flex'; // preview-container uses flex

                const outCvs = document.createElement('canvas');
                outCvs.width = w * 2; outCvs.height = h;
                const outCtx = outCvs.getContext('2d');
                const imgDataA = new ImageData(result.pixelsA, w, h);
                const imgDataB = new ImageData(result.pixelsB, w, h);
                outCtx.putImageData(imgDataA, 0, 0);
                outCtx.putImageData(imgDataB, w, 0);
                
                const url = outCvs.toDataURL("image/" + format);
                const img = document.getElementById('diff-img-res-merged');
                const btn = document.getElementById('diff-dl-merged');
                
                img.src = url;
                img.style.display = 'block';
                
                btn.href = url;
                btn.download = `diff_enc_merged_${Date.now()}.${format}`;
                btn.style.display = 'inline-flex';
            } else {
                resSplit.style.display = 'grid';
                resMerged.style.display = 'none';

                const urlA = CanvasUtils.pixelsToDataURL(result.pixelsA, w, h, "image/"+format);
                const urlB = CanvasUtils.pixelsToDataURL(result.pixelsB, w, h, "image/"+format);
                
                const imgA = document.getElementById('diff-img-res-a');
                const btnA = document.getElementById('diff-dl-a');
                imgA.src = urlA;
                imgA.style.display = 'block';
                btnA.href = urlA;
                btnA.download = `diff_enc_A_${Date.now()}.${format}`;
                btnA.style.display = 'inline-flex';

                const imgB = document.getElementById('diff-img-res-b');
                const btnB = document.getElementById('diff-dl-b');
                imgB.src = urlB;
                imgB.style.display = 'block';
                btnB.href = urlB;
                btnB.download = `diff_enc_B_${Date.now()}.${format}`;
                btnB.style.display = 'inline-flex';
            }
            
            // Scroll to results
            resCard.scrollIntoView({ behavior: 'smooth' });

        } catch (e) {
            alert('Error: ' + e.message);
        }
    };

    // --- Decrypt Handlers ---
    document.getElementById('diff-file-dec-a').onchange = async (e) => handleDecFile(e, 'A');
    document.getElementById('diff-file-dec-b').onchange = async (e) => handleDecFile(e, 'B');

    async function handleDecFile(e, type) {
        if(!e.target.files[0]) return;
        const img = await CanvasUtils.loadImage(e.target.files[0]);
        const cvs = type === 'A' ? cvsDecA : cvsDecB;
        cvs.width = img.width; cvs.height = img.height;
        cvs.getContext('2d').drawImage(img, 0, 0);
        if(type === 'A') decImgA = img; else decImgB = img;
    }

    document.getElementById('diff-start-dec').onclick = async () => {
        if(!decImgA) return alert('请至少上传一张图片');
        
        let w, h, dataA, dataB;
        
        if (decImgA && !decImgB) {
            // Assume side-by-side
            w = decImgA.width / 2;
            h = decImgA.height;
            const tmp = document.createElement('canvas');
            tmp.width = decImgA.width; tmp.height = decImgA.height;
            const tctx = tmp.getContext('2d');
            tctx.drawImage(decImgA, 0, 0);
            dataA = tctx.getImageData(0, 0, w, h).data;
            dataB = tctx.getImageData(w, 0, w, h).data;
        } else if (decImgA && decImgB) {
             if(decImgA.width !== decImgB.width || decImgA.height !== decImgB.height)
                return alert('两张图片尺寸必须一致');
             w = decImgA.width; h = decImgA.height;
             const t1 = document.createElement('canvas'); t1.width=w; t1.height=h;
             t1.getContext('2d').drawImage(decImgA, 0, 0);
             dataA = t1.getContext('2d').getImageData(0,0,w,h).data;
             
             const t2 = document.createElement('canvas'); t2.width=w; t2.height=h;
             t2.getContext('2d').drawImage(decImgB, 0, 0);
             dataB = t2.getContext('2d').getImageData(0,0,w,h).data;
        } else {
            return;
        }

        const format = document.getElementById('diff-format-dec').value;

        try {
            const result = await worker.run('diff-decrypt', {
                pixelsA: dataA,
                pixelsB: dataB,
                width: w, height: h
            }, [dataA.buffer, dataB.buffer]);

            CanvasUtils.download(CanvasUtils.pixelsToDataURL(result.pixels, w, h, "image/"+format), `diff_restored_${Date.now()}.${format}`);
        } catch (e) {
            alert('Decrypt Error: ' + e.message);
        }
    };
})();

if (window.app && app.action) {
    app.action('showTool', function (el) {
        showTool(el.dataset.mode);
    });
    app.action('switchTab', function (el) {
        switchTab(el.dataset.tool, el.dataset.mode);
        el.classList.add('active');
    });
}

