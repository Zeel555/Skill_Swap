const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  getAdminDashboard,
  getAllSwaps,
  getSwapsByStatus,
  deleteSwap,
  updateUserRole,
  getAllUsers,
  getAllReports,
  resolveReport,
  sendAdminNotification,
  getAdminHistory
} = require("../controllers/adminController");

// Admin → Users notification
router.post(
  "/notifications",
  protect,
  adminOnly,
  sendAdminNotification
);

// Admin dashboard
router.get("/dashboard", protect, adminOnly, getAdminDashboard);

// Role management
router.put("/users/role/:id", protect, adminOnly, updateUserRole);

// User management
router.get("/users", protect, adminOnly, getAllUsers);

// Swap monitoring
router.get("/swaps", protect, adminOnly, getSwapsByStatus); // supports filter
router.delete("/swaps/:id", protect, adminOnly, deleteSwap);

// Reports
router.get("/reports", protect, adminOnly, getAllReports);
router.put("/reports/:id/resolve", protect, adminOnly, resolveReport);

// Admin history
router.get("/history", protect, adminOnly, getAdminHistory);

module.exports = router;
