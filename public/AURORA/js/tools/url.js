/* Extracted from url.html (refactor script). Tool logic. */

        function parseUrl() {
            const input = document.getElementById('url-input');
            const status = document.getElementById('status');
            const resultArea = document.getElementById('result-area');
            const resultGrid = document.getElementById('result-grid');
            const querySection = document.getElementById('query-section');
            const queryBody = document.getElementById('query-body');
            
            let raw = input.value.trim();
            if (!raw) {
                resultArea.style.display = 'none';
                status.innerText = '请输入 URL';
                status.classList.remove('error');
                return;
            }

            if (document.getElementById('auto-protocol').checked && !/^https?:\/\//i.test(raw)) {
                raw = 'https://' + raw;
            }

            try {
                const url = new URL(raw);
                
                // Build Grid Items
                const items = [
                    { label: '协议 Protocol', val: url.protocol.replace(':', '') },
                    { label: '主机 Host', val: url.host },
                    { label: '路径 Path', val: url.pathname },
                    { label: '端口 Port', val: url.port || '80/443' },
                    { label: '查询字符串', val: url.search || '-' },
                    { label: '锚点 Hash', val: url.hash || '-' }
                ];

                resultGrid.innerHTML = items.map(item => `
                    <div class="result-item">
                        <strong>${item.label}</strong>
                        <div onclick="app.copyText('${item.val}')" title="点击复制" style="cursor:pointer">${item.val}</div>
                    </div>
                `).join('');

                // Query Params
                const params = Array.from(url.searchParams.entries());
                if (params.length > 0) {
                    queryBody.innerHTML = params.map(([k, v]) => `
                        <tr>
                            <td>${k}</td>
                            <td><div onclick="app.copyText('${v}')" title="点击复制" style="cursor:pointer">${v}</div></td>
                        </tr>
                    `).join('');
                    querySection.style.display = 'block';
                } else {
                    querySection.style.display = 'none';
                }

                resultArea.style.display = 'block';
                status.innerText = '解析成功';
                status.classList.remove('error');

            } catch (e) {
                resultArea.style.display = 'none';
                status.innerText = '无效的 URL 格式';
                status.classList.add('error');
            }
        }
        
        // Add copy helper if not in app.js
        if(!app.copyText) {
            app.copyText = function(text) {
                navigator.clipboard.writeText(text).then(() => {
                    app.showToast('已复制');
                });
            }
        }

        // Trigger on Enter
        document.getElementById('url-input').addEventListener('keypress', function(e) {
            if(e.key === 'Enter') parseUrl();
        });
    
// data-action registrations (replaces inline onclick=)
if (window.app && app.action) {
    app.action('url.reparse', function () {
        const input = document.getElementById('url-input');
        if (input) input.value = '';
        parseUrl();
    });
}