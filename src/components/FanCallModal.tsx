// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { IoCall, IoCallSharp, IoVideocam, IoVideocamOff, IoMic, IoMicOff, IoClose, IoVolumeHigh, IoVolumeMute } from 'react-icons/io5';
import { getSocket } from '@/lib/socket';
import VideoCallBilling from './FanCallBilling';
import VIPBadge from './VIPBadge';
import { getImageSource } from '@/lib/imageUtils';

// Mobile detection utility
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const isIOSDevice = () => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
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
  const [callTimeout, setCallTimeout] = useState(false);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [insufficientFunds, setInsufficientFunds] = useState(false);

  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const thumbnailVideoRef = useRef<HTMLVideoElement>(null);
  const pendingIceCandidatesRef = useRef<any[]>([]);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const socket = getSocket();

  // Check for insecure context when modal opens
  useEffect(() => {
    if (isOpen) {
      const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isNetworkIP = /^\d+\.\d+\.\d+\.\d+/.test(window.location.hostname);

      if (!isSecureContext) {
        setShowInsecureWarning(true);
      }
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

  // Get user media - ENHANCED with mobile optimization
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

      const isMobile = isMobileDevice();
      const isIOS = isIOSDevice();

      // Mobile-optimized constraints for better compatibility and performance
      const constraints = {
        video: isVideoEnabled ? {
          width: { ideal: isMobile ? 640 : 1280 },
          height: { ideal: isMobile ? 480 : 720 },
          frameRate: { ideal: isMobile ? 24 : 30 },
          facingMode: 'user'
        } : false,
        audio: isAudioEnabled ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // iOS-specific: use lower sample rate for better compatibility
          ...(isIOS ? { sampleRate: 48000 } : {})
        } : false
      };

      console.log('📹 [VideoCall] Using constraints:', constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log('✅ [VideoCall] Got user media stream:', {
        id: stream.id,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
        videoSettings: stream.getVideoTracks()[0]?.getSettings(),
        audioSettings: stream.getAudioTracks()[0]?.getSettings()
      });

      setLocalStream(stream);
      return stream;
    } catch (error: any) {
      console.error('❌ [VideoCall] Error accessing media devices:', error);

      const isMobile = isMobileDevice();
      const isNetworkIP = /^\d+\.\d+\.\d+\.\d+/.test(window.location.hostname);

      if (error.name === 'NotAllowedError') {
        if (isMobile && isNetworkIP) {
          setMediaError('Camera access denied on mobile device.\n\nMobile browsers require HTTPS for camera access.\n\nSolutions:\n1. Use localhost:3000 on your computer\n2. Set up HTTPS for your development server\n3. Use a different device with desktop browser\n\nFor mobile testing, you need HTTPS or localhost access.');
        } else {
          setMediaError('Camera and microphone access denied. Please allow access and try again.\n\nTo fix this:\n1. Click the camera/mic icon in your browser address bar\n2. Select "Allow" for camera and microphone\n3. Refresh the page and try again');
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

  // Create peer connection - ENHANCED with better event handlers and TURN servers
  const createPeerConnection = useCallback(() => {
    console.log('📹 [WebRTC] Creating new peer connection');

    const pc = new RTCPeerConnection({
      iceServers: [
        // Google STUN servers
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        // Free TURN servers for fallback (you should replace with your own in production)
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443?transport=tcp',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ],
      iceCandidatePoolSize: 10,
      // Important: bundle policy for better compatibility
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      // Try to use all ICE candidates
      iceTransportPolicy: 'all'
    });

    // Handle incoming remote stream - ENHANCED with track validation
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

        if (activeTracks.length === 0) {
          console.warn('⚠️ [WebRTC] Received stream has no active tracks, waiting for tracks to become live');
          // Still set the stream - tracks may become active later
        }

        setRemoteStream(newRemoteStream);
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
    setCallStatus('connecting');

    // Ensure we have local media before proceeding
    let stream = localStream;
    if (!stream) {
      console.log('📹 [VideoCall] Getting user media before accepting');
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

    if (localStream) {
      console.log('🧹 [VideoCall] Stopping local stream tracks');
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (peerConnection) {
      console.log('🧹 [VideoCall] Closing peer connection');
      peerConnection.close();
      setPeerConnection(null);
    }

    setRemoteStream(null);
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

  const toggleSpeaker = () => {
    if (mainVideoRef.current) {
      const newSpeakerState = !isSpeakerEnabled;
      mainVideoRef.current.muted = !newSpeakerState;
      setIsSpeakerEnabled(newSpeakerState);
      console.log('🔊 [VideoCall] Speaker toggled:', newSpeakerState ? 'ON' : 'OFF');
    }
    showControlsTemporarily();
  };

  // Auto-request user media when modal opens
  useEffect(() => {
    if (isOpen && !localStream) {
      getUserMedia();
    }
  }, [isOpen, localStream]);

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
        const isMobile = isMobileDevice();
        const isIOS = isIOSDevice();

        // Set stream
        videoElement.srcObject = remoteStream;

        // CRITICAL FIX: Mobile browsers require muted attribute for autoplay
        // Start muted for autoplay compliance, will unmute after playback starts
        const shouldStartMuted = isMobile;
        videoElement.muted = shouldStartMuted;

        console.log('📹 [VideoCall] Video element muted setting:', {
          isMobile,
          muted: videoElement.muted,
          reason: shouldStartMuted ? 'Mobile autoplay policy - will unmute after play' : 'Desktop - unmuted'
        });

        // Set required attributes for mobile/iOS compatibility
        videoElement.setAttribute('playsinline', 'true');
        videoElement.setAttribute('webkit-playsinline', 'true');
        videoElement.setAttribute('autoplay', 'true');

        // iOS-specific attributes
        if (isIOS) {
          videoElement.setAttribute('x-webkit-airplay', 'allow');
          // Note: Don't set 'controls' attribute - it should remain hidden
        }

        // Add loadedmetadata listener for better stream handling
        const handleLoadedMetadata = () => {
          console.log('📹 [VideoCall] Remote video metadata loaded');
          safePlayVideo(videoElement);
        };

        // Add playing listener to unmute after successful autoplay on mobile
        const handlePlaying = () => {
          if (isMobile && videoElement.muted && isSpeakerEnabled) {
            // Successfully started playing - now unmute for audio
            setTimeout(() => {
              videoElement.muted = false;
              console.log('🔊 [VideoCall] Auto-unmuted after successful playback on mobile');
            }, 500);
          }
        };

        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.addEventListener('playing', handlePlaying);

        // Attempt to play
        setTimeout(() => safePlayVideo(videoElement), 100);

        // Cleanup listeners
        return () => {
          videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
          videoElement.removeEventListener('playing', handlePlaying);
        };
      }
    }
  }, [remoteStream]);

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

        const pc = createPeerConnection();
        setPeerConnection(pc);

        // Add local tracks to peer connection
        stream.getTracks().forEach(track => {
          console.log('📹 [WebRTC] Adding local track:', track.kind);
          pc.addTrack(track, stream);
        });

        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          console.log('📹 [WebRTC] Created offer');

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

      if (isCorrectCall && !peerConnection && callData?.isIncoming) {
        console.log('📹 [WebRTC] Processing offer as answerer');

        // CRITICAL: Create peer connection FIRST before anything else
        const pc = createPeerConnection();

        // CRITICAL: Set it immediately so ICE candidates can be queued to it
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

          console.log('📹 [WebRTC] Creating answer');
          const answer = await pc.createAnswer();
          console.log('📹 [WebRTC] Created answer');

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

      console.log('📹 [WebRTC] Received ICE candidate:', {
        callId: data.callId,
        currentCallId: callData?.callId,
        shouldAccept,
        hasPeerConnection: !!peerConnection,
        hasRemoteDescription: !!peerConnection?.remoteDescription,
        connectionState: peerConnection?.connectionState,
        iceConnectionState: peerConnection?.iceConnectionState
      });

      if (shouldAccept) {
        // CRITICAL FIX: Always queue candidates if we don't have a peer connection yet
        // This handles the race condition where ICE candidates arrive before the offer
        if (!peerConnection) {
          console.log('📹 [WebRTC] Queueing ICE candidate - no peer connection yet');
          pendingIceCandidatesRef.current.push(data.candidate);
          console.log('📹 [WebRTC] Pending candidates queue size:', pendingIceCandidatesRef.current.length);
          return;
        }

        try {
          if (peerConnection.remoteDescription) {
            console.log('📹 [WebRTC] Adding ICE candidate immediately');
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            console.log('✅ [WebRTC] ICE candidate added successfully');
          } else {
            console.log('📹 [WebRTC] Queueing ICE candidate - no remote description yet');
            pendingIceCandidatesRef.current.push(data.candidate);
            console.log('📹 [WebRTC] Pending candidates queue size:', pendingIceCandidatesRef.current.length);
          }
        } catch (error) {
          console.error('❌ [WebRTC] Error adding ICE candidate:', error);
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
        <div className="flex-1 relative bg-gray-900 cursor-pointer" onClick={handleVideoAreaClick}>
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