"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getSocket, joinUserRoom, leaveUserRoom } from "@/lib/socket";
import type { RootState } from "@/store/store";

export default function GlobalSocketConnection() {
  const reduxUserid = useSelector((state: RootState) => state.register.userID);
  const reduxIsLoggedIn = useSelector((state: RootState) => state.register.logedin);
  
  // Get userid from localStorage if not in Redux (same pattern as other components)
  const [localUserid, setLocalUserid] = useState("");
  const [localIsLoggedIn, setLocalIsLoggedIn] = useState(false);
  
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
      return;
    }

    const socket = getSocket();
    if (!socket) {
      return;
    }

    // Wait for socket to be connected
    if (!socket.connected) {
      socket.on("connect", () => {
        // Join user room for online status (same as message components)
        joinUserRoom(userid);
        socket.emit("online", userid);
      });
      return;
    }

    // Join user room for online status (same as message components)
    joinUserRoom(userid);
    
    // Emit online status when user is authenticated
    socket.emit("online", userid);

    // Cleanup on unmount or when user logs out
    return () => {
      if (socket && userid) {
        leaveUserRoom(userid);
        socket.emit("offline", userid);
      }
    };
  }, [userid, isLoggedIn, localUserid, localIsLoggedIn]);

  // This component doesn't render anything
  return null;
}
