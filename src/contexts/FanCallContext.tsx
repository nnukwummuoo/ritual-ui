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
  startVideoCall: (answererId: string, answererName: string, price?: number, answererIsVip?: boolean, answererVipEndDate?: string | null, answererFirstName?: string, answererLastName?: string, answererPhoto?: string) => Promise<void>;
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
  const [hasCallEnded, setHasCallEnded] = useState(false);
  const [endedCallId, setEndedCallId] = useState<string | null>(null);
  const { session } = useAuth();
  const socket = getSocket();

  // Start a video call
  const startVideoCall = async (answererId: string, answererName: string, price?: number, answererIsVip?: boolean, answererVipEndDate?: string | null, answererFirstName?: string, answererLastName?: string, answererPhoto?: string) => {
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
      
      const profileKeys = data.profile ? Object.keys(data.profile) : [];
      
      const userBalance = parseInt(data.profile?.balance) || 0; // Parse balance as integer
      const isCreator = data.profile?.creator || false; // Get creator status from database
      const callRate = price || 1; // Use price from request card, default to 1 if not provided
      
      // Get caller's photo - check multiple possible field names (case-insensitive search)
      let callerPhoto = '';
      if (data.profile) {
        // Try exact matches first
        callerPhoto = data.profile.photolink 
          || data.profile.photoLink 
          || data.profile.photo 
          || data.profile.avatar 
          || data.profile.image;
        
        // If not found, search case-insensitively through all keys
        if (!callerPhoto && profileKeys.length > 0) {
          for (const key of profileKeys) {
            const lowerKey = key.toLowerCase();
            const value = data.profile[key];
            if ((lowerKey.includes('photo') || lowerKey.includes('avatar') || lowerKey.includes('image') || lowerKey.includes('pic')) 
                && typeof value === 'string' && value.trim() !== '' && value !== 'null' && value !== 'undefined') {
              callerPhoto = value;
              break;
            }
          }
        }
      }
      
      // Fallback to session
      if (!callerPhoto) {
        callerPhoto = (session as { photolink?: string })?.photolink 
          || (session as { photoLink?: string })?.photoLink 
          || (session as any)?.photo 
          || '';
      }
      
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
       // Priority: 1) Passed photo parameter, 2) Fetch from API
       let answererPhotoValue = answererPhoto || '';
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
             
             const answererProfileKeys = answererData.profile ? Object.keys(answererData.profile) : [];
             
             // Only fetch photo if not already provided from RequestCard
             if (!answererPhotoValue) {
               // Check multiple possible field names for photo (including creatorphotolink)
               answererPhotoValue = answererData.profile?.photolink 
                 || answererData.profile?.photoLink 
                 || answererData.profile?.creatorphotolink
                 || answererData.profile?.photo 
                 || answererData.profile?.avatar 
                 || answererData.profile?.image 
                 || '';
               
               // If not found, search case-insensitively
               if (!answererPhotoValue && answererProfileKeys.length > 0) {
                 for (const key of answererProfileKeys) {
                   const lowerKey = key.toLowerCase();
                   const value = answererData.profile[key];
                   if ((lowerKey.includes('photo') || lowerKey.includes('avatar') || lowerKey.includes('image') || lowerKey.includes('pic')) 
                       && typeof value === 'string' && value.trim() !== '' && value !== 'null' && value !== 'undefined') {
                     answererPhotoValue = value;
                     break;
                   }
                 }
               }
               
             }
             
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
             
           } else {
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
             
             const answererProfileKeys = answererData.profile ? Object.keys(answererData.profile) : [];
             
             // Only fetch photo if not already provided from RequestCard
             if (!answererPhotoValue) {
               // Check multiple possible field names for photo
               answererPhotoValue = answererData.profile?.photolink 
                 || answererData.profile?.photoLink 
                 || answererData.profile?.creatorphotolink
                 || answererData.profile?.photo 
                 || answererData.profile?.avatar 
                 || answererData.profile?.image 
                 || '';
               
               // If not found, search case-insensitively
               if (!answererPhotoValue && answererProfileKeys.length > 0) {
                 for (const key of answererProfileKeys) {
                   const lowerKey = key.toLowerCase();
                   const value = answererData.profile[key];
                   if ((lowerKey.includes('photo') || lowerKey.includes('avatar') || lowerKey.includes('image') || lowerKey.includes('pic')) 
                       && typeof value === 'string' && value.trim() !== '' && value !== 'null' && value !== 'undefined') {
                     answererPhotoValue = value;
                     break;
                   }
                 }
               }
               
             }
           }
         } catch (error) {
           console.error('Error fetching answerer photo:', error);
         }
       }


      // Starting call
      
      socket.emit('fan_call_start', {
        callerId: session._id,
        callerName: callerName,
        callerPhoto: callerPhoto,
        answererId: answererId,
        answererName: answererName,
        answererPhoto: answererPhotoValue,
        userBalance: userBalance,
        callRate: callRate
      });

       const callData: FanCallData = {
         callId: `temp_${Date.now()}`, // Temporary ID until we get the real one from server
         callerId: session._id,
         callerName: callerName,
         callerFirstName: data.profile?.firstname || '',
         callerLastName: data.profile?.lastname || '',
         callerPhoto: callerPhoto,
         callerIsVip: callerIsVip,
         callerVipEndDate: callerVipEndDate,
         answererId: answererId,
         answererName: answererName,
         answererFirstName: answererFirstNameValue,
         answererLastName: answererLastNameValue,
         answererPhoto: answererPhotoValue,
         answererIsVip: answererVipStatus,
         answererVipEndDate: answererVipEndDateValue,
         userBalance: userBalance, // Use real-time balance from database
         callRate: callRate,
         isCreator: isCreator, // Use creator status from database
         isIncoming: false
       };

       // Reset ended call state when starting a new call
      setHasCallEnded(false);
      setEndedCallId(null);

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
    // Mark call as ended to prevent reopening
    if (videoCallData?.callId) {
      setHasCallEnded(true);
      setEndedCallId(videoCallData.callId);
    }
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
      // Don't open modal if this call has already ended
      if (hasCallEnded && endedCallId === data.callId) {
        console.log('🚫 [FanCall] Ignoring incoming call event - call already ended:', data.callId);
        return;
      }
      
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
        
        // ALWAYS fetch caller photo if not provided by socket (it's often missing)
        // This ensures we have the photo for incoming calls
        if (!callerPhoto || callerPhoto === '' || callerPhoto === 'NOT FOUND') {
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
              callerPhoto = callerData.profile?.photolink || callerData.profile?.photoLink || '';
            }
          } catch (error) {
            console.error('Error fetching caller photo:', error);
          }
        }

        // Fetch answerer (current user) photo
        let answererPhoto = profileData.profile?.photolink || (session as { photolink?: string })?.photolink || '';
        if (!answererPhoto) {
          // Try to get from session
          answererPhoto = (session as any)?.photo || (session as any)?.photoLink || '';
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
           answererUsername: session.username,
           answererPhoto: answererPhoto, // Set answerer photo for incoming calls
           answererIsVip: answererIsVip,
           answererVipEndDate: answererVipEndDate,
          isCreator: isCreator, // Use creator status from database
          isIncoming: true
        };

        // Reset ended call state when receiving incoming call
        setHasCallEnded(false);
        setEndedCallId(null);

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

        // Reset ended call state when receiving incoming call (fallback)
        setHasCallEnded(false);
        setEndedCallId(null);
        
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
      // Don't process if this call has already ended
      if (hasCallEnded && endedCallId === data.callId) {
        console.log('🚫 [FanCall] Ignoring call accepted event - call already ended:', data.callId);
        return;
      }
      
      // Update call data with real call ID and VIP data if we have a temporary one
      if (videoCallData?.callId.startsWith('temp_')) {
        
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
      }
    };

    const handleCallDeclined = () => {
      closeVideoCall();
    };

    const handleCallEnded = (data?: { callId?: string; endedBy?: string }) => {
      console.log('📞 [FanCall] Call ended event received in context:', data);
      // Mark as ended before closing to prevent reopening
      if (data?.callId) {
        setHasCallEnded(true);
        setEndedCallId(data.callId);
      } else if (videoCallData?.callId) {
        setHasCallEnded(true);
        setEndedCallId(videoCallData.callId);
      }
      closeVideoCall();
    };

    const handleCallError = (data: { message: string }) => {
      console.error('Video call error:', data.message);
      closeVideoCall();
    };

    const handleCallTimeout = () => {
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
  }, [socket, session?._id, session?.isCreator, videoCallData?.callId, hasCallEnded, endedCallId]);

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
