"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { URL as API_URL } from "@/api/config";
import axios from "axios";
import Image from "next/image";
import { MessageCircle, Clock } from "lucide-react";

interface QuickChatItem {
  fromid: string;
  toid: string;
  content: string;
  date: string;
  name: string;
  photolink: string;
  messagecount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

export const QuickChatList = ({ userid, isLoggedIn }: { userid: string; isLoggedIn: boolean }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<QuickChatItem[]>([]);

  // Fetch recent conversations with last 3 messages
  const fetchRecentConversations = async () => {
    if (!userid || !isLoggedIn) return;

    console.log("🚀 [QUICK_CHAT_LIST] Fetching recent conversations");
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
          console.error("[QuickChatList] Error retrieving token:", error);
        }
        return "";
      })();

      const response = await axios.post(
        `${API_URL}/quickchat/conversations`,
        {
          userid,
          token
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ [QUICK_CHAT_LIST] Received conversations:", response.data);

      if (response.data.conversations && Array.isArray(response.data.conversations)) {
        console.log("📊 [QUICK_CHAT_LIST] Processing conversations:", response.data.conversations.length);
        
        // Log each conversation's user data
        response.data.conversations.forEach((conv: any, index: number) => {
          console.log(`👤 [QUICK_CHAT_LIST] Conversation ${index + 1}:`, {
            fromid: conv.fromid,
            name: conv.name,
            photolink: conv.photolink,
            photolinkType: typeof conv.photolink,
            photolinkLength: conv.photolink?.length,
            isDataImage: conv.photolink?.startsWith('data:image'),
            isUrl: conv.photolink?.startsWith('http'),
            isEmpty: !conv.photolink || conv.photolink.trim() === "",
            isNull: conv.photolink === null,
            isUndefined: conv.photolink === undefined,
            content: conv.content,
            date: conv.date
          });
          
          // Additional logging for data images
          if (conv.photolink?.startsWith('data:image')) {
            console.log(`🖼️ [QUICK_CHAT_LIST] Data image detected for ${conv.name}:`, {
              mimeType: conv.photolink.split(',')[0],
              dataLength: conv.photolink.split(',')[1]?.length,
              preview: conv.photolink.substring(0, 50) + '...'
            });
          }
        });
        
        setMessages(response.data.conversations);
      } else {
        setMessages([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("❌ [QUICK_CHAT_LIST] Error fetching conversations:", error);
      setLoading(false);
    }
  };

  // Fetch on load
  useEffect(() => {
    if (userid && isLoggedIn) {
      fetchRecentConversations();
    }
  }, [userid, isLoggedIn]);


  const formatTime = (dateString: string) => {
    const date = new Date(Number(dateString));
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  // Generate random background color for user initials
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

  const handleMessageClick = (fromid: string, toid: string) => {
    const targetUserId = fromid === userid ? toid : fromid;
    console.log("🔗 [QUICK_CHAT_LIST] Navigating to quickchat with user:", targetUserId);
    router.push(`/quickchat/${targetUserId}`);
  };

  if (!isLoggedIn || !userid) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-400 text-center">Please log in to view messages</p>
        <p className="text-sm text-gray-500 text-center mt-1">
          Authentication required
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-sm text-gray-400 mt-2">Loading conversations...</p>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-400 text-center">No conversations yet</p>
        <p className="text-sm text-gray-500 text-center mt-1">
          Start a conversation with someone
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {messages.map((message: QuickChatItem, index: number) => {
        return (
          <div
            key={index}
            onClick={() => handleMessageClick(message.fromid, message.toid)}
            className="flex items-center gap-3 p-3 hover:bg-gray-800/50 rounded-lg cursor-pointer transition-colors"
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
                {(() => {
                  console.log(`🖼️ [QUICK_CHAT_LIST] Rendering image for user: ${message.name}`, {
                    photolink: message.photolink,
                    hasPhotolink: !!message.photolink,
                    isDataImage: message.photolink?.startsWith('data:image'),
                    isUrl: message.photolink?.startsWith('http'),
                    isEmpty: !message.photolink || message.photolink.trim() === "",
                    willShowImage: message.photolink && 
                                 message.photolink.trim() !== "" && 
                                 message.photolink !== "null" && 
                                 message.photolink !== "undefined" &&
                                 message.photolink !== null &&
                                 message.photolink !== undefined &&
                                 message.photolink.length > 0
                  });
                  
                  // Test data image handling
                  if (message.photolink?.startsWith('data:image')) {
                    console.log(`🧪 [QUICK_CHAT_LIST] Testing data image for ${message.name}:`, {
                      isValidDataUrl: message.photolink.includes(','),
                      hasMimeType: message.photolink.split(',')[0]?.includes('image'),
                      dataSize: message.photolink.split(',')[1]?.length,
                      canRender: message.photolink.length > 100 // Basic size check
                    });
                  }
                  
                  return message.photolink && 
                         message.photolink.trim() !== "" && 
                         message.photolink !== "null" && 
                         message.photolink !== "undefined" &&
                         message.photolink !== null &&
                         message.photolink !== undefined &&
                         message.photolink.length > 0 ? (
                    <Image
                      src={message.photolink}
                      alt={message.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log("🖼️ [QUICK_CHAT_LIST] Image load error for user:", message.name, "photolink:", message.photolink);
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/icons/icons8-profile_user.png";
                      }}
                      onLoad={() => {
                        console.log("✅ [QUICK_CHAT_LIST] Image loaded successfully for user:", message.name);
                      }}
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-white font-semibold ${getRandomColor(message.name)}`}>
                      {getUserInitials(message.name)}
                    </div>
                  );
                })()}
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
            </div>

            {/* Message content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white truncate">
                  {message.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(message.date)}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 truncate mt-1">
                {message.lastMessage || message.content}
              </p>
              <p className="text-xs text-blue-400 mt-1">Last 3 messages</p>
            </div>

            {/* Unread count */}
            {message.messagecount && message.messagecount > 0 && (
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {message.messagecount > 9 ? '9+' : message.messagecount}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
