/* ============================================================
 * Aurora Toolbox — Ui.resultCard
 * Standard result card with copy rows (label + readonly value + copy btn).
 *   Ui.resultCard({ title, rows: [['MD5', 'abc...'], ['SHA1','...']] })
 *   Ui.appendResult(container, cardOptions)  -> appends and returns card element
 * Uses app.copy via data-action delegation (copy target = row input id).
 * ============================================================ */
window.Ui = window.Ui || {};

Ui.resultCard = function (opts) {
    opts = opts || {};
    const card = document.createElement('div');
    card.className = 'result-card';

    if (opts.title) {
        const title = document.createElement('div');
        title.className = 'result-title';
        title.textContent = opts.title;
        card.appendChild(title);
    }

    const grid = document.createElement('div');
    grid.className = 'result-grid';
    (opts.rows || []).forEach(row => {
        const [label, value] = Array.isArray(row) ? row : [row.label, row.value];
        const id = 'ui-out-' + Math.random().toString(36).slice(2, 10);
        const div = document.createElement('div');
        div.className = 'input-row';

        const labelEl = document.createElement('label');
        labelEl.style.width = '100px';
        labelEl.textContent = String(label);
        div.appendChild(labelEl);

        const input = document.createElement('input');
        input.id = id;
        input.type = 'text';
        input.value = value == null ? '' : String(value);
        input.readOnly = true;
        input.style.flex = '1';
        div.appendChild(input);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-icon';
        btn.setAttribute('aria-label', '复制');
        btn.innerHTML = (window.Ui && Ui.icon) ? Ui.icon('copy') : '';
        btn.dataset.action = 'copy';
        btn.dataset.copyTarget = id;
        div.appendChild(btn);

        grid.appendChild(div);
    });
    card.appendChild(grid);
    return card;
};

Ui.appendResult = function (container, opts) {
    const card = Ui.resultCard(opts);
    if (container) container.appendChild(card);
    return card;
};