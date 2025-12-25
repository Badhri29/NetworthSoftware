const express = require("express");
const router = express.Router();
const prisma = require("../utils/prisma");
const { requireAuth } = require("../middleware/auth");

router.get("/", requireAuth, async (req, res) => {
  try {
    // 1. Get categories of this user
    const categories = await prisma.category.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: { id: "asc" }
    });

    // 2. Get sub-categories for those categories
    const subCategories = await prisma.subCategory.findMany({
      where: {
        categoryId: {
          in: categories.map(c => c.id)
        }
      }
    });

    // 3. Convert to UI format
    const grouped = {
      income: {},
      expense: {},
      savings: {}
    };

    categories.forEach(cat => {
      grouped[cat.type][cat.name] = subCategories
        .filter(sc => sc.categoryId === cat.id)
        .map(sc => sc.name);
    });

    return res.json({
      success: true,
      data: grouped
    });

  } catch (error) {
    console.error("CATEGORIES API ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load categories"
    });
  }
});

module.exports = router;
