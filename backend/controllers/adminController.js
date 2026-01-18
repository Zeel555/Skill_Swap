const User = require("../models/User");
const Swap = require("../models/Swap");
const Report = require("../models/Report");
const Notification = require("../models/Notification");
const { getIO } = require("../utils/socket");

// ================= ADMIN DASHBOARD =================
// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isBlocked: false });
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    const totalSwaps = await Swap.countDocuments();
    const pendingSwaps = await Swap.countDocuments({ status: "pending" });
    const acceptedSwaps = await Swap.countDocuments({ status: "accepted" });
    const completedSwaps = await Swap.countDocuments({ status: "completed" });
    const rejectedSwaps = await Swap.countDocuments({ status: "rejected" });

    // Calculate average rating
    const usersWithRatings = await User.find({ avgRating: { $gt: 0 } });
    const avgRating = usersWithRatings.length > 0
      ? usersWithRatings.reduce((sum, u) => sum + u.avgRating, 0) / usersWithRatings.length
      : 0;

    // Count total skills offered
    const allUsers = await User.find();
    const totalSkillsOffered = allUsers.reduce((sum, u) => sum + u.skillsOffered.length, 0);

    res.status(200).json({
      users: {
        total: totalUsers,
        active: activeUsers,
        blocked: blockedUsers
      },
      swaps: {
        total: totalSwaps,
        pending: pendingSwaps,
        accepted: acceptedSwaps,
        completed: completedSwaps,
        rejected: rejectedSwaps
      },
      ratings: {
        average: Math.round(avgRating * 10) / 10
      },
      skills: {
        totalOffered: totalSkillsOffered
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ADMIN SWAP MONITORING =================

// @desc    Get all swaps (Admin)
// @route   GET /api/admin/swaps
// @access  Private (Admin)
const getAllSwaps = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const swaps = await Swap.find()
      .populate("sender receiver", "name email")
      .skip(skip)
      .limit(limit);

    const total = await Swap.countDocuments();

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      swaps
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Filter swaps by status (Admin)
// @route   GET /api/admin/swaps?status=pending
// @access  Private (Admin)
const getSwapsByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = status ? { status } : {};

    const swaps = await Swap.find(filter)
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(swaps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a swap (Admin)
// @route   DELETE /api/admin/swaps/:id
// @access  Private (Admin)
const deleteSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ message: "Swap not found" });
    }

    await swap.deleteOne();

    res.status(200).json({ message: "Swap deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ROLE MANAGEMENT =================

// @desc    Update user role (Admin)
// @route   PUT /api/admin/users/role/:id
// @access  Private (Admin)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Prevent admin from changing own role
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        message: "Admin cannot change own role"
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: `User role updated to ${role}`,
      userId: user._id,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ADMIN USER MANAGEMENT =================

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("_id name email role isBlocked avgRating ratingCount")
      .skip(skip)
      .limit(limit);

    // Transform to match API spec
    const transformedUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      averageRating: user.role === 'admin' ? null : user.avgRating,
      totalReviews: user.role === 'admin' ? null : user.ratingCount
    }));

    const total = await User.countDocuments();

    res.json({
      users: transformedUsers,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getAllReports = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const reports = await Report.find(filter)
      .populate("reportedBy", "name email")
      .populate("resolvedBy", "name email")
      .sort({ createdAt: -1 });

    // Populate target details
    const populatedReports = await Promise.all(
      reports.map(async (report) => {
        const reportObj = report.toObject();
        
        if (report.targetType === "user") {
          const targetUser = await User.findById(report.targetId).select("name email");
          reportObj.targetUser = targetUser;
        } else if (report.targetType === "swap") {
          const targetSwap = await Swap.findById(report.targetId)
            .populate("sender", "name")
            .populate("receiver", "name");
          reportObj.targetSwap = targetSwap;
        }
        
        return reportObj;
      })
    );

    res.status(200).json(populatedReports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resolve report & take action
// @route   PUT /api/admin/reports/:id/resolve
// @access  Private (Admin)
const resolveReport = async (req, res) => {
  try {
    const { action } = req.body; // block-user | delete-swap | none

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.status === "resolved") {
      return res.status(400).json({ message: "Report already resolved" });
    }

    // Take action based on report type and action
    if (action === "block-user" && report.targetType === "user") {
      await User.findByIdAndUpdate(report.targetId, { isBlocked: true });
    } else if (action === "delete-swap" && report.targetType === "swap") {
      await Swap.findByIdAndDelete(report.targetId);
    }

    // Update report
    report.status = "resolved";
    report.actionTaken = action;
    report.resolvedAt = new Date();
    report.resolvedBy = req.user._id;
    await report.save();

    // Send notifications
    const reporter = await User.findById(report.reportedBy);
    if (reporter) {
      await Notification.create({
        user: reporter._id,
        type: "system",
        message: "Your report has been reviewed by the admin."
      });

      // Real-time notification
      const io = getIO();
      io.to(reporter._id.toString()).emit("receiveNotification", {
        user: reporter._id,
        type: "system",
        message: "Your report has been reviewed by the admin.",
        createdAt: new Date()
      });
    }

    // Notify affected user if blocked or swap deleted
    if (action === "block-user" && report.targetType === "user") {
      const affectedUser = await User.findById(report.targetId);
      if (affectedUser) {
        await Notification.create({
          user: affectedUser._id,
          type: "system",
          message: "Your account has been blocked due to a report."
        });

        const io = getIO();
        io.to(affectedUser._id.toString()).emit("receiveNotification", {
          user: affectedUser._id,
          type: "system",
          message: "Your account has been blocked due to a report.",
          createdAt: new Date()
        });
      }
    } else if (action === "delete-swap" && report.targetType === "swap") {
      const deletedSwap = await Swap.findById(report.targetId).populate("sender receiver");
      if (deletedSwap) {
        const affectedUsers = [deletedSwap.sender, deletedSwap.receiver];
        for (const user of affectedUsers) {
          if (user) {
            await Notification.create({
              user: user._id,
              type: "system",
              message: "A swap you were involved in has been deleted due to a report."
            });

            const io = getIO();
            io.to(user._id.toString()).emit("receiveNotification", {
              user: user._id,
              type: "system",
              message: "A swap you were involved in has been deleted due to a report.",
              createdAt: new Date()
            });
          }
        }
      }
    }

    res.status(200).json({
      message: "Report resolved successfully",
      report
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ADMIN → USERS NOTIFICATION =================
// @desc    Send notification to users (Admin)
// @route   POST /api/admin/notifications
// @access  Private (Admin)
const sendAdminNotification = async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    let users = [];

    // Send to specific user
    if (userId) {
      users = await User.find({ _id: userId, isBlocked: false });
    } 
    // Send to all users
    else {
      users = await User.find({ isBlocked: false });
    }

    const io = getIO();
    let count = 0;

    for (const user of users) {
      const notification = await Notification.create({
        user: user._id,
        type: "admin",       // ✅ matches your schema
        message
      });

      // 🔥 Real-time emit
      io.to(user._id.toString()).emit("receiveNotification", notification);
      count++;
    }

    res.status(201).json({
      message: "Admin notification sent successfully",
      recipients: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin history (all swaps and reports)
// @route   GET /api/admin/history
// @access  Private (Admin)
const getAdminHistory = async (req, res) => {
  try {
    const swaps = await Swap.find()
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 });

    const reports = await Report.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      swaps,
      reports
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminDashboard,
  getAllSwaps,
  getSwapsByStatus,
  deleteSwap,
  updateUserRole,
  getAllUsers,
  getAllReports,
  resolveReport,
  sendAdminNotification,
  getAdminHistory,
};
