/**
 * Global error handling middleware
 * Formats errors consistently and handles different types of errors
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 if status code not already set
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message;

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((error) => error.message);
    message = errors.join(", ");
    res.status(400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    message = `Duplicate value entered for ${Object.keys(err.keyValue)} field`;
    res.status(400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token";
    res.status(401);
  }

  if (err.name === "TokenExpiredError") {
    message = "Your session has expired. Please log in again.";
    res.status(401);
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
    // Include timestamp for debugging
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandler;
