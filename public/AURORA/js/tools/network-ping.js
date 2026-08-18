/* Extracted from network-ping.html (refactor script). Tool logic. */

function onIframeLoad() {
    const loader = document.getElementById('modalLoader');
    const iframe = document.getElementById('speedtestIframe');
    if (iframe.src !== 'about:blank') {
        loader.style.display = 'none';
        iframe.classList.add('loaded');
    }
}

function openCloudflareSpeedtest() {
    const modal = document.getElementById('speedtestModal');
    const iframe = document.getElementById('speedtestIframe');
    const loader = document.getElementById('modalLoader');
    
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
    
    loader.style.display = 'flex';
    iframe.classList.remove('loaded');
    iframe.removeEventListener('load', onIframeLoad);
    iframe.addEventListener('load', onIframeLoad);
    iframe.src = 'https://speed.cloudflare.com/';

    // Handle ESC key
    window.addEventListener('keydown', handleEsc);
}

function handleEsc(e) {
    if (e.key === 'Escape') closeCloudflareSpeedtest();
}

function closeCloudflareSpeedtest() {
    const modal = document.getElementById('speedtestModal');
    const iframe = document.getElementById('speedtestIframe');
    
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        iframe.src = 'about:blank';
    }, 400);
    
    window.removeEventListener('keydown', handleEsc);
    iframe.removeEventListener('load', onIframeLoad);
}

const siteDB = {
    domestic: [
        {
            category: "资讯与搜索",
            items: [
                { name: "百度", url: "https://www.baidu.com", icon: "fas fa-search" },
                { name: "搜狗", url: "https://www.sogou.com", icon: "fas fa-search-plus" },
                { name: "360搜索", url: "https://www.so.com", icon: "fas fa-shield-alt" },
                { name: "必应中国", url: "https://cn.bing.com", icon: "fab fa-microsoft" },
                { name: "今日头条", url: "https://www.toutiao.com", icon: "fas fa-newspaper" },
                { name: "澎湃新闻", url: "https://www.thepaper.cn", icon: "fas fa-water" },
                { name: "新浪", url: "https://www.sina.com.cn", icon: "fas fa-eye" },
                { name: "网易", url: "https://www.163.com", icon: "fas fa-envelope" },
                { name: "腾讯网", url: "https://www.qq.com", icon: "fab fa-qq" },
                { name: "凤凰网", url: "https://www.ifeng.com", icon: "fas fa-fire" },
                { name: "环球网", url: "https://www.huanqiu.com", icon: "fas fa-globe-asia" },
                { name: "人民网", url: "http://www.people.com.cn", icon: "fas fa-flag" },
                { name: "新华网", url: "http://www.xinhuanet.com", icon: "fas fa-newspaper" },
                { name: "观察者网", url: "https://www.guancha.cn", icon: "fas fa-glasses" }
            ]
        },
        {
            category: "社交与内容社区",
            items: [
                { name: "微信 (Web)", url: "https://wx.qq.com", icon: "fab fa-weixin" },
                { name: "抖音", url: "https://www.douyin.com", icon: "fab fa-tiktok" },
                { name: "快手", url: "https://www.kuaishou.com", icon: "fas fa-video" },
                { name: "哔哩哔哩", url: "https://www.bilibili.com", icon: "fas fa-play-circle" },
                { name: "小红书", url: "https://www.xiaohongshu.com", icon: "fas fa-heart" },
                { name: "知乎", url: "https://www.zhihu.com", icon: "fas fa-question-circle" },
                { name: "微博", url: "https://weibo.com", icon: "fab fa-weibo" },
                { name: "豆瓣", url: "https://www.douban.com", icon: "fas fa-book-open" },
                { name: "虎扑", url: "https://www.hupu.com", icon: "fas fa-basketball-ball" },
                { name: "贴吧", url: "https://tieba.baidu.com", icon: "fas fa-comments" },
                { name: "NGA玩家社区", url: "https://nga.178.com", icon: "fas fa-gamepad" },
                { name: "AcFun", url: "https://www.acfun.cn", icon: "fas fa-smile-wink" },
                { name: "Lofter", url: "https://www.lofter.com", icon: "fas fa-pen-fancy" }
            ]
        },
        {
            category: "政务与公共服务",
            items: [
                { name: "中国政府网", url: "https://www.gov.cn", icon: "fas fa-landmark" },
                { name: "国家税务局", url: "https://www.chinatax.gov.cn", icon: "fas fa-file-invoice-dollar" },
                { name: "12306", url: "https://www.12306.cn", icon: "fas fa-train" },
                { name: "学信网", url: "https://www.chsi.com.cn", icon: "fas fa-graduation-cap" },
                { name: "国家政务服务平台", url: "http://gjzwfw.www.gov.cn", icon: "fas fa-university" },
                { name: "中国人民银行", url: "http://www.pbc.gov.cn", icon: "fas fa-money-bill-wave" },
                { name: "中国气象局", url: "http://www.cma.gov.cn", icon: "fas fa-cloud-sun" }
            ]
        },
        {
            category: "电商与购物",
            items: [
                { name: "淘宝 (天猫)", url: "https://www.taobao.com", icon: "fas fa-shopping-cart" },
                { name: "京东 (JD)", url: "https://www.jd.com", icon: "fas fa-shopping-bag" },
                { name: "拼多多", url: "https://www.pinduoduo.com", icon: "fas fa-tags" },
                { name: "唯品会", url: "https://www.vip.com", icon: "fas fa-gem" },
                { name: "闲鱼", url: "https://www.2yu.com", icon: "fas fa-hand-holding-heart" },
                { name: "苏宁易购", url: "https://www.suning.com", icon: "fas fa-store" },
                { name: "当当网", url: "http://www.dangdang.com", icon: "fas fa-book" },
                { name: "什么值得买", url: "https://www.smzdm.com", icon: "fas fa-thumbs-up" }
            ]
        },
        {
            category: "金融与银行",
            items: [
                { name: "工商银行", url: "http://www.icbc.com.cn", icon: "fas fa-university" },
                { name: "建设银行", url: "http://www.ccb.com", icon: "fas fa-building" },
                { name: "招商银行", url: "http://www.cmbchina.com", icon: "fas fa-credit-card" },
                { name: "中国银行", url: "https://www.boc.cn", icon: "fas fa-globe" },
                { name: "支付宝", url: "https://www.alipay.com", icon: "fab fa-alipay" },
                { name: "东方财富", url: "https://www.eastmoney.com", icon: "fas fa-chart-line" },
                { name: "同花顺", url: "http://www.10jqka.com.cn", icon: "fas fa-chart-bar" }
            ]
        },
        {
            category: "生产力与AI (国内)",
            items: [
                { name: "通义千问", url: "https://tongyi.aliyun.com", icon: "fas fa-brain" },
                { name: "文心一言", url: "https://yiyan.baidu.com", icon: "fas fa-robot" },
                { name: "Kimi.ai", url: "https://kimi.moonshot.cn", icon: "fas fa-bolt" },
                { name: "DeepSeek", url: "https://deepseek.com", icon: "fas fa-bolt" },
                { name: "智谱清言", url: "https://chatglm.cn", icon: "fas fa-comment-dots" },
                { name: "飞书", url: "https://www.feishu.cn", icon: "fas fa-calendar-check" },
                { name: "钉钉", url: "https://www.dingtalk.com", icon: "fas fa-briefcase" },
                { name: "腾讯文档", url: "https://docs.qq.com", icon: "fas fa-file-alt" },
                { name: "语雀", url: "https://www.yuque.com", icon: "fas fa-feather" },
                { name: "WPS Office", url: "https://www.wps.cn", icon: "fas fa-file-word" },
                { name: "百度网盘", url: "https://pan.baidu.com", icon: "fas fa-cloud-download-alt" }
            ]
        },
        {
            category: "技术与开发者",
            items: [
                { name: "CSDN", url: "https://www.csdn.net", icon: "fas fa-code" },
                { name: "掘金", url: "https://juejin.cn", icon: "fas fa-thumbs-up" },
                { name: "博客园", url: "https://www.cnblogs.com", icon: "fas fa-rss" },
                { name: "OSChina", url: "https://www.oschina.net", icon: "fab fa-linux" },
                { name: "SegmentFault", url: "https://segmentfault.com", icon: "fas fa-bug" },
                { name: "码云 Gitee", url: "https://gitee.com", icon: "fab fa-git-alt" },
                { name: "V2EX", url: "https://www.v2ex.com", icon: "fas fa-comments" },
                { name: "阿里云", url: "https://www.aliyun.com", icon: "fab fa-alipay" },
                { name: "腾讯云", url: "https://cloud.tencent.com", icon: "fab fa-qq" },
                { name: "华为云", url: "https://www.huaweicloud.com", icon: "fas fa-cloud" },
                { name: "简书", url: "https://www.jianshu.com", icon: "fas fa-book-reader" }
            ]
        },
        {
            category: "音视频与娱乐",
            items: [
                { name: "腾讯视频", url: "https://v.qq.com", icon: "fas fa-tv" },
                { name: "爱奇艺", url: "https://www.iqiyi.com", icon: "fas fa-video" },
                { name: "优酷", url: "https://www.youku.com", icon: "fas fa-play" },
                { name: "芒果TV", url: "https://www.mgtv.com", icon: "fas fa-lemon" },
                { name: "网易云音乐", url: "https://music.163.com", icon: "fas fa-music" },
                { name: "QQ音乐", url: "https://y.qq.com", icon: "fas fa-headphones" },
                { name: "喜马拉雅", url: "https://www.ximalaya.com", icon: "fas fa-microphone" },
                { name: "斗鱼直播", url: "https://www.douyu.com", icon: "fas fa-fish" },
                { name: "虎牙直播", url: "https://www.huya.com", icon: "fas fa-video" }
            ]
        },
        {
            category: "工具与生活",
            items: [
                { name: "高德地图", url: "https://www.amap.com", icon: "fas fa-map-marked-alt" },
                { name: "百度地图", url: "https://map.baidu.com", icon: "fas fa-map-marker-alt" },
                { name: "携程", url: "https://www.ctrip.com", icon: "fas fa-plane" },
                { name: "去哪儿", url: "https://www.qunar.com", icon: "fas fa-suitcase" },
                { name: "大众点评", url: "https://www.dianping.com", icon: "fas fa-utensils" },
                { name: "美团", url: "https://www.meituan.com", icon: "fas fa-utensils" },
                { name: "饿了么", url: "https://www.ele.me", icon: "fas fa-hamburger" },
                { name: "顺丰速运", url: "https://www.sf-express.com", icon: "fas fa-truck" },
                { name: "中国邮政", url: "http://www.chinapost.com.cn", icon: "fas fa-envelope" },
                { name: "中通快递", url: "https://www.zto.com", icon: "fas fa-shipping-fast" },
                { name: "圆通速递", url: "https://www.yto.net.cn", icon: "fas fa-box-open" },
                { name: "申通快递", url: "https://www.sto.cn", icon: "fas fa-dolly" },
                { name: "韵达速递", url: "http://www.yundaex.com", icon: "fas fa-truck-moving" },
                { name: "中国天气", url: "http://www.weather.com.cn", icon: "fas fa-cloud-sun-rain" },
                { name: "汽车之家", url: "https://www.autohome.com.cn", icon: "fas fa-car" },
                { name: "易车", url: "https://www.yiche.com", icon: "fas fa-car-side" },
                { name: "贝壳找房", url: "https://www.ke.com", icon: "fas fa-home" },
                { name: "链家", url: "https://www.lianjia.com", icon: "fas fa-building" },
                { name: "安居客", url: "https://www.anjuke.com", icon: "fas fa-city" },
                { name: "58同城", url: "https://www.58.com", icon: "fas fa-bullhorn" },
                { name: "BOSS直聘", url: "https://www.zhipin.com", icon: "fas fa-briefcase" },
                { name: "智联招聘", url: "https://www.zhaopin.com", icon: "fas fa-user-tie" },
                { name: "前程无忧", url: "https://www.51job.com", icon: "fas fa-file-contract" },
                { name: "猎聘", url: "https://www.liepin.com", icon: "fas fa-binoculars" },
                { name: "中关村在线", url: "https://www.zol.com.cn", icon: "fas fa-microchip" },
                { name: "太平洋电脑", url: "https://www.pconline.com.cn", icon: "fas fa-desktop" },
                { name: "测速网", url: "https://www.speedtest.cn", icon: "fas fa-tachometer-alt" }
            ]
        }
    ],
    international: [
        {
            category: "社交、通讯与流媒体",
            items: [
                { name: "Google", url: "https://www.google.com", icon: "fab fa-google" },
                { name: "YouTube", url: "https://www.youtube.com", icon: "fab fa-youtube" },
                { name: "Instagram", url: "https://www.instagram.com", icon: "fab fa-instagram" },
                { name: "Twitter (X)", url: "https://twitter.com", icon: "fab fa-twitter" },
                { name: "Facebook", url: "https://www.facebook.com", icon: "fab fa-facebook" },
                { name: "Reddit", url: "https://www.reddit.com", icon: "fab fa-reddit" },
                { name: "Discord", url: "https://discord.com", icon: "fab fa-discord" },
                { name: "Telegram", url: "https://t.me", icon: "fab fa-telegram" },
                { name: "WhatsApp", url: "https://www.whatsapp.com", icon: "fab fa-whatsapp" },
                { name: "Twitch", url: "https://www.twitch.tv", icon: "fab fa-twitch" },
                { name: "Spotify", url: "https://www.spotify.com", icon: "fab fa-spotify" },
                { name: "Netflix", url: "https://www.netflix.com", icon: "fas fa-film" },
                { name: "Disney+", url: "https://www.disneyplus.com", icon: "fas fa-video" },
                { name: "Hulu", url: "https://www.hulu.com", icon: "fas fa-tv" },
                { name: "HBO Max", url: "https://www.max.com", icon: "fas fa-play-circle" },
                { name: "Prime Video", url: "https://www.amazon.com/primevideo", icon: "fas fa-film" },
                { name: "Snapchat", url: "https://www.snapchat.com", icon: "fab fa-snapchat" },
                { name: "TikTok (Intl)", url: "https://www.tiktok.com", icon: "fab fa-tiktok" },
                { name: "LinkedIn", url: "https://www.linkedin.com", icon: "fab fa-linkedin" }
            ]
        },
        {
            category: "全球商业与科技",
            items: [
                { name: "Microsoft", url: "https://www.microsoft.com", icon: "fab fa-microsoft" },
                { name: "Amazon", url: "https://www.amazon.com", icon: "fab fa-amazon" },
                { name: "Apple", url: "https://www.apple.com", icon: "fab fa-apple" },
                { name: "Oracle", url: "https://www.oracle.com", icon: "fas fa-database" },
                { name: "IBM", url: "https://www.ibm.com", icon: "fas fa-server" },
                { name: "Intel", url: "https://www.intel.com", icon: "fas fa-microchip" },
                { name: "AMD", url: "https://www.amd.com", icon: "fas fa-microchip" },
                { name: "NVIDIA", url: "https://www.nvidia.com", icon: "fas fa-microchip" },
                { name: "Adobe", url: "https://www.adobe.com", icon: "fas fa-palette" },
                { name: "Salesforce", url: "https://www.salesforce.com", icon: "fas fa-cloud" },
                { name: "Zoom", url: "https://zoom.us", icon: "fas fa-video" },
                { name: "Slack", url: "https://slack.com", icon: "fab fa-slack" },
                { name: "Atlassian", url: "https://www.atlassian.com", icon: "fab fa-jira" },
                { name: "Shopify", url: "https://www.shopify.com", icon: "fab fa-shopify" },
                { name: "Stripe", url: "https://stripe.com", icon: "fab fa-cc-stripe" },
                { name: "PayPal", url: "https://www.paypal.com", icon: "fab fa-paypal" },
                { name: "Tesla", url: "https://www.tesla.com", icon: "fas fa-car" },
                { name: "SpaceX", url: "https://www.spacex.com", icon: "fas fa-rocket" }
            ]
        },
        {
            category: "新闻与资讯",
            items: [
                { name: "CNN", url: "https://edition.cnn.com", icon: "fas fa-newspaper" },
                { name: "BBC", url: "https://www.bbc.com", icon: "fas fa-broadcast-tower" },
                { name: "New York Times", url: "https://www.nytimes.com", icon: "far fa-newspaper" },
                { name: "Reuters", url: "https://www.reuters.com", icon: "fas fa-globe" },
                { name: "Bloomberg", url: "https://www.bloomberg.com", icon: "fas fa-chart-line" },
                { name: "Wall Street Journal", url: "https://www.wsj.com", icon: "fas fa-newspaper" },
                { name: "The Guardian", url: "https://www.theguardian.com", icon: "fas fa-shield-alt" },
                { name: "The Verge", url: "https://www.theverge.com", icon: "fas fa-mobile-alt" },
                { name: "TechCrunch", url: "https://techcrunch.com", icon: "fas fa-laptop-code" },
                { name: "Wired", url: "https://www.wired.com", icon: "fas fa-plug" },
                { name: "Ars Technica", url: "https://arstechnica.com", icon: "fas fa-microchip" },
                { name: "Engadget", url: "https://www.engadget.com", icon: "fas fa-gamepad" }
            ]
        },
        {
            category: "教育与学术",
            items: [
                { name: "Harvard", url: "https://www.harvard.edu", icon: "fas fa-university" },
                { name: "MIT", url: "https://web.mit.edu", icon: "fas fa-robot" },
                { name: "Stanford", url: "https://www.stanford.edu", icon: "fas fa-graduation-cap" },
                { name: "Coursera", url: "https://www.coursera.org", icon: "fas fa-chalkboard-teacher" },
                { name: "edX", url: "https://www.edx.org", icon: "fas fa-book-open" },
                { name: "Khan Academy", url: "https://www.khanacademy.org", icon: "fas fa-school" },
                { name: "arXiv", url: "https://arxiv.org", icon: "fas fa-file-pdf" },
                { name: "ResearchGate", url: "https://www.researchgate.net", icon: "fas fa-flask" },
                { name: "Nature", url: "https://www.nature.com", icon: "fas fa-leaf" },
                { name: "Science", url: "https://www.science.org", icon: "fas fa-atom" }
            ]
        },
        {
            category: "金融与加密货币",
            items: [
                { name: "Coinbase", url: "https://www.coinbase.com", icon: "fab fa-bitcoin" },
                { name: "Binance", url: "https://www.binance.com", icon: "fas fa-coins" },
                { name: "CoinMarketCap", url: "https://coinmarketcap.com", icon: "fas fa-chart-area" },
                { name: "Yahoo Finance", url: "https://finance.yahoo.com", icon: "fas fa-dollar-sign" },
                { name: "TradingView", url: "https://www.tradingview.com", icon: "fas fa-chart-pie" },
                { name: "Wise", url: "https://wise.com", icon: "fas fa-exchange-alt" },
                { name: "Revolut", url: "https://www.revolut.com", icon: "fas fa-credit-card" }
            ]
        },
        {
            category: "旅行与生活",
            items: [
                { name: "Booking.com", url: "https://www.booking.com", icon: "fas fa-bed" },
                { name: "Airbnb", url: "https://www.airbnb.com", icon: "fab fa-airbnb" },
                { name: "Expedia", url: "https://www.expedia.com", icon: "fas fa-plane" },
                { name: "TripAdvisor", url: "https://www.tripadvisor.com", icon: "fas fa-map-marked-alt" },
                { name: "Skyscanner", url: "https://www.skyscanner.net", icon: "fas fa-plane-departure" },
                { name: "Uber", url: "https://www.uber.com", icon: "fab fa-uber" },
                { name: "Yelp", url: "https://www.yelp.com", icon: "fab fa-yelp" }
            ]
        },
        {
            category: "购物与电商",
            items: [
                { name: "eBay", url: "https://www.ebay.com", icon: "fab fa-ebay" },
                { name: "Best Buy", url: "https://www.bestbuy.com", icon: "fas fa-tag" },
                { name: "Walmart", url: "https://www.walmart.com", icon: "fas fa-shopping-cart" },
                { name: "Target", url: "https://www.target.com", icon: "fas fa-bullseye" },
                { name: "Etsy", url: "https://www.etsy.com", icon: "fab fa-etsy" },
                { name: "AliExpress", url: "https://www.aliexpress.com", icon: "fas fa-shopping-bag" },
                { name: "IKEA", url: "https://www.ikea.com", icon: "fas fa-chair" }
            ]
        },
        {
            category: "游戏平台官网",
            items: [
                { name: "Steam", url: "https://store.steampowered.com", icon: "fab fa-steam" },
                { name: "Epic Games", url: "https://www.epicgames.com", icon: "fas fa-gamepad" },
                { name: "GOG.com", url: "https://www.gog.com", icon: "fas fa-ghost" },
                { name: "EA (Origin)", url: "https://www.ea.com", icon: "fas fa-play" },
                { name: "Xbox", url: "https://www.xbox.com", icon: "fab fa-xbox" },
                { name: "PlayStation", url: "https://www.playstation.com", icon: "fab fa-playstation" },
                { name: "Ubisoft", url: "https://ubisoftconnect.com", icon: "fas fa-shield-alt" },
                { name: "Battle.net", url: "https://www.blizzard.com", icon: "fas fa-snowflake" },
                { name: "Nintendo", url: "https://www.nintendo.com", icon: "fas fa-gamepad" },
                { name: "Roblox", url: "https://www.roblox.com", icon: "fas fa-cube" },
                { name: "Itch.io", url: "https://itch.io", icon: "fas fa-gamepad" }
            ]
        },
        {
            category: "AI、技术与代码",
            items: [
                { name: "ChatGPT", url: "https://chatgpt.com", icon: "fas fa-robot" },
                { name: "Claude AI", url: "https://claude.ai", icon: "fas fa-brain" },
                { name: "Hugging Face", url: "https://huggingface.co", icon: "fas fa-smile" },
                { name: "Midjourney", url: "https://www.midjourney.com", icon: "fas fa-images" },
                { name: "GitHub", url: "https://github.com", icon: "fab fa-github" },
                { name: "GitLab", url: "https://gitlab.com", icon: "fab fa-gitlab" },
                { name: "Stack Overflow", url: "https://stackoverflow.com", icon: "fab fa-stack-overflow" },
                { name: "Docker Hub", url: "https://hub.docker.com", icon: "fab fa-docker" },
                { name: "Vercel", url: "https://vercel.com", icon: "fas fa-triangle" },
                { name: "Cloudflare", url: "https://www.cloudflare.com", icon: "fas fa-cloud" },
                { name: "DigitalOcean", url: "https://www.digitalocean.com", icon: "fas fa-water" },
                { name: "Heroku", url: "https://www.heroku.com", icon: "fas fa-server" }
            ]
        },
        {
            category: "创作与设计",
            items: [
                { name: "Pixiv", url: "https://www.pixiv.net", icon: "fas fa-paint-brush" },
                { name: "ArtStation", url: "https://www.artstation.com", icon: "fab fa-artstation" },
                { name: "Behance", url: "https://www.behance.net", icon: "fab fa-behance" },
                { name: "Pinterest", url: "https://www.pinterest.com", icon: "fab fa-pinterest" },
                { name: "DeviantArt", url: "https://www.deviantart.com", icon: "fas fa-paint-roller" },
                { name: "Patreon", url: "https://www.patreon.com", icon: "fab fa-patreon" },
                { name: "Dribbble", url: "https://dribbble.com", icon: "fab fa-dribbble" },
                { name: "Figma", url: "https://www.figma.com", icon: "fab fa-figma" }
            ]
        },
        {
            category: "存储与工具",
            items: [
                { name: "Google Drive", url: "https://drive.google.com", icon: "fab fa-google-drive" },
                { name: "Dropbox", url: "https://www.dropbox.com", icon: "fab fa-dropbox" },
                { name: "MEGA", url: "https://mega.nz", icon: "fas fa-cloud-upload-alt" },
                { name: "OneDrive", url: "https://onedrive.live.com", icon: "fas fa-cloud" },
                { name: "Proton Mail", url: "https://proton.me", icon: "fas fa-envelope-shield" },
                { name: "Wikipedia", url: "https://www.wikipedia.org", icon: "fas fa-book" },
                { name: "Archive.org", url: "https://archive.org", icon: "fas fa-archive" },
                { name: "Speedtest.net", url: "https://www.speedtest.net", icon: "fas fa-tachometer-alt" },
                { name: "Fast.com", url: "https://fast.com", icon: "fas fa-bolt" }
            ]
        },
    ],
    adult: [
        {
            category: "成人内容 (Adult Content)",
            items: [
                { name: "Pornhub", url: "https://www.pornhub.com", icon: "fas fa-video" },
                { name: "Iamsissy", url: "https://iamsissy.com/", icon: "fas fa-venus-double" },
                { name: "Xvideos", url: "https://www.xvideos.com", icon: "fas fa-film" },
                { name: "XNXX", url: "https://www.xnxx.com", icon: "fas fa-play" },
                { name: "Jable", url: "https://jable.tv", icon: "fas fa-tv" },
                { name: "MissAV", url: "https://missav.com", icon: "fas fa-heart" },
                { name: "SpankBang", url: "https://spankbang.com", icon: "fas fa-bolt" },
                { name: "Supjav", url: "https://supjav.com", icon: "fas fa-star" },
                { name: "YouPorn", url: "https://www.youporn.com", icon: "fas fa-video-slash" },
                { name: "Stripchat", url: "https://stripchat.com", icon: "fas fa-video" },
                { name: "Chaturbate", url: "https://chaturbate.com", icon: "fas fa-camera" },
                { name: "RedTube", url: "https://www.redtube.com", icon: "fas fa-play-circle" },
                { name: "YouJizz", url: "https://www.youjizz.com", icon: "fas fa-hand-holding" },
                { name: "Tube8", url: "https://www.tube8.com", icon: "fas fa-video" },
                { name: "XTube", url: "https://www.xtube.com", icon: "fas fa-camera-retro" },
                { name: "Porn.com", url: "https://www.porn.com", icon: "fas fa-globe" },
                { name: "Brazzers", url: "https://www.brazzers.com", icon: "fas fa-star" },
                { name: "RealityKings", url: "https://www.realitykings.com", icon: "fas fa-crown" },
                { name: "NaughtyAmerica", url: "https://www.naughtyamerica.com", icon: "fas fa-flag-usa" },
                { name: "BangBros", url: "https://www.bangbros.com", icon: "fas fa-bus-alt" },
                { name: "Twistys", url: "https://www.twistys.com", icon: "fas fa-venus" },
                { name: "XArt", url: "https://www.x-art.com", icon: "fas fa-palette" },
                { name: "Babes", url: "https://www.babes.com", icon: "fas fa-female" },
                { name: "DigitalPlayground", url: "https://www.digitalplayground.com", icon: "fas fa-gamepad" },
                { name: "EvilAngel", url: "https://www.evilangel.com", icon: "fas fa-angel" },
                { name: "TnaFlix", url: "https://www.tnaflix.com", icon: "fas fa-film" },
                { name: "SunPorno", url: "https://www.sunporno.com", icon: "fas fa-sun" },
                { name: "EpocaPorn", url: "https://www.epocaporn.com", icon: "fas fa-clock" },
                { name: "PornTrexc", url: "https://www.porntrex.com", icon: "fas fa-dragon" },
                { name: "Thumbzilla", url: "https://www.thumbzilla.com", icon: "fas fa-thumbs-up" },
                { name: "DrTuber", url: "https://www.drtuber.com", icon: "fas fa-user-md" },
                { name: "EroMeme", url: "https://eromeme.com", icon: "fas fa-images" },
                { name: "MetArt", url: "https://www.metart.com", icon: "fas fa-camera-retro" },
                { name: "X-Art (Pics)", url: "https://www.x-art.com/photos", icon: "fas fa-image" },
                { name: "Femjoy", url: "https://www.femjoy.com", icon: "fas fa-grin-hearts" },
                { name: "Hegre", url: "https://www.hegre.com", icon: "fas fa-palette" },
                { name: "Watch4Beauty", url: "https://www.watch4beauty.com", icon: "fas fa-eye" },
                { name: "TheLifeErotic", url: "https://www.thelifeerotic.com", icon: "fas fa-heart" },
                { name: "Zemani", url: "https://www.zemani.com", icon: "fas fa-star" },
                { name: "Joymii", url: "https://www.joymii.com", icon: "fas fa-smile" },
                { name: "Nubiles", url: "https://www.nubiles.net", icon: "fas fa-female" },
                { name: "EternalDesire", url: "https://www.eternaldesire.com", icon: "fas fa-infinity" },
                { name: "WowGirls", url: "https://www.wowgirls.com", icon: "fas fa-surprise" },
                { name: "ErroticaArchives", url: "https://www.errotica-archives.com", icon: "fas fa-archive" },
                { name: "SexArt", url: "https://www.sexart.com", icon: "fas fa-paint-brush" },
                { name: "Domai", url: "https://www.domai.com", icon: "fas fa-link" },
                { name: "Flickr (NSFW)", url: "https://www.flickr.com", icon: "fab fa-flickr" },
                { name: "500px (NSFW)", url: "https://500px.com", icon: "fab fa-500px" },
                { name: "DeviantArt (NSFW)", url: "https://www.deviantart.com", icon: "fab fa-deviantart" },
                { name: "Tumblr (NSFW)", url: "https://www.tumblr.com", icon: "fab fa-tumblr" },
                { name: "Reddit (NSFW)", url: "https://www.reddit.com/r/nsfw", icon: "fab fa-reddit" },
                { name: "ImageFap", url: "https://www.imagefap.com", icon: "fas fa-images" },
                { name: "PornPics", url: "https://www.pornpics.com", icon: "fas fa-camera" },
                { name: "XHamster (Photos)", url: "https://xhamster.com/photos", icon: "fas fa-hamster" },
                { name: "PornHub (Photos)", url: "https://www.pornhub.com/albums", icon: "fas fa-photo-video" },
                { name: "Motherless", url: "https://motherless.com", icon: "fas fa-users" },
                { name: "CoedCherry", url: "https://www.coedcherry.com", icon: "fas fa-cherry" },
                { name: "FTVGirls", url: "https://www.ftvgirls.com", icon: "fas fa-video" },
                { name: "MPLStudios", url: "https://www.mplstudios.com", icon: "fas fa-studio-vinari" },
                { name: "Twistys (Pics)", url: "https://www.twistys.com/photos", icon: "fas fa-camera" },
                { name: "Babes (Pics)", url: "https://www.babes.com/photos", icon: "fas fa-female" },
                { name: "Hanime1", url: "https://hanime1.me", icon: "fas fa-play-circle" },
                { name: "Hanime.tv", url: "https://hanime.tv", icon: "fas fa-tv" },
                { name: "HentaiHaven", url: "https://hentaihaven.xxx", icon: "fas fa-h-square" },
                { name: "HentaiMama", url: "https://hentaimama.io", icon: "fas fa-baby" },
                { name: "Hentai", url: "https://www.hentai.com", icon: "fas fa-venus-double" },
                { name: "AnimeIDHentai", url: "https://animeidhentai.com", icon: "fas fa-id-card" },
                { name: "HentaiStream", url: "https://hentaistream.moe", icon: "fas fa-stream" },
                { name: "HentaiPulse", url: "https://hentaipulse.com", icon: "fas fa-heartbeat" },
                { name: "MuchoHentai", url: "https://muchohentai.com", icon: "fas fa-check-double" },
                { name: "HentaiFreak", url: "https://hentaifreak.org", icon: "fas fa-ghost" },
                { name: "HentaiGasm", url: "https://hentaigasm.com", icon: "fas fa-fire-alt" },
                { name: "HentaiWorld", url: "https://hentaiworld.tv", icon: "fas fa-globe" },
                { name: "HentaiPros", url: "https://hentaipros.com", icon: "fas fa-user-tie" },
                { name: "OhoGlory", url: "https://ohoglory.com", icon: "fas fa-star" },
                { name: "HentaiFox", url: "https://hentaifox.com", icon: "fas fa-fox" },
                { name: "Hentai2Read", url: "https://hentai2read.com", icon: "fas fa-book-reader" },
                { name: "SimplyHentai", url: "https://www.simply-hentai.com", icon: "fas fa-smile" },
                { name: "E-Hentai", url: "https://e-hentai.org", icon: "fas fa-video" },
                { name: "Hentai.tv", url: "https://hentai.tv", icon: "fas fa-tv" },
                { name: "AnimeHentai", url: "https://animehentai.videos", icon: "fas fa-film" },
                { name: "HentaiVideo", url: "https://hentaivideo.net", icon: "fas fa-video" },
                { name: "Pornhub (Hentai)", url: "https://www.pornhub.com/categories/hentai", icon: "fas fa-tag" },
                { name: "Xvideos (Hentai)", url: "https://www.xvideos.com/c/Hentai-45", icon: "fas fa-tag" },
                { name: "HentaiShark", url: "https://hentaishark.com", icon: "fas fa-fish" },
                { name: "HentaiMoon", url: "https://hentaimoon.com", icon: "fas fa-moon" },
                { name: "HentaiYes", url: "https://hentaiyes.com", icon: "fas fa-check" },
                { name: "HentaiHome", url: "https://hentaihome.net", icon: "fas fa-home" },
                { name: "HentaiPlay", url: "https://hentaiplay.net", icon: "fas fa-play" },
                { name: "HentaiArea", url: "https://hentaiarea.com", icon: "fas fa-map-marker" },
                { name: "HentaiCloud", url: "https://hentaicloud.com", icon: "fas fa-cloud" },
                { name: "HentaiBox", url: "https://hentaibox.net", icon: "fas fa-box" },
                { name: "Gelbooru", url: "https://gelbooru.com", icon: "fas fa-images" },
                { name: "Danbooru", url: "https://danbooru.donmai.us", icon: "fas fa-database" },
                { name: "SankakuComplex", url: "https://chan.sankakucomplex.com", icon: "fas fa-triangle" },
                { name: "Yande.re", url: "https://yande.re", icon: "fas fa-leaf" },
                { name: "Konachan", url: "https://konachan.com", icon: "fas fa-star" },
                { name: "Zerochan", url: "https://www.zerochan.net", icon: "fas fa-circle" },
                { name: "Anime-Pictures", url: "https://anime-pictures.net", icon: "fas fa-image" },
                { name: "NHentai", url: "https://nhentai.net", icon: "fas fa-book-open" },
                { name: "Hitomi.la", url: "https://hitomi.la", icon: "fas fa-eye" },
                { name: "Tsumino", url: "https://www.tsumino.com", icon: "fas fa-book" },
                { name: "Pururin", url: "https://pururin.io", icon: "fas fa-cat" },
                { name: "HentaiNexus", url: "https://hentainexus.com", icon: "fas fa-link" },
                { name: "Luscious", url: "https://luscious.net", icon: "fas fa-heart" },
                { name: "Fakku", url: "https://www.fakku.net", icon: "fas fa-book" },
                { name: "Pixiv (R18)", url: "https://www.pixiv.net", icon: "fas fa-paint-brush" },
                { name: "Paheal", url: "https://rule34.paheal.net", icon: "fas fa-paw" },
                { name: "Rule34", url: "https://rule34.xxx", icon: "fas fa-ruler" },
                { name: "Xbooru", url: "https://xbooru.com", icon: "fas fa-times" },
                { name: "Safebooru", url: "https://safebooru.org", icon: "fas fa-shield-alt" },
                { name: "AnimePaper", url: "https://www.animepaper.net", icon: "fas fa-scroll" },
                { name: "Minitokyo", url: "http://www.minitokyo.net", icon: "fas fa-city" },
                { name: "TheAnimeGallery", url: "https://www.theanimegallery.com", icon: "fas fa-gallery" },
                { name: "HentaiCosplay", url: "https://hentai-cosplays.com", icon: "fas fa-mask" },
                { name: "CosplayDeviants", url: "https://www.cosplaydeviants.com", icon: "fas fa-user-secret" },
                { name: "HentaiFoundry", url: "https://www.hentai-foundry.com", icon: "fas fa-industry" },
                { name: "ASMHentai", url: "https://asmhentai.com", icon: "fas fa-book" },
                { name: "HentaiEra", url: "https://hentaiera.com", icon: "fas fa-history" },
                { name: "HentaiHere", url: "https://hentaihere.com", icon: "fas fa-map-pin" },
                { name: "HentaiRead", url: "https://hentairead.com", icon: "fas fa-book-reader" },
                { name: "PornTube", url: "https://www.porntube.com", icon: "fas fa-tv" },
                { name: "Vporn", url: "https://www.vporn.com", icon: "fas fa-video" },
                { name: "NuVid", url: "https://www.nuvid.com", icon: "fas fa-video" },
                { name: "Beeg", url: "https://beeg.com", icon: "fas fa-video" },
                { name: "DaftSex", url: "https://daftsex.com", icon: "fas fa-video" },
                { name: "Eporner", url: "https://www.eporner.com", icon: "fas fa-video" },
                { name: "HQPorner", url: "https://hqporner.com", icon: "fas fa-video" },
                { name: "Hclips", url: "https://hclips.com", icon: "fas fa-video" },
                { name: "Empflix", url: "https://www.empflix.com", icon: "fas fa-video" },
                { name: "Fapster", url: "https://fapster.xxx", icon: "fas fa-video" },
                { name: "PornOne", url: "https://pornone.com", icon: "fas fa-video" },
                { name: "PornHeal", url: "https://pornheal.com", icon: "fas fa-video" },
                { name: "PornDoe", url: "https://www.porndoe.com", icon: "fas fa-video" },
                { name: "CumLouder", url: "https://www.cumlouder.com", icon: "fas fa-volume-up" },
                { name: "Txnx", url: "https://www.txxx.com", icon: "fas fa-video" },
                { name: "Upornia", url: "https://www.upornia.com", icon: "fas fa-video" },
                { name: "PornKaisar", url: "https://pornkaisar.com", icon: "fas fa-crown" },
                { name: "PornDig", url: "https://www.porndig.com", icon: "fas fa-search" },
                { name: "AnySex", url: "https://anysex.com", icon: "fas fa-video" },
                { name: "WhoresHub", url: "https://whoreshub.com", icon: "fas fa-hubspot" }
            ]
        }
    ]
};

const speedConfig = {
    cloudflare: {
        id: 'cloudflare',
        name: 'Cloudflare (Global Edge)',
        ping: 'https://speed.cloudflare.com/__down?bytes=0',
        down: 'https://speed.cloudflare.com/__down?bytes=50000000',
        up: 'https://speed.cloudflare.com/__up'
    },
    default: {
        ping: 'https://speed.cloudflare.com/__down?bytes=0',
        down: 'https://speed.cloudflare.com/__down?bytes=50000000',
        up: 'https://speed.cloudflare.com/__up'
    }
};

const engineList = [
    speedConfig.cloudflare
];

let region = 'domestic';
let unit = 'MBps';
let history = [];
let curDown = 0; let curUp = 0;

function init() {
    // Automatic Deduplication for Adult Content (User Request: Remove sub-categories like photos/hentai, keep one per domain)
    if (siteDB.adult && siteDB.adult.length > 0) {
        const uniqueItems = [];
        const seenDomains = new Set();
        
        // Sort by URL length ascending to keep the root domain (e.g., pornhub.com) and discard sub-paths (e.g., pornhub.com/hentai)
        // This effectively handles the request to remove "photos", "hentai", "original" duplicates
        const allItems = siteDB.adult[0].items.sort((a, b) => a.url.length - b.url.length);
        
        allItems.forEach(item => {
            try {
                let domain = new URL(item.url).hostname.replace('www.', '');
                // Special handling for specific multi-domain sites if needed, but hostname check covers most
                if (!seenDomains.has(domain)) {
                    seenDomains.add(domain);
                    uniqueItems.push(item);
                }
            } catch(e) {
                uniqueItems.push(item);
            }
        });
        siteDB.adult[0].items = uniqueItems;
    }

    // Populate engine select
    const select = document.getElementById('engineSelect');
    engineList.forEach(eng => {
        const opt = document.createElement('option');
        opt.value = eng.id;
        opt.innerText = eng.name;
        select.appendChild(opt);
    });
    // Attach custom ping event listeners (bypass app.js inline handler migration)
    document.getElementById('customTarget')?.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') runCustomPing();
    });
    document.getElementById('customPingBtn')?.addEventListener('click', runCustomPing);

    // Set default unit to MB/s
    changeUnit('MBps');
    render();
}

function updateEngineInfo() {
    // Just visual update if needed, currently select handles value
}

function render() {
    const list = document.getElementById('siteList');
    if (!list) return;
    list.innerHTML = siteDB[region].map((cat, catIdx) => `
        <div class="category-section">
            <div class="category-header">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span>${cat.category}</span>
                    <span style="font-size:0.75rem; color:var(--text-dim); font-weight:normal; background:rgba(255,255,255,0.05); padding:2px 8px; border-radius:10px;">${cat.items.length}</span>
                </div>
                <button class="cat-btn" onclick="pingCategory(${catIdx})">
                    <i class="fas fa-play"></i> 测本组
                </button>
            </div>
            <div class="category-grid">
                ${cat.items.map((s, itemIdx) => `
                    <div class="test-item" onclick="pingOne(${catIdx}, ${itemIdx})">
                        <div class="item-info">
                            <div class="item-top">
                                <i class="${s.icon || 'fas fa-globe'} item-icon" onclick="event.stopPropagation(); window.open('${s.url}', '_blank')" title="点击访问" style="cursor: pointer;"></i>
                                <span class="item-name" title="${s.name}">${s.name}</span>
                            </div>
                            <div class="item-url" title="${s.url}">${s.url.replace('https://','').replace('http://','').replace('www.','').split('/')[0]}</div>
                        </div>
                        <span class="ping-badge" id="p-${catIdx}-${itemIdx}">--</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    // Update tabs count (use index since app.js removes onclick attributes)
    const tabs = document.querySelectorAll('.tab');
    const domesticTab = tabs[0];
    const internationalTab = tabs[1];
    const adultTab = tabs[2];
    
    if (domesticTab) {
        const dTotal = siteDB.domestic.reduce((acc, cat) => acc + cat.items.length, 0);
        domesticTab.innerText = `国内节点 (${dTotal})`;
    }
    if (internationalTab) {
        const iTotal = siteDB.international.reduce((acc, cat) => acc + cat.items.length, 0);
        internationalTab.innerText = `国际节点 (${iTotal})`;
    }
    if (adultTab) {
        const aTotal = siteDB.adult.reduce((acc, cat) => acc + cat.items.length, 0);
        adultTab.innerText = `成人内容 (${aTotal})`;
    }
}


async function pingCategory(catIdx) {
    const items = siteDB[region][catIdx].items;
    for(let i=0; i<items.length; i++) {
        pingOne(catIdx, i);
        await new Promise(r => setTimeout(r, 100)); // Small delay to stagger
    }
}

function switchRegion(r, el) {
    region = r;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    const search = document.getElementById('siteSearch');
    if(search) search.value = '';
    render();
}

function filterSites() {
    const input = document.getElementById('siteSearch').value.toLowerCase().trim();
    const sections = document.querySelectorAll('.category-section');
    
    sections.forEach(sec => {
        let hasVisible = false;
        const items = sec.querySelectorAll('.test-item');
        
        items.forEach(item => {
            const name = item.querySelector('.item-name').innerText.toLowerCase();
            const url = item.querySelector('.item-url').innerText.toLowerCase();
            
            if (name.includes(input) || url.includes(input)) {
                item.style.display = 'flex';
                hasVisible = true;
            } else {
                item.style.display = 'none';
            }
        });
        
        sec.style.display = hasVisible ? 'block' : 'none';
    });
}

async function pingOne(catIdx, itemIdx) {
    const el = document.getElementById(`p-${catIdx}-${itemIdx}`);
    if (!el) return;
    
    // Visual feedback for loading
    el.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>'; 
    el.className = "ping-badge";
    
    const start = Date.now();
    try {
        const ctrl = new AbortController();
        setTimeout(() => ctrl.abort(), 3000);
        await fetch(siteDB[region][catIdx].items[itemIdx].url, { mode: 'no-cors', signal: ctrl.signal });
        const ms = Date.now() - start;
        el.innerText = ms + "ms";
        el.className = "ping-badge " + (ms < 150 ? 'ping-low' : ms < 400 ? 'ping-mid' : 'ping-high');
    } catch { 
        el.innerText = "超时"; 
        el.className = "ping-badge ping-high"; 
    }
}

function pingAll() { 
    siteDB[region].forEach((cat, catIdx) => {
        cat.items.forEach((_, itemIdx) => {
            pingOne(catIdx, itemIdx);
        });
    });
}

// --- 测速核心逻辑 ---

function getEngine(id) {
    return speedConfig[id] || speedConfig.default;
}

function changeUnit(u) {
    unit = u;
    document.getElementById('u-mbps').classList.toggle('active', u === 'Mbps');
    document.getElementById('u-mbps-s').classList.toggle('active', u === 'MBps');
    updateDisp();
    updateHist();
}

function conv(v) {
    if (unit === 'MBps') return (v / 8).toFixed(2);
    return parseFloat(v).toFixed(1);
}

function updateDisp() {
    document.getElementById('dispDown').innerText = conv(curDown);
    document.getElementById('dispUp').innerText = conv(curUp);
}

async function measurePing(url) {
    const samples = [];
    const target = url || 'https://www.google.com/generate_204';
    
    const pingOnce = async () => {
        const start = performance.now();
        try {
            const ctrl = new AbortController();
            setTimeout(() => ctrl.abort(), 3000);
            await fetch(target, { mode: 'no-cors', cache: 'no-store', signal: ctrl.signal });
            return Math.round(performance.now() - start);
        } catch {
            return 3000;
        }
    };

    const promises = [];
    for (let i = 0; i < 3; i++) {
        promises.push(pingOnce());
    }
    
    const results = await Promise.all(promises);
    results.sort((a, b) => a - b);
    return results[0];
}

async function measureDownload(url) {
    document.getElementById('cardDown').classList.add('active');
    // Handle Cloudflare dynamic bytes
    let target = url;
    if (!target) target = 'https://speed.cloudflare.com/__down?bytes=50000000';
    
    const t0 = performance.now();
    let bytes = 0;
    try {
        const res = await fetch(target, { cache: 'no-store' });
        if (!res.body) throw new Error();
        const reader = res.body.getReader();
        let last = t0;
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            bytes += value.byteLength;
            const now = performance.now();
            const sec = (now - t0) / 1000;
            if (sec > 0.1 && now - last > 100) {
                curDown = ((bytes * 8) / sec / 1000000).toFixed(2);
                updateDisp();
                last = now;
            }
        }
        const totalSec = (performance.now() - t0) / 1000;
        curDown = ((bytes * 8) / totalSec / 1000000).toFixed(2);
        updateDisp();
    } catch (e) {
        console.error(e);
    }
    document.getElementById('cardDown').classList.remove('active');
    return parseFloat(curDown);
}

function measureUpload(url) {
    return new Promise((resolve) => {
        document.getElementById('cardUp').classList.add('active');
        const target = url || 'https://speed.cloudflare.com/__up';
        
        const size = 5 * 1024 * 1024; // 5MB
        const data = new Uint8Array(size); 
        for(let i=0; i<size; i+=1024) data[i] = i % 255;

        const xhr = new XMLHttpRequest();
        const t0 = performance.now();
        let last = t0;

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const now = performance.now();
                const sec = (now - t0) / 1000;
                if (sec > 0.1 && now - last > 100) {
                    curUp = ((e.loaded * 8) / sec / 1000000).toFixed(2);
                    updateDisp();
                    last = now;
                }
            }
        };

        xhr.onload = () => {
            const sec = (performance.now() - t0) / 1000;
            curUp = ((size * 8) / sec / 1000000).toFixed(2);
            updateDisp();
            document.getElementById('cardUp').classList.remove('active');
            resolve(parseFloat(curUp));
        };

        xhr.onerror = () => {
            console.warn('Upload failed (CORS or Network)');
            document.getElementById('cardUp').classList.remove('active');
            resolve(0);
        };

        xhr.open('POST', target);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.send(data);
    });
}

async function runSingle() {
    const id = document.getElementById('engineSelect').value;
    const engine = getEngine(id);
    document.getElementById('singleBtn').disabled = true;
    await diagnosis(engine.name, id);
    document.getElementById('singleBtn').disabled = false;
}

async function diagnosis(name, engineId) {
    curDown = 0; curUp = 0;
    document.getElementById('dispPing').innerText = "...";
    document.getElementById('currentStatus').innerHTML = `<i class="fas fa-satellite fa-pulse" style="color:var(--primary)"></i> 正在测速: ${name}`;
    updateDisp();
    
    const config = getEngine(engineId);
    
    const p = await measurePing(config.ping);
    document.getElementById('dispPing').innerText = p;
    
    const d = await measureDownload(config.down);
    const u = await measureUpload(config.up);
    
    document.getElementById('currentStatus').innerHTML = `<i class="fas fa-check-circle" style="color:var(--success)"></i> 测试完成`;
    
    history.unshift({ name, down: d, up: u, ping: p, time: new Date().toLocaleTimeString() });
    updateHist();
}

function updateHist() {
    const box = document.getElementById('historyList');
    if (history.length === 0) return;
    box.innerHTML = history.map(h => `
        <div class="h-item">
            <div class="h-info">
                <span class="h-name">${h.name}</span>
                <span class="h-time">${h.time}</span>
            </div>
            <div class="h-stats">
                <div class="h-stat-box">
                    <span class="h-stat-val" style="color:var(--text-main)">${conv(h.down)}</span>
                    <span class="h-stat-label">Down</span>
                </div>
                <div class="h-stat-box">
                    <span class="h-stat-val" style="color:var(--primary)">${conv(h.up)}</span>
                    <span class="h-stat-label">Up</span>
                </div>
                <div class="h-stat-box">
                    <span class="h-stat-val">${h.ping}</span>
                    <span class="h-stat-label">Ping</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Porn Mode Toggle Logic
function togglePornMode(enable) {
    const tabs = document.querySelectorAll('.tab');
    const adultTab = tabs[2];
    const otherTabs = [tabs[0], tabs[1]];
    const resBox = document.getElementById('customResult');
    
    if (enable) {
        // Unlock Porn Mode
        document.body.classList.add('porn-mode');
        
        // Change Header Title & Slogan
        document.querySelector('header h1').innerText = 'SECRET MODE';
        const slogan = document.querySelector('header p');
        if (!slogan.getAttribute('data-original')) slogan.setAttribute('data-original', slogan.innerText);
        slogan.innerText = '海量资源 · 极度色情 · 无法自拔';
        
        // Hide normal tabs, show adult tab
        otherTabs.forEach(t => t.style.display = 'none');
        adultTab.style.display = 'block';
        adultTab.click(); // Auto switch
        
        if (resBox) resBox.innerHTML = '<span style="color:#ff69b4; font-weight:bold; text-shadow: 0 0 10px #ff69b4;">Porn Mode Unlocked <br><small style="color:#ffb6c1">Submit to the Porn Idol...</small></span>';
        
        // Activate Theme Colors (Pink/Purple/Magenta)
        document.documentElement.style.setProperty('--primary', '#ff1493'); // DeepPink
        document.documentElement.style.setProperty('--text-main', '#fff0f5'); // LavenderBlush
        document.documentElement.style.setProperty('--bg-deep', '#2a002a'); 

        // Modify History Panel (Live Lust Stream)
        const historyPanel = document.querySelector('#historyList').parentElement;
        const historyTitle = historyPanel.querySelector('h2');
        const historyList = document.getElementById('historyList');
        
        if (!historyTitle.getAttribute('data-original')) historyTitle.setAttribute('data-original', historyTitle.innerHTML);
        if (!historyList.getAttribute('data-original')) historyList.setAttribute('data-original', historyList.innerHTML);
        
        historyTitle.innerHTML = '<i class="fas fa-globe"></i> 全球同好 (Global Lust Network)';
        historyList.innerHTML = `
            <div style="font-size:0.8rem; color:#ffb6c1; margin-bottom:10px; display:flex; justify-content:space-between;">
                <span><i class="fas fa-circle" style="color:#00ff00; font-size:0.6rem;"></i> <span id="pornOnlineCount">24,932</span> Online</span>
                <span>Activity Feed</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:10px; height:200px; overflow:hidden; position:relative;">
                <div id="fakeLogContainer" style="display:flex; flex-direction:column; gap:8px;">
                    <!-- JS populated logs -->
                </div>
                <div style="position:absolute; bottom:0; left:0; width:100%; height:40px; background:linear-gradient(to top, #2a002a, transparent);"></div>
            </div>
        `;
        
        // Start Fake Log Generation
        startFakeLogs();
        
        // Add a surprise button if not exists
        if (!document.getElementById('surpriseBtn')) {
            const sidePanel = document.querySelector('.side .panel');
            const surpriseBtn = document.createElement('button');
            surpriseBtn.id = 'surpriseBtn';
            surpriseBtn.className = 'btn-main';
            surpriseBtn.style.width = '100%';
            surpriseBtn.style.marginTop = '15px';
            surpriseBtn.style.background = 'linear-gradient(135deg, #ff1493, #9400d3)';
            surpriseBtn.innerHTML = '<i class="fas fa-venus-mars"></i> 随机浏览 (Lucky Roulette)';
            surpriseBtn.onclick = () => {
                const items = siteDB.adult[0].items;
                const randomItem = items[Math.floor(Math.random() * items.length)];
                window.open(randomItem.url, '_blank');
            };
            sidePanel.appendChild(surpriseBtn);
        }

        // Replace Speed Test Module with Adult Elements
        const speedPanel = document.querySelector('.speed-dashboard');
        if (speedPanel) {
            if (!speedPanel.getAttribute('data-original')) {
                speedPanel.setAttribute('data-original', speedPanel.innerHTML);
            }
            speedPanel.innerHTML = `
                <h2 style="color:#ff69b4"><i class="fas fa-heart"></i> Secret Zone</h2>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px;">
                        <button class="btn-main secret-btn" style="background:#ff1493;" onclick="window.open('https://www.pornhub.com/random', '_blank')"><i class="fas fa-random"></i> Random (随机爽片)</button>
                        <button class="btn-main secret-btn" style="background:#9400d3;" onclick="window.open('https://chaturbate.com', '_blank')"><i class="fas fa-video"></i> Live Cams (真人直播)</button>
                        <button class="btn-main secret-btn" style="background:#c71585;" onclick="window.open('https://nhentai.net/random/', '_blank')"><i class="fas fa-book"></i> Hentai (随机本子)</button>
                        <button class="btn-main secret-btn" style="background:#db7093;" onclick="window.open('https://www.reddit.com/r/nsfw/top/?t=day', '_blank')"><i class="fab fa-reddit"></i> Reddit Top (网民精选)</button>
                </div>

                <!-- Explicit Text Content (Replaced Fake Live Cams) -->
                <div class="whore-feed">
                    <h4 style="color:#ff69b4; margin-bottom:10px; font-size:0.85rem; text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; gap:8px;">
                        <i class="fas fa-fire" style="animation:pulse 1.5s infinite"></i> 
                        WHORE FEED
                    </h4>
                    <div style="display:flex; flex-direction:column; gap:8px; font-size:0.8rem;">
                        <div class="whore-item">
                            <span class="whore-title">[LIVE] 巨乳雌堕sissy被扶她邻居狂暴内射失禁喷射</span>
                            <span class="whore-meta">12.5k watching</span>
                        </div>
                        <div class="whore-item">
                            <span class="whore-title">[NEW] 扶她大屌无套操翻清纯JK </span>
                            <span class="whore-meta">Just Uploaded</span>
                        </div>
                        <div class="whore-item">
                            <span class="whore-title">[HOT] 淫荡母狗戴着项圈在公园露出求操</span>
                            <span class="whore-meta">98% Rated</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span class="whore-title">[VIRAL] 巨乳母狗公园露出陌生扶她轮奸录像流出</span>
                            <span class="whore-meta">Viral</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span class="whore-title">[LEAK] 女大学生被催眠调教成公共肉便器日记</span>
                            <span class="whore-meta">Viral</span>
                        </div>
                    </div>
                </div>
                
                <div class="trending-box">
                    <h4 class="trending-header">
                        <span><i class="fas fa-tags"></i> Trending Tags (热门标签)</span>
                        <span style="font-size:0.7rem; cursor:pointer;" onclick="togglePornMode(true)"><i class="fas fa-sync"></i> Refresh</span>
                    </h4>
                    <div class="trending-grid">
                        <!-- Popular -->
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=milf')">#MILF (熟女)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://hanime1.me/search?query=%E8%A3%8F%E7%95%AA')">#Hentai (里番)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=asian')">#Asian (亚洲)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/vr')">#VR (虚拟现实)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=cosplay')">#Cosplay (角色扮演)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=student')">#Student (学生)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=lesbian')">#Lesbian (女同)</span>
                        
                        <!-- Fetish / Hardcore -->
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=anal')">#Anal (肛交)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=public')">#Public (公共场所)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=bdsm')">#BDSM (调教)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=creampie')">#Creampie (内射)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=squirt')">#Squirt (潮吹)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=gangbang')">#Gangbang (群交)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=ahegao')">#Ahegao (阿黑颜)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=bukkake')">#Bukkake (颜射)</span>

                        <!-- Intersex / Futanari (Purple Theme) -->
                        <span class="adult-tag tag-purple" onclick="window.open('https://www.pornhub.com/video/search?search=futanari', '_blank')">#Futanari (扶她)</span>
                        <span class="adult-tag tag-purple" onclick="window.open('https://www.pornhub.com/video/search?search=futa+on+female', '_blank')">#FutaOnFemale (扶她攻女)</span>
                        <span class="adult-tag tag-purple" onclick="window.open('https://hanime1.me/search?query=%E6%89%B6%E5%A5%B9', '_blank')">#FutaOnMale (扶她攻男)</span>
                        <span class="adult-tag tag-purple" onclick="window.open('https://www.pornhub.com/video/search?search=futa+on+futa', '_blank')">#FutaOnFuta (双扶互插)</span>
                        <span class="adult-tag tag-purple" onclick="window.open('https://www.pornhub.com/video/search?search=big+penis+futanari', '_blank')">#BigDickFutanari (巨屌扶她)</span>
                        <span class="adult-tag tag-purple" onclick="window.open('https://www.pornhub.com/video/search?search=futanari+domination', '_blank')">#FutanariDom (扶她调教)</span>
                        <span class="adult-tag tag-purple" onclick="window.open('https://hanime1.me/search?query=%E6%89%B6%E5%A5%B9%E5%B7%A8%E4%B9%B3', '_blank')">#FutaBigBreasts (巨乳扶她)</span>
                        <span class="adult-tag tag-purple" onclick="window.open('https://www.pornhub.com/video/search?search=futanari+self+suck', '_blank')">#FutaSelfSuck (扶她自口)</span>

                        <span class="adult-tag tag-purple" onclick="window.open('https://www.pornhub.com/video/search?search=yuri', '_blank')">#Yuri (百合)</span>
                        
                        <!-- Sissy / Feminization (Pink/Purple) -->
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=feminization', '_blank')">#Feminization (娘化)</span>
                        <span class="adult-tag tag-purple" onclick="window.open('https://www.pornhub.com/video/search?search=sissy', '_blank')">#Sissy (雌堕)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=forced+feminization', '_blank')">#ForcedFem (强制雌堕)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://hanime1.me/search?query=%E9%9B%8C%E5%A0%95', '_blank')">#SissyTraining (雌堕调教)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=sissy+hypno', '_blank')">#SissyHypno (雌堕催眠)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=chastity', '_blank')">#Chastity (贞操锁)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=pegging', '_blank')">#Pegging (反攻)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://hanime1.me/search?query=%E9%9B%8C%E5%8C%96', '_blank')">#Sissyfication (彻底雌化)</span>

                        <span class="adult-tag tag-purple" onclick="window.open('https://www.pornhub.com/video/search?search=trap', '_blank')">#Trap (伪娘)</span>
                        <span class="adult-tag tag-purple" onclick="window.open('https://www.pornhub.com/video/search?search=femboy', '_blank')">#Femboy (男娘)</span>
                        <span class="adult-tag tag-purple" onclick="window.open('https://hanime1.me/search?query=%E7%94%B7%E5%A8%98', '_blank')">#Otokonoko (男の娘)</span>
                        <span class="adult-tag tag-purple" onclick="window.open('https://www.pornhub.com/video/search?search=trap+futanari', '_blank')">#TrapFutanari (带把伪娘)</span>
                        <span class="adult-tag tag-purple" onclick="window.open('https://www.pornhub.com/video/search?search=femboy+anal', '_blank')">#FemboyAnal (伪娘菊花)</span>
                        <span class="adult-tag tag-purple" onclick="window.open('https://hanime1.me/search?query=%E8%94%BD%E5%A8%98', '_blank')">#Crossdressing (女装)</span>
                        <span class="adult-tag tag-purple" onclick="window.open('https://www.pornhub.com/video/search?search=shemale')">#Shemale (人妖)</span>
                        <span class="adult-tag tag-purple" onclick="window.open('https://www.pornhub.com/video/search?search=dickgirl')">#Dickgirl (大丁丁妹)</span>
                        <span class="adult-tag tag-purple" onclick="window.open('https://www.pornhub.com/video/search?search=newhalf')">#Newhalf (人妖/半变性)</span>
                        <span class="adult-tag tag-purple" onclick="window.open('https://www.pornhub.com/video/search?search=hermaphrodite')">#Hermaphrodite (双性人)</span>

                        <!-- NTR / Cuckold (Dark Theme) -->
                        <span class="adult-tag tag-dark" onclick="window.open('https://www.pornhub.com/video/search?search=cuckold')">#Cuckold (淫妻/绿帽)</span>
                        <span class="adult-tag tag-dark" onclick="window.open('https://www.pornhub.com/video/search?search=hotwife')">#Hotwife (辣妻)</span>
                        <span class="adult-tag tag-dark" onclick="window.open('https://www.pornhub.com/video/search?search=netorare')">#NTR (被睡/寝取)</span>
                        <span class="adult-tag tag-dark" onclick="window.open('https://www.pornhub.com/video/search?search=netorase')">#Netorase (睡取)</span>
                        <span class="adult-tag tag-dark" onclick="window.open('https://www.pornhub.com/video/search?search=queen+of+spades')">#QueenOfSpades (黑桃皇后)</span>
                        <span class="adult-tag tag-dark" onclick="window.open('https://www.pornhub.com/video/search?search=femdom')">#Femdom (女S)</span>

                        <!-- Breasts (Pink Theme) -->
                        <span class="adult-tag tag-hot" onclick="window.open('https://www.pornhub.com/video/search?search=big+tits')">#BigTits (巨乳)</span>
                        <span class="adult-tag tag-hot" onclick="window.open('https://www.pornhub.com/video/search?search=huge+boobs')">#HugeBoobs (爆乳)</span>
                        <span class="adult-tag tag-hot" onclick="window.open('https://www.pornhub.com/video/search?search=titty+fuck')">#TittyFuck (乳交/Paizuri)</span>
                        <span class="adult-tag tag-hot" onclick="window.open('https://www.pornhub.com/video/search?search=saggy+tits')">#SaggyTits (下垂/熟女乳)</span>
                        <span class="adult-tag tag-hot" onclick="window.open('https://www.pornhub.com/video/search?search=nipple+play')">#NipplePlay (乳头玩法)</span>

                        <!-- Lesbian & Active (女同/主动) -->
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=tribbing')">#Tribbing (磨豆腐)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=scissoring')">#Scissoring (磨穴)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=strap+on')">#StrapOn (穿戴式/假屌)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=cowgirl')">#Cowgirl (女上位/骑乘)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=reverse+cowgirl')">#ReverseCowgirl (反向骑乘)</span>
                        <span class="adult-tag tag-pink" onclick="window.open('https://www.pornhub.com/video/search?search=facesitting')">#Facesitting (坐脸)</span>

                        <!-- Slutty & Submission (淫乱/自愿) -->
                        <span class="adult-tag tag-red" onclick="window.open('https://www.pornhub.com/video/search?search=slut')">#Slut (荡妇)</span>
                        <span class="adult-tag tag-red" onclick="window.open('https://www.pornhub.com/video/search?search=nympho')">#Nympho (色情狂)</span>
                        <span class="adult-tag tag-red" onclick="window.open('https://www.pornhub.com/video/search?search=cum+dump')">#CumDump (精液便器)</span>
                        <span class="adult-tag tag-red" onclick="window.open('https://www.pornhub.com/video/search?search=submission')">#Submission (顺从/自愿)</span>
                        <span class="adult-tag tag-red" onclick="window.open('https://www.pornhub.com/video/search?search=slave')">#Slave (性奴)</span>
                        <span class="adult-tag tag-red" onclick="window.open('https://www.pornhub.com/video/search?search=training')">#Training (调教)</span>
                        <span class="adult-tag tag-red" onclick="window.open('https://www.pornhub.com/video/search?search=public+disgrace')">#PublicDisgrace (公开羞辱)</span>
                        <span class="adult-tag tag-red" onclick="window.open('https://www.pornhub.com/video/search?search=double+penetration')">#DoublePenetration (双龙入洞)</span>
                    </div>
                </div>

                <div style="margin-top:20px; text-align:center; opacity:0.8;">
                        <!-- Futanari Symbol (Ref: favicon.svg) -->
                        <svg width="80" height="80" viewBox="0 0 64 64" fill="none" style="animation: pulse 2s infinite;">
                            <defs>
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="1" result="blur"/>
                                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                                </filter>
                            </defs>
                            
                            <!-- Aesthetic Futa Symbol (Stylized Venus + Mars) - Pale Purple -->
                            <g stroke="#e0c3fc" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)">
                                <!-- Central Ring (Venus Body) -->
                                <circle cx="32" cy="32" r="9"/>
                                
                                <!-- Venus Cross (Bottom) -->
                                <path d="M32 41 L32 60"/>
                                <path d="M28 46 L36 46"/>

                                <!-- Mars Arrow (Top Right) -->
                                <path d="M38.5 25.5 L44 20"/>
                                <path d="M44 20 L44 25"/>
                                <path d="M44 20 L39 20"/>

                                <!-- Mars Arrow 2 / Trans Element (Top-Left) -->
                                <path d="M25.5 25.5 L20 20"/>
                                <path d="M20 20 L20 25"/>
                                <path d="M20 20 L25 20"/>
                                <path d="M21 26 L26 21"/>
                            </g>

                            <!-- Heart in Center (No H) -->
                            <g transform="translate(32, 32)">
                                <!-- Heart Symbol (Pink, Enlarged to 1.3) -->
                                <path d="M 0 1.5 C -1.5 -1.5 -3.5 -0.5 -3.5 1.5 C -3.5 3.5 0 6 0 6 C 0 6 3.5 3.5 3.5 1.5 C 3.5 -0.5 1.5 -1.5 0 1.5 Z" fill="#ff69b4" stroke="none" transform="translate(0, -3) scale(1.3)"/>
                            </g>
                        </svg>
                        <p style="color:#ffb6c1; font-size:0.9rem; margin-top:10px; font-weight:bold; letter-spacing:1px;">FUTANARI & INTERSEX PARADISE</p>
                </div>
            `;
        }
        
        // Show Boss Key
        showBossKey(true);

    } else {
        // Lock Porn Mode
        document.body.classList.remove('porn-mode');
        
        // Revert Header Title
        document.querySelector('header h1').innerText = 'Network Tester';
        const slogan = document.querySelector('header p');
        if (slogan.getAttribute('data-original')) slogan.innerText = slogan.getAttribute('data-original');
        
        // Revert History Panel
        const historyPanel = document.querySelector('#historyList').parentElement;
        const historyTitle = historyPanel.querySelector('h2');
        const historyList = document.getElementById('historyList');
        if (historyTitle.getAttribute('data-original')) historyTitle.innerHTML = historyTitle.getAttribute('data-original');
        if (historyList.getAttribute('data-original')) historyList.innerHTML = historyList.getAttribute('data-original');

        // Show normal tabs, hide adult tab
        otherTabs.forEach(t => t.style.display = 'block');
        document.querySelector('.tab[data-action="switchRegion"][data-mode="domestic"]').click(); // Switch back to domestic
        
        adultTab.style.display = 'none';
        if (resBox) resBox.innerHTML = '<span style="color:var(--text-dim)">就这？</span>';
        
        // Restore Theme
        document.documentElement.style.removeProperty('--primary');
        document.documentElement.style.removeProperty('--text-main');
        document.documentElement.style.removeProperty('--bg-deep');
        
        const sBtn = document.getElementById('surpriseBtn');
        if(sBtn) sBtn.remove();
        
        const dash = document.getElementById('adultDashboard');
        if (dash) dash.style.display = 'none';

        // Clear Fake Log Interval
        if (window.fakeLogInterval) {
            clearInterval(window.fakeLogInterval);
            window.fakeLogInterval = null;
        }

        // Restore Speed Test Module
        const speedPanel = document.querySelector('.speed-dashboard');
        if (speedPanel && speedPanel.getAttribute('data-original')) {
            speedPanel.innerHTML = speedPanel.getAttribute('data-original');
            
            // Re-populate engine select
            const select = document.getElementById('engineSelect');
            if (select) {
                engineList.forEach(eng => {
                    const opt = document.createElement('option');
                    opt.value = eng.id;
                    opt.innerText = eng.name;
                    select.appendChild(opt);
                });
                // Reset default
                changeUnit('MBps');
            }
        }
        
        // Hide Boss Key
        showBossKey(false);
    }
}

function startFakeLogs() {
    if (window.fakeLogInterval) return;
    
    const actions = ['is watching', 'is searching for', 'just came to', 'bookmarked', 'rated 5 stars', 'shared', 'uploaded', 'is streaming', 'requested'];
    const contents = [
        'Step-mom stuck in washing machine', 'Japanese Bukkake Party', 'Ebony Teen First Time', 'Hentai Tentacle Rape', 
        'Public Flashing in Subway', 'Amateur Couple Home Video', 'Massage Happy Ending', 'Schoolgirl Uniform',
        'Futanari Giantess', 'Yuri Scissoring', 'Sissy Hypno Training', 'Cuckold Cleaning', 'Trap Gangbang', 
        'Femboy Maid Service', 'Milf Teaching Son', 'Bondage & Discipline', 'Anal Gape', 'Creampie Compilation',
        'Deepthroat Challenge', 'Squirt Fest', 'Group Sex Orgy', 'Lesbian Strapon', 'Shemale Fuck', 'Glory Hole Surprise',
        'Latex Gimp Suit', 'Piss Drinking', 'Feet Worship', 'Nylon Stockings Job', 'NTR Blacked', 'Incest Family Dinner',
        'Public Exhibitionism', 'Sleeping Sister', 'Chloroform Kidnap', 'Gangbang Bus', 'Nurse Examination',
        'Futa Fucks Trap', 'Sissy Hypno Complete',' Solo Cumshot','Trap Double Penetration','Chastity Sissy Orgasm','Futa x Futa 69'
    ];
    const users = [
        'Guest_9527', 'Tokyo_User', 'NY_Lover', 'BigD**k_69', 'Lonely_Boy', 'Master_X', 
        'Hentai_King', 'Sissy_Slave', 'Alpha_Male', 'Cuck_Lover', 'Yuri_Fan', 'Trap_Queen',
        'Horny_Teen', 'Milf_Hunter', 'Anal_Destroyer', 'Cum_Dumpster', 'Pussy_Slayer', 'Dick_Rider',
        'Foot_Licker', 'Piss_Drinker', 'Latex_Lover', 'Bondage_Master', 'NTR_Victim', 'Incest_Bro'
    ];
    
    const addLog = () => {
        const container = document.getElementById('fakeLogContainer');
        const countEl = document.getElementById('pornOnlineCount');
        
        if (!container) return;
        
        // Fluctuate Online Count Logic: Increase by 6~9 OR Decrease by 4
        if (countEl) {
            let current = parseInt(countEl.innerText.replace(/,/g, '')) || 24932;
            if (Math.random() > 0.4) {
                // Increase by 6~9
                current += (Math.floor(Math.random() * 4) + 6);
            } else {
                // Decrease by 4
                current -= 4;
            }
            countEl.innerText = current.toLocaleString();
        }
        
        const user = users[Math.floor(Math.random() * users.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const content = contents[Math.floor(Math.random() * contents.length)];
        const ip = Math.floor(Math.random()*255) + '.' + Math.floor(Math.random()*255) + '.x.x';
        
        const div = document.createElement('div');
        div.style.cssText = 'font-size:0.8rem; color:var(--text-dim); border-bottom:1px solid rgba(255,105,180,0.1); padding-bottom:4px; transition:0.3s; opacity:0; transform:translateX(-10px);';
        div.innerHTML = `<span style="color:#ff69b4;">[${ip}]</span> <b>${user}</b> ${action} <span style="color:#fff;">${content}</span>`;
        
        container.prepend(div);
        // Animation
        setTimeout(() => { div.style.opacity = 1; div.style.transform = 'translateX(0)'; }, 50);
        
        if (container.children.length > 8) container.lastChild.remove();
    };
    
    addLog(); addLog(); addLog(); // Initial population
    window.fakeLogInterval = setInterval(addLog, 1500);
}

function showBossKey(show) {
    let btn = document.getElementById('bossKeyBtn');
    if (show) {
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'bossKeyBtn';
            btn.innerHTML = '<i class="fas fa-user-tie"></i> BOSS KEY (ESC)';
            btn.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:9999; padding:15px 30px; background:#dc3545; color:white; font-weight:bold; border:none; border-radius:50px; box-shadow:0 5px 20px rgba(0,0,0,0.5); cursor:pointer; font-size:1rem; transition:0.3s;';
            btn.onclick = () => togglePornMode(false);
            btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
            btn.onmouseout = () => btn.style.transform = 'scale(1)';
            document.body.appendChild(btn);
            
            // Add keyboard listener
            window.addEventListener('keydown', bossKeyHandler);
        }
    } else {
        if (btn) btn.remove();
        window.removeEventListener('keydown', bossKeyHandler);
    }
}

function bossKeyHandler(e) {
    if (e.key === 'Escape') {
        togglePornMode(false);
    }
}

// Custom Ping
async function runCustomPing() {
    let input = document.getElementById('customTarget').value.trim();
    const resBox = document.getElementById('customResult');
    const btn = document.getElementById('customPingBtn');
    
    if(!input) return;

    // Adult content unlock trigger
    if (input.toLowerCase() === 'porn') {
        const tabs = document.querySelectorAll('.tab');
        const adultTab = tabs[2];
        if (!adultTab) return;
        const isHidden = adultTab.style.display === 'none';
        
        if (isHidden) {
            togglePornMode(true);
        } else {
            togglePornMode(false);
        }
        return;
    }

    // UI Feedback
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
    resBox.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 测试中...';
    
    // Smart Protocol Handling
    let url = input;
    const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(input);
    
    if (!/^https?:\/\//i.test(url)) {
        if (isIP) {
            url = 'http://' + input; 
        } else {
            url = 'https://' + input; 
        }
    }

    // Helper to ping once
    const doPing = async (targetUrl) => {
        const start = performance.now();
        try {
            const ctrl = new AbortController();
            const id = setTimeout(() => ctrl.abort(), 3000); // 3s timeout
            await fetch(targetUrl, { 
                mode: 'no-cors', 
                cache: 'no-store', 
                signal: ctrl.signal,
                credentials: 'omit'
            });
            clearTimeout(id);
            return performance.now() - start;
        } catch (e) {
            if (targetUrl.startsWith('https://') && !input.startsWith('http')) {
                throw new Error('RETRY_HTTP');
            }
            throw e;
        }
    };

    try {
        let success = 0;
        let fail = 0;
        
        // Warmup / Protocol Check
        try {
            await doPing(url);
        } catch (e) {
            if (e.message === 'RETRY_HTTP') {
                url = 'http://' + input;
                try { await doPing(url); } catch(e2) { /* Ignore warmup fail */ }
            }
        }

        const promises = [];
        for(let i=0; i<3; i++) {
            promises.push(doPing(url).then(ms => ({ status: 'ok', ms })).catch(e => ({ status: 'error', error: e })));
        }

        const results = await Promise.all(promises);
        const samples = [];
        
        results.forEach(r => {
            if(r.status === 'ok') {
                samples.push(r.ms);
                success++;
            } else {
                fail++;
            }
        });

        if (success === 0) {
             resBox.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <span style="color:var(--error)"><i class="fas fa-exclamation-triangle"></i> 连接失败 (100% 丢包)</span>
                    <span style="font-size:0.8rem; color:var(--text-dim)">可能原因: 地址错误 / 目标禁止Ping / 跨域限制(CORS)</span>
                    <button style="padding:8px; font-size:0.85rem; width:100px; align-self:center; background:transparent; border:1px solid var(--border); color:var(--text-dim);" onclick="runCustomPing()"><i class="fas fa-redo"></i> 重试</button>
                </div>`;
             return;
        }

        const avg = samples.reduce((a,b)=>a+b, 0) / samples.length;
        const loss = (fail / 3) * 100;
        const colorClass = avg < 150 ? 'ping-low' : avg < 400 ? 'ping-mid' : 'ping-high';
        
        resBox.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; flex-direction:column;">
                    <span style="font-weight:bold; color:var(--text-main);">${input}</span>
                    <span style="font-size:0.75rem; color:var(--text-dim);">${url}</span>
                </div>
                <span class="ping-badge ${colorClass}">${avg.toFixed(1)} ms</span>
            </div>
            <div style="font-size:0.8rem; color:var(--text-dim); margin-top:5px;">
                丢包: ${loss.toFixed(0)}% | 抖动: ${(Math.max(...samples)-Math.min(...samples)).toFixed(1)}ms
            </div>
        `;

    } catch (e) {
        resBox.innerHTML = `
            <div style="color:var(--error); display:flex; flex-direction:column; gap:10px;">
                <span><i class="fas fa-times-circle"></i> 测试出错: ${e.message}</span>
                <button style="padding:8px; font-size:0.85rem; width:100px; align-self:center; background:transparent; border:1px solid var(--border); color:var(--text-dim);" onclick="runCustomPing()"><i class="fas fa-redo"></i> 重试</button>
            </div>
        `;
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i>';
    }
}

init();

// data-action registrations (replaces inline onclick=/oninput=/onchange=)
if (window.app && app.action) {
    app.action('switchRegion', function (el) { switchRegion(el.dataset.mode, el); });
    app.action('filterSites', function () { filterSites(); });
    app.action('pingAll', function () { pingAll(); });
    app.action('changeUnit', function (el) { changeUnit(el.dataset.mode); });
    app.action('updateEngineInfo', function () { updateEngineInfo(); });
    app.action('runSingle', function () { runSingle(); });
    app.action('openCloudflareSpeedtest', function () { openCloudflareSpeedtest(); });
    app.action('closeCloudflareSpeedtest', function (el, evt) {
        if (evt.target === el) closeCloudflareSpeedtest();
    });
}

