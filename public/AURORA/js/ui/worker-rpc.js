/* ============================================================
 * Aurora Toolbox — WorkerRpc
 * Promise-based Web Worker RPC with requestId correlation,
 * timeout, progress, and unified message protocol:
 *   request:  { type: 'process', requestId, ...payload }
 *   success:  { type: 'success'|'complete'|'result', requestId, ...data }
 *   error:    { type: 'error', requestId, error }
 * Options allow legacy shapes (see create()).
 * ============================================================ */
window.WorkerRpc = (function () {
    'use strict';

    /**
     * @param {string} workerUrl
     * @param {object} [opts]
     * @param {number} [opts.timeout=60000]        per-call timeout ms
     * @param {string} [opts.requestType='process'] message type sent for calls
     * @param {boolean} [opts.nestRequestId=false]  put requestId inside payload (legacy workers)
     * @param {string[]} [opts.successTypes]        default ['success','complete','result']
     * @param {string} [opts.errorType='error']     error message type
     * @param {Function} [opts.onProgress]          receives progress messages
     * @param {Function} [opts.onFatal]             worker.onerror callback (e.g. null-out the rpc for main-thread fallback)
     */
    function create(workerUrl, opts) {
        opts = opts || {};
        const timeoutMs = opts.timeout || 60000;
        const requestType = opts.requestType || 'process';
        const nestRequestId = !!opts.nestRequestId;
        const successTypes = opts.successTypes || ['success', 'complete', 'result'];
        const errorType = opts.errorType || 'error';

        let worker = null;
        let seq = 1;
        const pending = new Map();

        function onMessage(e) {
            const data = e.data || {};
            if (!data.requestId) {
                // fire-and-forget / stream messages (no correlation) → global progress hook
                if (opts.onProgress) {
                    try { opts.onProgress(data); } catch (err) {}
                }
                return;
            }
            const req = pending.get(data.requestId);
            if (!req) return;
            if (successTypes.indexOf(data.type) !== -1) {
                pending.delete(data.requestId);
                req.resolve(data);
            } else if (data.type === errorType) {
                pending.delete(data.requestId);
                req.reject(new Error(data.error || 'Worker error'));
            } else if (req.onProgress || opts.onProgress) {
                // progress / chunk / status messages carrying requestId
                if (req.onProgress) req.onProgress(data);
                else opts.onProgress(data);
            }
        }

        function onError(e) {
            if (opts.onFatal) {
                try { opts.onFatal(e); } catch (err) {}
            }
            pending.forEach(req => req.reject(new Error((e && e.message) || 'Worker error')));
            pending.clear();
        }

        function ensureWorker() {
            if (!worker) {
                worker = new Worker(workerUrl);
                worker.onmessage = onMessage;
                worker.onerror = onError;
            }
            return worker;
        }

        return {
            get ready() { return !!worker; },

            /** Send one request, resolve/reject with the correlated response.
             *  @param {Function} [onProgress] per-call progress/chunk/status callback (receives the message data) */
            call(payload, transfer, onProgress) {
                const requestId = String(seq++);
                return new Promise((resolve, reject) => {
                    const timer = setTimeout(() => {
                        if (pending.has(requestId)) {
                            pending.delete(requestId);
                            reject(new Error('Worker 响应超时'));
                        }
                    }, timeoutMs);
                    pending.set(requestId, {
                        resolve: (d) => { clearTimeout(timer); resolve(d); },
                        reject: (e) => { clearTimeout(timer); reject(e); },
                        onProgress: typeof onProgress === 'function' ? onProgress : null
                    });
                    const msg = { type: requestType, requestId };
                    if (nestRequestId) {
                        msg.payload = Object.assign({}, payload, { requestId });
                    } else {
                        Object.assign(msg, payload);
                    }
                    ensureWorker().postMessage(msg, transfer || []);
                });
            },

            /** Low-level send (no correlation); for fire-and-forget or custom flows. */
            postMessage(data, transfer) {
                ensureWorker().postMessage(data, transfer || []);
            },

            terminate() {
                if (worker) {
                    try { worker.terminate(); } catch (e) {}
                    worker = null;
                }
                pending.forEach(req => req.reject(new Error('Worker 已终止')));
                pending.clear();
            }
        };
    }

    return { create };
})();