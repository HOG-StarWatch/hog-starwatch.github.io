/* ============================================================
 * Aurora Toolbox — theme boot
 * Applies the persisted theme vars (aurora_theme_v1) to
 * documentElement SYNCHRONOUSLY before first paint, so tool pages
 * (and the shell itself) never flash the default theme when
 * navigating / reloading. Live theme changes still arrive via the
 * 'aurora-theme' postMessage channel handled in app.js.
 * Load this in <head> right after the stylesheets.
 * ============================================================ */
(function () {
    'use strict';
    try {
        var raw = localStorage.getItem('aurora_theme_v1');
        if (!raw) return;
        var vars = JSON.parse(raw);
        if (!vars || typeof vars !== 'object') return;
        var root = document.documentElement;
        Object.keys(vars).forEach(function (key) {
            if (key.indexOf('--') === 0) root.style.setProperty(key, vars[key]);
        });
    } catch (e) {}
})();