# OpenList Dockerfile 介绍

本文档介绍用于在 Hugging Face Spaces 上部署 OpenList 的 Dockerfile。该配置针对 Hugging Face Spaces 的运行环境进行了适配，设置了时区、端口以及数据目录的权限。

## Dockerfile 内容

```dockerfile
FROM openlistteam/openlist:latest

USER root

RUN mkdir -p /opt/openlist/data && \
    chown -R 0:0 /opt/openlist/data && \
    chmod -R 777 /opt/openlist/data

EXPOSE 5244
ENV TZ=Asia/Shanghai
ENV PORT=5244

VOLUME /opt/openlist/data
```

## 注意：需要在README文件中添加一行

```
app_port: 5244
```

## 详细解析

### 1. 基础镜像
```dockerfile
FROM openlistteam/openlist:latest
```
使用官方的 `openlistteam/openlist:latest` 作为基础镜像，确保拥有最新的 OpenList 功能。

### 2. 用户与权限配置
```dockerfile
USER root

RUN mkdir -p /opt/openlist/data && \
    chown -R 0:0 /opt/openlist/data && \
    chmod -R 777 /opt/openlist/data
```
- **USER root**: 切换到 `root` 用户以执行特权操作。
- **RUN ...**: 
  - 创建数据目录 `/opt/openlist/data`。
  - `chown -R 0:0 ...`: 将目录所有权更改为 root (UID 0) 和 root 组 (GID 0)。
  - `chmod -R 777 ...`: 赋予该目录 `777` 权限（读写执行），确保任何用户身份运行容器时都能写入数据。

### 3. 端口与环境变量
```dockerfile
EXPOSE 5244
ENV TZ=Asia/Shanghai
ENV PORT=5244
```
- **EXPOSE 5244**: 声明容器服务端口为 `5244`。
- **ENV TZ=Asia/Shanghai**: 设置容器时区为亚洲/上海。
- **ENV PORT=5244**: 设置环境变量 `PORT` 为 `5244`，供应用程序使用。

### 4. 数据卷
```dockerfile
VOLUME /opt/openlist/data
```
- **VOLUME**: 声明 `/opt/openlist/data` 为挂载点，用于持久化存储数据。
