/* Extracted from image-hybrid.html (refactor script). Tool logic. */

        const cvs = document.getElementById('result-cvs');
        const ctx = cvs.getContext('2d');
        let imgNear = null, imgFar = null;
        let hybridRpc = null;

        if (window.Worker && window.WorkerRpc) {
            hybridRpc = WorkerRpc.create('../js/workers/hybrid.worker.js', {
                onFatal: () => { hybridRpc = null; } // main-thread fallback after worker crash
            });
        }

        document.getElementById('input-near').addEventListener('change', (e) => handleImage(e.target, 'near'));
        document.getElementById('input-far').addEventListener('change', (e) => handleImage(e.target, 'far'));

        function handleImage(input, type) {
            const file = input.files[0];
            if(!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    if(type === 'near') {
                        imgNear = img;
                        document.getElementById('img-near').src = img.src;
                        document.getElementById('img-near').style.display = 'block';
                        document.getElementById('preview1-placeholder').style.display = 'none';
                    } else {
                        imgFar = img;
                        document.getElementById('img-far').src = img.src;
                        document.getElementById('img-far').style.display = 'block';
                        document.getElementById('preview2-placeholder').style.display = 'none';
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function generateHybrid() {
            if(!imgNear || !imgFar) {
                if (app && app.showToast) app.showToast('请先上传两张图片', 'error');
                else alert('请先上传两张图片');
                return;
            }

            const w = imgNear.width;
            const h = imgNear.height;
            cvs.width = w;
            cvs.height = h;

            const dN = ctx.createImageData(0, 0).data;
            const dNB = ctx.createImageData(0, 0).data;
            const dFB = ctx.createImageData(0, 0).data;

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = w;
            tempCanvas.height = h;
            const tempCtx = tempCanvas.getContext('2d');

            tempCtx.drawImage(imgNear, 0, 0, w, h);
            const dataNear = tempCtx.getImageData(0, 0, w, h);

            const blurSize = parseInt(document.getElementById('range-hp').value);
            tempCtx.filter = `blur(${blurSize}px)`;
            tempCtx.drawImage(imgNear, 0, 0, w, h);
            const dataNearBlur = tempCtx.getImageData(0, 0, w, h);
            tempCtx.filter = 'none';

            const lpSize = parseInt(document.getElementById('range-lp').value);
            tempCtx.filter = `blur(${lpSize}px)`;
            tempCtx.drawImage(imgFar, 0, 0, w, h);
            const dataFarBlur = tempCtx.getImageData(0, 0, w, h);
            tempCtx.filter = 'none';

            const rangeBalValue = parseFloat(document.getElementById('range-bal').value);
            const isGray = document.getElementById('chk-gray').checked;

            if (hybridRpc) {
                hybridRpc.call({
                    dN: dataNear.data.buffer,
                    dNB: dataNearBlur.data.buffer,
                    dFB: dataFarBlur.data.buffer,
                    config: {
                        rangeBalValue: rangeBalValue,
                        isGray: isGray
                    }
                }, [dataNear.data.buffer, dataNearBlur.data.buffer, dataFarBlur.data.buffer]).then((d) => {
                    const imgData = new ImageData(new Uint8ClampedArray(d.outputData), cvs.width, cvs.height);
                    ctx.putImageData(imgData, 0, 0);
                    document.getElementById('resultPlaceholder').style.display = 'none';
                    cvs.style.display = 'block';
                    document.getElementById('dlBtn').disabled = false;
                    if (app && app.showToast) app.showToast('生成完成');
                    notifyParentResize();
                }).catch((err) => {
                    const msg = err && err.message ? err.message : err;
                    console.error('Worker Error:', msg);
                    if (app && app.showToast) app.showToast('生成失败: ' + msg, 'error');
                });
            } else {
                processHybridMain(dataNear.data, dataNearBlur.data, dataFarBlur.data, w, h, rangeBalValue, isGray);
            }
        }

        function processHybridMain(dN, dNB, dFB, w, h, rangeBalValue, isGray) {
            const outputData = new Uint8ClampedArray(dN.length);

            for (let i = 0; i < dN.length; i += 4) {
                if (isGray) {
                    const lN = 0.299*dN[i] + 0.587*dN[i+1] + 0.114*dN[i+2];
                    const lNB = 0.299*dNB[i] + 0.587*dNB[i+1] + 0.114*dNB[i+2];
                    const lFB = 0.299*dFB[i] + 0.587*dFB[i+1] + 0.114*dFB[i+2];

                    const highFreq = lN - lNB;
                    const lowFreq = lFB;

                    const hStrength = rangeBalValue * 3.0;
                    let val = lowFreq + highFreq * hStrength;
                    val = Math.min(255, Math.max(0, val));

                    outputData[i] = val;
                    outputData[i+1] = val;
                    outputData[i+2] = val;
                    outputData[i+3] = 255;
                } else {
                    for (let c = 0; c < 3; c++) {
                        const highFreq = dN[i+c] - dNB[i+c];
                        const lowFreq = dFB[i+c];

                        const hStrength = rangeBalValue * 3.0;
                        let val = lowFreq + highFreq * hStrength;

                        outputData[i+c] = Math.min(255, Math.max(0, val));
                    }
                    outputData[i+3] = 255;
                }
            }

            const imgData = new ImageData(outputData, w, h);
            ctx.putImageData(imgData, 0, 0);
            document.getElementById('resultPlaceholder').style.display = 'none';
            cvs.style.display = 'block';
            document.getElementById('dlBtn').disabled = false;
            if (app && app.showToast) app.showToast('生成完成');
            notifyParentResize();
        }

        function setViewSize(scale, btn) {
            document.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            cvs.style.width = (scale * 100) + '%';
        }

        function downloadImage() {
            const link = document.createElement('a');
            link.download = 'hybrid_image.png';
            link.href = cvs.toDataURL();
            link.click();
        }

        function notifyParentResize() {
            setTimeout(() => {
                const height = document.body.scrollHeight;
                window.parent.postMessage({ type: 'resize', height: height }, '*');
            }, 100);
        }
    
if (window.app && app.action) {
    app.action('hybrid.updateHp', function (el) {
        document.getElementById('val-hp').innerText = el.value;
    });
    app.action('hybrid.updateLp', function (el) {
        document.getElementById('val-lp').innerText = el.value;
    });
    app.action('hybrid.updateBal', function (el) {
        document.getElementById('val-bal').innerText = el.value;
    });
    app.action('setViewSize', function (el) {
        setViewSize(el.dataset.mode, el);
    });
}
    
