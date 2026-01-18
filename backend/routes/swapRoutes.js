const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  createSwap,
  getMySwaps,
  updateSwapStatus,
  getSwapHistory
} = require("../controllers/swapController");

// Create swap request
router.post("/", protect, createSwap);

// Get logged-in user swaps
router.get("/my", protect, getMySwaps);

// Swap history
router.get("/history", protect, getSwapHistory);

// Accept / Reject swap
router.put("/:id", protect, updateSwapStatus);

module.exports = router;
