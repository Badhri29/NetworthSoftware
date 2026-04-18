const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireFields } = require("../middleware/validation");

const router = express.Router();
const prisma = new PrismaClient();

/* ========== HOLDINGS ROUTES ========== */

/* GET ALL HOLDINGS */
router.get("/assets", async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      where: { userId: req.user.id },
      orderBy: { name: "asc" }
    });
    res.json({ assets });
  } catch (err) {
    console.error("List assets error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

/* CREATE HOLDING */
router.post(
  "/assets",
  requireFields(["name", "type", "value"]),
  async (req, res) => {
    try {
      const { name, type, value } = req.body;
      if (!["BANK", "CASH", "INVESTMENT", "GOLD", "CRYPTO", "OTHER"].includes(type)) {
        return res.status(400).json({ success: false, error: "Invalid holding type" });
      }

      const asset = await prisma.asset.create({
        data: {
          name,
          type,
          value: Number(value),
          userId: req.user.id,
        }
      });

      res.status(201).json({ asset });
    } catch (err) {
      console.error("Create holding error:", err);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

/* UPDATE HOLDING */
router.put(
  "/assets/:id",
  requireFields(["name", "type", "value"]),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { name, type, value } = req.body;

      if (!["BANK", "CASH", "INVESTMENT", "GOLD", "CRYPTO", "OTHER"].includes(type)) {
        return res.status(400).json({ success: false, error: "Invalid holding type" });
      }

      // Check if holding exists and belongs to user
      const existing = await prisma.asset.findFirst({
        where: { id, userId: req.user.id }
      });

      if (!existing) {
        return res.status(404).json({ success: false, error: "Holding not found" });
      }

      const updated = await prisma.asset.update({
        where: { id },
        data: {
          name,
          type,
          value: Number(value)
        }
      });

      res.json({ asset: updated });
    } catch (err) {
      console.error("Update holding error:", err);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

/* DELETE HOLDING */
router.delete("/assets/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Check if holding exists and belongs to user
    const existing = await prisma.asset.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: "Holding not found" });
    }

    await prisma.asset.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Delete holding error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

/* ========== LIABILITIES ROUTES ========== */

/* GET ALL LIABILITIES */
router.get("/liabilities", async (req, res) => {
  try {
    const liabilities = await prisma.liability.findMany({
      where: { userId: req.user.id },
      orderBy: { name: "asc" }
    });
    res.json({ liabilities });
  } catch (err) {
    console.error("List liabilities error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

/* CREATE LIABILITY */
router.post(
  "/liabilities",
  requireFields(["name", "type", "value"]),
  async (req, res) => {
    try {
      const { name, type, value } = req.body;
      if (!["LOAN", "CREDIT_CARD", "OTHER"].includes(type)) {
        return res.status(400).json({ success: false, error: "Invalid liability type" });
      }

      const liability = await prisma.liability.create({
        data: {
          name,
          type,
          value: Number(value),
          userId: req.user.id,
        }
      });

      res.status(201).json({ liability });
    } catch (err) {
      console.error("Create liability error:", err);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

/* UPDATE LIABILITY */
router.put(
  "/liabilities/:id",
  requireFields(["name", "type", "value"]),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { name, type, value } = req.body;

      if (!["LOAN", "CREDIT_CARD", "OTHER"].includes(type)) {
        return res.status(400).json({ success: false, error: "Invalid liability type" });
      }

      // Check if liability exists and belongs to user
      const existing = await prisma.liability.findFirst({
        where: { id, userId: req.user.id }
      });

      if (!existing) {
        return res.status(404).json({ success: false, error: "Liability not found" });
      }

      const updated = await prisma.liability.update({
        where: { id },
        data: {
          name,
          type,
          value: Number(value)
        }
      });

      res.json({ liability: updated });
    } catch (err) {
      console.error("Update liability error:", err);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

/* DELETE LIABILITY */
router.delete("/liabilities/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Check if liability exists and belongs to user
    const existing = await prisma.liability.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: "Liability not found" });
    }

    await prisma.liability.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Delete liability error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

module.exports = router;


