/* Extracted from network-rdap.html (refactor script). Tool logic. */

    let currentFullUrl = "";
    let lastFetchedData = null;

    function openNodeRoot() {
        const root = document.getElementById('nodeSelect').value.split('domain/')[0];
        window.open(root, '_blank');
    }

    function updateStatus(msg) {
        document.getElementById('status').innerText = msg;
    }

    // 核心渲染函数
    function renderRdapData(data) {
        const resultDiv = document.getElementById('parseResult');
        const exportBtn = document.getElementById('exportBtn');
        const toolBar = document.getElementById('toolBar');
        
        // 1. 同步显示到文本框
        document.getElementById('jsonInput').value = JSON.stringify(data, null, 2);
        lastFetchedData = data;

        // 2. 显示工具栏和下载按钮
        toolBar.classList.remove('hidden');
        exportBtn.classList.remove('hidden');

        // 3. 提取字段逻辑
        const getRegistrar = () => {
            const ent = data.entities?.find(e => e.roles?.includes('registrar'));
            return ent?.vcardArray?.[1]?.find(i => i[0]==='fn')?.[3] || ent?.handle || "未知";
        };

        const infoItems = [
            { label: "域名主体", val: data.ldhName },
            { label: "注册商", val: getRegistrar() },
            { label: "状态 (Status)", val: (data.status || []).join(' / ') },
            { label: "WHOIS 服务器", val: data.port43 },
        ];

        // 提取时间点
        const events = (data.events || []).map(e => ({
            label: `时间点: ${e.eventAction}`,
            val: new Date(e.eventDate).toLocaleString()
        }));

        const allItems = [...infoItems, ...events];

        let html = '<div class="result-grid">';
        allItems.forEach(item => {
            if(item.val) {
                html += `<div class="card">
                    <div class="card-label">${item.label}</div>
                    <div class="card-val">${item.val}</div>
                </div>`;
            }
        });
        html += '</div>';
        resultDiv.innerHTML = html;
        document.getElementById('dataInfo').innerText = "数据已同步至解析器";
    }

    // 在线查询
    async function doSearch() {
        const domain = document.getElementById('domainInput').value.trim();
        const server = document.getElementById('nodeSelect').value;
        
        if (!domain) return alert("请输入域名");

        updateStatus("正在请求 API 数据...");
        document.getElementById('parseResult').innerHTML = "";
        document.getElementById('dataInfo').innerText = "";
        currentFullUrl = server + domain;

        try {
            const response = await fetch(currentFullUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            updateStatus("获取成功");
            renderRdapData(data);
        } catch (err) {
            updateStatus("自动获取失败 (CORS跨域限制或域名不存在)");
            document.getElementById('parseResult').innerHTML = `
                <div class="hint">
                    <b>受浏览器安全政策影响，自动解析失败。</b><br>
                    请执行以下步骤：<br>
                    1. 点击下方的蓝色按钮打开 API 页面。<br>
                    2. <b>全选并复制</b> 页面上的所有代码。<br>
                    3. 粘贴到中间文本框后点击 <b>“解析文本框中的 JSON”</b>。
                </div>`;
            document.getElementById('toolBar').classList.remove('hidden');
            document.getElementById('apiUrlBtn').classList.remove('hidden');
        }
    }

    // 手动解析
    function parseManualJson() {
        const input = document.getElementById('jsonInput').value;
        if(!input) return alert("文本框中没有数据");
        try {
            const data = JSON.parse(input);
            updateStatus("本地解析完成");
            renderRdapData(data);
        } catch (e) {
            alert("解析失败：JSON 格式不正确。请确保您复制了完整的 { ... } 括号内容。");
        }
    }

    // 导出文件功能
    function exportJsonFile() {
        if(!lastFetchedData) return;
        const dataStr = JSON.stringify(lastFetchedData, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `rdap_${lastFetchedData.ldhName || 'export'}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    function clearAll() {
        document.getElementById('jsonInput').value = "";
        document.getElementById('domainInput').value = "";
        document.getElementById('parseResult').innerHTML = "";
        document.getElementById('toolBar').classList.add('hidden');
        document.getElementById('exportBtn').classList.add('hidden');
        document.getElementById('dataInfo').innerText = "";
        updateStatus("");
        lastFetchedData = null;
    }

    // data-action registrations (replaces inline onclick=)
    if (window.app && app.action) {
        app.action('openNodeRoot', function () { openNodeRoot(); });
        app.action('doSearch', function () { doSearch(); });
        app.action('parseManualJson', function () { parseManualJson(); });
        app.action('exportJsonFile', function () { exportJsonFile(); });
        app.action('clearAll', function () { clearAll(); });
        app.action('rdap.open-current-url', function () { window.open(currentFullUrl, '_blank'); });
    }

