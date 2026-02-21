// DOM 元素缓存 - 延迟初始化,确保 DOM 准备就绪
let domElements = null;

function initDomElements() {
    if (domElements) return domElements;

    const getElement = (id) => document.getElementById(id);

    domElements = {
        urlInput: getElement('urlInput'),
        urlPageInput: getElement('urlPageInput'),
        miniUrlPageInput: getElement('miniUrlPageInput'),
        proxySelect: getElement('proxySelect'),
        customProxyInput: getElement('customProxyInput'),
        floatingMenuContent: getElement('floatingMenuContent'),
        miniPager: getElement('miniPager'),
        detailsPanel: getElement('detailsPanel'),
        detailsGridMinimal: getElement('detailsGridMinimal'),
        toggleDetailsBtn: getElement('toggleDetailsBtn'),
        quickAccessContainer: getElement('quickAccessContainer'),
        quickAccessBtn: getElement('quickAccessBtn'),
        galleryBtn: getElement('galleryBtn'),
        quickRandomBtn: getElement('quickRandomBtn'),
        toastContainer: getElement('toastContainer'),
        secretSettings: getElement('secretSettings'),
        galleryBrowser: getElement('galleryBrowser'),
        contentPreviewPanel: getElement('contentPreviewPanel'),
        contentPreviewText: getElement('contentPreviewText'),
        contentPreviewLinks: getElement('contentPreviewLinks'),
        staticResourceBtn: getElement('staticResourceBtn'),
        anotherBtn: getElement('anotherBtn'),
        staticResourceSection: getElement('staticResourceSection'),
        anotherSection: getElement('anotherSection'),
        secretProxySelect: getElement('secretProxySelect'),
        secretCustomProxyInput: getElement('secretCustomProxyInput'),
        secretInput: getElement('secretInput'),
        anotherInput: getElement('anotherInput'),
        galleryCsvSelect: getElement('galleryCsvSelect'),
        localCsvInput: getElement('localCsvInput'),
        gallerySearch: getElement('gallerySearch'),
        gallerySort: getElement('gallerySort'),
        tagIncludePanel: getElement('tagIncludePanel'),
        tagExcludePanel: getElement('tagExcludePanel'),
        galleryAiFilter: getElement('galleryAiFilter'),
        galleryDateFormat: getElement('galleryDateFormat'),
        selectedInclude: getElement('selectedInclude'),
        selectedExclude: getElement('selectedExclude'),
        clearSelectedTags: getElement('clearSelectedTags'),
        perPageSelect: getElement('perPageSelect'),
        prevPageBtn: getElement('prevPageBtn'),
        nextPageBtn: getElement('nextPageBtn'),
        pageInfo: getElement('pageInfo'),
        pageInput: getElement('pageInput'),
        jumpPageBtn: getElement('jumpPageBtn'),
        galleryLoading: getElement('galleryLoading'),
        galleryStatus: getElement('galleryStatus'),
        galleryTableBody: getElement('galleryTableBody'),
        useThumbCheckbox: getElement('useThumbCheckbox'),
        errorMsg: getElement('errorMsg'),
        infoMsg: getElement('infoMsg'),
        resultLinkContainer: getElement('resultLinkContainer'),
        resultLink: getElement('resultLink'),
        imageContainer: getElement('imageContainer'),
        loadingIndicator: getElement('loadingIndicator'),
        loadingText: getElement('loadingText'),
        progressContainer: getElement('progressContainer'),
        progressBar: getElement('progressBar'),
        progressStats: getElement('progressStats'),
        resultImage: getElement('resultImage'),
        downloadBtn: getElement('downloadBtn'),
        downloadBtnMinimal: getElement('downloadBtnMinimal'),
        detailsContainer: getElement('detailsContainer'),
        detailsGrid: getElement('detailsGrid'),
        fullscreenPreview: getElement('fullscreenPreview'),
        openTagInclude: getElement('openTagInclude'),
        openTagExclude: getElement('openTagExclude'),
        minimalistToast: getElement('minimalistToast'),
        minimalistProgress: getElement('minimalistProgress')
    };

    return domElements;
}
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const FETCH_TIMEOUT = 60000;
const CONFIG = {
    preloadCount: 2,
    preloadEnabled: true,
    touchSwipeThreshold: 50,
    zoomMin: 0.5,
    zoomMax: 4,
    zoomStep: 0.25
};

let toastControllers = new Set();

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

        // =============================================
        // UI & Interactions
        // =============================================

        function toggleFloatingMenu() {
            const content = domElements.floatingMenuContent;
            const toggle = document.querySelector('.floating-menu-toggle');
            const miniPager = domElements.miniPager;
            content.classList.remove('collapsed');
            toggle.style.display = 'none';
            miniPager.style.display = 'none';
        }

        function collapseMenu() {
            const content = domElements.floatingMenuContent;
            const toggle = document.querySelector('.floating-menu-toggle');
            const miniPager = domElements.miniPager;
            content.classList.add('collapsed');
            toggle.style.display = 'flex';
            miniPager.style.display = 'flex';
        }

        function toggleDetailsPanel() {
            const panel = domElements.detailsPanel;
            if (panel) {
                panel.classList.toggle('show');
            }
        }

        function showMinimaistMessage(msg, type = 'info') {
            let toast = domElements.minimalistToast;
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'minimalistToast';
                toast.className = 'message-toast';
                document.body.appendChild(toast);
                domElements.minimalistToast = toast;
            }
            toast.textContent = msg;
            toast.className = 'message-toast ' + type + ' show';
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2000);
        }

        function showMinimalistProgress(percent, loaded, total) {
            let bar = domElements.minimalistProgress;
            if (!bar) {
                const container = document.createElement('div');
                container.className = 'preview-progress';
                container.innerHTML = '<div id="minimalistProgress" class="preview-progress-bar"></div>';
                document.body.appendChild(container);
                bar = domElements.minimalistProgress = getElement('minimalistProgress');
            }
            bar.style.width = percent + '%';
            bar.parentElement.style.display = 'block';
            if (percent >= 100) {
                setTimeout(() => {
                    bar.parentElement.style.display = 'none';
                }, 500);
            }
        }



        function showCopyToast(message, duration = 3000, isError = false, url = null) {
            const container = domElements.toastContainer;
            if (!container) return;

            const toast = document.createElement('div');
            toast.className = `toast-message ${isError ? 'error' : ''}`;

            let content = escapeHtml(message);
            if (url) {
                const urlSpan = `<span class="toast-url" title="点击复制" data-url="${escapeHtml(url)}">${escapeHtml(url)}</span>`;
                content += `<br>${urlSpan}`;
            }
            toast.innerHTML = content;

            container.appendChild(toast);

            setTimeout(() => toast.classList.add('show'), 10);

            let timeoutId;
            let remaining = duration;
            let start;
            let controller;

            const startTimeout = () => {
                if (duration <= 0) return;
                start = Date.now();
                timeoutId = setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => {
                        if (toast.parentElement) {
                            toast.remove();
                            toastControllers.delete(controller);
                        }
                    }, 300);
                }, remaining);
            };

            const pauseTimeout = () => {
                if (duration <= 0) return;
                clearTimeout(timeoutId);
                remaining -= Date.now() - start;
            };

            controller = { pause: pauseTimeout, resume: startTimeout };
            toastControllers.add(controller);

            startTimeout();
        }

        function copyConvertedLink() {
            const input = domElements.urlInput.value.trim();
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
            showCopyToast('已复制', 3000, true, convertedUrl);
        }

        let csvFilesConfig = [];
        let isOriginalSize = false;
        let originalUrl = '';
        let replacedUrl = '';
        let hasAccessedSecret = false; // 标记是否访问过
        let currentFunction = 'static'; // 当前功能：static或Another
        let lastFailedUrl = ''; // 记录最后加载失败的URL,用于重试功能
        
        // Image Cache Manager (disabled)
        class ImageCacheManager {
            constructor() {}
            async has(key) { return false; }
            async get(key) { return undefined; }
            async set(key, value, size = 0) {}
            async delete(key) {}
            async clear() {}
            async getAll() { return []; }
            async getSize() { return 0; }
        }

        const imageCache = new ImageCacheManager(50);
        let currentFetchController = null;
        let lastClickTime = 0;
        let currentVideoElement = null;
        let currentObjectUrls = new Set();
        
        

        let galleryData = [];
        let galleryTags = new Set();
        let tagCountsMap = {};
        let isGalleryLoaded = false;


        // =============================================
        // Gallery & Data Handling
        // =============================================

        function initCsvSelect(failed = false) {
            const select = domElements.galleryCsvSelect;
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
        

        function switchFunction(func) {
            currentFunction = func;
            
            domElements.staticResourceBtn.classList.toggle('active', func === 'static');
            domElements.anotherBtn.classList.toggle('active', func === 'Another');
            
            domElements.staticResourceSection.style.display = func === 'static' ? 'block' : 'none';
            domElements.anotherSection.style.display = func === 'Another' ? 'block' : 'none';
        }

        function checkSecretCode() {
            const input = domElements.urlInput;
            const value = input.value.toLowerCase();
            const container = domElements.quickAccessContainer;
            const btnProx = domElements.quickAccessBtn;
            const btnGallery = domElements.galleryBtn;
            const btnRandom = domElements.quickRandomBtn;
            
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
            const input = domElements.urlInput;
            input.value = url;
            
            const detailsPanel = domElements.detailsPanel;
            const detailsGridMinimal = domElements.detailsGridMinimal;
            const toggleBtn = domElements.toggleDetailsBtn;
            
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

        function processCsvData(text, sourceName) {
            const status = domElements.galleryStatus;
            try {
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
                
                const includePanel = domElements.tagIncludePanel;
                const excludePanel = domElements.tagExcludePanel;
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
                status.textContent = `加载成功: ${sourceName} (共 ${galleryData.length} 条数据)`;
                renderGalleryTable();
            } catch (err) {
                console.error(err);
                status.textContent = `加载失败: ${err.message}`;
                throw err; // re-throw for the caller to handle
            }
        }

        // --- Gallery Browser Functions ---
        function openGalleryBrowser() {
            domElements.galleryBrowser.style.display = 'flex';
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
            
            const useThumb = domElements.useThumbCheckbox && domElements.useThumbCheckbox.checked;
            
            fillUrl(useThumb ? (item.thumb || item.original) : item.original, item);
            closeGalleryBrowser();
            
            processLink();
        }

        function closeGalleryBrowser() {
            domElements.galleryBrowser.style.display = 'none';
        }
        
        function debounce(fn, delay = 300) {
            let timer = null;
            return (...args) => {
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => fn(...args), delay);
            };
        }

        async function loadGalleryData() {
            const loading = domElements.galleryLoading;
            const status = domElements.galleryStatus;
            const selectedFile = domElements.galleryCsvSelect.value;
            
            if (!selectedFile) {
                status.textContent = '请选择一个CSV文件';
                return;
            }

            if (selectedFile === '__local__') {
                const input = domElements.localCsvInput;
                if (!input) return;
                const newInput = input.cloneNode(true);
                input.parentNode.replaceChild(newInput, input);
                newInput.addEventListener('change', async () => {
                    const file = newInput.files && newInput.files[0];
                    if (!file) {
                        status.textContent = '未选择本地CSV文件';
                        return;
                    }
                    
                    loading.style.display = 'block';
                    status.textContent = '正在从本地加载: ' + file.name;
                    
                    try {
                        const text = await file.text();
                        processCsvData(text, file.name);
                    } catch (err) {
                        // error is logged in processCsvData
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
                processCsvData(text, selectedFile);
            } catch (err) {
                status.textContent = `加载失败: ${err.message} (请确保 ${selectedFile} 存在)`;
            } finally {
                loading.style.display = 'none';
            }
        }

        let currentPage = 1;
        let perPage = 50;
        function updatePaginationUI(totalFiltered, totalPages) {
            const info = domElements.pageInfo;
            const input = domElements.pageInput;
            if (info) info.textContent = `第 ${currentPage} / ${totalPages} 页`;
            if (input) {
                input.max = Math.max(1, totalPages);
                input.value = currentPage;
            }
            const prevBtn = domElements.prevPageBtn;
            const nextBtn = domElements.nextPageBtn;
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
        
        function getFilteredAndSortedItems() {
            const searchText = domElements.gallerySearch.value.toLowerCase();
            const sortMode = domElements.gallerySort.value;
            const includeTags = Array.from(document.querySelectorAll('#tagIncludePanel .tag-item.selected')).map(el => el.dataset.value);
            const excludeTags = Array.from(document.querySelectorAll('#tagExcludePanel .tag-item.selected')).map(el => el.dataset.value);
            const filterAi = domElements.galleryAiFilter.value;

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

            return items;
        }

        function renderGalleryTable() {
            const tbody = domElements.galleryTableBody;
            const status = domElements.galleryStatus;
            tbody.innerHTML = '';
            
            const tStart = performance.now();
            
            const items = getFilteredAndSortedItems();

            const dateFormatEl = domElements.galleryDateFormat;
            const dateFormat = dateFormatEl ? dateFormatEl.value : 'raw';
            
            const totalFiltered = items.length;
            const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage));
            if (currentPage > totalPages) currentPage = totalPages;
            const startIndex = (currentPage - 1) * perPage;
            const endIndex = startIndex + perPage;
            const pageItems = items.slice(startIndex, endIndex);
            updatePaginationUI(totalFiltered, totalPages);
            
            status.textContent = `显示 ${pageItems.length} / ${totalFiltered} 条数据 (总计 ${galleryData.length})`;
            
            const frag = document.createDocumentFragment();
            pageItems.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.className = 'gallery-row';
                tr.dataset.index = startIndex + index;
                
                const tdAction = document.createElement('td');
                tdAction.className = 'action-col cell-action';

                const btnOriginal = document.createElement('button');
                btnOriginal.textContent = '填入链接';
                btnOriginal.className = 'fill-url-btn action-btn';
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
                    tags.forEach((t, idx) => {
                        const span = document.createElement('span');
                        span.className = 'tag-pill';
                        if (idx >= threshold) span.style.display = 'none';
                        span.textContent = t;
                        tdTags.appendChild(span);
                    });
                    if (tags.length > threshold) {
                        const btn = document.createElement('button');
                        btn.className = 'tag-toggle';
                        btn.textContent = '展开';
                        btn.setAttribute('data-expanded', '0');
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
        



        // =============================================
        // Secret Settings & Proxy
        // =============================================

        function openSecretSettings() {
            domElements.secretSettings.style.display = 'flex';
            hasAccessedSecret = true;
            const container = domElements.quickAccessContainer;
            const btnProx = domElements.quickAccessBtn;
            const btnGallery = domElements.galleryBtn;
            const btnRandom = domElements.quickRandomBtn;
            if (container) container.style.display = 'flex';
            if (btnProx) btnProx.style.display = 'flex';
            if (btnGallery) btnGallery.style.display = 'flex';
            if (btnRandom) btnRandom.style.display = 'flex';
        }

        function closeSecretSettings() {
            domElements.secretSettings.style.display = 'none';
            domElements.urlInput.value = '';
            domElements.secretInput.value = '';
            domElements.anotherInput.value = '';
        }

        function handleSecretProxyChange() {
            const secretProxySelect = domElements.secretProxySelect;
            const secretCustomProxyInput = domElements.secretCustomProxyInput;
            
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
            const secretInput = domElements.secretInput.value.trim();
            const secretProxySelect = domElements.secretProxySelect;
            const secretCustomProxyInput = domElements.secretCustomProxyInput;
            
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
            
            domElements.secretInput.value = '';
        }

        function handleAnotherAcceleration() {
            const AnotherInput = domElements.anotherInput.value.trim();
            
            if (!AnotherInput) {
                alert('❌ 请输入链接！');
                return;
            }
            
            let processedInput = AnotherInput;
            
            // processedInput = processedInput.replace(/^https?:\/\//, '');
            
            const finalUrl = 'https://p.futa.de5.net/' + processedInput;
            
            window.open(finalUrl, '_blank');
            
            domElements.anotherInput.value = '';
        }

        function getProxyUrl() {
            const proxySelect = domElements.proxySelect;
            const customProxyInput = domElements.customProxyInput;
            
            if (proxySelect.value === 'custom') {
                return customProxyInput.value.trim();
            } else {
                return proxySelect.value;
            }
        }

        function handleProxyChange() {
            const proxySelect = domElements.proxySelect;
            const customProxyInput = domElements.customProxyInput;
            
            if (proxySelect.value === 'custom') {
                customProxyInput.style.display = 'block';
            } else {
                customProxyInput.style.display = 'none';
            }
        }


        // =============================================
        // Image/Media Loading & Network
        // =============================================

        async function loadImageWithProgress(url, retryCount = 0, skipCacheOverride = null) {
            const loadingText = domElements.loadingText;
            const progressContainer = domElements.progressContainer;
            const loadingIndicator = domElements.loadingIndicator;
            const fullscreenPreview = domElements.fullscreenPreview;

            // --- Prepare the DOM for image viewing ---
            const video = fullscreenPreview.querySelector('video');
            if (video) {
                video.style.display = 'none';
                video.pause();
            }

            let oldImg = fullscreenPreview.querySelector('img');
            if (!oldImg) {
                oldImg = document.createElement('img');
                oldImg.style.cssText = 'object-fit:contain;width:100%;height:100%;';
                fullscreenPreview.appendChild(oldImg);
            }

            // --- Show Loading Indicator ---
            progressContainer.style.display = 'block'; // Make sure the container for the bar is visible
            loadingIndicator.style.display = 'flex';
            loadingText.textContent = '正在加载图片...';
            fullscreenPreview.style.display = 'flex'; // Ensure preview is visible for streaming 

            // --- Clone image element to ensure clean event listeners ---
            const newImg = oldImg.cloneNode(true);
            newImg.src = ''; 
            newImg.style.display = 'block'; 
            oldImg.parentNode.replaceChild(newImg, oldImg);

            let hasFired = false; // Safety flag

            // --- Attach event listeners to the NEW element ---
            newImg.onload = function() {
                if (hasFired) return;
                hasFired = true;
                loadingIndicator.style.display = 'none';
                fullscreenPreview.style.display = 'flex';
                showCopyToast('图片加载完成', 3000, false, url);
            };

            newImg.onerror = async function() {
                if (hasFired) return;
                hasFired = true;
                console.error(`Failed to load image directly: ${url}`);
                if (retryCount < MAX_RETRIES) {
                    loadingText.textContent = `加载失败，正在重试 (${retryCount + 1}/${MAX_RETRIES})...`;
                    await new Promise(r => setTimeout(r, RETRY_DELAY * (retryCount + 1)));
                    loadImageWithProgress(url, retryCount + 1, skipCacheOverride);
                } else {
                    loadingIndicator.style.display = 'none';
                    lastFailedUrl = url;
                    showErrorWithRetry(`图片加载失败`, url, { current: retryCount + 1, max: MAX_RETRIES });
                    showCopyToast('图片加载失败', 3000, true, url);
                }
            };

            // --- Start loading ---
            newImg.src = url;
            replacedUrl = url;
        }

        function showErrorWithRetry(msg, url, retryInfo = null) {
            const elem = domElements.errorMsg;
            if (elem) {
                let retryStatus = '';
                if (retryInfo) {
                    retryStatus = `<div class="retry-progress">重试进度: ${retryInfo.current}/${retryInfo.max}</div>`;
                }

                elem.innerHTML = ''; 

                const msgSpan = document.createElement('span');
                msgSpan.textContent = msg;
                elem.appendChild(msgSpan);

                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'error-actions';

                const retryBtn = document.createElement('button');
                retryBtn.className = 'retry-btn';
                retryBtn.textContent = '重试';
                retryBtn.addEventListener('click', () => retryLoad(url));
                actionsDiv.appendChild(retryBtn);

                elem.appendChild(actionsDiv);

                if (retryStatus) {
                    const statusDiv = document.createElement('div');
                    statusDiv.innerHTML = retryStatus;
                    elem.appendChild(statusDiv);
                }

                elem.style.display = 'block';
            }
            showMinimaistMessage(msg, 'error');
            lastFailedUrl = url;
        }

        function retryLoad(url) {
            const elem = domElements.errorMsg;
            if (elem) elem.style.display = 'none';
            if (url) {
                loadImageWithProgress(url, 0);
            } else if (lastFailedUrl) {
                loadImageWithProgress(lastFailedUrl, 0);
            }
        }



        function handlePixivLink(originalUrl, skipCache) {
            const proxyUrl = getProxyUrl();
            if (!proxyUrl) {
                showError('请选择或输入代理服务器地址');
                return;
            }
            showCopyToast('检测到Pixiv链接', 3000, false, originalUrl);
            
            const cleanProxyUrl = proxyUrl.replace(/\/+$/, '');
            const replacedUrl = originalUrl.replace(
                /i\.pximg\.net/g, 
                cleanProxyUrl.replace(/^https?:\/\//, '')
            );
            
            showCopyToast('转换链接: i.pximg.net -> ' + cleanProxyUrl.replace(/^https?:\/\//, ''), 3000, true, replacedUrl);
            showInfo('已转接: i.pximg.net -> ' + cleanProxyUrl.replace(/^https?:\/\//, ''));
            
            const resultLink = domElements.resultLink;
            const resultLinkContainer = domElements.resultLinkContainer;
            if (resultLink) resultLink.textContent = replacedUrl;
            if (resultLinkContainer) resultLinkContainer.style.display = 'block';

            const downloadBtnMinimal = domElements.downloadBtnMinimal;
            if (downloadBtnMinimal) downloadBtnMinimal.classList.add('visible');

            isOriginalSize = false;
            
            const imageContainer = domElements.imageContainer;
            if (imageContainer) imageContainer.style.display = 'block';
            
            showCopyToast('正在加载: ', 3000, false, replacedUrl);
            loadImageWithProgress(replacedUrl, 0, skipCache);
        }

        function processLink(skipCache = false) {
            const input = domElements.urlInput.value.trim();
            const errorMsg = domElements.errorMsg;
            const infoMsg = domElements.infoMsg;
            const imageContainer = domElements.imageContainer;
            const resultLinkContainer = domElements.resultLinkContainer;
            const loadingIndicator = domElements.loadingIndicator;

            if (errorMsg) errorMsg.style.display = 'none';
            if (infoMsg) infoMsg.style.display = 'none';
            if (resultLinkContainer) resultLinkContainer.style.display = 'none';
            if (loadingIndicator) loadingIndicator.style.display = 'none';

            if (!input) {
                showError('请先输入一个链接');
                return;
            }

            showCopyToast(skipCache ? '正在处理链接(跳过缓存)' : '正在处理链接', 3000, false, input);

            if (input.toLowerCase() === 'prox') {
                showCopyToast('打开设置面板', 3000, false);
                openSecretSettings();
                hasAccessedSecret = true;
                const container = domElements.quickAccessContainer;
                const btnProx = domElements.quickAccessBtn;
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
                
                if (/i\.pximg\.net/i.test(originalUrl)) {
                    handlePixivLink(originalUrl, skipCache);
                } else {
                    showCopyToast('加载链接: ', 3000, false, urlToLoad);
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
            const imageContainer = domElements.imageContainer;
            const resultLinkContainer = domElements.resultLinkContainer;
            const resultLink = domElements.resultLink;
            const loadingIndicator = domElements.loadingIndicator;
            const downloadBtnMinimal = domElements.downloadBtnMinimal;

            if (imageContainer) imageContainer.style.display = 'block';
            if (resultLinkContainer) resultLinkContainer.style.display = 'none';
            if (loadingIndicator) loadingIndicator.style.display = 'flex';
            if (downloadBtnMinimal) downloadBtnMinimal.classList.remove('visible');
            
            showCopyToast('正在请求链接...', 3000, false, url);
            showInfo('正在加载...');

            try {
                const response = await fetchWithTimeout(url, {}, FETCH_TIMEOUT);
                const contentType = response.headers.get('content-type') || '';
                
                showCopyToast('Content-Type: ' + contentType.split(';')[0], 3000, false, url);
                
                if (contentType.includes('application/json') || contentType.includes('text/json')) {
                    showCopyToast('检测到JSON响应，正在解析...', 3000, false, url);
                    const data = await response.json();
                    const imageUrl = extractImageUrl(data);
                    
                    if (imageUrl) {
                        showCopyToast('从JSON提取链接: ', 3000, false, imageUrl);
                        await loadMediaFromUrl(imageUrl);
                    } else {
                        showCopyToast('未找到图片链接，显示内容预览', 3000, false, url);
                        showContentPreview(JSON.stringify(data, null, 2), url, 'json');
                    }
                } else if (contentType.includes('text/')) {
                    showCopyToast('检测到文本响应，正在提取链接...', 3000, false, url);
                    const text = await response.text();
                    const links = extractAllUrls(text);
                    
                    if (links.length > 0) {
                        showCopyToast('检测到 ' + links.length + ' 个链接', 3000, false, url);
                        showContentPreview(text, url, 'text', links);
                    } else {
                        showCopyToast('未检测到链接，显示文本内容', 3000, false, url);
                        showContentPreview(text, url, 'text', []);
                    }
                } else {
                    showCopyToast('检测到媒体类型，直接加载...', 3000, false, url);
                    await loadMediaFromUrl(url);
                }
            } catch (err) {
                showCopyToast('加载失败: ' + err.message, 3000, false, url);
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

            const panel = domElements.contentPreviewPanel;
            const textDiv = domElements.contentPreviewText;
            const linksDiv = domElements.contentPreviewLinks;

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
            
            const loadingIndicator = domElements.loadingIndicator;
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }

        function closeContentPreview() {
            const panel = domElements.contentPreviewPanel;
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

            showCopyToast('加载选中链接: ', 3000, false, link);
            closeContentPreview();
            
            const input = domElements.urlInput;
            input.value = link;
            
            await loadMediaFromUrl(link);
        }

        async function loadMediaFromUrl(url) {
            const resultLink = domElements.resultLink;
            const resultLinkContainer = domElements.resultLinkContainer;
            const loadingIndicator = domElements.loadingIndicator;

            showCopyToast('准备加载媒体...', 3000, false, url);
            
            originalUrl = url;
            replacedUrl = url;

            const proxyUrl = getProxyUrl();
            const cleanProxyUrl = proxyUrl ? proxyUrl.replace(/\/+$/, '') : '';

            if (cleanProxyUrl && /i\.pximg\.net/i.test(url)) {
                showCopyToast('转换Pixiv链接...', 3000, false, url);
                replacedUrl = url.replace(
                    /i\.pximg\.net/g, 
                    cleanProxyUrl.replace(/^https?:\/\//, '')
                );
                showCopyToast('转换完成: ', 3000, false, replacedUrl);
            }

            if (resultLink) resultLink.textContent = replacedUrl;
            if (resultLinkContainer) resultLinkContainer.style.display = 'block';

            isOriginalSize = false;

            const isVideo = /\.(mp4|webm|mov|avi)(\?.*)?$/i.test(replacedUrl);

            if (isVideo) {
                showCopyToast('检测到视频，准备播放...', 3000, false, replacedUrl);
                showVideoPreview(replacedUrl);
            } else {
                showCopyToast('正在加载图片...', 3000, false, replacedUrl);
                showInfo('正在加载图片...');
                loadImageWithProgress(replacedUrl);
            }
        }

        function showVideoPreview(url) {
            const preview = domElements.fullscreenPreview;
            const img = preview.querySelector('img');

            // Ensure the <img> element is hidden
            if (img) {
                img.style.display = 'none';
            }

            // Ensure a <video> element exists, create if it doesn't
            let video = preview.querySelector('video');
            if (!video) {
                video = document.createElement('video');
                video.controls = true;
                video.autoplay = true;
                video.style.cssText = 'width:100%;height:100%;object-fit:contain;';
                preview.appendChild(video);
            }
            
            video.style.display = 'block';
            video.src = url;
            video.play().catch(e => console.warn("Video play failed, likely requires user interaction.", e));
            currentVideoElement = video;
            
            const loadingIndicator = domElements.loadingIndicator;
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            
            showCopyToast('视频已加载', 3000, false, url);
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
            const input = domElements.urlInput.value.trim();
            
            if (!input) {
                showError('❌ 请先输入一个链接！');
                return;
            }

            if (input.toLowerCase() === 'prox') {
                openSecretSettings();
                hasAccessedSecret = true;
                const container = domElements.quickAccessContainer;
                const btnProx = domElements.quickAccessBtn;
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
            const elem = domElements.errorMsg;
            if (elem) {
                elem.textContent = msg;
                elem.style.display = 'block';
            }
            showMinimaistMessage(msg.replace(/\n/g, ' ').trim(), 'error');
        }

        function showInfo(msg) {
            const elem = domElements.infoMsg;
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
            const input = domElements.urlInput;
            const pageInput = domElements.urlPageInput;
            const miniPageInput = domElements.miniUrlPageInput;
            if (!input || !pageInput) return;
            const page = getUrlPage(input.value);
            if (page !== null) {
                const displayPage = page + 1;
                pageInput.value = displayPage;
                if (miniPageInput) miniPageInput.value = displayPage;
            }
        }

        function changeUrlPage(delta) {
            const input = domElements.urlInput;
            let val = input.value.trim();
            if (!val) return;
            
            let page = getUrlPage(val);
            if (page === null) page = 0;
            
            let newPage = page + delta;
            if (newPage < 0) newPage = 0;
            
            const newUrl = setUrlPage(val, newPage);
            input.value = newUrl;
            const displayPage = newPage + 1;
            domElements.urlPageInput.value = displayPage;
            const miniPageInput = domElements.miniUrlPageInput;
            if (miniPageInput) miniPageInput.value = displayPage;

            processLink();
        }

        function jumpUrlPage(page) {
            const input = domElements.urlInput;
            let val = input.value.trim();
            if (!val) return;
            
            let displayPage = parseInt(page, 10);
            if (isNaN(displayPage) || displayPage < 1) displayPage = 1;
            
            let newPage = displayPage - 1;
            if (newPage < 0) newPage = 0;
            
            const newUrl = setUrlPage(val, newPage);
            input.value = newUrl;
            domElements.urlPageInput.value = displayPage;
            const miniPageInput = domElements.miniUrlPageInput;
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
            
            const customInput = domElements.customProxyInput;
            if (customInput && customInput.value.trim() !== '') {
                apiUrl = customInput.value.trim();
            }

            showCopyToast('正在准备API请求...', 3000, false, apiUrl);
            
            const separator = apiUrl.includes('?') ? '&' : '?';
            const targetUrl = apiUrl + separator + 't=' + Date.now();
            
            showCopyToast('API地址: ', 3000, false, apiUrl);
            
            const errorMsg = domElements.errorMsg;
            const infoMsg = domElements.infoMsg;
            const imageContainer = domElements.imageContainer;
            const resultLinkContainer = domElements.resultLinkContainer;
            const resultLink = domElements.resultLink;
            const loadingIndicator = domElements.loadingIndicator;
            const downloadBtnMinimal = domElements.downloadBtnMinimal;

            if (errorMsg) errorMsg.style.display = 'none';
            if (infoMsg) infoMsg.style.display = 'none';
            if (imageContainer) imageContainer.style.display = 'block';
            if (resultLinkContainer) resultLinkContainer.style.display = 'block';
            
            if (loadingIndicator) loadingIndicator.style.display = 'block';
            
            if (resultLink) resultLink.textContent = apiUrl;
            
            originalUrl = ''; 
            replacedUrl = targetUrl;
            
            isOriginalSize = false;
            
            if (downloadBtnMinimal) downloadBtnMinimal.classList.add('visible');
            
            showCopyToast('正在加载随机图片...', 3000, false, targetUrl);
            loadImageWithProgress(targetUrl);
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                var secretSettings = domElements.secretSettings;
                var galleryBrowser = domElements.galleryBrowser;
                var detailsPanel = domElements.detailsPanel;
                var floatingMenuContent = domElements.floatingMenuContent;
                var contentPreviewPanel = domElements.contentPreviewPanel;
                
                if (contentPreviewPanel && contentPreviewPanel.classList.contains('show')) {
                    closeContentPreview();
                } else if (secretSettings && secretSettings.style.display === 'flex') {
                    closeSecretSettings();
                } else if (galleryBrowser && galleryBrowser.style.display === 'flex') {
                    closeGalleryBrowser();
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
            const preview = domElements.fullscreenPreview;
            const img = preview.querySelector('img');
            if (!img) return;
            
            currentZoom = Math.max(CONFIG.zoomMin, Math.min(CONFIG.zoomMax, currentZoom + delta));
            img.style.transform = 'scale(' + currentZoom + ')';
            img.style.transformOrigin = 'center center';
        }
        
        function resetZoom() {
            const preview = domElements.fullscreenPreview;
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
                const preview = domElements.fullscreenPreview;
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
            // 初始化 DOM 元素缓存
            initDomElements();

            handleProxyChange();
            handleSecretProxyChange();
            
            hasAccessedSecret = false;
            const quickBtn = domElements.quickAccessBtn;
            const galleryBtn = domElements.galleryBtn;
            const randomBtn = domElements.quickRandomBtn;
            const container = domElements.quickAccessContainer;
            if (quickBtn) quickBtn.style.display = 'none';
            if (galleryBtn) galleryBtn.style.display = 'none';
            if (randomBtn) randomBtn.style.display = 'none';
            if (container) container.style.display = 'none';

            const toastContainer = domElements.toastContainer;
            if (toastContainer) {
                toastContainer.addEventListener('mouseover', () => {
                    toastControllers.forEach(c => c.pause());
                });
                toastContainer.addEventListener('mouseout', () => {
                    toastControllers.forEach(c => c.resume());
                });

                toastContainer.addEventListener('click', (e) => {
                    const urlSpan = e.target.closest('.toast-url');
                    if (urlSpan && urlSpan.dataset.url) {
                        e.stopPropagation();
                        navigator.clipboard.writeText(urlSpan.dataset.url)
                            .then(() => {
                                urlSpan.textContent = '链接已复制!';
                                urlSpan.style.pointerEvents = 'none';
                                const toast = urlSpan.closest('.toast-message');
                                setTimeout(() => {
                                    if (toast && toast.parentElement) {
                                        toast.remove();
                                    }
                                }, 1500);
                            })
                            .catch(err => console.error('Failed to copy URL: ', err));
                    }
                });
            }

            setupDragAndDrop();
            loadCsvConfig();

            const debouncedRender = debounce(renderGalleryTable, 300);
            domElements.gallerySearch.addEventListener('input', debouncedRender);
            const tagIncludePanel = domElements.tagIncludePanel;
            const tagExcludePanel = domElements.tagExcludePanel;
            const aiFilterEl = domElements.galleryAiFilter;
            const sortEl = domElements.gallerySort;
            const dateFmtEl = domElements.galleryDateFormat;
            const perPageEl = domElements.perPageSelect;
            const prevBtn = domElements.prevPageBtn;
            const nextBtn = domElements.nextPageBtn;
            const jumpBtn = domElements.jumpPageBtn;
            const pageInput = domElements.pageInput;
            const selectedInclude = domElements.selectedInclude;
            const selectedExclude = domElements.selectedExclude;
            const clearSelectedBtn = domElements.clearSelectedTags;

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
            
            const openTagIncludeBtn = domElements.openTagInclude;
            const openTagExcludeBtn = domElements.openTagExclude;
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

            bindEventListeners();
        });

        function setupDragAndDrop() {
            const galleryBrowser = domElements.galleryBrowser;
            
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
                    const loading = domElements.galleryLoading;
                    const status = domElements.galleryStatus;
                    
                    loading.style.display = 'block';
                    status.textContent = '正在加载: ' + file.name;
                    
                    try {
                        const text = await file.text();
                        processCsvData(text, file.name);
                    } catch (err) {
                        // error is logged in processCsvData
                    } finally {
                        loading.style.display = 'none';
                    }
                } else {
                    showMinimaistMessage('请上传CSV文件', 'error');
                }
            }
        }

        function bindEventListeners() {
            const D = (id, event, handler) => {
                const element = domElements[id] || document.getElementById(id);
                if (element) {
                    element.addEventListener(event, handler);
                }
            };

            // Floating Menu and Preview
            D('toggleFloatingMenuBtn', 'click', toggleFloatingMenu);
            D('collapseMenuBtn', 'click', collapseMenu);
            D('processLinkBtn', 'click', () => processLink(false));
            D('loadApiImageBtn', 'click', loadApiImage);
            D('copyConvertedLinkBtn', 'click', copyConvertedLink);
            D('proxySelect', 'change', handleProxyChange);
            D('urlInput', 'input', () => { checkSecretCode(); updatePageControlFromUrl(); });

            // Pagers
            D('miniPagerPrevBtn', 'click', () => changeUrlPage(-1));
            D('miniPagerNextBtn', 'click', () => changeUrlPage(1));
            D('miniUrlPageInput', 'change', (e) => jumpUrlPage(e.target.value));
            D('pagerPrevBtn', 'click', () => changeUrlPage(-1));
            D('pagerNextBtn', 'click', () => changeUrlPage(1));
            D('urlPageInput', 'change', (e) => jumpUrlPage(e.target.value));

            // Content Preview
            D('closeContentPreviewBtn_header', 'click', closeContentPreview);
            D('closeContentPreviewBtn_footer', 'click', closeContentPreview);
            D('processSelectedLinkBtn', 'click', processSelectedLink);

            // Main Preview and Quick Access
            D('downloadBtnMinimal', 'click', downloadImage);
            D('toggleDetailsBtn', 'click', toggleDetailsPanel);
            D('quickAccessBtn', 'click', openSecretSettings);
            D('galleryBtn', 'click', openGalleryBrowser);
            D('quickRandomBtn', 'click', quickRandomImage);
            D('resultLink', 'click', (e) => copyToClipboard(e.currentTarget));
            D('downloadBtn', 'click', downloadImage);

            // Secret Settings Panel
            D('staticResourceBtn', 'click', () => switchFunction('static'));
            D('anotherBtn', 'click', () => switchFunction('Another'));
            D('secretProxySelect', 'change', handleSecretProxyChange);
            D('handleSecretActionBtn', 'click', handleSecretAction);
            D('closeSecretSettingsBtn', 'click', closeSecretSettings);

            // Gallery Browser
            D('pickRandomImageBtn', 'click', pickRandomImage);
            D('closeGalleryBrowserBtn', 'click', closeGalleryBrowser);
            D('galleryCsvSelect', 'change', loadGalleryData);

            // Event Delegation for Gallery Table
            const galleryTableBody = domElements.galleryTableBody;
            if (galleryTableBody) {
                galleryTableBody.addEventListener('click', (e) => {
                    const target = e.target;
                    if (target.classList.contains('fill-url-btn')) {
                        const row = target.closest('.gallery-row');
                        if (row && row.dataset.index) {
                            const index = parseInt(row.dataset.index, 10);
                            const items = getFilteredAndSortedItems();
                            const item = items[index];
                            if (item) {
                                const useThumb = domElements.useThumbCheckbox && domElements.useThumbCheckbox.checked;
                                fillUrl(useThumb ? (item.thumb || item.original) : item.original, item);
                                closeGalleryBrowser();
                            }
                        }
                    } else if (target.classList.contains('tag-toggle')) {
                        const expanded = target.getAttribute('data-expanded') === '1';
                        const tagsCell = target.closest('.cell-tags');
                        if (tagsCell) {
                            const spans = tagsCell.querySelectorAll('.tag-pill');
                            const threshold = 3;
                            if (expanded) {
                                spans.forEach((s, idx) => { if (idx >= threshold) s.style.display = 'none'; });
                                target.textContent = '展开';
                                target.setAttribute('data-expanded', '0');
                            } else {
                                spans.forEach(s => { s.style.display = 'inline-block'; });
                                target.textContent = '收起';
                                target.setAttribute('data-expanded', '1');
                            }
                        }
                    }
                });
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