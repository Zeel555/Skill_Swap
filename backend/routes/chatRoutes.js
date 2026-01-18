const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getChat
} = require("../controllers/chatController");

// Send message
router.post("/", protect, sendMessage);

// Get chat with specific user
router.get("/:userId", protect, getChat);

module.exports = router;
