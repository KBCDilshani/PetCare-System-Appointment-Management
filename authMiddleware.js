const asyncHandler = require("express-async-handler");
const User = require("../models/User"); // Make sure path matches your structure
const jwt = require("jsonwebtoken");

/**
 * Middleware to protect routes requiring authentication
 * Verifies JWT token from cookies or Authorization header
 */
const protect = asyncHandler(async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Check Authorization header as fallback
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }

    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      res.status(401);
      throw new Error("Invalid token, please login again");
    } else if (error.name === "TokenExpiredError") {
      res.status(401);
      throw new Error("Token expired, please login again");
    } else {
      res.status(401);
      throw new Error("Not authorized, please login");
    }
  }
});

/**
 * Middleware to restrict routes to admin users only
 */
const adminOnly = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, please login");
  }

  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Access denied: Admin privileges required");
  }

  next();
});

/**
 * Middleware to restrict routes to caregivers or admin
 */
const caregiverOrAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, please login");
  }

  if (req.user.role !== "admin" && req.user.role !== "caregiver") {
    res.status(403);
    throw new Error("Access denied: Caregiver or admin privileges required");
  }

  next();
});


// Add to authMiddleware.js
const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Check Authorization header as fallback
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      // Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select("-password");

      if (user) {
        // Add user to request object if found
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // If token validation fails, just continue without setting req.user
    next();
  }
});

module.exports = { protect, adminOnly, caregiverOrAdmin, optionalAuth };
