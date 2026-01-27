self.onmessage = function(e) {
    const { type, dN, dNB, dFB, config } = e.data;

    if (type === 'process') {
        try {
            const rangeBalValue = config.rangeBalValue;
            const isGray = config.isGray;
            const length = dN.length;
            
            // Output buffer
            const outputData = new Uint8ClampedArray(length);
            
            for (let i = 0; i < length; i += 4) {
                if (isGray) {
                     const lN = 0.299*dN[i] + 0.587*dN[i+1] + 0.114*dN[i+2];
                     const lNB = 0.299*dNB[i] + 0.587*dNB[i+1] + 0.114*dNB[i+2];
                     const lFB = 0.299*dFB[i] + 0.587*dFB[i+1] + 0.114*dFB[i+2];
                     
                     const highFreq = lN - lNB;
                     const lowFreq = lFB;
                     
                     const hStrength = rangeBalValue * 3.0; 
                     let val = lowFreq + highFreq * hStrength;
                     val = Math.min(255, Math.max(0, val));
                     
                     outputData[i] = val;
                     outputData[i+1] = val;
                     outputData[i+2] = val;
                     outputData[i+3] = 255; // Alpha
                } else {
                    for (let c = 0; c < 3; c++) {
                        const highFreq = dN[i+c] - dNB[i+c];
                        const lowFreq = dFB[i+c];
                        
                        const hStrength = rangeBalValue * 3.0; 
                        let val = lowFreq + highFreq * hStrength;
                        
                        outputData[i+c] = Math.min(255, Math.max(0, val));
                    }
                     outputData[i+3] = 255;
                }
            }
            
            self.postMessage({ type: 'complete', outputData: outputData }, [outputData.buffer]);
        } catch (error) {
            self.postMessage({ type: 'error', error: error.message });
        }
    }
};
