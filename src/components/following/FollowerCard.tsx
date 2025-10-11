import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { follow, unfollow, getfollow } from "@/store/profile";
import { checkVipStatus } from "@/store/vip";
import { getSocket } from "@/lib/socket";
import VIPBadge from "@/components/VIPBadge";

interface FollowerCardProps {
  image: string;
  name: string;
  creator_portfolio_id: string;
  userId?: string; // User ID for following functionality
  isVip?: boolean;
  vipStartDate?: string;
  vipEndDate?: string;
}

const FollowerCard: React.FC<FollowerCardProps> = ({ image, name, creator_portfolio_id, userId, isVip = false, vipStartDate, vipEndDate }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const currentUserId = useSelector((state: RootState) => state.register.userID);
  const token = useSelector((state: RootState) => state.register.refreshtoken);
  const followingList = useSelector((state: RootState) => {
    interface FollowData {
      following?: Array<{ id: string }>;
    }
    const followingData = state.profile.getfollow_data as FollowData;
    return followingData?.following?.map(u => u.id) || [];
  }, (left, right) => {
    // Custom equality check to prevent unnecessary re-renders
    if (left.length !== right.length) return false;
    return left.every((id, index) => id === right[index]);
  });
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  // VIP status is now passed as props from the API data
  
  const hasImage = Boolean(image && image.trim());
  const initials = React.useMemo(() => {
    const parts = (name || "").trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    return (first + second).toUpperCase() || "?";
  }, [name]);
  
  // Memoize the following check logic to prevent infinite loops
  const checkFollowingState = useCallback(() => {
    if (!userId) return;
    
    // Check if we're in the Following tab
    const followingTab = document.querySelector('.following-tab');
    const thisCard = document.querySelector(`[data-userid="${userId}"]`);
    
    if (!thisCard) return; // Component not mounted yet
    
    // Check if parent has data-followed="true" attribute
    const parentElement = thisCard.closest('.following-user');
    if (parentElement?.getAttribute('data-followed') === 'true') {
      setIsFollowing(true);
      thisCard.setAttribute('data-following', 'true');
      return;
    }
    
    // If this component is rendered in the Following tab, it must be a followed user
    const isInFollowingTab = followingTab?.contains(thisCard);
    if (isInFollowingTab) {
      setIsFollowing(true);
      thisCard.setAttribute('data-following', 'true');
      return;
    }
    
    // If we already know from Redux state that we're following this user
    if (followingList.includes(userId)) {
      setIsFollowing(true);
      thisCard?.setAttribute('data-following', 'true');
    } else {
      setIsFollowing(false);
      thisCard?.setAttribute('data-following', 'false');
    }
  }, [userId, followingList]);

  // Check if this user is being followed - single useEffect to prevent infinite loops
  useEffect(() => {
    checkFollowingState();
  }, [checkFollowingState]);

  // VIP status is now passed as props from the API data, no need to check individually
  
  // Setup socket for real-time follow/unfollow updates
  useEffect(() => {
    if (!currentUserId) return;
    
    // Try to get socket connection
    const socket = getSocket();
    if (!socket) {
      // Fallback: poll for updates every 10 seconds if socket is not available
      const intervalId = setInterval(() => {
        if (currentUserId && token) {
          dispatch(getfollow({ userid: currentUserId, token }));
        }
      }, 10000);
      
      return () => clearInterval(intervalId);
    }
    
    // Listen for follow/unfollow events
    const handleFollowUpdate = () => {
      if (currentUserId) {
        dispatch(getfollow({ userid: currentUserId, token }));
      }
    };
    
    socket.on('follow_update', handleFollowUpdate);
    
    return () => {
      socket.off('follow_update', handleFollowUpdate);
    };
  }, [currentUserId, token, dispatch]);

  const handleProfileClick = () => {
    if (userId) {
      router.push(`/Profile/${userId}`);
    } else if (creator_portfolio_id) {
      router.push(`/creators/${creator_portfolio_id}`);
    }
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking message button
    
    if (!userId) {
      return;
    }
    
    // Navigate to message page with the user
    router.push(`/message/${userId}`);
  };

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking follow button
    
    if (!userId || !currentUserId) {
      return;
    }
    
    // Get token from localStorage if not in Redux state
    let authToken = token;
    if (!authToken) {
      try {
        const loginData = localStorage.getItem('login');
        if (loginData) {
          const parsedData = JSON.parse(loginData);
          authToken = parsedData.refreshtoken || parsedData.accesstoken;
        }
      } catch (error) {
        console.error("[FollowerCard] Error retrieving token from localStorage:", error);
      }
    }
    
    if (!authToken) {
      alert("Please log in to follow/unfollow users");
      return;
    }
    
    if (isProcessing) {
      return;
    }
    
    setIsProcessing(true);
    try {
      // Perform follow/unfollow action
      if (isFollowing) {
        try {
          await dispatch(unfollow({ 
            userid: userId, 
            followerid: currentUserId, 
            token: authToken 
          })).unwrap();
          
          // Update local state
          setIsFollowing(false);
          // Remove from localStorage
          // No need to remove from localStorage - database is the source of truth
          
          // Update data attribute for DOM queries
          const element = document.querySelector(`[data-userid="${userId}"]`);
          if (element) {
            element.setAttribute('data-following', 'false');
          }
        } catch (error: unknown) {
          // If the error is "not following this user", update the UI state
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes("not following")) {
            setIsFollowing(false);
          } else {
            throw error; // Re-throw for the outer catch
          }
        }
      } else {
        try {
          await dispatch(follow({ 
            userid: userId, 
            followerid: currentUserId, 
            token: authToken 
          })).unwrap();
          
          // Update local state
          setIsFollowing(true);
          // No need to persist to localStorage - database is the source of truth
          
          // Update data attribute for DOM queries
          const element = document.querySelector(`[data-userid="${userId}"]`);
          if (element) {
            element.setAttribute('data-following', 'true');
          }
        } catch (error: unknown) {
          // Handle empty error objects or objects without message property
          let errorMessage = "";
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === 'object' && error !== null) {
            // Try to extract message from response data if available
            const errorObj = error as Record<string, unknown>;
            errorMessage = 
              (errorObj.message as string) || 
              ((errorObj.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string || 
              JSON.stringify(error);
          } else {
            errorMessage = String(error);
          }
          
          // Always update UI state to Following if there's any error
          // This is safer since most errors are due to "already followed"
          setIsFollowing(true);
          
          // If the error is specifically "already followed", log it
          if (errorMessage.includes("already followed")) {
            // User is already followed, UI state updated
          } else if (errorMessage) {
            // Only re-throw if we have a meaningful error message
            throw new Error(errorMessage);
          }
        }
      }
      
      // Try to emit socket event to notify other users
      try {
        const socket = getSocket();
        if (socket && socket.connected) {
          socket.emit('follow_update', {
            actor: currentUserId,
            target: userId,
            action: isFollowing ? 'unfollow' : 'follow'
          });
        }
      } catch {
        // Socket error - continue with normal flow
      }
      
      // Always refresh followers/following lists regardless of socket status
      dispatch(getfollow({ userid: currentUserId, token: authToken }));
      
    } catch (error: unknown) {
      // Handle empty error objects or objects without message property
      let errorMessage = "";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Try to extract message from response data if available
        const errorObj = error as Record<string, unknown>;
        errorMessage = 
              (errorObj.message as string) || 
              ((errorObj.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string ||
              JSON.stringify(error);
      } else {
        errorMessage = String(error);
      }
      
      // For follow errors (which are most common), assume it's "already followed"
      if (!isFollowing || errorMessage.includes("already followed")) {
        setIsFollowing(true);
        
        // Update DOM attributes to reflect the followed state
        const element = document.querySelector(`[data-userid="${userId}"]`);
        if (element) {
          element.setAttribute('data-following', 'true');
        }
      } else if (errorMessage.includes("not following")) {
        setIsFollowing(false);
        
        // Update DOM attributes to reflect the unfollowed state
        const element = document.querySelector(`[data-userid="${userId}"]`);
        if (element) {
          element.setAttribute('data-following', 'false');
        }
      } else {
        // For other errors, show an alert
        alert("Failed to " + (isFollowing ? "unfollow" : "follow") + ". Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="flex items-center gap-7 justify-between w-full px-2 py-3 mb-3 rounded-lg hover:bg-gray-800/30 cursor-pointer transition-colors"
      onClick={handleProfileClick}
      data-userid={userId}
      data-following={isFollowing ? 'true' : 'false'}
    >
      {/* Left side: avatar + name */}
      <div className="flex items-center gap-3 w-2/3">
        <div className="relative">
          {hasImage ? (
            <Image
              src={image}
              alt={name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/icons/icons8-profile_Icon1.png";
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {initials}
            </div>
          )}
          
          {/* VIP Lion Badge */}
          <VIPBadge size="xl" className="absolute -top-5 -right-5" isVip={isVip} vipEndDate={vipEndDate} />
        </div>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="text-white font-semibold truncate">{name}</div>
        </div>
      </div>

      {/* Right side: Follow/Message button taking full width and positioned at far right */}
      <div className="flex items-center justify-end w-1/3">
        {userId && userId !== currentUserId && (
          <button
            onClick={isFollowing ? handleMessageClick : handleFollowToggle}
            disabled={isProcessing}
            className={`w-full max-w-[120px] px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isFollowing
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isProcessing ? "..." : isFollowing ? "Message" : "Follow"}
          </button>
        )}
      </div>
    </div>
  );
};

export default FollowerCard;
