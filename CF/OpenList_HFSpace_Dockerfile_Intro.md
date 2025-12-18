# OpenList Hugging Face Space Dockerfile 介绍

本文档介绍用于在 Hugging Face Spaces 上部署 OpenList 的 Dockerfile。该配置针对 Hugging Face Spaces 的运行环境进行了适配，特别是端口和权限方面的设置。

## Dockerfile 内容

```dockerfile
FROM openlistteam/openlist:latest

# 1. 设置环境变量 (根据嵌套逻辑，通常格式如下)
ENV OPENLIST_SCHEME_HTTP_PORT=7860
ENV OPENLIST_PORT=7860
ENV PORT=7860

USER root

# 2. 准备目录
RUN mkdir -p /opt/openlist/data && chmod -R 777 /opt/openlist/data

WORKDIR /opt/openlist

# 3. 写入修正后的 config.json (包含你发现的正确嵌套结构)
RUN echo '{"scheme": {"address": "0.0.0.0", "http_port": 7860, "https_port": -1}}' > /opt/openlist/data/config.json

# 4. 暴露端口
EXPOSE 7860

# 5. 启动
CMD ["./openlist", "server", "--data", "/opt/openlist/data"]
```

## 详细解析

### 1. 基础镜像
```dockerfile
FROM openlistteam/openlist:latest
```
使用官方的 `openlistteam/openlist:latest` 作为基础镜像，确保拥有最新的 OpenList 功能。

### 2. 环境变量配置
```dockerfile
ENV OPENLIST_SCHEME_HTTP_PORT=7860
ENV OPENLIST_PORT=7860
ENV PORT=7860
```
Hugging Face Spaces 默认使用 `7860` 端口。这里设置了多个相关的环境变量以确保 OpenList 能够正确绑定到该端口：
- `OPENLIST_SCHEME_HTTP_PORT`: OpenList 内部 HTTP 服务的端口。
- `OPENLIST_PORT`: 通用端口变量。
- `PORT`: 许多云平台（包括 HF Spaces）通用的端口环境变量。

### 3. 权限与目录准备
```dockerfile
USER root
RUN mkdir -p /opt/openlist/data && chmod -R 777 /opt/openlist/data
WORKDIR /opt/openlist
```
- 切换到 `root` 用户以执行特权操作。
- 创建数据目录 `/opt/openlist/data` 并赋予 `777` 权限（读写执行），确保在非 root 用户运行容器时也能正常写入数据。
- 设置工作目录为 `/opt/openlist`。

### 4. 配置文件生成
```dockerfile
RUN echo '{"scheme": {"address": "0.0.0.0", "http_port": 7860, "https_port": -1}}' > /opt/openlist/data/config.json
```
直接在构建过程中生成 `config.json` 文件，强制指定监听地址为 `0.0.0.0`（允许外部访问）和端口 `7860`。`https_port` 设置为 `-1` 以禁用 HTTPS（通常由 HF Spaces 的反向代理处理 SSL）。

### 5. 端口暴露与启动命令
```dockerfile
EXPOSE 7860
CMD ["./openlist", "server", "--data", "/opt/openlist/data"]
```
- `EXPOSE 7860`: 声明容器服务端口。
- `CMD`: 启动 OpenList 服务器，并指定数据目录位置。
