const { body, validationResult } = require("express-validator");

// Middleware to validate request data
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Validation rules for creating/updating pets
const validatePet = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Pet name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("type")
    .trim()
    .notEmpty()
    .withMessage("Pet type is required")
    .isIn(["Dog", "Cat", "Bird", "Other"])
    .withMessage("Invalid pet type"),

  body("breed")
    .trim()
    .optional()
    .isLength({ max: 50 })
    .withMessage("Breed name must be less than 50 characters"),

  body("gender")
    .trim()
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["Male", "Female"])
    .withMessage("Gender must be Male or Female"),

  body("age")
    .notEmpty()
    .withMessage("Age is required")
    .isFloat({ min: 0 })
    .withMessage("Age must be a positive number"),

  body("description")
    .trim()
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),

  body("status")
    .trim()
    .optional()
    .isIn(["Available", "Pending", "Adopted"])
    .withMessage("Invalid status value"),

  body("imageUrl")
    .optional()
    .isURL()
    .withMessage("Image URL must be valid")
    .isLength({ max: 1000 })
    .withMessage("Image URL is too long"),

  validateRequest,
];

module.exports = {
  validatePet,
};
