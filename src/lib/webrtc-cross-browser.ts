// =============================================================================
// CROSS-BROWSER WEBRTC COMPATIBILITY UTILITY
// =============================================================================
// Handles device-specific WebRTC quirks and ensures compatibility across:
// - Safari/iOS (H.264 only)
// - Chrome/Android (VP8/VP9/H.264)
// - Samsung/Xiaomi devices (custom WebView implementations)
// =============================================================================

/**
 * Browser and device capability detection
 */
export interface BrowserCapabilities {
    isIOS: boolean;
    isAndroid: boolean;
    isSafari: boolean;
    isChrome: boolean;
    isFirefox: boolean;
    isSamsung: boolean;
    isXiaomi: boolean;
    browserVersion: number;
}

/**
 * Codec support detection result
 */
export interface CodecSupport {
    h264: boolean;
    vp8: boolean;
    vp9: boolean;
}

/**
 * Detects browser and device capabilities
 */
export const detectBrowserCapabilities = (): BrowserCapabilities => {
    const ua = navigator.userAgent;

    return {
        isIOS: /iPhone|iPad|iPod/i.test(ua),
        isAndroid: /Android/i.test(ua),
        isSafari: /^((?!chrome|android).)*safari/i.test(ua),
        isChrome: /Chrome/i.test(ua) && /Google Inc/.test(navigator.vendor),
        isFirefox: /Firefox/i.test(ua),
        isSamsung: /Samsung|SM-/i.test(ua),
        isXiaomi: /Xiaomi|Redmi|Mi |POCO/i.test(ua),
        browserVersion: ua.match(/(?:Chrome|Firefox|Safari)\/(\d+)/) ?
            parseInt(ua.match(/(?:Chrome|Firefox|Safari)\/(\d+)/)?.[1] || '0') : 0
    };
};

/**
 * Dynamically checks which codecs are supported by creating a test peer connection
 */
export const checkCodecSupport = async (): Promise<CodecSupport> => {
    try {
        const pc = new RTCPeerConnection();
        const offer = await pc.createOffer({ offerToReceiveVideo: true });
        pc.close();

        const sdp = offer.sdp || '';

        return {
            h264: sdp.includes('H264') || sdp.includes('h264'),
            vp8: sdp.includes('VP8') || sdp.includes('vp8'),
            vp9: sdp.includes('VP9') || sdp.includes('vp9')
        };
    } catch (e) {
        console.warn('⚠️ [Codec Check] Failed:', e);
        return { h264: false, vp8: false, vp9: false };
    }
};

/**
 * Prioritizes a specific codec in SDP by reordering the m=video line
 * CRITICAL: This ensures Safari/iOS gets H.264 first
 */
export const prioritizeCodecs = (sdp: string, preferredCodec: 'H264' | 'VP8' | 'VP9'): string => {
    const lines = sdp.split('\r\n');
    let mLineIndex = -1;
    const codecPayloads: string[] = [];

    // Find m=video line
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('m=video')) {
            mLineIndex = i;
            break;
        }
    }

    if (mLineIndex === -1) return sdp;

    // Find all codec payloads for preferred codec
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('a=rtpmap:') &&
            lines[i].toLowerCase().includes(preferredCodec.toLowerCase())) {
            const match = lines[i].match(/a=rtpmap:(\d+)/);
            if (match) codecPayloads.push(match[1]);
        }
    }

    if (codecPayloads.length === 0) return sdp;

    // Reorder m= line to prioritize codec
    const mLineParts = lines[mLineIndex].split(' ');
    const port = mLineParts[1];
    const proto = mLineParts[2];
    const existingPayloads = mLineParts.slice(3);

    // Remove preferred codec from existing list
    const otherPayloads = existingPayloads.filter(p => !codecPayloads.includes(p));

    // Put preferred codec first
    const newPayloads = [...codecPayloads, ...otherPayloads];
    lines[mLineIndex] = `m=video ${port} ${proto} ${newPayloads.join(' ')}`;

    return lines.join('\r\n');
};

/**
 * Gets optimal media constraints based on device capabilities
 */
export const getOptimalConstraints = async () => {
    const capabilities = detectBrowserCapabilities();
    const codecs = await checkCodecSupport();

    console.log('🔍 [Capabilities]', { capabilities, codecs });

    // Base constraints - VERY conservative for compatibility
    const baseConstraints: MediaStreamConstraints = {
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            // iOS prefers 48kHz, Android varies
            sampleRate: capabilities.isIOS ? 48000 : 44100
        },
        video: true  // Will be modified below
    };

    // Platform-specific video optimizations
    if (capabilities.isIOS || capabilities.isSafari) {
        // iOS/Safari: Conservative settings, H.264 only
        baseConstraints.video = {
            facingMode: 'user',
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            frameRate: { ideal: 24, max: 30 }
        };
    } else if (capabilities.isAndroid) {
        // Android: Varies by device
        if (capabilities.isSamsung || capabilities.isXiaomi) {
            // Budget Android devices - very conservative
            baseConstraints.video = {
                facingMode: 'user',
                width: { ideal: 480, max: 640 },
                height: { ideal: 640, max: 480 },
                frameRate: { ideal: 20, max: 24 }
            };
        } else {
            // Standard Android
            baseConstraints.video = {
                facingMode: 'user',
                width: { ideal: 640, max: 1280 },
                height: { ideal: 480, max: 720 },
                frameRate: { ideal: 24, max: 30 }
            };
        }
    } else {
        // Desktop: Higher quality allowed
        baseConstraints.video = {
            facingMode: 'user',
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 30 }
        };
    }

    return { constraints: baseConstraints, capabilities, codecs };
};

/**
 * Creates a universal peer connection with optimal configuration
 * Stores preferred codec for later use in SDP manipulation
 */
export const createUniversalPeerConnection = async (): Promise<RTCPeerConnection> => {
    const { capabilities, codecs } = await getOptimalConstraints();

    // Determine preferred codec based on device
    let preferredCodec: 'H264' | 'VP8' | 'VP9' = 'H264';

    if (capabilities.isIOS || capabilities.isSafari) {
        preferredCodec = 'H264'; // MUST use H.264 for Safari/iOS
    } else if (codecs.vp8 && !codecs.h264) {
        preferredCodec = 'VP8'; // Fallback if no H.264
    } else {
        preferredCodec = 'H264'; // Default to most compatible
    }

    console.log('🎥 [Codec] Using:', preferredCodec, 'for', capabilities);

    const config: RTCConfiguration = {
        iceServers: [
            // Multiple STUN servers for redundancy
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },

            // TURN with UDP
            {
                urls: 'turn:a.relay.metered.ca:80',
                username: 'e62583087c262cbfba58afdd',
                credential: 'cM5CIbxsVPPI5UR5'
            },

            // TURN with TCP (firewall fallback)
            {
                urls: 'turn:a.relay.metered.ca:80?transport=tcp',
                username: 'e62583087c262cbfba58afdd',
                credential: 'cM5CIbxsVPPI5UR5'
            },

            // TURN with TLS on 443 (ultimate fallback - looks like HTTPS)
            {
                urls: 'turn:a.relay.metered.ca:443?transport=tcp',
                username: 'e62583087c262cbfba58afdd',
                credential: 'cM5CIbxsVPPI5UR5'
            }
        ],
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',

        // Use 'all' for normal operation, 'relay' to force TURN
        iceTransportPolicy: 'all'
    };

    const pc = new RTCPeerConnection(config);

    // Store codec preference for later use
    (pc as any).__preferredCodec = preferredCodec;

    return pc;
};

/**
 * Creates an offer with codec preference applied
 */
export const createOfferWithCodecPreference = async (pc: RTCPeerConnection): Promise<RTCSessionDescriptionInit> => {
    const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
    });

    // Apply codec preference
    const preferredCodec = (pc as any).__preferredCodec || 'H264';
    if (offer.sdp) {
        offer.sdp = prioritizeCodecs(offer.sdp, preferredCodec);
        console.log('✅ [SDP] Prioritized', preferredCodec, 'in offer');
    }

    return offer;
};

/**
 * Creates an answer with codec preference applied
 */
export const createAnswerWithCodecPreference = async (pc: RTCPeerConnection): Promise<RTCSessionDescriptionInit> => {
    const answer = await pc.createAnswer();

    // Apply codec preference
    const preferredCodec = (pc as any).__preferredCodec || 'H264';
    if (answer.sdp) {
        answer.sdp = prioritizeCodecs(answer.sdp, preferredCodec);
        console.log('✅ [SDP] Prioritized', preferredCodec, 'in answer');
    }

    return answer;
};

/**
 * Safely attaches a stream to a video element with mobile support
 * Handles autoplay policies and mobile-specific requirements
 */
export const attachStreamToVideo = async (
    videoElement: HTMLVideoElement,
    stream: MediaStream,
    isMuted: boolean = false
): Promise<void> => {
    const capabilities = detectBrowserCapabilities();

    // Set stream
    videoElement.srcObject = stream;

    // Mobile-specific attributes
    videoElement.setAttribute('playsinline', 'true');
    videoElement.setAttribute('webkit-playsinline', 'true');
    videoElement.setAttribute('autoplay', 'true');

    if (capabilities.isIOS) {
        videoElement.setAttribute('x-webkit-airplay', 'allow');
    }

    // Mobile autoplay policy: start muted, unmute after playing
    const shouldStartMuted = (capabilities.isIOS || capabilities.isAndroid) && !isMuted;
    videoElement.muted = shouldStartMuted || isMuted;

    // Wait for metadata
    await new Promise<void>((resolve) => {
        const handleLoaded = () => {
            videoElement.removeEventListener('loadedmetadata', handleLoaded);
            resolve();
        };
        videoElement.addEventListener('loadedmetadata', handleLoaded);

        // Timeout after 5 seconds
        setTimeout(() => {
            videoElement.removeEventListener('loadedmetadata', handleLoaded);
            resolve();
        }, 5000);
    });

    // Try to play
    try {
        await videoElement.play();
        console.log('✅ [Video] Playing');

        // Unmute after successful play (mobile only)
        if (shouldStartMuted && !isMuted) {
            setTimeout(() => {
                videoElement.muted = false;
                console.log('🔊 [Video] Auto-unmuted');
            }, 500);
        }
    } catch (error: any) {
        if (error.name !== 'AbortError') {
            console.warn('⚠️ [Video] Play failed:', error.message);

            // Retry with muted
            if (!videoElement.muted) {
                videoElement.muted = true;
                try {
                    await videoElement.play();
                    console.log('✅ [Video] Playing (muted fallback)');
                } catch (retryError) {
                    console.error('❌ [Video] Play failed even muted:', retryError);
                }
            }
        }
    }
};

/**
 * Diagnostic helper to debug device-specific issues
 */
export const diagnoseWebRTCSupport = async () => {
    const capabilities = detectBrowserCapabilities();
    const codecs = await checkCodecSupport();

    const report = {
        device: capabilities,
        codecs: codecs,
        webrtcSupport: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        rtcPeerConnection: !!(window.RTCPeerConnection),
        recommendations: [] as string[]
    };

    // Generate recommendations
    if (capabilities.isIOS && !codecs.h264) {
        report.recommendations.push('⚠️ iOS detected but H.264 not supported - WebRTC may not work');
    }

    if (capabilities.isAndroid && !codecs.h264 && !codecs.vp8) {
        report.recommendations.push('⚠️ No compatible codecs found - try Chrome browser');
    }

    if (!report.webrtcSupport) {
        report.recommendations.push('❌ getUserMedia not supported - update browser');
    }

    if ((capabilities.isSamsung || capabilities.isXiaomi) && capabilities.isAndroid) {
        report.recommendations.push('ℹ️ Device-specific optimizations applied for compatibility');
    }

    if (report.recommendations.length === 0) {
        report.recommendations.push('✅ All WebRTC features supported - no issues detected');
    }

    console.log('🔍 [WebRTC Diagnostic Report]', report);
    return report;
};
