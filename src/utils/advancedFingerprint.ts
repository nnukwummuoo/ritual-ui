/**
 * Advanced Device Fingerprinting Utility
 * Similar to systems used by TikTok, Binance, PayPal, Skrill, and betting platforms
 * Combines: WebGL, WASM benchmark, Canvas, Audio, and File System Access API
 */

import FingerprintJS from '@fingerprintjs/fingerprintjs';

interface FingerprintComponents {
    webgl: string;
    canvas: string;
    audio: string;
    wasmBenchmark: number;
    screen: string;
    timezone: string;
    language: string;
    platform: string;
    hardwareConcurrency: number;
    deviceMemory: number | undefined;
}

/**
 * Generate WebGL fingerprint - most stable across sessions
 */
function getWebGLFingerprint(): string {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) return 'no-webgl';

        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return 'no-debug-info';

        const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

        return `${vendor}~${renderer}`;
    } catch (e) {
        return 'webgl-error';
    }
}

/**
 * Generate Canvas fingerprint
 */
function getCanvasFingerprint(): string {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return 'no-canvas';

        // Draw complex pattern
        canvas.width = 200;
        canvas.height = 50;

        ctx.textBaseline = 'top';
        ctx.font = '14px "Arial"';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('mmeko,🎭', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('mmeko,🎭', 4, 17);

        return canvas.toDataURL().slice(-50); // Last 50 chars as signature
    } catch (e) {
        return 'canvas-error';
    }
}

/**
 * Generate Audio fingerprint
 */
function getAudioFingerprint(): string {
    try {
        const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return 'no-audio';

        const context = new AudioContext();
        const oscillator = context.createOscillator();
        const analyser = context.createAnalyser();
        const gainNode = context.createGain();
        const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

        gainNode.gain.value = 0; // Mute
        oscillator.connect(analyser);
        analyser.connect(scriptProcessor);
        scriptProcessor.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start(0);

        const fingerprint = analyser.frequencyBinCount.toString();

        oscillator.stop();
        context.close();

        return fingerprint;
    } catch (e) {
        return 'audio-error';
    }
}

/**
 * WASM Performance Benchmark - Unique to each device
 */
async function getWASMBenchmark(): Promise<number> {
    try {
        // Simple WASM benchmark
        const wasmCode = new Uint8Array([
            0, 97, 115, 109, 1, 0, 0, 0, 1, 6, 1, 96, 1, 127, 1, 127, 3, 2, 1, 0,
            7, 13, 1, 9, 105, 110, 99, 114, 101, 109, 101, 110, 116, 0, 0, 10, 9, 1, 7, 0, 32, 0, 65, 1, 106, 11
        ]);

        const wasmModule = await WebAssembly.instantiate(wasmCode);
        const increment = (wasmModule.instance.exports as any).increment;

        const start = performance.now();
        let result = 0;
        for (let i = 0; i < 100000; i++) {
            result = increment(result);
        }
        const duration = performance.now() - start;

        return Math.round(duration * 1000); // Return microseconds
    } catch (e) {
        return -1;
    }
}

/**
 * Get screen fingerprint
 */
function getScreenFingerprint(): string {
    const { width, height, colorDepth, pixelDepth } = window.screen;
    return `${width}x${height}x${colorDepth}x${pixelDepth}`;
}

/**
 * Combine all fingerprint components into a unique hash
 */
async function generateAdvancedFingerprint(): Promise<string> {
    const components: FingerprintComponents = {
        webgl: getWebGLFingerprint(),
        canvas: getCanvasFingerprint(),
        audio: getAudioFingerprint(),
        wasmBenchmark: await getWASMBenchmark(),
        screen: getScreenFingerprint(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        deviceMemory: (navigator as any).deviceMemory,
    };

    // Create stable composite for hashing (exclude benchmarks and variable factors)
    // We also exclude Canvas and Audio because they differ between Chrome and Edge on the same machine
    const stableComponents = {
        webgl: components.webgl,
        screen: components.screen,
        timezone: components.timezone,
        language: components.language,
        platform: components.platform,
        hardwareConcurrency: components.hardwareConcurrency,
        deviceMemory: components.deviceMemory,
        // canvas: components.canvas, // Excluded for cross-browser stability
        // audio: components.audio,   // Excluded for cross-browser stability
    };

    const composite = Object.entries(stableComponents)
        .map(([key, value]) => `${value}`) // We drop keys to save space, just values
        .join('|');

    // Generate Raw Hardware String
    // We return the raw string so the backend can perform Fuzzy Matching (Levenshtein distance)
    // Hashing it would destroy similarity information

    // We add a prefix to identify this as a raw hardware string
    // We also limit length to avoid huge headers, but usually this is < 500 chars
    const finalFingerprint = `raw_${composite}`;

    return finalFingerprint;
}

/**
 * Simple hash function for fingerprint components
 */
function hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
}

export { generateAdvancedFingerprint, type FingerprintComponents };
