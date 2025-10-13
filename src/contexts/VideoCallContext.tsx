"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSocket } from '@/lib/socket';
import VideoCallModal from '@/components/VideoCallModal';
import { useAuth } from '@/lib/context/auth-context';
import { URL } from '@/api/config';

interface VideoCallData {
  callId: string;
  callerId: string;
  callerName: string;
  callerPhoto?: string;
  callerIsVip?: boolean;
  callerVipEndDate?: string | null;
  isIncoming: boolean;
  answererId?: string;
  answererName?: string;
  answererPhoto?: string;
  answererIsVip?: boolean;
  answererVipEndDate?: string | null;
  userBalance?: number;
  callRate?: number;
  isCreator?: boolean;
}

interface VideoCallContextType {
  isVideoCallOpen: boolean;
  videoCallData: VideoCallData | null;
  startVideoCall: (answererId: string, answererName: string, price?: number) => Promise<void>;
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
  const startVideoCall = async (answererId: string, answererName: string, price?: number) => {
    if (!socket || !session?._id) return;

    try {
      // Get current user balance and creator status from database
      const response = await fetch(`${URL}/getprofile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: session._id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      const userBalance = parseInt(data.profile?.balance) || 0; // Parse balance as integer
      const isCreator = data.profile?.creator || false; // Get creator status from database
      const callRate = price || 1; // Use price from request card, default to 1 if not provided
      
      if (userBalance < callRate) {
        alert('Insufficient funds to start call. Please purchase gold first.');
        return;
      }

      // Get answerer's profile information
      let answererPhoto = '';
      let answererIsVip = false;
      let answererVipEndDate = null;
      
      try {
        const answererResponse = await fetch(`${URL}/getprofile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userid: answererId
          })
        });

        if (answererResponse.ok) {
          const answererData = await answererResponse.json();
          answererPhoto = answererData.profile?.photolink || '';
          answererIsVip = answererData.profile?.isVip || false;
          answererVipEndDate = answererData.profile?.vipEndDate || null;
        }
      } catch (error) {
        console.error('Error fetching answerer profile:', error);
      }

      // Starting call
      socket.emit('video_call_start', {
        callerId: session._id,
        callerName: session.name || session.firstname || 'Unknown',
        callerPhoto: (session as { photolink?: string })?.photolink || '',
        answererId: answererId,
        answererName: answererName,
        answererPhoto: answererPhoto,
        userBalance: userBalance,
        callRate: callRate
      });

      const callData: VideoCallData = {
        callId: `temp_${Date.now()}`, // Temporary ID until we get the real one from server
        callerId: session._id,
        callerName: session.name || session.firstname || 'Unknown',
        callerPhoto: (session as { photolink?: string })?.photolink || '',
        answererId: answererId,
        answererName: answererName,
        answererPhoto: answererPhoto,
        answererIsVip: answererIsVip,
        answererVipEndDate: answererVipEndDate,
        userBalance: userBalance, // Use real-time balance from database
        callRate: callRate,
        isCreator: isCreator, // Use creator status from database
        isIncoming: false
      };
      

      setVideoCallData(callData);
      setIsVideoCallOpen(true);

      // Emit start call event
      socket.emit('video_call_start', {
        callerId: session._id,
        callerName: session.name || session.firstname || 'Unknown',
        callerPhoto: (session as { photolink?: string })?.photolink || '',
        answererId: answererId,
        answererName: answererName,
        answererPhoto: answererPhoto
      });
    } catch (error) {
      console.error('Error checking user balance:', error);
      alert('Error checking your balance. Please try again.');
    }
  };

  // Close video call
  const closeVideoCall = () => {
    setIsVideoCallOpen(false);
    setVideoCallData(null);
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket || !session?._id) return;

    const handleIncomingCall = async (data: { callId: string; callerId: string; callerName: string; callerPhoto?: string }) => {
      try {
        // Get current user profile to determine creator status
        const response = await fetch(`${URL}/getprofile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userid: session._id
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const profileData = await response.json();
        const isCreator = profileData.profile?.creator || false;

        // Get caller's (fan's) profile information
        let callerPhoto = data.callerPhoto || '';
        let callerIsVip = false;
        let callerVipEndDate = null;
        
        try {
          const callerResponse = await fetch(`${URL}/getprofile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userid: data.callerId
            })
          });

          if (callerResponse.ok) {
            const callerData = await callerResponse.json();
            callerPhoto = callerData.profile?.photolink || data.callerPhoto || '';
            callerIsVip = callerData.profile?.isVip || false;
            callerVipEndDate = callerData.profile?.vipEndDate || null;
          }
        } catch (error) {
          console.error('Error fetching caller profile:', error);
        }

        const callData: VideoCallData = {
          callId: data.callId,
          callerId: data.callerId,
          callerName: data.callerName,
          callerPhoto: callerPhoto,
          callerIsVip: callerIsVip,
          callerVipEndDate: callerVipEndDate,
          isCreator: isCreator, // Use creator status from database
          isIncoming: true
        };

        setVideoCallData(callData);
        setIsVideoCallOpen(true);
      } catch (error) {
        console.error('Error fetching user profile for incoming call:', error);
        // Fallback to session data if API call fails
        const callData: VideoCallData = {
          callId: data.callId,
          callerId: data.callerId,
          callerName: data.callerName,
          callerPhoto: data.callerPhoto,
          isCreator: session.isCreator || false, // Fallback to session
          isIncoming: true
        };

        setVideoCallData(callData);
        setIsVideoCallOpen(true);
      }
    };

    const handleCallAccepted = (data: { callId: string }) => {
      console.log('📞 [VideoCall] Call accepted, updating call ID:', data.callId);
      // Update call data with real call ID if we have a temporary one
      if (videoCallData?.callId.startsWith('temp_')) {
        setVideoCallData(prev => prev ? { ...prev, callId: data.callId } : null);
        console.log('📞 [VideoCall] Updated call ID from temp to:', data.callId);
      }
    };

    const handleCallDeclined = () => {
      closeVideoCall();
    };

    const handleCallEnded = () => {
      closeVideoCall();
    };

    const handleCallError = (data: { message: string }) => {
      console.error('Video call error:', data.message);
      closeVideoCall();
    };

    const handleCallTimeout = () => {
      console.log('📞 [VideoCall] Call timeout - closing modal for answerer');
      // For the answerer (creator), just close the modal without any special message
      closeVideoCall();
    };

    socket.on('video_call_incoming', handleIncomingCall);
    socket.on('video_call_accepted', handleCallAccepted);
    socket.on('video_call_declined', handleCallDeclined);
    socket.on('video_call_ended', handleCallEnded);
    socket.on('video_call_error', handleCallError);
    socket.on('video_call_timeout', handleCallTimeout);

    return () => {
      socket.off('video_call_incoming', handleIncomingCall);
      socket.off('video_call_accepted', handleCallAccepted);
      socket.off('video_call_declined', handleCallDeclined);
      socket.off('video_call_ended', handleCallEnded);
      socket.off('video_call_error', handleCallError);
      socket.off('video_call_timeout', handleCallTimeout);
    };
  }, [socket, session?._id, session?.isCreator, videoCallData?.callId]);

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
          currentUserId={session._id || ''}
          currentUserName={session.name || session.firstname || 'Unknown'}
          userBalance={videoCallData?.userBalance || 0}
          creatorEarnings={session.earnings || 0}
          isCreator={videoCallData?.isCreator || false}
          callRate={videoCallData?.callRate || 1}
        />
      )}
    </VideoCallContext.Provider>
  );
};
