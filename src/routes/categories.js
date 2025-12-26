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
        userId: req.user.id,
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

// FULL SYNC – UI IS SOURCE OF TRUTH
router.post("/bulk", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { categories } = req.body;

    if (!categories) {
      return res.status(400).json({ message: "Categories data is required" });
    }

    await prisma.$transaction(async (tx) => {

      /* 1️⃣ DELETE OLD DATA */
      await tx.subCategory.deleteMany({
        where: { userId }
      });

      await tx.category.deleteMany({
        where: { userId }
      });

      /* 2️⃣ PREPARE BULK INSERT DATA */
      const categoryRows = [];
      const subCategoryRows = [];

      for (const type of ["income", "expense", "savings"]) {
        const categoryMap = categories[type] || {};

        for (const categoryName of Object.keys(categoryMap)) {
          categoryRows.push({
            userId,
            type,
            name: categoryName
          });
        }
      }

      /* 3️⃣ INSERT CATEGORIES (BATCH) */
      await tx.category.createMany({
        data: categoryRows
      });

      /* 4️⃣ FETCH INSERTED CATEGORIES */
      const createdCategories = await tx.category.findMany({
        where: { userId }
      });

      const categoryIdMap = {};
      createdCategories.forEach(cat => {
        categoryIdMap[`${cat.type}:${cat.name}`] = cat.id;
      });

      /* 5️⃣ PREPARE SUB-CATEGORIES */
      for (const type of ["income", "expense", "savings"]) {
        const categoryMap = categories[type] || {};

        for (const [categoryName, subs] of Object.entries(categoryMap)) {
          const categoryId = categoryIdMap[`${type}:${categoryName}`];
          if (!categoryId) continue;

          subs.forEach(subName => {
            subCategoryRows.push({
              userId,
              categoryId,
              name: subName
            });
          });
        }
      }

      /* 6️⃣ INSERT SUB-CATEGORIES (BATCH) */
      if (subCategoryRows.length) {
        await tx.subCategory.createMany({
          data: subCategoryRows
        });
      }
    });

    return res.json({
      success: true,
      message: "Categories synced successfully"
    });

  } catch (error) {
    console.error("Category full sync error:", error);
    return res.status(500).json({
      message: "Failed to sync categories"
    });
  }
});


module.exports = router;