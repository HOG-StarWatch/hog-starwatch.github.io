---
title: "tdl chat users"
bookHidden: true
---

# tdl chat users

从 (受保护) 频道导出用户

## 简介

从 (受保护) 频道导出用户

```
tdl chat users [flags]
```

## 选项

```
  -c, --chat string     域名 ID (频道, 超级群组等)
  -h, --help            users 的帮助
  -o, --output string   输出 JSON 文件路径 (默认 "tdl-users.json")
      --raw             导出 Telegram MTProto API 的原始消息结构，用于调试
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

* [tdl chat](tdl-chat.md)	 - 一组聊天工具
