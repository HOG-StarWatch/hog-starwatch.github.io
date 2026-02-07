
(function() {
    // 防止重复加载
    if (window.CheatMenuLoaded) return;
    window.CheatMenuLoaded = true;

    const buildCheatMenuStyle = () => {
        if (document.getElementById('cheat-menu-style')) return;
        const style = document.createElement('style');
        style.id = 'cheat-menu-style';
        style.textContent = `
        :root {
            --panel-bg: rgba(15, 10, 25, 0.75);
            --panel-border: rgba(167, 139, 250, 0.2);
            --panel-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
            --panel-blur: 16px;
            --panel-saturate: 120%;
            --primary-color: #a78bfa;
            --text-color: #e2e8f0;
            --text-dim: #94a3b8;
            --accent-hover: rgba(139, 92, 246, 0.3);
            --accent-active: #7c3aed;
        }

        #cheat-menu-container[data-material="frosted"] {
            --panel-bg: rgba(235, 244, 255, 0.18);
            --panel-border: rgba(255, 255, 255, 0.35);
            --panel-shadow: 0 10px 40px 0 rgba(15, 23, 42, 0.4);
            --panel-blur: 22px;
            --panel-saturate: 140%;
            --text-color: #eef2ff;
            --text-dim: #cbd5f5;
        }

        #cheat-menu-container[data-material="liquid"] {
            --panel-bg: linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(168, 85, 247, 0.12));
            --panel-border: rgba(255, 255, 255, 0.18);
            --panel-shadow: 0 12px 36px 0 rgba(30, 41, 59, 0.45);
            --panel-blur: 14px;
            --panel-saturate: 140%;
            --text-color: #f8fafc;
            --text-dim: #e2e8f0;
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
            width: 420px;
            max-width: 90vw;
            background: var(--panel-bg);
            backdrop-filter: blur(var(--panel-blur)) saturate(var(--panel-saturate));
            -webkit-backdrop-filter: blur(var(--panel-blur)) saturate(var(--panel-saturate));
            color: var(--text-color);
            padding: 20px;
            border: 1px solid var(--panel-border);
            border-radius: 16px;
            box-shadow: var(--panel-shadow);
            max-height: 85vh;
            overflow-y: auto;
            overflow-x: hidden;
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;
            scrollbar-width: thin;
            scrollbar-color: var(--primary-color) transparent;
            will-change: transform;
            contain: layout paint;
            transform: translateZ(0);
        }

        #help-panel {
            width: 240px;
            max-width: 35vw;
            background: var(--panel-bg);
            backdrop-filter: blur(var(--panel-blur)) saturate(var(--panel-saturate));
            -webkit-backdrop-filter: blur(var(--panel-blur)) saturate(var(--panel-saturate));
            color: var(--text-dim);
            padding: 20px;
            border: 1px solid var(--panel-border);
            border-radius: 16px;
            box-shadow: var(--panel-shadow);
            font-size: 12px;
            display: none;
            max-height: 85vh;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: var(--primary-color) transparent;
            contain: layout paint;
        }

        #shortcut-feedback {
            position: absolute;
            top: 16px;
            left: 16px;
            z-index: 10001;
            background: rgba(15, 10, 25, 0.75);
            color: #fff;
            padding: 8px 12px;
            border: 1px solid rgba(167, 139, 250, 0.35);
            border-radius: 10px;
            font-size: 13px;
            letter-spacing: .3px;
            pointer-events: none;
            opacity: 0;
            transform: translateY(-6px);
            transition: opacity .15s ease, transform .15s ease;
            white-space: nowrap;
        }
        #shortcut-feedback.is-visible {
            opacity: 1;
            transform: translateY(0);
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
            margin: 0;
            text-align: left;
            font-size: 18px;
            color: #fff;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            text-shadow: 0 0 10px rgba(167, 139, 250, 0.5);
        }

        .menu-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin: 0 0 20px 0;
            border-bottom: 1px solid var(--panel-border);
            padding-bottom: 12px;
        }

        .menu-title-select {
            min-width: 110px;
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(255,255,255,0.1);
            color: var(--text-color);
            padding: 6px 10px;
            border-radius: 8px;
            font-size: 12px;
            outline: none;
            cursor: pointer;
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
            background: linear-gradient(90deg, var(--panel-border), transparent);
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
            max-height: none;
            overflow-y: visible;
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

        .menu-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
        }
        .menu-section {
            background: rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 12px;
        }
        .menu-section h3 {
            margin: 0 0 10px 0;
        }
        .cheat-field {
            gap: 8px;
        }
        .cheat-select, .cheat-input {
            background: rgba(0,0,0,0.4);
            color: var(--text-color);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 6px;
            padding: 6px 8px;
            font-family: inherit;
            font-size: 12px;
        }
        .cheat-select {
            min-width: 120px;
        }
        .cheat-slider {
            width: 140px;
        }
        .cheat-inline {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .cheat-btn.cheat-btn-mini {
            padding: 6px 10px;
            width: auto;
            margin-bottom: 0;
            font-size: 11px;
        }
        .layer-toggle {
            position: relative;
            display: grid;
            grid-template-columns: 1fr 1fr;
            align-items: center;
            width: 160px;
            height: 30px;
            background: rgba(0,0,0,0.35);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 999px;
            overflow: hidden;
        }
        .layer-option {
            position: relative;
            z-index: 1;
            border: none;
            background: transparent;
            color: var(--text-dim);
            font-size: 12px;
            cursor: pointer;
            height: 100%;
            transition: color 0.2s ease;
            font-family: inherit;
        }
        .layer-option.is-active {
            color: #fff;
        }
        .layer-indicator {
            position: absolute;
            top: 2px;
            left: 2px;
            width: calc(50% - 4px);
            height: calc(100% - 4px);
            background: rgba(124, 58, 237, 0.55);
            border-radius: 999px;
            transition: transform 0.25s ease;
        }
        .layer-toggle[data-layer="back"] .layer-indicator {
            transform: translateX(100%);
        }
        .world-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
        }
        .world-grid .cheat-row {
            display: grid;
            grid-template-columns: 110px 1fr;
            align-items: center;
            gap: 8px;
            padding: 6px 8px;
            margin-bottom: 4px;
        }
        .world-grid .cheat-inline {
            justify-content: flex-end;
            flex-wrap: wrap;
            gap: 6px;
        }
        .world-grid .cheat-slider {
            width: 120px;
        }
        .world-grid .cheat-input {
            width: 64px;
            padding: 4px 6px;
        }
        .texture-preview {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 10px;
            border-radius: 8px;
            background: rgba(0,0,0,0.25);
            border: 1px solid rgba(255,255,255,0.05);
        }
        .texture-preview-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
        }
        .texture-preview canvas {
            width: 64px;
            height: 64px;
            border-radius: 8px;
            background: rgba(0,0,0,0.4);
            border: 1px solid rgba(255,255,255,0.08);
            image-rendering: pixelated;
        }
        .texture-preview-label {
            color: var(--text-dim);
            font-size: 12px;
        }
        @media (min-width: 900px) {
            #cheat-menu {
                width: 680px;
            }
            .menu-grid {
                grid-template-columns: 1fr 1fr;
            }
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
    };

    const helpConfig = {
        coreRows: [
            { desc: '移动/跳跃(Move/Jump)', keys: ['W', 'A', 'S', 'D'] },
            { desc: '射击(Shoot)', keys: ['Z'] },
            { desc: '翻滚(Roll)', keys: ['X'] },
            { desc: '手雷(Grenade)', keys: ['C'] },
            { desc: '开关菜单 (Toggle Menu)', keys: ['TAB'] }
        ],
        keysRows: [
            { desc: '生成敌人 (Spawn Enemy)', keys: ['Q'] },
            { desc: '生成箱子 (Spawn Crate)', keys: ['T'] },
            { desc: '爆炸 (Explosion)', keys: ['E'] },
            { desc: '水桶爆炸 (Water Explosion)', keys: ['F'] },
            { desc: '生成选中项 (Spawn Selected)', keys: ['G'] },
            { desc: '地形编辑模式 (Terrain Edit)', keys: ['B'] },
            { desc: '缩放开关 (Zoom Toggle)', keys: ['V'] },
            { desc: '重新开始 (Restart)', keys: ['R'] },
            { desc: '下一关 (Next Level)', keys: ['N'] },
            { desc: '传送至鼠标 (Tp to Cursor)', keys: ['M'] },
            { desc: '粒子发射器 (Particle Emitter)', keys: ['Y'] }
        ],
        debugRows: [
            { desc: '渲染调试层 (Debug Overlay)', keys: ['~'] },
            { desc: '调试物理 (Debug Physics)', keys: ['1'] },
            { desc: '调试粒子 (Debug Particles)', keys: ['2'] },
            { desc: '上帝模式 (God Mode)', keys: ['3'] },
            { desc: '保存截图 (Save Screenshot)', keys: ['5'] }

        ],
        tips: [
            '- 翻滚可以扑灭身上的火！(Roll to put out fire!)',
            '- 翻滚还可以对敌人造成近战伤害 (Rolling also does melee damage)',
            '- 与专家级敌人（白色）保持距离，他们经常翻滚和跳跃！(Keep distance from white specialists)',
            '- 按住跳跃键可以爬墙 (Hold jump to climb walls)',
            '- 跳跃翻滚可以跳得更高（跳跃后立即翻滚）(Jump+roll to gain height)',
            '- 要到达非常高的地方，尝试手雷跳！(Try a grenade jump)',
            '- 按 R 键可以重新开始游戏 (Press R to restart)'
        ],
        enemies: [
            '- <b>新兵 (绿色) / Recruit (Green)</b>: 稍矮，犹豫不决，1 击 (Shorter, hesitant, 1 hit)',
            '- <b>士兵 (蓝色) / Soldier (Blue)</b>: 平均能力，2 击 (Average, 2 hits)',
            '- <b>队长 (红色) / Captain (Red)</b>: 能爬墙，跳跃频繁，3 击 (Climbs walls, 3 hits)',
            '- <b>专家 (白色) / Specialist (White)</b>: 忍者，经常跳跃翻滚，4 击 (Ninja-like, 4 hits)',
            '- <b>爆破专家 (紫色) / Demolition (Purple)</b>: 投掷手雷，防火，5 击 (Throws grenades, 5 hits)',
            '- <b>重型变种 / Heavy Variant</b>: 双倍生命值，全自动射击 (Double HP, full auto)'
        ],
        objects: [
            '- <b>塑料箱 (棕色) / Plastic Crate (Brown)</b>: 易燃，烧毁后破裂 (Burns easily)',
            '- <b>金属箱 & 桶 (灰色) / Metal Crate & Barrel (Gray)</b>: 难摧毁，不可燃 (Hard to destroy)',
            '- <b>水桶 (蓝色) / Water Barrel (Blue)</b>: 灭火并推开物体 (Extinguish & push)',
            '- <b>炸药箱 & 桶 (绿色) / Explosive Crate & Barrel (Green)</b>: 燃烧后爆炸 (Burn then explode)',
            '- <b>高爆桶 (红色) / High Explosive Barrel (Red)</b>: 快速爆炸，威力大 (Bigger blast)',
            '- <b>岩石 (颜色各异) / Rock (Varies)</b>: 极难摧毁，压碎敌人 (Crushes enemies)',
            '- <b>熔岩石 (红橙色) / Lava Rock (Red/Orange)</b>: 接触会着火 (Ignites on touch)'
        ]
    };

    const renderHelpPanel = () => {
        const renderHelpKeys = (keys) => keys.map((key) => `<span class="help-key">${key}</span>`).join('');
        const renderHelpRows = (rows) => rows.map((row) => `<div class="help-row"><span class="help-desc">${row.desc}</span><div class="help-keys">${renderHelpKeys(row.keys)}</div></div>`).join('');
        const renderHelpList = (items) => items.map((item) => `<div class="help-desc" style="margin-bottom: 5px;">${item}</div>`).join('');
        return `
            <h2>基础操作&快捷键</h2>
            ${renderHelpRows(helpConfig.coreRows)}
            ${renderHelpRows(helpConfig.keysRows)}
            ${renderHelpRows(helpConfig.debugRows)}
            <h3>💡 游戏技巧 (Tips)</h3>
            ${renderHelpList(helpConfig.tips)}
            <h3>👾 敌人类型 (Enemy Types)</h3>
            ${renderHelpList(helpConfig.enemies)}
            <h3>📦 物体类型 (Object Types)</h3>
            ${renderHelpList(helpConfig.objects)}
        `;
    };

    const uiMaterialOptions = [
        { value: 'glass', label: '玻璃 (Glass)' },
        { value: 'frosted', label: '毛玻璃 (Frosted)' },
        { value: 'liquid', label: '液体玻璃 (Liquid)' }
    ];

    const playerToggles = [
        { id: 'chk-god', label: '上帝模式 (God Mode)' },
        { id: 'chk-fly', label: '飞行模式 (Noclip Fly)' },
        { id: 'chk-jump', label: '超级跳跃 (Super Jump)' },
        { id: 'chk-inf-jump', label: '无限连跳 (Infinite Jump)' },
        { id: 'chk-speed', label: '加速奔跑 (Super Speed)' },
        { id: 'chk-zoom', label: '鼠标缩放 (Mouse Zoom)' },
        { id: 'chk-aim', label: '鼠标瞄准 (Mouse Aim)' }
    ];
    const combatToggles = [
        { id: 'chk-one-hit', label: '一击必杀 (One Hit Kill)' },
        { id: 'chk-invisible', label: '隐身模式 (Invisibility)' },
        { id: 'chk-freeze', label: '冻结敌人 (Freeze Enemies)' },
        { id: 'chk-rapid', label: '极速射击 (Rapid Fire)' },
        { id: 'chk-explosive', label: '爆炸子弹 (Explosive Ammo)' },
        { id: 'chk-inf-grenade', label: '无限手雷 (Infinite Grenades)' },
        { id: 'chk-no-cd', label: '快速投掷 (No Cooldown)' },
        { id: 'chk-battle-royale', label: '斗蛐蛐 (Battle Royale)' }
    ];
    const worldToggles = [
        { id: 'chk-matrix', label: '子弹时间 (Matrix Mode)' }
    ];
    const debugToggles = [
        { id: 'chk-disable-particles', label: '关闭粒子效果 (Disable Particles)' },
        { id: 'chk-disable-audio', label: '关闭音效 (Disable Audio)' },
        { id: 'chk-explosion-radius', label: '爆炸半径渲染 (Explosion Radius)' },
        { id: 'chk-grenade-arc', label: '手雷抛物线预测 (Grenade Arc)' }
    ];
    const worldParams = [
        { label: '移动速度 (Move Speed)', rangeId: 'rng-world-move', inputId: 'num-world-move', resetId: 'btn-world-move-reset', min: 0.2, max: 3, step: 0.05, value: 1 },
        { label: '射击速度 (Fire Rate)', rangeId: 'rng-world-fire', inputId: 'num-world-fire', resetId: 'btn-world-fire-reset', min: 0.2, max: 3, step: 0.05, value: 1 },
        { label: '重力倍率 (Gravity)', rangeId: 'rng-world-gravity', inputId: 'num-world-gravity', resetId: 'btn-world-gravity-reset', min: 0, max: 3, step: 0.05, value: 1 },
        { label: '玩家受伤倍率 (Player Damage)', rangeId: 'rng-world-player-dmg', inputId: 'num-world-player-dmg', resetId: 'btn-world-player-dmg-reset', min: 0, max: 5, step: 0.1, value: 1 },
        { label: '敌人受伤倍率 (Enemy Damage)', rangeId: 'rng-world-enemy-dmg', inputId: 'num-world-enemy-dmg', resetId: 'btn-world-enemy-dmg-reset', min: 0, max: 5, step: 0.1, value: 1 },
        { label: '子弹射程 (Bullet Range)', rangeId: 'rng-world-range', inputId: 'num-world-range', resetId: 'btn-world-range-reset', min: 0.1, max: 3, step: 0.1, value: 1 },
        { label: '爆炸半径 (Explosion Radius)', rangeId: 'rng-world-explosion', inputId: 'num-world-explosion', resetId: 'btn-world-explosion-reset', min: 0.2, max: 5, step: 0.1, value: 1 },
        { label: '冲击波范围 (Shockwave Range)', rangeId: 'rng-world-explosion-shock', inputId: 'num-world-explosion-shock', resetId: 'btn-world-explosion-shock-reset', min: 0, max: 5, step: 0.1, value: 1 },
        { label: '冲击波力度 (Shockwave Force)', rangeId: 'rng-world-explosion-force', inputId: 'num-world-explosion-force', resetId: 'btn-world-explosion-force-reset', min: 0, max: 5, step: 0.1, value: 1 },
        { label: '引燃范围 (Ignite Range)', rangeId: 'rng-world-explosion-ignite', inputId: 'num-world-explosion-ignite', resetId: 'btn-world-explosion-ignite-reset', min: 0, max: 5, step: 0.1, value: 1 },
        { label: '子弹速度 (Bullet Speed)', rangeId: 'rng-world-bullet-speed', inputId: 'num-world-bullet-speed', resetId: 'btn-world-bullet-speed-reset', min: 0.2, max: 3, step: 0.05, value: 1 }
    ];

    const renderToggleRows = (items) => items.map((item) => `<div class="cheat-row"><label class="cheat-toggle"><span>${item.label}</span><input type="checkbox" id="${item.id}"><div class="toggle-switch"></div></label></div>`).join('');
    const renderButtonRow = (item) => `<div class="cheat-row"><button class="cheat-btn" id="${item.id}">${item.label}</button></div>`;
    const renderButtonGrid = (items) => `<div class="spawn-grid">${items.map((item) => `<button class="cheat-btn" id="${item.id}">${item.label}</button>`).join('')}</div>`;
    const renderWorldGrid = () => `
        <div class="world-grid">
            ${worldParams.map((item) => `
                <div class="cheat-row cheat-field">
                    <span>${item.label}</span>
                    <div class="cheat-inline">
                        <input type="range" id="${item.rangeId}" class="cheat-slider" min="${item.min}" max="${item.max}" step="${item.step}" value="${item.value}">
                        <input type="number" id="${item.inputId}" class="cheat-input" min="0" step="${item.step}" value="${item.value}">
                        <button class="cheat-btn cheat-btn-mini" id="${item.resetId}">重置 (Reset)</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    const renderMenu = () => {
        const materialOptions = uiMaterialOptions.map((option) => `<option value="${option.value}">${option.label}</option>`).join('');
        const sections = [
            {
                title: '玩家 (Player)',
                html: renderToggleRows(playerToggles) + renderButtonGrid([
                    { id: 'btn-heal', label: '治疗 (Heal)' },
                    { id: 'btn-lives', label: '+99 条命 (+99 Lives)' }
                ])
            },
            {
                title: '战斗 (Combat)',
                html: renderToggleRows(combatToggles)
            },
            {
                title: '角色纹理 (Character Textures)',
                html: `
                    <div class="cheat-row cheat-field"><span>身体纹理 (Body)</span><select id="sel-body" class="cheat-select"></select></div>
                    <div class="texture-preview">
                        <div class="texture-preview-item">
                            <canvas id="canvas-body-preview" width="64" height="64"></canvas>
                            <div class="texture-preview-label" id="body-preview-label">身体纹理 (Body)</div>
                        </div>
                        <div class="texture-preview-item">
                            <canvas id="canvas-head-preview" width="64" height="64"></canvas>
                            <div class="texture-preview-label" id="head-preview-label">头部纹理 (Head)</div>
                        </div>
                    </div>
                    <div class="cheat-row cheat-field"><span>头部纹理 (Head)</span><select id="sel-head" class="cheat-select"></select></div>
                `
            },
            {
                title: '世界 (World)',
                html: renderToggleRows(worldToggles) +
                    renderButtonRow({ id: 'btn-close-world', label: '封闭世界 (Closed World)' }) +
                    renderButtonGrid([
                        { id: 'btn-next-level', label: '下一关 (Next Level)' },
                        { id: 'btn-destroy-level', label: '天地同寿 (EExplosion!!!)' }
                    ])
            },
            {
                title: '生成器 (Spawner) (G)',
                html: `
                    <div class="spawn-radio-group" id="spawn-selector"></div>
                    ${renderButtonGrid([
                        { id: 'btn-spawn-selected', label: '生成选中项' },
                        { id: 'btn-spawn-selected', label: 'Spawn Selected' },
                        { id: 'btn-spawn-undo', label: '撤销生成 (Undo Spawn)' },
                        { id: 'btn-spawn-redo', label: '重做生成 (Redo Spawn)' }
                    ])}
                `
            },
            {
                title: '世界参数 (World Params)',
                html: renderWorldGrid()
            },
            {
                title: '调试 (Debug)',
                html: renderToggleRows(debugToggles)
            },
            {
                title: '地形编辑 (Terrain Edit)',
                html: `
                    ${renderToggleRows([{ id: 'chk-terrain', label: '编辑模式 (Edit Mode)' }])}
                    <div class="cheat-row cheat-field">
                        <span>图层 (Layer)</span>
                        <div class="layer-toggle" id="terrain-layer-toggle" data-layer="front">
                            <button class="layer-option" data-layer="front">前景 (Front)</button>
                            <button class="layer-option" data-layer="back">背景 (Back)</button>
                            <div class="layer-indicator"></div>
                        </div>
                    </div>
                    <div class="cheat-row cheat-field"><span>类型 (Type)</span><select id="sel-terrain-type" class="cheat-select"></select></div>
                    <div class="cheat-row cheat-field"><span>笔刷 (Brush)</span><input type="range" id="rng-terrain-size" class="cheat-slider" min="1" max="4" step="1" value="1"></div>
                    ${renderButtonGrid([
                        { id: 'btn-terrain-undo', label: '撤销编辑 (Undo Edit)' },
                        { id: 'btn-terrain-redo', label: '重做编辑 (Redo Edit)' }
                    ])}
                `
            }
        ];
        return `
            <div class="menu-title">
                <h2>StarWatch 作弊菜单</h2>
                <select id="sel-ui-material" class="menu-title-select">
                    ${materialOptions}
                </select>
            </div>
            <div class="menu-grid">
                ${sections.map((section) => `<div class="menu-section"><h3>${section.title}</h3>${section.html}</div>`).join('')}
            </div>
            <div class="footer-hint">Powered by StarWatch</div>
        `;
    };

    let container = null;
    let helpPanel = null;
    let menu = null;
    let uiReady = false;

    const initUI = () => {
        if (uiReady) return;
        buildCheatMenuStyle();
        container = document.createElement('div');
        container.id = 'cheat-menu-container';
        container.style.display = 'none';
        helpPanel = document.createElement('div');
        helpPanel.id = 'help-panel';
        helpPanel.innerHTML = renderHelpPanel();
        menu = document.createElement('div');
        menu.id = 'cheat-menu';
        menu.innerHTML = renderMenu();
        container.appendChild(helpPanel);
        container.appendChild(menu);
        document.body.appendChild(container);
        uiReady = true;
        bindUI();
    };

    // ==========================================
    // Spawn Configuration
    // ==========================================
    const spawnOptions = [
        { label: "木箱 (Wood Crate)", type: 'prop', id: 0 },
        { label: "爆炸木箱 (Explosive Crate)", type: 'prop', id: 1 },
        { label: "铁箱 (Metal Crate)", type: 'prop', id: 2 },
        { label: "炸药桶 (Explosive Barrel)", type: 'prop', id: 3 },
        { label: "水桶 (Water Barrel)", type: 'prop', id: 4 },
        { label: "金属桶 (Metal Barrel)", type: 'prop', id: 5 },
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

    let selectedSpawn = spawnOptions[0];

    // ==========================================
    // Logic Implementation
    // ==========================================
    
    const safeTileTypes = {
        empty: typeof tileType_empty !== 'undefined' ? tileType_empty : 0,
        solid: typeof tileType_solid !== 'undefined' ? tileType_solid : 1,
        dirt: typeof tileType_dirt !== 'undefined' ? tileType_dirt : 2,
        base: typeof tileType_base !== 'undefined' ? tileType_base : 3,
        pipeH: typeof tileType_pipeH !== 'undefined' ? tileType_pipeH : 4,
        pipeV: typeof tileType_pipeV !== 'undefined' ? tileType_pipeV : 5,
        glass: typeof tileType_glass !== 'undefined' ? tileType_glass : 6,
        baseBack: typeof tileType_baseBack !== 'undefined' ? tileType_baseBack : 7,
        window: typeof tileType_window !== 'undefined' ? tileType_window : 8,
        ladder: typeof tileType_ladder !== 'undefined' ? tileType_ladder : -1
    };

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
        invisible: false,
        freezeEnemies: false,
        matrixMode: false,
        zoomEnabled: false, // Default OFF
        battleRoyale: false, // Default OFF
        mouseAim: false,
        uiBlocking: false,
        terrainEdit: false,
        terrainLayer: 'front',
        terrainType: safeTileTypes.dirt,
        terrainSize: 1,
        worldMoveMultiplier: 1,
        worldFireRateMultiplier: 1,
        worldGravityMultiplier: 1,
        worldExplosionShockwaveForceMultiplier: 1,
        worldPlayerDamageMultiplier: 1,
        worldEnemyDamageMultiplier: 1,
        worldBulletRangeMultiplier: 1,
        worldExplosionRadiusMultiplier: 1,
        worldExplosionShockwaveRangeMultiplier: 1,
        worldExplosionIgniteRangeMultiplier: 1,
        worldBulletSpeedMultiplier: 1,
        disableParticles: false,
        disableAudio: false,
        renderExplosionRadius: false,
        renderGrenadeArc: false
    };

    const getBlockTarget = (target) => target && target.closest ? target.closest('#cheat-menu, #help-panel') : null;
    const isUiBlocking = (target) => state.uiBlocking || !!getBlockTarget(target);
    let feedbackEl = null;
    let feedbackTimer = null;
    const setElementVisible = (el, isVisible, displayValue = 'block') => {
        if (!el) return;
        if (isVisible) {
            if (el.style.display !== displayValue) el.style.display = displayValue;
            return;
        }
        if (el.style.display !== 'none') el.style.display = 'none';
    };
    const ensureFeedback = () => {
        if (feedbackEl) return;
        buildCheatMenuStyle();
        feedbackEl = document.createElement('div');
        feedbackEl.id = 'shortcut-feedback';
        feedbackEl.style.display = 'none';
        document.body.appendChild(feedbackEl);
    };
    const showShortcutFeedback = (text) => {
        if (!text) return;
        ensureFeedback();
        feedbackEl.textContent = text;
        setElementVisible(feedbackEl, true, 'block');
        feedbackEl.classList.add('is-visible');
        if (feedbackTimer) clearTimeout(feedbackTimer);
        feedbackTimer = setTimeout(() => {
            if (!feedbackEl) return;
            feedbackEl.classList.remove('is-visible');
            feedbackTimer = setTimeout(() => {
                setElementVisible(feedbackEl, false);
            }, 150);
        }, 1200);
    };

    const spawnUndoStack = [];
    const spawnRedoStack = [];
    const terrainUndoStack = [];
    const terrainRedoStack = [];
    let activeTerrainEdit = null;
    let terrainPainting = false;

    const clonePos = (pos) => pos && typeof pos.copy === 'function' ? pos.copy() : vec2(pos.x, pos.y);

    const updateUndoButtons = () => {
        if (!uiReady) return;
        const spawnUndoButton = document.getElementById('btn-spawn-undo');
        const spawnRedoButton = document.getElementById('btn-spawn-redo');
        const terrainUndoButton = document.getElementById('btn-terrain-undo');
        const terrainRedoButton = document.getElementById('btn-terrain-redo');
        if (spawnUndoButton) spawnUndoButton.disabled = spawnUndoStack.length === 0;
        if (spawnRedoButton) spawnRedoButton.disabled = spawnRedoStack.length === 0;
        if (terrainUndoButton) terrainUndoButton.disabled = terrainUndoStack.length === 0;
        if (terrainRedoButton) terrainRedoButton.disabled = terrainRedoStack.length === 0;
    };

    const recordSpawn = (record) => {
        spawnUndoStack.push(record);
        spawnRedoStack.length = 0;
        updateUndoButtons();
    };

    // Spawn Logic (top-level so快捷键可访问)
    const performSpawn = (pos) => {
        if (!selectedSpawn || !pos) return;
        if (selectedSpawn.type === 'enemy') {
            const ref = window.spawnEnemy(selectedSpawn.id, pos);
            recordSpawn({ kind: 'enemy', id: selectedSpawn.id, pos: clonePos(pos), ref });
        } else if (selectedSpawn.type === 'prop') {
            const ref = window.spawnProp(selectedSpawn.id, pos);
            recordSpawn({ kind: 'prop', id: selectedSpawn.id, pos: clonePos(pos), ref });
        } else if (selectedSpawn.type === 'supply') {
            if (players[0]) {
                players[0].grenadeCount += 3;
                players[0].heal(1);
                playSound(sound_checkpoint, pos);
                let e = new ParticleEmitter(pos);
                e.emitSize = 0.5;
                e.particleTime = 0.5;
                e.colorStartA = new Color(0,1,0,1);
                e.colorEndA = new Color(0,1,0,0);
                recordSpawn({ kind: 'supply', id: 0, pos: clonePos(pos) });
            }
        }
    };

    const undoSpawn = () => {
        const record = spawnUndoStack.pop();
        if (!record) return;
        if (record.kind === 'supply') {
            if (players[0]) {
                players[0].grenadeCount = Math.max(0, players[0].grenadeCount - 3);
                if (typeof players[0].damage === 'function') players[0].damage(1);
            }
        } else if (record.ref && typeof record.ref.destroy === 'function') {
            record.ref.destroy();
        }
        spawnRedoStack.push(record);
        updateUndoButtons();
    };

    const redoSpawn = () => {
        const record = spawnRedoStack.pop();
        if (!record) return;
        let ref = null;
        if (record.kind === 'enemy') {
            ref = window.spawnEnemy(record.id, record.pos);
        } else if (record.kind === 'prop') {
            ref = window.spawnProp(record.id, record.pos);
        } else if (record.kind === 'supply') {
            if (players[0]) {
                players[0].grenadeCount += 3;
                players[0].heal(1);
                playSound(sound_checkpoint, record.pos);
                let e = new ParticleEmitter(record.pos);
                e.emitSize = 0.5;
                e.particleTime = 0.5;
                e.colorStartA = new Color(0,1,0,1);
                e.colorEndA = new Color(0,1,0,0);
            }
        }
        spawnUndoStack.push({ ...record, ref });
        updateUndoButtons();
    };

    const setTerrainTile = (layer, pos, value) => {
        if (layer === 'back') {
            if (typeof setTileBackgroundData !== 'undefined') setTileBackgroundData(pos, value);
            if (tileBackgroundLayer && typeof TileLayerData !== 'undefined') tileBackgroundLayer.setData(pos, buildBackTileData(value), false);
        } else {
            if (typeof setTileCollisionData !== 'undefined') setTileCollisionData(pos, value);
            if (tileLayer && typeof TileLayerData !== 'undefined') tileLayer.setData(pos, buildFrontTileData(value), false);
        }
    };

    const applyTerrainRecord = (record, useAfter) => {
        if (!record) return;
        const positions = [];
        record.tiles.forEach((entry) => {
            const value = useAfter ? entry.after : entry.before;
            setTerrainTile(record.layer, entry.pos, value);
            positions.push(entry.pos);
        });
        queueTerrainRedraw(record.layer, positions);
    };

    const undoTerrain = () => {
        const record = terrainUndoStack.pop();
        if (!record) return;
        applyTerrainRecord(record, false);
        terrainRedoStack.push(record);
        updateUndoButtons();
    };

    const redoTerrain = () => {
        const record = terrainRedoStack.pop();
        if (!record) return;
        applyTerrainRecord(record, true);
        terrainUndoStack.push(record);
        updateUndoButtons();
    };

    const syncTerrainToggle = () => {
        if (!uiReady) return;
        const terrainToggle = document.getElementById('chk-terrain');
        if (terrainToggle) terrainToggle.checked = state.terrainEdit;
    };

    let grenadeArcFrame = -1;
    let grenadeArcPoints = null;
    let grenadeArcTime = -1;

    const bindUI = () => {
    const bindToggle = (id, key) => {
        const el = document.getElementById(id);
        if (el) {
            el.checked = !!state[key];
            el.onchange = (e) => {
                state[key] = e.target.checked;
                if (key === 'god' && typeof godMode !== 'undefined') godMode = state[key];
            };
        }
    };

    [
        ['chk-god', 'god'],
        ['chk-fly', 'fly'],
        ['chk-jump', 'superJump'],
        ['chk-inf-jump', 'infiniteJump'],
        ['chk-speed', 'superSpeed'],
        ['chk-one-hit', 'oneHitKill'],
        ['chk-invisible', 'invisible'],
        ['chk-freeze', 'freezeEnemies'],
        ['chk-rapid', 'rapidFire'],
        ['chk-explosive', 'explosiveBullets'],
        ['chk-inf-grenade', 'infiniteGrenades'],
        ['chk-no-cd', 'noGrenadeCooldown'],
        ['chk-matrix', 'matrixMode'],
        ['chk-zoom', 'zoomEnabled'],
        ['chk-battle-royale', 'battleRoyale'],
        ['chk-aim', 'mouseAim'],
        ['chk-terrain', 'terrainEdit'],
        ['chk-disable-particles', 'disableParticles'],
        ['chk-disable-audio', 'disableAudio'],
        ['chk-explosion-radius', 'renderExplosionRadius'],
        ['chk-grenade-arc', 'renderGrenadeArc']
    ].forEach(([id, key]) => bindToggle(id, key));

    const spawnSelector = document.getElementById('spawn-selector');
    if (spawnSelector) {
        spawnSelector.innerHTML = '';
        const fragment = document.createDocumentFragment();
        spawnOptions.forEach((opt, index) => {
            const label = document.createElement('label');
            label.className = 'spawn-radio-label';
            label.innerHTML = `<input type="radio" name="spawn-opt" value="${index}" ${index === 0 ? 'checked' : ''}> ${opt.label}`;
            const input = label.querySelector('input');
            input.onchange = () => {
                selectedSpawn = opt;
            };
            fragment.appendChild(label);
        });
        spawnSelector.appendChild(fragment);
    }

    const uiMaterialSelect = document.getElementById('sel-ui-material');
    if (uiMaterialSelect) {
        container.dataset.material = 'glass';
        uiMaterialSelect.value = 'glass';
        uiMaterialSelect.onchange = () => {
            container.dataset.material = uiMaterialSelect.value;
        };
    }

    const bodySelect = document.getElementById('sel-body');
    const headSelect = document.getElementById('sel-head');
    const bodyPreviewCanvas = document.getElementById('canvas-body-preview');
    const headPreviewCanvas = document.getElementById('canvas-head-preview');
    const bodyPreviewLabel = document.getElementById('body-preview-label');
    const headPreviewLabel = document.getElementById('head-preview-label');
    const bodyPreviewContext = bodyPreviewCanvas ? bodyPreviewCanvas.getContext('2d') : null;
    const headPreviewContext = headPreviewCanvas ? headPreviewCanvas.getContext('2d') : null;

    const clampValue = (value, min, max) => Math.min(max, Math.max(min, value));

    const updateTexturePreview = () => {
        if (!tileImage || !tileImage.width) return;
        if (bodyPreviewCanvas && bodySelect && bodyPreviewContext) {
            const tileSizeX = defaultTileSize ? defaultTileSize.x : 16;
            const tileSizeY = defaultTileSize ? defaultTileSize.y : 16;
            const cols = tileImage.width / tileSizeX | 0;
            const index = parseInt(bodySelect.value, 10);
            if (cols && !Number.isNaN(index)) {
                const sx = (index % cols) * tileSizeX;
                const sy = (index / cols | 0) * tileSizeY;
                bodyPreviewContext.clearRect(0, 0, bodyPreviewCanvas.width, bodyPreviewCanvas.height);
                bodyPreviewContext.imageSmoothingEnabled = false;
                const scale = Math.min(bodyPreviewCanvas.width / tileSizeX, bodyPreviewCanvas.height / tileSizeY);
                const drawW = tileSizeX * scale;
                const drawH = tileSizeY * scale;
                bodyPreviewContext.drawImage(
                    tileImage,
                    sx,
                    sy,
                    tileSizeX,
                    tileSizeY,
                    (bodyPreviewCanvas.width - drawW) / 2,
                    (bodyPreviewCanvas.height - drawH) / 2,
                    drawW,
                    drawH
                );
                if (bodyPreviewLabel) bodyPreviewLabel.textContent = `身体纹理 ${index}`;
            }
        }
        if (headPreviewCanvas && headSelect && headPreviewContext) {
            const headSize = 8;
            const cols = tileImage.width / headSize | 0;
            const index = parseInt(headSelect.value, 10);
            if (cols && !Number.isNaN(index)) {
                const sx = (index % cols) * headSize;
                const sy = (index / cols | 0) * headSize;
                headPreviewContext.clearRect(0, 0, headPreviewCanvas.width, headPreviewCanvas.height);
                headPreviewContext.imageSmoothingEnabled = false;
                const scale = Math.min(headPreviewCanvas.width / headSize, headPreviewCanvas.height / headSize);
                const drawW = headSize * scale;
                const drawH = headSize * scale;
                headPreviewContext.drawImage(
                    tileImage,
                    sx,
                    sy,
                    headSize,
                    headSize,
                    (headPreviewCanvas.width - drawW) / 2,
                    (headPreviewCanvas.height - drawH) / 2,
                    drawW,
                    drawH
                );
                if (headPreviewLabel) headPreviewLabel.textContent = `头部纹理 ${index}`;
            }
        }
    };

    const applyCharacterTextures = () => {
        if (players[0] && bodySelect && headSelect) {
            players[0].bodyTile = parseInt(bodySelect.value, 10);
            players[0].headTile = parseInt(headSelect.value, 10);
            players[0].tileIndex = players[0].bodyTile + 1;
        }
        updateTexturePreview();
    };

    if (bodySelect) bodySelect.onchange = applyCharacterTextures;
    if (headSelect) headSelect.onchange = applyCharacterTextures;

    const buildTextureLabel = (index, cols) => {
        const row = (index / cols | 0) + 1;
        const col = (index % cols) + 1;
        return `纹理 (行${row}列${col})`;
    };

    const buildTextureOptions = () => {
        if (!tileImage || !tileImage.width || !bodySelect || !headSelect) return false;

        bodySelect.innerHTML = '';
        headSelect.innerHTML = '';

        const bodyCols = tileImage.width / defaultTileSize.x | 0;
        const bodyRows = tileImage.height / defaultTileSize.y | 0;
        const bodyCount = bodyCols * bodyRows;
        for (let index = 0; index < bodyCount; index++) {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = buildTextureLabel(index, bodyCols);
            bodySelect.appendChild(opt);
        }

        const headSize = 8;
        const headCols = tileImage.width / headSize | 0;
        const headRows = tileImage.height / headSize | 0;
        const headCount = headCols * headRows;
        for (let index = 0; index < headCount; index++) {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = buildTextureLabel(index, headCols);
            headSelect.appendChild(opt);
        }

        const defaultBody = players[0] ? players[0].bodyTile : 5;
        const defaultHead = players[0] ? players[0].headTile : 18;
        if (Array.from(bodySelect.options).some((opt) => parseInt(opt.value, 10) === defaultBody)) {
            bodySelect.value = defaultBody;
        } else if (bodySelect.options.length) {
            bodySelect.value = bodySelect.options[0].value;
        }
        if (Array.from(headSelect.options).some((opt) => parseInt(opt.value, 10) === defaultHead)) {
            headSelect.value = defaultHead;
        } else if (headSelect.options.length) {
            headSelect.value = headSelect.options[0].value;
        }
        applyCharacterTextures();
        updateTexturePreview();
        return true;
    };

    const waitForTiles = setInterval(() => {
        if (buildTextureOptions()) clearInterval(waitForTiles);
    }, 200);

    const moveRange = document.getElementById('rng-world-move');
    const moveInput = document.getElementById('num-world-move');
    const moveReset = document.getElementById('btn-world-move-reset');
    const fireRange = document.getElementById('rng-world-fire');
    const fireInput = document.getElementById('num-world-fire');
    const fireReset = document.getElementById('btn-world-fire-reset');
    const gravityRange = document.getElementById('rng-world-gravity');
    const gravityInput = document.getElementById('num-world-gravity');
    const gravityReset = document.getElementById('btn-world-gravity-reset');
    const shockwaveForceRange = document.getElementById('rng-world-explosion-force');
    const shockwaveForceInput = document.getElementById('num-world-explosion-force');
    const shockwaveForceReset = document.getElementById('btn-world-explosion-force-reset');
    const playerDamageRange = document.getElementById('rng-world-player-dmg');
    const playerDamageInput = document.getElementById('num-world-player-dmg');
    const playerDamageReset = document.getElementById('btn-world-player-dmg-reset');
    const enemyDamageRange = document.getElementById('rng-world-enemy-dmg');
    const enemyDamageInput = document.getElementById('num-world-enemy-dmg');
    const enemyDamageReset = document.getElementById('btn-world-enemy-dmg-reset');
    const rangeRange = document.getElementById('rng-world-range');
    const rangeInput = document.getElementById('num-world-range');
    const rangeReset = document.getElementById('btn-world-range-reset');
    const explosionRange = document.getElementById('rng-world-explosion');
    const explosionInput = document.getElementById('num-world-explosion');
    const explosionReset = document.getElementById('btn-world-explosion-reset');
    const explosionShockRange = document.getElementById('rng-world-explosion-shock');
    const explosionShockInput = document.getElementById('num-world-explosion-shock');
    const explosionShockReset = document.getElementById('btn-world-explosion-shock-reset');
    const explosionIgniteRange = document.getElementById('rng-world-explosion-ignite');
    const explosionIgniteInput = document.getElementById('num-world-explosion-ignite');
    const explosionIgniteReset = document.getElementById('btn-world-explosion-ignite-reset');
    const bulletSpeedRange = document.getElementById('rng-world-bullet-speed');
    const bulletSpeedInput = document.getElementById('num-world-bullet-speed');
    const bulletSpeedReset = document.getElementById('btn-world-bullet-speed-reset');

    const applyNumericValue = (value, { key, minValue, rangeEl, inputEl }) => {
        const parsed = parseFloat(value);
        if (!Number.isFinite(parsed)) return;
        const finalValue = minValue === undefined ? parsed : Math.max(minValue, parsed);
        state[key] = finalValue;
        if (inputEl) inputEl.value = finalValue;
        if (rangeEl) {
            const min = parseFloat(rangeEl.min);
            const max = parseFloat(rangeEl.max);
            rangeEl.value = clampValue(finalValue, min, max);
        }
    };

    const bindNumericControl = ({ key, minValue, rangeEl, inputEl, resetEl, defaultValue }) => {
        const apply = (value) => applyNumericValue(value, { key, minValue, rangeEl, inputEl });
        if (rangeEl) rangeEl.oninput = () => apply(rangeEl.value);
        if (inputEl) inputEl.oninput = () => apply(inputEl.value);
        if (resetEl) resetEl.onclick = () => apply(defaultValue);
        return apply;
    };

    bindNumericControl({ key: 'worldMoveMultiplier', minValue: 0.01, rangeEl: moveRange, inputEl: moveInput, resetEl: moveReset, defaultValue: 1 });
    bindNumericControl({ key: 'worldFireRateMultiplier', minValue: 0.01, rangeEl: fireRange, inputEl: fireInput, resetEl: fireReset, defaultValue: 1 });
    bindNumericControl({ key: 'worldGravityMultiplier', minValue: 0, rangeEl: gravityRange, inputEl: gravityInput, resetEl: gravityReset, defaultValue: 1 });
    bindNumericControl({ key: 'worldExplosionShockwaveForceMultiplier', minValue: 0, rangeEl: shockwaveForceRange, inputEl: shockwaveForceInput, resetEl: shockwaveForceReset, defaultValue: 1 });
    bindNumericControl({ key: 'worldPlayerDamageMultiplier', minValue: 0, rangeEl: playerDamageRange, inputEl: playerDamageInput, resetEl: playerDamageReset, defaultValue: 1 });
    bindNumericControl({ key: 'worldEnemyDamageMultiplier', minValue: 0, rangeEl: enemyDamageRange, inputEl: enemyDamageInput, resetEl: enemyDamageReset, defaultValue: 1 });
    bindNumericControl({ key: 'worldBulletRangeMultiplier', minValue: 0.01, rangeEl: rangeRange, inputEl: rangeInput, resetEl: rangeReset, defaultValue: 1 });
    bindNumericControl({ key: 'worldExplosionRadiusMultiplier', minValue: 0, rangeEl: explosionRange, inputEl: explosionInput, resetEl: explosionReset, defaultValue: 1 });
    bindNumericControl({ key: 'worldExplosionShockwaveRangeMultiplier', minValue: 0, rangeEl: explosionShockRange, inputEl: explosionShockInput, resetEl: explosionShockReset, defaultValue: 1 });
    bindNumericControl({ key: 'worldExplosionIgniteRangeMultiplier', minValue: 0, rangeEl: explosionIgniteRange, inputEl: explosionIgniteInput, resetEl: explosionIgniteReset, defaultValue: 1 });
    bindNumericControl({ key: 'worldBulletSpeedMultiplier', minValue: 0.01, rangeEl: bulletSpeedRange, inputEl: bulletSpeedInput, resetEl: bulletSpeedReset, defaultValue: 1 });

    // Closed World
    document.getElementById('btn-close-world').onclick = () => {
        const size = (typeof levelSize !== 'undefined') ? levelSize : (tileLayer ? tileLayer.size : null);
        
        if (!size || typeof tileLayer === 'undefined') {
             return;
        }
        
        const tileType = safeTileTypes.solid;
        const boundaryPositions = [];

        // Loop through boundaries
        for (let x = 0; x < size.x; x++) {
            setBoundaryTile(x, 0);
            setBoundaryTile(x, size.y - 1);
        }
        for (let y = 0; y < size.y; y++) {
            setBoundaryTile(0, y);
            setBoundaryTile(size.x - 1, y);
        }

        if (tileLayer.redraw) tileLayer.redraw();
        if (typeof decorateTile !== 'undefined') {
            for (let i = 0; i < boundaryPositions.length; i++) {
                const pos = boundaryPositions[i];
                decorateTile(pos);
                decorateTile(pos.add(vec2(1, 0)));
                decorateTile(pos.add(vec2(-1, 0)));
                decorateTile(pos.add(vec2(0, 1)));
                decorateTile(pos.add(vec2(0, -1)));
            }
        }
        
        function setBoundaryTile(x, y) {
            const pos = vec2(x, y);
            if (typeof setTileCollisionData !== 'undefined') {
                setTileCollisionData(pos, tileType);
            }
            if (typeof tileLayer !== 'undefined' && typeof TileLayerData !== 'undefined') {
                tileLayer.setData(pos, buildFrontTileData(tileType), false);
            }
            boundaryPositions.push(pos);
        }
    };

    document.getElementById('btn-heal').onclick = () => { if (players[0]) players[0].heal(1000); };
    document.getElementById('btn-lives').onclick = () => { if (typeof playerLives !== 'undefined') playerLives += 99; };
    document.getElementById('btn-next-level').onclick = () => { if (typeof nextLevel !== 'undefined') nextLevel(); };
    document.getElementById('btn-destroy-level').onclick = () => { if (typeof explosion !== 'undefined' && players[0]) explosion(players[0].pos, 50); };

    const terrainTypeSelect = document.getElementById('sel-terrain-type');
    const terrainLayerToggle = document.getElementById('terrain-layer-toggle');
    const terrainSizeInput = document.getElementById('rng-terrain-size');

    const terrainTypes = [
        { label: '空', value: safeTileTypes.empty },
        { label: '实心', value: safeTileTypes.solid },
        { label: '泥土', value: safeTileTypes.dirt },
        { label: '基地', value: safeTileTypes.base },
        { label: '玻璃', value: safeTileTypes.glass },
        { label: '横管', value: safeTileTypes.pipeH },
        { label: '竖管', value: safeTileTypes.pipeV },
        { label: '梯子', value: safeTileTypes.ladder },
        { label: '基地背景', value: safeTileTypes.baseBack },
        { label: '窗户', value: safeTileTypes.window }
    ];

    if (terrainTypeSelect) {
        terrainTypes.forEach((t) => {
            const opt = document.createElement('option');
            opt.value = t.value;
            opt.textContent = t.label;
            terrainTypeSelect.appendChild(opt);
        });
        terrainTypeSelect.value = state.terrainType;
        terrainTypeSelect.onchange = () => state.terrainType = parseInt(terrainTypeSelect.value, 10);
    }

    const setTerrainLayer = (layer) => {
        state.terrainLayer = layer === 'back' ? 'back' : 'front';
        if (terrainLayerToggle) {
            terrainLayerToggle.dataset.layer = state.terrainLayer;
            const options = terrainLayerToggle.querySelectorAll('.layer-option');
            options.forEach((btn) => {
                btn.classList.toggle('is-active', btn.dataset.layer === state.terrainLayer);
            });
        }
    };
    if (terrainLayerToggle) {
        const options = terrainLayerToggle.querySelectorAll('.layer-option');
        options.forEach((btn) => {
            btn.onclick = () => setTerrainLayer(btn.dataset.layer);
        });
        setTerrainLayer(state.terrainLayer);
    }
    if (terrainSizeInput) terrainSizeInput.oninput = () => state.terrainSize = parseInt(terrainSizeInput.value, 10);

    document.getElementById('btn-spawn-selected').onclick = () => {
        if (players[0]) performSpawn(players[0].pos.add(vec2(0, 5)));
    };

    const attachUiBlocker = (panel) => {
        if (!panel) return;
        const blockEvent = (e) => {
            state.uiBlocking = true;
            terrainPainting = false;
            e.stopPropagation();
        };
        const unblockEvent = () => {
            state.uiBlocking = false;
            terrainPainting = false;
        };
        panel.addEventListener('mousedown', blockEvent, { capture: true, passive: true });
        panel.addEventListener('mouseup', blockEvent, { capture: true, passive: true });
        panel.addEventListener('mousemove', blockEvent, { capture: true, passive: true });
        panel.addEventListener('mouseleave', unblockEvent, { capture: true, passive: true });
        panel.addEventListener('mouseenter', blockEvent, { capture: true, passive: true });
        panel.addEventListener('focusin', blockEvent, { capture: true, passive: true });
        panel.addEventListener('focusout', unblockEvent, { capture: true, passive: true });
    };
    attachUiBlocker(menu);
    attachUiBlocker(helpPanel);
    const spawnUndoButton = document.getElementById('btn-spawn-undo');
    const spawnRedoButton = document.getElementById('btn-spawn-redo');
    const terrainUndoButton = document.getElementById('btn-terrain-undo');
    const terrainRedoButton = document.getElementById('btn-terrain-redo');
    if (spawnUndoButton) spawnUndoButton.onclick = undoSpawn;
    if (spawnRedoButton) spawnRedoButton.onclick = redoSpawn;
    if (terrainUndoButton) terrainUndoButton.onclick = undoTerrain;
    if (terrainRedoButton) terrainRedoButton.onclick = redoTerrain;
    updateUndoButtons();
    };

    // Keyboard Listener
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Tab') {
            e.preventDefault();
        if (!uiReady) initUI();
        const isVisible = container && container.style.display !== 'none';
        const nextVisible = !isVisible;
        setElementVisible(container, nextVisible, 'flex');
        setElementVisible(helpPanel, nextVisible, 'block');
            if (isVisible) state.uiBlocking = false;
            showShortcutFeedback(`菜单：${nextVisible ? '开' : '关'}`);
        }
        
        // Quick Actions
        if (typeof mousePosWorld !== 'undefined') {
            if (isUiBlocking(e.target)) return;
            if (e.code === 'KeyQ') { new Enemy(mousePosWorld); showShortcutFeedback('快速生成敌人'); }
            if (e.code === 'KeyT') { new Prop(mousePosWorld); showShortcutFeedback('快速生成物体'); }
            if (e.code === 'KeyE') { explosion(mousePosWorld); showShortcutFeedback('爆炸'); }
            if (e.code === 'KeyF') {  makeWater(mousePosWorld); showShortcutFeedback('水桶爆炸'); }
            if (e.code === 'KeyG') { performSpawn(mousePosWorld); debugRect && debugRect(mousePosWorld, vec2(1), '#fff', 0.1); showShortcutFeedback(`生成：${selectedSpawn ? selectedSpawn.label : '未知'}`); }
            if (e.code === 'KeyB') {
                if (isUiBlocking(e.target)) return;
                state.terrainEdit = !state.terrainEdit;
                syncTerrainToggle();
                showShortcutFeedback(`地形编辑：${state.terrainEdit ? '开' : '关'}`);
            }
            if (e.code === 'KeyV') {
                state.zoomEnabled = !state.zoomEnabled;
                const zoomToggle = uiReady ? document.getElementById('chk-zoom') : null;
                if (zoomToggle) zoomToggle.checked = state.zoomEnabled;
                showShortcutFeedback(`鼠标缩放：${state.zoomEnabled ? '开' : '关'}`);
            }
        }
    });

    document.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (!state.terrainEdit || !mousePosWorld) return;
        if (isUiBlocking(e.target)) return;
        activeTerrainEdit = { layer: state.terrainLayer, tiles: new Map() };
        terrainPainting = true;
        applyTerrainEdit(mousePosWorld);
    }, { passive: true });
    document.addEventListener('mouseup', (e) => {
        if (e.button !== 0) return;
        terrainPainting = false;
        if (activeTerrainEdit && activeTerrainEdit.tiles.size) {
            terrainUndoStack.push({
                layer: activeTerrainEdit.layer,
                tiles: Array.from(activeTerrainEdit.tiles.values())
            });
            terrainRedoStack.length = 0;
            updateUndoButtons();
        }
        activeTerrainEdit = null;
    }, { passive: true });
    document.addEventListener('mousemove', (e) => {
        if (!terrainPainting || !state.terrainEdit || !mousePosWorld) return;
        if (isUiBlocking(e.target)) return;
        applyTerrainEdit(mousePosWorld);
    }, { passive: true });

    const getGroundStart = () => typeof groundTileStart !== 'undefined' ? groundTileStart : 8;
    const getLevelColor = () => {
        if (typeof levelColor !== 'undefined') return levelColor;
        if (typeof levelGroundColor !== 'undefined') return levelGroundColor;
        return new Color(0.6, 0.5, 0.4);
    };

    const buildFrontTileData = (type) => {
        const groundStart = getGroundStart();
        const baseColor = getLevelColor();
        if (type === safeTileTypes.empty) return new TileLayerData();
        let direction = rand(4) | 0;
        let mirror = rand(2) | 0;
        let color;
        let tileIndex = groundStart;
        if (type === safeTileTypes.dirt) {
            tileIndex = groundStart + 2 + rand() ** 3 * 2 | 0;
            color = baseColor.mutate(.03);
        } else if (type === safeTileTypes.pipeH) {
            tileIndex = groundStart + 5;
            direction = 1;
        } else if (type === safeTileTypes.pipeV) {
            tileIndex = groundStart + 5;
            direction = 0;
        } else if (type === safeTileTypes.glass) {
            tileIndex = groundStart + 5;
            direction = 0;
            color = new Color(0, 1, 1, .5);
        } else if (type === safeTileTypes.base) {
            tileIndex = groundStart + 4;
        } else if (type === safeTileTypes.solid) {
            tileIndex = groundStart + 4;
        } else if (type === safeTileTypes.ladder) {
            tileIndex = groundStart + 7;
            direction = mirror = 0;
        } else if (type === safeTileTypes.baseBack) {
            tileIndex = groundStart + 6;
            color = baseColor.scale(.6, 1);
        } else if (type === safeTileTypes.window) {
            tileIndex = 0;
            color = new Color(0, 1, 1, .5);
        }
        return new TileLayerData(tileIndex, direction, mirror, color);
    };

    const buildBackTileData = (type) => {
        const groundStart = getGroundStart();
        if (type === safeTileTypes.empty) return new TileLayerData();
        const direction = rand(4) | 0;
        const mirror = rand(2) | 0;
        let color = new Color();
        let tileIndex = groundStart;
        if (type === safeTileTypes.dirt) {
            tileIndex = groundStart + 2 + rand() ** 3 * 2 | 0;
            color = getLevelColor().mutate();
        } else if (type === safeTileTypes.base) {
            tileIndex = groundStart + 6;
            color = color.scale(rand(1, .7), 1);
        } else if (type === safeTileTypes.baseBack) {
            tileIndex = groundStart + 6;
            color = color.scale(rand(.5, .3), 1).mutate();
        } else if (type === safeTileTypes.window) {
            tileIndex = 0;
            color = new Color(0, 1, 1, .5);
        }
        return new TileLayerData(tileIndex, direction, mirror, color.scale(.4, 1));
    };

    let lastTerrainPaintTime = 0;
    let lastTerrainKey = '';
    let terrainQueuePending = false;
    let terrainQueuedLayer = 'front';
    let terrainQueuedPositions = [];

    const queueTerrainRedraw = (layer, positions) => {
        terrainQueuedLayer = layer;
        for (let i = 0; i < positions.length; i++) terrainQueuedPositions.push(positions[i]);
        if (terrainQueuePending) return;
        terrainQueuePending = true;
        requestAnimationFrame(() => {
            terrainQueuePending = false;
            const queued = terrainQueuedPositions;
            terrainQueuedPositions = [];
            if (!queued.length) return;
            const posMap = new Map();
            for (let i = 0; i < queued.length; i++) {
                const pos = queued[i];
                const key = `${pos.x},${pos.y}`;
                if (!posMap.has(key)) posMap.set(key, pos);
            }
            if (terrainQueuedLayer === 'back') {
                if (tileBackgroundLayer && tileBackgroundLayer.redraw) tileBackgroundLayer.redraw();
                if (typeof decorateBackgroundTile !== 'undefined') {
                    for (const pos of posMap.values()) decorateBackgroundTile(pos);
                }
            } else {
                if (tileLayer && tileLayer.redraw) tileLayer.redraw();
                if (typeof decorateTile !== 'undefined') {
                    const decoMap = new Map();
                    for (const pos of posMap.values()) {
                        const positionsToAdd = [
                            pos,
                            pos.add(vec2(1, 0)),
                            pos.add(vec2(-1, 0)),
                            pos.add(vec2(0, 1)),
                            pos.add(vec2(0, -1))
                        ];
                        for (let i = 0; i < positionsToAdd.length; i++) {
                            const decoPos = positionsToAdd[i];
                            const decoKey = `${decoPos.x},${decoPos.y}`;
                            if (!decoMap.has(decoKey)) decoMap.set(decoKey, decoPos);
                        }
                    }
                    for (const pos of decoMap.values()) decorateTile(pos);
                }
            }
        });
    };

    function applyTerrainEdit(worldPos) {
        if (!worldPos) return;
        if (state.terrainLayer === 'front' && !tileLayer) return;
        if (state.terrainLayer === 'back' && !tileBackgroundLayer) return;

        const now = Date.now();
        if (now - lastTerrainPaintTime < 30) return;
        lastTerrainPaintTime = now;

        const basePos = worldPos.int();
        const key = `${state.terrainLayer}:${state.terrainType}:${state.terrainSize}:${basePos.x},${basePos.y}`;
        if (key === lastTerrainKey) return;
        lastTerrainKey = key;

        const radius = Math.max(1, state.terrainSize || 1);
        const editedPositions = [];
        for (let y = -radius + 1; y <= radius - 1; y++) {
            for (let x = -radius + 1; x <= radius - 1; x++) {
                const pos = basePos.add(vec2(x, y));
                if (state.terrainLayer === 'back') {
                    const before = typeof getTileBackgroundData !== 'undefined' ? getTileBackgroundData(pos) : 0;
                    setTileBackgroundData(pos, state.terrainType);
                    tileBackgroundLayer.setData(pos, buildBackTileData(state.terrainType), false);
                    if (activeTerrainEdit) {
                        const entryKey = `${pos.x},${pos.y}`;
                        if (!activeTerrainEdit.tiles.has(entryKey)) {
                            activeTerrainEdit.tiles.set(entryKey, { pos, before, after: state.terrainType });
                        } else {
                            const entry = activeTerrainEdit.tiles.get(entryKey);
                            entry.after = state.terrainType;
                            activeTerrainEdit.tiles.set(entryKey, entry);
                        }
                    }
                } else {
                    const before = typeof getTileCollisionData !== 'undefined' ? getTileCollisionData(pos) : 0;
                    setTileCollisionData(pos, state.terrainType);
                    tileLayer.setData(pos, buildFrontTileData(state.terrainType), false);
                    if (activeTerrainEdit) {
                        const entryKey = `${pos.x},${pos.y}`;
                        if (!activeTerrainEdit.tiles.has(entryKey)) {
                            activeTerrainEdit.tiles.set(entryKey, { pos, before, after: state.terrainType });
                        } else {
                            const entry = activeTerrainEdit.tiles.get(entryKey);
                            entry.after = state.terrainType;
                            activeTerrainEdit.tiles.set(entryKey, entry);
                        }
                    }
                }
                editedPositions.push(pos);
            }
        }
        queueTerrainRedraw(state.terrainLayer, editedPositions);
    }

    // ==========================================
    // Hooks & Core Logic
    // ==========================================

    const drawTerrainBrush = () => {
        if (!state.terrainEdit || state.uiBlocking) return;
        if (typeof mousePosWorld === 'undefined' || !mousePosWorld || typeof debugRect === 'undefined') return;
        const radius = Math.max(1, state.terrainSize || 1);
        const size = vec2(radius * 2 - 1);
        const center = mousePosWorld.int().add(vec2(0.5));
        const color = state.terrainLayer === 'back' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(167, 139, 250, 0.35)';
        debugRect(center, size, color, 0.1, 0, 1);
    };

    let brushHooked = false;
    if (typeof window.engineUpdate === 'function') {
        const originalEngineUpdate = window.engineUpdate;
        window.engineUpdate = function() {
            originalEngineUpdate();
            drawTerrainBrush();
        };
        brushHooked = true;
    }

    if (!brushHooked && !window.__cheatBrushLoop) {
        window.__cheatBrushLoop = true;
        const brushLoop = () => {
            drawTerrainBrush();
            requestAnimationFrame(brushLoop);
        };
        requestAnimationFrame(brushLoop);
    }

    const waitForClasses = setInterval(() => {
        if (typeof Player === 'undefined' || typeof Weapon === 'undefined' || typeof Bullet === 'undefined' || typeof Enemy === 'undefined' || typeof Grenade === 'undefined') return;
        clearInterval(waitForClasses);
        applyHooks();
    }, 100);

    function applyHooks() {
        if (typeof EngineObject !== 'undefined') {
            const originalEngineObjectUpdate = EngineObject.prototype.update;
            EngineObject.prototype.update = function() {
                const originalGravityScale = this.gravityScale;
                if (state.worldGravityMultiplier !== 1) this.gravityScale *= state.worldGravityMultiplier;
                originalEngineObjectUpdate.apply(this, arguments);
                if (state.worldGravityMultiplier !== 1) this.gravityScale = originalGravityScale;
            };
        }

        if (typeof ParticleEmitter !== 'undefined') {
            const originalEmitParticle = ParticleEmitter.prototype.emitParticle;
            ParticleEmitter.prototype.emitParticle = function() {
                if (state.disableParticles) return;
                return originalEmitParticle.apply(this, arguments);
            };
        }

        if (typeof playSound === 'function') {
            const originalPlaySound = playSound;
            window.playSound = function() {
                if (state.disableAudio) return;
                return originalPlaySound.apply(this, arguments);
            };
        }

        if (typeof playMusic === 'function') {
            const originalPlayMusic = playMusic;
            window.playMusic = function() {
                if (state.disableAudio) return;
                return originalPlayMusic.apply(this, arguments);
            };
        }
        
        if (!window.__cheatExplosionHooked && typeof explosion === 'function') {
            const originalExplosion = explosion;
            window.explosion = function(pos, radius=2) {
                const baseRadius = (typeof radius === 'number' ? radius : 2) * (state.worldExplosionRadiusMultiplier || 1);
                if (!pos || typeof destroyTile !== 'function' || typeof forEachObject !== 'function' || typeof ParticleEmitter === 'undefined') {
                    const result = originalExplosion.call(this, pos, baseRadius);
                    if (state.renderExplosionRadius && typeof debugCircle !== 'undefined' && pos) {
                        debugCircle(pos, baseRadius, '#ffb300', 0.2, 0.15);
                    }
                    return result;
                }
                if (typeof ASSERT === 'function') ASSERT(baseRadius > 0);
                if (typeof levelWarmup !== 'undefined' && levelWarmup) return;
                const shockwaveMultiplier = Number.isFinite(state.worldExplosionShockwaveRangeMultiplier) ? state.worldExplosionShockwaveRangeMultiplier : 1;
                const igniteMultiplier = Number.isFinite(state.worldExplosionIgniteRangeMultiplier) ? state.worldExplosionIgniteRangeMultiplier : 1;
                const shockwaveForceMultiplier = Number.isFinite(state.worldExplosionShockwaveForceMultiplier) ? state.worldExplosionShockwaveForceMultiplier : 1;
                const burnRange = baseRadius * 1.5 * igniteMultiplier;
                const pushOuter = Math.max(baseRadius, 2 * baseRadius * shockwaveMultiplier);
                const maxEffectRange = Math.max(baseRadius * 3, burnRange, pushOuter);
                const damage = baseRadius * 2;
                for (let x = -baseRadius; x < baseRadius; ++x) {
                    const h = (baseRadius ** 2 - x ** 2) ** .5;
                    for (let y = -h; y <= h; ++y) {
                        destroyTile(pos.add(vec2(x, y)), 0, 0);
                    }
                }
                const cleanupRadius = baseRadius + 1;
                for (let x = -cleanupRadius; x < cleanupRadius; ++x) {
                    const h = (cleanupRadius ** 2 - x ** 2) ** .5;
                    for (let y = -h; y < h; ++y) {
                        decorateTile(pos.add(vec2(x, y)).int());
                    }
                }
                forEachObject(pos, maxEffectRange, (o)=> {
                    const d = o.pos.distance(pos);
                    if (o.isGameObject) {
                        if (d < baseRadius) o.damage(damage);
                        if (d < burnRange) o.burn();
                    }
                    const p = percent(d, baseRadius, pushOuter);
                    const force = o.pos.subtract(pos).normalize(p * baseRadius * .2 * shockwaveForceMultiplier);
                    o.applyForce(force);
                    if (o.isDead && o.isDead()) o.angleVelocity += randSign() * rand(p * baseRadius / 4, .3);
                });
                if (typeof playSound === 'function') playSound(sound_explosion, pos);
                if (typeof debugFire !== 'undefined' && debugFire && typeof debugCircle !== 'undefined') {
                    debugCircle(pos, maxEffectRange, '#f00', 2);
                    debugCircle(pos, baseRadius, '#ff0', 2);
                }
                new ParticleEmitter(
                    pos, baseRadius/2, .2, 50*baseRadius, PI,
                    0, undefined,
                    new Color(0,0,0), new Color(0,0,0),
                    new Color(0,0,0,0), new Color(0,0,0,0),
                    1, .5, 2, .1, .05,
                    .9, 1, -.3, PI, .1, 
                    .5, 0, 0, 0, 1e8
                );
                new ParticleEmitter(
                    pos, baseRadius/2, .1, 100*baseRadius, PI,
                    0, undefined,
                    new Color(1,.5,.1), new Color(1,.1,.1),
                    new Color(1,.5,.1,0), new Color(1,.1,.1,0),
                    .5, .5, 2, .1, .05,
                    .9, 1, 0, PI, .05, 
                    .5, 0, 1, 0, 1e9
                );
                if (state.renderExplosionRadius && typeof debugCircle !== 'undefined') {
                    debugCircle(pos, pushOuter, '#38bdf8', 0.2, 0);
                    debugCircle(pos, burnRange, '#f97316', 0.2, 0);
                    debugCircle(pos, baseRadius, '#ffb300', 0.2, 0.15);
                }
            };
            window.__cheatExplosionHooked = true;
        }

        // --- Player Hooks ---
        const computeGrenadeArc = (player) => {
            if (!player || typeof gravity === 'undefined') return null;
            const arcPoints = [];
            const dir = vec2(player.getMirrorSign(), 0.75).normalize(1);
            let pos = player.pos.copy();
            let vel = player.velocity.add(dir.scale(0.26));
            arcPoints.push(pos);
            const steps = 120;
            const dt = 0.1;
            for (let i = 0; i < steps; i++) {
                const next = pos.add(vel.scale(dt));
                const hit = typeof tileCollisionRaycast === 'function' ? tileCollisionRaycast(pos, next) : 0;
                if (hit) {
                    arcPoints.push(hit);
                    break;
                }
                arcPoints.push(next);
                vel = vel.add(vec2(0, gravity * dt));
                pos = next;
                if (typeof levelSize !== 'undefined' && (pos.y < -5 || pos.y > levelSize.y + 5)) break;
            }
            return arcPoints;
        };
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
                 const jumpPressed = (!this.playerIndex && (keyIsDown(38) || keyIsDown(32))) || gamepadIsDown(0, this.playerIndex);
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

            if (this.isPlayer && state.worldMoveMultiplier !== 1) {
                const baseSpeed = typeof maxCharacterSpeed !== 'undefined' ? maxCharacterSpeed : 0.2;
                this.pos.x += this.moveInput.x * baseSpeed * (state.worldMoveMultiplier - 1);
            }

            if (this.isPlayer && (state.terrainEdit || state.uiBlocking)) {
                this.holdingShoot = false;
                this.pressingThrow = false;
                this.wasPressingThrow = false;
                if (this.weapon) this.weapon.triggerIsDown = 0;
            }
            
            if (state.renderGrenadeArc && this.isPlayer && typeof debugLine !== 'undefined' && typeof gravity !== 'undefined') {
                const isStationary = this.velocity.lengthSquared() < 0.0004 && abs(this.moveInput.x) < 0.01 && abs(this.moveInput.y) < 0.01;
                if (this.playerIndex === 0 && isStationary) {
                    if (grenadeArcTime < 0 || time - grenadeArcTime >= 1) {
                        grenadeArcTime = time;
                        grenadeArcFrame = frame;
                        grenadeArcPoints = computeGrenadeArc(this);
                        if (grenadeArcPoints && grenadeArcPoints.length > 1) {
                            for (let i = 0; i < grenadeArcPoints.length - 1; i++) {
                                debugLine(grenadeArcPoints[i], grenadeArcPoints[i + 1], '#ff7a18', 0.04, 0.2);
                            }
                        }
                    }
                }
            }
        };

        const originalGrenadeUpdate = Grenade.prototype.update;
        Grenade.prototype.update = function() {
            const prevPos = this.__trailPos ? this.__trailPos.copy() : this.pos.copy();
            originalGrenadeUpdate.apply(this, arguments);
            if (state.renderExplosionRadius && typeof debugCircle !== 'undefined') {
                const baseRadius = 3 * (state.worldExplosionRadiusMultiplier || 1);
                const shockwaveMultiplier = Number.isFinite(state.worldExplosionShockwaveRangeMultiplier) ? state.worldExplosionShockwaveRangeMultiplier : 1;
                const igniteMultiplier = Number.isFinite(state.worldExplosionIgniteRangeMultiplier) ? state.worldExplosionIgniteRangeMultiplier : 1;
                const burnRange = baseRadius * 1.5 * igniteMultiplier;
                const pushOuter = Math.max(baseRadius, 2 * baseRadius * shockwaveMultiplier);
                debugCircle(this.pos, pushOuter, '#38bdf8', 0.2, 0);
                debugCircle(this.pos, burnRange, '#f97316', 0.2, 0);
                debugCircle(this.pos, baseRadius, '#ffb300', 0.2, 0.15);
            }
            if (state.renderGrenadeArc && typeof debugLine !== 'undefined') {
                const nowPos = this.pos.copy();
                if (nowPos.distanceSquared(prevPos) > 0.0001) {
                    debugLine(prevPos, nowPos, '#a855f7', 0.03, 1);
                }
                this.__trailPos = nowPos;
            }
        };

        // --- Weapon Hooks ---
        const originalWeaponUpdate = Weapon.prototype.update;
        Weapon.prototype.update = function() {
            if (state.rapidFire && this.triggerIsDown && this.parent && this.parent.isPlayer) {
                 this.fireTimeBuffer = max(this.fireTimeBuffer, 0.13);
            }

            if (this.parent && this.parent.isPlayer && state.worldFireRateMultiplier !== 1) {
                this.fireTimeBuffer += timeDelta * (state.worldFireRateMultiplier - 1);
            }
            
            if (state.mouseAim && typeof mousePosWorld !== 'undefined' && this.parent && this.parent.isPlayer) {
                const diff = mousePosWorld.subtract(this.parent.pos);
                const targetAngle = diff.angle();
                if (diff.x < 0) this.parent.mirror = true;
                else this.parent.mirror = false;
                this.localAngle = (targetAngle - this.parent.angle) * this.parent.getMirrorSign();
            }

            originalWeaponUpdate.apply(this, arguments);
        };

        // --- Bullet Hooks ---
        const originalBulletUpdate = Bullet.prototype.update;
        Bullet.prototype.update = function() {
            if (state.matrixMode && frame % 5 !== 0) return;
            if (!this.__rangeScaled) {
                if (state.worldBulletRangeMultiplier !== 1) this.range *= state.worldBulletRangeMultiplier;
                this.__rangeScaled = true;
            }
            if (!this.__speedScaled) {
                if (state.worldBulletSpeedMultiplier !== 1) this.velocity = this.velocity.scale(state.worldBulletSpeedMultiplier);
                this.__speedScaled = true;
            }
            if (state.mouseAim && typeof mousePosWorld !== 'undefined' && this.attacker && this.attacker.isPlayer && this.getAliveTime() < 0.05) {
                const diff = mousePosWorld.subtract(this.attacker.pos);
                const speed = this.velocity.length();
                if (diff.lengthSquared()) this.velocity = diff.normalize(speed);
            }
            originalBulletUpdate.apply(this, arguments);
        };
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
            let finalDamage = damage;
            if (this.team === team_player && state.worldPlayerDamageMultiplier !== 1) finalDamage *= state.worldPlayerDamageMultiplier;
            if (this.team === team_enemy && state.worldEnemyDamageMultiplier !== 1) finalDamage *= state.worldEnemyDamageMultiplier;
            if (state.oneHitKill && this.team === team_enemy) {
                finalDamage = 10000;
            }
            return originalCharacterDamage.call(this, finalDamage, damagingObject);
        };
        
        // Custom Female Body Render Hook - REMOVED
        // The user requested to remove this.
        
        // --- Enemy Hooks (Matrix Mode & Battle Royale) ---
        const originalEnemyAlert = Enemy.prototype.alert;
        Enemy.prototype.alert = function(pos, seen) {
             if (state.invisible && seen) return; // Ignore visual alerts
             originalEnemyAlert.apply(this, arguments);
        };

        const originalEnemyUpdate = Enemy.prototype.update;
        Enemy.prototype.update = function() {
            if (state.freezeEnemies) return;
            if (state.matrixMode && frame % 5 !== 0) return;

            if (state.battleRoyale) {
                if (!this.__brTeamAssigned) {
                    this.__brTeamAssigned = true;
                    this.__originalTeam = this.team;
                    this.team = 100 + Math.floor(Math.random() * 1000);
                }
                
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
                        this.sawPlayerPos = nearestEnemy.pos.copy();
                        this.sawPlayerTimer.set(2);
                    }
                }
            } else {
                if (this.__brTeamAssigned) {
                    this.team = (this.__originalTeam !== undefined) ? this.__originalTeam : team_enemy;
                    this.__brTeamAssigned = false;
                    this.__originalTeam = undefined;
                }
            }

            originalEnemyUpdate.apply(this, arguments);
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
        return enemy;
    };

    window.spawnProp = function(type, pos) {
        if (!pos && players[0]) pos = players[0].pos.add(vec2(Math.random()*4-2, 5));
        if (!pos) return;
        return new Prop(pos, type);
    };

})();
