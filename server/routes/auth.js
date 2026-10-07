const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Bet = require("../models/Bet");
const Transaction = require("../models/Transaction");
const { protect } = require("../middleware/auth");
const router = express.Router();

// JWT token generate karo
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @route   POST /api/auth/register
// @desc    Naya user register karo
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      balance: user.balance,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    User login karo
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/profile
// @desc    User ki poori info + stats
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    // Bet stats
    const totalBets = await Bet.countDocuments({ userId: user._id });
    const wonBets = await Bet.countDocuments({
      userId: user._id,
      status: "won",
    });
    const lostBets = await Bet.countDocuments({
      userId: user._id,
      status: "lost",
    });
    const pendingBets = await Bet.countDocuments({
      userId: user._id,
      status: "pending",
    });

    // Total wagered aur payout
    const bets = await Bet.find({ userId: user._id });
    const totalWagered = bets.reduce((sum, b) => sum + b.amount, 0);
    const totalPayout = bets.reduce((sum, b) => sum + b.payout, 0);

    // Win rate
    const settledBets = wonBets + lostBets;
    const winRate =
      settledBets > 0 ? ((wonBets / settledBets) * 100).toFixed(2) : 0;

    // Transaction stats
    const transactions = await Transaction.find({ userId: user._id });
    const totalDeposited = transactions
      .filter((t) => t.type === "deposit" && t.status === "success")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawn = transactions
      .filter((t) => t.type === "withdrawal" && t.status === "success")
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      data: {
        user,
        stats: {
          totalBets,
          wonBets,
          lostBets,
          pendingBets,
          totalWagered,
          totalPayout,
          winRate: Number(winRate),
          totalDeposited,
          totalWithdrawn,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;