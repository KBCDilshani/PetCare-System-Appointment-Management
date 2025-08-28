const asyncHandler = require("express-async-handler");
const Appointment = require("../models/Appointment");
const Pet = require("../models/Pet");

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = asyncHandler(async (req, res) => {
  const { petId, date, time, notes, serviceType } = req.body;

  // Check if pet exists
  const pet = await Pet.findById(petId);
  if (!pet) {
    res.status(404);
    throw new Error("Pet not found");
  }

  // Check if date and time are provided
  if (!date || !time) {
    res.status(400);
    throw new Error("Please provide appointment date and time");
  }

  // Validate service type
  if (
    serviceType &&
    !["General Checkup", "Vaccination", "Grooming"].includes(serviceType)
  ) {
    res.status(400);
    throw new Error("Invalid service type");
  }

  // Check if there's already an appointment at the same time
  const existingAppointment = await Appointment.findOne({
    date,
    time,
    status: { $ne: "Cancelled" },
  });

  if (existingAppointment) {
    res.status(409); // Conflict status code
    throw new Error(
      "This time slot is already booked. Please select another time."
    );
  }

  // Create appointment
  const appointment = await Appointment.create({
    pet: petId,
    user: req.user._id,
    serviceType: serviceType || "General Checkup",
    date,
    time,
    notes: notes || "",
    status: "Pending",
  });

  res.status(201).json({
    success: true,
    appointment,
  });
});


// @desc    Get all appointments (admin only)
// @route   GET /api/appointments
// @access  Private/Admin
const getAppointments = asyncHandler(async (req, res) => {
  // Setup query filters
  const queryObj = {};

  // Filter by status
  if (req.query.status) {
    queryObj.status = req.query.status;
  }

  // Filter by pet
  if (req.query.petId) {
    queryObj.pet = req.query.petId;
  }

  // Filter by date
  if (req.query.date) {
    queryObj.date = req.query.date;
  }

  // Search by pet name or owner name
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, "i");
    const petIds = await Pet.find({ name: searchRegex }).distinct("_id");

    queryObj.$or = [{ pet: { $in: petIds } }];

    // Also search by user information if needed
    // This would require populating the user field
  }

  // Get appointments with pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const appointments = await Appointment.find(queryObj)
    .populate("pet", "name type breed imageUrl")
    .populate("user", "firstName lastName email")
    .sort({ date: 1, time: 1 })
    .skip(startIndex)
    .limit(limit);

  const totalAppointments = await Appointment.countDocuments(queryObj);

  res.status(200).json({
    success: true,
    count: appointments.length,
    total: totalAppointments,
    totalPages: Math.ceil(totalAppointments / limit),
    currentPage: page,
    appointments,
  });
});

// @desc    Get user's appointments
// @route   GET /api/appointments/user
// @access  Private
const getUserAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ user: req.user._id })
    .populate("pet", "name type breed imageUrl")
    .sort({ date: 1, time: 1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    appointments,
  });
});

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate("pet", "name type breed imageUrl")
    .populate("user", "firstName lastName email");

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  // Check if the appointment belongs to the authenticated user or user is admin
  if (
    appointment.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to access this appointment");
  }

  res.status(200).json({
    success: true,
    appointment,
  });
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = asyncHandler(async (req, res) => {
  const { petId, date, time, notes, serviceType } = req.body;

  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  // Check if the appointment belongs to the authenticated user or user is admin
  if (
    appointment.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to update this appointment");
  }

  // Validate service type if provided
  if (
    serviceType &&
    !["General Checkup", "Vaccination", "Grooming"].includes(serviceType)
  ) {
    res.status(400);
    throw new Error("Invalid service type");
  }

  // Check if the new time slot is already taken (if date or time is being changed)
  if (
    (date && date !== appointment.date) ||
    (time && time !== appointment.time)
  ) {
    const newDate = date || appointment.date;
    const newTime = time || appointment.time;

    const existingAppointment = await Appointment.findOne({
      _id: { $ne: req.params.id }, // Exclude current appointment
      date: newDate,
      time: newTime,
      status: { $ne: "Cancelled" },
    });

    if (existingAppointment) {
      res.status(409);
      throw new Error(
        "This time slot is already booked. Please select another time."
      );
    }
  }

  // Prepare update data
  const updateData = {};

  if (petId) {
    // Verify pet exists if changing
    const pet = await Pet.findById(petId);
    if (!pet) {
      res.status(404);
      throw new Error("Pet not found");
    }
    updateData.pet = petId;
  }

  if (date) updateData.date = date;
  if (time) updateData.time = time;
  if (notes !== undefined) updateData.notes = notes;
  if (serviceType) updateData.serviceType = serviceType;

  // Update appointment
  appointment = await Appointment.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate("pet", "name type breed imageUrl");

  res.status(200).json({
    success: true,
    appointment,
  });
});


// @desc    Update appointment status (admin only)
// @route   PATCH /api/appointments/:id/status
// @access  Private/Admin
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  // Validate status
  if (!["Pending", "Confirmed", "Cancelled"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  )
    .populate("pet", "name type breed imageUrl")
    .populate("user", "firstName lastName email");

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  res.status(200).json({
    success: true,
    appointment,
  });
});

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  // Check if the appointment belongs to the authenticated user or user is admin
  if (
    appointment.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this appointment");
  }

  await Appointment.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Appointment removed",
  });
});

// @desc    Get booked appointment slots
// @route   GET /api/appointments/booked-slots
// @access  Public
const getBookedSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;

  // If a specific date is provided, return just that date's booked times
  if (date) {
    const bookedTimes = await Appointment.find({
      date,
      status: { $ne: "Cancelled" },
    }).select("time");

    return res.status(200).json({
      success: true,
      date,
      bookedTimes: bookedTimes.map((appointment) => appointment.time),
    });
  }

  // Otherwise return bookings for the next 30 days
  const today = new Date();
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + 30);

  const dateStr = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  const endDateStr = thirtyDaysLater.toISOString().split("T")[0];

  // Find all active appointments in the next 30 days
  const appointments = await Appointment.find({
    date: {
      $gte: dateStr,
      $lte: endDateStr,
    },
    status: { $ne: "Cancelled" },
  }).select("date time");

  // Organize appointments by date
  const bookedSlots = {};
  appointments.forEach((appointment) => {
    if (!bookedSlots[appointment.date]) {
      bookedSlots[appointment.date] = [];
    }
    bookedSlots[appointment.date].push(appointment.time);
  });

  // Calculate availability for each date
  const dates = [];
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + 1); // Start from tomorrow

  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const currentDateStr = currentDate.toISOString().split("T")[0];

    const bookedTimesForDate = bookedSlots[currentDateStr] || [];
    const totalSlots = 8; // 8 time slots per day (9am-5pm)

    dates.push({
      date: currentDateStr,
      available: bookedTimesForDate.length < totalSlots,
      appointmentCount: bookedTimesForDate.length,
      totalSlots,
    });
  }

  res.status(200).json({
    success: true,
    bookedSlots,
    dates,
  });
});

module.exports = {
  createAppointment,
  getAppointments,
  getUserAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getBookedSlots,
};
