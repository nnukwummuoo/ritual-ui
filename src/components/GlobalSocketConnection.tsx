"use client";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSocket, joinUserRoom, leaveUserRoom } from "@/lib/socket";
import type { RootState } from "@/store/store";
import { getNotifications } from "@/store/profile";

export default function GlobalSocketConnection() {
  const dispatch = useDispatch();
  const reduxUserid = useSelector((state: RootState) => state.register.userID);
  const reduxIsLoggedIn = useSelector((state: RootState) => state.register.logedin);
  
  // Get userid from localStorage if not in Redux (same pattern as other components)
  const [localUserid, setLocalUserid] = useState("");
  const [localIsLoggedIn, setLocalIsLoggedIn] = useState(false);
  const [hasConnected, setHasConnected] = useState(false);
  
  const userid = reduxUserid || localUserid;
  const isLoggedIn = reduxIsLoggedIn || localIsLoggedIn;


  // Load userid from localStorage if not in Redux (same pattern as other components)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          
          // Set user ID if not in Redux
          if (!reduxUserid && data?.userID) {
            setLocalUserid(data.userID);
            setLocalIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error("[GlobalSocket] Error retrieving data from localStorage:", error);
      }
    }
  }, [reduxUserid]);

  useEffect(() => {
    // Only connect if user is logged in and we have a user ID
    if (!isLoggedIn || !userid) {
      setHasConnected(false);
      return;
    }

    // Prevent multiple connections for the same user
    if (hasConnected) {
      return;
    }

    const socket = getSocket();
    if (!socket) {
      return;
    }

    // Wait for socket to be connected
    if (!socket.connected) {
      const handleConnect = () => {
        // Join user room for online status (same as message components)
        joinUserRoom(userid);
        console.log('🌐 [GlobalSocket] Emitting online status for user:', userid, 'Type:', typeof userid);
        socket.emit("online", userid);
        setHasConnected(true);
      };
      
      socket.on("connect", handleConnect);
      
      return () => {
        socket.off("connect", handleConnect);
      };
    }

    // Join user room for online status (same as message components)
    joinUserRoom(userid);
    
    // Emit online status when user is authenticated
    console.log('🌐 [GlobalSocket] Emitting online status for user:', userid, 'Type:', typeof userid);
    socket.emit("online", userid);
    setHasConnected(true);
    
    // Set up heartbeat to keep user online
    const heartbeatInterval = setInterval(() => {
      if (socket && socket.connected) {
        console.log('💓 [GlobalSocket] Sending heartbeat for user:', userid);
        socket.emit("heartbeat", userid);
      }
    }, 15000); // Send heartbeat every 15 seconds

      // Handle missed call notifications
      const handleMissedCall = (data: any) => {
        // Refresh notifications to show the new missed call
        if (userid) {
          try {
            dispatch(getNotifications({ userid, token: null }));
          } catch (error) {
            console.error('Error dispatching getNotifications:', error);
          }
        }
        
        // Show browser notification if permission is granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Missed Video Call', {
            body: `You missed a Fan call from ${data.callerName || 'Unknown User'}`,
            icon: data.callerPhoto || '/icons/logo.png',
            tag: `missed-call-${data.callId}`,
            requireInteraction: true
          });
        }
      };

      // Listen for missed call notifications
      socket.on('video_call_missed', handleMissedCall);

    // Cleanup on unmount or when user logs out
    return () => {
      if (socket && userid) {
        leaveUserRoom(userid);
        socket.emit("offline", userid);
        // Remove missed call listener
        socket.off('video_call_missed', handleMissedCall);
      }
      // Clear heartbeat interval
      clearInterval(heartbeatInterval);
    };
  }, [userid, isLoggedIn, localUserid, localIsLoggedIn, dispatch]); // Added dispatch dependency

  // This component doesn't render anything
  return null;
}
