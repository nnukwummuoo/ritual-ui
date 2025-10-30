// Socket.IO Connection Test Utility
import { io } from "socket.io-client";

export const testSocketConnection = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    console.log("🧪 [Socket Test] Testing connection to:", url);
    
    const testSocket = io(url, {
      withCredentials: true,
      autoConnect: true,
      timeout: 10000,
      transports: ["polling", "websocket"],
    });

    let resolved = false;

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        testSocket.disconnect();
      }
    };

    testSocket.on("connect", () => {
      console.log("✅ [Socket Test] Connection successful to:", url);
      cleanup();
      resolve(true);
    });

    testSocket.on("connect_error", (err) => {
      console.error("❌ [Socket Test] Connection failed to:", url);
      console.error("❌ [Socket Test] Error:", err.message);
      cleanup();
      resolve(false);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!resolved) {
        console.log("⏰ [Socket Test] Connection timeout to:", url);
        cleanup();
        resolve(false);
      }
    }, 10000);
  });
};

export const diagnoseSocketIssues = async () => {
  console.log("🔍 [Socket Diagnosis] Starting connection diagnosis...");
  
  const testUrls = [
    "http://localhost:3100",
    "https://backendritual.work"
  ];

  for (const url of testUrls) {
    const isConnected = await testSocketConnection(url);
    console.log(`${isConnected ? '✅' : '❌'} [Socket Diagnosis] ${url}: ${isConnected ? 'Connected' : 'Failed'}`);
  }
};
