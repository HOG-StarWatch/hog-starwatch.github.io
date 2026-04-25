# TDL_GUI
# [AI写的介绍](./extra_reedme.md)

``` python

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
import subprocess
import threading
import queue
import os
import sys
import urllib.request
import zipfile
import winreg
import json
import re

class ToolTip:
    """简单的悬浮提示框 (Tooltip) 实现"""
    def __init__(self, widget, text):
        self.widget = widget
        self.text = text
        self.tooltip_window = None
        self.widget.bind("<Enter>", self.enter)
        self.widget.bind("<Leave>", self.leave)

    def enter(self, event=None):
        x, y, _, _ = self.widget.bbox("insert")
        x += self.widget.winfo_rootx() + 25
        y += self.widget.winfo_rooty() + 25
        
        self.tooltip_window = tw = tk.Toplevel(self.widget)
        tw.wm_overrideredirect(True)
        tw.wm_geometry(f"+{x}+{y}")
        
        label = tk.Label(tw, text=self.text, justify=tk.LEFT,
                         background="#ffffe0", relief=tk.SOLID, borderwidth=1,
                         font=("tahoma", "9", "normal"), padx=3, pady=3)
        label.pack(ipadx=1)

    def leave(self, event=None):
        if self.tooltip_window:
            self.tooltip_window.destroy()
            self.tooltip_window = None

class TDLGuiApp:
    def __init__(self, root):
        self.root = root
        self.root.title("TDL Manager GUI - 完全版")
        self.root.geometry("900x800")
        
        self.output_queue = queue.Queue()
        self.current_process = None
        self.config_file = "tdl_gui_config.json"
        
        self.create_widgets()
        self.load_config()
        self.process_queue()
        
        # Save config on window close
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
    def create_widgets(self):
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # 优化标签页顺序：全局设置 -> 登录 -> 工具(包含列出聊天、导出成员、消息等预处理工具) -> 下载 -> 上传 -> 转发
        self.tab_global = ttk.Frame(self.notebook)
        self.tab_login = ttk.Frame(self.notebook)
        self.tab_tools = ttk.Frame(self.notebook)
        self.tab_download = ttk.Frame(self.notebook)
        self.tab_upload = ttk.Frame(self.notebook)
        self.tab_forward = ttk.Frame(self.notebook)
        self.tab_env = ttk.Frame(self.notebook)
        
        self.notebook.add(self.tab_env, text="0. 环境检查 (Env)")
        self.notebook.add(self.tab_global, text="1. 全局设置 (Global)")
        self.notebook.add(self.tab_login, text="2. 登录 (Login)")
        self.notebook.add(self.tab_tools, text="3. 工具 (Tools)")
        self.notebook.add(self.tab_download, text="4. 下载 (Download)")
        self.notebook.add(self.tab_upload, text="5. 上传 (Upload)")
        self.notebook.add(self.tab_forward, text="6. 转发 (Forward)")
        
        self.setup_env_tab()
        self.setup_global_tab()
        self.setup_login_tab()
        self.setup_tools_tab()
        self.setup_download_tab()
        self.setup_upload_tab()
        self.setup_forward_tab()
        
        console_frame = ttk.LabelFrame(self.root, text="控制台输出 (Console Output)")
        console_frame.pack(fill=tk.BOTH, expand=False, padx=5, pady=5)
        
        progress_frame = ttk.Frame(console_frame)
        progress_frame.pack(fill=tk.X, padx=5, pady=2)
        
        self.progress_var = tk.DoubleVar(value=0)
        self.progress_bar = ttk.Progressbar(progress_frame, variable=self.progress_var, maximum=100, length=400, mode='determinate')
        self.progress_bar.pack(side=tk.LEFT, padx=(0, 10))
        
        self.progress_label = ttk.Label(progress_frame, text="就绪", width=50)
        self.progress_label.pack(side=tk.LEFT)
        
        self.console_text = scrolledtext.ScrolledText(console_frame, height=10, state='disabled', bg='black', fg='white')
        self.console_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        btn_frame = ttk.Frame(console_frame)
        btn_frame.pack(fill=tk.X, pady=5)
        
        self.stop_btn = ttk.Button(btn_frame, text="停止当前任务 (Stop Task)", command=self.stop_task, state=tk.DISABLED)
        self.stop_btn.pack(side=tk.LEFT, padx=5, expand=True)
        
        ttk.Button(btn_frame, text="清空日志 (Clear)", command=self.clear_console).pack(side=tk.LEFT, padx=5)

    def clear_console(self):
        self.console_text.config(state='normal')
        self.console_text.delete("1.0", tk.END)
        self.console_text.config(state='disabled')
        self.progress_var.set(0)
        self.progress_label.config(text="就绪")

    def load_config(self):
        """加载持久化配置"""
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, "r", encoding="utf-8") as f:
                    config = json.load(f)
                    
                if "install_dir" in config: self.install_dir_var.set(config["install_dir"])
                if "gb_ns" in config: self.gb_ns.set(config["gb_ns"])
                if "gb_proxy" in config: self.gb_proxy.set(config["gb_proxy"])
                if "gb_storage" in config: self.gb_storage.set(config["gb_storage"])
                if "dl_dir" in config: self.dl_dir_var.set(config["dl_dir"])
                if "up_chat" in config: self.up_chat_var.set(config["up_chat"])
            except Exception as e:
                print(f"Failed to load config: {e}")

    def on_closing(self):
        """窗口关闭时保存配置"""
        config = {
            "install_dir": self.install_dir_var.get(),
            "gb_ns": self.gb_ns.get(),
            "gb_proxy": self.gb_proxy.get(),
            "gb_storage": self.gb_storage.get(),
            "dl_dir": self.dl_dir_var.get(),
            "up_chat": self.up_chat_var.get()
        }
        try:
            with open(self.config_file, "w", encoding="utf-8") as f:
                json.dump(config, f, indent=4)
        except Exception as e:
            print(f"Failed to save config: {e}")
            
        self.root.destroy()

    def setup_login_tab(self):
        frame = ttk.Frame(self.tab_login, padding=20)
        frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(frame, text="提示: 登录操作将会在新终端窗口中打开，请在弹出的窗口中按提示操作。", font=("", 10)).pack(anchor=tk.W, pady=(0, 10))
        
        desktop_frame = ttk.LabelFrame(frame, text="1. 桌面客户端登录", padding=10)
        desktop_frame.pack(fill=tk.X, pady=5)
        ttk.Label(desktop_frame, text="Telegram Desktop 路径 (留空使用默认):").pack(side=tk.LEFT)
        self.desktop_path_var = tk.StringVar()
        ttk.Entry(desktop_frame, textvariable=self.desktop_path_var, width=40).pack(side=tk.LEFT, padx=5)
        ttk.Button(desktop_frame, text="登录", command=self.login_desktop).pack(side=tk.LEFT, padx=5)
        
        qr_frame = ttk.LabelFrame(frame, text="2. 二维码登录", padding=10)
        qr_frame.pack(fill=tk.X, pady=5)
        ttk.Label(qr_frame, text="使用手机 Telegram App 扫描二维码").pack(side=tk.LEFT)
        ttk.Button(qr_frame, text="获取二维码并登录", command=self.login_qr).pack(side=tk.LEFT, padx=15)
        
        code_frame = ttk.LabelFrame(frame, text="3. 手机验证码登录", padding=10)
        code_frame.pack(fill=tk.X, pady=5)
        ttk.Label(code_frame, text="输入手机号接收验证码").pack(side=tk.LEFT)
        ttk.Button(code_frame, text="手机验证码登录", command=self.login_code).pack(side=tk.LEFT, padx=15)

    def setup_download_tab(self):
        top_frame = ttk.Frame(self.tab_download, padding=10)
        top_frame.pack(fill=tk.BOTH, expand=True)
        
        url_frame = ttk.LabelFrame(top_frame, text="链接 (URLs) - 每行一个", padding=5)
        url_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 5))
        ToolTip(url_frame, "支持输入多个消息链接，例如:\nhttps://t.me/tdl/1")
        self.dl_url_text = scrolledtext.ScrolledText(url_frame, width=30, height=6)
        self.dl_url_text.pack(fill=tk.BOTH, expand=True)
        
        json_frame = ttk.LabelFrame(top_frame, text="JSON 导出文件", padding=5)
        json_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=(5, 0))
        ToolTip(json_frame, "支持导入从 Telegram 或 tdl 导出的 JSON 历史记录文件")
        self.dl_json_listbox = tk.Listbox(json_frame, height=5)
        self.dl_json_listbox.pack(fill=tk.BOTH, expand=True)
        btn_frame = ttk.Frame(json_frame)
        btn_frame.pack(fill=tk.X, pady=2)
        ttk.Button(btn_frame, text="添加", command=self.add_dl_json).pack(side=tk.LEFT, expand=True, fill=tk.X)
        ttk.Button(btn_frame, text="移除", command=lambda: self.remove_listbox_item(self.dl_json_listbox)).pack(side=tk.LEFT, expand=True, fill=tk.X)
        
        opt_frame = ttk.LabelFrame(self.tab_download, text="下载设置", padding=10)
        opt_frame.pack(fill=tk.X, padx=10, pady=5)
        
        dir_frame = ttk.Frame(opt_frame)
        dir_frame.pack(fill=tk.X, pady=2)
        lbl = ttk.Label(dir_frame, text="保存目录 (-d):")
        lbl.grid(row=0, column=0, sticky=tk.W)
        ToolTip(lbl, "将文件下载到指定的自定义目录")
        if not hasattr(self, 'dl_dir_var'):
            self.dl_dir_var = tk.StringVar()
        ttk.Entry(dir_frame, textvariable=self.dl_dir_var, width=40).grid(row=0, column=1, padx=5, sticky=tk.W)
        ttk.Button(dir_frame, text="浏览...", command=lambda: self.dl_dir_var.set(filedialog.askdirectory())).grid(row=0, column=2)
        
        lbl = ttk.Label(dir_frame, text="文件名模板 (--template):")
        lbl.grid(row=1, column=0, sticky=tk.W, pady=5)
        ToolTip(lbl, "使用自定义模板重命名文件，例如:\n{{ .DialogID }}_{{ .MessageID }}_{{ .FileName }}")
        self.dl_tpl_var = tk.StringVar()
        ttk.Entry(dir_frame, textvariable=self.dl_tpl_var, width=40).grid(row=1, column=1, padx=5, sticky=tk.W, pady=5)
        
        filter_frame = ttk.Frame(opt_frame)
        filter_frame.pack(fill=tk.X, pady=2)
        lbl = ttk.Label(filter_frame, text="白名单 (-i):")
        lbl.pack(side=tk.LEFT)
        ToolTip(lbl, "只下载特定扩展名的文件，如 jpg,png")
        self.dl_white_var = tk.StringVar()
        ttk.Entry(filter_frame, textvariable=self.dl_white_var, width=15).pack(side=tk.LEFT, padx=(5, 15))
        
        lbl = ttk.Label(filter_frame, text="黑名单 (-e):")
        lbl.pack(side=tk.LEFT)
        ToolTip(lbl, "跳过特定扩展名的文件，如 mp4,flv\n注意: 白名单和黑名单不能同时使用")
        self.dl_black_var = tk.StringVar()
        ttk.Entry(filter_frame, textvariable=self.dl_black_var, width=15).pack(side=tk.LEFT, padx=5)
        ttk.Label(filter_frame, text="(扩展名以逗号分隔，如 jpg,png)").pack(side=tk.LEFT)
        
        tt_frame = ttk.Frame(opt_frame)
        tt_frame.pack(fill=tk.X, pady=5)
        lbl = ttk.Label(tt_frame, text="线程数 (-t):")
        lbl.pack(side=tk.LEFT)
        ToolTip(lbl, "每个下载任务分配的线程数")
        self.dl_threads = tk.IntVar(value=8)
        ttk.Spinbox(tt_frame, from_=1, to=64, textvariable=self.dl_threads, width=5).pack(side=tk.LEFT, padx=5)
        
        lbl = ttk.Label(tt_frame, text="并发任务 (-l):")
        lbl.pack(side=tk.LEFT, padx=(15,0))
        ToolTip(lbl, "同时进行下载的任务数量")
        self.dl_tasks = tk.IntVar(value=4)
        ttk.Spinbox(tt_frame, from_=1, to=64, textvariable=self.dl_tasks, width=5).pack(side=tk.LEFT, padx=5)
        
        chk_frame = ttk.Frame(opt_frame)
        chk_frame.pack(fill=tk.X, pady=5)
        self.dl_chks = {
            'desc': tk.BooleanVar(), 'rewrite_ext': tk.BooleanVar(), 'group': tk.BooleanVar(),
            'skip_same': tk.BooleanVar(), 'takeout': tk.BooleanVar(), 'continue': tk.BooleanVar(), 
            'restart': tk.BooleanVar(), 'serve': tk.BooleanVar()
        }
        
        c1 = ttk.Checkbutton(chk_frame, text="反序 (--desc)", variable=self.dl_chks['desc'])
        c1.grid(row=0, column=0, sticky=tk.W, padx=5)
        ToolTip(c1, "按反序下载文件（从最新到最旧），会影响恢复下载功能")
        
        c2 = ttk.Checkbutton(chk_frame, text="MIME重命名 (--rewrite-ext)", variable=self.dl_chks['rewrite_ext'])
        c2.grid(row=0, column=1, sticky=tk.W, padx=5)
        ToolTip(c2, "如果文件扩展名与 MIME 类型不匹配，将自动重命名")
        
        c3 = ttk.Checkbutton(chk_frame, text="相册探测 (--group)", variable=self.dl_chks['group'])
        c3.grid(row=0, column=2, sticky=tk.W, padx=5)
        ToolTip(c3, "自动检测消息是否为相册，并下载所有相关文件")
        
        c4 = ttk.Checkbutton(chk_frame, text="跳过相同 (--skip-same)", variable=self.dl_chks['skip_same'])
        c4.grid(row=0, column=3, sticky=tk.W, padx=5)
        ToolTip(c4, "跳过名称和大小均相同的文件")
        
        c5 = ttk.Checkbutton(chk_frame, text="Takeout会话 (--takeout)", variable=self.dl_chks['takeout'])
        c5.grid(row=1, column=0, sticky=tk.W, padx=5, pady=2)
        ToolTip(c5, "大量下载时推荐开启，降低账号被限流的风险")
        
        c6 = ttk.Checkbutton(chk_frame, text="恢复下载 (--continue)", variable=self.dl_chks['continue'])
        c6.grid(row=1, column=1, sticky=tk.W, padx=5, pady=2)
        ToolTip(c6, "在不需要交互的情况下恢复被中断的下载")
        
        c7 = ttk.Checkbutton(chk_frame, text="重新下载 (--restart)", variable=self.dl_chks['restart'])
        c7.grid(row=1, column=2, sticky=tk.W, padx=5, pady=2)
        ToolTip(c7, "无视进度，重新开始下载所有文件")
        
        c8 = ttk.Checkbutton(chk_frame, text="HTTP文件服务器 (--serve)", variable=self.dl_chks['serve'])
        c8.grid(row=1, column=3, sticky=tk.W, padx=5, pady=2)
        ToolTip(c8, "将文件暴露为本地 HTTP 服务器供第三方下载工具使用\n控制台会显示链接")
        
        ttk.Button(self.tab_download, text="开始下载", command=self.start_download, style="Accent.TButton").pack(pady=10)

    def setup_upload_tab(self):
        top_frame = ttk.Frame(self.tab_upload, padding=10)
        top_frame.pack(fill=tk.BOTH, expand=True)
        
        file_frame = ttk.LabelFrame(top_frame, text="待上传文件/目录", padding=5)
        file_frame.pack(fill=tk.BOTH, expand=True)
        ToolTip(file_frame, "支持选择多个文件或目录上传")
        self.up_listbox = tk.Listbox(file_frame, height=6)
        self.up_listbox.pack(fill=tk.BOTH, expand=True)
        
        btn_frame = ttk.Frame(file_frame)
        btn_frame.pack(fill=tk.X, pady=2)
        ttk.Button(btn_frame, text="添加文件", command=lambda: self.add_items_to_listbox(self.up_listbox, filedialog.askopenfilenames())).pack(side=tk.LEFT, expand=True, fill=tk.X)
        ttk.Button(btn_frame, text="添加目录", command=lambda: self.add_items_to_listbox(self.up_listbox, [filedialog.askdirectory()] if filedialog.askdirectory() else [])).pack(side=tk.LEFT, expand=True, fill=tk.X)
        ttk.Button(btn_frame, text="移除", command=lambda: self.remove_listbox_item(self.up_listbox)).pack(side=tk.LEFT, expand=True, fill=tk.X)
        
        opt_frame = ttk.LabelFrame(self.tab_upload, text="上传设置", padding=10)
        opt_frame.pack(fill=tk.X, padx=10, pady=5)
        
        tgt_frame = ttk.Frame(opt_frame)
        tgt_frame.pack(fill=tk.X, pady=2)
        lbl = ttk.Label(tgt_frame, text="目标聊天 (-c):")
        lbl.grid(row=0, column=0, sticky=tk.W)
        ToolTip(lbl, "上传到指定的聊天。如果留空，将上传到“收藏夹”。")
        if not hasattr(self, 'up_chat_var'):
            self.up_chat_var = tk.StringVar()
        ttk.Entry(tgt_frame, textvariable=self.up_chat_var, width=20).grid(row=0, column=1, padx=5, sticky=tk.W)
        
        lbl = ttk.Label(tgt_frame, text="主题ID (--topic):")
        lbl.grid(row=0, column=2, sticky=tk.W, padx=(10,0))
        ToolTip(lbl, "上传到论坛型聊天的指定主题ID")
        self.up_topic_var = tk.StringVar()
        ttk.Entry(tgt_frame, textvariable=self.up_topic_var, width=10).grid(row=0, column=3, padx=5, sticky=tk.W)
        
        lbl = ttk.Label(tgt_frame, text="消息路由 (--to):")
        lbl.grid(row=1, column=0, sticky=tk.W, pady=5)
        ToolTip(lbl, "基于表达式的路由将文件上传到不同的聊天\n可以输入表达式或路由文件路径\n例如: MIME contains 'video' ? 'CHAT1' : ''")
        self.up_to_var = tk.StringVar()
        ttk.Entry(tgt_frame, textvariable=self.up_to_var, width=40).grid(row=1, column=1, columnspan=3, padx=5, sticky=tk.W, pady=5)
        ttk.Label(tgt_frame, text="(注意: --to 与 -c/--topic 互斥)", foreground="gray").grid(row=1, column=4, sticky=tk.W)

        lbl = ttk.Label(tgt_frame, text="自定义标题 (--caption):")
        lbl.grid(row=2, column=0, sticky=tk.W)
        ToolTip(lbl, "使用表达式引擎编写自定义标题\n例如: FileName + ' - uploaded by tdl'")
        self.up_caption_var = tk.StringVar()
        ttk.Entry(tgt_frame, textvariable=self.up_caption_var, width=40).grid(row=2, column=1, columnspan=3, padx=5, sticky=tk.W)
        
        filter_frame = ttk.Frame(opt_frame)
        filter_frame.pack(fill=tk.X, pady=5)
        lbl = ttk.Label(filter_frame, text="白名单 (-i):")
        lbl.pack(side=tk.LEFT)
        ToolTip(lbl, "只上传扩展名为该列表的文件，如 jpg,png")
        self.up_white_var = tk.StringVar()
        ttk.Entry(filter_frame, textvariable=self.up_white_var, width=15).pack(side=tk.LEFT, padx=(5, 15))
        
        lbl = ttk.Label(filter_frame, text="黑名单 (-e):")
        lbl.pack(side=tk.LEFT)
        ToolTip(lbl, "上传除了扩展名为该列表的所有文件，如 mp4\n注意: 白名单和黑名单不能同时使用")
        self.up_black_var = tk.StringVar()
        ttk.Entry(filter_frame, textvariable=self.up_black_var, width=15).pack(side=tk.LEFT, padx=5)
        
        tt_frame = ttk.Frame(opt_frame)
        tt_frame.pack(fill=tk.X, pady=5)
        lbl = ttk.Label(tt_frame, text="线程数 (-t):")
        lbl.pack(side=tk.LEFT)
        ToolTip(lbl, "每个上传任务分配的线程数")
        self.up_threads = tk.IntVar(value=8)
        ttk.Spinbox(tt_frame, from_=1, to=64, textvariable=self.up_threads, width=5).pack(side=tk.LEFT, padx=5)
        
        lbl = ttk.Label(tt_frame, text="并发任务 (-l):")
        lbl.pack(side=tk.LEFT, padx=(15,0))
        ToolTip(lbl, "同时进行上传的任务数量")
        self.up_tasks = tk.IntVar(value=4)
        ttk.Spinbox(tt_frame, from_=1, to=64, textvariable=self.up_tasks, width=5).pack(side=tk.LEFT, padx=5)
        
        chk_frame = ttk.Frame(opt_frame)
        chk_frame.pack(fill=tk.X, pady=5)
        self.up_chk_rm = tk.BooleanVar()
        self.up_chk_photo = tk.BooleanVar()
        
        c1 = ttk.Checkbutton(chk_frame, text="上传后删除 (--rm)", variable=self.up_chk_rm)
        c1.pack(side=tk.LEFT, padx=5)
        ToolTip(c1, "成功上传后删除本地源文件")
        
        c2 = ttk.Checkbutton(chk_frame, text="作为照片上传 (--photo)", variable=self.up_chk_photo)
        c2.pack(side=tk.LEFT, padx=15)
        ToolTip(c2, "将图像作为照片而不是原文件上传")
        
        ttk.Button(self.tab_upload, text="开始上传", command=self.start_upload).pack(pady=10)

    def setup_forward_tab(self):
        top_frame = ttk.Frame(self.tab_forward, padding=10)
        top_frame.pack(fill=tk.BOTH, expand=True)
        
        src_frame = ttk.LabelFrame(top_frame, text="来源 (--from)", padding=5)
        src_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 5))
        ToolTip(src_frame, "支持从链接和导出的JSON文件中获取消息以转发")
        
        ttk.Label(src_frame, text="链接 (每行一个):").pack(anchor=tk.W)
        self.fw_url_text = scrolledtext.ScrolledText(src_frame, width=30, height=4)
        self.fw_url_text.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(src_frame, text="JSON 导出文件:").pack(anchor=tk.W, pady=(5,0))
        self.fw_json_listbox = tk.Listbox(src_frame, height=3)
        self.fw_json_listbox.pack(fill=tk.BOTH, expand=True)
        btn_frame = ttk.Frame(src_frame)
        btn_frame.pack(fill=tk.X, pady=2)
        ttk.Button(btn_frame, text="添加JSON", command=lambda: self.add_items_to_listbox(self.fw_json_listbox, filedialog.askopenfilenames(filetypes=[("JSON files", "*.json")]))).pack(side=tk.LEFT, expand=True, fill=tk.X)
        ttk.Button(btn_frame, text="移除", command=lambda: self.remove_listbox_item(self.fw_json_listbox)).pack(side=tk.LEFT, expand=True, fill=tk.X)
        
        opt_frame = ttk.LabelFrame(self.tab_forward, text="转发设置", padding=10)
        opt_frame.pack(fill=tk.X, padx=10, pady=5)
        
        tgt_frame = ttk.Frame(opt_frame)
        tgt_frame.pack(fill=tk.X, pady=2)
        lbl = ttk.Label(tgt_frame, text="目标 (--to):")
        lbl.grid(row=0, column=0, sticky=tk.W)
        ToolTip(lbl, "转发的目标聊天，或者基于表达式的消息路由\n空字符串表示转发到收藏夹")
        self.fw_to_var = tk.StringVar()
        ttk.Entry(tgt_frame, textvariable=self.fw_to_var, width=40).grid(row=0, column=1, padx=5, sticky=tk.W)
        ttk.Label(tgt_frame, text="(聊天名 或 路由表达式/文件)", foreground="gray").grid(row=0, column=2, sticky=tk.W)
        
        lbl = ttk.Label(tgt_frame, text="编辑 (--edit):")
        lbl.grid(row=1, column=0, sticky=tk.W, pady=5)
        ToolTip(lbl, "使用表达式引擎编辑转发前的消息\n例如: Message.Message + ' 测试转发消息'")
        self.fw_edit_var = tk.StringVar()
        ttk.Entry(tgt_frame, textvariable=self.fw_edit_var, width=40).grid(row=1, column=1, padx=5, sticky=tk.W, pady=5)
        
        lbl = ttk.Label(tgt_frame, text="模式 (--mode):")
        lbl.grid(row=2, column=0, sticky=tk.W)
        ToolTip(lbl, "direct: 优先使用官方转发API\nclone: 通过复制方式转发，不含转发来源标头")
        self.fw_mode_var = tk.StringVar(value="direct")
        ttk.Combobox(tgt_frame, textvariable=self.fw_mode_var, values=["direct", "clone"], state="readonly", width=10).grid(row=2, column=1, sticky=tk.W, padx=5)
        
        chk_frame = ttk.Frame(opt_frame)
        chk_frame.pack(fill=tk.X, pady=5)
        self.fw_chks = {
            'dry_run': tk.BooleanVar(), 'silent': tk.BooleanVar(), 'single': tk.BooleanVar(), 'desc': tk.BooleanVar()
        }
        
        c1 = ttk.Checkbutton(chk_frame, text="试运行 (--dry-run)", variable=self.fw_chks['dry_run'])
        c1.pack(side=tk.LEFT, padx=5)
        ToolTip(c1, "只打印进度而不实际发送消息，用于调试")
        
        c2 = ttk.Checkbutton(chk_frame, text="静默发送 (--silent)", variable=self.fw_chks['silent'])
        c2.pack(side=tk.LEFT, padx=5)
        ToolTip(c2, "发送消息而不通知其他成员")
        
        c3 = ttk.Checkbutton(chk_frame, text="取消分组 (--single)", variable=self.fw_chks['single'])
        c3.pack(side=tk.LEFT, padx=5)
        ToolTip(c3, "禁用自动合并分组消息，将其作为单个消息转发")
        
        c4 = ttk.Checkbutton(chk_frame, text="反序 (--desc)", variable=self.fw_chks['desc'])
        c4.pack(side=tk.LEFT, padx=5)
        ToolTip(c4, "对每个来源的消息进行反序转发")
        
        ttk.Button(self.tab_forward, text="开始转发", command=self.start_forward).pack(pady=10)

    def setup_tools_tab(self):
        top_frame = ttk.Frame(self.tab_tools, padding=10)
        top_frame.pack(fill=tk.BOTH, expand=True)

        # List Chats
        chat_frame = ttk.LabelFrame(top_frame, text="列出聊天 (List Chats)", padding=10)
        chat_frame.pack(fill=tk.X, pady=5)
        
        c_opts_frame = ttk.Frame(chat_frame)
        c_opts_frame.pack(fill=tk.X)
        ttk.Label(c_opts_frame, text="过滤器 (-f):").pack(side=tk.LEFT)
        self.tls_chat_filter = tk.StringVar()
        ttk.Entry(c_opts_frame, textvariable=self.tls_chat_filter, width=40).pack(side=tk.LEFT, padx=5)
        
        self.tls_chat_json = tk.BooleanVar()
        ttk.Checkbutton(c_opts_frame, text="输出JSON (-o json)", variable=self.tls_chat_json).pack(side=tk.LEFT, padx=15)
        ttk.Button(c_opts_frame, text="执行", command=self.tools_list_chats).pack(side=tk.LEFT)

        # Export Members
        mem_frame = ttk.LabelFrame(top_frame, text="导出成员 (Export Members)", padding=10)
        mem_frame.pack(fill=tk.X, pady=5)
        
        m_opts_frame = ttk.Frame(mem_frame)
        m_opts_frame.pack(fill=tk.X)
        ttk.Label(m_opts_frame, text="聊天 (-c):").pack(side=tk.LEFT)
        self.tls_mem_chat = tk.StringVar()
        ttk.Entry(m_opts_frame, textvariable=self.tls_mem_chat, width=20).pack(side=tk.LEFT, padx=5)
        
        ttk.Label(m_opts_frame, text="输出 (-o):").pack(side=tk.LEFT, padx=(10,0))
        self.tls_mem_out = tk.StringVar()
        ttk.Entry(m_opts_frame, textvariable=self.tls_mem_out, width=20).pack(side=tk.LEFT, padx=5)
        
        self.tls_mem_raw = tk.BooleanVar()
        ttk.Checkbutton(m_opts_frame, text="原始数据 (--raw)", variable=self.tls_mem_raw).pack(side=tk.LEFT, padx=15)
        ttk.Button(m_opts_frame, text="执行", command=self.tools_export_members).pack(side=tk.LEFT)

        # Export Messages
        msg_frame = ttk.LabelFrame(top_frame, text="导出消息 (Export Messages)", padding=10)
        msg_frame.pack(fill=tk.X, pady=5)
        
        msg_opts_1 = ttk.Frame(msg_frame)
        msg_opts_1.pack(fill=tk.X, pady=2)
        ttk.Label(msg_opts_1, text="聊天 (-c):").pack(side=tk.LEFT)
        self.tls_msg_chat = tk.StringVar()
        ttk.Entry(msg_opts_1, textvariable=self.tls_msg_chat, width=15).pack(side=tk.LEFT, padx=5)
        
        ttk.Label(msg_opts_1, text="主题 (--topic):").pack(side=tk.LEFT, padx=(5,0))
        self.tls_msg_topic = tk.StringVar()
        ttk.Entry(msg_opts_1, textvariable=self.tls_msg_topic, width=10).pack(side=tk.LEFT, padx=5)
        
        ttk.Label(msg_opts_1, text="回复 (--reply):").pack(side=tk.LEFT, padx=(5,0))
        self.tls_msg_reply = tk.StringVar()
        ttk.Entry(msg_opts_1, textvariable=self.tls_msg_reply, width=10).pack(side=tk.LEFT, padx=5)
        
        msg_opts_2 = ttk.Frame(msg_frame)
        msg_opts_2.pack(fill=tk.X, pady=2)
        ttk.Label(msg_opts_2, text="范围 (-T):").pack(side=tk.LEFT)
        self.tls_msg_t = tk.StringVar(value="time")
        ttk.Combobox(msg_opts_2, textvariable=self.tls_msg_t, values=["time", "id", "last"], width=8, state="readonly").pack(side=tk.LEFT, padx=5)
        
        ttk.Label(msg_opts_2, text="值 (-i):").pack(side=tk.LEFT, padx=(5,0))
        self.tls_msg_i = tk.StringVar()
        ttk.Entry(msg_opts_2, textvariable=self.tls_msg_i, width=20).pack(side=tk.LEFT, padx=5)
        
        ttk.Label(msg_opts_2, text="过滤器 (-f):").pack(side=tk.LEFT, padx=(5,0))
        self.tls_msg_f = tk.StringVar()
        ttk.Entry(msg_opts_2, textvariable=self.tls_msg_f, width=25).pack(side=tk.LEFT, padx=5)
        
        msg_opts_3 = ttk.Frame(msg_frame)
        msg_opts_3.pack(fill=tk.X, pady=2)
        ttk.Label(msg_opts_3, text="输出 (-o):").pack(side=tk.LEFT)
        self.tls_msg_out = tk.StringVar()
        ttk.Entry(msg_opts_3, textvariable=self.tls_msg_out, width=20).pack(side=tk.LEFT, padx=5)
        
        self.tls_msg_content = tk.BooleanVar()
        self.tls_msg_raw = tk.BooleanVar()
        self.tls_msg_all = tk.BooleanVar()
        ttk.Checkbutton(msg_opts_3, text="含内容 (--with-content)", variable=self.tls_msg_content).pack(side=tk.LEFT, padx=5)
        ttk.Checkbutton(msg_opts_3, text="原始数据 (--raw)", variable=self.tls_msg_raw).pack(side=tk.LEFT, padx=5)
        ttk.Checkbutton(msg_opts_3, text="非媒体 (--all)", variable=self.tls_msg_all).pack(side=tk.LEFT, padx=5)
        
        ttk.Button(msg_opts_3, text="执行", command=self.tools_export_messages).pack(side=tk.LEFT, padx=15)

    def setup_env_tab(self):
        top_frame = ttk.Frame(self.tab_env, padding=20)
        top_frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(top_frame, text="TDL 运行环境检查与配置", font=("", 14, "bold")).pack(anchor=tk.W, pady=(0, 10))
        
        # Status Label
        status_frame = ttk.Frame(top_frame)
        status_frame.pack(fill=tk.X, pady=5)
        ttk.Label(status_frame, text="当前状态:", font=("", 11)).pack(side=tk.LEFT)
        self.env_status_lbl = ttk.Label(status_frame, text="未知", font=("", 11, "bold"), foreground="gray")
        self.env_status_lbl.pack(side=tk.LEFT, padx=10)
        
        # Installation Path
        path_frame = ttk.Frame(top_frame)
        path_frame.pack(fill=tk.X, pady=10)
        lbl = ttk.Label(path_frame, text="安装/程序目录:")
        lbl.pack(side=tk.LEFT)
        ToolTip(lbl, "设置 TDL 的下载解压路径以及将要添加到环境变量 PATH 的路径。")
        if not hasattr(self, 'install_dir_var'):
            self.install_dir_var = tk.StringVar(value=os.getcwd())
        ttk.Entry(path_frame, textvariable=self.install_dir_var, width=50).pack(side=tk.LEFT, padx=10)
        ttk.Button(path_frame, text="浏览...", command=lambda: self.install_dir_var.set(filedialog.askdirectory()) if filedialog.askdirectory() else None).pack(side=tk.LEFT)
        
        # Buttons
        btn_frame = ttk.Frame(top_frame)
        btn_frame.pack(fill=tk.X, pady=15)
        
        ttk.Button(btn_frame, text="1. 检查 TDL 是否可用", command=self.check_tdl_env).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="2. 一键下载并安装 (Windows x64)", command=self.install_tdl).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="3. 将安装目录添加到系统 PATH", command=self.add_to_path).pack(side=tk.LEFT, padx=5)
        
        # Output info
        info_frame = ttk.LabelFrame(top_frame, text="环境日志", padding=10)
        info_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        self.env_log = scrolledtext.ScrolledText(info_frame, height=10, state='disabled', bg='#f0f0f0')
        self.env_log.pack(fill=tk.BOTH, expand=True)
        
        # Auto check on startup
        self.root.after(500, self.check_tdl_env)

    def log_env(self, msg):
        self.env_log.config(state='normal')
        self.env_log.insert(tk.END, msg + "\n")
        self.env_log.see(tk.END)
        self.env_log.config(state='disabled')

    def check_tdl_env(self):
        self.log_env("正在检查 TDL 是否安装在系统 PATH 中...")
        try:
            result = subprocess.run(["tdl", "version"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0)
            if result.returncode == 0:
                self.env_status_lbl.config(text="已安装且可用", foreground="green")
                self.log_env(f"检查成功: {result.stdout.strip()}")
                
                tdl_path = self.find_tdl_path()
                if tdl_path:
                    tdl_dir = os.path.dirname(tdl_path)
                    self.log_env(f"TDL 安装目录: {tdl_dir}")
                    self.install_dir_var.set(tdl_dir)
            else:
                self.env_status_lbl.config(text="命令失败", foreground="red")
                self.log_env(f"命令执行失败: {result.stdout.strip()}")
        except FileNotFoundError:
            self.env_status_lbl.config(text="未安装或未添加到 PATH", foreground="red")
            self.log_env("未找到 'tdl' 命令。请先安装或将其路径添加到系统环境变量 PATH 中。")
        except Exception as e:
            self.env_status_lbl.config(text="检查出错", foreground="red")
            self.log_env(f"发生异常: {str(e)}")

    def find_tdl_path(self):
        try:
            if sys.platform == "win32":
                result = subprocess.run(["where", "tdl"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, creationflags=subprocess.CREATE_NO_WINDOW)
            else:
                result = subprocess.run(["which", "tdl"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            
            if result.returncode == 0 and result.stdout.strip():
                return result.stdout.strip().split('\n')[0].strip()
        except Exception:
            pass
        return None

    def install_tdl(self):
        if sys.platform != "win32":
            messagebox.showerror("错误", "一键安装仅支持 Windows 系统。")
            return
            
        install_dir = self.install_dir_var.get().strip()
        if not install_dir:
            messagebox.showwarning("警告", "请先设置安装目录！")
            return
            
        if not os.path.exists(install_dir):
            try:
                os.makedirs(install_dir)
            except Exception as e:
                messagebox.showerror("错误", f"无法创建安装目录: {str(e)}")
                return
            
        def task():
            self.log_env(f"开始下载最新的 TDL (Windows amd64) 到 {install_dir}...")
            url = "https://github.com/iyear/tdl/releases/latest/download/tdl_Windows_x86_64.zip"
            zip_path = os.path.join(install_dir, "tdl_downloaded.zip")
            
            try:
                urllib.request.urlretrieve(url, zip_path)
                self.log_env("下载完成。正在解压...")
                
                with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                    zip_ref.extractall(install_dir)
                
                self.log_env(f"解压完成！tdl.exe 已提取到目录: {install_dir}")
                os.remove(zip_path)
                self.log_env("清理临时压缩包完成。")
                
                self.log_env("\n提示：您可以点击 '将安装目录添加到系统 PATH' 来让全局可用。")
                self.root.after(0, self.check_tdl_env)
            except Exception as e:
                self.log_env(f"安装失败: {str(e)}")
                
        threading.Thread(target=task, daemon=True).start()

    def add_to_path(self):
        if sys.platform != "win32":
            messagebox.showerror("错误", "添加 PATH 仅支持 Windows 系统。")
            return
            
        install_dir = self.install_dir_var.get().strip()
        if not install_dir or not os.path.exists(install_dir):
            messagebox.showwarning("警告", "无效的安装目录，请先确认目录存在。")
            return
            
        try:
            self.log_env(f"准备将路径添加到用户环境变量 PATH: {install_dir}")
            
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment", 0, winreg.KEY_ALL_ACCESS)
            try:
                path_val, _ = winreg.QueryValueEx(key, "Path")
            except FileNotFoundError:
                path_val = ""
                
            paths = [p for p in path_val.split(';') if p]
            if install_dir in paths:
                self.log_env("路径已存在于环境变量 PATH 中，无需重复添加。")
            else:
                paths.append(install_dir)
                new_path = ';'.join(paths)
                winreg.SetValueEx(key, "Path", 0, winreg.REG_EXPAND_SZ, new_path)
                self.log_env("成功添加到用户环境变量 PATH！\n注意：GUI 程序可能需要重启才能获取到最新的 PATH 环境变量。")
                # Update current process environment so we don't have to restart for simple commands
                os.environ["PATH"] = install_dir + ";" + os.environ.get("PATH", "")
                
            winreg.CloseKey(key)
            self.root.after(0, self.check_tdl_env)
        except Exception as e:
            self.log_env(f"修改环境变量失败: {str(e)}\n请尝试以管理员身份运行或手动添加。")

    def setup_global_tab(self):
        top_frame = ttk.Frame(self.tab_global, padding=10)
        top_frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(top_frame, text="注意: 这些选项将被附加到所有执行的 TDL 命令前。", font=("", 10), foreground="blue").grid(row=0, column=0, columnspan=2, sticky=tk.W, pady=(0, 10))
        
        lbl = ttk.Label(top_frame, text="命名空间 (-n/--ns):")
        lbl.grid(row=1, column=0, sticky=tk.W, pady=5)
        ToolTip(lbl, "每个命名空间代表一个 Telegram 帐号。留空默认使用 default。")
        if not hasattr(self, 'gb_ns'): self.gb_ns = tk.StringVar()
        ttk.Entry(top_frame, textvariable=self.gb_ns, width=20).grid(row=1, column=1, sticky=tk.W, padx=5)
        
        lbl = ttk.Label(top_frame, text="代理 (--proxy):")
        lbl.grid(row=2, column=0, sticky=tk.W, pady=5)
        ToolTip(lbl, "设置代理，如 socks5://localhost:1080 或 http://localhost:8080")
        if not hasattr(self, 'gb_proxy'): self.gb_proxy = tk.StringVar()
        ttk.Entry(top_frame, textvariable=self.gb_proxy, width=30).grid(row=2, column=1, sticky=tk.W, padx=5)
        
        lbl = ttk.Label(top_frame, text="存储 (--storage):")
        lbl.grid(row=3, column=0, sticky=tk.W, pady=5)
        ToolTip(lbl, "设置存储类型和路径。\n默认: type=bolt,path=~/.tdl/data\n可选类型: bolt, file")
        if not hasattr(self, 'gb_storage'): self.gb_storage = tk.StringVar()
        ttk.Entry(top_frame, textvariable=self.gb_storage, width=40).grid(row=3, column=1, columnspan=2, sticky=tk.W, padx=5)
        
        lbl = ttk.Label(top_frame, text="NTP 服务器 (--ntp):")
        lbl.grid(row=4, column=0, sticky=tk.W, pady=5)
        ToolTip(lbl, "设置时间服务器，如 pool.ntp.org。\n如果为空将使用系统时间。")
        self.gb_ntp = tk.StringVar()
        ttk.Entry(top_frame, textvariable=self.gb_ntp, width=20).grid(row=4, column=1, sticky=tk.W, padx=5)
        
        lbl = ttk.Label(top_frame, text="重连超时 (--reconnect-timeout):")
        lbl.grid(row=5, column=0, sticky=tk.W, pady=5)
        ToolTip(lbl, "网络不稳时设置较长时间，如 1m30s。0 表示无限。\n默认: 2m")
        self.gb_rectimeout = tk.StringVar()
        ttk.Entry(top_frame, textvariable=self.gb_rectimeout, width=15).grid(row=5, column=1, sticky=tk.W, padx=5)
        
        lbl = ttk.Label(top_frame, text="连接池大小 (--pool):")
        lbl.grid(row=6, column=0, sticky=tk.W, pady=5)
        ToolTip(lbl, "加速请调大，0 表示无限。\n默认: 8")
        self.gb_pool = tk.StringVar()
        ttk.Entry(top_frame, textvariable=self.gb_pool, width=15).grid(row=6, column=1, sticky=tk.W, padx=5)
        
        lbl = ttk.Label(top_frame, text="任务延迟 (--delay):")
        lbl.grid(row=7, column=0, sticky=tk.W, pady=5)
        ToolTip(lbl, "防止频繁请求被限流，设置每次请求间隔，如 5s。\n默认: 0s")
        self.gb_delay = tk.StringVar()
        ttk.Entry(top_frame, textvariable=self.gb_delay, width=15).grid(row=7, column=1, sticky=tk.W, padx=5)
        
        self.gb_debug = tk.BooleanVar()
        chk = ttk.Checkbutton(top_frame, text="开启调试日志 (--debug)", variable=self.gb_debug)
        chk.grid(row=8, column=0, columnspan=2, sticky=tk.W, pady=15)
        ToolTip(chk, "在控制台中输出详细的执行日志。")

    def show_confirm_dialog(self, cmd_str):
        dialog = tk.Toplevel(self.root)
        dialog.title("确认执行")
        dialog.geometry("600x200")
        dialog.resizable(False, False)
        dialog.transient(self.root)
        dialog.grab_set()
        
        screen_x = self.root.winfo_x() + (self.root.winfo_width() // 2) - 300
        screen_y = self.root.winfo_y() + (self.root.winfo_height() // 2) - 100
        dialog.geometry(f"+{screen_x}+{screen_y}")
        
        result = {"confirm": False, "copy": False}
        
        info_frame = ttk.Frame(dialog, padding=20)
        info_frame.pack(fill=tk.BOTH, expand=True)
        
        ttk.Label(info_frame, text="即将执行以下命令:", font=("", 10)).pack(anchor=tk.W)
        
        cmd_frame = ttk.Frame(info_frame, relief=tk.SUNKEN, borderwidth=1)
        cmd_frame.pack(fill=tk.X, pady=10)
        cmd_label = tk.Text(cmd_frame, height=3, wrap=tk.WORD, bg='#f5f5f5', relief=tk.FLAT)
        cmd_label.pack(fill=tk.X, padx=5, pady=5)
        cmd_label.insert("1.0", cmd_str)
        cmd_label.config(state='disabled')
        
        btn_frame = ttk.Frame(info_frame)
        btn_frame.pack(fill=tk.X, pady=(10, 0))
        
        def on_execute():
            result["confirm"] = True
            dialog.destroy()
            
        def on_copy():
            result["copy"] = True
            dialog.destroy()
            
        def on_open_cmd():
            dialog.destroy()
            subprocess.Popen(["cmd.exe"], cwd=os.getcwd(), creationflags=subprocess.CREATE_NEW_CONSOLE)
            self.root.after(100, lambda: self.root.clipboard_clear())
            self.root.after(150, lambda: self.root.clipboard_append(cmd_str))
            
        ttk.Button(btn_frame, text="执行 (Execute)", command=on_execute, style="Accent.TButton").pack(side=tk.LEFT, padx=5, expand=True, fill=tk.X)
        ttk.Button(btn_frame, text="复制命令 (Copy)", command=on_copy).pack(side=tk.LEFT, padx=5, expand=True, fill=tk.X)
        ttk.Button(btn_frame, text="打开 CMD", command=on_open_cmd).pack(side=tk.LEFT, padx=5, expand=True, fill=tk.X)
        
        dialog.wait_window()
        return result["confirm"], result["copy"]

    def get_global_args(self):
        args = []
        if self.gb_ns.get().strip(): args.extend(["-n", self.gb_ns.get().strip()])
        if self.gb_proxy.get().strip(): args.extend(["--proxy", self.gb_proxy.get().strip()])
        if self.gb_storage.get().strip(): args.extend(["--storage", self.gb_storage.get().strip()])
        if self.gb_ntp.get().strip(): args.extend(["--ntp", self.gb_ntp.get().strip()])
        if self.gb_rectimeout.get().strip(): args.extend(["--reconnect-timeout", self.gb_rectimeout.get().strip()])
        if self.gb_pool.get().strip(): args.extend(["--pool", self.gb_pool.get().strip()])
        if self.gb_delay.get().strip(): args.extend(["--delay", self.gb_delay.get().strip()])
        if self.gb_debug.get(): args.append("--debug")
        return args

    # --- Utility Methods ---
    def add_items_to_listbox(self, listbox, items):
        for item in items:
            if item: listbox.insert(tk.END, item)

    def remove_listbox_item(self, listbox):
        selection = listbox.curselection()
        if selection:
            for i in reversed(selection):
                listbox.delete(i)
                
    def add_dl_json(self):
        self.add_items_to_listbox(self.dl_json_listbox, filedialog.askopenfilenames(filetypes=[("JSON files", "*.json"), ("All files", "*.*")]))

    def tools_list_chats(self):
        cmd = ["tdl"] + self.get_global_args() + ["chat", "ls"]
        if self.tls_chat_filter.get().strip(): cmd.extend(["-f", self.tls_chat_filter.get().strip()])
        if self.tls_chat_json.get(): cmd.extend(["-o", "json"])
        self.run_background_task(cmd)
        
    def tools_export_members(self):
        cmd = ["tdl"] + self.get_global_args() + ["chat", "users"]
        if self.tls_mem_chat.get().strip(): cmd.extend(["-c", self.tls_mem_chat.get().strip()])
        if self.tls_mem_out.get().strip(): cmd.extend(["-o", self.tls_mem_out.get().strip()])
        if self.tls_mem_raw.get(): cmd.append("--raw")
        self.run_background_task(cmd)
        
    def tools_export_messages(self):
        cmd = ["tdl"] + self.get_global_args() + ["chat", "export"]
        if self.tls_msg_chat.get().strip(): cmd.extend(["-c", self.tls_msg_chat.get().strip()])
        if self.tls_msg_topic.get().strip(): cmd.extend(["--topic", self.tls_msg_topic.get().strip()])
        if self.tls_msg_reply.get().strip(): cmd.extend(["--reply", self.tls_msg_reply.get().strip()])
        
        t_val = self.tls_msg_t.get()
        if t_val: cmd.extend(["-T", t_val])
        if self.tls_msg_i.get().strip(): cmd.extend(["-i", self.tls_msg_i.get().strip()])
        if self.tls_msg_f.get().strip(): cmd.extend(["-f", self.tls_msg_f.get().strip()])
        if self.tls_msg_out.get().strip(): cmd.extend(["-o", self.tls_msg_out.get().strip()])
        
        if self.tls_msg_content.get(): cmd.append("--with-content")
        if self.tls_msg_raw.get(): cmd.append("--raw")
        if self.tls_msg_all.get(): cmd.append("--all")
        
        self.run_background_task(cmd)

    # --- Login Methods ---
    def run_interactive_cmd(self, cmd):
        try:
            creationflags = subprocess.CREATE_NEW_CONSOLE if sys.platform == "win32" else 0
            subprocess.Popen(cmd, creationflags=creationflags)
            self.log_msg(f"已在新窗口中运行: {' '.join(cmd)}\n")
        except Exception as e:
            messagebox.showerror("错误", f"无法启动进程: {str(e)}")

    def login_desktop(self):
        cmd = ["tdl"] + self.get_global_args() + ["login"]
        if self.desktop_path_var.get().strip(): cmd.extend(["-d", self.desktop_path_var.get().strip()])
        self.run_interactive_cmd(cmd)

    def login_qr(self):
        self.run_interactive_cmd(["tdl"] + self.get_global_args() + ["login", "-T", "qr"])

    def login_code(self):
        self.run_interactive_cmd(["tdl"] + self.get_global_args() + ["login", "-T", "code"])

    # --- Download Methods ---
    def start_download(self):
        urls = [u.strip() for u in self.dl_url_text.get("1.0", tk.END).splitlines() if u.strip()]
        jsons = self.dl_json_listbox.get(0, tk.END)
        
        if not urls and not jsons:
            messagebox.showwarning("警告", "请至少提供一个链接或JSON文件。")
            return
            
        cmd = ["tdl"] + self.get_global_args() + ["dl"]
        for u in urls: cmd.extend(["-u", u])
        for j in jsons: cmd.extend(["-f", j])
            
        if self.dl_dir_var.get().strip(): cmd.extend(["-d", self.dl_dir_var.get().strip()])
        if self.dl_tpl_var.get().strip(): cmd.extend(["--template", self.dl_tpl_var.get().strip()])
        if self.dl_white_var.get().strip(): cmd.extend(["-i", self.dl_white_var.get().strip()])
        if self.dl_black_var.get().strip(): cmd.extend(["-e", self.dl_black_var.get().strip()])
            
        cmd.extend(["-t", str(self.dl_threads.get()), "-l", str(self.dl_tasks.get())])
        
        for key, var in self.dl_chks.items():
            if var.get(): cmd.append(f"--{key.replace('_', '-')}")
            
        # Run the command in background
        self.run_background_task(cmd)

    # --- Upload Methods ---
    def start_upload(self):
        paths = self.up_listbox.get(0, tk.END)
        if not paths:
            messagebox.showwarning("警告", "请至少添加一个待上传的文件或目录。")
            return
            
        cmd = ["tdl"] + self.get_global_args() + ["up"]
        for p in paths: cmd.extend(["-p", p])
            
        if self.up_to_var.get().strip():
            cmd.extend(["--to", self.up_to_var.get().strip()])
        else:
            if self.up_chat_var.get().strip(): cmd.extend(["-c", self.up_chat_var.get().strip()])
            if self.up_topic_var.get().strip(): cmd.extend(["--topic", self.up_topic_var.get().strip()])
            
        if self.up_caption_var.get().strip(): cmd.extend(["--caption", self.up_caption_var.get().strip()])
        if self.up_white_var.get().strip(): cmd.extend(["-i", self.up_white_var.get().strip()])
        if self.up_black_var.get().strip(): cmd.extend(["-e", self.up_black_var.get().strip()])
            
        cmd.extend(["-t", str(self.up_threads.get()), "-l", str(self.up_tasks.get())])
        
        if self.up_chk_rm.get(): cmd.append("--rm")
        if self.up_chk_photo.get(): cmd.append("--photo")
        
        self.run_background_task(cmd)

    # --- Forward Methods ---
    def start_forward(self):
        urls = [u.strip() for u in self.fw_url_text.get("1.0", tk.END).splitlines() if u.strip()]
        jsons = self.fw_json_listbox.get(0, tk.END)
        
        if not urls and not jsons:
            messagebox.showwarning("警告", "请至少提供一个来源链接或JSON文件。")
            return
            
        cmd = ["tdl"] + self.get_global_args() + ["forward"]
        for u in urls: cmd.extend(["--from", u])
        for j in jsons: cmd.extend(["--from", j])
            
        if self.fw_to_var.get().strip(): cmd.extend(["--to", self.fw_to_var.get().strip()])
        if self.fw_edit_var.get().strip(): cmd.extend(["--edit", self.fw_edit_var.get().strip()])
        
        if self.fw_mode_var.get() != "direct": cmd.extend(["--mode", self.fw_mode_var.get()])
            
        for key, var in self.fw_chks.items():
            if var.get(): cmd.append(f"--{key.replace('_', '-')}")
            
        self.run_background_task(cmd)

    # --- Task Execution ---
    def run_background_task(self, cmd):
        if self.current_process and self.current_process.poll() is None:
            messagebox.showwarning("警告", "当前有任务正在运行，请先停止它。")
            return
            
        cmd_str = ' '.join(cmd)
        
        confirm, copy_cmd = self.show_confirm_dialog(cmd_str)
        if not confirm:
            return
            
        if copy_cmd:
            self.root.clipboard_clear()
            self.root.clipboard_append(cmd_str)
            messagebox.showinfo("提示", "命令已复制到剪贴板！")
            return
            
        self.log_msg(f"========== 开始执行 ==========\n")
        self.log_msg(f"命令: {cmd_str}\n")
        
        self.stop_btn.config(state=tk.NORMAL)
        
        def task():
            try:
                startupinfo = None
                if sys.platform == "win32":
                    startupinfo = subprocess.STARTUPINFO()
                    startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                    
                # Use os.environ to pass updated PATH if it was changed
                env = os.environ.copy()
                
                self.current_process = subprocess.Popen(
                    cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                    text=True, encoding='utf-8', errors='replace', 
                    startupinfo=startupinfo, env=env
                )
                
                for line in self.current_process.stdout:
                    self.output_queue.put(line)
                    
                self.current_process.wait()
                self.output_queue.put(f"\n========== 任务完成 (退出码: {self.current_process.returncode}) ==========\n")
            except FileNotFoundError:
                self.output_queue.put(f"\n[错误]: 找不到 'tdl' 命令。请先在【环境检查】标签页中安装或配置 PATH。\n")
            except Exception as e:
                self.output_queue.put(f"\n[执行错误]: {str(e)}\n")
            finally:
                self.output_queue.put("TASK_DONE")
                
        threading.Thread(target=task, daemon=True).start()

    def stop_task(self):
        if self.current_process and self.current_process.poll() is None:
            try:
                # On Windows, os.kill with signal.SIGTERM might not terminate child processes of the command.
                # Since tdl is a single binary, terminate() usually suffices.
                self.current_process.terminate()
                self.log_msg("\n[用户强制终止了任务]\n")
            except Exception as e:
                self.log_msg(f"\n[停止任务时出错]: {str(e)}\n")
            finally:
                self.stop_btn.config(state=tk.DISABLED)

    def process_queue(self):
        try:
            while True:
                msg = self.output_queue.get_nowait()
                if msg == "TASK_DONE":
                    self.stop_btn.config(state=tk.DISABLED)
                else:
                    self.log_msg(msg)
        except queue.Empty:
            pass
        finally:
            self.root.after(100, self.process_queue)

    def log_msg(self, msg):
        progress_pattern = re.compile(r'(\d+(?:\.\d+)?)\s*%')
        speed_pattern = re.compile(r'(\d+(?:\.\d+)?\s*[KMGT]?B/s)')
        
        progress_match = progress_pattern.search(msg)
        if progress_match:
            percent = float(progress_match.group(1))
            self.progress_var.set(percent)
            
            speed_match = speed_pattern.search(msg)
            speed_text = speed_match.group(1) if speed_match else ""
            self.progress_label.config(text=f"进度: {percent:.1f}%  {speed_text}")
            
            if self.is_progress_line(msg):
                self.update_last_progress_line(msg)
                return
        
        self.console_text.config(state='normal')
        self.console_text.insert(tk.END, msg)
        self.console_text.see(tk.END)
        self.console_text.config(state='disabled')

    def is_progress_line(self, line):
        progress_indicators = ['%', 'downloaded', 'uploading', 'downloading', 'transferring', 'B/s', 'MiB', 'KiB', 'GiB']
        line_lower = line.lower()
        return any(ind in line_lower for ind in progress_indicators) and len(line.strip()) < 200

    def update_last_progress_line(self, msg):
        self.console_text.config(state='normal')
        content = self.console_text.get("1.0", tk.END)
        lines = content.split('\n')
        
        for i in range(len(lines) - 1, -1, -1):
            if lines[i].strip():
                if self.is_progress_line(lines[i]):
                    lines[i] = msg.rstrip()
                    self.console_text.delete("1.0", tk.END)
                    self.console_text.insert("1.0", '\n'.join(lines))
                    self.console_text.see(tk.END)
                    self.console_text.config(state='disabled')
                    return
                break
        
        self.console_text.insert(tk.END, msg)
        self.console_text.see(tk.END)
        self.console_text.config(state='disabled')

if __name__ == "__main__":
    root = tk.Tk()
    
    # 尝试使用 ttkthemes 或者内置主题提升外观
    try:
        root.tk.call("source", "azure.tcl")
        root.tk.call("set_theme", "light")
    except Exception:
        style = ttk.Style()
        if 'clam' in style.theme_names():
            style.theme_use('clam')
            
    app = TDLGuiApp(root)
    root.mainloop()


```

::: details <^null
1. [配套预编译版：Windows_64bit_v0.20.1](./tdl.exe.7z.md)
2. [tdl_gui.py](./tdl_gui.py.md)
3. [TDL_GUI.exe](./TDL_GUI.exe.md)

**手动下载预编译版tdl时**

**请将tdl存放目录添加至PATH**
:::