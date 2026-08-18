# 🌌 极光工具箱 (Aurora Toolbox)

> "In the void of binary, we weave the light."
> "于二进制的虚空中，我们编织光芒。"

一个基于现代 Web 技术构建的**模块化、高性能、隐私优先**的在线开发工具箱。采用独特的 **Aurora UI**（极光玻璃拟态）设计语言。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Static Web](https://img.shields.io/badge/architecture-Serverless%20Static-green.svg)

---

## ✨ 核心特性

| 特性 | 说明 |
|------|------|
| 🔒 **隐私优先** | Serverless 架构，所有数据在**浏览器本地**处理，绝不上传 |
| ⚡ **极致性能** | Web Workers 后台处理 + WebAssembly (Photon/Brotli/Hash-wasm) |
| 🛡️ **鲁棒架构** | 依赖全部本地化 `vendor/`（无 CDN），离线可用 |
| 🎨 **极光设计** | 玻璃拟态 (`backdrop-filter`) + CSS 变量主题系统 |
| 📱 **响应式** | 移动端适配，Flex 布局自动调整 |

---

## 🏗️ 系统架构

### 核心设计

```
index.html (应用壳 · 纯结构)
    ├── js/shell/                # 壳逻辑：core(路由+SW) / theme / offline / nav
    ├── css/shell/               # 壳样式：layout / modals
    └── iframe (tools/*.html)
            ├── js/theme-boot.js     # 首帧前应用持久化主题（杜绝切换闪烁）
            ├── js/app.js            # 核心 API + data-action 委派 + aurora-theme 通道
            ├── js/loader.js         # manifest 驱动：从 vendor/ 本地加载（无 CDN）
            ├── js/ui/               # 共享组件：icons / worker-rpc / file-drop / result-card
            ├── js/tools/            # 每工具逻辑
            ├── css/tools/           # 每工具样式（零内联）
            └── js/workers/          # Web Workers（统一 {type:'process',requestId} 协议）

主题传播：壳 → 工具 via postMessage('aurora-theme')，并持久化到 localStorage 供 theme-boot 预应用
依赖：第三方库全部本地化在 vendor/（清单 vendor/manifest.json，单文件 < 20MB）
```

### 目录结构

```
AURORA/
├── css/
│   ├── style.css            # 全局设计令牌 + 通用组件
│   ├── shell/               # 壳专用：layout / modals
│   └── tools/               # 每工具一 css（由内联 <style> 抽出）
├── js/
│   ├── app.js               # 核心应用 + data-action 委派 + aurora-theme 通道
│   ├── loader.js            # manifest 驱动：从 vendor/ 本地加载（无 CDN）
│   ├── shell/               # 壳逻辑：core(路由/SW) / theme / offline / nav
│   ├── ui/                  # 共享组件：worker-rpc / file-drop / result-card
│   ├── tools/               # 每工具一 js（由内联 <script> 抽出）
│   ├── utils/               # 仅剩 canvas-utils.js（worker-utils/drag-drop 死代码已清理）
│   ├── workers/             # Web Workers（统一 {type:'process',requestId} 协议）
│   └── perf-monitor.js / theme-data.js
├── tools/                   # 45 个独立工具页面（零内联 <style>/<script>/事件）
├── vendor/                  # 本地化第三方依赖 + manifest.json（单文件 < 20MB）
├── scripts/                 # 开发辅助脚本（非部署产物）
│   ├── gen-vendor-manifest.mjs / vendor-download.mjs / audit-actions.mjs / ...
├── index.html               # 应用壳（纯结构 + 引用）
└── sw.js                    # 离线缓存（v18：壳 + vendor 预缓存）
```

### 冒烟验收清单（重构回归用）

```bash
python -m http.server 8000     # 本地起服
```

1. 首页加载：导航/下拉/移动端抽屉/主题按钮/离线按钮可用
2. 主题：预设/知名站点/自定义/随机/崩坏 均生效且传播进工具 iframe
3. 离线：`vendor/manifest.json` 列出的库断网可用（含 fzstd 实现的 Zstd 压缩/解压）
4. 逐工具点验（45 个 `tools/*.html`），控制台 0 报错：
   - 图像类：image-convert / image-photon / image-phantom / image-hybrid / image-glitch / image-ascii / image-svg-* / image-crypto / image-gif / image-seeder ...
   - 文本类：text / transcode / format / diff / markdown / regex / encrypt / obfuscator
   - 文件类：file / file-encoding / file-qrcode / hash / qrcode / generator / datetime / unit
   - 网络类：network-ip / url / network-ping / network-rdap / network-github / network-epic
   - 服务类：developer-toolbox / hf-space-converter / ai-tts / ai-stt / ai-translate
5. Worker 工具：哈希/ASCII/故障/混合/幻影/加密/文件编码/SVG 追踪 跑通主线程降级路径
```

---

## 📦 工具列表

### 🖼️ 图像与视觉
- **格式与处理**：格式转换 | 图标制作 | 图片叠加 | 像素化 | 专业滤镜 (Photon)
- **绘制与 SVG**：简易画板 | SVG 画板 | SVG 优化 | SVG 矢量化
- **特效与动画**：GIF 合成 | 故障艺术 | ASCII 字符画
- **隐写与生成**：视觉加密 | 幻影坦克 | 混合图像 | 图种生成 | 趣味生成

### 📝 文本与编码
- **文本工具**：文本处理 | 文本转码 | 正则实验室 | Markdown | Diff 对比
- **代码与格式**：JSON/HTML/CSS/JS 格式化 | HTML 混淆
- **加解密**：AES/DES/RC4 对称加密

### 📁 文件与数据
- **文件处理**：文件管理 | 文件编码 (Base64/JSON, Brotli/Zstd/Gzip) | 文件二维码序列
- **数据工具**：哈希计算 | 二维码生成 | 密码/UUID 生成 | 时间戳换算 | 单位换算

### 🌐 网络与查询
IP 信息 | URL 解析 | 网络测试 | RDAP/Whois | GitHub 搜索 | Epic 免费游戏

### ⚙️ 开发与 AI
- **开发工具**：开发者工具箱 | Space 应用转换
- **AI 服务**：语音合成 (TTS) | 语音转文本 (STT) | 智能翻译

---

## 🔧 开发者指南

### 添加工具

**1. 创建工具文件** `tools/my-tool.html`

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的工具</title>
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/tools/my-tool.css">
    <script src="../js/theme-boot.js"></script>
    <script src="../js/ui/icons.js"></script>
</head>
<body class="scroll-content">
    <div class="layout-sidebar">
        <div class="controls panel">
            <h2>工具标题 <span class="ic" data-ic="zap"></span></h2>
            <!-- 控制面板 -->
        </div>
        <div class="preview-area">
            <!-- 预览区域 -->
        </div>
    </div>
    <script src="../js/loader.js"></script>
    <script src="../js/app.js"></script>
    <script src="../js/ui/worker-rpc.js"></script>  <!-- 用到 Worker 才加 -->
    <script src="../js/tools/my-tool.js"></script>
</body>
</html>
```

> 新工具**必须**：样式写进 `css/tools/my-tool.css`、逻辑写进 `js/tools/my-tool.js`（禁止内联 `<style>` / `<script>` / `onclick=`）；`<head>` 必须引 `theme-boot.js`（主题预应用）与 `icons.js`（SVG 图标）；图标用 `<span class="ic" data-ic="图标名"></span>`。

**2. 注册入口** 在 `index.html` 导航栏添加:

```html
<button class="tab-btn" data-src="tools/my-tool.html">我的工具</button>
```

### CSS 变量 (必须使用)

```css
--bg-deep      /* 深色背景 */
--bg-panel     /* 面板背景 */
--primary      /* 主色调 */
--secondary    /* 次色调 */
--text-main    /* 主要文字 */
--text-dim     /* 次要文字 */
--border       /* 边框 */
--radius-lg/md/sm
```

### 布局类

| 类名 | 用途 |
|------|------|
| `.scroll-content` | 页面主容器 |
| `.layout-sidebar` | 侧边栏 (左侧控制 350px) |
| `.layout-vertical` | 垂直堆叠 |
| `.layout-split` | 等分两栏 |
| `.workspace` | Flex Row，响应式转 Column |

### app.js API

```javascript
app.showToast(msg, type)      // Toast 提示 (type: 'success' | 'error')
app.copy(elementId)           // 复制元素值
app.clear(prefix)             // 清空 prefix-input/output
app.sanitizeHtml(html)        // XSS 净化
app.escapeHtml(text)          // HTML 转义
app.getWorker(url)            // 获取 Worker（旧 API，新代码用 WorkerRpc）
app.releaseWorker(url)       // 释放 Worker
app.action(name, fn)          // 注册 data-action 处理器（见下）
```

### 事件绑定规范（data-action 委派，禁止内联事件）

HTML 中**禁止** `onclick=` 等内联事件属性，统一使用委派：

```html
<button class="btn btn-primary" data-action="myTool.run" data-mode="encrypt">加密</button>
<button class="btn btn-icon" data-action="copy" data-copy-target="out-id">复制</button>
<button class="btn btn-icon" data-action="clear" data-clear-prefix="fmt">清空</button>
<button class="btn" data-action="file-click" data-file-target="file-input">选择文件</button>
```

- 工具 JS 末尾注册：`if (window.app && app.action) { app.action('myTool.run', function (el) { myTool.run(el.dataset.mode); }); }`
- 处理器签名 `fn(element, event)`；参数放 `data-*` 属性。
- 内置动作：`copy` / `clear` / `file-click` / `window-open`；`app.action` 注册优先，其次回退全局函数 `window[name]`。
- 委派监听 `click` / `change` / `input` 三类事件；`wheel`/`mousedown` 等特殊事件直接在工具 JS 里 `addEventListener`。

### 共享组件 (js/ui)

```javascript
// 统一上传区：点击 + 拖拽（拖入加 .drag-active/.drag-over）
Ui.fileDrop(zoneEl, { inputId: 'file-input', accept: 'image/*', multiple: true, dragClass: 'drag-over', onFiles: (files) => {...} });

// 标准结果卡片（含复制按钮）
Ui.appendResult(container, { title: '结果', rows: [['MD5', 'abc...'], ['SHA1', '...']] });

// Promise 化 Worker RPC（requestId 关联 + 超时）
const rpc = WorkerRpc.create('../js/workers/my.worker.js'); // 标准协议 {type:'process'}
const data = await rpc.call({ data: buffer }, [buffer]);    // resolve 响应体
rpc.terminate();
// 兼容旧 worker：WorkerRpc.create(url, { requestType: 'calc', nestRequestId: true, successTypes: ['result'] })
```

### 图标 (Icons)

UI 使用 SVG 图标（禁止 emoji），统一由 `js/ui/icons.js` 提供：

```html
<!-- HTML：写 span，icons.js 自动水合为 SVG（尺寸 1em 随上下文字号） -->
<span class="ic" data-ic="copy"></span>
```

```javascript
// JS 动态生成：直接取 SVG 字符串
el.innerHTML = (window.Ui && Ui.icon) ? Ui.icon('trash') : '';
```

图标名从 `js/ui/icons.js` 的 `Ui.ICONS` 中取（copy / close / trash / download / search / zap / gear / …）；如需新图标，往 `Ui.ICONS` 里加一个 24x24 描边 path 即可。

### Worker 开发

**Worker 消息格式（统一协议，新 worker 必须遵循）:**

```javascript
// 请求（由 WorkerRpc 自动附加 requestId）
{ type: 'process', requestId: '1', ...数据 }

// 响应 - 成功
{ type: 'success', requestId: '1', outputData: ArrayBuffer, width, height }

// 响应 - 错误
{ type: 'error', requestId: '1', error: '错误信息' }
```

**Buffer 转移:**
```javascript
rpc.call({ data: buffer }, [buffer]);  // WorkerRpc 内部 postMessage(msg, transfer)
```

**主线程降级 (必须实现):**
```javascript
try {
    const data = await rpc.call({ ... }, [buffer]);
} catch (e) {
    processMainThread(); // 降级处理（worker 失败时置 rpc=null 并回退）
}
```

### loader.js 依赖加载

```javascript
// 单库
ResourceLoader.load('jszip');

// 依赖组
ResourceLoader.loadDeps('@file-export'); // jszip + file-saver

// 工具声明式依赖
ResourceLoader.loadToolDeps('tools/my-tool.html');

// ESM 导入
const mod = await ResourceLoader.import('hash-wasm-esm');
```

**内置依赖组:**
- `@file-export`: jszip, file-saver
- `@beautify`: js-beautify 系列
- `@diff`: diff_match_patch, jsondiffpatch
- `@gif`: gif.js
- `@icons`: font-awesome
- `@opencc`: opencc-js

---

## 📐 代码规范

### 样式规范
- ❌ 禁止重定义 `.btn`, `.panel` 等全局组件
- ❌ 禁止 `body` 直接使用 `style="padding: ..."`，用 `.scroll-content`
- ✅ 工具特有样式写入 `css/tools/<工具>.css`（禁止内联 `<style>`）
- ✅ 使用 CSS 变量
- ❌ 禁止 UI 使用 emoji，统一 `data-ic` / `Ui.icon()` SVG 图标
- ✅ `style="..."` 属性仅允许：一次性布局（`flex:1`、`margin-top` 等）与功能显隐（`display:none` 由 JS 切换）
- ❌ `style="..."` 禁止：可复用的重复样式——必须抽成全局工具类（`.flex-1 / .w-100 / .btn-center / .text-dim / .text-secondary / .flex-between / .flex-col`）或工具 css
- 📌 现状：事件/脚本/`<style>` 块为零；剩余 `style` 属性为一次性布局与显隐（不违背上条）

### Toast 调用
```javascript
// ✅ 正确
if (app && app.showToast) app.showToast('完成');

// ❌ 错误 (冗余)
if (window.app && window.app.showToast) window.app.showToast('完成');
```

### 事件规范
- ❌ 禁止 `onclick=` / `onchange=` 等内联事件属性（HTML 与 JS 模板字符串内都不允许）
- ✅ 一律 `data-action` + `app.action` 注册（见上文"事件绑定规范"）
- ❌ 禁止 `new Function` / `eval`

### 路径规范
```html
<link rel="stylesheet" href="../css/style.css">
<script src="../js/app.js"></script>
```

### ID 命名
`id="qrcode-content"` `id="qrcode-canvas"` (前缀防冲突)

---

## 🚀 快速开始

```bash
# Python HTTP 服务器
python -m http.server 8000

# Node.js
npx serve .

# 访问 http://localhost:8000
```

---

> *Shine through the chaos.*
