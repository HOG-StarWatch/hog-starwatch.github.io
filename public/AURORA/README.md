# 🌌 极光工具箱 (Aurora Toolbox)

一个基于现代 Web 技术构建的**模块化、高性能、隐私优先**的在线开发工具箱。采用独特的 **Aurora UI**（极光玻璃拟态）设计语言，提供流畅的视觉体验与强大的实用功能。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Static Web](https://img.shields.io/badge/architecture-Serverless%20Static-green.svg)
![PWA](https://img.shields.io/badge/PWA-Supported-purple.svg)
![Wasm](https://img.shields.io/badge/Wasm-Powered-orange.svg)

## ✨ 核心亮点 (Core Features)

*   **🔒 隐私优先 (Privacy First)**: 坚持 **Serverless** 架构，所有数据处理（加密、压缩、图片编辑）均在**浏览器本地**完成，绝不上传至服务器，确保数据绝对安全。
*   **⚡ 极致性能 (High Performance)**:
    *   **Web Workers**: 密集型任务（如大文件哈希、图片渲染、文件压缩）自动调度至后台线程，确保 UI 界面始终丝般顺滑。
    *   **WebAssembly (Wasm)**: 集成 `Photon` (Rust), `Brotli`, `Hash-wasm` 等 Wasm 模块，提供接近原生的处理速度。
*   **🛡️ 鲁棒架构 (Resilience)**: 自研 **ResourceLoader** 资源加载器，支持多源 CDN (jsDelivr, Unpkg, Cloudflare 等) 自动故障切换，确保在全球网络环境下均能稳定运行。~~他妈的想出这个翻译的真是神人~~
*   **🎨 极光设计 (Aurora Design)**: 全局统一的 CSS 变量系统，深度应用玻璃拟态 (`backdrop-filter`) 与动态渐变，支持深色模式与响应式布局（桌面端完美适配）。

---

## 🛠️ 功能清单 (Tool List)

本项目包含 **30+** 个独立工具，覆盖开发、设计、网络、运维等多个场景：

### 🖼️ 图像与视觉 (Image & Visual)
*   **高性能滤镜 (Photon)**: 基于 Rust/Wasm 的专业级图像处理（降噪、锐化、边缘检测、滤镜），支持 JS 自动降级。
*   **视觉加密 (Crypto)**:
    *   **Visual Crypto**: 视觉密码术（将图片拆分为两个噪点图层）。
    *   **Difference Separation**: 差值分离隐写术。
    *   **Gilbert Shuffle**: 基于希尔伯特曲线的像素置乱加密。
*   **特效渲染**:
    *   **故障艺术 (Glitch)**: 模拟电子信号故障、RGB 分离、扫描线效果。
    *   **字符画 (ASCII)**: 图片转 ASCII 文本艺术 (Worker 加速)。
    *   **幻影坦克 (Phantom)**: 制作在黑白背景下显示不同画面的双重图片。
    *   **混合图像 (Hybrid)**: 制作远看和近看显示不同内容的视觉错觉图。
*   **绘图与编辑**:
    *   **SVG 画板**: 矢量绘图工具，内置 **随机艺术生成器**（支持 15 种风格如流光、电路、星空、迷宫等）。
    *   **交互式画板**: 简易绘图板，支持自定义笔刷颜色与画布操作。
    *   **图片叠加 (Overlay)**: 支持多种图层混合模式。
    *   **像素化 (Pixel)**: 图片像素化/马赛克处理。
    *   **GIF 制作**: 多图合成 GIF，支持调节帧率、质量、循环模式及透明背景。
    *   **图种生成 (Seeder)**: 将文件隐藏追加到图片末尾。
    *   **格式转换**: 支持 PNG, JPG, WEBP, BMP, GIF 互转。

### 🌐 网络工具 (Network Tools)
*   **连通性测试 (Ping)**: 可视化网络延迟测试、网站可用性检测、实时网速仪表盘。
*   **IP 信息查询**: 查询本机公网 IP、地理位置及 ISP 信息。
*   **GitHub 探索者**: 快速浏览 GitHub 热门项目、趋势榜单与仓库搜索。
*   **Epic 喜加一**: 实时查询 Epic Games Store 当前免费领取的游戏。
*   **RDAP/Whois**: 域名与 IP 注册信息深度查询。

### 📝 文本与代码 (Text & Code)
*   **Markdown 编辑器**: 实时预览，支持 Wasm 高速渲染。
*   **数据生成**:
    *   **强密码生成器**: 支持自定义字符集、批量生成。
    *   **UUID 生成器**: 支持 v1 (时间戳), v3 (MD5), v4 (随机), v5 (SHA-1) 版本。
*   **代码工具**:
    *   **Diff 对比**: 左右分栏文本/代码差异对比。
    *   **格式化 (Format)**: JSON, HTML, CSS, JS, SQL, XML 美化。
    *   **HTML 混淆**: 代码保护与压缩。
*   **文本处理**: 正则表达式测试、全能转码 (Base64/URL/Hex/Unicode)、文本清洗。

### 🔐 安全与文件 (Security & File)
*   **文件处理**:
    *   **文件编码**: 文件转 Base64/JSON，支持 **Brotli/Zstd/Gzip** 压缩 (Wasm/Worker)。
    *   **ZIP 打包**: 纯前端文件打包与解压。
    *   **文件码**: 将文件切片转换为高密度二维码序列。
*   **哈希计算**: 支持 MD5, SHA1/256/512, HMAC 等，支持 **GB 级大文件**流式计算。
*   **传统加密**: AES, DES, RC4 等对称加密工具。
*   **二维码**: 高级二维码生成（支持 Logo、颜色自定义）与解析。

---

## 🏗️ 技术架构 (Architecture)

```mermaid
graph TD
    User[用户 Browser] --> Index[index.html (App Shell)]
    Index --> Loader[js/loader.js (Resource Manager)]
    
    subgraph "Core Infrastructure"
        Loader --> |Load| CDN1[jsDelivr]
        Loader --> |Fallback| CDN2[Unpkg]
        Loader --> |Fallback| CDN3[Elemecdn]
        
        Index --> WorkerPool[Web Workers Pool]
        WorkerPool --> FileWorker[file-enc.worker.js]
        WorkerPool --> ImageWorker[hybrid/glitch.worker.js]
        WorkerPool --> CryptoWorker[hash/crypto.worker.js]
    end
    
    subgraph "Wasm Modules"
        FileWorker --> Brotli[Brotli Wasm]
        FileWorker --> Zstd[Zstd Wasm]
        Index --> Photon[Photon Wasm]
    end
    
    subgraph "UI System"
        Index --> Style[css/style.css]
        Style --> Components[Buttons/Panels/Inputs]
        Index --> PWA[Service Worker (Offline)]
    end
```

*   **Loader**: 实现了基于 Promise 的多源竞争与降级加载策略，解决了静态页面依赖第三方 CDN 不稳定的痛点。
*   **Worker**: 采用 `postMessage` 通信，支持 `Transferable Objects` (ArrayBuffer) 以实现零拷贝数据传输，大幅提升大文件处理效率。
*   **UI**: 手搓自研 纯 CSS 实现，无任何 UI 框架依赖，轻量且易于定制。

---

## 🚀 快速开始 (Quick Start)

### 1. 在线访问 (推荐)
直接访问部署好的 GitHub Pages 地址。
~~自用项目 移动端适配不能说没有 但也只是不能说没有~~

### 2. 本地运行
由于项目使用了 **Service Worker** 和 **ES Modules** 以及模块化设计，直接双击 `index.html` 无法正常运行。请使用本地 HTTP 服务器：

**使用 Python 启动本地 HTTP 服务器:**
```bash
# 在项目根目录下运行
python -m http.server 8000
# 然后访问 http://localhost:8000
```

**使用 Node.js 启动本地 HTTP 服务器:**
```bash
npx http-server .
```

### 3. Docker 部署
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
```

---

## 🤝 贡献指南 (Contributing)

欢迎提交 PR！添加新工具非常简单：

1.  在 `tools/` 目录下创建一个新的 `.html` 文件。
2.  引入核心依赖：
    ```html
    <link rel="stylesheet" href="../css/style.css">
    <script src="../js/app.js"></script>
    <script src="../js/loader.js"></script>
    ```
3.  使用 `ResourceLoader.load('libName')` 加载所需库。
4.  在 `index.html` 的导航栏中添加入口链接。

---

*Created with ❤️ by StarWatch*