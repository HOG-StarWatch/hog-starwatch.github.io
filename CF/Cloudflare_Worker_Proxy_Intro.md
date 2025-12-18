# Cloudflare Worker 反向代理脚本介绍

本文档介绍一个用于 Cloudflare Workers 的 JavaScript 脚本，主要功能是将请求反向代理到任意目标服务器（如 Hugging Face Spaces、自有服务器等），同时处理跨域资源共享 (CORS) 和请求头修正。

## 脚本内容

```javascript
export default {
  async fetch(request, env, ctx) {
    // 变量名称：TARGET_URL
    // 从环境变量读取目标URL
    // https://example.com 或 https://username-spacename.hf.space
    const TARGET_URL = env.TARGET_URL;

    // 检查环境变量是否已配置
    if (!TARGET_URL) {
      return new Response(
        'Internal Server Error: Proxy target is not configured.\n\n' +
        'Please set TARGET_URL environment variable in your Worker settings.',
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store' 
          } 
        }
      );
    }

    // 验证目标URL格式
    let targetBaseUrl;
    try {
      targetBaseUrl = new URL(TARGET_URL);
    } catch (e) {
      return new Response(
        `Internal Server Error: Invalid target URL configuration.\n\n` +
        `Current value: "${TARGET_URL}"\n` +
        `Error: ${e.message}`,
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store' 
          } 
        }
      );
    }

    // 确保目标URL以/结尾，避免路径拼接问题
    const normalizedBaseUrl = TARGET_URL.endsWith('/') 
      ? TARGET_URL.slice(0, -1) 
      : TARGET_URL;

    // 构造代理请求的URL
    const incomingUrl = new URL(request.url);
    const pathWithQuery = incomingUrl.pathname + incomingUrl.search;
    
    // 处理根路径
    const targetPath = pathWithQuery === '/' ? '' : pathWithQuery;
    const targetUrl = normalizedBaseUrl + targetPath;

    // 复制并修改请求头
    const newHeaders = new Headers(request.headers);
    
    // 更新Host头为目标域名
    newHeaders.set('Host', targetBaseUrl.host);
    
    // 删除可能引起问题的头
    newHeaders.delete('Origin');
    newHeaders.delete('Referer');
    
    // 添加X-Forwarded-*头用于后端识别（可选）
    const clientIp = request.headers.get('CF-Connecting-IP') || '';
    if (clientIp) {
      newHeaders.set('X-Forwarded-For', clientIp);
    }
    newHeaders.set('X-Forwarded-Host', incomingUrl.host);
    newHeaders.set('X-Forwarded-Proto', incomingUrl.protocol.replace(':', ''));

    // 创建转发请求
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: newHeaders,
      body: request.body,
      redirect: 'follow', // 自动处理重定向
      cf: {
        // 保留Cloudflare的安全特性
        scrapeShield: true,
        polish: 'off'
      }
    });

    // 发起请求并返回响应
    try {
      const response = await fetch(proxyRequest);
      
      // 创建新的响应对象
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
      
      // 添加CORS头，允许所有来源访问（可选）
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      newResponse.headers.set('Access-Control-Allow-Headers', '*');
      
      return newResponse;
      
    } catch (error) {
      // 错误处理
      console.error('Proxy fetch failed:', error);
      
      return new Response(
        `Bad Gateway: Unable to connect to the target server.\n\n` +
        `Target URL: ${targetUrl}\n` +
        `Error: ${error.message}`,
        { 
          status: 502, 
          headers: { 
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store' 
          } 
        }
      );
    }
  },
  
  // 处理OPTIONS预检请求（CORS）
  async options(request) {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
};
```

## 详细解析

### 1. 核心功能
该脚本是一个 Cloudflare Worker，拦截所有传入的 HTTP 请求，并将其转发到环境变量 `TARGET_URL` 指定的目标服务器。它特别适合用于解决前端应用调用第三方 API 时的跨域问题，或者为后端服务提供自定义域名。

### 2. 配置与环境检查
```javascript
const TARGET_URL = env.TARGET_URL;
```
- **依赖配置**：脚本完全依赖 `TARGET_URL` 环境变量。用户必须在 Cloudflare Dashboard 中配置此变量（例如：`https://my-space.hf.space` 或 `https://api.example.com`）。
- **健壮性检查**：脚本会检查变量是否存在以及 URL 格式是否合法，若配置错误会返回 `500 Internal Server Error` 并给出明确的提示信息。

### 3. 请求转发逻辑
- **URL 构造**：脚本将传入请求的路径（pathname）和查询参数（search）拼接到目标 Base URL 后。它智能处理了末尾斜杠，防止出现 `//` 双斜杠路径。
- **Host 头修正**：
  ```javascript
  newHeaders.set('Host', targetBaseUrl.host);
  ```
  这是反向代理的关键步骤。目标服务器通常依赖 `Host` 头来路由请求，因此必须将其修改为目标域名。
- **清理请求头**：删除了 `Origin` 和 `Referer`，以避免目标服务器拒绝来自不同源的请求。
- **保留客户端信息**：添加了 `X-Forwarded-For`、`X-Forwarded-Host` 等标准代理头，以便后端能获取真实的客户端 IP 和原始请求信息。

### 4. CORS (跨域资源共享) 支持
脚本在两个层面处理了 CORS，使其非常适合作为 API 网关：
1.  **响应头注入**：
    在转发请求并收到响应后，脚本会向响应头中添加 `Access-Control-Allow-Origin: *` 等字段，允许任何域名的前端代码访问此接口。
2.  **OPTIONS 请求处理**：
    ```javascript
    async options(request) { ... }
    ```
    脚本显式定义了 `options` 方法，直接响应浏览器的预检请求（Preflight Requests），无需转发到后端，提高了效率并确保跨域检查通过。

### 5. 错误处理
- 使用 `try-catch` 块包裹了 `fetch` 请求。
- 如果无法连接到目标服务器（例如目标宕机或网络问题），会捕获异常并返回 `502 Bad Gateway`，同时在响应体中包含错误详情，方便调试。

## 使用场景
- **解决混合内容问题**：将 HTTP 网站请求转发到 HTTPS 的后端服务。
- **自定义域名**：将 Cloudflare 绑定的自定义域名指向任意后端服务。
- **API 跨域代理**：前端开发时，解决直接调用第三方 API 的 CORS 限制。
