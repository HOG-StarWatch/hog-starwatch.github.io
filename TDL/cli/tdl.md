# tdl

Telegram 下载器，但不仅仅是下载器

## 选项

```
      --debug                        启用调试模式
      --delay duration               每个任务之间的延迟，0 表示无延迟
  -h, --help                         tdl 的帮助
  -l, --limit int                    最大并发任务数 (默认 2)
  -n, --ns string                    Telegram 会话的命名空间 (默认 "default")
      --ntp string                   NTP 服务器主机，如果未设置，则使用系统时间
      --pool int                     指定 DC 池的大小，0 表示无限 (默认 8)
      --proxy string                 代理地址，格式：protocol://username:password@host:port
      --reconnect-timeout duration   Telegram 客户端重连回退超时，设置为 0 表示无限 (默认 5m0s)
      --storage stringToString       存储选项，格式：type=driver,key1=value1,key2=value2。可用驱动：[legacy,bolt,file] (默认 [path=/home/runner/.tdl/data,type=bolt])
  -t, --threads int                  传输单个项目的最大线程数 (默认 4)
```

## 参见

- [tdl backup](tdl-backup.md) - 备份你的数据
- [tdl chat](tdl-chat.md) - 一组聊天工具
- [tdl completion](tdl-completion.md) - 生成指定 shell 的自动补全脚本
- [tdl download](tdl-download.md) - 从 Telegram (受保护) 聊天下载任何内容
- [tdl extension](tdl-extension.md) - 管理 tdl 扩展
- [tdl forward](tdl-forward.md) - 具有自动回退和消息路由功能的消息转发
- [tdl login](tdl-login.md) - 登录 Telegram
- [tdl migrate](tdl-migrate.md) - 将当前数据迁移到另一个存储
- [tdl recover](tdl-recover.md) - 恢复你的数据
- [tdl upload](tdl-upload.md) - 上传任何内容到 Telegram
- [tdl version](tdl-version.md) - 查看版本信息
