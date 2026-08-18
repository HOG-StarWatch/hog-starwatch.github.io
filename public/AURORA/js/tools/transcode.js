/* Extracted from transcode.html (refactor script). Tool logic. */

        const transcoder = {
            mode: 'url',

            setMode: function(m, el) {
                this.mode = m;
                document.querySelectorAll('.sub-tab').forEach(c => c.classList.remove('active'));
                el.classList.add('active');
                document.getElementById('current-mode-label').innerText = el.innerText;
            },

            run: function(action) {
                const input = document.getElementById('code-input').value;
                let res = '';

                try {
                    if (this.mode === 'url') {
                        res = action === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input);
                    } else if (this.mode === 'base64') {
                        if (action === 'encode') {
                            res = btoa(unescape(encodeURIComponent(input)));
                        } else {
                            res = decodeURIComponent(escape(atob(input)));
                        }
                    } else if (this.mode === 'unicode') {
                        if (action === 'encode') {
                            res = input.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('');
                        } else {
                            res = input.replace(/\\u[\dA-F]{4}/gi, match => String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16)));
                        }
                    } else if (this.mode === 'html') {
                        if (action === 'encode') {
                            res = input.replace(/[\u00A0-\u9999<>&]/g, i => '&#'+i.charCodeAt(0)+';');
                        } else {
                            const doc = new DOMParser().parseFromString(input, "text/html");
                            res = doc.documentElement.textContent;
                        }
                    } else if (this.mode === 'hex') {
                        if (action === 'encode') {
                            res = input.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
                        } else {
                            res = input.replace(/\s+/g, '').match(/.{1,2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
                        }
                    } else if (this.mode === 'bin') {
                        if (action === 'encode') {
                            res = input.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
                        } else {
                            res = input.replace(/\s+/g, '').match(/.{1,8}/g).map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
                        }
                    } else if (this.mode === 'punycode') {
                        app.showToast('正在加载组件...', 'info');
                        ResourceLoader.loadDeps('punycode').then(() => {
                            try {
                                if (action === 'encode') {
                                     res = punycode.toASCII(input);
                                } else {
                                    res = punycode.toUnicode(input);
                                }
                                document.getElementById('code-output').value = res;
                            } catch (e) {
                                document.getElementById('code-output').value = "错误: " + e.message;
                            }
                        });
                        return;
                    }
                } catch (e) {
                    res = "错误: " + e.message;
                    app.showToast('转换出错', 'error');
                }
                document.getElementById('code-output').value = res;
            },

            swap: function() {
                const inp = document.getElementById('code-input');
                const out = document.getElementById('code-output');
                [inp.value, out.value] = [out.value, inp.value];
            }
        };
    

        // data-action registrations (replaces inline onclick=)
        if (window.app && app.action) {
            app.action('transcoder.set-mode', function (el) {
                transcoder.setMode(el.dataset.mode, el);
            });
            app.action('transcoder.run', function (el) {
                transcoder.run(el.dataset.mode);
            });
            app.action('transcoder.swap', function () { transcoder.swap(); });
        }
    
