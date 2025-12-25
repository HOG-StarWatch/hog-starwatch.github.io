# 简易终端交互-WindowsCMD

``` CMD
@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title TDL Manager

:: Detect TDL Executable to avoid self-recursion
set "TDL_EXE=tdl"
if exist "%SystemDrive%\tdl\tdl.exe" set "TDL_EXE=%SystemDrive%\tdl\tdl.exe"

:: Check if tdl.exe is in PATH and use it if preferred
where tdl.exe >nul 2>nul
if %errorlevel%==0 (
    for /f "tokens=*" %%i in ('where tdl.exe') do (
        if not "%%i"=="%~f0" (
            set "TDL_EXE=%%i"
            goto :FOUND_TDL
        )
    )
)
:FOUND_TDL

:RESET_CONFIG
:: Set defaults
set "cfg_skip_same=false"
set "cfg_threads=8"
set "cfg_concurrent=4"
set "cfg_dir=."
set "cfg_json=tdl-export.json"
set "cfg_whitelist="
set "cfg_blacklist="

:: Load config
if exist config (
    for /f "usebackq tokens=1* delims==" %%a in ("config") do (
        if "%%a"=="cfg_skip_same" set "cfg_skip_same=%%b"
        if "%%a"=="cfg_threads" set "cfg_threads=%%b"
        if "%%a"=="cfg_concurrent" set "cfg_concurrent=%%b"
        if "%%a"=="cfg_dir" set "cfg_dir=%%b"
        if "%%a"=="cfg_json" set "cfg_json=%%b"
        if "%%a"=="cfg_whitelist" set "cfg_whitelist=%%b"
        if "%%a"=="cfg_blacklist" set "cfg_blacklist=%%b"
    )
)

:MAIN_MENU
cls
echo =================================================
echo                 TDL Manager
echo =================================================
echo 1. 安装^&更新 (Install ^& Update)
echo 2. 登录 (Login)
echo 3. 导出 (Export)
echo 4. 下载参数设置 (Download Settings)
echo 5. 下载 (Download)
echo.
echo 0. 退出 (Exit)
echo =================================================
choice /c 123450 /n /m "请输入选项 (0-5): "
set "choice=%errorlevel%"

if "%choice%"=="1" goto INSTALL
if "%choice%"=="2" goto LOGIN
if "%choice%"=="3" goto EXPORT
if "%choice%"=="4" goto SETTINGS
if "%choice%"=="5" goto DOWNLOAD
if "%choice%"=="6" goto EXIT
goto MAIN_MENU

:EXIT
exit /b 0

:INSTALL
cls
echo tdl 将被安装到 %SystemDrive%\tdl（将被添加到 PATH 中），该脚本还可用于升级 tdl。
echo.
pause
echo [提示] 将自动检测是否已授予管理员权限...
echo 请在弹出的窗口中确认授予管理员权限 并在新打开的窗口中操作
echo.
set "PS_CMD=iwr -useb https://docs.iyear.me/tdl/install.ps1 | iex"
echo 即将执行: powershell -Command "%PS_CMD%"
echo.
timeout /t 3 /nobreak >nul

:: 检查当前是否具有管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    :: 没有管理员权限，使用runas重新启动
    echo 正在打开管理员权限窗口...
    powershell -Command "Start-Process '%~f0' -ArgumentList 'install_admin' -Verb RunAs"
    pause
    goto EXIT
)   

:: 如果有参数 install_admin，则执行安装
if "%~1"=="install_admin" (
    cls
    echo 正在以管理员权限运行安装程序...
    echo.
    powershell -NoExit -Command "%PS_CMD%"
    echo.
    echo 安装完成！按任意键返回主菜单...
    pause >nul
    exit /b 0
)

:: 正常流程
start "TDL Install" powershell -NoExit -Command "%PS_CMD%"
goto MAIN_MENU

:LOGIN
cls
echo =================================================
echo                   登录 (Login)
echo =================================================
echo 1. 直接登录 (tdl login)
echo 2. 自定义客户端路径 (tdl login -d path)
echo 3. 使用二维码登录 (tdl login -T qr)
echo 4. 使用手机号码和验证码登录 (tdl login -T code)
echo.
echo 0. 返回 (Back)
echo =================================================
choice /c 12340 /n /m "请输入选项: "
set "lchoice=%errorlevel%"
set "CMD="
set "TITLE="

if "%lchoice%"=="1" (
    set "CMD="%TDL_EXE%" login"
    set "TITLE=TDL Login"
)
if "%lchoice%"=="2" goto LOGIN_CUSTOM
if "%lchoice%"=="3" (
    set "CMD="%TDL_EXE%" login -T qr"
    set "TITLE=TDL QR Login"
)
if "%lchoice%"=="4" (
    set "CMD="%TDL_EXE%" login -T code"
    set "TITLE=TDL Phone Login"
)
if "%lchoice%"=="5" goto MAIN_MENU

if defined CMD (
    echo.
    echo 即将执行: !CMD!
    if not exist "!TDL_EXE!" (
        echo [错误] 找不到 tdl.exe，请先安装或检查路径。
        pause
        goto MAIN_MENU
    )
    pause
    start "!TITLE!" cmd /k "!CMD!"
    goto MAIN_MENU
)
goto LOGIN

:LOGIN_CUSTOM
set /p cpath="请输入 Telegram Desktop 路径: "
set "CMD="%TDL_EXE%" login -d "%cpath%""
echo.
echo 即将执行: !CMD!
pause
start "TDL Custom Login" cmd /k "!CMD!"
goto MAIN_MENU

:EXPORT
cls
echo =================================================
echo                   导出 (Export)
echo =================================================
echo 1. 列出聊天 (tdl chat ls)
echo 2. 导出聊天记录到JSON
echo.
echo 0. 返回 (Back)
echo =================================================
choice /c 120 /n /m "请输入选项: "
set "echoice=%errorlevel%"
if "%echoice%"=="1" (
    set "CMD="%TDL_EXE%" chat ls"
    echo.
    echo 即将执行: !CMD!
    if not exist "!TDL_EXE!" (
        echo [错误] 找不到 tdl.exe，请先安装或检查路径。
        pause
        goto MAIN_MENU
    )
    pause
    start "TDL List" cmd /k "!CMD!"
    goto MAIN_MENU
)
if "%echoice%"=="2" goto EXPORT_DO
if "%echoice%"=="3" goto MAIN_MENU
goto EXPORT

:EXPORT_DO
cls
echo =================================================
echo             导出聊天记录到 JSON
echo =================================================
echo [重要提示] 导出设置说明:
echo.
echo CHAT 识别方式:
echo   • @username (用户名，如 @iyear)
echo   • username  (无 @ 的用户名，如 iyear)
echo   • 123456789 (聊天ID)
echo   • https://t.me/iyear (公开链接)
echo   • +1 1234567890 (电话号码)
echo.
echo [如何获取聊天ID]:
echo   1. 打开 Telegram Desktop
echo   2. 设置 -^> 高级 -^> 实验性设置
echo   3. 启用"在资料中显示对话 ID"
echo   4. 重新打开聊天窗口，在顶部能看到ID
echo.
echo   • 留空 (直接回车): 导出"收藏夹"消息
echo.
echo [示例]:
echo   • 导出用户 @iyear: 输入 @iyear
echo   • 导出聊天ID 123456: 输入 123456
echo   • 导出收藏夹: 直接按回车
echo =================================================
echo.
set "chat_id="
set /p "chat_id=请输入 CHAT 标识 (参考上述说明): "

echo.
echo 导出设置:
echo CHAT: !chat_id!
echo 输出文件: !cfg_json!
echo.
if "!chat_id!"=="" (
    echo [注意] CHAT为空，将导出"收藏夹"消息
    set "chat_id=favorite"
)

set "CMD="%TDL_EXE%" chat export -c "!chat_id!""
echo.
echo 即将执行: !CMD!
if not exist "!TDL_EXE!" (
    echo [错误] 找不到 tdl.exe，请先安装或检查路径。
    pause
    goto MAIN_MENU
)
echo.
echo 按任意键开始导出，导出完成后JSON文件将保存在当前目录...
pause
start "TDL Export" cmd /k "!CMD!"
goto MAIN_MENU

:SETTINGS
cls
echo =================================================
echo               下载参数设置
echo =================================================
echo 当前设置:
echo 1. 跳过已存在文件 (--skip-same): !cfg_skip_same!
echo 2. 每个任务线程 (-t): !cfg_threads!
echo 3. 同时进行任务 (-l): !cfg_concurrent!
echo 4. 下载目录 (-d) 默认./downloads 修改请加盘符(例:C:\tdl): !cfg_dir!
echo 5. 从json文件导入 (-f): !cfg_json!
echo 6. 白名单 (-i): !cfg_whitelist!
echo 7. 黑名单 (-e): !cfg_blacklist!
echo.
echo 8. 保存并返回 (Save ^& Back)
echo 0. 不保存直接退出 (Exit without Saving)
echo =================================================
choice /c 123456780 /n /m "选择要修改的设置 (0-8): "
set "schoice=%errorlevel%"

if "%schoice%"=="9" goto RESET_CONFIG
if "%schoice%"=="8" goto SAVE_CONFIG
if "%schoice%"=="7" (
    cls
    echo =================================================
    echo              设置黑名单 (Blacklist)
    echo =================================================
    echo [格式说明]:
    echo   • 使用逗号分隔多个文件扩展名
    echo   • 不包含点号，只写扩展名本身
    echo   • 留空表示不使用黑名单
    echo.
    echo [示例]:
    echo   • 排除视频文件: mp4,avi,mkv,flv
    echo   • 排除文档文件: pdf,doc,docx
    echo   • 排除多种文件: mp4,avi,pdf,zip
    echo.
    echo 当前黑名单: !cfg_blacklist!
    echo =================================================
    echo.
    set "input="
    set /p "input=请输入黑名单 (使用逗号分隔，如 mp4,flv,avi): "
    if defined input set "cfg_blacklist=!input!"
    goto SETTINGS
)
if "%schoice%"=="6" (
    cls
    echo =================================================
    echo              设置白名单 (Whitelist)
    echo =================================================
    echo [格式说明]:
    echo   • 使用逗号分隔多个文件扩展名
    echo   • 不包含点号，只写扩展名本身
    echo   • 留空表示不使用白名单
    echo.
    echo [示例]:
    echo   • 仅下载图片: jpg,jpeg,png,gif
    echo   • 仅下载音频: mp3,wav,flac
    echo   • 仅下载特定格式: pdf,docx,xlsx
    echo.
    echo 注意: 白名单和黑名单同时设置时，白名单优先级更高
    echo.
    echo 当前白名单: !cfg_whitelist!
    echo =================================================
    echo.
    set "input="
    set /p "input=请输入白名单 (使用逗号分隔，如 jpg,png,gif): "
    if defined input set "cfg_whitelist=!input!"
    goto SETTINGS
)
if "%schoice%"=="5" (
    set "input="
    set /p "input=请输入 JSON 文件路径 (默认 tdl-export.json): "
    if defined input set "cfg_json=!input!"
    goto SETTINGS
)
if "%schoice%"=="4" (
    set "input="
    set /p "input=请输入下载目录 (默认 .): "
    if defined input set "cfg_dir=!input!"
    goto SETTINGS
)
if "%schoice%"=="3" (
    set "input="
    set /p "input=请输入并发任务数 (默认 4): "
    if defined input set "cfg_concurrent=!input!"
    goto SETTINGS
)
if "%schoice%"=="2" (
    set "input="
    set /p "input=请输入线程数 (默认 8): "
    if defined input set "cfg_threads=!input!"
    goto SETTINGS
)
if "%schoice%"=="1" (
    if "!cfg_skip_same!"=="false" (set "cfg_skip_same=true") else (set "cfg_skip_same=false")
    goto SETTINGS
)
goto SETTINGS

:SAVE_CONFIG
(
echo cfg_skip_same=!cfg_skip_same!
echo cfg_threads=!cfg_threads!
echo cfg_concurrent=!cfg_concurrent!
echo cfg_dir=!cfg_dir!
echo cfg_json=!cfg_json!
echo cfg_whitelist=!cfg_whitelist!
echo cfg_blacklist=!cfg_blacklist!
) > config
echo 配置已保存.
timeout /t 1 >nul
goto MAIN_MENU

:DOWNLOAD
cls
echo =================================================
echo                   下载 (Download)
echo =================================================
echo 1. 从 JSON 文件下载 (!cfg_json!)
echo 2. 从链接下载
echo.
echo 0. 返回 (Back)
echo =================================================
choice /c 120 /n /m "请输入选项: "
set "dchoice=%errorlevel%"
if "%dchoice%"=="1" goto DL_JSON
if "%dchoice%"=="2" goto DL_LINKS
if "%dchoice%"=="3" goto MAIN_MENU
goto DOWNLOAD

:DL_JSON
cls
echo =================================================
echo            从 JSON 文件下载
echo =================================================
echo 配置文件: !cfg_json!
echo 下载目录: !cfg_dir!
echo 线程数: !cfg_threads!
echo 并发任务: !cfg_concurrent!
if "!cfg_skip_same!"=="true" echo 跳过已存在: 是
if defined cfg_whitelist echo 白名单: !cfg_whitelist!
if defined cfg_blacklist echo 黑名单: !cfg_blacklist!
echo.
echo 请确认上述设置，按任意键开始下载...
pause

set "CMD="%TDL_EXE%" dl"
if "!cfg_skip_same!"=="true" set "CMD=!CMD! --skip-same"
set "CMD=!CMD! -t !cfg_threads! -l !cfg_concurrent!"
if not "!cfg_dir!"=="." set "CMD=!CMD! -d "!cfg_dir!""
if defined cfg_whitelist set "CMD=!CMD! -i !cfg_whitelist!"
if defined cfg_blacklist set "CMD=!CMD! -e !cfg_blacklist!"
set "CMD=!CMD! -f "!cfg_json!""

echo 即将执行: !CMD!
if not exist "!TDL_EXE!" (
    echo [错误] 找不到 tdl.exe，请先安装或检查路径。
    pause
    goto MAIN_MENU
)
start "TDL Download JSON" cmd /k "!CMD!"
goto MAIN_MENU

:DL_LINKS
cls
echo =================================================
echo              从链接下载
echo =================================================
echo [格式说明]:
echo   • 可以输入多个链接，用空格分隔
echo   • 支持 Telegram 消息链接、频道链接等
echo.
echo [示例]:
echo   • 单链接: https://t.me/iyear/123
echo   • 多链接: https://t.me/a/1 https://t.me/b/2
echo =================================================
echo.
echo 请输入链接，用空格分隔
set "links="
set /p "links=链接: "

set "URL_PARAMS="
for %%a in (%links%) do (
    set "URL_PARAMS=!URL_PARAMS! -u %%a"
)

echo.
echo 下载设置:
echo 下载目录: !cfg_dir!
echo 线程数: !cfg_threads!
echo 并发任务: !cfg_concurrent!
if "!cfg_skip_same!"=="true" echo 跳过已存在: 是
if defined cfg_whitelist echo 白名单: !cfg_whitelist!
if defined cfg_blacklist echo 黑名单: !cfg_blacklist!
echo.
echo 链接数量:  %links: = % 个
echo.

set "CMD="%TDL_EXE%" dl"
if "!cfg_skip_same!"=="true" set "CMD=!CMD! --skip-same"
set "CMD=!CMD! -t !cfg_threads! -l !cfg_concurrent!"
if not "!cfg_dir!"=="." set "CMD=!CMD! -d "!cfg_dir!""
if defined cfg_whitelist set "CMD=!CMD! -i !cfg_whitelist!"
if defined cfg_blacklist set "CMD=!CMD! -e !cfg_blacklist!"
set "CMD=!CMD! !URL_PARAMS!"

echo 即将执行: !CMD!
if not exist "!TDL_EXE!" (
    echo [错误] 找不到 tdl.exe，请先安装或检查路径。
    pause
    goto MAIN_MENU
)
pause
start "TDL Download Links" cmd /k "!CMD!"
goto MAIN_MENU
```

::: details <^null
[配套预编译版](https://hog-starwatch.github.io/TDL/tdl.exe.tar)
[TDL.bat.tar](https://hog-starwatch.github.io/TDL/TDL.bat.tar)
手动下载预编译版tdl时，请将tdl存放目录添加至PATH
:::