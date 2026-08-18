/* Extracted from network-ip.html (refactor script). Tool logic. */

        ResourceLoader.loadDeps('@icons').catch(() => {});
        document.addEventListener('DOMContentLoaded', function() {
            const userIpElement = document.getElementById('user-ip');
            const loadingInfo = document.getElementById('loading-info');
            const ipInfo = document.getElementById('ip-info');
            const validateBtn = document.getElementById('validate-btn');
            const validationResult = document.getElementById('validation-result');
            const copyIpBtn = document.getElementById('copy-ip-btn');
            const refreshIpBtn = document.getElementById('refresh-ip-btn');
            
            // 缓存IP详细信息，避免重复请求
            let cachedIPDetails = null;

            // 多个IP查询API优先级配置：
            // 1. ipapi.co (首选，含详细信息)
            // 2. ipify (快速稳定，仅IP)
            // 3. ipinfo.io (备用)
            const ipApis = [
                'https://ipapi.co/json/',
                'https://api.ipify.org?format=json',
                'https://ipinfo.io/json'
            ];
            
            // 更新API状态指示器
            function updateApiStatus(index, status) {
                const statusElement = document.getElementById(`api${index+1}-status`);
                statusElement.className = `status-dot ${status ? 'active' : 'inactive'}`;
            }
            
            // 尝试多个API获取IP地址
            async function getIPAddress() {
                for (let i = 0; i < ipApis.length; i++) {
                    try {
                        updateApiStatus(i, true);
                        const response = await fetch(ipApis[i]);
                        if (!response.ok) throw new Error('API响应错误');
                        
                        const data = await response.json();
                        const ip = data.ip || data.query;
                        
                        if (ip) {
                            // 如果API返回了详细信息（如国家/城市），则缓存起来
                            if (data.country || data.city || data.country_name) {
                                console.log(`API ${i+1} 返回了详细信息，已缓存`);
                                cachedIPDetails = data;
                            }

                            userIpElement.textContent = ip;
                            document.getElementById('data-source').textContent = `API ${i+1}`;
                            return ip;
                        }
                    } catch (error) {
                        console.error(`API ${i+1} 失败:`, error);
                        updateApiStatus(i, false);
                    }
                }
                
                // 如果所有API都失败，使用模拟数据
                userIpElement.textContent = '无法获取真实IP';
                document.getElementById('data-source').textContent = 'API Error';
                return '127.0.0.1'; 
            }
            
            // 获取IP详细信息
            async function getIPDetails(ip) {
                try {
                    // 尝试使用多个IP信息API
                    const apis = [
                        `https://ipapi.co/${ip}/json/`,
                        `https://ipwhois.app/json/${ip}`,
                        `https://api.ipgeolocation.io/ipgeo?apiKey=demo&ip=${ip}`
                    ];
                    
                    for (const api of apis) {
                        try {
                            const response = await fetch(api);
                            if (!response.ok) continue;
                            
                            const data = await response.json();
                            return data;
                        } catch (error) {
                            console.error('IP详情API错误:', error);
                        }
                    }
                    
                    // 如果所有API都失败
                    return null;
                } catch (error) {
                    console.error('获取IP详情失败:', error);
                    return null;
                }
            }
            
            // 初始化页面
            async function init() {
                const ip = await getIPAddress();
                if (ip === '127.0.0.1') {
                     loadingInfo.style.display = 'none';
                     return;
                }

                let data = null;
                
                // 如果缓存中有对应此IP的详细数据，直接使用
                if (cachedIPDetails && (cachedIPDetails.ip === ip || cachedIPDetails.query === ip)) {
                    console.log('使用缓存的IP详细信息');
                    data = cachedIPDetails;
                } else {
                    // 否则查询详情API
                    data = await getIPDetails(ip);
                }
                
                if (data) {
                    // 更新页面上的IP信息
                    document.getElementById('country').textContent = data.country_name || data.country || '-';
                    document.getElementById('region').textContent = data.region || data.regionName || '-';
                    document.getElementById('city').textContent = data.city || '-';
                    document.getElementById('zip').textContent = data.postal || data.zip || '-';
                    document.getElementById('timezone').textContent = data.timezone || '-';
                    document.getElementById('isp').textContent = data.org || data.isp || '-';
                    document.getElementById('org').textContent = data.org || '-';
                    document.getElementById('as').textContent = data.asn || data.as || '-';
                    document.getElementById('ip-version').textContent = data.version || '-';
                    document.getElementById('location').textContent = 
                        `${data.latitude || '-'}, ${data.longitude || '-'}`;
                    document.getElementById('language').textContent = data.languages || '-';
                    document.getElementById('currency').textContent = data.currency || data.currency_code || '-';
                    
                    document.getElementById('ip-type').textContent = 'Public';
                    document.getElementById('proxy').textContent = 'Unknown';
                    document.getElementById('connection-type').textContent = 'Unknown';
                }
                
                // 隐藏加载指示器，显示信息
                loadingInfo.style.display = 'none';
                ipInfo.style.display = 'grid';
            }
            
            // IP地址验证功能
            validateBtn.addEventListener('click', function() {
                const ipInput = document.getElementById('ip-input').value.trim();
                
                if (!ipInput) {
                    showValidationResult('请输入要验证的IP地址', 'error');
                    return;
                }
                
                // 简单的IP地址格式验证
                const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
                
                if (!ipRegex.test(ipInput)) {
                    showValidationResult('IP地址格式不正确', 'error');
                    return;
                }
                
                // 显示验证中
                showValidationResult('正在验证IP地址...', 'info');
                
                // 验证IP
                getIPDetails(ipInput)
                    .then(data => {
                        if (!data) {
                            showValidationResult('无法验证该IP地址', 'error');
                            return;
                        }
                        
                        let resultHTML = `
                            <h4>IP地址验证结果: ${ipInput}</h4>
                            <div class="info-item">
                                <span class="info-label">国家:</span>
                                <span class="info-value">${data.country_name || data.country || '未知'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">地区:</span>
                                <span class="info-value">${data.region || data.regionName || '未知'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">城市:</span>
                                <span class="info-value">${data.city || '未知'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">ISP:</span>
                                <span class="info-value">${data.org || data.isp || '未知'}</span>
                            </div>
                        `;
                        
                        showValidationResult(resultHTML, 'success');
                    })
                    .catch(error => {
                        console.error('验证IP时出错:', error);
                        showValidationResult('验证IP地址时出错', 'error');
                    });
            });
            
            // 复制IP地址功能
            copyIpBtn.addEventListener('click', function() {
                const ip = userIpElement.textContent;
                if (ip && ip !== '正在查询...' && ip !== '无法获取真实IP') {
                    navigator.clipboard.writeText(ip)
                        .then(() => {
                            const originalText = copyIpBtn.innerHTML;
                            copyIpBtn.innerHTML = '<i class="fas fa-check"></i> 已复制';
                            setTimeout(() => {
                                copyIpBtn.innerHTML = originalText;
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('复制失败:', err);
                        });
                }
            });
            
            // 刷新IP功能
            refreshIpBtn.addEventListener('click', function() {
                // 旋转图标动画
                const icon = refreshIpBtn.querySelector('i');
                icon.style.transition = 'transform 1s';
                icon.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                    icon.style.transition = 'none';
                    icon.style.transform = 'rotate(0deg)';
                }, 1000);

                // 重置UI状态
                userIpElement.textContent = '正在查询...';
                loadingInfo.style.display = 'block';
                ipInfo.style.display = 'none';
                document.getElementById('data-source').textContent = '-';
                
                // 清除缓存
                cachedIPDetails = null;

                // 重置API状态指示器
                const dots = document.querySelectorAll('.status-dot');
                dots.forEach(dot => dot.className = 'status-dot');
                
                // 重新初始化
                init();
            });
            
            function showValidationResult(message, type) {
                validationResult.innerHTML = message;
                validationResult.style.display = 'block';
                
                // 根据类型设置边框颜色
                if (type === 'success') {
                    validationResult.style.borderLeftColor = 'var(--success)';
                } else if (type === 'error') {
                    validationResult.style.borderLeftColor = 'var(--error)';
                } else {
                    validationResult.style.borderLeftColor = 'var(--primary)';
                }
            }
            
            // 启动初始化
            init();
        });
    
