/* Extracted from ai-translate.html (refactor script). Tool logic. */

        const applyFrameThemeFilter = () => {
            const wrap = document.querySelector('.ms-translate-wrap');
            if (!wrap) return;
            const styles = getComputedStyle(document.documentElement);
            const bg = styles.getPropertyValue('--bg-deep').trim();
            const parsed = parseColor(bg) || parseColor(getComputedStyle(document.body).backgroundColor);
            const dark = parsed ? getLuminance(parsed) < 0.5 : false;
            wrap.classList.toggle('dark', dark);
        };
        const parseColor = (value) => {
            if (!value) return null;
            const v = value.trim();
            if (v.startsWith('#')) {
                const hex = v.slice(1);
                if (hex.length === 3) {
                    const r = parseInt(hex[0] + hex[0], 16);
                    const g = parseInt(hex[1] + hex[1], 16);
                    const b = parseInt(hex[2] + hex[2], 16);
                    return { r, g, b };
                }
                if (hex.length >= 6) {
                    const r = parseInt(hex.slice(0, 2), 16);
                    const g = parseInt(hex.slice(2, 4), 16);
                    const b = parseInt(hex.slice(4, 6), 16);
                    return { r, g, b };
                }
                return null;
            }
            if (v.startsWith('rgb')) {
                const nums = v.replace(/rgba?\(|\)/g, '').split(',').map(n => Number(n.trim()));
                if (nums.length >= 3 && nums.every(n => !Number.isNaN(n))) {
                    return { r: nums[0], g: nums[1], b: nums[2] };
                }
            }
            return null;
        };
        const getLuminance = ({ r, g, b }) => {
            const srgb = [r, g, b].map(v => {
                const c = v / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
        };
        const watchThemeChanges = () => {
            applyFrameThemeFilter();
            const obs = new MutationObserver(() => applyFrameThemeFilter());
            obs.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });
        };
        const adjustFrameHeight = () => {
            const wrap = document.querySelector('.ms-translate-wrap');
            if (!wrap) return;
            const baseWrap = Math.max(700, Math.floor(window.innerHeight - 220));
            wrap.style.height = baseWrap + 'px';
            const frame = document.getElementById('ms-translate-frame');
            if (!frame) return;
            const text = document.getElementById('translate-input');
            const len = text ? (text.value || '').length : 0;
            const baseFrame = window.innerWidth < 980 ? 1600 : 2000;
            const extra = Math.min(9000, Math.ceil(len / 180) * 360);
            frame.style.height = (baseFrame + extra) + 'px';
        };
        const translateTool = {
            init: function() {
                document.getElementById('translate-input').addEventListener('input', this.updateCount);
                const frame = document.getElementById('ms-translate-frame');
                if (frame) {
                    frame.addEventListener('load', () => this.setMicrosoftLoading(false));
                }
                this.updateCount();
                this.openMicrosoftTranslator();
                watchThemeChanges();
                adjustFrameHeight();
                window.addEventListener('resize', adjustFrameHeight);
            },
            updateCount: function() {
                const val = document.getElementById('translate-input').value || '';
                document.getElementById('translate-count').innerText = val.length;
                adjustFrameHeight();
            },
            swap: function() {
                const from = document.getElementById('translate-from');
                const to = document.getElementById('translate-to');
                if (from.value === 'auto') return;
                const temp = from.value;
                from.value = to.value;
                to.value = temp;
            },
            translate: async function() {
                const text = (document.getElementById('translate-input').value || '').trim();
                if (!text) {
                    app.showToast('请输入文本', 'error');
                    return;
                }
                const from = document.getElementById('translate-from').value;
                const to = document.getElementById('translate-to').value;
                if (from === to) {
                    document.getElementById('translate-output').value = text;
                    return;
                }
                const langpair = `${from}|${to}`;
                try {
                    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`;
                    const res = await fetch(url);
                    if (!res.ok) throw new Error('请求失败');
                    const data = await res.json();
                    const translated = data && data.responseData && data.responseData.translatedText;
                    if (!translated) throw new Error('未获取到翻译结果');
                    document.getElementById('translate-output').value = translated;
                    this.openMicrosoftTranslator();
                } catch (e) {
                    app.showToast('翻译失败', 'error');
                }
            },
            normalizeForMicrosoft: function(lang) {
                if (lang === 'auto') return 'auto';
                const map = { 'zh-CN': 'zh-Hans', 'en': 'en', 'ja': 'ja', 'ko': 'ko', 'fr': 'fr', 'de': 'de', 'es': 'es', 'ru': 'ru' };
                return map[lang] || lang;
            },
            openMicrosoftTranslator: function(openNewTab) {
                const text = (document.getElementById('translate-input').value || '').trim();
                const from = this.normalizeForMicrosoft(document.getElementById('translate-from').value);
                const to = this.normalizeForMicrosoft(document.getElementById('translate-to').value);
                const url = `https://www.bing.com/translator?text=${encodeURIComponent(text)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
                const frame = document.getElementById('ms-translate-frame');
                if (frame) {
                    this.setMicrosoftLoading(true);
                    frame.src = url;
                }
                adjustFrameHeight();
                if (openNewTab) {
                    window.open(url, '_blank', 'noopener');
                }
            },
            setMicrosoftLoading: function(loading) {
                const overlay = document.getElementById('ms-translate-loading');
                if (!overlay) return;
                overlay.style.display = loading ? 'flex' : 'none';
            },
            clear: function() {
                document.getElementById('translate-input').value = '';
                document.getElementById('translate-output').value = '';
                this.updateCount();
            }
        };
        translateTool.init();

        // data-action registrations (replaces inline onclick=)
        if (window.app && app.action) {
            app.action('translate.clear', function () { translateTool.clear(); });
            app.action('translate.swap', function () { translateTool.swap(); });
            app.action('translate.run', function () { translateTool.translate(); });
            app.action('translate.open-ms', function (el) { translateTool.openMicrosoftTranslator(!!el.dataset.newTab); });
        }
    
