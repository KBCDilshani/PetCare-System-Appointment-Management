const mongoose = require("mongoose");

const appointmentSchema = mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceType: {
      type: String,
      enum: ["General Checkup", "Vaccination", "Grooming"],
      required: [true, "Service type is required"],
      default: "General Checkup",
    },
    date: {
      type: String,
      required: [true, "Appointment date is required"],
    },
    time: {
      type: String,
      required: [true, "Appointment time is required"],
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for faster queries
appointmentSchema.index({ user: 1, status: 1 });
appointmentSchema.index({ pet: 1 });
appointmentSchema.index({ date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ serviceType: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
