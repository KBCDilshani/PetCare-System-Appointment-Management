const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getUserAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getBookedSlots,
} = require("../controllers/appointmentController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// Public routes
router.get("/booked-slots", getBookedSlots);

// User routes (requires login)
router.post("/", protect, createAppointment);
router.get("/user", protect, getUserAppointments);
router.get("/:id", protect, getAppointmentById);
router.put("/:id", protect, updateAppointment);
router.delete("/:id", protect, deleteAppointment);

// Admin routes
router.get("/", protect, adminOnly, getAppointments);
router.patch("/:id/status", protect, adminOnly, updateAppointmentStatus);

module.exports = router;
