let txCategories = [];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await getCurrentUser();
    await loadCategoriesForFilters();
    await loadTransactions();
    hookTransactionForm();
  } catch (err) {
    console.error(err);
  }
});

async function loadCategoriesForFilters() {
  const data = await apiRequest("/api/categories");
  txCategories = data.categories || [];
  const filterSelect = document.getElementById("filter-category");
  const formSelect = document.getElementById("tx-category");
  filterSelect.innerHTML = '<option value="">All</option>';
  formSelect.innerHTML = "";
  txCategories.forEach((cat) => {
    const opt1 = document.createElement("option");
    opt1.value = cat.id;
    opt1.textContent = cat.name;
    filterSelect.appendChild(opt1);
    const opt2 = document.createElement("option");
    opt2.value = cat.id;
    opt2.textContent = `${cat.name} (${cat.type.toLowerCase()})`;
    formSelect.appendChild(opt2);
  });
  await loadSubcategoriesOptions();
}

async function loadSubcategoriesOptions() {
  const categoryId = document.getElementById("tx-category").value;
  const subSelect = document.getElementById("tx-subcategory");
  subSelect.innerHTML = '<option value="">None</option>';
  if (!categoryId) return;
  const data = await apiRequest(
    "/api/subcategories?categoryId=" + encodeURIComponent(categoryId)
  );
  (data.subcategories || []).forEach((sub) => {
    const opt = document.createElement("option");
    opt.value = sub.id;
    opt.textContent = sub.name;
    subSelect.appendChild(opt);
  });
}

async function loadTransactions() {
  const params = new URLSearchParams();
  const start = document.getElementById("filter-start").value;
  const end = document.getElementById("filter-end").value;
  const type = document.getElementById("filter-type").value;
  const categoryId = document.getElementById("filter-category").value;
  const search = document.getElementById("filter-search").value.trim();
  if (start) params.set("startDate", start);
  if (end) params.set("endDate", end);
  if (type) params.set("type", type);
  if (categoryId) params.set("categoryId", categoryId);
  if (search) params.set("search", search);
  const data = await apiRequest("/api/transactions?" + params.toString());

  const tbody = document.getElementById("transactions-body");
  tbody.innerHTML = "";
  data.items.forEach((tx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${new Date(tx.date).toLocaleDateString()}</td>
      <td>${tx.category ? tx.category.name : "-"}</td>
      <td>${tx.subcategory ? tx.subcategory.name : "-"}</td>
      <td class="${
        tx.type === "INCOME" ? "tag-income" : "tag-expense"
      }">${tx.type}</td>
      <td>${formatINR(tx.amount)}</td>
      <td style="text-align:right">
        <button type="button" class="btn btn-outline btn-xs" data-edit="${
          tx.id
        }">Edit</button>
        <button type="button" class="btn btn-outline btn-xs" data-delete="${
          tx.id
        }">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  const countEl = document.getElementById("tx-count");
  countEl.textContent = `${data.total} transaction${data.total === 1 ? "" : "s"}`;

  tbody.addEventListener("click", async (e) => {
    const editId = e.target.getAttribute("data-edit");
    const delId = e.target.getAttribute("data-delete");
    if (editId) {
      const tx = data.items.find((t) => t.id === Number(editId));
      if (tx) fillFormForEdit(tx);
    } else if (delId) {
      if (!confirm("Delete this transaction?")) return;
      await apiRequest("/api/transactions/" + delId, { method: "DELETE" });
      await loadTransactions();
      resetTxForm();
    }
  }, { once: true });
}

function hookTransactionForm() {
  document
    .getElementById("apply-filters-btn")
    .addEventListener("click", () => loadTransactions());

  document.getElementById("tx-category").addEventListener("change", () => {
    loadSubcategoriesOptions().catch(console.error);
  });

  document.getElementById("add-tx-btn").addEventListener("click", () => {
    resetTxForm();
    document.getElementById("tx-date").focus();
  });

  document
    .getElementById("tx-reset-btn")
    .addEventListener("click", () => resetTxForm());

  document.getElementById("tx-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("tx-error");
    errorEl.style.display = "none";
    errorEl.textContent = "";
    try {
      const id = document.getElementById("tx-id").value;
      const payload = {
        date: document.getElementById("tx-date").value,
        type: document.getElementById("tx-type").value,
        amount: parseFloat(document.getElementById("tx-amount").value),
        categoryId: Number(document.getElementById("tx-category").value),
        subcategoryId: document.getElementById("tx-subcategory").value
          ? Number(document.getElementById("tx-subcategory").value)
          : null,
        description: document.getElementById("tx-description").value.trim(),
      };
      if (!payload.date || isNaN(payload.amount) || !payload.categoryId) {
        throw new Error("Date, amount and category are required.");
      }
      const method = id ? "PUT" : "POST";
      const url = id ? "/api/transactions/" + id : "/api/transactions";
      await apiRequest(url, { method, body: JSON.stringify(payload) });
      await loadTransactions();
      resetTxForm();
    } catch (err) {
      errorEl.textContent = err.message || "Failed to save transaction.";
      errorEl.style.display = "block";
    }
  });
}

function resetTxForm() {
  document.getElementById("tx-id").value = "";
  document.getElementById("tx-date").value = "";
  document.getElementById("tx-type").value = "EXPENSE";
  document.getElementById("tx-amount").value = "";
  document.getElementById("tx-description").value = "";
  document.getElementById("tx-subcategory").value = "";
}

function fillFormForEdit(tx) {
  document.getElementById("tx-id").value = tx.id;
  document.getElementById("tx-date").value = tx.date.slice(0, 10);
  document.getElementById("tx-type").value = tx.type;
  document.getElementById("tx-amount").value = tx.amount;
  document.getElementById("tx-description").value = tx.description || "";
  document.getElementById("tx-category").value = tx.categoryId;
  loadSubcategoriesOptions().then(() => {
    if (tx.subcategoryId) {
      document.getElementById("tx-subcategory").value = tx.subcategoryId;
    }
  });
}

function formatINR(x) {
  const n = Number(x || 0);
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}


