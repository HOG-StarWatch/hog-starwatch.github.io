/* Extracted from qrcode.html (refactor script). Tool logic. */

        // Sync color pickers
        document.getElementById('qr-color-dark').addEventListener('input', (e) => {
            document.getElementById('qr-color-dark-text').value = e.target.value;
        });
        document.getElementById('qr-color-light').addEventListener('input', (e) => {
            document.getElementById('qr-color-light-text').value = e.target.value;
        });

        let qrcodeObj = null;
        let logoDataUrl = null;

        // Handle Logo Upload
        document.getElementById('qr-logo-file').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    logoDataUrl = evt.target.result;
                    app.showToast('Logo 已加载，请点击生成');
                    // Auto generate when logo loaded
                    generateQR();
                };
                reader.readAsDataURL(file);
            } else {
                logoDataUrl = null;
            }
        });
        
        // Auto generate on input changes (debounce could be added but for local it's fast enough)
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if(input.type !== 'file') {
                 input.addEventListener('change', () => generateQR());
            }
        });

        function generateQR() {
            const text = document.getElementById('qr-text').value;
            const width = parseInt(document.getElementById('qr-width').value) || 256;
            const height = width;
            const colorDark = document.getElementById('qr-color-dark').value;
            const colorLight = document.getElementById('qr-color-light').value;
            const correctLevel = document.getElementById('qr-correct').value;
            const dotScale = parseFloat(document.getElementById('qr-dot-scale').value) || 1.0;
            const quietZone = parseInt(document.getElementById('qr-quiet-zone').value) || 0;

            const container = document.getElementById('qrcode-container');
            container.innerHTML = ''; // Clear previous

            if (!text) {
                // Don't toast on initial load empty, just return
                return;
            }

            if (typeof QRCode === 'undefined') {
                app.showToast('正在加载组件...', 'info');
                ResourceLoader.loadDeps('easyqrcodejs').then(() => {
                    generateQR(); // Retry after load
                });
                return;
            }

            const options = {
                text: text,
                width: width,
                height: height,
                colorDark: colorDark,
                colorLight: colorLight,
                correctLevel: QRCode.CorrectLevel[correctLevel],
                
                dotScale: dotScale,
                quietZone: quietZone,
                
                logo: logoDataUrl,
                logoWidth: width * 0.2, // Default logo size 20%
                logoHeight: width * 0.2,
                logoBackgroundColor: '#ffffff', // Optional: white bg for logo
                logoBackgroundTransparent: false
            };

            try {
                // EasyQRCodeJS
                qrcodeObj = new QRCode(container, options);
                
            } catch (e) {
                console.error(e);
                app.showToast('生成失败: ' + e.message);
            }
        }

        function downloadQR() {
            const container = document.getElementById('qrcode-container');
            const canvas = container.querySelector('canvas');
            
            if (!canvas) {
                app.showToast('请先生成二维码');
                return;
            }

            try {
                const link = document.createElement('a');
                link.download = 'qrcode.png';
                link.href = canvas.toDataURL("image/png");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                app.showToast('开始下载');
            } catch(e) {
                app.showToast('下载失败，请尝试右键保存');
            }
        }

        // Initialize on load
        window.onload = function() {
            // Mobile Optimization: Auto-adjust size
            if (window.innerWidth < 600) {
                document.getElementById('qr-width').value = 250;
            }
            generateQR();
        };
    
// data-action registrations (replaces inline onclick=)
if (window.app && app.action) {
    app.action('sync-color-input', function (el) {
        const t = el.dataset.syncTarget;
        const target = t && document.getElementById(t);
        if (target) target.value = el.value;
    });
}