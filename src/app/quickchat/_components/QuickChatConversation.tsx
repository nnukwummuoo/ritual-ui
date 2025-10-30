/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { toast } from "material-react-toastify";
import { URL as API_URL } from "@/api/config";
import axios from "axios";
import Image from "next/image";
import { Send, ArrowLeft, Paperclip, X, File, Download } from "lucide-react";
import { getImageSource } from "@/lib/imageUtils";

export const QuickChatConversation = () => {
  const { userid } = useParams<{ userid: string }>();
  const router = useRouter();
  const msgListRef = useRef<HTMLDivElement>(null);

  const [loggedInUserId, setLoggedInUserId] = useState("");
  const [messages, setMessages] = useState<Array<{
    id: string;
    content: string;
    date: string;
    coin?: boolean;
    files?: string[];
  }>>([]);
  const [chatInfo, setChatInfo] = useState<{
    name: string;
    photolink: string;
    firstname: string;
    lastname: string;
  }>({
    name: "",
    photolink: "",
    firstname: "",
    lastname: ""
  });
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<Array<{
    file: File;
    preview: string | ArrayBuffer | null;
    type: string;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());

  // Get logged in user ID
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          setLoggedInUserId(data?.userID || "");
        }
      } catch (error) {
        console.error("[QuickChat] Error retrieving user ID:", error);
      }
    }
  }, []);

  // Fetch last 3 messages
  const fetchRecentChats = async () => {
    if (!userid || !loggedInUserId) return;

    console.log("🚀 [QUICK_CHAT] Fetching recent chats");
    setLoading(true);

    try {
      const token = (() => {
        try {
          const raw = localStorage.getItem("login");
          if (raw) {
            const data = JSON.parse(raw);
            return data?.refreshtoken || data?.accesstoken;
          }
        } catch (error) {
          console.error("[QuickChat] Error retrieving token:", error);
        }
        return "";
      })();

      const response = await axios.post(
        `${API_URL}/quickchat/recent`,
        {
          userid: loggedInUserId,
          targetUserId: userid,
          token
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ [QUICK_CHAT] Received response:", response.data);

      if (response.data.messages && Array.isArray(response.data.messages)) {
        console.log("📊 [QUICK_CHAT] Processing messages:", response.data.messages.length);
        
        // Log chat info data
        console.log("👤 [QUICK_CHAT] Chat Info:", {
          name: response.data.chatInfo?.name,
          photolink: response.data.chatInfo?.photolink,
          photolinkType: typeof response.data.chatInfo?.photolink,
          photolinkLength: response.data.chatInfo?.photolink?.length,
          isDataImage: response.data.chatInfo?.photolink?.startsWith('data:image'),
          isUrl: response.data.chatInfo?.photolink?.startsWith('http'),
          isEmpty: !response.data.chatInfo?.photolink || response.data.chatInfo?.photolink.trim() === "",
          isNull: response.data.chatInfo?.photolink === null,
          isUndefined: response.data.chatInfo?.photolink === undefined,
          firstname: response.data.chatInfo?.firstname,
          lastname: response.data.chatInfo?.lastname
        });
        
        // Additional logging for data images
        if (response.data.chatInfo?.photolink?.startsWith('data:image')) {
          console.log(`🖼️ [QUICK_CHAT] Data image detected for ${response.data.chatInfo.name}:`, {
            mimeType: response.data.chatInfo.photolink.split(',')[0],
            dataLength: response.data.chatInfo.photolink.split(',')[1]?.length,
            preview: response.data.chatInfo.photolink.substring(0, 50) + '...'
          });
        }
        
        // Log each message's data
        response.data.messages.forEach((msg: any, index: number) => {
          console.log(`💬 [QUICK_CHAT] Message ${index + 1}:`, {
            id: msg.id,
            content: msg.content,
            date: msg.date,
            files: msg.files,
            fileCount: msg.fileCount,
            coin: msg.coin
          });
        });
        
        setMessages(response.data.messages);
        setChatInfo(response.data.chatInfo);
        setProfileLoading(false); // Profile data is loaded
      } else {
        setMessages([]);
      }

            setLoading(false);
    } catch (error) {
      console.error("❌ [QUICK_CHAT] Error fetching chats:", error);
      setLoading(false);
      toast.error("Failed to load messages");
    }
  };

  // Fetch on load
  useEffect(() => {
    if (userid && loggedInUserId) {
      fetchRecentChats();
    }
  }, [userid, loggedInUserId]);

  // Socket connection for real-time messages
  useEffect(() => {
    const socket = getSocket();
    
    if (!socket || !loggedInUserId) return;

    console.log("🔌 [QUICK_CHAT] Setting up socket connection");
    socket.emit("online", loggedInUserId);

    const handleLiveChat = (data: any) => {
      console.log("📨 [QUICK_CHAT] Received LiveChat event:", data);
      
      const isFromTarget = data.data.fromid === userid && data.data.toid === loggedInUserId;
      const isFromMe = data.data.fromid === loggedInUserId && data.data.toid === userid;
      
      if (isFromTarget || isFromMe) {
        const newMessage = {
          id: data.data.fromid,
          content: data.data.content,
          date: data.data.date,
          coin: data.data.coin || false,
          files: data.data.files || []
        };
        
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on("LiveChat", handleLiveChat);

    return () => {
      socket.off("LiveChat", handleLiveChat);
    };
  }, [loggedInUserId, userid]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file sizes
    const validFiles = files.filter(file => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      const maxSize = isVideo ? 10 * 1024 * 1024 : isImage ? 5 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for video, 5MB for image
      
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max size: ${isVideo ? '10MB' : '5MB'}`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setSelectedFiles(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewFiles(prev => [...prev, {
          file,
          preview: e.target?.result || null,
          type: file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : 'file'
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload files to backend (now using Storj)
  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return [];

    const formData = new FormData();
    files.forEach(file => {
      formData.append('file', file);
    });

    try {
      const token = (() => {
        try {
          const raw = localStorage.getItem("login");
          if (raw) {
            const data = JSON.parse(raw);
            return data?.refreshtoken || data?.accesstoken;
          }
        } catch (error) {
          console.error("[QuickChat] Error retrieving token:", error);
        }
        return "";
      })();

      const response = await axios.post(
        `${API_URL}/upload-message-files`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data.fileUrls || [];
    } catch (error) {
      console.error("❌ [QUICK_CHAT] Error uploading files:", error);
      console.error("❌ [QUICK_CHAT] Error response:", error.response?.data);
      console.error("❌ [QUICK_CHAT] Error status:", error.response?.status);
      toast.error(`Failed to upload files: ${error.response?.data?.message || error.message}`);
      return [];
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!text.trim() && selectedFiles.length === 0) {
      toast.error("Please enter a message or select files");
      return;
    }

    const socket = getSocket();
    
    if (!socket) {
      toast.error("Connection lost. Please refresh.");
      return;
    }

    setUploading(true);

    try {
      // Upload files if any
      let fileUrls: string[] = [];
      if (selectedFiles.length > 0) {
        console.log("📤 [QUICK_CHAT] Uploading files...");
        fileUrls = await uploadFiles(selectedFiles);
        console.log("📤 [QUICK_CHAT] Files uploaded:", fileUrls);
        
        if (fileUrls.length === 0 && selectedFiles.length > 0) {
          toast.error("Failed to upload files. Please try again.");
          setUploading(false);
          return;
        }
      }

      const messageContent = {
        fromid: loggedInUserId,
        content: text || (fileUrls.length > 0 ? "📎 File shared" : ""),
        toid: userid,
        date: Date.now().toString(),
        favourite: false,
        notify: true,
        coin: false,
        files: fileUrls,
        fileCount: fileUrls.length
      };

      console.log("📤 [QUICK_CHAT] Sending message:", messageContent);
      socket.emit("message", messageContent);

      // Optimistic update
      setMessages((prev) => [
        ...prev,
        {
          id: loggedInUserId,
          content: messageContent.content,
          date: messageContent.date,
          coin: false,
          files: fileUrls
        }
      ]);

      setText("");
      setSelectedFiles([]);
      setPreviewFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success("Message sent!");
    } catch (error) {
      console.error("❌ [QUICK_CHAT] Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setUploading(false);
    }
  };


  // Get user initials for fallback
  const getUserInitials = (name: string) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0).toUpperCase()}${names[names.length - 1].charAt(0).toUpperCase()}`;
    } else {
      return names[0].charAt(0).toUpperCase();
    }
  };

  // Get random color for initials
  const getRandomColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-amber-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Message skeleton component
  const MessageSkeleton = ({ isUser }: { isUser: boolean }) => (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 w-full`}>
      <div className={`w-1/2 px-4 py-3 rounded-2xl ${
        isUser 
          ? 'bg-blue-600 text-white rounded-br-md' 
          : 'bg-blue-800/50 text-white rounded-bl-md border border-blue-700/30'
      }`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-400 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-400 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  // File preview component with skeleton loading
  const FilePreview = ({ fileUrl, fileName, fileIndex }: { fileUrl: string; fileName?: string; fileIndex: number }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    
    // Determine file type - since we're getting file IDs, we need to check the actual content
    // For now, let's assume all files are images since we don't have file extensions
    const isImage = true; // Assume all files are images for now
    const isVideo = false;
    const isDocument = false;
    
    // Handle URLs like post.tsx does - use API endpoints for Appwrite files
    const isHttpUrl = fileUrl.startsWith('http');
    const isBlobUrl = fileUrl.startsWith('blob:');
    const isDataUrl = fileUrl.startsWith('data:');
    const isUrl = isHttpUrl || isBlobUrl || isDataUrl;
    
    // For Appwrite files, use the API endpoint like post.tsx
    const queryUrlPrimary = fileUrl ? `${API_URL}/api/image/view?publicId=${encodeURIComponent(fileUrl)}` : "";
    const pathUrlPrimary = fileUrl ? `${API_URL}/api/image/view/${encodeURIComponent(fileUrl)}` : "";
    const queryUrlFallback = fileUrl ? `https://backendritual.work/api/image/view?publicId=${encodeURIComponent(fileUrl)}` : "";
    const pathUrlFallback = fileUrl ? `https://backendritual.work/api/image/view/${encodeURIComponent(fileUrl)}` : "";
    
    // Use direct URL if it's already a full URL, otherwise use API endpoint
    const fullUrl = isUrl ? fileUrl : queryUrlPrimary;
    
    const handleLoad = () => {
      setIsLoading(false);
    };
    
    const handleError = (error?: any) => {
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
                handleError(e);
              }}
              style={{ display: isLoading ? 'none' : 'block' }}
            />
            {isLoading && (
              <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        )}
        
        {isVideo && (
          <div className="relative">
            <video
              src={fullUrl}
              controls
              className="rounded-lg max-w-full h-auto"
              style={{ maxHeight: '200px', display: isLoading ? 'none' : 'block' }}
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
            {isLoading && (
              <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
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

  return (
    <div className="h-full w-full">
      {/* Top Bar with Retry Button */}
      <div className="bg-blue-800 backdrop-blur-sm border-b border-blue-700/30 p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-blue-700/50 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            
            <div className="flex items-center gap-3">
              {/* Profile Picture */}
              <div className="w-12 h-12 rounded-full border-2 border-blue-600/50 overflow-hidden">
                {(() => {
                  console.log(`🖼️ [QUICK_CHAT_CONVERSATION] Rendering profile image for: ${chatInfo.name}`, {
                    photolink: chatInfo.photolink,
                    hasPhotolink: !!chatInfo.photolink,
                    isDataImage: chatInfo.photolink?.startsWith('data:image'),
                    isUrl: chatInfo.photolink?.startsWith('http'),
                    isEmpty: !chatInfo.photolink || chatInfo.photolink.trim() === "",
                    profileLoading,
                    willShowImage: chatInfo.photolink && 
                                 chatInfo.photolink.trim() !== "" && 
                                 chatInfo.photolink !== "null" && 
                                 chatInfo.photolink !== "undefined" &&
                                 chatInfo.photolink !== null &&
                                 chatInfo.photolink !== undefined &&
                                 chatInfo.photolink.length > 0
                  });
                  
                  // Test data image handling
                  if (chatInfo.photolink?.startsWith('data:image')) {
                    console.log(`🧪 [QUICK_CHAT_CONVERSATION] Testing data image for ${chatInfo.name}:`, {
                      isValidDataUrl: chatInfo.photolink.includes(','),
                      hasMimeType: chatInfo.photolink.split(',')[0]?.includes('image'),
                      dataSize: chatInfo.photolink.split(',')[1]?.length,
                      canRender: chatInfo.photolink.length > 100 // Basic size check
                    });
                  }
                  
                  if (profileLoading) {
                    return <div className="w-full h-full bg-gray-600 animate-pulse rounded-full"></div>;
                  }
                  
                  if (chatInfo.photolink && 
                      chatInfo.photolink.trim() !== "" && 
                      chatInfo.photolink !== "null" && 
                      chatInfo.photolink !== "undefined" &&
                      chatInfo.photolink !== null &&
                      chatInfo.photolink !== undefined &&
                      chatInfo.photolink.length > 0) {
                    const imageSource = getImageSource(chatInfo.photolink, 'profile');
                    return (
                      <Image
                        src={imageSource.src}
                        alt="profile"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        onLoad={() => {
                          console.log("✅ [QUICK_CHAT_CONVERSATION] Profile image loaded successfully");
                          setProfileLoading(false);
                        }}
                        onError={(e) => {
                          console.log("🖼️ [QUICK_CHAT_CONVERSATION] Profile image load error:", chatInfo.photolink);
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "/icons/icons8-profile_user.png";
                          setProfileLoading(false);
                        }}
                      />
                    );
                  }
                  
                  return (
                    <div className={`w-full h-full flex items-center justify-center text-white font-semibold ${getRandomColor(chatInfo.name || "User")}`}>
                      {getUserInitials(chatInfo.name || "User")}
                    </div>
                  );
                })()}
              </div>
              
              {/* User Name */}
              <div>
                {profileLoading ? (
                  <div className="h-5 bg-gray-600 animate-pulse rounded w-24"></div>
                ) : (
                  <p className="font-bold text-white text-lg">
                    {chatInfo.name || "User"}
                  </p>
                )}
                <p className="text-xs text-blue-300">Last 30 messages</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-[calc(100vh-200px)] overflow-y-auto p-4 bg-transparent">
        {loading ? (
          <div className="space-y-4 w-full max-w-4xl mx-auto">
            <MessageSkeleton isUser={false} />
            <MessageSkeleton isUser={true} />
            <MessageSkeleton isUser={false} />
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 w-full max-w-4xl mx-auto" ref={msgListRef}>
            {messages.length > 0 ? (
              messages.map((msg, index) => {
                const isUser = msg.id === loggedInUserId;
                const messageTime = new Date(Number(msg.date)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 w-full`}>
                    <div className={`w-1/2 px-4 py-3 rounded-2xl ${
                      isUser 
                        ? 'bg-blue-600 text-white rounded-br-md' 
                        : 'bg-blue-800/50 text-white rounded-bl-md border border-blue-700/30'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      
                      {/* Display files if any */}
                      {msg.files && msg.files.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {msg.files.map((fileUrl, fileIndex) => (
                            <FilePreview
                              key={fileIndex}
                              fileUrl={fileUrl}
                              fileName={`File ${fileIndex + 1}`}
                              fileIndex={fileIndex}
                            />
                          ))}
                        </div>
                      )}
                      
                      <p className="text-xs opacity-70 mt-1">{messageTime}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-slate-400">
                <p>Start Conversation!</p>
                <p className="text-sm mt-2">Send a message to begin</p>
              </div>
            )}
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

      {/* Input Bar */}
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
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
        </div>

        <button 
          onClick={sendMessage} 
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
