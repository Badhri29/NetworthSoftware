const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

/* CREATE TRANSACTION*/
router.post("/", async (req, res) => {
  try {
    const {
      date,
      type,
      category,
      subcategory,
      details,
      amount,
      paymentMode,
      card
    } = req.body;

    if (!date || !type || amount === undefined || !paymentMode) {
      return res.status(400).json({
        success: false,
        message: "date, type, amount, and paymentMode are required"
      });
    }

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount)) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid number"
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(date),
        type,
        category: category || null,
        subcategory: subcategory || null,
        description: details || null,
        amount: parsedAmount,
        paymentMode,
        card: paymentMode === "credit" ? card || null : null,
        user: {
          connect: { id: req.user.id }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error("Transaction creation failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create transaction"
    });
  }
});

/* GET TRANSACTIONS FOR LOGGED-IN USER */
router.get("/", async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        updatedAt: "desc"
      },
      ...(limit ? { take: limit } : {})
    });

    return res.json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transactions"
    });
  }
});

/* DELETE TRANSACTION (SAFE + USER-SCOPED) */
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID"
      });
    }

    const result = await prisma.transaction.deleteMany({
      where: {
        id,
        userId: req.user.id   // 🔐 IMPORTANT
      }
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    return res.json({ success: true });

  } catch (err) {
    console.error("Delete transaction failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete transaction"
    });
  }
});

module.exports = router;
