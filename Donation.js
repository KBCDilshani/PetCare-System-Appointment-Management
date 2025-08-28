const mongoose = require("mongoose");

const donationSchema = mongoose.Schema(
  {
    donor: {
      type: String,
      required: [true, "Donor name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    amount: {
      type: Number,
      required: [true, "Donation amount is required"],
      min: [1, "Amount must be at least 1"],
    },
    purpose: {
      type: String,
      required: [true, "Donation purpose is required"],
      enum: [
        "Food & Supplies",
        "Medical Care",
        "Shelter Maintenance",
        "General Support",
      ],
    },
    message: {
      type: String,
      default: "",
    },
    // If user is logged in, associate donation with their account
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Payment information - could expand this for different payment methods
    paymentInfo: {
      method: {
        type: String,
        default: "credit_card",
      },
      status: {
        type: String,
        default: "completed",
      },
      transactionId: {
        type: String,
        default: function () {
          // Generate a simple transaction ID
          return "TXN" + Date.now() + Math.floor(Math.random() * 1000);
        },
      },
    },
    receiptGenerated: {
      type: Boolean,
      default: false,
    },
    receiptNumber: {
      type: String,
      unique: true,
      default: function () {
        // Generate a receipt number with format RCP-YYYYMMDD-XXXX
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const random = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0");
        return `RCP-${year}${month}${day}-${random}`;
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster searching and reporting
donationSchema.index({ donor: 1, email: 1 });
donationSchema.index({ purpose: 1 });
donationSchema.index({ createdAt: 1 });
donationSchema.index({ amount: 1 });

const Donation = mongoose.model("Donation", donationSchema);

module.exports = Donation;
