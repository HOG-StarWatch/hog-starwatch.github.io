/**
 * Web Worker for Image to SVG Tracing
 * Uses ImageTracerJS to convert raster images to SVG vector paths.
 */

// Polyfill window for ImageTracerJS
self.window = self;

importScripts('../loader.js');
const ready = ResourceLoader.load('imagetracerjs');

self.onmessage = async function(e) {
    const { id, imageData, options } = e.data;

    if (!id || !imageData) return;

    try {
        await ready;
        // Ensure options has viewbox enabled if not set, for better responsiveness
        // But respect user's choice if passed.
        // options.viewbox = true; // This is usually handled in main thread options preparation

        // ImageTracer.imagedataToSVG( imgd, options )
        const svgstr = ImageTracer.imagedataToSVG(imageData, options);

        self.postMessage({
            id: id,
            status: 'success',
            svgContent: svgstr
        });

    } catch (error) {
        self.postMessage({
            id: id,
            status: 'error',
            error: error.message || 'Unknown error during SVG tracing'
        });
    }
};
