# 极光工具箱 (Aurora Toolbox)

一个基于 Web 技术的现代、模块化、多功能开发工具箱。采用 **玻璃拟态 (Glassmorphism)** 设计风格，提供极光般的视觉体验与强大的实用功能。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Static](https://img.shields.io/badge/type-Static%20Web-green.svg)
![PWA](https://img.shields.io/badge/PWA-Supported-purple.svg)

## 🎨 设计理念

### 1. 视觉风格 (Aurora UI)
- **极光配色**: 深色背景 (`#0b0f19`) 搭配霓虹紫 (`#c084fc`) 与青色 (`#2dd4bf`) 的动态渐变光晕。
- **多主题支持**: 内置 **极光、赛博、深海、森林、日落、魔物、咖啡、黑白** 等多种预设，支持 **高对比度** 模式。
- **玻璃拟态**: 深度使用 `backdrop-filter: blur()`，打造通透的磨砂玻璃质感。
- **响应式设计**: 完美适配桌面端（分栏/网格）与移动端（流式/堆叠）。

### 2. 架构设计 (Modular Architecture)
- **纯静态 (Serverless)**: 无需后端数据库，所有逻辑均在浏览器端运行，安全且隐私。
- **多线程 (Web Workers)**: 图像处理、哈希计算、加密解密等高负载任务均迁移至后台线程 (`js/workers/`)，**UI 永不卡顿**。
- **按需加载 (Lazy Loading)**: 第三方库 (如 `crypto-js`, `ffmpeg.wasm`) 通过 `js/loader.js` 动态加载，首屏秒开。
- **PWA 支持**: 内置 `sw.js`，支持离线访问，可安装为桌面/手机原生应用体验。

## 💻 技术栈 (Tech Stack)

*   **核心**: 原生 HTML5, CSS3, JavaScript (ES6+), 无需构建工具。
*   **架构**:
    *   **Service Worker**: PWA 离线缓存与更新策略。
    *   **Web Workers**: 多线程并行计算。
    *   **Dynamic Loader**: 自研资源加载器，支持多源 CDN 故障切换。
*   **第三方库 (CDN 按需加载)**:
    *   `crypto-js`: 哈希/加密算法库。
    *   `lz-string`: 字符串压缩算法。
    *   `opencc-js`: 中文简繁体转换。
    *   `js-beautify`: 代码美化/格式化。
    *   `diff_match_patch`: 高性能文本差异比对。
    *   `jszip` / `fflate`: 文件压缩与解压 (Zip/Gzip)。
    *   `file-saver`: 浏览器端文件保存。
    *   `easyqrcodejs` / `qrcode`: 高级二维码生成与解析。
    *   `uuid`: 标准 UUID 生成。
    *   `punycode`: 国际域名转码。
    *   `mammoth`: Word 文档 (.docx) 解析。

---

## 🛠️ 功能模块

工具箱包含 **20+** 个独立工具，涵盖四大领域：

### 1. 图片与视觉 (Image & Visual)
*   **视觉加密 (Crypto)**: 
    *   **Gilbert Shuffle**: 基于混沌理论与空间填充曲线的像素置乱。
    *   **Visual Crypto**: 标准视觉加密 (Arithmetic) 与异或加密 (XOR)，生成视觉掩码与秘钥，**支持无损还原**。
    *   **Difference Separation**: 差值分离加密，支持参考图诱导与局部涂抹加密。
*   **视觉特效**:
    *   **故障艺术 (Glitch)**: 模拟电子信号故障、RGB 分离、扫描线效果 (Worker 加速)。
    *   **趣味图像 (Fun)**: 幻影坦克 (黑白背景变色)、混合图像 (远近错觉)。
    *   **像素化 & 字符画**: 图片转 Pixel Art 或 ASCII 文本。
    *   **图片叠加**: 支持多种图层混合模式 (Multiply, Screen, Overlay 等)。
*   **绘图与创作**:
    *   **SVG 画板**: 矢量绘图工具，支持书法笔触、喷枪与导出。
    *   **调色板**: 图片色板提取与像素绘制。
*   **格式工具**:
    *   **图片隐写 (Seeder)**: 将文件隐藏到图片中 (LSB/Append)。
    *   **格式转换**: 批量转换 PNG, JPG, WEBP, BMP, GIF。
    *   **Base64**: 图片与 Base64 互转。

### 2. 文本与代码 (Text & Code)
*   **正则测试 (Regex)**: 实时匹配高亮，内置交互式常用正则指南。
*   **代码格式化**: 支持 JSON, HTML, CSS, JS, XML, SQL 美化与压缩。
*   **文本处理**: 大小写转换、去重、去空、行合并、Snake/Camel 命名转换。
*   **文本对比 (Diff)**: 左右分栏代码/文本差异对比。
*   **全能转码**: URL, Base64, Unicode, HTML Entity, Hex, Punycode。
*   **Markdown**: 实时预览编辑器，支持 HTML 互转。
*   **HTML 混淆**: 代码加密与混淆保护。

### 3. 安全与加密 (Security)
*   **哈希计算**: MD5, SHA1/256/512, RIPEMD, HMAC (支持**大文件**流式计算)。
*   **传统加密**: AES, DES, RC4, Rabbit, 自定义映射加密。
*   **隐写术**: 零宽字符隐写 (Zero-width Steganography)。

### 4. 文件与工具 (File & Utils)
*   **文件处理**: ZIP 打包 (自定义压缩率), 文件转 Base64/JSON。
*   **二维码**: 
    *   **生成器**: 支持 Logo 嵌入、颜色/码眼自定义。
    *   **文件码**: 将文件内容切片转换为二维码序列。
*   **生成器**: 强密码生成, UUID (v1-v5) 生成。

---

## 📂 目录结构

```
AURORA/
├── index.html            # 主程序入口 (导航壳，PWA 注册)
├── sw.js                 # Service Worker (离线缓存策略)
├── .nojekyll             # GitHub Pages 兼容配置
├── css/
│   └── style.css         # 全局样式系统 (CSS Variables)
├── js/
│   ├── app.js            # 全局应用逻辑 (Toast, Tabs)
│   ├── loader.js         # 动态资源加载器
│   ├── utils/            # 通用工具库
│   │   ├── canvas-utils.js   # 画布处理 (OffscreenCanvas 兼容)
│   │   └── drag-drop.js      # 拖拽上传组件
│   └── workers/          # Web Workers (多线程核心)
│       ├── crypto.worker.js  # 视觉加密/解密
│       ├── hash.worker.js    # 文件哈希计算
│       ├── glitch.worker.js  # 故障艺术渲染
│       ├── hybrid.worker.js  # 混合图像合成
│       └── ...
└── tools/                # 独立工具页面 (可单独部署/运行)
    ├── home.html         # 仪表盘
    ├── image-crypto.html # 视觉加密工具
    ├── text.html         # 文本/正则工具
    ├── ... (其他 20+ 个工具文件)
```

---

## 🚀 部署指南

本项目为**纯静态网站 (Static Web App)**，无任何后端依赖，可部署至任意静态托管服务。

### 1. GitHub Pages (推荐)
本项目已针对 GitHub Pages 优化（包含 `.nojekyll`）。
1.  Fork 或 Push 本项目到 GitHub 仓库。
2.  进入仓库 **Settings** -> **Pages**。
3.  Source 选择 **Deploy from a branch** (如 `main`), 目录选择 `/ (root)`。
4.  保存即可，支持自定义域名。

### 2. Vercel / Netlify / Cloudflare Pages
这些平台提供更快的全球 CDN 加速。
1.  **Vercel**: 导入 GitHub 仓库 -> Framework Preset 选择 **Other** -> 点击 Deploy。
2.  **Netlify**: 拖拽 `AURORA` 文件夹到 Drop zone，或连接 Git 仓库。
3.  **配置**: Build Command 留空，Output Directory 设为 `.` (根目录)。

### 3. Docker / Nginx
适合私有化部署。
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
# 默认配置即可运行
```

### 4. 本地运行
无需安装任何环境，直接运行 `index.html` 即可。（注意：由于使用了 Service Worker，直接打开 `file:///` 协议会报错，需通过 HTTP 服务器访问）
或者使用 Python 快速启动本地服务器：
```bash
python -m http.server 8000
# 访问 http://localhost:8000
```

---

## 📦 开发说明

*   **新增工具**: 在 `tools/` 下新建 `.html` 文件，引用 `../css/style.css` 和 `../js/app.js` 即可获得统一的 UI 和功能支持。
*   **添加依赖**: 在 `js/loader.js` 中配置 CDN 地址，页面中调用 `app.loadLib('libName')` 即可。

---

*Created with ❤️ by Trae AI*
