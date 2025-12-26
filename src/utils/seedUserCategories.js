const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedUserCategories(userId) {
  // 1️⃣ Get default categories
  const defaultCategories = await prisma.default_Categories.findMany();
  if (!defaultCategories.length) return;

  // 2️⃣ Insert user categories
  await prisma.category.createMany({
    data: defaultCategories.map(cat => ({
      userId,
      type: cat.type,
      name: cat.name,
    })),
    skipDuplicates: true,
  });

  // 3️⃣ Fetch created categories
  const userCategories = await prisma.category.findMany({
    where: { userId },
  });

  // 4️⃣ Map defaultCategoryId → userCategoryId
  const categoryMap = {};
  defaultCategories.forEach(def => {
    const userCat = userCategories.find(c => c.name === def.name);
    if (userCat) categoryMap[def.id] = userCat.id;
  });

  // 5️⃣ Fetch default subcategories
  const defaultSubs = await prisma.default_SubCategories.findMany();

  // 6️⃣ Prepare subcategories
  const subCategoriesData = defaultSubs
    .map(sub => ({
      userId,
      categoryId: categoryMap[sub.category_id],
      name: sub.name,
    }))
    .filter(sub => sub.categoryId);

  // 7️⃣ Insert subcategories
  await prisma.subCategory.createMany({
    data: subCategoriesData,
    skipDuplicates: true,
  });
}

module.exports = { seedUserCategories };
