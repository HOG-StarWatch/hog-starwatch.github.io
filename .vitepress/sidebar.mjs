import { link } from "node:fs";
import generateSidebar from "../utils/auto-gen-sidebar.mjs";

export default {
    "/StarCraft/": generateSidebar("StarCraft"),
    "/RPGMaker/": generateSidebar("RPGMaker"),
    "/CF/": generateSidebar("CF"),
    "TDL/": [
        {text: '项目', items: [{text: '主页', link: 'TDL/index'}]},
        {text: '入门',
          items: [
            { text: '安装', link: 'TDL/installation' },
            { text: '快速开始', link: 'TDL/quick-start' },
            { text: '自动补全', link: 'TDL/shell-completion' }
          ]},
        {text: '指南',
          items: [
            { text: '全局设置', link: 'TDL/global-config' },
            { text: '登录', link: 'TDL/quick-start' },
            { text: '下载', link: 'TDL/download' },
            { text: '转发', link: 'TDL/forward' },
            { text: '上传', link: 'TDL/upload' },
            { text: '迁移', link: 'TDL/migration' },
            { text: '工具', items: [
                { text: '列出聊天', link: 'TDL/list-chats' },
                { text: '导出成员', link: 'TDL/export-members' },
                { text: '导出消息', link: 'TDL/export-messages' },
            ]},
            { text: '扩展', link: 'TDL/extensions' },
          ]},
        { text: '更多',
          items: [
            { text: '命令行', link: 'TDL/cli/tdl' },
            { text: '环境变量', link: 'TDL/env' },
            { text: '数据', link: 'TDL/data' },
            { text: '疑难解答', link: 'TDL/troubleshooting' }
          ]
        },
        { text: 'Extra', link: 'TDL/extra' }
      ]
};