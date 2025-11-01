/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { IoCall, IoCallSharp, IoVideocam, IoVideocamOff, IoMic, IoMicOff, IoClose } from 'react-icons/io5';
import { getSocket } from '@/lib/socket';
import VideoCallBilling from './FanCallBilling';
import VIPBadge from './VIPBadge';
import { getImageSource } from '@/lib/imageUtils';

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
  userBalance?: number; // Current user's gold balance (used when they initiate calls)
  creatorEarnings?: number; // Creator's earnings (only shown when creator answers calls)
  isCreator?: boolean; // Whether current user is a creator
  callRate?: number; // Gold per minute rate
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
          setCallTimeout(true);
          // Emit timeout event to terminate the call for both users
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
        socket.emit('fan_call_ice_candidate', {
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
    
    socket.emit('fan_call_end', {
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
    socket?.emit('fan_call_start', {
      answererId: callData.callerId,
      answererName: callData.callerName,
      callerId: currentUserId,
      callerName: currentUserName
    });
  };

  // Helper function to get display name (prioritizes username over full name)
  const getDisplayName = (userInfo: any) => {
    return callData?.isIncoming 
      ? (callData?.callerUsername || userInfo?.callerUsername || userInfo?.username || callData?.callerName || userInfo?.callerName || userInfo?.name || userInfo?.firstname || 'User')
      : (callData?.answererUsername || userInfo?.answererUsername || userInfo?.username || callData?.answererName || userInfo?.answererName || userInfo?.name || userInfo?.firstname || 'User');
  };

  // Helper function to render user profile picture or initials (from post card logic)
  const renderUserProfile = (userInfo: any, isCreator: boolean = false) => {

    // For incoming calls, show caller info. For outgoing calls, show answerer info
    // IMPORTANT: For incoming calls, we want to show the CALLER's photo (person calling you)
    // For outgoing calls, we want to show the ANSWERER's photo (person you're calling)
    let profileImage: string | undefined;
    
    if (callData?.isIncoming) {
      // INCOMING CALL: Show the CALLER's photo (the person calling you)
      profileImage = callData?.callerPhoto 
        || userInfo?.callerPhoto 
        || userInfo?.photo 
        || userInfo?.photolink 
        || userInfo?.photoLink 
        || userInfo?.profileImage 
        || userInfo?.avatar 
        || userInfo?.image
        || undefined;
      
      // If still not found, try to extract from callData directly if it's the caller's data
      if (!profileImage && callData?.callerId === userInfo?.callerId) {
        profileImage = callData?.callerPhoto || undefined;
      }
      
      // Last resort: if userInfo IS callData (which it often is), try checking all photo fields
      if (!profileImage && userInfo === callData) {
        // Search through all keys in callData for photo fields
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
      // OUTGOING CALL: Show the ANSWERER's photo (the person you're calling)
      profileImage = callData?.answererPhoto 
        || userInfo?.answererPhoto 
        || userInfo?.photo 
        || userInfo?.photolink 
        || userInfo?.photoLink 
        || userInfo?.profileImage 
        || userInfo?.avatar 
        || userInfo?.image
        || undefined;
      
      // If still not found, try to extract from callData directly if it's the answerer's data
      if (!profileImage && callData?.answererId === userInfo?.answererId) {
        profileImage = callData?.answererPhoto || undefined;
      }
      
      // Last resort: if userInfo IS callData (which it often is), try checking all photo fields
      if (!profileImage && userInfo === callData) {
        // Search through all keys in callData for photo fields
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
    
    // Use firstname and lastname for initials fallback instead of username
    const firstName = callData?.isIncoming 
      ? (callData?.callerFirstName || userInfo?.callerFirstName || userInfo?.firstname || '')
      : (callData?.answererFirstName || userInfo?.answererFirstName || userInfo?.firstname || '');
    
    const lastName = callData?.isIncoming 
      ? (callData?.callerLastName || userInfo?.callerLastName || userInfo?.lastname || '')
      : (callData?.answererLastName || userInfo?.answererLastName || userInfo?.lastname || '');
    
    
    // Create initials from firstname and lastname, fallback to username if not available
    let initials = "?";
    if (firstName && lastName) {
      initials = (firstName[0] + lastName[0]).toUpperCase();
    } else if (firstName) {
      initials = firstName[0].toUpperCase();
    } else if (lastName) {
      initials = lastName[0].toUpperCase();
    } else {
      // Fallback to username initials - clean the username first
      const cleanUserName = userName.replace(/^@/, '').trim(); // Remove @ prefix if present
      if (cleanUserName) {
        initials = cleanUserName.split(/\s+/).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || "?";
      } else {
        initials = "?";
      }
    }
    
    
    // Use getImageSource to handle Storj URLs properly (same as ProfilePage.tsx and EditProfile)
    const hasValidImage = profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined";
    
    // Determine the correct bucket - check if it's a creator photo or profile photo
    // If the URL contains 'creator' in the path, use 'creator' bucket, otherwise 'profile'
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
                // Ensure initials are hidden when image loads
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
                  
                  // If we tried proxy URL and it failed, try original Storj URL
                  if (imageSource.isStorj && imageSource.originalUrl && currentSrc === imageSrc && currentSrc !== imageSource.originalUrl) {
                    target.src = imageSource.originalUrl;
                    return; // Don't show initials yet, wait for this to fail too
                  }
                  
                  // If original URL also failed (or wasn't Storj), show initials
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const initialsDiv = parent.querySelector('.initials-fallback') as HTMLElement;
                    if (initialsDiv) {
                      initialsDiv.style.display = 'flex';
                    }
                  }
                } catch (err) {
                  // Fallback: just hide image
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
                  } catch {}
                }
              }}
            />
          ) : null}
          <div className="w-full h-full flex items-center justify-center text-white text-4xl font-semibold bg-gray-600 initials-fallback" style={{display: hasValidImage && imageSource ? 'none' : 'flex'}}>
            {initials}
          </div>
        </div>
        
        {/* VIP Badge for both caller and answerer */}
        {(() => {
          
          // Determine VIP status based on who we're showing
          // For incoming calls: show caller's VIP status (the person calling you)
          // For outgoing calls: show answerer's VIP status (the person you're calling)
          const isVip = callData?.isIncoming 
            ? (userInfo?.callerIsVip || callData?.callerIsVip || userInfo?.isVip)  // For incoming calls, show caller's VIP status
            : (userInfo?.answererIsVip || callData?.answererIsVip || userInfo?.isVip); // For outgoing calls, show answerer's VIP status
          
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

  // Handle insufficient funds (for whoever is paying for the call)
  const handleInsufficientFunds = useCallback(() => {
    // Show insufficient funds notification for whoever initiated the call (the one paying)
    const isCaller = callData?.callerId === currentUserId;
    if (isCaller) {
      console.log('💰 [VideoCall] Insufficient funds detected - ending call');
      setInsufficientFunds(true);
      
      // End the call after a brief delay to show the message
      setTimeout(() => {
        // Emit end call event to backend
        if (socket) {
          socket.emit('fan_call_end', {
            callId: callData?.callId,
            callerId: callData?.callerId,
            userId: currentUserId,
            reason: 'insufficient_funds'
          });
        }
        
        // Cleanup and close modal
        handleCleanup();
        onClose();
      }, 2000); // Show message for 2 seconds before ending
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
      setCallStatus('connected');
      
      // Only the original caller should create the peer connection and offer
      // The answerer should wait for the offer
      if (data.callerId === currentUserId && !callData?.isIncoming) {
        // I am the original caller - create peer connection and offer
        const pc = createPeerConnection();
        setPeerConnection(pc);
        
        if (localStream) {
          localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
          });
        }
        
        pc.createOffer().then(offer => {
          return pc.setLocalDescription(offer);
        }).then(() => {
          socket.emit('fan_call_offer', {
            callId: callData?.callId,
            offer: pc.localDescription
          });
        }).catch(error => {
          console.error('❌ [VideoCall] Error creating/sending offer:', error);
        });
      }
    };

    const handleOffer = async (data: any) => {
      // Received offer
      
      // Only process offer if we don't have a peer connection yet AND we're the answerer
      if ((data.callId === callData?.callId || data.callId.startsWith('temp_')) && !peerConnection && callData?.isIncoming) {
        const pc = createPeerConnection();
        setPeerConnection(pc);
        
        if (localStream) {
          localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
          });
        }
        
        try {
          await pc.setRemoteDescription(data.offer);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          
          socket.emit('fan_call_answer', {
            callId: callData?.callId || data.callId,
            answer: answer
          });
        } catch (error) {
          console.error('❌ [VideoCall] Error processing offer:', error);
        }
      }
    };

    const handleAnswer = async (data: any) => {
      // Received answer
      
      if ((data.callId === callData?.callId || data.callId.startsWith('temp_')) && peerConnection) {
        try {
          await peerConnection.setRemoteDescription(data.answer);
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
      // For incoming calls (answerer), just close the modal
      if (callData?.isIncoming) {
        handleCleanup();
        onClose();
      }
    };

    const handleMissedCall = (data: any) => {
      // This will be handled by the socket listener in the parent component
      // to create notifications and push notifications
    };

    const handleInsufficientFundsFromServer = (data: any) => {
      console.log('💰 [VideoCall] Insufficient funds received from server:', data);
      // Check if this insufficient funds event is for the current call
      const isCaller = callData?.callerId === currentUserId;
      if ((data.callId === callData?.callId || !data.callId) && isCaller) {
        // Handle insufficient funds - this will show notification and end call
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
  }, [socket, isOpen, currentUserId, callData, peerConnection, localStream, createPeerConnection, handleCleanup, onClose, handleInsufficientFunds]);

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
                    {getDisplayName(callData)}
                  </p>
                  <p className="text-sm text-blue-400">
                    {callData?.isIncoming ? 'Fan' : 'Creator'}
                  </p>
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
                        {getDisplayName(callData)}
                      </p>
                      <p className="text-sm text-blue-400">
                        {callData?.isIncoming ? 'Fan' : 'Creator'}
                      </p>
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