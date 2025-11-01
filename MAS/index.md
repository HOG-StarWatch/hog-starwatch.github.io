## 本站链接
[激活方式对比表](./chart.md)

![MAS英文版](https://hog-starwatch.github.io/MAS_AIO_v3.7_En_W.cmd.png)

![MAS中文版](https://hog-starwatch.github.io/MAS_AIO_v3.7_Chs_W.cmd.png)

使用方法：下载图片 打开本站-小工具-图片处理-文件转二维码. 选择下载的图片 提取文件 下载文件

[Windows&Office下载](./download.md)

## 以下为官网搬运翻译

---

## Microsoft Activation Scripts (MAS)

开源的 Windows 和 Office 激活工具，提供 HWID、Ohook、TSforge、KMS38 和在线 KMS 激活方法，以及高级故障排除功能。

---

### 如何激活 Windows / Office / 扩展更新 (ESU)？[​](#how-to-activate-windows--office--extended-updates-esu "直接链接到如何激活 Windows / Office / 扩展更新 (ESU)？")

#### 方法 1 - PowerShell ❤️[​](#method-1---powershell-️ "直接链接到方法 1 - PowerShell ❤️")

info

1. **打开 PowerShell**
   点击**开始菜单**，输入 `PowerShell`，然后打开它。
2. **复制并粘贴以下代码，然后按 Enter 键。**

   * 适用于**Windows 8、10、11**：📌

     ```
     irm https://get.activated.win | iex
     ```

     如果上述链接被阻止（被 ISP/DNS），请尝试以下命令（需要更新的 Windows 10 或 11）：

     ```
     iex (curl.exe -s --doh-url https://1.1.1.1/dns-query https://get.activated.win | Out-String)
     ```
   * 适用于**Windows 7**及更高版本：

     ```
     iex ((New-Object Net.WebClient).DownloadString('https://get.activated.win'))
     ```
   * **脚本无法启动❓使用**方法 2**。**
3. 激活菜单将会出现。**选择绿色高亮的选项**来激活 Windows 或 Office。
4. **完成！**

#### 方法 2 - 传统方法（Windows Vista 及更高版本）[​](#method-2---traditional-windows-vista-and-later "直接链接到方法 2 - 传统方法（Windows Vista 及更高版本）")

info

1. 下载脚本：[**MAS\_AIO.cmd**](https://dev.azure.com/massgrave/Microsoft-Activation-Scripts/_apis/git/repositories/Microsoft-Activation-Scripts/items?path=/MAS/All-In-One-Version-KL/MAS_AIO.cmd&download=true) 或 [完整 ZIP 包](https://dev.azure.com/massgrave/Microsoft-Activation-Scripts/_apis/git/repositories/Microsoft-Activation-Scripts/items?$format=zip)。
2. 运行名为 `MAS_AIO.cmd` 的文件。
3. 你将看到激活选项。按照屏幕上的说明操作。
4. 完成。

---

tip

* 一些 ISP/DNS 会阻止访问我们的域名。你可以通过在浏览器中启用 [DNS-over-HTTPS (DoH)](https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/encrypted-dns-browsers/) 来绕过这个限制。

note

* PowerShell 中的 IRM 命令从指定的 URL 下载脚本，而 IEX 命令执行它。
* 在执行命令之前，请务必仔细检查 URL，并在手动下载文件时验证源是否可信。
* 请注意，有些人通过更改 IRM 命令中的 URL 来传播伪装成 MAS 的恶意软件。

---

## MAS 最新版本[​](#mas-latest-release "直接链接到 MAS 最新版本")

最新版本 - v3.7 (2025年9月11日)
[GitHub](https://github.com/massgravel/Microsoft-Activation-Scripts) / [Azure DevOps](https://dev.azure.com/massgrave/_git/Microsoft-Activation-Scripts) / [自托管 Git](https://git.activated.win/massgrave/Microsoft-Activation-Scripts)

---

## 功能特性[​](#features "直接链接到功能特性")

* **HWID (数字许可证)** 永久激活 Windows 的方法
* **Ohook** 永久激活 Office 的方法
* **TSforge** 永久激活 Windows/ESU/Office 的方法
* **KMS38** 激活 Windows 至 2038 年的方法
* **在线 KMS** 激活 Windows/Office 180 天的方法（通过续订任务实现永久激活）
* 高级激活故障排除
* 用于预激活的 $OEM$ 文件夹
* 更改 Windows 版本
* 更改 Office 版本
* 检查 Windows/Office 激活状态
* 提供一体化和单独文件版本
* 完全开源且基于批处理脚本
* 更少的防病毒软件检测

---

## 激活摘要[​](#activations-summary "直接链接到激活摘要")

| 激活类型 | 支持的产品 | 激活期限 | 是否需要互联网 |
| --- | --- | --- | --- |
| HWID | Windows 10-11 | 永久 | 是 |
| Ohook | Office | 永久 | 否 |
| TSforge | Windows / ESU / Office | 永久 | 是，26100 及更高版本需要 |
| KMS38 | Windows 10-11-Server | 至 2038 年 | 否 |
| 在线 KMS | Windows / Office | 180 天。通过续订任务实现永久 | 是 |

更多详情，请在文档中查看相应的激活详情和[对比表](./chart.md)。

---