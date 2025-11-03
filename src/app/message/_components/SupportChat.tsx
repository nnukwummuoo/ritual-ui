/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "@/styles/Navs.css";
import "@/styles/Chat.css";
import { useRouter } from "next/navigation";

import type { RootState } from "@/store/store";
import { getSocket, startTyping, stopTyping } from "@/lib/socket";
import { toast } from "material-react-toastify";
import { URL as API_URL } from "@/api/config";
import axios from "axios";
import Image from "next/image";
import { X, Paperclip, Send, File, Download } from "lucide-react";
import { CategorySelection } from "@/components/support/CategorySelection";
import { getImageSource } from "@/lib/imageUtils";

export const SupportChat = () => {
  const msgListref = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  // Get userid from localStorage if not in Redux
  const [localUserid, setLocalUserid] = React.useState("");
  const reduxUserId = useSelector((state: RootState) => state.register.userID);
  const loggedInUserId = reduxUserId || localUserid;

  // Support-specific data
  const supportName = "Mmeko Support";
  const supportPhoto = "/icons/m-logo.png";
  const supportStatus = "Real human support";

  // State for messages
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewFiles, setPreviewFiles] = useState<Array<{
    file: File;
    preview: string | ArrayBuffer | null;
    type: string;
  }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  // Support chat specific state
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [supportChat, setSupportChat] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstMessage, setIsFirstMessage] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // File modal state
  const [selectedFileModal, setSelectedFileModal] = useState<{
    fileUrl: string;
    fileName?: string;
    type: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load userid from localStorage if not in Redux
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          if (!reduxUserId && data?.userID) {
            setLocalUserid(data.userID);
          }
        }
      } catch (error) {
        console.error("[SupportChat] Error retrieving data from localStorage:", error);
      }
    }
  }, [reduxUserId]);

  // Load support chat
  useEffect(() => {
    const loadSupportChat = async () => {
      if (!loggedInUserId) return;
      
      try {
        setIsLoading(true);
        
        // Try to get existing support chat
        const response = await fetch(`${API_URL}/support-chat/user/${loggedInUserId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.ok && data.supportChat) {
            setSupportChat(data.supportChat);
            setMessages(data.supportChat.messages || []);
            
            // Check if chat is closed - if so, clear messages
            if (data.supportChat.status === 'closed') {
              setMessages([]);
              setSupportChat(null);
              setIsFirstMessage(true); // Allow new chat to start
            }
          } else {
            // No active chat found, prepare for first message
            setIsFirstMessage(true);
          }
        } else {
          // Error or no chat found, prepare for first message
          setIsFirstMessage(true);
        }
      } catch (error) {
        console.error('Error loading chat support :', error);
        setIsFirstMessage(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadSupportChat();
  }, [loggedInUserId]);

  // Socket integration for real-time support chat
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !loggedInUserId) return;

    // Join support chat room
    socket.emit('join_support_chat', { userid: loggedInUserId });

    // Listen for new support messages
    const handleSupportMessage = (data: any) => {
      if (data.userid === loggedInUserId) {
        // Reload messages to get the latest
        const loadMessages = async () => {
          try {
            const response = await fetch(`${API_URL}/support-chat/user/${loggedInUserId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.ok && data.supportChat) {
                setMessages(data.supportChat.messages || []);
              }
            }
          } catch (error) {
            console.error('Error reloading messages:', error);
          }
        };
        loadMessages();
      }
    };

    // Listen for chat status updates (when admin marks as closed)
    const handleChatStatusUpdate = (data: any) => {
      if (data.userid === loggedInUserId && data.status === 'closed') {
        // Clear all messages and reset chat state
        setMessages([]);
        setSupportChat(null);
        setIsFirstMessage(true);
        toast.info('Chat has been closed. You can start a new conversation.');
      }
    };

    socket.on('support_message_received', handleSupportMessage);
    socket.on('support_chat_status_update', handleChatStatusUpdate);

    return () => {
      socket.off('support_message_received', handleSupportMessage);
      socket.off('support_chat_status_update', handleChatStatusUpdate);
    };
  }, [loggedInUserId]);

  // Handle typing indicators
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      startTyping('support', loggedInUserId);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping('support', loggedInUserId);
    }, 2000);
  };

  // File preview component with skeleton loading
  const FilePreview = ({ fileUrl, fileName }: { fileUrl: string; fileName?: string }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    
    // Auto-timeout to prevent infinite loading
    React.useEffect(() => {
      const timeout = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
        }
      }, 5000);
      
      return () => clearTimeout(timeout);
    }, [isLoading, fileUrl]);
    
    // Determine file type based on file extension or URL pattern
    const getFileType = (url: string, name?: string) => {
      const fileName = name || url;
      const extension = fileName.split('.').pop()?.toLowerCase();
      
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
      if (imageExtensions.includes(extension || '')) {
        return 'image';
      }
      
      const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
      if (videoExtensions.includes(extension || '')) {
        return 'video';
      }
      
      const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
      if (documentExtensions.includes(extension || '')) {
        return 'document';
      }
      
      if (url.includes('image') || url.includes('photo') || url.includes('img')) {
        return 'image';
      }
      if (url.includes('video') || url.includes('movie') || url.includes('vid')) {
        return 'video';
      }
      
      return 'image';
    };
    
    const fileType = getFileType(fileUrl, fileName);
    const isImage = fileType === 'image';
    const isVideo = fileType === 'video';
    const isDocument = fileType === 'document';
    
    const imageSource = getImageSource(fileUrl, 'message');
    const fullUrl = imageSource.src;
    
    const pathUrlPrimary = fileUrl ? `${API_URL}/api/image/view/${encodeURIComponent(fileUrl)}` : "";
    const queryUrlFallback = fileUrl ? `${process.env.NEXT_PUBLIC_API || ""}/api/image/view?publicId=${encodeURIComponent(fileUrl)}` : "";
    const pathUrlFallback = fileUrl ? `${process.env.NEXT_PUBLIC_API || ""}/api/image/view/${encodeURIComponent(fileUrl)}` : "";
    
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
      formData.append('file', file);
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

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowCategorySelection(false);
    
    // Set default message text based on category if no text is entered
    if (!text.trim()) {
      setText("Hello, I need help with " + category.toLowerCase());
    }
  };

  // Send message function
  const send_chat = async (messageText: string) => {
    if (!messageText.trim() && selectedFiles.length === 0) return;
    
    // If this is the first message and no support chat exists, show category selection
    if (isFirstMessage && !supportChat && !selectedCategory) {
      setShowCategorySelection(true);
      return;
    }
    
    // Set loading state
    setIsSending(true);
    setUploading(selectedFiles.length > 0);
    
    try {
      let fileUrls: string[] = [];
      
      // Upload files if any
      if (selectedFiles.length > 0) {
        try {
          fileUrls = await uploadFiles(selectedFiles);
        } catch (uploadError) {
          console.error("File upload failed:", uploadError);
          toast.error("File upload failed. Sending message without files.");
          fileUrls = [];
        }
      }
      
      let response;
      
      // If this is the first message with a selected category, create chat and send message
      if (isFirstMessage && selectedCategory && !supportChat) {
        response = await fetch(`${API_URL}/support-chat/create-or-get`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userid: loggedInUserId,
            category: selectedCategory,
            message: messageText || (fileUrls.length > 0 ? `Sent ${fileUrls.length} file(s)` : 'File message'),
            files: fileUrls
          })
        });
      } else if (supportChat) {
        // Send message to existing chat
        response = await fetch(`${API_URL}/support-chat/send-message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userid: loggedInUserId,
            message: messageText || (fileUrls.length > 0 ? `Sent ${fileUrls.length} file(s)` : 'File message'),
            files: fileUrls
          })
        });
      } else {
        toast.error('Please select a category first');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setSupportChat(data.supportChat);
        setMessages(data.supportChat.messages || []);
        // Clear input immediately
        setText("");
        setSelectedFiles([]);
        setPreviewFiles([]);
        setIsFirstMessage(false);
        setSelectedCategory(''); // Clear selected category after first message
        
        // Show different success message for report categories
        if (['Report a Fan', 'Report a Creator'].includes(selectedCategory)) {
          toast.success('Report submitted successfully! Our team will review it shortly.');
        } else {
          toast.success('Message sent successfully!');
        }
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
      // Clear input even on error to prevent stuck text
      setText("");
    } finally {
      // Clear loading state
      setIsSending(false);
      setUploading(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (msgListref.current) {
      msgListref.current.scrollTop = msgListref.current.scrollHeight;
    }
  }, [messages]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading chat support...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Category Selection Modal */}
      {showCategorySelection && (
        <CategorySelection
          onCategorySelect={handleCategorySelect}
          onClose={() => setShowCategorySelection(false)}
        />
      )}

      {/* Top Bar with Support Info */}
      <div className="bg-gray-800 backdrop-blur-sm border-b border-gray-700/30 p-3 sm:p-4 sticky top-0 z-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-700/50 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                <Image
                  src="/support.png"
                  alt={supportName}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{supportName}</h2>
                <p className="text-sm text-green-400">{supportStatus}</p>
                {supportChat?.category && (
                  <p className="text-xs text-blue-400 mt-1">
                    Category: {supportChat.category}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={msgListref} className="flex-1 overflow-y-auto p-3 sm:p-4 bg-transparent">
        <div className="space-y-4 w-full max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isUser = message.fromid === loggedInUserId;
              const isAdmin = message.isAdmin;
              
              return (
                <div key={message._id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 w-full`}>
                  <div className={`w-1/2 px-4 py-3 rounded-2xl ${
                    isUser 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md' 
                      : isAdmin
                      ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-bl-md'
                      : 'bg-gray-800/50 text-white rounded-bl-md border border-gray-700/30'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Display files if any */}
                    {message.files && message.files.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.files.map((fileUrl: string, fileIndex: number) => (
                          <FilePreview
                            key={fileIndex}
                            fileUrl={fileUrl}
                            fileName={`File ${fileIndex + 1}`}
                          />
                        ))}
                      </div>
                    )}
                    
                    {message.isReport && (
                      <div className="mt-2 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-300">
                        🚨 Report submitted - Under review
                      </div>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* File Preview Area - Mobile Optimized */}
      {previewFiles.length > 0 && (
        <div className="bg-gray-800/50 border-t border-gray-700/30 sticky z-40" style={{
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
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-800 border-t border-gray-700/30 sticky bottom-0 z-50 flex-shrink-0 pb-safe">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <div className="flex items-center flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-full">
          <textarea
            className="flex-1 h-8 text-white placeholder-gray-300 bg-transparent outline-none resize-none"
            placeholder="Type your message..."
            value={text}
            onChange={handleTyping}
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
          disabled={(!text.trim() && selectedFiles.length === 0) || uploading || isSending}
          className="flex-shrink-0 p-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
        >
          {isSending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : uploading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
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
                    const queryUrlFallback = selectedFileModal.fileUrl ? `${process.env.NEXT_PUBLIC_API || ""}/api/image/view?publicId=${encodeURIComponent(selectedFileModal.fileUrl)}` : "";
                    const pathUrlFallback = selectedFileModal.fileUrl ? `${process.env.NEXT_PUBLIC_API || ""}/api/image/view/${encodeURIComponent(selectedFileModal.fileUrl)}` : "";
                    
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
                    const queryUrlFallback = selectedFileModal.fileUrl ? `${process.env.NEXT_PUBLIC_API || ""}/api/image/view?publicId=${encodeURIComponent(selectedFileModal.fileUrl)}` : "";
                    const pathUrlFallback = selectedFileModal.fileUrl ? `${process.env.NEXT_PUBLIC_API || ""}/api/image/view/${encodeURIComponent(selectedFileModal.fileUrl)}` : "";
                    
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