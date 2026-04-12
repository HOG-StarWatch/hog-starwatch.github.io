self.onmessage = function(e) {
    const { type, dN, dNB, dFB, config } = e.data;

    if (type === 'process') {
        try {
            const rangeBalValue = config.rangeBalValue;
            const isGray = config.isGray;

            const dNData = new Uint8ClampedArray(dN);
            const dNBData = new Uint8ClampedArray(dNB);
            const dFBData = new Uint8ClampedArray(dFB);
            const length = dNData.length;

            const outputData = new Uint8ClampedArray(length);

            for (let i = 0; i < length; i += 4) {
                if (isGray) {
                    const lN = 0.299 * dNData[i] + 0.587 * dNData[i + 1] + 0.114 * dNData[i + 2];
                    const lNB = 0.299 * dNBData[i] + 0.587 * dNBData[i + 1] + 0.114 * dNBData[i + 2];
                    const lFB = 0.299 * dFBData[i] + 0.587 * dFBData[i + 1] + 0.114 * dFBData[i + 2];

                    const highFreq = lN - lNB;
                    const lowFreq = lFB;

                    const hStrength = rangeBalValue * 3.0;
                    let val = lowFreq + highFreq * hStrength;
                    val = Math.min(255, Math.max(0, val));

                    outputData[i] = val;
                    outputData[i + 1] = val;
                    outputData[i + 2] = val;
                    outputData[i + 3] = 255;
                } else {
                    for (let c = 0; c < 3; c++) {
                        const highFreq = dNData[i + c] - dNBData[i + c];
                        const lowFreq = dFBData[i + c];

                        const hStrength = rangeBalValue * 3.0;
                        let val = lowFreq + highFreq * hStrength;

                        outputData[i + c] = Math.min(255, Math.max(0, val));
                    }
                    outputData[i + 3] = 255;
                }
            }

            self.postMessage({ type: 'complete', outputData: outputData.buffer }, [outputData.buffer]);
        } catch (error) {
            self.postMessage({ type: 'error', error: error.message });
        }
    }
};