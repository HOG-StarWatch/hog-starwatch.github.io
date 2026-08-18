/* Extracted from markdown.html (refactor script). Tool logic. */

        // Register markdown-wasm in loader (custom manual registration if not in loader.js)
        // Or we can just load it dynamically here.
        // Let's assume ResourceLoader handles standard libs, but for wasm we might need direct handling or custom loader entry.
        // Since we didn't add markdown-wasm to loader.js registry, we'll handle it here or update loader.js? 
        // Updating loader.js is better practice but for now direct import/script is fine if we handle fallback.
        // Actually, let's just add it to the script tags dynamically if needed.
        
        let wasmModule = null;

        const ENTITY_DATA = [
            {
                category: "数学符号 (Math)",
                items: [
                    { char: '∀', name: '&forall;', code: '&#8704;', desc: 'for all / 全称量词' },
                    { char: '∂', name: '&part;', code: '&#8706;', desc: 'partial differential / 偏微分' },
                    { char: '∃', name: '&exist;', code: '&#8707;', desc: 'exists / 存在量词' },
                    { char: '∅', name: '&empty;', code: '&#8709;', desc: 'empty set / 空集' },
                    { char: '∇', name: '&nabla;', code: '&#8711;', desc: 'nabla / 倒三角算子' },
                    { char: '∈', name: '&isin;', code: '&#8712;', desc: 'element of / 属于' },
                    { char: '∉', name: '&notin;', code: '&#8713;', desc: 'not an element of / 不属于' },
                    { char: '∋', name: '&ni;', code: '&#8715;', desc: 'contains as member / 包含' },
                    { char: '∏', name: '&prod;', code: '&#8719;', desc: 'n-ary product / 乘积' },
                    { char: '∑', name: '&sum;', code: '&#8721;', desc: 'n-ary summation / 求和' },
                    { char: '−', name: '&minus;', code: '&#8722;', desc: 'minus sign / 减号' },
                    { char: '∗', name: '&lowast;', code: '&#8727;', desc: 'asterisk operator / 星号运算符' },
                    { char: '√', name: '&radic;', code: '&#8730;', desc: 'square root / 平方根' },
                    { char: '∝', name: '&prop;', code: '&#8733;', desc: 'proportional to / 正比于' },
                    { char: '∞', name: '&infin;', code: '&#8734;', desc: 'infinity / 无穷大' },
                    { char: '∠', name: '&ang;', code: '&#8736;', desc: 'angle / 角' },
                    { char: '∧', name: '&and;', code: '&#8743;', desc: 'logical and / 逻辑与' },
                    { char: '∨', name: '&or;', code: '&#8744;', desc: 'logical or / 逻辑或' },
                    { char: '∩', name: '&cap;', code: '&#8745;', desc: 'intersection / 交集' },
                    { char: '∪', name: '&cup;', code: '&#8746;', desc: 'union / 并集' },
                    { char: '∫', name: '&int;', code: '&#8747;', desc: 'integral / 积分' },
                    { char: '∴', name: '&there4;', code: '&#8756;', desc: 'therefore / 所以' },
                    { char: '∼', name: '&sim;', code: '&#8764;', desc: 'similar to / 相似' },
                    { char: '≅', name: '&cong;', code: '&#8773;', desc: 'congruent to / 全等' },
                    { char: '≈', name: '&asymp;', code: '&#8776;', desc: 'almost equal to / 约等于' },
                    { char: '≠', name: '&ne;', code: '&#8800;', desc: 'not equal to / 不等于' },
                    { char: '≡', name: '&equiv;', code: '&#8801;', desc: 'identical to / 恒等于' },
                    { char: '≤', name: '&le;', code: '&#8804;', desc: 'less-than or equal to / 小于等于' },
                    { char: '≥', name: '&ge;', code: '&#8805;', desc: 'greater-than or equal to / 大于等于' },
                    { char: '⊂', name: '&sub;', code: '&#8834;', desc: 'subset of / 真子集' },
                    { char: '⊃', name: '&sup;', code: '&#8835;', desc: 'superset of / 真超集' },
                    { char: '⊄', name: '&nsub;', code: '&#8836;', desc: 'not a subset of / 非子集' },
                    { char: '⊆', name: '&sube;', code: '&#8838;', desc: 'subset of or equal to / 子集' },
                    { char: '⊇', name: '&supe;', code: '&#8839;', desc: 'superset of or equal to / 超集' },
                    { char: '⊕', name: '&oplus;', code: '&#8853;', desc: 'circled plus / 直和' },
                    { char: '⊗', name: '&otimes;', code: '&#8855;', desc: 'circled times / 张量积' },
                    { char: '⊥', name: '&perp;', code: '&#8869;', desc: 'up tack / 垂直' },
                    { char: '⋅', name: '&sdot;', code: '&#8901;', desc: 'dot operator / 点乘' }
                ]
            },
            {
                category: "希腊字母 (Greek)",
                items: [
                    { char: 'Α', name: '&Alpha;', code: '&#913;', desc: 'Capital Alpha' },
                    { char: 'Β', name: '&Beta;', code: '&#914;', desc: 'Capital Beta' },
                    { char: 'Γ', name: '&Gamma;', code: '&#915;', desc: 'Capital Gamma' },
                    { char: 'Δ', name: '&Delta;', code: '&#916;', desc: 'Capital Delta' },
                    { char: 'Ε', name: '&Epsilon;', code: '&#917;', desc: 'Capital Epsilon' },
                    { char: 'Ζ', name: '&Zeta;', code: '&#918;', desc: 'Capital Zeta' },
                    { char: 'Η', name: '&Eta;', code: '&#919;', desc: 'Capital Eta' },
                    { char: 'Θ', name: '&Theta;', code: '&#920;', desc: 'Capital Theta' },
                    { char: 'Ι', name: '&Iota;', code: '&#921;', desc: 'Capital Iota' },
                    { char: 'Κ', name: '&Kappa;', code: '&#922;', desc: 'Capital Kappa' },
                    { char: 'Λ', name: '&Lambda;', code: '&#923;', desc: 'Capital Lambda' },
                    { char: 'Μ', name: '&Mu;', code: '&#924;', desc: 'Capital Mu' },
                    { char: 'Ν', name: '&Nu;', code: '&#925;', desc: 'Capital Nu' },
                    { char: 'Ξ', name: '&Xi;', code: '&#926;', desc: 'Capital Xi' },
                    { char: 'Ο', name: '&Omicron;', code: '&#927;', desc: 'Capital Omicron' },
                    { char: 'Π', name: '&Pi;', code: '&#928;', desc: 'Capital Pi' },
                    { char: 'Ρ', name: '&Rho;', code: '&#929;', desc: 'Capital Rho' },
                    { char: 'Σ', name: '&Sigma;', code: '&#931;', desc: 'Capital Sigma' },
                    { char: 'Τ', name: '&Tau;', code: '&#932;', desc: 'Capital Tau' },
                    { char: 'Υ', name: '&Upsilon;', code: '&#933;', desc: 'Capital Upsilon' },
                    { char: 'Φ', name: '&Phi;', code: '&#934;', desc: 'Capital Phi' },
                    { char: 'Χ', name: '&Chi;', code: '&#935;', desc: 'Capital Chi' },
                    { char: 'Ψ', name: '&Psi;', code: '&#936;', desc: 'Capital Psi' },
                    { char: 'Ω', name: '&Omega;', code: '&#937;', desc: 'Capital Omega' },
                    { char: 'α', name: '&alpha;', code: '&#945;', desc: 'Small alpha' },
                    { char: 'β', name: '&beta;', code: '&#946;', desc: 'Small beta' },
                    { char: 'γ', name: '&gamma;', code: '&#947;', desc: 'Small gamma' },
                    { char: 'δ', name: '&delta;', code: '&#948;', desc: 'Small delta' },
                    { char: 'ε', name: '&epsilon;', code: '&#949;', desc: 'Small epsilon' },
                    { char: 'ζ', name: '&zeta;', code: '&#950;', desc: 'Small zeta' },
                    { char: 'η', name: '&eta;', code: '&#951;', desc: 'Small eta' },
                    { char: 'θ', name: '&theta;', code: '&#952;', desc: 'Small theta' },
                    { char: 'ι', name: '&iota;', code: '&#953;', desc: 'Small iota' },
                    { char: 'κ', name: '&kappa;', code: '&#954;', desc: 'Small kappa' },
                    { char: 'λ', name: '&lambda;', code: '&#955;', desc: 'Small lambda' },
                    { char: 'μ', name: '&mu;', code: '&#956;', desc: 'Small mu' },
                    { char: 'ν', name: '&nu;', code: '&#957;', desc: 'Small nu' },
                    { char: 'ξ', name: '&xi;', code: '&#958;', desc: 'Small xi' },
                    { char: 'ο', name: '&omicron;', code: '&#959;', desc: 'Small omicron' },
                    { char: 'π', name: '&pi;', code: '&#960;', desc: 'Small pi' },
                    { char: 'ρ', name: '&rho;', code: '&#961;', desc: 'Small rho' },
                    { char: 'ς', name: '&sigmaf;', code: '&#962;', desc: 'Small final sigma' },
                    { char: 'σ', name: '&sigma;', code: '&#963;', desc: 'Small sigma' },
                    { char: 'τ', name: '&tau;', code: '&#964;', desc: 'Small tau' },
                    { char: 'υ', name: '&upsilon;', code: '&#965;', desc: 'Small upsilon' },
                    { char: 'φ', name: '&phi;', code: '&#966;', desc: 'Small phi' },
                    { char: 'χ', name: '&chi;', code: '&#967;', desc: 'Small chi' },
                    { char: 'ψ', name: '&psi;', code: '&#968;', desc: 'Small psi' },
                    { char: 'ω', name: '&omega;', code: '&#969;', desc: 'Small omega' },
                    { char: 'ϑ', name: '&thetasym;', code: '&#977;', desc: 'Theta symbol' },
                    { char: 'ϒ', name: '&upsih;', code: '&#978;', desc: 'Upsilon symbol' },
                    { char: 'ϖ', name: '&piv;', code: '&#982;', desc: 'Pi symbol' }
                ]
            },
            {
                category: "其他实体 (Other)",
                items: [
                    { char: 'Œ', name: '&OElig;', code: '&#338;', desc: 'Capital ligature OE' },
                    { char: 'œ', name: '&oelig;', code: '&#339;', desc: 'Small ligature oe' },
                    { char: 'Š', name: '&Scaron;', code: '&#352;', desc: 'Capital S with caron' },
                    { char: 'š', name: '&scaron;', code: '&#353;', desc: 'Small s with caron' },
                    { char: 'Ÿ', name: '&Yuml;', code: '&#376;', desc: 'Capital Y with diaeresis' },
                    { char: 'ƒ', name: '&fnof;', code: '&#402;', desc: 'Latin small f with hook' },
                    { char: 'ˆ', name: '&circ;', code: '&#710;', desc: 'Modifier letter circumflex' },
                    { char: '˜', name: '&tilde;', code: '&#732;', desc: 'Small tilde' },
                    { char: ' ', name: '&ensp;', code: '&#8194;', desc: 'En space / 半角空格' },
                    { char: ' ', name: '&emsp;', code: '&#8195;', desc: 'Em space / 全角空格' },
                    { char: ' ', name: '&thinsp;', code: '&#8201;', desc: 'Thin space / 窄空格' },
                    { char: '‌', name: '&zwnj;', code: '&#8204;', desc: 'Zero width non-joiner / 零宽不连字' },
                    { char: '‍', name: '&zwj;', code: '&#8205;', desc: 'Zero width joiner / 零宽连字' },
                    { char: '‎', name: '&lrm;', code: '&#8206;', desc: 'Left-to-right mark / 左至右标记' },
                    { char: '‏', name: '&rlm;', code: '&#8207;', desc: 'Right-to-left mark / 右至左标记' },
                    { char: '–', name: '&ndash;', code: '&#8211;', desc: 'En dash / 短破折号' },
                    { char: '—', name: '&mdash;', code: '&#8212;', desc: 'Em dash / 长破折号' },
                    { char: "'", name: '&lsquo;', code: '&#8216;', desc: 'Left single quote' },
                    { char: "'", name: '&rsquo;', code: '&#8217;', desc: 'Right single quote' },
                    { char: '‚', name: '&sbquo;', code: '&#8218;', desc: 'Single low-9 quote' },
                    { char: '"', name: '&ldquo;', code: '&#8220;', desc: 'Left double quote' },
                    { char: '"', name: '&rdquo;', code: '&#8221;', desc: 'Right double quote' },
                    { char: '„', name: '&bdquo;', code: '&#8222;', desc: 'Double low-9 quote' },
                    { char: '†', name: '&dagger;', code: '&#8224;', desc: 'Dagger / 剑号' },
                    { char: '‡', name: '&Dagger;', code: '&#8225;', desc: 'Double dagger / 双剑号' },
                    { char: '•', name: '&bull;', code: '&#8226;', desc: 'Bullet / 项目符号' },
                    { char: '…', name: '&hellip;', code: '&#8230;', desc: 'Horizontal ellipsis / 省略号' },
                    { char: '‰', name: '&permil;', code: '&#8240;', desc: 'Per mille sign / 千分号' },
                    { char: '′', name: '&prime;', code: '&#8242;', desc: 'Prime / 角分符号' },
                    { char: '″', name: '&Prime;', code: '&#8243;', desc: 'Double prime / 角秒符号' },
                    { char: '‹', name: '&lsaquo;', code: '&#8249;', desc: 'Single left-pointing angle quote' },
                    { char: '›', name: '&rsaquo;', code: '&#8250;', desc: 'Single right-pointing angle quote' },
                    { char: '‾', name: '&oline;', code: '&#8254;', desc: 'Overline / 上划线' },
                    { char: '€', name: '&euro;', code: '&#8364;', desc: 'Euro sign / 欧元符号' },
                    { char: '™', name: '&trade;', code: '&#8482;', desc: 'Trade mark / 商标符号' },
                    { char: '←', name: '&larr;', code: '&#8592;', desc: 'Leftwards arrow' },
                    { char: '↑', name: '&uarr;', code: '&#8593;', desc: 'Upwards arrow' },
                    { char: '→', name: '&rarr;', code: '&#8594;', desc: 'Rightwards arrow' },
                    { char: '↓', name: '&darr;', code: '&#8595;', desc: 'Downwards arrow' },
                    { char: '↔', name: '&harr;', code: '&#8596;', desc: 'Left right arrow' },
                    { char: '↵', name: '&crarr;', code: '&#8629;', desc: 'Carriage return arrow' },
                    { char: '⌈', name: '&lceil;', code: '&#8968;', desc: 'Left ceiling' },
                    { char: '⌉', name: '&rceil;', code: '&#8969;', desc: 'Right ceiling' },
                    { char: '⌊', name: '&lfloor;', code: '&#8970;', desc: 'Left floor' },
                    { char: '⌋', name: '&rfloor;', code: '&#8971;', desc: 'Right floor' },
                    { char: '◊', name: '&loz;', code: '&#9674;', desc: 'Lozenge / 菱形' },
                    { char: '♠', name: '&spades;', code: '&#9824;', desc: 'Black spade suit / 黑桃' },
                    { char: '♣', name: '&clubs;', code: '&#9827;', desc: 'Black club suit / 梅花' },
                    { char: '♥', name: '&hearts;', code: '&#9829;', desc: 'Black heart suit / 红桃' },
                    { char: '♦', name: '&diams;', code: '&#9830;', desc: 'Black diamond suit / 方块' }
                ]
            }
        ];

        const mdTool = {
            wasmLoaded: false,
            
            onEngineChange: function() {
                const engine = document.getElementById('md-engine').value;
                if(engine === 'wasm') {
                    this.loadWasm();
                }
            },

            loadWasm: function() {
                if(this.wasmLoaded) return;
                
                app.showToast('正在加载 WebAssembly 模块...', 'info');
                
                // Try ESM first
                ResourceLoader.import('markdown-wasm-esm').then(module => {
                    // ESM usually exports { parse, ready }
                    // Or default export.
                    // markdown-wasm esm export: export { parse, ready, ... }
                    if(module.ready) {
                        module.ready.then(() => {
                            window.markdown = module; // shim for existing code
                            this.onWasmReady();
                        });
                    } else {
                        // Maybe default export?
                        // If direct esm fail, try UMD fallback in catch
                        throw new Error("Invalid ESM module structure");
                    }
                }).catch(e => {
                    console.warn("Markdown ESM load failed, trying UMD...", e);
                    // Fallback to UMD
                    ResourceLoader.loadDeps('markdown-wasm').then(() => {
                        window.markdown.ready.then(() => {
                            this.onWasmReady();
                        }).catch(err => {
                            console.error(err);
                            this.fallbackToJs('Wasm 初始化失败');
                        });
                    }).catch(() => {
                        this.fallbackToJs('Wasm 下载失败');
                    });
                });
            },
            
            onWasmReady: function() {
                this.wasmLoaded = true;
                document.getElementById('engine-status').style.display = 'block';
                document.getElementById('engine-status').innerText = 'Wasm Ready';
                document.getElementById('engine-status').style.color = 'var(--primary)';
                app.showToast('Wasm 引擎加载成功');
            },

            fallbackToJs: function(reason) {
                app.showToast(reason + '，已自动降级回 JavaScript 引擎', 'error');
                document.getElementById('md-engine').value = 'js';
                this.wasmLoaded = false;
                document.getElementById('engine-status').style.display = 'none';
            },

            showEntityModal: function() {
                const modal = document.getElementById('entity-modal');
                const body = document.getElementById('entity-list-body');
                
                // Only populate if empty
                if (!body.hasChildNodes() || body.innerHTML.trim() === '<!-- Content will be injected by JS -->') {
                    let html = '';
                    ENTITY_DATA.forEach(section => {
                        const safeCategory = (window.app && app.escapeHtml) ? app.escapeHtml(section.category) : section.category;
                        html += `<div class="entity-section">
                            <div class="entity-section-title">${safeCategory}</div>
                            <div class="entity-grid">`;
                        section.items.forEach(item => {
                            // Convert HTML entities in name to string to prevent rendering them
                            const safeName = item.name.replace(/&/g, '&amp;');
                            const safeCode = item.code.replace(/&/g, '&amp;');
                            const safeDesc = (window.app && app.escapeHtml) ? app.escapeHtml(item.desc) : item.desc;
                            
                            html += `<div class="entity-item">
                                <span class="entity-char">${item.char}</span>
                                <div class="entity-info">
                                    <div class="entity-codes">
                                        <span>${safeName}</span>
                                        <span>${safeCode}</span>
                                    </div>
                                    <div class="entity-desc" title="${safeDesc}">${safeDesc}</div>
                                </div>
                            </div>`;
                        });
                        html += `</div></div>`;
                    });
                    body.innerHTML = html;
                }
                
                modal.style.display = 'flex';
            },

            closeEntityModal: function() {
                document.getElementById('entity-modal').style.display = 'none';
            },

            loadFile: function(input) {
                const file = input.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('md-input').value = e.target.result;
                    app.showToast('文件加载成功');
                };
                reader.readAsText(file);
            },

            escapeHtml: function(unsafe) {
                return unsafe
                     .replace(/&/g, "&amp;")
                     .replace(/</g, "&lt;")
                     .replace(/>/g, "&gt;")
                     .replace(/"/g, "&quot;")
                     .replace(/'/g, "&#039;");
            },

            toHtml: function() {
                let mdContent = document.getElementById('md-input').value;
                const engine = document.getElementById('md-engine').value;

                if (engine === 'wasm' && this.wasmLoaded) {
                    try {
                        const html = window.markdown.parse(mdContent);
                        document.getElementById('md-output').value = html;
                        app.showToast('转换完成 (Wasm)');
                        return;
                    } catch(e) {
                        console.error(e);
                        app.showToast('Wasm 转换出错，尝试 JS 降级...', 'error');
                        // Fallback continue below
                    }
                }

                // JS Fallback / Default
                const shouldEscape = document.getElementById('md-escape').checked;
                
                let html = mdContent;
                
                // 如果开启转义，先对全文进行转义
                if (shouldEscape) {
                    html = mdTool.escapeHtml(html);
                }

                html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
                html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
                html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
                // 兼容转义后的 > (&gt;)
                html = html.replace(/^(?:>|&gt;) (.*$)/gim, '<blockquote>$1</blockquote>');
                html = html.replace(/\*\*(.*)\*\*/gim, '<b>$1</b>');
                html = html.replace(/\*(.*)\*/gim, '<i>$1</i>');
                html = html.replace(/~~(.*?)~~/gim, '<del>$1</del>');
                html = html.replace(/```([\s\S]*?)```/gim, (match, code) => {
                    return '<pre><code>' + code + '</code></pre>';
                });
                html = html.replace(/`([^`]+)`/gim, (match, code) => {
                    return '<code>' + code + '</code>';
                });
                html = html.replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2'>");
                html = html.replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>");
                html = html.replace(/- \[(x|X)\] (.*)/gim, '<div style="display:flex;align-items:center;gap:6px;"><input type="checkbox" checked disabled> <span>$2</span></div>');
                html = html.replace(/- \[ \] (.*)/gim, '<div style="display:flex;align-items:center;gap:6px;"><input type="checkbox" disabled> <span>$1</span></div>');
                html = html.replace(/^---$/gim, '<hr>');
                html = html.replace(/\n\n/g, '<br><br>');

                document.getElementById('md-output').value = html;
            },

            importWord: function(input) {
                const file = input.files[0];
                if (!file) return;
                
                app.showToast('正在加载组件...', 'info');
                ResourceLoader.loadDeps('mammoth').then(() => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const arrayBuffer = e.target.result;
                        mammoth.convertToHtml({arrayBuffer: arrayBuffer})
                            .then(function(result) {
                                const html = result.value; 
                                const md = mdTool.convertHtmlStrToMd(html);
                                document.getElementById('md-input').value = md;
                                app.showToast('Word 导入成功');
                            })
                            .catch(function(error) {
                                console.error(error);
                                app.showToast('Word 转换失败: ' + error.message);
                            });
                    };
                    reader.readAsArrayBuffer(file);
                });
            },

            convertHtmlStrToMd: function(html) {
                return html
                    .replace(/<h1[^>]*>(.*?)<\/h1>/gim, '# $1\n')
                    .replace(/<h2[^>]*>(.*?)<\/h2>/gim, '## $1\n')
                    .replace(/<h3[^>]*>(.*?)<\/h3>/gim, '### $1\n')
                    .replace(/<b[^>]*>(.*?)<\/b>/gim, '**$1**')
                    .replace(/<strong[^>]*>(.*?)<\/strong>/gim, '**$1**')
                    .replace(/<i[^>]*>(.*?)<\/i>/gim, '*$1*')
                    .replace(/<em[^>]*>(.*?)<\/em>/gim, '*$1*')
                    .replace(/<del[^>]*>(.*?)<\/del>/gim, '~~$1~~')
                    .replace(/<s[^>]*>(.*?)<\/s>/gim, '~~$1~~')
                    .replace(/<strike[^>]*>(.*?)<\/strike>/gim, '~~$1~~')
                    .replace(/<img[^>]*src=['"](.*?)['"][^>]*alt=['"](.*?)['"][^>]*>/gim, '![$2]($1)')
                    .replace(/<img[^>]*alt=['"](.*?)['"][^>]*src=['"](.*?)['"][^>]*>/gim, '![$1]($2)')
                    .replace(/<a[^>]*href=['"](.*?)['"][^>]*>(.*?)<\/a>/gim, '[$2]($1)')
                    .replace(/<input[^>]*type=['"]checkbox['"][^>]*checked[^>]*>\s*<span>(.*?)<\/span>/gim, '- [x] $1')
                    .replace(/<input[^>]*type=['"]checkbox['"][^>]*>\s*<span>(.*?)<\/span>/gim, '- [ ] $1')
                    .replace(/<p[^>]*>(.*?)<\/p>/gim, '$1\n\n')
                    .replace(/<br\s*\/?>/gim, '\n')
                    .replace(/<ul>([\s\S]*?)<\/ul>/gim, function(match, content) {
                         return content.replace(/<li[^>]*>(.*?)<\/li>/gim, '- $1\n');
                    })
                    .replace(/<ol>([\s\S]*?)<\/ol>/gim, function(match, content) {
                         let index = 1;
                         return content.replace(/<li[^>]*>(.*?)<\/li>/gim, function(m, c) {
                             return (index++) + '. ' + c + '\n';
                         });
                    })
                    // 还原所有 HTML 实体
                    .replace(/&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});/ig, function(match) {
                        const txt = document.createElement("textarea");
                        txt.innerHTML = match;
                        return txt.value;
                    });
            },

            toMd: function() {
                let html = document.getElementById('md-input').value;
                document.getElementById('md-output').value = this.convertHtmlStrToMd(html);
            },
            
            // New Methods
            switchView: function(mode) {
                const preview = document.getElementById('md-preview');
                const output = document.getElementById('md-output');
                const btnPreview = document.getElementById('view-preview-btn');
                const btnCode = document.getElementById('view-code-btn');

                if (mode === 'preview') {
                    preview.style.display = 'block';
                    output.style.display = 'none';
                    btnPreview.classList.replace('btn-secondary', 'btn-primary');
                    btnCode.classList.replace('btn-primary', 'btn-secondary');
                    // Sync content
                    const safeHtml = (window.app && app.sanitizeHtml) ? app.sanitizeHtml(output.value) : output.value;
                    preview.innerHTML = safeHtml;
                } else {
                    preview.style.display = 'none';
                    output.style.display = 'block';
                    btnPreview.classList.replace('btn-primary', 'btn-secondary');
                    btnCode.classList.replace('btn-secondary', 'btn-primary');
                }
            },

            renderPreview: function() {
                this.toHtml(); // This populates md-output
                this.switchView('preview');
            },

            htmlToMdInput: function() {
                const html = document.getElementById('md-input').value;
                const md = this.convertHtmlStrToMd(html);
                document.getElementById('md-input').value = md;
                this.renderPreview();
                app.showToast('HTML 已转换为 MD 并渲染预览');
            },
            
            preview: function() {
                // Legacy external preview
                const rawHtml = document.getElementById('md-output').value;
                const html = (window.app && app.sanitizeHtml) ? app.sanitizeHtml(rawHtml) : rawHtml;
                const win = window.open("", "Preview", "width=800,height=600");
                win.document.write('<' + 'html><' + 'head><' + 'title>Preview</' + 'title>');
                win.document.write('<' + 'style>body{font-family:sans-serif;padding:2rem;line-height:1.6;color:#333}</' + 'style>');
                win.document.write('</' + 'head><' + 'body>');
                win.document.write(html);
                win.document.write('</' + 'body></' + 'html>');
                win.document.close();
            }
        };
    

        // data-action registrations (replaces inline onclick=/onchange=)
        if (window.app && app.action) {
            app.action('md.load-file', function (el) { mdTool.loadFile(el); });
            app.action('md.import-word', function (el) { mdTool.importWord(el); });
            app.action('md.render-preview', function () { mdTool.renderPreview(); });
            app.action('md.html-to-md', function () { mdTool.htmlToMdInput(); });
            app.action('md.to-html', function () { mdTool.toHtml(); });
            app.action('md.engine-change', function () { mdTool.onEngineChange(); });
            app.action('md.show-entity-modal', function () { mdTool.showEntityModal(); });
            app.action('md.switch-view', function (el) { mdTool.switchView(el.dataset.mode); });
            app.action('md.close-entity-modal', function (el, evt) {
                if (evt.target === el) mdTool.closeEntityModal();
            });
        }
    
