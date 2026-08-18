/* Extracted from encrypt.html (refactor script). Tool logic. */

        const cryptoTool = {
            subTab: 'std',
            
            switchSubTab: function(tab, el) {
                this.subTab = tab;
                document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
                el.classList.add('active');
                
                document.getElementById('crypto-std-config').style.display = 'none';
                document.getElementById('crypto-custom-config').style.display = 'none';
                document.getElementById('crypto-zerowidth-config').style.display = 'none';

                if(tab === 'std') {
                    document.getElementById('crypto-std-config').style.display = 'block';
                } else if(tab === 'custom') {
                    document.getElementById('crypto-custom-config').style.display = 'block';
                } else {
                    document.getElementById('crypto-zerowidth-config').style.display = 'block';
                }
            },
            
            updateCustomUI: function() {
                const mode = document.getElementById('custom-mode').value;
                if(mode === '16char') {
                    document.getElementById('custom-16-settings').style.display = 'block';
                    document.getElementById('custom-4-settings').style.display = 'none';
                    this.updatePreview('16');
                } else {
                    document.getElementById('custom-16-settings').style.display = 'none';
                    document.getElementById('custom-4-settings').style.display = 'block';
                    this.updatePreview('4');
                }
            },
            
            updatePreview: function(type) {
                const chars = document.getElementById(`custom-${type}-chars`).value;
                document.getElementById('custom-preview').innerText = `当前字符集: ${chars}`;
            },
            
            apply16Preset: function() {
                const presets = {
                    default: '0123456789abcdef',
                    orgasm: '齁哦啊嗯呃哈呜咿唔哼咕咯喔噢~X',
                    sound: '喵呜嗷喔嘎吼嗯啊唔哼呃呼哈!~X',
                    symbol: '!@#$%^&*()-_=+/*.',
                    custom: ''
                };
                const val = document.getElementById('custom-16-preset').value;
                if(val !== 'custom') {
                    document.getElementById('custom-16-chars').value = presets[val];
                    this.updatePreview('16');
                }
            },
            
            apply4Preset: function() {
                const presets = {
                    default: 'HOG~',
                    orgasm: '齁哦咿~',
                    letters: 'ABCD',
                    symbol: '!@#$',
                    custom: ''
                };
                const val = document.getElementById('custom-4-preset').value;
                if(val !== 'custom') {
                    document.getElementById('custom-4-chars').value = presets[val];
                    this.updatePreview('4');
                }
            },

            run: function(action) {
                const input = document.getElementById('crypto-input').value;
                if(!input) return;
                
                const libs = [];
                if(this.subTab === 'std') libs.push('crypto-js');
                else libs.push('lz-string'); // custom and zerowidth both use compression

                app.showToast('正在加载组件...', 'info');
                ResourceLoader.loadDeps(libs).then(() => {
                    let res = '';
                    
                    try {
                        if(this.subTab === 'std') {
                            // Standard Crypto using CryptoJS
                            // CryptoJS is guaranteed to be loaded here
                            const algo = document.getElementById('std-algo').value;
                            const key = document.getElementById('std-key').value;
                            
                            if(action === 'encrypt') {
                                res = CryptoJS[algo].encrypt(input, key).toString();
                            } else {
                                const bytes = CryptoJS[algo].decrypt(input, key);
                                res = bytes.toString(CryptoJS.enc.Utf8);
                                if(!res) throw new Error("解密失败，密钥错误或内容损坏");
                            }
                        } else if(this.subTab === 'custom') {
                            // Custom Crypto
                            const mode = document.getElementById('custom-mode').value;
                            if(mode === '16char') {
                                res = this.run16Char(action, input);
                            } else {
                                res = this.run4Char(action, input);
                            }
                        } else {
                            // Zero Width Crypto
                            res = this.runZeroWidth(action, input);
                        }
                    } catch(e) {
                        res = "错误: " + e.message;
                        app.showToast('操作失败', 'error');
                        console.error(e);
                    }
                    
                    document.getElementById('crypto-output').value = res;
                    app.showToast('操作完成');
                });
            },
            
            // 压缩辅助函数
            compress: function(str) {
                if(typeof LZString === 'undefined') return str;
                return LZString.compressToUint8Array(str);
            },
            
            decompress: function(uint8Array) {
                if(typeof LZString === 'undefined') return new TextDecoder().decode(uint8Array);
                const res = LZString.decompressFromUint8Array(uint8Array);
                return res || new TextDecoder().decode(uint8Array); // Fallback if not compressed
            },

            run16Char: function(action, input) {
                let charset = document.getElementById('custom-16-chars').value;
                if(new Set(charset).size !== 16) throw new Error("16字符集必须包含16个不重复字符");
                
                if(action === 'encrypt') {
                    // Compress first
                    const bytes = this.compress(input);
                    // If compress failed or not loaded, fallback to utf8
                    const data = bytes instanceof Uint8Array ? bytes : new TextEncoder().encode(input);
                    
                    let encoded = '';
                    for(let byte of data) {
                        encoded += charset[(byte >> 4) & 0x0F] + charset[byte & 0x0F];
                    }
                    return `#CE=${charset}\n${encoded}`;
                } else {
                    // Decrypt
                    if(input.startsWith('#CE=')) {
                        const idx = input.indexOf('\n');
                        if(idx > -1) {
                            charset = input.substring(4, idx);
                            input = input.substring(idx + 1);
                        }
                    }
                    if(input.length % 2 !== 0) throw new Error("无效的编码长度");
                    
                    const map = {};
                    for(let i=0; i < 16; i++) map[charset[i]] = i;
                    
                    const bytes = [];
                    for(let i=0; i < input.length; i+=2) {
                        const h = map[input[i]];
                        const l = map[input[i+1]];
                        if(h === undefined || l === undefined) throw new Error(`字符集中未找到字符: ${input[i]}${input[i+1]}`);
                        bytes.push((h << 4) | l);
                    }
                    
                    return this.decompress(new Uint8Array(bytes));
                }
            },
            
            run4Char: function(action, input) {
                let keys = document.getElementById('custom-4-chars').value;
                if(new Set(keys).size !== 4) throw new Error("4字符密钥必须包含4个不重复字符");
                
                // Map 00, 01, 10, 11
                const bitMap = [keys[0], keys[1], keys[2], keys[3]];
                
                if(action === 'encrypt') {
                    // Compress
                    const bytes = this.compress(input);
                    const data = bytes instanceof Uint8Array ? bytes : new TextEncoder().encode(input);

                    let res = '';
                    for(let byte of data) {
                        // 1 byte = 8 bits = 4 chars (2 bits per char)
                        res += bitMap[(byte >> 6) & 0x03];
                        res += bitMap[(byte >> 4) & 0x03];
                        res += bitMap[(byte >> 2) & 0x03];
                        res += bitMap[byte & 0x03];
                    }
                    return `${keys}|${res}`;
                } else {
                    if(input.includes('|')) {
                        const parts = input.split('|');
                        keys = parts[0];
                        input = parts[1];
                    }
                    
                    const revMap = {};
                    for(let i=0; i < 4; i++) revMap[keys[i]] = i;
                    
                    const bytes = [];
                    if(input.length % 4 !== 0) throw new Error("内容长度不匹配，可能损坏");
                    
                    for(let i=0; i < input.length; i+=4) {
                        let val = 0;
                        for(let j=0; j<4; j++) {
                            const char = input[i+j];
                            if(revMap[char] === undefined) throw new Error(`无效字符: ${char}`);
                            val = (val << 2) | revMap[char];
                        }
                        bytes.push(val);
                    }
                    
                    return this.decompress(new Uint8Array(bytes));
                }
            },

            runZeroWidth: function(action, input) {
                const zw = {
                    space: '\u200B', // Zero Width Space (0)
                    joiner: '\u200C' // Zero Width Non-Joiner (1)
                };
                
                if(action === 'encrypt') {
                    const cover = document.getElementById('zw-cover').value || "这是一个普通的文本。";
                    
                    // Always use LZString compression
                    if (typeof LZString === 'undefined') {
                        app.showToast('LZString 库加载失败，无法进行压缩加密', 'error');
                        return "加密失败";
                    }

                    const compressed = LZString.compressToUint8Array(input);
                    if (!compressed) return "压缩失败";

                    // Bytes -> Binary
                    let bin = '';
                    for(let i=0; i<compressed.length; i++) {
                        bin += compressed[i].toString(2).padStart(8, '0');
                    }
                    
                    let hidden = '';
                    for(let b of bin) {
                        hidden += (b === '0' ? zw.space : zw.joiner);
                    }
                    
                    // Insert hidden after first char of cover
                    if(cover.length > 0) {
                        return cover[0] + hidden + cover.slice(1);
                    } else {
                        return hidden;
                    }
                } else {
                    // Extract
                    let bin = '';
                    for(let char of input) {
                        if(char === zw.space) bin += '0';
                        else if(char === zw.joiner) bin += '1';
                    }
                    
                    if(!bin) return "未检测到隐写信息";

                    try {
                        const bytes = [];
                        // Process 8 bits at a time
                        for(let i=0; i<bin.length; i+=8) {
                            bytes.push(parseInt(bin.substr(i, 8), 2));
                        }
                        const uint8 = new Uint8Array(bytes);
                        const decompressed = LZString.decompressFromUint8Array(uint8);
                        if(decompressed) return decompressed;
                        return "解密失败：无法解压缩数据";
                    } catch(e) {
                        console.error(e);
                        return "解密出错";
                    }
                }
            }
        };
        
        // Init logic
        cryptoTool.updateCustomUI();

        // data-action registrations (replaces inline onclick=/onchange=)
        if (window.app && app.action) {
            app.action('crypto.switch-subtab', function (el) { cryptoTool.switchSubTab(el.dataset.tab, el); });
            app.action('crypto.update-custom-ui', function () { cryptoTool.updateCustomUI(); });
            app.action('crypto.apply-16-preset', function () { cryptoTool.apply16Preset(); });
            app.action('crypto.apply-4-preset', function () { cryptoTool.apply4Preset(); });
            app.action('crypto.run', function (el) { cryptoTool.run(el.dataset.mode); });
        }
    
