/* Extracted from image-fun.html (refactor script). Tool logic. */

        // --- Iframe Auto-Resize Logic ---
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'resize' && e.data.height) {
                const frame = document.getElementById('fun-frame');
                if (frame) {
                    // Add some buffer or set directly
                    const newHeight = Math.max(800, e.data.height + 50); 
                    frame.style.height = newHeight + 'px';
                    // Also ensure parent body can scroll if needed (though already set to overflow: auto)
                }
            }
        });

        // Theme Propagation Helper
        function propagateThemeToChild() {
            const frame = document.getElementById('fun-frame');
            if(!frame || !frame.contentWindow) return;
            
            const root = document.documentElement;
            const vars = [
                '--bg-deep', '--bg-panel', '--bg-header', '--primary', '--secondary', '--accent', 
                '--text-main', '--text-dim', '--border', '--shadow', '--primary-contrast',
                '--radius-lg', '--radius-md', '--radius-sm', '--font-main', '--font-mono',
                '--input-bg', '--btn-bg', '--btn-hover-bg'
            ];
            
            try {
                const childRoot = frame.contentWindow.document.documentElement;
                vars.forEach(v => {
                    const val = getComputedStyle(root).getPropertyValue(v);
                    if(val) childRoot.style.setProperty(v, val);
                });
            } catch(e) {
                console.log('Cannot propagate theme to cross-origin frame');
            }
        }

        const funFrame = document.getElementById('fun-frame');
        funFrame.addEventListener('load', propagateThemeToChild);
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    propagateThemeToChild();
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });

        function switchFunTool(tool, el) {
            document.querySelectorAll('.nav-pill').forEach(t => t.classList.remove('active'));
            el.classList.add('active');
            
            const frame = document.getElementById('fun-frame');
            if (tool === 'phantom') {
                frame.src = 'image-phantom.html';
            } else if (tool === 'hybrid') {
                frame.src = 'image-hybrid.html';
            }
        }
    
if (window.app && app.action) {
    app.action('switchFunTool', function (el) {
        switchFunTool(el.dataset.mode, el);
    });
}
    
