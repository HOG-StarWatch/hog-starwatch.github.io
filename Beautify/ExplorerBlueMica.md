# ExplorerBlurMica

Add background Blur effect or Acrylic or Mica effect to explorer for win10 and win11



给文件资源管理器添加背景模糊效果或Acrylic、Mica效果 适用于win10和win11

# 



## 效果

* 可选Blur、Acrylic或者Mica效果
* 可自定义混合颜色
* 亮/暗 颜色模式自适应



## 如何使用



### 安装

**这个项目的结构目录应该如下**



```text
ExplorerBlurMica/
├── ExplorerBlurMica.dll
├── config.ini
├── Register.cmd
└── Uninstall.cmd
```

1. 以管理员身份运行 "`register.cmd`"
2. 重新打开文件资源管理器窗口即可生效

cmd: `regsvr32 "你的路径/ExplorerBlurMica.dll"`

### 卸载

1. 以管理员身份运行 "`uninstall.cmd`"
2. 删除剩余文件

cmd: `regsvr32 /u "你的路径/ExplorerBlurMica.dll"`

#

注意：如果出现文件资源管理器异常崩溃请按住`ESC`键打开资源管理器并卸载该程序。

## 配置文件
``` ini
[config]
#效果类型: 0=Blur 1=Acrylic 2=Mica 3=Blur(Clear) 4=MicaAlt
#Blur仅在win11 22H2之前版本可用; Blur(Clear)在win10和win11都可用; Mica仅限win11可用
effect=1
#清除地址栏背景颜色
clearAddress=true
#清除滚动条背景颜色
#(注意:由于系统滚动条本身不透明 因此为了去除背景色 滚动条是由本程序自绘的 它可能和系统样式有所差别)
clearBarBg=true
#清除Windows11文件资源管理器的WinUI或XamlIslands部分的工具栏背景色
clearWinUIBg=true
#显示TreeView和DUIView之间的分隔线
showLine=true
[light]
#系统颜色模式为Light(亮色)时的颜色
#RGBA 颜色分量
r=220
g=220
b=220
a=160
[dark]
#系统颜色模式为Dark(暗色)时的颜色
r=0
g=0
b=0
a=120
```

修改完保存文件重新打开文件资源管理器窗口即可生效。