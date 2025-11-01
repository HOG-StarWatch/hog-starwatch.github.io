# Windows LTSC 下载

所有下载链接仅指向正版文件。

## 注意事项[​](#notes "Direct link to Notes")

* 微软为Windows LTSC版本提供评估版ISO公开[链接](https://www.microsoft.com/en-us/evalcenter)，但正如其名称所示，这些ISO仅用于评估目的，无法激活超过90天。下面列出的ISO是可以激活的完整版。

#### 什么是LTSC，它是否适合您？[​](#what-is-ltsc-and-is-it-the-right-choice-for-you "Direct link to What is LTSC, and is it the right choice for you?")

点击此处获取信息

简而言之，如果您不确定，避免使用LTSC，选择一般可用性频道及其版本（家庭版、专业版、企业版等）。

---

微软通过两个服务频道发布Windows 10和11。

1. **GAC**（一般可用性频道）
   * 适用于普通用户和企业客户。
   * 版本示例包括家庭版、专业版和企业版等选项。
   * 在同一版本上的最大支持时间通常为消费者[2年](https://learn.microsoft.com/en-us/lifecycle/products/windows-11-home-and-pro)，企业[3年](https://learn.microsoft.com/en-us/lifecycle/products/windows-11-enterprise-and-education)。之后，您需要安装功能更新。
   * 这是主要的服务频道，其他软件和游戏通常遵循此频道的生命周期提供支持。
2. **LTSC**（长期服务频道）
   * 专为功能和特性必须长期保持不变的设备设计，如医疗系统、工业控制器和空中交通管制设备。
   * 版本示例包括：Enterprise LTSC和IoT Enterprise LTSC。
   * 在同一版本上的最大支持时间通常为LTSC[5年](https://learn.microsoft.com/en-us/lifecycle/products/windows-11-enterprise-ltsc-2024)，IoT LTSC[10年](https://learn.microsoft.com/en-us/lifecycle/products/windows-11-iot-enterprise-ltsc-2024)。
   * 这不是主要的服务频道，其他软件和游戏通常不遵循此频道的生命周期。例如，浏览器和游戏可能不会在同一版本上提供10年的支持。
   * 缺少大多数商店（UWP）应用。

---

**使用LTSC的理由：**

* 您不喜欢Windows年度功能升级。
* 您也不喜欢预装的商店（UWP）应用。
* 您希望获得Windows 10更长的更新支持。

**避免使用LTSC的理由：**

* 如前所述，一旦同一版本在GAC中达到生命周期结束，许多游戏和软件可能不再支持LTSC。
* 游戏可能无法开箱即用，您需要手动安装商店和Xbox应用。
* 2-3年前的LTSC版本可能无法完全支持新硬件（LTSC新版本每3年发布一次）。
* 您可能会错过GAC中添加但LTSC中不可用的新功能。

---

**常见误解**

* LTSC更快。
  它并不更快，尽管由于没有商店应用在后台运行，可能会有更多RAM可用，而且您可以通过[关闭](https://www.elevenforum.com/t/enable-or-disable-background-apps-in-windows-11.923/)后台应用和启动应用在GAC频道版本中达到相同的效果。
* 它更注重隐私。
  不，[遥测选项](https://gist.github.com/ave9858/a2153957afb053f7d0e7ffdd6c3dcb89)与GAC企业版相同。
* IoT LTSC 2021是2025年10月后为Windows 10接收安全更新的唯一方式。
  不，您也可以在Windows 10中[激活ESU](https://massgrave.dev/windows10_eol)。

#### 在LTSC上安装Microsoft Store应用[​](#microsoft-store-app-installation-on-ltsc "Direct link to Microsoft store app installation on LTSC")

点击此处获取信息

适用于Windows 11 LTSC 2024和Windows 10 LTSC 2021。

**Microsoft Store**

LTSC版本预装时不包含商店应用。要安装它们，请按照以下步骤操作。

* 确保已连接互联网。
* 以管理员身份打开PowerShell并输入，
  `wsreset -i`
* 等待通知表明商店应用已安装，这可能需要几分钟时间。

在Windows 10 2021 LTSC上，您可能会遇到指示找不到cliprenew.exe的错误。此错误可以安全地忽略。

**App Installer**

这个应用非常有用；它包含WinGet，使.appx包的安装变得简单。安装Store应用后，从此URL安装App installer。

<https://apps.microsoft.com/detail/9nblggh4nns1>

**它不起作用。我接下来应该做什么？**

您可以使用abbodi1406提供的包来安装它们。
<https://github.com/stdin82/htfx/releases/tag/v0.0.24>

#### IoT和非IoT Windows Enterprise LTSC之间的区别[​](#differences-between-iot-and-non-iot-windows-enterprise-ltsc "Direct link to Differences between IoT and Non-IoT Windows Enterprise LTSC")

点击此处获取信息

* Windows 11 LTSC 2024
* Windows 10 LTSC 2021
* 旧版本

| 功能 | Enterprise LTSC | IoT Enterprise LTSC / IoT Enterprise Subscription LTSC |
| --- | --- | --- |
| **TPM / 安全启动 / UEFI / 4GB RAM** | 全部必需 | [非必需](https://learn.microsoft.com/en-us/windows/iot/iot-enterprise/Hardware/System_Requirements?tabs=Windows11LTSC#optional-minimum-requirements) 🎉   [IoT Enterprise 24H2 (非LTSC)]()也不需要 |
| **自动设备加密** | 已启用 | 已禁用 |
| **更新支持** | 5年 | 10年 |
| **保留存储功能** | 已启用 | 已禁用 |
| **数字许可证 (HWID)** | 不支持 | 支持 |
| **2个同时RDP会话** | 否 | 是 |

* IoT Enterprise LTSC是赢家。
* IoT Enterprise LTSC和IoT Enterprise Subscription LTSC之间的唯一区别是订阅版本支持订阅许可证。
* 您只能通过在Windows设置中的激活页面插入相应的版本密钥来相互更改版本（IoT和非IoT Windows Enterprise LTSC）。

|  |  |  |
| --- | --- | --- |
| IoT Enterprise LTSC 2024 | IoTEnterpriseS | KBN8V-HFGQ4-MGXVD-347P6-PDQGT |
| Enterprise LTSC 2024 | EnterpriseS | M7XTQ-FN8P6-TTKYV-9D4CC-J462D |

| 功能 | Enterprise LTSC | IoT Enterprise LTSC |
| --- | --- | --- |
| **更新支持** | [5年（至2027年）](https://learn.microsoft.com/en-us/lifecycle/products/windows-10-enterprise-ltsc-2021) | [10年（至2032年）](https://learn.microsoft.com/en-us/lifecycle/products/windows-10-iot-enterprise-ltsc-2021) |
| **保留存储功能** | 已启用 | 已禁用 |
| **数字许可证 (HWID)** | 不支持 | 支持 |
| **KMS许可证** | 支持 | 在更新19044.2788后添加支持 |
| **$OEM$文件夹支持** | 是 | 否  |

* IoT Enterprise LTSC是赢家。
* 您只能通过在Windows设置中的激活页面插入相应的版本密钥来相互更改版本（IoT和非IoT Windows Enterprise LTSC）。

|  |  |  |
| --- | --- | --- |
| IoT Enterprise LTSC 2021 | IoTEnterpriseS | QPM6N-7J2WJ-P88HH-P3YRH-YY74H |
| Enterprise LTSC 2021 | EnterpriseS | M7XTQ-FN8P6-TTKYV-9D4CC-J462D |

* 有适用于IoT Enterprise LTSC/LTSB 2019、2016和2015的ISO，但它们只预装了非IoT LTSC OEM密钥（通用，未激活）。安装的密钥是唯一的区别。这些版本没有真正不同的IoT版本可用。

#### 如何在保留文件和应用的情况下从非LTSC升级到LTSC版本？[​](#how-to-upgrade-from-non-ltsc-to-ltsc-edition-while-keeping-files-and-apps "Direct link to How to upgrade from non-LTSC to LTSC edition while keeping files and apps?")

点击此处获取信息

您可能想查看[Windows 10 EOL指南](https://massgrave.dev/windows10_eol)。

#### 如何以非英语语言全新安装Windows 11 IoT Enterprise LTSC 2024？[​](#how-to-clean-install-windows-11-iot-enterprise-ltsc-2024-in-non-english-language "Direct link to How to clean install Windows 11 IoT Enterprise LTSC 2024 in Non-English language?")

点击此处获取信息

IoT LTSC版本ISO仅提供英语版本。但是，您可以按照以下步骤全新安装它。

* 从下面的部分下载所需语言的非IoT LTSC 2024 ISO。
* 按照[PID.txt方法](https://gravesoft.dev/clean_install_windows#windows-11-on-unsupported-hardware)从头开始安装IoT版本。

或者，您可以安装其他语言的非IoT LTSC，然后在Windows设置的激活页面中安装IoT LTSC 2024密钥`KBN8V-HFGQ4-MGXVD-347P6-PDQGT`来更改版本。

#### 如何以非英语语言全新安装Windows 10 IoT Enterprise LTSC 2021？[​](#how-to-clean-install-windows-10-iot-enterprise-ltsc-2021-in-non-english-language "Direct link to How to clean install Windows 10 IoT Enterprise LTSC 2021 in Non-English language?")

点击此处获取信息

IoT LTSC版本ISO仅提供英语版本。

从头开始安装Windows 11 IoT Enterprise LTSC 2024时，一个优势是其宽松的硬件要求。但是，对2021 IoT版本执行相同操作并没有太多好处，因为您可以稍后轻松更改Windows版本。此外，从头开始安装虚拟版本的PID.txt方法仅适用于Windows 11 24H2及更高版本。虽然有其他方法可以从头开始安装，但它们更复杂，结果不值得付出努力。

我们的建议如下：

* 从下面的部分下载所需语言的非IoT LTSC 2021 ISO。
* 使用此[全新安装指南](https://gravesoft.dev/clean_install_windows)安装Windows。
* 安装Windows后，要更改版本，请在Windows设置的激活页面中输入IoT LTSC 2021密钥`QPM6N-7J2WJ-P88HH-P3YRH-YY74H`。

---

## 下载链接[​](#download-links "Direct link to Download Links")

* Windows 11 LTSC 2024
* Windows 10 LTSC 2021
* Windows 10 LTSC 2019
* Windows 10 LTSB 2016
* Windows 10 LTSB 2015
* Windows LTSC ARM64

## Windows 11 IoT Enterprise LTSC 2024

**版本 - 26100.1742**

这些ISO包含以下版本：
Windows 11 Enterprise LTSC
Windows 11 IoT Enterprise LTSC
Windows 11 IoT Enterprise Subscription LTSC

| 语言 | 架构 | 链接 |
| --- | --- | --- |
| English | x64 | [X23-81951\_26100.1742.240906-0331.ge\_release\_svc\_refresh\_CLIENT\_ENTERPRISES\_OEM\_x64FRE\_en-us.iso](https://oemsoc.download.prss.microsoft.com/dbazure/X23-81951_26100.1742.240906-0331.ge_release_svc_refresh_CLIENT_ENTERPRISES_OEM_x64FRE_en-us.iso_640de540-87c4-427f-be87-e6d53a3a60b4?t=2c3b664b-b119-4088-9db1-ccff72c6d22e&P1=102816950270&P2=601&P3=2&P4=OC448onxqdmdUsBUApAiE8pj1FZ%2bEPTU3%2bC6Quq29MVwMyyDUtR%2fsbiy7RdVoZOHaZRndvzeOOnIwJZ2x3%2bmP6YK9cjJSP41Lvs0SulF4SVyL5C0DdDmiWqh2QW%2bcDPj2Xp%2bMrI9NOeElSBS5kkOWP8Eiyf2VkkQFM3g5vIk3HJVvu5sWo6pFKpFv4lML%2bHaIiTSuwbPMs5xwEQTfScuTKfigNlUZPdHRMp1B3uKLgIA3r0IbRpZgHYMXEwXQ%2fSLMdDNQthpqQvz1PThVkx7ObD55CXgt0GNSAWRfjdURWb8ywWk1gT7ozAgpP%2fKNm56U5nh33WZSuMZIuO1SBM2vw%3d%3d)   =   [en-us\_windows\_11\_iot\_enterprise\_ltsc\_2024\_x64\_dvd\_f6b14814.iso](https://drive.massgrave.dev/en-us_windows_11_iot_enterprise_ltsc_2024_x64_dvd_f6b14814.iso)     Both files are identical, only name is different.   1st link is from the official OEM portal, and 2nd file is taken from MVS and hosted on massgrave.   Note: With 1st link file you need to rename extension to .iso |

---

## Windows 11 Enterprise LTSC 2024

**版本 - 26100.1742**

| 语言 | 架构 | 链接 |
| --- | --- | --- |
| Arabic | x64 | [ar-sa\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_8012f159.iso](https://drive.massgrave.dev/ar-sa_windows_11_enterprise_ltsc_2024_x64_dvd_8012f159.iso) |
| Bulgarian | x64 | [bg-bg\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_2778f4e8.iso](https://drive.massgrave.dev/bg-bg_windows_11_enterprise_ltsc_2024_x64_dvd_2778f4e8.iso) |
| Czech | x64 | [cs-cz\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_d4ef05f2.iso](https://drive.massgrave.dev/cs-cz_windows_11_enterprise_ltsc_2024_x64_dvd_d4ef05f2.iso) |
| Danish | x64 | [da-dk\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_c231c267.iso](https://drive.massgrave.dev/da-dk_windows_11_enterprise_ltsc_2024_x64_dvd_c231c267.iso) |
| German | x64 | [de-de\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_4f136f69.iso](https://drive.massgrave.dev/de-de_windows_11_enterprise_ltsc_2024_x64_dvd_4f136f69.iso) |
| Greek | x64 | [el-gr\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_54eaabb2.iso](https://drive.massgrave.dev/el-gr_windows_11_enterprise_ltsc_2024_x64_dvd_54eaabb2.iso) |
| English-United Kingdom | x64 | [en-gb\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_e2137661.iso](https://drive.massgrave.dev/en-gb_windows_11_enterprise_ltsc_2024_x64_dvd_e2137661.iso) |
| English | x64 | [en-us\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_965cfb00.iso](https://drive.massgrave.dev/en-us_windows_11_enterprise_ltsc_2024_x64_dvd_965cfb00.iso) |
| Spanish | x64 | [es-es\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_77392d61.iso](https://drive.massgrave.dev/es-es_windows_11_enterprise_ltsc_2024_x64_dvd_77392d61.iso) |
| Spanish-Mexico | x64 | [es-mx\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_3310c094.iso](https://drive.massgrave.dev/es-mx_windows_11_enterprise_ltsc_2024_x64_dvd_3310c094.iso) |
| Estonian | x64 | [et-ee\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_2dbd4bfe.iso](https://drive.massgrave.dev/et-ee_windows_11_enterprise_ltsc_2024_x64_dvd_2dbd4bfe.iso) |
| Finnish | x64 | [fi-fi\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_998f5df6.iso](https://drive.massgrave.dev/fi-fi_windows_11_enterprise_ltsc_2024_x64_dvd_998f5df6.iso) |
| French-Canada | x64 | [fr-ca\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_78732953.iso](https://drive.massgrave.dev/fr-ca_windows_11_enterprise_ltsc_2024_x64_dvd_78732953.iso) |
| French | x64 | [fr-fr\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_d66e386e.iso](https://drive.massgrave.dev/fr-fr_windows_11_enterprise_ltsc_2024_x64_dvd_d66e386e.iso) |
| Hebrew | x64 | [he-il\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_fae050ec.iso](https://drive.massgrave.dev/he-il_windows_11_enterprise_ltsc_2024_x64_dvd_fae050ec.iso) |
| Croatian | x64 | [hr-hr\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_e3594411.iso](https://drive.massgrave.dev/hr-hr_windows_11_enterprise_ltsc_2024_x64_dvd_e3594411.iso) |
| Hungarian | x64 | [hu-hu\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_8fea6034.iso](https://drive.massgrave.dev/hu-hu_windows_11_enterprise_ltsc_2024_x64_dvd_8fea6034.iso) |
| Italian | x64 | [it-it\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_1e8cabb6.iso](https://drive.massgrave.dev/it-it_windows_11_enterprise_ltsc_2024_x64_dvd_1e8cabb6.iso) |
| Japanese | x64 | [ja-jp\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_e59ad418.iso](https://drive.massgrave.dev/ja-jp_windows_11_enterprise_ltsc_2024_x64_dvd_e59ad418.iso) |
| Korean | x64 | [ko-kr\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_b6b6eb18.iso](https://drive.massgrave.dev/ko-kr_windows_11_enterprise_ltsc_2024_x64_dvd_b6b6eb18.iso) |
| Lithuanian | x64 | [lt-lt\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_145479e9.iso](https://drive.massgrave.dev/lt-lt_windows_11_enterprise_ltsc_2024_x64_dvd_145479e9.iso) |
| Latvian | x64 | [lv-lv\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_e0ebc53d.iso](https://drive.massgrave.dev/lv-lv_windows_11_enterprise_ltsc_2024_x64_dvd_e0ebc53d.iso) |
| Norwegian-Bokmal | x64 | [nb-no\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_d41eeb48.iso](https://drive.massgrave.dev/nb-no_windows_11_enterprise_ltsc_2024_x64_dvd_d41eeb48.iso) |
| Dutch-Netherlands | x64 | [nl-nl\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_e3063aab.iso](https://drive.massgrave.dev/nl-nl_windows_11_enterprise_ltsc_2024_x64_dvd_e3063aab.iso) |
| Polish | x64 | [pl-pl\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_e00807a1.iso](https://drive.massgrave.dev/pl-pl_windows_11_enterprise_ltsc_2024_x64_dvd_e00807a1.iso) |
| Portuguese-Brazil | x64 | [pt-br\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_2bb6b75b.iso](https://drive.massgrave.dev/pt-br_windows_11_enterprise_ltsc_2024_x64_dvd_2bb6b75b.iso) |
| Portuguese-Portugal | x64 | [pt-pt\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_2f34bd6b.iso](https://drive.massgrave.dev/pt-pt_windows_11_enterprise_ltsc_2024_x64_dvd_2f34bd6b.iso) |
| Romanian | x64 | [ro-ro\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_2eadb4df.iso](https://drive.massgrave.dev/ro-ro_windows_11_enterprise_ltsc_2024_x64_dvd_2eadb4df.iso) |
| Russian | x64 | [ru-ru\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_f9af5773.iso](https://drive.massgrave.dev/ru-ru_windows_11_enterprise_ltsc_2024_x64_dvd_f9af5773.iso) |
| Slovak | x64 | [sk-sk\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_03b916e7.iso](https://drive.massgrave.dev/sk-sk_windows_11_enterprise_ltsc_2024_x64_dvd_03b916e7.iso) |
| Slovenian | x64 | [sl-si\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_310b3a76.iso](https://drive.massgrave.dev/sl-si_windows_11_enterprise_ltsc_2024_x64_dvd_310b3a76.iso) |
| Serbian-Latin | x64 | [sr-latn-rs\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_3dfa5da5.iso](https://drive.massgrave.dev/sr-latn-rs_windows_11_enterprise_ltsc_2024_x64_dvd_3dfa5da5.iso) |
| Swedish | x64 | [sv-se\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_191cf991.iso](https://drive.massgrave.dev/sv-se_windows_11_enterprise_ltsc_2024_x64_dvd_191cf991.iso) |
| Thai | x64 | [th-th\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_47ce2c8a.iso](https://drive.massgrave.dev/th-th_windows_11_enterprise_ltsc_2024_x64_dvd_47ce2c8a.iso) |
| Turkish | x64 | [tr-tr\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_27bdab81.iso](https://drive.massgrave.dev/tr-tr_windows_11_enterprise_ltsc_2024_x64_dvd_27bdab81.iso) |
| Ukranian | x64 | [uk-ua\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_b3f00872.iso](https://drive.massgrave.dev/uk-ua_windows_11_enterprise_ltsc_2024_x64_dvd_b3f00872.iso) |
| Chinese-Simplified | x64 | [zh-cn\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_cff9cd2d.iso](https://drive.massgrave.dev/zh-cn_windows_11_enterprise_ltsc_2024_x64_dvd_cff9cd2d.iso) |
| Chinese-Traditional | x64 | [zh-tw\_windows\_11\_enterprise\_ltsc\_2024\_x64\_dvd\_6287d84d.iso](https://drive.massgrave.dev/zh-tw_windows_11_enterprise_ltsc_2024_x64_dvd_6287d84d.iso) |

## Windows 10 IoT Enterprise LTSC 2021

**版本 - 19044.1288**

这些ISO包含以下版本：
Windows 10 Enterprise LTSC
Windows 10 IoT Enterprise LTSC

| 语言 | 架构 | 链接 |
| --- | --- | --- |
| English | x64 | [en-us\_windows\_10\_iot\_enterprise\_ltsc\_2021\_x64\_dvd\_257ad90f.iso](https://drive.massgrave.dev/en-us_windows_10_iot_enterprise_ltsc_2021_x64_dvd_257ad90f.iso) |

---

## Windows 10 Enterprise LTSC 2021

**版本 - 19044.1288**

| 语言 | 架构 | 链接 |
| --- | --- | --- |
| Arabic | x64 | [ar-sa\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_60bc2a7a.iso](https://drive.massgrave.dev/ar-sa_windows_10_enterprise_ltsc_2021_x64_dvd_60bc2a7a.iso) |
| Arabic | x86 | [ar-sa\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_69e2349b.iso](https://drive.massgrave.dev/ar-sa_windows_10_enterprise_ltsc_2021_x86_dvd_69e2349b.iso) |
| Bulgarian | x64 | [bg-bg\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_b0887275.iso](https://drive.massgrave.dev/bg-bg_windows_10_enterprise_ltsc_2021_x64_dvd_b0887275.iso) |
| Bulgarian | x86 | [bg-bg\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_8beb279f.iso](https://drive.massgrave.dev/bg-bg_windows_10_enterprise_ltsc_2021_x86_dvd_8beb279f.iso) |
| Czech | x64 | [cs-cz\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_d624c653.iso](https://drive.massgrave.dev/cs-cz_windows_10_enterprise_ltsc_2021_x64_dvd_d624c653.iso) |
| Czech | x86 | [cs-cz\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_2afa1afb.iso](https://drive.massgrave.dev/cs-cz_windows_10_enterprise_ltsc_2021_x86_dvd_2afa1afb.iso) |
| Danish | x64 | [da-dk\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_6ec511bb.iso](https://drive.massgrave.dev/da-dk_windows_10_enterprise_ltsc_2021_x64_dvd_6ec511bb.iso) |
| Danish | x86 | [da-dk\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_de761707.iso](https://drive.massgrave.dev/da-dk_windows_10_enterprise_ltsc_2021_x86_dvd_de761707.iso) |
| German | x64 | [de-de\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_71796d33.iso](https://drive.massgrave.dev/de-de_windows_10_enterprise_ltsc_2021_x64_dvd_71796d33.iso) |
| German | x86 | [de-de\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_6317aaff.iso](https://drive.massgrave.dev/de-de_windows_10_enterprise_ltsc_2021_x86_dvd_6317aaff.iso) |
| Greek | x64 | [el-gr\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_c83eab34.iso](https://drive.massgrave.dev/el-gr_windows_10_enterprise_ltsc_2021_x64_dvd_c83eab34.iso) |
| Greek | x86 | [el-gr\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_c7850ec0.iso](https://drive.massgrave.dev/el-gr_windows_10_enterprise_ltsc_2021_x86_dvd_c7850ec0.iso) |
| English-United Kingdom | x64 | [en-gb\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_7fe51fe8.iso](https://drive.massgrave.dev/en-gb_windows_10_enterprise_ltsc_2021_x64_dvd_7fe51fe8.iso) |
| English-United Kingdom | x86 | [en-gb\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_baa2b09f.iso](https://drive.massgrave.dev/en-gb_windows_10_enterprise_ltsc_2021_x86_dvd_baa2b09f.iso) |
| English | x64 | [en-us\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_d289cf96.iso](https://drive.massgrave.dev/en-us_windows_10_enterprise_ltsc_2021_x64_dvd_d289cf96.iso) |
| English | x86 | [en-us\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_9f4aa95f.iso](https://drive.massgrave.dev/en-us_windows_10_enterprise_ltsc_2021_x86_dvd_9f4aa95f.iso) |
| Spanish | x64 | [es-es\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_51d721ea.iso](https://drive.massgrave.dev/es-es_windows_10_enterprise_ltsc_2021_x64_dvd_51d721ea.iso) |
| Spanish | x86 | [es-es\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_243c83eb.iso](https://drive.massgrave.dev/es-es_windows_10_enterprise_ltsc_2021_x86_dvd_243c83eb.iso) |
| Spanish-Mexico | x64 | [es-mx\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_f6aaf384.iso](https://drive.massgrave.dev/es-mx_windows_10_enterprise_ltsc_2021_x64_dvd_f6aaf384.iso) |
| Spanish-Mexico | x86 | [es-mx\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_93a5debe.iso](https://drive.massgrave.dev/es-mx_windows_10_enterprise_ltsc_2021_x86_dvd_93a5debe.iso) |
| Estonian | x64 | [et-ee\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_012a5c50.iso](https://drive.massgrave.dev/et-ee_windows_10_enterprise_ltsc_2021_x64_dvd_012a5c50.iso) |
| Estonian | x86 | [et-ee\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_292aa316.iso](https://drive.massgrave.dev/et-ee_windows_10_enterprise_ltsc_2021_x86_dvd_292aa316.iso) |
| Finnish | x64 | [fi-fi\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_551582d9.iso](https://drive.massgrave.dev/fi-fi_windows_10_enterprise_ltsc_2021_x64_dvd_551582d9.iso) |
| Finnish | x86 | [fi-fi\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_15e0eeb9.iso](https://drive.massgrave.dev/fi-fi_windows_10_enterprise_ltsc_2021_x86_dvd_15e0eeb9.iso) |
| French-Canada | x64 | [fr-ca\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_2770e649.iso](https://drive.massgrave.dev/fr-ca_windows_10_enterprise_ltsc_2021_x64_dvd_2770e649.iso) |
| French-Canada | x86 | [fr-ca\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_5237961d.iso](https://drive.massgrave.dev/fr-ca_windows_10_enterprise_ltsc_2021_x86_dvd_5237961d.iso) |
| French | x64 | [fr-fr\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_bda01eb0.iso](https://drive.massgrave.dev/fr-fr_windows_10_enterprise_ltsc_2021_x64_dvd_bda01eb0.iso) |
| French | x86 | [fr-fr\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_53f189f9.iso](https://drive.massgrave.dev/fr-fr_windows_10_enterprise_ltsc_2021_x86_dvd_53f189f9.iso) |
| Hebrew | x64 | [he-il\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_3a55ecd6.iso](https://drive.massgrave.dev/he-il_windows_10_enterprise_ltsc_2021_x64_dvd_3a55ecd6.iso) |
| Hebrew | x86 | [he-il\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_3b560f44.iso](https://drive.massgrave.dev/he-il_windows_10_enterprise_ltsc_2021_x86_dvd_3b560f44.iso) |
| Croatian | x64 | [hr-hr\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_f5085b75.iso](https://drive.massgrave.dev/hr-hr_windows_10_enterprise_ltsc_2021_x64_dvd_f5085b75.iso) |
| Croatian | x86 | [hr-hr\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_bd52180e.iso](https://drive.massgrave.dev/hr-hr_windows_10_enterprise_ltsc_2021_x86_dvd_bd52180e.iso) |
| Hungarian | x64 | [hu-hu\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_d541ddb3.iso](https://drive.massgrave.dev/hu-hu_windows_10_enterprise_ltsc_2021_x64_dvd_d541ddb3.iso) |
| Hungarian | x86 | [hu-hu\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_a8cb11dd.iso](https://drive.massgrave.dev/hu-hu_windows_10_enterprise_ltsc_2021_x86_dvd_a8cb11dd.iso) |
| Italian | x64 | [it-it\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_0c1aa034.iso](https://drive.massgrave.dev/it-it_windows_10_enterprise_ltsc_2021_x64_dvd_0c1aa034.iso) |
| Italian | x86 | [it-it\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_46e4f7e1.iso](https://drive.massgrave.dev/it-it_windows_10_enterprise_ltsc_2021_x86_dvd_46e4f7e1.iso) |
| Japanese | x64 | [ja-jp\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_ef58c6a1.iso](https://drive.massgrave.dev/ja-jp_windows_10_enterprise_ltsc_2021_x64_dvd_ef58c6a1.iso) |
| Japanese | x86 | [ja-jp\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_ac893196.iso](https://drive.massgrave.dev/ja-jp_windows_10_enterprise_ltsc_2021_x86_dvd_ac893196.iso) |
| Korean | x64 | [ko-kr\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_6d26f398.iso](https://drive.massgrave.dev/ko-kr_windows_10_enterprise_ltsc_2021_x64_dvd_6d26f398.iso) |
| Korean | x86 | [ko-kr\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_dff1cb4e.iso](https://drive.massgrave.dev/ko-kr_windows_10_enterprise_ltsc_2021_x86_dvd_dff1cb4e.iso) |
| Lithuanian | x64 | [lt-lt\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_9ffbbd5b.iso](https://drive.massgrave.dev/lt-lt_windows_10_enterprise_ltsc_2021_x64_dvd_9ffbbd5b.iso) |
| Lithuanian | x86 | [lt-lt\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_fefed947.iso](https://drive.massgrave.dev/lt-lt_windows_10_enterprise_ltsc_2021_x86_dvd_fefed947.iso) |
| Latvian | x64 | [lv-lv\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_6c89d2e0.iso](https://drive.massgrave.dev/lv-lv_windows_10_enterprise_ltsc_2021_x64_dvd_6c89d2e0.iso) |
| Latvian | x86 | [lv-lv\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_41041cfd.iso](https://drive.massgrave.dev/lv-lv_windows_10_enterprise_ltsc_2021_x86_dvd_41041cfd.iso) |
| Norwegian-Bokmal | x64 | [nb-no\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_c65c51a5.iso](https://drive.massgrave.dev/nb-no_windows_10_enterprise_ltsc_2021_x64_dvd_c65c51a5.iso) |
| Norwegian-Bokmal | x86 | [nb-no\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_6f625462.iso](https://drive.massgrave.dev/nb-no_windows_10_enterprise_ltsc_2021_x86_dvd_6f625462.iso) |
| Dutch-Netherlands | x64 | [nl-nl\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_88f53466.iso](https://drive.massgrave.dev/nl-nl_windows_10_enterprise_ltsc_2021_x64_dvd_88f53466.iso) |
| Dutch-Netherlands | x86 | [nl-nl\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_231b3321.iso](https://drive.massgrave.dev/nl-nl_windows_10_enterprise_ltsc_2021_x86_dvd_231b3321.iso) |
| Polish | x64 | [pl-pl\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_eff40776.iso](https://drive.massgrave.dev/pl-pl_windows_10_enterprise_ltsc_2021_x64_dvd_eff40776.iso) |
| Polish | x86 | [pl-pl\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_4b0aed09.iso](https://drive.massgrave.dev/pl-pl_windows_10_enterprise_ltsc_2021_x86_dvd_4b0aed09.iso) |
| Portuguese-Brazil | x64 | [pt-br\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_f318268e.iso](https://drive.massgrave.dev/pt-br_windows_10_enterprise_ltsc_2021_x64_dvd_f318268e.iso) |
| Portuguese-Brazil | x86 | [pt-br\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_d4aea182.iso](https://drive.massgrave.dev/pt-br_windows_10_enterprise_ltsc_2021_x86_dvd_d4aea182.iso) |
| Portuguese-Portugal | x64 | [pt-pt\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_f2e9b6a0.iso](https://drive.massgrave.dev/pt-pt_windows_10_enterprise_ltsc_2021_x64_dvd_f2e9b6a0.iso) |
| Portuguese-Portugal | x86 | [pt-pt\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_2ed38b71.iso](https://drive.massgrave.dev/pt-pt_windows_10_enterprise_ltsc_2021_x86_dvd_2ed38b71.iso) |
| Romanian | x64 | [ro-ro\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_ae2284d6.iso](https://drive.massgrave.dev/ro-ro_windows_10_enterprise_ltsc_2021_x64_dvd_ae2284d6.iso) |
| Romanian | x86 | [ro-ro\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_e68b65bc.iso](https://drive.massgrave.dev/ro-ro_windows_10_enterprise_ltsc_2021_x86_dvd_e68b65bc.iso) |
| Russian | x64 | [ru-ru\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_5044a1e7.iso](https://drive.massgrave.dev/ru-ru_windows_10_enterprise_ltsc_2021_x64_dvd_5044a1e7.iso) |
| Russian | x86 | [ru-ru\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_cdf355eb.iso](https://drive.massgrave.dev/ru-ru_windows_10_enterprise_ltsc_2021_x86_dvd_cdf355eb.iso) |
| Slovak | x64 | [sk-sk\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_d6c64c5f.iso](https://drive.massgrave.dev/sk-sk_windows_10_enterprise_ltsc_2021_x64_dvd_d6c64c5f.iso) |
| Slovak | x86 | [sk-sk\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_10ed79ca.iso](https://drive.massgrave.dev/sk-sk_windows_10_enterprise_ltsc_2021_x86_dvd_10ed79ca.iso) |
| Slovenian | x64 | [sl-si\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_ec090386.iso](https://drive.massgrave.dev/sl-si_windows_10_enterprise_ltsc_2021_x64_dvd_ec090386.iso) |
| Slovenian | x86 | [sl-si\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_5e0e48a8.iso](https://drive.massgrave.dev/sl-si_windows_10_enterprise_ltsc_2021_x86_dvd_5e0e48a8.iso) |
| Serbian-Latin | x64 | [sr-latn-rs\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_2d2f8815.iso](https://drive.massgrave.dev/sr-latn-rs_windows_10_enterprise_ltsc_2021_x64_dvd_2d2f8815.iso) |
| Serbian-Latin | x86 | [sr-latn-rs\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_248407e2.iso](https://drive.massgrave.dev/sr-latn-rs_windows_10_enterprise_ltsc_2021_x86_dvd_248407e2.iso) |
| Swedish | x64 | [sv-se\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_9a28bb6b.iso](https://drive.massgrave.dev/sv-se_windows_10_enterprise_ltsc_2021_x64_dvd_9a28bb6b.iso) |
| Swedish | x86 | [sv-se\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_9081ef5b.iso](https://drive.massgrave.dev/sv-se_windows_10_enterprise_ltsc_2021_x86_dvd_9081ef5b.iso) |
| Thai | x64 | [th-th\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_b7ed34d6.iso](https://drive.massgrave.dev/th-th_windows_10_enterprise_ltsc_2021_x64_dvd_b7ed34d6.iso) |
| Thai | x86 | [th-th\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_df412841.iso](https://drive.massgrave.dev/th-th_windows_10_enterprise_ltsc_2021_x86_dvd_df412841.iso) |
| Turkish | x64 | [tr-tr\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_e55b1896.iso](https://drive.massgrave.dev/tr-tr_windows_10_enterprise_ltsc_2021_x64_dvd_e55b1896.iso) |
| Turkish | x86 | [tr-tr\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_36fc55f4.iso](https://drive.massgrave.dev/tr-tr_windows_10_enterprise_ltsc_2021_x86_dvd_36fc55f4.iso) |
| Ukranian | x64 | [uk-ua\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_816da3c3.iso](https://drive.massgrave.dev/uk-ua_windows_10_enterprise_ltsc_2021_x64_dvd_816da3c3.iso) |
| Ukranian | x86 | [uk-ua\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_aa372ed6.iso](https://drive.massgrave.dev/uk-ua_windows_10_enterprise_ltsc_2021_x86_dvd_aa372ed6.iso) |
| Chinese-Simplified | x64 | [zh-cn\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_033b7312.iso](https://drive.massgrave.dev/zh-cn_windows_10_enterprise_ltsc_2021_x64_dvd_033b7312.iso) |
| Chinese-Simplified | x86 | [zh-cn\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_30600d9c.iso](https://drive.massgrave.dev/zh-cn_windows_10_enterprise_ltsc_2021_x86_dvd_30600d9c.iso) |
| Chinese-Traditional | x64 | [zh-tw\_windows\_10\_enterprise\_ltsc\_2021\_x64\_dvd\_80dba877.iso](https://drive.massgrave.dev/zh-tw_windows_10_enterprise_ltsc_2021_x64_dvd_80dba877.iso) |
| Chinese-Traditional | x86 | [zh-tw\_windows\_10\_enterprise\_ltsc\_2021\_x86\_dvd\_03be1c20.iso](https://drive.massgrave.dev/zh-tw_windows_10_enterprise_ltsc_2021_x86_dvd_03be1c20.iso) |

## Windows 10 IoT Enterprise LTSC 2019

**版本 - 17763.107**
它没有实际的IotEnterpriseS版本，只是安装了OEM密钥（通用，未激活）的EnterpriseS版本。

| 语言 | 架构 | 链接 |
| --- | --- | --- |
| English | x64 | [en\_windows\_10\_iot\_enterprise\_ltsc\_2019\_x64\_dvd\_a1aa819f.iso](https://drive.massgrave.dev/en_windows_10_iot_enterprise_ltsc_2019_x64_dvd_a1aa819f.iso) |
| English | x86 | [en\_windows\_10\_iot\_enterprise\_ltsc\_2019\_x86\_dvd\_2255a237.iso](https://drive.massgrave.dev/en_windows_10_iot_enterprise_ltsc_2019_x86_dvd_2255a237.iso) |

---

## Windows 10 Enterprise LTSC 2019

**版本 - 17763.316**

| 语言 | 架构 | 链接 |
| --- | --- | --- |
| Arabic | x64 | [ar\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_a1f42c56.iso](https://drive.massgrave.dev/ar_windows_10_enterprise_ltsc_2019_x64_dvd_a1f42c56.iso) |
| Arabic | x86 | [ar\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_8faea15c.iso](https://drive.massgrave.dev/ar_windows_10_enterprise_ltsc_2019_x86_dvd_8faea15c.iso) |
| Bulgarian | x64 | [bg\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_65c7e0c3.iso](https://drive.massgrave.dev/bg_windows_10_enterprise_ltsc_2019_x64_dvd_65c7e0c3.iso) |
| Bulgarian | x86 | [bg\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_73c555b7.iso](https://drive.massgrave.dev/bg_windows_10_enterprise_ltsc_2019_x86_dvd_73c555b7.iso) |
| Chinese-Simplified | x64 | [cn\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_9c09ff24.iso](https://drive.massgrave.dev/cn_windows_10_enterprise_ltsc_2019_x64_dvd_9c09ff24.iso) |
| Chinese-Simplified | x86 | [cn\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_1814dbab.iso](https://drive.massgrave.dev/cn_windows_10_enterprise_ltsc_2019_x86_dvd_1814dbab.iso) |
| Czech | x64 | [cs\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_b15b47cf.iso](https://drive.massgrave.dev/cs_windows_10_enterprise_ltsc_2019_x64_dvd_b15b47cf.iso) |
| Czech | x86 | [cs\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_b3b102f8.iso](https://drive.massgrave.dev/cs_windows_10_enterprise_ltsc_2019_x86_dvd_b3b102f8.iso) |
| Chinese-Traditional | x64 | [ct\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_c301154f.iso](https://drive.massgrave.dev/ct_windows_10_enterprise_ltsc_2019_x64_dvd_c301154f.iso) |
| Chinese-Traditional | x86 | [ct\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_9096dec8.iso](https://drive.massgrave.dev/ct_windows_10_enterprise_ltsc_2019_x86_dvd_9096dec8.iso) |
| Danish | x64 | [da\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_772bd569.iso](https://drive.massgrave.dev/da_windows_10_enterprise_ltsc_2019_x64_dvd_772bd569.iso) |
| Danish | x86 | [da\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_54ea3b7c.iso](https://drive.massgrave.dev/da_windows_10_enterprise_ltsc_2019_x86_dvd_54ea3b7c.iso) |
| German | x64 | [de\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_34efbe54.iso](https://drive.massgrave.dev/de_windows_10_enterprise_ltsc_2019_x64_dvd_34efbe54.iso) |
| German | x86 | [de\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_b003dc50.iso](https://drive.massgrave.dev/de_windows_10_enterprise_ltsc_2019_x86_dvd_b003dc50.iso) |
| Greek | x64 | [el\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_25ea66b9.iso](https://drive.massgrave.dev/el_windows_10_enterprise_ltsc_2019_x64_dvd_25ea66b9.iso) |
| Greek | x86 | [el\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_d8746855.iso](https://drive.massgrave.dev/el_windows_10_enterprise_ltsc_2019_x86_dvd_d8746855.iso) |
| English-United Kingdom | x64 | [en-uk\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_723dfbc1.iso](https://drive.massgrave.dev/en-uk_windows_10_enterprise_ltsc_2019_x64_dvd_723dfbc1.iso) |
| English-United Kingdom | x86 | [en-uk\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_ae3afea1.iso](https://drive.massgrave.dev/en-uk_windows_10_enterprise_ltsc_2019_x86_dvd_ae3afea1.iso) |
| English | x64 | [en\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_5795bb03.iso](https://drive.massgrave.dev/en_windows_10_enterprise_ltsc_2019_x64_dvd_5795bb03.iso) |
| English | x86 | [en\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_892869c9.iso](https://drive.massgrave.dev/en_windows_10_enterprise_ltsc_2019_x86_dvd_892869c9.iso) |
| Spanish-Mexico | x64 | [es-mx\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_686cdfbe.iso](https://drive.massgrave.dev/es-mx_windows_10_enterprise_ltsc_2019_x64_dvd_686cdfbe.iso) |
| Spanish-Mexico | x86 | [es-mx\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_a706f07d.iso](https://drive.massgrave.dev/es-mx_windows_10_enterprise_ltsc_2019_x86_dvd_a706f07d.iso) |
| Spanish | x64 | [es\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_44a5b896.iso](https://drive.massgrave.dev/es_windows_10_enterprise_ltsc_2019_x64_dvd_44a5b896.iso) |
| Spanish | x86 | [es\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_84f6ff1d.iso](https://drive.massgrave.dev/es_windows_10_enterprise_ltsc_2019_x86_dvd_84f6ff1d.iso) |
| Estonian | x64 | [et\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_509e0d4c.iso](https://drive.massgrave.dev/et_windows_10_enterprise_ltsc_2019_x64_dvd_509e0d4c.iso) |
| Estonian | x86 | [et\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_56908605.iso](https://drive.massgrave.dev/et_windows_10_enterprise_ltsc_2019_x86_dvd_56908605.iso) |
| Finnish | x64 | [fi\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_8e6aaf2c.iso](https://drive.massgrave.dev/fi_windows_10_enterprise_ltsc_2019_x64_dvd_8e6aaf2c.iso) |
| Finnish | x86 | [fi\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_8016a99b.iso](https://drive.massgrave.dev/fi_windows_10_enterprise_ltsc_2019_x86_dvd_8016a99b.iso) |
| French-Canada | x64 | [fr-ca\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_a77dd2c4.iso](https://drive.massgrave.dev/fr-ca_windows_10_enterprise_ltsc_2019_x64_dvd_a77dd2c4.iso) |
| French-Canada | x86 | [fr-ca\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_21e007a6.iso](https://drive.massgrave.dev/fr-ca_windows_10_enterprise_ltsc_2019_x86_dvd_21e007a6.iso) |
| French | x64 | [fr\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_d64b363d.iso](https://drive.massgrave.dev/fr_windows_10_enterprise_ltsc_2019_x64_dvd_d64b363d.iso) |
| French | x86 | [fr\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_6718a277.iso](https://drive.massgrave.dev/fr_windows_10_enterprise_ltsc_2019_x86_dvd_6718a277.iso) |
| Hebrew | x64 | [he\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_a5032f00.iso](https://drive.massgrave.dev/he_windows_10_enterprise_ltsc_2019_x64_dvd_a5032f00.iso) |
| Hebrew | x86 | [he\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_e35105b4.iso](https://drive.massgrave.dev/he_windows_10_enterprise_ltsc_2019_x86_dvd_e35105b4.iso) |
| Croatian | x64 | [hr\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_0154a57e.iso](https://drive.massgrave.dev/hr_windows_10_enterprise_ltsc_2019_x64_dvd_0154a57e.iso) |
| Croatian | x86 | [hr\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_978cda23.iso](https://drive.massgrave.dev/hr_windows_10_enterprise_ltsc_2019_x86_dvd_978cda23.iso) |
| Hungarian | x64 | [hu\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_7afb1447.iso](https://drive.massgrave.dev/hu_windows_10_enterprise_ltsc_2019_x64_dvd_7afb1447.iso) |
| Hungarian | x86 | [hu\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_c59bde73.iso](https://drive.massgrave.dev/hu_windows_10_enterprise_ltsc_2019_x86_dvd_c59bde73.iso) |
| Italian | x64 | [it\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_e8629a2f.iso](https://drive.massgrave.dev/it_windows_10_enterprise_ltsc_2019_x64_dvd_e8629a2f.iso) |
| Italian | x86 | [it\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_0908d54b.iso](https://drive.massgrave.dev/it_windows_10_enterprise_ltsc_2019_x86_dvd_0908d54b.iso) |
| Japanese | x64 | [ja\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_c67b830b.iso](https://drive.massgrave.dev/ja_windows_10_enterprise_ltsc_2019_x64_dvd_c67b830b.iso) |
| Japanese | x86 | [ja\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_72e8b031.iso](https://drive.massgrave.dev/ja_windows_10_enterprise_ltsc_2019_x86_dvd_72e8b031.iso) |
| Korean | x64 | [ko\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_67887e3e.iso](https://drive.massgrave.dev/ko_windows_10_enterprise_ltsc_2019_x64_dvd_67887e3e.iso) |
| Korean | x86 | [ko\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_4df783b1.iso](https://drive.massgrave.dev/ko_windows_10_enterprise_ltsc_2019_x86_dvd_4df783b1.iso) |
| Lithuanian | x64 | [lt\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_5f505ee8.iso](https://drive.massgrave.dev/lt_windows_10_enterprise_ltsc_2019_x64_dvd_5f505ee8.iso) |
| Lithuanian | x86 | [lt\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_d3df66d2.iso](https://drive.massgrave.dev/lt_windows_10_enterprise_ltsc_2019_x86_dvd_d3df66d2.iso) |
| Latvian | x64 | [lv\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_410d73cd.iso](https://drive.massgrave.dev/lv_windows_10_enterprise_ltsc_2019_x64_dvd_410d73cd.iso) |
| Latvian | x86 | [lv\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_c4ab014e.iso](https://drive.massgrave.dev/lv_windows_10_enterprise_ltsc_2019_x86_dvd_c4ab014e.iso) |
| Norwegian-Bokmal | x64 | [nb\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_512b1b80.iso](https://drive.massgrave.dev/nb_windows_10_enterprise_ltsc_2019_x64_dvd_512b1b80.iso) |
| Norwegian-Bokmal | x86 | [nb\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_4411d908.iso](https://drive.massgrave.dev/nb_windows_10_enterprise_ltsc_2019_x86_dvd_4411d908.iso) |
| Dutch | x64 | [nl\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_6b4c874e.iso](https://drive.massgrave.dev/nl_windows_10_enterprise_ltsc_2019_x64_dvd_6b4c874e.iso) |
| Dutch | x86 | [nl\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_7de5cbe9.iso](https://drive.massgrave.dev/nl_windows_10_enterprise_ltsc_2019_x86_dvd_7de5cbe9.iso) |
| Polish | x64 | [pl\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_e896167a.iso](https://drive.massgrave.dev/pl_windows_10_enterprise_ltsc_2019_x64_dvd_e896167a.iso) |
| Polish | x86 | [pl\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_83c5bbde.iso](https://drive.massgrave.dev/pl_windows_10_enterprise_ltsc_2019_x86_dvd_83c5bbde.iso) |
| Portuguese-Portugal | x64 | [pp\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_c8d2470d.iso](https://drive.massgrave.dev/pp_windows_10_enterprise_ltsc_2019_x64_dvd_c8d2470d.iso) |
| Portuguese-Portugal | x86 | [pp\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_206310fd.iso](https://drive.massgrave.dev/pp_windows_10_enterprise_ltsc_2019_x86_dvd_206310fd.iso) |
| Portuguese-Brazil | x64 | [pt\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_d43dcbad.iso](https://drive.massgrave.dev/pt_windows_10_enterprise_ltsc_2019_x64_dvd_d43dcbad.iso) |
| Portuguese-Brazil | x86 | [pt\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_208df283.iso](https://drive.massgrave.dev/pt_windows_10_enterprise_ltsc_2019_x86_dvd_208df283.iso) |
| Romanian | x64 | [ro\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_47b6116b.iso](https://drive.massgrave.dev/ro_windows_10_enterprise_ltsc_2019_x64_dvd_47b6116b.iso) |
| Romanian | x86 | [ro\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_d1a09b2f.iso](https://drive.massgrave.dev/ro_windows_10_enterprise_ltsc_2019_x86_dvd_d1a09b2f.iso) |
| Russian | x64 | [ru\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_78e7853a.iso](https://drive.massgrave.dev/ru_windows_10_enterprise_ltsc_2019_x64_dvd_78e7853a.iso) |
| Russian | x86 | [ru\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_196b5dad.iso](https://drive.massgrave.dev/ru_windows_10_enterprise_ltsc_2019_x86_dvd_196b5dad.iso) |
| Slovak | x64 | [sk\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_47437358.iso](https://drive.massgrave.dev/sk_windows_10_enterprise_ltsc_2019_x64_dvd_47437358.iso) |
| Slovak | x86 | [sk\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_dede1f66.iso](https://drive.massgrave.dev/sk_windows_10_enterprise_ltsc_2019_x86_dvd_dede1f66.iso) |
| Slovenian | x64 | [sl\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_05f349aa.iso](https://drive.massgrave.dev/sl_windows_10_enterprise_ltsc_2019_x64_dvd_05f349aa.iso) |
| Slovenian | x86 | [sl\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_3b3b7261.iso](https://drive.massgrave.dev/sl_windows_10_enterprise_ltsc_2019_x86_dvd_3b3b7261.iso) |
| Serbian-Latin | x64 | [sr\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_8b47ec8a.iso](https://drive.massgrave.dev/sr_windows_10_enterprise_ltsc_2019_x64_dvd_8b47ec8a.iso) |
| Serbian-Latin | x86 | [sr\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_973a9911.iso](https://drive.massgrave.dev/sr_windows_10_enterprise_ltsc_2019_x86_dvd_973a9911.iso) |
| Swedish | x64 | [sv\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_4b25e231.iso](https://drive.massgrave.dev/sv_windows_10_enterprise_ltsc_2019_x64_dvd_4b25e231.iso) |
| Swedish | x86 | [sv\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_5618a7ff.iso](https://drive.massgrave.dev/sv_windows_10_enterprise_ltsc_2019_x86_dvd_5618a7ff.iso) |
| Thai | x64 | [th\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_ae87916a.iso](https://drive.massgrave.dev/th_windows_10_enterprise_ltsc_2019_x64_dvd_ae87916a.iso) |
| Thai | x86 | [th\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_5e37c638.iso](https://drive.massgrave.dev/th_windows_10_enterprise_ltsc_2019_x86_dvd_5e37c638.iso) |
| Turkish | x64 | [tr\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_f2b90518.iso](https://drive.massgrave.dev/tr_windows_10_enterprise_ltsc_2019_x64_dvd_f2b90518.iso) |
| Turkish | x86 | [tr\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_1d5513a0.iso](https://drive.massgrave.dev/tr_windows_10_enterprise_ltsc_2019_x86_dvd_1d5513a0.iso) |
| Ukrainian | x64 | [uk\_windows\_10\_enterprise\_ltsc\_2019\_x64\_dvd\_d40a905a.iso](https://drive.massgrave.dev/uk_windows_10_enterprise_ltsc_2019_x64_dvd_d40a905a.iso) |
| Ukrainian | x86 | [uk\_windows\_10\_enterprise\_ltsc\_2019\_x86\_dvd\_e3b4eb4d.iso](https://drive.massgrave.dev/uk_windows_10_enterprise_ltsc_2019_x86_dvd_e3b4eb4d.iso) |

## Windows 10 Enterprise LTSB 2016

**版本 - 14393**

| 语言 | 架构 | 链接 |
| --- | --- | --- |
| Arabic | x64 | [ar\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9059481.iso](https://drive.massgrave.dev/ar_windows_10_enterprise_2016_ltsb_x64_dvd_9059481.iso) |
| Arabic | x86 | [ar\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9060006.iso](https://drive.massgrave.dev/ar_windows_10_enterprise_2016_ltsb_x86_dvd_9060006.iso) |
| Bulgarian | x64 | [bg\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9060109.iso](https://drive.massgrave.dev/bg_windows_10_enterprise_2016_ltsb_x64_dvd_9060109.iso) |
| Bulgarian | x86 | [bg\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9060079.iso](https://drive.massgrave.dev/bg_windows_10_enterprise_2016_ltsb_x86_dvd_9060079.iso) |
| Chinese-Simplified | x64 | [cn\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9060409.iso](https://drive.massgrave.dev/cn_windows_10_enterprise_2016_ltsb_x64_dvd_9060409.iso) |
| Chinese-Simplified | x86 | [cn\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9057089.iso](https://drive.massgrave.dev/cn_windows_10_enterprise_2016_ltsb_x86_dvd_9057089.iso) |
| Czech | x64 | [cs\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9058277.iso](https://drive.massgrave.dev/cs_windows_10_enterprise_2016_ltsb_x64_dvd_9058277.iso) |
| Czech | x86 | [cs\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9058253.iso](https://drive.massgrave.dev/cs_windows_10_enterprise_2016_ltsb_x86_dvd_9058253.iso) |
| Chinese-Traditional | x64 | [ct\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9057374.iso](https://drive.massgrave.dev/ct_windows_10_enterprise_2016_ltsb_x64_dvd_9057374.iso) |
| Chinese-Traditional | x86 | [ct\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9057437.iso](https://drive.massgrave.dev/ct_windows_10_enterprise_2016_ltsb_x86_dvd_9057437.iso) |
| Danish | x64 | [da\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9058601.iso](https://drive.massgrave.dev/da_windows_10_enterprise_2016_ltsb_x64_dvd_9058601.iso) |
| Danish | x86 | [da\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9058895.iso](https://drive.massgrave.dev/da_windows_10_enterprise_2016_ltsb_x86_dvd_9058895.iso) |
| German | x64 | [de\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9058605.iso](https://drive.massgrave.dev/de_windows_10_enterprise_2016_ltsb_x64_dvd_9058605.iso) |
| German | x86 | [de\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9058899.iso](https://drive.massgrave.dev/de_windows_10_enterprise_2016_ltsb_x86_dvd_9058899.iso) |
| Greek | x64 | [el\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9059317.iso](https://drive.massgrave.dev/el_windows_10_enterprise_2016_ltsb_x64_dvd_9059317.iso) |
| Greek | x86 | [el\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9059530.iso](https://drive.massgrave.dev/el_windows_10_enterprise_2016_ltsb_x86_dvd_9059530.iso) |
| English-United Kingdom | x64 | [en-gb\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9060114.iso](https://drive.massgrave.dev/en-gb_windows_10_enterprise_2016_ltsb_x64_dvd_9060114.iso) |
| English-United Kingdom | x86 | [en-gb\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9060085.iso](https://drive.massgrave.dev/en-gb_windows_10_enterprise_2016_ltsb_x86_dvd_9060085.iso) |
| English | x64 | [en\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9059483.iso](https://drive.massgrave.dev/en_windows_10_enterprise_2016_ltsb_x64_dvd_9059483.iso) |
| English | x86 | [en\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9060010.iso](https://drive.massgrave.dev/en_windows_10_enterprise_2016_ltsb_x86_dvd_9060010.iso) |
| Spanish-Mexico | x64 | [es-mx\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9060115.iso](https://drive.massgrave.dev/es-mx_windows_10_enterprise_2016_ltsb_x64_dvd_9060115.iso) |
| Spanish-Mexico | x86 | [es-mx\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9060090.iso](https://drive.massgrave.dev/es-mx_windows_10_enterprise_2016_ltsb_x86_dvd_9060090.iso) |
| Spanish | x64 | [es\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9059485.iso](https://drive.massgrave.dev/es_windows_10_enterprise_2016_ltsb_x64_dvd_9059485.iso) |
| Spanish | x86 | [es\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9060020.iso](https://drive.massgrave.dev/es_windows_10_enterprise_2016_ltsb_x86_dvd_9060020.iso) |
| Estonian | x64 | [et\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9060433.iso](https://drive.massgrave.dev/et_windows_10_enterprise_2016_ltsb_x64_dvd_9060433.iso) |
| Estonian | x86 | [et\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9057091.iso](https://drive.massgrave.dev/et_windows_10_enterprise_2016_ltsb_x86_dvd_9057091.iso) |
| Finnish | x64 | [fi\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9057376.iso](https://drive.massgrave.dev/fi_windows_10_enterprise_2016_ltsb_x64_dvd_9057376.iso) |
| Finnish | x86 | [fi\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9057439.iso](https://drive.massgrave.dev/fi_windows_10_enterprise_2016_ltsb_x86_dvd_9057439.iso) |
| French-Canada | x64 | [fr-ca\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9058278.iso](https://drive.massgrave.dev/fr-ca_windows_10_enterprise_2016_ltsb_x64_dvd_9058278.iso) |
| French-Canada | x86 | [fr-ca\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9058259.iso](https://drive.massgrave.dev/fr-ca_windows_10_enterprise_2016_ltsb_x86_dvd_9058259.iso) |
| French | x64 | [fr\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9057871.iso](https://drive.massgrave.dev/fr_windows_10_enterprise_2016_ltsb_x64_dvd_9057871.iso) |
| French | x86 | [fr\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9058127.iso](https://drive.massgrave.dev/fr_windows_10_enterprise_2016_ltsb_x86_dvd_9058127.iso) |
| Hebrew | x64 | [he\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9059484.iso](https://drive.massgrave.dev/he_windows_10_enterprise_2016_ltsb_x64_dvd_9059484.iso) |
| Hebrew | x86 | [he\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9060012.iso](https://drive.massgrave.dev/he_windows_10_enterprise_2016_ltsb_x86_dvd_9060012.iso) |
| Croatian | x64 | [hr\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9057884.iso](https://drive.massgrave.dev/hr_windows_10_enterprise_2016_ltsb_x64_dvd_9057884.iso) |
| Croatian | x86 | [hr\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9058120.iso](https://drive.massgrave.dev/hr_windows_10_enterprise_2016_ltsb_x86_dvd_9058120.iso) |
| Hungarian | x64 | [hu\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9060111.iso](https://drive.massgrave.dev/hu_windows_10_enterprise_2016_ltsb_x64_dvd_9060111.iso) |
| Hungarian | x86 | [hu\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9060087.iso](https://drive.massgrave.dev/hu_windows_10_enterprise_2016_ltsb_x86_dvd_9060087.iso) |
| Italian | x64 | [it\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9060446.iso](https://drive.massgrave.dev/it_windows_10_enterprise_2016_ltsb_x64_dvd_9060446.iso) |
| Italian | x86 | [it\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9057094.iso](https://drive.massgrave.dev/it_windows_10_enterprise_2016_ltsb_x86_dvd_9057094.iso) |
| Japanese | x64 | [ja\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9057377.iso](https://drive.massgrave.dev/ja_windows_10_enterprise_2016_ltsb_x64_dvd_9057377.iso) |
| Japanese | x86 | [ja\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9057438.iso](https://drive.massgrave.dev/ja_windows_10_enterprise_2016_ltsb_x86_dvd_9057438.iso) |
| Korean | x64 | [ko\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9057889.iso](https://drive.massgrave.dev/ko_windows_10_enterprise_2016_ltsb_x64_dvd_9057889.iso) |
| Korean | x86 | [ko\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9058162.iso](https://drive.massgrave.dev/ko_windows_10_enterprise_2016_ltsb_x86_dvd_9058162.iso) |
| Lithuanian | x64 | [lt\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9058606.iso](https://drive.massgrave.dev/lt_windows_10_enterprise_2016_ltsb_x64_dvd_9058606.iso) |
| Lithuanian | x86 | [lt\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9058906.iso](https://drive.massgrave.dev/lt_windows_10_enterprise_2016_ltsb_x86_dvd_9058906.iso) |
| Latvian | x64 | [lv\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9058289.iso](https://drive.massgrave.dev/lv_windows_10_enterprise_2016_ltsb_x64_dvd_9058289.iso) |
| Latvian | x86 | [lv\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9058263.iso](https://drive.massgrave.dev/lv_windows_10_enterprise_2016_ltsb_x86_dvd_9058263.iso) |
| Norwegian-Bokmal | x64 | [nb\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9059319.iso](https://drive.massgrave.dev/nb_windows_10_enterprise_2016_ltsb_x64_dvd_9059319.iso) |
| Norwegian-Bokmal | x86 | [nb\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9059535.iso](https://drive.massgrave.dev/nb_windows_10_enterprise_2016_ltsb_x86_dvd_9059535.iso) |
| Dutch | x64 | [nl\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9059312.iso](https://drive.massgrave.dev/nl_windows_10_enterprise_2016_ltsb_x64_dvd_9059312.iso) |
| Dutch | x86 | [nl\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9059526.iso](https://drive.massgrave.dev/nl_windows_10_enterprise_2016_ltsb_x86_dvd_9059526.iso) |
| Polish | x64 | [pl\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9059490.iso](https://drive.massgrave.dev/pl_windows_10_enterprise_2016_ltsb_x64_dvd_9059490.iso) |
| Polish | x86 | [pl\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9060015.iso](https://drive.massgrave.dev/pl_windows_10_enterprise_2016_ltsb_x86_dvd_9060015.iso) |
| Portuguese-Portugal | x64 | [pp\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9060465.iso](https://drive.massgrave.dev/pp_windows_10_enterprise_2016_ltsb_x64_dvd_9060465.iso) |
| Portuguese-Portugal | x86 | [pp\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9057097.iso](https://drive.massgrave.dev/pp_windows_10_enterprise_2016_ltsb_x86_dvd_9057097.iso) |
| Portuguese-Brazil | x64 | [pt\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9060113.iso](https://drive.massgrave.dev/pt_windows_10_enterprise_2016_ltsb_x64_dvd_9060113.iso) |
| Portuguese-Brazil | x86 | [pt\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9060088.iso](https://drive.massgrave.dev/pt_windows_10_enterprise_2016_ltsb_x86_dvd_9060088.iso) |
| Romanian | x64 | [ro\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9057388.iso](https://drive.massgrave.dev/ro_windows_10_enterprise_2016_ltsb_x64_dvd_9057388.iso) |
| Romanian | x86 | [ro\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9057443.iso](https://drive.massgrave.dev/ro_windows_10_enterprise_2016_ltsb_x86_dvd_9057443.iso) |
| Russian | x64 | [ru\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9057886.iso](https://drive.massgrave.dev/ru_windows_10_enterprise_2016_ltsb_x64_dvd_9057886.iso) |
| Russian | x86 | [ru\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9058173.iso](https://drive.massgrave.dev/ru_windows_10_enterprise_2016_ltsb_x86_dvd_9058173.iso) |
| Slovak | x64 | [sk\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9058612.iso](https://drive.massgrave.dev/sk_windows_10_enterprise_2016_ltsb_x64_dvd_9058612.iso) |
| Slovak | x86 | [sk\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9058908.iso](https://drive.massgrave.dev/sk_windows_10_enterprise_2016_ltsb_x86_dvd_9058908.iso) |
| Slovenian | x64 | [sl\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9059321.iso](https://drive.massgrave.dev/sl_windows_10_enterprise_2016_ltsb_x64_dvd_9059321.iso) |
| Slovenian | x86 | [sl\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9059531.iso](https://drive.massgrave.dev/sl_windows_10_enterprise_2016_ltsb_x86_dvd_9059531.iso) |
| Serbian-Latin | x64 | [sr-latn\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9058293.iso](https://drive.massgrave.dev/sr-latn_windows_10_enterprise_2016_ltsb_x64_dvd_9058293.iso) |
| Serbian-Latin | x86 | [sr-latn\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9058276.iso](https://drive.massgrave.dev/sr-latn_windows_10_enterprise_2016_ltsb_x86_dvd_9058276.iso) |
| Swedish | x64 | [sv\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9060456.iso](https://drive.massgrave.dev/sv_windows_10_enterprise_2016_ltsb_x64_dvd_9060456.iso) |
| Swedish | x86 | [sv\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9057114.iso](https://drive.massgrave.dev/sv_windows_10_enterprise_2016_ltsb_x86_dvd_9057114.iso) |
| Thai | x64 | [th\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9057403.iso](https://drive.massgrave.dev/th_windows_10_enterprise_2016_ltsb_x64_dvd_9057403.iso) |
| Thai | x86 | [th\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9057441.iso](https://drive.massgrave.dev/th_windows_10_enterprise_2016_ltsb_x86_dvd_9057441.iso) |
| Turkish | x64 | [tr\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9057891.iso](https://drive.massgrave.dev/tr_windows_10_enterprise_2016_ltsb_x64_dvd_9057891.iso) |
| Turkish | x86 | [tr\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9058186.iso](https://drive.massgrave.dev/tr_windows_10_enterprise_2016_ltsb_x86_dvd_9058186.iso) |
| Ukrainian | x64 | [uk\_windows\_10\_enterprise\_2016\_ltsb\_x64\_dvd\_9058295.iso](https://drive.massgrave.dev/uk_windows_10_enterprise_2016_ltsb_x64_dvd_9058295.iso) |
| Ukrainian | x86 | [uk\_windows\_10\_enterprise\_2016\_ltsb\_x86\_dvd\_9058286.iso](https://drive.massgrave.dev/uk_windows_10_enterprise_2016_ltsb_x86_dvd_9058286.iso) |

**Windows 10 Enterprise LTSB 2015**

(Build - 10240)

| Language | Arch | Link |
| --- | --- | --- |
| Arabic | x64 | [ar\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6848420.iso](https://drive.massgrave.dev/ar_windows_10_enterprise_2015_ltsb_x64_dvd_6848420.iso) |
| Arabic | x86 | [ar\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6848421.iso](https://drive.massgrave.dev/ar_windows_10_enterprise_2015_ltsb_x86_dvd_6848421.iso) |
| Bulgarian | x64 | [bg\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6848422.iso](https://drive.massgrave.dev/bg_windows_10_enterprise_2015_ltsb_x64_dvd_6848422.iso) |
| Bulgarian | x86 | [bg\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6848424.iso](https://drive.massgrave.dev/bg_windows_10_enterprise_2015_ltsb_x86_dvd_6848424.iso) |
| Chinese-Simplified | x64 | [cn\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6848425.iso](https://drive.massgrave.dev/cn_windows_10_enterprise_2015_ltsb_x64_dvd_6848425.iso) |
| Chinese-Simplified | x86 | [cn\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6848426.iso](https://drive.massgrave.dev/cn_windows_10_enterprise_2015_ltsb_x86_dvd_6848426.iso) |
| Czech | x64 | [cs\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6848435.iso](https://drive.massgrave.dev/cs_windows_10_enterprise_2015_ltsb_x64_dvd_6848435.iso) |
| Czech | x86 | [cs\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6848437.iso](https://drive.massgrave.dev/cs_windows_10_enterprise_2015_ltsb_x86_dvd_6848437.iso) |
| Danish | x64 | [da\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6848440.iso](https://drive.massgrave.dev/da_windows_10_enterprise_2015_ltsb_x64_dvd_6848440.iso) |
| Danish | x86 | [da\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6848441.iso](https://drive.massgrave.dev/da_windows_10_enterprise_2015_ltsb_x86_dvd_6848441.iso) |
| German | x64 | [de\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6848473.iso](https://drive.massgrave.dev/de_windows_10_enterprise_2015_ltsb_x64_dvd_6848473.iso) |
| German | x86 | [de\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6848474.iso](https://drive.massgrave.dev/de_windows_10_enterprise_2015_ltsb_x86_dvd_6848474.iso) |
| Greek | x64 | [el\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6848475.iso](https://drive.massgrave.dev/el_windows_10_enterprise_2015_ltsb_x64_dvd_6848475.iso) |
| Greek | x86 | [el\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6848476.iso](https://drive.massgrave.dev/el_windows_10_enterprise_2015_ltsb_x86_dvd_6848476.iso) |
| English-United Kingdom | x64 | [en-gb\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6848456.iso](https://drive.massgrave.dev/en-gb_windows_10_enterprise_2015_ltsb_x64_dvd_6848456.iso) |
| English-United Kingdom | x86 | [en-gb\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6848457.iso](https://drive.massgrave.dev/en-gb_windows_10_enterprise_2015_ltsb_x86_dvd_6848457.iso) |
| English | x64 | [en\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6848446.iso](https://drive.massgrave.dev/en_windows_10_enterprise_2015_ltsb_x64_dvd_6848446.iso) |
| English | x86 | [en\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6848454.iso](https://drive.massgrave.dev/en_windows_10_enterprise_2015_ltsb_x86_dvd_6848454.iso) |
| Spanish-Mexico | x64 | [es-mx\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850897.iso](https://drive.massgrave.dev/es-mx_windows_10_enterprise_2015_ltsb_x64_dvd_6850897.iso) |
| Spanish-Mexico | x86 | [es-mx\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850898.iso](https://drive.massgrave.dev/es-mx_windows_10_enterprise_2015_ltsb_x86_dvd_6850898.iso) |
| Spanish | x64 | [es\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850876.iso](https://drive.massgrave.dev/es_windows_10_enterprise_2015_ltsb_x64_dvd_6850876.iso) |
| Spanish | x86 | [es\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850896.iso](https://drive.massgrave.dev/es_windows_10_enterprise_2015_ltsb_x86_dvd_6850896.iso) |
| Estonian | x64 | [et\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6848458.iso](https://drive.massgrave.dev/et_windows_10_enterprise_2015_ltsb_x64_dvd_6848458.iso) |
| Estonian | x86 | [et\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6848460.iso](https://drive.massgrave.dev/et_windows_10_enterprise_2015_ltsb_x86_dvd_6848460.iso) |
| Finnish | x64 | [fi\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6848462.iso](https://drive.massgrave.dev/fi_windows_10_enterprise_2015_ltsb_x64_dvd_6848462.iso) |
| Finnish | x86 | [fi\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6848464.iso](https://drive.massgrave.dev/fi_windows_10_enterprise_2015_ltsb_x86_dvd_6848464.iso) |
| French-Canada | x64 | [fr-ca\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6848470.iso](https://drive.massgrave.dev/fr-ca_windows_10_enterprise_2015_ltsb_x64_dvd_6848470.iso) |
| French-Canada | x86 | [fr-ca\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6848472.iso](https://drive.massgrave.dev/fr-ca_windows_10_enterprise_2015_ltsb_x86_dvd_6848472.iso) |
| French | x64 | [fr\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6848466.iso](https://drive.massgrave.dev/fr_windows_10_enterprise_2015_ltsb_x64_dvd_6848466.iso) |
| French | x86 | [fr\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6848468.iso](https://drive.massgrave.dev/fr_windows_10_enterprise_2015_ltsb_x86_dvd_6848468.iso) |
| Hebrew | x64 | [he\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6848477.iso](https://drive.massgrave.dev/he_windows_10_enterprise_2015_ltsb_x64_dvd_6848477.iso) |
| Hebrew | x86 | [he\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850760.iso](https://drive.massgrave.dev/he_windows_10_enterprise_2015_ltsb_x86_dvd_6850760.iso) |
| Chinese-Hong Kong SAR | x64 | [hk\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6848427.iso](https://drive.massgrave.dev/hk_windows_10_enterprise_2015_ltsb_x64_dvd_6848427.iso) |
| Chinese-Hong Kong SAR | x86 | [hk\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6848428.iso](https://drive.massgrave.dev/hk_windows_10_enterprise_2015_ltsb_x86_dvd_6848428.iso) |
| Croatian | x64 | [hr\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6848433.iso](https://drive.massgrave.dev/hr_windows_10_enterprise_2015_ltsb_x64_dvd_6848433.iso) |
| Croatian | x86 | [hr\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6848434.iso](https://drive.massgrave.dev/hr_windows_10_enterprise_2015_ltsb_x86_dvd_6848434.iso) |
| Hungarian | x64 | [hu\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850770.iso](https://drive.massgrave.dev/hu_windows_10_enterprise_2015_ltsb_x64_dvd_6850770.iso) |
| Hungarian | x86 | [hu\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850771.iso](https://drive.massgrave.dev/hu_windows_10_enterprise_2015_ltsb_x86_dvd_6850771.iso) |
| Italian | x64 | [it\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850772.iso](https://drive.massgrave.dev/it_windows_10_enterprise_2015_ltsb_x64_dvd_6850772.iso) |
| Italian | x86 | [it\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850773.iso](https://drive.massgrave.dev/it_windows_10_enterprise_2015_ltsb_x86_dvd_6850773.iso) |
| Japanese | x64 | [ja\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850774.iso](https://drive.massgrave.dev/ja_windows_10_enterprise_2015_ltsb_x64_dvd_6850774.iso) |
| Japanese | x86 | [ja\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850775.iso](https://drive.massgrave.dev/ja_windows_10_enterprise_2015_ltsb_x86_dvd_6850775.iso) |
| Korean | x64 | [ko\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850776.iso](https://drive.massgrave.dev/ko_windows_10_enterprise_2015_ltsb_x64_dvd_6850776.iso) |
| Korean | x86 | [ko\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850777.iso](https://drive.massgrave.dev/ko_windows_10_enterprise_2015_ltsb_x86_dvd_6850777.iso) |
| Lithuanian | x64 | [lt\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850780.iso](https://drive.massgrave.dev/lt_windows_10_enterprise_2015_ltsb_x64_dvd_6850780.iso) |
| Lithuanian | x86 | [lt\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850781.iso](https://drive.massgrave.dev/lt_windows_10_enterprise_2015_ltsb_x86_dvd_6850781.iso) |
| Latvian | x64 | [lv\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850778.iso](https://drive.massgrave.dev/lv_windows_10_enterprise_2015_ltsb_x64_dvd_6850778.iso) |
| Latvian | x86 | [lv\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850779.iso](https://drive.massgrave.dev/lv_windows_10_enterprise_2015_ltsb_x86_dvd_6850779.iso) |
| Norwegian-Bokmal | x64 | [nb\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850782.iso](https://drive.massgrave.dev/nb_windows_10_enterprise_2015_ltsb_x64_dvd_6850782.iso) |
| Norwegian-Bokmal | x86 | [nb\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850783.iso](https://drive.massgrave.dev/nb_windows_10_enterprise_2015_ltsb_x86_dvd_6850783.iso) |
| Dutch | x64 | [nl\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6848442.iso](https://drive.massgrave.dev/nl_windows_10_enterprise_2015_ltsb_x64_dvd_6848442.iso) |
| Dutch | x86 | [nl\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6848443.iso](https://drive.massgrave.dev/nl_windows_10_enterprise_2015_ltsb_x86_dvd_6848443.iso) |
| Polish | x64 | [pl\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850784.iso](https://drive.massgrave.dev/pl_windows_10_enterprise_2015_ltsb_x64_dvd_6850784.iso) |
| Polish | x86 | [pl\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850785.iso](https://drive.massgrave.dev/pl_windows_10_enterprise_2015_ltsb_x86_dvd_6850785.iso) |
| Portuguese-Portugal | x64 | [pp\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850808.iso](https://drive.massgrave.dev/pp_windows_10_enterprise_2015_ltsb_x64_dvd_6850808.iso) |
| Portuguese-Portugal | x86 | [pp\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850818.iso](https://drive.massgrave.dev/pp_windows_10_enterprise_2015_ltsb_x86_dvd_6850818.iso) |
| Portuguese-Brazil | x64 | [pt\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850787.iso](https://drive.massgrave.dev/pt_windows_10_enterprise_2015_ltsb_x64_dvd_6850787.iso) |
| Portuguese-Brazil | x86 | [pt\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850798.iso](https://drive.massgrave.dev/pt_windows_10_enterprise_2015_ltsb_x86_dvd_6850798.iso) |
| Romanian | x64 | [ro\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850828.iso](https://drive.massgrave.dev/ro_windows_10_enterprise_2015_ltsb_x64_dvd_6850828.iso) |
| Romanian | x86 | [ro\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850837.iso](https://drive.massgrave.dev/ro_windows_10_enterprise_2015_ltsb_x86_dvd_6850837.iso) |
| Russian | x64 | [ru\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850847.iso](https://drive.massgrave.dev/ru_windows_10_enterprise_2015_ltsb_x64_dvd_6850847.iso) |
| Russian | x86 | [ru\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850858.iso](https://drive.massgrave.dev/ru_windows_10_enterprise_2015_ltsb_x86_dvd_6850858.iso) |
| Slovak | x64 | [sk\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850870.iso](https://drive.massgrave.dev/sk_windows_10_enterprise_2015_ltsb_x64_dvd_6850870.iso) |
| Slovak | x86 | [sk\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850871.iso](https://drive.massgrave.dev/sk_windows_10_enterprise_2015_ltsb_x86_dvd_6850871.iso) |
| Slovenian | x64 | [sl\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850872.iso](https://drive.massgrave.dev/sl_windows_10_enterprise_2015_ltsb_x64_dvd_6850872.iso) |
| Slovenian | x86 | [sl\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850873.iso](https://drive.massgrave.dev/sl_windows_10_enterprise_2015_ltsb_x86_dvd_6850873.iso) |
| Serbian-Latin | x64 | [sr-latn\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850868.iso](https://drive.massgrave.dev/sr-latn_windows_10_enterprise_2015_ltsb_x64_dvd_6850868.iso) |
| Serbian-Latin | x86 | [sr-latn\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850869.iso](https://drive.massgrave.dev/sr-latn_windows_10_enterprise_2015_ltsb_x86_dvd_6850869.iso) |
| Swedish | x64 | [sv\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850899.iso](https://drive.massgrave.dev/sv_windows_10_enterprise_2015_ltsb_x64_dvd_6850899.iso) |
| Swedish | x86 | [sv\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850900.iso](https://drive.massgrave.dev/sv_windows_10_enterprise_2015_ltsb_x86_dvd_6850900.iso) |
| Thai | x64 | [th\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850901.iso](https://drive.massgrave.dev/th_windows_10_enterprise_2015_ltsb_x64_dvd_6850901.iso) |
| Thai | x86 | [th\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850902.iso](https://drive.massgrave.dev/th_windows_10_enterprise_2015_ltsb_x86_dvd_6850902.iso) |
| Turkish | x64 | [tr\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850904.iso](https://drive.massgrave.dev/tr_windows_10_enterprise_2015_ltsb_x64_dvd_6850904.iso) |
| Turkish | x86 | [tr\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850915.iso](https://drive.massgrave.dev/tr_windows_10_enterprise_2015_ltsb_x86_dvd_6850915.iso) |
| Chinese-Traditional | x64 | [tw\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6848430.iso](https://drive.massgrave.dev/tw_windows_10_enterprise_2015_ltsb_x64_dvd_6848430.iso) |
| Chinese-Traditional | x86 | [tw\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6848432.iso](https://drive.massgrave.dev/tw_windows_10_enterprise_2015_ltsb_x86_dvd_6848432.iso) |
| Ukrainian | x64 | [uk\_windows\_10\_enterprise\_2015\_ltsb\_x64\_dvd\_6850925.iso](https://drive.massgrave.dev/uk_windows_10_enterprise_2015_ltsb_x64_dvd_6850925.iso) |
| Ukrainian | x86 | [uk\_windows\_10\_enterprise\_2015\_ltsb\_x86\_dvd\_6850935.iso](https://drive.massgrave.dev/uk_windows_10_enterprise_2015_ltsb_x86_dvd_6850935.iso) |

## Windows 10/11 IoT Enterprise LTSC ARM64

请查看[此处](./Win-ARM64.md)。