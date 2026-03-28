// 应用程序配置文件

const APP_CONFIG = {
    // 代理服务器列表
    proxies: [
        { url: "https://prox.futa.de5.net/", label: "站长自建" },
        { url: "https://prox.spacetimee.xyz/", label: "Github公开" }
    ],
    
    // 静态资源加速服务
    staticAcceleration: {
        baseUrl: "https://p.futa.de5.net/"
    },
    
    // Pixiv图片代理转换规则
    pixivProxy: {
        domain: "i.pximg.net"
    },

    // API 快捷切换选项 (输入 'api' 触发)
    apiShortcutOptions: [
        { value: "sfw", label: "SFW" },
        { value: "nsfw", label: "NSFW" },
        { value: "https://tg.futa.de5.net/peiwen", label: "peiwen" },
        { value: "https://tg.futa.de5.net/luchu", label: "luchu" },
        { value: "https://tg.futa.de5.net/xianqi", label: "xianqi" }
    ],
    
    // API 配置 (Waifu.pics)
    api: {
        baseUrl: "https://api.waifu.pics",
        categories: {
            sfw: ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'kick', 'happy', 'wink', 'poke', 'dance', 'cringe'],
            nsfw: ['waifu', 'neko', 'trap', 'blowjob']
        }
    },
    
    // 应用运行时配置
    runtime: {
        preloadCount: 2,
        preloadEnabled: true,
        touchSwipeThreshold: 50,
        zoomMin: 0.5,
        zoomMax: 4,
        zoomStep: 0.25,
        maxRetries: 3,
        retryDelay: 1000,
        fetchTimeout: 60000
    }
};

// 冻结配置对象防止意外修改
Object.freeze(APP_CONFIG);
