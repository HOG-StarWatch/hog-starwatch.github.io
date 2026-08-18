/* ============================================================
 * Aurora Toolbox — Ui.fileDrop
 * Unified click-or-drag upload zone component.
 *   Ui.fileDrop(zoneElement, {
 *     inputId: 'file-input',      // hidden <input type=file>
 *     accept: 'image/*',          // optional
 *     multiple: true,
 *     onFiles: (files) => {}      // File[] (from picker or drop)
 *   })
 * Adds .drag-active class on dragenter/over for styling.
 * ============================================================ */
window.Ui = window.Ui || {};

Ui.fileDrop = function (zone, opts) {
    opts = opts || {};
    const inputId = opts.inputId;
    const dragClass = opts.dragClass || 'drag-active';
    const input = inputId ? document.getElementById(inputId) : null;
    if (input) {
        if (opts.accept) input.accept = opts.accept;
        if (opts.multiple !== undefined) input.multiple = !!opts.multiple;
        input.addEventListener('change', function () {
            const files = Array.prototype.slice.call(input.files || []);
            if (files.length && opts.onFiles) opts.onFiles(files);
            input.value = '';
        });
    }
    if (zone) {
        zone.addEventListener('click', function () {
            if (input) input.click();
        });
        ['dragenter', 'dragover'].forEach(evtType => {
            zone.addEventListener(evtType, function (e) {
                e.preventDefault();
                zone.classList.add(dragClass);
            });
        });
        ['dragleave', 'drop'].forEach(evtType => {
            zone.addEventListener(evtType, function (e) {
                e.preventDefault();
                zone.classList.remove(dragClass);
            });
        });
        zone.addEventListener('drop', function (e) {
            const files = Array.prototype.slice.call((e.dataTransfer && e.dataTransfer.files) || []);
            if (files.length && opts.onFiles) opts.onFiles(files);
        });
    }
    return {
        clearInput() {
            if (input) input.value = '';
        }
    };
};