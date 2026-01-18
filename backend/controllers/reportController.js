const Report = require("../models/Report");
const User = require("../models/User");
const Swap = require("../models/Swap");

// ================= CREATE REPORT =================
// @desc    Report a user / swap / message
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: "Target type, target ID, and reason are required" });
    }

    // Validate target exists
    if (targetType === "user") {
      const targetUser = await User.findById(targetId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      // Prevent self-reporting
      if (targetId === req.user._id.toString()) {
        return res.status(400).json({ message: "You cannot report yourself" });
      }
    } else if (targetType === "swap") {
      const targetSwap = await Swap.findById(targetId);
      if (!targetSwap) {
        return res.status(404).json({ message: "Swap not found" });
      }
    }

    // Check for duplicate reports
    const existingReport = await Report.findOne({
      reportedBy: req.user._id,
      targetType,
      targetId,
      status: "pending"
    });

    if (existingReport) {
      return res.status(400).json({ message: "You have already reported this item" });
    }

    const report = await Report.create({
      reportedBy: req.user._id,
      targetType,
      targetId,
      reason,
      description: description || ""
    });

    res.status(201).json({
      message: "Report submitted successfully",
      report
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReport
};
