/* Extracted from datetime.html (refactor script). Tool logic. */

        function switchTab(tab) {
            document.querySelectorAll('.tool-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            event.target.classList.add('active');
            document.getElementById(`tab-${tab}`).classList.add('active');
        }

        const tsTool = {
            timer: null,
            init: function() {
                this.now();
                this.timer = setInterval(() => {
                    document.getElementById('current-ts').innerText = Math.floor(Date.now() / 1000);
                }, 1000);
            },
            
            now: function() {
                const now = new Date();
                document.getElementById('current-ts').innerText = Math.floor(now.getTime() / 1000);
                const localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 19);
                document.getElementById('date-in').value = localIso;
                document.getElementById('diff-start').value = localIso;
            },

            formatDate: function(date) {
                const pad = n => n < 10 ? '0' + n : n;
                return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
            },

            convert: function(type) {
                if (type === 'sec' || type === 'ms') {
                    let val = document.getElementById(type === 'sec' ? 'ts-in-sec' : 'ts-in-ms').value;
                    if (!val) return;
                    let ts = parseInt(val);
                    if (type === 'sec') ts *= 1000;
                    
                    const date = new Date(ts);
                    if (isNaN(date.getTime())) {
                        document.getElementById('ts-date-out').value = '无效的时间戳';
                    } else {
                        document.getElementById('ts-date-out').value = this.formatDate(date);
                    }
                } else if (type === 'date') {
                    const val = document.getElementById('date-in').value;
                    if (!val) return;
                    const date = new Date(val);
                    if (isNaN(date.getTime())) return;
                    document.getElementById('date-out-ts').value = Math.floor(date.getTime() / 1000);
                }
            },

            calcDiff: function() {
                const start = document.getElementById('diff-start').value;
                const end = document.getElementById('diff-end').value;
                
                if (!start || !end) {
                    app.showToast('请选择开始和结束时间', 'error');
                    return;
                }

                const d1 = new Date(start);
                const d2 = new Date(end);
                let diffMs = Math.abs(d2 - d1);

                const diffSecs = Math.floor(diffMs / 1000);
                const diffMins = Math.floor(diffSecs / 60);
                const diffHours = Math.floor(diffMins / 60);
                const diffDays = Math.floor(diffHours / 24);

                document.getElementById('diff-days').innerText = diffDays.toLocaleString();
                document.getElementById('diff-hours').innerText = diffHours.toLocaleString();
                document.getElementById('diff-mins').innerText = diffMins.toLocaleString();
                document.getElementById('diff-secs').innerText = diffSecs.toLocaleString();

                let rem = diffSecs;
                const d = Math.floor(rem / 86400); rem %= 86400;
                const h = Math.floor(rem / 3600); rem %= 3600;
                const m = Math.floor(rem / 60); rem %= 60;
                const s = rem;

                document.getElementById('diff-detail').innerText = `${d}天 ${h}小时 ${m}分 ${s}秒`;
                document.getElementById('diff-result').style.display = 'block';
            },

            clearDiff: function() {
                document.getElementById('diff-start').value = '';
                document.getElementById('diff-end').value = '';
                document.getElementById('diff-result').style.display = 'none';
            }
        };

        const cronTool = {
            set: function(val) {
                document.getElementById('cron-text').innerText = val;
                this.updateHuman(val);
            },
            
            update: function() {
                const min = document.getElementById('cron-min').value;
                const hour = document.getElementById('cron-hour').value;
                const day = document.getElementById('cron-day').value;
                const month = document.getElementById('cron-month').value;
                const week = document.getElementById('cron-week').value;
                
                const cron = `${min} ${hour} ${day} ${month} ${week}`;
                document.getElementById('cron-text').innerText = cron;
                this.updateHuman(cron);
            },

            updateHuman: function(cron) {
                const parts = cron.split(' ');
                if(parts.length !== 5) return;
                
                let desc = '';
                if(cron === '* * * * *') desc = '每分钟';
                else if(cron === '0 * * * *') desc = '每小时整点';
                else if(cron === '0 0 * * *') desc = '每天午夜';
                else if(cron === '0 9 * * 1') desc = '每周一 9:00';
                else if(cron === '0 0 1 * *') desc = '每月1号';
                else if(cron === '*/5 * * * *') desc = '每5分钟';
                else desc = '自定义定时任务';
                
                document.getElementById('cron-human').innerText = desc;
            }
        };

        tsTool.init();

        // data-action registrations (replaces inline onclick=/onchange=/oninput=)
        if (window.app && app.action) {
            app.action('dt.switch-tab', function (el) { switchTab(el.dataset.tab); });
            app.action('ts.now', function () { tsTool.now(); });
            app.action('ts.convert', function (el) { tsTool.convert(el.dataset.type); });
            app.action('ts.calc-diff', function () { tsTool.calcDiff(); });
            app.action('ts.clear-diff', function () { tsTool.clearDiff(); });
            app.action('cron.set', function (el) { cronTool.set(el.dataset.cron); });
            app.action('cron.update', function () { cronTool.update(); });
        }
    
