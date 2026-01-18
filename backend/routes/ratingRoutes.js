const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { rateUser, getUserRatings } = require("../controllers/ratingController");

router.post("/", protect, rateUser);
router.get("/:userId", protect, getUserRatings);

module.exports = router;
