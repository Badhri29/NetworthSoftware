const express = require("express");
const { requireFields } = require("../middleware/validation");
const { getState, commit, nextId } = require("../utils/store");

const router = express.Router();

router.get("/assets", async (req, res) => {
  try {
    const db = getState();
    const assets = db.assets
      .filter((a) => a.userId === req.user.id)
      .sort((a, b) => a.name.localeCompare(b.name));
    res.json({ assets });
  } catch (err) {
    console.error("List assets error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/assets",
  requireFields(["name", "type", "value"]),
  async (req, res) => {
    try {
      const { name, type, value } = req.body;
      if (!["BANK", "CASH", "INVESTMENT", "GOLD", "CRYPTO", "OTHER"].includes(type)) {
        return res.status(400).json({ error: "Invalid asset type" });
      }
      const asset = {
        id: nextId("assets"),
        name,
        type,
        value: Number(value),
        userId: req.user.id,
        updatedAt: new Date().toISOString(),
      };
      commit((db) => {
        db.assets.push(asset);
      });
      res.status(201).json({ asset });
    } catch (err) {
      console.error("Create asset error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.put(
  "/assets/:id",
  requireFields(["name", "type", "value"]),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { name, type, value } = req.body;
      if (!["BANK", "CASH", "INVESTMENT", "GOLD", "CRYPTO", "OTHER"].includes(type)) {
        return res.status(400).json({ error: "Invalid asset type" });
      }
      const db = getState();
      const existing = db.assets.find(
        (a) => a.id === id && a.userId === req.user.id
      );
      if (!existing) {
        return res.status(404).json({ error: "Asset not found" });
      }
      let updated;
      commit((s) => {
        const asset = s.assets.find(
          (a) => a.id === id && a.userId === req.user.id
        );
        if (asset) {
          asset.name = name;
          asset.type = type;
          asset.value = Number(value);
          asset.updatedAt = new Date().toISOString();
          updated = { ...asset };
        }
      });
      res.json({ asset: updated });
    } catch (err) {
      console.error("Update asset error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.delete("/assets/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const db = getState();
    const existing = db.assets.find(
      (a) => a.id === id && a.userId === req.user.id
    );
    if (!existing) {
      return res.status(404).json({ error: "Asset not found" });
    }
    commit((s) => {
      s.assets = s.assets.filter(
        (a) => !(a.id === id && a.userId === req.user.id)
      );
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete asset error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Liabilities
router.get("/liabilities", async (req, res) => {
  try {
    const db = getState();
    const liabilities = db.liabilities
      .filter((l) => l.userId === req.user.id)
      .sort((a, b) => a.name.localeCompare(b.name));
    res.json({ liabilities });
  } catch (err) {
    console.error("List liabilities error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/liabilities",
  requireFields(["name", "type", "value"]),
  async (req, res) => {
    try {
      const { name, type, value } = req.body;
      if (!["LOAN", "CREDIT_CARD", "OTHER"].includes(type)) {
        return res.status(400).json({ error: "Invalid liability type" });
      }
      const liability = {
        id: nextId("liabilities"),
        name,
        type,
        value: Number(value),
        userId: req.user.id,
        updatedAt: new Date().toISOString(),
      };
      commit((db) => {
        db.liabilities.push(liability);
      });
      res.status(201).json({ liability });
    } catch (err) {
      console.error("Create liability error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.put(
  "/liabilities/:id",
  requireFields(["name", "type", "value"]),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { name, type, value } = req.body;
      if (!["LOAN", "CREDIT_CARD", "OTHER"].includes(type)) {
        return res.status(400).json({ error: "Invalid liability type" });
      }
      const db = getState();
      const existing = db.liabilities.find(
        (l) => l.id === id && l.userId === req.user.id
      );
      if (!existing) {
        return res.status(404).json({ error: "Liability not found" });
      }
      let updated;
      commit((s) => {
        const liability = s.liabilities.find(
          (l) => l.id === id && l.userId === req.user.id
        );
        if (liability) {
          liability.name = name;
          liability.type = type;
          liability.value = Number(value);
          liability.updatedAt = new Date().toISOString();
          updated = { ...liability };
        }
      });
      res.json({ liability: updated });
    } catch (err) {
      console.error("Update liability error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.delete("/liabilities/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const db = getState();
    const existing = db.liabilities.find(
      (l) => l.id === id && l.userId === req.user.id
    );
    if (!existing) {
      return res.status(404).json({ error: "Liability not found" });
    }
    commit((s) => {
      s.liabilities = s.liabilities.filter(
        (l) => !(l.id === id && l.userId === req.user.id)
      );
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete liability error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;


