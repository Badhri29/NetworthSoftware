const express = require("express");
const { requireFields } = require("../middleware/validation");
const { getState, commit, nextId } = require("../utils/store");

const router = express.Router();

// Categories CRUD
router.get("/categories", async (req, res) => {
  try {
    const db = getState();
    const categories = db.categories
      .filter((c) => c.userId === req.user.id)
      .sort((a, b) => a.name.localeCompare(b.name));
    res.json({ categories });
  } catch (err) {
    console.error("List categories error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/categories",
  requireFields(["name", "type"]),
  async (req, res) => {
    try {
      const { name, type } = req.body;
      if (!["INCOME", "EXPENSE"].includes(type)) {
        return res.status(400).json({ error: "Invalid category type" });
      }
      const category = {
        id: nextId("categories"),
        name,
        type,
        userId: req.user.id,
        createdAt: new Date().toISOString(),
      };
      commit((db) => {
        db.categories.push(category);
      });
      res.status(201).json({ category });
    } catch (err) {
      console.error("Create category error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.put(
  "/categories/:id",
  requireFields(["name", "type"]),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { name, type } = req.body;
      if (!["INCOME", "EXPENSE"].includes(type)) {
        return res.status(400).json({ error: "Invalid category type" });
      }
      const db = getState();
      const existing = db.categories.find(
        (c) => c.id === id && c.userId === req.user.id
      );
      if (!existing) {
        return res.status(404).json({ error: "Category not found" });
      }
      let updated;
      commit((s) => {
        const cat = s.categories.find(
          (c) => c.id === id && c.userId === req.user.id
        );
        if (cat) {
          cat.name = name;
          cat.type = type;
          updated = { ...cat };
        }
      });
      res.json({ category: updated });
    } catch (err) {
      console.error("Update category error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.delete("/categories/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const db = getState();
    const existing = db.categories.find(
      (c) => c.id === id && c.userId === req.user.id
    );
    if (!existing) {
      return res.status(404).json({ error: "Category not found" });
    }
    const txCount = db.transactions.filter(
      (t) => t.categoryId === id && t.userId === req.user.id
    ).length;
    if (txCount > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete category with transactions" });
    }
    commit((s) => {
      s.categories = s.categories.filter((c) => c.id !== id);
      s.subcategories = s.subcategories.filter((sc) => sc.categoryId !== id);
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Subcategories CRUD
router.get("/subcategories", async (req, res) => {
  try {
    const db = getState();
    const { categoryId } = req.query;
    let subcategories = db.subcategories.filter(
      (s) => s.userId === req.user.id
    );
    if (categoryId) {
      const cid = parseInt(categoryId, 10);
      subcategories = subcategories.filter((s) => s.categoryId === cid);
    }
    subcategories.sort((a, b) => a.name.localeCompare(b.name));
    res.json({ subcategories });
  } catch (err) {
    console.error("List subcategories error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/subcategories",
  requireFields(["name", "categoryId"]),
  async (req, res) => {
    try {
      const { name, categoryId } = req.body;
      const db = getState();
      const category = db.categories.find(
        (c) => c.id === Number(categoryId) && c.userId === req.user.id
      );
      if (!category) {
        return res.status(400).json({ error: "Invalid category" });
      }
      const subcategory = {
        id: nextId("subcategories"),
        name,
        categoryId: category.id,
        userId: req.user.id,
        createdAt: new Date().toISOString(),
      };
      commit((s) => {
        s.subcategories.push(subcategory);
      });
      res.status(201).json({ subcategory });
    } catch (err) {
      console.error("Create subcategory error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.put(
  "/subcategories/:id",
  requireFields(["name"]),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { name } = req.body;
      const db = getState();
      const existing = db.subcategories.find(
        (sc) => sc.id === id && sc.userId === req.user.id
      );
      if (!existing) {
        return res.status(404).json({ error: "Subcategory not found" });
      }
      let updated;
      commit((s) => {
        const sub = s.subcategories.find(
          (sc) => sc.id === id && sc.userId === req.user.id
        );
        if (sub) {
          sub.name = name;
          updated = { ...sub };
        }
      });
      res.json({ subcategory: updated });
    } catch (err) {
      console.error("Update subcategory error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.delete("/subcategories/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const db = getState();
    const existing = db.subcategories.find(
      (sc) => sc.id === id && sc.userId === req.user.id
    );
    if (!existing) {
      return res.status(404).json({ error: "Subcategory not found" });
    }
    const txCount = db.transactions.filter(
      (t) => t.subcategoryId === id && t.userId === req.user.id
    ).length;
    if (txCount > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete subcategory with transactions" });
    }
    commit((s) => {
      s.subcategories = s.subcategories.filter((sc) => sc.id !== id);
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete subcategory error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;


