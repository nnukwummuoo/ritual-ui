"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSocket } from '@/lib/socket';
import FanCallModal from '@/components/FanCallModal';
import { useAuth } from '@/lib/context/auth-context';
import { URL } from '@/api/config';

interface FanCallData {
  callId: string;
  callerId: string;
  callerName: string;
  callerFirstName?: string;
  callerLastName?: string;
  callerPhoto?: string;
  callerIsVip?: boolean;
  callerVipEndDate?: string | null;
  isIncoming: boolean;
  answererId?: string;
  answererName?: string;
  answererFirstName?: string;
  answererLastName?: string;
  answererPhoto?: string;
  answererIsVip?: boolean;
  answererVipEndDate?: string | null;
  userBalance?: number;
  callRate?: number;
  isCreator?: boolean;
}

interface VideoCallContextType {
  isVideoCallOpen: boolean;
  videoCallData: FanCallData | null;
  startVideoCall: (answererId: string, answererName: string, price?: number, answererIsVip?: boolean, answererVipEndDate?: string | null) => Promise<void>;
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
  const [videoCallData, setVideoCallData] = useState<FanCallData | null>(null);
  const { session } = useAuth();
  const socket = getSocket();

  // Start a video call
  const startVideoCall = async (answererId: string, answererName: string, price?: number, answererIsVip?: boolean, answererVipEndDate?: string | null) => {
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
      
      // Get caller's username and VIP status from database profile
      const callerName = data.profile?.username || data.profile?.firstname || 'Unknown User';
      const callerIsVip = data.profile?.isVip || false;
      const callerVipEndDate = data.profile?.vipEndDate || null;
      
      if (userBalance < callRate) {
        alert('Insufficient funds to start call. Please purchase gold first.');
        return;
      }

      // Use VIP data passed from RequestCard, or fetch if not provided
      let answererPhoto = '';
      let answererFirstName = undefined;
      let answererLastName = undefined;
      let answererVipStatus = answererIsVip || false;
      let answererVipEndDateValue = answererVipEndDate || null;
      
      // Only fetch photo if VIP data was provided (to avoid unnecessary API calls)
      if (answererIsVip !== undefined) {
        
        // Still fetch photo if needed
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
            answererFirstName = answererData.profile?.firstname;
            answererLastName = answererData.profile?.lastname;
            
          } else {
            console.error('Failed to fetch answerer profile:', answererResponse.status);
          }
        } catch (error) {
          console.error('Error fetching answerer photo:', error);
        }
      } else {
        // Fallback: fetch all data if VIP data not provided
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
            answererFirstName = answererData.profile?.firstname;
            answererLastName = answererData.profile?.lastname;
            answererVipStatus = answererData.profile?.isVip || false;
            answererVipEndDateValue = answererData.profile?.vipEndDate || null;
            
          } else {
            console.error('Failed to fetch answerer profile:', answererResponse.status);
          }
        } catch (error) {
          console.error('Error fetching answerer profile:', error);
        }
      }

      // Starting call
      
      socket.emit('fan_call_start', {
        callerId: session._id,
        callerName: callerName,
        callerFirstName: data.profile?.firstname,
        callerLastName: data.profile?.lastname,
        callerPhoto: data.profile?.photolink || (session as { photolink?: string })?.photolink || '',
        answererId: answererId,
        answererName: answererName,
        answererFirstName: answererFirstName,
        answererLastName: answererLastName,
        answererPhoto: answererPhoto,
        userBalance: userBalance,
        callRate: callRate
      });

      const callData: FanCallData = {
        callId: `temp_${Date.now()}`, // Temporary ID until we get the real one from server
        callerId: session._id,
        callerName: callerName,
        callerFirstName: data.profile?.firstname,
        callerLastName: data.profile?.lastname,
        callerPhoto: data.profile?.photolink || (session as { photolink?: string })?.photolink || '',
        callerIsVip: callerIsVip,
        callerVipEndDate: callerVipEndDate,
        answererId: answererId,
        answererName: answererName,
        answererFirstName: answererFirstName,
        answererLastName: answererLastName,
        answererPhoto: answererPhoto,
        answererIsVip: answererVipStatus,
        answererVipEndDate: answererVipEndDateValue,
        userBalance: userBalance, // Use real-time balance from database
        callRate: callRate,
        isCreator: isCreator, // Use creator status from database
        isIncoming: false
      };
      
      

      setVideoCallData(callData);
      setIsVideoCallOpen(true);

      // Emit start call event
      socket.emit('fan_call_start', {
        callerId: session._id,
        callerName: callerName,
        callerFirstName: data.profile?.firstname,
        callerLastName: data.profile?.lastname,
        callerPhoto: data.profile?.photolink || (session as { photolink?: string })?.photolink || '',
        answererId: answererId,
        answererName: answererName,
        answererFirstName: answererFirstName,
        answererLastName: answererLastName,
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

    const handleIncomingCall = async (data: { 
      callId: string; 
      callerId: string; 
      callerName: string; 
      callerFirstName?: string;
      callerLastName?: string;
      callerPhoto?: string;
      callerIsVip?: boolean;
      callerVipEndDate?: string | null;
      answererIsVip?: boolean;
      answererVipEndDate?: string | null;
    }) => {
      console.log('📞 [VideoCall] Received incoming call:', {
        callId: data.callId,
        callerId: data.callerId,
        callerName: data.callerName,
        callerPhoto: data.callerPhoto,
        callerIsVip: data.callerIsVip,
        callerVipEndDate: data.callerVipEndDate,
        answererIsVip: data.answererIsVip,
        answererVipEndDate: data.answererVipEndDate
      });
      
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

        // Use VIP data from backend instead of making separate API calls
        let callerPhoto = data.callerPhoto || '';
        let callerFirstName = data.callerFirstName;
        let callerLastName = data.callerLastName;
        let callerUsername = data.callerName; // Store username from socket data
        const callerIsVip = data.callerIsVip || false;
        const callerVipEndDate = data.callerVipEndDate || null;
        const answererIsVip = data.answererIsVip || false;
        const answererVipEndDate = data.answererVipEndDate || null;
        
        // Always fetch caller profile data to get correct first name and last name
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
            callerPhoto = callerData.profile?.photolink || callerPhoto;
            callerFirstName = callerData.profile?.firstname;
            callerLastName = callerData.profile?.lastname;
            callerUsername = callerData.profile?.username ? `@${callerData.profile.username}` : data.callerName; // Update username from profile data with @ symbol
            
          }
        } catch (error) {
          console.error('Error fetching caller profile:', error);
        }

        // callerUsername is already updated from the profile data above

        const callData: FanCallData = {
          callId: data.callId,
          callerId: data.callerId,
          callerName: callerUsername, // Use username from profile data
          callerFirstName: callerFirstName,
          callerLastName: callerLastName,
          callerPhoto: callerPhoto,
          callerIsVip: callerIsVip,
          callerVipEndDate: callerVipEndDate,
          answererId: session._id,
          answererName: profileData.profile?.username || session.name || 'Creator',
          answererFirstName: profileData.profile?.firstname,
          answererLastName: profileData.profile?.lastname,
          answererIsVip: answererIsVip,
          answererVipEndDate: answererVipEndDate,
          isCreator: isCreator, // Use creator status from database
          isIncoming: true
        };
        

        setVideoCallData(callData);
        setIsVideoCallOpen(true);
      } catch (error) {
        console.error('Error fetching user profile for incoming call:', error);
        // Fallback to session data if API call fails
        const callData: FanCallData = {
          callId: data.callId,
          callerId: data.callerId,
          callerName: data.callerName,
          callerFirstName: data.callerFirstName,
          callerLastName: data.callerLastName,
          callerPhoto: data.callerPhoto,
          answererId: session._id,
          answererName: session.name || 'Creator',
          isCreator: session.isCreator || false, // Fallback to session
          isIncoming: true
        };

        setVideoCallData(callData);
        setIsVideoCallOpen(true);
      }
    };

    const handleCallAccepted = (data: { 
      callId: string;
      callerId?: string;
      answererId?: string;
      answererName?: string;
      callerIsVip?: boolean;
      callerVipEndDate?: string | null;
      answererIsVip?: boolean;
      answererVipEndDate?: string | null;
    }) => {
      console.log('📞 [VideoCall] Call accepted, updating call ID:', data.callId);
      
      // Update call data with real call ID and VIP data if we have a temporary one
      if (videoCallData?.callId.startsWith('temp_')) {
        
        setVideoCallData(prev => prev ? { 
          ...prev, 
          callId: data.callId,
          callerIsVip: data.callerIsVip || prev.callerIsVip,
          callerVipEndDate: data.callerVipEndDate || prev.callerVipEndDate,
          answererIsVip: data.answererIsVip || prev.answererIsVip,
          answererVipEndDate: data.answererVipEndDate || prev.answererVipEndDate
        } : null);
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

    socket.on('fan_call_incoming', handleIncomingCall);
    socket.on('fan_call_accepted', handleCallAccepted);
    socket.on('fan_call_declined', handleCallDeclined);
    socket.on('fan_call_ended', handleCallEnded);
    socket.on('fan_call_error', handleCallError);
    socket.on('fan_call_timeout', handleCallTimeout);

    return () => {
      socket.off('fan_call_incoming', handleIncomingCall);
      socket.off('fan_call_accepted', handleCallAccepted);
      socket.off('fan_call_declined', handleCallDeclined);
      socket.off('fan_call_ended', handleCallEnded);
      socket.off('fan_call_error', handleCallError);
      socket.off('fan_call_timeout', handleCallTimeout);
    };
  }, [socket, session?._id, session?.isCreator, session?.name, videoCallData?.callId]);

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
         <FanCallModal
           isOpen={isVideoCallOpen}
           onClose={closeVideoCall}
           callData={videoCallData}
           currentUserId={session._id || ''}
           currentUserName={videoCallData?.callerName || 'Unknown'}
           userBalance={videoCallData?.userBalance || 0}
           creatorEarnings={session.earnings || 0}
           isCreator={videoCallData?.isCreator || false}
           callRate={videoCallData?.callRate || 1}
         />
       )}
    </VideoCallContext.Provider>
  );
};
