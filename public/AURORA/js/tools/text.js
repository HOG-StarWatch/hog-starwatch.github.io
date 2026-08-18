/* Extracted from text.html (refactor script). Tool logic. */

        const textTool = {
            updateStats: function() {
                const val = document.getElementById('text-input').value;
                document.getElementById('stat-total').innerText = val.length;
                document.getElementById('stat-nospace').innerText = val.replace(/\s/g, '').length;
                document.getElementById('stat-words').innerText = (val.match(/[a-zA-Z]+/g) || []).length;
                document.getElementById('stat-cn').innerText = (val.match(/[\u4e00-\u9fa5]/g) || []).length;
                document.getElementById('stat-lines').innerText = val ? val.split(/\r\n|\r|\n/).length : 0;
            },

            process: function(action) {
                const input = document.getElementById('text-input').value;
                let res = input;

                switch(action) {
                    case 'upper': res = input.toUpperCase(); break;
                    case 'lower': res = input.toLowerCase(); break;
                    case 'title': res = input.replace(/\b\w/g, c => c.toUpperCase()); break;
                    case 'trim': res = input.trim(); break;
                    case 'nospace': res = input.replace(/\s+/g, ''); break;
                    case 'oneline': res = input.replace(/[\r\n]+/g, ' '); break;
                    case 'snake': res = input.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, '').replace(/\s+/g, '_'); break;
                    case 'camel': res = input.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()); break;
                    case 'dedupe': res = [...new Set(input.split('\n'))].join('\n'); break;
                    case 'sort': res = input.split('\n').sort().join('\n'); break;
                    case 'sc2tc':
                        app.showToast('正在加载组件...', 'info');
                        ResourceLoader.loadDeps('@opencc').then(() => {
                            const sc2tc = OpenCC.Converter({ from: 'cn', to: 'tw' });
                            const res = sc2tc(input);
                            document.getElementById('text-output').value = res;
                            document.getElementById('text-out-stat').innerText = `${res.length} 字符`;
                            app.showToast('转换完成');
                        });
                        return;
                    case 'tc2sc':
                        app.showToast('正在加载组件...', 'info');
                        ResourceLoader.loadDeps('@opencc').then(() => {
                            const tc2sc = OpenCC.Converter({ from: 'tw', to: 'cn' });
                            const res = tc2sc(input);
                            document.getElementById('text-output').value = res;
                            document.getElementById('text-out-stat').innerText = `${res.length} 字符`;
                            app.showToast('转换完成');
                        });
                        return;
                }

                document.getElementById('text-output').value = res;
                document.getElementById('text-out-stat').innerText = `${res.length} 字符`;
            }
        };

        // Init
        const txtInput = document.getElementById('text-input');
        if(txtInput) {
            txtInput.addEventListener('input', () => textTool.updateStats());
        }
    

        // data-action registrations (replaces inline onclick=)
        if (window.app && app.action) {
            app.action('text.clear', function () {
                app.clear('text');
                textTool.updateStats();
            });
            app.action('text.process', function (el) {
                textTool.process(el.dataset.mode);
            });
        }
    
