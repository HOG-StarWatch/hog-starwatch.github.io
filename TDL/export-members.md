# 导出成员

导出聊天成员/订阅者、管理员、机器人等。

::: info
部分类型用户(被禁用户/被踢出用户/……)导出需要聊天管理员权限。
:::

::: details CHAT 示例
#### 可用值：

- `@iyear` （用户名）
- `iyear` （无前缀 `@` 的用户名）
- `123456789`（ID）
- `https://t.me/iyear` （公开链接）
- `+1 123456789`（电话号码）

#### 如何在 Telegram 桌面端获取聊天 ID：

- `设置` → `高级` → `实验性设置` → `在资料中显示对话 ID`
  
:::

## 默认

将所有用户导出为 `tdl-users.json`

```bash
tdl chat users -c CHAT
```

## 自定义路径

指定文件路径进行导出

```bash
tdl chat users -c CHAT -o /path/to/export.json
```

## 原始数据

导出 Telegram MTProto 原始用户结构，用于调试。

```bash
tdl chat users -c CHAT --raw
```
