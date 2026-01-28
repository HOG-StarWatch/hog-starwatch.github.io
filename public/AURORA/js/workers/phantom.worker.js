self.onmessage = function(e) {
    const { cmd, imgFront, imgBack, width, height, alphaBoost } = e.data;

    if (cmd === 'process') {
        try {
            const d1 = new Uint8ClampedArray(imgFront);
            const d2 = new Uint8ClampedArray(imgBack);
            const outputData = new Uint8ClampedArray(width * height * 4);

            for(let i=0; i<d1.length; i+=4) {
                // Gray conversion
                const g1 = 0.299*d1[i] + 0.587*d1[i+1] + 0.114*d1[i+2];
                const g2 = 0.299*d2[i] + 0.587*d2[i+1] + 0.114*d2[i+2];
                
                // Formula: Alpha = 255 - (g1 - g2)
                let a = 255 - (g1 - g2);
                if (a < 0) a = 0;
                if (a > 255) a = 255;
                
                // C_a = g2 / alpha (approx)
                let gray = 0;
                if (a > 0) gray = 255 * g2 / a;
                if (gray > 255) gray = 255;

                outputData[i] = gray;
                outputData[i+1] = gray;
                outputData[i+2] = gray;
                outputData[i+3] = a * alphaBoost; // Apply boost
            }
            
            self.postMessage({ type: 'success', outputData: outputData.buffer }, [outputData.buffer]);
        } catch (error) {
            self.postMessage({ type: 'error', error: error.message });
        }
    }
};