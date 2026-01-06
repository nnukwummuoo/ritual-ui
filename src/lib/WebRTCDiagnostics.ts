/**
 * WebRTC Diagnostics and Connection Health Monitoring
 * 
 * Provides comprehensive diagnostic capabilities for debugging
 * WebRTC connectivity issues across different devices and networks.
 */

export interface DiagnosticSnapshot {
    timestamp: number;
    callId: string;
    userId: string;
    device: {
        userAgent: string;
        isIOS: boolean;
        isAndroid: boolean;
        isMobile: boolean;
        isSamsung: boolean;
        isXiaomi: boolean;
    };
    network: {
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
    };
    ice: {
        connectionState: RTCIceConnectionState;
        gatheringState: RTCIceGatheringState;
        candidates: {
            host: number;
            srflx: number;
            relay: number;
        };
    };
    peer: {
        connectionState: RTCPeerConnectionState;
        signalingState: RTCSignalingState;
    };
    media: {
        localTracks: { kind: string; enabled: boolean; readyState: string }[];
        remoteTracks: { kind: string; enabled: boolean; readyState: string }[];
    };
    stats?: {
        packetsLost: number;
        packetsReceived: number;
        packetsSent: number;
        bytesReceived: number;
        bytesSent: number;
        jitter?: number;
        roundTripTime?: number;
    };
}

export class WebRTCDiagnostics {
    private snapshots: DiagnosticSnapshot[] = [];
    private statsInterval?: NodeJS.Timeout;
    private maxSnapshots = 50; // Keep last 50 snapshots

    /**
     * Capture a comprehensive diagnostic snapshot
     */
    async captureSnapshot(
        callId: string,
        userId: string,
        pc: RTCPeerConnection,
        localStream: MediaStream | null,
        remoteStream: MediaStream | null
    ): Promise<DiagnosticSnapshot> {
        const device = this.detectDevice();
        const network = this.getNetworkInfo();
        const candidates = await this.analyzeCandidates(pc);
        const stats = await this.collectStats(pc);

        const snapshot: DiagnosticSnapshot = {
            timestamp: Date.now(),
            callId,
            userId,
            device,
            network,
            ice: {
                connectionState: pc.iceConnectionState,
                gatheringState: pc.iceGatheringState,
                candidates
            },
            peer: {
                connectionState: pc.connectionState,
                signalingState: pc.signalingState
            },
            media: {
                localTracks: localStream?.getTracks().map(t => ({
                    kind: t.kind,
                    enabled: t.enabled,
                    readyState: t.readyState
                })) || [],
                remoteTracks: remoteStream?.getTracks().map(t => ({
                    kind: t.kind,
                    enabled: t.enabled,
                    readyState: t.readyState
                })) || []
            },
            stats
        };

        this.snapshots.push(snapshot);

        // Keep only recent snapshots
        if (this.snapshots.length > this.maxSnapshots) {
            this.snapshots.shift();
        }

        console.log('🔍 [Diagnostics] Snapshot captured:', snapshot);
        return snapshot;
    }

    /**
     * Start continuous monitoring of connection health
     */
    startMonitoring(
        callId: string,
        userId: string,
        pc: RTCPeerConnection,
        localStream: MediaStream | null,
        remoteStream: MediaStream | null,
        interval: number = 5000
    ) {
        console.log('📊 [Diagnostics] Starting health monitoring');

        this.statsInterval = setInterval(async () => {
            await this.captureSnapshot(callId, userId, pc, localStream, remoteStream);
        }, interval);
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
            this.statsInterval = undefined;
            console.log('📊 [Diagnostics] Stopped health monitoring');
        }
    }

    /**
     * Export diagnostics for debugging
     */
    exportDiagnostics(): string {
        return JSON.stringify({
            snapshots: this.snapshots,
            summary: this.generateSummary()
        }, null, 2);
    }

    /**
     * Get the latest snapshot
     */
    getLatestSnapshot(): DiagnosticSnapshot | null {
        return this.snapshots[this.snapshots.length - 1] || null;
    }

    /**
     * Clear all diagnostic data
     */
    clear() {
        this.snapshots = [];
        this.stopMonitoring();
    }

    // Private helper methods

    private detectDevice() {
        const ua = navigator.userAgent;
        return {
            userAgent: ua,
            isIOS: /iPhone|iPad|iPod/i.test(ua),
            isAndroid: /Android/i.test(ua),
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
            isSamsung: /Samsung|SM-/i.test(ua),
            isXiaomi: /Xiaomi|Redmi|Mi |POCO/i.test(ua)
        };
    }

    private getNetworkInfo() {
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

        if (connection) {
            return {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt
            };
        }

        return {};
    }

    private async analyzeCandidates(pc: RTCPeerConnection): Promise<{
        host: number;
        srflx: number;
        relay: number;
    }> {
        try {
            const stats = await pc.getStats();
            const candidates = { host: 0, srflx: 0, relay: 0 };

            stats.forEach((report) => {
                if (report.type === 'local-candidate') {
                    if (report.candidateType === 'host') candidates.host++;
                    else if (report.candidateType === 'srflx') candidates.srflx++;
                    else if (report.candidateType === 'relay') candidates.relay++;
                }
            });

            return candidates;
        } catch (e) {
            return { host: 0, srflx: 0, relay: 0 };
        }
    }

    private async collectStats(pc: RTCPeerConnection) {
        try {
            const stats = await pc.getStats();
            let packetsLost = 0;
            let packetsReceived = 0;
            let packetsSent = 0;
            let bytesReceived = 0;
            let bytesSent = 0;
            let jitter: number | undefined;
            let roundTripTime: number | undefined;

            stats.forEach((report) => {
                if (report.type === 'inbound-rtp' && report.kind === 'video') {
                    packetsLost += report.packetsLost || 0;
                    packetsReceived += report.packetsReceived || 0;
                    bytesReceived += report.bytesReceived || 0;
                    jitter = report.jitter;
                } else if (report.type === 'outbound-rtp' && report.kind === 'video') {
                    packetsSent += report.packetsSent || 0;
                    bytesSent += report.bytesSent || 0;
                } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                    roundTripTime = report.currentRoundTripTime;
                }
            });

            return {
                packetsLost,
                packetsReceived,
                packetsSent,
                bytesReceived,
                bytesSent,
                jitter,
                roundTripTime
            };
        } catch (e) {
            return {
                packetsLost: 0,
                packetsReceived: 0,
                packetsSent: 0,
                bytesReceived: 0,
                bytesSent: 0
            };
        }
    }

    private generateSummary() {
        if (this.snapshots.length === 0) {
            return { message: 'No diagnostic data available' };
        }

        const latest = this.snapshots[this.snapshots.length - 1];
        const totalPacketsLost = this.snapshots.reduce((sum, s) => sum + (s.stats?.packetsLost || 0), 0);
        const totalPacketsReceived = this.snapshots.reduce((sum, s) => sum + (s.stats?.packetsReceived || 0), 0);
        const lossRate = totalPacketsReceived > 0 ? (totalPacketsLost / (totalPacketsLost + totalPacketsReceived)) * 100 : 0;

        return {
            device: latest.device,
            network: latest.network,
            currentConnectionState: latest.peer.connectionState,
            currentICEState: latest.ice.connectionState,
            candidateTypes: latest.ice.candidates,
            overallPacketLoss: lossRate.toFixed(2) + '%',
            totalSnapshots: this.snapshots.length
        };
    }
}

// Singleton instance for global access
export const diagnostics = new WebRTCDiagnostics();
