
(function() {
    console.log("%c[CheatInjector] Starting Dynamic Scanner...", "color: #a78bfa; font-weight: bold;");

    const isVector2 = (o) => o && typeof o === 'object' && Object.keys(o).length >= 2 && 'x' in o && 'y' in o; 
    const isVector2Struct = (o) => {
        if (!o || typeof o !== 'object') return false;
        const keys = Object.keys(o);
        const numKeys = keys.filter(k => typeof o[k] === 'number');
        return numKeys.length >= 2;
    };

    const arrays = [];
    const objects = [];
    for (let k in window) {
        try {
            const v = window[k];
            if (Array.isArray(v)) arrays.push({key: k, val: v});
            else if (v && typeof v === 'object' && !v.tagName) objects.push({key: k, val: v});
            else if (v instanceof HTMLElement && v.tagName === 'CANVAS') window.mainCanvas = v;
        } catch(e) {}
    }

    let playerInstance = null;
    let playersArrayFound = null;

    for (let a of arrays) {
        if (a.val.length > 0 && a.val.length < 10) {
            const p = a.val[0];
            if (!p || typeof p !== 'object') continue;

            let vec2Count = 0;
            let possibleVector2Ctor = null;

            for (let prop in p) {
                const val = p[prop];
                if (val && typeof val === 'object') {
                    const keys = Object.keys(val);
                    const numVals = keys.filter(k => typeof val[k] === 'number');
                    if (numVals.length === 2 && keys.length === 2) {
                        vec2Count++;
                        possibleVector2Ctor = val.constructor;
                    }
                }
            }

            if (vec2Count >= 2) {
                window.players = a.val;
                window.Player = p.constructor;
                playerInstance = p;
                playersArrayFound = a.val;
                if (possibleVector2Ctor) window.Vector2 = possibleVector2Ctor;
                console.log("[CheatInjector] Found 'players' -> window." + a.key);
                break;
            }
        }
    }

    if (!playerInstance) {
        console.warn("[CheatInjector] Could not find 'players' array. Cheats may fail.");
    }

    if (playerInstance) {
        for (let a of arrays) {
            if (a.val !== playersArrayFound && a.val.includes(playerInstance)) {
                window.engineObjects = a.val;
                console.log("[CheatInjector] Found 'engineObjects' -> window." + a.key);
                break;
            }
        }
    }

    if (window.engineObjects && playerInstance) {
        const playerKeys = Object.keys(playerInstance);
        
        for (let o of window.engineObjects) {
            if (!o || o === playerInstance) continue;

            const ctor = o.constructor;
            if (ctor === window.Player) continue;

            const oKeys = Object.keys(o);
            const sharedKeys = oKeys.filter(k => playerKeys.includes(k));
            const similarity = sharedKeys.length / Math.max(playerKeys.length, oKeys.length);
            
            if (similarity > 0.85) {
                if (!window.Enemy) {
                    window.Enemy = ctor;
                    console.log("[CheatInjector] Found 'Enemy' class -> " + ctor.name);
                }
            } else if (similarity > 0.3 && similarity < 0.8) {

                if (!window.Prop) {
                    window.Prop = ctor;
                    console.log("[CheatInjector] Found 'Prop' class -> " + ctor.name);
                }
            }
            
            let isParticleEmitter = false;
            for (let k in o) {
                if (k === 'emitRate' || k === 'emitTime') {
                    isParticleEmitter = true;
                    break;
                }

            }

            if (isParticleEmitter || (oKeys.length > 20 && !window.ParticleEmitter && similarity < 0.5)) {
            }
        }
    }

    for (let o of objects) {
        const v = o.val;
        let hasCanvas = false;
        for (let k in v) {
            if (v[k] instanceof HTMLCanvasElement && v[k] !== window.mainCanvas) {
                hasCanvas = true;
                break;
            }
        }

        let funcCount = 0;
        for (let k in v) { if (typeof v[k] === 'function') funcCount++; }

        if (hasCanvas && funcCount > 2) {
            window.tileLayer = v;
            console.log("[CheatInjector] Found 'tileLayer' -> window." + o.key);
            break;
        }
    }

    console.log("[CheatInjector] Scanner Complete.");
})();