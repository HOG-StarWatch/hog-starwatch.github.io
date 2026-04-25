# TDL Manager GUI

Telegram Desktop Downloader (TDL) 图形化管理工具，基于 Python + Tkinter 构建。

## 项目结构

```
tdl_gui.py      # 主程序入口，包含所有界面和业务逻辑
```

## 环境要求

- Python 3.8+
- Windows 操作系统（部分功能如注册表操作仅支持 Windows）
- TDL 命令行工具（程序内支持一键下载安装）

## 依赖说明

| 依赖包 | 用途 |
|--------|------|
| tkinter | GUI 图形界面（Python 内置） |
| subprocess | 执行 TDL 命令行工具 |
| threading | 多线程执行后台任务，避免界面卡顿 |
| queue | 线程间通信，传递命令输出 |
| urllib.request | 下载 TDL 安装包 |
| zipfile | 解压 TDL 安装包 |
| winreg | Windows 注册表操作，添加环境变量 |
| json | 配置文件的读取和保存 |
| re | 控制台输出进度解析 |

## 功能模块

### 1. 环境检查 (Env)
- 检查 TDL 是否已安装并可用
- 一键下载安装 TDL（Windows x64 版本）
- 将安装目录添加到系统 PATH 环境变量

### 2. 全局设置 (Global)
所有 TDL 命令都会携带以下全局参数：
| 参数 | 说明 |
|------|------|
| -n/--ns | 命名空间，每个命名空间代表一个 Telegram 帐号 |
| --proxy | 代理服务器，如 `socks5://localhost:1080` |
| --storage | 存储类型和路径，默认 `type=bolt,path=~/.tdl/data` |
| --ntp | NTP 时间服务器 |
| --reconnect-timeout | 重连超时时间 |
| --pool | 连接池大小 |
| --delay | 任务延迟，防止限流 |
| --debug | 开启调试日志 |

### 3. 登录 (Login)
| 方式 | 说明 |
|------|------|
| 桌面客户端登录 | 指定 Telegram Desktop 路径进行登录 |
| 二维码登录 | 使用手机 Telegram App 扫描二维码 |
| 手机验证码登录 | 输入手机号接收验证码 |

### 4. 工具 (Tools)
- **列出聊天**：列出所有 Telegram 聊天，支持过滤器
- **导出成员**：导出指定聊天的成员列表
- **导出消息**：按时间/ID范围导出聊天消息

### 5. 下载 (Download)
支持的功能：
- 多 URL 下载（每行一个）
- 导入 JSON 格式的导出文件
- 自定义保存目录和文件命名模板
- 文件扩展名白名单/黑名单过滤
- 多线程下载（默认 8 线程）
- 并发任务数控制（默认 4 个）
- 附加选项：反序下载、MIME重命名、相册探测、跳过相同文件、Takeout会话、恢复下载、重新下载、HTTP文件服务器

### 6. 上传 (Upload)
支持的功能：
- 上传文件或整个目录
- 目标聊天和主题指定
- 消息路由表达式
- 自定义标题（支持表达式引擎）
- 文件扩展名过滤
- 多线程上传
- 上传后删除源文件、作为照片上传

### 7. 转发 (Forward)
支持的功能：
- 从 URL 或 JSON 文件获取消息来源
- 目标聊天指定
- 消息编辑表达式
- 转发模式：`direct`（官方API）或 `clone`（复制方式）
- 试运行模式、静默发送、取消分组、反序

## 编译说明

使用 PyInstaller 将源码编译为独立可执行文件：

```bash
pyinstaller --onefile --windowed --name TDL_GUI tdl_gui.py
```

编译后的 exe 文件位于 `dist\TDL_GUI.exe`。

如需重新编译，请先删除 `build`、`dist` 目录以及 `*.spec` 文件。

## 运行方式

### 方式一：直接运行 exe
双击 `dist\TDL_GUI.exe` 运行（无需 Python 环境）。

### 方式二：运行源码
```bash
python tdl_gui.py
```

## 配置文件

程序会在同目录下生成 `tdl_gui_config.json` 保存用户设置，包括：
- 安装目录路径
- 全局命名空间、代理、存储设置
- 下载和上传的默认目录/聊天

## 注意事项

1. 首次使用建议先在「环境检查」页面安装 TDL
2. 登录操作会在新终端窗口中打开，请留意弹出的窗口
3. 部分功能需要 TDL 已正确配置和登录
4. GUI 程序可能需要重启才能获取到更新后的 PATH 环境变量
5. 配置文件路径仅支持 ASCII 字符，避免路径中出现中文或特殊符号

## 技术要点

- **多线程模型**：使用独立线程执行 TDL 命令，主线程负责 UI 渲染，通过 queue 传递输出
- **进度解析**：使用正则表达式解析控制台输出中的进度百分比和速度信息
- **动态主题**：尝试加载 `azure.tcl` 主题，失败时回退到 `clam` 主题
- **进程管理**：使用 `subprocess.CREATE_NO_WINDOW` 避免弹出黑窗口，使用 `STARTUPINFO` 隐藏控制台
- **注册表操作**：使用 `winreg` 模块修改当前用户的环境变量 PATH
