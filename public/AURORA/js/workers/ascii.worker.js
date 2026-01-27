/**
 * Web Worker for ASCII Art Generation
 * Handles pixel-to-character mapping off the main thread.
 */

self.onmessage = function(e) {
    const { type, imageData, config } = e.data;

    if (type === 'process') {
        try {
            const width = imageData.width;
            const height = imageData.height;
            const data = imageData.data; // Uint8ClampedArray
            const chars = config.chars;
            const isColor = config.isColor;
            
            let htmlOutput = '';
            let rawText = '';
            
            // Chunk processing to avoid huge string concatenation memory spikes?
            // Actually, for typical ASCII sizes (e.g. 100-300 chars wide), strings are manageable.
            
            for (let y = 0; y < height; y++) {
                let lineHtml = '';
                let lineText = '';
                
                for (let x = 0; x < width; x++) {
                    const offset = (y * width + x) * 4;
                    const r = data[offset];
                    const g = data[offset + 1];
                    const b = data[offset + 2];
                    const a = data[offset + 3]; // Alpha could be used for transparency?

                    // Simple luminance
                    const avg = (r + g + b) / 3;
                    
                    const charIndex = Math.floor((avg / 255) * (chars.length - 1));
                    const char = chars[charIndex];
                    
                    let displayChar = char;
                    if (isColor) {
                        if (char === '<') displayChar = '&lt;';
                        else if (char === '>') displayChar = '&gt;';
                        else if (char === '&') displayChar = '&amp;';
                        else if (char === ' ') displayChar = '&nbsp;';
                    }
                    
                    if (isColor) {
                        lineHtml += `<span style="color: rgb(${r},${g},${b})">${displayChar}</span>`;
                    } else {
                        lineHtml += displayChar;
                    }
                    lineText += char;
                }
                htmlOutput += lineHtml + (isColor ? '<br>' : '\n');
                rawText += lineText + '\n';
            }

            self.postMessage({ 
                type: 'complete', 
                html: htmlOutput, 
                text: rawText 
            });

        } catch (error) {
            self.postMessage({ type: 'error', error: error.message });
        }
    }
};
