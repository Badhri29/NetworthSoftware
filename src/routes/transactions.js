const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * CREATE TRANSACTION
 * POST /api/transactions
 */
router.post("/", async (req, res) => {
  console.log("Authenticated user:", req.user);
  console.log("Request body:", req.body);

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

    // ✅ Validate required fields
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

    // ✅ Create transaction with proper Prisma relation
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

        // 🔥 IMPORTANT: correct way to link user
        user: {
          connect: {
            id: req.user.id
          }
        }
      }
    });

    console.log("Transaction created successfully:", transaction);

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction
    });

  } catch (error) {
    console.error("Transaction creation failed:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: "Failed to create transaction",
      error: process.env.NODE_ENV !== "production"
        ? error.message
        : undefined
    });
  }
});

/**
 * GET TRANSACTIONS FOR LOGGED-IN USER
 * GET /api/transactions
 */
router.get("/", async (req, res) => {
  try {
    console.log("Fetching transactions for user:", req.user.id);

    const transactions = await prisma.transaction.findMany({
      where: {
        user: {
          id: req.user.id
        }
      },
      orderBy: {
        date: "desc"
      }
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

module.exports = router;
