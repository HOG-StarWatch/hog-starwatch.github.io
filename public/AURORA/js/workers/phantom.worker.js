self.onmessage = function(e) {
    const { type, dataFront, dataBack, config } = e.data;

    if (type === 'process') {
        try {
            const w = config.width;
            const h = config.height;
            const contrast = config.contrast;
            const brightness = config.brightness;
            
            // Output buffer
            const outputData = new Uint8ClampedArray(w * h * 4);
            
            const split = 128 + brightness;
            
            for (let i = 0; i < w * h * 4; i += 4) {
                // Grayscale
                const rA = dataFront[i], gA = dataFront[i+1], bA = dataFront[i+2];
                const rB = dataBack[i], gB = dataBack[i+1], bB = dataBack[i+2];
                
                const grayA = 0.299 * rA + 0.587 * gA + 0.114 * bA;
                const grayB = 0.299 * rB + 0.587 * gB + 0.114 * bB;

                const A_new = (grayA / 255.0) * (255 - split) + split;
                const B_new = (grayB / 255.0) * split;
                
                let alpha = 255 - (A_new - B_new);
                
                let gray;
                if (alpha === 0) {
                    gray = 0;
                } else {
                    gray = (B_new * 255) / alpha;
                }
                
                outputData[i] = gray;
                outputData[i+1] = gray;
                outputData[i+2] = gray;
                outputData[i+3] = alpha;
            }
            
            self.postMessage({ type: 'complete', outputData: outputData }, [outputData.buffer]);
        } catch (error) {
            self.postMessage({ type: 'error', error: error.message });
        }
    }
};
