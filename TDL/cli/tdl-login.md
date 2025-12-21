---
title: "tdl login"
bookHidden: true
---

# tdl login

登录 Telegram

## 简介

登录 Telegram

```
tdl login [flags]
```

## 选项

```
  -d, --desktop string    使用桌面客户端登录，指定 tdata 目录的路径
  -h, --help              login 的帮助
  -p, --password string   两步验证密码 (如果已设置)
      --qr                使用二维码登录。使用官方移动端 App 扫描二维码
      --refresh           刷新二维码 (仅在二维码登录模式下有效)
      --test              连接到测试 DC
      --verify string     验证码 (仅在验证码登录模式下有效)
      --phone string      手机号码 (仅在验证码登录模式下有效)
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
