/* Extracted from image-overlay.html (refactor script). Tool logic. */

        document.addEventListener('DOMContentLoaded', function() {
            const image1Input = document.getElementById('image1');
            const image2Input = document.getElementById('image2');
            const preview1 = document.getElementById('preview1');
            const preview2 = document.getElementById('preview2');
            const opacitySlider = document.getElementById('opacity');
            const opacityValue = document.getElementById('opacityValue');
            const blendModeSelect = document.getElementById('blendMode');
            const modeInfo = document.getElementById('modeInfo');
            const combineBtn = document.getElementById('combine');
            const downloadBtn = document.getElementById('download');
            const resetBtn = document.getElementById('reset');
            const canvas = document.getElementById('resultCanvas');
            const ctx = canvas.getContext('2d');
            const placeholder = document.getElementById('placeholder');
            
            let image1 = null;
            let image2 = null;
            
            // 混合模式说明
            const modeDescriptions = {
                normal: "正常模式：上层图片按透明度叠加在底层图片上",
                difference: "差值模式：计算两张图片颜色值的绝对差异，产生高对比度效果",
                multiply: "正片叠底模式：将两张图片的颜色值相乘，通常会使图像变暗",
                screen: "滤色模式：将两张图片的颜色值反转后相乘再反转，通常会使图像变亮"
            };
            
            // 监听混合模式选择变化
            blendModeSelect.addEventListener('change', function() {
                modeInfo.textContent = modeDescriptions[this.value];
            });
            
            // 监听图片1上传
            image1Input.addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        preview1.src = e.target.result;
                        preview1.style.display = 'block';
                        // Hide text/icon in upload area to clean up
                        document.querySelector('#uploadArea1 .upload-text').style.display = 'none';
                        document.querySelector('#uploadArea1 i').style.display = 'none';
                        
                        image1 = new Image();
                        image1.src = e.target.result;
                        image1.onload = function() {
                            if (image1 && image2) combineBtn.disabled = false;
                        };
                    };
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
            
            // 监听图片2上传
            image2Input.addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        preview2.src = e.target.result;
                        preview2.style.display = 'block';
                        document.querySelector('#uploadArea2 .upload-text').style.display = 'none';
                        document.querySelector('#uploadArea2 i').style.display = 'none';
                        
                        image2 = new Image();
                        image2.src = e.target.result;
                        image2.onload = function() {
                            if (image1 && image2) combineBtn.disabled = false;
                        };
                    };
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
            
            // 更新透明度值显示
            opacitySlider.addEventListener('input', function() {
                opacityValue.textContent = this.value + '%';
            });
            
            // 合成图片
            combineBtn.addEventListener('click', function() {
                if (!image1 || !image2) {
                    alert('请先选择两张图片！');
                    return;
                }
                
                placeholder.style.display = 'none';
                canvas.style.display = 'block';
                
                // 设置canvas尺寸为第一张图片的尺寸
                canvas.width = image1.width;
                canvas.height = image1.height;
                
                // 清除canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // 获取混合模式
                const blendMode = blendModeSelect.value;
                const opacity = opacitySlider.value / 100;
                
                // 根据混合模式进行不同的合成处理
                if (blendMode === 'normal') {
                    // 正常模式
                    ctx.drawImage(image1, 0, 0, canvas.width, canvas.height);
                    ctx.globalAlpha = opacity;
                    ctx.drawImage(image2, 0, 0, canvas.width, canvas.height);
                    ctx.globalAlpha = 1.0;
                } else {
                    // 其他混合模式需要手动计算像素
                    applyBlendMode(blendMode, opacity);
                }
                
                // 启用下载按钮
                downloadBtn.disabled = false;
            });
            
            // 应用混合模式
            function applyBlendMode(mode, opacity) {
                // 创建临时canvas用于处理图像数据
                const tempCanvas1 = document.createElement('canvas');
                const tempCtx1 = tempCanvas1.getContext('2d');
                tempCanvas1.width = canvas.width;
                tempCanvas1.height = canvas.height;
                
                const tempCanvas2 = document.createElement('canvas');
                const tempCtx2 = tempCanvas2.getContext('2d');
                tempCanvas2.width = canvas.width;
                tempCanvas2.height = canvas.height;
                
                // 绘制图片到临时canvas
                tempCtx1.drawImage(image1, 0, 0, canvas.width, canvas.height);
                tempCtx2.drawImage(image2, 0, 0, canvas.width, canvas.height);
                
                // 获取图像数据
                const imageData1 = tempCtx1.getImageData(0, 0, canvas.width, canvas.height);
                const imageData2 = tempCtx2.getImageData(0, 0, canvas.width, canvas.height);
                const data1 = imageData1.data;
                const data2 = imageData2.data;
                
                // 创建结果图像数据
                const resultData = ctx.createImageData(canvas.width, canvas.height);
                const result = resultData.data;
                
                // 应用混合模式
                for (let i = 0; i < data1.length; i += 4) {
                    const r1 = data1[i];
                    const g1 = data1[i + 1];
                    const b1 = data1[i + 2];
                    const a1 = data1[i + 3];
                    
                    const r2 = data2[i];
                    const g2 = data2[i + 1];
                    const b2 = data2[i + 2];
                    const a2 = data2[i + 3];
                    
                    let r, g, b;
                    
                    switch (mode) {
                        case 'difference':
                            // 差值模式：|底层颜色 - 上层颜色|
                            r = Math.abs(r1 - r2);
                            g = Math.abs(g1 - g2);
                            b = Math.abs(b1 - b2);
                            break;
                        case 'multiply':
                            // 正片叠底模式：底层颜色 × 上层颜色 / 255
                            r = (r1 * r2) / 255;
                            g = (g1 * g2) / 255;
                            b = (b1 * b2) / 255;
                            break;
                        case 'screen':
                            // 滤色模式：255 - ((255 - 底层颜色) × (255 - 上层颜色)) / 255
                            r = 255 - ((255 - r1) * (255 - r2)) / 255;
                            g = 255 - ((255 - g1) * (255 - g2)) / 255;
                            b = 255 - ((255 - b1) * (255 - b2)) / 255;
                            break;
                        default:
                            r = r1;
                            g = g1;
                            b = b1;
                    }
                    
                    // 应用透明度混合: result = blend * opacity + base * (1 - opacity)
                    // 注意：这里简化处理，假设底层图片是不透明的
                    
                    const blendedR = Math.round(r * opacity + r1 * (1 - opacity));
                    const blendedG = Math.round(g * opacity + g1 * (1 - opacity));
                    const blendedB = Math.round(b * opacity + b1 * (1 - opacity));
                    
                    result[i] = blendedR;
                    result[i + 1] = blendedG;
                    result[i + 2] = blendedB;
                    result[i + 3] = 255; // Alpha
                }
                
                // 将结果绘制回主canvas
                ctx.putImageData(resultData, 0, 0);
            }
            
            // 下载图片
            downloadBtn.addEventListener('click', function() {
                const link = document.createElement('a');
                link.download = 'merged-image.png';
                link.href = canvas.toDataURL();
                link.click();
            });
            
            // 重置
            resetBtn.addEventListener('click', function() {
                image1 = null;
                image2 = null;
                image1Input.value = '';
                image2Input.value = '';
                
                preview1.src = "";
                preview1.style.display = 'none';
                document.querySelector('#uploadArea1 .upload-text').style.display = 'block';
                document.querySelector('#uploadArea1 i').style.display = 'block';
                
                preview2.src = "";
                preview2.style.display = 'none';
                document.querySelector('#uploadArea2 .upload-text').style.display = 'block';
                document.querySelector('#uploadArea2 i').style.display = 'block';
                
                combineBtn.disabled = true;
                downloadBtn.disabled = true;
                
                canvas.style.display = 'none';
                placeholder.style.display = 'block';
                
                opacitySlider.value = 50;
                opacityValue.textContent = '50%';
                blendModeSelect.value = 'normal';
                modeInfo.textContent = modeDescriptions['normal'];
            });
        });
    
