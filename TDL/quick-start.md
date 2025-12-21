# 快速开始

## 登录

我们不在这里指定命名空间，它将使用 `default` 命名空间。如果你想使用其他命名空间，可以使用 `-n` 标志指定命名空间。

### **使用桌面客户端登录**

::: warning
请确保从[官方网站](https://desktop.telegram.org/)下载客户端（不要从 Microsoft Store 或 App Store 下载）
:::

使用默认路径：

```bash
tdl login
```

如果您设置了本地密码：

```bash
tdl login -p YOUR_PASSCODE
```

或者指定自定义客户端路径：

```bash
tdl login -d /path/to/TelegramDesktop
```

### **使用二维码登录**

```bash
tdl login -T qr
```

### **使用手机号码和验证码登录**

```bash
tdl login -T code
```

## 下载

我们从 Telegram 官方频道下载文件：

```bash
tdl dl -u https://t.me/telegram/193
```
