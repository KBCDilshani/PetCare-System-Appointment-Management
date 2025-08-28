const express = require("express");
const router = express.Router();
const path = require("path");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { handlePetImageUpload } = require("../middlewares/uploadMiddleware");

// @desc    Upload pet image (admin only)
// @route   POST /api/upload/pet-image
// @access  Private/Admin
router.post(
  "/pet-image",
  protect,
  adminOnly,
  handlePetImageUpload,
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    // Return the file path that can be stored in the database
    const filePath = `/uploads/${req.file.filename}`;
    const imageUrl = filePath;

    res.status(200).json({
      success: true,
      imageUrl,
      message: "Image uploaded successfully",
    });
  }
);

// @desc    Upload user pet image (for regular users)
// @route   POST /api/upload/user-pet-image
// @access  Private
router.post(
  "/user-pet-image",
  protect, // Only requires authentication, not admin privileges
  handlePetImageUpload,
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    // Return the file path that can be stored in the database
    const filePath = `/uploads/${req.file.filename}`;
    const imageUrl = filePath;

    res.status(200).json({
      success: true,
      imageUrl,
      message: "Image uploaded successfully",
    });
  }
);

// Serve uploaded files
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

module.exports = router;
