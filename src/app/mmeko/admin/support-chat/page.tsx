/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthToken } from '@/lib/hooks/useAuthToken';
import { URL } from '@/api/config';
import { toast } from 'material-react-toastify';
import { 
  IoChatbubbleOutline, 
  IoPersonOutline, 
  IoTimeOutline, 
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoArrowBackOutline,
  IoHomeOutline
} from 'react-icons/io5';
import Image from 'next/image';
import { getSocket } from '@/lib/socket';
import { getImageSource } from '@/lib/imageUtils';
import VIPBadge from '@/components/VIPBadge';
import axios from 'axios';
import { Paperclip, X, Send, File, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SupportChat {
  _id: string;
  userid: {
    _id: string;
    firstname: string;
    lastname: string;
    photolink: string;
    email: string;
    isVip?: boolean;
    vipEndDate?: string;
  };
  category: string;
  status: 'open' | 'pending' | 'closed';
  messages: Array<{
    _id: string;
    content: string;
    fromid: string;
    toid: string;
    date: number;
    isAdmin: boolean;
    isVip?: boolean;
    vipEndDate?: string;
  }>;
  lastMessage: string;
  lastMessageDate: number;
  createdAt: number;
}

interface ChatMessage {
  _id: string;
  content: string;
  fromid: string;
  toid: string;
  date: number;
  isAdmin: boolean;
  isVip?: boolean;
  vipEndDate?: string;
  files?: string[];
}

const AdminSupportChat = () => {
  const token = useAuthToken();
  const router = useRouter();
  const [supportChats, setSupportChats] = useState<SupportChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showChatView, setShowChatView] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewFiles, setPreviewFiles] = useState<Array<{
    file: File;
    preview: string | ArrayBuffer | null;
    type: string;
  }>>([]);
  const [selectedFileModal, setSelectedFileModal] = useState<{
    fileUrl: string;
    fileName?: string;
    type: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all support chats
  const loadSupportChats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${URL}/support-chat/admin/all?status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSupportChats(data.supportChats || []);
      } else {
        toast.error('Failed to load support chats');
      }
    } catch (error) {
      console.error('Error loading chat support :', error);
      toast.error('Error loading chat support ');
    } finally {
      setLoading(false);
    }
  };

  // Load specific chat messages
  const loadChatMessages = async (chatId: string) => {
    try {
      const response = await fetch(`${URL}/support-chat/admin/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedChat(data.supportChat);
        setMessages(data.supportChat.messages || []);
        setShowChatView(true); // Show chat view on mobile
      } else {
        toast.error('Failed to load chat messages');
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
      toast.error('Error loading chat messages');
    }
  };

  // Go back to chat list (mobile)
  const goBackToList = () => {
    setShowChatView(false);
    setSelectedChat(null);
    setMessages([]);
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
      const response = await axios.post(`${URL}/upload-message-files`, formData, {
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

  // File preview component
  const FilePreview = ({ fileUrl, fileName }: { fileUrl: string; fileName?: string }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    
    React.useEffect(() => {
      const timeout = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
        }
      }, 5000);
      
      return () => clearTimeout(timeout);
    }, [isLoading, fileUrl]);
    
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
    
    const pathUrlPrimary = fileUrl ? `${URL}/api/image/view/${encodeURIComponent(fileUrl)}` : "";
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

  // Send admin message
  const sendAdminMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !selectedChat) return;

    try {
      setSendingMessage(true);
      setUploading(selectedFiles.length > 0);

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

      const response = await fetch(`${URL}/support-chat/admin/send-message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: selectedChat._id,
          message: newMessage.trim() || (fileUrls.length > 0 ? `Sent ${fileUrls.length} file(s)` : 'File message'),
          files: fileUrls,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.supportChat.messages || []);
        // Clear input immediately
        setNewMessage('');
        setSelectedFiles([]);
        setPreviewFiles([]);
        toast.success('Message sent successfully');
        // Refresh chat list to update last message
        loadSupportChats();
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
      // Clear input even on error to prevent stuck text
      setNewMessage('');
    } finally {
      setSendingMessage(false);
      setUploading(false);
    }
  };

  // Update chat status
  const updateChatStatus = async (chatId: string, status: 'open' | 'pending' | 'closed') => {
    try {
      const response = await fetch(`${URL}/support-chat/admin/${chatId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success(`Chat marked as ${status}`);
        loadSupportChats();
        if (selectedChat?._id === chatId) {
          setSelectedChat(prev => prev ? { ...prev, status } : null);
        }
      } else {
        toast.error('Failed to update chat status');
      }
    } catch (error) {
      console.error('Error updating chat status:', error);
      toast.error('Error updating chat status');
    }
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (token) {
      loadSupportChats();
    }
  }, [token, statusFilter]);

  // Socket integration for real-time updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Join admin support room
    socket.emit('admin_join_support');

    // Listen for new support messages
    const handleNewSupportMessage = (data: any) => {
      // Refresh chat list to show new messages
      loadSupportChats();
      
      // If the message is for the currently selected chat, reload messages
      if (selectedChat && data.chatId === selectedChat._id) {
        loadChatMessages(selectedChat._id);
      }
    };

    socket.on('new_support_message', handleNewSupportMessage);

    return () => {
      socket.off('new_support_message', handleNewSupportMessage);
    };
  }, [selectedChat]);

  // Get unique categories from all chats
  const uniqueCategories = React.useMemo(() => {
    const categories = supportChats.map(chat => chat.category);
    return [...new Set(categories)].sort();
  }, [supportChats]);

  // Filter and sort chats based on search term, category filter, and VIP priority
  const filteredAndSortedChats = React.useMemo(() => {
    // First filter based on search term and category
    const filtered = supportChats.filter(chat => {
      const userName = `${chat.userid.firstname} ${chat.userid.lastname}`.toLowerCase();
      const category = chat.category.toLowerCase();
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = userName.includes(search) || category.includes(search) || chat.lastMessage.toLowerCase().includes(search);
      const matchesCategory = !categoryFilter || chat.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });

    // Then sort: VIP users first, then by status priority, then by date
    return filtered.sort((a: SupportChat, b: SupportChat) => {
      // Priority 1: VIP users first
      if (a.userid.isVip && !b.userid.isVip) {
        return -1;
      }
      if (b.userid.isVip && !a.userid.isVip) {
        return 1;
      }

      // Priority 2: Status priority (pending > open > closed)
      const statusPriority = { 'pending': 3, 'open': 2, 'closed': 1 };
      const aStatusPriority = statusPriority[a.status] || 0;
      const bStatusPriority = statusPriority[b.status] || 0;
      
      if (aStatusPriority !== bStatusPriority) {
        return bStatusPriority - aStatusPriority;
      }

      // Priority 3: Sort by last message date (most recent first)
      return b.lastMessageDate - a.lastMessageDate;
    });
  }, [supportChats, searchTerm, categoryFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <IoChatbubbleOutline className="w-4 h-4" />;
      case 'pending': return <IoTimeOutline className="w-4 h-4" />;
      case 'closed': return <IoCheckmarkCircleOutline className="w-4 h-4" />;
      default: return <IoChatbubbleOutline className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-4 md:p-8 pb-4 border-b border-gray-700 flex-shrink-0">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Support Chat</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
          >
            <IoHomeOutline size={18} />
            <span className="hidden sm:inline">Back to Home</span>
          </button>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat List Sidebar */}
        <div className={`${showChatView ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 border-r border-gray-700 flex-col h-full`}>
        {/* Header */}
        <div className="p-3 md:p-4 border-b border-gray-700">
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Support Chats</h2>
          
          {/* Search */}
          <div className="relative mb-3 md:mb-4">
            <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm md:text-base"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-1 md:gap-2 flex-wrap mb-3">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
                statusFilter === '' ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('open')}
              className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
                statusFilter === 'open' ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
                statusFilter === 'pending' ? 'bg-yellow-500' : 'bg-gray-700'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('closed')}
              className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
                statusFilter === 'closed' ? 'bg-gray-500' : 'bg-gray-700'
              }`}
            >
              Closed
            </button>
          </div>

          {/* Category Filter */}
          <div className="overflow-x-auto">
            <div className="flex gap-1 md:gap-2 min-w-max pb-1">
              <button
                onClick={() => setCategoryFilter('')}
                className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                  categoryFilter === '' ? 'bg-purple-500' : 'bg-gray-700'
                }`}
              >
                All Categories
              </button>
              {uniqueCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                    categoryFilter === category ? 'bg-purple-500' : 'bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredAndSortedChats.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No support chats found
            </div>
          ) : (
            filteredAndSortedChats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => loadChatMessages(chat._id)}
                className={`p-3 md:p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors ${
                  selectedChat?._id === chat._id ? 'bg-gray-800' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                      {chat.userid.photolink ? (
                        <Image
                          src={getImageSource(chat.userid.photolink, 'profile').src}
                          alt={chat.userid.firstname}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-600 text-white font-bold">
                          {chat.userid.firstname.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    {/* VIP Badge for chat list - positioned relative to parent container */}
                    {chat.userid.isVip && (
                      <VIPBadge 
                        size="lg" 
                        className="absolute -top-2 -right-2 z-50" 
                        isVip={chat.userid.isVip} 
                        vipEndDate={chat.userid.vipEndDate} 
                      />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white truncate text-sm md:text-base">
                        {chat.userid.firstname} {chat.userid.lastname}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(chat.status)}`}>
                        {chat.status}
                      </span>
                    </div>
                    
                    <p className="text-xs md:text-sm text-gray-400 mb-1 truncate">
                      {chat.category}
                    </p>
                    
                    <p className="text-xs text-gray-500 truncate">
                      {chat.lastMessage}
                    </p>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(chat.lastMessageDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className={`${showChatView ? 'flex' : 'hidden md:flex'} flex-1 flex-col h-full overflow-hidden`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* Back button for mobile */}
                  <button
                    onClick={goBackToList}
                    className="md:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <IoArrowBackOutline className="w-5 h-5" />
                  </button>
                  
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                      {selectedChat.userid.photolink ? (
                        <Image
                          src={getImageSource(selectedChat.userid.photolink, 'profile').src}
                          alt={selectedChat.userid.firstname}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-600 text-white font-bold">
                          {selectedChat.userid.firstname.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    {/* VIP Badge for chat header - positioned relative to parent container */}
                    {selectedChat.userid.isVip && (
                      <VIPBadge 
                        size="lg" 
                        className="absolute -top-2 -right-2 z-50" 
                        isVip={selectedChat.userid.isVip} 
                        vipEndDate={selectedChat.userid.vipEndDate} 
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {selectedChat.userid.firstname} {selectedChat.userid.lastname}
                    </h3>
                    <p className="text-sm text-gray-400 truncate">{selectedChat.category}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(selectedChat.status)}`}>
                    {selectedChat.status}
                  </span>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateChatStatus(selectedChat._id, 'open')}
                      className="p-2 rounded-lg transition-colors hover:bg-gray-700"
                      title="Mark as Open"
                    >
                      <IoChatbubbleOutline className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => updateChatStatus(selectedChat._id, 'pending')}
                      className="p-2 rounded-lg transition-colors hover:bg-gray-700"
                      title="Mark as Pending"
                    >
                      <IoTimeOutline className="w-4 h-4 text-yellow-400" />
                    </button>
                    <button
                      onClick={() => updateChatStatus(selectedChat._id, 'closed')}
                      className="p-2 rounded-lg transition-colors hover:bg-gray-700"
                      title="Mark as Closed"
                    >
                      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-400" />
                    </button>
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="p-2 rounded-lg transition-colors hover:bg-gray-700"
                      title="Close Chat"
                    >
                      <IoCloseCircleOutline className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 min-h-0">
              {messages.map((message) => {
                const isAdmin = message.isAdmin;
                return (
                  <div
                    key={message._id}
                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-xs lg:max-w-md px-3 md:px-4 py-2 rounded-lg ${
                        isAdmin
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      {/* VIP Badge for user messages */}
                      {!isAdmin && message.isVip && (
                        <div className="flex justify-end items-center gap-2 mb-2">
                          <VIPBadge size="sm" isVip={message.isVip} vipEndDate={message.vipEndDate} />
                          <span className="text-xs py-1 px-2 rounded-full bg-gradient-to-r tracking-wider font-semibold from-[#fb8402] to-[#ad4d01] text-white">VIP</span>
                        </div>
                      )}
                      <p className="text-sm md:text-base break-words">{message.content}</p>
                      
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
                      
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* File Preview Area */}
            {previewFiles.length > 0 && (
              <div className="bg-gray-800/50 border-t border-gray-700 p-3 md:p-4">
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
            )}

            {/* Message Input */}
            <div className="p-3 md:p-4 border-t border-gray-700 bg-gray-800 flex-shrink-0">
              <div className="flex gap-2">
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
                  className="flex-shrink-0 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendAdminMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 px-3 md:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm md:text-base"
                />
                <button
                  onClick={sendAdminMessage}
                  disabled={(!newMessage.trim() && selectedFiles.length === 0) || sendingMessage || uploading}
                  className="px-3 md:px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm md:text-base flex items-center gap-2"
                >
                  {sendingMessage || uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <IoChatbubbleOutline className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a chat to view messages</p>
            </div>
          </div>
        )}
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
                    const pathUrlPrimary = selectedFileModal.fileUrl ? `${URL}/api/image/view/${encodeURIComponent(selectedFileModal.fileUrl)}` : "";
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
                    const pathUrlPrimary = selectedFileModal.fileUrl ? `${URL}/api/image/view/${encodeURIComponent(selectedFileModal.fileUrl)}` : "";
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
    </div>
  );
};

export default AdminSupportChat;
