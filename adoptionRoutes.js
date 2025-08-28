const express = require("express");
const router = express.Router();
const {
  createAdoptionApplication,
  getAdoptionApplications,
  getAdoptionApplicationById,
  updateAdoptionStatus,
  getUserApplications,
  deleteAdoptionApplication,
} = require("../controllers/adoptionController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// Public routes
router.post("/", protect, createAdoptionApplication);

// User routes (requires login)
router.get("/user", protect, getUserApplications);

// Admin routes
router.get("/", protect, adminOnly, getAdoptionApplications);
router.get("/:id", protect, adminOnly, getAdoptionApplicationById);
router.put("/:id", protect, adminOnly, updateAdoptionStatus);
router.delete("/:id", protect, adminOnly, deleteAdoptionApplication);

module.exports = router;
