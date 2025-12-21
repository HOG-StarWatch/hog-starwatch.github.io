# 上传

## 上传文件

上传指定的文件和目录到 `保存的消息`：

```bash
tdl up -p /path/to/file -p /path/to/dir
```

## 自定义目标

上传到自定义聊天。

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

## 指定聊天

上传到指定的聊天：

```bash
tdl up -p /path/to/file -c CHAT
```

上传到论坛型聊天的指定主题：

```bash
tdl up -p /path/to/file -c CHAT --topic TOPIC_ID
```

## 消息路由

通过基于[表达式](./expr)的消息路由，将文件上传到不同的聊天：

::: warning
`--to` 标志与 `-c/--chat` 和 `--topic` 标志冲突，只能使用其中一个。
:::

列出所有可用字段：

```bash
tdl up -p /path/to/file --to -
```

如果 MIME 包含 `video` 则上传到 `CHAT1`，否则上传到 `收藏夹`：

::: info
必须返回一个字符串或结构体作为目标聊天，空字符串表示上传到 `收藏夹`。
:::

```bash
tdl up -p /path/to/file \
--to 'MIME contains "video" ? "CHAT1" : ""'
```

如果 MIME 包含 `video` 则上传到 `CHAT1`，否则回复 `CHAT2` 的消息/主题 `4`：

```bash
tdl up -p /path/to/file \
--to 'MIME contains "video" ? "CHAT1" : { Peer: "CHAT2", Thread: 4 }'
```

如果表达式较复杂，可以传递文件名：

::: details router.txt
像使用 `switch` 一样编写表达式：

```javascript
MIME contains "video" ? "CHAT1" :
FileExt contains ".mp3" ? "CHAT2" :
FileName contains "chat3" > 30 ? {Peer: "CHAT3", Thread: 101} :
""
```

:::

```bash
tdl up -p /path/to/file --to router.txt
```

## 自定义参数

使用每个任务8个线程、4个并发任务上传：

```bash
tdl up -p /path/to/file -t 8 -l 4
```

## 自定义标题

使用[表达式引擎](./expr)编写自定义标题。

列出所有可用字段：

```bash
tdl up -p /path/to/file --caption -
```

自定义简单的标题：

```bash
tdl up -p ./path/to/file --caption 'FileName + " - uploaded by tdl"'
```

以[HTML](https://core.telegram.org/bots/api#html-style)格式编写带有样式的消息：

```bash
tdl up -p /path/to/file --caption  \
'FileName + `<b>Bold</b> <a href="https://example.com">Link</a>`'
```

如果表达式较复杂，可以传递文件名：

::: details caption.txt

```javascript
repeat(FileName, 2) + `
<a href="https://www.google.com">Google</a>
<a href="https://www.bing.com">Bing</a>
<b>bold</b>
<i>italic</i>
<code>code</code>
<tg-spoiler>spoiler</tg-spoiler>
<pre><code class="language-go">
package main

import "fmt"

func main() {
    fmt.Println("hello world")
}
</code></pre>
` + MIME
```

:::

```bash
tdl up -p /path/to/file --caption caption.txt
```

## 过滤器

使用扩展名过滤器上传文件：

::: warning
扩展名仅与文件名匹配，而不是 MIME 类型。因此，这可能不会按预期工作。

白名单和黑名单不能同时使用。
:::

白名单：只上传扩展名为 `.jpg` `.png` 的文件

```bash
tdl up -p /path/to/file -p /path/to/dir -i jpg,png
```

黑名单：上传除了扩展名为 `.mp4` `.flv` 的所有文件

```bash
tdl up -p /path/to/file -p /path/to/dir -e mp4 -e flv
```

## 自动删除

删除已上传成功的文件：

```bash
tdl up -p /path/to/file --rm
```

## 照片

将图像作为照片而不是文件上传：

```bash
tdl up -p /path/to/file --photo
```
