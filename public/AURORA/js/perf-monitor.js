/**
 * Performance Monitor for Wasm Modules
 * Tracks execution time, success/failure rates, and provides utilities for fallback logging.
 */

const PerfMonitor = {
    metrics: {},

    /**
     * Start a timer for a specific task
     * @param {string} taskName 
     * @returns {string} timerId
     */
    start: function(taskName) {
        const id = taskName + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.metrics[id] = {
            name: taskName,
            startTime: performance.now()
        };
        return id;
    },

    /**
     * End a timer and log the result
     * @param {string} timerId 
     * @param {string} engine 'wasm' or 'js'
     * @param {boolean} success 
     */
    end: function(timerId, engine = 'wasm', success = true) {
        const metric = this.metrics[timerId];
        if (!metric) return;

        const duration = performance.now() - metric.startTime;
        const msg = `[Perf] ${metric.name} (${engine}): ${duration.toFixed(2)}ms [${success ? 'OK' : 'FAIL'}]`;
        
        console.log(msg);
        
        // Optional: In a real app, send to analytics server here
        // this.reportToAnalytics({ task: metric.name, engine, duration, success });

        delete this.metrics[timerId];
        return duration;
    },

    /**
     * Log a fallback event
     * @param {string} taskName 
     * @param {string} reason 
     */
    logFallback: function(taskName, reason) {
        console.warn(`[Fallback] ${taskName} switched to JS. Reason: ${reason}`);
        // this.reportError({ type: 'fallback', task: taskName, reason });
    },

    /**
     * Wrap an async function with monitoring
     * @param {string} taskName 
     * @param {string} engine 
     * @param {Function} fn 
     */
    measureAsync: async function(taskName, engine, fn) {
        const id = this.start(taskName);
        try {
            const result = await fn();
            this.end(id, engine, true);
            return result;
        } catch (e) {
            this.end(id, engine, false);
            throw e;
        }
    }
};

// Expose globally
window.PerfMonitor = PerfMonitor;