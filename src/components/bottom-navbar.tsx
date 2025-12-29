"use client";
import React, { ReactNode, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navapp from "@/navs/NavApp";
import MenuProvider from "@/lib/context/MenuContext";
import OpenMobileMenuBtn from "./OpenMobileMenuBtn";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { getmsgnitify, getmessagenotication } from "@/store/messageSlice";
import { getNotifications } from "@/store/profile";
import { getSocket } from "@/lib/socket";
import { useNotificationIndicator } from "@/hooks/useNotificationIndicator";
import { useState } from "react";

interface BottomNavBarItemProps {
  imgUrl?: string;
  route: string;
  icon?: ReactNode;
  name?: string;
  showUnreadIndicator?: boolean;
  unreadCount?: number;
  alwaysColored?: boolean;
}
export default function BottomNavBar() {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  // Get user data from Redux store
  const userid = useSelector((state: RootState) => state.register.userID);
  const token = useSelector((state: RootState) => state.register.refreshtoken);
  const msgnotifystatus = useSelector((state: RootState) => state.message.msgnotifystatus);
  const notifications_stats = useSelector((state: RootState) => state.profile.notifications_stats);

  // Get message data from Redux store
  const recentmsg = useSelector((state: RootState) => state.message.recentmsg);
  const msgnitocations = useSelector((state: RootState) => state.message.msgnitocations);
  const mymessagenotifystatus = useSelector((state: RootState) => state.message.mymessagenotifystatus);

  // Fallback to localStorage for user data (like other components do)
  const [localUserData, setLocalUserData] = React.useState<{ userid: string, token: string }>({ userid: '', token: '' });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          const localUserid = data?.userID || data?.userid || data?.id || '';
          const localToken = data?.refreshtoken || data?.accesstoken || '';

          if (localUserid && localToken) {
            setLocalUserData({ userid: localUserid, token: localToken });
          }
        }
      } catch {
        // Silent error handling
      }
    }
  }, []);

  // Use Redux data if available, otherwise use localStorage data
  const finalUserid = userid || localUserData.userid;
  const finalToken = token || localUserData.token;

  // Get notification indicator data
  const { hasUnread: hasUnreadNotifications, unreadCount: unreadNotificationCount } = useNotificationIndicator();

  // Glow animation state for Anya icon
  const [showGlow, setShowGlow] = useState(false);
  const [showAnyaBadge, setShowAnyaBadge] = useState(false);

  // Check if there's a new story created after user's last visit
  const checkForNewStory = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/api/ai-story/stories`);
      if (!response.ok) return false;

      const data = await response.json();
      if (!data.stories || data.stories.length === 0) return false;

      // Get the latest story (first in array, sorted by createdAt desc from backend)
      const latestStory = data.stories[0];

      if (!latestStory || !latestStory.createdAt) return false;

      const storyCreatedAt = new Date(latestStory.createdAt).getTime();

      // Check user's last visit timestamp
      if (typeof window !== 'undefined') {
        const lastVisitTimestamp = localStorage.getItem('anya_last_visit_timestamp');

        if (!lastVisitTimestamp) {
          // User has never visited - show badge
          return true;
        }

        const lastVisit = parseInt(lastVisitTimestamp, 10);

        // If story was created AFTER user's last visit, show badge
        if (storyCreatedAt > lastVisit) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking for new story:', error);
      return false;
    }
  };


  // Handle Anya icon click - save current timestamp
  const handleAnyaClick = () => {
    if (typeof window !== 'undefined') {
      const now = Date.now();
      localStorage.setItem('anya_last_visit_timestamp', now.toString());
      setShowGlow(false);
      setShowAnyaBadge(false);
    }
  };

  // Check for new stories on mount and periodically
  useEffect(() => {
    // Initial check
    checkForNewStory().then((hasNewStory) => {
      setShowAnyaBadge(hasNewStory);
    });

    // Check every 5 minutes for new stories
    const checkInterval = setInterval(() => {
      checkForNewStory().then((hasNewStory) => {
        setShowAnyaBadge(hasNewStory);
      });
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(checkInterval);
  }, []);

  // Trigger glow animation every 12 seconds (only if badge should be shown)
  useEffect(() => {
    if (!showAnyaBadge) return;

    // Initial glow trigger
    setShowGlow(true);
    setTimeout(() => setShowGlow(false), 3000);

    const glowInterval = setInterval(() => {
      if (showAnyaBadge) {
        setShowGlow(true);
        // Remove glow after 3 seconds
        setTimeout(() => setShowGlow(false), 3000);
      }
    }, 12000); // 12 seconds

    return () => clearInterval(glowInterval);
  }, [showAnyaBadge]);


  // Fetch message notifications when component mounts
  useEffect(() => {
    if (finalUserid && finalToken && msgnotifystatus === "idle") {
      dispatch(getmsgnitify({ userid: finalUserid, token: finalToken }));
    }
  }, [finalUserid, finalToken, msgnotifystatus, dispatch]);

  // Also fetch message notifications from the other endpoint
  useEffect(() => {
    if (finalUserid && finalToken && mymessagenotifystatus === "idle") {
      dispatch(getmessagenotication({ userid: finalUserid, token: finalToken }));
    }
  }, [finalUserid, finalToken, mymessagenotifystatus, dispatch]);

  // Also fetch messages when userid changes (e.g., after login)
  useEffect(() => {
    if (finalUserid && finalToken) {
      dispatch(getmsgnitify({ userid: finalUserid, token: finalToken }));
      dispatch(getmessagenotication({ userid: finalUserid, token: finalToken }));
    }
  }, [finalUserid, finalToken, dispatch]);

  // Fetch notifications when component mounts
  useEffect(() => {
    if (finalUserid && finalToken && notifications_stats === "idle") {
      dispatch(getNotifications({ userid: finalUserid, token: finalToken }));
    }
  }, [finalUserid, finalToken, notifications_stats, dispatch]);

  // Also fetch notifications when userid changes (e.g., after login)
  useEffect(() => {
    if (finalUserid && finalToken) {
      dispatch(getNotifications({ userid: finalUserid, token: finalToken }));
    }
  }, [finalUserid, finalToken, dispatch]);

  // Force fetch messages after a short delay to ensure user is logged in
  useEffect(() => {
    if (finalUserid && finalToken) {
      const timer = setTimeout(() => {
        dispatch(getmsgnitify({ userid: finalUserid, token: finalToken }));
        dispatch(getmessagenotication({ userid: finalUserid, token: finalToken }));
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [finalUserid, finalToken, dispatch]);

  // Socket integration for real-time message updates
  useEffect(() => {
    if (!finalUserid) return;

    // Try to get socket connection
    const socket = getSocket();
    if (!socket) {
      // Fallback: poll for updates every 10 seconds if socket is not available
      const intervalId = setInterval(() => {
        if (finalUserid && finalToken) {
          dispatch(getmsgnitify({ userid: finalUserid, token: finalToken }));
          dispatch(getmessagenotication({ userid: finalUserid, token: finalToken }));
        }
      }, 10000);

      return () => clearInterval(intervalId);
    }

    // Listen for new message events
    const handleNewMessage = () => {
      // Refresh message notifications from both endpoints
      if (finalUserid && finalToken) {
        dispatch(getmsgnitify({ userid: finalUserid, token: finalToken }));
        dispatch(getmessagenotication({ userid: finalUserid, token: finalToken }));
      }
    };

    // Listen for message read events
    const handleMessageRead = () => {
      // Refresh message notifications from both endpoints
      if (finalUserid && finalToken) {
        dispatch(getmsgnitify({ userid: finalUserid, token: finalToken }));
        dispatch(getmessagenotication({ userid: finalUserid, token: finalToken }));
      }
    };

    // Listen for message status updates
    const handleMessageStatusUpdate = () => {
      // Refresh message notifications from both endpoints
      if (finalUserid && finalToken) {
        dispatch(getmsgnitify({ userid: finalUserid, token: finalToken }));
        dispatch(getmessagenotication({ userid: finalUserid, token: finalToken }));
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_read', handleMessageRead);
    socket.on('message_status_update', handleMessageStatusUpdate);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_read', handleMessageRead);
      socket.off('message_status_update', handleMessageStatusUpdate);
    };
  }, [finalUserid, finalToken, dispatch]);

  // Calculate total unread messages - check both data sources
  const totalUnreadCount = React.useMemo(() => {
    let total = 0;

    // Check recentmsg first
    if (recentmsg && Array.isArray(recentmsg) && recentmsg.length > 0) {
      total += recentmsg.reduce((sum, message) => {
        const unreadCount = message.unreadCount || 0;
        if (unreadCount > 0) {
          return sum + unreadCount;
        }
        return sum;
      }, 0);
    }

    // Check msgnitocations as well
    if (msgnitocations && Array.isArray(msgnitocations) && msgnitocations.length > 0) {
      total += msgnitocations.reduce((sum, message) => {
        const unreadCount = message.messagecount || 0;
        if (unreadCount > 0) {
          return sum + unreadCount;
        }
        return sum;
      }, 0);
    }

    return total;
  }, [recentmsg, msgnitocations]);

  const routes: BottomNavBarItemProps[] = [
    {
      imgUrl: "/icons/icons8-home.png",
      route: "/",
      name: "Home"
    },
    // {
    //   imgUrl: "/icons/icons8-search-2.png",
    //   route: "/",
    //   name: "Search"
    // },
    {
      imgUrl: "/icons/icons8-notification-1.png",
      route: "/notifications",
      name: "Notifications",
      showUnreadIndicator: hasUnreadNotifications,
      unreadCount: unreadNotificationCount
    },
    {
      imgUrl: "/Anya.png",
      route: "/anya",
      name: "Anya",
      alwaysColored: true,
    },
    {
      imgUrl: "/icons/icons8-message.png",
      route: "/message",
      name: "Messages",
      showUnreadIndicator: totalUnreadCount > 0,
      unreadCount: totalUnreadCount
    },
    // {
    //   route: "/",
    //   icon: <FaThLarge className="w-8 h-8 text-gray-500" />,
    // },
  ];
  return (
    <MenuProvider>
      <div className=" h-fit  mr-6 mt-4 max-[600px]:m-0  fixed right-0 max-[600px]:bottom-1 max-[600px]:w-full z-50">
        <div className="w-[25rem]  mx-auto max-[600px]:w-[90%] rounded-2xl px-4 pt-4 pb-2 bg-gray-900 flex justify-between max-[500px]:w-[93%] bottom-4">
          {routes.map((item, i) => {
            const isAnyaIcon = item.name === "Anya";

            const handleClick = () => {
              // Save current path before navigating to Anya
              if (isAnyaIcon && typeof window !== 'undefined') {
                const currentPath = window.location.pathname;
                sessionStorage.setItem('anya_previous_path', currentPath);
                console.log('💾 Saved previous path before going to Anya:', currentPath);
              }

              // Call Anya-specific handler if it's the Anya icon
              if (isAnyaIcon) {
                handleAnyaClick();
              }
            };

            return (
              <Link
                key={i}
                href={item.route}
                onClick={handleClick}
                className={`w-12 -ml-2 flex flex-col items-center group hover:scale-110 transition-all duration-500 relative ${isAnyaIcon && showGlow ? 'scale-110' : ''}`}
              >
                {item.icon ? (
                  <div className="">{item.icon}</div>
                ) : (
                  <div className="relative">
                    {/* Glow effect for Anya icon */}
                    {isAnyaIcon && showGlow && showAnyaBadge && (
                      <div className="absolute inset-0 -bottom-2 animate-pulse">
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/70 via-pink-500/50 to-transparent rounded-full blur-xl"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-400/50 via-pink-400/30 to-transparent rounded-full blur-lg animate-ping"></div>
                      </div>
                    )}

                    <Image
                      src={item.imgUrl || ""}
                      className={`size-10 relative z-10 ${item.alwaysColored ? "grayscale-0" : `grayscale ${pathname === item.route ? "grayscale-0" : ""}`}`}
                      alt={item.name || "icon"}
                      width={24}
                      height={24}
                    />

                    {/* New Feature Badge for Anya - only show if not in cooldown */}
                    {isAnyaIcon && showAnyaBadge && (
                      <div className="absolute -top-8 -right-2 z-20 animate-bounce">
                        <div className="relative">
                          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9px] font-bold px-2 py-1 rounded-full whitespace-nowrap shadow-lg">
                            ✨ NEW
                          </div>
                          {/* Arrow pointing down */}
                          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-pink-600"></div>
                        </div>
                      </div>
                    )}

                    {/* Unread indicator - only show when there are unread messages */}
                    {item.showUnreadIndicator && (
                      <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-white text-black text-xs rounded-full flex items-center justify-center font-semibold z-10">
                        {item.unreadCount && item.unreadCount > 9 ? (
                          <span className="flex items-center">
                            <span>9</span>
                            <span className="text-[10px] ">+</span>
                          </span>
                        ) : (
                          item.unreadCount || 0
                        )}
                      </div>
                    )}
                  </div>
                )}
                <p className={` group-hover:opacity-100 opacity-0 mt-1 ${pathname === item.route ? "text-white" : "text-gray-500 "} text-xs transition-all duration-300`}>{item.name}</p>
              </Link>
            );
          })}
          <div className="max-[600px]:-top-0 max-[600px]:fixed"><Navapp /></div>
          <div className="max-[600px]:block hidden"><OpenMobileMenuBtn /></div>
        </div>
      </div>
    </MenuProvider>

  );
}
