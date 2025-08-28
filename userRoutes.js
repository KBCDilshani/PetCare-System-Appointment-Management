const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  getUsers,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.post("/forgotpassword", forgotPassword);

// Test route
router.get("/test", (req, res) => {
  res.status(200).json({ message: "User routes are working" });
});

// Protected routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// Admin routes
router.get("/", protect, adminOnly, getUsers);

module.exports = router;
