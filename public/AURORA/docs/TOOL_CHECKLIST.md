# 工具开发检查清单

开发新工具或修改现有工具时，请逐项检查以下内容。

---

## 一、HTML 检查

### 文档结构
- [ ] 使用标准 HTML5 文档结构
- [ ] `<html lang="zh-CN">` 设置正确
- [ ] `<meta charset="UTF-8">` 存在
- [ ] `<meta name="viewport">` 存在
- [ ] `<title>` 包含工具名称

### Body 类
- [ ] body 包含 `scroll-content` 类
- [ ] 没有在 body 上使用内联 style

### ID 命名
- [ ] 所有 ID 使用工具前缀
- [ ] 格式：`{tool-prefix}-{element}`
- [ ] 示例：`qrcode-text`, `hash-input`, `glitch-canvas`

### 布局容器
- [ ] 使用标准布局容器（workspace / layout-sidebar / layout-split / layout-vertical）
- [ ] 布局符合工具需求

---

## 二、CSS 检查

### 全局组件
- [ ] 没有重定义 `.btn` 系列样式
- [ ] 没有重定义 `.panel` 系列样式
- [ ] 没有重定义 `.upload-area`（使用 `.upload-zone`）

### CSS 变量
- [ ] 使用 `var(--bg-deep)` 而非硬编码背景色
- [ ] 使用 `var(--text-main)` 而非硬编码文字色
- [ ] 使用 `var(--primary)` 而非硬编码主色
- [ ] 使用 `var(--border)` 而非硬编码边框色

### 工具特有样式
- [ ] 仅定义工具独有的样式
- [ ] 样式命名使用 `.tool-{name}-{component}` 格式
- [ ] 没有冗余的重复样式

### 响应式
- [ ] 移动端显示正常
- [ ] 使用媒体查询适配不同屏幕

---

## 三、JavaScript 检查

### 变量命名
- [ ] 变量使用 camelCase
- [ ] 常量使用 UPPER_SNAKE_CASE
- [ ] 私有变量使用 `_` 前缀

### 事件绑定
- [ ] 使用 `addEventListener` 绑定事件
- [ ] 避免内联 `onclick` 属性

### Toast 调用
- [ ] 使用标准模式：`if (app && app.showToast) app.showToast(...)`
- [ ] 成功消息使用默认类型
- [ ] 错误消息使用 `'error'` 类型

### Worker 初始化
- [ ] 使用 `app.getWorker()` 获取 Worker
- [ ] 包含降级逻辑
- [ ] 实现 `onmessage` 和 `onerror` 处理

### 资源清理
- [ ] 实现 `destroy()` 方法
- [ ] 在 `beforeunload` 时调用清理
- [ ] 正确释放 Worker

### 注释
- [ ] 文件头有工具描述注释
- [ ] 函数有 JSDoc 注释
- [ ] 复杂逻辑有说明注释

---

## 四、Worker 检查（如使用）

### 消息格式
- [ ] 请求消息包含 `type` 字段
- [ ] 成功响应使用 `type: 'success'`
- [ ] 错误响应使用 `type: 'error'`
- [ ] 包含 `requestId`（如需异步匹配）

### Buffer 处理
- [ ] 使用 Transferable 对象传递数据
- [ ] 正确使用 `[buffer]` 参数

### 错误处理
- [ ] 使用 try-catch 捕获错误
- [ ] 发送错误响应到主线程

### 依赖加载
- [ ] 正确使用 `importScripts` 加载依赖
- [ ] 处理依赖加载失败情况

---

## 五、功能测试

### 基本功能
- [ ] 核心功能正常工作
- [ ] 所有按钮可点击
- [ ] 输入输出正常
- [ ] 文件上传下载正常

### 边界情况
- [ ] 空输入处理正确
- [ ] 大文件处理正常
- [ ] 无效输入有错误提示

### Worker 降级
- [ ] Worker 不可用时降级处理正常
- [ ] 主线程处理结果正确

---

## 六、兼容性测试

### 浏览器
- [ ] Chrome 最新版测试通过
- [ ] Firefox 最新版测试通过
- [ ] Edge 最新版测试通过

### 移动端
- [ ] 移动端布局正常
- [ ] 触摸操作正常
- [ ] 响应式样式正确

---

## 七、性能检查

### 加载性能
- [ ] 页面加载速度正常
- [ ] 依赖按需加载

### 运行性能
- [ ] 大文件处理不卡顿
- [ ] 内存使用正常
- [ ] 没有内存泄漏

---

## 八、文档检查

### README
- [ ] 工具已在 README 中列出
- [ ] 工具描述准确

### 代码规范
- [ ] 符合 CODING_STANDARDS.md 规范

---

## 快速检查表

```
□ body 有 scroll-content 类
□ ID 使用工具前缀
□ 没有重定义全局组件
□ 使用 CSS 变量
□ 使用 addEventListener
□ Toast 调用标准
□ Worker 有降级
□ 有 destroy 方法
□ 有注释
□ 功能测试通过
□ 移动端测试通过
```
