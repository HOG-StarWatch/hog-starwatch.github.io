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

本项目包含 **40+** 个独立工具，覆盖开发、设计、网络、数据处理等多个场景：

### 🖼️ 图像与视觉 (Image & Visual)
*   **格式转换**: PNG/JPG/WEBP/BMP/GIF 互转。
*   **SVG 矢量化**: 位图转 SVG 矢量。
*   **GIF 合成**: 多图合成 GIF，支持帧率与质量设置。
*   **SVG 画板**: 矢量绘图与风格生成。
*   **SVG 优化**: 体积压缩与结构优化。
*   **简易画板**: 轻量绘图与笔刷控制。
*   **图片叠加**: 多图层混合与叠加。
*   **专业滤镜 (Photon)**: Wasm 图像处理与效果滤镜。
*   **像素化**: 马赛克/像素效果。
*   **故障艺术**: RGB 分离与扫描线效果。
*   **字符画**: 图片转 ASCII 文本艺术。
*   **视觉特效库**: 多种视觉风格与特效组合。
*   **视觉加密**: 图像拆分与视觉加密方案。
*   **幻影坦克**: 双图隐写与对比显示。
*   **混合图像**: 远近视觉错觉合成。
*   **图种生成**: 文件追加隐藏到图片。

### 📝 文本与编码 (Text & Encoding)
*   **文本处理**: 清洗、去重、格式化与正则测试。
*   **文本转码**: Base64/URL/Hex/Unicode 等。
*   **代码格式化**: JSON/HTML/CSS/JS 等。
*   **文本对比 (Diff)**: 左右差异对比。
*   **Markdown**: 实时预览与渲染。
*   **对称加密**: AES/DES/RC4 等。
*   **HTML 混淆**: 代码压缩与混淆。

### 📁 文件与数据 (File & Data)
*   **文件管理**: 基础文件处理与转换。
*   **文件编码**: 文件转 Base64/JSON，支持 Brotli/Zstd/Gzip。
*   **文件二维码序列**: 大文件切片二维码编码。
*   **时间工具**: 时间戳与格式化工具。
*   **单位换算**: 常见单位与数值转换。
*   **哈希计算**: MD5/SHA/HMAC 等，支持大文件。
*   **数据生成器**: 密码与 UUID 生成。
*   **二维码生成**: 高级二维码自定义生成。

### 🌐 网络与查询 (Network & Lookup)
*   **IP 信息查询**: 公网 IP 与地理信息。
*   **URL 解析器**: URL 结构解析与拆解。
*   **网络测试**: 延迟与连通性测试。
*   **RDAP/Whois 查询**: 域名与 IP 注册信息。
*   **GitHub 搜索**: 仓库与趋势查询。
*   **Epic 免费游戏**: 当前免费游戏信息查询。

### 🤖 AI 与语音 (AI & Speech)
*   **语音合成 (TTS)**: 基于 Web Speech API 的本地朗读。

---

## 🏗️ 技术架构 (Architecture)

```mermaid
graph TD
    User[用户浏览器] --> Index[index.html (应用壳)]
    Index --> App[js/app.js (导航与状态)]
    Index --> Loader[js/loader.js (资源加载器)]
    Index --> Frame[iframe 工具页]

    subgraph "资源与依赖"
        Loader --> CDN1[Cloudflare CDNJS]
        Loader --> CDN2[jsDelivr]
        Loader --> CDN3[Unpkg]
        Loader --> CDN4[其他 (Elemecdn/BootCDN...)]
    end

    subgraph "计算加速"
        App --> WorkerPool[Web Workers 池]
        WorkerPool --> FileWorker[js/workers/file-enc.worker.js]
        WorkerPool --> ImageWorker[js/workers/glitch.worker.js]
        WorkerPool --> CryptoWorker[js/workers/crypto.worker.js]
        WorkerPool --> Wasm[Brotli/Zstd/Photon Wasm]
    end

    subgraph "界面与离线"
        Index --> Style[css/style.css (全局样式)]
        Index --> SW[sw.js (离线缓存)]
    end
```

*   **应用壳**: `index.html` 负责导航与主题，工具页以 iframe 加载并按需切换。
*   **资源加载**: `loader.js` 以 Cloudflare CDNJS → jsDelivr → Unpkg → 其他镜像 的优先级加载，并自动降级切换。
*   **性能加速**: `app.js` 管理 Worker 池与任务分发，Wasm 用于压缩/图像等高耗时计算。
*   **离线能力**: `sw.js` 预缓存应用壳与常用资源，提升离线访问体验。

---

## 🗂️ 项目结构 (Project Structure)

```
AURORA/
├── css/                # 全局样式与组件体系
│   └── style.css       # 主题变量、组件与布局样式
├── js/                 # 核心逻辑与基础设施
│   ├── workers/        # 计算密集型任务 Worker
│   ├── utils/          # 通用工具函数
│   ├── app.js          # 导航/主题/Worker 管理
│   └── loader.js       # 多源 CDN 依赖加载器
├── tools/              # 独立工具页面
│   ├── image-*.html    # 图像与视觉类工具
│   ├── network-*.html  # 网络与查询类工具
│   ├── file-*.html     # 文件与数据类工具
│   ├── ai-*.html       # AI 与语音类工具
│   └── ...             # 其他工具
├── index.html          # 应用壳与导航入口
└── sw.js               # 离线缓存与资源预取
```

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

**使用任意本地 HTTP 服务器均可。**

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
3.  使用 ResourceLoader 统一加载依赖（脚本/样式/ESM/Worker）：
    - 页面脚本依赖：
      ```html
      <script>
      // 加载单库
      ResourceLoader.load('easyqrcodejs');
      // 或按组加载（推荐）
      ResourceLoader.loadDeps('@file-export'); // jszip + file-saver
      </script>
      ```
    - 工具页声明式依赖（推荐）：
      在 `js/loader.js` 的 `toolDeps` 中为你的工具添加依赖映射，然后：
      ```html
      <script>
      ResourceLoader.loadToolDeps('tools/my-tool.html');
      </script>
      ```
    - 加载 ESM 模块（如 Wasm glue）：
      ```js
      const mod = await ResourceLoader.import('hash-wasm-esm');
      // 使用 mod 导出的 API
      ```
    - 在 Web Worker 中加载依赖：
      ```js
      // worker.js
      importScripts('../loader.js');
      const ready = ResourceLoader.load('crypto-js');
      self.onmessage = async (e) => {
        await ready; // 确保依赖就绪再处理任务
        // ... 执行计算
      };
      ```
4.  在 `index.html` 的导航栏中添加入口链接。

---

*Created with ❤️ by StarWatch*
