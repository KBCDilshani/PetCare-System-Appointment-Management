const express = require("express");
const router = express.Router();
const {
  createPet,
  registerUserPet,
  getPets,
  getUserPets,
  getPetById,
  updatePet,
  updateUserPet,
  deletePet,
  deleteUserPet,
  getPetStats,
} = require("../controllers/petController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// Get all pets and pet stats routes
router.get("/", getPets);
router.get("/stats", protect, adminOnly, getPetStats);

// User pet routes (for registered pets)
router.post("/register", protect, registerUserPet);
router.get("/mypets", protect, getUserPets);
router.put("/mypets/:id", protect, updateUserPet);
router.delete("/mypets/:id", protect, deleteUserPet);

// CRUD operations on individual pets (admin only)
router.post("/", protect, adminOnly, createPet);
router.get("/:id", getPetById);
router.put("/:id", protect, adminOnly, updatePet);
router.delete("/:id", protect, adminOnly, deletePet);

module.exports = router;
