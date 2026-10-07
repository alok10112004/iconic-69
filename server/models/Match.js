const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    apiMatchId: { type: String, unique: true, sparse: true },
    teamA: { type: String, required: true },
    teamB: { type: String, required: true },
    startTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["upcoming", "live", "finished"],
      default: "upcoming",
    },
    odds: {
      teamA: { type: Number, default: 1.8 },
      teamB: { type: Number, default: 2.1 },
      draw: { type: Number, default: 3.2 },
    },
    result: {
      type: String,
      enum: ["A", "B", "draw", null],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", matchSchema);