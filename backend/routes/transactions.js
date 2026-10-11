
const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");

// GET: Fetch all transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({
      createdAt: -1,
    });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch transactions.",
    });
  }
});

// POST: Create a transaction
router.post("/", async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);

    res.status(201).json(transaction);
  } catch (error) {
    if (error.name === "ValidationError" ||
        error.name === "CastError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to create transaction.",
    });
  }
});

// DELETE: Remove a transaction
router.delete("/:id", async (req, res) => {
  try {
    if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
      return res.status(400).json({
        message: "Invalid transaction ID.",
      });
    }

    const transaction = await Transaction.findByIdAndDelete(
      req.params.id
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

    res.status(200).json({
      message: "Transaction deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete transaction.",
    });
  }
});
// Update an existing transaction
router.put("/:id", async (req, res) => {
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTransaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json(updatedTransaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({
      message: "Failed to update transaction",
    });
  }
});

module.exports = router;
