/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { IoCall, IoCallSharp, IoVideocam, IoVideocamOff, IoMic, IoMicOff, IoClose } from 'react-icons/io5';
import { getSocket } from '@/lib/socket';

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
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const socket = getSocket();

  // Simple timer functions
  const startCallTimer = useCallback(() => {
    if (durationIntervalRef.current) return;
    console.log('⏱️ [VideoCall] Starting call timer');
    callStartTimeRef.current = Date.now();
    durationIntervalRef.current = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
    }, 1000);
  }, []);

  const stopCallTimer = useCallback(() => {
    console.log('⏱️ [VideoCall] Stopping call timer');
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get user media - SIMPLIFIED
  const getUserMedia = useCallback(async () => {
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
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.name === 'NotReadableError') {
          console.error('❌ [VideoCall] Camera/microphone is already in use by another application');
          // You could show a user-friendly message here
        } else if (error.name === 'NotAllowedError') {
          console.error('❌ [VideoCall] Camera/microphone access denied by user');
        } else if (error.name === 'NotFoundError') {
          console.error('❌ [VideoCall] No camera/microphone found');
        }
      }
      
      return null;
    }
  }, [isVideoEnabled, isAudioEnabled]);

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
        
        // Check if we can start the timer now
        setTimeout(() => {
          const canSee = !!localStream && !!newRemoteStream && pc.connectionState === 'connected';
          if (canSee && !usersCanSeeEachOther) {
            console.log('👥 [VideoCall] Remote stream received - users can see each other! Starting timer...');
            setUsersCanSeeEachOther(true);
            startCallTimer();
          }
        }, 500);
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
            console.log('👥 [VideoCall] Users can now see each other! Starting timer...');
            setUsersCanSeeEachOther(true);
            startCallTimer();
          }
        }, 1000);
      }
    };

    // Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log('📹 [WebRTC] ICE connection state:', pc.iceConnectionState);
    };

    return pc;
  }, [socket, callData?.callId, localStream, remoteStream, usersCanSeeEachOther, startCallTimer]);

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

  // Cleanup function
  const handleCleanup = useCallback(() => {
    console.log('🧹 [VideoCall] Cleaning up call...');
    stopCallTimer();
    setUsersCanSeeEachOther(false);
    setCallDuration(0); // Reset timer display
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    
    setRemoteStream(null);
  }, [localStream, peerConnection, stopCallTimer]);

  // Toggle video/audio
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Auto-request user media when modal opens
  useEffect(() => {
    if (isOpen && !localStream) {
      getUserMedia();
    }
  }, [isOpen, localStream, getUserMedia]);

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
        } catch  {
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

  // Check for successful video connection and start timer
  useEffect(() => {
    if (callStatus === 'connected' && localStream && remoteStream && peerConnection) {
      const checkConnection = () => {
        const isConnected = peerConnection.connectionState === 'connected';
        const isIceConnected = peerConnection.iceConnectionState === 'connected';
        
        if (isConnected && isIceConnected && !usersCanSeeEachOther) {
          console.log('👥 [VideoCall] Video connection successful! Starting timer...');
          setUsersCanSeeEachOther(true);
          startCallTimer();
        }
      };

      // Check immediately
      checkConnection();
      
      // Also check after a delay to ensure everything is stable
      const timeoutId = setTimeout(checkConnection, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [callStatus, localStream, remoteStream, peerConnection, usersCanSeeEachOther, startCallTimer]);

  if (!isOpen || !callData) return null;


  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="w-full h-full flex flex-col">
        {/* Call Timer */}
        {callStatus === 'connected' && usersCanSeeEachOther && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
              <span className="text-lg font-mono">{formatDuration(callDuration)}</span>
            </div>
          </div>
        )}

        {/* Main Video Display */}
        <div className="flex-1 relative bg-gray-900">
          {/* Remote video - main display when connected */}
          {remoteStream && usersCanSeeEachOther && (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              onError={(e) => console.error('Remote video error:', e)}
            />
          )}
          
          {/* Local video - main display when not connected or as fallback */}
          {(!remoteStream || !usersCanSeeEachOther) && localStream && (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onError={(e) => console.error('Local video error:', e)}
            />
          )}
          
          {/* Fallback UI when no streams */}
          {!localStream && !remoteStream && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  {(() => {
                    // Check if photo exists and is not a fallback/default image
                    const photo = callData.callerPhoto;
                    console.log('🔍 [VideoCall] Photo validation:', { photo, hasPhoto: !!photo });
                    const hasValidPhoto = photo && 
                      photo.trim() !== '' &&
                      !photo.includes('/public/') && 
                      !photo.includes('default') &&
                      !photo.includes('placeholder') &&
                      !photo.includes('avatar') &&
                      !photo.includes('fallback') &&
                      !photo.includes('no-image') &&
                      !photo.includes('no_photo') &&
                      !photo.includes('no_avatar') &&
                      photo !== 'null' &&
                      photo !== 'undefined';
                    console.log('🔍 [VideoCall] Has valid photo:', hasValidPhoto);
                    
                    if (hasValidPhoto) {
                      return (
                        <>
                          <Image 
                            src={photo} 
                            alt={callData.callerName}
                            width={128}
                            height={128}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              // If image fails to load, hide it and show initials
                              e.currentTarget.style.display = 'none';
                              const initialsSpan = e.currentTarget.parentElement?.querySelector('.initials');
                              if (initialsSpan) {
                                (initialsSpan as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                          <span className="text-4xl font-bold initials absolute inset-0 flex items-center justify-center" style={{display: 'none'}}>
                            {(callData.callerName || 'Caller').split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </>
                      );
                    }
                    
                    return (
                      <span className="text-4xl font-bold initials">
                        {(callData.callerName || 'Caller').split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)}
                      </span>
                    );
                  })()}
                </div>
                <h2 className="text-2xl font-bold mb-2">{callData.callerName || 'Caller'}</h2>
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
          <div className="absolute top-20 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
            {usersCanSeeEachOther && localStream ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : null}
            <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
              {usersCanSeeEachOther && localStream ? 'You' : (callData.callerName || 'Caller')}
            </div>
          </div>
        )}

        {/* Call Controls */}
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