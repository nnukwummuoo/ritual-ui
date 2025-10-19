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
  callerUsername?: string;
  callerPhoto?: string;
  callerIsVip?: boolean;
  callerVipEndDate?: string | null;
  isIncoming: boolean;
  answererId?: string;
  answererName?: string;
  answererFirstName?: string;
  answererLastName?: string;
  answererUsername?: string;
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
  startVideoCall: (answererId: string, answererName: string, price?: number, answererIsVip?: boolean, answererVipEndDate?: string | null, answererFirstName?: string, answererLastName?: string) => Promise<void>;
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
  const startVideoCall = async (answererId: string, answererName: string, price?: number, answererIsVip?: boolean, answererVipEndDate?: string | null, answererFirstName?: string, answererLastName?: string) => {
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
      
      // Get caller's name and VIP status from database profile
      const callerName = data.profile?.firstname && data.profile?.lastname 
        ? `${data.profile.firstname} ${data.profile.lastname}` 
        : data.profile?.firstname || data.profile?.username || 'Unknown User';
      const callerIsVip = data.profile?.isVip || false;
      const callerVipEndDate = data.profile?.vipEndDate || null;
      
      if (userBalance < callRate) {
        alert('Insufficient funds to start call. Please purchase gold first.');
        return;
      }

       // Use data passed from RequestCard, or fetch if not provided
       let answererPhoto = '';
       let answererVipStatus = answererIsVip || false;
       let answererVipEndDateValue = answererVipEndDate || null;
       let answererFirstNameValue = answererFirstName || '';
       let answererLastNameValue = answererLastName || '';
       
       // If firstname/lastname not provided, fetch from database
       if (!answererFirstNameValue || !answererLastNameValue) {
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
             
             // Only use fetched data if not already provided
             if (!answererFirstNameValue) {
               answererFirstNameValue = answererData.profile?.firstname || '';
             }
             if (!answererLastNameValue) {
               answererLastNameValue = answererData.profile?.lastname || '';
             }
             
             // Only override VIP data if not provided from RequestCard
             if (answererIsVip === undefined) {
               answererVipStatus = answererData.profile?.isVip || false;
               answererVipEndDateValue = answererData.profile?.vipEndDate || null;
             }
             
             console.log('🔍 [VIP Debug] startVideoCall - Fetched answerer profile data:', {
               answererId,
               answererData: answererData.profile,
               answererFirstName: answererFirstNameValue,
               answererLastName: answererLastNameValue,
               answererIsVip: answererVipStatus,
               answererVipEndDate: answererVipEndDateValue
             });
           }
         } catch (error) {
           console.error('Error fetching answerer profile:', error);
         }
       } else {
         // If firstname/lastname provided, still fetch photo if needed
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
           }
         } catch (error) {
           console.error('Error fetching answerer photo:', error);
         }
       }

      // Starting call
      
      socket.emit('fan_call_start', {
        callerId: session._id,
        callerName: callerName,
        callerPhoto: data.profile?.photolink || (session as { photolink?: string })?.photolink || '',
        answererId: answererId,
        answererName: answererName,
        answererPhoto: answererPhoto,
        userBalance: userBalance,
        callRate: callRate
      });

       const callData: FanCallData = {
         callId: `temp_${Date.now()}`, // Temporary ID until we get the real one from server
         callerId: session._id,
         callerName: callerName,
         callerFirstName: data.profile?.firstname || '',
         callerLastName: data.profile?.lastname || '',
         callerPhoto: data.profile?.photolink || (session as { photolink?: string })?.photolink || '',
         callerIsVip: callerIsVip,
         callerVipEndDate: callerVipEndDate,
         answererId: answererId,
         answererName: answererName,
         answererFirstName: answererFirstNameValue,
         answererLastName: answererLastNameValue,
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
        callerPhoto: data.profile?.photolink || (session as { photolink?: string })?.photolink || '',
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

     const handleIncomingCall = async (data: { 
       callId: string; 
       callerId: string; 
       callerName: string; 
       callerFirstName?: string;
       callerLastName?: string;
       callerUsername?: string;
       callerPhoto?: string;
       callerIsVip?: boolean;
       callerVipEndDate?: string | null;
       answererFirstName?: string;
       answererLastName?: string;
       answererUsername?: string;
       answererIsVip?: boolean;
       answererVipEndDate?: string | null;
     }) => {
       console.log('📞 [VideoCall] Received incoming call:', {
         callId: data.callId,
         callerId: data.callerId,
         callerName: data.callerName,
         callerFirstName: data.callerFirstName,
         callerLastName: data.callerLastName,
         callerUsername: data.callerUsername,
         callerPhoto: data.callerPhoto,
         callerIsVip: data.callerIsVip,
         callerVipEndDate: data.callerVipEndDate,
         answererFirstName: data.answererFirstName,
         answererLastName: data.answererLastName,
         answererUsername: data.answererUsername,
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
        let callerIsVip = data.callerIsVip || false;
        let callerVipEndDate = data.callerVipEndDate || null;
        let answererIsVip = data.answererIsVip || false;
        let answererVipEndDate = data.answererVipEndDate || null;
        
        // Only fetch photo if not provided by backend
        if (!callerPhoto) {
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
              callerPhoto = callerData.profile?.photolink || '';
            }
          } catch (error) {
            console.error('Error fetching caller photo:', error);
          }
        }

         const callData: FanCallData = {
           callId: data.callId,
           callerId: data.callerId,
           callerName: data.callerName,
           callerFirstName: data.callerFirstName,
           callerLastName: data.callerLastName,
           callerUsername: data.callerUsername,
           callerPhoto: callerPhoto,
           callerIsVip: callerIsVip,
           callerVipEndDate: callerVipEndDate,
           answererId: session._id,
           answererName: session.name || 'Creator',
           answererFirstName: session.firstname,
           answererLastName: session.lastname,
           answererUsername: session.nickname,
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
           callerUsername: data.callerUsername,
           callerPhoto: data.callerPhoto,
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
      callerFirstName?: string;
      callerLastName?: string;
      answererId?: string;
      answererName?: string;
      answererFirstName?: string;
      answererLastName?: string;
      callerIsVip?: boolean;
      callerVipEndDate?: string | null;
      answererIsVip?: boolean;
      answererVipEndDate?: string | null;
    }) => {
      console.log('📞 [VideoCall] Call accepted, updating call ID:', data.callId);
      console.log('🔍 [VIP Debug] Call accepted data in context:', {
        callerIsVip: data.callerIsVip,
        callerVipEndDate: data.callerVipEndDate,
        answererIsVip: data.answererIsVip,
        answererVipEndDate: data.answererVipEndDate,
        callerFirstName: data.callerFirstName,
        callerLastName: data.callerLastName,
        answererFirstName: data.answererFirstName,
        answererLastName: data.answererLastName
      });
      
      // Update call data with real call ID and VIP data if we have a temporary one
      if (videoCallData?.callId.startsWith('temp_')) {
        console.log('🔍 [VIP Debug] handleCallAccepted - Updating call data with VIP info:', {
          oldData: videoCallData,
          newVipData: {
            callerIsVip: data.callerIsVip,
            callerVipEndDate: data.callerVipEndDate,
            answererIsVip: data.answererIsVip,
            answererVipEndDate: data.answererVipEndDate
          }
        });
        
        setVideoCallData(prev => prev ? { 
          ...prev, 
          callId: data.callId,
          callerFirstName: data.callerFirstName || prev.callerFirstName,
          callerLastName: data.callerLastName || prev.callerLastName,
          answererFirstName: data.answererFirstName || prev.answererFirstName,
          answererLastName: data.answererLastName || prev.answererLastName,
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
