/* Extracted from diff.html (refactor script). Tool logic. */

        const diffTool = {
            mode: 'text',

            setMode: function(mode) {
                this.mode = mode;
                
                // Update Tabs
                document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
                document.getElementById('tab-' + mode).classList.add('active');
                
                // Update UI controls
                const showJsonBtns = mode === 'json' ? 'inline-flex' : 'none';
                document.getElementById('btn-fmt-old').style.display = showJsonBtns;
                document.getElementById('btn-fmt-new').style.display = showJsonBtns;
                
                // Clear output
                document.getElementById('diff-output').innerHTML = '';
                
                app.showToast('已切换至 ' + (mode === 'json' ? 'JSON 结构化对比' : '文本对比') + ' 模式');
            },

            formatJSON: function(id) {
                const el = document.getElementById(id);
                try {
                    const val = el.value.trim();
                    if (!val) return;
                    const obj = JSON.parse(val);
                    el.value = JSON.stringify(obj, null, 2);
                    app.showToast('格式化成功');
                } catch(e) {
                    app.showToast('JSON 格式错误: ' + e.message, 'error');
                }
            },

            compare: function() {
                if (this.mode === 'json') {
                    this.compareJSON();
                } else {
                    this.compareText();
                }
            },

            compareText: function() {
                const oldTxt = document.getElementById('diff-old').value;
                const newTxt = document.getElementById('diff-new').value;
                
                app.showToast('正在加载组件...', 'info');
                ResourceLoader.loadDeps('@diff').then(() => {
                    const dmp = new diff_match_patch();
                    const diffs = dmp.diff_main(oldTxt, newTxt);
                    dmp.diff_cleanupSemantic(diffs);
                    
                    // Custom pretty HTML generation
                    const html = [];
                    for (let x = 0; x < diffs.length; x++) {
                        const op = diffs[x][0];    // Operation (insert, delete, equal)
                        const data = diffs[x][1];  // Text of change
                        const text = data.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
                        
                        switch (op) {
                            case DIFF_INSERT:
                                html[x] = '<ins>' + text + '</ins>';
                                break;
                            case DIFF_DELETE:
                                html[x] = '<del>' + text + '</del>';
                                break;
                            case DIFF_EQUAL:
                                html[x] = '<span>' + text + '</span>';
                                break;
                        }
                    }
                    
                    document.getElementById('diff-output').innerHTML = html.join('');
                    app.showToast('对比完成');
                });
            },

            compareJSON: function() {
                const oldTxt = document.getElementById('diff-old').value;
                const newTxt = document.getElementById('diff-new').value;
                
                let oldObj, newObj;
                try {
                    oldObj = oldTxt ? JSON.parse(oldTxt) : undefined;
                } catch(e) {
                    return app.showToast('原文不是有效的 JSON', 'error');
                }
                
                try {
                    newObj = newTxt ? JSON.parse(newTxt) : undefined;
                } catch(e) {
                    return app.showToast('新文不是有效的 JSON', 'error');
                }

                app.showToast('正在加载组件...', 'info');
                ResourceLoader.loadDeps('@diff').then(() => {
                    const delta = jsondiffpatch.diff(oldObj, newObj);
                    
                    if (!delta) {
                        document.getElementById('diff-output').innerHTML = '<div style="padding:1rem; opacity:0.7;">没有发现差异 (No differences found)</div>';
                        app.showToast('对比完成: 无差异');
                        return;
                    }

                    // Render Diff
                    // Note: jsondiffpatch.formatters.html.format returns HTML string
                    // But we might need to load CSS if not loaded. (Handled in head)
                    const html = jsondiffpatch.formatters.html.format(delta, oldObj);
                    
                    // jsondiffpatch css requires a wrapper or global css. 
                    // We added CSS link in head.
                    document.getElementById('diff-output').innerHTML = html;
                    
                    // Enable visual interactions if needed (unhiding unchanged parts etc)
                    // jsondiffpatch.formatters.html.hideUnchanged() is a feature but requires JS to toggle classes
                    // We can stick to basic static view first.
                    
                    app.showToast('对比完成');
                }).catch(err => {
                    console.error(err);
                    app.showToast('加载组件失败', 'error');
                });
            },

            loadFile: function(input, targetId) {
                const file = input.files[0];
                if(!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    const buf = e.target.result;
                    const bytes = new Uint8Array(buf);
                    
                    // Check for null bytes to detect binary (heuristic)
                    let isBinary = false;
                    const checkLen = Math.min(bytes.length, 1000);
                    for(let i=0; i<checkLen; i++) {
                        if(bytes[i] === 0) {
                            isBinary = true;
                            break;
                        }
                    }
                    
                    if(isBinary) {
                        // Convert to Hex view for comparison
                        let hexOutput = '';
                        const len = bytes.length;
                        for(let i=0; i<len; i++) {
                            const b = bytes[i];
                            hexOutput += (b < 16 ? '0' : '') + b.toString(16);
                            // Add space every byte, newline every 16 bytes
                            if ((i + 1) % 16 === 0) {
                                hexOutput += '\n';
                            } else {
                                hexOutput += ' ';
                            }
                        }
                        
                        document.getElementById(targetId).value = hexOutput.trim();
                        app.showToast('检测到二进制文件，已转换为 Hex 视图', 'info');
                    } else {
                        // Decode as text
                        const decoder = new TextDecoder('utf-8');
                        const text = decoder.decode(bytes);
                        document.getElementById(targetId).value = text;
                        app.showToast('文件加载成功');
                    }
                };
                
                reader.onerror = () => app.showToast('读取文件失败', 'error');
                reader.readAsArrayBuffer(file);
                
                // Reset input
                input.value = '';
            }
        };

        // data-action registrations (replaces inline onclick=/onchange=)
        if (window.app && app.action) {
            app.action('diff.set-mode', function (el) { diffTool.setMode(el.dataset.mode); });
            app.action('diff.load-file', function (el) { diffTool.loadFile(el, el.dataset.target); });
            app.action('diff.format-json', function (el) { diffTool.formatJSON(el.dataset.target); });
            app.action('diff.clear-area', function (el) { document.getElementById(el.dataset.target).value = ''; });
            app.action('diff.compare', function () { diffTool.compare(); });
        }
    
