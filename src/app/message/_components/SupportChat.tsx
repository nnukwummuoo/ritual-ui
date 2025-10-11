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
  const [previewFiles, setPreviewFiles] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(true);
  
  // Support chat specific state
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [supportChat, setSupportChat] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        
        // Check for support message from form
        const supportMessage = localStorage.getItem("supportMessage");
        
        if (supportMessage) {
          // Create new support chat with category selection
          setShowCategorySelection(true);
          localStorage.removeItem("supportMessage");
          return;
        }
        
        // Try to get existing support chat
        const response = await fetch(`${API_URL}/support-chat/user/${loggedInUserId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.ok && data.supportChat) {
            setSupportChat(data.supportChat);
            setMessages(data.supportChat.messages || []);
          } else {
            // No active chat found, show category selection
            setShowCategorySelection(true);
          }
        } else {
          // Error or no chat found, show category selection
          setShowCategorySelection(true);
        }
      } catch (error) {
        console.error('Error loading support chat:', error);
        setShowCategorySelection(true);
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

    socket.on('support_message_received', handleSupportMessage);

    return () => {
      socket.off('support_message_received', handleSupportMessage);
    };
  }, [loggedInUserId]);

  // Handle typing indicators
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      startTyping('support');
    }
    
    // Clear existing timeout
    if (window.typingTimeout) {
      clearTimeout(window.typingTimeout);
    }
    
    // Set new timeout
    window.typingTimeout = setTimeout(() => {
      setIsTyping(false);
      stopTyping('support');
    }, 2000);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewFiles(prev => [...prev, ...newPreviews]);
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewFiles(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      return newPreviews.filter((_, i) => i !== index);
    });
  };

  // Handle category selection
  const handleCategorySelect = async (category: string) => {
    try {
      const supportMessage = localStorage.getItem("supportMessage") || "Hello, I need help with " + category.toLowerCase();
      
      const response = await fetch(`${API_URL}/support-chat/create-or-get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: loggedInUserId,
          category: category,
          message: supportMessage
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSupportChat(data.supportChat);
        setMessages(data.supportChat.messages || []);
        setShowCategorySelection(false);
        localStorage.removeItem("supportMessage");
        toast.success('Support chat created successfully!');
      } else {
        toast.error('Failed to create support chat');
      }
    } catch (error) {
      console.error('Error creating support chat:', error);
      toast.error('Error creating support chat');
    }
  };

  // Send message function
  const send_chat = async (messageText: string) => {
    if (!messageText.trim() && selectedFiles.length === 0) return;
    if (!supportChat) return;
    
    try {
      const response = await fetch(`${API_URL}/support-chat/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: loggedInUserId,
          message: messageText,
          files: [] // TODO: Handle file uploads
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.supportChat.messages || []);
        setText("");
        setSelectedFiles([]);
        setPreviewFiles([]);
        toast.success('Message sent successfully!');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
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
          <p className="text-white">Loading support chat...</p>
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
                  src={supportPhoto}
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

      {/* File Preview Area */}
      {previewFiles.length > 0 && (
        <div className="p-4 bg-gray-800/50 border-t border-gray-700/30">
          <div className="flex flex-wrap gap-2">
            {previewFiles.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index}`}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
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
          accept="image/*,video/*,.pdf,.doc,.docx"
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
          disabled={(!text.trim() && selectedFiles.length === 0) || uploading}
          className="flex-shrink-0 p-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
        >
          {uploading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};