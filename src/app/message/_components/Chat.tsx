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
import type { RootState } from "@/store/store";
import { getSocket } from "@/lib/socket";
import { toast } from "material-react-toastify";
import { URL as API_URL } from "@/api/config";
import axios from "axios";
import Image from "next/image";
import { X, Paperclip, Send, File, Download } from "lucide-react";


export const Chat = () => {
  const msgListref = useRef<HTMLDivElement>(null);
  // const messagestatus = useSelector(
  //   (state) => state.message.currentmessagestatus
  // );
  // const giftstats = useSelector((state) => state.message.giftstats);
  // const giftmessage = useSelector((state) => state.message.giftmessage);
  // const oldMessage = useSelector((state) => state.message.listofcurrentmessage);
  // const chatinfo = useSelector((state) => state.message.chatinfo);
  // const modelID = useSelector((state) => state.profile.modelID);
  // const balance = useSelector((state) => state.profile.balance);
  // const modelname = useSelector((state) => state.profile.modelname);
  // const modelphotolink = useSelector((state) => state.profile.modelphotolink);
  // const profilephotolink = useSelector((state) => state.comprofile.photoLink);
  // const profilename = useSelector((state) => state.profile.firstname);
  const dispatch = useDispatch();
  const { modelid } = useParams<{ modelid: string }>();
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
    
    
    // Handle URLs like post.tsx does - use API endpoints for Appwrite files
    const isHttpUrl = fileUrl.startsWith('http');
    const isBlobUrl = fileUrl.startsWith('blob:');
    const isDataUrl = fileUrl.startsWith('data:');
    const isUrl = isHttpUrl || isBlobUrl || isDataUrl;
    
    // For Appwrite files, use the API endpoint like post.tsx
    const queryUrlPrimary = fileUrl ? `${API_URL}/api/image/view?publicId=${encodeURIComponent(fileUrl)}` : "";
    const pathUrlPrimary = fileUrl ? `${API_URL}/api/image/view/${encodeURIComponent(fileUrl)}` : "";
    const queryUrlFallback = fileUrl ? `https://mmekoapi.onrender.com/api/image/view?publicId=${encodeURIComponent(fileUrl)}` : "";
    const pathUrlFallback = fileUrl ? `https://mmekoapi.onrender.com/api/image/view/${encodeURIComponent(fileUrl)}` : "";
    
    // Use direct URL if it's already a full URL, otherwise use API endpoint
    const fullUrl = isUrl ? fileUrl : queryUrlPrimary;
    
    
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
          <div className="relative">
            <Image
              src={fullUrl}
              alt="Shared image"
              width={200}
              height={200}
              className="rounded-lg object-cover max-w-full h-auto"
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
          <div className="relative">
            <video
              src={fullUrl}
              controls
              className="rounded-lg max-w-full h-auto"
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
  }>>([]);
  // Removed Redux dependencies - using direct API calls instead
  
  // Get viewing profile data for the target user
  const viewingProfile = useSelector((state: RootState) => state.viewingProfile);
  
  // File upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<Array<{
    file: File;
    preview: string | ArrayBuffer | null;
    type: string;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    if (msgListref.current) {
      msgListref.current.scrollTop = msgListref.current.scrollHeight;
    }
  };

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
    if (!modelid || !loggedInUserId) {
      return;
    }

    setLoading(true);

    try {
      const targetUserId = decodeURIComponent(modelid);
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
        modelid: targetUserId,
        clientid: loggedInUserId,
        token: token || ""
      };

      const response = await axios.put(`${API_URL}/getcurrentchat`, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.chats && Array.isArray(response.data.chats)) {
        setmessage(response.data.chats);
        // Scroll to bottom after messages are loaded
        setTimeout(() => scrollToBottom(), 100);
      } else {
        setmessage([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
      toast.error("Failed to load messages");
    }
  }, [modelid, loggedInUserId]);

  // Chat info is now handled by viewingProfile only (no Redux chatinfo)

  // Fetch target user profile details when modelid changes
  useEffect(() => {
    if (!modelid || !loggedInUserId) return;

    const targetUserId = decodeURIComponent(modelid);
    
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
      // @ts-expect-error - Redux dispatch type issue
      dispatch(getViewingProfile({ userid: targetUserId, token }));
    }
  }, [modelid, loggedInUserId, dispatch]);

  // Update chat info from viewing profile when it loads
  useEffect(() => {
    if (viewingProfile.status === "succeeded" && viewingProfile.userId) {
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
    }
  }, [viewingProfile]);

  // Force update chat info when modelid changes to ensure profile is always shown
  useEffect(() => {
    if (modelid && viewingProfile.status === "succeeded" && viewingProfile.userId) {
      setChatphotoError(false); // Reset error state for new profile
      const photoLink = (viewingProfile as any).photolink;
      if (photoLink && photoLink.trim() !== "" && photoLink !== "null" && photoLink !== "undefined") {
        set_Chatphoto(photoLink);
      } else {
        set_Chatphoto("/icons/icons8-profile_user.png");
      }
    }
  }, [modelid, viewingProfile]);

  // Fallback to ensure loading is set to false after a reasonable time
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      setLoading(false);
    }, 10000); // 10 second fallback - only if API is taking too long

    return () => clearTimeout(fallbackTimeout);
  }, []);

  // Fallback to ensure chat info is set even if there are timing issues
  useEffect(() => {
    if (modelid && !chatusername && !chatfirstname) {
      const targetUserId = decodeURIComponent(modelid);
      setchatusername(`User ${targetUserId.slice(-4)}`); // Show last 4 chars of user ID as fallback
      set_Chatphoto("/icons/icons8-profile_user.png");
    }
  }, [modelid, chatusername, chatfirstname]);

  // Additional useEffect to handle navigation from MessageList (skip Redux)
  useEffect(() => {
    // Only proceed if we have both modelid and loggedInUserId
    if (!modelid || !loggedInUserId) {
      return;
    }

    // Always fetch messages when navigating to a new chat
    setmessage([]);
    setLoading(true);

    // Use direct API call instead of Redux
    fetchMessagesDirectly();
  }, [modelid, loggedInUserId, fetchMessagesDirectly]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (message.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => scrollToBottom(), 50);
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
                      ? 'bg-blue-600 text-white rounded-br-md' 
                      : 'bg-blue-800/50 text-white rounded-bl-md border border-blue-700/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="font-semibold">{isUser ? 'You sent' : `${value.name} sent`}</span>
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
                      ? 'bg-blue-600 text-white rounded-br-md' 
                      : 'bg-blue-800/50 text-white rounded-bl-md border border-blue-700/30'
                  }`}>
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

  // Direct API call when component loads (skip Redux)
  useEffect(() => {
    if (!modelid) {
      return;
    }

    if (!loggedInUserId) {
      return;
    }
    
    // Always fetch messages when component loads
    fetchMessagesDirectly();
  }, [modelid, loggedInUserId, reduxUserId, localUserid, fetchMessagesDirectly]);

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
      }; 
      name: string; 
      photolink: string; 
    }) => {
      const decodedModelid = decodeURIComponent(modelid);
      
      // Since we now pass only the target user ID, we don't need to split by comma
      const targetUserId = decodedModelid;
      
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
          status: 'delivered' as const
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
          setTimeout(() => scrollToBottom(), 50);
        }
      }
    };

    socket.on("LiveChat", handleLiveChat);

    return () => {
      socket.off("LiveChat", handleLiveChat);
    };
  }, [loggedInUserId, modelid]);

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
  //       let ids = modelid.split(",");
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
  //     let ids = modelid.split(",");

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

  //       //let ids = modelid.split(",");

  //       socket.emit("message", content);
  //       setsendL(true);
  //       dispatch(
  //         send_gift({
  //           token,
  //           modelid: ids[0],
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
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload files to backend
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

    const decodedModelid = decodeURIComponent(modelid);
    
    // Since we now pass only the target user ID, we don't need to split by comma
    const targetUserId = decodedModelid;

    if (!loggedInUserId) {
      toast.error("Please log in to send messages");
      return;
    }

    if (!targetUserId) {
      toast.error("Invalid recipient");
      return;
    }

    if (loggedInUserId) {
      setchatphotolink(profilephotolink);
      setchatusername(profilename);
    }

    setUploading(true);

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
        return;
      }
      
      // Create optimistic message with sending status
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const chats = {
        name: chatusername,
        content: content.content,
        date: content.date,
        photolink: chatphotolink,
        id: content.fromid,
        coin: false,
        files: fileUrls,
        fileCount: fileUrls.length,
        messageId: `${content.fromid}-${content.date}`,
        status: 'sending' as const,
        tempId: tempId
      };

      setmessage((value) => [...value, chats]);
      
      // Scroll to bottom after sending message
      setTimeout(() => scrollToBottom(), 50);
      
      settext("");
      setSelectedFiles([]);
      setPreviewFiles([]);
      
      toast.success("Message sent!");
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error('Failed to send message');
      
      // Update the optimistic message status to failed
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      setmessage((prevMessages) => {
        return prevMessages.map((msg) => {
          if (msg.tempId === tempId && msg.status === 'sending') {
            return { ...msg, status: 'failed' as const };
          }
          return msg;
        });
      });
    } finally {
      setUploading(false);
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

  return (
    <div className="h-full w-full">
      {/* Top Bar with Clean Design */}
      <div className="bg-blue-800 backdrop-blur-sm border-b border-blue-700/30 p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-blue-700/50 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center gap-3">
              {/* Profile Picture */}
              <div className="w-12 h-12 rounded-full border-2 border-blue-600/50 overflow-hidden">
                {loading || (!chatusername && !chatfirstname) ? (
                  <div className="w-full h-full bg-gray-600 animate-pulse rounded-full"></div>
                ) : Chatphoto && Chatphoto !== "/icons/icons8-profile_user.png" && !ChatphotoError ? (
                  <Image
                    src={Chatphoto}
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
              
              {/* User Name */}
              <div>
                {loading || (!chatusername && !chatfirstname) ? (
                  <div className="h-5 bg-gray-600 animate-pulse rounded w-24"></div>
                ) : (
                  <p className="font-bold text-white text-lg">
                    {chatfirstname && chatlastname ? `${chatfirstname} ${chatlastname}`.trim() : chatusername || "User"}
                  </p>
                )}
                <p className="text-xs text-blue-300">Direct message</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu />
          </div>
        </div>
      </div>

      {/* Messages Area - Clean Design */}
      <div ref={msgListref} className="h-[calc(100vh-200px)] overflow-y-auto p-4 bg-transparent">
        {loading ? (
          <div className="space-y-4 w-full max-w-4xl mx-auto">
            <div className="flex justify-start mb-4 w-full">
              <div className="w-1/2 px-4 py-3 rounded-2xl bg-blue-800/50 text-white rounded-bl-md border border-blue-700/30">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-400 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-400 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <div className="flex justify-end mb-4 w-full">
              <div className="w-1/2 px-4 py-3 rounded-2xl bg-blue-600 text-white rounded-br-md">
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
          <div className="space-y-4 w-full max-w-4xl mx-auto">
            {messagelist()}
          </div>
        )}
      </div>

      {/* File Preview Area */}
      {previewFiles.length > 0 && (
        <div className="p-4 bg-blue-800/50 border-t border-blue-700/30">
          <div className="flex flex-wrap gap-2">
            {previewFiles.map((preview, index) => (
              <div key={index} className="relative">
                {preview.type === 'image' && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <Image
                      src={preview.preview as string}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {preview.type === 'video' && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                    <video
                      src={preview.preview as string}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {preview.type === 'file' && (
                  <div className="relative w-20 h-20 rounded-lg bg-gray-700 flex flex-col items-center justify-center">
                    <Paperclip className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-300 truncate max-w-16">{preview.file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar - Clean Design */}
      <div className="flex items-center gap-3 p-4 bg-blue-800 border-t border-blue-700/30 sticky bottom-0 z-50">
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
          className="flex-shrink-0 p-3 bg-blue-700 hover:bg-blue-600 text-white rounded-full transition-colors"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <div className="flex items-center flex-1 px-4 py-3 bg-blue-700/50 border border-blue-600/50 rounded-full">
          <textarea
            className="flex-1 h-8 text-white placeholder-blue-300 bg-transparent outline-none resize-none"
            value={text}
            placeholder="Type a message..."
            onChange={(e) => settext(e.target.value)}
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
          className="flex-shrink-0 p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};
