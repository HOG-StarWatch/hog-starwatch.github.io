# Delete-WindowsDuplicateFiles
批量删除Windows自动创建的重名文件序号工具

## 简介
这是一个 Windows 重复文件清理[工具](./Delete-WindowsDuplicateFiles.ps1.json)，专门用于清理 Windows 系统自动生成的带有 `(1)`, `(2)` 等序号的副本文件（例如 `document (1).txt`）。

## 功能特性
*   **智能识别**：精准识别 `文件名 (数字).扩展名` 格式的文件。
*   **三种清理模式**：
    *   **默认模式**：只在原始文件存在时才删除副本，确保安全。
    *   **KeepLatest (-KeepLatest)**：保留序号最大的文件（通常是最新版），删除旧版本。
    *   **DeleteAll (-Del)**：强制删除所有副本文件，无论原始文件是否存在。
*   **扩展名过滤**：支持仅处理特定类型的文件（如 `-Ext jpg, png`）。
*   **递归处理**：支持处理子目录 (-Sub)。
*   **安全预览**：支持 `-WhatIf` 模式，预览将要删除的文件而不实际执行。
*   **详细报告**：支持生成包含原始文件信息和大小的详细扫描报告 (-Rep)。
*   **回收站支持**：支持将文件移入回收站而非永久删除 (-Tra)。
*   **UTF-8 支持**：完美支持中文文件名和中文日志输出。

---

## 📜 使用方法

### 1. 环境要求
*   Windows 10/11
*   PowerShell 5.1 或更高版本

### 2. 运行方法
在 PowerShell 中运行：
```powershell
.\Delete-WindowsDuplicateFiles.ps1 [参数]
```

### 3. 参数详解

| 参数 (全称) | 别名 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| `-Path` | 无 | 指定要处理的目录路径 (默认为当前目录) | `-Path "C:\Data"` |
| `-Extensions` | `-Ext` | 仅处理指定扩展名 (逗号分隔) | `-Ext txt, jpg` |
| `-Recursive` | `-Sub` | 递归处理所有子目录 | `-Sub` |
| `-GenerateReport` | `-Rep` | 生成详细的扫描报告 (.txt) | `-Rep` |
| `-WhatIf` | 无 | **预览模式**，不执行实际删除 | `-WhatIf` |
| `-KeepLatest` | 无 | 保留最大序号的文件，删除其他 | `-KeepLatest` |
| `-DeleteAll` | `-Del` | **强制删除**所有副本文件 | `-Del` |
| `-MoveToTrash` | `-Trash` | 将文件移入回收站 (仅限 Windows) | `-Tra` |

### 4. 常用命令示例

*   **预览当前目录及子目录（推荐）**：
    ```powershell
    .\Delete-WindowsDuplicateFiles.ps1 -Sub -Rep -WhatIf
    ```

*   **删除所有 .txt 文本文档副本到回收站**：
    ```powershell
    .\Delete-WindowsDuplicateFiles.ps1 -Ext txt -Sub -Trash
    ```

*   **强制清理所有副本（慎用）**：
    ```powershell
    .\Delete-WindowsDuplicateFiles.ps1 -Sub -Del
    ```

---

## ⚠️ 安全警告

1. **不可逆操作**：如果不使用 `-Trash` 参数，删除的文件通常无法从回收站恢复，请务必小心。
2. **预览优先**：首次在重要目录运行时，**强烈建议**先加上 `-WhatIf` 参数进行预览。
3. **备份**：对重要数据操作前请先备份。

## 常见问题 (FAQ)

**Q: 运行脚本时提示“禁止运行脚本”？**
A: 这是 PowerShell 的安全策略。请以管理员身份运行 PowerShell 并输入：
```powershell
Set-ExecutionPolicy RemoteSigned
```
然后输入 `Y` 确认即可。

**Q: 生成的报告在哪里？**
A: 报告文件名为 `duplicate_files_report_日期_时间.txt`，保存在处理的根目录下。

**Q: 为什么有些文件没被删除？**
A: 默认模式下，如果找不到对应的“原始文件”（不带序号的文件），脚本为了安全会跳过这些副本。如果你确定要删除它们，请使用 `-DeleteAll` (或 `-Del`) 参数。

**Q: 为什么在非 Windows 系统上 `-Trash` 参数报错？**
A: 回收站功能依赖于 Windows 特有的组件 (`Microsoft.VisualBasic`)，在 Linux 或 macOS 上无法使用。脚本的其他功能是跨平台的。

**Q: 为什么我运行脚本时出现中文乱码或语法错误？**
A: 这通常是因为脚本文件的编码格式不正确。请确保脚本文件 (`.ps1`) 是以 **UTF-8 with BOM** 格式保存的。
   - 如果您使用 VS Code 编辑，请点击右下角的编码显示（如 UTF-8），选择 "Save with Encoding" -> "UTF-8 with BOM"。
   - PowerShell 5.1 对无 BOM 的 UTF-8 文件支持不佳，可能会导致中文注释或字符串被错误解析，从而引发语法错误。

---

**版本**: ver.FK
Made With ❤Love❤ By:StarWatch
