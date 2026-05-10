/**
 * {工具名称} Worker
 * @description {Worker 描述}
 */

// ==================== 依赖加载 ====================

let depsReady = Promise.resolve();

try {
    // 如果需要加载依赖
    importScripts('../loader.js');
    
    if (typeof ResourceLoader !== 'undefined') {
        // 加载所需依赖
        // depsReady = ResourceLoader.load('dependency-name');
    }
} catch (e) {
    console.error('[{ToolName}Worker] Dependency load failed:', e);
}

// ==================== 工具函数 ====================

/**
 * 限制值在范围内
 * @param {number} value - 值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number}
 */
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

/**
 * 发送成功响应
 * @param {string} requestId - 请求ID
 * @param {Uint8ClampedArray} outputData - 输出数据
 * @param {number} width - 宽度
 * @param {number} height - 高度
 */
function sendSuccess(requestId, outputData, width, height) {
    self.postMessage({
        type: 'success',
        requestId: requestId,
        outputData: outputData.buffer,
        width: width,
        height: height
    }, [outputData.buffer]);
}

/**
 * 发送错误响应
 * @param {string} requestId - 请求ID
 * @param {string} message - 错误信息
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
 * @param {string} requestId - 请求ID
 * @param {number} progress - 进度值 (0-1)
 */
function sendProgress(requestId, progress) {
    self.postMessage({
        type: 'progress',
        requestId: requestId,
        progress: clamp(progress, 0, 1)
    });
}

// ==================== 核心处理函数 ====================

/**
 * 处理图像数据
 * @param {Uint8ClampedArray} data - 图像数据
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @param {Object} options - 处理选项
 * @returns {Uint8ClampedArray} 处理后的数据
 */
function processData(data, width, height, options) {
    const output = new Uint8ClampedArray(data.length);
    const threshold = options.threshold || 128;
    
    // 示例：二值化处理
    for (let i = 0; i < data.length; i += 4) {
        // 计算灰度值
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
        // 二值化
        const value = gray > threshold ? 255 : 0;
        
        output[i] = value;       // R
        output[i + 1] = value;   // G
        output[i + 2] = value;   // B
        output[i + 3] = data[i + 3]; // A (保持原透明度)
    }
    
    return output;
}

// ==================== 消息处理 ====================

/**
 * 处理 process 请求
 * @param {string} requestId - 请求ID
 * @param {Object} payload - 负载数据
 */
async function handleProcess(requestId, payload) {
    const { data, width, height, ...options } = payload;
    
    // 等待依赖加载
    await depsReady;
    
    // 转换数据
    const inputData = new Uint8ClampedArray(data);
    
    // 处理数据
    const outputData = processData(inputData, width, height, options);
    
    // 返回结果
    sendSuccess(requestId, outputData, width, height);
}

// ==================== 消息监听 ====================

self.onmessage = async function(e) {
    const { type, requestId, ...payload } = e.data;
    
    try {
        switch (type) {
            case 'process':
                await handleProcess(requestId || '', payload);
                break;
                
            case 'init':
                // 初始化处理（如需要）
                self.postMessage({ type: 'ready', requestId: requestId });
                break;
                
            case 'abort':
                // 中止处理（如需要）
                self.postMessage({ type: 'aborted', requestId: requestId });
                break;
                
            default:
                sendError(requestId, `Unknown message type: ${type}`);
        }
    } catch (error) {
        console.error('[{ToolName}Worker] Error:', error);
        sendError(requestId, error.message || 'Unknown error');
    }
};

// ==================== 错误处理 ====================

self.onerror = function(e) {
    console.error('[{ToolName}Worker] Uncaught error:', e);
};

// ==================== 就绪通知 ====================

// 通知主线程 Worker 已准备好
self.postMessage({ type: 'ready' });
