const mongoose = require("mongoose");

const betSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    matchId: { type: String, required: true },
    matchName: { type: String, required: true },
    pick: { type: String, enum: ["A", "B", "draw"], required: true },
    pickName: { type: String, required: true },
    amount: { type: Number, required: true },
    odds: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "won", "lost"],
      default: "pending",
    },
    payout: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bet", betSchema);