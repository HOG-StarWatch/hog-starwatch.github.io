
(function() {
    // 防止重复加载
    if (window.CheatMenuLoaded) return;
    window.CheatMenuLoaded = true;

    const style = document.createElement('style');
    style.textContent = `
        :root {
            --glass-bg: rgba(15, 10, 25, 0.75);
            --glass-border: rgba(167, 139, 250, 0.2);
            --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
            --primary-color: #a78bfa;
            --text-color: #e2e8f0;
            --text-dim: #94a3b8;
            --accent-hover: rgba(139, 92, 246, 0.3);
            --accent-active: #7c3aed;
        }

        #cheat-menu-container {
            position: absolute;
            top: 20px;
            right: 20px;
            display: flex;
            align-items: flex-start;
            z-index: 10000;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            user-select: none;
            gap: 15px;
            font-size: 13px;
            pointer-events: none; /* Let clicks pass through container area */
        }

        /* Enable pointer events for children */
        #cheat-menu, #help-panel {
            pointer-events: auto;
        }

        #cheat-menu {
            width: 320px;
            max-width: 90vw;
            background: var(--glass-bg);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            color: var(--text-color);
            padding: 20px;
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            box-shadow: var(--glass-shadow);
            max-height: 85vh;
            overflow-y: auto;
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;
            scrollbar-width: thin;
            scrollbar-color: var(--primary-color) transparent;
        }

        #help-panel {
            width: 240px;
            max-width: 35vw;
            background: var(--glass-bg);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            color: var(--text-dim);
            padding: 20px;
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            box-shadow: var(--glass-shadow);
            font-size: 12px;
            display: none;
            max-height: 85vh;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: var(--primary-color) transparent;
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background-color: rgba(139, 92, 246, 0.3);
            border-radius: 20px;
        }

        h2 {
            margin: 0 0 20px 0;
            text-align: center;
            border-bottom: 1px solid var(--glass-border);
            padding-bottom: 12px;
            font-size: 18px;
            color: #fff;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            text-shadow: 0 0 10px rgba(167, 139, 250, 0.5);
        }

        h3 {
            margin: 20px 0 10px 0;
            font-size: 12px;
            color: var(--primary-color);
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 700;
            display: flex;
            align-items: center;
        }
        h3::after {
            content: '';
            flex: 1;
            height: 1px;
            background: linear-gradient(90deg, var(--glass-border), transparent);
            margin-left: 10px;
        }

        .cheat-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
            padding: 8px 10px;
            border-radius: 8px;
            transition: background 0.2s;
            cursor: pointer;
        }
        .cheat-row:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        /* Modern Toggle Switch - Purple Theme */
        .cheat-toggle {
            cursor: pointer;
            display: flex;
            align-items: center;
            width: 100%;
            justify-content: space-between;
        }
        .cheat-toggle span {
            flex-grow: 1;
        }
        .toggle-switch {
            width: 36px;
            height: 20px;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 10px;
            position: relative;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(255,255,255,0.1);
        }
        .toggle-switch::after {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 14px;
            height: 14px;
            background: #94a3b8;
            border-radius: 50%;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input:checked + .toggle-switch {
            background: rgba(124, 58, 237, 0.5);
            border-color: var(--accent-active);
        }
        input:checked + .toggle-switch::after {
            transform: translateX(16px);
            background: #fff;
            box-shadow: 0 0 8px var(--accent-active);
        }
        input[type="checkbox"] {
            display: none;
        }

        /* Modern Button - Purple Theme */
        .cheat-btn {
            background: rgba(0, 0, 0, 0.3);
            color: var(--text-color);
            border: 1px solid var(--glass-border);
            padding: 10px 14px;
            cursor: pointer;
            width: 100%;
            margin-bottom: 8px;
            text-align: center;
            border-radius: 8px;
            font-weight: 600;
            font-size: 12px;
            transition: all 0.2s;
            font-family: inherit;
            position: relative;
            overflow: hidden;
        }
        .cheat-btn:hover {
            background: var(--accent-hover);
            border-color: var(--primary-color);
            color: #fff;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
        }
        .cheat-btn:active {
            transform: translateY(1px);
            background: var(--accent-active);
        }

        /* Grid */
        .spawn-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 10px;
        }

        /* Radio Group */
        .spawn-radio-group {
            display: flex;
            flex-direction: column;
            gap: 2px;
            max-height: 180px;
            overflow-y: auto;
            background: rgba(0,0,0,0.3);
            padding: 8px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.05);
            margin-bottom: 10px;
        }
        .spawn-radio-label {
            display: flex;
            align-items: center;
            font-size: 12px;
            cursor: pointer;
            padding: 6px 10px;
            border-radius: 6px;
            transition: background 0.2s;
            color: var(--text-dim);
        }
        .spawn-radio-label:hover {
            background: rgba(255,255,255,0.05);
            color: #fff;
        }
        .spawn-radio-label input {
            display: block; 
            margin-right: 10px;
            accent-color: var(--accent-active);
        }

        /* Help Keys */
        .help-row {
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 4px 0;
            border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .help-keys {
            display: flex;
            gap: 4px;
        }
        .help-key {
            background: rgba(0,0,0,0.4);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 4px;
            padding: 2px 8px;
            color: #fff;
            min-width: 20px;
            text-align: center;
            font-size: 11px;
            box-shadow: 0 2px 0 rgba(0,0,0,0.5);
            font-weight: bold;
        }
        .help-desc {
            color: var(--text-dim);
        }
        b {
            color: var(--primary-color);
        }
        
        .footer-hint {
            margin-top: 20px;
            text-align: center;
            color: rgba(255,255,255,0.2);
            font-size: 10px;
            padding-top: 10px;
            border-top: 1px solid rgba(255,255,255,0.05);
        }
    `;
    document.head.appendChild(style);

    // ==========================================
    // UI Structure
    // ==========================================
    const container = document.createElement('div');
    container.id = 'cheat-menu-container';
    container.style.display = 'none';

    // Help Panel
    const helpPanel = document.createElement('div');
    helpPanel.id = 'help-panel';
    helpPanel.innerHTML = `
        <h2>操作指南</h2>
        
        <div class="help-row"><span class="help-desc">移动 / 跳跃</span><div class="help-keys"><span class="help-key">W</span><span class="help-key">A</span><span class="help-key">S</span><span class="help-key">D</span></div></div>
        <div class="help-row"><span class="help-desc">射击</span><div class="help-keys"><span class="help-key">Z</span></div></div>
        <div class="help-row"><span class="help-desc">翻滚 / 闪避</span><div class="help-keys"><span class="help-key">X</span></div></div>
        <div class="help-row"><span class="help-desc">手雷</span><div class="help-keys"><span class="help-key">C</span></div></div>
        <div class="help-row"><span class="help-desc">开关菜单</span><div class="help-keys"><span class="help-key">TAB</span></div></div>
        
        <h3>调试工具</h3>
        <div class="help-row"><span class="help-desc">生成敌人</span><div class="help-keys"><span class="help-key">Q</span></div></div>
        <div class="help-row"><span class="help-desc">生成箱子</span><div class="help-keys"><span class="help-key">T</span></div></div>
        <div class="help-row"><span class="help-desc">爆炸</span><div class="help-keys"><span class="help-key">E</span></div></div>
        <div class="help-row"><span class="help-desc">水桶爆炸</span><div class="help-keys"><span class="help-key">F</span></div></div>
        <div class="help-row"><span class="help-desc">生成选中项</span><div class="help-keys"><span class="help-key">G</span></div></div>
        <div class="help-row"><span class="help-desc">水桶爆炸(无碎片)</span><div class="help-keys"><span class="help-key">Y</span></div></div>
        <div class="help-row"><span class="help-desc">缩放视野</span><div class="help-keys"><span class="help-key">滚轮</span></div></div>

        <h3>💡 游戏技巧</h3>
        <div class="help-desc" style="margin-bottom: 5px;">- 翻滚可以扑灭身上的火！</div>
        <div class="help-desc" style="margin-bottom: 5px;">- 翻滚还可以对敌人造成近战伤害</div>
        <div class="help-desc" style="margin-bottom: 5px;">- 与专家级敌人（白色）保持距离，他们经常翻滚和跳跃！</div>
        <div class="help-desc" style="margin-bottom: 5px;">- 按住跳跃键可以爬墙</div>
        <div class="help-desc" style="margin-bottom: 5px;">- 跳跃翻滚可以跳得更高（跳跃后立即翻滚）</div>
        <div class="help-desc" style="margin-bottom: 5px;">- 要到达非常高的地方，尝试手雷跳！</div>
        <div class="help-desc" style="margin-bottom: 5px;">- 按 R 键可以重新开始游戏</div>

        <h3>👾 敌人类型</h3>
        <div class="help-desc" style="margin-bottom: 5px;">- <b>新兵 (绿色)</b>: 稍矮，犹豫不决，1 击</div>
        <div class="help-desc" style="margin-bottom: 5px;">- <b>士兵 (蓝色)</b>: 平均能力，2 击</div>
        <div class="help-desc" style="margin-bottom: 5px;">- <b>队长 (红色)</b>: 能爬墙，跳跃频繁，3 击</div>
        <div class="help-desc" style="margin-bottom: 5px;">- <b>专家 (白色)</b>: 忍者，经常跳跃翻滚，4 击</div>
        <div class="help-desc" style="margin-bottom: 5px;">- <b>爆破专家 (紫色)</b>: 投掷手雷，防火，5 击</div>
        <div class="help-desc" style="margin-bottom: 5px;">- <b>重型变种</b>: 双倍生命值，全自动射击</div>

        <h3>📦 物体类型</h3>
        <div class="help-desc" style="margin-bottom: 5px;">- <b>塑料箱 (棕色)</b>: 易燃，烧毁后破裂</div>
        <div class="help-desc" style="margin-bottom: 5px;">- <b>金属箱 & 桶 (灰色)</b>: 难摧毁，不可燃</div>
        <div class="help-desc" style="margin-bottom: 5px;">- <b>水桶 (蓝色)</b>: 灭火并推开物体</div>
        <div class="help-desc" style="margin-bottom: 5px;">- <b>炸药箱 & 桶 (绿色)</b>: 燃烧后爆炸</div>
        <div class="help-desc" style="margin-bottom: 5px;">- <b>高爆桶 (红色)</b>: 快速爆炸，威力大</div>
        <div class="help-desc" style="margin-bottom: 5px;">- <b>岩石 (颜色各异)</b>: 极难摧毁，压碎敌人</div>
        <div class="help-desc" style="margin-bottom: 5px;">- <b>熔岩石 (红橙色)</b>: 接触会着火</div>
    `;

    // Cheat Menu
    const menu = document.createElement('div');
    menu.id = 'cheat-menu';
    menu.innerHTML = `
        <h2>StarWatch 作弊菜单</h2>
        
        <h3>玩家增强</h3>
        <div class="cheat-row"><label class="cheat-toggle"><span>上帝模式 (God Mode)</span><input type="checkbox" id="chk-god"><div class="toggle-switch"></div></label></div>
        <div class="cheat-row"><label class="cheat-toggle"><span>飞行模式 (Noclip Fly)</span><input type="checkbox" id="chk-fly"><div class="toggle-switch"></div></label></div>
        <div class="cheat-row"><label class="cheat-toggle"><span>超级跳跃 (Super Jump)</span><input type="checkbox" id="chk-jump"><div class="toggle-switch"></div></label></div>
        <div class="cheat-row"><label class="cheat-toggle"><span>无限连跳 (Infinite Jump)</span><input type="checkbox" id="chk-inf-jump"><div class="toggle-switch"></div></label></div>
        <div class="cheat-row"><label class="cheat-toggle"><span>加速奔跑 (Super Speed)</span><input type="checkbox" id="chk-speed"><div class="toggle-switch"></div></label></div>
        <div class="cheat-row"><label class="cheat-toggle"><span>鼠标缩放 (Mouse Zoom)</span><input type="checkbox" id="chk-zoom"><div class="toggle-switch"></div></label></div>
        <div class="cheat-row"><label class="cheat-toggle"><span>鼠标瞄准 (Mouse Aim)</span><input type="checkbox" id="chk-aim"><div class="toggle-switch"></div></label></div>
        
        <div class="cheat-row" style="flex-direction: column; align-items: flex-start;">
            <span style="margin-bottom: 5px;">角色 (Character)</span>
            <div style="display: flex; gap: 5px; width: 100%;">
                 <button class="cheat-btn" id="btn-char-prev" style="width: 30px;">&lt;</button>
                 <span id="char-name" style="flex-grow: 1; text-align: center; line-height: 28px; background: rgba(0,0,0,0.3); border-radius: 4px; font-size: 11px;">默认 (Default)</span>
                 <button class="cheat-btn" id="btn-char-next" style="width: 30px;">&gt;</button>
            </div>
        </div>

        <div class="cheat-row"><button class="cheat-btn" id="btn-close-world">封闭世界 (Closed World)</button></div>
        <div class="spawn-grid">
            <button class="cheat-btn" id="btn-heal">治疗</button>
            <button class="cheat-btn" id="btn-lives">+99 条命</button>
        </div>

        <h3>战斗辅助</h3>
        <div class="cheat-row"><label class="cheat-toggle"><span>一击必杀 (One Hit Kill)</span><input type="checkbox" id="chk-one-hit"><div class="toggle-switch"></div></label></div>
        <div class="cheat-row"><label class="cheat-toggle"><span>极速射击 (Rapid Fire)</span><input type="checkbox" id="chk-rapid"><div class="toggle-switch"></div></label></div>
        <div class="cheat-row"><label class="cheat-toggle"><span>爆炸子弹 (Explosive Ammo)</span><input type="checkbox" id="chk-explosive"><div class="toggle-switch"></div></label></div>
        <div class="cheat-row"><label class="cheat-toggle"><span>无限手雷 (Infinite Grenades)</span><input type="checkbox" id="chk-inf-grenade"><div class="toggle-switch"></div></label></div>
        <div class="cheat-row"><label class="cheat-toggle"><span>快速投掷 (No Cooldown)</span><input type="checkbox" id="chk-no-cd"><div class="toggle-switch"></div></label></div>
        <div class="cheat-row"><label class="cheat-toggle"><span>斗蛐蛐 (Battle Royale)</span><input type="checkbox" id="chk-battle-royale"><div class="toggle-switch"></div></label></div>

        <h3>生成器 (按 G 键)</h3>
        <div class="spawn-radio-group" id="spawn-selector"></div>
        <div class="spawn-grid">
             <button class="cheat-btn" id="btn-spawn-selected">生成选中项</button>
        </div>

        <h3>世界控制</h3>
        <div class="cheat-row"><label class="cheat-toggle"><span>子弹时间 (Matrix Mode)</span><input type="checkbox" id="chk-matrix"><div class="toggle-switch"></div></label></div>
        <div class="spawn-grid">
            <button class="cheat-btn" id="btn-next-level">下一关</button>
            <button class="cheat-btn" id="btn-destroy-level">天地同寿</button>
        </div>

        <div class="footer-hint">Powered by StarWatch</div>
    `;

    container.appendChild(helpPanel);
    container.appendChild(menu);
    document.body.appendChild(container);

    // ==========================================
    // Spawn Configuration
    // ==========================================
    const spawnOptions = [
        { label: "木箱 (Wood Crate)", type: 'prop', id: 0 },
        { label: "铁箱 (Metal Crate)", type: 'prop', id: 2 },
        { label: "炸药桶 (Explosive Barrel)", type: 'prop', id: 3 },
        { label: "水桶 (Water Barrel)", type: 'prop', id: 4 },
        { label: "核爆桶 (Nuke Barrel)", type: 'prop', id: 6 },
        { label: "岩石 (Rock)", type: 'prop', id: 7 },
        { label: "熔岩石 (Lava Rock)", type: 'prop', id: 8 },
        { label: "敌人: 弱鸡 (Weak)", type: 'enemy', id: 0 },
        { label: "敌人: 普通 (Normal)", type: 'enemy', id: 1 },
        { label: "敌人: 强力 (Strong)", type: 'enemy', id: 2 },
        { label: "敌人: 精英 (Elite)", type: 'enemy', id: 3 },
        { label: "敌人: 手雷兵 (Grenadier)", type: 'enemy', id: 4 },
        { label: "补给: 3手雷+治疗 (Supply)", type: 'supply', id: 0 }
    ];

    const spawnSelector = document.getElementById('spawn-selector');
    let selectedSpawn = spawnOptions[0];

    spawnOptions.forEach((opt, index) => {
        const div = document.createElement('label');
        div.className = 'spawn-radio-label';
        div.innerHTML = `<input type="radio" name="spawn-opt" value="${index}" ${index===0?'checked':''}> ${opt.label}`;
        div.querySelector('input').onchange = () => selectedSpawn = opt;
        spawnSelector.appendChild(div);
    });

    // ==========================================
    // Logic Implementation
    // ==========================================
    
    const state = {
        god: false,
        fly: false,
        superJump: false,
        infiniteJump: false,
        superSpeed: false,
        rapidFire: false,
        explosiveBullets: false,
        infiniteGrenades: false,
        noGrenadeCooldown: false,
        oneHitKill: false,
        matrixMode: false,
        zoomEnabled: false, // Default OFF
        battleRoyale: false, // Default OFF
        mouseAim: false
    };

    const bindToggle = (id, key) => {
        const el = document.getElementById(id);
        if(el) el.onchange = (e) => {
            state[key] = e.target.checked;
            if (key === 'god' && typeof godMode !== 'undefined') godMode = state[key];
        };
    };

    bindToggle('chk-god', 'god');
    bindToggle('chk-fly', 'fly');
    bindToggle('chk-jump', 'superJump');
    bindToggle('chk-inf-jump', 'infiniteJump');
    bindToggle('chk-speed', 'superSpeed');
    bindToggle('chk-one-hit', 'oneHitKill');
    bindToggle('chk-rapid', 'rapidFire');
    bindToggle('chk-explosive', 'explosiveBullets');
    bindToggle('chk-inf-grenade', 'infiniteGrenades');
    bindToggle('chk-no-cd', 'noGrenadeCooldown');
    bindToggle('chk-matrix', 'matrixMode');
    bindToggle('chk-zoom', 'zoomEnabled');
    bindToggle('chk-battle-royale', 'battleRoyale');
    bindToggle('chk-aim', 'mouseAim');

    // Character Switcher
    const charSkins = [
        { name: "默认 (Default)", body: 5, head: 18, color: null }, // Null means use default/calculated
        { name: "特工 (Agent)", body: 5, head: 21, color: new Color(0.2, 0.2, 0.2) },
        { name: "机器人 (Robot)", body: 3, head: 2, color: new Color(0.5, 0.5, 0.5) },
        { name: "外星人 (Alien)", body: 3, head: 0, color: new Color(0, 1, 0) }
    ];
    let currentCharIndex = 0;

    const updateCharSkin = () => {
        const skin = charSkins[currentCharIndex];
        document.getElementById('char-name').textContent = skin.name;
        if (players[0]) {
            players[0].bodyTile = skin.body;
            players[0].headTile = skin.head;
            if (skin.color) players[0].color = skin.color;
            players[0].isFemale = skin.isFemale; // Custom flag
            // Force update tileIndex for immediate feedback
            players[0].tileIndex = players[0].bodyTile + 1;
        }
    };

    document.getElementById('btn-char-prev').onclick = () => {
        currentCharIndex = (currentCharIndex - 1 + charSkins.length) % charSkins.length;
        updateCharSkin();
    };
    document.getElementById('btn-char-next').onclick = () => {
        currentCharIndex = (currentCharIndex + 1) % charSkins.length;
        updateCharSkin();
    };

    // Closed World
    document.getElementById('btn-close-world').onclick = () => {
        // Log to debug why it might fail
        console.log("Closed World triggered");
        
        // Use tileLayer.size if levelSize is not available
        const size = (typeof levelSize !== 'undefined') ? levelSize : (tileLayer ? tileLayer.size : null);
        
        if (!size || typeof tileLayer === 'undefined') {
             console.error("Closed World Failed: levelSize or tileLayer undefined", {size, tileLayer});
             return;
        }
        
        const tileType = 1; // tileType_solid (Truly Indestructible)
        const tileIndex = 12; // Visual: Base/Spawn material (groundTileStart + 4)
        const color = new Color(0.6, 0.6, 0.6); // Grey color matching base
        
        console.log(`Setting boundaries for size: ${size.x}x${size.y}`);

        // Loop through boundaries
        for (let x = 0; x < size.x; x++) {
            setBoundaryTile(x, 0);
            setBoundaryTile(x, size.y - 1);
        }
        for (let y = 0; y < size.y; y++) {
            setBoundaryTile(0, y);
            setBoundaryTile(size.x - 1, y);
        }

        // Force redraw to ensure visibility
        if (tileLayer.redraw) {
            tileLayer.redraw();
            console.log("Redraw called");
        }
        
        function setBoundaryTile(x, y) {
            const pos = vec2(x, y);
            if (typeof setTileCollisionData !== 'undefined') {
                setTileCollisionData(pos, tileType);
            }
            if (typeof tileLayer !== 'undefined' && typeof TileLayerData !== 'undefined') {
                // Use setData with false for redraw, then redraw all at once at the end
                tileLayer.setData(pos, new TileLayerData(tileIndex, 0, 0, color), false);
            }
        }
    };

    document.getElementById('btn-heal').onclick = () => { if (players[0]) players[0].heal(1000); };
    document.getElementById('btn-lives').onclick = () => { if (typeof playerLives !== 'undefined') playerLives += 99; };
    document.getElementById('btn-next-level').onclick = () => { if (typeof nextLevel !== 'undefined') nextLevel(); };
    document.getElementById('btn-destroy-level').onclick = () => { if (typeof explosion !== 'undefined' && players[0]) explosion(players[0].pos, 50); };

    // Spawn Logic
    const performSpawn = (pos) => {
        if (!selectedSpawn) return;
        
        if (selectedSpawn.type === 'enemy') {
            window.spawnEnemy(selectedSpawn.id, pos);
        } else if (selectedSpawn.type === 'prop') {
            window.spawnProp(selectedSpawn.id, pos);
        } else if (selectedSpawn.type === 'supply') {
             // Supply Logic: Add grenades and health, no physical crate
             if (players[0]) {
                 players[0].grenadeCount += 3;
                 players[0].heal(1); // Heal 1 point
                 playSound(sound_checkpoint, pos);
                 
                 // Visual effect (Sparkles instead of crate)
                 let e = new ParticleEmitter(pos);
                 e.emitSize = 0.5;
                 e.particleTime = 0.5;
                 e.colorStartA = new Color(0,1,0,1);
                 e.colorEndA = new Color(0,1,0,0);
             }
        }
    };

    document.getElementById('btn-spawn-selected').onclick = () => {
        if (players[0]) performSpawn(players[0].pos.add(vec2(0, 5)));
    };

    // Keyboard Listener
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Tab') {
            e.preventDefault();
            const isVisible = container.style.display !== 'none';
            container.style.display = isVisible ? 'none' : 'flex';
            helpPanel.style.display = isVisible ? 'none' : 'block';
        }
        
        // Quick Actions
        if (typeof mousePosWorld !== 'undefined') {
            if (e.code === 'KeyG') { performSpawn(mousePosWorld); debugRect && debugRect(mousePosWorld, vec2(1), '#fff', 0.1); }
            if (e.code === 'KeyQ') { new Enemy(mousePosWorld); }
            if (e.code === 'KeyT') { new Prop(mousePosWorld); }
            if (e.code === 'KeyE') { explosion(mousePosWorld); }
            if (e.code === 'KeyF') {  makeWater(mousePosWorld); }
        }
    });

    // ==========================================
    // Hooks & Core Logic
    // ==========================================

    // Free Camera Logic (Engine Update Hook)
    // We can't easily hook appUpdatePost directly, but we can hook engineUpdate or check input in a loop
    // But cameraPos is set in appUpdatePost.
    // So we need to override it AFTER appUpdatePost.
    // engineUpdate calls: gameUpdate -> engineUpdateObjects -> gameUpdatePost -> engineRender
    // We can hook window.engineUpdate if it's exposed.
    
    // Attempt to hook engineUpdate
    if (typeof engineUpdate === 'function') {
        const originalEngineUpdate = engineUpdate;
        window.engineUpdate = function() {
            originalEngineUpdate(); // Runs game logic and sets camera
            
            // Free Camera & Terrain Brush removed
        };
    } else {
        // Fallback: poll using requestAnimationFrame if engineUpdate not exposed
        // (This might be needed if engineUpdate is defined in a closure but usually global functions are window.*)
        console.log("Cheat Menu: engineUpdate not found, features dependent on loop may fail.");
    }

    const waitForClasses = setInterval(() => {
        if (typeof Player === 'undefined' || typeof Weapon === 'undefined' || typeof Bullet === 'undefined' || typeof Enemy === 'undefined') return;
        clearInterval(waitForClasses);
        applyHooks();
    }, 100);

    function applyHooks() {
        console.log("Cheat Menu: Hooks Applied");

        // --- Player Hooks ---
        const originalPlayerUpdate = Player.prototype.update;
        Player.prototype.update = function() {
            if (state.god && typeof godMode !== 'undefined') godMode = 1;

            // Fly Mode Fix: No inertia, stop when no input
            if (state.fly) {
                this.gravityScale = 0;
                this.groundObject = 1;
                this.collideSolidObjects = 0;
                this.collideTiles = 0;
                
                // Explicitly zero out velocity every frame first
                this.velocity = vec2(0, 0);
                
                const speed = 0.5;
                if (this.playerIndex === 0) {
                    let moveX = 0;
                    let moveY = 0;
                    if (keyIsDown(37) || keyIsDown(65)) moveX -= 1;
                    if (keyIsDown(39) || keyIsDown(68)) moveX += 1;
                    if (keyIsDown(38) || keyIsDown(87)) moveY += 1;
                    if (keyIsDown(40) || keyIsDown(83)) moveY -= 1;
                    
                    // Direct position manipulation for "noclip" feel
                    this.pos.x += moveX * speed;
                    this.pos.y += moveY * speed;
                }
            } else {
                this.collideSolidObjects = 1;
                this.collideTiles = 1;
            }

            if (state.infiniteGrenades) this.grenadeCount = 9;
            if (state.noGrenadeCooldown) this.grendeThrowTimer.unset();

            if (state.infiniteJump) {
                 const jumpPressed = (!this.playerIndex && keyIsDown(38)) || gamepadIsDown(0, this.playerIndex);
                 if (jumpPressed && !this.wasHoldingJump) {
                     this.groundTimer.set(.1); 
                     this.jumpTimer.unset();
                     this.velocity.y = 0;
                 }
            }
            
            // Call Original
            originalPlayerUpdate.apply(this, arguments);

            // Super Speed Fix: Directly modify position to bypass max speed clamp
            if (state.superSpeed) {
                // Check for input
                const moveInputX = (keyIsDown(39) || keyIsDown(68)) - (keyIsDown(37) || keyIsDown(65));
                if (moveInputX !== 0) {
                    // Normal max speed is 0.2. We add to position directly.
                    this.pos.x += moveInputX * 0.4; 
                }
            }
            
            if (state.superJump && this.jumpTimer.active() && this.velocity.y > 0) {
                 this.velocity.y = max(this.velocity.y, .5);
            }
        };

        // --- Weapon Hooks ---
        const originalWeaponUpdate = Weapon.prototype.update;
        Weapon.prototype.update = function() {
            if (state.rapidFire && this.triggerIsDown) {
                 this.fireTimeBuffer = max(this.fireTimeBuffer, 0.13);
            }
            
            // Mouse Aim
            if (state.mouseAim && typeof mousePosWorld !== 'undefined' && this.parent && this.parent.isPlayer) {
                 // Calculate angle to mouse
                 const diff = mousePosWorld.subtract(this.parent.pos);
                 
                 // User reported 90 degrees off.
                 // This implies the weapon sprite might be pointing UP or DOWN by default (0 angle), or we need to offset.
                 // Let's assume standard behavior where we need to rotate 90 degrees (PI/2).
                 // Try adding PI/2.
                 // const offset = Math.PI / 2; // Try 90 degrees
                 // Actually, let's stick to strict target angle.
                 // If the weapon points right at angle 0, then diff.angle() is correct.
                 // If it points up at angle 0, then we need -PI/2.
                 // User said "off by 90".
                 // I will try to ADD PI/2.
                 const targetAngle = diff.angle(); // + Math.PI/2?
                 
                 // Update player mirror based on aim
                 if (diff.x < 0) this.parent.mirror = true;
                 else this.parent.mirror = false;
                 
                 this.localAngle = (targetAngle - this.parent.angle) * this.parent.getMirrorSign();
                  
                  // Fix 90 degree offset
                  // User reported weapon is 90 deg off. We apply a correction.
                  // Assuming sprite points UP (PI/2) by default, we subtract PI/2 to align with Right (0).
                  this.localAngle -= Math.PI / 2 * this.parent.getMirrorSign();
             }

            originalWeaponUpdate.apply(this, arguments);
        };

        // --- Bullet Hooks ---
        const originalBulletKill = Bullet.prototype.kill;
        Bullet.prototype.kill = function() {
            if (state.explosiveBullets && this.team === team_player) {
                if (typeof explosion !== 'undefined') explosion(this.pos, 3);
            }
            originalBulletKill.apply(this, arguments);
        };

        // --- Character Hooks ---
        const originalCharacterDamage = Character.prototype.damage;
        Character.prototype.damage = function(damage, damagingObject) {
            if (state.oneHitKill && this.team === team_enemy) {
                damage = 10000;
            }
            return originalCharacterDamage.call(this, damage, damagingObject);
        };
        
        // Custom Female Body Render Hook - REMOVED
        // The user requested to remove this.
        
        // --- Enemy Hooks (Matrix Mode & Battle Royale) ---
        const originalEnemyUpdate = Enemy.prototype.update;
        Enemy.prototype.update = function() {
            if (state.matrixMode && frame % 5 !== 0) return;

            // Battle Royale Logic
            if (state.battleRoyale) {
                // Assign unique team to allow friendly fire
                // We assign a random team each frame to ensure they are not friendly to anyone else
                // But we must check if they were originally enemies
                // We use a property to track if we messed with their team
                if (this.team === team_enemy || this.team >= 100) {
                     this.team = 100 + Math.floor(Math.random() * 1000);
                }
                
                // AI Targeting override
                // Find nearest other enemy
                let nearestDist = Infinity;
                let nearestEnemy = null;
                
                // We can't easily iterate all objects efficiently here every frame for every enemy...
                // But let's try a simple scan of active enemies.
                // engineObjects is global.
                // Optimization: only scan every few frames
                if ((frame + this.renderOrder) % 15 === 0) {
                    for(const o of engineObjects) {
                        if (o instanceof Enemy && o !== this && !o.isDead()) {
                            const d = this.pos.distanceSquared(o.pos);
                            if (d < nearestDist && d < 250) { // Vision range approx
                                nearestDist = d;
                                nearestEnemy = o;
                            }
                        }
                    }
                    
                    if (nearestEnemy) {
                        // Trick the AI into thinking it saw a player at that location
                        this.sawPlayerPos = nearestEnemy.pos.copy();
                        this.sawPlayerTimer.set(2); // Keep interest
                    }
                }
            } else {
                // Reset team if Battle Royale is disabled
                if (this.team >= 100) {
                    this.team = team_enemy;
                }
            }

            originalEnemyUpdate.apply(this, arguments);
        };

        // Battle Royale Fix: Hook render to restore team for level logic
        // Level clear logic checks for team === team_enemy in appRenderPost
        // We restore it here so that when render/post-render happens, the team is correct.
        // It will be randomized again in the next update.
        if (!Enemy.prototype.renderHooked) {
            Enemy.prototype.renderHooked = true;
            // Enemy inherits render from Character usually, but we need to hook it on the instance or prototype
            // Since Enemy doesn't implement render, we hook Character.render? No, that affects Player.
            // We define Enemy.prototype.render calling super (Character.prototype.render)
            
            // CAUTION: If Enemy.prototype.render already exists (it didn't in my read), we should store it.
            // Based on read, it uses Character.render.
            
            Enemy.prototype.render = function() {
                if (state.battleRoyale && this.team >= 100) {
                    this.team = team_enemy;
                }
                // Call Character render
                Character.prototype.render.apply(this, arguments);
            };
        }
        
        const originalBulletUpdate = Bullet.prototype.update;
        Bullet.prototype.update = function() {
             if (state.matrixMode && frame % 5 !== 0) return;
             
             // Mouse Aim Velocity Fix
             // Bullets velocity is set in Weapon.update using rotation of parent angle.
             // But if parent.angle is 0 and we only set localAngle, the bullet velocity is derived from that.
             // Weapon.update: 
             // direction = vec2(getMirrorSign(speed), 0).rotate(rand(spread,-spread));
             // bullet.velocity = direction;
             // But wait, Bullet is EngineObject.
             // engineObject constructor: this.pos = ...
             // It doesn't inherit parent velocity rotation automatically?
             // Weapon is child of Player.
             // Weapon update calls new Bullet.
             // In Weapon.update:
             // const bullet = new Bullet(this.pos, this.parent);
             // const direction = vec2(this.getMirrorSign(speed), 0);
             // bullet.velocity = direction.rotate(rand(spread,-spread));
             
             // The bullet velocity is set relative to world X axis! 
             // It ignores weapon angle!
             // We need to rotate bullet velocity by weapon global angle.
             // Weapon global angle = parent.angle + localAngle*mirror
             
             // But we can't easily hook the constructor or the exact moment of creation inside Weapon.update.
             // We CAN hook Bullet constructor? No, classes are hard to hook constructor if not window global.
             // Bullet IS window global.
             // Let's hook Bullet constructor?
             
             // Or we just fix it in first update?
             // Bullet.lastVelocity = velocity.
             // If we check if bullet was just created?
             // Bullet has spawnTime.
             
             // Better: Hook Weapon.update completely? No, too much code.
             // Hook Bullet constructor is best if possible.
             
            originalBulletUpdate.apply(this, arguments);
        };
        
        // Hook Bullet Class
        // We need to wrap the class.
        // window.Bullet = class extends window.Bullet ...
        // This works if Bullet is global.
        
        if (!Bullet.prototype.hookedConstructor) {
             const OriginalBullet = Bullet;
             window.Bullet = class extends OriginalBullet {
                 constructor(pos, attacker) {
                     super(pos, attacker);
                     // If mouse aim is on and attacker is player
                     if (state.mouseAim && attacker && attacker.isPlayer && attacker.weapon) {
                         // Rotate velocity to match weapon angle
                         // Weapon angle = attacker.angle + weapon.localAngle * attacker.getMirrorSign()
                         // Actually weapon.angle is updated in engineObject.update using parent hierarchy.
                         // But at moment of bullet creation, weapon.angle might be from last frame?
                         // Weapon.update happens before Bullet creation in same frame.
                         // So weapon.angle should be correct global angle?
                         // Wait, Weapon.update calls super.update() first, which updates global pos/angle.
                         // Then it fires.
                         // So attacker.weapon.angle is correct global angle.
                         
                         // The original code sets velocity: vec2(sign*speed, 0)
                         // This is 0 or 180 degrees.
                         // We need to rotate this by weapon.angle
                         
                         // But we can't access the velocity set by Weapon.update yet!
                         // Weapon.update sets velocity AFTER constructor returns.
                         // const bullet = new Bullet(...)
                         // bullet.velocity = ...
                         
                         // So we can't fix it in constructor.
                         
                         // We must fix it in the first update() call or hook Weapon.update better.
                         // In Bullet.update:
                         if (this.getAliveTime() < 0.05) { // First frame(s)
                             // This is risky if bullet speed is modified elsewhere.
                             // But let's try.
                             // We know the intended angle is weapon.angle.
                             // The current velocity is likely axis aligned (plus spread).
                             // We want to rotate the current velocity vector to align with weapon angle.
                             // But we need to keep the spread.
                             
                             // Current angle of velocity: roughly 0 or PI.
                             // We want to rotate it by weapon.angle.
                             // If mirror is -1, base is PI. weapon.angle handles the rest?
                             // Let's just set velocity angle to weapon.angle + spread?
                             // We don't know the random spread used.
                             
                             // Alternative: Hook Weapon.update and replace the velocity setting logic?
                             // We can't replace lines in function.
                             
                             // Let's use the hook in Weapon.update to override bullet velocity immediately after creation?
                             // We can't access the bullet variable inside originalWeaponUpdate.
                             
                             // Okay, we MUST hook Weapon.update and re-implement firing logic?
                             // That duplicates code.
                             
                             // Wait, if we use Mouse Aim, we modify `localAngle`.
                             // `this.localAngle = (targetAngle - this.parent.angle) * this.parent.getMirrorSign();`
                             // EngineObject.update updates `this.angle` based on localAngle.
                             // `this.angle = this.getMirrorSign()*this.localAngle + this.parent.angle;`
                             // So `this.angle` (weapon global angle) points to mouse.
                             
                             // Original Weapon.update:
                             // const direction = vec2(this.getMirrorSign(speed), 0);
                             // bullet.velocity = direction.rotate(rand(spread,-spread));
                             
                             // It uses `vec2(sign, 0)`! It IGNORES `this.angle`.
                             // It assumes weapon is always horizontal!
                             
                             // So we MUST correct the bullet velocity.
                             // Since we can't touch Weapon.update's internal `bullet` variable...
                             // We can listen for new bullets?
                             // Or we can use the `originalBulletUpdate` to detect new bullets.
                         }
                     }
                 }
             };
             window.Bullet.prototype = OriginalBullet.prototype;
             window.Bullet.prototype.hookedConstructor = true;
        }
        
        // Let's use Bullet.update to fix direction on first frame
        Bullet.prototype.update = function() {
             if (state.matrixMode && frame % 5 !== 0) return;
             
             if (state.mouseAim && this.attacker && this.attacker.isPlayer && this.getAliveTime() === 0) {
                 // First frame fix
                 // Rotate velocity to match weapon angle
                 if (this.attacker.weapon) {
                     const weapon = this.attacker.weapon;
                     // Original logic produced velocity around 0 or 180 deg.
                     // We want it around weapon.angle.
                     // Current velocity angle
                     const currentAngle = this.velocity.angle();
                     // Base angle (0 or PI)
                     const baseAngle = this.attacker.mirror ? PI : 0;
                     // Spread is the diff
                     const spread = currentAngle - baseAngle;
                     
                     // New angle = weapon.angle + spread
                     // But we need to be careful with mirror.
                     // Weapon angle is correct global angle.
                     // If mirror, weapon points left.
                     
                     const speed = this.velocity.length();
                     this.velocity = vec2(speed, 0).setAngle(weapon.angle + spread);
                 }
             }
             
             originalBulletUpdate.apply(this, arguments);
        };
    }

    // ==========================================
    // Helper Functions
    // ==========================================
    window.spawnEnemy = function(type, pos) {
        if (!pos && players[0]) pos = players[0].pos.add(vec2(0, 5));
        if (!pos) return;
        const enemy = new Enemy(pos);
        enemy.type = type;
        let health = 1 + type;
        enemy.eyeColor = new Color(1,.5,0);
        if (type == 0) { enemy.color = new Color(0,1,0); enemy.size = vec2(.6,.95).scale(enemy.sizeScale = .9); }
        else if (type == 1) { enemy.color = new Color(0,.4,1); }
        else if (type == 2) { enemy.color = new Color(1,0,0); enemy.eyeColor = new Color(1,1,0); }
        else if (type == 3) { enemy.color = new Color(1,1,1); enemy.eyeColor = new Color(1,0,0); enemy.maxVisionRange = 15; }
        else if (type == 4) { enemy.color = new Color(.7,0,1); enemy.eyeColor = new Color(0,0,0); enemy.grenadeCount = 3; enemy.canBurn = 0; }
        enemy.health = enemy.healthMax = health;
    };

    window.spawnProp = function(type, pos) {
        if (!pos && players[0]) pos = players[0].pos.add(vec2(Math.random()*4-2, 5));
        if (!pos) return;
        new Prop(pos, type);
    };

})();
