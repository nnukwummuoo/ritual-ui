import { io } from "socket.io-client";
import { URL } from "@/api/config";

// Socket.io client singleton
let socket: ReturnType<typeof io> | null = null;

/**
 * Returns a socket.io client instance connected to the backend
 * Creates a new connection if one doesn't exist
 */
export const getSocket = () => {
  if (typeof window === "undefined") return null;
  
  if (!socket) {
    try {
      socket = io(URL, {
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ["websocket", "polling"] // Try websocket first, fallback to polling
      });
      
      // Debug connection events
      socket.on("connect", () => {
        console.log("[Socket] Connected to server");
      });
      
      socket.on("connect_error", (err) => {
        console.error("[Socket] Connection error:", err.message);
      });
      
      socket.on("disconnect", (reason) => {
        console.log("[Socket] Disconnected:", reason);
      });
      
    } catch (error) {
      console.error("[Socket] Error creating socket connection:", error);
      return null;
    }
  }
  
  return socket;
};

/**
 * Disconnect and reset the socket connection
 */
export const resetSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};