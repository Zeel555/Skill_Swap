import { createContext, useContext, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  const baseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "")
    : "http://localhost:5000";

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
        }
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
