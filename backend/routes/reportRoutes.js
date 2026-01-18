const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { createReport } = require("../controllers/reportController");

// Submit report
router.post("/", protect, createReport);

module.exports = router;
