/* Extracted from file-encoding.html (refactor script). Tool logic. */

        // Initialize dependencies
        ResourceLoader.loadDeps('file-saver').catch(e => console.error("Failed to load FileSaver", e));

        const fileEncTool = {
            b64Files: [], // Array of File objects
            rpc: null,
            currentChunkHandler: null,
            currentJsonBlob: null,
            
            initWorker: function() {
                if (this.rpc) return;
                if (!window.Worker || !window.WorkerRpc) return;
                this.rpc = WorkerRpc.create('../js/workers/file-enc.worker.js', {
                    onProgress: (d) => {
                        // stream messages (no requestId): chunks / status / warnings
                        if (d.type === 'chunk') {
                            if (this.currentChunkHandler) this.currentChunkHandler(d.data);
                        } else if (d.type === 'status') {
                            app.showToast(d.msg, 'info');
                        } else if (d.type === 'warning') {
                            app.showToast(d.msg, 'warning');
                        }
                    }
                });
            },

            runWorkerTask: function(action, payload, onChunk) {
                this.initWorker();
                if (!this.rpc) return Promise.reject(new Error('Worker 不可用'));
                this.currentChunkHandler = onChunk || null;
                return this.rpc.call({ action, payload }).then((d) => d.result)
                    .finally(() => { this.currentChunkHandler = null; });
            },

            switchSubTab: function(id, el) {
                document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
                el.classList.add('active');
                
                const inlineWs = document.getElementById('inline-workspace');
                inlineWs.style.display = 'flex';

                document.getElementById('file-b64enc-view').style.display = 'none';
                document.getElementById('file-b64dec-view').style.display = 'none';
                
                const view = document.getElementById(`file-${id}-view`);
                if (view) {
                    view.style.display = 'flex';
                }
            },
            
            // --- Base64 / JSON Features ---
            
            handleB64Files: function(files) {
                // Append new files to existing list
                const newFiles = Array.from(files);
                this.b64Files = [...this.b64Files, ...newFiles];
                
                this.updateFileListUI();
                app.showToast(`添加了 ${newFiles.length} 个文件`);
            },
            
            removeFile: function(index) {
                this.b64Files.splice(index, 1);
                this.updateFileListUI();
            },
            
            clearAllFiles: function() {
                this.b64Files = [];
                this.updateFileListUI();
                // Also reset input to allow re-selecting same file
                document.getElementById('file-input-hidden').value = '';
            },
            
            updateFileListUI: function() {
                const container = document.getElementById('file-list-widget');
                const dropZone = document.getElementById('drop-zone');
                const restoreDropZone = document.getElementById('restore-drop-zone');
                
                // Helper for DnD
                const setupDnD = (el, handler) => {
                    if(!el) return;
                    el.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        el.style.borderColor = 'var(--primary)';
                        el.style.background = 'rgba(255,255,255,0.05)';
                    });
                    el.addEventListener('dragleave', (e) => {
                        e.preventDefault();
                        el.style.borderColor = 'var(--border)';
                        el.style.background = 'rgba(0,0,0,0.1)';
                    });
                    el.addEventListener('drop', (e) => {
                        e.preventDefault();
                        el.style.borderColor = 'var(--border)';
                        el.style.background = 'rgba(0,0,0,0.1)';
                        if(e.dataTransfer.files.length > 0) {
                            handler(e.dataTransfer.files);
                        }
                    });
                };
                
                setupDnD(dropZone, (files) => this.handleB64Files(files));
                setupDnD(restoreDropZone, (files) => {
                    // Wrap single file in mock input object for existing loadJsonFile
                    this.loadJsonFile({files: files});
                });

                container.innerHTML = '';
                
                if (this.b64Files.length === 0) {
                    container.style.display = 'none';
                    return;
                }
                
                container.style.display = 'block';
                
                this.b64Files.forEach((file, index) => {
                    const div = document.createElement('div');
                    div.className = 'file-list-item';
                    div.innerHTML = `
                        <div class="file-info">
                            <span class="file-name" title="${file.name}">${file.name}</span>
                            <span class="file-meta">${(file.size / 1024).toFixed(1)} KB | ${file.type || 'Unknown'}</span>
                        </div>
                        <button class="remove-btn" onclick="fileEncTool.removeFile(${index})" title="移除文件" aria-label="删除">${Ui.icon ? Ui.icon('close') : ''}</button>
                    `;
                    container.appendChild(div);
                });
            },
            
            updateBadge: function(type, status) {
                const badge = document.getElementById(`badge-${type}`);
                if(!badge) return;
                
                badge.className = 'status-badge'; // Reset
                
                if(status === 'loading') {
                    badge.classList.add('loading');
                    badge.innerText = `${type.charAt(0).toUpperCase() + type.slice(1)}: 加载中...`;
                } else if (status === 'ready') {
                    badge.classList.add('ready');
                    badge.innerText = `${type.charAt(0).toUpperCase() + type.slice(1)}: 就绪`;
                } else if (status === 'error') {
                    badge.classList.add('error');
                    badge.innerText = `${type.charAt(0).toUpperCase() + type.slice(1)}: 错误`;
                } else {
                    badge.innerText = `${type.charAt(0).toUpperCase() + type.slice(1)}: 空闲`;
                }
            },

            encodeB64: async function() {
                if (this.b64Files.length === 0) {
                    app.showToast('请先选择文件', 'error');
                    return;
                }
                
                const compressFmt = document.getElementById('b64-compress').value;
                
                // Update badges
                if (compressFmt === 'brotli') this.updateBadge('brotli', 'loading');
                if (compressFmt === 'zstd') this.updateBadge('zstd', 'loading');

                app.showToast('正在处理...', 'info');
                document.getElementById('b64-out').value = '正在生成...';
                this.currentJsonBlob = null;
                
                try {
                    const chunks = [];
                    // Use streaming
                    await this.runWorkerTask('encode_stream', {
                        files: this.b64Files,
                        compressFmt
                    }, (chunk) => {
                        chunks.push(chunk);
                    });
                    
                    this.currentJsonBlob = new Blob(chunks, {type: 'application/json'});
                    
                    // Check size for preview (Limit 2MB)
                    if (this.currentJsonBlob.size < 2 * 1024 * 1024) {
                         const text = await this.currentJsonBlob.text();
                         document.getElementById('b64-out').value = text;
                    } else {
                         document.getElementById('b64-out').value = `[文件过大 (${(this.currentJsonBlob.size/1024/1024).toFixed(2)} MB) 无法预览，请直接下载]`;
                    }

                    app.showToast('生成成功');
                    
                    if (compressFmt === 'brotli') this.updateBadge('brotli', 'ready');
                    if (compressFmt === 'zstd') this.updateBadge('zstd', 'ready');
                } catch (e) {
                    console.error(e);
                    app.showToast('生成失败: ' + e.message, 'error');
                    document.getElementById('b64-out').value = '';
                    if (compressFmt === 'brotli') this.updateBadge('brotli', 'error');
                    if (compressFmt === 'zstd') this.updateBadge('zstd', 'error');
                }
            },
            
            downloadB64Json: function() {
                if (this.currentJsonBlob) {
                     saveAs(this.currentJsonBlob, `filebundle_${new Date().getTime()}.json`);
                     return;
                }
                const content = document.getElementById('b64-out').value;
                if(!content || content.startsWith('[文件过大')) {
                     if (!this.currentJsonBlob) app.showToast('无有效内容可下载', 'error');
                     return;
                }
                const blob = new Blob([content], {type: 'application/json'});
                saveAs(blob, `filebundle_${new Date().getTime()}.json`);
            },
            
            loadJsonFile: function(input) {
                const file = input.files[0];
                if(!file) return;
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('b64-in').value = e.target.result;
                    app.showToast('JSON 加载成功');
                };
                reader.readAsText(file);
            },
            
            restoreB64: async function() {
                const inputVal = document.getElementById('b64-in').value.trim();
                if(!inputVal) return;
                
                const listEl = document.getElementById('b64-restore-list');
                listEl.innerHTML = '';
                
                app.showToast('正在解析并还原...', 'info');
                
                try {
                    const results = await this.runWorkerTask('decode', {
                        jsonStr: inputVal
                    });
                    
                    for (const f of results) {
                        const blob = new Blob([f.data], {type: f.type});
                        const item = document.createElement('div');
                        item.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:8px; border-radius:4px; border:1px solid rgba(255,255,255,0.1);";
                        item.innerHTML = `
                            <div style="overflow:hidden; text-overflow:ellipsis;">
                                <div style="font-weight:bold">${f.name}</div>
                                <div style="font-size:0.8rem; color:var(--text-dim)">${(f.data.length/1024).toFixed(1)} KB | ${f.type || 'Unknown'}</div>
                            </div>
                        `;
                        
                        const btn = document.createElement('button');
                        btn.className = 'btn btn-sm btn-secondary';
                        btn.innerText = '下载';
                        btn.onclick = () => saveAs(blob, f.name);
                        
                        item.appendChild(btn);
                        listEl.appendChild(item);
                    }
                    app.showToast('还原完成');
                } catch(e) {
                    console.error(e);
                    app.showToast('还原失败: ' + e.message, 'error');
                }
            },
            
            downloadManual: function() {
                const b64 = document.getElementById('b64-in').value.trim();
                if(!b64) {
                    app.showToast('请先输入 Base64 数据', 'error');
                    return;
                }
                
                // Strip data: prefix if present
                const cleanB64 = b64.replace(/^data:.*?;base64,/, '');
                
                try {
                    const binString = atob(cleanB64);
                    const len = binString.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) {
                        bytes[i] = binString.charCodeAt(i);
                    }
                    
                    const mime = document.getElementById('manual-mime').value;
                    const name = document.getElementById('manual-name').value || 'download.bin';
                    
                    const blob = new Blob([bytes], {type: mime});
                    saveAs(blob, name);
                } catch(e) {
                    app.showToast('Base64 解码失败', 'error');
                }
            }
        };

/* ============================================================
 * data-action registrations (refactor)
 * ============================================================ */
if (window.app && app.action) {

    app.action('fileEncTool.switchSubTab', function (el) {
        fileEncTool.switchSubTab(el.dataset.mode, el);
    });

    app.action('fileEncTool.clearAllFiles', function () {
        fileEncTool.clearAllFiles();
    });

    app.action('fileEncTool.handleB64Files', function (el, evt) {
        fileEncTool.handleB64Files(evt.target.files);
    });

    app.action('fileEncTool.encodeB64', function () {
        fileEncTool.encodeB64();
    });

    app.action('fileEncTool.downloadB64Json', function () {
        fileEncTool.downloadB64Json();
    });

    app.action('fileEncTool.clearRestore', function () {
        document.getElementById('b64-in').value = '';
        document.getElementById('b64-restore-list').innerHTML = '';
    });

    app.action('fileEncTool.loadJsonFile', function (el, evt) {
        fileEncTool.loadJsonFile(evt.target);
    });

    app.action('fileEncTool.downloadManual', function () {
        fileEncTool.downloadManual();
    });

    app.action('fileEncTool.restoreB64', function () {
        fileEncTool.restoreB64();
    });

}
    
