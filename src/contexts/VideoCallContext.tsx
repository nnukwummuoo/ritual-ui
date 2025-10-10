"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSocket } from '@/lib/socket';
import VideoCallModal from '@/components/VideoCallModal';
import { useAuth } from '@/lib/context/auth-context';

interface VideoCallData {
  callId: string;
  callerId: string;
  callerName: string;
  callerPhoto?: string;
  isIncoming: boolean;
}

interface VideoCallContextType {
  isVideoCallOpen: boolean;
  videoCallData: VideoCallData | null;
  startVideoCall: (answererId: string, answererName: string, answererPhoto?: string) => void;
  closeVideoCall: () => void;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
};

interface VideoCallProviderProps {
  children: ReactNode;
}

export const VideoCallProvider: React.FC<VideoCallProviderProps> = ({ children }) => {
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [videoCallData, setVideoCallData] = useState<VideoCallData | null>(null);
  const { session } = useAuth();
  const socket = getSocket();

  // Start a video call
  const startVideoCall = (answererId: string, answererName: string, answererPhoto?: string) => {
    if (!socket || !session?._id) return;

    console.log('🎥 [VideoCall] Starting call:', {
      callerId: session._id,
      callerName: session.name || session.firstname || 'Unknown',
      answererId: answererId,
      answererName: answererName
    });

    const callData: VideoCallData = {
      callId: `temp_${Date.now()}`, // Temporary ID until we get the real one from server
      callerId: answererId,
      callerName: answererName,
      callerPhoto: answererPhoto,
      isIncoming: false
    };

    setVideoCallData(callData);
    setIsVideoCallOpen(true);

    // Emit start call event
    socket.emit('video_call_start', {
      callerId: session._id,
      callerName: session.name || session.firstname || 'Unknown',
      answererId: answererId,
      answererName: answererName
    });
  };

  // Close video call
  const closeVideoCall = () => {
    setIsVideoCallOpen(false);
    setVideoCallData(null);
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket || !session?._id) return;

    const handleIncomingCall = (data: any) => {
      const callData: VideoCallData = {
        callId: data.callId,
        callerId: data.callerId,
        callerName: data.callerName,
        callerPhoto: data.callerPhoto,
        isIncoming: true
      };

      setVideoCallData(callData);
      setIsVideoCallOpen(true);
    };

    const handleCallAccepted = (data: any) => {
      console.log('📞 [VideoCall] Call accepted, updating call ID:', data.callId);
      // Update call data with real call ID if we have a temporary one
      if (videoCallData?.callId.startsWith('temp_')) {
        setVideoCallData(prev => prev ? { ...prev, callId: data.callId } : null);
        console.log('📞 [VideoCall] Updated call ID from temp to:', data.callId);
      }
    };

    const handleCallDeclined = (data: any) => {
      closeVideoCall();
    };

    const handleCallEnded = (data: any) => {
      closeVideoCall();
    };

    const handleCallError = (data: any) => {
      console.error('Video call error:', data.message);
      closeVideoCall();
    };

    socket.on('video_call_incoming', handleIncomingCall);
    socket.on('video_call_accepted', handleCallAccepted);
    socket.on('video_call_declined', handleCallDeclined);
    socket.on('video_call_ended', handleCallEnded);
    socket.on('video_call_error', handleCallError);

    return () => {
      socket.off('video_call_incoming', handleIncomingCall);
      socket.off('video_call_accepted', handleCallAccepted);
      socket.off('video_call_declined', handleCallDeclined);
      socket.off('video_call_ended', handleCallEnded);
      socket.off('video_call_error', handleCallError);
    };
  }, [socket, session?._id, videoCallData?.callId]);

  const contextValue: VideoCallContextType = {
    isVideoCallOpen,
    videoCallData,
    startVideoCall,
    closeVideoCall
  };

  return (
    <VideoCallContext.Provider value={contextValue}>
      {children}
      
      {/* Video Call Modal */}
      {isVideoCallOpen && videoCallData && session && (
        <VideoCallModal
          isOpen={isVideoCallOpen}
          onClose={closeVideoCall}
          callData={videoCallData}
          currentUserId={session._id}
          currentUserName={session.name || session.firstname || 'Unknown'}
          userBalance={parseFloat(session.balance || '0')}
          creatorEarnings={session.earnings || 0}
          isCreator={session.isCreator || false}
          callRate={1} // Default 1 gold per minute (can be dynamic later)
        />
      )}
    </VideoCallContext.Provider>
  );
};
