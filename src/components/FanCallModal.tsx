// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// Import webrtc-adapter for cross-browser compatibility (MUST BE FIRST)
import 'webrtc-adapter';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { IoCall, IoCallSharp, IoVideocam, IoVideocamOff, IoMic, IoMicOff, IoClose, IoVolumeHigh, IoVolumeMute } from 'react-icons/io5';
import { getSocket } from '@/lib/socket';
import VideoCallBilling from './FanCallBilling';
import VIPBadge from './VIPBadge';
import { getImageSource } from '@/lib/imageUtils';
import { diagnostics } from '@/lib/WebRTCDiagnostics';

// Import cross-browser WebRTC utilities
import {
  getOptimalConstraints,
  createUniversalPeerConnection,
  createOfferWithCodecPreference,
  createAnswerWithCodecPreference,
  attachStreamToVideo,
  diagnoseWebRTCSupport
} from '@/lib/webrtc-cross-browser';

// Mobile detection utility
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const isIOSDevice = () => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

// Codec preference utility for Safari/iOS compatibility
const preferCodec = (sdp: string, codecName: string): string => {
  const lines = sdp.split('\r\n');
  let mLineIndex = -1;
  let codecPayloadType = '';

  // Find m=video line
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('m=video')) {
      mLineIndex = i;
      break;
    }
  }

  // Find codec payload type
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('rtpmap') && lines[i].toLowerCase().includes(codecName.toLowerCase())) {
      const match = lines[i].match(/a=rtpmap:(\d+)/);
      if (match) {
        codecPayloadType = match[1];
        break;
      }
    }
  }

  if (mLineIndex !== -1 && codecPayloadType) {
    const elements = lines[mLineIndex].split(' ');
    const payloads = elements.slice(3);

    // Move preferred codec to front
    const newPayloads = [codecPayloadType, ...payloads.filter(p => p !== codecPayloadType)];
    lines[mLineIndex] = elements.slice(0, 3).concat(newPayloads).join(' ');
  }

  return lines.join('\r\n');
};

// SDP validation utility
const validateSDP = (sdp: RTCSessionDescriptionInit): boolean => {
  if (!sdp.sdp) return false;

  // Check for essential components
  const hasMediaDescription = sdp.sdp.includes('m=video') || sdp.sdp.includes('m=audio');
  const hasICECredentials = sdp.sdp.includes('a=ice-ufrag') && sdp.sdp.includes('a=ice-pwd');
  const hasFingerprint = sdp.sdp.includes('a=fingerprint');

  if (!hasMediaDescription || !hasICECredentials || !hasFingerprint) {
    console.error('❌ [WebRTC] Invalid SDP detected:', {
      hasMediaDescription,
      hasICECredentials,
      hasFingerprint
    });
    return false;
  }

  return true;
};

interface FanCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callData: {
    callerId: string;
    callerName: string;
    callerFirstName?: string;
    callerLastName?: string;
    callerUsername?: string;
    callerPhoto?: string;
    callerIsVip?: boolean;
    callerVipEndDate?: string | null;
    callerIsCreator?: boolean;
    isIncoming: boolean;
    callId?: string;
    answererId?: string;
    answererName?: string;
    answererFirstName?: string;
    answererLastName?: string;
    answererUsername?: string;
    answererPhoto?: string;
    answererIsVip?: boolean;
    answererVipEndDate?: string | null;
    answererIsCreator?: boolean;
  } | null;
  currentUserId: string;
  currentUserName: string;
  userBalance?: number;
  creatorEarnings?: number;
  isCreator?: boolean;
  callRate?: number;
}

export default function FanCallModal({
  isOpen,
  onClose,
  callData,
  currentUserId,
  currentUserName,
  userBalance = 0,
  creatorEarnings = 0,
  isCreator = false,
  callRate = 1
}: FanCallModalProps) {

  const [callStatus, setCallStatus] = useState<'ringing' | 'connecting' | 'connected' | 'ended'>('ringing');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true); // Control remote audio output
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [usersCanSeeEachOther, setUsersCanSeeEachOther] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showInsecureWarning, setShowInsecureWarning] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [diagnosticLogs, setDiagnosticLogs] = useState<Array<{ stage: string; time: string; data: any }>>([]); // Layer 4: Diagnostic logging
  const [callTimeout, setCallTimeout] = useState(false);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [insufficientFunds, setInsufficientFunds] = useState(false);

  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const thumbnailVideoRef = useRef<HTMLVideoElement>(null);
  const pendingIceCandidatesRef = useRef<any[]>([]);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null); // CRITICAL FIX: Immediate ref access
  const remoteStreamRef = useRef<MediaStream | null>(null); // CRITICAL FIX: Immediate stream ref
  const connectionHealthRef = useRef<NodeJS.Timeout | null>(null);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const socket = getSocket();

  // Check for insecure context when modal opens + run diagnostics
  useEffect(() => {
    if (isOpen) {
      const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isNetworkIP = /^\d+\.\d+\.\d+\.\d+/.test(window.location.hostname);

      if (!isSecureContext) {
        setShowInsecureWarning(true);
      }

      // Run cross-browser diagnostics (helps debug device-specific issues)
      diagnoseWebRTCSupport().catch(err => console.warn('Diagnostics failed:', err));
    }
  }, [isOpen]);

  // 30-second timeout for calls (only for outgoing calls, not incoming)
  useEffect(() => {
    if (isOpen && callStatus === 'ringing' && !callTimeout && !callData?.isIncoming) {
      setCallStartTime(Date.now());

      callTimeoutRef.current = setTimeout(() => {
        if (callStatus === 'ringing') {
          setCallTimeout(true);
          if (socket) {
            socket.emit('fan_call_timeout', {
              callId: callData?.callId,
              callerId: callData?.callerId,
              callerName: callData?.callerName,
              answererId: callData?.answererId,
              answererName: callData?.answererName
            });
          }
        }
      }, 30000);
    }

    return () => {
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
    };
  }, [isOpen, callStatus, callTimeout, callData?.isIncoming]);

  // Reset timeout when call is accepted
  useEffect(() => {
    if (callStatus === 'connected' || callStatus === 'connecting') {
      setCallTimeout(false);
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
    }
  }, [callStatus]);

  // Auto-hide controls functionality
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const handleVideoAreaClick = () => {
    if (callStatus === 'connected') {
      showControlsTemporarily();
    }
  };

  // Get user media - ENHANCED with cross-browser device-specific constraints
  const getUserMedia = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported');
      }

      const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      if (!isSecureContext) {
        throw new Error('INSECURE_CONTEXT');
      }

      console.log('📹 [VideoCall] Requesting user media');

      // Use cross-browser utility to get optimal constraints
      const { constraints, capabilities, codecs } = await getOptimalConstraints();

      // Apply video/audio enabled states
      if (!isVideoEnabled) {
        constraints.video = false;
      }
      if (!isAudioEnabled) {
        constraints.audio = false;
      }

      console.log('📹 [VideoCall] Using constraints:', constraints);
      console.log('🎥 [VideoCall] Device capabilities:', capabilities);
      console.log('🎬 [VideoCall] Codec support:', codecs);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log('✅ [VideoCall] Got user media stream:', {
        id: stream.id,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
        videoSettings: stream.getVideoTracks()[0]?.getSettings(),
        audioSettings: stream.getAudioTracks()[0]?.getSettings()
      });

      // Layer 4: Log diagnostic info
      logDiagnosticInfo('getUserMedia', {
        success: true,
        hasVideo: stream.getVideoTracks().length > 0,
        hasAudio: stream.getAudioTracks().length > 0,
        videoSettings: stream.getVideoTracks()[0]?.getSettings(),
        audioSettings: stream.getAudioTracks()[0]?.getSettings(),
        constraints
      });

      setLocalStream(stream);
      return stream;
    } catch (error: any) {
      console.error('❌ [VideoCall] Error accessing media devices:', error);

      const isMobile = isMobileDevice();
      const isNetworkIP = /^\d+\.\d+\.\d+\.\d+/.test(window.location.hostname);
      const deviceInfo = detectDevice(); // Use our new device detection

      if (error.name === 'NotAllowedError') {
        if (isMobile && isNetworkIP) {
          setMediaError('Camera access denied on mobile device.\n\nMobile browsers require HTTPS for camera access.\n\nSolutions:\n1. Use localhost:3000 on your computer\n2. Set up HTTPS for your development server\n3. Use a different device with desktop browser\n\nFor mobile testing, you need HTTPS or localhost access.');
        } else {
          // Device-specific error messages
          let errorMsg = 'Camera and microphone access denied. Please allow access and try again.\n\n';

          if (deviceInfo.isIOS) {
            errorMsg += 'For iPhone/iPad:\n';
            errorMsg += '1. Go to Settings > Safari > Camera\n';
            errorMsg += '2. Select "Allow"\n';
            errorMsg += '3. Go to Settings > Safari > Microphone\n';
            errorMsg += '4. Select "Allow"\n';
            errorMsg += '5. Refresh this page and try again';
          } else if (deviceInfo.isSamsung) {
            errorMsg += 'For Samsung:\n';
            errorMsg += '1. Go to Settings > Apps > [Browser] > Permissions\n';
            errorMsg += '2. Enable Camera and Microphone\n';
            errorMsg += '3. Refresh this page and try again';
          } else if (deviceInfo.isXiaomi) {
            errorMsg += 'For Xiaomi/Redmi/MIUI:\n';
            errorMsg += '1. Go to Settings > Apps > Manage apps > [Browser]\n';
            errorMsg += '2. Tap Permissions\n';
            errorMsg += '3. Enable Camera and Microphone\n';
            errorMsg += '4. Disable battery optimization for this app\n';
            errorMsg += '5. Refresh this page and try again\n\n';
            errorMsg += '💡 Tip: Use earphones to avoid echo on MIUI devices';
          } else {
            errorMsg += 'To fix this:\n';
            errorMsg += '1. Click the camera/mic icon in your browser address bar\n';
            errorMsg += '2. Select "Allow" for camera and microphone\n';
            errorMsg += '3. Refresh the page and try again';
          }

          setMediaError(errorMsg);
        }
      } else if (error.name === 'NotFoundError') {
        setMediaError('No camera or microphone found. Please check your devices.\n\nMake sure:\n1. Camera and microphone are connected\n2. No other applications are using them\n3. Browser has permission to access them');
      } else if (error.name === 'NotReadableError') {
        setMediaError('Camera or microphone is already in use by another application.\n\nPlease:\n1. Close other video calling apps (Zoom, Teams, etc.)\n2. Close other browser tabs using camera/mic\n3. Try again');
      } else if (error.message === 'INSECURE_CONTEXT') {
        if (isMobile) {
          setMediaError('Mobile browsers require HTTPS for camera access.\n\nYour options:\n1. Use localhost:3000 on your computer\n2. Set up HTTPS for your development server\n3. Use a desktop browser instead\n\nMobile browsers block camera access on network IPs for security.');
        } else {
          setMediaError('Camera and microphone access requires a secure connection.\n\nFor development:\n• Use localhost:3000 instead of network IP\n• Or set up HTTPS for your development server\n\nFor production:\n• Ensure your site uses HTTPS');
        }
      } else if (error.message === 'Media devices not supported') {
        setMediaError('Your browser does not support camera and microphone access.\n\nPlease:\n1. Update your browser to the latest version\n2. Try using Chrome, Firefox, or Safari\n3. Check if your browser allows media access');
      } else {
        setMediaError(`Failed to access camera and microphone.\n\nError: ${error.name || 'Unknown'}\n\nPlease:\n1. Check your browser permissions\n2. Try refreshing the page\n3. Contact support if the issue persists`);
      }

      return null;
    }
  };

  // Create peer connection - ENHANCED with cross-browser codec support
  const createPeerConnection = useCallback(async () => {
    console.log('📹 [WebRTC] Creating new peer connection');

    // Use universal peer connection factory with codec preference
    const pc = await createUniversalPeerConnection();

    // NAT Traversal Keep-Alive: Maintain NAT bindings with periodic pings
    // Critical for aggressive NAT timeouts and mobile network transitions
    const dataChannel = pc.createDataChannel('keepalive', {
      ordered: false,
      maxRetransmits: 0
    });
    dataChannelRef.current = dataChannel;

    dataChannel.onopen = () => {
      console.log('📡 [WebRTC] Keep-alive data channel open');

      // Send ping every 5 seconds to maintain NAT binding
      const keepAliveInterval = setInterval(() => {
        if (dataChannel.readyState === 'open') {
          try {
            dataChannel.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          } catch (e) {
            console.warn('⚠️ [WebRTC] Keep-alive send failed:', e);
          }
        } else {
          // Channel closed, clean up
          clearInterval(keepAliveInterval);
        }
      }, 5000);

      keepAliveIntervalRef.current = keepAliveInterval;
    };

    dataChannel.onerror = (error) => {
      console.error('❌ [WebRTC] Data channel error:', error);
    };

    dataChannel.onclose = () => {
      console.log('📡 [WebRTC] Keep-alive data channel closed');
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
        keepAliveIntervalRef.current = null;
      }
    };

    // Handle incoming data channel from remote peer
    pc.ondatachannel = (event) => {
      console.log('📡 [WebRTC] Received data channel from remote');
      const channel = event.channel;

      channel.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          if (data.type === 'ping') {
            // Respond with pong to confirm bidirectional connectivity
            if (channel.readyState === 'open') {
              channel.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            }
          } else if (data.type === 'pong') {
            // Pong received, connection is healthy
            console.log('✅ [WebRTC] Keep-alive pong received');
          }
        } catch (e) {
          // Ignore malformed messages
        }
      };
    };

    // Start diagnostic monitoring
    if (callData?.callId && currentUserId) {
      setTimeout(() => {
        diagnostics.startMonitoring(
          callData.callId!,
          currentUserId,
          pc,
          localStream,
          remoteStream
        );
      }, 1000);
    }


    pc.ontrack = (event) => {
      console.log('📹 [WebRTC] ontrack event fired:', {
        hasStreams: !!event.streams,
        streamsLength: event.streams?.length || 0,
        trackKind: event.track?.kind,
        trackId: event.track?.id,
        trackReadyState: event.track?.readyState,
        trackEnabled: event.track?.enabled
      });

      if (event.streams && event.streams[0]) {
        const newRemoteStream = event.streams[0];
        const track = event.track;

        // Validate tracks are active before setting
        const allTracks = newRemoteStream.getTracks();
        const activeTracks = allTracks.filter(t => t.readyState === 'live');

        console.log('📹 [WebRTC] Received remote stream:', {
          streamId: newRemoteStream.id,
          tracks: allTracks.length,
          activeTracks: activeTracks.length,
          videoTracks: newRemoteStream.getVideoTracks().length,
          audioTracks: newRemoteStream.getAudioTracks().length,
          trackDetails: allTracks.map(t => ({
            kind: t.kind,
            enabled: t.enabled,
            readyState: t.readyState,
            muted: t.muted
          }))
        });

        // Layer 4: Log diagnostic info for remote track
        logDiagnosticInfo('remoteTrack', {
          trackKind: track.kind,
          trackId: track.id,
          trackEnabled: track.enabled,
          trackReadyState: track.readyState,
          trackMuted: track.muted,
          streamId: newRemoteStream.id,
          videoTracks: newRemoteStream.getVideoTracks().length,
          audioTracks: newRemoteStream.getAudioTracks().length,
          activeTracks: activeTracks.length
        });

        // CRITICAL FIX: Set ref immediately (synchronous)
        remoteStreamRef.current = newRemoteStream;

        // CRITICAL FIX: Only set state if stream is different to prevent multiple re-renders
        // The ontrack event fires twice (once for audio, once for video) with the same stream
        if (remoteStream?.id !== newRemoteStream.id) {
          console.log('🔴 [FREEZE DEBUG] Setting new remote stream (first track or stream changed)', {
            oldStreamId: remoteStream?.id,
            newStreamId: newRemoteStream.id,
            trackKind: track.kind,
            trackReadyState: track.readyState
          });
          // CRITICAL FIX: If track not ready, listen for it to become ready
          if (track.readyState !== 'live') {
            console.log('⚠️ [WebRTC] Track not live yet, adding ready listener');
            track.addEventListener('unmute', () => {
              console.log('✅ [WebRTC] Track became ready');
              setRemoteStream(newRemoteStream);
            }, { once: true });
          } else {
            // Track is ready, set state
            setRemoteStream(newRemoteStream);
          }
        } else {
          console.log('🔴 [FREEZE DEBUG] Same stream, additional track received - skipping state update', {
            streamId: newRemoteStream.id,
            trackKind: track.kind,
            trackReadyState: track.readyState,
            currentVideoTracks: newRemoteStream.getVideoTracks().length,
            currentAudioTracks: newRemoteStream.getAudioTracks().length
          });
        }

        (pc as any).remoteStream = newRemoteStream;
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('📹 [WebRTC] Sending ICE candidate:', event.candidate.type);
        if (socket && callData?.callId) {
          socket.emit('fan_call_ice_candidate', {
            callId: callData.callId,
            candidate: event.candidate
          });
        }
      } else {
        console.log('📹 [WebRTC] ICE gathering complete');
      }
    };

    // Handle connection state changes with recovery
    pc.onconnectionstatechange = () => {
      console.log('📹 [WebRTC] Connection state changed:', pc.connectionState);

      // Layer 4: Log connection state change
      logDiagnosticInfo('connectionStateChange', {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        iceGatheringState: pc.iceGatheringState
      });

      if (pc.connectionState === 'connected') {
        console.log('✅ [WebRTC] Peer connection established successfully!');
      } else if (pc.connectionState === 'failed') {
        console.error('❌ [WebRTC] Connection failed - attempting recovery');
        // Try ICE restart first
        if (pc.restartIce) {
          pc.restartIce();
        }

        // If still failing after 5 seconds, try to recreate offer/answer
        setTimeout(() => {
          if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
            console.log('📹 [WebRTC] Connection still failed, attempting full renegotiation');

            // Caller creates new offer
            if (callData?.callerId === currentUserId && !callData?.isIncoming) {
              pc.createOffer({ iceRestart: true })
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                  if (socket && callData?.callId) {
                    socket.emit('fan_call_offer', {
                      callId: callData.callId,
                      offer: pc.localDescription
                    });
                    console.log('📹 [WebRTC] Sent recovery offer');
                  }
                })
                .catch(err => console.error('❌ [WebRTC] Recovery failed:', err));
            }
          }
        }, 5000);
      } else if (pc.connectionState === 'disconnected') {
        console.warn('⚠️ [WebRTC] Connection disconnected - monitoring for recovery');
      }
    };

    // Handle ICE connection state with reconnection logic
    pc.oniceconnectionstatechange = () => {
      console.log('📹 [WebRTC] ICE connection state changed:', pc.iceConnectionState);

      if (pc.iceConnectionState === 'failed') {
        console.error('❌ [WebRTC] ICE connection failed - attempting ICE restart');
        // Try to restart ICE negotiation
        if (pc.restartIce) {
          pc.restartIce();

          // If we're the caller, create a new offer with iceRestart
          if (callData?.callerId === currentUserId && !callData?.isIncoming) {
            setTimeout(() => {
              pc.createOffer({ iceRestart: true })
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                  if (socket && callData?.callId) {
                    socket.emit('fan_call_offer', {
                      callId: callData.callId,
                      offer: pc.localDescription
                    });
                    console.log('📹 [WebRTC] Sent ICE restart offer');
                  }
                })
                .catch(err => console.error('❌ [WebRTC] ICE restart failed:', err));
            }, 1000);
          }
        }
      } else if (pc.iceConnectionState === 'disconnected') {
        console.warn('⚠️ [WebRTC] ICE connection disconnected - waiting for reconnection');
        // Wait a bit before trying to restart
        setTimeout(() => {
          if (pc.iceConnectionState === 'disconnected') {
            console.log('📹 [WebRTC] Still disconnected, attempting reconnection');
            if (pc.restartIce) {
              pc.restartIce();
            }
          }
        }, 3000);
      } else if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        console.log('✅ [WebRTC] ICE connection established successfully');
      }
    };

    // Handle ICE gathering state
    pc.onicegatheringstatechange = () => {
      console.log('📹 [WebRTC] ICE gathering state changed:', pc.iceGatheringState);
    };

    return pc;
  }, [socket, callData?.callId, callData?.callerId, callData?.isIncoming, currentUserId]);

  // Process pending ICE candidates - ENHANCED with better error handling
  const processPendingIceCandidates = useCallback(async (pc: RTCPeerConnection) => {
    const candidatesCount = pendingIceCandidatesRef.current.length;
    console.log('📹 [WebRTC] Processing pending ICE candidates:', candidatesCount);

    if (candidatesCount === 0) return;

    const candidates = [...pendingIceCandidatesRef.current];
    pendingIceCandidatesRef.current = [];

    for (const candidate of candidates) {
      try {
        console.log('📹 [WebRTC] Adding pending ICE candidate');
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('✅ [WebRTC] Pending ICE candidate added successfully');
      } catch (error) {
        console.error('❌ [WebRTC] Error adding pending ICE candidate:', error);
        pendingIceCandidatesRef.current.push(candidate);
      }
    }

    console.log('✅ [WebRTC] Finished processing pending candidates. Remaining:',
      pendingIceCandidatesRef.current.length);
  }, []);

  // Handle accept call - FIXED to ensure media before peer connection
  const handleAcceptCall = async () => {
    if (!callData || !socket) return;

    console.log('📞 [VideoCall] Accepting call');

    // CRITICAL: Check permission state first (Layer 1 fix)
    const deviceInfo = detectDevice();
    console.log('📱 [Device Info]:', deviceInfo);

    const permState = await checkPermissionState();
    console.log('🔐 [Permission State]:', permState);

    if (permState === 'denied') {
      console.error('❌ [VideoCall] Permissions previously denied');
      const deviceHint = deviceInfo.isIOS ? 'iOS' : deviceInfo.isAndroid ? 'Android' : 'your device';
      setMediaError(
        `Camera and microphone access denied.\n\n` +
        `On ${deviceHint}, please:\n` +
        `1. Open device Settings\n` +
        `2. Find this browser/app\n` +
        `3. Enable Camera and Microphone permissions\n` +
        `4. Refresh this page and try again`
      );
      setCallStatus('ended');
      return;
    }

    setCallStatus('connecting');

    // Ensure we have local media before proceeding - NOW USER-INITIATED!
    let stream = localStream;
    if (!stream) {
      console.log('📹 [VideoCall] Getting user media before accepting (user-initiated)');
      stream = await getUserMedia();
      if (!stream) {
        console.error('❌ [VideoCall] Failed to get user media');
        setCallStatus('ended');
        return;
      }
    }

    socket.emit('fan_call_accept', {
      callId: callData.callId,
      callerId: callData.callerId,
      answererId: currentUserId,
      answererName: currentUserName
    });

    setCallStatus('connected');
  };

  // Handle decline/end call
  const handleDeclineCall = () => {
    if (!callData || !socket) return;

    socket.emit('fan_call_decline', {
      callId: callData.callId,
      callerId: callData.callerId,
      answererId: currentUserId
    });

    handleCleanup();
    onClose();
  };

  const handleEndCall = () => {
    if (!socket) return;

    handleCleanup();
    onClose();

    socket.emit('fan_call_end', {
      callId: callData?.callId,
      callerId: callData?.callerId,
      answererId: callData?.answererId,
      userId: currentUserId
    });
  };

  const handleCallAgain = () => {
    if (!callData) return;

    setCallTimeout(false);
    setCallStartTime(Date.now());

    socket?.emit('fan_call_start', {
      answererId: callData.callerId,
      answererName: callData.callerName,
      callerId: currentUserId,
      callerName: currentUserName
    });
  };

  // Helper function to get display name
  const getDisplayName = (userInfo: any) => {
    return callData?.isIncoming
      ? (callData?.callerUsername || userInfo?.callerUsername || userInfo?.username || callData?.callerName || userInfo?.callerName || userInfo?.name || userInfo?.firstname || 'User')
      : (callData?.answererUsername || userInfo?.answererUsername || userInfo?.username || callData?.answererName || userInfo?.answererName || userInfo?.name || userInfo?.firstname || 'User');
  };

  // Helper function to render user profile picture or initials
  const renderUserProfile = (userInfo: any, isCreator: boolean = false) => {
    let profileImage: string | undefined;

    if (callData?.isIncoming) {
      profileImage = callData?.callerPhoto
        || userInfo?.callerPhoto
        || userInfo?.photo
        || userInfo?.photolink
        || userInfo?.photoLink
        || userInfo?.profileImage
        || userInfo?.avatar
        || userInfo?.image
        || undefined;

      if (!profileImage && callData?.callerId === userInfo?.callerId) {
        profileImage = callData?.callerPhoto || undefined;
      }

      if (!profileImage && userInfo === callData) {
        const allKeys = Object.keys(callData || {});
        for (const key of allKeys) {
          const lowerKey = key.toLowerCase();
          const value = (callData as any)[key];
          if ((lowerKey.includes('caller') && (lowerKey.includes('photo') || lowerKey.includes('avatar') || lowerKey.includes('image')))
            && typeof value === 'string' && value.trim() !== '' && value !== 'null' && value !== 'undefined' && value !== 'NOT FOUND' && value !== 'NOT PROVIDED') {
            profileImage = value;
            break;
          }
        }
      }
    } else {
      profileImage = callData?.answererPhoto
        || userInfo?.answererPhoto
        || userInfo?.photo
        || userInfo?.photolink
        || userInfo?.photoLink
        || userInfo?.profileImage
        || userInfo?.avatar
        || userInfo?.image
        || undefined;

      if (!profileImage && callData?.answererId === userInfo?.answererId) {
        profileImage = callData?.answererPhoto || undefined;
      }

      if (!profileImage && userInfo === callData) {
        const allKeys = Object.keys(callData || {});
        for (const key of allKeys) {
          const lowerKey = key.toLowerCase();
          const value = (callData as any)[key];
          if ((lowerKey.includes('answerer') && (lowerKey.includes('photo') || lowerKey.includes('avatar') || lowerKey.includes('image')))
            && typeof value === 'string' && value.trim() !== '' && value !== 'null' && value !== 'undefined' && value !== 'NOT FOUND' && value !== 'NOT PROVIDED') {
            profileImage = value;
            break;
          }
        }
      }
    }

    const userName = callData?.isIncoming
      ? (callData?.callerUsername || userInfo?.callerUsername || userInfo?.username || callData?.callerName || userInfo?.callerName || userInfo?.name || userInfo?.firstname || 'User')
      : (callData?.answererUsername || userInfo?.answererUsername || userInfo?.username || callData?.answererName || userInfo?.answererName || userInfo?.name || userInfo?.firstname || 'User');

    const firstName = callData?.isIncoming
      ? (callData?.callerFirstName || userInfo?.callerFirstName || userInfo?.firstname || '')
      : (callData?.answererFirstName || userInfo?.answererFirstName || userInfo?.firstname || '');

    const lastName = callData?.isIncoming
      ? (callData?.callerLastName || userInfo?.callerLastName || userInfo?.lastname || '')
      : (callData?.answererLastName || userInfo?.answererLastName || userInfo?.lastname || '');

    let initials = "?";
    if (firstName && lastName) {
      initials = (firstName[0] + lastName[0]).toUpperCase();
    } else if (firstName) {
      initials = firstName[0].toUpperCase();
    } else if (lastName) {
      initials = lastName[0].toUpperCase();
    } else {
      const cleanUserName = userName.replace(/^@/, '').trim();
      if (cleanUserName) {
        initials = cleanUserName.split(/\s+/).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || "?";
      } else {
        initials = "?";
      }
    }

    const hasValidImage = profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined";

    let fallbackBucket = 'profile';
    if (profileImage && profileImage.includes('gateway.storjshare.io/creator/')) {
      fallbackBucket = 'creator';
    }

    const imageSource = hasValidImage ? getImageSource(profileImage, fallbackBucket) : null;
    const imageSrc = imageSource?.src || profileImage;

    return (
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 mx-auto mb-4 flex items-center justify-center">
          {hasValidImage && imageSource ? (
            <img
              alt="Profile picture"
              src={imageSrc}
              className="w-full h-full object-cover"
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                const parent = target.parentElement;
                if (parent) {
                  const initialsDiv = parent.querySelector('.initials-fallback') as HTMLElement;
                  if (initialsDiv) {
                    initialsDiv.style.display = 'none';
                  }
                }
              }}
              onError={(e) => {
                try {
                  const target = e.target as HTMLImageElement;
                  const currentSrc = target?.src || "";

                  if (imageSource.isStorj && imageSource.originalUrl && currentSrc === imageSrc && currentSrc !== imageSource.originalUrl) {
                    target.src = imageSource.originalUrl;
                    return;
                  }

                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const initialsDiv = parent.querySelector('.initials-fallback') as HTMLElement;
                    if (initialsDiv) {
                      initialsDiv.style.display = 'flex';
                    }
                  }
                } catch (err) {
                  try {
                    const target = e.target as HTMLImageElement;
                    if (target) {
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const initialsDiv = parent.querySelector('.initials-fallback') as HTMLElement;
                        if (initialsDiv) {
                          initialsDiv.style.display = 'flex';
                        }
                      }
                    }
                  } catch { }
                }
              }}
            />
          ) : null}
          <div className="w-full h-full flex items-center justify-center text-white text-4xl font-semibold bg-gray-600 initials-fallback" style={{ display: hasValidImage && imageSource ? 'none' : 'flex' }}>
            {initials}
          </div>
        </div>

        {(() => {
          const isVip = callData?.isIncoming
            ? (userInfo?.callerIsVip || callData?.callerIsVip || userInfo?.isVip)
            : (userInfo?.answererIsVip || callData?.answererIsVip || userInfo?.isVip);

          const vipEndDate = callData?.isIncoming
            ? (userInfo?.callerVipEndDate || callData?.callerVipEndDate || userInfo?.vipEndDate)
            : (userInfo?.answererVipEndDate || callData?.answererVipEndDate || userInfo?.vipEndDate);

          return isVip ? (
            <VIPBadge
              size="xxl"
              className="absolute -top-5 -right-5"
              isVip={isVip}
              vipEndDate={vipEndDate}
            />
          ) : null;
        })()}
      </div>
    );
  };

  // Cleanup function
  const handleCleanup = useCallback(() => {
    console.log('🧹 [VideoCall] Cleaning up video call');
    setUsersCanSeeEachOther(false);
    setCallTimeout(false);
    setCallStartTime(null);
    setInsufficientFunds(false);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }

    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }

    // Stop diagnostic monitoring
    diagnostics.stopMonitoring();

    // Clean up keep-alive interval
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }

    // Clean up connection health monitoring
    if (connectionHealthRef.current) {
      clearInterval(connectionHealthRef.current);
      connectionHealthRef.current = null;
    }

    // Close data channel
    if (dataChannelRef.current) {
      try {
        dataChannelRef.current.close();
      } catch (e) {
        console.warn('⚠️ [WebRTC] Data channel close error:', e);
      }
      dataChannelRef.current = null;
    }

    if (localStream) {
      console.log('🧹 [VideoCall] Stopping local stream tracks');
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (peerConnection) {
      console.log('🧹 [VideoCall] Closing peer connection');
      peerConnection.close();
      setPeerConnection(null);
      peerConnectionRef.current = null; // CRITICAL FIX: Clear ref too
    }

    setRemoteStream(null);
    remoteStreamRef.current = null; // CRITICAL FIX: Clear stream ref
    pendingIceCandidatesRef.current = [];
  }, [localStream, peerConnection]);

  // Handle insufficient funds
  const handleInsufficientFunds = useCallback(() => {
    const isCaller = callData?.callerId === currentUserId;
    if (isCaller) {
      console.log('💰 [VideoCall] Insufficient funds detected - ending call');
      setInsufficientFunds(true);

      setTimeout(() => {
        if (socket) {
          socket.emit('fan_call_end', {
            callId: callData?.callId,
            callerId: callData?.callerId,
            userId: currentUserId,
            reason: 'insufficient_funds'
          });
        }

        handleCleanup();
        onClose();
      }, 2000);
    }
  }, [callData, currentUserId, socket, handleCleanup, onClose]);

  // Toggle video/audio
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
    showControlsTemporarily();
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
    showControlsTemporarily();
  };

  // Device detection utility
  const detectDevice = useCallback(() => {
    const ua = navigator.userAgent;
    const info = {
      isIOS: /iPhone|iPad|iPod/i.test(ua),
      isAndroid: /Android/i.test(ua),
      isSamsung: /Samsung|SM-/i.test(ua),
      isXiaomi: /Xiaomi|Redmi|Mi |POCO/i.test(ua),
      userAgent: ua
    };
    return info;
  }, []);

  // Layer 4: Diagnostic logging utility
  const logDiagnosticInfo = useCallback((stage: string, data: any) => {
    const deviceInfo = detectDevice();

    const logEntry = {
      timestamp: new Date().toISOString(),
      device: deviceInfo,
      stage,
      data,
      userAgent: navigator.userAgent
    };

    console.log(`🔍 [Diagnostic ${stage}]`, logEntry);

    // Store in state for potential display to user
    setDiagnosticLogs(prev => [...prev.slice(-20), { // Keep last 20 logs
      stage,
      time: new Date().toISOString(),
      data
    }]);
  }, [detectDevice]);

  // Permission pre-check (to provide better error messages)
  const checkPermissionState = useCallback(async (): Promise<'granted' | 'denied' | 'prompt'> => {
    try {
      // Note: Permissions API not fully supported on iOS Safari < 16
      const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });

      if (cameraPermission.state === 'denied' || micPermission.state === 'denied') {
        return 'denied';
      }
      if (cameraPermission.state === 'granted' && micPermission.state === 'granted') {
        return 'granted';
      }
      return 'prompt';
    } catch (error) {
      // Permissions API not supported (iOS Safari < 16)
      // Fall back to 'prompt' - will attempt getUserMedia
      console.log('📱 [Permissions] Permissions API not supported, will attempt getUserMedia');
      return 'prompt';
    }
  }, []);

  const toggleSpeaker = () => {
    if (mainVideoRef.current) {
      const newSpeakerState = !isSpeakerEnabled;
      mainVideoRef.current.muted = !newSpeakerState;
      setIsSpeakerEnabled(newSpeakerState);
      console.log('🔊 [VideoCall] Speaker toggled:', newSpeakerState ? 'ON' : 'OFF');
    }
    showControlsTemporarily();
  };

  // REMOVED: Auto-request user media when modal opens
  // Now permissions are requested on user action (Accept Call/Start Call)
  // This fixes iOS Safari silently denying permissions

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      handleCleanup();
    }
  }, [isOpen, handleCleanup]);

  // Helper function to safely play video with mobile fallback
  const safePlayVideo = async (videoElement: HTMLVideoElement) => {
    if (!videoElement) return;

    if (videoElement.readyState >= 2) {
      try {
        await videoElement.play();
        console.log('✅ [VideoCall] Video playing successfully');
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.warn('⚠️ [VideoCall] Video play error:', e.name, e.message);

          // If autoplay fails on mobile (likely due to autoplay policy with audio)
          // Try muting and playing again
          if (e.name === 'NotAllowedError' && !videoElement.muted) {
            console.log('🔄 [VideoCall] Retrying video playback with muted=true');
            videoElement.muted = true;
            try {
              await videoElement.play();
              console.log('✅ [VideoCall] Video playing (muted fallback)');
            } catch (retryError: any) {
              console.error('❌ [VideoCall] Video play failed even with muted:', retryError);
            }
          }
        }
      }
    } else {
      console.log('⏳ [VideoCall] Video not ready yet, readyState:', videoElement.readyState);
    }
  };

  // Update video elements when streams change
  useEffect(() => {
    if (localStream) {
      if (thumbnailVideoRef.current) {
        thumbnailVideoRef.current.srcObject = localStream;
        setTimeout(() => safePlayVideo(thumbnailVideoRef.current!), 100);
      }
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream) {
      console.log('📹 [VideoCall] Setting remote video in main container:', {
        hasRemoteStream: !!remoteStream,
        hasMainVideoRef: !!mainVideoRef.current,
        streamTracks: remoteStream.getTracks().length,
        videoTracks: remoteStream.getVideoTracks().map(t => ({
          id: t.id,
          enabled: t.enabled,
          readyState: t.readyState,
          muted: t.muted
        }))
      });
      if (mainVideoRef.current) {
        const videoElement = mainVideoRef.current;

        console.log('🔴 [FREEZE DEBUG] useEffect triggered', {
          currentSrcObjectId: (videoElement.srcObject as MediaStream)?.id,
          newStreamId: remoteStream.id,
          isSameStream: videoElement.srcObject === remoteStream,
          videoTracks: remoteStream.getVideoTracks().length,
          audioTracks: remoteStream.getAudioTracks().length
        });

        // Check if this is the same stream already attached
        if (videoElement.srcObject === remoteStream) {
          console.log('🔴 [FREEZE DEBUG] Stream already attached, skipping re-attachment');
          return;
        }

        console.log('🔴 [FREEZE DEBUG] Calling attachStreamToVideo...');
        // Use cross-browser video attachment utility
        attachStreamToVideo(videoElement, remoteStream, !isSpeakerEnabled)
          .then(() => {
            console.log('🔴 [FREEZE DEBUG] ✅ Remote video attached successfully', {
              videoWidth: videoElement.videoWidth,
              videoHeight: videoElement.videoHeight,
              readyState: videoElement.readyState,
              paused: videoElement.paused
            });
          })
          .catch((error) => {
            console.error('❌ [VideoCall] Failed to attach remote video:', error);
            safePlayVideo(videoElement);
          });
      }
    }
  }, [remoteStream, isSpeakerEnabled]);

  // Set usersCanSeeEachOther when both streams are available
  useEffect(() => {
    if (localStream && remoteStream && !usersCanSeeEachOther) {
      console.log('✅ [VideoCall] Both streams available - users can see each other');
      setUsersCanSeeEachOther(true);
    }
  }, [localStream, remoteStream, usersCanSeeEachOther]);

  // Socket event listeners - FIXED with proper offer/answer/ICE handling
  useEffect(() => {
    if (!socket || !isOpen) return;

    const handleCallAccepted = async (data: any) => {
      console.log('📞 [VideoCall] Call accepted:', data);
      setCallStatus('connecting');

      // Ensure we have local media before creating peer connection
      let stream = localStream;
      if (!stream) {
        console.log('📹 [VideoCall] Getting user media before creating peer connection');
        stream = await getUserMedia();
        if (!stream) {
          console.error('❌ [VideoCall] Failed to get user media');
          setCallStatus('ended');
          return;
        }
      }

      // Only the original caller should create the peer connection and offer
      if (data.callerId === currentUserId && !callData?.isIncoming) {
        console.log('📹 [VideoCall] I am the caller - creating peer connection and offer');

        // CRITICAL: Await peer connection creation
        const pc = await createPeerConnection();
        peerConnectionRef.current = pc; // CRITICAL FIX: Set ref immediately
        setPeerConnection(pc);

        // Add local tracks to peer connection
        stream.getTracks().forEach(track => {
          console.log('📹 [WebRTC] Adding local track:', track.kind);
          pc.addTrack(track, stream);
        });

        try {
          // Use cross-browser utility for offer with codec preference
          const offer = await createOfferWithCodecPreference(pc);
          console.log('📹 [WebRTC] Created offer with codec preference');

          await pc.setLocalDescription(offer);
          console.log('📹 [WebRTC] Set local description (offer)');

          socket.emit('fan_call_offer', {
            callId: callData?.callId,
            offer: pc.localDescription
          });
          console.log('📹 [WebRTC] Sent offer to peer');
        } catch (error) {
          console.error('❌ [VideoCall] Error creating/sending offer:', error);
        }
      } else {
        console.log('📹 [VideoCall] I am the answerer - waiting for offer');
      }

      setCallStatus('connected');
    };

    const handleOffer = async (data: any) => {
      console.log('📹 [WebRTC] Received offer:', {
        callId: data.callId,
        currentCallId: callData?.callId,
        isIncoming: callData?.isIncoming,
        hasPeerConnection: !!peerConnection
      });

      const isCorrectCall = data.callId === callData?.callId || data.callId.startsWith('temp_');

      if (isCorrectCall && !peerConnectionRef.current && callData?.isIncoming) {
        console.log('📹 [WebRTC] Processing offer as answerer');

        // Validate SDP before processing
        if (!validateSDP(data.offer)) {
          console.error('❌ [WebRTC] Rejecting invalid offer SDP');
          return;
        }

        // CRITICAL: Create peer connection FIRST before anything else (now with await)
        const pc = await createPeerConnection();

        // CRITICAL FIX: Set ref immediately (synchronous) AND state (async)
        peerConnectionRef.current = pc;
        setPeerConnection(pc);

        // Ensure we have local media
        let stream = localStream;
        if (!stream) {
          console.log('📹 [VideoCall] Getting user media before processing offer');
          stream = await getUserMedia();
          if (!stream) {
            console.error('❌ [VideoCall] Failed to get user media');
            return;
          }
        }

        // Add local tracks
        stream.getTracks().forEach(track => {
          console.log('📹 [WebRTC] Adding local track:', track.kind);
          pc.addTrack(track, stream);
        });

        try {
          console.log('📹 [WebRTC] Setting remote description (offer)');
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          console.log('✅ [WebRTC] Remote description set successfully');

          // Use cross-browser utility for answer with codec preference
          console.log('📹 [WebRTC] Creating answer with codec preference');
          const answer = await createAnswerWithCodecPreference(pc);
          console.log('📹 [WebRTC] Created answer with codec preference');

          await pc.setLocalDescription(answer);
          console.log('📹 [WebRTC] Set local description (answer)');

          socket.emit('fan_call_answer', {
            callId: callData?.callId || data.callId,
            answer: answer
          });
          console.log('📹 [WebRTC] Sent answer to peer');

          // Process any pending ICE candidates now that remote description is set
          if (pendingIceCandidatesRef.current.length > 0) {
            console.log('📹 [WebRTC] Processing pending ICE candidates after setting remote description');
            await processPendingIceCandidates(pc);
          }
        } catch (error) {
          console.error('❌ [VideoCall] Error processing offer:', error);
        }
      } else {
        console.log('📹 [WebRTC] Ignoring offer:', {
          isCorrectCall,
          hasPeerConnection: !!peerConnection,
          isIncoming: callData?.isIncoming
        });
      }
    };

    const handleAnswer = async (data: any) => {
      console.log('📹 [WebRTC] Received answer:', {
        callId: data.callId,
        currentCallId: callData?.callId,
        hasPeerConnection: !!peerConnection
      });

      const isCorrectCall = data.callId === callData?.callId || data.callId.startsWith('temp_');

      if (isCorrectCall && peerConnection) {
        // Validate SDP before processing
        if (!validateSDP(data.answer)) {
          console.error('❌ [WebRTC] Rejecting invalid answer SDP');
          return;
        }

        try {
          console.log('📹 [WebRTC] Setting remote description (answer)');
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
          console.log('✅ [WebRTC] Remote description set successfully');

          // Process any pending ICE candidates now that remote description is set
          if (pendingIceCandidatesRef.current.length > 0) {
            console.log('📹 [WebRTC] Processing pending ICE candidates after setting remote description');
            await processPendingIceCandidates(peerConnection);
          }
        } catch (error) {
          console.error('❌ [VideoCall] Error setting remote description:', error);
        }
      }
    };

    const handleIceCandidate = async (data: any) => {
      const shouldAccept = data.callId === callData?.callId || data.callId.startsWith('temp_');

      // CRITICAL FIX: Use ref instead of state for immediate check
      const pc = peerConnectionRef.current;

      console.log('📹 [WebRTC] Received ICE candidate:', {
        callId: data.callId,
        currentCallId: callData?.callId,
        shouldAccept,
        hasPeerConnection: !!pc,
        hasRemoteDescription: !!peerConnection?.remoteDescription,
        connectionState: peerConnection?.connectionState,
        iceConnectionState: peerConnection?.iceConnectionState
      });

      if (shouldAccept) {
        // CRITICAL FIX: Check ref-based peer connection
        if (!pc) {
          console.log('📹 [WebRTC] No peer connection yet, queuing ICE candidate');
          pendingIceCandidatesRef.current.push(data.candidate);
          return;
        }

        if (!pc.remoteDescription) {
          console.log('📹 [WebRTC] No remote description yet, queuing ICE candidate');
          pendingIceCandidatesRef.current.push(data.candidate);
          return;
        }

        // Peer connection is ready, add candidate immediately
        try {
          console.log('📹 [WebRTC] Adding ICE candidate to peer connection');
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          console.log('✅ [WebRTC] ICE candidate added successfully');
        } catch (error) {
          console.error('❌ [WebRTC] Error adding ICE candidate:', error);
          // If we fail to add, queue it for later retry
          pendingIceCandidatesRef.current.push(data.candidate);
        }
      }
    };
    const handleCallEnded = (data?: any) => {
      if (data && data.callId && callData?.callId && data.callId !== callData.callId) {
        return;
      }

      console.log('📞 [VideoCall] Call ended event received, closing immediately');
      handleCleanup();
      onClose();
    };

    const handleCallTimeout = () => {
      if (callData?.isIncoming) {
        handleCleanup();
        onClose();
      }
    };

    const handleMissedCall = (data: any) => {
      // Handled by parent component
    };

    const handleInsufficientFundsFromServer = (data: any) => {
      console.log('💰 [VideoCall] Insufficient funds received from server:', data);
      const isCaller = callData?.callerId === currentUserId;
      if ((data.callId === callData?.callId || !data.callId) && isCaller) {
        handleInsufficientFunds();
      }
    };

    socket.on('fan_call_accepted', handleCallAccepted);
    socket.on('fan_call_offer', handleOffer);
    socket.on('fan_call_answer', handleAnswer);
    socket.on('fan_call_ice_candidate', handleIceCandidate);
    socket.on('fan_call_ended', handleCallEnded);
    socket.on('fan_call_timeout', handleCallTimeout);
    socket.on('fan_call_missed', handleMissedCall);
    socket.on('insufficient_funds', handleInsufficientFundsFromServer);

    return () => {
      socket.off('fan_call_accepted', handleCallAccepted);
      socket.off('fan_call_offer', handleOffer);
      socket.off('fan_call_answer', handleAnswer);
      socket.off('fan_call_ice_candidate', handleIceCandidate);
      socket.off('fan_call_ended', handleCallEnded);
      socket.off('fan_call_timeout', handleCallTimeout);
      socket.off('fan_call_missed', handleMissedCall);
      socket.off('insufficient_funds', handleInsufficientFundsFromServer);
    };
  }, [socket, isOpen, currentUserId, callData, peerConnection, localStream, createPeerConnection, handleCleanup, onClose, handleInsufficientFunds, processPendingIceCandidates]);

  // Process pending ICE candidates when remote description is set
  useEffect(() => {
    if (peerConnection?.remoteDescription && pendingIceCandidatesRef.current.length > 0) {
      console.log('📹 [WebRTC] Remote description set, processing pending candidates:',
        pendingIceCandidatesRef.current.length);
      processPendingIceCandidates(peerConnection);
    }
  }, [peerConnection?.remoteDescription, processPendingIceCandidates]);

  // Start auto-hide timer when call connects
  useEffect(() => {
    if (callStatus === 'connected' && usersCanSeeEachOther) {
      showControlsTemporarily();
    }
  }, [callStatus, usersCanSeeEachOther, showControlsTemporarily]);

  if (!isOpen || !callData) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-90 flex items-center justify-center">
      <div className="w-full h-full flex flex-col">

        {/* Media Error Modal */}
        {mediaError && (
          <div className="fixed inset-0 z-[10000] bg-black bg-opacity-90 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Camera/Microphone Access Issue</h3>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                  {mediaError}
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setMediaError(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setMediaError(null);
                    getUserMedia();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Insufficient Funds Notification */}
        {insufficientFunds && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10000] bg-red-600 bg-opacity-95 text-white px-8 py-6 rounded-lg shadow-2xl text-center max-w-md">
            <div className="flex flex-col items-center gap-4">
              <div className="text-5xl">💰</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Insufficient Funds</h3>
                <p className="text-sm opacity-90">
                  You don't have enough balance to continue this call. The call will end shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Call Timer and Billing */}
        {callStatus === 'connected' && usersCanSeeEachOther && !insufficientFunds && (
          <VideoCallBilling
            callId={callData?.callId}
            callerId={callData?.callerId}
            currentUserId={currentUserId}
            isCreator={isCreator}
            userBalance={userBalance}
            creatorEarnings={creatorEarnings}
            callRate={callRate}
            isConnected={true}
            onInsufficientFunds={handleInsufficientFunds}
            callData={callData}
          />
        )}

        {/* Main Video Display */}
        <div className="flex-1 relative bg-[#080b14] cursor-pointer" onClick={handleVideoAreaClick}>
          {remoteStream ? (
            <video
              ref={mainVideoRef}
              autoPlay
              playsInline
              muted={false}
              className="w-full h-full object-cover"
              onError={(e) => console.error('Main video error:', e)}
              onLoadStart={() => console.log('📹 [VideoCall] Main video load started')}
              onCanPlay={() => {
                console.log('📹 [VideoCall] Main video can play');
                if (mainVideoRef.current) {
                  safePlayVideo(mainVideoRef.current);
                }
              }}
              onPlay={() => console.log('📹 [VideoCall] Main video started playing')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                {callTimeout ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-xl font-semibold mb-2">Not Answered</p>
                      <p className="text-gray-400">The call was not answered after 30 seconds</p>
                    </div>

                    {renderUserProfile(callData, isCreator)}

                    <div className="space-y-3">
                      <p className="text-lg font-medium">
                        {getDisplayName(callData)}
                      </p>
                      <p className="text-sm text-blue-400">
                        {callData?.isIncoming ? 'Fan' : 'Creator'}
                      </p>
                    </div>

                    {!callData?.isIncoming && (
                      <button
                        onClick={handleCallAgain}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                      >
                        Call Again
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {renderUserProfile(callData, isCreator)}

                    <div className="space-y-3">
                      <p className="text-lg font-medium">
                        {getDisplayName(callData)}
                      </p>
                      <p className="text-sm text-blue-400">
                        {callData?.isIncoming ? 'Fan' : 'Creator'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {callData?.isIncoming ? 'Incoming call...' : 'Calling...'}
                      </p>
                    </div>

                    {callStartTime && (
                      <p className="text-sm text-gray-500">
                        {Math.floor((Date.now() - callStartTime) / 1000)}s
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Picture in Picture */}
        {(localStream || remoteStream) && (
          <div className="absolute bottom-20 right-4 w-24 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
            {localStream ? (
              <video
                ref={thumbnailVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onError={(e) => console.error('Thumbnail video error:', e)}
                onCanPlay={() => {
                  if (thumbnailVideoRef.current) {
                    safePlayVideo(thumbnailVideoRef.current);
                  }
                }}
              />
            ) : remoteStream ? (
              <video
                ref={thumbnailVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                onError={(e) => console.error('Thumbnail video error:', e)}
                onCanPlay={() => {
                  if (thumbnailVideoRef.current) {
                    safePlayVideo(thumbnailVideoRef.current);
                  }
                }}
              />
            ) : null}
          </div>
        )}

        {/* Call Controls */}
        <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${(showControls || callStatus === 'ringing' || callStatus === 'connecting' || callTimeout) ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center gap-4">
            {callStatus === 'ringing' && callData.isIncoming && !callTimeout && (
              <>
                <button
                  onClick={handleDeclineCall}
                  className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors"
                >
                  <IoClose className="text-2xl" />
                </button>
                <button
                  onClick={handleAcceptCall}
                  className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors"
                >
                  <IoCallSharp className="text-2xl" />
                </button>
              </>
            )}

            {callStatus === 'ringing' && !callData.isIncoming && !callTimeout && (
              <button
                onClick={handleEndCall}
                className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors"
              >
                <IoClose className="text-2xl" />
              </button>
            )}

            {callTimeout && !callData?.isIncoming && (
              <button
                onClick={handleEndCall}
                className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors"
              >
                <IoClose className="text-2xl" />
              </button>
            )}

            {callStatus === 'connected' && (
              <>
                <button
                  onClick={toggleAudio}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${isAudioEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                  {isAudioEnabled ? <IoMic className="text-xl" /> : <IoMicOff className="text-xl" />}
                </button>

                <button
                  onClick={handleEndCall}
                  className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors"
                >
                  <IoCall className="text-2xl" />
                </button>

                <button
                  onClick={toggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${isVideoEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                  {isVideoEnabled ? <IoVideocam className="text-xl" /> : <IoVideocamOff className="text-xl" />}
                </button>

                <button
                  onClick={toggleSpeaker}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${isSpeakerEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  title={isSpeakerEnabled ? 'Mute speaker' : 'Unmute speaker'}
                >
                  {isSpeakerEnabled ? <IoVolumeHigh className="text-xl" /> : <IoVolumeMute className="text-xl" />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}