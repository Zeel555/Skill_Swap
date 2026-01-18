const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    password: {
      type: String,
      required: true
    },


    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    skillsOffered: {
      type: [String],
      default: []
    },

    skillsWanted: {
      type: [String],
      default: []
    },

    bio: {
      type: String,
      default: ""
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // ⭐ RATING SYSTEM (NEW)
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5
        },
        comment: {
          type: String
        },
        swapId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Swap"
        }
      }
    ],

    avgRating: {
      type: Number,
      default: 0
    },

    ratingCount: {
      type: Number,
      default: 0
    },

    isBlocked: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// 🔐 Hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// 🔍 Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
