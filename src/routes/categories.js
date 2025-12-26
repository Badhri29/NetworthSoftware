const express = require("express");
const router = express.Router();
const prisma = require("../utils/prisma");
const { requireAuth } = require("../middleware/auth");

/* ===============================
   GET CATEGORIES (EXISTING)
   GET /api/categories
================================ */
router.get("/", requireAuth, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      orderBy: { id: "asc" }
    });

    const subCategories = await prisma.subCategory.findMany({
      where: {
        categoryId: { in: categories.map(c => c.id) }
      }
    });

    const grouped = { income: {}, expense: {}, savings: {} };

    categories.forEach(cat => {
      grouped[cat.type][cat.name] = subCategories
        .filter(sc => sc.categoryId === cat.id)
        .map(sc => sc.name);
    });

    res.json({ success: true, data: grouped });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to load categories" });
  }
});

/* ===============================
   SAVE UI-ADDED CATEGORIES
   POST /api/categories/bulk
================================ */
router.post("/bulk", requireAuth, async (req, res) => {
  try {
    const { categories } = req.body;
    const userId = req.user.id;

    if (!categories) {
      return res.status(400).json({ message: "No categories provided" });
    }

    for (const type of ["income", "expense", "savings"]) {
      const typeCats = categories[type] || {};

      for (const [catName, subs] of Object.entries(typeCats)) {

        // Create or reuse category
        const category = await prisma.category.upsert({
          where: {
            userId_type_name: {
              userId,
              type,
              name: catName
            }
          },
          update: {},
          create: {
            userId,
            type,
            name: catName
          }
        });

        // Create sub-categories
        for (const subName of subs) {
          await prisma.subCategory.upsert({
            where: {
              userId_categoryId_name: {
                userId,
                categoryId: category.id,
                name: subName
              }
            },
            update: {},
            create: {
              userId,
              categoryId: category.id,
              name: subName
            }
          });
        }
      }
    }

    res.json({ success: true });

  } catch (error) {
    console.error("BULK CATEGORY SAVE ERROR:", error);
    res.status(500).json({ message: "Failed to save categories" });
  }
});

module.exports = router;
