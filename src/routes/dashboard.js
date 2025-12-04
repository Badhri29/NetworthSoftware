const express = require("express");
const { getState } = require("../utils/store");

const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getState();

    const assets = db.assets.filter((a) => a.userId === userId);
    const liabilities = db.liabilities.filter((l) => l.userId === userId);
    const transactions = db.transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    const totalAssets = assets.reduce((sum, a) => sum + Number(a.value || 0), 0);
    const totalLiabilities = liabilities.reduce(
      (sum, l) => sum + Number(l.value || 0),
      0
    );
    const netWorth = totalAssets - totalLiabilities;

    const categoriesById = new Map(
      db.categories
        .filter((c) => c.userId === userId)
        .map((c) => [c.id, c])
    );
    const subcategoriesById = new Map(
      db.subcategories
        .filter((s) => s.userId === userId)
        .map((s) => [s.id, s])
    );

    const recentTransactions = transactions.map((t) => ({
      ...t,
      category: categoriesById.get(t.categoryId) || null,
      subcategory: t.subcategoryId
        ? subcategoriesById.get(t.subcategoryId) || null
        : null,
    }));

    res.json({
      totalAssets,
      totalLiabilities,
      netWorth,
      recentTransactions,
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/net-worth-series", async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const points = [];

    const db = getState();
    const assets = db.assets.filter((a) => a.userId === userId);
    const liabilities = db.liabilities.filter((l) => l.userId === userId);
    const totalAssets = assets.reduce((sum, a) => sum + Number(a.value || 0), 0);
    const totalLiabilities = liabilities.reduce(
      (sum, l) => sum + Number(l.value || 0),
      0
    );
    const currentNetWorth = totalAssets - totalLiabilities;

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
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/monthly", async (req, res) => {
  try {
    const userId = req.user.id;
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const db = getState();
    const txs = db.transactions
      .filter((t) => {
        if (t.userId !== userId) return false;
        const d = new Date(t.date);
        return d >= start && d < end;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const months = Array.from({ length: 12 }, () => ({
      income: 0,
      expense: 0,
    }));

    txs.forEach((tx) => {
      const m = tx.date.getMonth();
      if (tx.type === "INCOME") {
        months[m].income += Number(tx.amount);
      } else if (tx.type === "EXPENSE") {
        months[m].expense += Number(tx.amount);
      }
    });

    const data = months.map((m, index) => ({
      month: `${year}-${String(index + 1).padStart(2, "0")}`,
      income: m.income,
      expense: m.expense,
      savings: m.income - m.expense,
    }));

    res.json({ year, data });
  } catch (err) {
    console.error("Monthly analytics error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/top-categories", async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, limit } = req.query;
    const lim = Math.min(parseInt(limit || "5", 10), 20);

    const db = getState();
    let txs = db.transactions.filter(
      (t) => t.userId === userId && t.type === "EXPENSE"
    );
    if (startDate) {
      const s = new Date(startDate);
      txs = txs.filter((t) => new Date(t.date) >= s);
    }
    if (endDate) {
      const e = new Date(endDate);
      txs = txs.filter((t) => new Date(t.date) <= e);
    }

    const categoriesById = new Map(
      db.categories
        .filter((c) => c.userId === userId)
        .map((c) => [c.id, c])
    );

    const byCategory = new Map();
    for (const tx of txs) {
      const cat = categoriesById.get(tx.categoryId);
      if (!cat) continue;
      const key = tx.categoryId;
      const prev = byCategory.get(key) || {
        categoryId: key,
        name: cat.name,
        total: 0,
      };
      prev.total += Number(tx.amount);
      byCategory.set(key, prev);
    }

    const sorted = Array.from(byCategory.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, lim);

    res.json({ categories: sorted });
  } catch (err) {
    console.error("Top categories error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;


