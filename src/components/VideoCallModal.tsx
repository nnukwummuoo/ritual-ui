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

  // Check if users can see each other (both have streams and connection is established)
  const checkUsersCanSeeEachOther = () => {
    const canSee = localStream && remoteStream && peerConnection && 
                   peerConnection.connectionState === 'connected' && 
                   peerConnection.iceConnectionState === 'connected';
    
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
    startCallTimer();
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

  // Ensure local video element gets the stream when it's rendered
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      console.log('📹 [VideoCall] Setting local video source in useEffect');
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Force video stream update on component mount/re-render
  useEffect(() => {
    const updateVideoStreams = () => {
      if (localStream && localVideoRef.current) {
        console.log('📹 [VideoCall] Force updating local video stream');
        localVideoRef.current.srcObject = localStream;
      }
      if (remoteStream && remoteVideoRef.current) {
        console.log('📹 [VideoCall] Force updating remote video stream');
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    // Update immediately
    updateVideoStreams();

    // Also update after a short delay to handle any timing issues
    const timeoutId = setTimeout(updateVideoStreams, 100);

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

  // Callback ref for local video to ensure stream is set when element is mounted
  const localVideoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
    if (node) {
      console.log('📹 [VideoCall] Local video element mounted');
      if (localStream) {
        console.log('📹 [VideoCall] Setting local video source via callback ref');
        node.srcObject = localStream;
      }
      // Store the node reference
      localVideoRef.current = node;
    } else {
      console.log('📹 [VideoCall] Local video element unmounted');
      localVideoRef.current = null;
    }
  }, [localStream]);

  // Ensure remote video element gets the stream when it's rendered
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log('📹 [VideoCall] Setting remote video source in useEffect');
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Callback ref for remote video to ensure stream is set when element is mounted
  const remoteVideoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
    if (node) {
      console.log('📹 [VideoCall] Remote video element mounted');
      if (remoteStream) {
        console.log('📹 [VideoCall] Setting remote video source via callback ref');
        node.srcObject = remoteStream;
      }
      // Store the node reference
      remoteVideoRef.current = node;
    } else {
      console.log('📹 [VideoCall] Remote video element unmounted');
      remoteVideoRef.current = null;
    }
  }, [remoteStream]);

  // Create peer connection
  const createPeerConnection = () => {
    console.log('📹 [WebRTC] Creating peer connection...');
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      console.log('📹 [WebRTC] Received remote stream:', event.streams[0]);
      console.log('📹 [WebRTC] Remote stream tracks:', event.streams[0].getTracks().map(track => ({
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState
      })));
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        console.log('📹 [WebRTC] Set remote video source');
        console.log('👥 [VideoCall] Remote user video is now visible in main container');
      } else {
        console.log('❌ [WebRTC] Remote video ref is null, cannot set stream');
      }
      
      // Check if users can now see each other
      setTimeout(() => checkUsersCanSeeEachOther(), 100);
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
        setTimeout(() => checkUsersCanSeeEachOther(), 100);
      } else if (pc.connectionState === 'failed') {
        console.log('❌ [WebRTC] Peer connection failed!');
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
        setTimeout(() => checkUsersCanSeeEachOther(), 100);
      } else if (pc.iceConnectionState === 'failed') {
        console.log('❌ [WebRTC] ICE connection failed!');
        setUsersCanSeeEachOther(false);
        stopCallTimer();
      }
    };

    // Handle signaling state changes
    pc.onsignalingstatechange = () => {
      console.log('📹 [WebRTC] Signaling state:', pc.signalingState);
    };

    setPeerConnection(pc);
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
        
        // Add local stream to peer connection
        if (localStream) {
          console.log('📹 [WebRTC] Adding local stream tracks to peer connection');
          localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
          });
        }
        
        // Create and send offer (I am the caller)
        console.log('📹 [WebRTC] Creating offer as caller');
        pc.createOffer().then(offer => {
          console.log('📹 [WebRTC] Setting local description with offer');
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
      
      // Only process offer if I am the answerer (not the caller)
      if ((data.callId === callData?.callId || data.callId.startsWith('temp_')) && !peerConnection) {
        console.log('📹 [WebRTC] Processing offer as ANSWERER for call:', data.callId);
        const pc = createPeerConnection();
        
        // Add local stream to peer connection
        if (localStream) {
          console.log('📹 [WebRTC] Adding local stream tracks to peer connection');
          localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
          });
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
      
      // Accept ICE candidate if callId matches OR if it's a temporary ID (for initial connection)
      if ((data.callId === callData?.callId || data.callId.startsWith('temp_')) && peerConnection) {
        console.log('📹 [WebRTC] Adding ICE candidate');
        await peerConnection.addIceCandidate(data.candidate);
      } else {
        console.log('📹 [WebRTC] Ignoring ICE candidate - callId mismatch or no peer connection');
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
