/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { IoCall, IoCallSharp, IoVideocam, IoVideocamOff, IoMic, IoMicOff, IoClose } from 'react-icons/io5';
import { getSocket } from '@/lib/socket';
import VideoCallBilling from './VideoCallBilling';
import VIPBadge from './VIPBadge';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callData: {
    callerId: string;
    callerName: string;
    callerPhoto?: string;
    callerIsVip?: boolean;
    callerVipEndDate?: string | null;
    isIncoming: boolean;
    callId?: string;
    answererId?: string;
    answererName?: string;
    answererPhoto?: string;
    answererIsVip?: boolean;
    answererVipEndDate?: string | null;
  } | null;
  currentUserId: string;
  currentUserName: string;
  userBalance?: number; // Current user's gold balance (used when they initiate calls)
  creatorEarnings?: number; // Creator's earnings (only shown when creator answers calls)
  isCreator?: boolean; // Whether current user is a creator
  callRate?: number; // Gold per minute rate
}

export default function VideoCallModal({ 
  isOpen, 
  onClose, 
  callData, 
  currentUserId, 
  currentUserName, 
  userBalance = 0, 
  creatorEarnings = 0, 
  isCreator = false, 
  callRate = 1 
}: VideoCallModalProps) {
  const [callStatus, setCallStatus] = useState<'ringing' | 'connecting' | 'connected' | 'ended'>('ringing');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [usersCanSeeEachOther, setUsersCanSeeEachOther] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showInsecureWarning, setShowInsecureWarning] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [callTimeout, setCallTimeout] = useState(false);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  
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
      
      // Log mobile and network detection for debugging
      // Mobile detection completed
    }
  }, [isOpen]);

  // 30-second timeout for calls (only for outgoing calls, not incoming)
  useEffect(() => {
    if (isOpen && callStatus === 'ringing' && !callTimeout && !callData?.isIncoming) {
      setCallStartTime(Date.now());
      
      callTimeoutRef.current = setTimeout(() => {
        if (callStatus === 'ringing') {
          console.log('📞 [VideoCall] Call timeout after 30 seconds');
          setCallTimeout(true);
          // Emit timeout event to terminate the call for both users
          if (socket) {
            socket.emit('video_call_timeout', { 
              callId: callData?.callId,
              callerId: callData?.callerId,
              callerName: callData?.callerName,
              answererId: callData?.answererId,
              answererName: callData?.answererName
            });
          }
        }
      }, 30000); // 30 seconds
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
    
    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Hide controls after 3 seconds
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const handleVideoAreaClick = () => {
    if (callStatus === 'connected') {
      showControlsTemporarily();
    }
  };

  // Get user media - ENHANCED
  const getUserMedia = async () => {
    try {
      // Check if we're in a secure context
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported');
      }

      // Check if we're in an insecure context (network IP)
      const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      if (!isSecureContext) {
        throw new Error('INSECURE_CONTEXT');
      }

      // Requesting user media
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      // Got user media stream
      setLocalStream(stream);
      return stream;
    } catch (error: any) {
      console.error('❌ [VideoCall] Error accessing media devices:', error);
      console.error('❌ [VideoCall] Error name:', error.name);
      console.error('❌ [VideoCall] Error message:', error.message);
      console.error('❌ [VideoCall] Full error:', error);
      
      // Detect mobile and network context
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isNetworkIP = /^\d+\.\d+\.\d+\.\d+/.test(window.location.hostname);
      
      // Handle specific error cases with mobile-specific guidance
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

  // Create peer connection - SIMPLIFIED
  const createPeerConnection = useCallback(() => {
      // Creating peer connection
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      // ontrack event fired
      console.log('📹 [WebRTC] ontrack event fired:', {
        hasStreams: !!event.streams,
        streamsLength: event.streams?.length || 0,
        hasTracks: event.track ? true : false
      });
      if (event.streams && event.streams[0]) {
        const newRemoteStream = event.streams[0];
        console.log('📹 [WebRTC] Received remote stream:', {
          streamId: newRemoteStream.id,
          tracks: newRemoteStream.getTracks().length,
          videoTracks: newRemoteStream.getVideoTracks().length,
          audioTracks: newRemoteStream.getAudioTracks().length
        });
        setRemoteStream(newRemoteStream);
        
        // Store for recovery
        (pc as any).remoteStream = newRemoteStream;
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket && callData?.callId) {
        socket.emit('video_call_ice_candidate', {
          callId: callData.callId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      // Connection state changed
      console.log('📹 [WebRTC] Connection state changed:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        // Peer connection connected
        console.log('📹 [WebRTC] Peer connection connected!');
        // Check if users can see each other after a delay
      }
    };

    // Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      // ICE connection state changed
      console.log('📹 [WebRTC] ICE connection state changed:', pc.iceConnectionState);
    };

    return pc;
  }, [socket, callData?.callId, localStream, remoteStream, usersCanSeeEachOther]);

  // Process pending ICE candidates
  const processPendingIceCandidates = useCallback(async (pc: RTCPeerConnection) => {
    console.log('📹 [WebRTC] Processing pending ICE candidates:', pendingIceCandidatesRef.current.length);
    while (pendingIceCandidatesRef.current.length > 0) {
      const candidate = pendingIceCandidatesRef.current.shift();
      try {
        console.log('📹 [WebRTC] Adding pending ICE candidate');
        await pc.addIceCandidate(candidate);
        console.log('📹 [WebRTC] Pending ICE candidate added successfully');
      } catch (error) {
        console.error('❌ [WebRTC] Error adding pending ICE candidate:', error);
      }
    }
  }, []);

  // Handle accept call
  const handleAcceptCall = async () => {
    if (!callData || !socket) return;
    
    setCallStatus('connecting');
    
    if (!localStream) {
      const stream = await getUserMedia();
      if (!stream) {
        setCallStatus('ended');
        return;
      }
    }

    socket.emit('video_call_accept', {
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
    
    socket.emit('video_call_decline', {
      callId: callData.callId,
      callerId: callData.callerId,
      answererId: currentUserId
    });
    
    handleCleanup();
    onClose();
  };

  const handleEndCall = () => {
    if (!socket) return;
    
    socket.emit('video_call_end', {
      callId: callData?.callId,
      callerId: callData?.callerId,
      userId: currentUserId
    });
    
    handleCleanup();
    onClose();
  };

  const handleCallAgain = () => {
    if (!callData) return;
    
    // Reset timeout state
    setCallTimeout(false);
    setCallStartTime(Date.now());
    
    // Emit call again event
    socket?.emit('video_call_start', {
      answererId: callData.callerId,
      answererName: callData.callerName,
      callerId: currentUserId,
      callerName: currentUserName
    });
  };

  // Helper function to render user profile picture or initials (from post card logic)
  const renderUserProfile = (userInfo: any, isCreator: boolean = false) => {
    // For incoming calls, show caller info. For outgoing calls, show answerer info
    const profileImage = callData?.isIncoming 
      ? (userInfo?.callerPhoto || userInfo?.photo || userInfo?.photolink || userInfo?.photoLink || userInfo?.profileImage || userInfo?.avatar || userInfo?.image)
      : (userInfo?.answererPhoto || userInfo?.photo || userInfo?.photolink || userInfo?.photoLink || userInfo?.profileImage || userInfo?.avatar || userInfo?.image);
    
    const userName = callData?.isIncoming 
      ? (userInfo?.callerName || userInfo?.name || userInfo?.firstname || userInfo?.username || 'User')
      : (userInfo?.answererName || userInfo?.name || userInfo?.firstname || userInfo?.username || 'User');
    
    const initials = userName.split(/\s+/).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || "?";
    
    return (
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 mx-auto mb-4">
          {profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined" ? (
            <img
              alt="Profile picture"
              src={profileImage}
              className="object-cover w-full h-full"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
                const nextElement = target.nextElementSibling as HTMLElement;
                if (nextElement) {
                  nextElement.style.setProperty('display', 'flex');
                }
              }}
            />
          ) : null}
          <div className="w-full h-full flex items-center justify-center text-white text-4xl font-semibold bg-gray-600" style={{display: profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined" ? 'none' : 'flex'}}>
            {initials}
          </div>
        </div>
        
        {/* VIP Badge for creators */}
        {isCreator && (userInfo?.answererIsVip || userInfo?.callerIsVip || userInfo?.isVip) && (
          <VIPBadge 
            size="xl" 
            className="absolute -top-2 -right-2" 
            isVip={userInfo.answererIsVip || userInfo.callerIsVip || userInfo.isVip} 
            vipEndDate={userInfo.answererVipEndDate || userInfo.callerVipEndDate || userInfo.vipEndDate} 
          />
        )}
      </div>
    );
  };

  // Handle insufficient funds (for whoever is paying for the call)
  const handleInsufficientFunds = () => {
    // Show insufficient funds alert for whoever initiated the call (the one paying)
    const isCaller = callData?.callerId === currentUserId;
    if (isCaller) {
      alert('Insufficient funds to continue call');
      handleEndCall();
    }
  };

  // Cleanup function
  const handleCleanup = useCallback(() => {
    console.log('🧹 [VideoCall] Cleaning up video call');
    setUsersCanSeeEachOther(false);
    setCallTimeout(false);
    setCallStartTime(null);
    
    // Clear controls timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
    
    // Clear call timeout
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

  // Helper function to safely play video
  const safePlayVideo = (videoElement: HTMLVideoElement) => {
    if (videoElement && videoElement.readyState >= 2) { // HAVE_CURRENT_DATA
      videoElement.play().catch((e) => {
        // Ignore AbortError as it's expected when switching streams
        if (e.name !== 'AbortError') {
          console.error('Video play error:', e);
        }
      });
    }
  };

  // Update video elements when streams change
  useEffect(() => {
    if (localStream) {
      // Always set local video for thumbnail
      if (thumbnailVideoRef.current) {
        thumbnailVideoRef.current.srcObject = localStream;
        setTimeout(() => safePlayVideo(thumbnailVideoRef.current!), 100);
      }
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream) {
      // ALWAYS set remote video for main area when remote stream is available
      console.log('📹 [VideoCall] Setting remote video in main container:', {
        hasRemoteStream: !!remoteStream,
        hasMainVideoRef: !!mainVideoRef.current,
        streamTracks: remoteStream.getTracks().length
      });
      if (mainVideoRef.current) {
        mainVideoRef.current.srcObject = remoteStream;
        setTimeout(() => safePlayVideo(mainVideoRef.current!), 100);
      }
    }
  }, [remoteStream]);

  // Set usersCanSeeEachOther when both streams are available
  useEffect(() => {
    if (localStream && remoteStream && !usersCanSeeEachOther) {
      setUsersCanSeeEachOther(true);
    }
  }, [localStream, remoteStream, usersCanSeeEachOther]);

  // Socket event listeners - SIMPLIFIED
  useEffect(() => {
    if (!socket || !isOpen) return;

    const handleCallAccepted = (data: any) => {
      // Call accepted
      console.log('📞 [VideoCall] Call accepted:', { data, currentUserId, callerId: data.callerId });
      setCallStatus('connected');
      
      // Only the original caller should create the peer connection and offer
      // The answerer should wait for the offer
      if (data.callerId === currentUserId && !callData?.isIncoming) {
        // I am the original caller - create peer connection and offer
        console.log('📞 [VideoCall] I am the original caller, creating peer connection and offer');
        const pc = createPeerConnection();
        setPeerConnection(pc);
        
        if (localStream) {
          console.log('📞 [VideoCall] Adding local stream tracks to peer connection');
          localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
          });
        }
        
        pc.createOffer().then(offer => {
          console.log('📞 [VideoCall] Created offer, setting local description');
          return pc.setLocalDescription(offer);
        }).then(() => {
          console.log('📞 [VideoCall] Sending offer to remote peer');
          socket.emit('video_call_offer', {
            callId: callData?.callId,
            offer: pc.localDescription
          });
        }).catch(error => {
          console.error('❌ [VideoCall] Error creating/sending offer:', error);
        });
      } else {
        console.log('📞 [VideoCall] I am the answerer, waiting for offer');
      }
    };

    const handleOffer = async (data: any) => {
      // Received offer
      console.log('📞 [VideoCall] Received offer:', { 
        callId: data.callId, 
        currentCallId: callData?.callId,
        hasPeerConnection: !!peerConnection,
        isIncoming: callData?.isIncoming
      });
      
      // Only process offer if we don't have a peer connection yet AND we're the answerer
      if ((data.callId === callData?.callId || data.callId.startsWith('temp_')) && !peerConnection && callData?.isIncoming) {
        console.log('📞 [VideoCall] Processing offer, creating peer connection as answerer');
        const pc = createPeerConnection();
        setPeerConnection(pc);
        
        if (localStream) {
          console.log('📞 [VideoCall] Adding local stream tracks to peer connection');
          localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
          });
        }
        
        try {
          console.log('📞 [VideoCall] Setting remote description');
          await pc.setRemoteDescription(data.offer);
          console.log('📞 [VideoCall] Creating answer');
          const answer = await pc.createAnswer();
          console.log('📞 [VideoCall] Setting local description');
          await pc.setLocalDescription(answer);
          
          console.log('📞 [VideoCall] Sending answer to remote peer');
          socket.emit('video_call_answer', {
            callId: callData?.callId || data.callId,
            answer: answer
          });
        } catch (error) {
          console.error('❌ [VideoCall] Error processing offer:', error);
        }
      } else {
        console.log('📞 [VideoCall] Ignoring offer - already have peer connection or not the answerer');
      }
    };

    const handleAnswer = async (data: any) => {
      // Received answer
      console.log('📞 [VideoCall] Received answer:', { 
        callId: data.callId, 
        currentCallId: callData?.callId,
        hasPeerConnection: !!peerConnection 
      });
      
      if ((data.callId === callData?.callId || data.callId.startsWith('temp_')) && peerConnection) {
        try {
          console.log('📞 [VideoCall] Setting remote description from answer');
          await peerConnection.setRemoteDescription(data.answer);
          console.log('📞 [VideoCall] Remote description set successfully');
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
        connectionState: peerConnection?.connectionState,
        iceConnectionState: peerConnection?.iceConnectionState
      });
      
      if (shouldAccept && peerConnection) {
        try {
          console.log('📹 [WebRTC] Adding ICE candidate');
          await peerConnection.addIceCandidate(data.candidate);
          console.log('📹 [WebRTC] ICE candidate added successfully');
        } catch (error) {
          console.log('📹 [WebRTC] Queueing ICE candidate - error:', (error as Error).message);
          pendingIceCandidatesRef.current.push(data.candidate);
        }
      }
    };

    const handleCallEnded = () => {
      handleCleanup();
      onClose();
    };

    const handleCallTimeout = () => {
      console.log('📞 [VideoCall] Call timeout received - closing modal');
      // For incoming calls (answerer), just close the modal
      if (callData?.isIncoming) {
        handleCleanup();
        onClose();
      }
    };

    const handleMissedCall = (data: any) => {
      console.log('📞 [VideoCall] Missed call notification received:', data);
      // This will be handled by the socket listener in the parent component
      // to create notifications and push notifications
    };

    socket.on('video_call_accepted', handleCallAccepted);
    socket.on('video_call_offer', handleOffer);
    socket.on('video_call_answer', handleAnswer);
    socket.on('video_call_ice_candidate', handleIceCandidate);
    socket.on('video_call_ended', handleCallEnded);
    socket.on('video_call_timeout', handleCallTimeout);
    socket.on('video_call_missed', handleMissedCall);

    return () => {
      socket.off('video_call_accepted', handleCallAccepted);
      socket.off('video_call_offer', handleOffer);
      socket.off('video_call_answer', handleAnswer);
      socket.off('video_call_ice_candidate', handleIceCandidate);
      socket.off('video_call_ended', handleCallEnded);
      socket.off('video_call_timeout', handleCallTimeout);
      socket.off('video_call_missed', handleMissedCall);
    };
  }, [socket, isOpen, currentUserId, callData, peerConnection, localStream, createPeerConnection, handleCleanup, onClose]);

  // Process pending ICE candidates when peer connection is ready
  useEffect(() => {
    if (peerConnection && peerConnection.remoteDescription) {
      processPendingIceCandidates(peerConnection);
    }
  }, [peerConnection, processPendingIceCandidates]);

  // Start auto-hide timer when call connects
  useEffect(() => {
    if (callStatus === 'connected' && usersCanSeeEachOther) {
      showControlsTemporarily();
    }
  }, [callStatus, usersCanSeeEachOther, showControlsTemporarily]);

  if (!isOpen || !callData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="w-full h-full flex flex-col">
        
        {/* Media Error Modal */}
        {mediaError && (
          <div className="fixed inset-0 z-60 bg-black bg-opacity-90 flex items-center justify-center p-4">
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
        
        {/* Call Timer and Billing */}
        {callStatus === 'connected' && usersCanSeeEachOther && (
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
          {/* Main video display - ALWAYS show remote video when available */}
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
                // Auto-play when ready
                if (mainVideoRef.current) {
                  safePlayVideo(mainVideoRef.current);
                }
              }}
              onPlay={() => console.log('📹 [VideoCall] Main video started playing')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
            {/* Show timeout message if call timed out */}
            {callTimeout ? (
              <div className="space-y-6">
                <div>
                  <p className="text-xl font-semibold mb-2">Not Answered</p>
                  <p className="text-gray-400">The call was not answered after 30 seconds</p>
                </div>
                
                {/* Show user information */}
                {renderUserProfile(callData, isCreator)}
                
                <div className="space-y-3">
                  <p className="text-lg font-medium">
                    {callData?.isIncoming 
                      ? (callData?.callerName || 'User')
                      : (callData?.answererName || 'User')
                    }
                  </p>
                  <p className="text-sm text-blue-400">Creator</p>
                </div>
                
                {/* Call again button - only show for outgoing calls */}
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
                    {/* Show user information while waiting */}
                    {renderUserProfile(callData, isCreator)}
                    
                    <div className="space-y-3">
                      <p className="text-lg font-medium">
                        {callData?.isIncoming 
                          ? (callData?.callerName || 'User')
                          : (callData?.answererName || 'User')
                        }
                      </p>
                      <p className="text-sm text-blue-400">Creator</p>
                      <p className="text-sm text-gray-400">
                        {callData?.isIncoming ? 'Incoming call...' : 'Calling...'}
                      </p>
                    </div>
                    
                    {/* Show call duration if available */}
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
              // Always show local video (yourself) in thumbnail when available
              <video
                ref={thumbnailVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onError={(e) => console.error('Thumbnail video error:', e)}
                onCanPlay={() => {
                  // Auto-play when ready
                  if (thumbnailVideoRef.current) {
                    safePlayVideo(thumbnailVideoRef.current);
                  }
                }}
              />
            ) : remoteStream ? (
              // Show remote video as fallback when local not available
              <video
                ref={thumbnailVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                onError={(e) => console.error('Thumbnail video error:', e)}
                onCanPlay={() => {
                  // Auto-play when ready
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