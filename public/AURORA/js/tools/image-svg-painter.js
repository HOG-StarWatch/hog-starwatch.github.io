/* Extracted from image-svg-painter.html (refactor script). Tool logic. */

        const ns = 'http://www.w3.org/2000/svg';
        const create = (t, a={}) => {
            const el = document.createElementNS(ns, t);
            Object.entries(a).forEach(([k,v]) => el.setAttribute(k, v));
            return el;
        };

        const svg = document.getElementById('svg-canvas');
        let isDrawing = false;
        let startX, startY;
        let currentElement = null;
        let mode = 'path';
        let history = [];
        let sprayInterval = null;
        let lastPos = {x: 0, y: 0};
        
        // Styles Configuration
        const styleDefs = [
            { id: 'geometric', name: '几何' },
            { id: 'mandala', name: '曼陀罗' },
            { id: 'flow', name: '流光' },
            { id: 'circuit', name: '电路' },
            { id: 'pixel', name: '像素' },
            { id: 'starfield', name: '星空' },
            { id: 'bubbles', name: '气泡' },
            { id: 'waves', name: '波浪' },
            { id: 'memphis', name: '孟菲斯' },
            { id: 'fractal', name: '分形树' },
            { id: 'maze', name: '迷宫' },
            { id: 'hexagons', name: '六边形' },
            { id: 'rain', name: '数码雨' },
            { id: 'spirals', name: '螺旋' },
            { id: 'crossstitch', name: '十字绣' }
        ];

        // Init Style List
        const styleListEl = document.getElementById('style-list');
        styleDefs.forEach(s => {
            const div = document.createElement('div');
            div.innerHTML = `<label style="cursor:pointer; display:flex; align-items:center; gap:3px;"><input type="checkbox" name="style-filter" value="${s.id}" checked> ${s.name}</label>`;
            styleListEl.appendChild(div);
        });

        function toggleAllStyles(btn) {
            const checkboxes = document.querySelectorAll('input[name="style-filter"]');
            const allChecked = Array.from(checkboxes).every(c => c.checked);
            checkboxes.forEach(c => c.checked = !allChecked);
            btn.innerText = allChecked ? '全选' : '全不选';
        }

        // Setup Controls
        document.getElementById('stroke-width').addEventListener('input', (e) => {
            document.getElementById('width-val').innerText = e.target.value;
        });
        document.getElementById('opacity').addEventListener('input', (e) => {
            document.getElementById('opacity-val').innerText = e.target.value + '%';
        });

        function setMode(m, btn) {
            mode = m;
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            if(btn) btn.classList.add('active');
            app.showToast(`切换模式: ${m}`);
        }

        function toggleGrid() {
            const show = document.getElementById('show-grid').checked;
            const size = document.getElementById('grid-size').value;
            const canvas = document.getElementById('svg-canvas');
            if (show) {
                canvas.style.backgroundImage = `linear-gradient(to right, #ddd 1px, transparent 1px), linear-gradient(to bottom, #ddd 1px, transparent 1px)`;
                canvas.style.backgroundSize = `${size}px ${size}px`;
            } else {
                canvas.style.backgroundImage = 'none';
            }
        }

        function updateGrid() {
            if(document.getElementById('show-grid').checked) toggleGrid();
        }

        function getMousePos(evt) {
            const rect = svg.getBoundingClientRect();
            // Calculate scale if svg is resized by css
            const scaleX = 512 / rect.width;
            const scaleY = 512 / rect.height;
            let x = (evt.clientX - rect.left) * scaleX;
            let y = (evt.clientY - rect.top) * scaleY;

            if (document.getElementById('snap-grid').checked) {
                const size = parseInt(document.getElementById('grid-size').value) || 20;
                x = Math.round(x / size) * size;
                y = Math.round(y / size) * size;
            }
            return { x, y };
        }

        function getStyles() {
            const stroke = document.getElementById('stroke-color').value;
            const fillEnabled = document.getElementById('enable-fill').checked;
            const fill = fillEnabled ? document.getElementById('fill-color').value : 'none';
            const width = document.getElementById('stroke-width').value;
            const opacity = document.getElementById('opacity').value / 100;
            const lineCap = document.getElementById('line-cap').value;
            return { stroke, fill, width, opacity, lineCap };
        }

        svg.addEventListener('mousedown', (e) => {
            if(mode === 'text') {
                const text = prompt("请输入文本:", "Text");
                if(text) {
                    const pos = getMousePos(e);
                    const styles = getStyles();
                    const el = create('text', {'x': pos.x, 'y': pos.y, 'fill': styles.stroke, 'font-size': styles.width * 5, 'font-family': 'Arial, sans-serif', 'opacity': styles.opacity});
                    el.textContent = text;
                    svg.appendChild(el);
                    history.push(el);
                }
                return;
            }

            isDrawing = true;
            const pos = getMousePos(e);
            startX = pos.x;
            startY = pos.y;
            lastPos = pos;
            const styles = getStyles();

            if (mode === 'spray') {
                currentElement = create('g', {'class': 'spray-group'});
                svg.appendChild(currentElement);
                
                // Start spraying
                sprayInterval = setInterval(() => {
                    if(!isDrawing) return;
                    const styles = getStyles();
                    spray(lastPos.x, lastPos.y, styles);
                }, 50);
                spray(pos.x, pos.y, styles); 
                return;
            }

            if (mode === 'calligraphy') {
                currentElement = create('g', {'fill': styles.stroke, 'opacity': styles.opacity});
                svg.appendChild(currentElement);
                // Initial dab
                drawCalligraphy(pos.x, pos.y, styles);
                return;
            }

            if (mode === 'path') {
                currentElement = create('path', {'d': `M ${startX} ${startY}`, 'fill': 'none', 'stroke-linecap': styles.lineCap, 'stroke-linejoin': 'round'});
            } else if (mode === 'line') {
                currentElement = create('line', {'x1': startX, 'y1': startY, 'x2': startX, 'y2': startY, 'fill': 'none', 'stroke-linecap': styles.lineCap});
            } else if (mode === 'rect') {
                currentElement = create('rect', {'x': startX, 'y': startY, 'width': 0, 'height': 0, 'fill': styles.fill, 'stroke-linejoin': 'round'});
            } else if (mode === 'circle') {
                currentElement = create('circle', {'cx': startX, 'cy': startY, 'r': 0, 'fill': styles.fill});
            } else if (mode === 'ellipse') {
                currentElement = create('ellipse', {'cx': startX, 'cy': startY, 'rx': 0, 'ry': 0, 'fill': styles.fill});
            }

            if(currentElement) {
                if(mode !== 'spray' && mode !== 'calligraphy') {
                    currentElement.setAttribute('stroke', styles.stroke);
                    currentElement.setAttribute('stroke-width', styles.width);
                    currentElement.setAttribute('opacity', styles.opacity);
                }
                svg.appendChild(currentElement);
            }
        });

        function drawCalligraphy(x, y, styles) {
            if(!currentElement) return;
            // Draw a slanted line at 45 degrees
            const size = styles.width;
            const angle = Math.PI / 4; // 45 deg
            const dx = Math.cos(angle) * size;
            const dy = Math.sin(angle) * size;
            
            const segment = create('line', {'x1': x - dx, 'y1': y + dy, 'x2': x + dx, 'y2': y - dy, 'stroke': styles.stroke, 'stroke-width': 2});
            
            currentElement.appendChild(segment);
        }

        function spray(x, y, styles) {
            if(!currentElement) return;
            const density = 5;
            const radius = styles.width * 2;
            
            for(let i=0; i<density; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.random() * radius;
                const dotX = x + r * Math.cos(angle);
                const dotY = y + r * Math.sin(angle);
                
                const dot = create('circle', {'cx': dotX, 'cy': dotY, 'r': Math.random() * 1.5, 'fill': styles.stroke, 'opacity': styles.opacity});
                currentElement.appendChild(dot);
            }
        }

        svg.addEventListener('mousemove', (e) => {
            const pos = getMousePos(e);
            lastPos = pos;
            
            if (isDrawing && mode === 'spray') {
                const styles = getStyles();
                spray(pos.x, pos.y, styles);
                return;
            }

            if (isDrawing && mode === 'calligraphy') {
                const styles = getStyles();
                drawCalligraphy(pos.x, pos.y, styles);
                return;
            }

            if (!isDrawing || !currentElement) return;

            let targetX = pos.x;
            let targetY = pos.y;

            // Shift Constraints
            if (e.shiftKey) {
                if (mode === 'line') {
                    const dx = targetX - startX;
                    const dy = targetY - startY;
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    const snapAngle = Math.round(angle / 45) * 45;
                    const rad = snapAngle * Math.PI / 180;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    targetX = startX + Math.cos(rad) * dist;
                    targetY = startY + Math.sin(rad) * dist;
                } else if (mode === 'rect') {
                    const w = Math.abs(targetX - startX);
                    const h = Math.abs(targetY - startY);
                    const size = Math.max(w, h);
                    targetX = startX + (targetX > startX ? size : -size);
                    targetY = startY + (targetY > startY ? size : -size);
                } else if (mode === 'ellipse') {
                    const rx = Math.abs(targetX - startX);
                    const ry = Math.abs(targetY - startY);
                    const r = Math.max(rx, ry);
                    targetX = startX + (targetX > startX ? r : -r);
                    targetY = startY + (targetY > startY ? r : -r);
                }
            }

            if (mode === 'path') {
                const d = currentElement.getAttribute('d');
                currentElement.setAttribute('d', `${d} L ${pos.x} ${pos.y}`);
            } else if (mode === 'line') {
                currentElement.setAttribute('x2', targetX);
                currentElement.setAttribute('y2', targetY);
            } else if (mode === 'rect') {
                const w = targetX - startX;
                const h = targetY - startY;
                currentElement.setAttribute('x', w < 0 ? targetX : startX);
                currentElement.setAttribute('y', h < 0 ? targetY : startY);
                currentElement.setAttribute('width', Math.abs(w));
                currentElement.setAttribute('height', Math.abs(h));
            } else if (mode === 'circle') {
                const r = Math.sqrt(Math.pow(pos.x - startX, 2) + Math.pow(pos.y - startY, 2));
                currentElement.setAttribute('r', r);
            } else if (mode === 'ellipse') {
                currentElement.setAttribute('rx', Math.abs(targetX - startX));
                currentElement.setAttribute('ry', Math.abs(targetY - startY));
            }
        });

        svg.addEventListener('mouseup', () => {
            if (isDrawing) {
                if(sprayInterval) clearInterval(sprayInterval);
                if(currentElement) history.push(currentElement);
            }
            isDrawing = false;
            currentElement = null;
        });

        svg.addEventListener('mouseleave', () => {
            if (isDrawing) {
                 if(sprayInterval) clearInterval(sprayInterval);
                 if(currentElement) history.push(currentElement);
            }
            isDrawing = false;
            currentElement = null;
        });

        function undo() {
            if (history.length > 0) {
                const el = history.pop();
                svg.removeChild(el);
            }
        }

        function clearCanvas() {
            if(confirm('确定清空画板吗？')) {
                svg.innerHTML = '';
                history = [];
            }
        }

        function exportSVG() {
            const serializer = new XMLSerializer();
            let source = serializer.serializeToString(svg);
            // Add xml declaration
            source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
            
            const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
            const a = document.createElement('a');
            a.href = url;
            a.download = `drawing-${Date.now()}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            app.showToast('SVG 已导出');
        }

        function copySeed() {
            const seedText = document.getElementById('seed-display').innerText;
            if(seedText) {
                const val = seedText.split(': ')[1];
                if(val) {
                    navigator.clipboard.writeText(val);
                    app.showToast('种子已复制: ' + val);
                }
            }
        }

        function generateRandomArt() {
            // 1. Handle Canvas Clearing
            const shouldClear = document.getElementById('clear-before-gen').checked;
            if (shouldClear) {
                svg.innerHTML = '';
                history = [];
            }

            // 2. Seed Processing
            const seedInput = document.getElementById('art-seed');
            let seedVal = seedInput.value.trim();
            
            // If empty, use random, but DON'T fill input (so next click is random again)
            if (!seedVal) {
                seedVal = Math.random().toString(36).substring(2, 8).toUpperCase();
            }
            
            // Display seed
            document.getElementById('seed-display').innerText = `种子: ${seedVal}`;

            // Hash function (cyrb53)
            const cyrb53 = function(str, seed = 0) {
                let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
                for (let i = 0, ch; i < str.length; i++) {
                    ch = str.charCodeAt(i);
                    h1 = Math.imul(h1 ^ ch, 2654435761);
                    h2 = Math.imul(h2 ^ ch, 1597334677);
                }
                h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
                h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
                return 4294967296 * (2097151 & h2) + (h1 >>> 0);
            };

            const seedHash = cyrb53(seedVal);

            // PRNG (Mulberry32)
            const random = (function(a) {
                return function() {
                  var t = a += 0x6D2B79F5;
                  t = Math.imul(t ^ t >>> 15, t | 1);
                  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
                  return ((t ^ t >>> 14) >>> 0) / 4294967296;
                }
            })(seedHash);

            // Helper: Random Range
            const randRange = (min, max) => min + random() * (max - min);
            const randInt = (min, max) => Math.floor(randRange(min, max));
            const randChoice = (arr) => arr[Math.floor(random() * arr.length)];
            const chance = (prob) => random() < prob;

            // 3. Palette Generator
            const generatePalette = () => {
                const hue = randInt(0, 360);
                const scheme = randChoice(['complementary', 'analogous', 'triadic', 'split']);
                const palette = [];
                
                const addColor = (h, s, l) => {
                    palette.push(`hsl(${h % 360}, ${s}%, ${l}%)`);
                };

                // Base color
                const s = randInt(60, 90);
                const l = randInt(40, 60);
                addColor(hue, s, l);

                if (scheme === 'complementary') {
                    addColor(hue + 180, s, l);
                    addColor(hue, s - 20, l + 20);
                    addColor(hue + 180, s - 20, l - 10);
                } else if (scheme === 'analogous') {
                    addColor(hue + 30, s, l);
                    addColor(hue - 30, s, l);
                    addColor(hue + 60, s - 10, l + 10);
                } else if (scheme === 'triadic') {
                    addColor(hue + 120, s, l);
                    addColor(hue + 240, s, l);
                    addColor(hue, s - 30, l + 30);
                } else { // split
                    addColor(hue + 150, s, l);
                    addColor(hue + 210, s, l);
                    addColor(hue, s - 10, l + 30);
                }
                // Add a dark and a light neutral
                palette.push(`hsl(${hue}, 10%, 90%)`);
                palette.push(`hsl(${hue}, 20%, 20%)`);
                return palette;
            };

            const palette = generatePalette();
            
            // Filter styles
            const selectedStyles = Array.from(document.querySelectorAll('input[name="style-filter"]:checked')).map(cb => cb.value);
            if (selectedStyles.length === 0) {
                app.showToast('请至少选择一种风格');
                return;
            }
            
            const style = randChoice(selectedStyles);
            const width = 512;
            const height = 512;

            // 4. Generators
            const generators = {
                geometric: () => {
                    // Recursive subdivision (Bauhaus style)
                    const maxDepth = 4;
                    
                    if (shouldClear) {
                        const bg = create('rect', {'width': width, 'height': height, 'fill': '#f0f0f0'});
                        svg.appendChild(bg);
                    }

                    const drawRect = (x, y, w, h, depth) => {
                        if (depth >= maxDepth || (chance(0.3) && depth > 1)) {
                            const color = randChoice(palette);
                            const el = create('rect', {'x': x, 'y': y, 'width': w, 'height': h, 'fill': color, 'stroke': '#333', 'stroke-width': 2});
                            svg.appendChild(el);
                            
                            // Add detail?
                            if (chance(0.3) && w > 40 && h > 40) {
                                const type = randChoice(['circle', 'lines']);
                                if (type === 'circle') {
                                    const c = create('circle', {'cx': x + w/2, 'cy': y + h/2, 'r': Math.min(w, h)/3, 'fill': randChoice(palette)});
                                    svg.appendChild(c);
                                }
                            }
                            return;
                        }

                        // Split
                        const splitVert = random() > 0.5;
                        if (splitVert) {
                            const split = w * randRange(0.3, 0.7);
                            drawRect(x, y, split, h, depth + 1);
                            drawRect(x + split, y, w - split, h, depth + 1);
                        } else {
                            const split = h * randRange(0.3, 0.7);
                            drawRect(x, y, w, split, depth + 1);
                            drawRect(x, y + split, w, h - split, depth + 1);
                        }
                    };
                    
                    drawRect(10, 10, width-20, height-20, 0);
                },
                
                mandala: () => {
                    // Radial symmetry
                    const cx = width / 2;
                    const cy = height / 2;
                    const rings = randInt(5, 12);
                    
                    if (shouldClear) {
                        const bg = create('rect', {'width': width, 'height': height, 'fill': palette[palette.length-1]});
                        svg.appendChild(bg);
                    }

                    for (let r = rings; r > 0; r--) {
                        const radius = (width / 2) * (r / rings);
                        const points = randInt(6, 24);
                        const shape = randChoice(['circle', 'petal', 'triangle']);
                        const color = palette[r % palette.length];
                        
                        const g = create('g');
                        svg.appendChild(g);

                        for (let i = 0; i < points; i++) {
                            const angle = (i / points) * Math.PI * 2;
                            const x = cx + Math.cos(angle) * radius * 0.8;
                            const y = cy + Math.sin(angle) * radius * 0.8;
                            
                            let el;
                            if (shape === 'circle') {
                                el = create('circle', {'cx': x, 'cy': y, 'r': radius * 0.2});
                            } else if (shape === 'triangle') {
                                el = create('polygon');
                                const s = radius * 0.2;
                                const pts = `${x},${y-s} ${x-s},${y+s} ${x+s},${y+s}`;
                                el.setAttribute('points', pts);
                                el.setAttribute('transform', `rotate(${(angle * 180 / Math.PI) + 90}, ${x}, ${y})`);
                            } else {
                                // Petal (Ellipse)
                                el = create('ellipse', {'cx': x, 'cy': y, 'rx': radius * 0.1, 'ry': radius * 0.3, 'transform': `rotate(${(angle * 180 / Math.PI) + 90}, ${x}, ${y})`});
                            }
                            
                            el.setAttribute('fill', color);
                            el.setAttribute('opacity', 0.8);
                            g.appendChild(el);
                        }
                    }
                },
                
                flow: () => {
                    // Flowing lines
                    if (shouldClear) {
                        const bg = create('rect', {'width': width, 'height': height, 'fill': '#111'});
                        svg.appendChild(bg);
                    }

                    const lines = randInt(50, 100);
                    const steps = 20;
                    
                    for(let i=0; i<lines; i++) {
                        const path = create('path');
                        let d = `M ${randRange(0, width)} ${randRange(0, height)}`;
                        let x = randRange(0, width);
                        let y = randRange(0, height);
                        
                        // Create a smooth curve
                        for(let s=0; s<steps; s++) {
                             const angle = (x / width) * Math.PI * 4 + (y / height) * Math.PI * 4;
                             x += Math.cos(angle) * 20;
                             y += Math.sin(angle) * 20;
                             d += ` L ${x} ${y}`;
                        }
                        
                        path.setAttribute('d', d);
                        path.setAttribute('fill', 'none');
                        path.setAttribute('stroke', randChoice(palette));
                        path.setAttribute('stroke-width', randRange(1, 4));
                        path.setAttribute('opacity', randRange(0.3, 0.8));
                        svg.appendChild(path);
                    }
                },

                circuit: () => {
                    // Circuit board style
                    if (shouldClear) {
                        const bg = create('rect', {'width': width, 'height': height, 'fill': '#002'});
                        svg.appendChild(bg);
                    }
                    
                    const gridSize = 32;
                    const cols = Math.floor(width / gridSize);
                    const rows = Math.floor(height / gridSize);
                    const traces = randInt(20, 50);
                    
                    for(let i=0; i<traces; i++) {
                        let cx = randInt(1, cols-1) * gridSize;
                        let cy = randInt(1, rows-1) * gridSize;
                        const len = randInt(5, 15);
                        let points = [[cx, cy]];
                        let dir = randInt(0, 4); // 0:R, 1:D, 2:L, 3:U
                        
                        for(let j=0; j<len; j++) {
                            if(chance(0.3)) dir = (dir + (chance(0.5)?1:3)) % 4;
                            if(dir === 0) cx += gridSize;
                            else if(dir === 1) cy += gridSize;
                            else if(dir === 2) cx -= gridSize;
                            else cy -= gridSize;
                            
                            // Clamp
                            cx = Math.max(0, Math.min(width, cx));
                            cy = Math.max(0, Math.min(height, cy));
                            points.push([cx, cy]);
                        }
                        
                        const polyline = create('polyline', {'points': points.map(p => p.join(',')).join(' '), 'fill': 'none', 'stroke': randChoice(palette), 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'opacity': 0.8});
                        svg.appendChild(polyline);
                        
                        // Terminals
                        const start = create('circle', {'cx': points[0][0], 'cy': points[0][1], 'r': 3, 'fill': '#fff'});
                        svg.appendChild(start);
                        
                        const end = create('circle', {'cx': points[points.length-1][0], 'cy': points[points.length-1][1], 'r': 3, 'fill': '#fff'});
                        svg.appendChild(end);
                    }
                },

                pixel: () => {
                    // Pixel art grid
                    const pSize = randChoice([16, 32, 64]);
                    const cols = Math.ceil(width / pSize);
                    const rows = Math.ceil(height / pSize);
                    
                    if (shouldClear) {
                        const bg = create('rect', {'width': width, 'height': height, 'fill': '#000'});
                        svg.appendChild(bg);
                    }
                    
                    // Symmetry?
                    const symX = chance(0.5);
                    const symY = chance(0.5);
                    
                    for(let y=0; y<rows; y++) {
                        for(let x=0; x<cols; x++) {
                            // Check symmetry
                            let srcX = x, srcY = y;
                            if(symX && x >= cols/2) srcX = cols - 1 - x;
                            if(symY && y >= rows/2) srcY = rows - 1 - y;
                            
                            // Noise based on position
                            const noise = (Math.sin(srcX*0.5) + Math.cos(srcY*0.5)) * 0.5 + 0.5;
                            
                            if (random() > 0.4) { // Sparsity
                                const rect = create('rect', {'x': x * pSize, 'y': y * pSize, 'width': pSize, 'height': pSize, 'fill': randChoice(palette), 'opacity': 0.8 + random()*0.2});
                                svg.appendChild(rect);
                            }
                        }
                    }
                },
                
                starfield: () => {
                    // Constellation / Starfield
                    if (shouldClear) {
                        const bg = create('rect', {'width': width, 'height': height, 'fill': '#0a0a1a'});
                        svg.appendChild(bg);
                    }
                    
                    const starCount = randInt(50, 100);
                    const stars = [];
                    
                    // Generate stars
                    for(let i=0; i<starCount; i++) {
                        const s = {
                            x: randRange(0, width),
                            y: randRange(0, height),
                            r: randRange(1, 3)
                        };
                        stars.push(s);
                        
                        const c = create('circle', {'cx': s.x, 'cy': s.y, 'r': s.r, 'fill': '#fff', 'opacity': randRange(0.5, 1)});
                        svg.appendChild(c);
                    }
                    
                    // Connect neighbors
                    const maxDist = 80;
                    for(let i=0; i<stars.length; i++) {
                        for(let j=i+1; j<stars.length; j++) {
                            const dx = stars[i].x - stars[j].x;
                            const dy = stars[i].y - stars[j].y;
                            const dist = Math.sqrt(dx*dx + dy*dy);
                            
                            if (dist < maxDist) {
                                const line = create('line', {'x1': stars[i].x, 'y1': stars[i].y, 'x2': stars[j].x, 'y2': stars[j].y, 'stroke': randChoice(palette), 'stroke-width': (1 - dist/maxDist) * 2, 'opacity': (1 - dist/maxDist) * 0.5});
                                svg.appendChild(line);
                            }
                        }
                    }
                },

                bubbles: () => {
                    if (shouldClear) {
                        const bg = create('rect', {'width': width, 'height': height, 'fill': palette[palette.length-1]});
                        svg.appendChild(bg);
                    }
                    const count = randInt(20, 50);
                    for(let i=0; i<count; i++) {
                        const r = randRange(10, 80);
                        const cx = randRange(0, width);
                        const cy = randRange(0, height);
                        const c = create('circle', {'cx': cx, 'cy': cy, 'r': r, 'fill': randChoice(palette), 'opacity': randRange(0.2, 0.6)});
                        // Add some gradient-like stroke
                        if(chance(0.5)) {
                            c.setAttribute('stroke', '#fff');
                            c.setAttribute('stroke-width', 2);
                            c.setAttribute('stroke-opacity', 0.4);
                        }
                        svg.appendChild(c);
                    }
                },

                waves: () => {
                    if (shouldClear) {
                        const bg = create('rect', {'width': width, 'height': height, 'fill': palette[palette.length-1]});
                        svg.appendChild(bg);
                    }
                    const layers = randInt(5, 10);
                    const stepY = height / layers;
                    
                    for(let i=0; i<layers; i++) {
                        const yBase = i * stepY;
                        let d = `M 0 ${yBase + 50}`;
                        const freq = randRange(0.01, 0.05);
                        const amp = randRange(20, 50);
                        const phase = randRange(0, Math.PI*2);
                        
                        for(let x=0; x<=width; x+=10) {
                            const y = yBase + Math.sin(x * freq + phase) * amp;
                            d += ` L ${x} ${y}`;
                        }
                        d += ` L ${width} ${height} L 0 ${height} Z`;
                        
                        const path = create('path', {'d': d, 'fill': palette[i % palette.length], 'opacity': 0.7});
                        svg.appendChild(path);
                    }
                },

                memphis: () => {
                    if (shouldClear) {
                        const bg = create('rect', {'width': width, 'height': height, 'fill': '#fff'});
                        svg.appendChild(bg);
                    }
                    const count = randInt(30, 60);
                    for(let i=0; i<count; i++) {
                        const type = randChoice(['rect', 'circle', 'line', 'triangle', 'squiggle']);
                        const x = randRange(0, width);
                        const y = randRange(0, height);
                        const color = randChoice(palette);
                        const rot = randRange(0, 360);
                        
                        let el;
                        if(type === 'rect') {
                            el = create('rect', {'x': x, 'y': y, 'width': randRange(20, 60), 'height': randRange(20, 60)});
                        } else if (type === 'circle') {
                            el = create('circle', {'cx': x, 'cy': y, 'r': randRange(10, 30)});
                        } else if (type === 'triangle') {
                            el = create('polygon', {'points': '0,-20 -20,20 20,20'});
                        } else if (type === 'line') {
                            el = create('rect', {'width': randRange(40, 80), 'height': 5, 'x': x, 'y': y});
                        } else { // squiggle
                            el = create('path', {'d': 'M0,0 Q10,-20 20,0 T40,0', 'fill': 'none', 'stroke': color, 'stroke-width': 4, 'transform': `translate(${x},${y}) rotate(${rot}) scale(${randRange(1,2)})`});
                            svg.appendChild(el);
                            continue; // Special handling for path
                        }
                        
                        if(type !== 'squiggle') {
                            el.setAttribute('fill', color);
                            if(type === 'triangle') {
                                el.setAttribute('transform', `translate(${x},${y}) rotate(${rot})`);
                            } else if (type === 'rect') {
                                el.setAttribute('transform', `rotate(${rot}, ${x}, ${y})`);
                            }
                        }
                        svg.appendChild(el);
                    }
                },

                fractal: () => {
                    // Recursive Tree
                    if (shouldClear) {
                        const bg = create('rect', {'width': width, 'height': height, 'fill': '#111'});
                        svg.appendChild(bg);
                    }
                    
                    const drawBranch = (x, y, len, angle, depth) => {
                        if (depth === 0) return;
                        
                        const x2 = x + Math.cos(angle) * len;
                        const y2 = y + Math.sin(angle) * len;
                        
                        const line = create('line', {'x1': x, 'y1': y, 'x2': x2, 'y2': y2, 'stroke': palette[depth % palette.length], 'stroke-width': depth, 'stroke-linecap': 'round'});
                        svg.appendChild(line);
                        
                        // Recursive calls
                        const subLen = len * 0.7;
                        drawBranch(x2, y2, subLen, angle - 0.4, depth - 1);
                        drawBranch(x2, y2, subLen, angle + 0.4, depth - 1);
                    };
                    
                    // Start from bottom center
                    drawBranch(width/2, height, 120, -Math.PI/2, 9);
                },

                maze: () => {
                    if (shouldClear) {
                        const bg = create('rect', {'width': width, 'height': height, 'fill': '#fff'});
                        svg.appendChild(bg);
                    }
                    const cellSize = 20;
                    const cols = Math.floor(width/cellSize);
                    const rows = Math.floor(height/cellSize);
                    
                    for(let y=0; y<rows; y++) {
                        for(let x=0; x<cols; x++) {
                            const px = x * cellSize;
                            const py = y * cellSize;
                            
                            const line = create('line', {'stroke': '#000', 'stroke-width': 2, 'stroke-linecap': 'round'});
                            
                            if (chance(0.5)) {
                                // Forward slash
                                line.setAttribute('x1', px);
                                line.setAttribute('y1', py + cellSize);
                                line.setAttribute('x2', px + cellSize);
                                line.setAttribute('y2', py);
                            } else {
                                // Backslash
                                line.setAttribute('x1', px);
                                line.setAttribute('y1', py);
                                line.setAttribute('x2', px + cellSize);
                                line.setAttribute('y2', py + cellSize);
                            }
                            // Add color variation
                            if (chance(0.2)) line.setAttribute('stroke', randChoice(palette));
                            
                            svg.appendChild(line);
                        }
                    }
                },

                hexagons: () => {
                    if (shouldClear) {
                        const bg = create('rect', {'width': width, 'height': height, 'fill': '#222'});
                        svg.appendChild(bg);
                    }
                    const r = 30;
                    const h = r * Math.sqrt(3);
                    const cols = Math.ceil(width / (r * 1.5));
                    const rows = Math.ceil(height / h);
                    
                    for(let y=0; y<rows; y++) {
                        for(let x=0; x<cols; x++) {
                            const cx = x * r * 1.5;
                            const cy = y * h + (x % 2 === 0 ? 0 : h/2);
                            
                            if (chance(0.8)) {
                                const poly = create('polygon');
                                let pts = "";
                                for(let i=0; i<6; i++) {
                                    const ang = i * Math.PI / 3;
                                    pts += `${cx + r*Math.cos(ang)},${cy + r*Math.sin(ang)} `;
                                }
                                poly.setAttribute('points', pts);
                                poly.setAttribute('fill', randChoice(palette));
                                poly.setAttribute('stroke', '#111');
                                poly.setAttribute('stroke-width', 2);
                                poly.setAttribute('opacity', randRange(0.5, 0.9));
                                svg.appendChild(poly);
                            }
                        }
                    }
                },

                rain: () => {
                    // Digital Rain
                    if (shouldClear) {
                        const bg = create('rect', {'width': width, 'height': height, 'fill': '#000'});
                        svg.appendChild(bg);
                    }
                    const cols = 40;
                    const colWidth = width / cols;
                    
                    for(let i=0; i<cols; i++) {
                        const drops = randInt(5, 15);
                        const x = i * colWidth + colWidth/2;
                        
                        for(let j=0; j<drops; j++) {
                            const y = randRange(0, height);
                            const len = randRange(10, 50);
                            const text = create('text', {'x': x, 'y': y, 'fill': i%2===0 ? '#0f0' : randChoice(palette), 'font-family': 'monospace', 'font-size': randRange(10, 20), 'opacity': randRange(0.2, 0.9)});
                            // Random char
                            text.textContent = String.fromCharCode(0x30A0 + randInt(0, 96));
                            svg.appendChild(text);
                        }
                    }
                },

                spirals: () => {
                    if (shouldClear) {
                        const bg = create('rect', {'width': width, 'height': height, 'fill': palette[0]});
                        svg.appendChild(bg);
                    }
                    const cx = width/2;
                    const cy = height/2;
                    const count = 300;
                    const a = 5;
                    const b = 2;
                    
                    let pathD = `M ${cx} ${cy}`;
                    
                    for(let i=0; i<count; i++) {
                        const angle = 0.5 * i;
                        const r = a + b * angle;
                        const x = cx + r * Math.cos(angle);
                        const y = cy + r * Math.sin(angle);
                        
                        const circle = create('circle', {'cx': x, 'cy': y, 'r': i/10, 'fill': randChoice(palette)});
                        svg.appendChild(circle);
                    }
                },

                crossstitch: () => {
                     if (shouldClear) {
                        const bg = create('rect', {'width': width, 'height': height, 'fill': '#fff'});
                        svg.appendChild(bg);
                    }
                    const gridSize = 10;
                    const cols = width / gridSize;
                    const rows = height / gridSize;
                    
                    // Pattern generator
                    for(let y=0; y<rows; y++) {
                        for(let x=0; x<cols; x++) {
                            // Simple cellular automata or noise pattern
                            const noise = (Math.sin(x*0.2) * Math.cos(y*0.2));
                            if(noise > 0 || chance(0.3)) {
                                const px = x * gridSize;
                                const py = y * gridSize;
                                const color = randChoice(palette);
                                
                                const g = create('g', {'stroke': color, 'stroke-width': 2});
                                
                                const l1 = create('line', {'x1': px + 2, 'y1': py + 2, 'x2': px + gridSize - 2, 'y2': py + gridSize - 2});
                                
                                const l2 = create('line', {'x1': px + gridSize - 2, 'y1': py + 2, 'x2': px + 2, 'y2': py + gridSize - 2});
                                
                                g.appendChild(l1);
                                g.appendChild(l2);
                                svg.appendChild(g);
                            }
                        }
                    }
                }
            };

            // Run
            generators[style]();
            app.showToast(`生成完毕: ${style}`);
        }
    

if (window.app && app.action) {
    app.action('image-svg-painter.go-drawing', function () {
        window.location.href = 'image-drawing.html';
    });
    app.action('image-svg-painter.set-mode', function (el) {
        setMode(el.dataset.mode, el);
    });
    app.action('image-svg-painter.toggle-all-styles', function (el) {
        toggleAllStyles(el);
    });
}
    
