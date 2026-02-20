const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const FETCH_TIMEOUT = 60000;
const CONFIG = {
    preloadCount: 2,
    preloadEnabled: true,
    cacheMaxAge: 7 * 24 * 60 * 60 * 1000,
    touchSwipeThreshold: 50,
    zoomMin: 0.5,
    zoomMax: 4,
    zoomStep: 0.25
};

let lastFailedUrl = null;

window.onerror = function(msg, url, line, col, error) {
    console.error('Global error:', msg, 'at', url, line, col);
    return false;
};

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled rejection:', event.reason);
});

function isOnline() {
    return navigator.onLine;
}

window.addEventListener('online', function() {
    showMinimaistMessage('网络已恢复', 'info');
});

window.addEventListener('offline', function() {
    showMinimaistMessage('网络已断开', 'error');
});

        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        function fetchWithTimeout(url, options = {}, timeout = FETCH_TIMEOUT) {
            return Promise.race([
                fetch(url, options),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('请求超时 (' + timeout/1000 + '秒)')), timeout)
                )
            ]);
        }

        function toggleFloatingMenu() {
            const content = document.getElementById('floatingMenuContent');
            const toggle = document.querySelector('.floating-menu-toggle');
            const miniPager = document.getElementById('miniPager');
            content.classList.remove('collapsed');
            toggle.style.display = 'none';
            miniPager.style.display = 'none';
        }

        function collapseMenu() {
            const content = document.getElementById('floatingMenuContent');
            const toggle = document.querySelector('.floating-menu-toggle');
            const miniPager = document.getElementById('miniPager');
            content.classList.add('collapsed');
            toggle.style.display = 'flex';
            miniPager.style.display = 'flex';
        }

        function toggleDetailsPanel() {
            const panel = document.getElementById('detailsPanel');
            if (panel) {
                panel.classList.toggle('show');
            }
        }

        function showMinimaistMessage(msg, type = 'info') {
            let toast = document.getElementById('minimalistToast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'minimalistToast';
                toast.className = 'message-toast';
                document.body.appendChild(toast);
            }
            toast.textContent = msg;
            toast.className = 'message-toast ' + type + ' show';
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2000);
        }

        function showMinimalistProgress(percent, loaded, total) {
            let bar = document.getElementById('minimalistProgress');
            if (!bar) {
                const container = document.createElement('div');
                container.className = 'preview-progress';
                container.innerHTML = '<div id="minimalistProgress" class="preview-progress-bar"></div>';
                document.body.appendChild(container);
                bar = document.getElementById('minimalistProgress');
            }
            bar.style.width = percent + '%';
            bar.parentElement.style.display = 'block';
            if (percent >= 100) {
                setTimeout(() => {
                    bar.parentElement.style.display = 'none';
                }, 500);
            }
        }

        function setFullscreenPreview(url) {
            const preview = document.getElementById('fullscreenPreview');
            const existingImg = preview.querySelector('img');
            const existingVideo = preview.querySelector('video');
            
            if (existingVideo) {
                existingVideo.pause();
                existingVideo.src = '';
                existingVideo.load();
                currentVideoElement = null;
            }
            
            if (existingImg && existingImg.src && existingImg.src.startsWith('blob:')) {
                URL.revokeObjectURL(existingImg.src);
                currentObjectUrls.delete(existingImg.src);
            }
            
            preview.innerHTML = '';
            if (url) {
                const img = document.createElement('img');
                img.src = url;
                img.style.cssText = 'object-fit:contain;width:100%;height:100%;';
                if (url.startsWith('blob:')) {
                    currentObjectUrls.add(url);
                }
                preview.appendChild(img);
            }
        }

        function showCopyToast(text) {
            const toast = document.getElementById('copyToast');
            toast.textContent = text;
            toast.className = 'copy-toast show';
            toast.onclick = function() {
                copyTextToClipboard(text);
            };
        }

        function copyTextToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                const toast = document.getElementById('copyToast');
                toast.textContent = '已复制';
                toast.className = 'copy-toast show copied';
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 1200);
            }).catch(err => {
                console.error('复制失败:', err);
            });
        }

        function copyConvertedLink() {
            const input = document.getElementById('urlInput').value.trim();
            if (!input) {
                showMinimaistMessage('请先输入链接', 'error');
                return;
            }

            let url = input;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }

            const proxyUrl = getProxyUrl();
            if (!proxyUrl) {
                showMinimaistMessage('请选择服务器', 'error');
                return;
            }

            const cleanProxyUrl = proxyUrl.replace(/\/+$/, '');
            let convertedUrl = url.replace(
                /i\.pximg\.net/g,
                cleanProxyUrl.replace(/^https?:\/\//, '')
            );

            if (convertedUrl === url) {
                showMinimaistMessage('非Pixiv链接', 'error');
                return;
            }

            originalUrl = url;
            replacedUrl = convertedUrl;
            copyTextToClipboard(convertedUrl);
        }

        let csvFilesConfig = [];
        let isOriginalSize = false;
        let originalUrl = '';
        let replacedUrl = '';
        let hasAccessedSecret = false; // 标记是否访问过
        let currentFunction = 'static'; // 当前功能：static或Another
        
        // Image Cache Manager
        class ImageCacheManager {
            constructor(maxSize = 50) {
                this.maxSize = maxSize;
                this.cacheName = 'pximg-cache-v1';
                this.initCache();
            }

            async initCache() {
                if ('caches' in window) {
                    this.cacheStorage = await caches.open(this.cacheName);
                }
            }

            async has(key) { 
                if (!this.cacheStorage) return false;
                const match = await this.cacheStorage.match(key);
                return !!match;
            }

            async get(key) {
                if (!this.cacheStorage) return undefined;
                const response = await this.cacheStorage.match(key);
                if (response) {
                    const blob = await response.blob();
                    return URL.createObjectURL(blob);
                }
                return undefined;
            }

            async set(key, value, size = 0) {
                
                if (!this.cacheStorage) return;

                try {
                    const blob = await fetch(value).then(r => r.blob());
                    const response = new Response(blob, {
                        headers: { 'Content-Type': blob.type }
                    });
                    await this.cacheStorage.put(key, response);
                    
                    this.enforceLimit();
                    
                    updateCacheDashboard();
                } catch (e) {
                    console.error('Cache set error:', e);
                }
            }
            
            async enforceLimit() {
                if (!this.cacheStorage) return;
                const keys = await this.cacheStorage.keys();
                if (keys.length > this.maxSize) {
                    const toDelete = keys.slice(0, keys.length - this.maxSize);
                    for (const request of toDelete) {
                        await this.cacheStorage.delete(request);
                    }
                }
            }
            
            async delete(key) {
                if (this.cacheStorage) {
                    await this.cacheStorage.delete(key);
                    updateCacheDashboard();
                }
            }
            
            async clear() {
                if (this.cacheStorage) {
                    const keys = await this.cacheStorage.keys();
                    for (const request of keys) {
                        await this.cacheStorage.delete(request);
                    }
                }
                updateCacheDashboard();
            }
            
            async getAll() {
                if (!this.cacheStorage) return [];
                const keys = await this.cacheStorage.keys();
                const items = [];
                
                for (let i = keys.length - 1; i >= 0; i--) {
                    const request = keys[i];
                    const response = await this.cacheStorage.match(request);
                    const blob = await response.blob();
                    items.push({
                        key: request.url,
                        size: blob.size,
                        blob: blob
                    });
                }
                return items;
            }
            
            async getSize() {
                if (!this.cacheStorage) return 0;
                const keys = await this.cacheStorage.keys();
                let total = 0;
                for (const req of keys) {
                    const res = await this.cacheStorage.match(req);
                    const blob = await res.blob();
                    total += blob.size;
                }
                return total;
            }
        }

        const imageCache = new ImageCacheManager(50);
        let currentFetchController = null;
        let lastClickTime = 0;
        let currentVideoElement = null;
        let currentObjectUrls = new Set();
        
        function openCacheDashboard() {
            updateCacheDashboard();
            document.getElementById('cacheModal').style.display = 'flex';
        }

        function closeCacheDashboard() {
            document.getElementById('cacheModal').style.display = 'none';
        }
        
        window.onclick = function(event) {
            const modal = document.getElementById('cacheModal');
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        async function updateCacheDashboard() {
            const list = document.getElementById('cacheList');
            const countEl = document.getElementById('cacheCount');
            const memEl = document.getElementById('cacheMemory');
            
            if (!list) return;
            
            const existingThumbs = list.querySelectorAll('.cache-thumb');
            existingThumbs.forEach(img => {
                if (img.src && img.src.startsWith('blob:')) {
                    URL.revokeObjectURL(img.src);
                    currentObjectUrls.delete(img.src);
                }
            });
            
            const items = await imageCache.getAll();
            const totalSize = await imageCache.getSize();
            
            countEl.textContent = items.length;
            memEl.textContent = (totalSize / 1024 / 1024).toFixed(2) + ' MB';
            
            list.innerHTML = '';
            if (items.length === 0) {
                list.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:#888; padding:20px;">暂无缓存数据</div>';
                return;
            }
            
            items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'cache-item';
                
                const sizeStr = (item.size / 1024).toFixed(1) + ' KB';
                const objectUrl = URL.createObjectURL(item.blob);
                currentObjectUrls.add(objectUrl);
                
                const img = document.createElement('img');
                img.src = objectUrl;
                img.className = 'cache-thumb';
                img.loading = 'lazy';
                img.alt = 'Cached Image';
                
                const cacheInfo = document.createElement('div');
                cacheInfo.className = 'cache-info';
                
                const cacheUrl = document.createElement('div');
                cacheUrl.className = 'cache-url';
                cacheUrl.title = item.key;
                cacheUrl.textContent = item.key.split('/').pop();
                
                const cacheSize = document.createElement('div');
                cacheSize.className = 'cache-size';
                cacheSize.textContent = sizeStr;
                
                const btnContainer = document.createElement('div');
                btnContainer.style.cssText = 'display:flex; gap:5px; margin-top:5px;';
                
                const downloadBtn = document.createElement('button');
                downloadBtn.style.cssText = 'flex:1; padding:4px; font-size:12px; background:#4b0082; margin:0;';
                downloadBtn.textContent = '\u2193';
                downloadBtn.onclick = function() {
                    downloadCacheItem(item.key);
                };
                
                const deleteBtn = document.createElement('button');
                deleteBtn.style.cssText = 'flex:1; padding:4px; font-size:12px; background:#ff4757; margin:0;';
                deleteBtn.textContent = '\u00d7';
                deleteBtn.onclick = function() {
                    deleteCacheItem(item.key);
                };
                
                btnContainer.appendChild(downloadBtn);
                btnContainer.appendChild(deleteBtn);
                
                cacheInfo.appendChild(cacheUrl);
                cacheInfo.appendChild(cacheSize);
                cacheInfo.appendChild(btnContainer);
                
                div.appendChild(img);
                div.appendChild(cacheInfo);
                list.appendChild(div);
            });
        }

        async function deleteCacheItem(key) {
            await imageCache.delete(key);
        }

        async function downloadCacheItem(key) {
            try {
                const blobUrl = await imageCache.get(key);
                if (blobUrl) {
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = key.split('/').pop() || 'image.jpg';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(blobUrl);
                }
            } catch (e) {
                console.error('Download failed:', e);
                alert('下载失败');
            }
        }

        async function clearCache() {
            if (confirm('确定要清空所有缓存图片吗？')) {
                await imageCache.clear();
            }
        }

        let galleryData = [];
        let galleryTags = new Set();
        let tagCountsMap = {};
        let isGalleryLoaded = false;

        function initCsvSelect(failed = false) {
            const select = document.getElementById('galleryCsvSelect');
            if (!select) return;
            select.innerHTML = '';
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = failed ? 'CSV文件数据加载失败' : '请选择CSV文件';
            placeholder.disabled = true;
            placeholder.selected = true;
            select.appendChild(placeholder);
            csvFilesConfig.forEach(file => {
                const option = document.createElement('option');
                option.value = file;
                option.textContent = file;
                select.appendChild(option);
            });
            const localOpt = document.createElement('option');
            localOpt.value = '__local__';
            localOpt.textContent = '选择本地CSV文件...';
            select.appendChild(localOpt);
            if (csvFilesConfig.length > 0) {
                select.value = csvFilesConfig[0];
            }
        }
        async function loadCsvConfig() {
            let failed = false;
            try {
                const resp = await fetch('csv.json');
                if (!resp.ok) throw new Error();
                const data = await resp.json();
                const files = Array.isArray(data) ? data : (Array.isArray(data.files) ? data.files : []);
                csvFilesConfig = files && files.length ? files : [];
            } catch (e) {
                csvFilesConfig = [];
                failed = true;
            }
            initCsvSelect(failed);
        }
        window.addEventListener('DOMContentLoaded', () => {
            loadCsvConfig();
        });

        function switchFunction(func) {
            currentFunction = func;
            
            document.getElementById('staticResourceBtn').classList.toggle('active', func === 'static');
            document.getElementById('AnotherBtn').classList.toggle('active', func === 'Another');
            
            document.getElementById('staticResourceSection').style.display = func === 'static' ? 'block' : 'none';
            document.getElementById('AnotherSection').style.display = func === 'Another' ? 'block' : 'none';
        }

        function checkSecretCode() {
            const input = document.getElementById('urlInput');
            const value = input.value.toLowerCase();
            const container = document.getElementById('quickAccessContainer');
            const btnProx = document.getElementById('quickAccessBtn');
            const btnGallery = document.getElementById('galleryBtn');
            const btnRandom = document.getElementById('quickRandomBtn');
            
            if (value === 'prox') {
                input.value = '';
                hasAccessedSecret = true;
                container.style.display = 'flex';
                btnProx.style.display = 'flex';
                btnGallery.style.display = 'none';
                btnRandom.style.display = 'none';
                openSecretSettings();
            } else if (value === 'random') {
                input.value = '';
                hasAccessedSecret = true;
                container.style.display = 'flex';
                btnProx.style.display = 'none';
                btnGallery.style.display = 'flex';
                btnRandom.style.display = 'flex';
                openGalleryBrowser();
            }
        }

        function fillUrl(url, itemData = null) {
            const input = document.getElementById('urlInput');
            input.value = url;
            
            const detailsPanel = document.getElementById('detailsPanel');
            const detailsGridMinimal = document.getElementById('detailsGridMinimal');
            const toggleBtn = document.getElementById('toggleDetailsBtn');
            
            if (itemData && detailsGridMinimal) {
                detailsGridMinimal.innerHTML = '';
                
                for (const [key, value] of Object.entries(itemData)) {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'detail-item';
                    if (key.toLowerCase().includes('description') || key.toLowerCase().includes('tag')) {
                        itemDiv.style.gridColumn = '1 / -1';
                    }

                    const labelSpan = document.createElement('span');
                    labelSpan.className = 'detail-label';
                    labelSpan.textContent = key;
                    
                    const valueDiv = document.createElement('div');
                    valueDiv.className = 'detail-value';

                    if (key === 'tags_transl' && value) {
                        value.split(',').forEach(tag => {
                            const span = document.createElement('span');
                            span.className = 'tag-pill';
                            span.textContent = tag.trim();
                            valueDiv.appendChild(span);
                        });
                    } else {
                        valueDiv.textContent = value;
                    }

                    itemDiv.append(labelSpan, valueDiv);
                    detailsGridMinimal.appendChild(itemDiv);
                }

                if (detailsPanel) detailsPanel.classList.add('show');
                if (toggleBtn) toggleBtn.classList.add('visible');
            } else {
                if (detailsPanel) detailsPanel.classList.remove('show');
                if (toggleBtn) toggleBtn.classList.remove('visible');
            }
        }

        function parseCSV(text) {
            const lines = [];
            let row = [];
            let inQuote = false;
            let currentValue = '';
            
            if (text.charCodeAt(0) === 0xFEFF) {
                text = text.slice(1);
            }

            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const nextChar = text[i + 1];

                if (char === '"') {
                    if (inQuote && nextChar === '"') {
                        currentValue += '"';
                        i++; 
                    } else {
                        inQuote = !inQuote;
                    }
                } else if (char === ',' && !inQuote) {
                    row.push(currentValue);
                    currentValue = '';
                } else if ((char === '\r' || char === '\n') && !inQuote) {
                    if (currentValue || row.length > 0) {
                        row.push(currentValue);
                        lines.push(row);
                        row = [];
                        currentValue = '';
                    }
                    if (char === '\r' && nextChar === '\n') i++;
                } else {
                    currentValue += char;
                }
            }
            if (currentValue || row.length > 0) {
                row.push(currentValue);
                lines.push(row);
            }
            
            if (lines.length < 2) return [];
            
            const headers = lines[0].map(h => h.trim());
            return lines.slice(1).map(line => {
                const obj = {};
                headers.forEach((h, i) => {
                    obj[h] = line[i] || '';
                });
                return obj;
            });
        }

        // --- Gallery Browser Functions ---
        function openGalleryBrowser() {
            document.getElementById('galleryBrowser').style.display = 'flex';
            if (!isGalleryLoaded) {
                loadGalleryData();
            }
        }

        function pickRandomImage() {
            if (galleryData.length === 0) {
                alert('请先加载数据！');
                return;
            }
            
            const randomIndex = Math.floor(Math.random() * galleryData.length);
            const item = galleryData[randomIndex];
            
            const useThumb = document.getElementById('useThumbCheckbox') && document.getElementById('useThumbCheckbox').checked;
            
            fillUrl(useThumb ? (item.thumb || item.original) : item.original, item);
            closeGalleryBrowser();
            
            processLink();
        }

        function closeGalleryBrowser() {
            document.getElementById('galleryBrowser').style.display = 'none';
        }
        
        function debounce(fn, delay = 300) {
            let timer = null;
            return (...args) => {
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => fn(...args), delay);
            };
        }

        async function loadGalleryData() {
            const loading = document.getElementById('galleryLoading');
            const status = document.getElementById('galleryStatus');
            const selectedFile = document.getElementById('galleryCsvSelect').value;
            
            if (!selectedFile) {
                status.textContent = '请选择一个CSV文件';
                return;
            }

            if (selectedFile === '__local__') {
                const input = document.getElementById('localCsvInput');
                if (!input) return;
                const newInput = input.cloneNode(true);
                input.parentNode.replaceChild(newInput, input);
                newInput.addEventListener('change', async () => {
                    const file = newInput.files && newInput.files[0];
                    if (!file) {
                        status.textContent = '未选择本地CSV文件';
                        loading.style.display = 'none';
                        return;
                    }
                    loading.style.display = 'block';
                    status.textContent = '正在从本地加载: ' + file.name;
                    try {
                        const text = await file.text();
                        galleryData = parseCSV(text);
                        const tagCounts = {};
                        galleryData.forEach(item => {
                            if (item.tags_transl) {
                                item.tags_transl.split(',').forEach(t => {
                                    const tag = t.trim();
                                    if (tag) {
                                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                                    }
                                });
                            }
                        });
                        tagCountsMap = tagCounts;
                        const includePanel = document.getElementById('tagIncludePanel');
                        const excludePanel = document.getElementById('tagExcludePanel');
                        includePanel.innerHTML = '';
                        excludePanel.innerHTML = '';
                        Object.keys(tagCounts)
                            .sort((a, b) => {
                                const diff = tagCounts[b] - tagCounts[a];
                                if (diff !== 0) return diff;
                                return a.localeCompare(b, 'zh-CN');
                            })
                            .forEach(tag => {
                                const inc = document.createElement('div');
                                inc.className = 'tag-item';
                                inc.dataset.value = tag;
                                inc.textContent = tag + ' (' + tagCounts[tag] + ')';
                                includePanel.appendChild(inc);
                                const exc = document.createElement('div');
                                exc.className = 'tag-item';
                                exc.dataset.value = tag;
                                exc.textContent = tag + ' (' + tagCounts[tag] + ')';
                                excludePanel.appendChild(exc);
                            });
                        isGalleryLoaded = true;
                        status.textContent = '加载成功: ' + file.name + ' (共 ' + galleryData.length + ' 条数据)';
                        renderGalleryTable();
                    } catch (err) {
                        console.error(err);
                        status.textContent = '加载失败: ' + err.message;
                    } finally {
                        loading.style.display = 'none';
                        newInput.value = '';
                    }
                });
                newInput.click();
                return;
            }

            loading.style.display = 'block';
            status.textContent = '正在尝试加载数据...';
            
            try {
                const response = await fetchWithTimeout(selectedFile, {}, FETCH_TIMEOUT);
                if (!response.ok) {
                    throw new Error('HTTP error! status: ' + response.status);
                }
                const text = await response.text();
                galleryData = parseCSV(text);
                
                const tagCounts = {};
                galleryData.forEach(item => {
                    if (item.tags_transl) {
                        item.tags_transl.split(',').forEach(t => {
                            const tag = t.trim();
                            if (tag) {
                                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                            }
                        });
                    }
                });
                tagCountsMap = tagCounts;
                
                const includePanel = document.getElementById('tagIncludePanel');
                const excludePanel = document.getElementById('tagExcludePanel');
                includePanel.innerHTML = '';
                excludePanel.innerHTML = '';
                
                Object.keys(tagCounts)
                    .sort((a, b) => {
                        const diff = tagCounts[b] - tagCounts[a];
                        if (diff !== 0) return diff;
                        return a.localeCompare(b, 'zh-CN');
                    })
                    .forEach(tag => {
                        const inc = document.createElement('div');
                        inc.className = 'tag-item';
                        inc.dataset.value = tag;
                        inc.textContent = `${tag} (${tagCounts[tag]})`;
                        includePanel.appendChild(inc);
                        const exc = document.createElement('div');
                        exc.className = 'tag-item';
                        exc.dataset.value = tag;
                        exc.textContent = `${tag} (${tagCounts[tag]})`;
                        excludePanel.appendChild(exc);
                    });

                isGalleryLoaded = true;
                status.textContent = `加载成功: ${selectedFile} (共 ${galleryData.length} 条数据)`;
                renderGalleryTable();
            } catch (err) {
                console.error(err);
                status.textContent = `加载失败: ${err.message} (请确保 ${selectedFile} 存在)`;
            } finally {
                loading.style.display = 'none';
            }
        }

        let currentPage = 1;
        let perPage = 50;
        function updatePaginationUI(totalFiltered, totalPages) {
            const info = document.getElementById('pageInfo');
            const input = document.getElementById('pageInput');
            if (info) info.textContent = `第 ${currentPage} / ${totalPages} 页`;
            if (input) {
                input.max = Math.max(1, totalPages);
                input.value = currentPage;
            }
            const prevBtn = document.getElementById('prevPageBtn');
            const nextBtn = document.getElementById('nextPageBtn');
            if (prevBtn) prevBtn.disabled = currentPage <= 1;
            if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
        }
        function prevPage() {
            if (currentPage > 1) {
                currentPage--;
                renderGalleryTable();
            }
        }
        function nextPage() {
            currentPage++;
            renderGalleryTable();
        }
        function goToPage(p) {
            const total = Math.max(1, Math.ceil(galleryData.length / perPage));
            currentPage = Math.min(Math.max(1, parseInt(p, 10) || 1), total);
            renderGalleryTable();
        }
        
        function renderGalleryTable() {
            const tbody = document.getElementById('galleryTableBody');
            const status = document.getElementById('galleryStatus');
            tbody.innerHTML = '';
            
            const tStart = performance.now();
                const searchText = document.getElementById('gallerySearch').value.toLowerCase();
                const sortMode = document.getElementById('gallerySort').value;
                const includeTags = Array.from(document.querySelectorAll('#tagIncludePanel .tag-item.selected')).map(el => el.dataset.value);
                const excludeTags = Array.from(document.querySelectorAll('#tagExcludePanel .tag-item.selected')).map(el => el.dataset.value);
                const filterAi = document.getElementById('galleryAiFilter').value;
            const dateFormatEl = document.getElementById('galleryDateFormat');
            const dateFormat = dateFormatEl ? dateFormatEl.value : 'raw';
            
            let items = galleryData.filter(item => {
                const matchSearch = !searchText || 
                    (item.title || '').toLowerCase().includes(searchText) || 
                    (item.description || '').toLowerCase().includes(searchText) || 
                    (item.id || '').toLowerCase().includes(searchText);
                
                const tagArr = (item.tags_transl || '').split(',').map(t => t.trim()).filter(Boolean);
                const matchTagInclude = includeTags.length === 0 || includeTags.some(t => tagArr.includes(t));
                const matchTagExclude = excludeTags.length === 0 || excludeTags.every(t => !tagArr.includes(t));
                const matchTag = matchTagInclude && matchTagExclude;
                
                const matchAi = !filterAi || (item.AI || '').toUpperCase() === filterAi;

                return matchSearch && matchTag && matchAi;
            });
            
            items.sort((a, b) => {
                const dA = Date.parse(a.date || '') || 0;
                const dB = Date.parse(b.date || '') || 0;
                switch (sortMode) {
                    case 'newest': return dB - dA;
                    case 'oldest': return dA - dB;
                    case 'id_desc': return parseInt(b.id || 0) - parseInt(a.id || 0);
                    case 'id_asc': return parseInt(a.id || 0) - parseInt(b.id || 0);
                    case 'view_desc': return parseInt(b.viewCount || 0) - parseInt(a.viewCount || 0);
                    case 'like_desc': return parseInt(b.likeCount || 0) - parseInt(a.likeCount || 0);
                    default: return 0;
                }
            });
            
            const totalFiltered = items.length;
            const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage));
            if (currentPage > totalPages) currentPage = totalPages;
            const startIndex = (currentPage - 1) * perPage;
            const endIndex = startIndex + perPage;
            const pageItems = items.slice(startIndex, endIndex);
            updatePaginationUI(totalFiltered, totalPages);
            
            status.textContent = `显示 ${pageItems.length} / ${totalFiltered} 条数据 (总计 ${galleryData.length})`;
            
            const frag = document.createDocumentFragment();
            pageItems.forEach(item => {
                const tr = document.createElement('tr');
                tr.className = 'gallery-row';
                
                const tdAction = document.createElement('td');
                tdAction.className = 'action-col cell-action';

                const btnOriginal = document.createElement('button');
                btnOriginal.textContent = '填入链接';
                btnOriginal.className = 'fill-url-btn action-btn';
                btnOriginal.onclick = () => {
                    const useThumb = document.getElementById('useThumbCheckbox') && document.getElementById('useThumbCheckbox').checked;
                    fillUrl(useThumb ? (item.thumb || item.original) : item.original, item);
                    closeGalleryBrowser();
                };
                tdAction.appendChild(btnOriginal);
                tr.appendChild(tdAction);

                const tdId = document.createElement('td');
                tdId.textContent = item.id;
                tdId.className = 'cell-id';
                tr.appendChild(tdId);
                
                const tdTitle = document.createElement('td');
                tdTitle.textContent = item.title;
                tdTitle.className = 'cell-title';
                tdTitle.title = item.title;
                tr.appendChild(tdTitle);
                
                const tdDesc = document.createElement('td');
                tdDesc.textContent = item.description;
                tdDesc.className = 'cell-desc';
                tdDesc.title = item.description;
                tr.appendChild(tdDesc);
                
                const tdFile = document.createElement('td');
                tdFile.textContent = item.fileName || '';
                tdFile.className = 'cell-file';
                tr.appendChild(tdFile);
                
                const tdTags = document.createElement('td');
                tdTags.className = 'cell-tags';
                if (item.tags_transl) {
                    const tags = item.tags_transl.split(',').map(x => x.trim()).filter(Boolean);
                    const threshold = 3;
                    const spans = [];
                    tags.forEach((t, idx) => {
                        const span = document.createElement('span');
                        span.className = 'tag-pill';
                        if (idx >= threshold) span.style.display = 'none';
                        span.textContent = t;
                        tdTags.appendChild(span);
                        spans.push(span);
                    });
                    if (tags.length > threshold) {
                        const btn = document.createElement('button');
                        btn.className = 'tag-toggle';
                        btn.textContent = '展开';
                        btn.setAttribute('data-expanded', '0');
                        btn.onclick = () => {
                            const expanded = btn.getAttribute('data-expanded') === '1';
                            if (expanded) {
                                spans.forEach((s, idx) => { if (idx >= threshold) s.style.display = 'none'; });
                                btn.textContent = '展开';
                                btn.setAttribute('data-expanded', '0');
                            } else {
                                spans.forEach(s => { s.style.display = 'inline-block'; });
                                btn.textContent = '收起';
                                btn.setAttribute('data-expanded', '1');
                            }
                        };
                        tdTags.appendChild(btn);
                    }
                }
                tr.appendChild(tdTags);

                const tdPage = document.createElement('td');
                tdPage.className = 'cell-meta';
                const pageSpan = document.createElement('span');
                pageSpan.className = 'meta-pill';
                pageSpan.textContent = `页码: ${item.page || '-'}`;
                pageSpan.style.border = '1px solid #ff6b6b';
                pageSpan.style.color = '#ff6b6b';
                tdPage.appendChild(pageSpan);
                tr.appendChild(tdPage);

                const tdRestrict = document.createElement('td');
                tdRestrict.className = 'cell-meta';
                const rSpan = document.createElement('span');
                rSpan.className = 'meta-pill';
                rSpan.textContent = `限制级: ${item.xRestrict || '0'}`;
                tdRestrict.appendChild(rSpan);
                tr.appendChild(tdRestrict);

                const tdDate = document.createElement('td');
                tdDate.textContent = dateFormat === 'local' && item.date ? new Date(item.date).toLocaleString() : (item.date || '-');
                tr.appendChild(tdDate);

                const tdView = document.createElement('td');
                tdView.textContent = item.viewCount || '0';
                tr.appendChild(tdView);

                const tdBookmark = document.createElement('td');
                tdBookmark.textContent = item.bookmark || '0';
                tr.appendChild(tdBookmark);
                
                frag.appendChild(tr);
            });
            tbody.appendChild(frag);
            const tElapsed = performance.now() - tStart;
            status.textContent += `，渲染耗时 ${tElapsed.toFixed(1)} ms`;
        }
        
        const debouncedRender = debounce(renderGalleryTable, 300);
        document.getElementById('gallerySearch').addEventListener('input', debouncedRender);
        const tagIncludePanel = document.getElementById('tagIncludePanel');
        const tagExcludePanel = document.getElementById('tagExcludePanel');
        const aiFilterEl = document.getElementById('galleryAiFilter');
        const sortEl = document.getElementById('gallerySort');
        const dateFmtEl = document.getElementById('galleryDateFormat');
        const perPageEl = document.getElementById('perPageSelect');
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const jumpBtn = document.getElementById('jumpPageBtn');
        const pageInput = document.getElementById('pageInput');
        const selectedInclude = document.getElementById('selectedInclude');
        const selectedExclude = document.getElementById('selectedExclude');
        const clearSelectedBtn = document.getElementById('clearSelectedTags');

        function updateSelectedTagsSummary() {
            if (!selectedInclude || !selectedExclude) return;
            const inc = Array.from(document.querySelectorAll('#tagIncludePanel .tag-item.selected')).map(el => el.dataset.value);
            const exc = Array.from(document.querySelectorAll('#tagExcludePanel .tag-item.selected')).map(el => el.dataset.value);
            selectedInclude.innerHTML = '';
            selectedExclude.innerHTML = '';
            inc.forEach(tag => {
                const pill = document.createElement('span');
                pill.className = 'tag-pill';
                pill.dataset.tag = tag;
                pill.textContent = tag;
                selectedInclude.appendChild(pill);
            });
            exc.forEach(tag => {
                const pill = document.createElement('span');
                pill.className = 'tag-pill';
                pill.dataset.tag = tag;
                pill.textContent = tag;
                selectedExclude.appendChild(pill);
            });
        }
        function reorderTagPanel(panel) {
            if (!panel) return;
            const items = Array.from(panel.querySelectorAll('.tag-item'));
            items.sort((a, b) => {
                const aSel = a.classList.contains('selected') ? 1 : 0;
                const bSel = b.classList.contains('selected') ? 1 : 0;
                if (aSel !== bSel) return bSel - aSel;
                const ta = a.dataset.value || '';
                const tb = b.dataset.value || '';
                const ca = tagCountsMap[ta] || 0;
                const cb = tagCountsMap[tb] || 0;
                if (ca !== cb) return cb - ca;
                return ta.localeCompare(tb, 'zh-CN');
            });
            items.forEach(it => panel.appendChild(it));
        }
        function bindPanelClick(panel) {
            if (!panel) return;
            panel.addEventListener('click', (e) => {
                const item = e.target.closest('.tag-item');
                if (!item || !panel.contains(item)) return;
                item.classList.toggle('selected');
                updateSelectedTagsSummary();
                reorderTagPanel(panel);
                debouncedRender();
            });
        }
        bindPanelClick(tagIncludePanel);
        bindPanelClick(tagExcludePanel);
        if (clearSelectedBtn) {
            clearSelectedBtn.addEventListener('click', () => {
                document.querySelectorAll('#tagIncludePanel .tag-item.selected, #tagExcludePanel .tag-item.selected').forEach(el => el.classList.remove('selected'));
                updateSelectedTagsSummary();
                debouncedRender();
            });
        }
        if (selectedInclude) {
            selectedInclude.addEventListener('click', (e) => {
                const pill = e.target.closest('.tag-pill');
                if (!pill) return;
                const tag = pill.dataset.tag;
                const item = document.querySelector(`#tagIncludePanel .tag-item[data-value="${tag}"]`);
                if (item) item.classList.remove('selected');
                updateSelectedTagsSummary();
                debouncedRender();
            });
        }
        if (selectedExclude) {
            selectedExclude.addEventListener('click', (e) => {
                const pill = e.target.closest('.tag-pill');
                if (!pill) return;
                const tag = pill.dataset.tag;
                const item = document.querySelector(`#tagExcludePanel .tag-item[data-value="${tag}"]`);
                if (item) item.classList.remove('selected');
                updateSelectedTagsSummary();
                debouncedRender();
            });
        }
        if (aiFilterEl) aiFilterEl.addEventListener('change', debouncedRender);
        if (sortEl) sortEl.addEventListener('change', renderGalleryTable);
        if (dateFmtEl) dateFmtEl.addEventListener('change', renderGalleryTable);
        if (perPageEl) perPageEl.addEventListener('change', () => { perPage = parseInt(perPageEl.value, 10) || 50; currentPage = 1; renderGalleryTable(); });
        if (prevBtn) prevBtn.addEventListener('click', prevPage);
        if (nextBtn) nextBtn.addEventListener('click', nextPage);
        if (jumpBtn && pageInput) jumpBtn.addEventListener('click', () => { const p = parseInt(pageInput.value, 10); if (!isNaN(p)) { goToPage(p); } });
        
        const openTagIncludeBtn = document.getElementById('openTagInclude');
        const openTagExcludeBtn = document.getElementById('openTagExclude');
        function togglePanel(btn, panel) {
            if (!btn || !panel) return;
            btn.addEventListener('click', () => {
                panel.classList.toggle('open');
                reorderTagPanel(panel);
            });
        }
        togglePanel(openTagIncludeBtn, tagIncludePanel);
        togglePanel(openTagExcludeBtn, tagExcludePanel);
        document.addEventListener('click', (e) => {
            const incWrap = openTagIncludeBtn ? openTagIncludeBtn.parentElement : null;
            const excWrap = openTagExcludeBtn ? openTagExcludeBtn.parentElement : null;
            if (incWrap && !incWrap.contains(e.target)) { tagIncludePanel.classList.remove('open'); }
            if (excWrap && !excWrap.contains(e.target)) { tagExcludePanel.classList.remove('open'); }
        });

        function openSecretSettings() {
            document.getElementById('secretSettings').style.display = 'flex';
            hasAccessedSecret = true;
            const container = document.getElementById('quickAccessContainer');
            const btnProx = document.getElementById('quickAccessBtn');
            const btnGallery = document.getElementById('galleryBtn');
            const btnRandom = document.getElementById('quickRandomBtn');
            if (container) container.style.display = 'flex';
            if (btnProx) btnProx.style.display = 'flex';
            if (btnGallery) btnGallery.style.display = 'flex';
            if (btnRandom) btnRandom.style.display = 'flex';
        }

        function closeSecretSettings() {
            document.getElementById('secretSettings').style.display = 'none';
            document.getElementById('urlInput').value = '';
            document.getElementById('secretInput').value = '';
            document.getElementById('AnotherInput').value = '';
        }

        function handleSecretProxyChange() {
            const secretProxySelect = document.getElementById('secretProxySelect');
            const secretCustomProxyInput = document.getElementById('secretCustomProxyInput');
            
            if (secretProxySelect.value === 'custom') {
                secretCustomProxyInput.style.display = 'block';
            } else {
                secretCustomProxyInput.style.display = 'none';
            }
        }

        function handleSecretAction() {
            if (currentFunction === 'static') {
                handleStaticResource();
            } else if (currentFunction === 'Another') {
                handleAnotherAcceleration();
            }
        }

        function handleStaticResource() {
            const secretInput = document.getElementById('secretInput').value.trim();
            const secretProxySelect = document.getElementById('secretProxySelect');
            const secretCustomProxyInput = document.getElementById('secretCustomProxyInput');
            
            if (!secretInput) {
                alert('❌ 请输入静态资源链接！');
                return;
            }
            
            let proxyUrl;
            if (secretProxySelect.value === 'custom') {
                proxyUrl = secretCustomProxyInput.value.trim();
                if (!proxyUrl) {
                    alert('❌ 请输入自定义服务器地址！');
                    return;
                }
            } else {
                proxyUrl = secretProxySelect.value;
            }

            const cleanProxyUrl = proxyUrl.replace(/\/+$/, '');
            
            let processedInput = secretInput;
            
            processedInput = processedInput.replace(/^https?:\/\//, '');
            
            const finalUrl = cleanProxyUrl + '/~' + processedInput;
            
            window.open(finalUrl, '_blank');
            
            document.getElementById('secretInput').value = '';
        }

        function handleAnotherAcceleration() {
            const AnotherInput = document.getElementById('AnotherInput').value.trim();
            
            if (!AnotherInput) {
                alert('❌ 请输入链接！');
                return;
            }
            
            let processedInput = AnotherInput;
            
            // processedInput = processedInput.replace(/^https?:\/\//, '');
            
            const finalUrl = 'https://p.futa.de5.net/' + processedInput;
            
            window.open(finalUrl, '_blank');
            
            document.getElementById('AnotherInput').value = '';
        }

        function getProxyUrl() {
            const proxySelect = document.getElementById('proxySelect');
            const customProxyInput = document.getElementById('customProxyInput');
            
            if (proxySelect.value === 'custom') {
                return customProxyInput.value.trim();
            } else {
                return proxySelect.value;
            }
        }

        function handleProxyChange() {
            const proxySelect = document.getElementById('proxySelect');
            const customProxyInput = document.getElementById('customProxyInput');
            
            if (proxySelect.value === 'custom') {
                customProxyInput.style.display = 'block';
            } else {
                customProxyInput.style.display = 'none';
            }
        }

        async function loadImageWithProgress(url, retryCount = 0, skipCacheOverride = null) {
            const loadingText = document.getElementById('loadingText');
            const progressContainer = document.getElementById('progressContainer');
            const progressBar = document.getElementById('progressBar');
            const progressStats = document.getElementById('progressStats');
            const resultImage = document.getElementById('resultImage');
            const loadingIndicator = document.getElementById('loadingIndicator');
            const shouldSkipCache = skipCacheOverride === true;

            if (currentFetchController) {
                currentFetchController.abort();
            }
            currentFetchController = new AbortController();
            const signal = currentFetchController.signal;

            loadingIndicator.className = 'loading-overlay'; 
            loadingIndicator.style.display = 'flex';
            
            loadingText.textContent = '正在准备...';
            progressContainer.style.display = 'block';
            progressStats.style.display = 'block';
            progressBar.style.width = '0%';
            progressStats.textContent = '0%';

            showMinimalistProgress(0, 0, 0);

            if (!shouldSkipCache && await imageCache.has(url)) {
                console.log('Using cached image for:', url);
                const blobUrl = await imageCache.get(url);
                
                loadingText.textContent = '正在从缓存加载...';
                showMinimalistMessage('从缓存加载', 'info');
                
                await new Promise(r => requestAnimationFrame(r));
                
                if (signal.aborted) return;

                resultImage.onload = function() {
                    loadingIndicator.style.display = 'none';
                    resultImage.style.display = 'block';
                    setFullscreenPreview(blobUrl);
                    showMinimalistProgress(100, 0, 0);
                };
                
                resultImage.onerror = async function() {
                    console.log('Cache corrupted, clearing and retrying...');
                    await imageCache.delete(url);
                    if (retryCount < MAX_RETRIES) {
                        showMinimaistMessage('缓存损坏，正在重新加载...', 'info');
                        await loadImageWithProgress(url, retryCount + 1, shouldSkipCache);
                    } else {
                        loadingIndicator.style.display = 'none';
                        showErrorWithRetry('缓存读取失败，请重试', url, { current: retryCount, max: MAX_RETRIES });
                    }
                };

                resultImage.src = blobUrl;
                replacedUrl = blobUrl;
                return;
            }

            try {
                loadingText.textContent = '正在建立连接...';
                const response = await fetchWithTimeout(url, { signal }, FETCH_TIMEOUT);
                if (!response.ok) {
                    throw new Error('HTTP error! status: ' + response.status);
                }

                const contentLength = response.headers.get('content-length');
                const total = contentLength ? parseInt(contentLength, 10) : 0;
                let loaded = 0;

                const reader = response.body.getReader();
                const chunks = [];

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    chunks.push(value);
                    loaded += value.length;

                    if (total) {
                        const percent = Math.round((loaded / total) * 100);
                        progressBar.style.width = percent + '%';
                        progressStats.textContent = percent + '% (' + (loaded / 1024 / 1024).toFixed(2) + ' MB / ' + (total / 1024 / 1024).toFixed(2) + ' MB)';
                        showMinimalistProgress(percent, loaded, total);
                    } else {
                        progressStats.textContent = '已下载: ' + (loaded / 1024 / 1024).toFixed(2) + ' MB';
                    }
                }

                loadingText.textContent = '正在渲染图片...';
                
                const blob = new Blob(chunks);
                const objectUrl = URL.createObjectURL(blob);
                
                if (!shouldSkipCache) {
                    await imageCache.set(url, objectUrl, blob.size);
                }

                if (signal.aborted) return;

                resultImage.onload = function() {
                    loadingIndicator.style.display = 'none';
                    resultImage.style.display = 'block';
                    setFullscreenPreview(objectUrl);
                    showMinimalistProgress(100, loaded, total);
                };
                
                resultImage.onerror = function() {
                    loadingIndicator.style.display = 'none';
                    showError('图片渲染失败');
                };

                resultImage.src = objectUrl;
                replacedUrl = objectUrl;

            } catch (err) {
                if (err.name === 'AbortError') {
                    console.log('Fetch aborted: ' + url);
                    return;
                }
                
                console.error(err);
                
                if (retryCount < MAX_RETRIES) {
                    loadingText.textContent = '加载失败，正在重试 (' + (retryCount + 1) + '/' + MAX_RETRIES + ')...';
                    showMinimaistMessage('加载失败，正在重试 (' + (retryCount + 1) + '/' + MAX_RETRIES + ')...', 'info');
                    await new Promise(r => setTimeout(r, RETRY_DELAY * (retryCount + 1)));
                    if (!signal.aborted) {
                        await loadImageWithProgress(url, retryCount + 1, shouldSkipCache);
                    }
                    return;
                }
                
                console.warn('Fetch failed, falling back to direct img src loading...');
                
                loadingText.textContent = '流式加载失败，尝试直接加载...';
                progressContainer.style.display = 'none';
                progressStats.style.display = 'none';
                
                if (resultImage.src && resultImage.src.startsWith('blob:')) {
                    URL.revokeObjectURL(resultImage.src);
                    currentObjectUrls.delete(resultImage.src);
                }
                
                if (signal.aborted) return;

                resultImage.onload = function() {
                    loadingIndicator.style.display = 'none';
                    resultImage.style.display = 'block';
                    setFullscreenPreview(url);
                };
                
                resultImage.onerror = function() {
                    loadingIndicator.style.display = 'none';
                    lastFailedUrl = url;
                    showErrorWithRetry('图片加载失败: ' + err.message, url, { current: retryCount + 1, max: MAX_RETRIES });
                };
                
                resultImage.src = url;
                replacedUrl = url;
            } finally {
                 if (currentFetchController && currentFetchController.signal === signal) {
                     currentFetchController = null;
                 }
            }
        }

        function showErrorWithRetry(msg, url, retryInfo = null) {
            const elem = document.getElementById('errorMsg');
            if (elem) {
                let retryStatus = '';
                if (retryInfo) {
                    retryStatus = '<div class="retry-progress">重试进度: ' + retryInfo.current + '/' + retryInfo.max + '</div>';
                }
                elem.innerHTML = escapeHtml(msg) + 
                    '<div class="error-actions">' +
                    '<button class="retry-btn" onclick="retryLoad(\'' + escapeHtml(url) + '\')">重试</button>' +
                    '</div>' +
                    retryStatus;
                elem.style.display = 'block';
            }
            showMinimaistMessage(msg, 'error');
            lastFailedUrl = url;
        }

        function retryLoad(url) {
            const elem = document.getElementById('errorMsg');
            if (elem) elem.style.display = 'none';
            if (url) {
                loadImageWithProgress(url, 0);
            } else if (lastFailedUrl) {
                loadImageWithProgress(lastFailedUrl, 0);
            }
        }

        async function preloadNextImages(currentUrl) {
            let currentPage = 0;
            const pMatch = currentUrl.match(/(_p)(\d+)(\.[a-zA-Z0-9]+)$/);
            if (pMatch) {
                currentPage = parseInt(pMatch[2], 10);
            }

            const preloadCount = 2;
            
            for (let i = 1; i <= preloadCount; i++) {
                const nextPage = currentPage + i;
                const nextUrl = setUrlPage(currentUrl, nextPage);
                
                if (await imageCache.has(nextUrl)) {
                    console.log(`Page ${nextPage} already cached.`);
                    continue;
                }
                
                console.log(`Preloading page ${nextPage}: ${nextUrl}`);
                
                fetchWithTimeout(nextUrl, {}, 30000)
                    .then(resp => {
                        if (!resp.ok) throw new Error(resp.status);
                        return resp.blob();
                    })
                    .then(async blob => {
                        const objectUrl = URL.createObjectURL(blob);
                        await imageCache.set(nextUrl, objectUrl, blob.size);
                        console.log(`Preloaded page ${nextPage} success.`);
                    })
                    .catch(err => {
                        console.log(`Preload page ${nextPage} failed:`, err.message);
                    });
            }
        }

        function processLink(skipCache = false) {
            const input = document.getElementById('urlInput').value.trim();
            const errorMsg = document.getElementById('errorMsg');
            const infoMsg = document.getElementById('infoMsg');
            const imageContainer = document.getElementById('imageContainer');
            const resultImage = document.getElementById('resultImage');
            const resultLinkContainer = document.getElementById('resultLinkContainer');
            const resultLink = document.getElementById('resultLink');
            const downloadBtn = document.getElementById('downloadBtn');
            const loadingIndicator = document.getElementById('loadingIndicator');
            const downloadBtnMinimal = document.getElementById('downloadBtnMinimal');

            if (errorMsg) errorMsg.style.display = 'none';
            if (infoMsg) infoMsg.style.display = 'none';
            if (resultLinkContainer) resultLinkContainer.style.display = 'none';
            if (loadingIndicator) loadingIndicator.style.display = 'none';

            if (!input) {
                showError('请先输入一个链接');
                return;
            }

            showCopyToast(skipCache ? '正在处理链接(跳过缓存)...' : '正在处理链接...');

            if (input.toLowerCase() === 'prox') {
                showCopyToast('打开设置面板');
                openSecretSettings();
                hasAccessedSecret = true;
                const container = document.getElementById('quickAccessContainer');
                const btnProx = document.getElementById('quickAccessBtn');
                if (container) container.style.display = 'flex';
                if (btnProx) btnProx.style.display = 'flex';
                return;
            }

            try {
                let urlToLoad = input;
                if (!urlToLoad.startsWith('http://') && !urlToLoad.startsWith('https://')) {
                    urlToLoad = 'https://' + urlToLoad;
                }
                originalUrl = urlToLoad;

                const proxyUrl = getProxyUrl();
                const cleanProxyUrl = proxyUrl ? proxyUrl.replace(/\/+$/, '') : '';
                
                const isPixivLink = /i\.pximg\.net/i.test(originalUrl);
                
                if (isPixivLink) {
                    if (!proxyUrl) {
                        showError('请选择或输入代理服务器地址');
                        return;
                    }
                    showCopyToast('检测到Pixiv链接');
                    
                    replacedUrl = originalUrl.replace(
                        /i\.pximg\.net/g, 
                        cleanProxyUrl.replace(/^https?:\/\//, '')
                    );
                    
                    showCopyToast('转换链接: i.pximg.net -> ' + cleanProxyUrl.replace(/^https?:\/\//, ''));
                    showInfo('已转接: i.pximg.net -> ' + cleanProxyUrl.replace(/^https?:\/\//, ''));
                    
                    if (resultLink) resultLink.textContent = replacedUrl;
                    if (resultLinkContainer) resultLinkContainer.style.display = 'block';

                    isOriginalSize = false;
                    if (resultImage) resultImage.className = 'scaled-image';
                    
                    if (imageContainer) imageContainer.style.display = 'block';
                    if (downloadBtnMinimal) downloadBtnMinimal.classList.add('visible');
                    
                    showCopyToast('正在加载图片...');
                    loadImageWithProgress(replacedUrl, 0, skipCache);
                    preloadNextImages(replacedUrl);
                } else {
                    showCopyToast('加载链接: ' + urlToLoad);
                    loadUrlAuto(urlToLoad, skipCache);
                }

            } catch (err) {
                showError('处理链接时出错：' + err.message);
            }
        }

        let currentPreviewData = {
            links: [],
            content: '',
            sourceUrl: ''
        };

        async function loadUrlAuto(url) {
            const imageContainer = document.getElementById('imageContainer');
            const resultImage = document.getElementById('resultImage');
            const resultLinkContainer = document.getElementById('resultLinkContainer');
            const resultLink = document.getElementById('resultLink');
            const loadingIndicator = document.getElementById('loadingIndicator');
            const downloadBtnMinimal = document.getElementById('downloadBtnMinimal');

            if (imageContainer) imageContainer.style.display = 'block';
            if (resultLinkContainer) resultLinkContainer.style.display = 'block';
            if (loadingIndicator) loadingIndicator.style.display = 'block';
            if (resultImage) resultImage.style.display = 'none';
            if (downloadBtnMinimal) downloadBtnMinimal.classList.add('visible');
            
            showCopyToast('正在请求链接...');
            showInfo('正在加载...');

            try {
                const response = await fetchWithTimeout(url, {}, FETCH_TIMEOUT);
                const contentType = response.headers.get('content-type') || '';
                
                showCopyToast('Content-Type: ' + contentType.split(';')[0]);
                
                if (contentType.includes('application/json') || contentType.includes('text/json')) {
                    showCopyToast('检测到JSON响应，正在解析...');
                    const data = await response.json();
                    const imageUrl = extractImageUrl(data);
                    
                    if (imageUrl) {
                        showCopyToast('从JSON提取链接: ' + imageUrl.substring(0, 50) + '...');
                        await loadMediaFromUrl(imageUrl);
                    } else {
                        showCopyToast('未找到图片链接，显示内容预览');
                        showContentPreview(JSON.stringify(data, null, 2), url, 'json');
                    }
                } else if (contentType.includes('text/')) {
                    showCopyToast('检测到文本响应，正在提取链接...');
                    const text = await response.text();
                    const links = extractAllUrls(text);
                    
                    if (links.length > 0) {
                        showCopyToast('检测到 ' + links.length + ' 个链接');
                        showContentPreview(text, url, 'text', links);
                    } else {
                        showCopyToast('未检测到链接，显示文本内容');
                        showContentPreview(text, url, 'text', []);
                    }
                } else {
                    showCopyToast('检测到媒体类型，直接加载...');
                    await loadMediaFromUrl(url);
                }
            } catch (err) {
                showCopyToast('加载失败: ' + err.message);
                showError('加载失败: ' + err.message);
            }
        }

        function extractAllUrls(text) {
            const urlRegex = /https?:\/\/[^\s"'<>]+/gi;
            const matches = text.match(urlRegex) || [];
            return [...new Set(matches)];
        }

        function showContentPreview(content, sourceUrl, type, links = []) {
            currentPreviewData = {
                content: content,
                sourceUrl: sourceUrl,
                links: links,
                type: type
            };

            const panel = document.getElementById('contentPreviewPanel');
            const textDiv = document.getElementById('contentPreviewText');
            const linksDiv = document.getElementById('contentPreviewLinks');

            textDiv.textContent = content.substring(0, 5000);
            if (content.length > 5000) {
                textDiv.textContent += '\n\n... (内容已截断)';
            }

            linksDiv.innerHTML = '';
            
            if (links.length > 0) {
                const h4 = document.createElement('h4');
                h4.textContent = '检测到的链接 (' + links.length + ')';
                linksDiv.appendChild(h4);

                links.forEach((link, index) => {
                    const item = document.createElement('div');
                    item.className = 'content-link-item';
                    
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = 'previewLink';
                    radio.value = index;
                    if (index === 0) radio.checked = true;
                    
                    const span = document.createElement('span');
                    span.textContent = link;
                    
                    item.appendChild(radio);
                    item.appendChild(span);
                    item.onclick = function() {
                        radio.checked = true;
                    };
                    linksDiv.appendChild(item);
                });
            }

            panel.classList.add('show');
            
            const loadingIndicator = document.getElementById('loadingIndicator');
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }

        function closeContentPreview() {
            const panel = document.getElementById('contentPreviewPanel');
            panel.classList.remove('show');
        }

        async function processSelectedLink() {
            const selectedInput = document.querySelector('input[name="previewLink"]:checked');
            
            if (!selectedInput) {
                showError('请选择一个链接');
                return;
            }

            const linkIndex = parseInt(selectedInput.value, 10);
            const link = currentPreviewData.links[linkIndex];

            showCopyToast('加载选中链接: ' + link.substring(0, 50) + '...');
            closeContentPreview();
            
            const input = document.getElementById('urlInput');
            input.value = link;
            
            await loadMediaFromUrl(link);
        }

        async function loadMediaFromUrl(url) {
            const resultLink = document.getElementById('resultLink');
            const resultLinkContainer = document.getElementById('resultLinkContainer');
            const resultImage = document.getElementById('resultImage');
            const loadingIndicator = document.getElementById('loadingIndicator');

            showCopyToast('准备加载媒体...');
            
            originalUrl = url;
            replacedUrl = url;

            const proxyUrl = getProxyUrl();
            const cleanProxyUrl = proxyUrl ? proxyUrl.replace(/\/+$/, '') : '';

            if (cleanProxyUrl && /i\.pximg\.net/i.test(url)) {
                showCopyToast('转换Pixiv链接...');
                replacedUrl = url.replace(
                    /i\.pximg\.net/g, 
                    cleanProxyUrl.replace(/^https?:\/\//, '')
                );
                showCopyToast('转换完成: ' + replacedUrl.substring(0, 50) + '...');
            }

            if (resultLink) resultLink.textContent = replacedUrl;
            if (resultLinkContainer) resultLinkContainer.style.display = 'block';

            isOriginalSize = false;
            if (resultImage) resultImage.className = 'scaled-image';

            const isVideo = /\.(mp4|webm|mov|avi)(\?.*)?$/i.test(replacedUrl);

            if (isVideo) {
                showCopyToast('检测到视频，准备播放...');
                showVideoPreview(replacedUrl);
            } else {
                showCopyToast('正在加载图片...');
                showInfo('正在加载图片...');
                loadImageWithProgress(replacedUrl);
            }
        }

        function showVideoPreview(url) {
            const preview = document.getElementById('fullscreenPreview');
            
            if (currentVideoElement) {
                currentVideoElement.pause();
                currentVideoElement.src = '';
                currentVideoElement.load();
                currentVideoElement = null;
            }
            
            const existingVideo = preview.querySelector('video');
            if (existingVideo) {
                existingVideo.pause();
                existingVideo.src = '';
                existingVideo.load();
            }
            
            preview.innerHTML = '';
            
            const video = document.createElement('video');
            video.src = url;
            video.controls = true;
            video.autoplay = true;
            video.style.cssText = 'width:100%;height:100%;object-fit:contain;';
            preview.appendChild(video);
            currentVideoElement = video;
            
            const loadingIndicator = document.getElementById('loadingIndicator');
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            
            showCopyToast('视频已加载');
            showInfo('视频已加载');
        }

        function extractImageUrl(data) {
            if (typeof data === 'string' && /^https?:\/\//i.test(data)) {
                return data;
            }
            
            const candidates = ['url', 'image', 'src', 'img', 'link', 'file', 'path'];
            
            for (const key of candidates) {
                if (data[key] && typeof data[key] === 'string' && /^https?:\/\//i.test(data[key])) {
                    return data[key];
                }
            }
            
            if (data.data) {
                for (const key of candidates) {
                    if (data.data[key] && typeof data.data[key] === 'string' && /^https?:\/\//i.test(data.data[key])) {
                        return data.data[key];
                    }
                }
            }
            
            if (data.result) {
                for (const key of candidates) {
                    if (data.result[key] && typeof data.result[key] === 'string' && /^https?:\/\//i.test(data.result[key])) {
                        return data.result[key];
                    }
                }
            }
            
            if (Array.isArray(data) && data.length > 0) {
                const first = data[0];
                if (typeof first === 'string' && /^https?:\/\//i.test(first)) {
                    return first;
                }
                for (const key of candidates) {
                    if (first[key] && typeof first[key] === 'string' && /^https?:\/\//i.test(first[key])) {
                        return first[key];
                    }
                }
            }
            
            for (const key in data) {
                if (typeof data[key] === 'string' && /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(data[key])) {
                    return data[key];
                }
            }
            
            return null;
        }

        function openInNewTab() {
            const input = document.getElementById('urlInput').value.trim();
            
            if (!input) {
                showError('❌ 请先输入一个链接！');
                return;
            }

            if (input.toLowerCase() === 'prox') {
                openSecretSettings();
                hasAccessedSecret = true;
                const container = document.getElementById('quickAccessContainer');
                const btnProx = document.getElementById('quickAccessBtn');
                if (container) container.style.display = 'flex';
                if (btnProx) btnProx.style.display = 'flex';
                return;
            }

            try {
                let urlToOpen = input;

                if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
                    urlToOpen = 'https://' + urlToOpen;
                }

                const proxyUrl = getProxyUrl();
                if (!proxyUrl) {
                    showError('❌ 请选择或输入服务器地址！');
                    return;
                }

                const cleanProxyUrl = proxyUrl.replace(/\/+$/, '');
                
                const newTabUrl = urlToOpen.replace(
                    /i\.pximg\.net/g, 
                    cleanProxyUrl.replace(/^https?:\/\//, '')
                );

                if (newTabUrl === urlToOpen) {
                    showError('⚠️ <br> 此非Pixiv原图链接 <br> 链接应为 https://i.pximg.net/img-original/img/... <br> 无法打开。请检查输入的链接是否正确。');
                    return;
                }

                window.open(newTabUrl, '_blank');

            } catch (err) {
                showError('❌ 处理链接时出错：' + err.message);
            }
        }

        function downloadImage() {
            if (!replacedUrl) {
                showError('❌ 没有可下载的图片链接');
                return;
            }

            const a = document.createElement('a');
            a.href = replacedUrl;
            
            let filename = 'pixiv-image.png';
            if (originalUrl) {
                filename = originalUrl.split('/').pop();
            } else if (replacedUrl && !replacedUrl.startsWith('blob:')) {
                filename = replacedUrl.split('/').pop();
            }
            a.download = filename;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        function showError(msg) {
            const elem = document.getElementById('errorMsg');
            if (elem) {
                elem.textContent = msg;
                elem.style.display = 'block';
            }
            showMinimaistMessage(msg.replace(/\n/g, ' ').trim(), 'error');
        }

        function showInfo(msg) {
            const elem = document.getElementById('infoMsg');
            if (elem) {
                elem.textContent = msg;
                elem.style.display = 'block';
            }
            showMinimaistMessage(msg.replace(/\n/g, ' ').trim(), 'info');
        }

        function copyToClipboard(element) {
            const text = element.textContent;
            navigator.clipboard.writeText(text).then(() => {
                const notification = document.createElement('div');
                notification.className = 'copy-notification show-copy-notification';
                notification.textContent = '已复制!';
                element.appendChild(notification);
                
                setTimeout(() => {
                    notification.classList.remove('show-copy-notification');
                    setTimeout(() => {
                        element.removeChild(notification);
                    }, 300);
                }, 2000);
            }).catch(err => {
                console.error('复制失败:', err);
            });
        }

        function getUrlPage(url) {
            const match = url.match(/_p(\d+)(\.[a-zA-Z0-9]+)?$/);
            if (match) {
                return parseInt(match[1], 10);
            }
            return null; // Not found
        }

        function setUrlPage(url, page) {
            if (/_p(\d+)(\.[a-zA-Z0-9]+)?$/.test(url)) {
                return url.replace(/_p(\d+)(\.[a-zA-Z0-9]+)?$/, `_p${page}$2`);
            }
            const extMatch = url.match(/(\.[a-zA-Z0-9]+)$/);
            if (extMatch) {
                return url.replace(/(\.[a-zA-Z0-9]+)$/, `_p${page}$1`);
            }
            return url + `_p${page}`;
        }

        function updatePageControlFromUrl() {
            const input = document.getElementById('urlInput');
            const pageInput = document.getElementById('urlPageInput');
            const miniPageInput = document.getElementById('miniUrlPageInput');
            if (!input || !pageInput) return;
            const page = getUrlPage(input.value);
            if (page !== null) {
                const displayPage = page + 1;
                pageInput.value = displayPage;
                if (miniPageInput) miniPageInput.value = displayPage;
            }
        }

        function changeUrlPage(delta) {
            const now = Date.now();
            if (now - lastClickTime < 300) return; 
            lastClickTime = now;

            const input = document.getElementById('urlInput');
            let val = input.value.trim();
            if (!val) return;
            
            let page = getUrlPage(val);
            if (page === null) page = 0;
            
            let newPage = page + delta;
            if (newPage < 0) newPage = 0;
            
            const newUrl = setUrlPage(val, newPage);
            input.value = newUrl;
            const displayPage = newPage + 1;
            document.getElementById('urlPageInput').value = displayPage;
            const miniPageInput = document.getElementById('miniUrlPageInput');
            if (miniPageInput) miniPageInput.value = displayPage;

            processLink();
        }

        function jumpUrlPage(page) {
            const now = Date.now();
            if (now - lastClickTime < 300) return; 
            lastClickTime = now;

            const input = document.getElementById('urlInput');
            let val = input.value.trim();
            if (!val) return;
            
            let displayPage = parseInt(page, 10);
            if (isNaN(displayPage) || displayPage < 1) displayPage = 1;
            
            let newPage = displayPage - 1;
            if (newPage < 0) newPage = 0;
            
            const newUrl = setUrlPage(val, newPage);
            input.value = newUrl;
            document.getElementById('urlPageInput').value = displayPage;
            const miniPageInput = document.getElementById('miniUrlPageInput');
            if (miniPageInput) miniPageInput.value = displayPage;

            processLink();
        }

        async function quickRandomImage() {
            if (!isGalleryLoaded) {
                 await loadGalleryData();
            }
            
            if (galleryData.length === 0) {
                 alert('请先在图库中加载数据！');
                 openGalleryBrowser(); 
                 return;
            }
            
            pickRandomImage();
        }

        function loadApiImage() {
            let apiUrl = 'https://img.futa.de5.net/1';
            
            const customInput = document.getElementById('customProxyInput');
            if (customInput && customInput.value.trim() !== '') {
                apiUrl = customInput.value.trim();
            }

            showCopyToast('正在准备API请求...');
            
            const separator = apiUrl.includes('?') ? '&' : '?';
            const targetUrl = apiUrl + separator + 't=' + Date.now();
            
            showCopyToast('API地址: ' + apiUrl);
            
            const errorMsg = document.getElementById('errorMsg');
            const infoMsg = document.getElementById('infoMsg');
            const imageContainer = document.getElementById('imageContainer');
            const resultImage = document.getElementById('resultImage');
            const resultLinkContainer = document.getElementById('resultLinkContainer');
            const resultLink = document.getElementById('resultLink');
            const loadingIndicator = document.getElementById('loadingIndicator');
            const downloadBtnMinimal = document.getElementById('downloadBtnMinimal');

            if (errorMsg) errorMsg.style.display = 'none';
            if (infoMsg) infoMsg.style.display = 'none';
            if (imageContainer) imageContainer.style.display = 'block';
            if (resultLinkContainer) resultLinkContainer.style.display = 'block';
            
            if (loadingIndicator) loadingIndicator.style.display = 'block';
            if (resultImage) resultImage.style.display = 'none';
            
            if (resultLink) resultLink.textContent = apiUrl;
            
            originalUrl = ''; 
            replacedUrl = targetUrl;
            
            isOriginalSize = false;
            if (resultImage) resultImage.className = 'scaled-image';
            
            if (downloadBtnMinimal) downloadBtnMinimal.classList.add('visible');
            
            showCopyToast('正在加载随机图片...');
            loadImageWithProgress(targetUrl);
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                var secretSettings = document.getElementById('secretSettings');
                var galleryBrowser = document.getElementById('galleryBrowser');
                var cacheModal = document.getElementById('cacheModal');
                var detailsPanel = document.getElementById('detailsPanel');
                var floatingMenuContent = document.getElementById('floatingMenuContent');
                var contentPreviewPanel = document.getElementById('contentPreviewPanel');
                
                if (contentPreviewPanel && contentPreviewPanel.classList.contains('show')) {
                    closeContentPreview();
                } else if (secretSettings && secretSettings.style.display === 'flex') {
                    closeSecretSettings();
                } else if (galleryBrowser && galleryBrowser.style.display === 'flex') {
                    closeGalleryBrowser();
                } else if (cacheModal && cacheModal.style.display === 'flex') {
                    closeCacheDashboard();
                } else if (detailsPanel && detailsPanel.classList.contains('show')) {
                    detailsPanel.classList.remove('show');
                } else if (floatingMenuContent && !floatingMenuContent.classList.contains('collapsed')) {
                    collapseMenu();
                }
            }
            
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                e.preventDefault();
                changeUrlPage(-1);
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                e.preventDefault();
                changeUrlPage(1);
            } else if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                processLink(true);
            } else if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                processLink(false);
            } else if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                zoomImage(CONFIG.zoomStep);
            } else if (e.key === '-') {
                e.preventDefault();
                zoomImage(-CONFIG.zoomStep);
            } else if (e.key === '0') {
                e.preventDefault();
                resetZoom();
            }
        });

        let currentZoom = 1;
        
        function zoomImage(delta) {
            const preview = document.getElementById('fullscreenPreview');
            const img = preview.querySelector('img');
            if (!img) return;
            
            currentZoom = Math.max(CONFIG.zoomMin, Math.min(CONFIG.zoomMax, currentZoom + delta));
            img.style.transform = 'scale(' + currentZoom + ')';
            img.style.transformOrigin = 'center center';
        }
        
        function resetZoom() {
            const preview = document.getElementById('fullscreenPreview');
            const img = preview.querySelector('img');
            if (!img) return;
            currentZoom = 1;
            img.style.transform = 'scale(1)';
        }

        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        let initialDistance = 0;
        let initialZoom = 1;

        document.addEventListener('touchstart', function(e) {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
            } else if (e.touches.length === 2) {
                initialDistance = getTouchDistance(e.touches);
                initialZoom = currentZoom;
            }
        }, { passive: true });

        document.addEventListener('touchmove', function(e) {
            if (e.touches.length === 2) {
                e.preventDefault();
                const currentDistance = getTouchDistance(e.touches);
                const scale = currentDistance / initialDistance;
                const newZoom = Math.max(CONFIG.zoomMin, Math.min(CONFIG.zoomMax, initialZoom * scale));
                const preview = document.getElementById('fullscreenPreview');
                const img = preview.querySelector('img');
                if (img) {
                    currentZoom = newZoom;
                    img.style.transform = 'scale(' + currentZoom + ')';
                }
            }
        }, { passive: false });

        document.addEventListener('touchend', function(e) {
            if (e.changedTouches.length === 1) {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const touchDuration = Date.now() - touchStartTime;
                const deltaX = touchEndX - touchStartX;
                const deltaY = touchEndY - touchStartY;
                
                if (touchDuration < 300 && Math.abs(deltaX) > CONFIG.touchSwipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
                    if (deltaX > 0) {
                        changeUrlPage(-1);
                    } else {
                        changeUrlPage(1);
                    }
                }
            }
        }, { passive: true });

        function getTouchDistance(touches) {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.sqrt(dx * dx + dy * dy);
        }

        document.addEventListener('DOMContentLoaded', function() {
            handleProxyChange();
            handleSecretProxyChange();
            
            hasAccessedSecret = false;
            const quickBtn = document.getElementById('quickAccessBtn');
            const galleryBtn = document.getElementById('galleryBtn');
            const randomBtn = document.getElementById('quickRandomBtn');
            const container = document.getElementById('quickAccessContainer');
            if (quickBtn) quickBtn.style.display = 'none';
            if (galleryBtn) galleryBtn.style.display = 'none';
            if (randomBtn) randomBtn.style.display = 'none';
            if (container) container.style.display = 'none';

            setupDragAndDrop();
        });

        function setupDragAndDrop() {
            const galleryBrowser = document.getElementById('galleryBrowser');
            
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                galleryBrowser.addEventListener(eventName, preventDefaults, false);
            });

            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }

            ['dragenter', 'dragover'].forEach(eventName => {
                galleryBrowser.addEventListener(eventName, function() {
                    galleryBrowser.classList.add('drag-over');
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                galleryBrowser.addEventListener(eventName, function() {
                    galleryBrowser.classList.remove('drag-over');
                }, false);
            });

            galleryBrowser.addEventListener('drop', handleDrop, false);
        }

        async function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;

            if (files.length > 0) {
                const file = files[0];
                if (file.name.endsWith('.csv')) {
                    const loading = document.getElementById('galleryLoading');
                    const status = document.getElementById('galleryStatus');
                    
                    loading.style.display = 'block';
                    status.textContent = '正在加载: ' + file.name;
                    
                    try {
                        const text = await file.text();
                        galleryData = parseCSV(text);
                        
                        const tagCounts = {};
                        galleryData.forEach(item => {
                            if (item.tags_transl) {
                                item.tags_transl.split(',').forEach(t => {
                                    const tag = t.trim();
                                    if (tag) {
                                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                                    }
                                });
                            }
                        });
                        tagCountsMap = tagCounts;
                        
                        const includePanel = document.getElementById('tagIncludePanel');
                        const excludePanel = document.getElementById('tagExcludePanel');
                        includePanel.innerHTML = '';
                        excludePanel.innerHTML = '';
                        
                        Object.keys(tagCounts)
                            .sort((a, b) => {
                                const diff = tagCounts[b] - tagCounts[a];
                                if (diff !== 0) return diff;
                                return a.localeCompare(b, 'zh-CN');
                            })
                            .forEach(tag => {
                                const inc = document.createElement('div');
                                inc.className = 'tag-item';
                                inc.dataset.value = tag;
                                inc.textContent = tag + ' (' + tagCounts[tag] + ')';
                                includePanel.appendChild(inc);
                                
                                const exc = document.createElement('div');
                                exc.className = 'tag-item';
                                exc.dataset.value = tag;
                                exc.textContent = tag + ' (' + tagCounts[tag] + ')';
                                excludePanel.appendChild(exc);
                            });

                        isGalleryLoaded = true;
                        status.textContent = '加载成功: ' + file.name + ' (共 ' + galleryData.length + ' 条数据)';
                        renderGalleryTable();
                    } catch (err) {
                        console.error(err);
                        status.textContent = '加载失败: ' + err.message;
                    } finally {
                        loading.style.display = 'none';
                    }
                } else {
                    showMinimaistMessage('请上传CSV文件', 'error');
                }
            }
        }

        function cleanupResources() {
            if (currentVideoElement) {
                currentVideoElement.pause();
                currentVideoElement.src = '';
                currentVideoElement = null;
            }
            currentObjectUrls.forEach(function(url) {
                URL.revokeObjectURL(url);
            });
            currentObjectUrls.clear();
        }

        window.addEventListener('beforeunload', cleanupResources);
        window.addEventListener('pagehide', cleanupResources);