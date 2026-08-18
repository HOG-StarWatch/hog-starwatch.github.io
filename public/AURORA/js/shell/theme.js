/* ============================================================
 * Aurora Toolbox shell — theme.js
 * Theme engine: presets / famous sites / custom / chaos / meltdown.
 * Attaches to window.Shell.theme. Requires core.js to have run first.
 * ============================================================ */
(function () {
    'use strict';

    const frame = window.Shell.frame;

    // ----- state -----
    let currentThemeData = null;
    let presetThemes = null;
    let famousThemes = null;
    let allThemes = null;
    let themeDataLoaded = false;
    let themeDataLoading = null;

    let themeSignature = '';
    let lastAppliedFrameSrc = '';
    let lastAppliedFrameSignature = '';
    let lastMeltdownAppliedState = false;
    let lastMeltdownAppliedSrc = '';
    let isChaosMode = false;
    let isMeltdownMode = false;

    // ----- helpers -----
    function getContrastColor(hex) {
        if (!hex || !hex.startsWith('#')) return '#ffffff';
        const r = parseInt(hex.substr(1, 2), 16);
        const g = parseInt(hex.substr(3, 2), 16);
        const b = parseInt(hex.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000000' : '#ffffff';
    }

    function getThemeSignature(theme) {
        if (!theme) return '';
        const keys = Object.keys(theme).sort();
        let out = '';
        for (const key of keys) {
            out += key + ':' + String(theme[key]) + ';';
        }
        return out;
    }

    function captureCurrentThemeData() {
        const styles = getComputedStyle(document.documentElement);
        const keys = ['--bg-deep', '--bg-panel', '--bg-header', '--primary', '--secondary', '--accent', '--text-main', '--text-dim', '--bg-image', '--font-main', '--font-mono', '--radius-lg', '--radius-md', '--radius-sm', '--shadow', '--border', '--input-bg', '--btn-bg', '--btn-hover-bg'];
        const theme = {};
        keys.forEach((key) => {
            const value = styles.getPropertyValue(key).trim();
            if (value) theme[key] = value;
        });
        return theme;
    }

    function loadThemeData() {
        if (themeDataLoaded) return Promise.resolve();
        if (themeDataLoading) return themeDataLoading;
        themeDataLoading = new Promise((resolve, reject) => {
            const finish = () => {
                const data = window.__themeData;
                if (!data || !data.presetThemes || !data.famousThemes) {
                    themeDataLoading = null;
                    reject(new Error('theme data missing'));
                    return;
                }
                presetThemes = data.presetThemes;
                famousThemes = data.famousThemes;
                allThemes = { ...presetThemes, ...famousThemes };
                if (!currentThemeData && presetThemes.aurora) {
                    currentThemeData = presetThemes.aurora.vars;
                }
                themeDataLoaded = true;
                resolve();
            };
            const existing = document.getElementById('theme-data-script');
            if (existing) {
                if (themeDataLoaded) {
                    resolve();
                } else {
                    existing.addEventListener('load', finish, { once: true });
                    existing.addEventListener('error', () => {
                        themeDataLoading = null;
                        reject(new Error('theme data load failed'));
                    }, { once: true });
                }
                return;
            }
            const script = document.createElement('script');
            script.id = 'theme-data-script';
            script.src = 'js/theme-data.js';
            script.onload = finish;
            script.onerror = () => {
                themeDataLoading = null;
                reject(new Error('theme data load failed'));
            };
            document.head.appendChild(script);
        });
        return themeDataLoading;
    }

    function applyThemeVariables(theme) {
        const root = document.documentElement;
        themeSignature = getThemeSignature(theme);

        // Persist for cross-page boot (no theme flash on tool switch / reload)
        try {
            localStorage.setItem('aurora_theme_v1', JSON.stringify(theme));
        } catch (e) {}

        // Calculate contrast colors
        if (theme['--primary']) {
            theme['--primary-contrast'] = getContrastColor(theme['--primary']);
        }

        // Optimization: Request Animation Frame to batch reflows
        requestAnimationFrame(() => {
            for (const [key, value] of Object.entries(theme)) {
                root.style.setProperty(key, value);
            }
            // Propagate to the tool iframe (and nested iframes) via a postMessage
            // channel — app.js in every tool document applies the vars locally.
            if (frame && frame.contentWindow) {
                try {
                    frame.contentWindow.postMessage({ type: 'aurora-theme', vars: theme }, '*');
                } catch (e) {}
            }
        });
    }

    // ----- theme list modal -----
    function renderThemeList() {
        if (!presetThemes || !famousThemes) return;
        const renderGrid = (containerId, themesObj) => {
            const grid = document.getElementById(containerId);
            if (!grid) return;
            grid.innerHTML = '';

            Object.entries(themesObj).forEach(([key, theme]) => {
                const btn = document.createElement('div');
                btn.className = 'theme-card';
                btn.onclick = () => setTheme(key);

                // Create preview
                const preview = document.createElement('div');
                preview.className = 'theme-preview';
                preview.style.background = theme.vars['--bg-deep'];
                preview.style.backgroundImage = theme.vars['--bg-image'];

                // Add a small "window" inside preview to show panel color
                const panelEl = document.createElement('div');
                panelEl.style.position = 'absolute';
                panelEl.style.bottom = '10px';
                panelEl.style.right = '10px';
                panelEl.style.width = '60%';
                panelEl.style.height = '60%';
                panelEl.style.background = theme.vars['--bg-panel'];
                panelEl.style.borderRadius = theme.vars['--radius-sm'];
                panelEl.style.border = `1px solid ${theme.vars['--border'] || 'rgba(255,255,255,0.1)'}`;
                preview.appendChild(panelEl);

                // Add primary color dot
                const dot = document.createElement('div');
                dot.style.position = 'absolute';
                dot.style.top = '10px';
                dot.style.left = '10px';
                dot.style.width = '12px';
                dot.style.height = '12px';
                dot.style.borderRadius = '50%';
                dot.style.background = theme.vars['--primary'];
                preview.appendChild(dot);

                const info = document.createElement('div');
                info.innerHTML = `
                    <div style="font-weight:bold; font-size:0.9rem; color:var(--text-main)">${theme.name.split(' ')[0]}</div>
                    <div style="font-size:0.7rem; color:var(--text-dim); margin-top:2px;">${theme.desc}</div>
                `;

                btn.appendChild(preview);
                btn.appendChild(info);
                grid.appendChild(btn);
            });
        };

        renderGrid('preset-themes-grid', presetThemes);
        renderGrid('famous-themes-grid', famousThemes);
    }

    function toggleThemeModal() {
        const modal = document.getElementById('theme-modal');
        if (modal.style.display === 'flex') {
            modal.style.opacity = '0';
            modal.querySelector('div').style.transform = 'scale(0.95)';
            setTimeout(() => modal.style.display = 'none', 300);
        } else {
            loadThemeData().then(() => {
                renderThemeList();
                modal.style.display = 'flex';
                modal.offsetHeight;
                modal.style.opacity = '1';
                modal.querySelector('div').style.transform = 'scale(1)';
            }).catch(() => {
                modal.style.display = 'flex';
                modal.offsetHeight;
                modal.style.opacity = '1';
                modal.querySelector('div').style.transform = 'scale(1)';
                if (window.app && app.showToast) app.showToast('主题数据加载失败', 'error');
            });
        }
    }

    function setTheme(name) {
        if (!allThemes) return;
        const theme = allThemes[name];
        if (!theme) return;

        applyThemeVariables(theme.vars);
        syncCustomInputs(theme.vars);
        currentThemeData = theme.vars;

        document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
    }

    // ----- custom theme controls -----
    function syncCustomInputs(vars) {
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            const disp = document.getElementById('val-' + id.split('-')[1]);
            if (el && val && val.startsWith('#')) {
                el.value = val;
                if (disp) disp.innerText = val;
            }
        };

        setVal('custom-primary', vars['--primary']);
        setVal('custom-secondary', vars['--secondary']);
        setVal('custom-bg', vars['--bg-deep']);
        setVal('custom-text-main', vars['--text-main']);
    }

    function updateCustomTheme() {
        const getVal = (id) => {
            const val = document.getElementById(id).value;
            document.getElementById('val-' + id.split('-')[1]).innerText = val;
            return val;
        };

        const bgDeep = getVal('custom-bg');
        const primary = getVal('custom-primary');
        const textMain = getVal('custom-text-main');
        const isLightBg = getContrastColor(bgDeep) === '#000000';

        const theme = {
            '--primary': primary,
            '--secondary': getVal('custom-secondary'),
            '--accent': primary, // Link accent to primary for simple custom
            '--bg-deep': bgDeep,
            '--text-main': textMain,
            '--text-dim': adjustColorOpacity(textMain, 0.6),

            // Defaults for custom
            '--bg-panel': isLightBg ? '#ffffff' : 'rgba(20, 25, 40, 0.65)',
            '--bg-header': isLightBg ? 'rgba(255, 255, 255, 0.9)' : 'rgba(11, 15, 25, 0.8)',
            '--bg-image': 'none',
            '--font-main': "'Inter', sans-serif",
            '--font-mono': "'JetBrains Mono', monospace",
            '--radius-lg': '8px',
            '--radius-md': '4px',
            '--radius-sm': '2px',
            '--shadow': isLightBg ? '0 4px 12px rgba(0,0,0,0.1)' : '0 8px 32px rgba(0, 0, 0, 0.4)',
            '--border': isLightBg ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
            '--input-bg': isLightBg ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.3)',
            '--btn-bg': isLightBg ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
            '--btn-hover-bg': isLightBg ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
        };

        applyThemeVariables(theme);
        currentThemeData = theme;
    }

    // Helper to adjust color (simplified)
    function adjustColorOpacity(hex, opacity, invert = false) {
        // Very basic implementation, just returns hex if complex
        return hex;
    }

    // ----- random / chaos / meltdown -----
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function randomizeCustomTheme() {
        const primary = getRandomColor();
        const secondary = getRandomColor();
        const bg = getRandomColor();
        // Ensure text contrasts with bg
        const isDark = getContrastColor(bg) === '#ffffff';
        const text = isDark ? '#f1f5f9' : '#1a1f2e';

        document.getElementById('custom-primary').value = primary;
        document.getElementById('custom-secondary').value = secondary;
        document.getElementById('custom-bg').value = bg;
        document.getElementById('custom-text-main').value = text;

        updateCustomTheme();
    }

    function toggleChaosMode() {
        isChaosMode = !isChaosMode;
        const btn = document.getElementById('chaos-btn');
        if (isChaosMode) {
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
            btn.innerHTML = (window.Ui && Ui.icon ? Ui.icon('dice') : '') + ' <span>全随机 (ON)</span>';
            randomizeCustomTheme();
        } else {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
            btn.innerHTML = (window.Ui && Ui.icon ? Ui.icon('dice') : '') + ' <span>全随机</span>';
        }
    }

    function applyMeltdownEffect() {
        if (!frame || !frame.contentWindow) return;

        // Generate crazy CSS targeting pseudo-random elements
        let css = '';
        for (let i = 1; i <= 50; i++) {
            const color = getRandomColor();
            const bg = getRandomColor();
            const border = getRandomColor();

            css += `*:nth-child(50n + ${i}) { 
                --primary: ${color} !important; 
                --secondary: ${bg} !important;
                --bg-panel: ${bg}80 !important;
                --text-main: ${getContrastColor(bg)} !important;
                border-color: ${border} !important;
            }\n`;

            css += `.btn:nth-child(20n + ${i}) { background-color: ${bg} !important; color: ${getContrastColor(bg)} !important; }\n`;
            css += `.panel:nth-child(10n + ${i}) { background-color: ${color}20 !important; }\n`;
        }

        // Apply inside the tool document via the message channel
        try {
            frame.contentWindow.postMessage({ type: 'aurora-meltdown', css: css }, '*');
        } catch (e) {}
    }

    function removeMeltdownEffect() {
        if (!frame || !frame.contentWindow) return;
        try {
            frame.contentWindow.postMessage({ type: 'aurora-meltdown-remove' }, '*');
        } catch (e) {}
    }

    function toggleMeltdownMode() {
        isMeltdownMode = !isMeltdownMode;
        const btn = document.getElementById('meltdown-btn');

        if (isMeltdownMode) {
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-danger');
            btn.innerHTML = (window.Ui && Ui.icon ? Ui.icon('cyclone') : '') + ' <span>崩坏 (ON)</span>';
            if (window.app && app.showToast) app.showToast('崩坏模式已开启：警告！高能反应！', 'warning');
            applyMeltdownEffect();
        } else {
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-secondary');
            btn.innerHTML = (window.Ui && Ui.icon ? Ui.icon('cyclone') : '') + ' <span>崩坏</span>';
            removeMeltdownEffect();
        }
    }

    // ----- public API -----
    window.Shell.theme = {
        state: {
            get currentThemeData() { return currentThemeData; },
            get isMeltdownMode() { return isMeltdownMode; }
        },
        captureCurrentThemeData,
        loadThemeData,
        applyThemeVariables,
        toggleThemeModal,
        setTheme,
        syncCustomInputs,
        updateCustomTheme,
        randomizeCustomTheme,
        toggleChaosMode,
        toggleMeltdownMode,
        applyMeltdownEffect,
        removeMeltdownEffect,
        getThemeSignature,
        getContrastColor,

        // Runs once from nav.js after all modules are loaded.
        init: function () {
            currentThemeData = captureCurrentThemeData();
            if (currentThemeData) syncCustomInputs(currentThemeData);

            // Re-apply theme / meltdown whenever the iframe navigates.
            window.Shell.onFrameLoad.push(() => {
                const frameSrc = frame.getAttribute('src') || '';
                if (currentThemeData && (lastAppliedFrameSrc !== frameSrc || lastAppliedFrameSignature !== themeSignature)) {
                    applyThemeVariables(currentThemeData);
                    lastAppliedFrameSrc = frameSrc;
                    lastAppliedFrameSignature = themeSignature;
                }
                if (isMeltdownMode && (!lastMeltdownAppliedState || lastMeltdownAppliedSrc !== frameSrc)) {
                    applyMeltdownEffect();
                    lastMeltdownAppliedState = true;
                    lastMeltdownAppliedSrc = frameSrc;
                }
            });

            // Close theme modal when clicking outside
            const modal = document.getElementById('theme-modal');
            if (modal) modal.addEventListener('click', function (e) {
                if (e.target === this) toggleThemeModal();
            });
        }
    };
})();