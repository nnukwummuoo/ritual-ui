import { io } from "socket.io-client";

// Socket.io client singleton
let socket: ReturnType<typeof io> | null = null;
let isConnecting = false;

// Helper function to attach socket event listeners
const attachSocketEvents = (socketInstance: ReturnType<typeof io>) => {
  socketInstance.on("connect", () => {
    // Connected to server
  });
  
  socketInstance.on("disconnect", () => {
    // Disconnected from server
  });
  
  socketInstance.on("reconnect", () => {
    // Reconnected to server
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
    console.error("❌ [Socket] Error details:", err);
  });

  socketInstance.on("error", (err) => {
    console.error("❌ [Socket] Socket error:", err);
  });
};

// Online status and typing indicator functions
export const joinUserRoom = (userId: string) => {
  const socket = getSocket();
  if (socket) {
    socket.emit("join_user_room", { userId });
  }
};

export const leaveUserRoom = (userId: string) => {
  const socket = getSocket();
  if (socket) {
    socket.emit("leave_user_room", { userId });
  }
};

export const startTyping = (fromUserId: string, toUserId: string) => {
  const socket = getSocket();
  if (socket) {
    socket.emit("typing_start", { fromUserId, toUserId });
  }
};

export const stopTyping = (fromUserId: string, toUserId: string) => {
  const socket = getSocket();
  if (socket) {
    socket.emit("typing_stop", { fromUserId, toUserId });
  }
};

export const onUserOnline = (callback: (userId: string) => void) => {
  const socket = getSocket();
  if (socket) {
    socket.on("user_online", callback);
  }
};

export const onUserOffline = (callback: (userId: string) => void) => {
  const socket = getSocket();
  if (socket) {
    socket.on("user_offline", callback);
  }
};

export const onTypingStart = (callback: (data: { fromUserId: string, toUserId: string }) => void) => {
  const socket = getSocket();
  if (socket) {
    socket.on("typing_start", callback);
  }
};

export const onTypingStop = (callback: (data: { fromUserId: string, toUserId: string }) => void) => {
  const socket = getSocket();
  if (socket) {
    socket.on("typing_stop", callback);
  }
};

export const removeTypingListeners = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("typing_start");
    socket.off("typing_stop");
    socket.off("user_online");
    socket.off("user_offline");
  }
};

/**
 * Returns a socket.io client instance connected to the backend
 * Creates a new connection if one doesn't exist
 */
export const getSocket = () => {
  if (typeof window === "undefined") return null;
  
  // If already connecting, return existing socket or null
  if (isConnecting && socket) {
    return socket;
  }
  
  if (!socket) {
    isConnecting = true;
    try {
      // Smart configuration: use local server if available, fallback to production
      let socketUrl: string;
      
      // Check if accessing via network IP first
      if (window.location.hostname === '10.245.95.157') {
        // Network access - use network backend (backend listens on 0.0.0.0)
        socketUrl = "http://10.245.95.157:3100";
      } else if (process.env.NODE_ENV === "development") {
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
      
      socket = io(socketUrl, {
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10, // Increased attempts
        reconnectionDelay: 2000, // Increased delay
        reconnectionDelayMax: 10000, // Max delay between attempts
        timeout: 20000, // Connection timeout
        forceNew: false, // Don't force new connection - reuse existing
        transports: ["polling", "websocket"], // Try polling first for better compatibility
        upgrade: true, // Allow transport upgrades
        rememberUpgrade: true, // Remember successful transport
      });
      
      // Attach event listeners
      attachSocketEvents(socket);
      
      // Reset connecting flag when connected
      socket.on("connect", () => {
        isConnecting = false;
      });
      
      // Handle connection errors with fallback
      socket.on("connect_error", (err) => {
        console.error("❌ [Socket] Connection error:", err.message);
        console.error("❌ [Socket] Error details:", err);
        console.error("❌ [Socket] Attempted URL:", socketUrl);
        
        // If connecting to network server failed, try localhost as fallback
        if (socketUrl === "http://10.245.95.157:3100") {
          console.log("🔄 [Socket] Network server not available, trying localhost...");
          
          // Disconnect current socket
          if (socket) {
            socket.disconnect();
          }
          
          // Create new socket with localhost URL
          socket = io("http://localhost:3100", {
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ["websocket", "polling"]
          });
          
          // Re-attach event listeners
          attachSocketEvents(socket);
        }
        // If connecting to local server failed and we're in production build on localhost,
        // try connecting to production server as fallback
        else if (socketUrl === "http://localhost:3100" && 
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
          attachSocketEvents(socket);
        }
      });
      
    } catch (error) {
      console.error("[Socket] Error creating socket connection:", error);
      isConnecting = false;
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
    isConnecting = false;
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