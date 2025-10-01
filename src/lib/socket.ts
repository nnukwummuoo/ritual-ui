import { io } from "socket.io-client";

// Socket.io client singleton
let socket: ReturnType<typeof io> | null = null;

// Helper function to attach socket event listeners
const attachSocketEvents = (socketInstance: ReturnType<typeof io>, socketUrl: string) => {
  socketInstance.on("connect", () => {
    console.log("✅ [Socket] Connected to server at:", socketUrl);
    console.log("✅ [Socket] Socket ID:", socketInstance.id);
    console.log("✅ [Socket] Transport:", socketInstance.io.engine.transport.name);
  });
  
  socketInstance.on("disconnect", (reason) => {
    console.log("⚠️ [Socket] Disconnected:", reason);
    console.log("⚠️ [Socket] Was connected:", socketInstance.connected);
  });
  
  socketInstance.on("reconnect", (attemptNumber) => {
    console.log("🔄 [Socket] Reconnected after", attemptNumber, "attempts");
    console.log("🔄 [Socket] New Socket ID:", socketInstance.id);
  });
  
  socketInstance.on("reconnect_error", (err) => {
    console.error("❌ [Socket] Reconnection error:", err.message);
    console.error("❌ [Socket] Error details:", err);
  });
  
  socketInstance.on("reconnect_failed", () => {
    console.error("❌ [Socket] Reconnection failed - giving up");
  });

  socketInstance.on("connect_error", (err) => {
    console.error("❌ [Socket] Connection error:", err.message);
    console.error("❌ [Socket] Error type:", err.type);
    console.error("❌ [Socket] Error description:", err.description);
  });

  socketInstance.on("error", (err) => {
    console.error("❌ [Socket] Socket error:", err);
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
        // Production: determine URL based on hostname
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          // Local production build - try local server first
          socketUrl = "http://localhost:3100";
        } else if (window.location.hostname.includes('vercel.app')) {
          // Vercel deployment - use production backend
          socketUrl = "https://mmekoapi.onrender.com";
        } else {
          // Other production domains - use production URL
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
        reconnectionAttempts: 10, // Increased attempts
        reconnectionDelay: 2000, // Increased delay
        reconnectionDelayMax: 10000, // Max delay between attempts
        maxReconnectionAttempts: 10,
        timeout: 20000, // Connection timeout
        forceNew: true, // Force new connection
        transports: ["polling", "websocket"], // Try polling first for better compatibility
        upgrade: true, // Allow transport upgrades
        rememberUpgrade: true, // Remember successful transport
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