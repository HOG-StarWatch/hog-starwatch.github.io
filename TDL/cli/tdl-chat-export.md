---
title: "tdl chat export"
bookHidden: true
---

# tdl chat export

从 (受保护) 聊天导出消息以供下载

## 简介

从 (受保护) 聊天导出消息以供下载

```
tdl chat export [flags]
```

## 选项

```
      --all             导出所有消息，包括非媒体消息，但仍受 filter 和 type 标志影响
  -c, --chat string     聊天 ID 或域名。如果未指定，将使用 'Saved Messages'
  -f, --filter string   通过表达式过滤消息，默认为匹配所有消息。指定 '-' 查看可用字段 (默认 "true")
  -h, --help            export 的帮助
  -i, --input ints      输入数据，取决于导出类型
  -o, --output string   输出 JSON 文件路径 (默认 "tdl-export.json")
      --raw             导出 Telegram MTProto API 的原始消息结构，用于调试
      --reply int       指定频道帖子 ID
      --topic int       指定话题 ID
  -T, --type string     导出类型：[time, id, last]
      --with-content    导出消息内容
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
