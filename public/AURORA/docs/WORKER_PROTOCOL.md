# Worker 通信协议

本文档定义了 Aurora 工具箱中 Web Worker 的标准通信协议。

---

## 一、消息格式

### 1.1 请求消息

从主线程发送到 Worker：

```javascript
{
    type: 'process',        // 操作类型
    requestId: 'uuid',      // 请求ID（可选，用于异步响应匹配）
    payload: {              // 负载数据
        // 具体参数
    }
}
```

### 1.2 成功响应

从 Worker 返回到主线程：

```javascript
{
    type: 'success',        // 或 'complete'
    requestId: 'uuid',      // 对应请求ID（如有）
    
    // 图像处理特有字段
    outputData: ArrayBuffer,  // 输出数据
    width: number,            // 图像宽度
    height: number,           // 图像高度
    
    // 或通用数据字段
    data: { ... }             // 结果数据
}
```

### 1.3 错误响应

```javascript
{
    type: 'error',
    requestId: 'uuid',      // 对应请求ID（如有）
    error: '错误信息'        // 错误描述
}
```

### 1.4 进度消息

```javascript
{
    type: 'progress',
    requestId: 'uuid',      // 对应请求ID（如有）
    progress: 0.5           // 进度值 (0-1)
}
```

---

## 二、Buffer 转移

### 2.1 发送数据

使用 Transferable 对象提高性能：

```javascript
// 主线程发送
const buffer = imageData.data.buffer;
worker.postMessage(
    { type: 'process', data: buffer, width, height },
    [buffer]  // 转移所有权
);

// 发送后，原 buffer 将不可用
```

### 2.2 返回数据

```javascript
// Worker 返回
const resultBuffer = outputData.buffer;
self.postMessage(
    { type: 'success', outputData: resultBuffer, width, height },
    [resultBuffer]  // 转移所有权
);
```

---

## 三、Worker 模板

### 3.1 基本结构

```javascript
/**
 * {工具名称} Worker
 */

// 依赖加载（如需要）
let depsReady = Promise.resolve();
try {
    importScripts('../loader.js');
    if (typeof ResourceLoader !== 'undefined') {
        // depsReady = ResourceLoader.load('dependency-name');
    }
} catch (e) {
    console.error('[Worker] Dependency load failed:', e);
}

/**
 * 消息处理器
 */
self.onmessage = async function(e) {
    const { type, requestId, ...payload } = e.data;

    try {
        await depsReady;

        switch (type) {
            case 'process':
                await handleProcess(requestId, payload);
                break;
            default:
                sendError(requestId, `Unknown message type: ${type}`);
        }
    } catch (error) {
        sendError(requestId, error.message || 'Unknown error');
    }
};

/**
 * 处理主请求
 */
async function handleProcess(requestId, payload) {
    const { data, width, height, ...options } = payload;
    
    // 处理数据
    const result = processData(new Uint8ClampedArray(data), width, height, options);
    
    // 返回结果
    self.postMessage({
        type: 'success',
        requestId: requestId,
        outputData: result.buffer,
        width: width,
        height: height
    }, [result.buffer]);
}

/**
 * 发送错误响应
 */
function sendError(requestId, message) {
    self.postMessage({
        type: 'error',
        requestId: requestId,
        error: message
    });
}

/**
 * 发送进度更新
 */
function sendProgress(requestId, progress) {
    self.postMessage({
        type: 'progress',
        requestId: requestId,
        progress: Math.max(0, Math.min(1, progress))
    });
}

/**
 * 数据处理函数
 */
function processData(data, width, height, options) {
    const output = new Uint8ClampedArray(data.length);
    
    // 实现处理逻辑
    for (let i = 0; i < data.length; i += 4) {
        output[i] = data[i];     // R
        output[i + 1] = data[i + 1]; // G
        output[i + 2] = data[i + 2]; // B
        output[i + 3] = data[i + 3]; // A
    }
    
    return output;
}
```

---

## 四、主线程处理

### 4.1 初始化 Worker

```javascript
initWorker: function() {
    if (!window.Worker) return null;
    
    const workerUrl = '../js/workers/mytool.worker.js';
    
    try {
        this._worker = (app && app.getWorker)
            ? app.getWorker(workerUrl)
            : new Worker(workerUrl);
        
        if (this._worker) {
            this._worker.onmessage = this.handleWorkerMessage.bind(this);
            this._worker.onerror = this.handleWorkerError.bind(this);
        }
    } catch (e) {
        console.error('[Tool] Worker init failed:', e);
        this._worker = null;
    }
    
    return this._worker;
}
```

### 4.2 处理 Worker 消息

```javascript
handleWorkerMessage: function(e) {
    const { type, requestId, outputData, error, progress } = e.data;
    
    switch (type) {
        case 'success':
        case 'complete':
            this.handleSuccess(outputData, e.data.width, e.data.height);
            break;
        case 'error':
            this.handleError(error);
            break;
        case 'progress':
            this.handleProgress(progress);
            break;
    }
}
```

### 4.3 处理 Worker 错误

```javascript
handleWorkerError: function(e) {
    console.error('[Tool] Worker error:', e);
    if (app && app.showToast) {
        app.showToast('处理失败，请重试', 'error');
    }
    this._worker = null;
}
```

### 4.4 主线程降级

**必须** 实现主线程降级处理：

```javascript
process: function(data) {
    if (this._worker) {
        // 使用 Worker 处理
        const buffer = data.buffer;
        this._worker.postMessage(
            { type: 'process', data: buffer },
            [buffer]
        );
    } else {
        // 主线程降级处理
        this.processMainThread(data);
    }
}
```

---

## 五、常见操作类型

| type | 用途 | 参数 |
|------|------|------|
| `process` | 通用处理 | data, options |
| `init` | 初始化 | config |
| `abort` | 中止处理 | requestId |

---

## 六、最佳实践

### 6.1 错误处理

- Worker 内部使用 try-catch
- 发送详细的错误信息
- 主线程提供友好的错误提示

### 6.2 性能优化

- 使用 Transferable 对象
- 避免频繁的消息传递
- 大数据分块处理

### 6.3 资源清理

```javascript
// 主线程
destroy: function() {
    if (this._worker) {
        if (app && app.releaseWorker) {
            app.releaseWorker(workerUrl);
        } else {
            this._worker.terminate();
        }
        this._worker = null;
    }
}
```

---

## 七、完整示例

参考以下文件：
- Worker: `js/workers/phantom.worker.js`
- 主线程: `tools/image-phantom.html`
