/* Extracted from generator.html (refactor script). Tool logic. */

        const genTool = {
            password: function() {
                const len = parseInt(document.getElementById('pwd-len').value);
                const useUpper = document.getElementById('pwd-upper').checked;
                const useLower = document.getElementById('pwd-lower').checked;
                const useNum = document.getElementById('pwd-num').checked;
                const useSym = document.getElementById('pwd-sym').checked;
                
                let chars = '';
                if(useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                if(useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
                if(useNum) chars += '0123456789';
                if(useSym) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
                
                if(!chars) {
                    app.showToast('请至少选择一种字符类型', 'error');
                    return;
                }
                
                let pwd = '';
                const array = new Uint32Array(len);
                window.crypto.getRandomValues(array);
                for(let i = 0; i < len; i++) {
                    pwd += chars[array[i] % chars.length];
                }
                document.getElementById('pwd-result').value = pwd;
                return pwd;
            },
            
            passwordBatch: function() {
                let res = [];
                for(let i=0; i<10; i++) {
                    res.push(this.password());
                }
                document.getElementById('pwd-batch').value = res.join('\n');
            },
            
            updateUuidUI: function() {
                const ver = document.getElementById('uuid-version').value;
                const nsGroup = document.getElementById('uuid-ns-group');
                if(ver === 'v3' || ver === 'v5') {
                    nsGroup.style.display = 'block';
                } else {
                    nsGroup.style.display = 'none';
                }
            },

            updateNsUI: function() {
                const type = document.getElementById('uuid-ns-type').value;
                const customRow = document.getElementById('uuid-ns-custom-row');
                const nsInput = document.getElementById('uuid-ns-custom');
                const nameInput = document.getElementById('uuid-name');
                
                if(type === 'custom') {
                    customRow.style.display = 'flex';
                    nsInput.placeholder = "输入合法的 UUID (例如: 6ba7b810-9dad-11d1-80b4-00c04fd430c8)";
                } else {
                    customRow.style.display = 'none';
                }

                if(type === 'url') nameInput.placeholder = "输入 URL (例如: https://example.com)";
                else if(type === 'dns') nameInput.placeholder = "输入 域名 (例如: example.com)";
                else if(type === 'oid') nameInput.placeholder = "输入 OID (例如: 1.3.6.1.4.1...)";
                else if(type === 'x500') nameInput.placeholder = "输入 X500 DN (例如: CN=John Doe, C=US)";
                else nameInput.placeholder = "输入用于哈希的名字...";
            },

            uuid: function() {
                const ver = document.getElementById('uuid-version').value;
                
                app.showToast('正在加载组件...', 'info');
                ResourceLoader.loadDeps('uuid').then(() => {
                    try {
                        let res = '';
                        // Extract generation logic to reuse or just call directly
                        // To keep it simple and fix duplication, we'll implement a helper inside or just duplicate the logic carefully
                        // Better: Extract helper _generate
                        res = this._generateUuid(ver);
                        document.getElementById('uuid-result').value = res;
                        app.showToast('生成成功');
                    } catch(e) {
                        app.showToast('错误: ' + e.message, 'error');
                    }
                });
            },

            _generateUuid: function(ver) {
                if(!ver) ver = document.getElementById('uuid-version').value;
                
                if(ver === 'v4') {
                    return uuid.v4();
                } else if(ver === 'v1') {
                    return uuid.v1();
                } else if(ver === 'v3' || ver === 'v5') {
                    const name = document.getElementById('uuid-name').value;
                    if(!name) throw new Error("请输入名字");
                    
                    let ns = uuid.URL; // default
                    const type = document.getElementById('uuid-ns-type').value;
                    if(type === 'dns') ns = uuid.DNS;
                    else if(type === 'oid') ns = uuid.OID;
                    else if(type === 'x500') ns = '6ba7b814-9dad-11d1-80b4-00c04fd430c8'; 
                    else if(type === 'custom') {
                        ns = document.getElementById('uuid-ns-custom').value;
                        if(!uuid.validate(ns)) throw new Error("无效的命名空间 UUID");
                    }
                    
                    return ver === 'v3' ? uuid.v3(name, ns) : uuid.v5(name, ns);
                }
                return '';
            },

            uuidBatch: function() {
                app.showToast('正在批量生成...', 'info');
                ResourceLoader.loadDeps('uuid').then(() => {
                    try {
                        let res = [];
                        const ver = document.getElementById('uuid-version').value;
                        for(let i = 0; i < 10; i++) {
                            res.push(this._generateUuid(ver));
                        }
                        document.getElementById('uuid-batch').value = res.join('\n');
                        app.showToast('批量生成完成');
                    } catch(e) {
                        app.showToast('错误: ' + e.message, 'error');
                    }
                });
            }
        };
    
// data-action registrations (replaces inline onclick=)
if (window.app && app.action) {
    app.action('gen.password', function () { genTool.password(); });
    app.action('gen.password-batch', function () { genTool.passwordBatch(); });
    app.action('gen.uuid', function () { genTool.uuid(); });
    app.action('gen.uuid-batch', function () { genTool.uuidBatch(); });
    app.action('gen.uuid-ui', function () { genTool.updateUuidUI(); });
    app.action('gen.ns-ui', function () { genTool.updateNsUI(); });
    app.action('gen.show-length', function (el) {
        const v = document.getElementById('pwd-len-val');
        if (v) v.innerText = el.value;
    });
}