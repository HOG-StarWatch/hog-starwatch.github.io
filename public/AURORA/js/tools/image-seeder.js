/* Extracted from image-seeder.html (refactor script). Tool logic. */

        // --- State ---
        let coverBlob = null;
        let coverExt = 'png';
        let hiddenBlob = null;
        let hiddenFiles = [];
        let hiddenMode = 'files';
        let coverMode = 'upload';

        // --- Tabs ---
        function switchCoverTab(mode) {
            document.querySelectorAll('.cover-content').forEach(el => {
                el.style.display = 'none';
                el.classList.remove('active-flex');
            });
            const target = document.getElementById('cover-' + mode);
            target.style.display = 'flex';
            target.style.flexDirection = 'column';
            coverMode = mode;
            
            const btns = document.querySelectorAll('.panel:first-of-type .tab-btn');
            btns.forEach(b => b.classList.remove('active'));
            if(mode === 'upload') btns[0].classList.add('active'); else btns[1].classList.add('active');

            if(mode === 'generate') renderCanvas();
        }

        function switchHiddenTab(mode) {
            document.querySelectorAll('.hidden-content').forEach(el => {
                el.style.display = 'none';
                el.classList.remove('active-flex');
            });
            const target = document.getElementById('hidden-' + mode);
            target.style.display = 'flex';
            target.style.flexDirection = 'column';
            hiddenMode = mode;
            
            const btns = document.querySelectorAll('.panel:nth-of-type(2) .tab-btn');
            btns.forEach(b => b.classList.remove('active'));
            if(mode === 'files') btns[0].classList.add('active'); else btns[1].classList.add('active');
        }

        // --- Cover Logic ---
        document.getElementById('input-cover').onchange = (e) => {
            const file = e.target.files[0];
            if(!file) return;
            
            coverExt = file.name.split('.').pop().toLowerCase();
            if(coverExt === 'jpg') coverExt = 'jpeg';
            
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = document.getElementById('img-preview');
                img.src = ev.target.result;
                img.style.display = 'block';
                document.getElementById('ph-cover').style.display = 'none';
            };
            reader.readAsDataURL(file);
            coverBlob = file;
        };

        // --- Generator Logic ---
        const cvs = document.getElementById('gen-canvas');
        const ctx = cvs.getContext('2d');
        let customElements = [
            { type: 'text', content: 'SECRET FILE', x: 300, y: 200, size: 60, color: '#ffffff' },
            { type: 'text', content: '极光', x: 300, y: 120, size: 40, color: '#ffffff' }
        ];

        function renderCanvas() {
            const color = document.getElementById('gen-color').value;
            
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, cvs.width, cvs.height);
            
            // Grid
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 2;
            const step = 40;
            for(let x=0; x<cvs.width; x+=step) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,cvs.height); ctx.stroke(); }
            for(let y=0; y<cvs.height; y+=step) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(cvs.width,y); ctx.stroke(); }

            // Elements
            customElements.forEach(el => {
                ctx.fillStyle = el.color || 'white';
                ctx.font = `bold ${el.size}px Segoe UI, Apple Color Emoji, Segoe UI Emoji`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 10;
                ctx.fillText(el.content, el.x, el.y);
                ctx.shadowBlur = 0;
            });
            
            cvs.toBlob(blob => {
                coverBlob = blob;
                coverExt = 'png';
            }, 'image/png');
        }

        function renderElementsUI() {
            const list = document.getElementById('element-list');
            list.innerHTML = '';
            
            customElements.forEach((el, idx) => {
                const div = document.createElement('div');
                div.className = 'element-item';
                div.innerHTML = `
                    <div style="display:flex; gap:10px; margin-bottom:5px;">
                        <input type="text" value="${el.content}" oninput="updateElement(${idx}, 'content', this.value)" style="flex:1;" placeholder="内容">
                        <input type="color" value="${el.color}" oninput="updateElement(${idx}, 'color', this.value)">
                        <button onclick="removeElement(${idx})" style="background:#ef4444; border:none; color:white; border-radius:4px; padding:0 10px; cursor:pointer;" aria-label="删除">${Ui.icon ? Ui.icon('trash') : ''}</button>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:5px;">
                        <label style="font-size:0.8rem; color:var(--text-dim);">Size <input type="number" value="${el.size}" oninput="updateElement(${idx}, 'size', this.value)" style="width:50px; padding:4px;"></label>
                        <label style="font-size:0.8rem; color:var(--text-dim);">X <input type="number" value="${el.x}" oninput="updateElement(${idx}, 'x', this.value)" style="width:50px; padding:4px;"></label>
                        <label style="font-size:0.8rem; color:var(--text-dim);">Y <input type="number" value="${el.y}" oninput="updateElement(${idx}, 'y', this.value)" style="width:50px; padding:4px;"></label>
                    </div>
                `;
                list.appendChild(div);
            });
        }

        window.updateElement = (idx, key, val) => {
            if(key === 'x' || key === 'y' || key === 'size') val = parseInt(val);
            customElements[idx][key] = val;
            renderCanvas();
        };
        window.removeElement = (idx) => { customElements.splice(idx, 1); renderElementsUI(); renderCanvas(); };
        window.addCustomElement = () => {
            customElements.push({ type: 'text', content: 'New', x: 300, y: 200, size: 40, color: '#ffffff' });
            renderElementsUI();
            renderCanvas();
        };

        renderElementsUI();
        setTimeout(renderCanvas, 100);
    

if (window.app && app.action) {
    app.action('image-seeder.switch-cover-tab', function (el) {
        switchCoverTab(el.dataset.mode);
    });
    app.action('image-seeder.switch-hidden-tab', function (el) {
        switchHiddenTab(el.dataset.mode);
    });
    app.action('addCustomElement', function () {
        addCustomElement();
    });
}

        // --- Hidden Files Logic ---
        document.getElementById('input-files').onchange = (e) => {
            hiddenFiles = Array.from(e.target.files);
            const list = document.getElementById('file-list');
            list.innerHTML = '';
            if(hiddenFiles.length === 0) { list.style.display = 'none'; return; }
            list.style.display = 'block';
            hiddenFiles.forEach(f => {
                list.innerHTML += `<div class="file-item"><span>${f.name}</span><span class="file-size">${(f.size/1024).toFixed(1)} KB</span></div>`;
            });
        };

        document.getElementById('input-zip').onchange = (e) => {
            const file = e.target.files[0];
            if(!file) return;
            hiddenBlob = file;
            document.getElementById('ph-zip').style.display = 'none';
            const info = document.getElementById('zip-info');
            info.style.display = 'block';
            info.innerText = `${file.name} (${(file.size/1024/1024).toFixed(2)} MB)`;
        };

        // --- Create Logic ---
        document.getElementById('btn-create').onclick = async () => {
            const btn = document.getElementById('btn-create');
            
            if (coverMode === 'generate' && !coverBlob) {
                await new Promise(r => cvs.toBlob(b => { coverBlob = b; coverExt='png'; r(); }));
            }
            if (!coverBlob) return alert("请先上传或生成封面图片！");

            let finalZipBlob = null;
            btn.disabled = true;
            btn.innerText = "正在打包...";

            try {
                if (hiddenMode === 'zip') {
                    if (!hiddenBlob) throw new Error("请上传压缩包文件！");
                    finalZipBlob = hiddenBlob;
                } else {
                    if (hiddenFiles.length === 0) throw new Error("请至少选择一个文件！");
                    
                    // Use ResourceLoader instead of assuming global JSZip
                    if(app && app.showToast) app.showToast('正在加载组件...', 'info');
                    await ResourceLoader.loadDeps('jszip');
                    
                    const zip = new JSZip();
                    hiddenFiles.forEach(f => zip.file(f.name, f));
                    btn.innerText = "正在压缩...";
                    finalZipBlob = await zip.generateAsync({type:"blob"});
                }

                btn.innerText = "正在合并...";
                const resultBlob = new Blob([coverBlob, finalZipBlob], { type: coverBlob.type });
                
                const dl = document.getElementById('btn-download');
                const url = URL.createObjectURL(resultBlob);
                dl.href = url;
                dl.download = `seed_image.${coverExt}`; 
                dl.style.display = 'flex';
                
                btn.innerText = "生成成功！";
                setTimeout(() => { btn.disabled = false; btn.innerHTML = (Ui.icon ? Ui.icon('wand') : '') + ' 生成图种'; }, 3000);

            } catch (err) {
                alert("错误: " + err.message);
                btn.disabled = false;
                btn.innerHTML = (Ui.icon ? Ui.icon('wand') : '') + ' 生成图种';
            }
        };
    
