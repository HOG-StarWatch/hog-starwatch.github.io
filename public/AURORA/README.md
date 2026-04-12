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
| 🛡️ **鲁棒架构** | 多源 CDN 自动故障切换 (Cloudflare → jsDelivr → Unpkg) |
| 🎨 **极光设计** | 玻璃拟态 (`backdrop-filter`) + CSS 变量主题系统 |
| 📱 **响应式** | 移动端适配，Flex 布局自动调整 |

---

## 🏗️ 系统架构

### 核心设计

```
index.html (应用壳)
    ├── 导航栏 + 主题切换
    └── iframe (tools/*.html)
            ├── js/app.js       (核心应用)
            ├── js/loader.js    (资源加载)
            └── js/utils/*.js   (工具库)
```

### 目录结构

```
AURORA/
├── css/style.css          # 全局样式、CSS 变量
├── js/
│   ├── app.js              # 核心应用 (Toast/Worker/Copy/Sanitize)
│   ├── loader.js           # 多源 CDN 加载器
│   ├── perf-monitor.js     # 性能监控
│   ├── theme-data.js       # 主题数据
│   ├── utils/
│   │   ├── canvas-utils.js # Canvas 操作封装
│   │   ├── drag-drop.js     # 拖拽文件处理
│   │   └── worker-utils.js  # Worker 通信封装
│   └── workers/            # Web Workers
│       ├── ascii.worker.js
│       ├── crypto.worker.js
│       ├── glitch.worker.js
│       ├── hybrid.worker.js
│       ├── phantom.worker.js
│       └── ...
├── tools/                  # 40+ 独立工具页面
├── index.html              # 应用壳
└── sw.js                   # 离线缓存
```

---

## 📦 工具列表

### 🖼️ 图像与视觉
PNG/JPG/WEBP 互转 | SVG 矢量化 | GIF 合成 | 像素化 | 故障艺术 | ASCII 字符画 | 视觉特效 | **幻影坦克** | **混合图像** | 图种生成

### 📝 文本与编码
文本处理 | Base64/URL/Hex/Unicode 转码 | JSON/HTML/CSS/JS 格式化 | Diff 对比 | Markdown 预览 | AES/DES/RC4 加密 | HTML 混淆

### 📁 文件与数据
文件编码 (Base64/JSON) | Brotli/Zstd/Gzip 压缩 | 大文件哈希 | 二维码生成 | 时间戳换算 | 密码/UUID 生成

### 🌐 网络与查询
IP 信息 | URL 解析 | 网络测试 | RDAP/Whois | GitHub 搜索 | Epic 免费游戏

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
</head>
<body class="scroll-content">
    <div class="layout-sidebar">
        <div class="controls panel">
            <h2>工具标题</h2>
            <!-- 控制面板 -->
        </div>
        <div class="preview-area">
            <!-- 预览区域 -->
        </div>
    </div>
    <script src="../js/app.js"></script>
    <script>
        // 工具逻辑
    </script>
</body>
</html>
```

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
app.getWorker(url)            // 获取 Worker
app.releaseWorker(url)       // 释放 Worker
```

### Worker 开发

**Worker 消息格式:**

```javascript
// 请求
{ type: 'process', ...数据 }

// 响应 - 成功
{ type: 'success' | 'complete', outputData: ArrayBuffer, width, height }

// 响应 - 错误
{ type: 'error', error: '错误信息' }
```

**Buffer 转移:**
```javascript
worker.postMessage({ type: 'process', data: buffer }, [buffer]);
```

**主线程降级 (必须实现):**
```javascript
if (worker) {
    worker.postMessage({ type: 'process', ... }, [buffer]);
} else {
    processMainThread(); // 降级处理
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
- ✅ 仅在 `<style>` 写工具特有样式
- ✅ 使用 CSS 变量

### Toast 调用
```javascript
// ✅ 正确
if (app && app.showToast) app.showToast('完成');

// ❌ 错误 (冗余)
if (window.app && window.app.showToast) window.app.showToast('完成');
```

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
