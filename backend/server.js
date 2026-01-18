// ================= IMPORT CORE PACKAGES =================
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const http = require("http");
const helmet = require("helmet");
const { Server } = require("socket.io");
const os = require("os");

// ================= DB + MODELS =================
const connectDB = require("./config/db");
const User = require("./models/User");
const BlacklistedToken = require("./models/BlacklistedToken");

// ================= SOCKET UTILS =================
const { initSocket } = require("./utils/socket");

// ================= CONFIG =================
dotenv.config();
connectDB();

// ================= APP SETUP =================
const app = express();

// Middleware
app.use(express.json());

// Enhanced CORS configuration for local network access
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

// Add local network IPs if CLIENT_URL contains localhost
if (process.env.CLIENT_URL?.includes("localhost") || !process.env.CLIENT_URL) {
  // Allow connections from common local network IP ranges
  // Users should replace localhost with their actual IP (e.g., http://192.168.1.100:5173)
  console.log("⚠️  For network access, set CLIENT_URL to your network IP (e.g., http://192.168.1.100:5173)");
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, or same-origin requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Allow local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      const localNetworkRegex = /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+):\d+$/;
      if (localNetworkRegex.test(origin)) {
        return callback(null, true);
      }
      
      // For development, allow all origins (remove in production)
      if (process.env.NODE_ENV !== "production") {
        console.log("⚠️  Allowing origin in dev mode:", origin);
        return callback(null, true);
      }
      
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow WebRTC
}));

// ================= ROUTES =================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/swaps", require("./routes/swapRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/ratings", require("./routes/ratingRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

// Health check
app.get("/", (req, res) => {
  res.send("Skill Swap API is running 🚀");
});

// ================= HTTP SERVER =================
const server = http.createServer(app);

// ================= SOCKET.IO (CREATE ONCE) =================
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin
      if (!origin) return callback(null, true);
      
      // Check allowed origins
      const allowed = [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ];
      
      if (allowed.includes(origin)) {
        return callback(null, true);
      }
      
      // Allow local network IPs
      const localNetworkRegex = /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+):\d+$/;
      if (localNetworkRegex.test(origin)) {
        return callback(null, true);
      }
      
      // For development, allow all origins
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowEIO3: true, // Allow Engine.IO v3 clients
});

// ✅ Register socket globally (VERY IMPORTANT)
initSocket(io);

// ================= SOCKET AUTH =================
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error: No token"));

    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      return next(new Error("Authentication error: Token revoked"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return next(new Error("Authentication error: User not found"));

    socket.user = user;
    next();
  } catch (err) {
    console.error("❌ Socket auth error:", err.message);
    next(new Error("Authentication error"));
  }
});

// ================= SOCKET EVENTS =================
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id, socket.user.name);

  // Join personal room (chat + notifications)
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log("🟢 User joined room:", userId);
  });

  // Auto-join user's personal room on connection
  socket.join(socket.user._id.toString());
  console.log("🟢 User auto-joined personal room:", socket.user._id);

  // ================= CHAT =================
  socket.on("sendMessage", ({ receiverId, message }) => {
    io.to(receiverId).emit("receiveMessage", {
      sender: socket.user._id,
      message,
    });
  });

  // ================= NOTIFICATIONS =================
  socket.on("sendNotification", ({ userId, message }) => {
    io.to(userId).emit("receiveNotification", {
      type: "system",
      message,
    });
  });

  // ================= WEBRTC =================
  socket.on("join-call", (roomId) => {
    socket.join(roomId);
    console.log("📞 join-call:", socket.user.name, roomId);
  });

  socket.on("offer", ({ roomId, offer, callType }) => {
    socket.to(roomId).emit("offer", {
      offer,
      from: socket.user._id,
      callType: callType || "video", // Forward callType to receiver
    });
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", {
      answer,
      from: socket.user._id,
    });
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", {
      candidate,
      from: socket.user._id,
    });
  });

  socket.on("call-rejected", ({ roomId }) => {
    socket.to(roomId).emit("call-rejected", {
      from: socket.user._id,
    });
    console.log("📞 Call rejected in room:", roomId);
  });

  socket.on("call-ended", ({ roomId }) => {
    socket.to(roomId).emit("call-ended", {
      from: socket.user._id,
    });
    console.log("📞 Call ended in room:", roomId);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0"; // Listen on all network interfaces

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Server accessible on network at http://${getLocalIP()}:${PORT}`);
  console.log(`📝 For network access, use: http://${getLocalIP()}:${PORT}`);
});

// Helper function to get local network IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return "localhost";
}
