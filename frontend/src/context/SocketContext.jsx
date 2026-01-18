import { createContext, useContext, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  // Import utility to get API URL (supports network IP)
  const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== "") {
      return import.meta.env.VITE_API_URL.replace("/api", "");
    }
    
    // If accessing from network IP, use that for backend
    const hostname = window.location.hostname;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      const protocol = window.location.protocol === "https:" ? "https:" : "http:";
      const backendPort = import.meta.env.VITE_BACKEND_PORT || "5000";
      return `${protocol}//${hostname}:${backendPort}`;
    }
    
    return "http://localhost:5000";
  };

  const baseUrl = getApiUrl();

  useEffect(() => {
    if (user && !socketRef.current) {
      socketRef.current = io(baseUrl, {
        auth: {
          token: localStorage.getItem("token"),
        },
      });

      socketRef.current.on("connect", () => {
        console.log("✅ GLOBAL socket connected:", socketRef.current.id);
        // Join user's personal room for receiving calls and notifications
        if (user?._id) {
          socketRef.current.emit("join", user._id);
          console.log("🟢 Joined personal room:", user._id);
        }
      });

      socketRef.current.on("disconnect", () => {
        console.log("❌ GLOBAL socket disconnected");
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
      });
    }

    if (!user && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, [user, baseUrl]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
