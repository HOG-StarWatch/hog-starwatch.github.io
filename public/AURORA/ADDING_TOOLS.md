# 极光工具箱 (Aurora Toolbox) - 添加工具指南

本文档旨在帮助开发者理解项目架构，并指导如何添加新的工具模块。

## 1. 项目架构概览

本项目采用 **Shell + Iframe** 的架构模式：
*   **Shell (`index.html`)**: 负责全局导航、主题切换、移动端适配以及加载工具容器 (`iframe`)。
*   **Tools (`tools/*.html`)**: 每个工具都是一个独立的 HTML 文件，运行在 iframe 中。
*   **Shared Assets**:
    *   `css/style.css`: 全局样式定义、CSS 变量（主题系统）。
    *   `js/app.js`: 核心应用逻辑（Toast 提示、复制功能、HTML 净化等）。
    *   `js/loader.js`: 第三方库加载器（支持多源 CDN 降级）。
    *   `js/utils/`: 专用工具库（如 `canvas-utils.js`）。

## 2. 添加新工具步骤

1.  **创建工具文件**: 在 `tools/` 目录下创建一个新的 HTML 文件（例如 `tools/my-tool.html`）。
2.  **应用基础模板**: 复制下方的[文件结构模板](#3-文件结构模板)，并修改标题和内容。
3.  **实现功能**: 编写工具特定的 HTML 结构和 JavaScript 逻辑。
4.  **注册入口**: 打开根目录下的 `index.html`，在合适的 `<div class="dropdown-content">` 中添加按钮：
    ```html
    <button class="tab-btn" data-src="tools/my-tool.html">我的新工具</button>
    ```

## 3. 文件结构模板

每个工具文件应包含以下基础结构：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>工具名称</title>
    <!-- 引入全局样式 -->
    <link rel="stylesheet" href="../css/style.css">
</head>
<body class="scroll-content">
    <!-- 工作区容器 -->
    <div class="workspace">
        
        <!-- 面板组件 -->
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title">输入区域</div>
                <div class="panel-actions">
                    <button class="btn btn-icon" onclick="app.clear('mytool')">清空</button>
                </div>
            </div>
            
            <div style="padding: 1rem;">
                <!-- 输入控件 -->
                <textarea id="mytool-input" class="full-width" placeholder="在此输入..."></textarea>
            </div>
        </div>

        <!-- 操作栏 -->
        <div class="toolbar">
            <button class="btn btn-primary" onclick="myTool.process()">执行操作</button>
        </div>

        <!-- 结果面板 -->
        <div class="panel">
            <div class="panel-header">
                <div class="panel-title">结果</div>
                <div class="panel-actions">
                    <button class="btn btn-icon btn-secondary" onclick="app.copy('mytool-output')">复制</button>
                </div>
            </div>
            <textarea id="mytool-output" readonly placeholder="结果..."></textarea>
        </div>

    </div>

    <!-- 引入核心库 -->
    <script src="../js/app.js"></script>
    <!-- 如果需要加载第三方库 -->
    <!-- <script src="../js/loader.js"></script> -->

    <script>
        const myTool = {
            process: function() {
                const input = document.getElementById('mytool-input').value;
                if (!input) {
                    app.showToast('请输入内容', 'error');
                    return;
                }
                
                // 处理逻辑
                const result = "处理后的: " + input;
                
                document.getElementById('mytool-output').value = result;
                app.showToast('处理完成');
            }
        };
    </script>
</body>
</html>
```

## 4. 可复用组件库

### 4.1 CSS 变量 (Theming)
项目使用 CSS 变量实现主题切换，请务必使用变量而非硬编码颜色：

*   `--bg-deep`: 深色背景（页面底色）
*   `--bg-panel`: 面板背景（半透明）
*   `--primary`: 主色调（紫色系）
*   `--secondary`: 次色调（青色系）
*   `--text-main`: 主要文字颜色
*   `--text-dim`: 次要/提示文字颜色
*   `--border`: 边框颜色
*   `--radius-md`: 标准圆角 (8px)

### 4.2 常用 UI 类 (CSS)

**布局类**
*   `.scroll-content`: 用于 `<body>`，提供标准内边距和滚动条样式。
*   `.workspace`: 主工作区容器，Flex 布局 (Row)，响应式自动转 Column。
*   `.layout-vertical`: 垂直堆叠布局容器。
*   `.layout-sidebar`: 侧边栏布局 (左侧控制 350px，右侧自适应)。
*   `.layout-split`: 等分两栏布局 (常用于对比/转换)。

**面板与容器**
*   `.panel`: 标准卡片容器，带有模糊背景和边框。
*   `.panel-header`: 面板头部，包含标题和操作区。
*   `.panel-title`: 标题文本样式。
*   `.panel-actions`: 头部右侧操作按钮容器。
*   `.controls`: 侧边栏控制面板样式。
*   `.preview-area`: 预览区域容器 (居中、深色背景)。

**按钮组件**
*   `.btn`: 基础按钮样式。
*   `.btn-primary`: 主操作按钮 (高亮色)。
*   `.btn-secondary`: 次要操作按钮。
*   `.btn-danger`: 危险操作按钮 (红色)。
*   `.btn-icon`: 图标按钮 (紧凑)。
*   `.tab-btn`: 标签页按钮。

**表单与输入**
*   `.input-group`: 组合输入框容器。
*   `.input-row`: 标签与输入框横向排列容器。
*   `.upload-area`: 文件上传区域 (支持拖拽样式)。
*   `.checkbox-group`: 复选框组容器。
*   `input`, `textarea`, `select`: 全局默认样式已覆盖，无需额外类名。

**其他组件**
*   `.sub-tab-group` / `.sub-tab`: 页面内部二级标签页切换。
*   `.toast`: 全局轻提示组件。
*   `.spinner`: 加载中旋转动画。
*   `.stat-badge`: 统计信息小徽章。

### 4.3 核心 JS API (`window.app`)
所有工具页面引入 `js/app.js` 后即可使用 `app` 对象：

**交互反馈**
*   `app.showToast(msg, type)`: 显示轻提示。`type` 可选 'success' (默认) 或 'error'。
*   `app.copy(elementId)`: 复制指定 ID 元素的值到剪贴板。

**DOM 操作**
*   `app.clear(prefix)`: 清空 `${prefix}-input` 和 `${prefix}-output` 的值。
*   `app.sanitizeHtml(html)`: 防 XSS 的 HTML 净化。
*   `app.escapeHtml(text)`: 简单的 HTML 转义。

**Worker 管理**
*   `app.getWorker(url)`: 获取或创建 Shared Worker (复用 Worker 实例)。
*   `app.releaseWorker(url)`: 销毁指定 Worker。

### 4.4 图像处理工具 (`CanvasUtils`)
引入 `js/utils/canvas-utils.js` 后可用：

*   `CanvasUtils.loadImage(file)`: 将 File 对象转为 Image 对象 (Promise)。
*   `CanvasUtils.getImageData(source)`: 获取像素数据。
*   `CanvasUtils.pixelsToDataURL(data, width, height)`: 像素数据转 DataURL。
*   `CanvasUtils.download(url, filename)`: 触发文件下载。

## 5. 代码统一性规范

1.  **样式复用**: 
    *   **严禁**在工具内部重新定义 `.btn`, `.panel`, `.upload-area` 等全局组件样式。
    *   **严禁**在 `body` 标签上直接使用 `style="padding: ..."`，请统一使用 `<body class="scroll-content">`。
    *   仅在 `<style>` 标签中编写工具特有的、无法复用的样式。
2.  **路径引用**: 始终使用相对路径引用资源（例如 `../css/style.css`），因为工具位于 `tools/` 子目录。
3.  **ID 命名**: 建议使用工具名称作为前缀，防止潜在冲突（尽管 iframe 提供了隔离，但保持规范是个好习惯），例如 `id="json-input"`, `id="json-output"`。
4.  **响应式设计**: 确保界面在移动端 (`max-width: 600px`) 下可用。`.workspace` 默认使用 Flex 布局，在小屏幕下可能需要调整方向。
5.  **错误处理**: 操作失败时使用 `app.showToast('错误信息', 'error')` 提示用户。
