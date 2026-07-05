"use client";
import React, { useState, useRef, useEffect } from "react";
import { Ellipsis, Video } from 'lucide-react';
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { toast } from "react-toastify";
import { URL as API_URL } from "@/api/config";
import axios from "axios";

interface DropdownMenuProps {
  creator_portfolio_id?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ creator_portfolio_id: propCreatorId }) => {
  const [opening, setOpening] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const params = useParams<{ creator_portfolio_id: string }>();
  const creator_portfolio_id = propCreatorId || params?.creator_portfolio_id;
  const router = useRouter();
  const userid = useSelector((state: RootState) => state.register.userID);

  // Try multiple sources for user ID
  const profileUserId = useSelector((state: RootState) => state.profile?.userId || state.profile?.creator_portfolio_id);

  // Get userid from localStorage if not in Redux (same pattern as Chat component)
  const [localUserid, setLocalUserid] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);

          // Set user ID if not in Redux - check multiple possible keys like post.tsx
          if (!userid) {
            const userId = data?.userID || data?.userid || data?.id;
            if (userId) {
              setLocalUserid(userId);
            }
          }
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, [userid]);

  const loggedInUserId = userid || profileUserId || localUserid;

  const toggleoption = () => {
    setOpening(!opening);
  };

  const handleBlockUser = async () => {
    // Add confirmation toast
    const confirmed = await new Promise<boolean>((resolve) => {
      toast.info(
        <div className="flex flex-col gap-3 bg-blue-900 p-4 rounded-lg">
          <div className="text-white">
            Are you sure you want to block this user? This action cannot be undone and you will no longer be able to message them.
          </div>
          <div className="flex gap-2 justify-end">
            <button
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              onClick={() => {
                toast.dismiss();
                resolve(true);
              }}
            >
              Block User
            </button>
            <button
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              onClick={() => {
                toast.dismiss();
                resolve(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          className: "toast-confirmation"
        }
      );
    });

    if (!confirmed) {
      return;
    }

    console.log("🔍 [BLOCK] Debug info:");
    console.log("🔍 [BLOCK] loggedInUserId:", loggedInUserId);
    console.log("🔍 [BLOCK] creator_portfolio_id from params:", creator_portfolio_id);
    console.log("🔍 [BLOCK] Redux userid:", userid);
    console.log("🔍 [BLOCK] Profile userid:", profileUserId);
    console.log("🔍 [BLOCK] Local userid:", localUserid);

    // Debug localStorage content
    try {
      const raw = localStorage.getItem("login");
      console.log("🔍 [BLOCK] Raw localStorage data:", raw);
      if (raw) {
        const data = JSON.parse(raw);
        console.log("🔍 [BLOCK] Parsed localStorage data:", data);
        console.log("🔍 [BLOCK] localStorage keys:", Object.keys(data));
      } else {
        console.log("🔍 [BLOCK] No 'login' key found in localStorage");
      }

      // Check all localStorage keys
      console.log("🔍 [BLOCK] All localStorage keys:", Object.keys(localStorage));
    } catch (error) {
      console.error("🔍 [BLOCK] Error reading localStorage:", error);
    }

    // If still no user ID, try to get it from token or other sources
    let finalUserId = loggedInUserId;

    if (!finalUserId) {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          // Try to extract user ID from token (JWT payload)
          const token = data?.accesstoken || data?.refreshtoken;
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              finalUserId = payload?.userID || payload?.userid || payload?.id || payload?.sub;
              console.log("🔍 [BLOCK] UserID from token payload:", finalUserId);
            } catch (tokenError) {
              console.log("🔍 [BLOCK] Could not parse token:", tokenError);
            }
          }
        }
      } catch (error) {
        console.error("🔍 [BLOCK] Error extracting user ID from token:", error);
      }
    }

    if (!finalUserId || !creator_portfolio_id) {
      console.error("❌ [BLOCK] Missing required IDs:", { finalUserId, creator_portfolio_id });
      toast.error("Unable to block user. Please log in and try again.");
      return;
    }

    if (blocking) return;

    setBlocking(true);

    try {
      const token = (() => {
        try {
          const raw = localStorage.getItem("login");
          if (raw) {
            const data = JSON.parse(raw);
            return data?.accesstoken || data?.refreshtoken;
          }
        } catch (error) {
          console.error("[BlockUser] Error retrieving token from localStorage:", error);
        }
        return "";
      })();

      if (!token) {
        toast.error("Please log in to block users");
        return;
      }

      const targetUserId = decodeURIComponent(creator_portfolio_id);
      console.log("🔍 [BLOCK] targetUserId after decode:", targetUserId);
      console.log("🔍 [BLOCK] Original creator_portfolio_id:", creator_portfolio_id);
      console.log("🔍 [BLOCK] Decoded targetUserId length:", targetUserId.length);
      console.log("🔍 [BLOCK] Original creator_portfolio_id length:", creator_portfolio_id.length);

      if (!targetUserId || targetUserId === 'undefined' || targetUserId === 'null' || targetUserId.length < 10) {
        console.error("❌ [BLOCK] Invalid targetUserId:", targetUserId);
        toast.error("Invalid user to block");
        return;
      }

      const response = await axios.post(`${API_URL}/block/block`, {
        blockerId: finalUserId,
        blockedUserId: targetUserId,
        reason: "Blocked from chat"
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.data.ok) {
        toast.success("User blocked successfully");
        // Redirect to messages page
        router.push("/message");
      } else {
        // Handle specific error cases
        if (response.status === 409) {
          toast.info("User is already blocked");
          // Still redirect since user is already blocked
          router.push("/message");
        } else {
          toast.error(response.data.message || "Failed to block user");
        }
      }

    } catch (error: unknown) {
      console.error("Error blocking user:", error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string }; status?: number } };

        // Handle 409 - User already blocked
        if (axiosError.response?.status === 409) {
          toast.info("User is already blocked");
          // Still redirect since user is already blocked
          router.push("/message");
        } else if (axiosError.response?.data?.message) {
          toast.error(axiosError.response.data.message);
        } else {
          toast.error("Failed to block user. Please try again.");
        }
      } else {
        toast.error("Failed to block user. Please try again.");
      }
    } finally {
      setBlocking(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpening(false);
      }
    };

    if (opening) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [opening]);

  // Get viewing profile data to check hosttype
  const viewingProfile = useSelector((state: RootState) => state.viewingProfile);
  const hosttype = viewingProfile?.hosttype || "";
  const profileLoaded = viewingProfile?.status === "succeeded";
  const creatorPortfolioId = viewingProfile?.creator_portfolio_id || "";

  // Check if user has fan call hosttype (case insensitive) - only after profile is loaded
  const hasFanCall = profileLoaded && hosttype.toLowerCase().includes("fan call");

  const handleVideoCallClick = () => {
    console.log("🎥 [VIDEO_CALL] Clicked video call button");
    console.log("🎥 [VIDEO_CALL] Creator Portfolio ID:", creatorPortfolioId);
    console.log("🎥 [VIDEO_CALL] Has creator portfolio:", !!creatorPortfolioId);

    if (creatorPortfolioId) {
      const targetUrl = `/creators/${creatorPortfolioId}`;
      console.log("🎥 [VIDEO_CALL] Navigating to:", targetUrl);
      router.push(targetUrl);
    } else {
      console.error("❌ [VIDEO_CALL] No creator portfolio ID available");
      toast.error("Creator portfolio not found");
    }
  };

  return (
    <div ref={dropdownRef} className="flex items-center gap-2">
      {/* Video Call Icon - only show if user has fan call hosttype */}
      {hasFanCall && (
        <button
          onClick={handleVideoCallClick}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          title="Start Call"
        >
          <Video className="w-5 h-5 text-gray-300" />
        </button>
      )}

      <div className="relative inline-block text-left">
        <button onClick={toggleoption} className="px-2">
          <Ellipsis className="rotate-90" />
        </button>

        {opening && (
          <div
            className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-[#111624] border border-gray-700 focus:outline-none z-50"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
          >
            <div className="py-1" role="none">
              <button
                className="text-gray-300 block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                role="menuitem"
                disabled={blocking}
                onClick={async () => {
                  setOpening(false);
                  await handleBlockUser();
                }}
              >
                {blocking ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    Blocking...
                  </div>
                ) : (
                  "Block User"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownMenu;
