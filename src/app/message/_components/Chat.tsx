/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import PacmanLoader from "react-spinners/DotLoader";
import "@/styles/Navs.css";
import "@/styles/Chat.css";
import { useParams, useRouter } from "next/navigation";
import DropdownMenu from "./DropdownMenu";

// Removed Redux import - using direct API calls instead
import { getViewingProfile } from "@/store/viewingProfile";
import { checkVipStatus } from "@/store/vip";

import type { RootState } from "@/store/store";
import { getSocket, startTyping, stopTyping } from "@/lib/socket";
import { useOnlineStatus } from "@/contexts/OnlineStatusContext";
import { toast } from "material-react-toastify";
import { URL as API_URL } from "@/api/config";
import axios from "axios";
import Image from "next/image";
import { X, Paperclip, Send, File, Download } from "lucide-react";
import VIPBadge from "@/components/VIPBadge";
import { checkVipCelebration, markVipCelebrationViewed } from "@/api/vipCelebration";
import { getImageSource } from "@/lib/imageUtils";


export const Chat = () => {
  const msgListref = useRef<HTMLDivElement>(null);
  // const messagestatus = useSelector(
  //   (state) => state.message.currentmessagestatus
  // );
  // const giftstats = useSelector((state) => state.message.giftstats);
  // const giftmessage = useSelector((state) => state.message.giftmessage);
  // const oldMessage = useSelector((state) => state.message.listofcurrentmessage);
  // const chatinfo = useSelector((state) => state.message.chatinfo);
  // const creator_portfolio_id = useSelector((state) => state.profile.creator_portfolio_id);
  // const balance = useSelector((state) => state.profile.balance);
  // const creatorname = useSelector((state) => state.profile.creatorname);
  // const creatorphotolink = useSelector((state) => state.profile.creatorphotolink);
  // const profilephotolink = useSelector((state) => state.comprofile.photoLink);
  // const profilename = useSelector((state) => state.profile.firstname);
  const dispatch = useDispatch();

  const params = useParams<{ creator_portfolio_id: string }>();
  const creator_portfolio_id = params?.creator_portfolio_id;
  
  // Fallback: Extract user ID from URL pathname if params fail
  const [fallbackUserId, setFallbackUserId] = React.useState<string>("");
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const pathSegments = pathname.split('/');
      const messageIndex = pathSegments.indexOf('message');
      
      if (messageIndex !== -1 && pathSegments[messageIndex + 1]) {
        const extractedUserId = pathSegments[messageIndex + 1];
        setFallbackUserId(extractedUserId);
      }
    }
  }, []);
  
  // Use fallback if params are not available
  const finalCreatorPortfolioId = creator_portfolio_id || fallbackUserId;
  

  const router = useRouter();

  // Get userid from localStorage if not in Redux (same pattern as ProfilePage)
  const [localUserid, setLocalUserid] = React.useState("");
  
  const reduxUserId = useSelector((state: RootState) => state.register.userID);
  
  const loggedInUserId = reduxUserId || localUserid;


  const [chatphotolink, setchatphotolink] = useState("");
  const [chatusername, setchatusername] = useState("");
  const [chatfirstname, setfirstname] = useState("");
  const [chatlastname, setlastname] = useState("");
  

  const [Chatphoto, set_Chatphoto] = useState("/icons/icons8-profile_user.png");
  const [ChatphotoError, setChatphotoError] = useState(false);

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

  // File modal state
  const [selectedFileModal, setSelectedFileModal] = useState<{
    fileUrl: string;
    fileName?: string;
    type: string;
  } | null>(null);

  // File preview component with skeleton loading (same as QuickChatConversation)
  const FilePreview = ({ fileUrl, fileName }: { fileUrl: string; fileName?: string }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    
    // Auto-timeout to prevent infinite loading
    React.useEffect(() => {
      const timeout = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
        }
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timeout);
    }, [isLoading, fileUrl]);
    
    
    // Determine file type based on file extension or URL pattern
    const getFileType = (url: string, name?: string) => {
      const fileName = name || url;
      const extension = fileName.split('.').pop()?.toLowerCase();
      
      // Check for common image extensions
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
      if (imageExtensions.includes(extension || '')) {
        return 'image';
      }
      
      // Check for common video extensions
      const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
      if (videoExtensions.includes(extension || '')) {
        return 'video';
      }
      
      // Check for common document extensions
      const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
      if (documentExtensions.includes(extension || '')) {
        return 'document';
      }
      
      // If no extension or unknown, try to determine from URL pattern
      if (url.includes('image') || url.includes('photo') || url.includes('img')) {
        return 'image';
      }
      if (url.includes('video') || url.includes('movie') || url.includes('vid')) {
        return 'video';
      }
      
      // Default to image for unknown types (most file uploads are images)
      return 'image';
    };
    
    const fileType = getFileType(fileUrl, fileName);
    const isImage = fileType === 'image';
    const isVideo = fileType === 'video';
    const isDocument = fileType === 'document';
    
    
    // Use bucket detection for Storj URLs
    const imageSource = getImageSource(fileUrl, 'message');
    const fullUrl = imageSource.src;
    
    // Keep fallback URLs for error handling
    const pathUrlPrimary = fileUrl ? `${API_URL}/api/image/view/${encodeURIComponent(fileUrl)}` : "";
    const queryUrlFallback = fileUrl ? `https://mmekoapi.onrender.com/api/image/view?publicId=${encodeURIComponent(fileUrl)}` : "";
    const pathUrlFallback = fileUrl ? `https://mmekoapi.onrender.com/api/image/view/${encodeURIComponent(fileUrl)}` : "";
    
    
    const handleLoad = () => {
      setIsLoading(false);
    };
    
    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };
    
    if (hasError) {
      return (
        <div className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg">
          <File className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm text-gray-300">Failed to load file</p>
            <p className="text-xs text-gray-500">{fileName || 'Unknown file'}</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {isImage && (
          <div className="relative cursor-pointer" onClick={() => setSelectedFileModal({ fileUrl, fileName, type: 'image' })}>
            <Image
              src={fullUrl}
              alt="Shared image"
              width={200}
              height={200}
              className="rounded-lg object-cover max-w-full h-auto hover:opacity-90 transition-opacity"
              onLoad={handleLoad}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement & { dataset: any };
                
                if (!img.dataset.fallback1 && pathUrlPrimary) {
                  img.dataset.fallback1 = "1";
                  img.src = pathUrlPrimary;
                  return;
                }
                if (!img.dataset.fallback2 && queryUrlFallback) {
                  img.dataset.fallback2 = "1";
                  img.src = queryUrlFallback;
                  return;
                }
                if (!img.dataset.fallback3 && pathUrlFallback) {
                  img.dataset.fallback3 = "1";
                  img.src = pathUrlFallback;
                  return;
                }
                handleError();
              }}
            />
          </div>
        )}
        
        {isVideo && (
          <div className="relative cursor-pointer" onClick={() => setSelectedFileModal({ fileUrl, fileName, type: 'video' })}>
            <video
              src={fullUrl}
              controls
              className="rounded-lg max-w-full h-auto hover:opacity-90 transition-opacity"
              style={{ maxHeight: '200px' }}
              onLoadedData={handleLoad}
              onError={(e) => {
                const video = e.currentTarget as HTMLVideoElement & { dataset: any };
                if (!video.dataset.fallback1 && pathUrlPrimary) {
                  video.dataset.fallback1 = "1";
                  video.src = pathUrlPrimary;
                  video.load();
                  return;
                }
                if (!video.dataset.fallback2 && queryUrlFallback) {
                  video.dataset.fallback2 = "1";
                  video.src = queryUrlFallback;
                  video.load();
                  return;
                }
                if (!video.dataset.fallback3 && pathUrlFallback) {
                  video.dataset.fallback3 = "1";
                  video.src = pathUrlFallback;
                  video.load();
                  return;
                }
                handleError();
              }}
            />
          </div>
        )}
        
        {isDocument && (
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
            <File className="w-6 h-6 text-blue-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-300">{fileName || 'Document'}</p>
              <p className="text-xs text-gray-500">Click to download</p>
            </div>
            <a
              href={fullUrl}
              download={fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 text-gray-400" />
            </a>
          </div>
        )}
        
        {!isImage && !isVideo && !isDocument && (
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
            <Paperclip className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-300">{fileName || 'File attachment'}</p>
              <p className="text-xs text-gray-500">Click to download</p>
            </div>
            <a
              href={fullUrl}
              download={fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 text-gray-400" />
            </a>
          </div>
        )}
      </div>
    );
  };

  const [text, settext] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  // Use global online status context
  const { isUserOnline } = useOnlineStatus();

  const [message, setmessage] = useState<Array<{
    id: string;
    coin: boolean;
    content: string;
    date: string;
    photolink: string;
    name: string;
    files?: string[];
    fileCount?: number;
    messageId?: string; // Unique identifier for deduplication
    status?: 'sending' | 'sent' | 'delivered' | 'failed'; // Message status
    tempId?: string; // Temporary ID for optimistic updates
    isVip?: boolean;
    vipStartDate?: string;
    vipEndDate?: string;
  }>>([]);
  // Removed Redux dependencies - using direct API calls instead
  
  // Get viewing profile data for the target user
  const viewingProfile = useSelector((state: RootState) => state.viewingProfile);
  
  // Get VIP status from Redux
  const vipStatus = useSelector((state: RootState) => state.vip.vipStatus);
  
  // File upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<Array<{
    file: File;
    preview: string | ArrayBuffer | null;
    type: string;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Flag to prevent message clearing during file operations
  const isFileOperationInProgress = useRef(false);
  
  // Flag to prevent multiple simultaneous message fetches
  const isFetchingMessages = useRef(false);

  // VIP celebration states
  const [showVipCelebration, setShowVipCelebration] = useState(false);
  const [, setVipCelebrationShown] = useState(false);
  const [celebrationChecked, setCelebrationChecked] = useState(false);

  // Function to scroll to bottom of messages (currently unused but kept for future use)
  // const scrollToBottom = () => {
  //   if (msgListref.current) {
  //     // Use smooth scrolling for better mobile experience
  //     msgListref.current.scrollTo({
  //       top: msgListref.current.scrollHeight,
  //       behavior: 'smooth'
  //     });
  //   }
  // };

  // Enhanced scroll to bottom for mobile
  const scrollToBottomMobile = () => {
    if (msgListref.current) {
      // Force immediate scroll for mobile
      const element = msgListref.current;
      element.scrollTop = element.scrollHeight;
      
      // Also try smooth scroll as fallback
      setTimeout(() => {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        });
      }, 50);
    }
  };

  // Add viewport meta tag for mobile optimization
  React.useEffect(() => {
    // Ensure viewport meta tag is set for mobile
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(meta);
    }
  }, []);

  // Check if VIP celebration should be shown (database-based)
  const checkVipCelebrationStatus = React.useCallback(async (userId: string, viewerId: string) => {
    if (!userId || !viewerId) return false;
    
    try {
      const token = (() => {
        try {
          const raw = localStorage.getItem("login");
          if (raw) {
            const data = JSON.parse(raw);
            return data?.refreshtoken || data?.accesstoken;
          }
        } catch (error) {
          console.error("[Chat] Error retrieving token from localStorage:", error);
        }
        return "";
      })();

      if (!token) return false;

      const response = await checkVipCelebration(userId, viewerId, token);
      return response.shouldShowCelebration;
    } catch (error) {
      console.error('Error checking VIP celebration status:', error);
      return false;
    }
  }, []);

  // Mark VIP celebration as viewed (database-based)
  const markVipCelebrationAsViewed = React.useCallback(async (userId: string, viewerId: string) => {
    if (!userId || !viewerId) return;
    
    try {
      const token = (() => {
        try {
          const raw = localStorage.getItem("login");
          if (raw) {
            const data = JSON.parse(raw);
            return data?.refreshtoken || data?.accesstoken;
          }
        } catch (error) {
          console.error("[Chat] Error retrieving token from localStorage:", error);
        }
        return "";
      })();

      if (!token) return;

      await markVipCelebrationViewed(userId, viewerId, token);
    } catch (error) {
      console.error('Error marking VIP celebration as viewed:', error);
    }
  }, []);

  // Load userid from localStorage if not in Redux (same pattern as ProfilePage)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          
          // Set user ID if not in Redux
          if (!reduxUserId && data?.userID) {
            setLocalUserid(data.userID);
          }
        }
      } catch (error) {
        console.error("[Chat] Error retrieving data from localStorage:", error);
      }
    }
  }, [reduxUserId]);

  // Direct API call to fetch messages (skip Redux)
  const fetchMessagesDirectly = React.useCallback(async () => {
    if (!finalCreatorPortfolioId || !loggedInUserId) {
      return;
    }

    // Prevent multiple simultaneous fetches
    if (isFetchingMessages.current) {
      return;
    }

    isFetchingMessages.current = true;
    setLoading(true);

    try {
      const targetUserId = decodeURIComponent(finalCreatorPortfolioId);
      
      // Validate the decoded user ID
      if (!targetUserId || targetUserId === 'undefined' || targetUserId === 'null' || targetUserId.length < 10) {
        toast.error("Invalid user ID. Please try again.");
        setLoading(false);
        return;
      }
      
      const token = (() => {
        try {
          const raw = localStorage.getItem("login");
          if (raw) {
            const data = JSON.parse(raw);
            return data?.refreshtoken || data?.accesstoken;
          }
        } catch (error) {
          console.error("[Chat] Error retrieving token from localStorage:", error);
        }
        return "";
      })();

      const requestData = {
        creator_portfolio_id: targetUserId,
        clientid: loggedInUserId
      };

      const response = await axios.put(`${API_URL}/getcurrentchat`, requestData, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (response.data.chats && Array.isArray(response.data.chats)) {
        setmessage(response.data.chats);
        // Scroll to bottom after messages are loaded
        requestAnimationFrame(() => {
          setTimeout(() => {
            scrollToBottomMobile();
          }, 150);
        });
      } else {
        setmessage([]);
      }

      setLoading(false);
    } catch (error: any) {
      console.error("❌ [CHAT] Error fetching messages:", {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      setLoading(false);
      
      if (error.response?.status === 403) {
        toast.error("Access denied. Please check your login status.");
      } else if (error.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else {
        toast.error(`Failed to load messages: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      // Clear the fetching flag
      isFetchingMessages.current = false;
    }
  }, [finalCreatorPortfolioId, loggedInUserId]);

  // Chat info is now handled by viewingProfile only (no Redux chatinfo)

  // Track route changes to force fresh profile fetch
  const [routeChangeKey, setRouteChangeKey] = useState(0);

  // Force fresh fetch when user navigates back to chat
  useEffect(() => {
    const handleRouteChange = () => {
      setRouteChangeKey(prev => prev + 1);
    };

    // Listen for route changes (when user comes back to chat)
    window.addEventListener('focus', handleRouteChange);
    window.addEventListener('pageshow', handleRouteChange);

    return () => {
      window.removeEventListener('focus', handleRouteChange);
      window.removeEventListener('pageshow', handleRouteChange);
    };
  }, []);

  // Fetch target user profile details when creator_portfolio_id changes or route changes
  useEffect(() => {
    if (!finalCreatorPortfolioId) {
      return;
    }

    // If we don't have loggedInUserId yet, wait a bit for it to load from localStorage
    if (!loggedInUserId) {
      return;
    }

    const targetUserId = decodeURIComponent(finalCreatorPortfolioId);
    
    // Validate the decoded user ID
    if (!targetUserId || targetUserId === 'undefined' || targetUserId === 'null' || targetUserId.length < 10) {
      return;
    }
    
    // Get token from localStorage or Redux
    const token = (() => {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          return data?.refreshtoken || data?.accesstoken;
        }
      } catch (error) {
        console.error("[Chat] Error retrieving token from localStorage:", error);
      }
      return "";
    })();

    if (token) {
      // AGGRESSIVE STATE RESET: Clear ALL previous profile data immediately
      setchatusername("");
      setfirstname("");
      setlastname("");
      set_Chatphoto("/icons/icons8-profile_user.png");
      setChatphotoError(false);
      
      // Clear messages to prevent showing old messages
      setmessage([]);
      
      // Clear VIP celebration state
      setShowVipCelebration(false);
      setVipCelebrationShown(false);
      setCelebrationChecked(false);
      
      // Clear Redux viewing profile state to force fresh fetch
      dispatch({ type: 'viewingProfile/clearViewingProfile' });
      
      // @ts-expect-error - Redux dispatch type issue
      dispatch(getViewingProfile({ userid: targetUserId, token }));
    }
  }, [finalCreatorPortfolioId, loggedInUserId, dispatch, routeChangeKey]);

  // Update chat info from viewing profile when it loads
  useEffect(() => {
    if (viewingProfile.status === "succeeded" && viewingProfile.userId && finalCreatorPortfolioId) {
      // CRITICAL: Only update if the viewingProfile.userId matches the current finalCreatorPortfolioId
      const currentTargetUserId = decodeURIComponent(finalCreatorPortfolioId);
      
      if (viewingProfile.userId === currentTargetUserId) {
        setfirstname(viewingProfile.firstname || "");
        setlastname(viewingProfile.lastname || "");
        setchatusername(viewingProfile.nickname || "");
        
        // Ensure we have a valid photo link
        const photoLink = (viewingProfile as any).photolink;
        if (photoLink && photoLink.trim() !== "" && photoLink !== "null" && photoLink !== "undefined") {
          set_Chatphoto(photoLink);
        } else {
          set_Chatphoto("/icons/icons8-profile_user.png");
        }
        
        // Fetch VIP status for the chat partner
        if (viewingProfile.userId && viewingProfile.userId.length >= 10) {
          dispatch(checkVipStatus(viewingProfile.userId) as any);
        }
      }
    } else if (viewingProfile.status === "failed" && finalCreatorPortfolioId) {
      // Don't set fallback values - let it stay blank until real data loads
      // Keep loading true so it shows loading state instead of blank
    }
  }, [viewingProfile, finalCreatorPortfolioId, dispatch]);

  // Check VIP celebration status when VIP status is confirmed
  useEffect(() => {
    const checkCelebration = async () => {
      if (vipStatus?.isVip && viewingProfile.status === "succeeded" && viewingProfile.userId && loggedInUserId && !celebrationChecked && finalCreatorPortfolioId) {
        // CRITICAL: Only check celebration if the VIP user matches the current chat user
        const currentTargetUserId = decodeURIComponent(finalCreatorPortfolioId);
        
        if (viewingProfile.userId === currentTargetUserId) {
          setCelebrationChecked(true);
          
          try {
            const shouldShow = await checkVipCelebrationStatus(viewingProfile.userId, loggedInUserId);
            
            if (shouldShow) {
              setShowVipCelebration(true);
              setVipCelebrationShown(true);
              
              // Mark as viewed in database
              await markVipCelebrationAsViewed(viewingProfile.userId, loggedInUserId);
              
              // Hide the celebration after 5 seconds
              setTimeout(() => {
                setShowVipCelebration(false);
              }, 5000);
            }
          } catch (error) {
            console.error('Error checking VIP celebration:', error);
          }
        }
      }
    };

    checkCelebration();
  }, [vipStatus, viewingProfile.status, viewingProfile.userId, loggedInUserId, celebrationChecked, finalCreatorPortfolioId, checkVipCelebrationStatus, markVipCelebrationAsViewed]);

  // Reset VIP celebration tracking when switching users
  useEffect(() => {
    setVipCelebrationShown(false);
    setShowVipCelebration(false);
    setCelebrationChecked(false);
  }, [finalCreatorPortfolioId]);

  // Reset all chat state when switching users (additional safety)
  useEffect(() => {
    // This runs whenever creator_portfolio_id changes
    return () => {
      // Cleanup function - runs when the effect is about to re-run or component unmounts
      setchatusername("");
      setfirstname("");
      setlastname("");
      set_Chatphoto("/icons/icons8-profile_user.png");
      setChatphotoError(false);
      setmessage([]);
      setShowVipCelebration(false);
      setVipCelebrationShown(false);
      setCelebrationChecked(false);
    };
  }, [finalCreatorPortfolioId]);

  // Force update chat info when creator_portfolio_id changes to ensure profile is always shown
  useEffect(() => {
    if (finalCreatorPortfolioId && viewingProfile.status === "succeeded" && viewingProfile.userId) {
      // CRITICAL: Only update if the viewingProfile.userId matches the current finalCreatorPortfolioId
      const currentTargetUserId = decodeURIComponent(finalCreatorPortfolioId);
      
      if (viewingProfile.userId === currentTargetUserId) {
        setChatphotoError(false); // Reset error state for new profile
        const photoLink = (viewingProfile as any).photolink;
        if (photoLink && photoLink.trim() !== "" && photoLink !== "null" && photoLink !== "undefined") {
          set_Chatphoto(photoLink);
        } else {
          set_Chatphoto("/icons/icons8-profile_user.png");
        }
      }
    }
  }, [finalCreatorPortfolioId, viewingProfile]);

  // Fallback to ensure loading is set to false after a reasonable time
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      // Only set loading to false if we have real user data
      if (chatusername || chatfirstname) {
      setLoading(false);
      }
      // If no real data, keep loading state active
    }, 8000); // Increased to 8 seconds to give profile fetch more time

    return () => clearTimeout(fallbackTimeout);
  }, [finalCreatorPortfolioId, chatusername, chatfirstname]);

  // Enhanced fallback to ensure chat info is set even if there are timing issues
  // REMOVED: This was causing race conditions with real profile data

  // Track previous values to detect actual user changes
  const prevCreatorPortfolioId = useRef<string | null>(null);
  const prevLoggedInUserId = useRef<string | null>(null);

  // Additional useEffect to handle navigation from MessageList (skip Redux)
  useEffect(() => {
    // Only proceed if we have both creator_portfolio_id and loggedInUserId
    if (!finalCreatorPortfolioId) {
      return;
    }

    if (!loggedInUserId) {
      return;
    }

    // Check if this is actually a new user (not just a re-render)
    const isNewUser = prevCreatorPortfolioId.current !== finalCreatorPortfolioId || 
                     prevLoggedInUserId.current !== loggedInUserId;
    
    // Don't clear messages if we're in the middle of file operations
    if (isNewUser && !isFileOperationInProgress.current && !isFetchingMessages.current) {
      // Update refs to current values
      prevCreatorPortfolioId.current = finalCreatorPortfolioId;
      prevLoggedInUserId.current = loggedInUserId;
      
      // Only clear messages and fetch when actually changing users
    setmessage([]);
    setLoading(true);

    // Use direct API call instead of Redux
    fetchMessagesDirectly();
    } else if (isNewUser && (isFileOperationInProgress.current || isFetchingMessages.current)) {
      // Update refs to current values
      prevCreatorPortfolioId.current = finalCreatorPortfolioId;
      prevLoggedInUserId.current = loggedInUserId;
    }
  }, [finalCreatorPortfolioId, loggedInUserId, fetchMessagesDirectly, message.length]); // Added all dependencies with guards

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (message.length > 0) {
      // Use enhanced mobile scrolling with better timing
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollToBottomMobile();
        }, 150);
      });
      
      // Additional scroll for mobile browsers that need extra time
      setTimeout(() => {
        scrollToBottomMobile();
      }, 300);
    }
  }, [message]);

  const messagelist = () => {

    if (message.length > 0) {
      return (
        <>
          {message.map((value, index: number) => {
            const isUser = value.id === loggedInUserId;
            const messageTime = new Date(Number(value.date)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            if (value.coin) {
              return (
                <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 w-full`}>
                  <div className={`w-1/2 px-4 py-3 rounded-2xl ${
                    isUser 
                      ? ' bg-gray-800 text-white rounded-br-md' 
                      : ' bg-gray-800/50 text-white rounded-bl-md border border-blue-700/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="font-semibold">{isUser ? 'You sent' : `${value.name} sent`}</span>
                      {/* VIP Badge for message sender */}
                      {!isUser && value.isVip && (
                        <VIPBadge size="md" isVip={value.isVip} vipEndDate={value.vipEndDate} />
                      )}

                    </div>
                    <p className="text-lg font-bold mt-1">${value.content}</p>
                    <p className="text-xs opacity-70 mt-1">{messageTime}</p>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 w-full`}>
                  <div className={`w-1/2 px-4 py-3 rounded-2xl ${
                    isUser 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md shadow-lg shadow-blue-500/30' 
                      : ' bg-gray-800/50 text-white rounded-bl-md border border-blue-700/30 shadow-lg shadow-blue-700/10'
                  }`}>
                    {/* VIP Badge for message sender */}
                    {!isUser && value.isVip && (
                      <div className="flex justify-end items-center gap-2 mb-2">
                          <VIPBadge size="md" isVip={value.isVip} vipEndDate={value.vipEndDate} />
                        <span className="text-xs py-1 px-2 rounded-full bg-gradient-to-b tracking-wider font-semibold from-[#fb8402] to-[#ad4d01] text-white">VIP</span>
                      </div>
                    )}
                    <p className="text-sm">{value.content}</p>
                    
                    {/* Display files if any */}
                    {value.files && value.files.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {value.files.map((fileUrl, fileIndex) => (
                          <FilePreview
                            key={fileIndex}
                            fileUrl={fileUrl}
                            fileName={`File ${fileIndex + 1}`}
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs opacity-70">{messageTime}</p>
                      {/* Message status indicator for sent messages */}
                      {isUser && value.status && (
                        <div className="flex items-center ml-2">
                          {value.status === 'sending' && (
                            <div className="flex items-center">
                              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-xs text-gray-400 ml-1">.</span>
                            </div>
                          )}
                          {value.status === 'sent' && (
                            <div className="flex items-center">
                              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-gray-400 ml-1">Sent</span>
                            </div>
                          )}
                          {value.status === 'delivered' && (
                            <div className="flex items-center">
                              <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-blue-400 ml-1">.</span>
                            </div>
                          )}
                          {value.status === 'failed' && (
                            <div className="flex items-center">
                              <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              <button 
                                onClick={() => {
                                  // Update status to sending and retry
                                  setmessage((prevMessages) => {
                                    return prevMessages.map((msg) => {
                                      if (msg.tempId === value.tempId) {
                                        return { ...msg, status: 'sending' };
                                      }
                                      return msg;
                                    });
                                  });
                                  // Retry sending the message
                                  send_chat(value.content);
                                }}
                                className="text-xs text-red-400 ml-1 hover:text-red-300 underline"
                              >
                                Tap to retry
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          })}
          
          {/* Typing indicator */}
          {otherUserTyping && (
            <div className="flex justify-start mb-4 w-full">
              <div className="w-1/2 px-4 py-3 rounded-2xl  bg-gray-800/50 text-white rounded-bl-md border border-blue-700/30">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-blue-300">Typing...</span>
                </div>
              </div>
            </div>
          )}
        </>
      );
    } else {
      return (
        <div className="text-center text-slate-400">
          <p>Start Conversation!</p>
          <p className="text-sm mt-2">Send a message to begin</p>
        </div>
      );
    }
  };

  // Direct API call when component loads (skip Redux) - Only run once
  useEffect(() => {
    if (!finalCreatorPortfolioId) {
      return;
    }

    if (!loggedInUserId) {
      return;
    }
    
    // Only fetch messages once when component first loads
    if (!isFetchingMessages.current && message.length === 0) {
    fetchMessagesDirectly();
    }
  }, [finalCreatorPortfolioId, loggedInUserId, fetchMessagesDirectly, message.length]); // Added dependencies but with guards


  // Socket connection and real-time message handling
  useEffect(() => {
    const socket = getSocket();
    
    if (!socket) {
      return;
    }
    
    if (!loggedInUserId) {
      return;
    }

    // Connect user to socket
    socket.emit("online", loggedInUserId);
    
    // Join user room for typing events
    socket.emit("join_user_room", { userId: loggedInUserId });

    // Listen for new messages

    const handleLiveChat = (data: { 
      data: { 
        fromid: string; 
        toid: string; 
        content: string; 
        date: string; 
        coin: boolean; 
        files?: string[]; 
        fileCount?: number;
        isVip?: boolean;
        vipStartDate?: string;
        vipEndDate?: string;
      }; 
      name: string; 
      photolink: string; 
    }) => {
      if (!finalCreatorPortfolioId) {
        return;
      }

      const decodedCreator_portfolio_id = decodeURIComponent(finalCreatorPortfolioId);
      
      // Since we now pass only the target user ID, we don't need to split by comma
      const targetUserId = decodedCreator_portfolio_id;
      
      // Validate the decoded user ID
      if (!targetUserId || targetUserId === 'undefined' || targetUserId === 'null' || targetUserId.length < 10) {
        console.error("❌ [CHAT] Invalid targetUserId in socket handler:", targetUserId);
        return;
      }
      
      // Check if this message is between the current user and target user
      const isFromTargetToCurrent = (data.data.fromid === targetUserId && data.data.toid === loggedInUserId);
      const isFromCurrentToTarget = (data.data.fromid === loggedInUserId && data.data.toid === targetUserId);
      
      if (isFromTargetToCurrent || isFromCurrentToTarget) {
        
        const info = {

          name: data.name,
          photolink: data.photolink,
          content: data.data.content,
          date: data.data.date,
          id: data.data.fromid,
          coin: data.data.coin,
          files: data.data.files || [],
          fileCount: data.data.fileCount || 0,
          messageId: `${data.data.fromid}-${data.data.date}`, // Create unique message ID
          status: 'delivered' as const,
          isVip: data.data.isVip || false,
          vipStartDate: data.data.vipStartDate,
          vipEndDate: data.data.vipEndDate
        };
        
        // Check if this is a message from the current user (optimistic update)
        if (data.data.fromid === loggedInUserId) {
          setmessage((prevMessages) => {
            return prevMessages.map((msg) => {
              // Find the message by content and date (since we don't have the exact tempId)
              if (msg.id === data.data.fromid && 
                  msg.content === data.data.content && 
                  msg.status === 'sending') {
                return { ...msg, status: 'delivered' as const };
              }
              return msg;
            });
          });
          // Don't add a new message - just update the existing one
        } else {
          // This is a message from the other user, add it normally
          setmessage((prevMessages) => {
            // Check if message already exists to prevent duplicates
            const messageExists = prevMessages.some(msg => 
              msg.messageId === info.messageId || 
              (msg.content === info.content && msg.date === info.date && msg.id === info.id)
            );
            
            if (messageExists) {
              return prevMessages;
            }
            
            return [...prevMessages, info];
          });
          // Scroll to bottom when new message is added
          requestAnimationFrame(() => {
            setTimeout(() => {
              scrollToBottomMobile();
            }, 100);
          });
        }
      }
    };

    socket.on("LiveChat", handleLiveChat);

    // Typing event listeners
    const handleTypingStart = (data: { fromUserId: string, toUserId: string }) => {
      if (finalCreatorPortfolioId && data.fromUserId === finalCreatorPortfolioId && data.toUserId === loggedInUserId) {
        setOtherUserTyping(true);
      }
    };

    const handleTypingStop = (data: { fromUserId: string, toUserId: string }) => {
      if (finalCreatorPortfolioId && data.fromUserId === finalCreatorPortfolioId && data.toUserId === loggedInUserId) {
        setOtherUserTyping(false);
      }
    };

    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);

    // Online status is now handled globally by OnlineStatusContext

    return () => {
      // Leave user room
      socket.emit("leave_user_room", { userId: loggedInUserId });
      
      socket.off("LiveChat", handleLiveChat);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
    };

  }, [loggedInUserId, finalCreatorPortfolioId]);


  // useEffect(() => {
  //   if (!login) {
  //     window.location.href = "/";
  //   }
  //   if (message.length > 0) {
  //     const last = msgListref.current.lastElementChild;
  //     if (last) {
  //       last.scrollIntoView();
  //     }
  //   }

  //   if (messagestatus === "failed") {
  //     console.log("failed");
  //     setLoading(false);
  //   }

  //   if (messagestatus === "succeeded") {
  //     dispatch(changemessagestatus("idle"));
  //     updateChat();
  //     setmessage(oldMessage);
  //     setLoading(false);

  //     socket.on("LiveChat", (data) => {
  //       let ids = creator_portfolio_id.split(",");
  //       if (ids[0] === data.data.fromid && MYID === data.data.toid) {
  //         // console.log(data)
  //         dispatch(updatemessage({ date: data.data.date, token }));
  //         let info = {
  //           name: data.name,
  //           photolink: data.photolink,
  //           content: data.data.content,
  //           date: data.data.date,
  //           id: data.data.fromid,
  //           coin: data.data.coin,
  //         };

  //         setmessage((value) => [...value, info]);
  //       }
  //     });
  //   }

  //   if (giftstats === "succeeded") {
  //     // let sent_text = ` ${gold_amount} Gold success`;
  //     // send_chat(sent_text);
  //     setgold_amount("50");
  //     setgift_click(false);
  //     setsendL(false);
  //     dispatch(changemessagestatus("idle"));
  //   }

  //   if (giftstats === "failed") {
  //     toast.error(`${giftmessage}`, { autoClose: 2000 });
  //     setgift_click(false);
  //     setsendL(false);
  //     dispatch(changemessagestatus("idle"));
  //   }
  // }, [message, messagestatus, giftstats]);

  // const check_balance = () => {
  //   let my_balance = parseFloat(balance);
  //   let send_amount = parseFloat(gold_amount);

  //   if (my_balance >= send_amount) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };

  // const send_coin = () => {
  //   if (check_balance()) {
  //     let ids = creator_portfolio_id.split(",");

  //     if (giftstats !== "loading") {
  //       let content = {
  //         fromid: userid,
  //         content: `${gold_amount}`,
  //         toid: ids[0],
  //         date: Date.now().toString(),
  //         favourite: false,
  //         notify: true,
  //         coin: true,
  //       };

  //       //let ids = creator_portfolio_id.split(",");

  //       socket.emit("message", content);
  //       setsendL(true);
  //       dispatch(
  //         send_gift({
  //           token,
  //           creator_portfolio_id: ids[0],
  //           userid: userid,
  //           amount: `${gold_amount}`,
  //         })
  //       );

  //       setgift_click(false);

  //       let chats = {
  //         name: chatusername,
  //         content: content.content,
  //         date: content.date,
  //         photolink: chatphotolink,
  //         id: content.fromid,
  //         coin: true,
  //       };

  //       setmessage((value) => [...value, chats]);
  //     }
  //   } else {
  //     //route to topup page
  //     router.push("/topup");
  //   }
  // };


  // File validation function
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxImageSize = 5 * 1024 * 1024; // 5MB
    const maxVideoSize = 10 * 1024 * 1024; // 10MB
    
    if (file.type.startsWith('image/')) {
      if (file.size > maxImageSize) {
        return { valid: false, error: 'Image size must be less than 5MB' };
      }
    } else if (file.type.startsWith('video/')) {
      if (file.size > maxVideoSize) {
        return { valid: false, error: 'Video size must be less than 10MB' };
      }
    } else {
      return { valid: false, error: 'Only images and videos are allowed' };
    }
    
    return { valid: true };
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Set flag to prevent message clearing during file operations
    isFileOperationInProgress.current = true;

    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      
      // Create previews
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewFiles(prev => [...prev, {
            file,
            preview: e.target?.result || null,
            type: file.type.startsWith('image/') ? 'image' : 'video'
          }]);
        };
        reader.readAsDataURL(file);
      });
      
      // Ensure messages are preserved - force a re-render to maintain state
      setTimeout(() => {
        // Clear the flag after file selection is complete
        isFileOperationInProgress.current = false;
      }, 100);
    } else {
      // Clear the flag if no valid files
      isFileOperationInProgress.current = false;
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove selected file
  const removeFile = (index: number) => {
    // Set flag to prevent message clearing during file operations
    isFileOperationInProgress.current = true;
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewFiles(prev => prev.filter((_, i) => i !== index));
    
    // Clear the flag after file removal is complete
    setTimeout(() => {
      isFileOperationInProgress.current = false;
    }, 50);
  };

  // Upload files to backend (now using Storj)
  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('file', file); // Backend expects field name 'file' for each file
    });

    try {
      const response = await axios.post(`${API_URL}/upload-message-files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.fileUrls || [];
    } catch (error: any) {
      console.error('File upload error:', error);
      if (error.response?.status === 404) {
        throw new Error('Upload endpoint not found. Please check if the backend server is running and the route is properly configured.');
      }
      throw new Error('Failed to upload files');
    }
  };

  // Get user info from Redux store
  const profilephotolink = useSelector((state: RootState) => state.profile.photolink);
  const profilename = useSelector((state: RootState) => state.profile.firstname);

  const send_chat = async (text: string) => {
    if (!text.trim() && selectedFiles.length === 0) {
      toast.error("Please enter a message or select files to send");
      return;
    }

    if (!finalCreatorPortfolioId) {
      toast.error("Invalid chat session. Please try again.");
      return;
    }

    const decodedCreator_portfolio_id = decodeURIComponent(finalCreatorPortfolioId);
    
    // Since we now pass only the target user ID, we don't need to split by comma
    const targetUserId = decodedCreator_portfolio_id;

    if (!loggedInUserId) {
      toast.error("Please log in to send messages");
      return;
    }

    if (!targetUserId || targetUserId === 'undefined' || targetUserId === 'null' || targetUserId.length < 10) {
      console.error("❌ [CHAT] Invalid targetUserId:", targetUserId);
      toast.error("Invalid recipient. Please try again.");
      return;
    }

    if (loggedInUserId) {
      setchatphotolink(profilephotolink);
      setchatusername(profilename);
    }

    setUploading(true);

    // Set flag to prevent message clearing during file operations
    isFileOperationInProgress.current = true;

    // Create optimistic message immediately to prevent UI flicker
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage = {
      name: chatusername,
      content: text || (selectedFiles.length > 0 ? `Sending ${selectedFiles.length} file(s)...` : 'Sending message...'),
      date: Date.now().toString(),
      photolink: chatphotolink,
      id: loggedInUserId,
      coin: false,
      files: [],
      fileCount: 0,
      messageId: `${loggedInUserId}-${Date.now()}`,
      status: 'sending' as const,
      tempId: tempId,
      isVip: false,
      vipStartDate: undefined,
      vipEndDate: undefined
    };

    // Add optimistic message immediately
    setmessage((prevMessages) => [...prevMessages, optimisticMessage]);

    try {
      let fileUrls: string[] = [];
      
      // Upload files if any
      if (selectedFiles.length > 0) {
        try {
        fileUrls = await uploadFiles(selectedFiles);
        } catch (uploadError) {
          console.error("File upload failed:", uploadError);
          toast.error("File upload failed. Sending message without files.");
          // Continue with message sending without files
          fileUrls = [];
        }
      }

      const content = {
        fromid: loggedInUserId,
        content: text || (fileUrls.length > 0 ? `Sent ${fileUrls.length} file(s)` : 'File message'),
        toid: targetUserId,
        date: Date.now().toString(),
        favourite: false,
        notify: true,
        coin: false,
        files: fileUrls,
        fileCount: fileUrls.length
      };

      // Emit message through socket
      const socket = getSocket();
      
      if (socket) {
        socket.emit("message", content);
      } else {
        toast.error("Connection lost. Please refresh and try again.");
        // Update optimistic message to failed
        setmessage((prevMessages) => {
          return prevMessages.map((msg) => {
            if (msg.tempId === tempId) {
              return { ...msg, status: 'failed' as const };
            }
            return msg;
          });
        });
        return;
      }
      
      // Update the optimistic message with final content and files
      setmessage((prevMessages) => {
        return prevMessages.map((msg) => {
          if (msg.tempId === tempId) {
            return {
              ...msg,
        content: content.content,
        files: fileUrls,
        fileCount: fileUrls.length,
        messageId: `${content.fromid}-${content.date}`,
              date: content.date
            };
          }
          return msg;
        });
      });
      
      // Scroll to bottom after sending message
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollToBottomMobile();
        }, 100);
      });
      
      settext("");
      setSelectedFiles([]);
      setPreviewFiles([]);
      
      toast.success("Message sent!");
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error('Failed to send message');
      
      // Update the optimistic message status to failed
      setmessage((prevMessages) => {
        return prevMessages.map((msg) => {
          if (msg.tempId === tempId) {
            return { ...msg, status: 'failed' as const };
          }
          return msg;
        });
      });
    } finally {
      setUploading(false);
      // Clear the flag after file operations are complete
      isFileOperationInProgress.current = false;
    }
  };

  // const updateChat = () => {
  //   if (chatinfo) {
  //     set_Chatname(chatinfo.name);
  //     setfirstname(chatinfo.firstname);
  //     if (chatinfo.photolink) {
  //       // let photo7 = downloadImage(chatinfo.photolink, "profile");
  //       let photo7 = chatinfo.photolink;
  //       set_Chatphoto(photo7);
  //     }
  //   }
  // };

  // const emojiButtonRef = useRef(null);

  // Toggle emoji picker on button click
  // const toggleEmojiPicker = () => {
  //   setShowEmoji((prev) => !prev);
  // };

  // // Close emoji picker if clicked outside
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     const target = event.target;
  //     if (
  //       emojiPickerRef.current &&
  //       !emojiPickerRef.current.contains(target) &&
  //       emojiButtonRef.current &&
  //       !emojiButtonRef.current.contains(target)
  //     ) {
  //       setShowEmoji(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  // // for clicked emoji to show on the input bar
  // useEffect(() => {
  //   const picker = emojiPickerRef.current;
  //   if (!picker) return;

  //   const handleEmojiClick = (e) => {
  //     const emoji = e.detail?.emoji?.unicode;
  //     if (emoji) {
  //       settext((prev) => prev + emoji);
  //     }
  //   };

  //   picker.addEventListener("emoji-click", handleEmojiClick);

  //   return () => {
  //     picker.removeEventListener("emoji-click", handleEmojiClick);
  //   };
  // }, [showEmoji]);

  // Cleanup when component unmounts (user exits route)
  useEffect(() => {
    return () => {
      // Clear profile data when user exits the chat route
      setchatusername("");
      setfirstname("");
      setlastname("");
      set_Chatphoto("/icons/icons8-profile_user.png");
      
      // Clear Redux viewing profile state
      dispatch({ type: 'viewingProfile/clearViewingProfile' });
    };
  }, [dispatch]);

  // Early return if we don't have valid user data
  // Only return early if we're sure we don't have the data (not just loading)
  if (!finalCreatorPortfolioId) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">Invalid Chat</p>
          <p className="text-gray-400 text-sm">No user ID provided. Please try again.</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // If we don't have loggedInUserId yet, show loading but don't block the component
  if (!loggedInUserId) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-2">Loading chat...</p>
          <p className="text-gray-400 text-sm">Please wait while we connect you</p>
        </div>
      </div>
    );
  }

  // Validate the decoded user ID
  const decodedUserId = decodeURIComponent(finalCreatorPortfolioId);

  if (!decodedUserId || decodedUserId === 'undefined' || decodedUserId === 'null' || decodedUserId.length < 10) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">Invalid Chat</p>
          <p className="text-gray-400 text-sm">The user ID is invalid. Please try again.</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="h-screen w-full flex flex-col fixed inset-0" style={{ 
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'contain',
      touchAction: 'pan-y',
      height: '100dvh', // Dynamic viewport height for mobile
      maxHeight: '100dvh',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      {/* VIP Celebration Animation */}
      {showVipCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none">
          <div className="relative w-64 h-64 md:w-96 md:h-96">
            <Image
              src="/lion.gif"
              alt="VIP Celebration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}

      {/* Top Bar with Clean Design */}
      <div className=" bg-gray-800 backdrop-blur-sm border-b border-blue-700/30 p-3 sm:p-4 sticky top-0 z-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover: bg-gray-800/50 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center gap-3">
              {/* Profile Picture */}
              <div 
                className="relative cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  if (finalCreatorPortfolioId) {
                    router.push(`/Profile/${finalCreatorPortfolioId}`);
                  }
                }}
              >
                <div className="w-12 h-12 rounded-full border-2 border-blue-600/50 overflow-hidden">
                  {loading || (!chatusername && !chatfirstname) ? (
                    <div className="w-full h-full bg-gray-600 animate-pulse rounded-full"></div>
                  ) : Chatphoto && Chatphoto !== "/icons/icons8-profile_user.png" && !ChatphotoError ? (
                    <Image
                      src={getImageSource(Chatphoto, 'profile').src}
                      alt="profile"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      onError={() => {
                        setChatphotoError(true);
                      }}
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-white font-semibold ${getRandomColor(chatfirstname && chatlastname ? `${chatfirstname} ${chatlastname}`.trim() : chatusername || "User")}`}>
                      {getUserInitials(chatfirstname && chatlastname ? `${chatfirstname} ${chatlastname}`.trim() : chatusername || "User")}
                    </div>
                  )}
                </div>
                {/* VIP Badge for chat partner */}
                {viewingProfile.status === "succeeded" && vipStatus?.isVip && (
                  <VIPBadge size="xl" className="absolute -top-3 -right-5" isVip={vipStatus.isVip} vipEndDate={vipStatus.vipEndDate} />
                )}
              </div>
              
              {/* User Name */}
              <div 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  if (finalCreatorPortfolioId) {
                    router.push(`/Profile/${finalCreatorPortfolioId}`);
                  }
                }}
              >
                {loading || (!chatusername && !chatfirstname) ? (
                  <div className="h-5 bg-gray-600 animate-pulse rounded w-24"></div>
                ) : (
                  <p className="font-bold text-white text-lg">
                    {chatfirstname && chatlastname ? `${chatfirstname} ${chatlastname}`.trim() : chatusername}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  {otherUserTyping ? (
                    <div className="flex items-center gap-1">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-blue-300">Typing...</span>
                    </div>
                  ) : (finalCreatorPortfolioId && isUserOnline(finalCreatorPortfolioId)) ? (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-400">Online</span>
                    </div>
                  ) : (
                    <span className="text-xs text-blue-300">Direct message</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu />
          </div>
        </div>
      </div>

      {/* Messages Area - Clean Design */}
      <div ref={msgListref} className="flex-1 overflow-y-auto p-3 sm:p-4 bg-transparent" style={{ 
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        scrollBehavior: 'smooth',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        minHeight: 0 // Important for flex child to shrink properly
      }}>
        {loading ? (
          <div className="space-y-4 w-full max-w-4xl mx-auto">
            <div className="flex justify-start mb-4 w-full">
              <div className="w-1/2 px-4 py-3 rounded-2xl  bg-gray-800/50 text-white rounded-bl-md border border-blue-700/30">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-400 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-400 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <div className="flex justify-end mb-4 w-full">
              <div className="w-1/2 px-4 py-3 rounded-2xl  bg-gray-800 text-white rounded-br-md">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-400 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-400 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 w-full max-w-4xl mx-auto" style={{
            paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))'
          }}>
            {messagelist()}
          </div>
        )}
      </div>

      {/* File Preview Area - Mobile Optimized */}
      {previewFiles.length > 0 && (
        <div className="bg-gray-800/50 border-t border-blue-700/30 sticky z-40" style={{
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300 font-medium">
                {previewFiles.length} file{previewFiles.length > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => {
                  setSelectedFiles([]);
                  setPreviewFiles([]);
                }}
                className="text-xs text-gray-400 hover:text-white underline"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
            {previewFiles.map((preview, index) => (
              <div key={index} className="relative">
                {preview.type === 'image' && (
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-600">
                    <Image
                      src={preview.preview as string}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFile(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {preview.type === 'video' && (
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center border border-gray-600">
                    <video
                      src={preview.preview as string}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <button
                      onClick={() => removeFile(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {preview.type === 'file' && (
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-700 flex flex-col items-center justify-center border border-gray-600 p-1">
                      <Paperclip className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                      <span className="text-xs text-gray-300 truncate max-w-12 sm:max-w-16 text-center">{preview.file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Bar - Mobile Optimized */}
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-800 border-t border-blue-700/30 sticky bottom-0 z-50 flex-shrink-0 shadow-lg" style={{
        paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
        minHeight: 'calc(80px + env(safe-area-inset-bottom, 0px))'
      }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-3  bg-gray-800 hover: bg-gray-800 text-white rounded-full transition-colors"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <div className="flex items-center flex-1 px-4 py-3  bg-gray-800/50 border border-blue-600/50 rounded-full">
          <textarea
            className="flex-1 h-8 text-white placeholder-blue-300 bg-transparent outline-none resize-none"
            value={text}
            placeholder="Type a message..."
            onChange={(e) => {
              settext(e.target.value);
              
              // Handle typing indicators
              if (e.target.value.trim() && loggedInUserId && finalCreatorPortfolioId && finalCreatorPortfolioId.length >= 10) {
                if (!isTyping) {
                  setIsTyping(true);
                  startTyping(loggedInUserId, finalCreatorPortfolioId);
                }
                
                // Clear existing timeout
                if (typingTimeout) {
                  clearTimeout(typingTimeout);
                }
                
                // Set new timeout to stop typing after 2 seconds of inactivity
                const timeout = setTimeout(() => {
                  setIsTyping(false);
                  stopTyping(loggedInUserId, finalCreatorPortfolioId);
                }, 2000);
                
                setTypingTimeout(timeout);
              } else if (!e.target.value.trim() && isTyping && finalCreatorPortfolioId) {
                setIsTyping(false);
                stopTyping(loggedInUserId, finalCreatorPortfolioId);
                if (typingTimeout) {
                  clearTimeout(typingTimeout);
                  setTypingTimeout(null);
                }
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send_chat(text);
              }
            }}
          />
        </div>

        <button 
          onClick={() => send_chat(text)} 
          disabled={(!text.trim() && selectedFiles.length === 0) || uploading}
          className="flex-shrink-0 p-3  bg-gray-800 hover: bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* File Modal */}
      {selectedFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" onClick={() => setSelectedFileModal(null)}>
          <div className="relative max-w-4xl max-h-4xl w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={() => setSelectedFileModal(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* File Content */}
            <div className="relative w-full h-full flex items-center justify-center">
              {selectedFileModal.type === 'image' && (
                <Image
                  src={getImageSource(selectedFileModal.fileUrl, 'message').src}
                  alt={selectedFileModal.fileName || 'Shared image'}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement & { dataset: any };
                    const pathUrlPrimary = selectedFileModal.fileUrl ? `${API_URL}/api/image/view/${encodeURIComponent(selectedFileModal.fileUrl)}` : "";
                    const queryUrlFallback = selectedFileModal.fileUrl ? `https://mmekoapi.onrender.com/api/image/view?publicId=${encodeURIComponent(selectedFileModal.fileUrl)}` : "";
                    const pathUrlFallback = selectedFileModal.fileUrl ? `https://mmekoapi.onrender.com/api/image/view/${encodeURIComponent(selectedFileModal.fileUrl)}` : "";
                    
                    if (!img.dataset.fallback1 && pathUrlPrimary) {
                      img.dataset.fallback1 = "1";
                      img.src = pathUrlPrimary;
                      return;
                    }
                    if (!img.dataset.fallback2 && queryUrlFallback) {
                      img.dataset.fallback2 = "1";
                      img.src = queryUrlFallback;
                      return;
                    }
                    if (!img.dataset.fallback3 && pathUrlFallback) {
                      img.dataset.fallback3 = "1";
                      img.src = pathUrlFallback;
                      return;
                    }
                  }}
                />
              )}
              
              {selectedFileModal.type === 'video' && (
                <video
                  src={getImageSource(selectedFileModal.fileUrl, 'message').src}
                  controls
                  autoPlay
                  className="max-w-full max-h-full"
                  onError={(e) => {
                    const video = e.currentTarget as HTMLVideoElement & { dataset: any };
                    const pathUrlPrimary = selectedFileModal.fileUrl ? `${API_URL}/api/image/view/${encodeURIComponent(selectedFileModal.fileUrl)}` : "";
                    const queryUrlFallback = selectedFileModal.fileUrl ? `https://mmekoapi.onrender.com/api/image/view?publicId=${encodeURIComponent(selectedFileModal.fileUrl)}` : "";
                    const pathUrlFallback = selectedFileModal.fileUrl ? `https://mmekoapi.onrender.com/api/image/view/${encodeURIComponent(selectedFileModal.fileUrl)}` : "";
                    
                    if (!video.dataset.fallback1 && pathUrlPrimary) {
                      video.dataset.fallback1 = "1";
                      video.src = pathUrlPrimary;
                      video.load();
                      return;
                    }
                    if (!video.dataset.fallback2 && queryUrlFallback) {
                      video.dataset.fallback2 = "1";
                      video.src = queryUrlFallback;
                      video.load();
                      return;
                    }
                    if (!video.dataset.fallback3 && pathUrlFallback) {
                      video.dataset.fallback3 = "1";
                      video.src = pathUrlFallback;
                      video.load();
                      return;
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
