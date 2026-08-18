/* Extracted from image-drawing.html (refactor script). Tool logic. */

        document.addEventListener('DOMContentLoaded', function() {
            // 画布相关
            const canvas = document.getElementById('drawingCanvas');
            const ctx = canvas.getContext('2d');
            const eraserPreviewCanvas = document.getElementById('eraserPreview');
            const eraserCtx = eraserPreviewCanvas.getContext('2d');
            const container = document.getElementById('canvasContainer');
            
            // 工具按钮
            const brushToolBtn = document.getElementById('brushTool');
            const eraserToolBtn = document.getElementById('eraserTool');
            const penToolBtn = document.getElementById('penTool');
            const clearBtn = document.getElementById('clearCanvas');
            const saveBtn = document.getElementById('saveCanvas');
            const fillBtn = document.getElementById('fillBackground');
            
            // 属性设置
            const brushSizeInput = document.getElementById('brushSize');
            const brushSizeValue = document.getElementById('brushSizeValue');
            const colorOptions = document.querySelectorAll('.color-option');
            
            // 状态变量
            let isDrawing = false;
            let lastX = 0;
            let lastY = 0;
            let currentTool = 'brush'; // brush, eraser, pen
            let currentColor = '#000000';
            let brushSize = 5;
            let startX = 0;
            let startY = 0;
            
            // 初始化画布尺寸
            function resizeCanvas() {
                const rect = container.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
                eraserPreviewCanvas.width = rect.width;
                eraserPreviewCanvas.height = rect.height;
                
                // 设置白色背景
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // 恢复上下文设置
                updateContext();
            }
            
            resizeCanvas();
            window.addEventListener('resize', function() {
                // 保存当前内容
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(canvas, 0, 0);
                
                resizeCanvas();
                
                // 恢复内容
                ctx.drawImage(tempCanvas, 0, 0);
            });
            
            // 更新绘图上下文
            function updateContext() {
                ctx.strokeStyle = currentColor;
                ctx.fillStyle = currentColor;
                ctx.lineWidth = brushSize;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
            
            // 获取鼠标位置
            function getPosition(e) {
                const rect = canvas.getBoundingClientRect();
                return [
                    e.clientX - rect.left,
                    e.clientY - rect.top
                ];
            }
            
            // 绘图事件监听
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);
            
            // 橡皮擦预览
            container.addEventListener('mousemove', function(e) {
                if (currentTool === 'eraser') {
                    const [x, y] = getPosition(e);
                    eraserCtx.clearRect(0, 0, eraserPreviewCanvas.width, eraserPreviewCanvas.height);
                    
                    eraserCtx.beginPath();
                    eraserCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
                    eraserCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    eraserCtx.strokeStyle = '#000';
                    eraserCtx.lineWidth = 1;
                    eraserCtx.fill();
                    eraserCtx.stroke();
                    eraserPreviewCanvas.style.display = 'block';
                } else {
                    eraserPreviewCanvas.style.display = 'none';
                }
            });
            
            container.addEventListener('mouseout', function() {
                eraserPreviewCanvas.style.display = 'none';
            });
            
            function startDrawing(e) {
                isDrawing = true;
                [lastX, lastY] = getPosition(e);
                [startX, startY] = [lastX, lastY];
                
                if (currentTool === 'pen') {
                    ctx.beginPath();
                    ctx.moveTo(lastX, lastY);
                }
            }
            
            function draw(e) {
                if (!isDrawing) return;
                
                const [x, y] = getPosition(e);
                
                if (currentTool === 'brush') {
                    ctx.beginPath();
                    ctx.moveTo(lastX, lastY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    
                    [lastX, lastY] = [x, y];
                } else if (currentTool === 'eraser') {
                    ctx.save();
                    ctx.strokeStyle = '#ffffff';
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.beginPath();
                    ctx.moveTo(lastX, lastY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    
                    ctx.restore();
                    [lastX, lastY] = [x, y];
                }
            }
            
            function stopDrawing(e) {
                if (!isDrawing) return;
                isDrawing = false;
                
                if (currentTool === 'pen') {
                    const [x, y] = getPosition(e);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
            }
            
            // 工具切换
            function setActiveTool(tool) {
                currentTool = tool;
                
                document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
                
                if (tool === 'brush') brushToolBtn.classList.add('active');
                if (tool === 'eraser') eraserToolBtn.classList.add('active');
                if (tool === 'pen') penToolBtn.classList.add('active');
                
                if (tool === 'eraser') {
                    canvas.style.cursor = 'none';
                } else {
                    canvas.style.cursor = 'crosshair';
                }
            }
            
            brushToolBtn.addEventListener('click', () => setActiveTool('brush'));
            eraserToolBtn.addEventListener('click', () => setActiveTool('eraser'));
            penToolBtn.addEventListener('click', () => setActiveTool('pen'));
            
            // 颜色选择
            colorOptions.forEach(option => {
                option.addEventListener('click', function() {
                    colorOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');
                    currentColor = this.getAttribute('data-color');
                    updateContext();
                    
                    hexInput.value = currentColor;
                    updateColorFromHex(currentColor);
                });
            });
            
            // 笔刷大小
            brushSizeInput.addEventListener('input', function() {
                brushSize = this.value;
                brushSizeValue.textContent = brushSize + 'px';
                updateContext();
            });
            
            // 按钮功能
            clearBtn.addEventListener('click', function() {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                updateContext(); 
            });
            
            fillBtn.addEventListener('click', function() {
                ctx.fillStyle = currentColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                updateContext();
            });
            
            saveBtn.addEventListener('click', function() {
                const link = document.createElement('a');
                link.download = 'my-drawing.png';
                link.href = canvas.toDataURL();
                link.click();
            });
            
            // 颜色转换器逻辑
            const hexInput = document.getElementById('hexInput');
            const rgbInput = document.getElementById('rgbInput');
            const colorDisplay = document.getElementById('colorDisplay');
            const colorResult = document.getElementById('colorResult');
            const colorHistory = document.getElementById('colorHistory');
            
            updateColorFromHex('#000000');
            
            hexInput.addEventListener('input', function() {
                let hex = this.value;
                if (!hex.startsWith('#')) hex = '#' + hex;
                if (/^#[0-9A-F]{6}$/i.test(hex)) {
                    updateColorFromHex(hex);
                }
            });
            
            function updateColorFromHex(hex) {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                
                const rgb = `rgb(${r}, ${g}, ${b})`;
                rgbInput.value = rgb;
                colorDisplay.style.backgroundColor = hex;
                
                currentColor = hex;
                updateContext();
                
                addToHistory(hex);
            }
            
            function addToHistory(color) {
                const existing = Array.from(colorHistory.children).find(child => 
                    child.getAttribute('data-color') === color
                );
                
                if (!existing) {
                    const div = document.createElement('div');
                    div.className = 'history-color';
                    div.style.backgroundColor = color;
                    div.setAttribute('data-color', color);
                    div.addEventListener('click', function() {
                        currentColor = color;
                        updateContext();
                        hexInput.value = color;
                        updateColorFromHex(color);
                    });
                    
                    if (colorHistory.children.length >= 10) {
                        colorHistory.removeChild(colorHistory.lastChild);
                    }
                    colorHistory.prepend(div);
                }
            }
            
            // ================= 新增功能 =================
            
            // 1. 随机色板生成
            const randomPaletteBtn = document.getElementById('randomPaletteBtn');
            const colorPalette = document.getElementById('colorPalette');
            
            function generateRandomPalette() {
                colorPalette.innerHTML = '';
                for (let i = 0; i < 8; i++) {
                    const color = getRandomColor();
                    const div = document.createElement('div');
                    div.className = 'palette-color';
                    div.style.backgroundColor = color;
                    
                    const code = document.createElement('span');
                    code.className = 'color-code';
                    code.textContent = color;
                    div.appendChild(code);
                    
                    div.addEventListener('click', function() {
                        currentColor = color;
                        updateContext();
                        hexInput.value = color;
                        updateColorFromHex(color);
                    });
                    
                    colorPalette.appendChild(div);
                }
            }
            
            function getRandomColor() {
                const letters = '0123456789ABCDEF';
                let color = '#';
                for (let i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            }
            
            randomPaletteBtn.addEventListener('click', generateRandomPalette);
            generateRandomPalette(); // 初始化
            
            // 2. 基于图片的色卡生成
            const fileInput = document.getElementById('fileInput');
            const imagePreview = document.getElementById('imagePreview');
            const generatePaletteBtn = document.getElementById('generatePaletteBtn');
            const imageColorPalette = document.getElementById('imageColorPalette');
            
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        imagePreview.src = e.target.result;
                        imagePreview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            generatePaletteBtn.addEventListener('click', function() {
                if (!imagePreview.src || imagePreview.src === '') {
                    alert('请先上传一张图片');
                    return;
                }
                
                if (!imagePreview.complete) {
                    alert('图片尚未加载完成，请稍后再试');
                    return;
                }
                
                try {
                    const palette = extractColorsFromImage(imagePreview);
                    displayImageColorPalette(palette);
                } catch (error) {
                    console.error('提取颜色失败:', error);
                    alert('无法从图片中提取颜色，请尝试其他图片');
                }
            });
            
            function extractColorsFromImage(img) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                const colors = [];
                const samplePoints = 1000;
                
                for (let i = 0; i < samplePoints; i++) {
                    const x = Math.floor(Math.random() * canvas.width);
                    const y = Math.floor(Math.random() * canvas.height);
                    const pixelIndex = (y * canvas.width + x) * 4;
                    
                    const r = data[pixelIndex];
                    const g = data[pixelIndex + 1];
                    const b = data[pixelIndex + 2];
                    
                    colors.push([r, g, b]);
                }
                
                return kMeansClustering(colors, 5);
            }
            
            function kMeansClustering(colors, k) {
                let centroids = [];
                for (let i = 0; i < k; i++) {
                    centroids.push(colors[Math.floor(Math.random() * colors.length)]);
                }
                
                for (let iteration = 0; iteration < 10; iteration++) {
                    const clusters = Array(k).fill().map(() => []);
                    
                    colors.forEach(color => {
                        let minDistance = Infinity;
                        let closestCentroidIndex = 0;
                        
                        centroids.forEach((centroid, index) => {
                            const distance = colorDistance(color, centroid);
                            if (distance < minDistance) {
                                minDistance = distance;
                                closestCentroidIndex = index;
                            }
                        });
                        
                        clusters[closestCentroidIndex].push(color);
                    });
                    
                    let newCentroids = [];
                    clusters.forEach(cluster => {
                        if (cluster.length > 0) {
                            const sum = cluster.reduce((acc, color) => {
                                return [acc[0] + color[0], acc[1] + color[1], acc[2] + color[2]];
                            }, [0, 0, 0]);
                            
                            newCentroids.push([
                                Math.round(sum[0] / cluster.length),
                                Math.round(sum[1] / cluster.length),
                                Math.round(sum[2] / cluster.length)
                            ]);
                        } else {
                            newCentroids.push(colors[Math.floor(Math.random() * colors.length)]);
                        }
                    });
                    
                    centroids = newCentroids;
                }
                
                return centroids;
            }
            
            function colorDistance(color1, color2) {
                const dr = color1[0] - color2[0];
                const dg = color1[1] - color2[1];
                const db = color1[2] - color2[2];
                return Math.sqrt(dr * dr + dg * dg + db * db);
            }
            
            function displayImageColorPalette(palette) {
                imageColorPalette.innerHTML = '';
                palette.forEach(color => {
                    const hexColor = rgbToHex(color[0], color[1], color[2]);
                    const div = document.createElement('div');
                    div.className = 'palette-color';
                    div.style.backgroundColor = hexColor;
                    
                    const code = document.createElement('span');
                    code.className = 'color-code';
                    code.textContent = hexColor;
                    div.appendChild(code);
                    
                    div.addEventListener('click', function() {
                        currentColor = hexColor;
                        updateContext();
                        hexInput.value = hexColor;
                        updateColorFromHex(hexColor);
                    });
                    
                    imageColorPalette.appendChild(div);
                });
            }
            
            function rgbToHex(r, g, b) {
                return "#" + [r, g, b].map(x => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                }).join('');
            }
        });

if (window.app && app.action) {
    app.action('drawing.goto-svg-painter', function () {
        window.location.href = 'image-svg-painter.html';
    });
}
    
