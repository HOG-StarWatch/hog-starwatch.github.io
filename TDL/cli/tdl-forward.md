---
title: "tdl forward"
bookHidden: true
---

# tdl forward

具有自动回退和消息路由功能的消息转发

## 简介

具有自动回退和消息路由功能的消息转发

```
tdl forward [flags]
```

## 选项

```
  -d, --delay duration      每条消息的延迟，0 表示无延迟
      --dry-run             试运行，不发送消息
  -f, --from string         源聊天，可以是聊天 ID、用户名或链接
      --grouping duration   分组等待时间，0 表示不分组 (默认 1s)
  -h, --help                forward 的帮助
  -m, --mode string         转发模式：[copy, forward] (默认 "copy")
      --no-fallback         如果发送失败，不回退到其他类型
      --react string        转发成功后对源消息做出反应
      --route string        路由映射，格式：type=target_chat
  -t, --to string           目标聊天，可以是聊天 ID、用户名或链接
```

## 继承自父命令的选项

```
      --debug                        启用调试模式
      --delay duration               每个任务之间的延迟，0 表示无延迟
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

* [tdl](tdl.md)	 - Telegram 下载器，但不仅仅是下载器
