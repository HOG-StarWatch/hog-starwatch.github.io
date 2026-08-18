/* Extracted from developer-toolbox.html (refactor script). Tool logic. */

    document.addEventListener('DOMContentLoaded', function() {
        ResourceLoader.loadDeps('@icons');
    });

/* ============================================================
 * data-action registrations (refactor)
 * Handlers delegate to the global tool functions defined below
 * in this same file (originally split as developer-toolbox__2.js,
 * merged); referenced only at call time, never at registration.
 * ============================================================ */
if (window.app && app.action) {

    // mobile menu toggle (compound expression)
    app.action('toggleNavMenu', function () {
        document.querySelector('.nav-links').classList.toggle('open');
    });

    // nav tab switching — also re-applies the .nav-item highlight
    // (the original switchTab() matched nav items by their old inline
    // `onclick` attribute, which no longer exists)
    app.action('switchTab', function (el) {
        const tabId = el.dataset.tab;
        window.switchTab(tabId);
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelectorAll(`.nav-item[data-action="switchTab"][data-tab="${tabId}"]`).forEach(n => n.classList.add('active'));
    });

    // modal open/close
    app.action('openModal', function (el) {
        openModal(el.dataset.mode);
    });
    app.action('closeModalOverlay', function (el, evt) {
        if (evt.target === el) closeModal();
    });

    // copy code block (pre/input contents + button feedback)
    app.action('copyCode', function (el) {
        copyCode(el.dataset.mode);
    });

    // social preview mode tabs
    app.action('setSPMode', function (el) {
        setSPMode(el.dataset.mode, el);
    });

    // readonly url inputs: select all on click
    app.action('selectField', function (el) {
        el.select();
    });

    // badge preview image: open src in new tab
    app.action('openPreview', function (el) {
        if (el.src) window.open(el.src, '_blank');
    });

    // icon search — Enter key (app.js only delegates click/change/input,
    // so a scoped keydown delegation is registered here)
    app.action('iconSearchEnter', function (el, evt) {
        if (evt.key === 'Enter') searchIcons();
    });
    document.addEventListener('keydown', (e) => {
        const t = e.target;
        const trig = t && t.closest ? t.closest('[data-action="iconSearchEnter"]') : null;
        if (trig) app.runAction('iconSearchEnter', trig, e);
    }, true);

}



/* --- Core Logic --- */
function switchTab(tabId) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll(`.nav-item[onclick="switchTab('${tabId}')"]`).forEach(el => el.classList.add('active'));
    
    document.querySelectorAll('.module-view').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${tabId}`).classList.add('active');

    // Close mobile menu if open
    if (window.innerWidth <= 768) {
        document.querySelector('.nav-links').classList.remove('open');
    }
}

function openModal(id) {
    document.querySelectorAll('.modal').forEach(el => el.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    document.getElementById('modal-overlay').classList.add('open');
}
function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
}

function copyCode(id) {
    const el = document.getElementById(id);
    const text = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el.value : el.innerText;
    navigator.clipboard.writeText(text).then(() => {
        // Simple toast or alert
        const btn = document.activeElement;
        const original = btn.innerText;
        btn.innerText = '已复制!';
        setTimeout(() => btn.innerText = original, 1000);
    });
}

/* --- Social Preview Logic --- */
let spMode = 'fb';
function setSPMode(mode, btn) {
    spMode = mode;
    document.querySelectorAll('.preview-mode-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateSP();
}

function updateSP() {
    const title = document.getElementById('sp-title').value;
    const desc = document.getElementById('sp-desc').value;
    const img = document.getElementById('sp-img').value;
    const domain = document.getElementById('sp-domain').value;
    const color = document.getElementById('sp-color').value;

    const container = document.getElementById('sp-preview-container');
    let html = '';

    if(spMode === 'fb') {
        html = `
            <div class="card">
                <img src="${img}" class="card-img">
                <div class="card-content">
                    <div class="card-domain">${domain}</div>
                    <div class="card-title">${title}</div>
                    <div class="card-desc">${desc}</div>
                </div>
            </div>
        `;
    } else if (spMode === 'tw') {
        html = `
            <div class="card twitter">
                <img src="${img}" class="card-img">
                <div class="card-content">
                    <div class="card-title">${title}</div>
                    <div class="card-desc">${desc}</div>
                    <div class="card-domain" style="margin-top:4px">${Ui.icon ? Ui.icon('link') : ''} ${domain}</div>
                </div>
            </div>
        `;
    } else if (spMode === 'dc') {
        html = `
            <div class="card discord" style="border-left-color:${color}">
                <div class="card-content">
                    <div class="card-site-name">${domain}</div>
                    <div class="card-title" style="color:#00b0f4">${title}</div>
                    <div class="card-desc">${desc}</div>
                    <img src="${img}" class="card-img">
                </div>
            </div>
        `;
    }

    container.innerHTML = html;

    // Generate Code
    const meta = `
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://${domain}/">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${img}">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://${domain}/">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${desc}">
<meta property="twitter:image" content="${img}">
    `.trim();
    document.getElementById('sp-code').innerText = meta;
}

/* --- Badge Designer Logic --- */
function initBD() {
    const colors = ['brightgreen','green','yellowgreen','yellow','orange','red','blue','lightgrey','success','important','critical','informational','inactive','blueviolet','ff69b4','9cf'];
    const grid = document.getElementById('bd-cgrid');
    colors.forEach(c => {
        const d = document.createElement('div');
        d.className = 'c-btn';
        d.style.backgroundColor = c.startsWith('#') ? c : getShieldColor(c);
        d.onclick = () => {
            document.getElementById('bd-color').value = c;
            updateBD();
        };
        grid.appendChild(d);
    });
}
function getShieldColor(name) {
    const map = { brightgreen:'#4c1', green:'#97ca00', yellowgreen:'#a4a61d', yellow:'#dfb317', orange:'#fe7d37', red:'#e05d44', blue:'#007ec6', lightgrey:'#9f9f9f', success:'#4c1', important:'#fe7d37', critical:'#e05d44', informational:'#007ec6', inactive:'#9f9f9f', blueviolet:'#8a2be2' };
    return map[name] || '#ccc';
}

function updateBD() {
    const label = document.getElementById('bd-label').value.trim() || 'Label';
    const msg = document.getElementById('bd-msg').value.trim() || 'Message';
    let color = document.getElementById('bd-color').value.trim();
    if (color.startsWith('#')) color = color.substring(1);
    
    const style = document.getElementById('bd-style').value;
    const logo = document.getElementById('bd-logo').value.trim();
    const logoCol = document.getElementById('bd-logo-col').value.trim();

    const params = new URLSearchParams();
    params.append('label', label);
    params.append('message', msg);
    params.append('color', color);
    
    if(style) params.append('style', style);
    if(logo) params.append('logo', logo);
    if(logoCol) params.append('logoColor', logoCol);

    const url = `https://img.shields.io/static/v1?${params.toString()}`;

    document.getElementById('bd-preview').src = url;
    document.getElementById('bd-code-md').innerText = `![${label}](${url})`;
    document.getElementById('bd-code-html').innerText = `<img src="${url}" alt="${label}">`;
}

/* --- Icon Explorer Logic --- */
async function searchIcons() {
    const q = document.getElementById('icon-query').value.trim();
    if(!q) return;

    const loader = document.getElementById('icon-loading');
    const resDiv = document.getElementById('icon-results');
    
    loader.style.display = 'block';
    resDiv.innerHTML = '';
    
    try {
        const req = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(q)}&limit=60`);
        const data = await req.json();
        
        loader.style.display = 'none';
        
        if(!data.icons || data.icons.length === 0) {
            resDiv.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:var(--text-dim)">未找到相关图标</div>';
            return;
        }
        
        data.icons.forEach(iconStr => {
            const [prefix, name] = iconStr.split(':');
            const url = `https://api.iconify.design/${prefix}/${name}.svg`;
            
            const div = document.createElement('div');
            div.className = 'icon-item';
            div.innerHTML = `<img src="${url}" loading="lazy" width="24" height="24"><div class="icon-name">${name}</div>`;
            div.onclick = () => selectIcon(prefix, name);
            resDiv.appendChild(div);
        });
        
    } catch(e) {
        loader.style.display = 'none';
        resDiv.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:red">搜索失败，请检查网络</div>';
    }
}

async function selectIcon(prefix, name) {
    const url = `https://api.iconify.design/${prefix}/${name}.svg`;
    try {
        const req = await fetch(url);
        const svg = await req.text();
        document.getElementById('icon-code').value = svg;
    } catch(e) {
        document.getElementById('icon-code').value = `<img src="${url}">`;
    }
}

function updateIconStyle() {}

/* --- Favicon Grabber Logic --- */
function updateFav() {
    let domain = document.getElementById('fav-domain').value.trim();
    if (!domain) return;
    domain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const url = `https://icon.horse/icon/${domain}`;
    document.getElementById('fav-img').src = url;
    document.getElementById('fav-code').value = `<img src="${url}" alt="${domain} favicon">`;
}

/* --- Quick Chart Logic --- */
function updateChart() {
    const type = document.getElementById('qc-type').value;
    const title = document.getElementById('qc-title').value;
    const labels = document.getElementById('qc-labels').value.split(',');
    const data = document.getElementById('qc-data').value.split(',').map(Number);
    
    const config = {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: 'rgba(179, 136, 255, 0.5)',
                borderColor: '#b388ff',
                borderWidth: 2
            }]
        },
        options: {
            title: { display: true, text: title }
        }
    };
    
    const url = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(config))}&width=500&height=300&bkg=white`;
    document.getElementById('qc-img').src = url;
    document.getElementById('qc-url').value = url;
}

/* --- Mock User Logic --- */
async function fetchMockUser() {
    const gender = document.getElementById('mu-gender').value;
    const nat = document.getElementById('mu-nat').value;
    
    let url = 'https://randomuser.me/api/?results=1';
    if(gender) url += `&gender=${gender}`;
    if(nat) url += `&nat=${nat}`;
    
    const btn = document.querySelector('#view-mock .btn');
    const originalText = btn.innerText;
    btn.innerText = 'Loading...';
    
    try {
        const req = await fetch(url);
        const data = await req.json();
        const user = data.results[0];
        
        document.getElementById('mu-json').innerText = JSON.stringify(user, null, 2);
        
        const card = `
            <div class="user-card">
                <img src="${user.picture.large}" class="user-avatar">
                <div class="user-info">
                    <h3>${user.name.first} ${user.name.last}</h3>
                    <p>${user.email}</p>
                    <p>${user.location.city}, ${user.location.country}</p>
                    <div class="tag">${user.login.username}</div>
                </div>
            </div>
        `;
        document.getElementById('mu-card-container').innerHTML = card;
        
    } catch(e) {
        alert('获取失败');
    }
    
    btn.innerText = originalText;
}

/* --- Lorem Ipsum Logic --- */
async function fetchLorem() {
    const paras = document.getElementById('li-paras').value;
    const type = document.getElementById('li-type').value;
    
    const btn = document.querySelector('#view-lorem .btn');
    const originalText = btn.innerText;
    btn.innerText = 'Generating...';
    
    try {
        const req = await fetch(`https://baconipsum.com/api/?type=${type}&paras=${paras}`);
        const data = await req.json();
        document.getElementById('li-text').innerText = data.join('\n\n');
    } catch(e) {
        document.getElementById('li-text').innerText = '生成失败';
    }
    
    btn.innerText = originalText;
}

/* --- Placeholder Logic --- */
function updatePlacehold() {
    const w = document.getElementById('ph-w').value || 600;
    const h = document.getElementById('ph-h').value || 400;
    const bg = document.getElementById('ph-bg').value.replace('#', '');
    const fg = document.getElementById('ph-fg').value.replace('#', '');
    const text = document.getElementById('ph-text').value;
    const fmt = document.getElementById('ph-fmt').value;

    let url = `https://placehold.co/${w}x${h}/${bg}/${fg}.${fmt}`;
    if (text) url += `?text=${encodeURIComponent(text)}`;

    document.getElementById('ph-preview').src = url;
    document.getElementById('ph-url').value = url;
    document.getElementById('ph-html').innerText = `<img src="${url}" alt="${text || 'placeholder'}">`;
}

// Initialize
initBD();
updateBD();
updateSP();
updateFav();
updateChart();
updatePlacehold();


