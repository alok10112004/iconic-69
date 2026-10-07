const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const Match = require("../models/Match");
const Bet = require("../models/Bet");
const User = require("../models/User");
const Transaction = require("../models/Transaction"); // ← Ye line add ki

// ==========================================
// DASHBOARD
// ==========================================

// GET /api/admin/dashboard
router.get("/dashboard", protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalBets = await Bet.countDocuments();
    const pendingBets = await Bet.countDocuments({ status: "pending" });
    const wonBets = await Bet.countDocuments({ status: "won" });
    const lostBets = await Bet.countDocuments({ status: "lost" });

    const users = await User.find({ role: "user" });
    const totalCoins = users.reduce((sum, u) => sum + u.balance, 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBets,
        pendingBets,
        wonBets,
        lostBets,
        totalCoins,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// BETS
// ==========================================

// GET /api/admin/bets
router.get("/bets", protect, adminOnly, async (req, res) => {
  try {
    const bets = await Bet.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, data: bets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/settle-bet/:id
router.post("/settle-bet/:id", protect, adminOnly, async (req, res) => {
  const { result } = req.body;
  try {
    const bet = await Bet.findById(req.params.id);
    if (!bet) return res.status(404).json({ message: "Bet not found" });
    if (bet.status !== "pending") {
      return res.status(400).json({ message: "Bet already settled" });
    }

    if (result === "won") {
      bet.status = "won";
      bet.payout = bet.amount * bet.odds;
      const user = await User.findById(bet.userId);
      user.balance += bet.payout;
      await user.save();
    } else {
      bet.status = "lost";
      bet.payout = 0;
    }
    await bet.save();

    res.json({ success: true, bet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// USERS
// ==========================================

// GET /api/admin/users
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/user/:id/balance
router.put("/user/:id/balance", protect, adminOnly, async (req, res) => {
  const { balance } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { balance },
      { new: true }
    ).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// MATCHES
// ==========================================

// POST /api/admin/match
router.post("/match", protect, adminOnly, async (req, res) => {
  try {
    const match = await Match.create(req.body);
    res.status(201).json({ success: true, match });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// DEPOSIT APPROVAL
// ==========================================

// GET /api/admin/deposits — Pending deposits
router.get("/deposits", protect, adminOnly, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      type: "deposit",
      status: "pending",
    }).populate("userId", "name email");
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/approve-deposit/:id
router.post("/approve-deposit/:id", protect, adminOnly, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Not found" });
    if (transaction.status !== "pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    transaction.status = "success";
    transaction.note = "Approved by admin";
    await transaction.save();

    const user = await User.findById(transaction.userId);
    user.balance += transaction.amount;
    await user.save();

    res.json({ success: true, transaction, newBalance: user.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// WITHDRAWAL APPROVAL
// ==========================================

// GET /api/admin/withdrawals — Pending withdrawals
router.get("/withdrawals", protect, adminOnly, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      type: "withdrawal",
      status: "pending",
    }).populate("userId", "name email balance");
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/approve-withdrawal/:id
router.post("/approve-withdrawal/:id", protect, adminOnly, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Not found" });
    if (transaction.status !== "pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    const user = await User.findById(transaction.userId);

    if (user.balance < transaction.amount) {
      return res
        .status(400)
        .json({ message: "User has insufficient balance now" });
    }

    user.balance -= transaction.amount;
    await user.save();

    transaction.status = "success";
    transaction.note = "Approved by admin";
    await transaction.save();

    res.json({ success: true, transaction, newBalance: user.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/reject-withdrawal/:id
router.post("/reject-withdrawal/:id", protect, adminOnly, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Not found" });
    if (transaction.status !== "pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    transaction.status = "failed";
    transaction.note = "Rejected by admin";
    await transaction.save();

    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;