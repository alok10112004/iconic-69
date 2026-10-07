const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Bet = require("../models/Bet");
const User = require("../models/User");
const Match = require("../models/Match");

// POST /api/bets — Bet lagao
router.post("/", protect, async (req, res) => {
  const { matchId, matchName, pick, pickName, amount, odds } = req.body;

  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const user = await User.findById(req.user._id);
    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Balance deduct karo
    user.balance -= amount;
    await user.save();

    const bet = await Bet.create({
      userId: user._id,
      matchId,
      matchName,
      pick,
      pickName,
      amount,
      odds,
    });

    res.status(201).json({
      success: true,
      bet,
      newBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/bets/my — Meri bets
router.get("/my", protect, async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: bets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/bets/topup — Free coins lo
router.post("/topup", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.balance += 500;
    await user.save();

    res.json({
      success: true,
      newBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/bets/cashout/:id — Bet beech mein cash out karo
router.post("/cashout/:id", protect, async (req, res) => {
  try {
    const bet = await Bet.findById(req.params.id);

    if (!bet) {
      return res.status(404).json({ message: "Bet not found" });
    }

    if (bet.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your bet" });
    }

    if (bet.status !== "pending") {
      return res.status(400).json({ message: "Bet already settled" });
    }

    // Cashout value calculate karo (80% of potential win)
    const potentialWin = bet.amount * bet.odds;
    const cashoutValue = (potentialWin * 0.8).toFixed(2);

    // User ko cashout amount do
    const user = await User.findById(req.user._id);
    user.balance += Number(cashoutValue);
    await user.save();

    // Bet update karo
    bet.status = "won";
    bet.payout = Number(cashoutValue);
    await bet.save();

    res.json({
      success: true,
      message: `Cashed out for ${cashoutValue} coins`,
      cashoutValue,
      newBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;