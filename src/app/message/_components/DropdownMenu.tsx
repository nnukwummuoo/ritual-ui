"use client";
import React, { useState, useRef, useEffect } from "react";
import { Ellipsis } from 'lucide-react';
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { toast } from "material-react-toastify";
import { URL as API_URL } from "@/api/config";
import axios from "axios";

const DropdownMenu = () => {
  const [opening, setOpening] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { creatorid } = useParams<{ creatorid: string }>();
  const router = useRouter();
  const userid = useSelector((state: RootState) => state.register.userID);

  const toggleoption = () => {
    setOpening(!opening);
  };

  const handleBlockUser = async () => {
    if (!userid || !creatorid) {
      toast.error("Unable to block user. Please try again.");
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
            return data?.refreshtoken || data?.accesstoken;
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

      const targetUserId = decodeURIComponent(creatorid);

      const response = await axios.post(`${API_URL}/block/block`, {
        blockerId: userid,
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
        toast.error(response.data.message || "Failed to block user");
      }

    } catch (error: unknown) {
      console.error("Error blocking user:", error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
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

  return (
    <div ref={dropdownRef}>
      <div className="relative inline-block text-left">
        <button onClick={toggleoption} className="px-2">
        <Ellipsis />
        </button>

        {opening && (
          <div
            className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-gray-800 border border-gray-700 focus:outline-none z-50"
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
