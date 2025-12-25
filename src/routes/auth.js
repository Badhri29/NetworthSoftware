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

// SEED DEFAULT CATEGORIES FOR NEW USER
async function seedUserCategories(userId) {
  const defaultCategories = await prisma.default_Categories.findMany();

  for (const defCat of defaultCategories) {
    const userCategory = await prisma.category.create({
      data: {
        userId: userId,
        type: defCat.type,
        name: defCat.name,
      },
    });

    const defaultSubCategories = await prisma.default_SubCategories.findMany({
      where: {
        category_id: defCat.id,
      },
    });

    for (const defSub of defaultSubCategories) {
      await prisma.subCategory.create({
        data: {
          userId: userId,
          categoryId: userCategory.id,
          name: defSub.name,
        },
      });
    }
  }
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
      },
      message: 'User registered: ${user.email}',
    });

    await seedUserCategories(user.id);
    console.log("Default categories seeded:", user.email);

    const token = createToken({ id: user.id, email: user.email });
    setAuthCookie(res, token);

    console.log("User auto logged in:", user.email);

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createToken({ id: user.id, email: user.email });
    setAuthCookie(res, token);
    console.log("User logged in:", user.email);
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  return res.json({ success: true });
});

// CHANGE PASSWORD
router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current and new passwords are required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHash },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// CURRENT USER
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

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
