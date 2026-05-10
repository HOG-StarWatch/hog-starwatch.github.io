# 贡献指南

感谢您对 Aurora 极光工具箱的关注！本文档将帮助您参与项目开发。

---

## 一、如何贡献

### 1.1 报告问题

如果您发现了 Bug 或有功能建议，请：

1. 检查是否已有相关 Issue
2. 创建新 Issue，包含：
   - 问题描述
   - 复现步骤
   - 预期行为
   - 实际行为
   - 浏览器版本

### 1.2 提交代码

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 进行修改
4. 提交更改：`git commit -m 'feat: 添加某某功能'`
5. 推送分支：`git push origin feature/your-feature`
6. 创建 Pull Request

---

## 二、添加新工具

### 2.1 创建工具文件

在 `tools/` 目录下创建新文件，命名格式：`{category}-{name}.html`

分类前缀：
- `image-` - 图像处理工具
- `text-` - 文本处理工具（可省略）
- `file-` - 文件处理工具
- `network-` - 网络工具
- `ai-` - AI 相关工具

### 2.2 使用工具模板

参考 `docs/templates/tool-template.html` 创建新工具。

### 2.3 注册工具入口

在 `index.html` 的导航栏中添加入口：

```html
<button class="tab-btn" data-src="tools/your-tool.html">工具名称</button>
```

### 2.4 声明依赖（如需要）

在 `js/loader.js` 的 `toolDeps` 中添加：

```javascript
toolDeps: {
    'tools/your-tool.html': ['dependency-name'],
    // ...
}
```

---

## 三、代码规范

请务必阅读并遵循 [编码规范](./CODING_STANDARDS.md)。

关键要点：

- HTML 结构规范
- CSS 使用变量，禁止重定义全局组件
- JavaScript 使用标准模式
- Worker 包含降级处理

---

## 四、测试要求

### 4.1 功能测试

- [ ] 核心功能正常工作
- [ ] 边界情况处理正确
- [ ] 错误提示友好

### 4.2 兼容性测试

- [ ] Chrome 最新版
- [ ] Firefox 最新版
- [ ] Edge 最新版
- [ ] 移动端浏览器

### 4.3 性能测试

- [ ] 大文件处理正常
- [ ] Worker 降级正常
- [ ] 内存无泄漏

---

## 五、提交信息规范

使用约定式提交：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建/工具

### 示例

```
feat(image): 添加图片水印功能

- 支持文字水印
- 支持图片水印
- 支持位置调整

Closes #123
```

---

## 六、开发环境

### 6.1 本地运行

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# 访问 http://localhost:8000
```

### 6.2 目录结构

```
AURORA/
├── css/           # 样式文件
├── js/            # JavaScript 文件
│   └── workers/   # Web Workers
├── tools/         # 工具页面
├── docs/          # 文档
└── index.html     # 入口文件
```

---

## 七、获取帮助

- 查看 [编码规范](./CODING_STANDARDS.md)
- 查看 [工具模板]/docs/templates/tool-template.html
- 查看 [Worker 模板](./templates/worker-template.js)
- 查看 [Worker 协议](./WORKER_PROTOCOL.md)

---

感谢您的贡献！
