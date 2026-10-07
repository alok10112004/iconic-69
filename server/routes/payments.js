const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

// ==========================================
// DEPOSIT — User request kare, admin approve kare
// ==========================================

// POST /api/payments/deposit — Deposit request (PENDING)
router.post("/deposit", protect, async (req, res) => {
  const { amount, note } = req.body;

  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (amount > 100000) {
      return res.status(400).json({ message: "Max deposit 100000 coins" });
    }

    const reference = "DEP_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

    const transaction = await Transaction.create({
      userId: req.user._id,
      type: "deposit",
      amount: Number(amount),
      status: "pending", // Admin approval pending
      reference,
      note: note || "Deposit request — admin approval pending",
    });

    res.json({
      success: true,
      message: "Deposit request submitted. Admin approval pending.",
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// WITHDRAWAL — User request kare, admin approve kare
// ==========================================

router.post("/withdraw", protect, async (req, res) => {
  const { amount } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const reference = "WTH_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

    const transaction = await Transaction.create({
      userId: user._id,
      type: "withdrawal",
      amount: Number(amount),
      status: "pending",
      reference,
      note: "Withdrawal request — admin approval pending",
    });

    res.json({
      success: true,
      message: "Withdrawal request submitted. Admin approval pending.",
      transaction,
      currentBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// HISTORY
// ==========================================

router.get("/history", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;