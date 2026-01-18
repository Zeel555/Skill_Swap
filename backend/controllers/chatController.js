const Message = require("../models/Message");
const Notification = require("../models/Notification");
const { getIO } = require("../utils/socket");

// @desc    Send a message
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { receiverId, message } = req.body;

    if (!receiverId || !message || !message.trim()) {
      return res.status(400).json({
        message: "receiverId and message are required",
      });
    }

    // ✅ Save chat message
    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      message: message.trim(),
    });

    // ✅ Create message preview (industry-level)
    const preview =
      message.length > 50 ? message.substring(0, 50) + "..." : message;

    // ✅ Save notification with REAL preview + sender
    await Notification.create({
      user: receiverId,
      type: "chat",
      message: preview,
      sender: req.user._id,
    });

    // ✅ Emit socket notification (safe)
    try {
      const io = getIO();
      io.to(receiverId.toString()).emit("receiveNotification", {
        type: "chat",
        message: preview,
        sender: {
          _id: req.user._id,
          name: req.user.name,
        },
      });
    } catch (socketError) {
      console.warn("⚠️ Socket not available:", socketError.message);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("❌ sendMessage error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// @desc    Get chat between two users
// @route   GET /api/chat/:userId
// @access  Private
const getChat = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name")
      .populate("receiver", "name");

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ getChat error:", error);
    res.status(500).json({ message: "Failed to load chat" });
  }
};

module.exports = { sendMessage, getChat };
