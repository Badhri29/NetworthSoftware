/*GLOBAL STATE*/

let categoryList;
let subCategoryList;
let subCategoryInput;
let typeButtons;
let section;
let currentType = "income";

/*CATEGORIES FROM DATABASE*/

let categories = {
  income: {},
  expense: {},
  savings: {}
};

/*FETCH CATEGORIES*/

async function loadCategoriesFromDB() {
  try {
    const res = await fetch("/api/categories", {
      credentials: "include"
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    categories = result.data || {
      income: {},
      expense: {},
      savings: {}
    };

    renderCategories(currentType);
  } catch (err) {
    console.error("Failed to load categories", err);
  }
}

/*RENDER FUNCTIONS*/

function renderCategories(type) {
  categoryList.innerHTML = "";
  subCategoryList.innerHTML = "Select a category first";
  subCategoryInput.disabled = true;

  if (!categories[type]) return;

  Object.keys(categories[type]).forEach((cat, index) => {
    const div = document.createElement("div");
    div.className = "cat-item";
    div.innerHTML = `
      <span>${index + 1}. ${cat}</span>
      <button class="cat-delete-btn" title="Delete">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    `;

    div.addEventListener("click", () => {
      categoryList
        .querySelectorAll(".cat-item")
        .forEach(i => i.classList.remove("active"));

      div.classList.add("active");
      renderSubCategories(type, cat);
    });

    categoryList.appendChild(div);
  });
}

function renderSubCategories(type, category) {
  subCategoryList.innerHTML = "";
  subCategoryInput.disabled = false;

  const subs = categories[type]?.[category] || [];

  subs.forEach((sub, index) => {
    const div = document.createElement("div");
    div.className = "cat-item";
    div.innerHTML = `
      <span>${index + 1}. ${sub}</span>
      <button class="cat-delete-btn" title="Delete">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    `;

    div.addEventListener("click", () => {
      subCategoryList
        .querySelectorAll(".cat-item")
        .forEach(i => i.classList.remove("active"));

      div.classList.add("active");
    });

    subCategoryList.appendChild(div);
  });
}

/*INITIALIZATION*/

document.addEventListener("DOMContentLoaded", () => {

  categoryList = document.getElementById("categoryList");
  subCategoryList = document.getElementById("subCategoryList");
  subCategoryInput = document.getElementById("subCategoryInput");
  typeButtons = document.querySelectorAll(".cat-type-btn");
  section = document.querySelector(".edit-categories-section");

  if (!categoryList || !section) return;

  section.classList.add("income");

  loadCategoriesFromDB();

  /*TYPE TOGGLE*/

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

});
