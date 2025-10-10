/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { IoCall, IoCallSharp, IoVideocam, IoVideocamOff, IoMic, IoMicOff, IoClose } from 'react-icons/io5';
import { getSocket } from '@/lib/socket';
import VideoCallBilling from './VideoCallBilling';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callData: {
    callerId: string;
    callerName: string;
    callerPhoto?: string;
    isIncoming: boolean;
    callId?: string;
  } | null;
  currentUserId: string;
  currentUserName: string;
  userBalance?: number; // Fan's gold balance
  creatorEarnings?: number; // Creator's earnings
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
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pendingIceCandidatesRef = useRef<any[]>([]);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const socket = getSocket();

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

  // Get user media - SIMPLIFIED
  const getUserMedia = async () => {
    try {
      console.log('📹 [VideoCall] Requesting user media');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      console.log('📹 [VideoCall] Got user media stream');
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('❌ [VideoCall] Error accessing media devices:', error);
      return null;
    }
  };

  // Create peer connection - SIMPLIFIED
  const createPeerConnection = useCallback(() => {
    console.log('📹 [WebRTC] Creating peer connection');
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      console.log('✅ [WebRTC] ontrack event fired');
      if (event.streams && event.streams[0]) {
        const newRemoteStream = event.streams[0];
        console.log('✅ [WebRTC] Received remote stream');
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
      console.log('📹 [WebRTC] Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        console.log('✅ [WebRTC] Peer connection connected');
        // Check if users can see each other after a delay
        setTimeout(() => {
          const canSee = !!localStream && !!remoteStream;
          if (canSee && !usersCanSeeEachOther) {
            console.log('👥 [VideoCall] Users can now see each other!');
            setUsersCanSeeEachOther(true);
          }
        }, 1000);
      }
    };

    // Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log('📹 [WebRTC] ICE connection state:', pc.iceConnectionState);
    };

    return pc;
  }, [socket, callData?.callId, localStream, remoteStream, usersCanSeeEachOther]);

  // Process pending ICE candidates
  const processPendingIceCandidates = useCallback(async (pc: RTCPeerConnection) => {
    console.log('📹 [WebRTC] Processing pending ICE candidates:', pendingIceCandidatesRef.current.length);
    while (pendingIceCandidatesRef.current.length > 0) {
      const candidate = pendingIceCandidatesRef.current.shift();
      try {
        await pc.addIceCandidate(candidate);
      } catch (error) {
        console.error('❌ [WebRTC] Error adding pending ICE candidate:', error);
      }
    }
  }, []);

  // Handle accept call
  const handleAcceptCall = async () => {
    if (!callData || !socket) return;
    
    // Check if fan has sufficient funds before accepting
    if (!isCreator && userBalance < callRate) {
      alert('Insufficient funds, purchase gold');
      handleDeclineCall();
      return;
    }
    
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

  // Handle insufficient funds
  const handleInsufficientFunds = () => {
    alert('You have run out of gold to continue the call');
    handleEndCall();
  };

  // Cleanup function
  const handleCleanup = useCallback(() => {
    setUsersCanSeeEachOther(false);
    
    // Clear controls timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    
    setRemoteStream(null);
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

  // Update video elements when streams change - SIMPLIFIED
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log('📹 [VideoCall] Setting local video source');
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {}); // Silent catch
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log('📹 [VideoCall] Setting remote video source');
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {}); // Silent catch
    }
  }, [remoteStream]);

  // Socket event listeners - SIMPLIFIED
  useEffect(() => {
    if (!socket || !isOpen) return;

    const handleCallAccepted = (data: any) => {
      console.log('📹 [WebRTC] Call accepted');
      setCallStatus('connected');
      
      if (data.callerId === currentUserId) {
        // I am the caller - create peer connection and offer
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
          socket.emit('video_call_offer', {
            callId: callData?.callId,
            offer: pc.localDescription
          });
        });
      }
    };

    const handleOffer = async (data: any) => {
      console.log('📹 [WebRTC] Received offer');
      
      if ((data.callId === callData?.callId || data.callId.startsWith('temp_')) && !peerConnection) {
        const pc = createPeerConnection();
        setPeerConnection(pc);
        
        if (localStream) {
          localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
          });
        }
        
        await pc.setRemoteDescription(data.offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        socket.emit('video_call_answer', {
          callId: callData?.callId || data.callId,
          answer: answer
        });
      }
    };

    const handleAnswer = async (data: any) => {
      console.log('📹 [WebRTC] Received answer');
      
      if ((data.callId === callData?.callId || data.callId.startsWith('temp_')) && peerConnection) {
        await peerConnection.setRemoteDescription(data.answer);
      }
    };

    const handleIceCandidate = async (data: any) => {
      const shouldAccept = data.callId === callData?.callId || data.callId.startsWith('temp_');
      
      if (shouldAccept && peerConnection) {
        try {
          await peerConnection.addIceCandidate(data.candidate);
        } catch {
          console.log('📹 [WebRTC] Queueing ICE candidate');
          pendingIceCandidatesRef.current.push(data.candidate);
        }
      }
    };

    const handleCallEnded = () => {
      handleCleanup();
      onClose();
    };

    socket.on('video_call_accepted', handleCallAccepted);
    socket.on('video_call_offer', handleOffer);
    socket.on('video_call_answer', handleAnswer);
    socket.on('video_call_ice_candidate', handleIceCandidate);
    socket.on('video_call_ended', handleCallEnded);

    return () => {
      socket.off('video_call_accepted', handleCallAccepted);
      socket.off('video_call_offer', handleOffer);
      socket.off('video_call_answer', handleAnswer);
      socket.off('video_call_ice_candidate', handleIceCandidate);
      socket.off('video_call_ended', handleCallEnded);
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
          />
        )}

        {/* Main Video Display */}
        <div className="flex-1 relative bg-gray-900 cursor-pointer" onClick={handleVideoAreaClick}>
          {/* Local video - main display when connected */}
          {localStream && usersCanSeeEachOther && (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onError={(e) => console.error('Local video error:', e)}
            />
          )}
          
          {/* Remote video - main display when not connected or as fallback */}
          {(!localStream || !usersCanSeeEachOther) && remoteStream && (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              onError={(e) => console.error('Remote video error:', e)}
            />
          )}
          
          {/* Fallback UI when no streams */}
          {!localStream && !remoteStream && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  {callData.callerPhoto ? (
                    <Image 
                      src={callData.callerPhoto} 
                      alt={callData.callerName}
                      width={128}
                      height={128}
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

        {/* Picture in Picture */}
        {(localStream || remoteStream) && (
          <div className="absolute bottom-20 right-4 w-24 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
            {usersCanSeeEachOther && remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : localStream ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
        )}

        {/* Call Controls */}
        <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${(showControls || callStatus === 'ringing' || callStatus === 'connecting') ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
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