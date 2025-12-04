const express = require("express");
const { requireFields, parsePagination } = require("../middleware/validation");
const { getState, commit, nextId } = require("../utils/store");

const router = express.Router();

router.get("/", parsePagination, async (req, res) => {
  try {
    const { startDate, endDate, type, categoryId, search } = req.query;
    const { skip, take, page, pageSize } = req.pagination;

    const db = getState();
    let items = db.transactions.filter((t) => t.userId === req.user.id);

    if (startDate) {
      const s = new Date(startDate);
      items = items.filter((t) => new Date(t.date) >= s);
    }
    if (endDate) {
      const e = new Date(endDate);
      items = items.filter((t) => new Date(t.date) <= e);
    }
    if (type && ["INCOME", "EXPENSE"].includes(type)) {
      items = items.filter((t) => t.type === type);
    }
    if (categoryId) {
      const cid = Number(categoryId);
      items = items.filter((t) => t.categoryId === cid);
    }
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(
        (t) =>
          (t.description || "").toLowerCase().includes(s)
      );
    }

    // attach category/subcategory objects
    const categoriesById = new Map(
      db.categories
        .filter((c) => c.userId === req.user.id)
        .map((c) => [c.id, c])
    );
    const subcategoriesById = new Map(
      db.subcategories
        .filter((s) => s.userId === req.user.id)
        .map((s) => [s.id, s])
    );

    const total = items.length;
    const pageItems = items
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(skip, skip + take)
      .map((t) => ({
        ...t,
        category: categoriesById.get(t.categoryId) || null,
        subcategory: t.subcategoryId
          ? subcategoriesById.get(t.subcategoryId) || null
          : null,
      }));

    res.json({
      page,
      pageSize,
      total,
      items: pageItems,
    });
  } catch (err) {
    console.error("List transactions error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/",
  requireFields(["amount", "date", "type", "categoryId"]),
  async (req, res) => {
    try {
      const { amount, date, type, categoryId, subcategoryId, description } =
        req.body;
      if (!["INCOME", "EXPENSE"].includes(type)) {
        return res.status(400).json({ error: "Invalid transaction type" });
      }

      const db = getState();
      const catId = Number(categoryId);
      const category = db.categories.find(
        (c) => c.id === catId && c.userId === req.user.id
      );
      if (!category) {
        return res.status(400).json({ error: "Invalid category" });
      }

      let subcatId = null;
      if (subcategoryId) {
        const sid = Number(subcategoryId);
        const sub = db.subcategories.find(
          (s) => s.id === sid && s.userId === req.user.id
        );
        if (!sub) {
          return res.status(400).json({ error: "Invalid subcategory" });
        }
        subcatId = sub.id;
      }

      const tx = {
        id: nextId("transactions"),
        amount: Number(amount),
        date: new Date(date).toISOString(),
        type,
        description: description || null,
        userId: req.user.id,
        categoryId: category.id,
        subcategoryId: subcatId,
        createdAt: new Date().toISOString(),
      };

      commit((s) => {
        s.transactions.push(tx);
      });

      res.status(201).json({ transaction: tx });
    } catch (err) {
      console.error("Create transaction error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.put(
  "/:id",
  requireFields(["amount", "date", "type", "categoryId"]),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { amount, date, type, categoryId, subcategoryId, description } =
        req.body;

      const db = getState();
      const existing = db.transactions.find(
        (t) => t.id === id && t.userId === req.user.id
      );
      if (!existing) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      if (!["INCOME", "EXPENSE"].includes(type)) {
        return res.status(400).json({ error: "Invalid transaction type" });
      }

      const catId = Number(categoryId);
      const category = db.categories.find(
        (c) => c.id === catId && c.userId === req.user.id
      );
      if (!category) {
        return res.status(400).json({ error: "Invalid category" });
      }

      let subcatId = null;
      if (subcategoryId) {
        const sid = Number(subcategoryId);
        const sub = db.subcategories.find(
          (s) => s.id === sid && s.userId === req.user.id
        );
        if (!sub) {
          return res.status(400).json({ error: "Invalid subcategory" });
        }
        subcatId = sub.id;
      }

      let updated;
      commit((s) => {
        const tx = s.transactions.find(
          (t) => t.id === id && t.userId === req.user.id
        );
        if (tx) {
          tx.amount = Number(amount);
          tx.date = new Date(date).toISOString();
          tx.type = type;
          tx.description = description || null;
          tx.categoryId = category.id;
          tx.subcategoryId = subcatId;
          updated = { ...tx };
        }
      });

      res.json({ transaction: updated });
    } catch (err) {
      console.error("Update transaction error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const db = getState();
    const existing = db.transactions.find(
      (t) => t.id === id && t.userId === req.user.id
    );
    if (!existing) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    commit((s) => {
      s.transactions = s.transactions.filter(
        (t) => !(t.id === id && t.userId === req.user.id)
      );
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete transaction error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;


