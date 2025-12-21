# 迁移

备份或恢复您的数据

## 备份

将您的数据备份到文件中。默认值：`<date>.backup.tdl`。

```bash
tdl backup
```

或者指定输出文件：

```bash
tdl backup -d /path/to/custom.tdl
```

## 恢复

从备份文件中恢复您的数据。

```bash
tdl recover -f /path/to/custom.backup.tdl
```

## 迁移

将数据迁移到另一个存储中

查看[`存储--storage`](./global-config#storage)以获取存储选项的详细信息。

迁移当前存储到文件类型存储：

```bash
tdl migrate --to type=file,path=/path/to/data.json
```

迁移自定义存储到文件类型存储：

```bash
tdl migrate --storage type=bolt,path=/path/to/data-directory  --to type=file,path=/path/to/data.json
```
