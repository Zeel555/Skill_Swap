const express = require("express");
const router = express.Router();

// Middleware
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Controllers
const {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  blockUser,
  deleteUser,
  getStats,
  searchUsersBySkill,
  getMatchedUsers,
  getUserDashboard,
  getRecommendedUsers,
  getUserHistory,
  getUserById
} = require("../controllers/userController");

console.log("🔥 userRoutes loaded");

// ================= USER ROUTES =================

// Get logged-in user profile
router.get("/profile", protect, getUserProfile);

// Update logged-in user profile
router.put("/profile", protect, updateUserProfile);

// Search users by skill
router.get("/search", protect, searchUsersBySkill);

// 🤝 Skill matching
router.get("/match", protect, getMatchedUsers);

// 🤖 Recommendations
router.get("/recommendations", protect, getRecommendedUsers);

// User dashboard
router.get("/dashboard", protect, getUserDashboard);

// User history
router.get("/history", protect, getUserHistory);

// ================= ADMIN ROUTES =================

// IMPORTANT: stats BEFORE :id
router.get("/stats", protect, adminOnly, getStats);

// Get all users (admin)
router.get("/", protect, adminOnly, getAllUsers);

// ================= COMMON ROUTES =================

// Get user by ID (used for chat header, profile preview)
router.get("/:id", protect, getUserById);

// Block / Unblock user
router.put("/block/:id", protect, adminOnly, blockUser);

// Delete user
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;
