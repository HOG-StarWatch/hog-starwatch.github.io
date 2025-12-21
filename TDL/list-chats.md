# 列出聊天

## 列出所有聊天

```bash
tdl chat ls
```

## JSON 格式

```bash
tdl chat ls -o json
```

## 过滤器

请参考 [过滤器指南](./expr) 以获取有关过滤器的基本知识。

列出所有可用的过滤字段：

```bash
tdl chat ls -f -
```

列出名字包含 "Telegram" 的频道：

```bash
tdl chat ls -f "Type contains 'channel' && VisibleName contains 'Telegram'"
```

列出具有主题的群组：

```bash
tdl chat ls -f "len(Topics)>0"
```
