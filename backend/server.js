// ================= IMPORT CORE PACKAGES =================
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const http = require("http");
const helmet = require("helmet");
const { Server } = require("socket.io");

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
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(helmet());

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
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
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

  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", {
      offer,
      from: socket.user._id,
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

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
