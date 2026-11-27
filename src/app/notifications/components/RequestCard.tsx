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
import { URL as API_BASE } from "@/api/config";
import { BadgeCheck } from 'lucide-react';

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
    body: `Once a booking request is sent, the creator has up to 24 hours to accept. After acceptance, the ${typeText.toLowerCase() === "fan date" ? "date" : "meet & greet"} can take place at any time based on mutual availability within that booking.`
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
      body: `Your ${typeText} request was cancelled.`
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
      body: `Your ${typeText} request was cancelled.`
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
    "fan meet": "Meet & Greet Details",
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

  // Fallback to the original logic using name/username
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
  username?: string; // Add username prop
  firstName?: string; // Add first name prop
  lastName?: string; // Add last name prop
  img: string;
  originalPhotoLink?: string; // Original photolink URL (before processing with getImageSource)
  status: "request" | "expired" | "completed" | "accepted" | "declined" | "cancelled";
  requestId?: string;
  bookingRef?: string;
  price?: number;
  details?: FanMeetDetails;
  userid?: string;
  creator_portfolio_id?: string;
  targetUserId?: string; // Add target user ID for profile navigation
  targetUsername?: string; // Username for profile URL (e.g. @handle)
  hosttype?: string;
  isVip?: boolean;
  vipEndDate?: string | null;
  createdAt?: string; // Add creation timestamp for countdown
  fanVerified?: boolean;
  
  onStatusChange?: (requestId: string, newStatus: string) => void;
}

export default function RequestCard({ exp, img, originalPhotoLink, name, username, firstName, lastName, titles = ["fan"], status, type = "fan", requestId, bookingRef, price, details, userid, creator_portfolio_id, targetUserId, targetUsername, hosttype, isVip = false, vipEndDate = null, createdAt,  fanVerified = false, onStatusChange }: CardProps) {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
   const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

const [timerActive, setTimerActive] = useState(false);
const [timeRemaining, setTimeRemaining] = useState((hosttype?.toLowerCase() === "fan date" ? 60 : 30) * 60);
const [sessionCompleted, setSessionCompleted] = useState(false);

useEffect(() => {
  if (!requestId) return;
  
  const completed = localStorage.getItem(`session_completed_${requestId}`) === 'true';
  if (completed) {
    setSessionCompleted(true);
    setTimerActive(false);
    setTimeRemaining(0);
    return;
  }

  const active = localStorage.getItem(`timer_active_${requestId}`) === 'true';
  const endTime = localStorage.getItem(`timer_end_${requestId}`);
  
  if (active && endTime) {
    const diff = Math.floor((parseInt(endTime) - Date.now()) / 1000);
    if (diff > 0) {
      setTimerActive(true);
      setTimeRemaining(diff);
    } else {
      setTimerActive(false);
      setTimeRemaining(0);
      setSessionCompleted(true);
      localStorage.setItem(`session_completed_${requestId}`, 'true');
      localStorage.removeItem(`timer_active_${requestId}`);
      localStorage.removeItem(`timer_end_${requestId}`);
    }
  }
}, [requestId]);

const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);


const formatTimer = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};





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
  const [ratingData, setRatingData] = useState<{ rating: number, feedback: string, fanName: string } | null>(null); // Store rating data for creator view

  // Creator rating state (creator rating fan)
  const [showFanRatingModal, setShowFanRatingModal] = useState(false);
  const [fanRatingLoading, setFanRatingLoading] = useState(false);
  const [selectedFanRating, setSelectedFanRating] = useState(0);
  const [submittedFanRating, setSubmittedFanRating] = useState(0); // Track the submitted fan rating
  const [showFanFeedbackModal, setShowFanFeedbackModal] = useState(false); // For fan to view feedback
  const [fanRatingData, setFanRatingData] = useState<{ rating: number, feedback: string, creatorName: string } | null>(null); // Store fan rating data for fan view

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
      // Pending requests expire after 23 hours 14 minutes
      expirationHours = 23 + (14 / 60); // 23.233333... hours
    } else if (currentStatus === "accepted") {
      // Accepted requests expire based on type
      expirationHours = isFanCall ? 240 : 480; // 240h (10 days) for Fan call, 20 days (480h) for others
    } else {
      // For other statuses, don't show countdown
      return;
    }

    const expirationTime = createdTime + (expirationHours * 60 * 60 * 1000);
    const timeDiff = expirationTime - now;



  if (timeDiff <= 0) {
  setTimeLeft("Expiring soon...");
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
            fanName: firstName && lastName ? `${firstName} ${lastName}` : (username || name) // Use the fan's first/last name or fallback
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
            creatorName: firstName && lastName ? `${firstName} ${lastName}` : (username || name)
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
  }, [requestId, currentUserId, type, currentStatus, userid, name, creator_portfolio_id, firstName, lastName, username]);

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

// Update local status when prop changes — never go backwards
useEffect(() => {
  const statusOrder = ["request", "accepted", "completed", "expired", "declined", "cancelled"];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const newIndex = statusOrder.indexOf(status);
  
  if (newIndex > currentIndex) {
    setCurrentStatus(status);
  }
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

  // Save timer state to localStorage
useEffect(() => {
  if (requestId) {
    localStorage.setItem(`timer_active_${requestId}`, String(timerActive));
    localStorage.setItem(`timer_remaining_${requestId}`, String(timeRemaining));
  }
}, [timerActive, timeRemaining, requestId]);

// Restart timer on mount if it was active
useEffect(() => {
  if (timerActive) {
    const interval = setInterval(() => {
      const endTime = localStorage.getItem(`timer_end_${requestId}`);
      if (!endTime) return;
      
      const diff = Math.floor((parseInt(endTime) - Date.now()) / 1000);
      
      if (diff <= 0) {
        console.log('⏰ Timer hit zero');
        clearInterval(interval);
        setTimerActive(false);
        setTimeRemaining(0);
        setSessionCompleted(true); 
        localStorage.setItem(`session_completed_${requestId}`, 'true'); 
        localStorage.removeItem(`timer_active_${requestId}`);
        localStorage.removeItem(`timer_end_${requestId}`);
      } else {
        setTimeRemaining(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }
}, [timerActive]);



  // API call functions
 const handleAccept = async () => {
  if (!requestId || !details) return;
  setLoading(true);
  try {
    const response = await fetch(`${URL}/fanrequest/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId: requestId,
        creator_portfolio_id: creator_portfolio_id,
        userid: userid
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
  if (!requestId) return;
  setLoading(true);
  try {
    const response = await fetch(`${URL}/fanrequest/decline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: requestId,
        creator_portfolio_id: creator_portfolio_id,
        userid: userid
      })
    });

    if (response.ok) {
      setCurrentStatus('declined');
      onStatusChange?.(requestId, 'declined');
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
  if (!requestId || !userid || !creator_portfolio_id) {
    toast.error('Missing required data for cancel request');
    return;
  }
  setLoading(true);
  try {
    const response = await fetch(`${URL}/fanrequest/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: requestId,
        userid: userid,
        creator_portfolio_id: creator_portfolio_id
      })
    });

    if (response.ok) {
      setCurrentStatus('cancelled');
      onStatusChange?.(requestId, 'cancelled');
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

  if (hosttype === "Fan call") {
    if (creator_portfolio_id && (username || name)) {
      // Pass the original photo URL (before proxy processing) if available
        // This ensures we have the original Storj URL for proper processing in FanCallModal
      const photoUrl = originalPhotoLink && originalPhotoLink !== '/picture-1.jfif' && originalPhotoLink !== '/default-image.png'
        ? originalPhotoLink
        : (img && img !== '/picture-1.jfif' && img !== '/default-image.png' && !img.includes('/api/image/view'))
          ? img // Use img if it's not a proxy URL and not default
          : undefined;

      startVideoCall(targetUserId || creator_portfolio_id, username || name, price || 1, isVip, vipEndDate, firstName, lastName, photoUrl);
    }
    return;
  }

   // For Fan Meet/Fan Date, complete the request

  setLoading(true);
  try {
    const response = await fetch(`${URL}/fanrequest/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId,
        userid: userid,
        creator_portfolio_id: creator_portfolio_id
      })
    });

    if (response.ok) {
      setCurrentStatus('completed');
      onStatusChange?.(requestId, 'completed');
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
    if (!targetUserId && !targetUsername) return;
    const slug = (targetUsername && String(targetUsername).trim()) ? String(targetUsername).trim() : targetUserId;
    router.push(`/${slug}`);
  };

  // ── Card look (design only) ─────────────────────────────────────────────
  const accent =
    type === "creator"
      ? {
          text: "text-indigo-300",
          ring: "border-[#6c63ff]/60",
          bar: "from-[#6c63ff] to-[#9b59f5]",
          glow: "from-[#6c63ff]/[0.13]",
          chip: "bg-[#6c63ff]/15 text-indigo-200 border-[#6c63ff]/30",
        }
      : ["accepted", "completed"].includes(currentStatus)
        ? {
            text: "text-emerald-300",
            ring: "border-emerald-500/60",
            bar: "from-emerald-500 to-teal-400",
            glow: "from-emerald-500/[0.12]",
            chip: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
          }
        : {
            text: "text-amber-300",
            ring: "border-amber-500/60",
            bar: "from-amber-500 to-orange-400",
            glow: "from-amber-500/[0.12]",
            chip: "bg-amber-500/15 text-amber-200 border-amber-500/30",
          };

  const ghostBtn =
    "w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center border border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200";
  const primaryBtn =
    "w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center text-white bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] hover:brightness-110 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-[#6c63ff]/20";

  const fullName = firstName && lastName ? `${firstName} ${lastName}` : (username || name);

  const cardContent =
    type === "creator"
      ? getCreatorContent(hosttype || "Fan Request", submittedRating > 0)[currentStatus]
      : getFanContent(price || 0, hosttype || "Fan Request", submittedRating > 0)[currentStatus];

  return (
    <div className="relative w-full mx-auto overflow-visible rounded-2xl border border-white/[0.08] bg-[#0d1220] text-white shadow-xl shadow-black/20">
      {/* accent bar + soft glow */}
      <div className={`absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r ${accent.bar}`} />
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-28 rounded-t-2xl bg-gradient-to-b ${accent.glow} to-transparent`} />

      <div className="relative flex flex-col gap-5 p-4 sm:p-5">

        {/* ── Header: avatar, name, price ─────────────────────── */}
        <div className="flex justify-between items-start gap-4">
         <div className="flex gap-3.5 min-w-0">
            <div className="relative shrink-0">
            <div
              className={`size-14 sm:size-16 relative rounded-full border-2 overflow-hidden ${accent.ring} bg-[#080b14] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={handleProfileClick}
            >
              {img && img !== '/picture-1.jfif' && img !== '/default-image.png' && img.trim() !== '' ? (
                <Image
                  src={img}
                  width={100}
                  alt="picture"
                  height={100}
                  className='absolute top-0 left-0 size-full object-cover'
                  unoptimized
                  onError={(e) => {
                    // If image fails to load, show initials instead
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      // Check if fallback div already exists
                      const existingFallback = parent.querySelector('.fallback-initials');
                      if (!existingFallback) {
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'w-full h-full flex items-center justify-center bg-gray-600 text-white font-bold text-xl fallback-initials';
                        fallbackDiv.textContent = generateInitials(firstName, lastName, username || name);
                        parent.appendChild(fallbackDiv);
                      }
                    }
                  }}
                  onLoad={(e) => {
                    // Hide any existing fallback div when image loads successfully
                    const target = e.target as HTMLImageElement;
                    const parent = target.parentElement;
                    if (parent) {
                      const fallbackDiv = parent.querySelector('.fallback-initials');
                      if (fallbackDiv) {
                        fallbackDiv.remove();
                      }
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-600 text-white font-bold text-xl">
                  {generateInitials(firstName, lastName, username || name)}
                </div>
              )}
            </div>
            <VIPBadge size="lg" className="absolute -top-2 -right-2 z-10" isVip={isVip} vipEndDate={vipEndDate} />
            </div>

            <div className="min-w-0 text-sm">
              <p
                className='font-bold text-[15px] text-white truncate cursor-pointer hover:text-indigo-300 transition-colors'
                onClick={handleProfileClick}
              >
                {username || name}
              </p>
              <div className='mt-0.5 flex flex-wrap items-center gap-x-1 text-[12px] text-slate-400'>
                {titles?.map((title, i) => i === titles.length - 1 ? <span key={title}>{title}</span> : <span key={title}>{title} &#x2022; </span>)}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {hosttype && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${accent.chip}`}>
                    {hosttype}
                  </span>
                )}
                {type === "creator" && fanVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold"
                    style={{
                      background: "linear-gradient(135deg,rgba(108,99,255,.15),rgba(155,89,245,.1))",
                      border: "1px solid rgba(108,99,255,.3)",
                      color: "#a89cff"
                    }}
                  >
                    <BadgeCheck size={15} fill="#6c63ff" className="text-white shrink-0" />
      Verified Fan
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0">
            {currentStatus === "accepted" ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-yellow-500/25 bg-yellow-500/10 text-yellow-300 font-bold text-base tabular-nums">
                <FaCoins className="text-sm" /> {price || 20}
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-slate-400">
                <BiTimeFive className="text-xl" />
              </div>
            )}
          </div>
        </div>

        {/* ── Status heading + body ───────────────────────────── */}
        <div>
          <h3 className={`text-xl md:text-2xl font-extrabold tracking-tight leading-snug ${accent.text}`}>
            {cardContent?.head || "Unknown Status"}
          </h3>
          <p className="mt-1.5 text-[13.5px] md:text-sm leading-relaxed text-slate-400">
            {cardContent?.body || "Status information not available"}
          </p>
        </div>

        {/* ── Rating: fan rates creator ───────────────────────── */}
        {type === "fan" && currentStatus === "completed" && (
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] py-4 px-3 flex flex-col items-center gap-2">
            <StarRow
              value={submittedRating}
              clickable={submittedRating === 0}
              onPick={(star) => {
                setShowRatingModal(true);
                // Store the selected rating for the modal
                setSelectedRating(star);
              }}
              size="text-4xl"
            />
            {submittedRating > 0 && (
              <p className="text-sm text-emerald-400 font-medium">
                ✓ Rating submitted ({submittedRating} star{submittedRating !== 1 ? 's' : ''})
              </p>
            )}
          </div>
        )}

        {/* ── Rating: creator sees fan's rating ───────────────── */}
        {type === "creator" && currentStatus === "completed" && submittedRating > 0 && (
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] py-4 px-3 flex flex-col items-center gap-2">
            <p className="text-[13px] text-slate-400">Rating from {fullName}</p>
            <StarRow
              value={submittedRating}
              clickable={!!ratingData}
              onPick={() => setShowFeedbackModal(true)}
              size="text-4xl"
            />
            <p className="text-sm text-indigo-300 font-medium cursor-pointer hover:text-indigo-200" onClick={() => setShowFeedbackModal(true)}>
              Click stars to view feedback
            </p>
          </div>
        )}

        {/* ── Rating: creator rates fan ───────────────────────── */}
        {type === "creator" && currentStatus === "completed" && (
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] py-4 px-3 flex flex-col items-center gap-2">
            <p className="text-[13px] text-slate-400">Rate your fan</p>
            <StarRow
              value={submittedFanRating}
              clickable={submittedFanRating === 0}
              onPick={(star) => {
                setShowFanRatingModal(true);
                // Store the selected rating for the modal
                setSelectedFanRating(star);
              }}
              size="text-4xl"
            />
            {submittedFanRating > 0 && (
              <p className="text-sm text-emerald-400 font-medium">
                ✓ Fan rating submitted ({submittedFanRating} star{submittedFanRating !== 1 ? 's' : ''})
              </p>
            )}
          </div>
        )}

        {/* ── Rating: fan sees creator's rating of them ───────── */}
        {type === "fan" && currentStatus === "completed" && submittedFanRating > 0 && (
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] py-4 px-3 flex flex-col items-center gap-2">
            <p className="text-[13px] text-slate-400">Rating from {fullName}</p>
            <StarRow
              value={submittedFanRating}
              clickable={!!fanRatingData}
              onPick={() => setShowFanFeedbackModal(true)}
              size="text-4xl"
            />
            <p className="text-sm text-indigo-300 font-medium cursor-pointer hover:text-indigo-200" onClick={() => setShowFanFeedbackModal(true)}>
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
          creatorName={fullName}
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
          fanName={fullName}
          hostType={hosttype}
          loading={fanRatingLoading}
          preSelectedRating={selectedFanRating}
        />

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4"
            onClick={() => !loading && setShowCancelConfirm(false)}
          >
            <div
              className="bg-[#111624] rounded-2xl p-6 max-w-sm w-full border border-white/10 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: "linear-gradient(90deg,#f43f5e,#fb923c)" }}
              />

              <div className="flex items-center justify-center mb-4 mt-1">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(244,63,94,.12)", border: "1px solid rgba(244,63,94,.25)" }}
                >
                  <IoWarningOutline className="text-rose-400" size={26} />
                </div>
              </div>

              <h3 className="text-white font-bold text-base text-center mb-2">
                Cancel this {(hosttype || "Fan Meet").toLowerCase() === "fan call" ? "call" : (hosttype || "Fan Meet").toLowerCase() === "fan date" ? "date" : "meet"}?
              </h3>

              <p className="text-gray-400 text-xs text-center mb-6 leading-relaxed">
                {currentStatus === "accepted"
                  ? `This booking has already been accepted. Cancelling will notify ${type === "creator" ? "the fan" : "the creator"} right away, and any pending gold on this request will be refunded. This can't be undone.`
                  : "This will withdraw the request and notify the other party. This can't be undone."}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Go back
                </button>
                <button
                  onClick={async () => {
                    await handleCancel();
                    setShowCancelConfirm(false);
                  }}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#f43f5e,#fb7185)" }}
                >
                  {loading ? "Cancelling..." : "Yes, cancel"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal for Creators */}
        {showFeedbackModal && ratingData && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1424] p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-4">Rating & Feedback</h2>

              <div className="mb-4">
                <p className="text-sm text-slate-400 mb-2">Rating from {ratingData.fanName}:</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-2xl ${star <= ratingData.rating ? "text-yellow-400" : "text-slate-600"}`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-2 text-slate-400 font-medium text-sm">
                    {ratingData.rating} out of 5 stars
                  </span>
                </div>
              </div>

              {ratingData.feedback && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-200 mb-2">Feedback:</h3>
                  <p className="text-slate-300 bg-white/[0.04] border border-white/[0.06] p-3 rounded-xl text-sm">
                    &ldquo;{ratingData.feedback}&rdquo;
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowFeedbackModal(false)}
                className={primaryBtn}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Fan Feedback Modal for Fans */}
        {showFanFeedbackModal && fanRatingData && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1424] p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-4">Rating & Feedback</h2>

              <div className="mb-4">
                <p className="text-sm text-slate-400 mb-2">Rating from {fanRatingData.creatorName}:</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-2xl ${star <= fanRatingData.rating ? "text-yellow-400" : "text-slate-600"}`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-2 text-slate-400 font-medium text-sm">
                    {fanRatingData.rating} out of 5 stars
                  </span>
                </div>
              </div>

              {fanRatingData.feedback && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-200 mb-2">Feedback:</h3>
                  <p className="text-slate-300 bg-white/[0.04] border border-white/[0.06] p-3 rounded-xl text-sm">
                    &ldquo;{fanRatingData.feedback}&rdquo;
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowFanFeedbackModal(false)}
                className={primaryBtn}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ── Actions ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {statusArr.slice(1).includes(currentStatus) ? (
            // keep this row horizontal and make buttons equal width
            <div className="flex w-full items-stretch gap-3">
              <div className="flex-1 flex">
                {type === "creator" && currentStatus === "accepted" ? (
                  <FanActionBtn
                    label={
                      hosttype?.toLowerCase() === "fan call"
                        ? "Cancel call"
                        : hosttype?.toLowerCase() === "fan date"
                        ? "Cancel date"
                        : "Cancel meet"
                    }
                    className={ghostBtn}
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={loading}
                  />
                ) : (
                  <div className="w-full rounded-xl border border-white/[0.07] bg-white/[0.02] text-slate-500 px-3 py-2.5 text-xs md:text-sm flex items-center justify-center">
                    {cardStates[currentStatus as keyof typeof cardStates]}
                  </div>
                )}
              </div>

              <div className="flex-1">
                {type === "creator" && currentStatus === "accepted" ? (
                  // Creator accepted → Chat Now + View details
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <FanActionBtn
                        label="Chat Now"
                        className={primaryBtn}
                        onClick={() => {
                          // Creator wants to message the fan
                          if (userid) {
                            router.push(`/message/${userid}`);
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <button className={ghostBtn} onClick={handleShowDetails}>View details</button>
                    </div>
                  </div>
                ) : type === "fan" && currentStatus === "accepted" ? (
                  // Fan accepted → Mark complete/Start call + View details
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <FanActionBtn
                        label={hosttype === "Fan call" ? "Start call" : "Mark as complete"}
                        className={primaryBtn}
                        onClick={handleComplete}
                        disabled={loading}
                      />
                    </div>
                    <div className="flex-1">
                      <button className={ghostBtn} onClick={handleShowDetails}>View details</button>
                    </div>
                  </div>
                ) : type === "creator" ? (
                  <FanActionBtn
                    label="Chat Now"
                    className={primaryBtn}
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
                  <FanActionBtn label="Renew request" className={primaryBtn} onClick={handleRenewRequest} />
                )}
              </div>
            </div>

          ) : (
            <>
              {/* Expiry */}
              <div className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <IoTimeOutline className="text-lg" />
                  <span className="text-[12.5px] font-semibold uppercase tracking-wider">Expires in</span>
                </div>
                <p className={`text-xl md:text-2xl font-extrabold tabular-nums ${accent.text}`}>{exp}</p>
              </div>

              {/* Action buttons row: Responsive layout for small screens */}
              <div className='w-full flex flex-row gap-2 sm:gap-3 items-center'>
                {type === "creator" ? (
                  // Creator: Accept | Decline | View details (responsive widths)
                  <>
                    <div className='flex-1 min-w-0'>
                      <CreatorActionBtn type='accept' onClick={handleAccept} disabled={loading} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <CreatorActionBtn type='decline' onClick={handleDecline} disabled={loading} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <button className={ghostBtn} onClick={handleShowDetails}>View details</button>
                    </div>
                  </>
                ) : (
                  // Fan: Cancel request | View details side-by-side
                  <>
                    <div className='flex-1 min-w-0'>
                      {type === "fan" && currentStatus === "request" && <FanActionBtn label='Cancel request' className={ghostBtn} onClick={() => setShowCancelConfirm(true)} disabled={loading} />}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <button className={primaryBtn} onClick={handleShowDetails}>View details</button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <DetailsModal
          details={details}
          onClose={() => setShowDetails(false)}
          type={type}
          hosttype={hosttype}
          timeLeft={timeLeft}
          currentStatus={currentStatus}
          fanUserid={userid}
          fanVerified={fanVerified}
          creatorUserid={currentUserId}
          requestId={requestId}
          bookingRef={bookingRef}
          price={price}
          timerActive={timerActive}
          setTimerActive={setTimerActive}
          timeRemaining={timeRemaining}
          setTimeRemaining={setTimeRemaining}
          timerInterval={timerInterval}
          setTimerInterval={setTimerInterval}
          sessionCompleted={sessionCompleted}
          setSessionCompleted={setSessionCompleted}
        />
      )}
    </div>
  );
}

function CreatorActionBtn({ type, onClick, disabled }: { type: "accept" | "decline", onClick?: () => void, disabled?: boolean }) {
  // Use same base sizing so heights match - responsive padding and text
  const base = 'w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 text-xs sm:text-sm font-bold text-white flex items-center justify-center active:scale-[0.99]';
  return <button
    className={`${base} ${type === "accept" ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:brightness-110 shadow-lg shadow-emerald-900/30" : "bg-rose-600/90 hover:bg-rose-600"} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    onClick={onClick}
    disabled={disabled}
  >
    {type === "accept" ? "Accept" : "Decline"}
  </button>
};

function FanActionBtn({ label, className, onClick, disabled }: { label: string, className?: string, onClick?: () => void, disabled?: boolean }) {
  // allow overriding/using shared class; default uses the same base so sizing is consistent
  const defaultClass = 'w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 text-xs sm:text-sm font-semibold flex items-center justify-center border border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]';
  return <button
    className={`${className ? className : defaultClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </button>
}

function StarRow({
  value,
  clickable,
  onPick,
  size = "text-3xl",
}: {
  value: number;
  clickable: boolean;
  onPick?: (star: number) => void;
  size?: string;
}) {
  return (
    <div className="flex justify-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => clickable && onPick && onPick(star)}
          disabled={!clickable}
          className={`${size} leading-none transition-transform focus:outline-none ${clickable ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
        >
          <span className={`transition-colors ${star <= value ? "text-yellow-400" : "text-slate-600"} ${clickable ? "hover:text-yellow-400" : ""}`}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}


// Old Rating component removed - using new 5-star system

/* ── Redesigned details modal helpers (design only) ─────────────────────── */
function InfoSection({
  icon,
  title,
  badge,
  open,
  onToggle,
  children,
}: {
  icon: string;
  title: string;
  badge?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0d1220] overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03] transition-colors"
      >
        <span className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-base shrink-0">{icon}</span>
        <span className="flex-1 text-[13.5px] font-semibold text-slate-100">{title}</span>
        {badge}
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-slate-500 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/[0.05]">
          <div className="pt-3 text-[13px] leading-relaxed text-slate-400">{children}</div>
        </div>
      )}
    </div>
  );
}

function InfoTile({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-[#0d1220] p-4">
      <span className="w-9 h-9 rounded-xl bg-[#6c63ff]/15 text-[#a89cff] flex items-center justify-center text-lg shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-500">{label}</p>
        <div className="mt-0.5 text-[14px] font-semibold text-slate-100 break-words">{children}</div>
      </div>
    </div>
  );
}

function DetailsModal({
  details,
  onClose,
  type,
  hosttype,
  timeLeft,
  isExpired,
  currentStatus,
  fanUserid,
  fanVerified,
  creatorUserid,
   timerActive,
  requestId,
  bookingRef,
  price,
  setTimerActive,
  timeRemaining,
  setTimeRemaining,
   timerInterval,
  setTimerInterval,
   sessionCompleted,    
  setSessionCompleted 
}: {
  details?: FanMeetDetails;
  onClose: () => void;
  type: "fan" | "creator";
  hosttype?: string;
  timeLeft?: string;
  isExpired?: boolean;
  currentStatus?: string;
  fanUserid?: string;
  fanVerified?: boolean;
  creatorUserid?: string;
  requestId?: string;
  bookingRef?: string;
  price?: number;
   timerActive: boolean;
  setTimerActive: (v: boolean) => void;
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  timerInterval: NodeJS.Timeout | null;
  setTimerInterval: (v: NodeJS.Timeout | null) => void;
  sessionCompleted: boolean;
setSessionCompleted: (v: boolean) => void;
}) {
  const [fanDocument, setFanDocument] = useState<{
    idPhotofilelink?: string;
    holdingIdPhotofilelink?: string;
  } | null>(null);
  
  const [fanDocLoading, setFanDocLoading] = useState(true);

  const [lightboxSrc, setLightboxSrc] = useState<string>("");

  // Which info accordion is open (design only)
  const [openSection, setOpenSection] = useState<string | null>("safety");
  const toggleSection = (id: string) => setOpenSection((prev) => (prev === id ? null : id));

  // ── Creator "Mark as Complete" ─────────────────────────────────────────
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [creatorMarked, setCreatorMarked] = useState<boolean>(() => {
    try {
      return typeof window !== "undefined" && localStorage.getItem(`creator_marked_complete_${requestId}`) === "true";
    } catch {
      return false;
    }
  });

  const handleCreatorMarkComplete = async () => {
    if (!requestId || markingComplete) return;
    setMarkingComplete(true);
    try {
      let token = "";
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const d = JSON.parse(raw);
          token = d?.accesstoken || d?.user?.accesstoken || "";
        }
      } catch {}

      const res = await fetch(`${URL}/fanrequest/creator-mark-complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        try { localStorage.setItem(`creator_marked_complete_${requestId}`, "true"); } catch {}
        setCreatorMarked(true);
        setShowCompleteConfirm(false);
        toast.success(
          data.alreadyMarked ? "Already marked as complete." : "Marked as complete. Your fan has been notified."
        );
      } else {
        toast.error(data.message || "Could not mark this booking as complete");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setMarkingComplete(false);
    }
  };

const handleStartTimer = async () => {
  if (timerActive) return;

  try {
    await fetch(`${URL}/fanrequest/notify-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId })
    });
  } catch (err) {
    console.error('Failed to save session end time', err);
  }

  const sessionMinutes = hosttype?.toLowerCase() === "fan date" ? 60 : 30;
  const endTime = Date.now() + sessionMinutes * 60 * 1000;
  localStorage.setItem(`timer_active_${requestId}`, 'true');
  localStorage.setItem(`timer_end_${requestId}`, String(endTime));
  setTimerActive(true);
  setTimeRemaining(sessionMinutes * 60);
};

const formatTimer = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

 useEffect(() => {
  if (type !== "creator" || !fanUserid) return;
  const fetchFanDoc = async () => {
    try {
      const res = await fetch(`${URL}/getdocument/fan/${fanUserid}`);
      const data = await res.json();
      if (data.ok && data.document) {
        setFanDocument({
          idPhotofilelink: data.document.idPhotofile?.idPhotofilelink,
          holdingIdPhotofilelink: data.document.holdingIdPhotofile?.holdingIdPhotofilelink,
        });
      }
    } catch {
    
    } finally {
      setFanDocLoading(false);
    }
  };
  fetchFanDoc();
}, [fanUserid, type]);

  // Fallback countdown calculation for modal
  const getFallbackCountdown = () => {
    // This is a fallback - in real implementation, createdAt should be passed to modal
    // For now, we'll show a placeholder
    return "Countdown not available";
  };

  const isCall = hosttype?.toLowerCase() === "fan call";
  const isDate = hosttype?.toLowerCase() === "fan date";
  const sessionWord = isDate ? "date" : "meet";

  if (!details) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#070a13] overflow-y-auto flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0d1220] p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-2">{getDetailsTitle(hosttype || "Fan Meet")}</h2>
          {bookingRef && <p className="text-xs font-mono text-slate-500 mb-3">Booking ID: {bookingRef}</p>}
          <p className="text-slate-400 mb-5">Details not available</p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-white/[0.06] text-white font-semibold hover:bg-white/[0.1] transition-colors"
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

  // Status pill (display only)
  const statusMeta: Record<string, { label: string; cls: string }> = {
    request:   { label: "Awaiting acceptance", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
    accepted:  { label: "Accepted",            cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
    completed: { label: "Completed",           cls: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
    declined:  { label: "Declined",            cls: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
    cancelled: { label: "Cancelled",           cls: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
    expired:   { label: "Expired",             cls: "bg-slate-500/15 text-slate-300 border-slate-500/30" },
  };
  const statusInfo = statusMeta[currentStatus || ""];

  // Pending amount (fan only, while the gold is still held)
 const showPending =
    !isCall &&
    (currentStatus === "request" || currentStatus === "accepted") &&
    Number(price) > 0;

  const docImg = (link: string) => {
    const key = link.split("/").pop()?.split("?")[0] || "";
    return `${API_BASE}/api/image/view?publicId=${encodeURIComponent(key)}&bucket=creator-application`;
  };
  const docImgLightbox = (link: string) => {
    const key = link.split("/").pop()?.split("?")[0] || "";
    return `${API_BASE}/api/image/view?publicId=${encodeURIComponent(key)}&bucket=post`;
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#070a13] overflow-y-auto text-slate-200">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#070a13]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#6c63ff] to-[#9b59f5]" />
            <h2 className="text-[15px] font-bold text-white tracking-tight">{getDetailsTitle(hosttype || "Fan Meet")}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-white/[0.06] text-slate-300 hover:bg-white/[0.12] hover:text-white transition-colors flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-5 pb-32 space-y-4">

        {/* ── Hero: booking id + status ───────────────────────── */}
        {(bookingRef || statusInfo) && (
          <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#6c63ff]/[0.14] via-[#0d1220] to-[#0d1220] p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-500">Booking ID</p>
              <p className="mt-0.5 text-[13px] font-mono text-slate-200 truncate">{bookingRef || "—"}</p>
            </div>
            {statusInfo && (
              <span className={`shrink-0 px-3 py-1 rounded-full border text-[11.5px] font-bold ${statusInfo.cls}`}>
                {statusInfo.label}
              </span>
            )}
          </div>
        )}

        {/* ── Pending amount (fan) ───────────────────────────── */}
        {showPending && (
          <div className="relative overflow-hidden rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/[0.14] via-[#0d1220] to-[#0d1220] p-5">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-orange-500/10 blur-2xl" />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-orange-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  Pending
                </p>
                <p className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white tabular-nums">{Number(price).toLocaleString()}</span>
                  <span className="text-sm font-bold text-orange-300">GOLD</span>
                </p>
                {type === "creator" && (
                  <p className="mt-0.5 text-[12px] text-slate-500">≈ ${(Number(price) * 0.04).toFixed(2)} USD</p>
                )}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-2xl">🪙</div>
            </div>
            <p className="relative mt-3 pt-3 border-t border-white/[0.06] text-[12.5px] leading-relaxed text-slate-400">
             {type === "creator"
                ? currentStatus === "request"
                  ? "Held by Mmeko while you review this request."
                  : "Secured by Mmeko and released to you once the booking is completed."
                : currentStatus === "request"
                  ? "Held by Mmeko while the creator reviews your request."
                  : "Secured by Mmeko until you mark the booking as complete."}
            </p>
          </div>
        )}

        {/* ── Countdown (accepted) ───────────────────────────── */}
        {currentStatus === "accepted" && (
          <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/[0.1] to-rose-500/[0.08] p-4">
            <div className="flex items-center justify-center gap-3">
              <IoTimeOutline className="text-orange-400 text-2xl" />
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  {isCall ? "Expires in" : "Remain to meet"}
                </p>
                <p className="mt-0.5 text-2xl font-extrabold text-orange-300 tabular-nums">
                  {timeLeft || getFallbackCountdown()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Creator: Mark as Complete ──────────────────────── */}
        {type === "creator" && currentStatus === "accepted" && !isCall && (
          creatorMarked ? (
            <div className="w-full py-3.5 rounded-2xl text-center text-sm font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25">
              ✓ Marked as complete — your fan has been notified
            </div>
          ) : (
            <button
              onClick={() => setShowCompleteConfirm(true)}
              className="w-full py-3.5 rounded-2xl font-bold text-white transition-all hover:brightness-110 active:scale-[0.99] shadow-lg shadow-emerald-900/30"
              style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
            >
              Mark as Complete
            </button>
          )
        )}

        {/* ── Schedule / Venue / Duration ───────────────────── */}
        {!isCall && (
          <div className="space-y-3">
            <InfoTile icon={<IoCalendarOutline />} label="Booking Schedule">
              {formatDate(details.date)} at {formatTime(details.time)}
            </InfoTile>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoTile icon={<IoLocationOutline />} label="Venue">
                {details.venue}
              </InfoTile>
              <InfoTile icon={<IoTimeOutline />} label="Duration">
                {details.duration || (isDate ? "1 hour per session" : "30 minutes per session")}
              </InfoTile>
            </div>

            {currentStatus === "accepted" && (
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.07] p-4">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-sky-300 flex items-center gap-1.5 mb-1.5">
                  ⚠️ Card Expiration Rule
                </p>
                <p className="text-[12.5px] leading-relaxed text-slate-400">
                  While bookings must occur within 14 days, this card remains active for 20 days as a completion grace period. If not marked as complete and no creator dispute is filed by day 18, it automatically expires and refunds the fan.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Creator: Timer ─────────────────────────────────── */}
        {type === "creator" && currentStatus === "accepted" && !isCall && (
          <div className="rounded-2xl border border-white/[0.07] bg-[#0d1220] p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-base">⏰</span>
              <h3 className="text-[13.5px] font-semibold text-slate-100">Timer</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.08]">
                Optional
              </span>
            </div>

            {timerActive ? (
              <div className="w-full py-3.5 rounded-xl text-center font-extrabold text-white text-xl tabular-nums"
                style={{ background: "linear-gradient(135deg, #f97316, #ef4444)" }}>
                ⏱️ {formatTimer(timeRemaining)} remaining
              </div>
            ) : timeRemaining === 0 ? (
              <div className="w-full py-3.5 rounded-xl text-center font-bold text-white text-lg"
                style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                ✅ {hosttype || "Fan Meet"} Completed
              </div>
            ) : (
              <button
                onClick={() => setShowStartConfirm(true)}
                className="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:brightness-110 active:scale-[0.99]"
                style={{ background: "linear-gradient(135deg, #6c63ff, #9b59f5)" }}
              >
                Start {hosttype || "Fan Meet"}
              </button>
            )}

            <p className="mt-3 text-[12.5px] leading-relaxed text-slate-400">
              {timeRemaining === 0 && !timerActive
                ? "The scheduled time is over. If the meet has finished, click the “Mark as Complete” button above."
                : `Start this timer when the ${isDate ? "date" : "meet & greet"} begins. It runs for ${isDate ? "1 hour" : "30 minutes"} and notifies both you and your fan when it starts and when it ends.`
              }
            </p>
          </div>
        )}

        {/* ── Creator: Fan identity + documents ──────────────── */}
        {type === "creator" && (
          <div className="rounded-2xl border border-white/[0.07] bg-[#0d1220] p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-base">🪪</span>
              <h3 className="text-[13.5px] font-semibold text-slate-100">Fan Identity</h3>
            </div>

            {fanVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold"
                style={{
                  background: "linear-gradient(135deg,rgba(108,99,255,.2),rgba(155,89,245,.12))",
                  border: "1px solid rgba(108,99,255,.35)",
                  color: "#a89cff"
                }}
              >
               <BadgeCheck size={15} fill="#6c63ff" className="text-white shrink-0" />
          Verified Fan
              </span>
            ) : (
              <p className="text-[13px] text-slate-500">ID and selfie confirmation will appear here once the fan is verified.</p>
            )}

            {fanDocument && fanVerified && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {fanDocument.idPhotofilelink && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">ID Document</p>
                    <img
                      src={docImg(fanDocument.idPhotofilelink)}
                      alt="Fan ID"
                      className="w-full aspect-[4/3] rounded-xl object-cover border border-white/[0.08] cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setLightboxSrc(docImgLightbox(fanDocument.idPhotofilelink!))}
                    />
                  </div>
                )}
                {fanDocument.holdingIdPhotofilelink && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Selfie with ID</p>
                    <img
                      src={docImg(fanDocument.holdingIdPhotofilelink)}
                      alt="Fan selfie with ID"
                      className="w-full aspect-[4/3] rounded-xl object-cover border border-white/[0.08] cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setLightboxSrc(docImgLightbox(fanDocument.holdingIdPhotofilelink!))}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Info sections ──────────────────────────────────── */}
        <div className="pt-1">
          <p className="px-1 mb-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-500">Good to know</p>
          <div className="space-y-2.5">

            {/* What happens next — Fan Meet / Fan Date */}
            {!isCall && (
              <InfoSection icon="👉" title="What happens next?" open={openSection === "next"} onToggle={() => toggleSection("next")}>
                <p>
                  Once a booking request is sent, the creator has up to 24 hours to accept. After acceptance, the{" "}
                  <strong className="text-slate-200">{isDate ? "date" : "meet & greet"}</strong>{" "}
                  can take place at any time based on mutual availability within that booking.
                </p>
              </InfoSection>
            )}

            {/* What happens next — Fan Call */}
            {isCall && (
              <InfoSection icon="👉" title="What happens next?" open={openSection === "next"} onToggle={() => toggleSection("next")}>
                <p>
                  Once a booking request is sent, the creator has up to 24 hours to accept it. After the creator accepts, the call can be started anytime based on mutual availability within that booking.
                </p>
              </InfoSection>
            )}

            {/* Payment Secured */}
            {!isCall && (
              <InfoSection icon="🔒" title="Payment Secured" open={openSection === "payment"} onToggle={() => toggleSection("payment")}>
                {type === "creator" ? (
                  <>
                    <p>Once a booking is accepted, your payment is secured and held by Mmeko.</p>
                    <p className="mt-2">
                      After the {sessionWord}, click the <strong className="text-slate-200">“Mark as Complete”</strong> button above and leave. Your fan will be notified to mark it as complete too. Once they do, your payment is released instantly.
                    </p>
                    <p className="mt-2">
                      If they don’t mark it as complete within 15 minutes, contact <strong className="text-slate-200">Mmeko Support</strong> and we will release your payment immediately.
                    </p>
                  </>
                ) : (
                  <p>
                    Once a booking is accepted, your payment is secured and held by Mmeko. After the{" "}
                    <strong className="text-slate-200">{isDate ? "date" : "meet & greet"}</strong>,{" "}
                    Click <strong className="text-slate-200">"Mark as Complete"</strong> on the request card — whether the meet went well or not. This releases the payment to the creator.
                  </p>
                )}
              </InfoSection>
            )}

            {/* No show — creator */}
            {type === "creator" && !isCall && (
              <InfoSection icon="🛑" title="No show?? No problem!" open={openSection === "noshow"} onToggle={() => toggleSection("noshow")}>
                <p>
                  Cancellation by the fan is not allowed after you accept a booking request. If the fan does not show up, or asks to cancel, simply contact <strong className="text-slate-200">Mmeko Support</strong> and we will release your payment immediately. 🙂
                </p>
              </InfoSection>
            )}

            {/* Protected booking — fan */}
            {type === "fan" && !isCall && (
              <InfoSection icon="🤝" title="Protected Booking" open={openSection === "protected"} onToggle={() => toggleSection("protected")}>
                <p>
                  Cancellations are not allowed after acceptance. If you don't show up, fails to respond to messages within 24 hours, or request a cancellation, your payment is forfeited to the creator. However, <strong className="text-slate-200">if the creator does not show up or respond</strong>, your payment is fully protected—simply do not mark it complete, and the funds will automatically refund to you on day 20. 🙂
                </p>
              </InfoSection>
            )}

            {/* Keep chat on-platform */}
            {!isCall && (
              <InfoSection icon="💬" title="Keep chat on-platform" open={openSection === "chat"} onToggle={() => toggleSection("chat")}>
                <p>
                  Always keep your arrangements and conversations within the Mmeko chat. This is your ultimate protection if our support team ever needs to review a dispute or release a payment manually.
                </p>
              </InfoSection>
            )}

            {/* Call expiration */}
            {isCall && (
              <InfoSection icon="⏳" title="Call Expiration" open={openSection === "callexp"} onToggle={() => toggleSection("callexp")}>
                <p>Call must start within 10 days (240 hours) after acceptance or it will automatically expire.</p>
              </InfoSection>
            )}

            {/* Creator Protection FAQ */}
            {type === "creator" && !isCall && (
              <InfoSection icon="❓" title="Creator Protection" open={openSection === "faq"} onToggle={() => toggleSection("faq")}>
                <p className="text-slate-200 font-semibold">
                  What happens if a fan claims they had a bad experience or that you left early?
                </p>
                <p className="mt-1">
                  Mmeko does not judge the quality or content of the date; we only verify that the meet occurred. Here&apos;s exactly how you&apos;re protected:
                </p>
                <ul className="mt-1.5 space-y-1.5">
                  <li>• <span className="font-medium text-slate-300">The Paper Trail:</span> Keep your communication on the Mmeko platform. Let the fan know when you&apos;re leaving home, when you arrive, and when you&apos;re at the meeting point.</li>
                  <li>• <span className="font-medium text-slate-300">No &quot;He Said, She Said&quot;:</span> If a fan attempts a dispute, Mmeko reviews the platform chat history — not the fan&apos;s version of events. Their word means nothing when the chat logs prove you arrived and were present.</li>
                  <li>• <span className="font-medium text-slate-300">Guaranteed Payouts:</span> A fan cannot reduce or withhold your payment based on what happened during the date. Either the meet occurred, or it didn&apos;t.</li>
                </ul>

                <p className="mt-4 text-slate-200 font-semibold">
                  Clear Payment Release Rules (15 Minutes Rule)
                </p>
                <p className="mt-1">
                  <span className="font-medium text-slate-300">If the fan goes silent at the meeting point:</span> Message them that you have arrived. If they don’t respond within 15 minutes, leave and contact Support. We will release your payment immediately.
                </p>
                <p className="mt-1.5">
                  <span className="font-medium text-slate-300">After the date:</span> Click the “Mark as Complete” button and leave. The fan will be reminded to release the funds. If you still haven’t received payment after 15 minutes, contact Support and we will release it to you immediately.
                </p>
                <p className="mt-1.5">
                  You never need to chase or argue with the fan. The chat record is enough.
                </p>

                <p className="mt-4 text-slate-200 font-semibold">
                  What if the fan stops responding? (24 Hour Rule)
                </p>
                <p className="mt-1">
                  If a fan books you and then goes silent before the meet, you are still protected. Keep all communication inside the Mmeko chat. If they don’t reply within 24 hours, contact Support and we will release the payment to you.
                </p>
                <p className="mt-1.5">
                  The reason is simple: if a fan is not responding, there is no real arrangement. You shouldn’t have to keep waiting or travel when they have gone silent. Your protection is in the chat record.
                </p>

                <p className="mt-4 text-slate-200 font-semibold">
                  What if I get sick or have an emergency and can&apos;t make a booking?
                </p>
                <p className="mt-1">
                  You have up to 18 days from the booking request date to reschedule. The fan&apos;s payment stays secured during this time, so you don&apos;t lose the booking or feel pressured to rush back before you&apos;re ready.
                </p>

                <p className="mt-4 text-slate-200 font-semibold">
                  How many days do I have to contact Mmeko Support if a fan refuses to mark a meet/date as complete, doesn&apos;t show up, or asks to cancel?
                </p>
                <p className="mt-1">
                  You have 18 days from the booking request date to contact Mmeko Support. If Support is not contacted within 18 days, the client will automatically receive a refund on day 20.
                </p>
              </InfoSection>
            )}

            {/* Safety Rules */}
            <InfoSection
              icon="🛡️"
              title="Safety Rules (Important!)"
              open={openSection === "safety"}
              onToggle={() => toggleSection("safety")}
              badge={
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                  Important
                </span>
              }
            >
              {isCall ? (
                <ul className="space-y-1.5">
                  <li>• Calls are billed per minute.</li>
                  <li>• Ensure stable internet connection before starting.</li>
                  <li>• Be respectful and follow platform guidelines.</li>
                </ul>
              ) : (
                <>
                  <ul className="space-y-1.5">
                    {isDate ? (
                      <li>• All fan date sessions are limited to 1 hour.</li>
                    ) : (
                      <li>• All fan meet sessions are limited to 30 minutes.</li>
                    )}
                    <li>• {isDate ? "Dates" : "Meets"} must happen in a public place only.</li>
                  </ul>
                  <p className="mt-2.5 text-xs text-slate-500">
                    What happens after {isDate ? "1 hour" : "30 minutes"} is outside the platform&apos;s responsibility.
                  </p>
                </>
              )}
            </InfoSection>
          </div>
        </div>

        {/* ── Agreement ──────────────────────────────────────── */}
        {!isCall && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-base shrink-0">✅</span>
            <p className="text-[13px] font-semibold text-slate-200">
              {type === "creator"
                ? "By accepting this request, you agree to follow these safety rules."
                : "By sending this request, you agree to follow these safety rules."}
            </p>
          </div>
        )}
      </div>

      {/* ── Sticky close ────────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 z-20 border-t border-white/[0.06] bg-[#070a13]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl text-white font-bold transition-all hover:brightness-110 active:scale-[0.99]"
            style={{ background: "linear-gradient(135deg, #6c63ff, #9b59f5)" }}
          >
            Close
          </button>
        </div>
      </div>

      {/* ── Confirm: Mark as Complete ───────────────────────────── */}
      {showCompleteConfirm && (
        <div
          className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !markingComplete && setShowCompleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f1424] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center text-xl mb-3">✅</div>
            <h3 className="text-lg font-bold text-white mb-3">Mark this booking as complete?</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Only click this after the meet has ended — whether it went well or not.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mt-3">
              This will notify your fan to mark it as complete too. Once they do, your payment is released instantly.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mt-3">
              If they don’t mark it as complete within 15 minutes, contact <strong className="text-slate-200">Mmeko Support</strong> and we will release your payment immediately.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCompleteConfirm(false)}
                disabled={markingComplete}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/[0.06] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatorMarkComplete}
                disabled={markingComplete}
                className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
              >
                {markingComplete ? "Sending…" : "Yes, mark complete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm: Start timer ────────────────────────────────── */}
      {showStartConfirm && (
        <div
          className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowStartConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f1424] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-xl bg-[#6c63ff]/20 flex items-center justify-center text-xl mb-3">⏱️</div>
            <h3 className="text-lg font-bold text-white mb-3">
              Start the {sessionWord} timer?
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Only start this when the {sessionWord} begins.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mt-3">
              The timer runs for {isDate ? "1 hour" : "30 minutes"}. You and your fan will be notified now, and again when the time is up.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowStartConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/[0.06]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowStartConfirm(false);
                  handleStartTimer();
                }}
                className="flex-1 py-3 rounded-xl font-bold text-white"
                style={{ background: "linear-gradient(135deg, #6c63ff, #9b59f5)" }}
              >
                Start timer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ────────────────────────────────────────────── */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc("")}
        >
          <button
            onClick={() => setLightboxSrc("")}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center text-lg hover:bg-white/20"
          >✕</button>
          <img
            src={lightboxSrc}
            alt="Document"
            className="max-w-full max-h-[90vh] rounded-xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}