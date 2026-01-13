# ExplorerBgTool

Let your Explorer have a custom background image for Windows 11 and Windows 10
让你的Windows 11 和 Windows10 的文件管理器拥有自定义背景图

* 自定义文件资源管理器背景图片
* 支持多个图片随机
* 可调整图片透明度
* 可自定义图片显示位置
* 支持单独为某个路径设置背景图片

# 

* Customize Explorer Item View background image
* Supports random switching of multiple pictures
* Adjustable picture alpha
* Customizable image display position
* Support setting background image for a path separately

## 准备工作

**这个项目的结构目录应该如下**

```text
ExplorerBg/
├── ExplorerBgTool.dll
├── config.ini
├── Register.cmd
├── Uninstall.cmd
└── Image/
   ├── Image.png
   ├── ...
    ...
```

将想要设置为背景的图片放置于Image文件夹中

## 使用方法

以管理员身份运行Register.cmd即安装背景，Uninstall.cmd即卸载背景。

您也可以使用命令提示符手动注册/卸载

> `regsvr32 (/u) "你的路径/ExplorerBgTool.dll"`

## 配置文件 (Config)

您可以通过修改 "`config.ini`"来修改一些样式

You can modify some styles by modifying "`config.ini`"

```ini
[load]
#指定是否在文件对话框中启用
#Specify whether or not to enable in the file dialog.
folderExt=false
#指定是否忽略错误(即出现错误不显示错误弹窗)
#Specify whether or not to ignore errors (i.e. not show error popups when errors occur).
noerror=false
[image]
#指定图片是否随机显示 您必须放入至少两张图像
#Specifies whether the image is displayed randomly, you need to put at least 2 images
random=true
#是否启用指定自定义文件夹的图片
#Enable custom specified folder pictures
custom=false
#图片显示位置 0=左上角 1=右上角 2=左下角 3=右下角 4=居中 5=缩放 6=缩放并填充; 默认为3 右下角
#Image display position
#0=Left top 1=Right top 2=Left right 3=Right bottom 4=Center 5=Stretch 6=Zoom and fill
posType=0
#图片的不透明度 范围0-255
#Alpha 0-255 of image
imgAlpha=255
#自定义图片目录绝对路径 (为空则默认 ./image)
#Custom image folder absolute path (empty defaults to . /image)
folder=
```

修改后 您无需重启文件资源管理器 只需重新打开当前窗口即可

After modification you don't need to restart file explorer, just reopen the current window

## 自定义路径 (Custom)

示例 (Example)

Config.ini

```ini
[image]
custom=true

#括号内填入路径 请先将图片放入Image文件夹然后 img= 指定Image文件夹里的文件名 是文件名不是完整路径!
#Please put the picture in the Image folder first, and then img=specify the file name in the Image folder Is the file name, not the full path!
#某些特殊文件夹路径是CLSID 例如:
#Some special folder paths are CLSID For example:
#此电脑 This PC
#::{20D04FE0-3AEA-1069-A2D8-08002B30309D}
#快速访问 Quick access
#::{679F85CB-0220-4080-B29B-5540CC05AAB6}
#网络 Network
#::{F02C1A0D-BE21-4350-88B0-7367FC96EF3C}

#示例 (Example)
[::{20D04FE0-3AEA-1069-A2D8-08002B30309D}]
img=myimage.png

[C:\\Users\\admin\\Pictures\\Camera Roll]
img=mypic.png
#保存文件后 刷新 立即生效(Takes effect as soon as the file is saved)
```

## 注意事项 (Attention)

图片仅支持`png、jpg`格式 请确保为有效的图片 否则可能引发崩溃!

如果出现崩溃 请按住`ESC`键再打开文件资源管理器(这不会加载图像) 然后卸载本工具或删除不兼容的图像

# 

The image only supports `png, jpg` format, please make sure it is a valid image, otherwise it may cause a crash!

If there is a crash hold down the `ESC` key and open the file explorer (this will not load the image) then uninstall the tool or delete the incompatible image

