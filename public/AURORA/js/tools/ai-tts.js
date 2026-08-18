/* Extracted from ai-tts.html (refactor script). Tool logic. */

        const ttsTool = {
            voices: [],
            filteredVoices: [],
            utterance: null,
            lastAudioUrl: '',
            lastAudioBlob: null,
            recordStream: null,
            recorder: null,
            recordChunks: [],
            recordingActive: false,
            engine: 'webspeech',
            engineVoices: {
                streamelements: [
                    'Brian','Amy','Emma','Geraint','Ivy','Joanna','Kendra','Kimberly','Matthew','Salli','Justin','Nicole','Russell'
                ],
                voicerss: [
                    'en-us','en-gb','zh-cn','zh-hk','ja-jp','ko-kr','de-de','fr-fr','es-es','it-it','ru-ru'
                ]
            },
            init: function() {
                if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
                    document.getElementById('tts-support').style.display = 'block';
                    this.setStatus('不支持');
                }
                document.getElementById('tts-input').addEventListener('input', this.updateCount);
                document.getElementById('tts-rate').addEventListener('input', this.updateSliders);
                document.getElementById('tts-pitch').addEventListener('input', this.updateSliders);
                document.getElementById('tts-volume').addEventListener('input', this.updateSliders);
                this.updateSliders();
                this.loadVoices();
                if ('speechSynthesis' in window && speechSynthesis.onvoiceschanged !== undefined) {
                    speechSynthesis.onvoiceschanged = () => this.loadVoices();
                }
                this.onEngineChange();
            },
            updateCount: function() {
                const val = document.getElementById('tts-input').value || '';
                document.getElementById('tts-count').innerText = val.length;
            },
            updateSliders: function() {
                document.getElementById('rate-val').innerText = Number(document.getElementById('tts-rate').value).toFixed(1);
                document.getElementById('pitch-val').innerText = Number(document.getElementById('tts-pitch').value).toFixed(1);
                document.getElementById('volume-val').innerText = Number(document.getElementById('tts-volume').value).toFixed(2);
            },
            setStatus: function(text) {
                document.getElementById('tts-status').innerText = `状态：${text}`;
            },
            loadVoices: function() {
                if ('speechSynthesis' in window) {
                    this.voices = speechSynthesis.getVoices() || [];
                } else {
                    this.voices = [];
                }
                this.filterVoices();
            },
            refreshVoices: function() {
                this.loadVoices();
                app.showToast('声线已刷新');
            },
            filterVoices: function() {
                const keyword = (document.getElementById('voice-filter').value || '').trim().toLowerCase();
                if (this.engine === 'webspeech') {
                    if (!keyword) {
                        this.filteredVoices = this.voices.slice();
                    } else {
                        this.filteredVoices = this.voices.filter(v => {
                            const name = (v.name || '').toLowerCase();
                            const lang = (v.lang || '').toLowerCase();
                            return name.includes(keyword) || lang.includes(keyword);
                        });
                    }
                } else if (this.engine === 'streamelements') {
                    this.filteredVoices = this.engineVoices.streamelements.filter(v => v.toLowerCase().includes(keyword || ''));
                } else if (this.engine === 'voicerss') {
                    this.filteredVoices = this.engineVoices.voicerss.filter(v => v.toLowerCase().includes(keyword || ''));
                } else {
                    this.filteredVoices = [];
                }
                this.renderVoiceOptions();
            },
            renderVoiceOptions: function() {
                const select = document.getElementById('voice-select');
                select.innerHTML = '';
                if (this.engine === 'webspeech') {
                    const list = this.filteredVoices.length ? this.filteredVoices : this.voices;
                    list.forEach((voice, idx) => {
                        const opt = document.createElement('option');
                        opt.value = voice.name;
                        opt.textContent = `${voice.name} (${voice.lang || 'unknown'})`;
                        if (idx === 0) opt.selected = true;
                        select.appendChild(opt);
                    });
                } else {
                    const list = this.filteredVoices.length ? this.filteredVoices : [];
                    list.forEach((voice, idx) => {
                        const opt = document.createElement('option');
                        opt.value = voice;
                        opt.textContent = voice;
                        if (idx === 0) opt.selected = true;
                        select.appendChild(opt);
                    });
                }
            },
            getSelectedVoice: function() {
                const select = document.getElementById('voice-select');
                const name = select.value;
                if (this.engine === 'webspeech') {
                    return this.voices.find(v => v.name === name) || null;
                }
                if (this.engine === 'custom') {
                    return document.getElementById('custom-voice').value.trim();
                }
                return name || '';
            },
            onEngineChange: function() {
                this.engine = document.getElementById('engine-select').value;
                document.getElementById('voicerss-key-group').style.display = this.engine === 'voicerss' ? 'flex' : 'none';
                document.getElementById('custom-engine').style.display = this.engine === 'custom' ? 'grid' : 'none';
                document.getElementById('voice-select').disabled = this.engine === 'custom';
                document.getElementById('voice-filter').disabled = this.engine === 'custom';
                document.getElementById('tts-record-webspeech').disabled = this.engine !== 'webspeech';
                const note = document.getElementById('engine-note');
                if (this.engine === 'webspeech') {
                    note.innerText = '本地合成，可通过录制浏览器标签页音频导出';
                } else if (this.engine === 'streamelements') {
                    note.innerText = '免费引擎，返回 mp3';
                } else if (this.engine === 'voicerss') {
                    note.innerText = '需要 API Key，可导出 mp3';
                } else {
                    note.innerText = '自定义引擎需支持跨域与音频返回';
                }
                this.filterVoices();
            },
            speak: function() {
                const text = (document.getElementById('tts-input').value || '').trim();
                if (!text) {
                    app.showToast('请输入要朗读的文本', 'error');
                    return;
                }
                if (this.engine === 'webspeech') {
                    if (!('speechSynthesis' in window)) return;
                    speechSynthesis.cancel();
                    const utter = new SpeechSynthesisUtterance(text);
                    utter.rate = Number(document.getElementById('tts-rate').value);
                    utter.pitch = Number(document.getElementById('tts-pitch').value);
                    utter.volume = Number(document.getElementById('tts-volume').value);
                    const voice = this.getSelectedVoice();
                    if (voice) utter.voice = voice;
                    utter.onstart = () => this.setStatus('播放中');
                    utter.onend = () => {
                        this.setStatus('完成');
                        if (this.recordingActive) {
                            this.stopWebSpeechRecord();
                        }
                    };
                    utter.onerror = () => {
                        this.setStatus('错误');
                        if (this.recordingActive) {
                            this.stopWebSpeechRecord();
                        }
                    };
                    this.utterance = utter;
                    speechSynthesis.speak(utter);
                    return;
                }
                this.generate(true);
            },
            pause: function() {
                if (this.engine === 'webspeech') {
                    if (!('speechSynthesis' in window)) return;
                    if (speechSynthesis.speaking) {
                        speechSynthesis.pause();
                        this.setStatus('已暂停');
                    }
                }
            },
            resume: function() {
                if (this.engine === 'webspeech') {
                    if (!('speechSynthesis' in window)) return;
                    if (speechSynthesis.paused) {
                        speechSynthesis.resume();
                        this.setStatus('播放中');
                    }
                }
            },
            stop: function() {
                if (this.engine === 'webspeech') {
                    if (!('speechSynthesis' in window)) return;
                    speechSynthesis.cancel();
                    this.setStatus('停止');
                    if (this.recordingActive) {
                        this.stopWebSpeechRecord();
                    }
                } else {
                    const audio = document.getElementById('audio-player');
                    audio.pause();
                    audio.currentTime = 0;
                    this.setStatus('停止');
                }
            },
            recordWebSpeech: async function() {
                if (this.engine !== 'webspeech') {
                    app.showToast('仅支持 Web Speech 录制', 'error');
                    return;
                }
                if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia || typeof MediaRecorder === 'undefined') {
                    app.showToast('当前浏览器不支持录制标签页音频', 'error');
                    return;
                }
                if (this.recordingActive) {
                    this.stopWebSpeechRecord();
                    return;
                }
                try {
                    const stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
                    let mimeType = '';
                    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                        mimeType = 'audio/webm;codecs=opus';
                    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
                        mimeType = 'audio/webm';
                    }
                    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
                    this.recordStream = stream;
                    this.recorder = recorder;
                    this.recordChunks = [];
                    this.recordingActive = true;
                    recorder.ondataavailable = (e) => {
                        if (e.data && e.data.size > 0) this.recordChunks.push(e.data);
                    };
                    recorder.onstop = () => {
                        const blob = new Blob(this.recordChunks, { type: recorder.mimeType || 'audio/webm' });
                        if (this.lastAudioUrl) URL.revokeObjectURL(this.lastAudioUrl);
                        this.lastAudioBlob = blob;
                        this.lastAudioUrl = URL.createObjectURL(blob);
                        const audio = document.getElementById('audio-player');
                        audio.src = this.lastAudioUrl;
                        document.getElementById('audio-preview').style.display = 'block';
                        this.setStatus('录制完成');
                        this.recordingActive = false;
                        this.recordChunks = [];
                        if (this.recordStream) {
                            this.recordStream.getTracks().forEach(t => t.stop());
                            this.recordStream = null;
                        }
                        this.recorder = null;
                    };
                    recorder.start();
                    this.setStatus('录制中');
                    this.speak();
                } catch (e) {
                    this.recordingActive = false;
                    if (this.recordStream) {
                        this.recordStream.getTracks().forEach(t => t.stop());
                        this.recordStream = null;
                    }
                    this.recorder = null;
                    app.showToast('录制启动失败', 'error');
                }
            },
            stopWebSpeechRecord: function() {
                if (!this.recordingActive) return;
                if (this.recorder && this.recorder.state !== 'inactive') {
                    this.recorder.stop();
                } else {
                    this.recordingActive = false;
                }
            },
            buildUrl: function(text, voice) {
                const rate = document.getElementById('tts-rate').value;
                const pitch = document.getElementById('tts-pitch').value;
                if (this.engine === 'streamelements') {
                    const url = new URL('https://api.streamelements.com/kappa/v2/speech');
                    url.searchParams.set('voice', voice || 'Brian');
                    url.searchParams.set('text', text);
                    return url.toString();
                }
                if (this.engine === 'voicerss') {
                    const key = document.getElementById('voicerss-key').value.trim();
                    const url = new URL('https://api.voicerss.org/');
                    url.searchParams.set('key', key);
                    url.searchParams.set('hl', voice || 'en-us');
                    url.searchParams.set('src', text);
                    url.searchParams.set('r', Math.round((rate - 1) * 5));
                    return url.toString();
                }
                const template = document.getElementById('custom-url').value.trim();
                return template
                    .replaceAll('{text}', encodeURIComponent(text))
                    .replaceAll('{voice}', encodeURIComponent(voice || ''))
                    .replaceAll('{rate}', encodeURIComponent(rate))
                    .replaceAll('{pitch}', encodeURIComponent(pitch));
            },
            generate: async function(autoPlay = false) {
                if (this.engine === 'webspeech') {
                    this.speak();
                    return;
                }
                const text = (document.getElementById('tts-input').value || '').trim();
                if (!text) {
                    app.showToast('请输入要朗读的文本', 'error');
                    return;
                }
                if (this.engine === 'voicerss' && !document.getElementById('voicerss-key').value.trim()) {
                    app.showToast('请先填写 VoiceRSS Key', 'error');
                    return;
                }
                const voice = this.getSelectedVoice();
                const url = this.buildUrl(text, voice);
                if (!url) {
                    app.showToast('请配置引擎地址或 Key', 'error');
                    return;
                }
                this.setStatus('生成中');
                this.lastAudioUrl = url;
                this.lastAudioBlob = null;
                const audio = document.getElementById('audio-player');
                try {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error('请求失败');
                    const blob = await res.blob();
                    this.lastAudioBlob = blob;
                    const objectUrl = URL.createObjectURL(blob);
                    audio.src = objectUrl;
                    document.getElementById('audio-preview').style.display = 'block';
                    this.setStatus('就绪');
                    if (autoPlay) {
                        audio.play();
                    }
                } catch (e) {
                    audio.src = url;
                    document.getElementById('audio-preview').style.display = 'block';
                    this.setStatus('链接就绪');
                }
            },
            download: async function() {
                let blob = this.lastAudioBlob;
                if (!blob && this.lastAudioUrl) {
                    try {
                        const res = await fetch(this.lastAudioUrl);
                        if (res.ok) blob = await res.blob();
                    } catch (e) {}
                }
                if (!blob) {
                    app.showToast('无法获取音频数据', 'error');
                    return;
                }
                let ext = 'mp3';
                if (this.engine === 'custom') {
                    ext = document.getElementById('custom-ext').value || 'mp3';
                } else if (this.engine === 'webspeech') {
                    ext = (blob.type || '').includes('webm') ? 'webm' : 'wav';
                }
                const name = `tts-${Date.now()}.${ext}`;
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = name;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            },
            clear: function() {
                document.getElementById('tts-input').value = '';
                this.updateCount();
                this.stop();
            }
        };
        ttsTool.init();

        // data-action registrations (replaces inline onclick=/onchange=/oninput=)
        if (window.app && app.action) {
            app.action('tts.clear', function () { ttsTool.clear(); });
            app.action('tts.refresh-voices', function () { ttsTool.refreshVoices(); });
            app.action('tts.on-engine-change', function () { ttsTool.onEngineChange(); });
            app.action('tts.filter-voices', function () { ttsTool.filterVoices(); });
            app.action('tts.speak', function () { ttsTool.speak(); });
            app.action('tts.pause', function () { ttsTool.pause(); });
            app.action('tts.resume', function () { ttsTool.resume(); });
            app.action('tts.stop', function () { ttsTool.stop(); });
            app.action('tts.record-webspeech', function () { ttsTool.recordWebSpeech(); });
            app.action('tts.generate', function () { ttsTool.generate(); });
            app.action('tts.download', function () { ttsTool.download(); });
        }
    
