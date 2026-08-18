/* Extracted from obfuscator.html (refactor script). Tool logic. */

        const obfTool = {
            encrypt: function(type) {
                const code = document.getElementById('obf-input').value;
                if (!code) {
                    app.showToast('请先输入代码！', 'error');
                    return;
                }

                let script = '';
                try {
                    if (type === 'base64') {
                        const base64 = btoa(unescape(encodeURIComponent(code)));
                        script = `<script type="text/javascript">\ndocument.write(decodeURIComponent(escape(window.atob("${base64}"))));\n<\/script>`;
                    } else if (type === 'hex') {
                        let hex = '';
                        for (let i = 0; i < code.length; i++) {
                            hex += '%' + code.charCodeAt(i).toString(16).toUpperCase();
                        }
                        script = `<script type="text/javascript">\ndocument.write(unescape("${hex}"));\n<\/script>`;
                    } else if (type === 'unicode') {
                        let unicode = '';
                        for (let i = 0; i < code.length; i++) {
                            unicode += '\\u' + ('0000' + code.charCodeAt(i).toString(16)).slice(-4);
                        }
                        script = `<script type="text/javascript">\ndocument.write("${unicode}");\n<\/script>`;
                    } else if (type === 'ascii') {
                        let charCodes = [];
                        for (let i = 0; i < code.length; i++) {
                            charCodes.push(code.charCodeAt(i));
                        }
                        script = `<script type="text/javascript">\ndocument.write(String.fromCharCode(${charCodes.join(',')}));\n<\/script>`;
                    }
                    
                    document.getElementById('obf-output').value = script;
                    app.showToast('加密完成！');
                } catch (e) {
                    app.showToast('加密失败: ' + e.message, 'error');
                }
            }
        };

        // data-action registrations (replaces inline onclick=)
        if (window.app && app.action) {
            app.action('obf.encrypt', function (el) { obfTool.encrypt(el.dataset.algo); });
        }
    
