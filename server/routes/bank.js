const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const BankDetail = require("../models/BankDetail");

// GET /api/bank — User ke bank details
router.get("/", protect, async (req, res) => {
  try {
    const bank = await BankDetail.findOne({ userId: req.user._id });
    res.json({ success: true, data: bank });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/bank — Bank details save karo
router.post("/", protect, async (req, res) => {
  const {
    accountHolderName,
    accountNumber,
    ifscCode,
    bankName,
    branchName,
    upiId,
  } = req.body;

  try {
    // Validation
    if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (accountNumber.length < 8) {
      return res.status(400).json({ message: "Invalid account number" });
    }

    if (ifscCode.length !== 11) {
      return res.status(400).json({ message: "Invalid IFSC code" });
    }

    // Agar already hai toh update karo, warna banao
    let bank = await BankDetail.findOne({ userId: req.user._id });

    if (bank) {
      bank.accountHolderName = accountHolderName;
      bank.accountNumber = accountNumber;
      bank.ifscCode = ifscCode.toUpperCase();
      bank.bankName = bankName;
      bank.branchName = branchName || "";
      bank.upiId = upiId || "";
      bank.isVerified = false; // Re-verification needed
      await bank.save();
    } else {
      bank = await BankDetail.create({
        userId: req.user._id,
        accountHolderName,
        accountNumber,
        ifscCode: ifscCode.toUpperCase(),
        bankName,
        branchName: branchName || "",
        upiId: upiId || "",
      });
    }

    res.json({ success: true, data: bank, message: "Bank details saved" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/bank — Bank details delete karo
router.delete("/", protect, async (req, res) => {
  try {
    await BankDetail.findOneAndDelete({ userId: req.user._id });
    res.json({ success: true, message: "Bank details deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;