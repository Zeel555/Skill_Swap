const User = require("../models/User");
const Swap = require("../models/Swap");
const { getIO } = require("../utils/socket");

// @desc    Rate a user after swap
// @route   POST /api/ratings
// @access  Private
const rateUser = async (req, res) => {
  try {
    const { swapId, ratedUserId, rating, comment } = req.body;

    if (!swapId || !ratedUserId || !rating) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Check swap
    const swap = await Swap.findById(swapId);
    if (!swap || swap.status !== "completed") {
      return res.status(400).json({ message: "Swap not completed" });
    }

    // Ensure user is part of swap
    const isValidUser =
      swap.sender.toString() === req.user._id.toString() ||
      swap.receiver.toString() === req.user._id.toString();

    if (!isValidUser) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const userToRate = await User.findById(ratedUserId);
    if (!userToRate) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent duplicate rating for same swap
    const alreadyRated = userToRate.reviews.find(
      r => r.user.toString() === req.user._id.toString() && 
           r.swapId && r.swapId.toString() === swapId
    );

    if (alreadyRated) {
      return res.status(400).json({ message: "Already rated this swap" });
    }

    // Add review
    userToRate.reviews.push({
      user: req.user._id,
      rating,
      comment,
      swapId
    });

    // Update average rating and count
    userToRate.avgRating =
      userToRate.reviews.reduce((sum, r) => sum + r.rating, 0) /
      userToRate.reviews.length;
    
    userToRate.ratingCount = userToRate.reviews.length;

    await userToRate.save();

    //socket notification
    const io = getIO();

    io.to(ratedUserId.toString()).emit("receiveNotification", {
      type: "rating",
      message: `You received a ${rating}-star rating`
    }); 

    res.status(201).json({ message: "Rating submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user ratings
// @route   GET /api/ratings/:userId
// @access  Private
const getUserRatings = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("reviews.user", "name email")
      .select("reviews avgRating");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      avgRating: user.avgRating || 0,
      reviews: user.reviews.map((review) => ({
        rating: review.rating,
        review: review.comment || "",
        ratedBy: {
          name: review.user?.name || "Unknown",
          email: review.user?.email || ""
        }
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { rateUser, getUserRatings };
