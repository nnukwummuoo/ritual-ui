import React, { useState } from "react";
import { useCall } from "@/lib/context/callContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { toast } from "material-react-toastify";
import { URL as API_URL } from "@/api/config";
import axios from "axios";
// import { useCall } from "../../views/messageview/context";

interface DropdownMenuProps {
  userId?: string;
  isOwnProfile?: boolean;
}

const DropdownMenu = ({ userId, isOwnProfile = false }: DropdownMenuProps) => {
  const { toggleoption, opening } = useCall();
  const router = useRouter();
  const [blocking, setBlocking] = useState(false);
  
  const userid = useSelector((state: RootState) => state.register.userID);
  const profileUserId = useSelector((state: RootState) => state.profile?.userId || state.profile?.creatorID);
  
  // Get userid from localStorage if not in Redux
  const [localUserid, setLocalUserid] = React.useState("");
  
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          
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

  const handleAboutPage = () => {
    if (userId) {
      router.push(`/Profile/${userId}/about`);
    }
    toggleoption();
  };

  const handleBlockUser = async () => {
    // Don't allow blocking own profile
    if (isOwnProfile) {
      toast.error("You cannot block yourself");
      return;
    }

    // Add confirmation toast
    const confirmed = await new Promise<boolean>((resolve) => {
      toast.info(
        <div className="flex flex-col gap-3 bg-blue-900 p-4 rounded-lg">
          <div className="text-white">
            Are you sure you want to block this user? This action cannot be undone and you will no longer be able to see their posts, comments, or message them.
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

    if (!loggedInUserId || !userId) {
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

      const response = await axios.post(`${API_URL}/block/block`, {
        blockerId: loggedInUserId,
        blockedUserId: userId,
        reason: "Blocked from profile"
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.data.ok) {
        toast.success("User blocked successfully");
        // Redirect to home page
        router.push("/");
      } else {
        if (response.status === 409) {
          toast.info("User is already blocked");
          router.push("/");
        } else {
          toast.error(response.data.message || "Failed to block user");
        }
      }

    } catch (error: unknown) {
      console.error("Error blocking user:", error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
        
        if (axiosError.response?.status === 409) {
          toast.info("User is already blocked");
          router.push("/");
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

  return (
    <div>
      <div className="relative inline-block text-left">
        <button onClick={toggleoption} className="px-2">
          <Image alt="options" src={"/icons/menu.svg"} width={20} height={20} />
        </button>

        {opening && (
          <div
            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-gray-600 ring-opacity-5 focus:outline-none z-50"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
          >
            <div className="py-1" role="none">
              <button
                onClick={handleAboutPage}
                className="text-white block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                role="menuitem"
              >
                About this Page
              </button>
              
              {!isOwnProfile && (
                <button
                  className="text-red-400 block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  role="menuitem"
                  disabled={blocking}
                  onClick={async () => {
                    toggleoption();
                    await handleBlockUser();
                  }}
                >
                  {blocking ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      Blocking...
                    </div>
                  ) : (
                    "Block User"
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownMenu;
