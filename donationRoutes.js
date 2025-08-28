const express = require("express");
const router = express.Router();
const {
  createDonation,
  getDonations,
  getDonationById,
  getDonationsSummary,
  updateDonation,
  getUserDonations,
} = require("../controllers/donationController");
const { protect, adminOnly, optionalAuth } = require("../middlewares/authMiddleware");

// Public routes
router.post("/", optionalAuth, createDonation);

// User routes (requires login)
router.get("/user", protect, getUserDonations);

// Admin routes
router.get("/", protect, adminOnly, getDonations);
router.get("/summary", protect, adminOnly, getDonationsSummary);
router.get("/:id", protect, adminOnly, getDonationById);
router.put("/:id", protect, adminOnly, updateDonation);

module.exports = router;
