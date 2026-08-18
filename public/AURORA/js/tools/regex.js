/* Extracted from regex.html (refactor script). Tool logic. */

        const regexTool = {
            _regexRaf: null,
            _runDebounce: null,
            activeMatchIndex: -1,
            _lastMatches: [],
            _filteredMatches: [],
            _autoResizeRaf: null,
            _maxHeight: 900,
            _minHeight: 220,
            autoResize: function() {
                if (this._autoResizeRaf) cancelAnimationFrame(this._autoResizeRaf);
                this._autoResizeRaf = requestAnimationFrame(() => {
                    const textarea = document.getElementById('regex-test-input');
                    const highlight = document.getElementById('regex-highlight');
                    const container = textarea && textarea.parentElement;
                    const autoToggle = document.getElementById('auto-height-toggle');
                    if (!textarea || !highlight || !container) return;
                    if (autoToggle && !autoToggle.checked) {
                        textarea.style.height = this._minHeight + 'px';
                        highlight.style.height = '100%';
                        container.style.height = '';
                        return;
                    }
                    textarea.style.height = 'auto';
                    const h = Math.max(this._minHeight, Math.min(textarea.scrollHeight, this._maxHeight));
                    textarea.style.height = h + 'px';
                    highlight.style.height = h + 'px';
                    container.style.height = h + 'px';
                });
            },
            insertRegex: function(str) {
                const input = document.getElementById('regex-input');
                const start = input.selectionStart || 0;
                const end = input.selectionEnd || 0;
                const val = input.value;
                input.value = val.substring(0, start) + str + val.substring(end);
                input.focus();
                input.selectionStart = input.selectionEnd = start + str.length;
                this.run(true);
            },
            clearInput: function() {
                const input = document.getElementById('regex-test-input');
                input.value = '';
                this.run(true);
                this.autoResize();
            },
            clearAll: function() {
                document.getElementById('regex-input').value = '';
                document.getElementById('regex-test-input').value = '';
                document.getElementById('flag-g').checked = true;
                document.getElementById('flag-m').checked = true;
                document.getElementById('flag-i').checked = false;
                this.activeMatchIndex = -1;
                this.run(true);
                this.autoResize();
            },
            syncScroll: function() {
                const textarea = document.getElementById('regex-test-input');
                const highlight = document.getElementById('regex-highlight');
                highlight.scrollTop = textarea.scrollTop;
                highlight.scrollLeft = textarea.scrollLeft;
            },
            _copyText: function(text) {
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(text).then(() => {
                        if (app && app.showToast) app.showToast('已复制到剪贴板');
                    }).catch(() => {
                        const temp = document.createElement('textarea');
                        temp.value = text;
                        document.body.appendChild(temp);
                        temp.select();
                        document.execCommand('copy');
                        temp.remove();
                        if (app && app.showToast) app.showToast('已复制到剪贴板');
                    });
                    return;
                }
                const temp = document.createElement('textarea');
                temp.value = text;
                document.body.appendChild(temp);
                temp.select();
                document.execCommand('copy');
                temp.remove();
                if (app && app.showToast) app.showToast('已复制到剪贴板');
            },
            copyMatches: function() {
                if (!this._filteredMatches.length) {
                    if (app && app.showToast) app.showToast('没有可复制的匹配', 'error');
                    return;
                }
                const text = this._filteredMatches.map(m => m.text).join('\n');
                this._copyText(text);
            },
            copyMatchByIndex: function(matchIndex) {
                const match = this._lastMatches.find(m => m.index === matchIndex);
                if (!match) return;
                this._copyText(match.text);
            },
            jumpToMatch: function(matchIndex) {
                const match = this._lastMatches.find(m => m.index === matchIndex);
                if (!match) return;
                const textarea = document.getElementById('regex-test-input');
                this.activeMatchIndex = matchIndex;
                textarea.focus();
                textarea.setSelectionRange(match.start, match.end);
                const style = window.getComputedStyle(textarea);
                const lineHeight = parseFloat(style.lineHeight) || 20;
                const line = textarea.value.slice(0, match.start).split('\n').length;
                textarea.scrollTop = Math.max(0, (line - 3) * lineHeight);
                this.run(true);
            },
            run: function(immediate) {
                if (immediate) {
                    this._runNow();
                    return;
                }
                if (this._regexRaf) cancelAnimationFrame(this._regexRaf);
                if (this._runDebounce) clearTimeout(this._runDebounce);
                this._runDebounce = setTimeout(() => {
                    this._regexRaf = requestAnimationFrame(() => {
                        this._regexRaf = null;
                        this._runNow();
                    });
                }, 120);
            },
            _runNow: function() {
                const pattern = document.getElementById('regex-input').value;
                const text = document.getElementById('regex-test-input').value;
                const highlight = document.getElementById('regex-highlight');
                const list = document.getElementById('match-list');
                const countLabel = document.getElementById('match-count');
                const filterInput = document.getElementById('match-filter');
                const onlyGroupsInput = document.getElementById('only-groups');
                const highlightToggle = document.getElementById('highlight-toggle');
                const maxHighlightChars = 60000;
                const maxMatches = 1000;
                const maxListMatches = 200;
                const escapeHtml = (val) => {
                    if (window.app && app.escapeHtml) return app.escapeHtml(val);
                    return String(val).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                };

                if (!pattern) {
                    highlight.innerHTML = '';
                    list.innerHTML = '';
                    countLabel.innerText = '0 matches';
                    this._lastMatches = [];
                    this._filteredMatches = [];
                    this.activeMatchIndex = -1;
                    return;
                }

                let flags = '';
                if (document.getElementById('flag-g').checked) flags += 'g';
                if (document.getElementById('flag-i').checked) flags += 'i';
                if (document.getElementById('flag-m').checked) flags += 'm';

                try {
                    const regex = new RegExp(pattern, flags);
                    let matches = [];
                    let match;
                    if (regex.global) {
                        regex.lastIndex = 0;
                        while ((match = regex.exec(text)) !== null) {
                            matches.push(match);
                            if (match.index === regex.lastIndex) regex.lastIndex++;
                            if (matches.length >= maxMatches) break;
                        }
                    } else {
                        match = regex.exec(text);
                        if (match) matches.push(match);
                    }
                    this._lastMatches = matches.map((m, i) => {
                        const textValue = m[0] || '';
                        const groups = m.slice(1).map(g => g === undefined ? '' : g);
                        const start = m.index;
                        const end = start + textValue.length;
                        return { index: i, start, end, text: textValue, groups: groups };
                    });
                    if (this.activeMatchIndex >= this._lastMatches.length) {
                        this.activeMatchIndex = -1;
                    }

                    const filterText = (filterInput ? filterInput.value.trim() : '');
                    const filterLower = filterText.toLowerCase();
                    const onlyGroups = !!(onlyGroupsInput && onlyGroupsInput.checked);
                    const filtered = this._lastMatches.filter(m => {
                        if (onlyGroups && !m.groups.length) return false;
                        if (!filterText) return true;
                        const haystack = [m.text].concat(m.groups).join('\n').toLowerCase();
                        return haystack.includes(filterLower);
                    });
                    this._filteredMatches = filtered;

                    const safeText = escapeHtml(text);
                    const highlightEnabled = !highlightToggle || highlightToggle.checked;
                    if (!highlightEnabled) {
                        highlight.innerHTML = safeText.replace(/\n/g, '<br>');
                    } else if (text.length > maxHighlightChars) {
                        highlight.textContent = text;
                    } else {
                        let matchIndex = 0;
                        let highlightedHtml = safeText.replace(regex, (match) => {
                            if (!match) return '';
                            const idx = matchIndex++;
                            const cls = idx === this.activeMatchIndex ? 'match match-active' : 'match';
                            return `<span class="${cls}" data-idx="${idx}">${match}</span>`;
                        });
                        highlightedHtml = highlightedHtml.replace(/\n/g, '<br>');
                        highlight.innerHTML = highlightedHtml;
                    }

                    if (filterText || onlyGroups) {
                        countLabel.innerText = `${filtered.length}/${matches.length} matches`;
                    } else {
                        countLabel.innerText = `${matches.length} matches`;
                    }
                    if (filtered.length > 0) {
                        let listHtml = '';
                        const getLineCol = (src, idx) => {
                            const prefix = src.slice(0, idx);
                            const line = prefix.split('\n').length;
                            const lastNl = prefix.lastIndexOf('\n');
                            const col = idx - (lastNl + 1) + 1;
                            return { line, col };
                        };
                        filtered.slice(0, maxListMatches).forEach((m, i) => {
                            const safeMatch = escapeHtml(m.text);
                            const groupHtml = m.groups.length
                                ? m.groups.map((g, gi) => `<div class="group-chip"><b>G${gi + 1}</b><span>${escapeHtml(g)}</span></div>`).join('')
                                : `<div class="group-chip"><b>无</b><span>无捕获组</span></div>`;
                            const pos = getLineCol(text, m.start);
                            const activeClass = m.index === this.activeMatchIndex ? 'match-item active' : 'match-item';
                            listHtml += `<div class="${activeClass}" data-match-index="${m.index}">
                                <div class="match-header">
                                    <div class="match-title">Match ${m.index + 1}</div>
                                    <div class="match-actions">
                                        <button class="match-btn" data-action="jump">定位</button>
                                        <button class="match-btn" data-action="copy">复制</button>
                                    </div>
                                </div>
                                <div class="match-text">${safeMatch}</div>
                                <div class="match-meta">
                                    <span>Index ${m.start}-${m.end}</span>
                                    <span>行 ${pos.line} 列 ${pos.col}</span>
                                    <span>长度 ${m.text.length}</span>
                                    <span>分组 ${m.groups.length}</span>
                                </div>
                                <div class="group-list">${groupHtml}</div>
                            </div>`;
                        });
                        if (filtered.length > maxListMatches) {
                            listHtml += `<div class="empty-state">仅展示前 ${maxListMatches} 条匹配</div>`;
                        }
                        if (text.length > maxHighlightChars) {
                            listHtml = `<div class="empty-state">文本过大，高亮已简化以提升性能</div>` + listHtml;
                        }
                        list.innerHTML = listHtml;
                    } else {
                        list.innerHTML = '<div class="empty-state">未找到匹配</div>';
                    }
                    this.autoResize();
                } catch (e) {
                    countLabel.innerText = 'Error';
                    const safeMsg = escapeHtml(e.message);
                    list.innerHTML = `<div class="error-state">Invalid Regex: ${safeMsg}</div>`;
                    highlight.innerHTML = '';
                    this._lastMatches = [];
                    this._filteredMatches = [];
                    this.activeMatchIndex = -1;
                    this.autoResize();
                }
            }
        };

        const bindRegexEvents = () => {
            const input = document.getElementById('regex-input');
            const testInput = document.getElementById('regex-test-input');
            const list = document.getElementById('match-list');
            const filterInput = document.getElementById('match-filter');
            const onlyGroupsInput = document.getElementById('only-groups');
            const autoHeightToggle = document.getElementById('auto-height-toggle');
            const highlightToggle = document.getElementById('highlight-toggle');
            const flags = ['flag-g', 'flag-m', 'flag-i'].map(id => document.getElementById(id));
            input.addEventListener('input', () => regexTool.run());
            testInput.addEventListener('input', () => { regexTool.run(); regexTool.autoResize(); });
            testInput.addEventListener('scroll', () => regexTool.syncScroll());
            flags.forEach(el => el.addEventListener('change', () => regexTool.run(true)));
            if (filterInput) filterInput.addEventListener('input', () => regexTool.run());
            if (onlyGroupsInput) onlyGroupsInput.addEventListener('change', () => regexTool.run(true));
            if (autoHeightToggle) autoHeightToggle.addEventListener('change', () => regexTool.autoResize());
            if (highlightToggle) highlightToggle.addEventListener('change', () => regexTool.run(true));
            if (list) {
                list.addEventListener('click', (e) => {
                    const item = e.target.closest('.match-item');
                    if (!item) return;
                    const idx = parseInt(item.getAttribute('data-match-index'), 10);
                    if (Number.isNaN(idx)) return;
                    const action = e.target && e.target.getAttribute('data-action');
                    if (action === 'copy') {
                        regexTool.copyMatchByIndex(idx);
                        return;
                    }
                    regexTool.jumpToMatch(idx);
                });
            }
            regexTool.run(true);
            regexTool.autoResize();
            window.addEventListener('resize', () => regexTool.autoResize());
        };

        bindRegexEvents();
    

        // data-action registrations (replaces inline onclick=)
        if (window.app && app.action) {
            app.action('regex.clear-all', function () { regexTool.clearAll(); });
            app.action('regex.insert', function (el) { regexTool.insertRegex(el.dataset.value); });
            app.action('regex.copy-matches', function () { regexTool.copyMatches(); });
            app.action('regex.clear-input', function () { regexTool.clearInput(); });
        }
    
