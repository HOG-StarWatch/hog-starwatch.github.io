/* Extracted from hash.html (refactor script). Tool logic. */

        const hashTool = {
            files: [],
            worker: null,
            rpc: null,
            workerFailed: false,
            useWasm: false,
            wasmAvailable: false,
            cryptoReady: null,
            
            init: function() {
                // Progressive Enhancement: Try to load Wasm
                app.showToast('正在初始化哈希引擎...', 'info');
                
                // Try ESM import first (cleaner), then fallback to UMD load
                this.loadWasmEngine().then(() => {
                    this.wasmAvailable = true;
                    this.useWasm = true;
                    this.updateBadge();
                    app.showToast('Wasm 引擎加载成功，性能已优化');
                }).catch((e) => {
                    console.warn('Wasm load failed, falling back to JS worker', e);
                    this.wasmAvailable = false;
                    this.useWasm = false;
                    this.updateBadge();
                    // Fallback to JS worker (existing logic)
                    this.initWorker();
                });
            },

            loadWasmEngine: async function() {
                try {
                    // Try ESM first
                    const module = await ResourceLoader.import('hash-wasm-esm');
                    // Attach to window for compatibility with existing code (or use module directly)
                    // hash-wasm ESM exports individual functions: createMD5, etc.
                    // We need to map them or attach to a global object expected by calcWasm
                    window.hashwasm = module; 
                    return;
                } catch(e) {
                    console.warn("ESM import failed, trying UMD load...");
                }

                // Fallback to UMD
                await ResourceLoader.loadDeps('hash-wasm');
                // UMD creates window.hashwasm
                if(!window.hashwasm) throw new Error("UMD load failed");
            },

            toggleEngine: function() {
                if (!this.wasmAvailable) {
                    app.showToast('Wasm 引擎不可用 (加载失败或不支持)', 'error');
                    return;
                }
                
                this.useWasm = !this.useWasm;
                this.updateBadge();
                app.showToast(`已切换至 ${this.useWasm ? 'Wasm' : 'JS'} 引擎`);
                
                // Re-calculate if we have input
                const input = document.getElementById('hash-input').value;
                if (input || this.files.length) {
                    this.calc();
                }
            },

            updateBadge: function() {
                const badge = document.getElementById('engine-badge');
                if (this.useWasm) {
                    badge.innerText = 'Engine: Wasm';
                    badge.style.background = '#10b981'; // Green
                } else {
                    badge.innerText = 'Engine: JS ' + (this.wasmAvailable ? '(Manual)' : '(Fallback)');
                    badge.style.background = this.wasmAvailable ? '#3b82f6' : '#f59e0b'; // Blue if manual switch, Orange if fallback
                }
            },

            initWorker: function() {
                if (!window.Worker) {
                    app.showToast('您的浏览器不支持 Web Worker', 'error');
                    return;
                }
                if (!window.WorkerRpc) {
                    app.showToast('WorkerRpc 组件缺失，已切换主线程', 'error');
                    this.workerFailed = true;
                    return;
                }
                try {
                    this.rpc = WorkerRpc.create('../js/workers/hash.worker.js');
                } catch (e) {
                    this.workerFailed = true;
                    this.rpc = null;
                    app.showToast('Worker 初始化失败，已切换主线程', 'error');
                }
            },

            calc: async function() {
                const input = document.getElementById('hash-input').value;
                const batchText = document.getElementById('hash-batch-text').checked;
                const textLines = batchText ? input.split(/\r?\n/).map(v => v.trim()).filter(Boolean) : [];
                if(!input && !this.files.length) return;
                
                this.setLoading(true);
                document.getElementById('hash-results').innerHTML = '';

                // Collect selected algos
                const algos = Array.from(document.querySelectorAll('.hash-algo:checked')).map(cb => cb.value);
                const tasks = [];
                if (this.files.length) {
                    this.files.forEach((file, idx) => {
                        tasks.push({
                            label: `文件 ${idx + 1}: ${file.name} (${file.size} bytes)`,
                            data: file.data,
                            isFile: true
                        });
                    });
                }
                if (input) {
                    if (batchText) {
                        textLines.forEach((line, idx) => {
                            tasks.push({
                                label: `文本 ${idx + 1}: ${line.length > 32 ? line.slice(0, 32) + '...' : line}`,
                                data: line,
                                isFile: false
                            });
                        });
                    } else {
                        tasks.push({
                            label: '文本',
                            data: input,
                            isFile: false
                        });
                    }
                }
                if (!tasks.length) {
                    this.setLoading(false);
                    return;
                }
                try {
                    if (this.useWasm) {
                        for (const task of tasks) {
                            const results = await this.calcWasmData(task.data, algos, task.isFile);
                            this.displayResults({ label: task.label, results: results });
                        }
                        this.setLoading(false);
                        app.showToast('计算完成');
                        return;
                    }
                    if (this.workerFailed || !window.Worker) {
                        for (const task of tasks) {
                            const results = await this.calcJsData(task.data, task.isFile, algos);
                            this.displayResults({ label: task.label, results: results });
                        }
                        this.setLoading(false);
                        app.showToast('计算完成');
                        return;
                    }
                    if (!this.rpc) this.initWorker();
                    if (!this.rpc) {
                        for (const task of tasks) {
                            const results = await this.calcJsData(task.data, task.isFile, algos);
                            this.displayResults({ label: task.label, results: results });
                        }
                        this.setLoading(false);
                        app.showToast('计算完成');
                        return;
                    }
                    for (const task of tasks) {
                        const results = await this.calcWorker(task.data, task.isFile, algos);
                        this.displayResults({ label: task.label, results: results });
                    }
                    this.setLoading(false);
                    app.showToast('计算完成');
                } catch (e) {
                    this.setLoading(false);
                    const msg = e && e.message ? e.message : String(e);
                    app.showToast('计算出错: ' + msg, 'error');
                }
            },
            ensureCryptoJs: function() {
                if (this.cryptoReady) return this.cryptoReady;
                this.cryptoReady = ResourceLoader.load('crypto-js');
                return this.cryptoReady;
            },
            calcJsData: async function(input, isFile, algos) {
                try {
                    await this.ensureCryptoJs();
                    if (typeof CryptoJS === 'undefined') {
                        throw new Error('CryptoJS 未加载');
                    }
                    const hmacKey = document.getElementById('hash-hmac-key').value;
                    let inputData;
                    if (isFile) {
                        inputData = CryptoJS.lib.WordArray.create(input);
                    } else {
                        inputData = input;
                    }
                    const results = {};
                    algos.forEach(algo => {
                        let hash;
                        if (algo.startsWith('Hmac')) {
                            hash = CryptoJS[algo](inputData, hmacKey);
                        } else {
                            hash = CryptoJS[algo](inputData);
                        }
                        results[algo] = hash.toString(CryptoJS.enc.Hex);
                    });
                    return results;
                } catch (e) {
                    throw e;
                }
            },

            calcWasmData: async function(input, algos, isFile) {
                const results = {};
                const data = isFile ? new Uint8Array(input) : input;
                
                // Map algos to hash-wasm functions
                // Note: hash-wasm uses createMD5(), createSHA256() etc.
                for (const algo of algos) {
                    let val = '';
                    try {
                        if (algo === 'MD5') val = await hashwasm.md5(data);
                        else if (algo === 'SHA1') val = await hashwasm.sha1(data);
                        else if (algo === 'SHA256') val = await hashwasm.sha256(data);
                        else if (algo === 'SHA512') val = await hashwasm.sha512(data);
                        else if (algo === 'RIPEMD160') val = "Wasm暂不支持RIPEMD160"; // Not in basic hash-wasm dist? check docs. actually it might be separate. skip for now.
                        else {
                            val = "Wasm模式暂仅支持基础哈希";
                        }
                    } catch (e) {
                        val = "Error";
                    }
                    results[algo] = val;
                }
                
                return results;
            },

            calcWorker: function(input, isFile, algos) {
                const hmacKey = document.getElementById('hash-hmac-key').value;
                return this.rpc.call({
                    data: input,
                    isFile: isFile,
                    algos: algos,
                    hmacKey: hmacKey
                }).then(d => d.results).catch((err) => {
                    // Worker failed → fall back to main-thread JS engine for next run
                    this.workerFailed = true;
                    this.worker = null;
                    this.rpc = null;
                    throw err;
                });
            },

            displayResults: function(payload) {
                const label = payload && payload.results ? payload.label : '结果';
                const results = payload && payload.results ? payload.results : payload;
                const container = document.getElementById('hash-results');
                if (window.Ui && Ui.appendResult) {
                    const rows = Object.entries(results).map(([algo, val]) => [algo + ':', val]);
                    return Ui.appendResult(container, { title: label, rows });
                }
                // Fallback (component missing): legacy rendering
                const card = document.createElement('div');
                card.className = 'result-card';
                const title = document.createElement('div');
                title.className = 'result-title';
                title.innerText = label;
                const grid = document.createElement('div');
                grid.className = 'result-grid';
                for (const [algo, val] of Object.entries(results)) {
                    const id = `hash-out-${algo}-${Math.random().toString(36).slice(2, 8)}`;
                    const div = document.createElement('div');
                    div.className = 'input-row';

                    const labelEl = document.createElement('label');
                    labelEl.style.width = '100px';
                    labelEl.textContent = algo + ':';

                    const input = document.createElement('input');
                    input.id = id;
                    input.type = 'text';
                    input.value = val;
                    input.readOnly = true;
                    input.style.flex = '1';

                    const btn = document.createElement('button');
                    btn.className = 'btn btn-icon';
                    btn.innerHTML = (window.Ui && Ui.icon) ? Ui.icon('copy') : '';
                    btn.setAttribute('aria-label', '复制');
                    btn.onclick = () => app.copy(id);

                    div.appendChild(labelEl);
                    div.appendChild(input);
                    div.appendChild(btn);
                    grid.appendChild(div);
                }
                card.appendChild(title);
                card.appendChild(grid);
                container.appendChild(card);
            },

            handleFile: function(input) {
                const files = Array.from(input.files || []);
                if (!files.length) return;
                Promise.all(files.map(file => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            resolve({
                                id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                                name: file.name,
                                size: file.size,
                                data: e.target.result
                            });
                        };
                        reader.onerror = () => reject();
                        reader.readAsArrayBuffer(file);
                    });
                })).then(items => {
                    this.files = this.files.concat(items);
                    this.renderFileList();
                    app.showToast('文件已加载，点击计算');
                }).catch(() => {
                    app.showToast('文件读取失败', 'error');
                });
            },
            clearFile: function() {
                this.files = [];
                const input = document.getElementById('file-input');
                if (input) input.value = '';
                const info = document.getElementById('file-info');
                if (info) info.style.display = 'none';
                const infoText = document.getElementById('file-info-text');
                if (infoText) infoText.innerText = '';
                const list = document.getElementById('file-list');
                if (list) {
                    list.innerHTML = '';
                    list.style.display = 'none';
                }
                app.showToast('文件已移除');
            },
            removeFile: function(id) {
                this.files = this.files.filter(f => f.id !== id);
                this.renderFileList();
            },
            renderFileList: function() {
                const info = document.getElementById('file-info');
                const infoText = document.getElementById('file-info-text');
                const list = document.getElementById('file-list');
                if (!this.files.length) {
                    if (info) info.style.display = 'none';
                    if (list) {
                        list.innerHTML = '';
                        list.style.display = 'none';
                    }
                    return;
                }
                if (infoText) infoText.innerText = `已加载 ${this.files.length} 个文件`;
                if (info) info.style.display = 'flex';
                if (list) {
                    list.innerHTML = '';
                    this.files.forEach(file => {
                        const item = document.createElement('div');
                        item.className = 'file-item';
                        const nameEl = document.createElement('span');
                        nameEl.textContent = `${file.name} (${file.size} bytes)`;
                        const btn = document.createElement('button');
                        btn.className = 'btn btn-secondary btn-sm';
                        btn.textContent = '移除';
                        btn.addEventListener('click', () => this.removeFile(file.id));
                        item.appendChild(nameEl);
                        item.appendChild(btn);
                        list.appendChild(item);
                    });
                    list.style.display = 'flex';
                }
            },

            setLoading: function(loading) {
                const btn = document.querySelector('.btn-primary');
                if(loading) {
                    btn.disabled = true;
                    btn.innerText = '计算中...';
                } else {
                    btn.disabled = false;
                    btn.innerText = '计算哈希';
                }
            }
        };
        
        // Auto init
        hashTool.init();

        // Add HMAC key toggle listener

        document.addEventListener('change', (e) => {
            if(e.target.classList.contains('hash-algo')) {
                const hmacSelected = Array.from(document.querySelectorAll('.hash-algo:checked'))
                                          .some(cb => cb.value.startsWith('Hmac'));
                document.getElementById('hash-key-row').style.display = hmacSelected ? 'flex' : 'none';
            }
        });

        // data-action registrations (replaces inline onclick=) + file input listener
        if (window.app && app.action) {
            app.action('hash.toggle-engine', function () { hashTool.toggleEngine(); });
            app.action('hash.clear-file', function () { hashTool.clearFile(); });
            app.action('hash.calc', function () { hashTool.calc(); });
        }
        (function () {
            const input = document.getElementById('file-input');
            if (input) input.addEventListener('change', function () { hashTool.handleFile(this); });
        })();
    
