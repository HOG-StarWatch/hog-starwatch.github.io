/* ============================================================
 * Aurora Toolbox shell — nav.js
 * Mobile drawer, shell-wide event wiring, and module bootstrap.
 * Load LAST of the shell modules. Runs theme.init() + offline.init()
 * and binds all header/drawer controls.
 * ============================================================ */
(function () {
    'use strict';

    const theme = window.Shell.theme;
    const offline = window.Shell.offline;

    // ----- mobile drawer -----
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileOverlay = document.getElementById('mobile-overlay');
    let isMobileMenuOpen = false;

    function toggleMobileMenu() {
        isMobileMenuOpen = !isMobileMenuOpen;
        if (isMobileMenuOpen) {
            mobileDrawer.style.left = '0';
            mobileOverlay.style.display = 'block';
            // Lazy init
            if (mobileDrawer.children.length === 0 || mobileDrawer.innerHTML.trim() === '<!-- Content will be injected by JS or cloned -->') {
                initMobileMenu();
            }
        } else {
            mobileDrawer.style.left = '-100%';
            mobileOverlay.style.display = 'none';
        }
    }

    function initMobileMenu() {
        mobileDrawer.innerHTML = ''; // Clear placeholder

        // Clone Back/Home Button
        const backBtn = document.querySelector('#main-nav > .btn');
        if (backBtn) {
            const backClone = backBtn.cloneNode(true);
            backClone.style.width = '100%';
            backClone.style.marginBottom = '10px';
            mobileDrawer.appendChild(backClone);
        }

        // Clone Home Button
        const homeBtn = document.querySelector('.tab-btn[data-src="tools/home.html"]').cloneNode(true);
        attachMobileClick(homeBtn);
        mobileDrawer.appendChild(homeBtn);

        // Clone Dropdowns as Groups
        document.querySelectorAll('.dropdown').forEach(dd => {
            const title = dd.querySelector('.dropdown-toggle').innerText;
            const groupTitle = document.createElement('div');
            groupTitle.className = 'group-title';
            groupTitle.innerText = title;
            groupTitle.style.marginTop = '15px';
            groupTitle.style.marginBottom = '8px';
            groupTitle.style.color = 'var(--primary)';
            groupTitle.style.fontWeight = 'bold';
            groupTitle.style.fontSize = '1.1rem';
            mobileDrawer.appendChild(groupTitle);

            const content = dd.querySelector('.dropdown-content');
            if (content) {
                Array.from(content.children).forEach(child => {
                    if (child.classList.contains('tab-btn')) {
                        const clone = child.cloneNode(true);
                        clone.style.width = '100%';
                        clone.style.justifyContent = 'flex-start';
                        clone.style.padding = '10px';
                        attachMobileClick(clone);
                        mobileDrawer.appendChild(clone);
                    } else if (child.classList.contains('dropdown-header')) {
                        const header = document.createElement('div');
                        header.style.padding = '12px 0 4px 5px';
                        header.style.fontSize = '0.8rem';
                        header.style.color = 'var(--text-dim)';
                        header.style.fontWeight = '600';
                        header.style.textTransform = 'uppercase';
                        header.style.letterSpacing = '1px';
                        header.innerText = child.innerText;
                        mobileDrawer.appendChild(header);
                    }
                });
            }
        });
    }

    function attachMobileClick(btn) {
        btn.addEventListener('click', () => {
            const target = btn.dataset.src;
            if (target) {
                const frame = window.Shell.frame;
                frame.src = target;
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                // Find original and add active (and any mobile clones)
                document.querySelectorAll(`.tab-btn[data-src="${target}"]`).forEach(b => b.classList.add('active'));
                toggleMobileMenu(); // Close menu
            }
        });
    }

    // ----- shell-wide event wiring -----
    function bindShellEvents() {
        const byId = (id) => document.getElementById(id);

        const mobileMenuBtn = byId('mobile-menu-btn');
        if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);

        const logoHome = byId('logo-home');
        if (logoHome) logoHome.addEventListener('click', () => window.Shell.switchToHome());

        const backHome = byId('back-home-btn');
        if (backHome) backHome.addEventListener('click', () => {
            window.location.href = window.location.origin;
        });

        const offlineBtn = byId('offline-btn');
        if (offlineBtn) offlineBtn.addEventListener('click', () => offline.toggleOfflineModal());

        const themeBtn = byId('theme-btn');
        if (themeBtn) themeBtn.addEventListener('click', () => theme.toggleThemeModal());

        const themeClose = byId('theme-modal-close');
        if (themeClose) themeClose.addEventListener('click', () => theme.toggleThemeModal());

        const offlineClose = byId('offline-modal-close');
        if (offlineClose) offlineClose.addEventListener('click', () => offline.toggleOfflineModal());

        if (mobileOverlay) mobileOverlay.addEventListener('click', toggleMobileMenu);

        const randomizeBtn = byId('randomize-btn');
        if (randomizeBtn) randomizeBtn.addEventListener('click', () => theme.randomizeCustomTheme());

        const chaosBtn = byId('chaos-btn');
        if (chaosBtn) chaosBtn.addEventListener('click', () => theme.toggleChaosMode());

        const meltdownBtn = byId('meltdown-btn');
        if (meltdownBtn) meltdownBtn.addEventListener('click', () => theme.toggleMeltdownMode());

        const offlineSelectAll = byId('offline-select-all');
        if (offlineSelectAll) offlineSelectAll.addEventListener('click', () => offline.setAllOfflineCheckboxes(true));

        const offlineClear = byId('offline-clear');
        if (offlineClear) offlineClear.addEventListener('click', () => offline.setAllOfflineCheckboxes(false));

        const offlineApply = byId('offline-apply');
        if (offlineApply) offlineApply.addEventListener('click', () => offline.applyPrefs());

        const offlineClearSite = byId('offline-clear-site');
        if (offlineClearSite) offlineClearSite.addEventListener('click', () => offline.clearSiteData());

        ['custom-primary', 'custom-secondary', 'custom-bg', 'custom-text-main'].forEach((id) => {
            const el = byId(id);
            if (el) el.addEventListener('input', () => theme.updateCustomTheme());
        });
    }

    // ----- bootstrap: theme + offline init before wiring controls -----
    theme.init();
    offline.init();
    bindShellEvents();
})();