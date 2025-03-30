import { io } from "socket.io-client";
let socketInstance = null;

export const initializeSocket = (username) => {
  if (!username) {
    console.error("Username required to initialize socket");
    throw new Error("Username is required.");
  }

  // Clean up existing connection
  if (socketInstance) {
    console.log("Cleaning up previous socket connection");
    socketInstance.disconnect();
    socketInstance = null;
  }

  const serverUrl = import.meta.env.VITE_SERVER_URL;
  console.log(`Connecting to socket server at: ${serverUrl}`);

  try {
    // Create new instance with manual connection
    socketInstance = io(serverUrl, {
      query: { username },
      autoConnect: false, // Manual connection after event setup
    });

    // Setup error handlers first
    socketInstance.on("connect_error", (error) => {
      console.error("Connection Error:", error.message);
    });

    socketInstance.on("error", (error) => {
      console.error("Socket Error:", error.message);
    });

    // Initiate connection after setting up handlers
    socketInstance.connect();
    return socketInstance;
  } catch (error) {
    console.error("Socket initialization failed:", error);
    socketInstance = null;
    throw error;
  }
};

export const getSocket = () => {
  if (!socketInstance) {
    throw new Error("Socket not initialized. Call initializeSocket first.");
  }
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};