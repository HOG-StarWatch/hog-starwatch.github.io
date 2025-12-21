---
title: "tdl download"
bookHidden: true
---

# tdl download

从 Telegram (受保护) 聊天下载任何内容

## 简介

从 Telegram (受保护) 聊天下载任何内容

```
tdl download [flags]
```

## 选项

```
      --continue          直接继续上次下载
      --desc              从最新到最旧的文件下载 (可能会影响恢复下载)
  -d, --dir string        指定下载目录。如果目录不存在，将自动创建 (默认 "downloads")
  -e, --exclude strings   排除指定的文件扩展名，仅根据文件名判断，而非文件 MIME。示例：-e png,jpg
  -f, --file strings      官方客户端导出的文件
      --group             自动检测分组消息并全部下载
  -h, --help              download 的帮助
  -i, --include strings   包含指定的文件扩展名，仅根据文件名判断，而非文件 MIME。示例：-i mp4,mp3
      --port int          HTTP 服务器端口 (默认 8080)
      --restart           直接重新开始上次下载
      --rewrite-ext       根据文件头 MIME 重写文件扩展名
      --serve             作为 HTTP 服务器提供媒体文件，而不是使用内置下载器下载
      --skip-same         跳过具有相同名称 (不带扩展名) 和大小的文件
      --takeout           takeout 会话允许您以较低的洪水等待限制从您的帐户导出数据。
      --template string   下载文件名模板 (默认 "{{ .DialogID }}_{{ .MessageID }}_{{ filenamify .FileName }}")
  -u, --url strings       Telegram 消息链接
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
