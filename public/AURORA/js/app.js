/**
 * Core Application Logic
 */
const app = {
    init: function() {
        // Init logic will be handled by individual modules or index page
        console.log('App initialized');
    },

    switchTab: function(tabId) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        
        // Find button that triggered this or by data-target
        const btn = document.querySelector(`.tab-btn[onclick*="'${tabId}'"]`) || 
                    document.querySelector(`.tab-btn[data-target="${tabId}"]`);
        if(btn) btn.classList.add('active');
        
        const pane = document.getElementById(`tab-${tabId}`);
        if(pane) pane.classList.add('active');
    },

    showToast: function(msg, type = 'success') {
        const t = document.getElementById('toast');
        if(!t) return;
        t.className = `toast toast-${type} show`;
        t.innerText = msg;
        setTimeout(() => t.classList.remove('show'), 2000);
    },

    copy: function(elementId) {
        const el = document.getElementById(elementId);
        if (!el.value) return;
        el.select();
        document.execCommand('copy');
        this.showToast('已复制到剪贴板');
    },

    clear: function(prefix) {
        const inp = document.getElementById(`${prefix}-input`);
        if(inp) inp.value = '';
        
        const out = document.getElementById(`${prefix}-output`);
        if(out) out.value = '';
        
        if(prefix === 'text') {
            document.getElementById('text-in-stat').innerText = '0 字符';
            document.getElementById('text-out-stat').innerText = '0 字符';
        }
        this.showToast('已清空');
    }
};
