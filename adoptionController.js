const asyncHandler = require("express-async-handler");
const AdoptionApplication = require("../models/AdoptionApplication");
const Pet = require("../models/Pet");

// @desc    Create a new adoption application
// @route   POST /api/adoptions
// @access  Public
const createAdoptionApplication = asyncHandler(async (req, res) => {
  const {
    petId,
    firstName,
    lastName,
    email,
    phone,
    address,
    city,
    state,
    zipCode,
    housingType,
    hasYard,
    otherPets,
    experience,
    reason,
  } = req.body;

  // Check if pet exists
  const pet = await Pet.findById(petId);
  if (!pet) {
    res.status(404);
    throw new Error("Pet not found");
  }

  // Check if pet is available for adoption
  if (pet.status !== "Available") {
    res.status(400);
    throw new Error("This pet is not available for adoption");
  }

  // Create adoption application
  const application = await AdoptionApplication.create({
    pet: petId,
    applicant: req.user ? req.user._id : null, // If user is logged in
    firstName,
    lastName,
    email,
    phone,
    address: {
      street: address,
      city,
      state,
      zipCode,
    },
    housingType,
    hasYard,
    otherPets,
    experience,
    reason,
    status: "pending",
  });

  // Update pet status to pending
  pet.status = "Pending";
  await pet.save();

  res.status(201).json({
    success: true,
    application,
  });
});

// @desc    Get all adoption applications
// @route   GET /api/adoptions
// @access  Private/Admin
const getAdoptionApplications = asyncHandler(async (req, res) => {
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

  // Search by applicant name or email
  if (req.query.search) {
    queryObj.$or = [
      { firstName: { $regex: req.query.search, $options: "i" } },
      { lastName: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }

  // Get applications with pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const applications = await AdoptionApplication.find(queryObj)
    .populate("pet", "name type breed imageUrl")
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const totalApplications = await AdoptionApplication.countDocuments(queryObj);

  res.status(200).json({
    success: true,
    count: applications.length,
    total: totalApplications,
    totalPages: Math.ceil(totalApplications / limit),
    currentPage: page,
    applications,
  });
});

// @desc    Get application by ID
// @route   GET /api/adoptions/:id
// @access  Private/Admin
const getAdoptionApplicationById = asyncHandler(async (req, res) => {
  const application = await AdoptionApplication.findById(
    req.params.id
  ).populate("pet", "name type breed gender age imageUrl status");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  res.status(200).json({
    success: true,
    application,
  });
});

// @desc    Update application status
// @route   PUT /api/adoptions/:id
// @access  Private/Admin
const updateAdoptionStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;

  // Validate status
  if (!["pending", "approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  let application = await AdoptionApplication.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Update application
  application = await AdoptionApplication.findByIdAndUpdate(
    req.params.id,
    {
      status,
      adminNotes: adminNotes || application.adminNotes,
    },
    { new: true, runValidators: true }
  ).populate("pet", "name type breed imageUrl status");

  // If application is approved or rejected, update pet status accordingly
  if (status === "approved") {
    await Pet.findByIdAndUpdate(application.pet._id, { status: "Adopted" });
    // Update the populated pet object to reflect the change
    application.pet.status = "Adopted";
  } else if (status === "rejected" && application.pet.status === "Pending") {
    await Pet.findByIdAndUpdate(application.pet._id, { status: "Available" });
    // Update the populated pet object to reflect the change
    application.pet.status = "Available";
  }

  res.status(200).json({
    success: true,
    application,
  });
});

// @desc    Get user's applications
// @route   GET /api/adoptions/user
// @access  Private
const getUserApplications = asyncHandler(async (req, res) => {
  // When user is authenticated and tries to get their own applications
  const applications = await AdoptionApplication.find({
    $or: [{ applicant: req.user._id }, { email: req.user.email }],
  })
    .populate("pet", "name type breed imageUrl status")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: applications.length,
    applications,
  });
});

// @desc    Delete application
// @route   DELETE /api/adoptions/:id
// @access  Private/Admin
const deleteAdoptionApplication = asyncHandler(async (req, res) => {
  const application = await AdoptionApplication.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // If application was pending, update pet status back to available
  if (application.status === "pending") {
    const pet = await Pet.findById(application.pet);
    if (pet && pet.status === "Pending") {
      pet.status = "Available";
      await pet.save();
    }
  }

  await AdoptionApplication.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Application removed",
  });
});

module.exports = {
  createAdoptionApplication,
  getAdoptionApplications,
  getAdoptionApplicationById,
  updateAdoptionStatus,
  getUserApplications,
  deleteAdoptionApplication,
};
