/* Extracted from image-svg-tracer.html (refactor script). Tool logic. */

        const tracerTool = {
            files: [],
            worker: null,

            init: function() {
                // Initialize Worker (WorkerRpc, unified protocol)
                this.rpc = (window.Worker && window.WorkerRpc) ? WorkerRpc.create('../js/workers/svg-tracer.worker.js') : null;

                // Load libraries
                ResourceLoader.loadDeps('@file-export')
                    .then(() => {
                        console.log('Libraries loaded');
                    });

                // Events
                this.setupEvents();
            },

            setupEvents: function() {
                const dropZone = document.getElementById('drop-zone');
                const fileInput = document.getElementById('file-input');

                dropZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    dropZone.classList.add('drag-over');
                });
                dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
                dropZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dropZone.classList.remove('drag-over');
                    this.handleFiles(e.dataTransfer.files);
                });

                fileInput.addEventListener('change', (e) => {
                    this.handleFiles(e.target.files);
                    fileInput.value = '';
                });

                // Modal close on outside click
                window.addEventListener('click', (e) => {
                    const modal = document.getElementById('preview-modal');
                    if (e.target === modal) modal.classList.remove('show');
                });
            },

            handleFiles: function(fileList) {
                if (!fileList.length) return;
                
                Array.from(fileList).forEach(file => {
                    if (!file.type.startsWith('image/')) return;

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const fileItem = {
                            id: Date.now() + Math.random().toString(36).substr(2, 9),
                            file: file,
                            status: 'pending', // pending, processing, done, error
                            svgContent: null,
                            thumbnail: e.target.result,
                            originalSize: file.size,
                            progress: 5,
                            statusText: '等待中'
                        };
                        this.files.push(fileItem);
                        this.renderList();
                        
                        // Auto process
                        setTimeout(() => this.processFile(fileItem), 100);
                    };
                    reader.readAsDataURL(file);
                });
            },

            getOptions: function() {
                const blurCheck = document.getElementById('blur-check').checked;
                return {
                    numberofcolors: parseInt(document.getElementById('color-count').value),
                    ltres: parseFloat(document.getElementById('ltres').value),
                    qtres: parseFloat(document.getElementById('qtres').value),
                    pathomit: 8, // Fixed or add control if needed
                    blurradius: blurCheck ? parseInt(document.getElementById('blur-radius').value) : 0,
                    blurdelta: 20,
                    scale: 1, // We handle resizing via canvas before, so scale 1 usually
                    viewbox: true
                };
            },

            processAll: function() {
                this.files.forEach(f => {
                    f.status = 'pending';
                    this.processFile(f);
                });
                this.renderList();
            },

            processFile: function(fileItem) {
                if (fileItem.status === 'processing') return;
                fileItem.status = 'processing';
                fileItem.progress = 12;
                fileItem.statusText = '准备中';
                this.renderList();

                const maxWidth = parseInt(document.getElementById('max-width').value);
                const options = this.getOptions();

                // Load image to canvas to get ImageData (and resize)
                const img = new Image();
                img.src = fileItem.thumbnail;
                img.onload = () => {
                    fileItem.progress = 35;
                    fileItem.statusText = '读取图像';
                    this.renderList();
                    let width = img.width;
                    let height = img.height;
                    
                    if (maxWidth > 0 && width > maxWidth) {
                        const ratio = maxWidth / width;
                        width = maxWidth;
                        height = Math.round(height * ratio);
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const imageData = ctx.getImageData(0, 0, width, height);

                    // Send to worker
                    fileItem.progress = 60;
                    fileItem.statusText = '矢量化中';
                    this.renderList();
                    if (this.rpc) {
                        this.rpc.call({ imageData: imageData, options: options }, [imageData.data.buffer])
                            .then((d) => {
                                this.handleWorkerMessage({ data: { id: fileItem.id, status: 'success', svgContent: d.svgContent } });
                            })
                            .catch((err) => {
                                const msg = err && err.message ? err.message : err;
                                this.handleWorkerMessage({ data: { id: fileItem.id, status: 'error', error: msg } });
                            });
                    } else {
                        // Fallback: mark error (worker unavailable)
                        this.handleWorkerMessage({ data: { id: fileItem.id, status: 'error', error: 'Worker 不可用' } });
                    }
                };
            },

            handleWorkerMessage: function(e) {
                const { id, status, svgContent, error } = e.data;
                const fileItem = this.files.find(f => f.id === id);
                if (!fileItem) return;

                if (status === 'success') {
                    fileItem.status = 'done';
                    fileItem.svgContent = svgContent;
                    fileItem.progress = 100;
                    fileItem.statusText = '完成';
                } else {
                    fileItem.status = 'error';
                    fileItem.progress = 100;
                    fileItem.statusText = '失败';
                    console.error('Worker error:', error);
                }
                
                this.renderList();
            },

            renderList: function() {
                const listEl = document.getElementById('file-list');
                const countEl = document.getElementById('file-count');
                const dlBtn = document.getElementById('btn-download-all');
                const processingEl = document.getElementById('file-processing');
                const doneEl = document.getElementById('file-done');
                const errorEl = document.getElementById('file-error');
                
                listEl.innerHTML = '';
                countEl.textContent = this.files.length;
                
                const processingCount = this.files.filter(f => f.status === 'processing').length;
                const doneCount = this.files.filter(f => f.status === 'done').length;
                const errorCount = this.files.filter(f => f.status === 'error').length;
                if (processingEl) processingEl.textContent = processingCount;
                if (doneEl) doneEl.textContent = doneCount;
                if (errorEl) errorEl.textContent = errorCount;

                const hasDone = this.files.some(f => f.status === 'done');
                dlBtn.disabled = !hasDone;

                this.files.forEach(f => {
                    const el = document.createElement('div');
                    el.className = 'file-item';
                    const thumb = document.createElement('img');
                    thumb.src = f.thumbnail;
                    thumb.className = 'thumb';

                    const info = document.createElement('div');
                    info.className = 'file-info';
                    const name = document.createElement('div');
                    name.className = 'filename';
                    name.textContent = f.file.name;
                    const status = document.createElement('span');
                    status.className = 'file-status';
                    if (f.status === 'processing') status.classList.add('processing');
                    if (f.status === 'done') status.classList.add('done');
                    if (f.status !== 'pending' && f.status !== 'processing' && f.status !== 'done') status.classList.add('error');
                    status.textContent = f.statusText || (f.status === 'pending' ? '等待中' : (f.status === 'processing' ? '处理中...' : (f.status === 'done' ? '完成' : '失败')));
                    const meta = document.createElement('div');
                    meta.className = 'file-meta';
                    const sizeKb = (f.originalSize / 1024).toFixed(1);
                    let metaText = `原始 ${sizeKb} KB`;
                    if (f.status === 'done' && f.svgContent) {
                        const outKb = (new Blob([f.svgContent]).size / 1024).toFixed(1);
                        metaText = `原始 ${sizeKb} KB · 输出 ${outKb} KB`;
                    }
                    meta.textContent = metaText;
                    const progressWrap = document.createElement('div');
                    progressWrap.className = 'file-progress';
                    const progressBar = document.createElement('div');
                    progressBar.className = 'file-progress-bar';
                    if (f.status === 'error') progressBar.classList.add('error');
                    const progressVal = Math.max(0, Math.min(100, f.progress || 0));
                    progressBar.style.width = `${progressVal}%`;
                    progressWrap.appendChild(progressBar);
                    const progressText = document.createElement('div');
                    progressText.className = 'file-progress-text';
                    progressText.textContent = f.status === 'error' ? '失败' : `${progressVal}%`;
                    info.appendChild(name);
                    info.appendChild(status);
                    info.appendChild(meta);
                    info.appendChild(progressWrap);
                    info.appendChild(progressText);

                    const actions = document.createElement('div');
                    actions.className = 'file-actions';
                    const btnPreview = document.createElement('button');
                    btnPreview.className = 'btn';
                    btnPreview.style.padding = '0.3rem 0.6rem';
                    btnPreview.textContent = '预览';
                    btnPreview.disabled = f.status !== 'done';
                    btnPreview.addEventListener('click', () => this.preview(f.id));
                    const btnDownload = document.createElement('button');
                    btnDownload.className = 'btn';
                    btnDownload.style.padding = '0.3rem 0.6rem';
                    btnDownload.innerHTML = (Ui.icon ? Ui.icon('download') : '');
                    btnDownload.setAttribute('aria-label', '下载');
                    btnDownload.disabled = f.status !== 'done';
                    btnDownload.addEventListener('click', () => this.download(f.id));
                    const btnRemove = document.createElement('button');
                    btnRemove.className = 'btn';
                    btnRemove.style.padding = '0.3rem 0.6rem';
                    btnRemove.style.color = 'var(--accent)';
                    btnRemove.textContent = '×';
                    btnRemove.addEventListener('click', () => this.remove(f.id));
                    actions.appendChild(btnPreview);
                    actions.appendChild(btnDownload);
                    actions.appendChild(btnRemove);

                    el.appendChild(thumb);
                    el.appendChild(info);
                    el.appendChild(actions);
                    listEl.appendChild(el);
                });
            },

            preview: function(id) {
                const f = this.files.find(f => f.id === id);
                if (!f || !f.svgContent) return;

                const previewOriginal = document.getElementById('preview-original');
                previewOriginal.innerHTML = '';
                const img = document.createElement('img');
                img.src = f.thumbnail;
                previewOriginal.appendChild(img);
                const previewSvg = document.getElementById('preview-svg');
                const safeSvg = (window.app && app.sanitizeSvg) ? app.sanitizeSvg(f.svgContent) : f.svgContent;
                previewSvg.innerHTML = safeSvg;
                
                const sizeKB = (new Blob([f.svgContent]).size / 1024).toFixed(2);
                document.getElementById('svg-size').textContent = sizeKB;

                document.getElementById('preview-modal').classList.add('show');
            },

            download: function(id) {
                const f = this.files.find(f => f.id === id);
                if (!f || !f.svgContent) return;
                
                const blob = new Blob([f.svgContent], {type: "image/svg+xml;charset=utf-8"});
                const fileName = f.file.name.replace(/\.[^/.]+$/, "") + ".svg";
                saveAs(blob, fileName);
            },

            downloadAll: function() {
                const zip = new JSZip();
                let count = 0;
                
                this.files.forEach(f => {
                    if (f.status === 'done' && f.svgContent) {
                        const fileName = f.file.name.replace(/\.[^/.]+$/, "") + ".svg";
                        zip.file(fileName, f.svgContent);
                        count++;
                    }
                });
                
                if (count === 0) return;
                
                zip.generateAsync({type:"blob"})
                .then(function(content) {
                    saveAs(content, "svg-vectors.zip");
                });
            },

            remove: function(id) {
                this.files = this.files.filter(f => f.id !== id);
                this.renderList();
            },

            clearAll: function() {
                this.files = [];
                this.renderList();
            }
        };

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            tracerTool.init();
        });
    

        // data-action registrations (replaces inline onclick=/oninput=/onchange=)
        if (window.app && app.action) {
            app.action('tracer.download-all', function () { tracerTool.downloadAll(); });
            app.action('tracer.process-all', function () { tracerTool.processAll(); });
            app.action('tracer.clear-all', function () { tracerTool.clearAll(); });
            app.action('tracer.close-preview', function () {
                document.getElementById('preview-modal').classList.remove('show');
            });
            app.action('tracer.sync-color-count', function (el) {
                document.getElementById('color-val').innerText = el.value;
            });
            app.action('tracer.sync-ltres', function (el) {
                document.getElementById('ltres-val').innerText = el.value;
            });
            app.action('tracer.sync-qtres', function (el) {
                document.getElementById('qtres-val').innerText = el.value;
            });
            app.action('tracer.toggle-blur', function (el) {
                document.getElementById('blur-control').style.display = el.checked ? 'block' : 'none';
            });
        }
    
