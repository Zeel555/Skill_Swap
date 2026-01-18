// authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const BlacklistedToken = require("../models/BlacklistedToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");


const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });
};

// REGISTER
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    await sendEmail({
    to: user.email,
    subject: "Welcome to SkillSwap 🎉",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          .content {
            background: white;
            border-radius: 8px;
            padding: 40px;
            margin-top: 20px;
          }
          .logo {
            text-align: center;
            color: white;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .tagline {
            text-align: center;
            color: rgba(255,255,255,0.9);
            font-size: 16px;
            margin-bottom: 30px;
          }
          h1 {
            color: #667eea;
            margin-top: 0;
            font-size: 28px;
          }
          p {
            color: #666;
            font-size: 16px;
            margin: 15px 0;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
          }
          .features {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .feature-item {
            display: flex;
            align-items: center;
            margin: 12px 0;
            color: #555;
          }
          .feature-icon {
            font-size: 20px;
            margin-right: 12px;
          }
          .footer {
            text-align: center;
            color: rgba(255,255,255,0.8);
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.2);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🎯 SkillSwap</div>
          <div class="tagline">Connect • Learn • Grow</div>
          
          <div class="content">
            <h1>Welcome, ${user.name}! 🎉</h1>
            <p>Your account has been created successfully. You're now part of a community where skills are shared and knowledge grows!</p>
            
            <div class="features">
              <div class="feature-item">
                <span class="feature-icon">🔍</span>
                <span>Find people with skills you want to learn</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">💬</span>
                <span>Chat and connect with skill enthusiasts</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🤝</span>
                <span>Swap skills and grow together</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">⭐</span>
                <span>Build your reputation through ratings</span>
              </div>
            </div>
            
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Get Started →</a>
            </p>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              Ready to start your skill-swapping journey? Log in and explore the platform!
            </p>
          </div>
          
          <div class="footer">
            <p>Happy Learning! 🚀</p>
            <p style="font-size: 12px;">© ${new Date().getFullYear()} SkillSwap. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
    });


    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    throw error; // Let asyncHandler catch it
  }
};

// LOGIN
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    throw error; // Let asyncHandler catch it
  }
};

// ================= LOGOUT =================
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.decode(token);

    await BlacklistedToken.create({
      token,
      expiresAt: new Date(decoded.exp * 1000)
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= FORGOT PASSWORD =================
// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    // Use port 5173 for Vite dev server (frontend)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    console.log("Reset password URL:", resetUrl); // Debug log

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 10 minutes.</p>
      `
    });

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= RESET PASSWORD =================
// @route PUT /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { registerUser, loginUser, logoutUser, forgotPassword, resetPassword };
