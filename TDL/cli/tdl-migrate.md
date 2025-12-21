---
title: "tdl migrate"
bookHidden: true
---

# tdl migrate

将当前数据迁移到另一个存储

## 简介

将当前数据迁移到另一个存储

```
tdl migrate [flags]
```

## 选项

```
  -D, --delete                   迁移后删除旧数据
  -d, --dest stringToString      目标存储选项，格式：type=driver,key1=value1,key2=value2。可用驱动：[legacy,bolt,file]
  -h, --help                     migrate 的帮助
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
