/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { getmessagenotication, getmsgnitify } from "@/store/messageSlice";
import { getViewingProfile } from "@/store/viewingProfile";
import type { RootState } from "@/store/store";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { getSocket, joinUserRoom, leaveUserRoom, onUserOnline, onUserOffline, removeTypingListeners } from "@/lib/socket";
import { useOnlineStatus } from "@/contexts/OnlineStatusContext";
import VIPBadge from "@/components/VIPBadge";
import { getImageSource } from "@/lib/imageUtils";

interface MessageItem {
  fromid: string;
  toid: string;
  content: string;
  date: string;
  name: string;
  firstname?: string;
  lastname?: string;
  photolink: string;
  messagecount?: number;
  unreadCount?: number;
  unread?: boolean;
  value?: string;
  online?: boolean;
  isVip?: boolean;
  vipStartDate?: string;
  vipEndDate?: string;
}

export const MessageList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const reduxUserid = useSelector((state: RootState) => state.register.userID);
  const reduxIsLoggedIn = useSelector((state: RootState) => state.register.logedin);
  const recentmsg = useSelector((state: RootState) => state.message.recentmsg);
  const msgnotifystatus = useSelector((state: RootState) => state.message.msgnotifystatus);
  const mymessagenotifystatus = useSelector((state: RootState) => state.message.mymessagenotifystatus);
  const [loading, setLoading] = useState(true);
  const [profilePictures, setProfilePictures] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  
  // Use global online status context
  const { isUserOnline } = useOnlineStatus();

  // Get userid from localStorage if not in Redux (same pattern as Chat.tsx)
  const [localUserid, setLocalUserid] = React.useState("");
  const [localIsLoggedIn, setLocalIsLoggedIn] = React.useState(false);
  
  const userid = reduxUserid || localUserid;
  const isLoggedIn = reduxIsLoggedIn || localIsLoggedIn;


  // Load userid from localStorage if not in Redux (same pattern as Chat.tsx)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          
          // Set user ID if not in Redux
          if (!reduxUserid && data?.userID) {
            setLocalUserid(data.userID);
            setLocalIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error("[MESSAGE_LIST] Error retrieving data from localStorage:", error);
      }
    }
  }, [reduxUserid]);

  // Socket event listeners for online status
  React.useEffect(() => {
    if (userid && isLoggedIn) {
      // Join user room for online status
      joinUserRoom(userid);

      // Cleanup on unmount
      return () => {
        leaveUserRoom(userid);
        removeTypingListeners();
      };
    }
  }, [userid, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !userid) {
      return;
    }
    // @ts-expect-error - Redux dispatch type issue
    dispatch(getmessagenotication({ userid }));
    // @ts-expect-error - Redux dispatch type issue  
    dispatch(getmsgnitify({ userid }));
  }, [isLoggedIn, userid, dispatch]);

  useEffect(() => {
    if (msgnotifystatus === "succeeded" || msgnotifystatus === "failed") {
      setLoading(false);
    }
  }, [msgnotifystatus, mymessagenotifystatus, recentmsg]);

  // Socket connection for real-time updates
  useEffect(() => {
    if (!isLoggedIn || !userid) {
      return;
    }

    const socket = getSocket();
    if (!socket) {
      return;
    }

    // Connect user to socket
    socket.emit("online", userid);

    // Listen for new messages to update unread counts
    const handleLiveChat = (data: { 
      data: { 
        fromid: string; 
        toid: string; 
        content: string; 
        date: string; 
        coin: boolean; 
        files?: string[]; 
        fileCount?: number; 
      }; 
      name: string; 
      photolink: string; 
    }) => {
      // Check if this message is for the current user
      if (data.data.toid === userid) {
        
        // Refresh the message list to get updated unread counts
        // @ts-expect-error - Redux dispatch type issue
        dispatch(getmsgnitify({ userid }));
      }
    };

    // Listen for follow updates (when someone follows/unfollows)
    const handleFollowUpdate = () => {
      // Refresh message list when follow status changes
      // @ts-expect-error - Redux dispatch type issue
      dispatch(getmsgnitify({ userid }));
    };

    socket.on("LiveChat", handleLiveChat);
    socket.on("follow_update", handleFollowUpdate);

    return () => {
      socket.off("LiveChat", handleLiveChat);
      socket.off("follow_update", handleFollowUpdate);
    };
  }, [isLoggedIn, userid, dispatch]);

  // Periodic refresh to ensure unread counts stay updated
  useEffect(() => {
    if (!isLoggedIn || !userid) {
      return;
    }

    const refreshInterval = setInterval(() => {
      // @ts-expect-error - Redux dispatch type issue
      dispatch(getmsgnitify({ userid }));
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [isLoggedIn, userid, dispatch]);

  // Fetch profile picture for a specific user (same pattern as Chat component)
  const fetchUserProfilePicture = React.useCallback(async (userId: string) => {
    if (profilePictures[userId]) {
      return; // Already fetched
    }

    try {
      const token = (() => {
        try {
          const raw = localStorage.getItem("login");
          if (raw) {
            const data = JSON.parse(raw);
            return data?.refreshtoken || data?.accesstoken;
          }
        } catch (error) {
          console.error("[MessageList] Error retrieving token from localStorage:", error);
        }
        return "";
      })();

      if (!token) {
        return;
      }

      // @ts-expect-error - Redux dispatch type issue
      dispatch(getViewingProfile({ userid: userId, token }));
    } catch (error) {
      console.error("❌ [MESSAGE_LIST] Error fetching profile picture:", error);
    }
  }, [profilePictures, dispatch]);

  // Fetch profile pictures for all users in recent messages
  useEffect(() => {
    if (recentmsg && recentmsg.length > 0) {
      recentmsg.forEach((message: MessageItem) => {
        // Get the other user ID (not the current user)
        const otherUserId = message.fromid === userid ? message.toid : message.fromid;
        fetchUserProfilePicture(otherUserId);
      });
    }
  }, [recentmsg, userid, fetchUserProfilePicture]);

  // Listen for viewingProfile updates and store profile pictures
  const viewingProfile = useSelector((state: RootState) => state.viewingProfile);
  
  useEffect(() => {
    if (viewingProfile.status === "succeeded" && viewingProfile.userId) {
      if (viewingProfile.photolink && viewingProfile.photolink.trim() !== "" && viewingProfile.photolink !== "null" && viewingProfile.photolink !== "undefined") {
        setProfilePictures(prev => ({
          ...prev,
          [viewingProfile.userId]: viewingProfile.photolink
        }));
      }
    }
  }, [viewingProfile]);

  const formatTime = (dateString: string) => {
    const date = new Date(Number(dateString));
    const now = new Date();
    const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
    const diffInMinutes = diffInSeconds / 60;
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;
    
    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      // For older messages, show the actual date
      return date.toLocaleDateString();
    }
  };

  // Generate random background color for user initials
  const getRandomColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-amber-500'
    ];
    
    // Use name to generate consistent color for same user
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Get user initials from name
  const getUserInitials = (name: string) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0).toUpperCase()}${names[names.length - 1].charAt(0).toUpperCase()}`;
    } else {
      return names[0].charAt(0).toUpperCase();
    }
  };

  const handleMessageClick = (fromid: string, toid: string) => {
    // Use only the target user ID (the other person in the conversation)
    // If current user is the sender, use the recipient ID
    // If current user is the recipient, use the sender ID
    const targetUserId = fromid === userid ? toid : fromid;
    router.push(`/message/${targetUserId}`);
  };

  // Filter and sort messages based on search query and VIP priority
  const filteredAndSortedMessages = React.useMemo(() => {
    if (!recentmsg) return [];
    
    // First filter based on search query
    const filtered = recentmsg.filter((message: MessageItem) => {
      if (!searchQuery.trim()) return true;
      
      const searchLower = searchQuery.toLowerCase();
      const fullName = message.firstname && message.lastname ? `${message.firstname} ${message.lastname}`.trim() : message.name;
      const nameMatch = fullName.toLowerCase().includes(searchLower);
      const firstNameMatch = message.firstname?.toLowerCase().includes(searchLower) || false;
      const lastNameMatch = message.lastname?.toLowerCase().includes(searchLower) || false;
      const contentMatch = message.content.toLowerCase().includes(searchLower);
      
      return nameMatch || firstNameMatch || lastNameMatch || contentMatch;
    });

    // Then sort: VIP users with unread messages first, then by date
    return filtered.sort((a: MessageItem, b: MessageItem) => {
      // Check if user has unread messages
      const aUnreadCount = a.messagecount || a.unreadCount || 0;
      const aHasUnread = a.unread || aUnreadCount > 0;
      const bUnreadCount = b.messagecount || b.unreadCount || 0;
      const bHasUnread = b.unread || bUnreadCount > 0;

      // Priority 1: VIP users with unread messages
      if (a.isVip && aHasUnread && !(b.isVip && bHasUnread)) {
        return -1;
      }
      if (b.isVip && bHasUnread && !(a.isVip && aHasUnread)) {
        return 1;
      }

      // Priority 2: Non-VIP users with unread messages
      if (aHasUnread && !bHasUnread && !a.isVip) {
        return -1;
      }
      if (bHasUnread && !aHasUnread && !b.isVip) {
        return 1;
      }

      // Priority 3: Sort by date (most recent first)
      const aDate = new Date(Number(a.date)).getTime();
      const bDate = new Date(Number(b.date)).getTime();
      return bDate - aDate;
    });
  }, [recentmsg, searchQuery]);

  if (!isLoggedIn || !userid) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-400 text-center">Please log in to view messages</p>
        <p className="text-sm text-gray-500 text-center mt-1">
          Authentication required
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-sm text-gray-400 mt-2">Loading messages...</p>
      </div>
    );
  }

  if (!recentmsg || recentmsg.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-400 text-center">No messages yet</p>
        <p className="text-sm text-gray-500 text-center mt-1">
          Start a conversation with someone
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="Search by name or message..."
          />
        </div>
      </div>

      {/* Messages List */}
      {filteredAndSortedMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <MessageCircle className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-gray-400 text-center">No messages found</p>
          <p className="text-sm text-gray-500 text-center mt-1">
            Try adjusting your search terms
          </p>
        </div>
      ) : (
        filteredAndSortedMessages.map((message: MessageItem, index: number) => {
        // Get the other user ID and their profile picture
        const otherUserId = message.fromid === userid ? message.toid : message.fromid;
        const userProfilePicture = profilePictures[otherUserId];
        
        
        return (
        <div
          key={index}
          onClick={() => handleMessageClick(message.fromid, message.toid)}
          className="flex items-center gap-3 p-3 hover:bg-gray-800/50 rounded-lg cursor-pointer transition-colors"
        >
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
              {userProfilePicture && 
               userProfilePicture.trim() !== "" && 
               userProfilePicture !== "null" && 
               userProfilePicture !== "undefined" &&
               userProfilePicture !== null &&
               userProfilePicture !== undefined &&
               userProfilePicture.length > 0 ? (
                <Image
                  src={getImageSource(userProfilePicture, 'profile').src}
                  alt={message.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/icons/icons8-profile_user.png";
                  }}
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-white font-semibold ${getRandomColor(message.firstname && message.lastname ? `${message.firstname} ${message.lastname}`.trim() : message.name)}`}>
                  {getUserInitials(message.firstname && message.lastname ? `${message.firstname} ${message.lastname}`.trim() : message.name)}
                </div>
              )}
            </div>
            {/* Online indicator */}
            {isUserOnline(otherUserId) && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
            )}
            {/* VIP Badge */}
            {message.isVip && (
              <VIPBadge size="xl" className="absolute -top-5 -right-5" isVip={message.isVip} vipEndDate={message.vipEndDate} />
            )}
          </div>

          {/* Message content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white truncate">
                {message.firstname && message.lastname ? `${message.firstname} ${message.lastname}`.trim() : message.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-gray-400">
              
                <span>{formatTime(message.date)}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-300 truncate mt-1">
              {message.content}
            </p>
          </div>

          {/* Unread count or indicator */}
          {(() => {
            // Check for unread count in multiple possible fields
            const unreadCount = message.messagecount || message.unreadCount || 0;
            const hasUnread = message.unread || unreadCount > 0;
            
            
            // Show unread indicator based on actual data
            if (hasUnread && unreadCount > 0) {
              return (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                </div>
              );
            } else if (hasUnread) {
              // Show a small dot indicator for messages that are unread but don't have a count
              return (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              );
            }
            return null;
          })()}
        </div>
        );
        })
      )}
    </div>
  );
};
