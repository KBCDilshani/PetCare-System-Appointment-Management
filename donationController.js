const asyncHandler = require("express-async-handler");
const Donation = require("../models/Donation");

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Public
const createDonation = asyncHandler(async (req, res) => {
  const { amount, purpose, name, email, message } = req.body;

  // Basic validation
  if (!amount || !purpose || !name || !email) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Create donation record
const donation = await Donation.create({
  donor: name,
  email,
  amount: parseFloat(amount),
  purpose,
  message: message || "",
  user: req.user ? req.user._id : null, // Associate with user if logged in
});

  // In a real implementation, you would integrate with a payment gateway here
  // For demonstration purposes, we're assuming the payment is successful

  res.status(201).json({
    success: true,
    donation,
  });
});

// @desc    Get all donations
// @route   GET /api/donations
// @access  Private/Admin
const getDonations = asyncHandler(async (req, res) => {
  // Setup query filters
  const queryObj = {};

  // Filter by purpose
  if (req.query.purpose) {
    queryObj.purpose = req.query.purpose;
  }

  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    queryObj.createdAt = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  } else if (req.query.startDate) {
    queryObj.createdAt = { $gte: new Date(req.query.startDate) };
  } else if (req.query.endDate) {
    queryObj.createdAt = { $lte: new Date(req.query.endDate) };
  }

  // Filter by amount range
  if (req.query.minAmount || req.query.maxAmount) {
    queryObj.amount = {};
    if (req.query.minAmount) {
      queryObj.amount.$gte = parseFloat(req.query.minAmount);
    }
    if (req.query.maxAmount) {
      queryObj.amount.$lte = parseFloat(req.query.maxAmount);
    }
  }

  // Search by donor name or email
  if (req.query.search) {
    queryObj.$or = [
      { donor: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }

  // Get donations with pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const donations = await Donation.find(queryObj)
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const totalDonations = await Donation.countDocuments(queryObj);
  const totalAmount = await Donation.aggregate([
    { $match: queryObj },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  res.status(200).json({
    success: true,
    count: donations.length,
    total: totalDonations,
    totalPages: Math.ceil(totalDonations / limit),
    currentPage: page,
    totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
    donations,
  });
});

// @desc    Get donation by ID
// @route   GET /api/donations/:id
// @access  Private/Admin
const getDonationById = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);

  if (!donation) {
    res.status(404);
    throw new Error("Donation not found");
  }

  res.status(200).json({
    success: true,
    donation,
  });
});

// @desc    Get donations summary statistics
// @route   GET /api/donations/summary
// @access  Private/Admin
const getDonationsSummary = asyncHandler(async (req, res) => {
  // Get total donations
  const totalCount = await Donation.countDocuments();

  // Get total amount donated
  const totalAmount = await Donation.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  // Get donations by purpose
  const byPurpose = await Donation.aggregate([
    {
      $group: {
        _id: "$purpose",
        count: { $sum: 1 },
        amount: { $sum: "$amount" },
      },
    },
    { $sort: { amount: -1 } },
  ]);

  // Get donations by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const byMonth = await Donation.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
        amount: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Format the monthly data for easier frontend consumption
  const monthlyData = byMonth.map((item) => ({
    period: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
    count: item.count,
    amount: item.amount,
  }));

  res.status(200).json({
    success: true,
    totalCount,
    totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
    byPurpose,
    monthlyData,
  });
});

// @desc    Update donation (e.g., mark receipt generated)
// @route   PATCH /api/donations/:id
// @access  Private/Admin
const updateDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);

  if (!donation) {
    res.status(404);
    throw new Error("Donation not found");
  }

  // Update only allowed fields
  if (req.body.receiptGenerated !== undefined) {
    donation.receiptGenerated = req.body.receiptGenerated;
  }

  const updatedDonation = await donation.save();

  res.status(200).json({
    success: true,
    donation: updatedDonation,
  });
});

// @desc    Get user's own donations
// @route   GET /api/donations/user
// @access  Private
const getUserDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  const totalAmount = await Donation.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  res.status(200).json({
    success: true,
    count: donations.length,
    totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
    donations,
  });
});

module.exports = {
  createDonation,
  getDonations,
  getDonationById,
  getDonationsSummary,
  updateDonation,
  getUserDonations,
};
