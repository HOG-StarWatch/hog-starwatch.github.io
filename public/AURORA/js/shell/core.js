/* ============================================================
 * Aurora Toolbox shell — core.js
 * Shared shell references, iframe routing, service worker bootstrap.
 * Load order: core.js → theme.js → offline.js → nav.js
 * ============================================================ */
(function () {
    'use strict';

    const frame = document.getElementById('app-frame');
    const loadingOverlay = document.getElementById('loading-overlay');

    // Only select tab buttons that have a data-src attribute (exclude dropdown toggles)
    const buttons = document.querySelectorAll('.tab-btn[data-src]');

    // ----- global shell handle (shared across shell modules) -----
    window.Shell = window.Shell || {};
    window.Shell.frame = frame;
    window.Shell.buttons = buttons;
    window.Shell.onFrameLoad = []; // handlers run on every iframe load

    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }
    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }
    window.Shell.showLoading = showLoading;
    window.Shell.hideLoading = hideLoading;

    frame.addEventListener('load', () => {
        hideLoading();
        window.Shell.onFrameLoad.forEach(fn => {
            try { fn(); } catch (e) { console.error('[Shell] onFrameLoad handler error:', e); }
        });
    });

    // ----- service worker bootstrap -----
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js?v=21')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    try { registration.update(); } catch (e) {}
                    if (window.Shell.offline && window.Shell.offline.syncPrefs) {
                        window.Shell.offline.syncPrefs();
                    }
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }

    // ----- navigation -----
    function switchToHome() {
        const homeBtn = document.querySelector('.tab-btn[data-src="tools/home.html"]');
        if (homeBtn) homeBtn.click();
    }
    window.Shell.switchToHome = switchToHome;

    // Expose switchTab for iframe content (e.g., home.html cards)
    window.switchTab = function (url) {
        const btn = document.querySelector(`.tab-btn[data-src="${url}"]`);
        if (btn) {
            btn.click();
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    };

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.src;
            if (!target) return;

            // Remove active class from all buttons
            buttons.forEach(b => b.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Reset all dropdown toggles
            document.querySelectorAll('.dropdown-toggle').forEach(t => t.classList.remove('active'));

            // If button is inside a dropdown-content, highlight the parent dropdown toggle
            const dropdownContent = btn.closest('.dropdown-content');
            if (dropdownContent) {
                const dropdown = dropdownContent.parentElement;
                const toggle = dropdown.querySelector('.dropdown-toggle');
                if (toggle) toggle.classList.add('active');
            }

            const current = new URL(frame.src, window.location.href);
            const next = new URL(target, window.location.href);
            if (current.href === next.href) return;
            if (window.app && typeof app.releaseAllWorkers === 'function') {
                try { app.releaseAllWorkers(); } catch (e) {}
            }
            if (window.ResourceLoader) {
                ResourceLoader.loadToolDeps(target).finally(() => {
                    showLoading();
                    frame.src = target;
                });
            } else {
                showLoading();
                frame.src = target;
            }
        });
    });
})();