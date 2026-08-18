/* Extracted from hf-space-converter.html (refactor script). Tool logic. */

    document.addEventListener('DOMContentLoaded', function() {
        ResourceLoader.loadDeps('@icons');
    });

/* ============================================================
 * data-action registrations (refactor)
 * The tool logic (togMin / act / cp / setPos / els) is defined
 * below in this same file (originally split as
 * hf-space-converter__2.js, merged). Its handlers are const arrow
 * functions (not window props), so they must be registered here;
 * they are only referenced at call time.
 * ============================================================ */
if (window.app && app.action) {

    app.action('togMin', function () {
        togMin();
    });

    app.action('act', function () {
        act();
    });

    app.action('cp', function () {
        cp();
    });

    app.action('setPos', function (el) {
        setPos(el.dataset.pos);
    });

    // mouseenter on the panel focuses the input. mouseenter does not
    // bubble, so app.js's delegation cannot catch it; a scoped mouseover
    // delegation is registered here (mouseover bubbles and both fire
    // on the same hover entry).
    app.action('panelFocus', function () {
        els.inp.focus();
    });
    document.addEventListener('mouseover', (e) => {
        const t = e.target;
        const trig = t && t.closest ? t.closest('[data-action="panelFocus"]') : null;
        if (trig) app.runAction('panelFocus', trig, e);
    }, true);

}



let curUrl='', curPos='center', isLoaded=false, els={};
['mainFrame','empty','icon','panel','inp','cpBtn','st','goBtn'].forEach(k=>els[k]=document.getElementById(k));
const ICONS = { center: '↖↗↙↘', tl: '●→↓↘', tr: '←●↙↓', bl: '↑↗●→', br: '↖↑←●' };
const KEYS = ['tl','tr','bl','br'];

const setPos = p => {
    if(p===curPos) p='center';
    curPos = p;
    ['tl','tr','bl','br','center'].forEach(c => { els.panel.classList.remove(c); els.icon.classList.remove(c); });
    els.panel.classList.add(p); els.icon.classList.add(p);
    
    document.querySelectorAll('.p-btn').forEach((b,i) => {
        b.classList.toggle('act', KEYS[i]===p);
        b.textContent = ICONS[p][i];
    });
};
setPos('center');

const togMin = () => { els.panel.classList.toggle('min'); els.icon.classList.toggle('show'); };

const show = (m,e=0) => { els.st.textContent=m; els.st.style.display='block'; els.st.className='status'+(e?' err':''); if(!e) setTimeout(()=>els.st.style.display='none',3000); };

const act = () => isLoaded ? clear() : convert();

const convert = () => {
    const v = els.inp.value.trim();
    let url;

    // 1. Match direct hf.space links
    const mDirect = v.match(/https?:\/\/[\w\-\.]+\.hf\.space[^\s]*/);
    
    // 2. Match standard HuggingFace Space links
    const mStd = v.match(/huggingface\.co\/spaces\/([\w\-\.]+)\/([\w\-\.]+)/i);

    if (mDirect) {
        url = mDirect[0];
    } else if (mStd) {
        const u = mStd[1].toLowerCase().replace(/\./g, '-');
        const r = mStd[2].toLowerCase().replace(/\./g, '-');
        url = `https://${u}-${r}.hf.space`;
    } else {
        return show('未找到有效的 Space 链接', 1);
    }

    curUrl = url;
    els.mainFrame.src = curUrl;
    els.cpBtn.disabled = false;
    els.empty.style.display = 'none';
    if(curPos === 'center') setPos('tr');
    show('加载中...');
    isLoaded = true;
    els.goBtn.innerHTML = '清空';
    els.mainFrame.onload = () => show('加载完成');
};

const clear = () => {
    els.inp.value = '';
    els.cpBtn.disabled = true;
    curUrl = '';
    isLoaded = false;
    els.goBtn.innerHTML = '转换并加载';
    show('已清空');
    els.mainFrame.src = '';
    els.empty.style.display = 'block';
};

const cp = () => curUrl && navigator.clipboard.writeText(curUrl).then(()=>show('已复制!')).catch(()=>show('复制失败',1));

// Events & Init
els.inp.onkeydown = e => { if(e.key==='Enter') convert(); };
els.inp.onpaste = () => setTimeout(convert, 50);
const p = new URLSearchParams(location.search).get('url');
if(p) { els.inp.value=p; convert(); }
document.onkeydown = e => {
    if(els.panel.classList.contains('min')) return;
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='v') els.inp.focus();
    if(document.activeElement === els.panel) {
        const k = e.key;
        const MAP = {
            tl:{ArrowRight:'tr',ArrowDown:'bl'}, tr:{ArrowLeft:'tl',ArrowDown:'br'},
            bl:{ArrowRight:'br',ArrowUp:'tl'}, br:{ArrowLeft:'bl',ArrowUp:'tr'},
            center:{ArrowUp:'tl',ArrowDown:'br',ArrowLeft:'bl',ArrowRight:'tr'}
        };
        if(MAP[curPos] && MAP[curPos][k]) { setPos(MAP[curPos][k]); e.preventDefault(); }
    }
};

