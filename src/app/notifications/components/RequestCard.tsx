import Image from 'next/image';
import React, { useState, useEffect } from 'react'
import { BiTimeFive } from 'react-icons/bi'
import { FaCoins } from 'react-icons/fa';
import { toast } from 'material-react-toastify';
import { URL } from '@/api/config';
import { IoCalendarOutline, IoLocationOutline, IoTimeOutline, IoWarningOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import VIPBadge from "@/components/VIPBadge";
import { getSocket } from '@/lib/socket';
import { useRouter } from 'next/navigation';
import { useVideoCall } from '@/contexts/VideoCallContext';

const cardStates = {
  request: "Request sent",
  accepted: "Request accepted",
  declined: "Request declined",
  cancelled: "Request cancelled",
  expired: "Request expired",
  completed: "Request completed"
}
const ratings = [
  "😍 Loved it",
  "🙂 Decent",
  "😐 Disconnected",
  
]
const getCreatorContent = (hostType: string) => {
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
  
  return {
    accepted: getAcceptedContent(),
    completed: {
      head: `${typeText} Completed`,
      body: "How do you rate your experience?"
    },
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
const getFanContent = (price: number, hostType: string) => {
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
  
  return {
    accepted: getAcceptedContent(),
    completed: {
      head: `${typeText} Completed`,
      body: "How do you rate your experience?"
    },
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
    img: string;
    status: "request" | "expired" | "completed" | "accepted" | "declined" | "cancelled";
    bookingId?: string;
    price?: number;
    details?: FanMeetDetails;
    userid?: string;
    creator_portfolio_id?: string;
    hosttype?: string;
    isVip?: boolean;
    vipEndDate?: string | null;
    onStatusChange?: (bookingId: string, newStatus: string) => void;
}

export default function RequestCard({exp, img, name, titles=["fan"], status, type="fan", bookingId, price, details, userid, creator_portfolio_id, hosttype, isVip=false, vipEndDate=null, onStatusChange}: CardProps) {
  console.log('🔍 [RequestCard] Props received:', {
    type,
    name,
    creator_portfolio_id,
    hosttype,
    status,
    bookingId
  });
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();
  const { startVideoCall } = useVideoCall();

  // Socket integration for real-time updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !bookingId) return;

    // Listen for fan meet request status updates
    const handleFanMeetStatusUpdate = (data: { 
      bookingId: string; 
      status: string; 
      userid: string; 
      creator_portfolio_id: string;
      message?: string;
    }) => {
      // Check if this update is for this specific request
      if (data.bookingId === bookingId) {
        
        // Update local status
        setCurrentStatus(data.status as "request" | "expired" | "completed" | "accepted" | "declined" | "cancelled");
        
        // Notify parent component
        onStatusChange?.(data.bookingId, data.status);
        
        // Show toast notification
        if (data.message) {
          toast.info(data.message);
        } else {
          // Default messages based on status and host type
          const getStatusMessage = (status: string, hostType?: string) => {
            const serviceType = hostType || "Fan meet";
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
    socket.on('fan_meet_status_update', handleFanMeetStatusUpdate);
    
    // Listen for general booking updates (fallback)
    socket.on('booking_status_update', handleFanMeetStatusUpdate);

    // Cleanup listeners on unmount
    return () => {
      socket.off('fan_meet_status_update', handleFanMeetStatusUpdate);
      socket.off('booking_status_update', handleFanMeetStatusUpdate);
    };
  }, [bookingId, onStatusChange, hosttype]);

  // Update local status when prop changes
  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);
  
  
  const cardBorderVariance = type === "creator" ? "border-blue-500" : type === "fan" && ["accepted", "completed"].includes(currentStatus) ? "border-green-500" : "border-yellow-500"
  const cardTextVariance = type === "creator" ? "text-blue-500" : type === "fan" && ["accepted", "completed"].includes(currentStatus) ? "text-green-500" : "text-yellow-500"

  // shared action button base so buttons have same size / height
  const actionBtnBase = 'w-full px-6 py-3 rounded-lg transition-all duration-500 text-sm flex items-center justify-center';
  // Fan action style (uses base for consistent sizing)
  const fanActionClass = `${actionBtnBase} border border-gray-500 max-[490px]:text-xs text-gray-300 hover:bg-slate-700 bg-transparent`;

  // API call functions
  const handleAccept = async () => {
    if (!bookingId || !details) return;
    setLoading(true);
    try {
      const response = await fetch(`${URL}/acceptbook`, {
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
        onStatusChange?.(bookingId, 'accepted');
        const serviceType = hosttype || "Fan meet";
        toast.success(`${serviceType} request accepted successfully!`);
      } else {
        const serviceType = hosttype || "Fan meet";
        toast.error(`Failed to accept ${serviceType.toLowerCase()} request`);
      }
    } catch {
      const serviceType = hosttype || "Fan meet";
      toast.error(`Error accepting ${serviceType.toLowerCase()} request`);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!bookingId || !details) return;
    setLoading(true);
    try {
      const requestBody = {
        creator_portfolio_id: creator_portfolio_id,
        userid: userid,
        date: details.date,
        time: details.time
      };
      
      const response = await fetch(`${URL}/declinebook`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        setCurrentStatus('declined');
        onStatusChange?.(bookingId, 'declined');
        const serviceType = hosttype || "Fan meet";
        toast.success(`${serviceType} request declined`);
      } else {
        const errorData = await response.json();
        const serviceType = hosttype || "Fan meet";
        toast.error(errorData.message || `Failed to decline ${serviceType.toLowerCase()} request`);
      }
    } catch {
      const serviceType = hosttype || "Fan meet";
      toast.error(`Error declining ${serviceType.toLowerCase()} request`);
    } finally {
      setLoading(false);
    }
  };

    const handleCancel = async () => {
      if (!bookingId || !details || !userid || !creator_portfolio_id) {
        toast.error('Missing required data for cancel request');
        return;
      }
      setLoading(true);
      try {
        const requestBody = {
          id: bookingId,
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
          onStatusChange?.(bookingId, 'cancelled');
          const serviceType = hosttype || "Fan meet";
          toast.success(`${serviceType} request cancelled`);
        } else {
          const errorData = await response.json();
          const serviceType = hosttype || "Fan meet";
          toast.error(errorData.message || `Failed to cancel ${serviceType.toLowerCase()} request`);
        }
      } catch {
        const serviceType = hosttype || "Fan meet";
        toast.error(`Error cancelling ${serviceType.toLowerCase()} request`);
      } finally {
        setLoading(false);
      }
    };

  const handleComplete = async () => {
    if (!bookingId) return;
    
    // If it's a Fan Call, start video call instead of completing
    if (hosttype === "Fan call") {
      if (creator_portfolio_id && name) {
        startVideoCall(creator_portfolio_id, name, img);
      }
      return;
    }
    
    // For Fan Meet/Fan Date, complete the booking
    setLoading(true);
    try {
      const response = await fetch(`${URL}/completebook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          userid: userid,
          creator_portfolio_id: creator_portfolio_id
        })
      });
      
      if (response.ok) {
        setCurrentStatus('completed');
        onStatusChange?.(bookingId, 'completed');
        const serviceType = hosttype || "Fan meet";
        toast.success(`${serviceType} completed!`);
      } else {
        const serviceType = hosttype || "Fan meet";
        toast.error(`Failed to complete ${serviceType.toLowerCase()}`);
      }
    } catch {
      const serviceType = hosttype || "Fan meet";
      toast.error(`Error completing ${serviceType.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const handleRenewRequest = () => {
    if (creator_portfolio_id) {
      router.push(`/creators/${creator_portfolio_id}`);
    }
  };

  const handleProfileClick = () => {
    // The userid prop contains the ID of the person whose details are shown on the card
    // If fan clicks -> go to creator's profile (userid = creator's user ID)
    // If creator clicks -> go to fan's profile (userid = fan's user ID)
    if (userid) {
      router.push(`/Profile/${userid}`);
    } else if (creator_portfolio_id) {
      // Fallback: if no userid, try to get creator's profile
      router.push(`/creators/${creator_portfolio_id}`);
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
              <Image src={img} width={100} alt="picture" height={100} className='absolute top-0 left-0 size-full object-cover' />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-600 text-white font-bold text-xl">
                {name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)}
              </div>
            )}
            
          </div>
          <div className='text-sm'>
            <div className='flex items-center gap-2'>
              <p className='font-bold cursor-pointer hover:text-blue-400 transition-colors' onClick={handleProfileClick}>{name}</p>
            </div>
            <div className='flex gap-1'>{titles?.map((title, i)=> i === titles.length -1 ? <p key={title}>{title}</p> : <p key={title}>{title} &#x2022; </p>)}</div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          {currentStatus === "accepted" ? <p className="flex items-center gap-2 text-xl"><FaCoins /> {price || 20}</p> : <BiTimeFive className="text-2xl" />}
        </div>
      </div>

      <h3 className={`text-3xl md:text-4xl ${cardTextVariance}`}>{
        type === "creator" ? (getCreatorContent(hosttype || "Fan Meet")[currentStatus]?.head || "Unknown Status") : (getFanContent(price || 0, hosttype || "Fan Meet")[currentStatus]?.head || "Unknown Status")
      }</h3>

      <p className="text-sm md:text-base">{ type === "creator" ? (getCreatorContent(hosttype || "Fan Meet")[currentStatus]?.body || "Status information not available") : (getFanContent(price || 0, hosttype || "Fan Meet")[currentStatus]?.body || "Status information not available") }</p>

      {/* RATINGS */}
      <div className='flex gap-4 flex-wrap justify-center'>
        {currentStatus === "completed" && ratings.map((v,i) => <Rating key={i} label={v} />)}
      </div>

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
              if (userid) {
                router.push(`/message/${userid}`);
              }
            }}
          />
        </div>
        <div className="flex-1">
          <button className={fanActionClass} onClick={() => setShowDetails(true)}>View details</button>
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
          <button className={fanActionClass} onClick={() => setShowDetails(true)}>View details</button>
        </div>
      </div>
    ) : type === "creator" ? (
      <FanActionBtn 
        label="Chat Now" 
        className={fanActionClass} 
        onClick={() => {
          if (userid) {
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

            {/* Action buttons row: ALWAYS horizontal (no stacked layout) */}
            <div className='w-full flex flex-row gap-4 items-center'>
              { type === "creator" ? (
                // Creator: Accept | Decline | View details (equal widths)
                <>
                  <div className='flex-1'>
                    <CreatorActionBtn type='accept' onClick={handleAccept} disabled={loading} />
                  </div>
                  <div className='flex-1'>
                    <CreatorActionBtn type='decline' onClick={handleDecline} disabled={loading} />
                  </div>
                  <div className='flex-1'>
                    <button className={fanActionClass} onClick={() => setShowDetails(true)}>View details</button>
                  </div>
                </>
              ) : (
                // Fan: Cancel request | View details side-by-side
                <>
                  <div className='flex-1'>
                    {type === "fan" && currentStatus === "request" && <FanActionBtn label='Cancel request' className={fanActionClass} onClick={handleCancel} disabled={loading} />}
                  </div>
                  <div className='flex-1'>
                    <button className={fanActionClass} onClick={() => setShowDetails(true)}>View details</button>
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
        />
      )}
    </div>
  );
}

function CreatorActionBtn({type, onClick, disabled}: {type: "accept" | "decline", onClick?: () => void, disabled?: boolean}){
  // Use same base sizing so heights match
  const base = 'w-full px-6 py-3 rounded-lg transition-all duration-500 text-white flex items-center justify-center';
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
  const defaultClass = 'w-full px-6 py-3 rounded-lg transition-all duration-500 text-sm flex items-center justify-center border border-gray-500 max-[490px]:text-xs text-gray-300 hover:bg-slate-700 bg-transparent';
  return <button 
    className={`${className ? className : defaultClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </button>
}

function Rating({label}: {label: string}){
  return <div className='py-1 text-sm px-4 rounded-lg border border-gray-500 cursor-pointer bg-gray-800 transition-all duration-500 hover:bg-slate-700'>{label}</div>
}

function DetailsModal({ 
  details, 
  onClose, 
  type,
  hosttype
}: { 
  details?: FanMeetDetails; 
  onClose: () => void; 
  type: "fan" | "creator";
  hosttype?: string;
}) {
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

        {/* Agreement - Only show for creators */}
        {type === "creator" && hosttype !== "Fan call" && hosttype !== "Fan Call" && (
          <div className="flex items-start gap-3 mb-6">
            <IoCheckmarkCircleOutline className="text-green-500 text-xl mt-1" />
            <p className="text-gray-800 font-semibold text-sm">
              By accepting this request, you agree to follow these rules.
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
