/* Extracted from network-epic.html (refactor script). Tool logic. */

        /* EPIC 限免领取工具 —— 纯前端（Aurora 版）
         * 数据来自 Epic 免费游戏促销接口（PC 端），页面不生成模拟数据；
         * 接口失败时回退本地缓存，并提供重试。
         */
        (function () {
            'use strict';

            // ===== 常量 =====
            var REGION = 'CN';                // 固定地区
            var CACHE_TTL = 60 * 1000;        // 60s 内不重复请求（内存）
            var STORE_CACHE_KEY = 'EPIC_CACHE_V1';  // 本地持久缓存（离线回退）
            var REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            var PROXY = 'https://cors.019425.xyz/?url='; // 换代理只改这一处
            var EPIC_API = 'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=zh-CN&platform=web&count=100&country=' + REGION;

            var appOk = typeof window.app !== 'undefined' && window.app && typeof window.app.showToast === 'function';
            function toast(msg, type) { if (appOk) window.app.showToast(msg, type || 'success'); }

            // 带重试的 JSON 请求；每次尝试追加时间戳参数，规避缓存/限流波动
            function api(url, tries) {
                tries = tries || 2;
                var attempt = 0;
                function once() {
                    attempt++;
                    var u = url.indexOf('?') >= 0 ? url + '&_=' + Date.now() + '_' + attempt : url;
                    return fetch(PROXY + encodeURIComponent(u), { method: 'GET' }).then(function (r) {
                        if (!r.ok) throw new Error('HTTP ' + r.status);
                        return r.json();
                    }).catch(function (e) {
                        if (attempt < tries) return new Promise(function (res) { setTimeout(res, 800 * attempt); }).then(once);
                        throw e;
                    });
                }
                return once();
            }

            function esc(s) {
                return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            }
            function pad(n) { return String(n).padStart(2, '0'); }
            function fmtDateTime(ts) {
                if (!ts) return '—';
                var d = new Date(ts * 1000);
                return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
            }
            function nowText() {
                var d = new Date();
                return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
            }

            // ===== Epic 数据转换 =====
            function toUnix(iso) { return Math.floor(new Date(iso).getTime() / 1000); }
            function epicImage(keys) {
                var order = ['DieselGameBoxTall', 'DieselGameBox', 'DieselStoreFrontTall', 'OfferImageWide', 'VaultOpened'];
                for (var i = 0; i < order.length; i++) {
                    var hit = (keys || []).filter(function (k) { return k.type === order[i]; })[0];
                    if (hit && hit.url) return hit.url;
                }
                var first = (keys || []).filter(function (k) { return k.url; })[0];
                return first ? first.url : '';
            }
            // 只保留「限时免费（进行中或即将开始）」，已过期与永久免费都不算；同 offer 去重
            function transformEpic(elements) {
                var now = Math.floor(Date.now() / 1000);
                var out = [];
                (elements || []).forEach(function (e) {
                    var nowPromo = e && e.promotions && e.promotions.promotionalOffers && e.promotions.promotionalOffers[0] && e.promotions.promotionalOffers[0].promotionalOffers && e.promotions.promotionalOffers[0].promotionalOffers[0];
                    var upPromo = e && e.promotions && e.promotions.upcomingPromotionalOffers && e.promotions.upcomingPromotionalOffers[0] && e.promotions.upcomingPromotionalOffers[0].promotionalOffers && e.promotions.upcomingPromotionalOffers[0].promotionalOffers[0];
                    var promo = nowPromo || upPromo;
                    if (!promo) return;
                    var start = toUnix(promo.startDate);
                    var end = toUnix(promo.endDate);
                    if (end <= now) return;
                    var mapping = (e.catalogNs && e.catalogNs.mappings || []).filter(function (m) { return m.pageType === 'productHome'; })[0];
                    var slug = (mapping && mapping.pageSlug) || e.productSlug || '';
                    if (!slug) return;
                    out.push({
                        title: e.title || '未知游戏',
                        offerId: e.id,
                        sandboxId: e.namespace,
                        url: 'https://store.epicgames.com/zh-CN/p/' + slug,
                        img: epicImage(e.keyImages),
                        startTime: start,
                        endTime: end,
                        status: start <= now ? 'active' : 'upcoming'
                    });
                });
                var seen = {};
                out = out.filter(function (g) {
                    var k = g.offerId + '|' + g.sandboxId;
                    if (seen[k]) return false;
                    seen[k] = true;
                    return true;
                });
                out.sort(function (a, b) { return a.startTime - b.startTime; });
                return out;
            }

            // ===== 状态条 / 轻提示 =====
            function setStatus(tag, detail, isError) {
                var el = document.getElementById('data-status');
                if (!el) return;
                el.textContent = tag + ' · ' + (detail || '');
                el.style.color = isError ? '#f87171' : '';
            }

            // ===== 渲染 =====
            var grid = document.getElementById('grid-pc');
            var chip = document.getElementById('chip-pc');
            var refreshBtn = document.getElementById('btn-refresh');
            var loading = false;
            var cached = null; // { at, games }

            function gameCard(g) {
                var statusHtml = g.status === 'active'
                    ? '<div class="epic-status active"><span class="epic-dot" aria-hidden="true"></span>正在进行</div>'
                    : '<div class="epic-status upcoming"><span class="epic-dot" aria-hidden="true"></span>即将推出</div>';
                var checkboxHtml = g.status === 'active'
                    ? '<input type="checkbox" class="epic-check" aria-label="选择 ' + esc(g.title) + '">'
                    : '';
                return '<div class="epic-card" data-url="' + esc(g.url) + '"' +
                    ' data-offer-id="' + esc(g.offerId) + '" data-sandbox-id="' + esc(g.sandboxId) + '" data-status="' + esc(g.status) + '">' +
                    '<div class="epic-card-media">' +
                    '<img loading="lazy" decoding="async" src="' + esc(g.img) + '" alt="' + esc(g.title) + '">' +
                    '<a href="' + esc(g.url) + '" target="_blank" rel="noopener noreferrer" class="epic-detail" title="查看详情" aria-label="查看详情">' +
                    '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></a>' +
                    checkboxHtml +
                    '</div>' +
                    '<div class="epic-card-body">' +
                    '<div class="epic-title">' + esc(g.title) + '</div>' +
                    '<div class="epic-dates">' +
                    '<div class="epic-date"><span class="epic-date-label">开始</span><span class="epic-time" data-timestamp="' + g.startTime + '"></span></div>' +
                    '<div class="epic-date"><span class="epic-date-label">结束</span><span class="epic-time" data-timestamp="' + g.endTime + '"></span></div>' +
                    '</div>' + statusHtml + '</div></div>';
            }
            function renderGrid(games) {
                games = games || [];
                chip.textContent = games.length;
                grid.classList.remove('epic-skeleton');
                grid.className = 'epic-grid';
                grid.innerHTML = games.length
                    ? games.map(gameCard).join('')
                    : '<div class="epic-empty">当前没有可领取的 PC 端限免</div>';
                grid.querySelectorAll('.epic-time').forEach(function (el) {
                    el.textContent = fmtDateTime(el.getAttribute('data-timestamp'));
                });
                bindGridEvents();
            }
            function skeletonGrid() {
                var html = '';
                for (var i = 0; i < 8; i++) {
                    html += '<div class="skel-card"><div class="skel-img"></div><div class="skel-l"></div><div class="skel-l short"></div></div>';
                }
                grid.className = 'epic-skeleton';
                grid.innerHTML = html;
            }
            function errorPanel(msg) {
                grid.className = 'epic-grid';
                grid.innerHTML = '<div class="epic-error">' +
                    '<h3>Epic 数据加载失败</h3>' +
                    '<p>' + esc(msg || '网络请求失败，请稍后重试。') + '</p>' +
                    '<button class="btn btn-secondary" type="button" data-action="retry-epic">重新加载</button></div>';
                grid.querySelector('[data-action="retry-epic"]').addEventListener('click', function () { loadEpic(true); });
            }

            // ===== 本地持久缓存（离线回退） =====
            function writeCache(json) {
                try { localStorage.setItem(STORE_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: json })); } catch (e) {}
            }
            function readCache() {
                try {
                    var raw = localStorage.getItem(STORE_CACHE_KEY);
                    return raw ? JSON.parse(raw) : null;
                } catch (e) { return null; }
            }
            function formatTs(ts) {
                try { return new Date(ts).toLocaleString(); } catch (e) { return '未知时间'; }
            }

            function loadEpic(force) {
                if (loading) return;
                if (cached && (Date.now() - cached.at < CACHE_TTL) && !force) {
                    renderGrid(cached.games);
                    setStatus('实时数据 ' + cached.games.length + ' 款', '更新于 ' + nowText());
                    return;
                }
                loading = true;
                refreshBtn.disabled = true;
                if (!cached) skeletonGrid();
                return api(EPIC_API, 3)
                    .then(function (json) {
                        var elements = (json && json.data && json.data.Catalog && json.data.Catalog.searchStore && json.data.Catalog.searchStore.elements) || [];
                        var games = transformEpic(elements);
                        cached = { at: Date.now(), games: games };
                        writeCache(json);
                        renderGrid(games);
                        setStatus('实时数据 ' + games.length + ' 款', '更新于 ' + nowText());
                    })
                    .catch(function (e) {
                        var local = readCache();
                        if (local && local.data && local.data.data && local.data.data.Catalog) {
                            var els = local.data.data.Catalog.searchStore.elements || [];
                            var games = transformEpic(els);
                            cached = { at: Date.now(), games: games };
                            renderGrid(games);
                            setStatus('离线缓存 ' + games.length + ' 款', '更新于 ' + formatTs(local.ts));
                            toast('网络请求失败，已使用本地缓存', 'error');
                        } else {
                            errorPanel(e && e.message ? e.message : '');
                            setStatus('数据获取失败', (e && e.message) || '未知错误', true);
                        }
                    })
                    .finally(function () {
                        loading = false;
                        refreshBtn.disabled = false;
                    });
            }
            refreshBtn.addEventListener('click', function () { loadEpic(true); });

            // ===== 勾选 / 托盘 / 批量领取 =====
            var tray = document.getElementById('selected-tray');
            var claimBtn = document.getElementById('btn-claim');
            var trayMap = new Map();
            var inboundFlights = new Map();

            function keyOf(card) { return (card.dataset.offerId || '') + '_' + (card.dataset.sandboxId || ''); }
            function cardsByKey(key) { return Array.prototype.slice.call(document.querySelectorAll('.epic-card')).filter(function (c) { return keyOf(c) === key; }); }
            function selectedItems() {
                var seen = new Set();
                var items = [];
                document.querySelectorAll('.epic-card').forEach(function (card) {
                    var cb = card.querySelector('.epic-check');
                    if (!cb || !cb.checked) return;
                    var key = keyOf(card);
                    if (seen.has(key)) return;
                    seen.add(key);
                    var imgEl = card.querySelector('.epic-card-media img');
                    items.push({
                        key: key, card: card, img: imgEl ? imgEl.src : '',
                        title: (card.querySelector('.epic-title') || {}).textContent || '未知游戏',
                        offerId: card.dataset.offerId || '', sandboxId: card.dataset.sandboxId || ''
                    });
                });
                return items;
            }
            function clearSelection() {
                document.querySelectorAll('.epic-check:checked').forEach(function (cb) { cb.checked = false; });
                inboundFlights.forEach(function (abort) { abort(); });
                inboundFlights.clear();
                trayMap.forEach(function (el) { el.remove(); });
                trayMap.clear();
                tray.classList.remove('active');
                syncClaimButton();
            }
            function syncClaimButton() {
                var n = selectedItems().length;
                claimBtn.disabled = n === 0;
                claimBtn.textContent = n > 0 ? '批量领取 (' + n + ')' : '批量领取';
            }
            function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
            function liveFlight(fromRect, getTarget, imgSrc, opts) {
                opts = opts || {};
                var duration = opts.duration || 560;
                var fadeOut = !!opts.fadeOut;
                var onDone = opts.onDone || function () {};
                if (REDUCE_MOTION || !fromRect || !imgSrc || fromRect.width <= 0) { onDone(); return null; }
                var clone = document.createElement('div');
                clone.className = 'fly-clone';
                clone.style.width = fromRect.width + 'px';
                clone.style.height = fromRect.height + 'px';
                clone.style.backgroundImage = "url('" + imgSrc + "')";
                clone.style.transform = 'translate(' + fromRect.left + 'px,' + fromRect.top + 'px)';
                document.body.appendChild(clone);
                var w0 = fromRect.width, h0 = fromRect.height;
                var x0 = fromRect.left + w0 / 2, y0 = fromRect.top + h0 / 2;
                var rafId = 0, finished = false, t0 = performance.now();
                function abort() {
                    if (finished) return;
                    finished = true;
                    cancelAnimationFrame(rafId);
                    clone.style.transition = 'opacity 0.16s ease';
                    clone.style.opacity = '0';
                    setTimeout(function () { clone.remove(); }, 180);
                }
                function frame(now) {
                    if (finished) return;
                    var to = getTarget();
                    if (!to || to.width <= 0) { abort(); return; }
                    var p = easeInOutCubic(Math.min(1, (now - t0) / duration));
                    var x2 = to.left + to.width / 2, y2 = to.top + to.height / 2;
                    var arc = Math.min(110, Math.max(36, Math.abs(y2 - y0) * 0.16));
                    var cx = (x0 + x2) / 2, cy = Math.min(y0, y2) - arc;
                    var mt = 1 - p;
                    var x = mt * mt * x0 + 2 * mt * p * cx + p * p * x2;
                    var y = mt * mt * y0 + 2 * mt * p * cy + p * p * y2;
                    var w = w0 + (to.width - w0) * p;
                    var h = h0 + (to.height - h0) * p;
                    clone.style.transform = 'translate(' + (x - w0 / 2) + 'px,' + (y - h0 / 2) + 'px) rotate(' + (Math.sin(p * Math.PI) * (x2 >= x0 ? 4 : -4)) + 'deg) scale(' + (w / w0) + ',' + (h / h0) + ')';
                    if (fadeOut && p > 0.65) clone.style.opacity = String(1 - ((p - 0.65) / 0.35) * 0.95);
                    if (p >= 1) { finished = true; onDone(); clone.remove(); return; }
                    rafId = requestAnimationFrame(frame);
                }
                rafId = requestAnimationFrame(frame);
                return abort;
            }
            function makeTrayItem(item) {
                var el = document.createElement('div');
                el.className = 'tray-item pre';
                el.dataset.key = item.key;
                el.dataset.offerId = item.offerId;
                el.dataset.sandboxId = item.sandboxId;
                el.title = item.title;
                el.innerHTML = '<img src="' + item.img + '" alt=""><span class="remove-btn" aria-hidden="true">&times;</span>';
                el.addEventListener('click', function (e) {
                    e.stopPropagation();
                    var key = this.dataset.key;
                    cardsByKey(key).forEach(function (c) { var cb = c.querySelector('.epic-check'); if (cb) cb.checked = false; });
                    syncSelection({ flyBack: [key] });
                });
                return el;
            }
            function revealTrayItem(el) {
                el.classList.remove('pre');
                el.classList.add('pop', 'land');
                setTimeout(function () { el.classList.remove('pop', 'land'); }, 560);
            }
            function syncSelection(options) {
                options = options || {};
                var want = selectedItems();
                var wantKeys = new Set(want.map(function (i) { return i.key; }));
                var flyNewKeys = new Set((options.flyNew || []).map(keyOf));
                var flyBackKeys = new Set(options.flyBack || []);
                trayMap.forEach(function (el, key) {
                    if (wantKeys.has(key)) return;
                    trayMap.delete(key);
                    var abortInbound = inboundFlights.get(key);
                    if (abortInbound) { inboundFlights.delete(key); abortInbound(); }
                    else if (flyBackKeys.has(key)) {
                        var card = cardsByKey(key)[0];
                        var cardImg = card && card.querySelector('.epic-card-media');
                        if (cardImg) {
                            var r = cardImg.getBoundingClientRect();
                            if (r.bottom > 0 && r.top < window.innerHeight) {
                                var imgEl = el.querySelector('img');
                                liveFlight(el.getBoundingClientRect(), function () { return cardImg.getBoundingClientRect(); }, imgEl ? imgEl.src : '', { duration: 460, fadeOut: true });
                            }
                        }
                    }
                    el.classList.add('exit');
                    setTimeout(function () { el.remove(); }, 260);
                });
                var added = [];
                want.forEach(function (item) {
                    if (trayMap.has(item.key)) return;
                    var el = makeTrayItem(item);
                    tray.appendChild(el);
                    trayMap.set(item.key, el);
                    added.push({ item: item, el: el });
                });
                tray.classList.toggle('active', want.length > 0);
                syncClaimButton();
                if (added.length > 0) {
                    requestAnimationFrame(function () {
                        if (tray.scrollWidth > tray.clientWidth) tray.scrollTo({ left: tray.scrollWidth, behavior: REDUCE_MOTION ? 'auto' : 'smooth' });
                        added.forEach(function (entry, idx) {
                            var item = entry.item, el = entry.el;
                            var doFly = flyNewKeys.has(item.key);
                            if (!doFly) { revealTrayItem(el); return; }
                            function start() {
                                if (!el.isConnected || trayMap.get(item.key) !== el) return;
                                var cardImg = item.card.querySelector('.epic-card-media');
                                var from = cardImg ? cardImg.getBoundingClientRect() : null;
                                var abort = liveFlight(from, function () {
                                    if (!el.isConnected || trayMap.get(item.key) !== el) return null;
                                    return el.getBoundingClientRect();
                                }, item.img, { duration: 560, onDone: function () { inboundFlights.delete(item.key); revealTrayItem(el); } });
                                if (abort) inboundFlights.set(item.key, abort);
                            }
                            if (options.stagger) setTimeout(start, idx * 60); else start();
                        });
                    });
                }
            }
            function bindGridEvents() {
                Array.prototype.forEach.call(grid.querySelectorAll('.epic-check'), function (cb) {
                    cb.addEventListener('change', function () {
                        var card = this.closest('.epic-card');
                        if (this.checked) syncSelection({ flyNew: card ? [card] : [] });
                        else syncSelection({ flyBack: card ? [keyOf(card)] : [] });
                    });
                });
                Array.prototype.forEach.call(document.querySelectorAll('.epic-card'), function (card) {
                    card.addEventListener('click', function (e) {
                        if (isDragActive) return;
                        if (e.target.closest('.epic-detail') || e.target.classList.contains('epic-check')) return;
                        var cb = card.querySelector('.epic-check');
                        if (!cb) return;
                        cb.checked = !cb.checked;
                        if (cb.checked) syncSelection({ flyNew: [card] });
                        else syncSelection({ flyBack: [keyOf(card)] });
                    });
                });
            }

            // 拖拽框选
            var startX = 0, startY = 0, isSelecting = false, isDragActive = false;
            var previouslyChecked = new Set();
            var dragSelector = document.createElement('div');
            dragSelector.id = 'drag-selector';
            document.body.appendChild(dragSelector);
            document.addEventListener('mousedown', function (e) {
                if (e.target.closest('.btn') || e.target.closest('.epic-detail') || e.target.closest('.epic-check') || e.target.closest('.selected-tray') || e.target.closest('.epic-dock') || e.target.closest('.epic-modal')) return;
                startX = e.clientX; startY = e.clientY;
                isSelecting = false; isDragActive = false;
                previouslyChecked.clear();
                document.querySelectorAll('.epic-check:checked').forEach(function (cb) {
                    var card = cb.closest('.epic-card');
                    if (card) previouslyChecked.add(keyOf(card));
                });
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
            function onMouseMove(e) {
                var moveX = e.clientX - startX, moveY = e.clientY - startY;
                if (!isSelecting && (Math.abs(moveX) > 8 || Math.abs(moveY) > 8)) { isSelecting = true; isDragActive = true; dragSelector.style.display = 'block'; }
                if (isSelecting) {
                    var left = Math.min(startX, e.clientX), top = Math.min(startY, e.clientY);
                    var width = Math.abs(moveX), height = Math.abs(moveY);
                    dragSelector.style.left = left + 'px'; dragSelector.style.top = top + 'px';
                    dragSelector.style.width = width + 'px'; dragSelector.style.height = height + 'px';
                    var selRect = { left: left, top: top, right: left + width, bottom: top + height };
                    document.querySelectorAll('.epic-card').forEach(function (card) {
                        var cb = card.querySelector('.epic-check');
                        if (!cb) return;
                        var cr = card.getBoundingClientRect();
                        var overlap = !(cr.right < selRect.left || cr.left > selRect.right || cr.bottom < selRect.top || cr.top > selRect.bottom);
                        if (overlap && !cb.checked) cb.checked = true;
                    });
                }
            }
            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                if (isSelecting) {
                    dragSelector.style.display = 'none';
                    isSelecting = false;
                    var newlyCheckedCards = [];
                    var seen = new Set();
                    document.querySelectorAll('.epic-check:checked').forEach(function (cb) {
                        var card = cb.closest('.epic-card');
                        if (!card) return;
                        var key = keyOf(card);
                        if (!previouslyChecked.has(key) && !seen.has(key)) { seen.add(key); newlyCheckedCards.push(card); }
                    });
                    syncSelection({ flyNew: newlyCheckedCards, stagger: true });
                }
                setTimeout(function () { isDragActive = false; }, 50);
            }

            // 底部按钮
            document.getElementById('btn-view-orders').addEventListener('click', function () {
                window.open('https://www.epicgames.com/account/transactions?productName=egs&historyType=PAYMENT_HISTORY', '_blank');
            });
            document.getElementById('btn-select-all').addEventListener('click', function () {
                var cbs = grid.querySelectorAll('.epic-check');
                var isAll = Array.prototype.every.call(cbs, function (cb) { return cb.checked; });
                var target = !isAll;
                var newCards = [];
                Array.prototype.forEach.call(cbs, function (cb) {
                    if (target && !cb.checked) { var card = cb.closest('.epic-card'); if (card) newCards.push(card); }
                    cb.checked = target;
                });
                syncSelection({ flyNew: newCards, stagger: true });
            });

            // 批量领取弹窗
            var modal = document.getElementById('claim-modal');
            var modalCount = document.getElementById('modal-count');
            var modalTrayEl = document.getElementById('modal-tray');
            var pendingUrl = '';
            claimBtn.addEventListener('click', function () {
                if (claimBtn.disabled) return;
                var uniqueGames = selectedItems();
                if (!uniqueGames.length) return;
                modalCount.textContent = uniqueGames.length;
                modalTrayEl.innerHTML = uniqueGames.map(function (g) {
                    return '<div class="modal-tray-item" title="' + esc(g.title) + '"><img src="' + esc(g.img) + '" alt="' + esc(g.title) + '"></div>';
                }).join('');
                var offers = uniqueGames.map(function (g) { return '1-' + g.sandboxId + '-' + g.offerId; }).join('&offers=');
                pendingUrl = 'https://store.epicgames.com/purchase?offers=' + offers + '#/purchase/payment-methods';
                modal.classList.add('active');
                modal.setAttribute('aria-hidden', 'false');
            });
            function closeModal() { modal.classList.remove('active'); modal.setAttribute('aria-hidden', 'true'); }
            document.getElementById('btn-cancel').addEventListener('click', closeModal);
            modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
            document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });
            document.getElementById('btn-confirm').addEventListener('click', function () { if (pendingUrl) window.open(pendingUrl, '_blank'); closeModal(); });

            // ===== 初始化：打开即加载 =====
            loadEpic(false);
        })();
    
