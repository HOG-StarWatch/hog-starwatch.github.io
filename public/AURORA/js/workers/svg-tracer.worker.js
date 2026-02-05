/**
 * Web Worker for Image to SVG Tracing
 * Uses ImageTracerJS to convert raster images to SVG vector paths.
 */

// Polyfill window for ImageTracerJS
self.window = self;

// Load ImageTracerJS
importScripts('https://unpkg.com/imagetracerjs@1.2.6/imagetracer_v1.2.6.js');

self.onmessage = function(e) {
    const { id, imageData, options } = e.data;

    if (!id || !imageData) return;

    try {
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
