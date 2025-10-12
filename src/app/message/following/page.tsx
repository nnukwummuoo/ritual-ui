/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { getfollow } from "@/store/profile";
import { loginAuthUser } from "@/store/registerSlice";
import { User } from "@/types/user";
import VIPBadge from "@/components/VIPBadge";
import { useRouter } from "next/navigation";

const FollowingMessagesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [toggle, setToggle] = useState(false);
  
  const userid = useSelector((s: RootState) => s.register.userID);
  const token = useSelector((s: RootState) => s.register.refreshtoken);
  const getfollow_stats = useSelector((s: RootState) => s.profile.getfollow_stats);
  const getfollow_data = useSelector((s: RootState) => s.profile.getfollow_data as any);
  const getfollow_error = useSelector((s: RootState) => s.profile.fllowmsg as string);

  // Logged-in user's name from profile slice
  const firstname = useSelector((s: RootState) => s.profile.firstname) || "";
  const lastname = useSelector((s: RootState) => s.profile.lastname) || "";

  // 1) Hydrate register slice from localStorage if empty (client-only)
  useEffect(() => {
    if (!userid && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw || "{}");
          if (data?.userID) {
            dispatch(
              loginAuthUser({
                email: data.email || "",
                password: data.password || "",
                message: "restored",
                refreshtoken: data.refreshtoken || "",
                accesstoken: data.accesstoken || "",
                userID: data.userID || "",
                creator_portfolio_id: data.creator_portfolio_id,
                creator_portfolio: data.creator_portfolio,
              })
            );
          }
        }
      } catch {}
    }
  }, [userid, dispatch]);

  useEffect(() => {
    // Get token from localStorage if not in Redux state
    let authToken = token;
    let currentUserid = userid;
    
    if (!authToken && typeof window !== 'undefined') {
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
    
    // Get userid from localStorage if not in Redux
    if (!currentUserid && typeof window !== 'undefined') {
      try {
        const loginData = localStorage.getItem('login');
        if (loginData) {
          const parsedData = JSON.parse(loginData);
          currentUserid = parsedData.userID || parsedData.userid || parsedData.id;
        }
      } catch (error) {
        // Silent fail
      }
    }

    if (currentUserid && authToken) {
      dispatch(getfollow({ userid: currentUserid, token: authToken }));
    }
  }, [userid, token, dispatch]);

  // Get current userid from multiple sources (same logic as useEffect)
  let currentUserid = userid;
  if (!currentUserid && typeof window !== 'undefined') {
    try {
      const loginData = localStorage.getItem('login');
      if (loginData) {
        const parsedData = JSON.parse(loginData);
        currentUserid = parsedData.userID || parsedData.userid || parsedData.id;
      }
    } catch (error) {
      // Silent fail
    }
  }
  
  
  // Get following users from API response and filter out current user
  const apiFollowing: User[] = (getfollow_data?.following as User[])?.filter(user => {
    const isNotCurrentUser = String(user.id) !== String(currentUserid);
    return isNotCurrentUser;
  }) || [];

  // Filter following users based on search
  const filteredFollowing = apiFollowing.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) && 
    String(user.id) !== String(currentUserid)
  );

  const handleMessageClick = (userId: string) => {
    router.push(`/message/${userId}`);
  };

  const handleProfileClick = (userId: string) => {
    router.push(`/Profile/${userId}`);
  };

  const loading = getfollow_stats === "loading";
  
  // Add timeout to prevent infinite loading
  React.useEffect(() => {
    if (getfollow_stats === "loading") {
      const timeout = setTimeout(() => {
        if (currentUserid && token) {
          dispatch(getfollow({ userid: currentUserid, token }));
        }
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [getfollow_stats, currentUserid, token, dispatch]);

  // Fallback: If loading takes too long, show empty state
  const [showFallback, setShowFallback] = React.useState(false);
  React.useEffect(() => {
    if (getfollow_stats === "loading") {
      const fallbackTimeout = setTimeout(() => {
        setShowFallback(true);
      }, 15000); // 15 second fallback
      
      return () => clearTimeout(fallbackTimeout);
    } else {
      setShowFallback(false);
    }
  }, [getfollow_stats]);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#0e0f2a] text-white">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-blue-700/50 rounded-full transition-colors"
            >
              <FaAngleLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Message Following</h1>
          </div>
          <FiSearch
            color="white"
            size={24}
            onClick={() => setToggle((v) => !v)}
            className="cursor-pointer"
          />
        </div>
      </div>

      {/* Search bar */}
      <div className="w-full px-4 mb-4 min-h-[56px] flex items-center">
        <div className={toggle ? "w-full" : "w-full invisible"}>
          <input
            type="text"
            placeholder="Search following..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Error banner */}
      {getfollow_stats === "failed" && (
        <div className="mx-4 mb-3 rounded border border-red-500 bg-red-900/30 text-red-300 p-3 flex items-start justify-between gap-3">
          <div className="text-sm">
            {getfollow_error || "Failed to load following. Please try again."}
          </div>
          <button
            onClick={() => currentUserid && token && dispatch(getfollow({ userid: currentUserid, token }))}
            className="shrink-0 px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-500"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4">
        {loading && !showFallback ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-white mb-4">
              {filteredFollowing.length} Following
            </h2>
            
            {filteredFollowing.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">
                  {search ? "No matching users found." : 
                   showFallback ? "Unable to load following users. Please try again." :
                   "You're not following anyone yet."}
                </p>
                {!search && (
                  <div className="space-y-2">
                    <button
                      onClick={() => router.push('/following')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mr-2"
                    >
                      Discover Users
                    </button>
                    {showFallback && (
                      <button
                        onClick={() => {
                          setShowFallback(false);
                          if (currentUserid && token) {
                            dispatch(getfollow({ userid: currentUserid, token }));
                          }
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Retry Loading
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              {filteredFollowing.map((user, index) => {
                const hasImage = Boolean(user.image && user.image.trim());
                const initials = (() => {
                  const parts = (user.name || "").trim().split(/\s+/);
                  const first = parts[0]?.[0] ?? "";
                  const second = parts[1]?.[0] ?? "";
                  return (first + second).toUpperCase() || "?";
                })();

                return (
                  <div
                    key={`following_${index}_${user.id}`}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-800/30 transition-colors"
                  >
                    {/* Profile Picture */}
                    <div 
                      className="relative cursor-pointer"
                      onClick={() => handleProfileClick(user.id)}
                    >
                      {hasImage ? (
                        <img
                          src={user.image}
                          alt={user.name}
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
                      
                      {/* VIP Badge */}
                      <VIPBadge 
                        size="xl" 
                        className="absolute -top-2 -right-2" 
                        isVip={user.isVip || false} 
                        vipEndDate={user.vipEndDate} 
                      />
                    </div>

                    {/* User Info */}
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => handleProfileClick(user.id)}
                    >
                      <div className="text-white font-semibold">{user.name}</div>
                      <div className="text-gray-400 text-sm">Following</div>
                    </div>

                    {/* Message Button */}
                    <button
                      onClick={() => handleMessageClick(user.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium transition-colors"
                    >
                      Message
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FollowingMessagesPage;
