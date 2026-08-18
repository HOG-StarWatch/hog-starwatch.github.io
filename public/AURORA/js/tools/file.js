/* Extracted from file.html (refactor script). Tool logic. */

        const fileTool = {
            files: [],
            corruptFileObj: null,
            
            switchSubTab: function(id, el) {
                document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
                el.classList.add('active');
                
                document.getElementById('file-zip-view').style.display = 'none';
                document.getElementById('file-corrupt-view').style.display = 'none';
                
                const view = document.getElementById(`file-${id}-view`);
                if (view) {
                    if(id === 'corrupt') {
                        view.style.display = 'flex';
                    } else {
                        view.style.display = 'block';
                    }
                }
            },

            handleFiles: function(fileList) {
                this.files = Array.from(fileList);
                this.updateUI();
            },

            updateUI: function() {
                const listEl = document.getElementById('file-list');
                const optsEl = document.getElementById('file-options');
                const dropEl = document.getElementById('drop-zone');
                
                if (this.files.length > 0) {
                    listEl.style.display = 'block';
                    optsEl.style.display = 'flex';
                    dropEl.style.display = 'none'; 
                    
                    listEl.innerHTML = '';
                    this.files.forEach((f, index) => {
                        const item = document.createElement('div');
                        item.style.cssText = 'display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid rgba(255,255,255,0.1); font-size:0.9rem;';
                        item.innerHTML = `
                            <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${f.name}</span>
                            <span style="color:var(--text-dim); margin-left:10px;">${(f.size/1024).toFixed(1)} KB</span>
                        `;
                        listEl.appendChild(item);
                    });
                } else {
                    listEl.style.display = 'none';
                    optsEl.style.display = 'none';
                    dropEl.style.display = 'block';
                }
            },

            createZip: async function() {
                if (this.files.length === 0) return;
                
                app.showToast('正在加载组件...', 'info');
                ResourceLoader.loadDeps('@file-export').then(async () => {
                    const btnText = document.getElementById('zip-btn-text');
                    const originalText = btnText.innerText;
                    btnText.innerText = "正在打包...";
                    
                    try {
                        const zip = new JSZip();
                        const levelMap = {
                            'STORE': { level: 0 },
                            'DEFLATE_1': { level: 1 },
                            'DEFLATE_5': { level: 5 },
                            'DEFLATE_9': { level: 9 }
                        };
                        
                        const levelKey = document.getElementById('zip-level').value;
                        const compression = levelKey === 'STORE' ? 'STORE' : 'DEFLATE';
                        const compressionOptions = levelKey === 'STORE' ? null : levelMap[levelKey];

                        // Add files
                        this.files.forEach(file => {
                            const path = file.webkitRelativePath || file.name;
                            zip.file(path, file);
                        });

                        const blob = await zip.generateAsync({
                            type: "blob",
                            compression: compression,
                            compressionOptions: compressionOptions
                        }, (metadata) => {
                            btnText.innerText = `打包中 ${metadata.percent.toFixed(0)}%`;
                        });

                        const filename = document.getElementById('zip-name').value || "archive.zip";
                        saveAs(blob, filename);
                        
                        app.showToast('打包完成，已开始下载');
                    } catch (e) {
                        app.showToast('打包失败: ' + e.message, 'error');
                        console.error(e);
                    } finally {
                        btnText.innerText = originalText;
                    }
                });
            },
            
            // --- File Corruptor Logic ---
            handleCorruptFile: function(file) {
                if(!file) return;
                this.corruptFileObj = file;
                document.getElementById('corrupt-drop-zone').style.display = 'none';
                document.getElementById('corrupt-settings').style.display = 'flex';
                document.getElementById('corrupt-file-name').innerText = file.name;
                document.getElementById('corrupt-file-size').innerText = (file.size / 1024).toFixed(2) + ' KB';
            },

            clearCorrupt: function() {
                this.corruptFileObj = null;
                document.getElementById('corrupt-drop-zone').style.display = 'block';
                document.getElementById('corrupt-settings').style.display = 'none';
                document.getElementById('corrupt-file-input').value = '';
            },

            execCorrupt: async function() {
                if(!this.corruptFileObj) return;
                
                const file = this.corruptFileObj;
                const mode = document.getElementById('corrupt-mode').value;
                const amount = parseInt(document.getElementById('corrupt-amount').value) / 100; // 0.01 - 1.0
                
                app.showToast('正在加载组件...', 'info');
                try {
                    await ResourceLoader.loadDeps('file-saver');
                } catch (e) {
                    app.showToast('组件加载失败', 'error');
                    return;
                }

                app.showToast('正在破坏文件...', 'info');

                try {
                    const buf = await file.arrayBuffer();
                    // Copy buffer to avoid modifying original (though arrayBuffer is new copy usually)
                    const bytes = new Uint8Array(buf); 
                    const len = bytes.length;
                    
                    if(mode === 'header') {
                        // Corrupt first 1KB or 10%
                        const limit = Math.min(len, 1024);
                        // Header corruption needs to be dense to be effective
                        for(let i=0; i<limit; i++) {
                            if(Math.random() < Math.max(0.1, amount)) { 
                                bytes[i] = Math.floor(Math.random() * 256);
                            }
                        }
                    } else if (mode === 'scramble') {
                        // Swap bytes randomly
                        const totalSwaps = Math.floor(len * amount);
                        for(let i=0; i<totalSwaps; i++) {
                            const idx1 = Math.floor(Math.random() * len);
                            const idx2 = Math.floor(Math.random() * len);
                            const temp = bytes[idx1];
                            bytes[idx1] = bytes[idx2];
                            bytes[idx2] = temp;
                        }
                    } else {
                        // Random or Zero
                        const totalDamage = Math.floor(len * amount);
                        for(let i=0; i<totalDamage; i++) {
                            const idx = Math.floor(Math.random() * len);
                            if(mode === 'zero') {
                                bytes[idx] = 0;
                            } else {
                                bytes[idx] = Math.floor(Math.random() * 256);
                            }
                        }
                    }
                    
                    const blob = new Blob([bytes], {type: file.type});
                    saveAs(blob, "corrupted_" + file.name);
                    app.showToast('文件已破坏并下载');
                } catch(e) {
                    app.showToast('处理失败: ' + e.message, 'error');
                    console.error(e);
                }
            }
        };

/* ============================================================
 * data-action registrations (refactor)
 * ============================================================ */
if (window.app && app.action) {

    app.action('fileTool.switchSubTab', function (el) {
        fileTool.switchSubTab(el.dataset.mode, el);
    });

    app.action('fileTool.handleFiles', function (el, evt) {
        fileTool.handleFiles(evt.target.files);
    });

    app.action('fileTool.createZip', function () {
        fileTool.createZip();
    });

    app.action('fileTool.clearCorrupt', function () {
        fileTool.clearCorrupt();
    });

    app.action('fileTool.handleCorruptFile', function (el, evt) {
        fileTool.handleCorruptFile(evt.target.files[0]);
    });

    app.action('fileTool.updateCorruptVal', function (el) {
        document.getElementById('corrupt-val').innerText = el.value + '%';
    });

    app.action('fileTool.execCorrupt', function () {
        fileTool.execCorrupt();
    });

}
    
