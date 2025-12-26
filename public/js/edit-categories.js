/* ======================================================
   HYBRID CATEGORY MANAGEMENT
   (DB DISPLAY + UI TEMP ADD)
====================================================== */

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

/* ---------- DATABASE CATEGORIES ---------- */
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

    dbCategories = result.data || dbCategories;
    renderCategories(currentType);
  } catch (err) {
    console.error("Failed to load categories", err);
  }
}

/* ---------- MERGE DB + UI ---------- */
function getMergedCategories(type) {
  return {
    ...dbCategories[type],
    ...uiCategories[type]
  };
}

/* ---------- RENDER CATEGORIES ---------- */
function renderCategories(type) {
  categoryList.innerHTML = "";
  subCategoryList.innerHTML = "Select a category first";
  subCategoryInput.disabled = true;
  activeCategory = null;

  const merged = getMergedCategories(type);
  const categoryNames = Object.keys(merged);

  if (!categoryNames.length) {
    categoryList.innerHTML =
      `<div class="cat-empty">No categories</div>`;
    return;
  }

  categoryNames.forEach((cat, index) => {
  const div = document.createElement("div");
  div.className = "cat-item";

  div.innerHTML = `
    <span>${index + 1}. ${cat}</span>
    <button class="cat-delete-btn" title="Delete">✗</button>
  `;

  // SELECT CATEGORY
  div.addEventListener("click", (e) => {
    if (e.target.classList.contains("cat-delete-btn")) return;

    categoryList
      .querySelectorAll(".cat-item")
      .forEach(i => i.classList.remove("active"));

    div.classList.add("active");
    activeCategory = cat;
    renderSubCategories(type, cat);
  });

  // DELETE CATEGORY (UI ONLY)
  div.querySelector(".cat-delete-btn").addEventListener("click", (e) => {
    e.stopPropagation();

    // Remove from UI categories
    delete uiCategories[type][cat];

    // Remove from DB categories (UI only, no API)
    delete dbCategories[type][cat];

    // Reset selection if deleted one was active
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

  const dbSubs = dbCategories[type][category] || [];
  const uiSubs = uiCategories[type][category] || [];
  const subs = [...dbSubs, ...uiSubs];

  if (!subs.length) {
    subCategoryList.innerHTML =
      `<div class="cat-empty">No sub-categories</div>`;
    return;
  }

  subs.forEach((sub, index) => {
  const div = document.createElement("div");
  div.className = "cat-item";

  div.innerHTML = `
    <span>${index + 1}. ${sub}</span>
    <button class="cat-delete-btn" title="Delete">✗</button>
  `;

  // DELETE SUB CATEGORY (UI ONLY)
  div.querySelector(".cat-delete-btn").addEventListener("click", (e) => {
    e.stopPropagation();

    // Remove from UI sub-categories
    if (uiCategories[type][category]) {
      uiCategories[type][category] =
        uiCategories[type][category].filter(s => s !== sub);
    }

    // Remove from DB sub-categories (UI only)
    if (dbCategories[type][category]) {
      dbCategories[type][category] =
        dbCategories[type][category].filter(s => s !== sub);
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

  /* ---------- ADD CATEGORY (UI ONLY) ---------- */
  categoryAddBtn.addEventListener("click", () => {
    const name = categoryInput.value.trim();
    if (!name) return;

    if (!uiCategories[currentType][name]) {
      uiCategories[currentType][name] = [];
    }

    categoryInput.value = "";
    renderCategories(currentType);
  });

  /* ---------- ADD SUB CATEGORY (UI ONLY) ---------- */
  subCategoryAddBtn.addEventListener("click", () => {
    const name = subCategoryInput.value.trim();
    if (!name || !activeCategory) return;

    if (!uiCategories[currentType][activeCategory]) {
      uiCategories[currentType][activeCategory] = [];
    }

    const subs = uiCategories[currentType][activeCategory];
    if (!subs.includes(name)) subs.push(name);

    subCategoryInput.value = "";
    renderSubCategories(currentType, activeCategory);
  });

  /* Reset button */
  const resetBtn = document.getElementById("resetCategoriesBtn");

  resetBtn.addEventListener("click", () => {
    // 1️⃣ Clear ONLY UI-added categories
    uiCategories.income = {};
    uiCategories.expense = {};
    uiCategories.savings = {};

    // 2️⃣ Reset sub-category UI
    activeCategory = null;
    subCategoryInput.value = "";
    subCategoryInput.disabled = true;
    subCategoryList.innerHTML = "Select a category first";

    // 3️⃣ Re-render categories (DB only)
    renderCategories(currentType);
  });
  /* ---------- SUBMIT UI CATEGORIES TO DB ---------- */
  const submitBtn = document.getElementById("submitCategoriesBtn");

  submitBtn.addEventListener("click", async () => {
    try {
      console.log("Submitting UI categories:", uiCategories);

      const res = await fetch("/api/categories/bulk", {
        method: "POST",
        credentials: "include", // 🔴 REQUIRED for auth cookie
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          categories: uiCategories
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Save failed");
      }

      // 1️⃣ Clear UI-only data
      uiCategories.income = {};
      uiCategories.expense = {};
      uiCategories.savings = {};

      // 2️⃣ Reload DB categories
      await loadCategoriesFromDB();

      // 3️⃣ Reset UI state
      activeCategory = null;
      subCategoryInput.value = "";
      subCategoryInput.disabled = true;
      subCategoryList.innerHTML = "Select a category first";

      alert("Categories saved successfully ✅");

    } catch (error) {
      console.error("Submit categories error:", error);
      alert("Failed to save categories ❌");
    }
  });

});
