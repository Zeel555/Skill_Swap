const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const authLimiter = require("../middleware/rateLimiter");

const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

// Async wrapper helper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Wrap your async routes
router.post("/register", asyncHandler(registerUser));
router.post("/login", asyncHandler(loginUser));
router.post("/logout", protect, asyncHandler(logoutUser));
router.post("/forgot-password", asyncHandler(forgotPassword));
router.put("/reset-password/:token", asyncHandler(resetPassword));
router.post("/login", authLimiter, loginUser);
router.post("/forgot-password", authLimiter, forgotPassword);

module.exports = router;