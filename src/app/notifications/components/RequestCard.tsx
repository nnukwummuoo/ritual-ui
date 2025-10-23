/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from 'next/image';
import React, { useState, useEffect, useCallback } from 'react'
import { BiTimeFive } from 'react-icons/bi'
import { FaCoins } from 'react-icons/fa';
import { toast } from 'material-react-toastify';
import { URL } from '@/api/config';
import { IoCalendarOutline, IoLocationOutline, IoTimeOutline, IoWarningOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import VIPBadge from "@/components/VIPBadge";
import { getSocket } from '@/lib/socket';
import { useRouter } from 'next/navigation';
import { useVideoCall } from '@/contexts/FanCallContext';
import RatingModal from '@/components/RatingModal';
import FanRatingModal from '@/components/FanRatingModal';
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const cardStates = {
  request: "Request sent",
  accepted: "Request accepted",
  declined: "Request declined",
  cancelled: "Request cancelled",
  expired: "Request expired",
  completed: "Request completed"
}
// Remove old ratings array - we'll use the new 5-star system
const getCreatorContent = (hostType: string, hasRating: boolean = false) => {
  const typeText = hostType || "Fan Meet"; // Default to "Fan Meet" if not provided
  
  // Special handling for Fan Call
  const getAcceptedContent = () => {
    if (typeText.toLowerCase() === "fan call") {
      return {
        head: "📞 Please wait for the fan to start the call.",
        body: "You've accepted the request — now relax and stay online. The fan will initiate the call when ready."
      };
    }
    return {
      head: `${typeText} Accepted`,
      body: "Please kindly remind your fan to mark as complete during or after the date — it only takes a second. If they don't, contact support within 24 hours.",
    };
  };

  // Different content for completed status based on whether fan has rated
  const getCompletedContent = () => {
    if (hasRating) {
      return {
        head: `${typeText} Completed`,
        body: "Your fan has rated this experience. Click the stars below to view their feedback."
      };
    }
    return {
      head: `${typeText} Completed`,
      body: "The experience has been completed successfully."
    };
  };
  
  return {
    accepted: getAcceptedContent(),
    completed: getCompletedContent(),
    declined: {
      head: `${typeText} Declined`,
      body: `You have declined the ${typeText.toLowerCase()} request from your fan.`
    },
    cancelled: {
      head: `${typeText} Cancelled`,
      body: "Your fan cancelled the request."
    },
    expired: {
      head: `${typeText} Expired`,
      body: "You can ask the fan to renew request."
    },
    request: {
      head: `New ${typeText} Request`,
      body: "You have 24 hours to accept or decline."
    }
  };
};
const getFanContent = (price: number, hostType: string, hasRating: boolean = false) => {
  const typeText = hostType || "Fan Meet"; // Default to "Fan Meet" if not provided
  
  // Special handling for Fan Call
  const getAcceptedContent = () => {
    if (typeText.toLowerCase() === "fan call") {
      return {
        head: "✅ Your call request has been accepted.",
        body: "You can now start the call when you're ready. Please ensure you have a stable connection before starting — once the call begins, billing starts per minute."
      };
    }
    return {
      head: `${typeText} Accepted`,
      body: `By clicking 'Mark as complete' you confirm that your pending gold of 💰 ${price} will be sent to the creator.`
    };
  };

  // Different content for completed status based on whether fan has rated
  const getCompletedContent = () => {
    if (hasRating) {
      return {
        head: `${typeText} Completed`,
        body: "Thank you for rating this experience!"
      };
    }
    return {
      head: `${typeText} Completed`,
      body: "How do you rate your experience?"
    };
  };
  
  return {
    accepted: getAcceptedContent(),
    completed: getCompletedContent(),
    declined: {
      head: `${typeText} Declined`,
      body: "Creator declined your request."
    },
    cancelled: {
      head: `${typeText} Cancelled`,
      body: "You have cancelled the request. You can renew this request anytime."
    },
    expired: {
      head: `${typeText} Expired`,
      body: "Your request has expired. You can renew this request anytime."
    },
    request: {
      head: "Waiting For Creator\'s Response",
      body: `Your ${typeText.toLowerCase()} request has been sent. The creator has 24 hours to respond.`
    }
  };
};

// Function to get the appropriate details title based on host type
const getDetailsTitle = (hostType: string) => {
  const typeText = hostType || "Fan Meet";
  
  // Map different host types to their appropriate detail titles
  const titleMap: Record<string, string> = {
    "fan call": "Call Details",
    "fan meet": "Meet Details", 
    "fan date": "Date Details",
    "fan hangout": "Hangout Details",
    "fan chat": "Chat Details"
  };
  
  // Check for exact matches first
  const lowerType = typeText.toLowerCase();
  if (titleMap[lowerType]) {
    return titleMap[lowerType];
  }
  
  // Check for partial matches
  if (lowerType.includes("call")) {
    return "Call Details";
  } else if (lowerType.includes("meet")) {
    return "Meet Details";
  } else if (lowerType.includes("date")) {
    return "Date Details";
  } else if (lowerType.includes("hangout")) {
    return "Hangout Details";
  } else if (lowerType.includes("chat")) {
    return "Chat Details";
  }
  
  // Default fallback
  return `${typeText} Details`;
};
const statusArr = ["request", "expired", "completed", "accepted", "declined", "cancelled"] 

// Helper function to generate initials from first name and last name
const generateInitials = (firstName?: string, lastName?: string, fallbackName?: string) => {
  // Clean and validate inputs (handle empty strings, null, undefined)
  const cleanFirstName = firstName?.trim();
  const cleanLastName = lastName?.trim();
  const cleanFallbackName = fallbackName?.trim();

  // If we have first name and last name, use them
  if (cleanFirstName && cleanLastName) {
    const initials = `${cleanFirstName.charAt(0).toUpperCase()}${cleanLastName.charAt(0).toUpperCase()}`;
    return initials;
  }
  
  // If we only have first name, use it
  if (cleanFirstName) {
    const initial = cleanFirstName.charAt(0).toUpperCase();
    return initial;
  }
  
  // If we only have last name, use it
  if (cleanLastName) {
    const initial = cleanLastName.charAt(0).toUpperCase();
    return initial;
  }
  
  // Fallback to the original logic using name/nickname
  if (cleanFallbackName) {
    const names = cleanFallbackName.split(' ').filter(name => name.trim().length > 0);
    if (names.length >= 2) {
      const initials = `${names[0].charAt(0).toUpperCase()}${names[names.length - 1].charAt(0).toUpperCase()}`;
      return initials;
    } else if (names.length === 1) {
      const initial = names[0].charAt(0).toUpperCase();
      return initial;
    }
  }
  
  return '?';
};

interface FanMeetDetails {
  date: string;
  time: string;
  venue: string;
  duration?: string;
}

interface CardProps {
    exp: string;
    children?: React.ReactNode;
    type: "fan" | "creator";
    titles?: string[];
    name: string;
    nickname?: string; // Add nickname prop
    firstName?: string; // Add first name prop
    lastName?: string; // Add last name prop
    img: string;
    status: "request" | "expired" | "completed" | "accepted" | "declined" | "cancelled";
    requestId?: string;
    price?: number;
    details?: FanMeetDetails;
    userid?: string;
    creator_portfolio_id?: string;
    targetUserId?: string; // Add target user ID for profile navigation
    hosttype?: string;
    isVip?: boolean;
    vipEndDate?: string | null;
    createdAt?: string; // Add creation timestamp for countdown
    onStatusChange?: (requestId: string, newStatus: string) => void;
}

export default function RequestCard({exp, img, name, nickname, firstName, lastName, titles=["fan"], status, type="fan", requestId, price, details, userid, creator_portfolio_id, targetUserId, hosttype, isVip=false, vipEndDate=null, createdAt, onStatusChange}: CardProps) {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);
  
  const [showDetails, setShowDetails] = useState(false);
  
  // Function to handle opening details modal
  const handleShowDetails = () => {
    setShowDetails(true);
    // Manually trigger countdown calculation when modal opens
    if (currentStatus === "accepted" || currentStatus === "request") {
      calculateTimeLeft();
    }
  };
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [submittedRating, setSubmittedRating] = useState(0); // Track the submitted rating
  const [showFeedbackModal, setShowFeedbackModal] = useState(false); // For creator to view feedback
  const [ratingData, setRatingData] = useState<{rating: number, feedback: string, fanName: string} | null>(null); // Store rating data for creator view
  
  // Creator rating state (creator rating fan)
  const [showFanRatingModal, setShowFanRatingModal] = useState(false);
  const [fanRatingLoading, setFanRatingLoading] = useState(false);
  const [selectedFanRating, setSelectedFanRating] = useState(0);
  const [submittedFanRating, setSubmittedFanRating] = useState(0); // Track the submitted fan rating
  const [showFanFeedbackModal, setShowFanFeedbackModal] = useState(false); // For fan to view feedback
  const [fanRatingData, setFanRatingData] = useState<{rating: number, feedback: string, creatorName: string} | null>(null); // Store fan rating data for fan view
  
  const router = useRouter();
  const { startVideoCall } = useVideoCall();
  
  // Get current user ID from Redux state
  const currentUserId = useSelector((state: RootState) => state.profile.userId);

  // Countdown calculation function
  const calculateTimeLeft = useCallback(() => {
    if (!createdAt) {
      return;
    }


    const now = new Date().getTime();
    const createdTime = new Date(createdAt).getTime();
    const isFanCall = hosttype?.toLowerCase() === "fan call";
    
    // Set expiration time based on request type and status
    let expirationHours;
    if (currentStatus === "request") {
      // Pending requests expire after 24 hours
      expirationHours = 24;
    } else if (currentStatus === "accepted") {
      // Accepted requests expire based on type
      expirationHours = isFanCall ? 48 : 168; // 48h for Fan call, 7 days (168h) for others
    } else {
      // For other statuses, don't show countdown
      return;
    }
    
    const expirationTime = createdTime + (expirationHours * 60 * 60 * 1000);
    const timeDiff = expirationTime - now;
    
 
    
    if (timeDiff <= 0) {
      setIsExpired(true);
      setTimeLeft("Expired");
      
      // Update the card status to expired
      if (currentStatus !== "expired") {
        setCurrentStatus("expired");
        onStatusChange?.(requestId || "", "expired");
      }
      return;
    }
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    let timeDisplay = "";
    if (isFanCall || currentStatus === "request") {
      timeDisplay = `${hours}h : ${minutes.toString().padStart(2, '0')}m`;
    } else {
      if (days > 0) {
        timeDisplay = `${days} day${days !== 1 ? 's' : ''} left`;
      } else {
        timeDisplay = `${remainingHours}h : ${minutes.toString().padStart(2, '0')}m`;
      }
    }
    
    setTimeLeft(timeDisplay);
  }, [createdAt, currentStatus, hosttype, requestId, onStatusChange]);

  // Handle expiration
  const handleExpiration = useCallback(async () => {
    if (!isExpired || !requestId || currentStatus === "expired") return;
    
    try {
      // Call API to expire the request and refund gold
      const response = await fetch(`${URL}/expire-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          userid,
          creator_portfolio_id,
          price
        })
      });
      
      if (response.ok) {
        setCurrentStatus('expired');
        onStatusChange?.(requestId, 'expired');
        toast.info("Request has expired and gold has been refunded to your balance");
      }
    } catch (error) {
      console.error("Error expiring request:", error);
    }
  }, [isExpired, requestId, currentStatus, userid, creator_portfolio_id, price, onStatusChange]);
  
  // Debug log for user ID sources
  useEffect(() => {
    let loginUserId = null;
    try {
      const loginData = localStorage.getItem('login');
      if (loginData) {
        const parsedData = JSON.parse(loginData);
        loginUserId = parsedData.userID || parsedData.userid || parsedData.id;
      }
    } catch (error) {
      // Error parsing login data - continue with current userId
    }
    
  }, [currentUserId, userid, creator_portfolio_id, type]);


  // Check for existing rating when component loads
  const checkExistingRating = useCallback(async () => {
    // Get user ID from Redux or localStorage fallback
    let userId = currentUserId;
    if (!userId && typeof window !== 'undefined') {
      try {
        const loginData = localStorage.getItem('login');
        if (loginData) {
          const parsedData = JSON.parse(loginData);
          userId = parsedData.userID || parsedData.userid || parsedData.id;
        }
      } catch (error) {
        // Error parsing login data - continue with current userId
      }
    }

    if (!requestId || !userId) {
      return;
    }

    // For fans: check if they have rated this request (fan-to-creator)
    if (type === "fan" && currentStatus === "completed") {
      try {
        // Force localhost for development
        const apiUrl = process.env.NODE_ENV === "development" ? "http://localhost:3100" : URL;
        const response = await fetch(`${apiUrl}/review/check/${requestId}/${userId}/fan-to-creator`);
        const data = await response.json();
        
        if (data.ok && data.hasRated) {
          setSubmittedRating(data.rating);
        } else {
          setSubmittedRating(0);
        }
      } catch (error) {
        setSubmittedRating(0);
      }
    }

    // For creators: check if this request has been rated by the fan (fan-to-creator)
    if (type === "creator" && currentStatus === "completed") {
      try {
        // Force localhost for development
        const apiUrl = process.env.NODE_ENV === "development" ? "http://localhost:3100" : URL;
        const response = await fetch(`${apiUrl}/review/check/${requestId}/${userid}/fan-to-creator`); // Use fan's userid
        const data = await response.json();
        
        if (data.ok && data.hasRated) {
          setSubmittedRating(data.rating);
          setRatingData({
            rating: data.rating,
            feedback: data.feedback,
            fanName: firstName && lastName ? `${firstName} ${lastName}` : (nickname || name) // Use the fan's first/last name or fallback
          });
        } else {
          setSubmittedRating(0);
          setRatingData(null);
        }
      } catch (error) {
        setSubmittedRating(0);
        setRatingData(null);
      }
    }

    // For creators: also check if creator has rated the fan (creator-to-fan)
    if (type === "creator" && currentStatus === "completed") {
      try {
        const apiUrl = process.env.NODE_ENV === "development" ? "http://localhost:3100" : URL;
        const fanRatingResponse = await fetch(`${apiUrl}/review/check/${requestId}/${userId}/creator-to-fan`);
        const fanRatingData = await fanRatingResponse.json();
        
        if (fanRatingData.ok && fanRatingData.hasRated) {
          setSubmittedFanRating(fanRatingData.rating);
          setFanRatingData({
            rating: fanRatingData.rating,
            feedback: fanRatingData.feedback,
            creatorName: "You"
          });
        } else {
          setSubmittedFanRating(0);
          setFanRatingData(null);
        }
      } catch (error) {
        setSubmittedFanRating(0);
        setFanRatingData(null);
      }
    }

    // For fans: check if creator has rated them (creator-to-fan)
    if (type === "fan" && currentStatus === "completed") {
      try {
        const apiUrl = process.env.NODE_ENV === "development" ? "http://localhost:3100" : URL;
        const fanRatingResponse = await fetch(`${apiUrl}/review/check/${requestId}/${creator_portfolio_id}/creator-to-fan`);
        const fanRatingData = await fanRatingResponse.json();
        
        if (fanRatingData.ok && fanRatingData.hasRated) {
          setSubmittedFanRating(fanRatingData.rating);
          setFanRatingData({
            rating: fanRatingData.rating,
            feedback: fanRatingData.feedback,
            creatorName: firstName && lastName ? `${firstName} ${lastName}` : (nickname || name)
          });
        } else {
          setSubmittedFanRating(0);
          setFanRatingData(null);
        }
      } catch (error) {
        setSubmittedFanRating(0);
        setFanRatingData(null);
      }
    }
  }, [requestId, currentUserId, type, currentStatus, userid, name, creator_portfolio_id, firstName, lastName, nickname]);

  // Check for existing rating when component loads or dependencies change
  useEffect(() => {
    checkExistingRating();
  }, [checkExistingRating]);

  // Socket integration for real-time updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !requestId) return;

    // Listen for fan meet request status updates
    const handleFanRequestStatusUpdate = (data: { 
      requestId: string; 
      status: string; 
      userid: string; 
      creator_portfolio_id: string;
      message?: string;
    }) => {
      // Check if this update is for this specific request
      if (data.requestId === requestId) {
        
        // Update local status
        setCurrentStatus(data.status as "request" | "expired" | "completed" | "accepted" | "declined" | "cancelled");
        
        // Don't auto-show rating modal - let user click stars manually
        
        // Notify parent component
        onStatusChange?.(data.requestId, data.status);
        
        // Show toast notification
        if (data.message) {
          toast.info(data.message);
        } else {
          // Default messages based on status and host type
          const getStatusMessage = (status: string, hostType?: string) => {
            const serviceType = hostType || "Fan request";
            const statusMessages = {
              'accepted': `🎉 Your ${serviceType} request has been accepted!`,
              'declined': `❌ Your ${serviceType} request was declined`,
              'cancelled': `🚫 ${serviceType} request was cancelled`,
              'completed': `✅ ${serviceType} has been completed!`,
              'expired': `⏰ ${serviceType} request has expired`
            };
            return statusMessages[status as keyof typeof statusMessages];
          };
          
          const message = getStatusMessage(data.status, hosttype);
          if (message) {
            toast.info(message);
          }
        }
      }
    };

    // Listen for fan meet request updates
    socket.on('fan_request_status_update', handleFanRequestStatusUpdate);
    
    // Listen for general request updates (fallback)
    socket.on('request_status_update', handleFanRequestStatusUpdate);

    // Cleanup listeners on unmount
    return () => {
        socket.off('fan_request_status_update', handleFanRequestStatusUpdate);
      socket.off('request_status_update', handleFanRequestStatusUpdate);
    };
  }, [requestId, onStatusChange, hosttype]);

  // Update local status when prop changes
  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  // Initial expiration check when component loads
  useEffect(() => {
    if (createdAt && (status === "request" || status === "accepted")) {
      calculateTimeLeft();
    }
  }, [createdAt, status, calculateTimeLeft]);

  // Countdown timer effect
  useEffect(() => {
    if (currentStatus === "accepted" || currentStatus === "request") {
      calculateTimeLeft();
      
      // Update countdown every minute
      const interval = setInterval(calculateTimeLeft, 60000);
      
      return () => clearInterval(interval);
    }
  }, [currentStatus, calculateTimeLeft]);

  // Handle expiration effect
  useEffect(() => {
    if (isExpired) {
      handleExpiration();
    }
  }, [isExpired, handleExpiration]);

  
  
  const cardBorderVariance = type === "creator" ? "border-blue-500" : type === "fan" && ["accepted", "completed"].includes(currentStatus) ? "border-green-500" : "border-yellow-500"
  const cardTextVariance = type === "creator" ? "text-blue-500" : type === "fan" && ["accepted", "completed"].includes(currentStatus) ? "text-green-500" : "text-yellow-500"

  // shared action button base so buttons have same size / height
  const actionBtnBase = 'w-full px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-500 text-xs sm:text-sm flex items-center justify-center';
  // Fan action style (uses base for consistent sizing)
  const fanActionClass = `${actionBtnBase} border border-gray-500 text-gray-300 hover:bg-slate-700 bg-transparent`;

  // API call functions
  const handleAccept = async () => {
    if (!requestId || !details) return;
    setLoading(true);
    try {
      const response = await fetch(`${URL}/acceptrequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creator_portfolio_id: creator_portfolio_id,
          userid: userid,
          date: details.date,
          time: details.time
        })
      });
      
      if (response.ok) {
        setCurrentStatus('accepted');
        onStatusChange?.(requestId, 'accepted');
        // Don't show toast here - the socket notification will handle it
      } else {
        const serviceType = hosttype || "Fan request";
        toast.error(`Failed to accept ${serviceType.toLowerCase()} request`);
      }
    } catch {
      const serviceType = hosttype || "Fan request";
      toast.error(`Error accepting ${serviceType.toLowerCase()} request`);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!requestId || !details) return;
    setLoading(true);
    try {
      const requestBody = {
        creator_portfolio_id: creator_portfolio_id,
        userid: userid,
        date: details.date,
        time: details.time
      };
      
      const response = await fetch(`${URL}/declinerequest`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        setCurrentStatus('declined');
        onStatusChange?.(requestId, 'declined');
        // Don't show toast here - the socket notification will handle it
      } else {
        const errorData = await response.json();
        const serviceType = hosttype || "Fan request";
        toast.error(errorData.message || `Failed to decline ${serviceType.toLowerCase()} request`);
      }
    } catch {
      const serviceType = hosttype || "Fan request";
      toast.error(`Error declining ${serviceType.toLowerCase()} request`);
    } finally {
      setLoading(false);
    }
  };

    const handleCancel = async () => {
      if (!requestId || !details || !userid || !creator_portfolio_id) {
        toast.error('Missing required data for cancel request');
        return;
      }
      setLoading(true);
      try {
        const requestBody = {
          id: requestId,
          userid: userid,
          creator_portfolio_id: creator_portfolio_id
        };
        
        const response = await fetch(`${URL}/cancelrequest`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });
        
        if (response.ok) {
          setCurrentStatus('cancelled');
          onStatusChange?.(requestId, 'cancelled');
          // Don't show toast here - the socket notification will handle it
        } else {
          const errorData = await response.json();
          const serviceType = hosttype || "Fan request";
          toast.error(errorData.message || `Failed to cancel ${serviceType.toLowerCase()} request`);
        }
      } catch {
        const serviceType = hosttype || "Fan request";
        toast.error(`Error cancelling ${serviceType.toLowerCase()} request`);
      } finally {
        setLoading(false);
      }
    };

  const handleComplete = async () => {
    if (!requestId) return;
    
    // If it's a Fan Call, start video call instead of completing
    if (hosttype === "Fan call") {
      if (creator_portfolio_id && (nickname || name)) {
       
        startVideoCall(creator_portfolio_id, nickname || name, price || 1, isVip, vipEndDate, firstName, lastName);
      }
      return;
    }
    
    // For Fan Meet/Fan Date, complete the request
    setLoading(true);
    try {
      const response = await fetch(`${URL}/completerequests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          userid: userid,
          creator_portfolio_id: creator_portfolio_id
        })
      });
      
      if (response.ok) {
        setCurrentStatus('completed');
        onStatusChange?.(requestId, 'completed');
        
        // Don't auto-show rating modal - let user click stars manually
        // Don't show toast here - the socket notification will handle it
      } else {
        const serviceType = hosttype || "Fan request";
        toast.error(`Failed to complete ${serviceType.toLowerCase()}`);
      }
    } catch {
          const serviceType = hosttype || "Fan request";
      toast.error(`Error completing ${serviceType.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle rating submission
  const handleRatingSubmit = async (rating: number, feedback: string) => {
    // Get user ID from Redux state or localStorage as fallback
    let userId = currentUserId;
    
    // Fallback to localStorage if Redux doesn't have it
    if (!userId && typeof window !== 'undefined') {
      try {
        const loginData = localStorage.getItem('login');
        if (loginData) {
          const parsedData = JSON.parse(loginData);
          userId = parsedData.userID || parsedData.userid || parsedData.id;
        }
      } catch (error) {
        // Error parsing login data - continue with current userId
      }
    }
    

    console.log('🔍 [handleRatingSubmit] Fan rating creator - checking IDs:', {
      requestId,
      creator_portfolio_id,
      userId,
      currentUserId,
      userid
    });

    if (!requestId || !creator_portfolio_id || !userId) {
      console.error('❌ [handleRatingSubmit] Missing required information:', {
        requestId: !!requestId,
        creator_portfolio_id: !!creator_portfolio_id,
        userId: !!userId
      });
      toast.error("Missing required information for rating");
      return;
    }

    setRatingLoading(true);
    try {
      const requestBody = {
        requestId,
        creatorId: creator_portfolio_id,
        fanId: userId, // Use current logged-in user ID
        rating,
        feedback,
        hostType: hosttype || "Fan Request",
        ratingType: "fan-to-creator"
      };

      console.log('📤 [handleRatingSubmit] Sending request to backend:', requestBody);

      // Force localhost for development
      const apiUrl = process.env.NODE_ENV === "development" ? "http://localhost:3100" : URL;
      const response = await fetch(`${apiUrl}/review/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const successData = await response.json();
        toast.success("Thank you for your rating!");
        setSubmittedRating(rating); // Save the submitted rating
        setShowRatingModal(false);
        setSelectedRating(0); // Reset selected rating
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to submit rating");
      }
    } catch (error) {
      toast.error("Failed to submit rating. Please try again.");
    } finally {
      setRatingLoading(false);
    }
  };

  // Handle fan rating submission (creator rating fan)
  const handleFanRatingSubmit = async (rating: number, feedback: string) => {
    console.log('🔍 [handleFanRatingSubmit] Frontend starting fan rating submission:', {
      rating,
      feedback: feedback.substring(0, 50) + '...',
      requestId,
      currentUserId,
      userid,
      hosttype,
      timestamp: new Date().toISOString()
    });

    // Get user ID from Redux state or localStorage as fallback
    let userId = currentUserId;
    
    // Fallback to localStorage if Redux doesn't have it
    if (!userId && typeof window !== 'undefined') {
      try {
        const loginData = localStorage.getItem('login');
        if (loginData) {
          const parsedData = JSON.parse(loginData);
          userId = parsedData.userID || parsedData.userid || parsedData.id;
          console.log('🔍 [handleFanRatingSubmit] Got userId from localStorage:', userId);
        }
      } catch (error) {
        console.error('❌ [handleFanRatingSubmit] Error parsing login data:', error);
        // Error parsing login data - continue with current userId
      }
    }
    
;
    
    if (!requestId || !userId || !userid) {
     
      toast.error("Missing required information for rating");
      return;
    }

    setFanRatingLoading(true);
    try {
      const requestBody = {
        requestId,
        creatorId: userId, // Current user is the creator (when type === "creator")
        fanId: userid, // Fan who made the request
        rating,
        feedback,
        hostType: hosttype || "Fan Request",
        ratingType: "creator-to-fan"
      };

      // Force localhost for development
      const apiUrl = process.env.NODE_ENV === "development" ? "http://localhost:3100" : URL;
      console.log('🌐 [handleFanRatingSubmit] Using API URL:', apiUrl);
      
      const response = await fetch(`${apiUrl}/review/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 [handleFanRatingSubmit] Response status:', response.status);
      
      if (response.ok) {
        const successData = await response.json();
        console.log('✅ [handleFanRatingSubmit] Success response:', successData);
        toast.success("Thank you for rating your fan!");
        setSubmittedFanRating(rating); // Save the submitted rating
        setShowFanRatingModal(false);
        setSelectedFanRating(0); // Reset selected rating
      } else {
        const errorData = await response.json();
        console.error('❌ [handleFanRatingSubmit] Error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        toast.error(errorData.message || "Failed to submit rating");
      }
    } catch (error) {
      console.error('❌ [handleFanRatingSubmit] Network/parsing error:', error);
      toast.error("Failed to submit rating. Please try again.");
    } finally {
      setFanRatingLoading(false);
    }
  };

  // Navigation functions
  const handleRenewRequest = () => {
    if (creator_portfolio_id) {
      router.push(`/creators/${creator_portfolio_id}`);
    }
  };

  const handleProfileClick = () => {
    // Navigate to the target user's profile
    // Use targetUserId which is the correct user ID for the person whose profile we want to view
    if (targetUserId) {
      router.push(`/Profile/${targetUserId}`);
    }
  };

  return (
    <div className={`w-full flex flex-col gap-6 rounded-lg border-2 ${cardBorderVariance} p-4 mx-auto text-white bg-slate-800 overflow-visible`}>
      <div className={`flex justify-between items-start gap-4 ${cardTextVariance}`}>
        <div className="flex gap-4">
          <div 
            className={`size-16 relative rounded-full border-4 overflow-hidden ${cardBorderVariance} bg-gray-900 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
            onClick={handleProfileClick}
          >
            {img && img !== '/picture-1.jfif' && img !== '/default-image.png' ? (
              <Image 
                src={img} 
                width={100} 
                alt="picture" 
                height={100} 
                className='absolute top-0 left-0 size-full object-cover'
                onError={(e) => {
                  // If image fails to load, show initials instead
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = 'w-full h-full flex items-center justify-center bg-gray-600 text-white font-bold text-xl';
                    fallbackDiv.textContent = generateInitials(firstName, lastName, nickname || name);
                    parent.appendChild(fallbackDiv);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-600 text-white font-bold text-xl">
                {generateInitials(firstName, lastName, nickname || name)}
              </div>
            )}
            
          </div>
          <div className='text-sm'>
            <div className='flex items-center gap-2'>
              <p className='font-bold cursor-pointer hover:text-blue-400 transition-colors' onClick={handleProfileClick}>
                {nickname || name}
              </p>
            </div>
            <div className='flex gap-1'>{titles?.map((title, i)=> i === titles.length -1 ? <p key={title}>{title}</p> : <p key={title}>{title} &#x2022; </p>)}</div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          {currentStatus === "accepted" ? <p className="flex items-center gap-2 text-xl"><FaCoins /> {price || 20}</p> : <BiTimeFive className="text-2xl" />}
        </div>
      </div>

      <h3 className={`text-3xl md:text-4xl ${cardTextVariance}`}>{
          type === "creator" ? (getCreatorContent(hosttype || "Fan Request", submittedRating > 0)[currentStatus]?.head || "Unknown Status") : (getFanContent(price || 0, hosttype || "Fan Request", submittedRating > 0)[currentStatus]?.head || "Unknown Status")
      }</h3>

      <p className="text-sm md:text-base">{ type === "creator" ? (getCreatorContent(hosttype || "Fan Request", submittedRating > 0)[currentStatus]?.body || "Status information not available") : (getFanContent(price || 0, hosttype || "Fan Request", submittedRating > 0)[currentStatus]?.body || "Status information not available") }</p>

      {/* Rating Stars - Show for fans when completed */}
      {type === "fan" && currentStatus === "completed" && (
        <div className="flex flex-col items-center gap-2 py-3">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= submittedRating;
              const isClickable = submittedRating === 0; // Only clickable if no rating submitted yet
              
              return (
                <button
                  key={star}
                  onClick={() => {
                    if (isClickable) {
                      setShowRatingModal(true);
                      // Store the selected rating for the modal
                      setSelectedRating(star);
                    }
                  }}
                  className={`text-4xl transition-colors focus:outline-none ${
                    isClickable ? "hover:scale-110 cursor-pointer" : "cursor-default"
                  }`}
                  disabled={!isClickable}
                >
                  <span className={`transition-colors ${
                    isFilled ? "text-yellow-400" : "text-gray-400"
                  } ${isClickable ? "hover:text-yellow-400" : ""}`}>
                    ★
                  </span>
                </button>
              );
            })}
          </div>
          {submittedRating > 0 && (
            <p className="text-sm text-green-500 font-medium">
              ✓ Rating submitted ({submittedRating} star{submittedRating !== 1 ? 's' : ''})
            </p>
          )}
        </div>
      )}

      {/* Rating Stars - Show for creators when completed and rated */}
      {type === "creator" && currentStatus === "completed" && submittedRating > 0 && (
        <div className="flex flex-col items-center gap-2 py-3">
          <p className="text-sm text-gray-400 mb-2">Rating from {firstName && lastName ? `${firstName} ${lastName}` : (nickname || name)}:</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= submittedRating;
              
              return (
                <button
                  key={star}
                  onClick={() => {
                    if (ratingData) {
                      setShowFeedbackModal(true);
                    }
                  }}
                  className="text-4xl transition-colors focus:outline-none hover:scale-110 cursor-pointer"
                >
                  <span className={`transition-colors ${
                    isFilled ? "text-yellow-400" : "text-gray-400"
                  } hover:text-yellow-400`}>
                    ★
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-blue-400 font-medium cursor-pointer hover:text-blue-300" onClick={() => setShowFeedbackModal(true)}>
            Click stars to view feedback
          </p>
        </div>
      )}

      {/* Creator Rating Stars - Show for creators when completed (to rate the fan) */}
      {type === "creator" && currentStatus === "completed" && (
        <div className="flex flex-col items-center gap-2 py-3 border-t border-gray-600 pt-3">
          <p className="text-sm text-gray-400 mb-2">Rate your fan:</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= submittedFanRating;
              const isClickable = submittedFanRating === 0; // Only clickable if no rating submitted yet
              
              return (
                <button
                  key={star}
                  onClick={() => {
                    if (isClickable) {
                      setShowFanRatingModal(true);
                      // Store the selected rating for the modal
                      setSelectedFanRating(star);
                    }
                  }}
                  className={`text-4xl transition-colors focus:outline-none ${
                    isClickable ? "hover:scale-110 cursor-pointer" : "cursor-default"
                  }`}
                  disabled={!isClickable}
                >
                  <span className={`transition-colors ${
                    isFilled ? "text-yellow-400" : "text-gray-400"
                  } ${isClickable ? "hover:text-yellow-400" : ""}`}>
                    ★
                  </span>
                </button>
              );
            })}
          </div>
          {submittedFanRating > 0 && (
            <p className="text-sm text-green-500 font-medium">
              ✓ Fan rating submitted ({submittedFanRating} star{submittedFanRating !== 1 ? 's' : ''})
            </p>
          )}
        </div>
      )}

      {/* Fan Rating Stars - Show for fans when completed (to view creator's rating of them) */}
      {type === "fan" && currentStatus === "completed" && submittedFanRating > 0 && (
        <div className="flex flex-col items-center gap-2 py-3 border-t border-gray-600 pt-3">
          <p className="text-sm text-gray-400 mb-2">Rating from {firstName && lastName ? `${firstName} ${lastName}` : (nickname || name)}:</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= submittedFanRating;
              
              return (
                <button
                  key={star}
                  onClick={() => {
                    if (fanRatingData) {
                      setShowFanFeedbackModal(true);
                    }
                  }}
                  className="text-4xl transition-colors focus:outline-none hover:scale-110 cursor-pointer"
                >
                  <span className={`transition-colors ${
                    isFilled ? "text-yellow-400" : "text-gray-400"
                  } hover:text-yellow-400`}>
                    ★
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-blue-400 font-medium cursor-pointer hover:text-blue-300" onClick={() => setShowFanFeedbackModal(true)}>
            Click stars to view feedback
          </p>
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setSelectedRating(0);
        }}
        onSubmit={handleRatingSubmit}
        creatorName={firstName && lastName ? `${firstName} ${lastName}` : (nickname || name)}
        hostType={hosttype}
        loading={ratingLoading}
        preSelectedRating={selectedRating}
      />

      {/* Fan Rating Modal */}
      <FanRatingModal
        isOpen={showFanRatingModal}
        onClose={() => {
          setShowFanRatingModal(false);
          setSelectedFanRating(0);
        }}
        onSubmit={handleFanRatingSubmit}
        fanName={firstName && lastName ? `${firstName} ${lastName}` : (nickname || name)}
        hostType={hosttype}
        loading={fanRatingLoading}
        preSelectedRating={selectedFanRating}
      />

      {/* Feedback Modal for Creators */}
      {showFeedbackModal && ratingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Rating & Feedback</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Rating from {ratingData.fanName}:</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-2xl ${
                      star <= ratingData.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-2 text-gray-600 font-medium">
                  {ratingData.rating} out of 5 stars
                </span>
              </div>
            </div>

            {ratingData.feedback && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Feedback:</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                  &ldquo;{ratingData.feedback}&rdquo;
                </p>
              </div>
            )}

            <button
              onClick={() => setShowFeedbackModal(false)}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Fan Feedback Modal for Fans */}
      {showFanFeedbackModal && fanRatingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Rating & Feedback</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Rating from {fanRatingData.creatorName}:</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-2xl ${
                      star <= fanRatingData.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-2 text-gray-600 font-medium">
                  {fanRatingData.rating} out of 5 stars
                </span>
              </div>
            </div>

            {fanRatingData.feedback && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Feedback:</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                  &ldquo;{fanRatingData.feedback}&rdquo;
                </p>
              </div>
            )}

            <button
              onClick={() => setShowFanFeedbackModal(false)}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className={`flex flex-col gap-4 items-end`}>
        { statusArr.slice(1).includes(currentStatus) ? (
// keep this row horizontal and make buttons equal width
<div className="flex w-full items-stretch gap-3">
  <div className="flex-1 flex">
    <div className="w-full border border-gray-600 text-gray-500 px-3 py-2 rounded-lg text-xs md:text-sm flex items-center justify-center">
      {cardStates[currentStatus as keyof typeof cardStates]}
    </div>
  </div>

  <div className="flex-1">
    { type === "creator" && currentStatus === "accepted" ? (
      // Creator accepted → Chat Now + View details
      <div className="flex gap-3">
        <div className="flex-1">
          <FanActionBtn 
            label="Chat Now" 
            className={fanActionClass} 
            onClick={() => {
              // Creator wants to message the fan
              if (userid) {
                router.push(`/message/${userid}`);
              }
            }}
          />
        </div>
        <div className="flex-1">
          <button className={fanActionClass} onClick={handleShowDetails}>View details</button>
        </div>
      </div>
    ) : type === "fan" && currentStatus === "accepted" ? (
      // Fan accepted → Mark complete/Start call + View details
      <div className="flex gap-3">
        <div className="flex-1">
          <FanActionBtn 
            label={hosttype === "Fan call" ? "Start call" : "Mark as complete"} 
            className={fanActionClass} 
            onClick={handleComplete} 
            disabled={loading} 
          />
        </div>
        <div className="flex-1">
          <button className={fanActionClass} onClick={handleShowDetails}>View details</button>
        </div>
      </div>
    ) : type === "creator" ? (
      <FanActionBtn 
        label="Chat Now" 
        className={fanActionClass} 
        onClick={() => {
          // Creator wants to message the fan
          if (userid) {
            console.log('🔍 [RequestCard] Chat Now button clicked (single):', {
              userid,
              creator_portfolio_id,
              currentUserId,
              timestamp: new Date().toISOString()
            });
            router.push(`/message/${userid}`);
          }
        }}
      />
    ) : (
      <FanActionBtn label="Renew request" className={fanActionClass} onClick={handleRenewRequest} />
    )}
  </div>
</div>

        ) : (
          <>
            {/* ---------- UPDATED EXPIRY ROW: now a bordered, padded full-width element ---------- */}
            <div className='w-full'>
              <div className='w-full flex justify-center'>
                {/* full width button-like row with border, padding and rounded corners */}
                <div className='w-full bg-transparent border border-gray-600 rounded-lg px-4 py-4 flex flex-col items-center justify-center'>
                  <p className='text-lg md:text-xl text-gray-300 font-normal mb-1'>Expires in:</p>
                  <p className='text-2xl md:text-3xl font-normal'>{exp}</p>
                </div>
              </div>
            </div>

            {/* Action buttons row: Responsive layout for small screens */}
            <div className='w-full flex flex-row gap-2 sm:gap-4 items-center'>
              { type === "creator" ? (
                // Creator: Accept | Decline | View details (responsive widths)
                <>
                  <div className='flex-1 min-w-0'>
                    <CreatorActionBtn type='accept' onClick={handleAccept} disabled={loading} />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <CreatorActionBtn type='decline' onClick={handleDecline} disabled={loading} />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <button className={fanActionClass} onClick={handleShowDetails}>View details</button>
                  </div>
                </>
              ) : (
                // Fan: Cancel request | View details side-by-side
                <>
                  <div className='flex-1 min-w-0'>
                    {type === "fan" && currentStatus === "request" && <FanActionBtn label='Cancel request' className={fanActionClass} onClick={handleCancel} disabled={loading} />}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <button className={fanActionClass} onClick={handleShowDetails}>View details</button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && (
        <DetailsModal 
          details={details} 
          onClose={() => setShowDetails(false)} 
          type={type}
          hosttype={hosttype}
          timeLeft={timeLeft}
          isExpired={isExpired}
          currentStatus={currentStatus}
        />
      )}
    </div>
  );
}

function CreatorActionBtn({type, onClick, disabled}: {type: "accept" | "decline", onClick?: () => void, disabled?: boolean}){
  // Use same base sizing so heights match - responsive padding and text
  const base = 'w-full px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-500 text-xs sm:text-sm text-white flex items-center justify-center';
  return <button 
    className={`${base} ${type === "accept" ? "hover:bg-green-700 bg-green-600" : "hover:bg-red-700 bg-red-600"} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    onClick={onClick}
    disabled={disabled}
  >
    {type === "accept" ? "Accept" : "Decline"}
  </button>
};

function FanActionBtn({label, className, onClick, disabled}: {label: string, className?: string, onClick?: () => void, disabled?: boolean}){
  // allow overriding/using shared class; default uses the same base so sizing is consistent
  const defaultClass = 'w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-500 text-xs sm:text-sm flex items-center justify-center border border-gray-500 text-gray-300 hover:bg-slate-700 bg-transparent';
  return <button 
    className={`${className ? className : defaultClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </button>
}

// Old Rating component removed - using new 5-star system

function DetailsModal({ 
  details, 
  onClose, 
  type,
  hosttype,
  timeLeft,
  isExpired,
  currentStatus
}: { 
  details?: FanMeetDetails; 
  onClose: () => void; 
  type: "fan" | "creator";
  hosttype?: string;
  timeLeft?: string;
  isExpired?: boolean;
  currentStatus?: string;
}) {
  
  // Fallback countdown calculation for modal
  const getFallbackCountdown = () => {
    // This is a fallback - in real implementation, createdAt should be passed to modal
    // For now, we'll show a placeholder
    return "Countdown not available";
  };
  if (!details) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{getDetailsTitle(hosttype || "Fan Meet")}</h2>
          <p className="text-gray-600 mb-4">Details not available</p>
          <button 
            onClick={onClose}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6">{getDetailsTitle(hosttype || "Fan Meet")}</h2>
        
        {/* Expiration Countdown - Only show for accepted requests */}
        {currentStatus === "accepted" && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <IoTimeOutline className="text-orange-500 text-xl" />
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Expires in:</p>
                <p className={`text-2xl font-bold ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                  {timeLeft || getFallbackCountdown()}
                </p>
                {isExpired && (
                  <p className="text-xs text-red-500 mt-1">Request has expired</p>
                )}
               
              </div>
            </div>
          </div>
        )}
        
        {/* Date & Time */}
        <div className="flex items-start gap-3 mb-4">
          <IoCalendarOutline className="text-gray-600 text-xl mt-1" />
          <div>
            <h3 className="font-semibold text-gray-800">Date & Time</h3>
            <p className="text-gray-600">
              {formatDate(details.date)} at {formatTime(details.time)}
            </p>
          </div>
        </div>

        {/* Venue */}
        <div className="flex items-start gap-3 mb-4">
          <IoLocationOutline className="text-gray-600 text-xl mt-1" />
          <div>
            <h3 className="font-semibold text-gray-800">Venue</h3>
            <p className="text-gray-600">{details.venue}</p>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-start gap-3 mb-4">
          <IoTimeOutline className="text-gray-600 text-xl mt-1" />
          <div>
            <h3 className="font-semibold text-gray-800">Duration</h3>
            <p className="text-gray-600">{details.duration || "Maximum 30 minutes"}</p>
          </div>
        </div>

        {/* Safety Rules - Only show for non-call requests */}
        {hosttype?.toLowerCase() !== "fan call" && (
          <div className="flex items-start gap-3 mb-4">
            <IoWarningOutline className="text-orange-500 text-xl mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">Safety Rules (Important!)</h3>
              <ul className="text-gray-600 text-sm mt-1 space-y-1">
                <li>• All meets are limited to 30 minutes.</li>
                <li>• Meets must happen in a public place only.</li>
              </ul>
              <p className="text-gray-500 text-xs mt-2">
                What happens after 30 minutes is outside the platform&apos;s responsibility.
              </p>
            </div>
          </div>
        )}

        {/* Call Expiration Notice - Only show for fan calls */}
        {hosttype?.toLowerCase() === "fan call" && (
          <div className="flex items-start gap-3 mb-4">
            <IoCheckmarkCircleOutline className="text-green-500 text-xl mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">Call Expiration</h3>
              <p className="text-gray-600 text-sm mt-1">
                Call must start within 48 hours after acceptance or it will automatically expire.
              </p>
            </div>
          </div>
        )}

        {/* Agreement - Show for creators with appropriate message (excluding fan calls) */}
        {type === "creator" && hosttype?.toLowerCase() !== "fan call" && (
          <div className="flex items-start gap-3 mb-6">
            <IoCheckmarkCircleOutline className="text-green-500 text-xl mt-1" />
            <p className="text-gray-800 font-semibold text-sm">
              By accepting this request, you agree to follow these safety rules.
            </p>
          </div>
        )}

        {/* Agreement - Show for fans when viewing Fan Date and Fan Meet details */}
        {type === "fan" && hosttype?.toLowerCase() !== "fan call" && (
          <div className="flex items-start gap-3 mb-6">
            <IoCheckmarkCircleOutline className="text-green-500 text-xl mt-1" />
            <p className="text-gray-800 font-semibold text-sm">
              By sending this request, you agree to follow these safety rules.
            </p>
          </div>
        )}

        <button 
          onClick={onClose}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
}
