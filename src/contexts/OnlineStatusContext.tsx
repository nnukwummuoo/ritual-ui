"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSocket, onUserOnline, onUserOffline, removeTypingListeners } from "@/lib/socket";

interface OnlineStatusContextType {
  onlineUsers: Set<string>;
  isUserOnline: (userId: string) => boolean;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
}

const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(undefined);

export const OnlineStatusProvider = ({ children }: { children: ReactNode }) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const isUserOnline = (userId: string) => {
    return onlineUsers.has(userId);
  };

  const addOnlineUser = (userId: string) => {
    setOnlineUsers(prev => new Set([...prev, userId]));
  };

  const removeOnlineUser = (userId: string) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  };

  // Global socket listeners for online status
  useEffect(() => {
    let cleanup: (() => void) | undefined;

      const setupListeners = () => {
        const socket = getSocket();
        if (!socket) {
          setTimeout(setupListeners, 1000);
          return;
        }

             // Listen for user online events (Part B: Real-time updates)
             const handleUserOnline = (userId: string) => {
               addOnlineUser(userId);
             };

             // Listen for user connected events (Part B: Real-time updates)
             const handleUserConnected = (userId: string) => {
               addOnlineUser(userId);
             };

             // Listen for user offline events
             const handleUserOffline = (userId: string) => {
               removeOnlineUser(userId);
             };

             // Listen for initial online users list (Part A: Initial state synchronization)
             const handleOnlineUsersList = (userIds: string[]) => {
               setOnlineUsers(new Set(userIds));
             };

             // Listen for socket connection to set up listeners
             const handleConnect = () => {
               socket.on("user_online", handleUserOnline);
               socket.on("USER_CONNECTED", handleUserConnected);
               socket.on("user_offline", handleUserOffline);
               socket.on("ONLINE_USERS_LIST", handleOnlineUsersList);
             };

      // Set up listeners immediately if connected, or wait for connection
      if (socket.connected) {
        handleConnect();
      } else {
        socket.on("connect", handleConnect);
      }

             cleanup = () => {
               socket.off("connect", handleConnect);
               socket.off("user_online", handleUserOnline);
               socket.off("USER_CONNECTED", handleUserConnected);
               socket.off("user_offline", handleUserOffline);
               socket.off("ONLINE_USERS_LIST", handleOnlineUsersList);
             };
    };

    // Set up listeners with a small delay to ensure socket is ready
    const timeoutId = setTimeout(setupListeners, 100);
    
    return () => {
      clearTimeout(timeoutId);
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <OnlineStatusContext.Provider
      value={{
        onlineUsers,
        isUserOnline,
        addOnlineUser,
        removeOnlineUser,
      }}
    >
      {children}
    </OnlineStatusContext.Provider>
  );
};

export const useOnlineStatus = (): OnlineStatusContextType => {
  const context = useContext(OnlineStatusContext);
  if (!context) {
    throw new Error("useOnlineStatus must be used within an OnlineStatusProvider");
  }
  return context;
};
