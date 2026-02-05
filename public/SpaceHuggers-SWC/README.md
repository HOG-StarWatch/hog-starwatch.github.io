本项目是[SpaceHugger](https://github.com/KilledByAPixel/SpaceHuggers)的修改版
增加作弊菜单：

---

# 🛠️ 作弊菜单功能 (Cheat Menu)

按下 **`TAB`** 键呼出菜单。

### 1. 玩家增强 (Player)
*   **上帝模式 (God Mode)**: 免疫所有伤害。
*   **幽灵飞行 (Noclip Fly)**: 穿墙飞行模式（WASD移动）。
*   **无限连跳 (Infinite Jump)**: 空中无限次跳跃。
*   **超级速度 (Super Speed)**: 移动速度大幅提升。
*   **鼠标瞄准 (Mouse Aim)**: 武器跟随鼠标光标方向。

### 2. 战斗辅助 (Combat)
*   **一击必杀 (One Hit Kill)**: 任何敌人一击毙命。
*   **极速射击 (Rapid Fire)**: 消除武器冷却时间。
*   **爆炸子弹 (Explosive Ammo)**: 子弹击中目标产生爆炸。
*   **无限手雷 (Infinite Grenades)**: 手雷用不完。

### 3. 世界控制 (World)
*   **封闭世界 (Closed World)**: 点击后在地图四周生成一圈不可破坏的基岩，防止掉出地图。
*   **毁灭全图 (Destroy World)**: 瞬间摧毁屏幕内的所有可破坏物体。
*   **子弹时间**: 减慢游戏速度（位于菜单底部或使用快捷键）。

### 4. 生成器 (Spawner)
*   **实体生成**: 选择敌人、箱子、补给品等，点击“生成选中项”或按 `G` 键在鼠标处生成。
*   **快捷键**:
    *   `Q`: 快速生成敌人
    *   `T`: 快速生成箱子
    *   `E`: 鼠标处制造爆炸
    *   `F`: 鼠标处制造水桶爆炸
    *   `Y`: 鼠标处制造水桶爆炸（无粒子碎片版）
    *   `G`: 生成菜单中选中的实体

---

# 原项目Readme汉化

![Space Huggers - Frank Force 制作的 JS13k 游戏](./screenshot.png)

帝国像瘟疫一样在银河系蔓延，并在偏远星球上建立前哨基地。
作为一名精英反叛军士兵，你的任务是消灭这些基地。
使用你的毁灭工具探索奇异的星球并消灭入侵者！
你只剩下 10 个克隆体，每次任务后会补充 3 个。
祝你好运，玩得开心，替我拥抱太空。

## 本游戏仅供学习用途，不得用于再分发！

# [游玩 SPACE HUGGERS!](https://www.newgrounds.com/portal/view/819609)
# [JS13K 官方版本](https://js13kgames.com/entries/space-huggers)
# [视频演示](https://www.youtube.com/watch?v=6VXrnk18Z4s)

# 🎮 游戏操作 (How To Play)
- **WASD 或 方向键** - 移动、跳跃和攀爬
- **Z 或 左键点击** - 射击（大多数物体会破碎，有些会燃烧）
- **X 或 中键点击** - 翻滚（短暂无敌，造成伤害，提供加速，扑灭火焰）
- **C 或 右键点击** - 手雷（每条命 3 个，明智使用）
- 你也可以使用 Xbox 或 SNES 风格的手柄，最多支持 4 人合作游玩！
- 消灭所有敌人以完成关卡
- 屏幕底部的雷达显示附近的敌人
- 初始有 10 条命，每完成一关获得 3 条命
- 为了获得最佳体验，请使用 Chrome 全屏模式
- 游戏没有尽头，但如果想要挑战，试着通过前 5 关

# 💡 游戏技巧
- 翻滚可以扑灭身上的火！
- 翻滚还可以对敌人造成近战伤害
- 与专家级敌人（白色）保持距离，他们经常翻滚和跳跃！
- 按住跳跃键可以爬墙
- 跳跃翻滚可以跳得更高（跳跃后立即翻滚）
- 要到达非常高的地方，尝试手雷跳！
- 按 R 键可以重新开始游戏

# ✨ 游戏特色
- 跑动射击 / Roguelike 混合玩法
- 2-4 人本地合作模式
- 种类繁多且复杂的程序化关卡生成
- 关卡完全可破坏且具有持久性
- 火焰传播和爆炸系统
- 5 种敌人类型及大型变种
- 7 种不同的箱子/桶/岩石类型
- 使用 12 色调色板的 17 种精灵纹理
- 玩家可以占领检查点并在那里重生
- 多层程序生成的视差背景
- 包含移动恒星、行星和太阳的星空模拟
- 雨、雪、血、爆炸、武器、水等粒子系统
- 高达 1920x1200 的原生分辨率渲染
- 使用 [ZzFX](https://github.com/KilledByAPixel/ZzFX) 制作的 11 种不同音效
- 支持多达 4 个手柄的 4 人合作！

# 🔧 引擎特性
- 比赛期间编写的自定义游戏引擎，与游戏代码分离
- 超快速渲染系统，60 fps 下支持多达 50,000 个对象
- 用于轴对齐边界框刚体动力学的物理引擎
- 基于瓦片的渲染和碰撞系统
- 粒子特效系统
- 键盘、鼠标、手柄和触摸的输入处理系统
- 包含 Vector2、Color 和 Timer 工具类的数学库
- ZzFX 音频支持按距离衰减声音
- 调试可视化系统（JS13K 版本中未包含，按 ~ 进入调试模式）

# 👾 敌人类型
- **新兵 (绿色)** - 稍矮，犹豫不决，只需 1 击
- **士兵 (蓝色)** - 平均身高和能力，需要 2 击
- **队长 (红色)** - 能爬墙，跳跃更频繁，需要 3 击
- **专家 (白色)** - 经常跳跃和翻滚，他们是忍者，需要 4 击
- **爆破专家 (紫色)** - 投掷手雷且不会着火，需要 5 击
- 小概率出现重型武器变种，拥有双倍生命值并全自动射击

# 📦 物体类型
- **塑料箱 (棕色)** - 易燃，完全烧毁后破裂
- **金属箱 & 桶 (灰色)** - 难以摧毁，不可燃烧
- **水桶 (蓝色)** - 扑灭火焰并推开物体
- **炸药箱 & 桶 (绿色)** - 燃烧并在几秒后爆炸
- **高爆桶 (红色)** - 快速爆炸，威力比普通炸药大得多
- **岩石 (颜色各异)** - 沉重且极难摧毁，不可燃烧，能压碎敌人
- **熔岩石 (发光的红橙色)** - 任何接触它的东西都会着火

# 🧰 使用工具
- [Roadroller](https://github.com/lifthrasiir/roadroller)
- [Google Closure Compiler](https://github.com/google/closure-compiler)
- [UglifyJS](https://github.com/mishoo/UglifyJS)
- [Imagemin](https://github.com/imagemin/imagemin)
- [Efficient Compression Tool](https://github.com/fhanau/Efficient-Compression-Tool)
- [Advzip](https://www.npmjs.com/package/advzip-bin)
- [ZzFX](https://github.com/KilledByAPixel/ZzFX)

# 🏗️ 如何构建 13k Zip
- 运行 `engine\build\setupBuild.bat` 通过 npm 安装必要的工具
- 你需要：google-closure-compiler, uglify, roadroller, imagemin-cli, 和 advzip
- 运行 `engine\build\build.bat` 构建 app.zip，这是最终结果
- 它还会创建一个名为 index.min.html 的文件，你可以用于测试
- 由于 roadroller 的随机性，zip 大小可能会有 20 字节左右的差异

# 原项目Readme
![Space Huggers - A JS13k Game by Frank Force](./screenshot.png)

The empire is spreading like a plague across the galaxy and building outposts on remote planets.
You are an elite rebel soldier tasked with wiping out those bases.
Explore strange planets using your tools of destruction and eliminate the invaders!
You have only 10 clones left, 3 more will be replenished after each mission.
Good luck, have fun, and give space a hug for me.

## This game is only for learning purposes and not intended to be redistributed!

# [PLAY SPACE HUGGERS!](https://www.newgrounds.com/portal/view/819609)
# [OFFICIAL JS13K BUILD](https://js13kgames.com/entries/space-huggers)
# [VIDEO DEMO](https://www.youtube.com/watch?v=6VXrnk18Z4s)

# How To Play
- Use WASD or D-Pad - Move, jump, and climb
- Z or Left click - Shoot - Most things will break, some will burn
- X or Middle click - Roll - brief invulnerability, does damage, gives a boost, puts out fire
- C or Right click - Grenade - 3 per life, use wisely
- You can also use a Xbox or SNES style controller, connect up to 4 for co-op play!
- Kill all enemies to complete the level
- A radar along the bottom of the screen shows nearby enemies
- You start with 10 lives and get 3 more for completing each level
- For an optimal play experience please use Chrome in full screen mode
- There is no end, but for a challenge, try beating the first 5 levels

# Gameplay Tips
- Roll to put out fire!
- Rolling also does melee damage to enemies
- Keep your distance from the specialists (white), they roll and flip often!
- You can hold down jump to climb up walls
- Jump flip to get more vertical height (roll immediately after jumping)
- To reach really high places try a grenade jump!
- You can press R to restart the game

# Game Features
- Run and gun / roguelike hybrid gameplay
- 2-4 player jump in local co-op mode
- Procedural level generation of great variety and complexity
- Levels are fully destructible with persistence
- Fire propagation and explosion system
- 5 enemy types with a larger variant
- 7 different crate/barrel/rock types
- 17 sprite textures using a 12 color palette
- Checkpoints can be captured for players to respawn there
- Multi layer procedurally generated parallax background
- Starfield simulation with moving stars, planets, and suns
- Particle systems for rain, snow, blood, explosions, weapons, water and more
- Native resolution rendering up to 1920x1200
- 11 different sound effects with [ZzFX](https://github.com/KilledByAPixel/ZzFX)
- Up to 4 player co-op with 4 gamepads!

# Engine Features
- Custom game engine written during the compo is separate from game code
- Super fast rendering system for up to 50,000 objects at 60 fps
- Physics engine for axis aligned bounding box rigid body dynamics
- Tile based rendering and collision system
- Particle effects system
- Input processing system for keyboard, mouse, gamepads, and touch
- Math library with Vector2, Color and Timer utility classes
- Audio with ZzFX has ability to attenuate sounds by distance
- Debug visualization system not in JS13K build. (press ~ to enter debug mode)

# Enemy Types
- Recruit (Green) - A bit shorter, more hesitant, takes only 1 hit
- Soldier (Blue) - Average height and ability, takes 2 hits
- Captain (Red) - Can climb walls and jumps more often, takes 3 hits
- Specialist (White) - Jumps and rolls often, they are ninjas, takes 4 hits
- Demolitions Expert (Purple) - Throws grenades and can't catch fire, takes 5 hits
- Small chance of a heavy weapons variation that has double health and fires full auto

# Object Types
- Plastic Crate (Brown) - Burns easily and breaks when fully burnt
- Metal Crate & Barrel (Gray) - Is hard to destroy, can't burn
- Water Barrel (Blue) - Puts out fires and pushes away objects
- Explosive Crate & Barrel (Green) - Burns and explodes after a few seconds
- High Explosive Barrel (Red) - Explodes quickly and much larger than normal explosives
- Rock (Color Varies) - Heavy and very hard to destroy, can't burn, can crush enemies
- Lava Rock (Glowing Red & Orange) - Anything that touches it is lit on fire

# Tools Used
- [Roadroller](https://github.com/lifthrasiir/roadroller)
- [Google Closure Compiler](https://github.com/google/closure-compiler)
- [UglifyJS](https://github.com/mishoo/UglifyJS)
- [Imagemin](https://github.com/imagemin/imagemin)
- [Efficient Compression Tool](https://github.com/fhanau/Efficient-Compression-Tool)
- [Advzip](https://www.npmjs.com/package/advzip-bin)
- [ZzFX](https://github.com/KilledByAPixel/ZzFX)

# How to build the 13k Zip
- Run engine\build\setupBuild.bat to install the necessary tools via npm
- You will need: google-closure-compiler, uglify, roadroller, imagemin-cli, and advzip
- Run engine\build\build.bat, to build app.zip which is the final result
- It will also create a file called index.min.html you can use for testing
- The zip size may vary by 20 bytes or so due to randomness of roadroller

