const mongoose = require("mongoose");

const oddsCacheSchema = new mongoose.Schema(
  {
    sport: { type: String, required: true, unique: true },
    data: { type: Array, default: [] },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OddsCache", oddsCacheSchema);