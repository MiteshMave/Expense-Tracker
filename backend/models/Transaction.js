
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Transaction title is required"],
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than zero"],
    },

    type: {
      type: String,
      required: true,
      enum: {
        values: ["income", "expense"],
        message: "Type must be income or expense",
      },
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    date: {
      type: Date,
      required: [true, "Transaction date is required"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Transaction",
  transactionSchema
);
