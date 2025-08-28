const mongoose = require("mongoose");

const petSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Pet name is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Pet type is required"],
      enum: ["Dog", "Cat", "Bird", "Other"],
      default: "Dog",
    },
    breed: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male", "Female"],
      default: "Male",
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Available", "Pending", "Adopted", "Registered"], // Added "Registered" for user-owned pets
      default: "Available",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // New field for pet ownership
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Flag to distinguish between shelter pets and user-owned pets
    isUserPet: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster searching
petSchema.index({ name: "text", breed: "text", description: "text" });
petSchema.index({ owner: 1 }); // Index for faster queries by owner

const Pet = mongoose.model("Pet", petSchema);
module.exports = Pet;
