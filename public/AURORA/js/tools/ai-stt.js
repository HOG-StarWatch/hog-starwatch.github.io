/* Extracted from ai-stt.html (refactor script). Tool logic. */

        const sttTool = {
            recognition: null,
            recognizing: false,
            finalText: '',
            uploadFile: null,
            init: function() {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) {
                    document.getElementById('stt-support').style.display = 'block';
                    this.setStatus('实时识别不可用');
                }
                document.getElementById('stt-source').addEventListener('change', () => this.updateSource());
                this.updateSource();
            },
            updateSource: function() {
                const source = document.getElementById('stt-source').value;
                const isUpload = source === 'upload';
                const isPlayback = source === 'playback';
                document.getElementById('stt-upload-block').style.display = (isUpload || isPlayback) ? 'flex' : 'none';
                document.getElementById('stt-api-group').style.display = isUpload ? 'flex' : 'none';
                document.getElementById('stt-header-group').style.display = isUpload ? 'flex' : 'none';
                Array.from(document.querySelectorAll('.upload-config')).forEach(el => {
                    el.style.display = isUpload ? 'flex' : 'none';
                });
                document.getElementById('stt-mode').disabled = isUpload || isPlayback;
                document.getElementById('stt-interim').disabled = isUpload || isPlayback;
                if (isUpload) {
                    this.stop();
                    this.setStatus('上传识别就绪');
                } else if (isPlayback) {
                    this.stop();
                    this.setStatus('回放识别就绪');
                }
                document.getElementById('stt-upload-btn').disabled = !isUpload || !this.uploadFile;
                document.getElementById('stt-playback-btn').disabled = !isPlayback || !this.uploadFile;
            },
            buildRecognition: function() {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                recognition.lang = document.getElementById('stt-lang').value;
                recognition.continuous = document.getElementById('stt-mode').value === 'continuous';
                recognition.interimResults = document.getElementById('stt-interim').checked;
                recognition.onstart = () => {
                    this.recognizing = true;
                    this.setStatus('识别中');
                };
                recognition.onerror = () => {
                    this.recognizing = false;
                    this.setStatus('错误');
                };
                recognition.onend = () => {
                    this.recognizing = false;
                    this.setStatus('已停止');
                };
                recognition.onresult = (event) => {
                    let interim = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            this.finalText += transcript + '\n';
                        } else {
                            interim += transcript;
                        }
                    }
                    const output = document.getElementById('stt-output');
                    output.value = this.finalText + (interim ? interim : '');
                };
                return recognition;
            },
            start: function() {
                if (this.recognizing) return;
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const source = document.getElementById('stt-source').value;
                if (source === 'upload') {
                    this.recognizeUpload();
                    return;
                }
                if (source === 'playback') {
                    this.playbackRecognize();
                    return;
                }
                if (!SpeechRecognition) return;
                this.recognition = this.buildRecognition();
                this.recognition.start();
            },
            stop: function() {
                if (this.recognition && this.recognizing) {
                    this.recognition.stop();
                }
            },
            handleFile: function(input) {
                const file = input.files && input.files[0];
                if (!file) return;
                this.uploadFile = file;
                document.getElementById('stt-file-text').innerText = `${file.name} (${file.size} bytes)`;
                document.getElementById('stt-file-info').style.display = 'flex';
                const audio = document.getElementById('stt-audio');
                audio.src = URL.createObjectURL(file);
                document.getElementById('stt-upload-btn').disabled = false;
                if (document.getElementById('stt-source').value === 'playback') {
                    document.getElementById('stt-playback-btn').disabled = false;
                }
            },
            clearFile: function() {
                this.uploadFile = null;
                document.getElementById('stt-file-input').value = '';
                document.getElementById('stt-file-info').style.display = 'none';
                document.getElementById('stt-file-text').innerText = '';
                document.getElementById('stt-audio').src = '';
                document.getElementById('stt-upload-btn').disabled = true;
                document.getElementById('stt-playback-btn').disabled = true;
            },
            extractText: function(payload) {
                if (!payload) return '';
                if (typeof payload === 'string') return payload;
                const keys = ['text', 'transcript', 'result', 'message'];
                for (const key of keys) {
                    if (typeof payload[key] === 'string') return payload[key];
                }
                if (payload.data) {
                    return this.extractText(payload.data);
                }
                return '';
            },
            recognizeUpload: async function() {
                if (!this.uploadFile) {
                    app.showToast('请先选择音频文件', 'error');
                    return;
                }
                const api = document.getElementById('stt-api').value.trim();
                if (!api) {
                    app.showToast('请填写上传识别 API', 'error');
                    return;
                }
                this.setStatus('上传识别中');
                try {
                    const form = new FormData();
                    form.append('file', this.uploadFile);
                    form.append('lang', document.getElementById('stt-lang').value);
                    const headers = {};
                    const headerName = document.getElementById('stt-header-name').value.trim();
                    const headerValue = document.getElementById('stt-header-value').value.trim();
                    if (headerName && headerValue) {
                        headers[headerName] = headerValue;
                    }
                    const res = await fetch(api, {
                        method: 'POST',
                        headers,
                        body: form
                    });
                    const raw = await res.text();
                    let text = '';
                    try {
                        const json = JSON.parse(raw);
                        text = this.extractText(json);
                    } catch (e) {
                        text = raw;
                    }
                    if (!text) {
                        throw new Error('未获取到文本结果');
                    }
                    this.finalText = text;
                    document.getElementById('stt-output').value = text;
                    this.setStatus('完成');
                } catch (e) {
                    this.setStatus('错误');
                    app.showToast('识别失败', 'error');
                }
            },
            playbackRecognize: function() {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) {
                    app.showToast('浏览器不支持回放识别', 'error');
                    return;
                }
                if (!this.uploadFile) {
                    app.showToast('请先选择音频文件', 'error');
                    return;
                }
                this.stop();
                this.finalText = '';
                document.getElementById('stt-output').value = '';
                const audio = document.getElementById('stt-audio');
                audio.currentTime = 0;
                this.recognition = this.buildRecognition();
                this.recognition.onend = () => {
                    this.recognizing = false;
                    this.setStatus('已停止');
                };
                this.recognition.start();
                audio.onended = () => {
                    if (this.recognition && this.recognizing) this.recognition.stop();
                };
                audio.play().catch(() => {
                    this.setStatus('播放失败');
                });
            },
            clear: function() {
                this.finalText = '';
                document.getElementById('stt-output').value = '';
                this.setStatus('就绪');
            },
            setStatus: function(text) {
                document.getElementById('stt-status').innerText = `状态：${text}`;
            }
        };
        sttTool.init();

        // data-action registrations (replaces inline onclick=/onchange=)
        if (window.app && app.action) {
            app.action('stt.clear', function () { sttTool.clear(); });
            app.action('stt.start', function () { sttTool.start(); });
            app.action('stt.stop', function () { sttTool.stop(); });
            app.action('stt.recognize-upload', function () { sttTool.recognizeUpload(); });
            app.action('stt.playback-recognize', function () { sttTool.playbackRecognize(); });
            app.action('stt.handle-file', function (el) { sttTool.handleFile(el); });
            app.action('stt.clear-file', function () { sttTool.clearFile(); });
        }
    
