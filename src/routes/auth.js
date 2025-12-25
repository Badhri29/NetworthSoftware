console.log("AUTH ROUTES FILE LOADED");

const express = require("express");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const {
  createToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
} = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

/* ======================================
   SEED DEFAULT CATEGORIES (SAFE & FAST)
====================================== */
async function seedUserCategories(userId) {
  const defaultCategories = await prisma.default_Categories.findMany();

  for (const defCat of defaultCategories) {
    const userCategory = await prisma.category.create({
      data: {
        userId,                 // ✅ Prisma field
        type: defCat.type,
        name: defCat.name,
      },
    });

    const defaultSubs = await prisma.default_SubCategories.findMany({
      where: {
        category_id: defCat.id, // ✅ DB column
      },
    });

    for (const sub of defaultSubs) {
      await prisma.subCategory.create({
        data: {
          userId,
          categoryId: userCategory.id,
          name: sub.name,
        },
      });
    }
  }
}

/* ======================================
   REGISTER
====================================== */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // ✅ CORRECT MODEL NAME
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ CREATE USER
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: email.split("@")[0],
      },
    });

    // ✅ SEED DEFAULT DATA
    await seedUserCategories(user.id);

    // ✅ LOGIN SESSION
    const token = createToken({ id: user.id, email: user.email });
    setAuthCookie(res, token);

    return res.json({
      success: true,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

/* ======================================
   LOGIN
====================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = createToken({ id: user.id, email: user.email });
    setAuthCookie(res, token);

    return res.json({
      success: true,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/* ======================================
   LOGOUT
====================================== */
router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  return res.json({ success: true });
});

/* ======================================
   CURRENT USER
====================================== */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    return res.json({ user });
  } catch (err) {
    console.error("ME ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
