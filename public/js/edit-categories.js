
let categoryList;
let subCategoryList;
let subCategoryInput;
let categoryInput;
let categoryAddBtn;
let subCategoryAddBtn;
let typeButtons;
let section;

let currentType = "income";
let activeCategory = null;

/* ---------- DATABASE CATEGORIES (IN-MEMORY) ---------- */
let dbCategories = {
  income: {},
  expense: {},
  savings: {}
};

/* ---------- UI TEMP CATEGORIES ---------- */
const uiCategories = {
  income: {},
  expense: {},
  savings: {}
};

/* ---------- FETCH FROM DATABASE ---------- */
async function loadCategoriesFromDB() {
  try {
    const res = await fetch("/api/categories", {
      credentials: "include"
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    dbCategories = result.data || {
      income: {},
      expense: {},
      savings: {}
    };

    renderCategories(currentType);
  } catch (err) {
    console.error("Failed to load categories", err);
  }
}

/* ---------- RENDER CATEGORIES ---------- */
function renderCategories(type) {
  categoryList.innerHTML = "";
  subCategoryList.innerHTML = "Select a category first";
  subCategoryInput.disabled = true;
  activeCategory = null;

  const categoryNames = Object.keys(dbCategories[type] || {});

  if (!categoryNames.length) {
    categoryList.innerHTML = `<div class="cat-empty">No categories</div>`;
    return;
  }

  categoryNames.forEach((cat, index) => {
    const div = document.createElement("div");
    div.className = "cat-item";

    div.innerHTML = `
      <span>${index + 1}. ${cat}</span>
      <button class="cat-delete-btn" title="Delete">✗</button>
    `;

    /* SELECT CATEGORY */
    div.addEventListener("click", (e) => {
      if (e.target.classList.contains("cat-delete-btn")) return;

      categoryList
        .querySelectorAll(".cat-item")
        .forEach(i => i.classList.remove("active"));

      div.classList.add("active");
      activeCategory = cat;
      renderSubCategories(type, cat);
    });

    /* DELETE CATEGORY (UI ONLY) */
    div.querySelector(".cat-delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();

      delete dbCategories[type][cat];
      delete uiCategories[type][cat];

      if (activeCategory === cat) {
        activeCategory = null;
        subCategoryInput.disabled = true;
        subCategoryList.innerHTML = "Select a category first";
      }

      renderCategories(type);
    });

    categoryList.appendChild(div);
  });
}

/* ---------- RENDER SUB CATEGORIES ---------- */
function renderSubCategories(type, category) {
  subCategoryList.innerHTML = "";
  subCategoryInput.disabled = false;

  const subs = dbCategories[type][category] || [];

  if (!subs.length) {
    subCategoryList.innerHTML = `<div class="cat-empty">No sub-categories</div>`;
    return;
  }

  subs.forEach((sub, index) => {
    const div = document.createElement("div");
    div.className = "cat-item";

    div.innerHTML = `
      <span>${index + 1}. ${sub}</span>
      <button class="cat-delete-btn" title="Delete">✗</button>
    `;

    /* DELETE SUB CATEGORY (UI ONLY) */
    div.querySelector(".cat-delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();

      dbCategories[type][category] =
        dbCategories[type][category].filter(s => s !== sub);

      if (uiCategories[type][category]) {
        uiCategories[type][category] =
          uiCategories[type][category].filter(s => s !== sub);
      }

      renderSubCategories(type, category);
    });

    subCategoryList.appendChild(div);
  });
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  categoryList = document.getElementById("categoryList");
  subCategoryList = document.getElementById("subCategoryList");
  subCategoryInput = document.getElementById("subCategoryInput");
  categoryInput = document.querySelector(".cat-box input.cat-input");
  typeButtons = document.querySelectorAll(".cat-type-btn");
  section = document.querySelector(".edit-categories-section");

  categoryAddBtn = document.querySelector(
    ".cat-box:first-child .cat-add-btn"
  );
  subCategoryAddBtn = document.querySelector(
    ".cat-box:last-child .cat-add-btn"
  );

  section.classList.add("income");
  loadCategoriesFromDB();

  /* ---------- TYPE SWITCH ---------- */
  typeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;

      typeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      section.classList.remove("income", "expense", "savings");
      section.classList.add(type);

      currentType = type;
      renderCategories(type);
    });
  });

  /* ---------- ADD CATEGORY ---------- */
  categoryAddBtn.addEventListener("click", () => {
    const name = categoryInput.value.trim();
    if (!name) return;

    if (!dbCategories[currentType][name]) {
      dbCategories[currentType][name] = [];
      uiCategories[currentType][name] = [];
    }

    categoryInput.value = "";
    renderCategories(currentType);
  });

  /* ---------- ADD SUB CATEGORY ---------- */
  subCategoryAddBtn.addEventListener("click", () => {
    const name = subCategoryInput.value.trim();
    if (!name || !activeCategory) return;

    dbCategories[currentType][activeCategory] =
      dbCategories[currentType][activeCategory] || [];

    if (!dbCategories[currentType][activeCategory].includes(name)) {
      dbCategories[currentType][activeCategory].push(name);
    }

    uiCategories[currentType][activeCategory] =
      uiCategories[currentType][activeCategory] || [];

    if (!uiCategories[currentType][activeCategory].includes(name)) {
      uiCategories[currentType][activeCategory].push(name);
    }

    subCategoryInput.value = "";
    renderSubCategories(currentType, activeCategory);
  });

  /* ---------- RESET ---------- */
  document
    .getElementById("resetCategoriesBtn")
    .addEventListener("click", async () => {
      uiCategories.income = {};
      uiCategories.expense = {};
      uiCategories.savings = {};

      await loadCategoriesFromDB();
    });

  /* ---------- SUBMIT (FULL SYNC) ---------- */
  const submitBtn = document.getElementById("submitCategoriesBtn");

  submitBtn.addEventListener("click", async () => {
    submitBtn.disabled = true;
    try {
      const finalCategories = {
        income: JSON.parse(JSON.stringify(dbCategories.income)),
        expense: JSON.parse(JSON.stringify(dbCategories.expense)),
        savings: JSON.parse(JSON.stringify(dbCategories.savings))
      };


      const res = await fetch("/api/categories/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: finalCategories })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Save failed");
      }

      uiCategories.income = {};
      uiCategories.expense = {};
      uiCategories.savings = {};

      dbCategories = { income: {}, expense: {}, savings: {} };

      await loadCategoriesFromDB();

      activeCategory = null;
      subCategoryInput.value = "";
      subCategoryInput.disabled = true;
      subCategoryList.innerHTML = "Select a category first";

      alert("Categories synced successfully ✅");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to save categories ❌");
    } finally {
      submitBtn.disabled = false;
    }
  });
});
