const Swap = require("../models/Swap");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { getIO } = require("../utils/socket");


// Create swap request
const createSwap = async (req, res) => {
  try {
    const { receiverId, skillOffered, skillRequested } = req.body;

    const swap = await Swap.create({
      sender: req.user._id,
      receiver: receiverId,
      skillOffered,
      skillRequested
    });

    // 🔔 ADD NOTIFICATION HERE (AFTER SWAP CREATION)
    await Notification.create({
      user: receiverId,
      type: "swap",
      message: "You received a new swap request"
    });

    const io = getIO();

    io.to(receiverId.toString()).emit("receiveNotification", {
      type: "swap",
      message: "You received a new swap request"
    });

    res.status(201).json(swap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get my swaps
const getMySwaps = async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    }).populate("sender receiver", "name email");

    res.status(200).json(swaps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept / Reject swap
const updateSwapStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ message: "Swap not found" });
    }

    // Only receiver can update
    if (swap.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // If completed → update skills
    if (status === "completed") {
      const sender = await User.findById(swap.sender);
      const receiver = await User.findById(swap.receiver);

      // Add skills if not already present
      if (!sender.skillsOffered.includes(swap.skillRequested)) {
        sender.skillsOffered.push(swap.skillRequested);
      }

      if (!receiver.skillsOffered.includes(swap.skillOffered)) {
        receiver.skillsOffered.push(swap.skillOffered);
      }

      await sender.save();
      await receiver.save();
    }

    swap.status = status;
    await swap.save();

    res.status(200).json(swap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SWAP HISTORY =================
// @desc    Get swap history for logged-in user
// @route   GET /api/swaps/history
// @access  Private
const getSwapHistory = async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
      .populate("sender", "name")
      .populate("receiver", "name")
      .sort({ createdAt: -1 });

    const history = {
      pending: swaps.filter(s => s.status === "pending"),
      accepted: swaps.filter(s => s.status === "accepted"),
      completed: swaps.filter(s => s.status === "completed"),
      rejected: swaps.filter(s => s.status === "rejected")
    };

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createSwap,
  getMySwaps,
  updateSwapStatus,
  getSwapHistory
};
