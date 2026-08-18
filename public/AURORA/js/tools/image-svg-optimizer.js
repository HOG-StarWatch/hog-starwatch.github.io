/* Extracted from image-svg-optimizer.html (refactor script). Tool logic. */

        // DOM Elements
        const codeInput = document.getElementById('code-input');
        const previewContent = document.getElementById('preview-content');
        const previewBg = document.getElementById('preview-bg');
        const previewViewport = document.getElementById('preview-viewport');
        const notificationBar = document.getElementById('notification-bar');
        const btnRemoveWatermark = document.getElementById('btn-remove-watermark');
        const zoomLevelDisplay = document.getElementById('zoom-level');
        const domTree = document.getElementById('dom-tree');
        const attrEditor = document.getElementById('attr-editor');
        const dragOverlay = document.getElementById('drag-overlay');
        
        // State
        let currentCode = '';
        let originalCode = '';
        let fileName = 'image.svg';
        let selectedElement = null;
        let batchZip = null;
        
        // Zoom/Pan State
        let scale = 1;
        let pointX = 0;
        let pointY = 0;
        let isPanning = false;
        let panStartX = 0;
        let panStartY = 0;
        let showCenter = false;

        const defaultSVG = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="#c084fc" />
  <path d="M60 100 L90 130 L140 70" stroke="white" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round" />
  <text x="100" y="190" text-anchor="middle" fill="#d4d4d4" font-family="sans-serif" font-size="14">SVG Preview</text>
  <text x="10" y="10" font-size="5">Created by Demo User</text>
</svg>`;

        // Wait for ResourceLoader
        window.addEventListener('load', async () => {
            try {
                await ResourceLoader.loadDeps(['@file-export']);
                let svgoModule = null;
                try {
                    svgoModule = await ResourceLoader.import('svgo');
                } catch (e) {}
                if (svgoModule && !window.svgo) {
                    window.svgo = svgoModule.default || svgoModule;
                }
                if (!window.svgo) {
                    showNotification('SVGO 加载失败，压缩功能不可用', 'warning');
                }

                document.getElementById('loading-mask').style.display = 'none';
                initApp();
            } catch (err) {
                console.error('Resource loading failed:', err);
                showNotification('资源加载失败，请刷新重试', 'error');
                document.getElementById('loading-mask').style.display = 'none';
                initApp(); 
            }
        });

        function initApp() {
            // --- Init ---
            codeInput.value = defaultSVG;
            handleCodeChange(defaultSVG);
            resetZoom();

            // --- Event Listeners ---
            codeInput.addEventListener('input', () => {
                handleCodeChange(codeInput.value, false); 
            });

            previewContent.addEventListener('click', (e) => {
                if (e.target.closest('svg')) {
                    e.stopPropagation();
                    selectElement(e.target);
                }
            });

            // Drag & Drop
            let dragCounter = 0;
            document.addEventListener('dragenter', (e) => {
                e.preventDefault();
                dragCounter++;
                dragOverlay.classList.add('active');
            });
            
            document.addEventListener('dragover', (e) => { e.preventDefault(); });
            
            document.addEventListener('dragleave', (e) => { 
                dragCounter--;
                if (dragCounter <= 0) {
                    dragCounter = 0;
                    dragOverlay.classList.remove('active');
                }
            });
            
            document.addEventListener('drop', (e) => {
                e.preventDefault();
                dragCounter = 0;
                dragOverlay.classList.remove('active');
                
                const files = e.dataTransfer.files;
                if (files.length === 0) return;

                if (document.getElementById('batch-view').classList.contains('active') || files.length > 1) {
                    switchTab('batch');
                    handleBatchFiles(files);
                } else {
                    switchTab('editor');
                    loadFile(files[0]);
                }
            });
        }
        
        // Pan & Zoom Logic
        function handleWheel(e) {
            e.preventDefault();
            
            const rect = previewBg.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const delta = -e.deltaY;
            const zoomFactor = 1.1;
            const factor = delta > 0 ? zoomFactor : 1 / zoomFactor;
            
            const newScale = scale * factor;
            
            // Limit zoom
            if (newScale < 0.1 || newScale > 20) return;

            // Zoom point logic: 
            pointX = mouseX - (mouseX - pointX) * (newScale / scale);
            pointY = mouseY - (mouseY - pointY) * (newScale / scale);
            scale = newScale;
            
            updateTransform();
        }

        function startPan(e) {
            if (e.target.closest('.control-group') || e.target.closest('.pane-header')) return;
            
            isPanning = true;
            panStartX = e.clientX;
            panStartY = e.clientY;
            previewBg.style.cursor = 'grabbing';
            document.addEventListener('mousemove', pan);
            document.addEventListener('mouseup', endPan);
        }

        function pan(e) {
            if (!isPanning) return;
            e.preventDefault();
            const dx = e.clientX - panStartX;
            const dy = e.clientY - panStartY;
            
            pointX += dx;
            pointY += dy;
            
            panStartX = e.clientX;
            panStartY = e.clientY;
            
            updateTransform();
        }

        function endPan() {
            isPanning = false;
            previewBg.style.cursor = 'grab';
            document.removeEventListener('mousemove', pan);
            document.removeEventListener('mouseup', endPan);
        }

        function updateTransform() {
            previewViewport.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
            zoomLevelDisplay.textContent = Math.round(scale * 100) + '%';
        }
        
        function toggleCenter() {
            showCenter = !showCenter;
            updateCenterMarker();
        }
        
        function updateCenterMarker() {
            let marker = document.getElementById('center-marker');
            if (showCenter) {
                if (!marker) {
                    marker = document.createElement('div');
                    marker.id = 'center-marker';
                    const dot = document.createElement('div');
                    dot.className = 'dot';
                    marker.appendChild(dot);
                    previewViewport.appendChild(marker);
                }
                marker.style.display = 'block';
                
                // Position at SVG center
                const svg = previewContent.querySelector('svg');
                if (svg) {
                    const size = getSVGSize(svg);
                    marker.style.left = (size.w / 2) + 'px';
                    marker.style.top = (size.h / 2) + 'px';
                } else {
                    marker.style.left = '0px';
                    marker.style.top = '0px';
                }
            } else {
                if (marker) marker.style.display = 'none';
            }
        }

        function resetZoom() {
            scale = 1;
            const bgRect = previewBg.getBoundingClientRect();
            const contentRect = previewContent.getBoundingClientRect(); 
            
            const svg = previewContent.querySelector('svg');
            if (svg) {
               const dim = getSVGSize(svg);
               const svgW = dim.w;
               const svgH = dim.h;
               pointX = (bgRect.width - svgW) / 2;
               pointY = (bgRect.height - svgH) / 2;
            } else {
                pointX = (bgRect.width - 200) / 2;
                pointY = (bgRect.height - 200) / 2;
            }

            updateTransform();
        }

        // --- Core Functions ---

        function loadFile(file) {
            if (!file) return;
            fileName = file.name;
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                originalCode = content;
                codeInput.value = content;
                handleCodeChange(content);
                showNotification(`已加载: ${file.name}`, 'success');
                resetZoom();
            };
            reader.readAsText(file);
        }

        function handleCodeChange(code, updateEditor = true) {
            currentCode = code;
            if (!originalCode) originalCode = code;
            if (updateEditor) codeInput.value = code;
            
            updateSizeDisplay();
            
            previewContent.innerHTML = code;
            const svg = previewContent.querySelector('svg');
            
            if (svg) {
                if (!svg.hasAttribute('width')) svg.setAttribute('width', '100%');
                if (!svg.hasAttribute('height')) svg.setAttribute('height', '100%');
                
                checkWatermark(code);
                buildTree(svg);
                updateCenterMarker(); 
            } else {
                domTree.innerHTML = '<div style="padding:10px; opacity:0.5;">No SVG detected</div>';
            }
        }

        function updateSizeDisplay() {
            const origBytes = new Blob([originalCode]).size;
            const currBytes = new Blob([currentCode]).size;
            const formatSize = (b) => {
                if (b < 1024) return b + ' B';
                return (b / 1024).toFixed(2) + ' KB';
            };
            
            document.getElementById('size-orig').textContent = formatSize(origBytes);
            document.getElementById('size-curr').textContent = formatSize(currBytes);
            
            if (origBytes > 0) {
                const saved = origBytes - currBytes;
                const percent = (saved / origBytes * 100).toFixed(1);
                const el = document.getElementById('size-saved');
                if (saved > 0) {
                    el.textContent = `${percent}% (-${formatSize(saved)})`;
                    el.style.color = 'var(--secondary)';
                } else if (saved < 0) {
                    el.textContent = `${percent}% (+${formatSize(-saved)})`;
                    el.style.color = '#f87171';
                } else {
                    el.textContent = '0%';
                    el.style.color = 'var(--text-dim)';
                }
            }
        }

        function buildTree(root) {
            domTree.innerHTML = '';
            function createNode(el, depth) {
                if (el.nodeType !== 1) return;
                const div = document.createElement('div');
                div.className = 'tree-item';
                div.style.paddingLeft = (depth * 15 + 10) + 'px';
                
                const tagName = document.createElement('span');
                tagName.className = 'tag';
                tagName.textContent = el.tagName;
                
                const idSpan = document.createElement('span');
                idSpan.className = 'id';
                if (el.id) idSpan.textContent = '#' + el.id;
                
                div.appendChild(tagName);
                div.appendChild(idSpan);
                div.onclick = (e) => { e.stopPropagation(); selectElement(el); };
                el._treeNode = div; 
                domTree.appendChild(div);
                Array.from(el.children).forEach(child => createNode(child, depth + 1));
            }
            Array.from(root.children).forEach(child => createNode(child, 0));
        }

        function selectElement(el) {
            if (selectedElement) {
                selectedElement.classList.remove('selected-element');
                if (selectedElement._treeNode) selectedElement._treeNode.classList.remove('active');
            }
            if (el.tagName === 'svg') {
                selectedElement = null;
                attrEditor.style.display = 'none';
                return;
            }
            selectedElement = el;
            el.classList.add('selected-element');
            if (el._treeNode) {
                el._treeNode.classList.add('active');
                el._treeNode.scrollIntoView({ block: 'nearest' });
            }
            populateInspector(el);
            highlightInCode(el);
        }
        
        function highlightInCode(el) {
            if (!el) return;
            const code = codeInput.value;
            const tagName = el.tagName;
            
            if (el.id) {
                const idRegex = new RegExp(`<${tagName}[^>]*\\bid=["']${el.id}["'][^>]*>`, 'i');
                const match = idRegex.exec(code);
                if (match) {
                    selectRange(match.index, match.index + match[0].length);
                    return;
                }
            }
            
            const allTags = Array.from(previewContent.querySelectorAll(tagName));
            const index = allTags.indexOf(el);
            
            if (index !== -1) {
                const regex = new RegExp(`<${tagName}\\b`, 'gi');
                let match;
                let count = 0;
                while ((match = regex.exec(code)) !== null) {
                    if (count === index) {
                        const start = match.index;
                        const endMatch = code.indexOf('>', start);
                        const end = (endMatch !== -1) ? endMatch + 1 : start + match[0].length;
                        selectRange(start, end);
                        return;
                    }
                    count++;
                }
            }
        }
        
        function selectRange(start, end) {
            codeInput.focus();
            codeInput.setSelectionRange(start, end);
            
            const fullText = codeInput.value;
            const textBefore = fullText.substr(0, start);
            const lineNum = textBefore.split('\n').length;
            
            const lineHeight = 18; 
            const visibleLines = codeInput.clientHeight / lineHeight;
            codeInput.scrollTop = Math.max(0, (lineNum - visibleLines / 2) * lineHeight);
        }

        function populateInspector(el) {
            attrEditor.style.display = 'block';
            document.getElementById('sel-tag').textContent = el.tagName;
            const getVal = (attr) => el.getAttribute(attr) || '';
            const getStyle = (prop) => el.style[prop] || '';
            
            document.getElementById('inp-id').value = el.id;
            const fill = getVal('fill') || getStyle('fill');
            document.getElementById('inp-fill').value = fill;
            document.getElementById('inp-fill-color').value = rgb2hex(fill) || '#000000';
            const stroke = getVal('stroke') || getStyle('stroke');
            document.getElementById('inp-stroke').value = stroke;
            document.getElementById('inp-stroke-color').value = rgb2hex(stroke) || '#000000';
            document.getElementById('inp-stroke-width').value = parseFloat(getVal('stroke-width')) || 1;
            document.getElementById('inp-opacity').value = getVal('opacity') || 1;
        }

        function updateAttr(attr, value) {
            if (!selectedElement) return;
            selectedElement.setAttribute(attr, value);
            syncCodeFromDOM();
        }

        function syncCodeFromDOM() {
            const svg = previewContent.querySelector('svg');
            if (!svg) return;
            const wasSelected = selectedElement;
            if (wasSelected) wasSelected.classList.remove('selected-element');
            const serializer = new XMLSerializer();
            let newCode = serializer.serializeToString(svg);
            if (wasSelected) wasSelected.classList.add('selected-element');
            codeInput.value = newCode;
            currentCode = newCode;
        }

        function rgb2hex(color) {
            if (!color) return null;
            if (color.startsWith('#')) return color;
            return '#000000'; 
        }

        function formatCode() {
            const source = codeInput.value;
            let formatted = '';
            let indent = 0;
            const tab = '  ';
            
            const parts = source.split(/(<[^>]+>)/g).filter(s => s.trim().length > 0);
            
            parts.forEach(part => {
                if (part.startsWith('</')) {
                    indent = Math.max(0, indent - 1);
                }
                
                formatted += tab.repeat(indent) + part.trim() + '\n';
                
                if (part.startsWith('<') && !part.startsWith('</') && !part.endsWith('/>') && !part.startsWith('<?') && !part.startsWith('<!')) {
                    const tagName = part.match(/<(\w+)/)[1];
                    const voidTags = ['path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'image', 'use', 'stop', 'br', 'hr', 'img', 'input'];
                    if (!voidTags.includes(tagName)) {
                        indent++;
                    }
                }
            });
            
            handleCodeChange(formatted.trim());
        }

        function checkWatermark(code) {
            const hasWatermark = /<text[^>]*>.*?(Created by|Noun Project).*?<\/text>/gis.test(code);
            btnRemoveWatermark.style.display = hasWatermark ? 'inline-block' : 'none';
        }
        
        function removeWatermark() {
            const clean = currentCode.replace(/<text[^>]*>.*?(Created by|Noun Project).*?<\/text>/gis, '');
            handleCodeChange(clean);
            showNotification('水印已去除', 'success');
        }

        function optimizeSVG() {
             if (typeof svgo === 'undefined' && typeof window.svgo === 'undefined') { showNotification('SVGO 未加载，请检查网络', 'error'); return; }
             const svgoLib = window.svgo || svgo;
             
             try {
                 const res = svgoLib.optimize(currentCode, { multipass: true, plugins: ['preset-default', 'removeXMLNS'] });
                 if (res.data) {
                     handleCodeChange(res.data);
                     showNotification('压缩完成', 'success');
                 }
             } catch(e) { showNotification('压缩出错: ' + e.message, 'error'); }
        }

        function getSVGSize(svg) {
            let w = parseFloat(svg.getAttribute('width'));
            let h = parseFloat(svg.getAttribute('height'));
            if (!w || !h || isNaN(w) || isNaN(h)) {
                const vb = svg.getAttribute('viewBox');
                if (vb) {
                    const parts = vb.split(/[\s,]+/).map(parseFloat);
                    if (parts.length === 4) {
                        w = parts[2];
                        h = parts[3];
                    }
                }
            }
            return { w: w || 300, h: h || 150 };
        }

        function transformSVG(type, val1, val2) {
            const svg = previewContent.querySelector('svg');
            if (!svg) return;
            
            const size = getSVGSize(svg);
            const cx = size.w / 2;
            const cy = size.h / 2;

            // Use 'root-transform' as wrapper
            let wrapper = svg.querySelector('g#root-transform');
            if (!wrapper) {
                wrapper = document.createElementNS("http://www.w3.org/2000/svg", "g");
                wrapper.id = "root-transform";
                // Move all children to wrapper
                while (svg.firstChild) wrapper.appendChild(svg.firstChild);
                svg.appendChild(wrapper);
            }

            let currentTransform = wrapper.getAttribute('transform') || '';
            
            if (type === 'rotate') {
                currentTransform = `rotate(${val1}, ${cx}, ${cy}) ` + currentTransform;
            } else if (type === 'scale') {
                currentTransform = `translate(${cx}, ${cy}) scale(${val1}, ${val2}) translate(${-cx}, ${-cy}) ` + currentTransform;
            }
            
            wrapper.setAttribute('transform', currentTransform);
            syncCodeFromDOM();
            buildTree(svg);
        }
        
        function flipSVG(axis) {
            if (axis === 'h') transformSVG('scale', -1, 1);
            if (axis === 'v') transformSVG('scale', 1, -1);
        }

        function showBase64() {
            const b64 = btoa(unescape(encodeURIComponent(currentCode)));
            document.getElementById('base64-output').value = `data:image/svg+xml;base64,${b64}`;
            document.getElementById('base64-modal').style.display = 'flex';
        }
        
        function copyBase64() {
            document.getElementById('base64-output').select();
            document.execCommand('copy');
            showNotification('已复制', 'success');
        }

        function exportImage(fmt) {
            const blob = new Blob([currentCode], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                const c = document.createElement('canvas');
                let w = parseInt(img.width) || 800;
                let h = parseInt(img.height) || 800;
                c.width = w; c.height = h;
                const ctx = c.getContext('2d');
                if (fmt === 'jpg') { ctx.fillStyle='white'; ctx.fillRect(0,0,w,h); }
                ctx.drawImage(img,0,0,w,h);
                c.toBlob(b => saveAs(b, `export.${fmt}`), `image/${fmt}`);
            };
            img.src = url;
        }
        
        function downloadSVG() {
            saveAs(new Blob([currentCode], {type: "image/svg+xml"}), fileName.replace('.svg', '_clean.svg'));
        }

        function switchTab(t) {
            document.querySelectorAll('.tab-content').forEach(e=>e.classList.remove('active'));
            document.getElementById(t+'-view').classList.add('active');
            document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
            const btns = document.querySelectorAll('.tab-btn');
            if (t === 'editor') btns[0].classList.add('active');
            else btns[1].classList.add('active');
        }
        
        function setBg(t) {
            previewBg.className = 'preview-area';
            if (t === 'dark') previewBg.classList.add('dark');
            if (t === 'light') previewBg.classList.add('light');
            // check is default
        }

        function showNotification(msg, type='info') {
            notificationBar.textContent = msg;
            notificationBar.className = `status-bar ${type}`;
            notificationBar.style.display = 'flex';
            setTimeout(() => notificationBar.style.display = 'none', 3000);
        }

        async function handleBatchFiles(files) {
            const list = document.getElementById('batch-list');
            list.innerHTML = '';
            batchZip = new JSZip();
            let count = 0;
            const svgoLib = window.svgo || svgo;

            for (let f of files) {
                const d = document.createElement('div');
                d.className = 'file-item';
                d.textContent = `处理中: ${f.name}`;
                list.appendChild(d);
                try {
                    let txt = await f.text();
                    txt = txt.replace(/<text[^>]*>.*?(Created by|Noun Project).*?<\/text>/gis, '');
                    if (svgoLib) txt = svgoLib.optimize(txt, {multipass:true}).data;
                    batchZip.file(f.name.replace('.svg', '_clean.svg'), txt);
                    d.textContent = `${f.name}`;
                    d.style.color = 'var(--secondary)'; // Used secondary (teal) for success
                    count++;
                } catch(e) { d.textContent = `${f.name}`; d.style.color = '#f87171'; }
            }
            if (count) {
                document.getElementById('btn-batch-download').disabled = false;
                showNotification(`已处理 ${count} 个文件`, 'success');
            }
        }
        
        function downloadBatchZip() {
            if(batchZip) batchZip.generateAsync({type:"blob"}).then(c => saveAs(c, "svg_batch.zip"));
        }

    

if (window.app && app.action) {
    app.action('image-svg-optimizer.switch-tab', function (el) {
        switchTab(el.dataset.tab);
    });
    app.action('image-svg-optimizer.load-file', function (el) {
        loadFile(el.files[0]);
    });
    app.action('image-svg-optimizer.set-bg', function (el) {
        setBg(el.dataset.bg);
    });
    app.action('image-svg-optimizer.transform-svg', function (el) {
        transformSVG(el.dataset.type, el.dataset.val);
    });
    app.action('image-svg-optimizer.flip-svg', function (el) {
        flipSVG(el.dataset.axis);
    });
    app.action('image-svg-optimizer.export-image', function (el) {
        exportImage(el.dataset.fmt);
    });
    app.action('image-svg-optimizer.update-attr', function (el) {
        updateAttr(el.dataset.attr, el.value);
    });
    app.action('image-svg-optimizer.handle-batch', function (el) {
        handleBatchFiles(el.files);
    });
    app.action('image-svg-optimizer.close-modal', function () {
        document.getElementById('base64-modal').style.display = 'none';
    });
    app.action('image-svg-optimizer.close-modal-backdrop', function (el, evt) {
        if (evt.target === el) el.style.display = 'none';
    });
}

// wheel/mousedown wiring (replaces inline onwheel="handleWheel(event)" / onmousedown="startPan(event)")
previewBg.addEventListener('wheel', handleWheel, { passive: false });
previewBg.addEventListener('mousedown', startPan);

    
