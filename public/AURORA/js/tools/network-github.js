/* Extracted from network-github.html (refactor script). Tool logic. */

        let currentMode = 'search';
        let markedLoaded = false;
        let currentRawContent = ''; // Store raw markdown
        let isRawView = false; // Toggle state

        // Init
        document.addEventListener('DOMContentLoaded', () => {
            // Load marked library
            ResourceLoader.loadDeps('marked').then(() => {
                markedLoaded = true;
                console.log('Marked library loaded');
            }).catch(err => console.error('Failed to load marked', err));

            document.getElementById('actionBtn').addEventListener('click', performAction);
            document.getElementById('dateRange').addEventListener('change', performAction);
            document.getElementById('searchInput').addEventListener('keypress', (e) => {
                if(e.key === 'Enter') performAction();
            });
        });

        function switchMode(mode) {
            currentMode = mode;
            document.getElementById('tab-search').className = `tab-btn ${mode === 'search' ? 'active' : ''}`;
            document.getElementById('tab-trending').className = `tab-btn ${mode === 'trending' ? 'active' : ''}`;
            
            const searchInput = document.getElementById('searchInput');
            const dateRange = document.getElementById('dateRange');
            const actionBtn = document.getElementById('actionBtn');

            if (mode === 'trending') {
                searchInput.disabled = true;
                searchInput.placeholder = "趋势模式下无需关键词";
                dateRange.disabled = false;
                actionBtn.textContent = "查看榜单";
                performAction();
            } else {
                searchInput.disabled = false;
                searchInput.placeholder = "React, Vue, AI...";
                dateRange.disabled = true;
                actionBtn.innerHTML = (Ui.icon ? Ui.icon('search') : '') + ' 开始搜索';
            }
        }

        async function performAction() {
            const listEl = document.getElementById('repo-list');
            listEl.innerHTML = '<div style="grid-column: 1/-1; display: flex; justify-content: center; padding: 50px;"><div class="loader"></div></div>';
            closePreview();

            try {
                const query = buildQuery();
                const sort = document.getElementById('sortSelect').value;
                const url = `https://api.github.com/search/repositories?q=${query}&sort=${sort}&order=desc&per_page=30`;

                const response = await fetch(url);
                if (!response.ok) {
                    const remaining = response.headers.get('x-ratelimit-remaining');
                    const reset = response.headers.get('x-ratelimit-reset');
                    if (response.status === 403 && remaining === '0') {
                        const resetTime = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : '';
                        listEl.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #ff4d4f;">已触发 GitHub 限流${resetTime ? '，预计恢复时间：' + resetTime : ''}</div>`;
                        return;
                    }
                    throw new Error(`API Error: ${response.status}`);
                }
                
                const data = await response.json();
                renderRepos(data.items);
                document.getElementById('result-count').textContent = `${data.total_count > 1000 ? '1000+' : data.total_count} 个项目`;
                document.getElementById('list-title').textContent = currentMode === 'search' ? `"${document.getElementById('searchInput').value}" 的结果` : "热门趋势";

            } catch (error) {
                const safeMsg = (window.app && app.escapeHtml) ? app.escapeHtml(error.message) : error.message;
                listEl.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #ff4d4f;">获取失败: ${safeMsg}</div>`;
            }
        }

        function buildQuery() {
            let q = [];
            
            if (currentMode === 'search') {
                const keyword = document.getElementById('searchInput').value.trim();
                if (keyword) q.push(keyword);
                else if (!document.getElementById('langSelect').value) q.push('stars:>1000'); // Default fallback
            } else {
                // Trending logic
                const range = document.getElementById('dateRange').value;
                const date = new Date();
                if (range === 'daily') date.setDate(date.getDate() - 1);
                else if (range === 'weekly') date.setDate(date.getDate() - 7);
                else if (range === 'monthly') date.setMonth(date.getMonth() - 1);
                
                const dateStr = date.toISOString().split('T')[0];
                q.push(`created:>${dateStr}`);
            }

            const lang = document.getElementById('langSelect').value;
            if (lang) q.push(`language:${lang}`);

            const minStars = document.getElementById('minStars').value;
            if (minStars) q.push(`stars:>${minStars}`);

            return q.join(' ');
        }

        function renderRepos(repos) {
            const listEl = document.getElementById('repo-list');
            listEl.innerHTML = '';

            if (!repos || repos.length === 0) {
                listEl.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-dim);">未找到相关项目</div>';
                return;
            }

            repos.forEach(repo => {
                const card = document.createElement('div');
                card.className = 'repo-card';
                card.onclick = () => showPreview(repo);
                
                // Color based on language (simple hash)
                let langColor = '#ccc';
                if (repo.language) {
                    const colors = { JavaScript: '#f1e05a', TypeScript: '#2b7489', Python: '#3572A5', Java: '#b07219', Go: '#00ADD8', Rust: '#dea584', Vue: '#41b883' };
                    langColor = colors[repo.language] || '#ccc';
                }

                const safeName = (window.app && app.escapeHtml) ? app.escapeHtml(repo.full_name) : repo.full_name;
                const safeDesc = (window.app && app.escapeHtml) ? app.escapeHtml(repo.description || '暂无描述') : (repo.description || '暂无描述');
                card.innerHTML = `
                    <div class="repo-header">
                        <div class="repo-name">${safeName}</div>
                        <div style="font-size: 0.8rem; color: var(--text-dim);">${new Date(repo.updated_at).toLocaleDateString()}</div>
                    </div>
                    <div class="repo-desc">${safeDesc}</div>
                    <div class="repo-meta">
                        <div class="meta-item" style="color: ${langColor}">
                            <span class="lang-dot" style="background: ${langColor}"></span>
                            ${repo.language || 'Unknown'}
                        </div>
                        <div class="meta-item">${Ui.icon ? Ui.icon('star') : ''} ${(repo.stargazers_count/1000).toFixed(1)}k</div>
                        <div class="meta-item">${Ui.icon ? Ui.icon('fork') : ''} ${repo.forks_count}</div>
                    </div>
                `;
                listEl.appendChild(card);
            });
        }

        async function showPreview(repo) {
            const panel = document.getElementById('preview-panel');
            const contentEl = document.getElementById('preview-content');
            const titleEl = document.getElementById('preview-title');
            const linkEl = document.getElementById('preview-link');
            const explorerLink = document.getElementById('repo-explorer-link');
            const github1sLink = document.getElementById('github1s-link');
            const toggleBtn = document.getElementById('toggle-view-btn');

            panel.classList.add('active');
            titleEl.textContent = repo.full_name;
            linkEl.href = repo.html_url;
            explorerLink.href = 'https://github-repo-explorer.pages.dev/?url=' + encodeURIComponent(repo.html_url);
            github1sLink.href = repo.html_url.replace('github.com', 'github1s.com');
            contentEl.innerHTML = '<div style="text-align: center; margin-top: 50px;"><div class="loader"></div><p>正在加载 README...</p></div>';
            
            // Reset toggle state
            isRawView = false;
            toggleBtn.textContent = '源码';
            toggleBtn.disabled = true;

            try {
                // Fetch Readme
                const response = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`);
                if (!response.ok) {
                    const remaining = response.headers.get('x-ratelimit-remaining');
                    const reset = response.headers.get('x-ratelimit-reset');
                    if (response.status === 403 && remaining === '0') {
                        const resetTime = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : '';
                        contentEl.innerHTML = `<div style="text-align: center; padding: 20px;">
                            <h3>已触发 GitHub 限流</h3>
                            <p>${resetTime ? '预计恢复时间：' + resetTime : '请稍后重试'}</p>
                            <p>请点击下方按钮直接访问 GitHub 查看</p>
                        </div>`;
                        toggleBtn.disabled = true;
                        return;
                    }
                    throw new Error('No README found');
                }
                
                const data = await response.json();
                // GitHub API returns Base64 encoded content
                // Need to handle UTF-8 properly
                const rawContent = decodeURIComponent(escape(window.atob(data.content.replace(/\n/g, ''))));
                
                currentRawContent = rawContent; // Save for toggle
                toggleBtn.disabled = false;

                renderPreviewContent();

            } catch (error) {
                const safeMsg = (window.app && app.escapeHtml) ? app.escapeHtml(error.message) : error.message;
                contentEl.innerHTML = `<div style="text-align: center; padding: 20px;">
                    <h3>无法加载预览</h3>
                    <p>${safeMsg}</p>
                    <p>请点击下方按钮直接访问 GitHub 查看</p>
                </div>`;
                toggleBtn.disabled = true;
            }
        }

        function toggleView() {
            if (!currentRawContent) return;
            isRawView = !isRawView;
            document.getElementById('toggle-view-btn').textContent = isRawView ? '预览' : '源码';
            renderPreviewContent();
        }

        function renderPreviewContent() {
            const contentEl = document.getElementById('preview-content');
            
            if (isRawView) {
                // Raw View
                contentEl.innerHTML = `<div class="source-view">${(window.app && app.escapeHtml) ? app.escapeHtml(currentRawContent) : escapeHtml(currentRawContent)}</div>`;
            } else {
                // Rendered View
                if (markedLoaded && window.marked) {
                    const rendered = window.marked.parse(currentRawContent);
                    const safeHtml = (window.app && app.sanitizeHtml) ? app.sanitizeHtml(rendered) : rendered;
                    contentEl.innerHTML = safeHtml;
                } else {
                    contentEl.innerHTML = `<div class="source-view">${(window.app && app.escapeHtml) ? app.escapeHtml(currentRawContent) : escapeHtml(currentRawContent)}</div>`;
                }
            }
        }

        function escapeHtml(text) {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function closePreview() {
            document.getElementById('preview-panel').classList.remove('active');
        }
    

        // data-action registrations (replaces inline onclick=)
        if (window.app && app.action) {
            app.action('switchMode', function (el) { switchMode(el.dataset.mode); });
            app.action('toggleView', function () { toggleView(); });
            app.action('closePreview', function () { closePreview(); });
        }
    
