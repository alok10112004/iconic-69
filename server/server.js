const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Iconic 69 Demo API is running 🚀" });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/matches", require("./routes/matches"));
app.use("/api/bets", require("./routes/bets"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/bank", require("./routes/bank"));
app.use("/api/casino", require("./routes/casino"));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ DB Error:", err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));