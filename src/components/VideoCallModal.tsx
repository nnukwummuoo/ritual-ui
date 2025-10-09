"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoCall, IoCallSharp, IoVideocam, IoVideocamOff, IoMic, IoMicOff, IoClose } from 'react-icons/io5';
import { getSocket } from '@/lib/socket';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callData: {
    callerId: string;
    callerName: string;
    callerPhoto?: string;
    isIncoming: boolean; // true for incoming call, false for outgoing call
    callId?: string;
  } | null;
  currentUserId: string;
  currentUserName: string;
}

export default function VideoCallModal({ 
  isOpen, 
  onClose, 
  callData, 
  currentUserId, 
  currentUserName 
}: VideoCallModalProps) {
  const [callStatus, setCallStatus] = useState<'ringing' | 'connecting' | 'connected' | 'ended'>('ringing');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [usersCanSeeEachOther, setUsersCanSeeEachOther] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callStartTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingIceCandidatesRef = useRef<any[]>([]);
  const socket = getSocket();

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start call timer - only when users can actually see each other
  const startCallTimer = () => {
    console.log('⏱️ [VideoCall] Starting call timer - users can see each other');
    callStartTimeRef.current = Date.now();
    durationIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
      setCallDuration(elapsed);
    }, 1000);
  };

  // Stop call timer
  const stopCallTimer = () => {
    console.log('⏱️ [VideoCall] Stopping call timer');
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  // Process pending ICE candidates
  const processPendingIceCandidates = async (pc: RTCPeerConnection) => {
    console.log('📹 [WebRTC] Processing pending ICE candidates:', pendingIceCandidatesRef.current.length);
    while (pendingIceCandidatesRef.current.length > 0) {
      const candidate = pendingIceCandidatesRef.current.shift();
      try {
        await pc.addIceCandidate(candidate);
        console.log('📹 [WebRTC] Added pending ICE candidate');
      } catch (error) {
        console.error('❌ [WebRTC] Error adding pending ICE candidate:', error);
      }
    }
  };

  // Debug function to check SDP content
  const debugSDP = (description: RTCSessionDescription, label: string) => {
    console.log(`🔍 [SDP Debug] ${label}:`, {
      type: description.type,
      sdp: description.sdp,
      hasVideo: description.sdp.includes('m=video'),
      hasAudio: description.sdp.includes('m=audio'),
      videoTracks: (description.sdp.match(/a=msid:/g) || []).length,
      audioTracks: (description.sdp.match(/a=rtcp-mux/g) || []).length
    });
  };

  // Check if users can see each other (both have streams and connection is established)
  const checkUsersCanSeeEachOther = () => {
    const hasLocalStream = !!localStream;
    const hasRemoteStream = !!remoteStream;
    const hasPeerConnection = !!peerConnection;
    
    // Use multiple connection state indicators
    const isConnected = peerConnection?.connectionState === 'connected';
    const isIceConnected = peerConnection?.iceConnectionState === 'connected' || 
                          peerConnection?.iceConnectionState === 'completed';
    const isSignalingStable = peerConnection?.signalingState === 'stable';
    
    // Users can see each other if they have both streams and connection is established
    // Be more lenient with connection states for initial display
    const canSee = hasLocalStream && hasRemoteStream && hasPeerConnection && 
                  (isConnected || isIceConnected || isSignalingStable);
    
    console.log('👥 [VideoCall] Checking visibility:', {
      localStream: hasLocalStream,
      remoteStream: hasRemoteStream,
      peerConnection: hasPeerConnection,
      connectionState: peerConnection?.connectionState,
      iceConnectionState: peerConnection?.iceConnectionState,
      signalingState: peerConnection?.signalingState,
      canSee,
      currentUsersCanSeeEachOther: usersCanSeeEachOther
    });
    
    // Debug SDP if peer connection exists
    if (peerConnection) {
      if (peerConnection.localDescription) {
        debugSDP(peerConnection.localDescription, 'Local Description');
      }
      if (peerConnection.remoteDescription) {
        debugSDP(peerConnection.remoteDescription, 'Remote Description');
      }
    }
    
    if (canSee && !usersCanSeeEachOther) {
      console.log('👥 [VideoCall] ✅ Users can now see each other! Starting timer...');
      setUsersCanSeeEachOther(true);
      startCallTimer();
    } else if (!canSee && usersCanSeeEachOther) {
      console.log('👥 [VideoCall] ❌ Users can no longer see each other. Stopping timer...');
      setUsersCanSeeEachOther(false);
      stopCallTimer();
    }
    
    return canSee;
  };

  // Get user media
  const getUserMedia = async () => {
    try {
      console.log('📹 [VideoCall] Requesting user media...');
      console.log('📹 [VideoCall] Video enabled:', isVideoEnabled, 'Audio enabled:', isAudioEnabled);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      console.log('📹 [VideoCall] Got user media stream:', stream);
      console.log('📹 [VideoCall] Stream tracks:', stream.getTracks().map(track => ({
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState
      })));
      
      setLocalStream(stream);
      
      // Try to set video source immediately
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log('📹 [VideoCall] Set local video source to video element');
      } else {
        console.log('❌ [VideoCall] Local video ref is null, will retry when component renders');
      }
      return stream;
    } catch (error) {
      console.error('❌ [VideoCall] Error accessing media devices:', error);
      
      // Handle specific error types
      if (error.name === 'NotReadableError') {
        console.error('❌ [VideoCall] Camera is already in use by another application');
        // Try to stop any existing streams first
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
          setLocalStream(null);
        }
        // Retry after a short delay
        setTimeout(() => {
          console.log('📹 [VideoCall] Retrying media access...');
          getUserMedia();
        }, 1000);
      } else if (error.name === 'NotAllowedError') {
        console.error('❌ [VideoCall] Camera permission denied');
      } else if (error.name === 'NotFoundError') {
        console.error('❌ [VideoCall] No camera found');
      }
      
      return null;
    }
  };

  // Handle accept call
  const handleAcceptCall = async () => {
    if (!callData || !socket) return;
    
    setCallStatus('connecting');
    
    // Get user media if we don't have it yet
    if (!localStream) {
      const stream = await getUserMedia();
      if (!stream) {
        setCallStatus('ended');
        return;
      }
    }

    // Emit accept call event
    socket.emit('video_call_accept', {
      callId: callData.callId,
      callerId: callData.callerId,
      answererId: currentUserId,
      answererName: currentUserName
    });

    setCallStatus('connected');
    console.log('👥 [VideoCall] Call accepted - waiting for video streams to establish...');
  };

  // Handle decline call
  const handleDeclineCall = () => {
    if (!callData || !socket) return;
    
    socket.emit('video_call_decline', {
      callId: callData.callId,
      callerId: callData.callerId,
      answererId: currentUserId
    });
    
    setCallStatus('ended');
    onClose();
  };

  // Handle end call
  const handleEndCall = () => {
    if (!socket) return;
    
    socket.emit('video_call_end', {
      callId: callData?.callId,
      callerId: callData?.callerId,
      userId: currentUserId
    });
    
    setCallStatus('ended');
    stopCallTimer();
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Close peer connection
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    
    onClose();
  };

  // Handle start call (for outgoing calls)
  const handleStartCall = async () => {
    if (!callData || !socket) return;
    
    setCallStatus('connecting');
    
    // Get user media if we don't have it yet
    if (!localStream) {
      const stream = await getUserMedia();
      if (!stream) {
        setCallStatus('ended');
        return;
      }
    }

    // Emit start call event
    socket.emit('video_call_start', {
      callerId: currentUserId,
      callerName: currentUserName,
      answererId: callData.callerId,
      answererName: callData.callerName
    });
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // WebRTC setup
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  // Auto-request user media when modal opens
  useEffect(() => {
    if (isOpen && !localStream) {
      console.log('📹 [VideoCall] Modal opened, requesting user media...');
      // Add a small delay to prevent multiple simultaneous requests
      const timeoutId = setTimeout(() => {
        getUserMedia();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen && localStream) {
      console.log('📹 [VideoCall] Modal closed, stopping local stream...');
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  }, [isOpen, localStream]);

  // Debug local stream changes
  useEffect(() => {
    console.log('📹 [VideoCall] Local stream changed:', localStream);
    if (localStream) {
      console.log('📹 [VideoCall] Local stream tracks:', localStream.getTracks().map(track => ({
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState
      })));
    }
  }, [localStream]);

  // Debug remote stream changes
  useEffect(() => {
    console.log('📹 [VideoCall] Remote stream changed:', remoteStream);
    if (remoteStream) {
      console.log('📹 [VideoCall] Remote stream tracks:', remoteStream.getTracks().map(track => ({
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState
      })));
    }
    // Check if users can see each other when remote stream changes
    setTimeout(() => checkUsersCanSeeEachOther(), 100);
  }, [remoteStream]);

  // Monitor visibility state changes
  useEffect(() => {
    console.log('👥 [VideoCall] Users can see each other:', usersCanSeeEachOther);
    if (usersCanSeeEachOther) {
      console.log('👥 [VideoCall] ✅ MAIN CONTAINER NOW SHOWS OTHER USER');
      console.log('👥 [VideoCall] ✅ PICTURE-IN-PICTURE NOW SHOWS SELF');
    } else {
      console.log('👥 [VideoCall] ❌ MAIN CONTAINER SHOWS SELF (waiting for connection)');
    }
  }, [usersCanSeeEachOther]);

  // Monitor peer connection and remote stream state
  useEffect(() => {
    if (peerConnection && !remoteStream) {
      console.log('👥 [VideoCall] Peer connection exists but no remote stream - checking for recovery');
      // Try to recover remote stream from peer connection
      const pcRemoteStream = (peerConnection as any).remoteStream;
      if (pcRemoteStream) {
        console.log('👥 [VideoCall] Recovering remote stream from peer connection');
        setRemoteStream(pcRemoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = pcRemoteStream;
        }
      }
    }
  }, [peerConnection, remoteStream]);

  // Stream recovery mechanism
  const recoverStreams = useCallback(() => {
    if (peerConnection && !remoteStream) {
      console.log('🔄 [VideoCall] Attempting to recover streams...');
      
      // Try to get remote stream from peer connection
      // Note: getRemoteStreams() is deprecated, but we'll use it as fallback
      const remoteStreams = (peerConnection as any).getRemoteStreams?.() || [];
      if (remoteStreams.length > 0) {
        console.log('🔄 [VideoCall] Found remote streams:', remoteStreams);
        setRemoteStream(remoteStreams[0]);
      }
      
      // Ensure local stream is applied
      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    }
  }, [peerConnection, remoteStream, localStream]);

  // Periodic visibility check when connected
  useEffect(() => {
    if (callStatus === 'connected' && peerConnection) {
      const interval = setInterval(() => {
        console.log('👥 [VideoCall] Periodic visibility check');
        checkUsersCanSeeEachOther();
        recoverStreams(); // Also attempt stream recovery
      }, 2000); // Check every 2 seconds

      return () => clearInterval(interval);
    }
  }, [callStatus, peerConnection, recoverStreams]);

  // Add connection timeout
  useEffect(() => {
    if (callStatus === 'connecting') {
      const connectionTimeout = setTimeout(() => {
        if (!usersCanSeeEachOther) {
          console.log('⏰ [VideoCall] Connection timeout - attempting recovery');
          recoverStreams();
          // Optionally re-initiate the connection
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(connectionTimeout);
    }
  }, [callStatus, usersCanSeeEachOther, recoverStreams]);

  // Ensure local video element gets the stream when it's rendered
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      console.log('📹 [VideoCall] Setting local video source in useEffect');
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(console.error);
    }
  }, [localStream]);

  // Ensure remote video element gets the stream when it's rendered
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log('📹 [VideoCall] Setting remote video source in useEffect');
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(console.error);
    }
  }, [remoteStream]);

  // Use a single effect to handle all video stream assignments
  useEffect(() => {
    const updateVideoElements = () => {
      // Local video
      if (localVideoRef.current && localStream) {
        if (localVideoRef.current.srcObject !== localStream) {
          console.log('📹 [VideoCall] Applying local stream to video element');
          localVideoRef.current.srcObject = localStream;
          localVideoRef.current.play().catch(e => 
            console.warn('Local video play warning:', e)
          );
        }
      }
      
      // Remote video  
      if (remoteVideoRef.current && remoteStream) {
        if (remoteVideoRef.current.srcObject !== remoteStream) {
          console.log('📹 [VideoCall] Applying remote stream to video element');
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play().catch(e => 
            console.warn('Remote video play warning:', e)
          );
        }
      }
    };

    updateVideoElements();
    
    // Also update after a short delay to catch any timing issues
    const timeoutId = setTimeout(updateVideoElements, 500);
    return () => clearTimeout(timeoutId);
  }, [localStream, remoteStream]);

  // Additional effect to ensure streams persist during call status changes
  useEffect(() => {
    console.log('📹 [VideoCall] Call status changed to:', callStatus);
    console.log('📹 [VideoCall] Local stream exists:', !!localStream);
    console.log('📹 [VideoCall] Remote stream exists:', !!remoteStream);
    
    // Force stream updates when call status changes
    if (callStatus === 'connected') {
      setTimeout(() => {
        if (localStream && localVideoRef.current) {
          console.log('📹 [VideoCall] Re-applying local stream after connection');
          localVideoRef.current.srcObject = localStream;
        }
        if (remoteStream && remoteVideoRef.current) {
          console.log('📹 [VideoCall] Re-applying remote stream after connection');
          remoteVideoRef.current.srcObject = remoteStream;
        }
      }, 200);
    }
  }, [callStatus, localStream, remoteStream]);

  // Periodic stream health check
  useEffect(() => {
    if (callStatus === 'connected' && localStream) {
      const healthCheck = setInterval(() => {
        if (localStream && localVideoRef.current) {
          // Check if video element has the stream
          if (localVideoRef.current.srcObject !== localStream) {
            console.log('📹 [VideoCall] Health check: Re-applying local stream');
            localVideoRef.current.srcObject = localStream;
          }
        }
        if (remoteStream && remoteVideoRef.current) {
          // Check if video element has the stream
          if (remoteVideoRef.current.srcObject !== remoteStream) {
            console.log('📹 [VideoCall] Health check: Re-applying remote stream');
            remoteVideoRef.current.srcObject = remoteStream;
          }
        }
      }, 1000);

      return () => clearInterval(healthCheck);
    }
  }, [callStatus, localStream, remoteStream]);

  // Simplified callback ref for local video
  const localVideoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
    localVideoRef.current = node;
    if (node && localStream) {
      console.log('📹 [VideoCall] Local video element mounted with stream');
      node.srcObject = localStream;
      node.play().catch(console.warn);
    }
  }, [localStream]);

  // Ensure remote video element gets the stream when it's rendered
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log('📹 [VideoCall] Setting remote video source in useEffect');
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Simplified callback ref for remote video
  const remoteVideoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
    remoteVideoRef.current = node;
    if (node && remoteStream) {
      console.log('📹 [VideoCall] Remote video element mounted with stream');
      node.srcObject = remoteStream;
      node.play().catch(console.warn);
    }
  }, [remoteStream]);

  // Create peer connection
  const createPeerConnection = () => {
    console.log('📹 [WebRTC] Creating peer connection...');
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    });

    // Handle incoming remote stream - CRITICAL: This must be set up BEFORE any offer/answer exchange
    pc.ontrack = (event) => {
      console.log('✅ [WebRTC] ontrack event fired!', event);
      console.log('✅ [WebRTC] Event streams:', event.streams);
      console.log('✅ [WebRTC] Event track:', event.track);
      
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        console.log('✅ [WebRTC] Received remote stream:', remoteStream);
        console.log('✅ [WebRTC] Remote stream ID:', remoteStream.id);
        console.log('✅ [WebRTC] Remote stream active:', remoteStream.active);
        console.log('✅ [WebRTC] Remote stream tracks:', remoteStream.getTracks().map(track => ({
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState,
          id: track.id
        })));
        
        // Set remote stream in React state
        setRemoteStream(remoteStream);
        
        // Set video source immediately
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          console.log('✅ [WebRTC] Set remote video source to video element');
          console.log('👥 [VideoCall] Remote user video is now visible in main container');
        } else {
          console.log('❌ [WebRTC] Remote video ref is null, cannot set stream');
        }
        
        // Store remote stream reference to prevent loss
        (pc as any).remoteStream = remoteStream;
        
        // Check if users can now see each other
        setTimeout(() => {
          console.log('👥 [VideoCall] Checking visibility after remote stream received');
          checkUsersCanSeeEachOther();
        }, 100);
      } else {
        console.error('❌ [WebRTC] ontrack event fired but no streams found!', event);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        console.log('📹 [WebRTC] Sending ICE candidate');
        socket.emit('video_call_ice_candidate', {
          callId: callData?.callId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('📹 [WebRTC] Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        console.log('📹 [WebRTC] Peer connection is now connected!');
        console.log('👥 [VideoCall] Connection established - checking if users can see each other...');
        // Multiple checks to ensure visibility is detected
        setTimeout(() => checkUsersCanSeeEachOther(), 100);
        setTimeout(() => checkUsersCanSeeEachOther(), 500);
        setTimeout(() => checkUsersCanSeeEachOther(), 1000);
      } else if (pc.connectionState === 'failed') {
        console.log('❌ [WebRTC] Peer connection failed!');
        console.log('❌ [WebRTC] Attempting to restart connection...');
        setUsersCanSeeEachOther(false);
        stopCallTimer();
        
        // Try to restart the connection after a delay
        setTimeout(() => {
          if (localStream && socket) {
            console.log('🔄 [WebRTC] Restarting connection...');
            // Close current connection and create new one
            pc.close();
            const newPc = createPeerConnection();
            setPeerConnection(newPc);
            
            // Re-add local stream
            localStream.getTracks().forEach(track => {
              newPc.addTrack(track, localStream);
            });
          }
        }, 2000);
      } else if (pc.connectionState === 'disconnected') {
        console.log('⚠️ [WebRTC] Peer connection disconnected');
        setUsersCanSeeEachOther(false);
        stopCallTimer();
      }
    };

    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log('📹 [WebRTC] ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected') {
        console.log('📹 [WebRTC] ICE connection is now connected!');
        console.log('👥 [VideoCall] ICE connection established - checking if users can see each other...');
        // Multiple checks to ensure visibility is detected
        setTimeout(() => checkUsersCanSeeEachOther(), 100);
        setTimeout(() => checkUsersCanSeeEachOther(), 500);
        setTimeout(() => checkUsersCanSeeEachOther(), 1000);
      } else if (pc.iceConnectionState === 'failed') {
        console.log('❌ [WebRTC] ICE connection failed!');
        setUsersCanSeeEachOther(false);
        stopCallTimer();
      } else if (pc.iceConnectionState === 'disconnected') {
        console.log('⚠️ [WebRTC] ICE connection disconnected');
        setUsersCanSeeEachOther(false);
        stopCallTimer();
      } else if (pc.iceConnectionState === 'checking') {
        console.log('🔄 [WebRTC] ICE connection checking...');
      }
    };

    // Handle signaling state changes
    pc.onsignalingstatechange = () => {
      console.log('📹 [WebRTC] Signaling state:', pc.signalingState);
    };

    console.log('📹 [WebRTC] Peer connection created');
    return pc;
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isOpen) return;

    const handleCallAccepted = (data: any) => {
      console.log('📹 [WebRTC] Call accepted:', data);
      if (data.callerId === currentUserId) {
        console.log('📹 [WebRTC] Processing call acceptance for caller - I am the CALLER');
        setCallStatus('connected');
        console.log('👥 [VideoCall] Call accepted - waiting for video streams to establish...');
        
        // Create peer connection and start call
        const pc = createPeerConnection();
        setPeerConnection(pc); // Set peer connection immediately
        
        // Process any pending ICE candidates
        setTimeout(() => processPendingIceCandidates(pc), 100);
        
        // CRITICAL: Add local stream tracks BEFORE creating offer
        if (localStream) {
          console.log('📹 [WebRTC] Adding local stream tracks to peer connection BEFORE creating offer');
          localStream.getTracks().forEach(track => {
            console.log('📹 [WebRTC] Adding track:', track.kind, track.id);
            pc.addTrack(track, localStream);
          });
          console.log('📹 [WebRTC] All local tracks added to peer connection');
        } else {
          console.error('❌ [WebRTC] No local stream available when creating offer!');
        }
        
        // Create and send offer (I am the caller) - AFTER adding tracks
        console.log('📹 [WebRTC] Creating offer as caller');
        pc.createOffer().then(offer => {
          console.log('📹 [WebRTC] Offer created:', offer);
          console.log('📹 [WebRTC] Offer SDP contains media tracks:', offer.sdp?.includes('m=video') && offer.sdp?.includes('m=audio'));
          return pc.setLocalDescription(offer);
        }).then(() => {
          console.log('📹 [WebRTC] Local description set successfully');
          console.log('📹 [WebRTC] Sending offer');
          socket.emit('video_call_offer', {
            callId: callData?.callId,
            offer: pc.localDescription
          });
        }).catch(error => {
          console.error('❌ [WebRTC] Error creating or setting offer:', error);
        });
      } else {
        console.log('📹 [WebRTC] Processing call acceptance for answerer - I am the ANSWERER');
        setCallStatus('connected');
        console.log('👥 [VideoCall] Call accepted - waiting for video streams to establish...');
        
        // I am the answerer, I should wait for the offer
        console.log('📹 [WebRTC] Waiting for offer from caller...');
      }
    };

    const handleCallDeclined = (data: any) => {
      if (data.callerId === currentUserId) {
        setCallStatus('ended');
        onClose();
      }
    };

    const handleCallEnded = (data: any) => {
      setCallStatus('ended');
      stopCallTimer();
      onClose();
    };

    const handleOffer = async (data: any) => {
      console.log('📹 [WebRTC] Received offer:', data);
      console.log('📹 [WebRTC] Current callData callId:', callData?.callId);
      console.log('📹 [WebRTC] Offer callId matches current callId?', data.callId === callData?.callId);
      
      // Accept both exact match and temporary call IDs for initial connection
      const callIdMatches = data.callId === callData?.callId || 
                           data.callId.startsWith('temp_') || 
                           callData?.callId?.startsWith('temp_');
      
      console.log('📹 [WebRTC] Call ID matches (including temp):', callIdMatches);
      
      // Only process offer if I am the answerer (not the caller)
      if (callIdMatches && !peerConnection) {
        console.log('📹 [WebRTC] Processing offer as ANSWERER for call:', data.callId);
        
        // Update callData if we have a temporary ID
        if (data.callId.startsWith('temp_') && callData) {
          console.log('📹 [WebRTC] Updating call data with temporary ID');
          // Update the call data to use the temporary ID for consistency
          // Note: setCallData might not be available, so we'll log this for now
          console.log('📹 [WebRTC] Would update call data with ID:', data.callId);
        }
        const pc = createPeerConnection();
        setPeerConnection(pc); // Set peer connection immediately
        
        // Process any pending ICE candidates
        setTimeout(() => processPendingIceCandidates(pc), 100);
        
        // CRITICAL: Add local stream tracks BEFORE setting remote description
        if (localStream) {
          console.log('📹 [WebRTC] Adding local stream tracks to peer connection BEFORE setting remote description');
          localStream.getTracks().forEach(track => {
            console.log('📹 [WebRTC] Adding track:', track.kind, track.id);
            pc.addTrack(track, localStream);
          });
          console.log('📹 [WebRTC] All local tracks added to peer connection');
        } else {
          console.error('❌ [WebRTC] No local stream available when processing offer!');
        }
        
        // Set remote description and create answer
        console.log('📹 [WebRTC] Setting remote description');
        try {
          await pc.setRemoteDescription(data.offer);
          console.log('📹 [WebRTC] Remote description set successfully');
        } catch (error) {
          console.error('❌ [WebRTC] Error setting remote description:', error);
          return;
        }
        
        console.log('📹 [WebRTC] Creating answer');
        let answer;
        try {
          answer = await pc.createAnswer();
          console.log('📹 [WebRTC] Answer created:', answer);
          console.log('📹 [WebRTC] Answer SDP contains media tracks:', answer.sdp?.includes('m=video') && answer.sdp?.includes('m=audio'));
          await pc.setLocalDescription(answer);
          console.log('📹 [WebRTC] Answer created and local description set');
        } catch (error) {
          console.error('❌ [WebRTC] Error creating answer:', error);
          return;
        }
        
        console.log('📹 [WebRTC] Sending answer with callId:', callData?.callId || data.callId);
        socket.emit('video_call_answer', {
          callId: callData?.callId || data.callId,
          answer: answer
        });
      } else {
        console.log('📹 [WebRTC] Ignoring offer - callId mismatch or already have peer connection');
      }
    };

    const handleAnswer = async (data: any) => {
      console.log('📹 [WebRTC] Received answer:', data);
      console.log('📹 [WebRTC] Current callData callId:', callData?.callId);
      console.log('📹 [WebRTC] Answer callId matches current callId?', data.callId === callData?.callId);
      
      // Only process answer if I am the caller and have a peer connection
      // Accept both exact match and temporary call IDs
      if ((data.callId === callData?.callId || data.callId.startsWith('temp_')) && peerConnection) {
        console.log('📹 [WebRTC] Processing answer as CALLER');
        console.log('📹 [WebRTC] Current peer connection state:', peerConnection.signalingState);
        console.log('📹 [WebRTC] Current remote description:', peerConnection.remoteDescription);
        
        try {
          // Only set remote description if we don't already have one or if we're in the right state
          if (!peerConnection.remoteDescription || peerConnection.signalingState === 'have-local-offer') {
            console.log('📹 [WebRTC] Setting remote description with answer');
            await peerConnection.setRemoteDescription(data.answer);
            console.log('📹 [WebRTC] Remote description set successfully');
          } else {
            console.log('📹 [WebRTC] Ignoring answer - already have remote description or wrong state');
          }
        } catch (error) {
          console.error('❌ [WebRTC] Error setting remote description:', error);
        }
      } else {
        console.log('📹 [WebRTC] Ignoring answer - callId mismatch or no peer connection');
      }
    };

    const handleIceCandidate = async (data: any) => {
      console.log('📹 [WebRTC] Received ICE candidate:', data);
      console.log('📹 [WebRTC] Current callData callId:', callData?.callId);
      console.log('📹 [WebRTC] ICE candidate callId matches current callId?', data.callId === callData?.callId);
      console.log('📹 [WebRTC] Peer connection exists:', !!peerConnection);
      console.log('📹 [WebRTC] ICE candidate callId starts with temp_:', data.callId.startsWith('temp_'));
      
      // Accept ICE candidate if callId matches OR if it's a temporary ID (for initial connection)
      const shouldAccept = data.callId === callData?.callId || data.callId.startsWith('temp_');
      console.log('📹 [WebRTC] Should accept ICE candidate:', shouldAccept);
      
      if (shouldAccept) {
        if (peerConnection) {
          console.log('📹 [WebRTC] Adding ICE candidate immediately');
          try {
            await peerConnection.addIceCandidate(data.candidate);
            console.log('📹 [WebRTC] ICE candidate added successfully');
          } catch (error) {
            console.error('❌ [WebRTC] Error adding ICE candidate:', error);
          }
        } else {
          console.log('📹 [WebRTC] Peer connection not ready, queuing ICE candidate');
          pendingIceCandidatesRef.current.push(data.candidate);
        }
      } else {
        console.log('📹 [WebRTC] Ignoring ICE candidate - callId mismatch');
        console.log('📹 [WebRTC] Debug info:', {
          callIdMatch: data.callId === callData?.callId,
          tempId: data.callId.startsWith('temp_'),
          hasPeerConnection: !!peerConnection
        });
      }
    };

    socket.on('video_call_accepted', handleCallAccepted);
    socket.on('video_call_declined', handleCallDeclined);
    socket.on('video_call_ended', handleCallEnded);
    socket.on('video_call_offer', handleOffer);
    socket.on('video_call_answer', handleAnswer);
    socket.on('video_call_ice_candidate', handleIceCandidate);

    return () => {
      socket.off('video_call_accepted', handleCallAccepted);
      socket.off('video_call_declined', handleCallDeclined);
      socket.off('video_call_ended', handleCallEnded);
      socket.off('video_call_offer', handleOffer);
      socket.off('video_call_answer', handleAnswer);
      socket.off('video_call_ice_candidate', handleIceCandidate);
    };
  }, [socket, isOpen, currentUserId, onClose, callData?.callId, localStream, peerConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCallTimer();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, [localStream, peerConnection]);

  if (!isOpen || !callData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="w-full h-full flex flex-col">
        {/* Call Timer - Top Center - Only show when users can see each other */}
        {callStatus === 'connected' && usersCanSeeEachOther && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
              <span className="text-lg font-mono">{formatDuration(callDuration)}</span>
            </div>
          </div>
        )}

        {/* Main Video Display - Shows OTHER user when connected, self when not connected */}
        <div className="flex-1 relative bg-gray-900">
          {remoteStream && usersCanSeeEachOther ? (
            <video
              ref={remoteVideoCallbackRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              onLoadedMetadata={() => {
                console.log('📹 [VideoCall] Remote video metadata loaded - OTHER USER is now visible');
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.play().catch(console.error);
                }
              }}
              onCanPlay={() => {
                console.log('📹 [VideoCall] Remote video can play - OTHER USER video is ready');
              }}
              onError={(e) => {
                console.error('❌ [VideoCall] Remote video error:', e);
              }}
            />
          ) : localStream && !usersCanSeeEachOther ? (
            <video
              ref={localVideoCallbackRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onLoadedMetadata={() => {
                console.log('📹 [VideoCall] Local video metadata loaded - SELF is visible (waiting for connection)');
                if (localVideoRef.current) {
                  localVideoRef.current.play().catch(console.error);
                }
              }}
              onCanPlay={() => {
                console.log('📹 [VideoCall] Local video can play - SELF video is ready');
              }}
              onError={(e) => {
                console.error('❌ [VideoCall] Local video error:', e);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  {callData.callerPhoto ? (
                    <img 
                      src={callData.callerPhoto} 
                      alt={callData.callerName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold">
                      {callData.callerName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-2">{callData.callerName}</h2>
                <p className="text-gray-400">
                  {callStatus === 'ringing' && callData.isIncoming && 'Incoming call...'}
                  {callStatus === 'ringing' && !callData.isIncoming && 'Calling...'}
                  {callStatus === 'connecting' && 'Connecting...'}
                  {callStatus === 'connected' && 'Connected'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Picture in Picture - Shows SELF when OTHER user is in main, OTHER user when SELF is in main */}
        {((remoteStream && usersCanSeeEachOther) || (localStream && !usersCanSeeEachOther)) && (
          <div className="absolute top-20 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
            {remoteStream && usersCanSeeEachOther ? (
              <video
                ref={localVideoCallbackRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onLoadedMetadata={() => {
                  console.log('📹 [VideoCall] Picture-in-picture: SELF video metadata loaded');
                  if (localVideoRef.current) {
                    localVideoRef.current.play().catch(console.error);
                  }
                }}
                onCanPlay={() => {
                  console.log('📹 [VideoCall] Picture-in-picture: SELF video can play');
                }}
                onError={(e) => {
                  console.error('❌ [VideoCall] Picture-in-picture: SELF video error:', e);
                }}
              />
            ) : (
              <video
                ref={remoteVideoCallbackRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                onLoadedMetadata={() => {
                  console.log('📹 [VideoCall] Picture-in-picture: OTHER USER video metadata loaded');
                  if (remoteVideoRef.current) {
                    remoteVideoRef.current.play().catch(console.error);
                  }
                }}
                onCanPlay={() => {
                  console.log('📹 [VideoCall] Picture-in-picture: OTHER USER video can play');
                }}
                onError={(e) => {
                  console.error('❌ [VideoCall] Picture-in-picture: OTHER USER video error:', e);
                }}
              />
            )}
            <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
              {remoteStream && usersCanSeeEachOther ? 'You' : callData.callerName}
            </div>
          </div>
        )}

        {/* Debug info - show stream status */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded max-w-xs">
            <div>Call Status: {callStatus}</div>
            <div>Local Stream: {localStream ? '✅' : '❌'}</div>
            <div>Remote Stream: {remoteStream ? '✅' : '❌'}</div>
            <div>Users Can See Each Other: {usersCanSeeEachOther ? '✅' : '❌'}</div>
            <div>Timer Running: {durationIntervalRef.current ? '✅' : '❌'}</div>
            <div>Peer Connection: {peerConnection ? '✅' : '❌'}</div>
            {peerConnection && (
              <>
                <div>Connection State: {peerConnection.connectionState}</div>
                <div>ICE State: {peerConnection.iceConnectionState}</div>
                <div>Signaling State: {peerConnection.signalingState}</div>
              </>
            )}
            <div>Call ID: {callData?.callId?.substring(0, 10)}...</div>
            <div>Main Video: {remoteStream && usersCanSeeEachOther ? 'OTHER USER' : 'SELF'}</div>
          </div>
        )}

        {/* Call Controls - Bottom */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-4">
            {callStatus === 'ringing' && callData.isIncoming && (
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

            {callStatus === 'ringing' && !callData.isIncoming && (
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
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${
                    isAudioEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
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
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${
                    isVideoEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isVideoEnabled ? <IoVideocam className="text-xl" /> : <IoVideocamOff className="text-xl" />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
