const User = require("../models/User");
const Swap = require("../models/Swap");

// ================= USER CONTROLLERS =================

// @desc    Get logged-in user profile
// @route   GET /api/users/profile
// @access  Private (User)
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profileCompletion = await calculateProfileCompletion(user._id);

    res.status(200).json({
      ...user.toObject(),
      profileCompletion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (User)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in user profile
// @route   PUT /api/users/profile
// @access  Private (User)
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.skillsOffered = req.body.skillsOffered || user.skillsOffered;
    user.skillsWanted = req.body.skillsWanted || user.skillsWanted;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error); // ✅ IMPORTANT
  }
};

// ================= USER DASHBOARD =================
// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard
// @access  Private
const getUserDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const swaps = await Swap.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    });

    res.status(200).json({
      totalSwaps: swaps.length,
      completedSwaps: swaps.filter(s => s.status === "completed").length,
      pendingSwaps: swaps.filter(s => s.status === "pending").length,
      avgRating: user.avgRating,
      skillsOfferedCount: user.skillsOffered.length,
      skillsWantedCount: user.skillsWanted.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ADMIN CONTROLLERS =================

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password")
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Block or unblock a user
// @route   PUT /api/users/block/:id
// @access  Private (Admin)
const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW: Delete user
// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW: Admin dashboard stats
// @desc    Get platform statistics
// @route   GET /api/users/stats
// @access  Private (Admin)
const getStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const swaps = await Swap.countDocuments();

    res.status(200).json({
      totalUsers: users,
      totalSwaps: swaps
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user history (swaps)
// @route   GET /api/users/history
// @access  Private
const getUserHistory = async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(swaps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users by skill
// @route   GET /api/users/search
// @access  Private
const searchUsersBySkill = async (req, res) => {
  try {
    const { skill } = req.query;

    if (!skill) {
      return res.status(400).json({ message: "Skill query is required" });
    }

    const users = await User.find({
      skillsOffered: { $regex: skill, $options: "i" },
      isBlocked: false
    }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get matched users for logged-in user
// @route   GET /api/users/match
// @access  Private
const getMatchedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    const matches = await User.find({
      _id: { $ne: req.user._id },
      skillsOffered: { $in: currentUser.skillsWanted },
      skillsWanted: { $in: currentUser.skillsOffered },
      isBlocked: false
    }).select("-password");

    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= PROFILE COMPLETION SCORE =================
const calculateProfileCompletion = async (userId) => {
  let score = 0;

  const user = await User.findById(userId);
  if (!user) return 0;

  if (user.name) score += 15;
  if (user.email) score += 10;

  if (user.skillsOffered.length > 0) score += 25;
  if (user.skillsWanted.length > 0) score += 25;

  if (user.rating && user.rating > 0) score += 10;
  if (!user.isBlocked) score += 5;

  const completedSwaps = await Swap.countDocuments({
    $or: [{ sender: userId }, { receiver: userId }],
    status: "completed"
  });

  if (completedSwaps > 0) score += 10;

  return score;
};

// ================= RECOMMENDATION ENGINE =================
// @desc    Get recommended users (ML-lite)
// @route   GET /api/users/recommendations
// @access  Private
const getRecommendedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch other active users
    const users = await User.find({
      _id: { $ne: currentUser._id },
      isBlocked: false
    }).select("-password");

    const recommendations = [];

    for (const user of users) {
      let score = 0;

      // 1️⃣ Skill overlap (they offer what I want)
      const commonSkills = user.skillsOffered.filter(skill =>
        currentUser.skillsWanted.includes(skill)
      );
      score += Math.min((commonSkills.length / Math.max(1, currentUser.skillsWanted.length)) * 50, 50);

      // 2️⃣ Reverse match (I offer what they want)
      const reverseMatch = user.skillsWanted.some(skill =>
        currentUser.skillsOffered.includes(skill)
      );
      if (reverseMatch) score += 30;

      // 3️⃣ Rating
      if (user.rating && user.rating > 0) {
        score += Math.min((user.rating / 5) * 10, 10);
      }

      // 4️⃣ Activity (completed swaps)
      const completedSwaps = await Swap.countDocuments({
        $or: [{ sender: user._id }, { receiver: user._id }],
        status: "completed"
      });
      if (completedSwaps > 0) score += 10;

      if (score > 0) {
        recommendations.push({
          userId: user._id,
          name: user.name,
          skillsOffered: user.skillsOffered,
          skillsWanted: user.skillsWanted,
          rating: user.rating,
          matchScore: Math.round(score)
        });
      }
    }

    // Sort by best match
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  getUserById,
  updateUserProfile,
  getAllUsers,
  blockUser,
  deleteUser,
  getStats,
  searchUsersBySkill,
  getMatchedUsers,
  getUserDashboard,
  getRecommendedUsers,
  getUserHistory
};
