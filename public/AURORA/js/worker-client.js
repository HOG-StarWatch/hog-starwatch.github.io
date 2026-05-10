/**
 * Aurora Toolbox - WorkerClient
 * 统一的 Worker 通信层，为所有自定义 Worker 提供 Promise 化的 API。
 *
 * 支持的 Worker 类型:
 *   phantom, hybrid, glitch, ascii, hash, crypto, file-enc, svg-tracer
 *
 * 特性:
 *   - Promise 化的 send() 接口，自动生成 requestId 进行消息匹配
 *   - 自动识别多种响应格式（success/error/status/type/progress）
 *   - 可配置超时（默认 30 秒）
 *   - 与 app.getWorker / app.releaseWorker 集成，也可独立使用
 *   - 事件发射器支持 'message'、'error'、'progress' 事件
 *   - 暴露为 window.WorkerClient 供全局使用
 *
 * @example
 *   // 基本用法
 *   const client = WorkerClient.create('js/workers/phantom.worker.js');
 *   const result = await client.send({ cmd: 'process', imageData: data }, { timeout: 60000 });
 *   client.destroy();
 *
 * @example
 *   // 带进度回调
 *   const client = WorkerClient.create('js/workers/file-enc.worker.js');
 *   const result = await client.send(
 *     { id: 'enc-1', action: 'encrypt', payload: data },
 *     { onProgress: (chunk) => console.log('chunk received', chunk) }
 *   );
 *
 * @example
 *   // 原始 postMessage（向后兼容）
 *   const client = WorkerClient.create('js/workers/ascii.worker.js');
 *   client.on('message', (e) => console.log(e.data));
 *   client.postMessage({ type: 'process', imageData: data, config: {} });
 */
(function () {
    'use strict';

    // ─── 常量 ───────────────────────────────────────────────
    /** @type {number} 默认超时时间（毫秒） */
    let DEFAULT_TIMEOUT = 30000;

    /** @type {number} 自增的请求 ID 计数器 */
    let _requestIdCounter = 0;

    /**
     * 生成唯一的请求 ID。
     * @returns {string} 形如 "wc-1"、"wc-2" 的唯一标识符
     */
    function generateRequestId() {
        return 'wc-' + (++_requestIdCounter);
    }

    /**
     * 判断给定的 app 对象是否具备 getWorker 方法。
     * @param {*} appRef - 可能的 app 对象
     * @returns {boolean}
     */
    function hasAppWorkerPool(appRef) {
        return appRef && typeof appRef.getWorker === 'function';
    }

    /**
     * 判断给定的 app 对象是否具备 releaseWorker 方法。
     * @param {*} appRef - 可能的 app 对象
     * @returns {boolean}
     */
    function hasAppRelease(appRef) {
        return appRef && typeof appRef.releaseWorker === 'function';
    }

    /**
     * 判断给定的 app 对象是否具备 showToast 方法。
     * @param {*} appRef - 可能的 app 对象
     * @returns {boolean}
     */
    function hasAppToast(appRef) {
        return appRef && typeof appRef.showToast === 'function';
    }

    // ─── WorkerClient 类 ────────────────────────────────────

    /**
     * WorkerClient - 统一的 Worker 通信封装。
     *
     * 将 Web Worker 的基于事件的通信模型封装为基于 Promise 的 API，
     * 同时保留原始 postMessage 和事件监听能力以兼容旧代码。
     *
     * @param {string} url - Worker 脚本的 URL
     * @param {Object} [options] - 配置项
     * @param {boolean} [options.reuseAppWorker=true] - 是否复用 app.getWorker() 池中的 Worker
     * @param {boolean} [options.autoDestroy=false] - 是否在页面卸载时自动销毁
     * @param {string} [options.name=''] - 可选的客户端名称，用于调试日志
     */
    class WorkerClient {
        constructor(url, options) {
            if (!url) {
                throw new Error('WorkerClient: Worker URL is required');
            }

            /** @type {string} Worker 脚本 URL */
            this._url = url;

            /** @type {Object} 配置项 */
            this._options = Object.assign({
                reuseAppWorker: true,
                autoDestroy: false,
                name: ''
            }, options || {});

            /** @type {Worker|null} Worker 实例 */
            this._worker = null;

            /** @type {boolean} 是否由 app 池管理的 Worker */
            this._isPooled = false;

            /** @type {boolean} 是否已销毁 */
            this._destroyed = false;

            /** @type {Map<string, Object>} 待处理的请求映射 (requestId -> { resolve, reject, timer, onProgress }) */
            this._pending = new Map();

            /** @type {Map<string, Function>} 事件监听器映射 */
            this._listeners = new Map();

            // 初始化 Worker
            this._initWorker();

            // 自动销毁注册
            if (this._options.autoDestroy) {
                this._boundDestroy = this.destroy.bind(this);
                window.addEventListener('beforeunload', this._boundDestroy);
            }
        }

        // ─── 私有方法 ──────────────────────────────────────

        /**
         * 初始化 Worker 实例。
         * 优先使用 app.getWorker()，不可用时直接 new Worker()。
         * @private
         */
        _initWorker() {
            const appRef = window.app;

            if (this._options.reuseAppWorker && hasAppWorkerPool(appRef)) {
                try {
                    this._worker = appRef.getWorker(this._url);
                    this._isPooled = true;
                    this._log('Reused worker from app pool');
                } catch (e) {
                    this._log('Failed to get worker from pool, creating new', 'warn');
                    this._createNewWorker();
                }
            } else {
                this._createNewWorker();
            }

            if (this._worker) {
                this._worker.onmessage = (e) => this._handleMessage(e);
                this._worker.onerror = (e) => this._handleWorkerError(e);
            }
        }

        /**
         * 创建新的 Worker 实例。
         * @private
         */
        _createNewWorker() {
            try {
                this._worker = new Worker(this._url);
                this._isPooled = false;
                this._log('Created new worker');
            } catch (e) {
                console.error('[WorkerClient] Failed to create worker:', e);
                this._worker = null;
            }
        }

        /**
         * 处理 Worker 发来的消息。
         * 自动识别响应格式并分发到对应的 Promise 或事件监听器。
         *
         * @param {MessageEvent} e - Worker 的 message 事件
         * @private
         */
        _handleMessage(e) {
            const data = e.data;
            if (!data || typeof data !== 'object') return;

            // 触发 'message' 事件监听器
            this._emit('message', e);

            // 尝试匹配待处理的请求
            const requestId = data.requestId || data.id || null;
            let pendingEntry = null;

            if (requestId && this._pending.has(String(requestId))) {
                pendingEntry = this._pending.get(String(requestId));
            }

            // ── 进度 / 分块消息 ──
            if (this._isProgressMessage(data)) {
                if (pendingEntry && pendingEntry.onProgress) {
                    pendingEntry.onProgress(data);
                }
                this._emit('progress', data);
                return;
            }

            // ── 成功消息 ──
            if (this._isSuccessMessage(data)) {
                if (pendingEntry) {
                    this._resolvePending(String(requestId), data);
                }
                return;
            }

            // ── 错误消息 ──
            if (this._isErrorMessage(data)) {
                const errorMsg = data.error || data.message || 'Worker returned an error';
                if (pendingEntry) {
                    this._rejectPending(String(requestId), errorMsg, data);
                } else {
                    // 无匹配请求时，通过 'error' 事件通知
                    this._emit('error', new Error(errorMsg));
                    this._showToast(errorMsg);
                }
                return;
            }

            // ── 无法识别的消息格式：如果有 pending 请求，仍然尝试匹配 ──
            // 某些 Worker 可能不使用标准格式，直接返回数据
            if (pendingEntry) {
                this._resolvePending(String(requestId), data);
            }
        }

        /**
         * 处理 Worker 自身的运行时错误。
         * @param {ErrorEvent} e - Worker 的 error 事件
         * @private
         */
        _handleWorkerError(e) {
            const errorMsg = e.message || 'Worker runtime error';
            console.error('[WorkerClient] Worker error:', errorMsg);

            // 拒绝所有待处理的请求
            this._pending.forEach((entry, id) => {
                this._rejectPending(id, errorMsg, null);
            });

            this._emit('error', new Error(errorMsg));
            this._showToast(errorMsg);
        }

        /**
         * 判断消息是否为进度/分块类型。
         * @param {Object} data - 消息数据
         * @returns {boolean}
         * @private
         */
        _isProgressMessage(data) {
            return (
                data.type === 'progress' ||
                data.type === 'chunk' ||
                (data.progress !== undefined && data.type !== 'success' && data.type !== 'complete' && data.type !== 'error')
            );
        }

        /**
         * 判断消息是否为成功/完成类型。
         * 兼容所有 Worker 的成功响应格式：
         *   - { type: 'success', ... }
         *   - { type: 'complete', ... }
         *   - { success: true, ... }
         *   - { status: 'success', ... }
         *   - { type: 'result', ... } (hash worker)
         *
         * @param {Object} data - 消息数据
         * @returns {boolean}
         * @private
         */
        _isSuccessMessage(data) {
            if (data.type === 'success' || data.type === 'complete' || data.type === 'result') {
                return true;
            }
            if (data.success === true) {
                return true;
            }
            if (data.status === 'success') {
                return true;
            }
            return false;
        }

        /**
         * 判断消息是否为错误类型。
         * 兼容所有 Worker 的错误响应格式：
         *   - { type: 'error', error: ... }
         *   - { success: false, error: ... }
         *   - { status: 'error', error: ... }
         *
         * @param {Object} data - 消息数据
         * @returns {boolean}
         * @private
         */
        _isErrorMessage(data) {
            if (data.type === 'error') {
                return true;
            }
            if (data.success === false) {
                return true;
            }
            if (data.status === 'error') {
                return true;
            }
            return false;
        }

        /**
         * 解析指定 requestId 的待处理请求。
         * @param {string} id - 请求 ID
         * @param {*} result - 成功结果
         * @private
         */
        _resolvePending(id, result) {
            const entry = this._pending.get(id);
            if (!entry) return;

            clearTimeout(entry.timer);
            this._pending.delete(id);
            entry.resolve(result);
        }

        /**
         * 拒绝指定 requestId 的待处理请求。
         * @param {string} id - 请求 ID
         * @param {string} errorMsg - 错误信息
         * @param {*} data - 原始消息数据（可选）
         * @private
         */
        _rejectPending(id, errorMsg, data) {
            const entry = this._pending.get(id);
            if (!entry) return;

            clearTimeout(entry.timer);
            this._pending.delete(id);

            const error = new Error(errorMsg);
            error.workerData = data;
            entry.reject(error);
        }

        /**
         * 触发指定事件的所有监听器。
         * @param {string} event - 事件名称
         * @param {*} data - 事件数据
         * @private
         */
        _emit(event, data) {
            const listeners = this._listeners.get(event);
            if (!listeners) return;

            // 复制一份再遍历，防止回调中修改监听器列表
            const copy = listeners.slice();
            for (let i = 0; i < copy.length; i++) {
                try {
                    copy[i](data);
                } catch (e) {
                    console.error('[WorkerClient] Event listener error:', e);
                }
            }
        }

        /**
         * 显示 Toast 提示（如果 app.showToast 可用）。
         * @param {string} msg - 提示消息
         * @param {string} [type='error'] - 提示类型
         * @private
         */
        _showToast(msg, type) {
            const appRef = window.app;
            if (hasAppToast(appRef)) {
                try {
                    appRef.showToast(msg, type || 'error');
                } catch (e) {
                    // 静默失败
                }
            }
        }

        /**
         * 输出调试日志。
         * @param {string} msg - 日志消息
         * @param {string} [level='log'] - 日志级别
         * @private
         */
        _log(msg, level) {
            const prefix = '[WorkerClient' + (this._options.name ? ':' + this._options.name : '') + ']';
            if (level === 'warn') {
                console.warn(prefix, msg);
            } else if (level === 'error') {
                console.error(prefix, msg);
            } else {
                console.log(prefix, msg);
            }
        }

        // ─── 公共方法 ──────────────────────────────────────

        /**
         * 发送消息到 Worker 并返回 Promise。
         *
         * 自动为消息附加 requestId（如果消息中尚未包含），
         * 并根据响应格式自动 resolve/reject。
         *
         * @param {Object} message - 要发送给 Worker 的消息对象
         * @param {Object} [sendOptions] - 发送选项
         * @param {number} [sendOptions.timeout=30000] - 超时时间（毫秒），0 表示无超时
         * @param {Function} [sendOptions.onProgress] - 进度回调函数
         * @param {Array} [sendOptions.transferables] - 可转移对象数组
         * @returns {Promise<Object>} Worker 的响应数据
         *
         * @example
         *   // phantom worker
         *   const result = await client.send({
         *       cmd: 'process',
         *       imgFront: frontData,
         *       imgBack: backData,
         *       width: 800,
         *       height: 600
         *   });
         *
         * @example
         *   // crypto worker
         *   const result = await client.send({
         *       command: 'encrypt',
         *       algorithm: 'aes-256-gcm',
         *       data: plaintext
         *   });
         */
        send(message, sendOptions) {
            if (this._destroyed) {
                return Promise.reject(new Error('WorkerClient: already destroyed'));
            }

            if (!this._worker) {
                return Promise.reject(new Error('WorkerClient: worker not available'));
            }

            const opts = Object.assign({
                timeout: DEFAULT_TIMEOUT,
                onProgress: null,
                transferables: null
            }, sendOptions || {});

            // 生成 requestId 并附加到消息中
            const requestId = generateRequestId();
            const enrichedMessage = Object.assign({}, message, { requestId: requestId });

            return new Promise((resolve, reject) => {
                // 设置超时计时器
                let timer = null;
                if (opts.timeout > 0) {
                    timer = setTimeout(() => {
                        this._pending.delete(String(requestId));
                        reject(new Error(
                            'WorkerClient: request timed out after ' + opts.timeout + 'ms (requestId: ' + requestId + ')'
                        ));
                    }, opts.timeout);
                }

                // 注册待处理请求
                this._pending.set(String(requestId), {
                    resolve: resolve,
                    reject: reject,
                    timer: timer,
                    onProgress: opts.onProgress
                });

                // 发送消息
                try {
                    if (opts.transferables && opts.transferables.length > 0) {
                        this._worker.postMessage(enrichedMessage, opts.transferables);
                    } else {
                        this._worker.postMessage(enrichedMessage);
                    }
                } catch (e) {
                    // 发送失败，立即清理
                    clearTimeout(timer);
                    this._pending.delete(String(requestId));
                    reject(new Error('WorkerClient: failed to post message - ' + (e.message || e)));
                }
            });
        }

        /**
         * 原始 postMessage 方法，用于向后兼容。
         * 不进行 Promise 包装，不附加 requestId。
         *
         * @param {*} data - 要发送的数据
         * @param {Array} [transfer] - 可转移对象数组
         *
         * @example
         *   client.on('message', (e) => {
         *       if (e.data.type === 'success') { ... }
         *   });
         *   client.postMessage({ type: 'process', imageData: data, config: {} });
         */
        postMessage(data, transfer) {
            if (this._destroyed) {
                console.warn('[WorkerClient] postMessage called on destroyed client');
                return;
            }
            if (!this._worker) {
                console.warn('[WorkerClient] worker not available');
                return;
            }

            try {
                if (transfer && transfer.length > 0) {
                    this._worker.postMessage(data, transfer);
                } else {
                    this._worker.postMessage(data);
                }
            } catch (e) {
                console.error('[WorkerClient] postMessage error:', e);
                this._emit('error', e);
            }
        }

        /**
         * 注册事件监听器。
         *
         * 支持的事件类型:
         *   - 'message' - Worker 发来任何消息时触发，参数为 MessageEvent
         *   - 'error' - Worker 运行时错误或无法匹配的错误响应，参数为 Error
         *   - 'progress' - 收到进度/分块消息时触发，参数为消息数据对象
         *
         * @param {string} event - 事件名称
         * @param {Function} callback - 回调函数
         * @returns {WorkerClient} this（支持链式调用）
         *
         * @example
         *   client
         *     .on('progress', (data) => updateProgressBar(data.progress))
         *     .on('error', (err) => console.error(err));
         */
        on(event, callback) {
            if (typeof callback !== 'function') {
                throw new TypeError('WorkerClient.on: callback must be a function');
            }

            if (!this._listeners.has(event)) {
                this._listeners.set(event, []);
            }
            this._listeners.get(event).push(callback);
            return this;
        }

        /**
         * 移除事件监听器。
         * 如果未指定 callback，则移除该事件的所有监听器。
         *
         * @param {string} event - 事件名称
         * @param {Function} [callback] - 要移除的回调函数
         * @returns {WorkerClient} this（支持链式调用）
         */
        off(event, callback) {
            if (!this._listeners.has(event)) return this;

            if (!callback) {
                this._listeners.delete(event);
                return this;
            }

            const listeners = this._listeners.get(event);
            const filtered = listeners.filter(function (fn) { return fn !== callback; });
            if (filtered.length === 0) {
                this._listeners.delete(event);
            } else {
                this._listeners.set(event, filtered);
            }
            return this;
        }

        /**
         * 销毁 WorkerClient 实例。
         *
         * - 拒绝所有待处理的请求
         * - 如果 Worker 由 app 池管理，调用 app.releaseWorker()
         * - 否则直接 terminate Worker
         * - 清理所有事件监听器
         *
         * 销毁后，send() 和 postMessage() 将不再可用。
         */
        destroy() {
            if (this._destroyed) return;
            this._destroyed = true;

            this._log('Destroying...');

            // 拒绝所有待处理的请求
            this._pending.forEach(function (entry, id) {
                clearTimeout(entry.timer);
                entry.reject(new Error('WorkerClient: destroyed while request was pending (requestId: ' + id + ')'));
            });
            this._pending.clear();

            // 清理事件监听器
            this._listeners.clear();

            // 移除 beforeunload 监听器
            if (this._boundDestroy) {
                window.removeEventListener('beforeunload', this._boundDestroy);
                this._boundDestroy = null;
            }

            // 终止 Worker
            if (this._worker) {
                const appRef = window.app;
                if (this._isPooled && hasAppRelease(appRef)) {
                    try {
                        appRef.releaseWorker(this._url);
                    } catch (e) {
                        // 静默失败
                    }
                } else {
                    try {
                        this._worker.terminate();
                    } catch (e) {
                        // 静默失败
                    }
                }
                this._worker = null;
            }

            this._log('Destroyed');
        }

        /**
         * 获取底层 Worker 实例的引用（只读）。
         * 注意：直接操作 Worker 可能绕过 WorkerClient 的消息匹配机制。
         *
         * @returns {Worker|null}
         */
        get worker() {
            return this._worker;
        }

        /**
         * 获取当前待处理的请求数量。
         * @returns {number}
         */
        get pendingCount() {
            return this._pending.size;
        }

        /**
         * 获取 Worker URL。
         * @returns {string}
         */
        get url() {
            return this._url;
        }

        /**
         * 检查实例是否已销毁。
         * @returns {boolean}
         */
        get isDestroyed() {
            return this._destroyed;
        }

        // ─── 静态方法 ──────────────────────────────────────

        /**
         * 工厂方法：创建 WorkerClient 实例。
         * 语法糖，等价于 `new WorkerClient(url, options)`。
         *
         * @param {string} url - Worker 脚本的 URL
         * @param {Object} [options] - 配置项，同 constructor
         * @returns {WorkerClient} 新的 WorkerClient 实例
         *
         * @example
         *   const client = WorkerClient.create('js/workers/hash.worker.js', { name: 'hasher' });
         *   const result = await client.send({
         *       type: 'calc',
         *       payload: { data: 'hello world', isFile: false, algos: ['SHA-256'] }
         *   });
         *   console.log(result.results);
         *   client.destroy();
         */
        static create(url, options) {
            return new WorkerClient(url, options);
        }

        /**
         * 更新默认超时时间。
         * 仅影响之后创建的 WorkerClient 实例的默认值。
         *
         * @param {number} ms - 超时时间（毫秒）
         */
        static setDefaultTimeout(ms) {
            if (typeof ms === 'number' && ms >= 0) {
                DEFAULT_TIMEOUT = ms;
            }
        }
    }

    // ─── 导出 ─────────────────────────────────────────────
    window.WorkerClient = WorkerClient;

})();
