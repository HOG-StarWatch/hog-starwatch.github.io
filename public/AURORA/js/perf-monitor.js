/**
 * Performance Monitor for Wasm Modules
 * Tracks execution time, success/failure rates, and provides utilities for fallback logging.
 */
const PerfMonitor = {
    metrics: {},
    _history: [],
    _maxHistory: 100,
    _maxMetrics: 50,

    /**
     * Start a timer for a specific task
     * @param {string} taskName
     * @returns {string} timerId
     */
    start: function(taskName) {
        // 防止 metrics 对象无限增长
        const keys = Object.keys(this.metrics);
        if (keys.length > this._maxMetrics) {
            // 清理最旧的条目
            for (let i = 0; i < 10 && i < keys.length; i++) {
                delete this.metrics[keys[i]];
            }
        }

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
     * @returns {number|undefined} duration in ms
     */
    end: function(timerId, engine, success) {
        const metric = this.metrics[timerId];
        if (!metric) return;

        engine = engine || 'wasm';
        success = success !== false;

        const duration = performance.now() - metric.startTime;
        const record = {
            task: metric.name,
            engine: engine,
            duration: duration,
            success: success,
            timestamp: Date.now()
        };

        console.log(
            `[Perf] ${metric.name} (${engine}): ${duration.toFixed(2)}ms [${success ? 'OK' : 'FAIL'}]`
        );

        // 记录到历史
        this._history.push(record);
        if (this._history.length > this._maxHistory) {
            this._history.shift();
        }

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
        this._history.push({
            task: taskName,
            engine: 'js-fallback',
            duration: 0,
            success: true,
            fallback: true,
            reason: reason,
            timestamp: Date.now()
        });
        if (this._history.length > this._maxHistory) {
            this._history.shift();
        }
    },

    /**
     * Wrap an async function with monitoring
     * @param {string} taskName
     * @param {string} engine
     * @param {Function} fn
     * @returns {Promise}
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
    },

    /**
     * Get performance history
     * @param {Object} [filter]
     * @param {string} [filter.task] - Filter by task name
     * @param {string} [filter.engine] - Filter by engine type
     * @param {boolean} [filter.success] - Filter by success status
     * @returns {Array}
     */
    getHistory: function(filter) {
        if (!filter) return this._history.slice();
        return this._history.filter(function(r) {
            if (filter.task && r.task !== filter.task) return false;
            if (filter.engine && r.engine !== filter.engine) return false;
            if (filter.success !== undefined && r.success !== filter.success) return false;
            return true;
        });
    },

    /**
     * Get summary statistics
     * @param {string} [taskName] - Optional task name to filter
     * @returns {Object} { count, avgDuration, minDuration, maxDuration, successRate, fallbackCount }
     */
    getSummary: function(taskName) {
        const records = taskName
            ? this._history.filter(function(r) { return r.task === taskName; })
            : this._history;

        if (records.length === 0) {
            return { count: 0, avgDuration: 0, minDuration: 0, maxDuration: 0, successRate: 1, fallbackCount: 0 };
        }

        const durations = records.filter(function(r) { return r.duration > 0; }).map(function(r) { return r.duration; });
        const successCount = records.filter(function(r) { return r.success; }).length;
        const fallbackCount = records.filter(function(r) { return r.fallback; }).length;

        return {
            count: records.length,
            avgDuration: durations.length > 0 ? durations.reduce(function(a, b) { return a + b; }, 0) / durations.length : 0,
            minDuration: durations.length > 0 ? Math.min.apply(null, durations) : 0,
            maxDuration: durations.length > 0 ? Math.max.apply(null, durations) : 0,
            successRate: successCount / records.length,
            fallbackCount: fallbackCount
        };
    },

    /**
     * Clear all metrics and history
     */
    clear: function() {
        this.metrics = {};
        this._history = [];
    }
};

// Expose globally
window.PerfMonitor = PerfMonitor;
