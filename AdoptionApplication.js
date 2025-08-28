const mongoose = require("mongoose");

const adoptionApplicationSchema = mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    address: {
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      zipCode: {
        type: String,
        required: [true, "ZIP code is required"],
        trim: true,
      },
    },
    housingType: {
      type: String,
      required: [true, "Housing type is required"],
      enum: ["house", "apartment", "condo", "other"],
    },
    hasYard: {
      type: String,
      required: [true, "Yard information is required"],
      enum: ["yes", "no"],
    },
    otherPets: {
      type: String,
      required: [true, "Information about other pets is required"],
      enum: ["yes", "no"],
    },
    experience: {
      type: String,
      required: [true, "Previous pet experience is required"],
    },
    reason: {
      type: String,
      required: [true, "Reason for adoption is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster searching
adoptionApplicationSchema.index({ pet: 1, email: 1 });
adoptionApplicationSchema.index({ status: 1 });

const AdoptionApplication = mongoose.model(
  "AdoptionApplication",
  adoptionApplicationSchema
);

module.exports = AdoptionApplication;