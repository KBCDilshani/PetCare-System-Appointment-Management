const asyncHandler = require("express-async-handler");
const Pet = require("../models/Pet");

// @desc    Create a new pet (admin only)
// @route   POST /api/pets
// @access  Private/Admin
const createPet = asyncHandler(async (req, res) => {
  const { name, type, breed, gender, age, description, imageUrl, status } =
    req.body;

  const pet = await Pet.create({
    name,
    type,
    breed,
    gender,
    age,
    description,
    imageUrl,
    status,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    pet,
  });
});

// @desc    Register a new pet (for regular users)
// @route   POST /api/pets/register
// @access  Private
const registerUserPet = asyncHandler(async (req, res) => {
  const { name, type, breed, gender, age, description, imageUrl } = req.body;

  const pet = await Pet.create({
    name,
    type,
    breed,
    gender,
    age,
    description,
    imageUrl: imageUrl || "", // Make image optional
    status: "Registered", // User's pets are "Registered"
    createdBy: req.user._id,
    owner: req.user._id,
    isUserPet: true,
  });

  res.status(201).json({
    success: true,
    pet,
  });
});

// @desc    Get all pets
// @route   GET /api/pets
// @access  Public
const getPets = asyncHandler(async (req, res) => {
  // Setup query filters
  const queryObj = {};

  // Filter by type
  if (req.query.type) {
    queryObj.type = req.query.type;
  }

  // Filter by status
  if (req.query.status) {
    queryObj.status = req.query.status;
  }

  // Filter by age range
  if (req.query.ageRange) {
    if (req.query.ageRange === "0-2") {
      queryObj.age = { $lte: 2 };
    } else if (req.query.ageRange === "3-5") {
      queryObj.age = { $gte: 3, $lte: 5 };
    } else if (req.query.ageRange === "6+") {
      queryObj.age = { $gte: 6 };
    }
  }

  // Search by name or breed
  if (req.query.search) {
    queryObj.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { breed: { $regex: req.query.search, $options: "i" } },
    ];
  }

  // By default, exclude user-registered pets from the general pet list
  if (req.query.includeUserPets !== "true") {
    queryObj.isUserPet = { $ne: true };
  }

  const pets = await Pet.find(queryObj).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: pets.length,
    pets,
  });
});

// @desc    Get user's registered pets
// @route   GET /api/pets/mypets
// @access  Private
const getUserPets = asyncHandler(async (req, res) => {
  const pets = await Pet.find({ owner: req.user._id, isUserPet: true }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: pets.length,
    pets,
  });
});

// @desc    Get pet by ID
// @route   GET /api/pets/:id
// @access  Public
const getPetById = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    res.status(404);
    throw new Error("Pet not found");
  }

  res.status(200).json({
    success: true,
    pet,
  });
});

// @desc    Update pet
// @route   PUT /api/pets/:id
// @access  Private/Admin
const updatePet = asyncHandler(async (req, res) => {
  const { name, type, breed, gender, age, description, imageUrl, status } =
    req.body;

  let pet = await Pet.findById(req.params.id);

  if (!pet) {
    res.status(404);
    throw new Error("Pet not found");
  }

  pet = await Pet.findByIdAndUpdate(
    req.params.id,
    {
      name,
      type,
      breed,
      gender,
      age,
      description,
      imageUrl,
      status,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    pet,
  });
});

// @desc    Update user pet
// @route   PUT /api/pets/mypets/:id
// @access  Private
const updateUserPet = asyncHandler(async (req, res) => {
  const { name, type, breed, gender, age, description, imageUrl } = req.body;

  let pet = await Pet.findById(req.params.id);

  if (!pet) {
    res.status(404);
    throw new Error("Pet not found");
  }

  // Ensure the user only updates their own pets
  if (pet.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this pet");
  }

  pet = await Pet.findByIdAndUpdate(
    req.params.id,
    {
      name,
      type,
      breed,
      gender,
      age,
      description,
      imageUrl,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    pet,
  });
});

// @desc    Delete pet
// @route   DELETE /api/pets/:id
// @access  Private/Admin
const deletePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    res.status(404);
    throw new Error("Pet not found");
  }

  await Pet.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Pet removed",
  });
});

// @desc    Delete user pet
// @route   DELETE /api/pets/mypets/:id
// @access  Private
const deleteUserPet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    res.status(404);
    throw new Error("Pet not found");
  }

  // Ensure the user only deletes their own pets
  if (pet.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this pet");
  }

  await Pet.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Pet removed",
  });
});

// @desc    Get pet stats (for dashboard)
// @route   GET /api/pets/stats
// @access  Private/Admin
const getPetStats = asyncHandler(async (req, res) => {
  const totalPets = await Pet.countDocuments({ isUserPet: false });
  const availablePets = await Pet.countDocuments({
    status: "Available",
    isUserPet: false,
  });
  const pendingPets = await Pet.countDocuments({
    status: "Pending",
    isUserPet: false,
  });
  const adoptedPets = await Pet.countDocuments({
    status: "Adopted",
    isUserPet: false,
  });
  const registeredPets = await Pet.countDocuments({ isUserPet: true });

  // Get count by pet type
  const dogCount = await Pet.countDocuments({ type: "Dog", isUserPet: false });
  const catCount = await Pet.countDocuments({ type: "Cat", isUserPet: false });
  const birdCount = await Pet.countDocuments({
    type: "Bird",
    isUserPet: false,
  });
  const otherCount = await Pet.countDocuments({
    type: "Other",
    isUserPet: false,
  });

  // Most recent pets
  const recentPets = await Pet.find({ isUserPet: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name type status createdAt");

  res.status(200).json({
    success: true,
    stats: {
      total: totalPets,
      available: availablePets,
      pending: pendingPets,
      adopted: adoptedPets,
      registered: registeredPets,
      byType: {
        dog: dogCount,
        cat: catCount,
        bird: birdCount,
        other: otherCount,
      },
      recentPets,
    },
  });
});

module.exports = {
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
};
