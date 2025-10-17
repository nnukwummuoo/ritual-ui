"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { IoArrowBack } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";

import StarIcon from "@/icons/transparentstar.svg";
import StarIcon2 from "@/icons/star.svg";

import {
  follow,
  unfollow,
  ProfilechangeStatus,
  getfollow,
} from "@/store/profile";
import { updateFollowers } from "@/store/creatorSlice";
import { useAuth } from '@/lib/context/auth-context';
import { useUserId } from "@/lib/hooks/useUserId";
import { getSocket } from "@/lib/socket";
import { toast } from "material-react-toastify";

type Props = {
  creatorName: string;
  views: number;
  followingUser: boolean;
  id: string | undefined;
  creator_portfolio_id: string | undefined;
  checkuser: boolean;
};

const CreatorByIdNav = ({ creatorName, views, followingUser, id, creator_portfolio_id: creatorPortfolioId, checkuser }: Props) => {
  const dispatch = useDispatch<any>();
  const router = useRouter();
  const { postuserid, creator_portfolio_id } = useParams<{ postuserid?: string; creator_portfolio_id?: string }>();

  const follow_stats = useSelector((state: any) => state.profile.follow_stats);
  const unfollow_stats = useSelector((state: any) => state.profile.unfollow_stats);
  const userid = useUserId();
  const reduxToken = useSelector((state: any) => state.register.refreshtoken);
  const profile = useSelector((state: any) => state.comprofile.profile);
  
  // Get token from localStorage if not in Redux (EXACT same as ProfilePage.tsx)
  const [localToken, setLocalToken] = React.useState("");
  
  const token = reduxToken || localToken;
  
  // Get follow data from Redux (same as profile page)
  const getfollow_data = useSelector((state: any) => state.profile.getfollow_data);
  const getfollow_stats = useSelector((state: any) => state.profile.getfollow_stats);

  const [isfollwed, setisfollowed] = useState(false);
  const [disabledButton, setdisableButton] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const user: any = useAuth();

  // Load token from localStorage if not in Redux (EXACT same as ProfilePage.tsx)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          
          // Set token if not in Redux
          if (!reduxToken && (data?.refreshtoken || data?.accesstoken)) {
            setLocalToken(data.refreshtoken || data.accesstoken);
          }
        }
      } catch (error) {
        // Silent fail
      }
    }
  }, [reduxToken]);

  // Get current user's following list from Redux (EXACT same as profile page)
  const followingList = useSelector((state: any) => {
    interface FollowData {
      following?: Array<{ id: string }>;
    }
    const followingData = state.profile.getfollow_data as FollowData;
    return followingData?.following?.map((u: any) => u.id) || [];
  }, (left: any, right: any) => {
    // Custom equality check to prevent unnecessary re-renders
    if (left.length !== right.length) return false;
    return left.every((id: any, index: number) => id === right[index]);
  });


  // Fetch follow data when component mounts (same as profile page)
  useEffect(() => {
    if (userid && token) {
      dispatch(getfollow({ userid: String(userid), token }));
    }
  }, [userid, token, dispatch]);

  // Check if logged-in user is following the creator (EXACT same as ProfilePage.tsx)
  useEffect(() => {
    if (userid && id && id !== userid) {
      // Use the same logic as ProfilePage.tsx
      if (followingList.includes(Array.isArray(id) ? id.join(',') : String(id))) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
    }
  }, [followingList, userid, id]);

  // Setup socket for real-time follow/unfollow updates (same as profile page)
  useEffect(() => {
    if (!userid || !id) return;
    
    // Try to get socket connection
    const socket = getSocket();
    if (!socket) {
      // Fallback: poll for updates every 10 seconds if socket is not available
      const intervalId = setInterval(() => {
        if (userid && token) {
          dispatch(getfollow({ userid: String(userid), token }));
        }
      }, 10000);
      
      return () => clearInterval(intervalId);
    }
    
    // Listen for follow/unfollow events
    const handleFollowUpdate = (data: any) => {
      // Check if this update is relevant to the current creator
      if (data.target === id || data.actor === userid) {
        // Refresh follow data
        if (userid && token) {
          dispatch(getfollow({ userid: String(userid), token }));
        }
      }
    };
    
    socket.on('follow_update', handleFollowUpdate);
    
    return () => {
      socket.off('follow_update', handleFollowUpdate);
    };
  }, [userid, id, token, dispatch]);


  useEffect(() => {
    if (userid) {
      if (profile.following) {
        setisfollowed(true);
      }

      if (!userid || userid === profile.userid) {
        setdisableButton(true);
      } else {
        setdisableButton(false);
      }
    }
  }, [userid, profile]);

  const onFollowClick = async () => {
    if (!userid || !id || isProcessing) {
      return;
    }
    
    // Get token from localStorage if not in Redux state (EXACT same as profile page)
    let authToken = token;
    if (!authToken) {
      try {
        const loginData = localStorage.getItem('login');
        if (loginData) {
          const parsedData = JSON.parse(loginData);
          authToken = parsedData.refreshtoken || parsedData.accesstoken;
        }
        } catch (error) {
          // Silent fail
        }
    }
    
    if (!authToken) {
      alert("Please log in to follow/unfollow users");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Perform follow/unfollow action (EXACT same as profile page)
      if (isFollowing) {
        try {
          await dispatch(unfollow({ 
            userid: Array.isArray(id) ? id.join(',') : id,
            followerid: userid, 
            token: authToken 
          })).unwrap();
          
          // Update local state
          setIsFollowing(false);
          
          // Show success toast
          toast.success("Unfollowed successfully!");
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
            userid: Array.isArray(id) ? id.join(',') : id,
            followerid: userid,
            token: authToken
          })).unwrap();

          // Update local state
          setIsFollowing(true);
          
          // Show success toast
          toast.success("Followed successfully!");
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
          
                  // If the error is "already followed", update UI to show Following
                  if (errorMessage.includes("already followed")) {
                    setIsFollowing(true);
                    // Force a re-render to ensure UI updates
                    setTimeout(() => {
                      setIsFollowing(true);
                    }, 100);
                    // Don't throw error - this is expected behavior
                  } else {
                    // For other errors, still assume following (safer approach)
                    setIsFollowing(true);
                  }
        }
      }
      
      // Try to emit socket event to notify other users (EXACT same as profile page)
      try {
        const socket = getSocket();
        if (socket && socket.connected) {
          socket.emit('follow_update', {
            actor: userid,
            target: id,
            action: isFollowing ? 'unfollow' : 'follow'
          });
        }
      } catch {
        // Socket error - continue with normal flow
      }
      
      // Always refresh followers/following lists regardless of socket status (EXACT same as profile page)
      dispatch(getfollow({ userid: String(userid), token: authToken }));
      
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
        const element = document.querySelector(`[data-userid="${id}"]`);
        if (element) {
          element.setAttribute('data-following', 'true');
        }
      } else if (errorMessage.includes("not following")) {
        setIsFollowing(false);
        
        // Update DOM attributes to reflect the unfollowed state
        const element = document.querySelector(`[data-userid="${id}"]`);
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
    <div className="sticky top-0 flex items-center justify-between w-full mx-auto text-white  bg-opacity-80 md:mr-auto md:ml-0">
      <div onClick={() => router.back()} className="cursor-pointer">
        <IoArrowBack className="w-5 h-5" />
      </div>

      <div className="flex flex-row items-center gap-2">
        <div className="leading-none text-right">
          <p className="mb-0 font-semibold">{creatorName}</p>
          <p className="mt-0 text-xs font-semibold text-gray-400">
            {views} Views
          </p>
        </div>
{checkuser ?<></>: (
  <>
                <button
                  className={`flex flex-row items-center space-x-1 px-2 py-1 rounded-lg justify-center transition-all duration-200 ${
                    isFollowing 
                      ? "bg-gradient-to-r from-blue-700 to-purple-800" 
                      : "bg-gradient-to-r from-blue-500 to-purple-600"
                  } ${isProcessing ? "opacity-70 cursor-not-allowed" : "hover:scale-105"}`}
                  onClick={onFollowClick}
                  disabled={isProcessing || disabledButton}
                >
                  <Image
                    src={isFollowing ? StarIcon2 : StarIcon}
                    alt="rating"
                    width={18}
                    height={18}
                  />
                  <span className="font-medium">
                    {isProcessing 
                      ? "..." 
                      : isFollowing === true 
                        ? "Following" 
                        : "Follow"
                    }
                  </span>
                </button>
        </>
        )}
      </div>
    </div>
  );
};

export default CreatorByIdNav;
