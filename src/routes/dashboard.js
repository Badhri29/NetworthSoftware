const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

/* GET DASHBOARD SUMMARY */
router.get("/summary", async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all data in parallel
    const [assets, liabilities, transactions] = await Promise.all([
      prisma.asset.findMany({
        where: { userId },
        select: { value: true }
      }),
      prisma.liability.findMany({
        where: { userId },
        select: { value: true }
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" }
      })
    ]);

    // Calculate asset totals
    const assetValue = assets.reduce((sum, a) => sum + Number(a.value || 0), 0);
    const liabilityValue = liabilities.reduce((sum, l) => sum + Number(l.value || 0), 0);

    // Calculate transaction totals
    let incomeTotal = 0;
    let expenseTotal = 0;

    transactions.forEach((tx) => {
      if (tx.type === "INCOME") {
        incomeTotal += Number(tx.amount || 0);
      } else if (tx.type === "EXPENSE") {
        expenseTotal += Number(tx.amount || 0);
      }
    });

    // Total assets = physical assets + income
    const totalAssets = assetValue + incomeTotal;
    // Total liabilities = physical liabilities + expenses
    const totalLiabilities = liabilityValue + expenseTotal;
    // Net worth = total assets - total liabilities
    const netWorth = totalAssets - totalLiabilities;

    // Get recent 10 transactions
    const recentTransactions = transactions.slice(0, 10);

    res.json({
      totalAssets,
      totalLiabilities,
      netWorth,
      recentTransactions
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
});

/* GET NET WORTH SERIES (LAST 12 MONTHS) */
router.get("/net-worth-series", async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const points = [];

    // Fetch current assets and liabilities
    const [assets, liabilities] = await Promise.all([
      prisma.asset.findMany({
        where: { userId },
        select: { value: true }
      }),
      prisma.liability.findMany({
        where: { userId },
        select: { value: true }
      })
    ]);

    const totalAssets = assets.reduce((sum, a) => sum + Number(a.value || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + Number(l.value || 0), 0);
    const currentNetWorth = totalAssets - totalLiabilities;

    // Generate last 12 months with current net worth
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      points.push({
        month: d.toISOString().slice(0, 7),
        netWorth: currentNetWorth,
      });
    }

    res.json({ points });
  } catch (err) {
    console.error("Net-worth series error:", err);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
});

/* GET MONTHLY DATA (INCOME, EXPENSE, SAVINGS) */
router.get("/monthly", async (req, res) => {
  try {
    const userId = req.user.id;
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    // Fetch all transactions for the year
    const txs = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lt: end
        }
      },
      select: {
        date: true,
        type: true,
        amount: true
      }
    });

    // Initialize months array
    const months = Array.from({ length: 12 }, () => ({
      income: 0,
      expense: 0,
    }));

    // Aggregate by month and type
    txs.forEach((tx) => {
      const m = new Date(tx.date).getMonth();
      if (tx.type === "INCOME") {
        months[m].income += Number(tx.amount);
      } else if (tx.type === "EXPENSE") {
        months[m].expense += Number(tx.amount);
      }
    });

    // Format response
    const data = months.map((m, index) => ({
      month: `${year}-${String(index + 1).padStart(2, "0")}`,
      income: m.income,
      expense: m.expense,
      savings: m.income - m.expense,
    }));

    res.json({ year, data });
  } catch (err) {
    console.error("Monthly analytics error:", err);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
});

/* GET TOP EXPENSE CATEGORIES */
router.get("/top-categories", async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, limit } = req.query;
    const lim = Math.min(parseInt(limit || "5", 10), 20);

    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Fetch expense transactions
    const txs = await prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
      },
      select: {
        category: true,
        amount: true
      }
    });

    // Aggregate by category
    const byCategory = new Map();
    for (const tx of txs) {
      if (!tx.category) continue;
      const key = tx.category;
      const prev = byCategory.get(key) || {
        category: key,
        total: 0,
      };
      prev.total += Number(tx.amount);
      byCategory.set(key, prev);
    }

    // Sort and limit
    const sorted = Array.from(byCategory.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, lim)
      .map(item => ({
        name: item.category,
        total: item.total
      }));

    res.json({ categories: sorted });
  } catch (err) {
    console.error("Top categories error:", err);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
});

module.exports = router;


