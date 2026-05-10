# Aurora 工具箱编码规范

> 本规范旨在确保代码一致性、可维护性和团队协作效率。

---

## 一、HTML 规范

### 1.1 文档结构

所有工具页面必须遵循以下基本结构：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{工具名称} - Aurora Toolbox</title>
    <link rel="stylesheet" href="../css/style.css">
    <style>
        /* 仅定义工具特有样式 */
    </style>
</head>
<body class="scroll-content">
    <!-- 内容 -->
    <div id="toast" class="toast">操作成功</div>
    <script src="../js/app.js"></script>
    <script src="../js/loader.js"></script>
    <script>
        // 工具逻辑
    </script>
</body>
</html>
```

### 1.2 Body 类规范

- **必须** 添加 `scroll-content` 类
- 示例：`<body class="scroll-content">`

### 1.3 ID 命名规范

- 格式：`{tool-prefix}-{element}`
- 使用小写字母和连字符
- 示例：
  - `qrcode-text` (二维码工具的文本输入)
  - `hash-input` (哈希工具的输入)
  - `glitch-canvas` (故障艺术工具的画布)

### 1.4 布局容器选择

| 容器类 | 用途 | 特点 |
|--------|------|------|
| `.workspace` | 通用三栏布局 | 左侧控制面板 + 中间工具栏 + 右侧输出 |
| `.layout-sidebar` | 侧边栏布局 | 左侧控制面板(350px) + 右侧预览区 |
| `.layout-split` | 等分两栏 | 两个等宽面板 |
| `.layout-vertical` | 垂直堆叠 | 上下堆叠的面板 |

---

## 二、CSS 规范

### 2.1 禁止事项

❌ **禁止** 重定义以下全局组件：
- `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-danger`
- `.panel` / `.panel-header` / `.panel-title`
- `.upload-area` (使用 `.upload-zone` 替代)
- `.control-group` / `.control-section`

❌ **禁止** 在 body 上使用内联 style 设置 padding

❌ **禁止** 硬编码颜色值（应使用 CSS 变量）

### 2.2 必须使用 CSS 变量

```css
/* ✅ 正确 */
.my-component {
    background: var(--bg-panel);
    color: var(--text-main);
    border-color: var(--border);
}

/* ❌ 错误 */
.my-component {
    background: rgba(20, 25, 40, 0.65);
    color: #f1f5f9;
    border-color: rgba(255, 255, 255, 0.1);
}
```

### 2.3 工具特定样式命名

- 格式：`.tool-{name}-{component}`
- 示例：
  - `.tool-phantom-result-grid`
  - `.tool-glitch-frame-item`
  - `.tool-hash-algo-selector`

### 2.4 常用 CSS 变量

```css
/* 颜色 */
--bg-deep          /* 深色背景 */
--bg-panel         /* 面板背景 */
--primary          /* 主色调 (霓虹紫) */
--secondary        /* 次色调 (青色) */
--accent           /* 强调色 (粉色) */
--text-main        /* 主要文字 */
--text-dim         /* 次要文字 */
--border           /* 边框颜色 */

/* 尺寸 */
--radius-lg        /* 大圆角 (16px) */
--radius-md        /* 中圆角 (8px) */
--radius-sm        /* 小圆角 (4px) */

/* 字体 */
--font-main        /* 主字体 */
--font-mono        /* 等宽字体 */
```

---

## 三、JavaScript 规范

### 3.1 变量命名

- 使用 **camelCase** 命名变量和函数
- 使用 **UPPER_SNAKE_CASE** 命名常量
- 私有变量使用 `_` 前缀

```javascript
// ✅ 正确
const DEFAULT_SIZE = 1024;
let imageData = null;
this._worker = null;

// ❌ 错误
const default_size = 1024;
let ImageData = null;
```

### 3.2 工具模块结构

推荐使用对象字面量模式：

```javascript
/**
 * {工具名称} 工具模块
 * @description {工具描述}
 */
const myTool = {
    // 配置常量
    DEFAULT_VALUE: 100,

    // 状态变量
    _worker: null,
    _initialized: false,

    /**
     * 初始化工具
     */
    init: function() {
        this.bindEvents();
        this.initWorker();
        this._initialized = true;
    },

    /**
     * 绑定事件
     */
    bindEvents: function() {
        // 使用 addEventListener
        const btn = document.getElementById('mytool-process-btn');
        if (btn) {
            btn.addEventListener('click', this.process.bind(this));
        }
    },

    /**
     * 初始化 Worker
     */
    initWorker: function() {
        if (!window.Worker) return;
        this._worker = (app && app.getWorker)
            ? app.getWorker('../js/workers/mytool.worker.js')
            : new Worker('../js/workers/mytool.worker.js');

        if (this._worker) {
            this._worker.onmessage = this.handleWorkerMessage.bind(this);
        }
    },

    /**
     * 清理资源
     */
    destroy: function() {
        if (this._worker) {
            if (app && app.releaseWorker) {
                app.releaseWorker('../js/workers/mytool.worker.js');
            } else {
                this._worker.terminate();
            }
            this._worker = null;
        }
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    myTool.init();
});

// 清理
window.addEventListener('beforeunload', function() {
    myTool.destroy();
});
```

### 3.3 事件绑定

**推荐** 使用 `addEventListener`：

```javascript
// ✅ 推荐
const btn = document.getElementById('mytool-btn');
if (btn) {
    btn.addEventListener('click', handleClick);
}

// ⚠️ 可接受（现有代码保留）
<button onclick="myTool.process()">处理</button>

// ❌ 不推荐
document.getElementById('btn').onclick = handleClick;
```

### 3.4 Toast 调用

统一使用以下模式：

```javascript
// ✅ 标准写法
if (app && app.showToast) {
    app.showToast('操作成功', 'success');
}

// ✅ 错误提示
if (app && app.showToast) {
    app.showToast('操作失败: ' + error, 'error');
}

// ❌ 避免
app.showToast('消息');  // 可能报错
if (window.app && window.app.showToast) window.app.showToast('消息');  // 冗余
```

### 3.5 Worker 初始化

统一使用以下模式：

```javascript
// ✅ 标准写法（带降级）
this._worker = (app && app.getWorker)
    ? app.getWorker(workerUrl)
    : new Worker(workerUrl);

// Worker 消息处理
if (this._worker) {
    this._worker.onmessage = function(e) {
        const { type, outputData, error } = e.data;
        if (type === 'success') {
            // 处理成功
        } else if (type === 'error') {
            // 处理错误
        }
    };
}
```

### 3.6 错误处理

使用 try-catch 并提供友好提示：

```javascript
try {
    // 操作代码
    const result = processData(data);
    if (app && app.showToast) app.showToast('处理完成');
} catch (error) {
    console.error('[MyTool] Error:', error);
    if (app && app.showToast) {
        app.showToast('处理失败: ' + error.message, 'error');
    }
}
```

---

## 四、Worker 规范

### 4.1 消息格式

**请求消息**：
```javascript
{
    type: 'process',      // 操作类型
    requestId: 'uuid',    // 请求ID（可选）
    payload: { ... }      // 负载数据
}
```

**成功响应**：
```javascript
{
    type: 'success',      // 或 'complete'
    requestId: 'uuid',    // 对应请求ID
    outputData: ArrayBuffer,  // 图像数据
    width: number,
    height: number
}
```

**错误响应**：
```javascript
{
    type: 'error',
    requestId: 'uuid',
    error: '错误信息'
}
```

### 4.2 Buffer 转移

```javascript
// 主线程发送
worker.postMessage({ type: 'process', data: buffer }, [buffer]);

// Worker 返回
self.postMessage({ type: 'success', outputData: resultBuffer }, [resultBuffer]);
```

### 4.3 主线程降级

**必须** 实现主线程降级处理：

```javascript
if (this._worker) {
    this._worker.postMessage({ type: 'process', data: buffer }, [buffer]);
} else {
    this.processMainThread(data);  // 降级处理
}
```

---

## 五、文件组织

### 5.1 目录结构

```
AURORA/
├── css/
│   ├── style.css          # 全局样式
│   └── style.css          # 全局样式（含公共组件）
├── js/
│   ├── app.js             # 核心应用
│   ├── loader.js          # 资源加载器
│   ├── tool-helpers.js    # 工具辅助函数
│   └── workers/           # Web Workers
├── tools/                 # 工具页面
│   ├── image-*.html       # 图像工具
│   ├── text.html          # 文本工具
│   └── ...
├── docs/                  # 文档
│   ├── CODING_STANDARDS.md
│   ├── CONTRIBUTING.md
│   └── templates/
└── index.html             # 应用入口
```

### 5.2 文件命名

- 工具页面：`{category}-{name}.html`
  - 示例：`image-glitch.html`, `text.html`, `hash.html`
- Worker 文件：`{name}.worker.js`
  - 示例：`glitch.worker.js`, `hash.worker.js`

---

## 六、注释规范

### 6.1 文件头注释

```javascript
/**
 * {工具名称} 工具
 * @description {工具描述}
 * @author {作者}
 * @version {版本}
 */
```

### 6.2 函数注释

```javascript
/**
 * 处理图像数据
 * @param {ImageData} imageData - 图像数据
 * @param {Object} options - 处理选项
 * @param {number} options.threshold - 阈值
 * @returns {ImageData} 处理后的图像数据
 */
function processImage(imageData, options) {
    // ...
}
```

### 6.3 复杂逻辑注释

```javascript
// 使用棋盘格算法交替显示两张图片
// 偶数位置显示原图，奇数位置显示隐藏图
if ((x + y) % 2 === 0) {
    // 原图像素
} else {
    // 隐藏图像素
}
```

---

## 七、检查清单

开发新工具或修改现有工具时，请确保：

- [ ] HTML 结构符合规范
- [ ] body 包含 `scroll-content` 类
- [ ] ID 使用工具前缀命名
- [ ] 没有重定义全局组件样式
- [ ] 使用 CSS 变量而非硬编码颜色
- [ ] 使用 `addEventListener` 绑定事件
- [ ] Toast 调用使用标准模式
- [ ] Worker 初始化包含降级逻辑
- [ ] 添加了必要的注释
- [ ] 在桌面端和移动端测试通过
