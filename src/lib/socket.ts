import { io } from "socket.io-client";

// Socket.io client singleton
let socket: ReturnType<typeof io> | null = null;

// Helper function to attach socket event listeners
const attachSocketEvents = (socketInstance: ReturnType<typeof io>, socketUrl: string) => {
  socketInstance.on("connect", () => {
    console.log("✅ [Socket] Connected to server at:", socketUrl);
  });
  
  socketInstance.on("disconnect", (reason) => {
    console.log("⚠️ [Socket] Disconnected:", reason);
  });
  
  socketInstance.on("reconnect", (attemptNumber) => {
    console.log("🔄 [Socket] Reconnected after", attemptNumber, "attempts");
  });
  
  socketInstance.on("reconnect_error", (err) => {
    console.error("❌ [Socket] Reconnection error:", err.message);
  });
  
  socketInstance.on("reconnect_failed", () => {
    console.error("❌ [Socket] Reconnection failed - giving up");
  });
};

/**
 * Returns a socket.io client instance connected to the backend
 * Creates a new connection if one doesn't exist
 */
export const getSocket = () => {
  if (typeof window === "undefined") return null;
  
  if (!socket) {
    try {
      // Smart configuration: use local server if available, fallback to production
      let socketUrl: string;
      
      if (process.env.NODE_ENV === "development") {
        // Development: always use local server
        socketUrl = "http://localhost:3100";
      } else {
        // Production: try local server first (if running), then fallback to production
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          // Local production build - try local server first
          socketUrl = "http://localhost:3100";
        } else {
          // Actual production - use production URL
          socketUrl = "https://mmekoapi.onrender.com";
        }
      }
      
      console.log("[Socket] Environment:", process.env.NODE_ENV);
      console.log("[Socket] Hostname:", window.location.hostname);
      console.log("[Socket] Connecting to:", socketUrl);
      
      socket = io(socketUrl, {
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ["websocket", "polling"] // Try websocket first, fallback to polling
      });
      
      // Attach event listeners
      attachSocketEvents(socket, socketUrl);
      
      // Handle connection errors with fallback
      socket.on("connect_error", (err) => {
        console.error("❌ [Socket] Connection error:", err.message);
        console.error("❌ [Socket] Error details:", err);
        console.error("❌ [Socket] Attempted URL:", socketUrl);
        
        // If connecting to local server failed and we're in production build on localhost,
        // try connecting to production server as fallback
        if (socketUrl === "http://localhost:3100" && 
            process.env.NODE_ENV === "production" && 
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          
          console.log("🔄 [Socket] Local server not available, trying production server...");
          
          // Disconnect current socket
          if (socket) {
            socket.disconnect();
          }
          
          // Create new socket with production URL
          socket = io("https://mmekoapi.onrender.com", {
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ["websocket", "polling"]
          });
          
          // Re-attach event listeners
          attachSocketEvents(socket, "https://mmekoapi.onrender.com");
        }
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
    console.log("🔄 [Socket] Resetting connection...");
    socket.disconnect();
    socket = null;
  }
};

/**
 * Force reconnect the socket
 */
export const reconnectSocket = () => {
  console.log("🔄 [Socket] Force reconnecting...");
  resetSocket();
  return getSocket();
};