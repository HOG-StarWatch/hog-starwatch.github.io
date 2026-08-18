/* Extracted from format.html (refactor script). Tool logic. */

        const fmtTool = {
            format: function(type) {
                const input = document.getElementById('fmt-input').value;
                if (!input) return;

                const runFormat = () => {
                    let res = '';
                    try {
                        if (type === 'json') {
                            const obj = JSON.parse(input);
                            res = JSON.stringify(obj, null, 4);
                        } else if (type === 'html') {
                            res = html_beautify(input, { indent_size: 4 });
                        } else if (type === 'css') {
                            res = css_beautify(input, { indent_size: 4 });
                        } else if (type === 'js') {
                            res = js_beautify(input, { indent_size: 4 });
                        }
                        document.getElementById('fmt-output').value = res;
                        app.showToast('格式化完成');
                    } catch (e) {
                        app.showToast('格式化出错: ' + e.message, 'error');
                    }
                };

                if (['html', 'css', 'js'].includes(type)) {
                    app.showToast('正在加载资源...', 'info');
                    ResourceLoader.loadDeps('@beautify')
                        .then(() => runFormat())
                        .catch(err => app.showToast('资源加载失败: ' + err, 'error'));
                } else {
                    runFormat();
                }
            },
            minify: function(type) {
                const input = document.getElementById('fmt-input').value;
                let res = '';
                try {
                    if (type === 'json') {
                        const obj = JSON.parse(input);
                        res = JSON.stringify(obj);
                    } else if (type === 'xml') {
                         let xml = input.replace(/>\s*</g, '>\n<');
                         res = xml;
                    } else if (type === 'sql') {
                         res = input.replace(/\s+/g, ' ').replace(/\s*([,()])\s*/g, '$1 ').trim();
                    }
                     document.getElementById('fmt-output').value = res;
                } catch (e) {
                     app.showToast('处理出错: ' + e.message, 'error');
                }
            }
        };

/* ============================================================
 * data-action registrations (refactor)
 * ============================================================ */
if (window.app && app.action) {

    app.action('fmtTool.format', function (el) {
        fmtTool.format(el.dataset.mode);
    });

    app.action('fmtTool.minify', function (el) {
        fmtTool.minify(el.dataset.mode);
    });

}
    
