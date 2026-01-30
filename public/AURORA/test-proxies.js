
const PROXIES = [
    { name: "AllOrigins", url: "https://api.allorigins.win/get?url=" },
    { name: "CorsProxy.io", url: "https://corsproxy.io/?" },
    { name: "CodeTabs", url: "https://api.codetabs.com/v1/proxy?quest=" },
    { name: "CorsAnywhere", url: "https://cors-anywhere.herokuapp.com/" },
    { name: "Cors.sh", url: "https://proxy.cors.sh/" },
    { name: "ThingProxy", url: "https://thingproxy.freeboard.io/fetch/" },
    { name: "YaCDN", url: "https://yacdn.org/proxy/" },
    { name: "CorsProxy.com", url: "https://www.cors-proxy.com/" },
    { name: "CrossOrigin.me", url: "https://crossorigin.me/" }
];

const EPIC_API_URL = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=zh";

async function testProxy(proxy) {
    const apiUrl = proxy.url.includes("allorigins") || proxy.url.includes("corsproxy") || proxy.url.includes("codetabs")
        ? `${proxy.url}${encodeURIComponent(EPIC_API_URL)}`
        : `${proxy.url}${EPIC_API_URL}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const start = Date.now();
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        let data;
        if (proxy.url.includes("allorigins")) {
            const result = await response.json();
            data = JSON.parse(result.contents);
        } else if (proxy.url.includes("corsproxy")) {
             // corsproxy.io usually returns raw content now, but let's check content type or just try json
            const text = await response.text();
             try {
                 data = JSON.parse(text);
             } catch(e) {
                 // maybe it is wrapped?
                 data = text; 
             }
        } else {
            data = await response.json();
        }
        
        // Basic validation
        if (data && data.data && data.data.Catalog) {
             console.log(`✅ ${proxy.name}: Success (${Date.now() - start}ms)`);
             return true;
        } else {
             console.log(`❌ ${proxy.name}: Invalid Data`);
             return false;
        }

    } catch (error) {
        console.log(`❌ ${proxy.name}: ${error.message}`);
        return false;
    }
}

async function run() {
    console.log("Testing Proxies...");
    const results = await Promise.all(PROXIES.map(testProxy));
    console.log("Done.");
}

run();
