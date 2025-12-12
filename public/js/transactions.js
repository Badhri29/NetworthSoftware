let txCategories = [];
let allTransactions = [];
let editingTransactionId = null;

// Sample categories and subcategories (will be replaced with API data later)
const sampleCategories = [
  { id: 1, name: "Category 1", type: "INCOME" },
  { id: 2, name: "Category 2", type: "SAVINGS" },
  { id: 3, name: "Category 3", type: "EXPENSE" },
];

const sampleSubcategories = [
  { id: 1, name: "Subcategory 1", categoryId: 1 },
  { id: 2, name: "Subcategory 2", categoryId: 1 },
  { id: 3, name: "Subcategory 3", categoryId: 2 },
  { id: 4, name: "Subcategory 4", categoryId: 3 },
];

// Simple, direct button handlers
function attachButtonHandlers() {
  const addBtn = document.getElementById("add-tx-btn");
  const getBtn = document.getElementById("get-tx-btn");
  
  if (!addBtn) {
    console.error("ERROR: Add transaction button not found in DOM!");
    return false;
  }
  
  if (!getBtn) {
    console.error("ERROR: Get transaction button not found in DOM!");
    return false;
  }
  
  // Remove any existing listeners
  const newAddBtn = addBtn.cloneNode(true);
  addBtn.parentNode.replaceChild(newAddBtn, addBtn);
  
  const newGetBtn = getBtn.cloneNode(true);
  getBtn.parentNode.replaceChild(newGetBtn, getBtn);
  
  // Attach fresh handlers
  const addBtnEl = document.getElementById("add-tx-btn");
  const getBtnEl = document.getElementById("get-tx-btn");
  
  if (addBtnEl) {
    addBtnEl.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("✓ Add Transaction button CLICKED (addEventListener)!");
      window.showAddTransactionForm();
    });
  }
  
  if (getBtnEl) {
    getBtnEl.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("✓ Get Transaction Data button CLICKED (addEventListener)!");
      window.showGetTransactionForm();
    });
  }
  
  console.log("✓ Button handlers attached successfully");
  return true;
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("=== DOM Content Loaded - Transactions page ===");
  
  // Attach button handlers FIRST, before anything else
  let attempts = 0;
  const maxAttempts = 5;
  
  const tryAttach = () => {
    attempts++;
    if (attachButtonHandlers()) {
      console.log("✓ Buttons initialized successfully");
    } else if (attempts < maxAttempts) {
      console.log(`Retrying button attachment (attempt ${attempts}/${maxAttempts})...`);
      setTimeout(tryAttach, 100);
    } else {
      console.error("FAILED to attach button handlers after", maxAttempts, "attempts");
    }
  };
  
  tryAttach();
  
  // Setup other event listeners
  setupEventListeners();
  setupPlaceholderBehavior();
  
  try {
    await getCurrentUser();
  } catch (err) {
    console.warn("Could not load user:", err);
  }
  
  try {
    await loadCategoriesForFilters();
  } catch (err) {
    console.warn("Could not load categories:", err);
  }
  
  // Load recent transactions by default
  try {
    await loadLast10Transactions();
  } catch (err) {
    console.warn("Could not load transactions:", err);
  }
});

// Also try immediately if DOM is ready
if (document.readyState !== 'loading') {
  console.log("DOM already ready, attaching buttons immediately");
  setTimeout(() => attachButtonHandlers(), 50);
}

function setupEventListeners() {
  // Other event listeners (form, filters, etc.) - with error handling
  
  // Apply filters button
  const applyBtn = document.getElementById("apply-filters-btn");
  if (applyBtn) {
    applyBtn.addEventListener("click", async () => {
      await loadTransactions();
    });
  }

  // Category change handler
  const categorySelect = document.getElementById("transaction-category");
  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      loadSubcategoriesOptions().catch(console.error);
    });
  }

  // Reset form button
  const resetBtn = document.getElementById("tx-reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resetTxForm();
    });
  }

  // Form submit
  const txForm = document.getElementById("tx-form");
  if (txForm) {
    txForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await saveTransaction();
    });
  }
}

function setupPlaceholderBehavior() {
  const detailsInput = document.getElementById("tx-details");
  const amountInput = document.getElementById("tx-amount");

  if (detailsInput) {
    // Transaction Details placeholder
    detailsInput.addEventListener("focus", function() {
      if (this.value === "") {
        this.setAttribute("data-placeholder", this.placeholder);
        this.placeholder = "";
      }
    });

    detailsInput.addEventListener("blur", function() {
      if (this.value === "" && this.getAttribute("data-placeholder")) {
        this.placeholder = this.getAttribute("data-placeholder");
        this.removeAttribute("data-placeholder");
      }
    });
  }

  if (amountInput) {
    // Transaction Amount placeholder
    amountInput.addEventListener("focus", function() {
      if (this.value === "") {
        this.setAttribute("data-placeholder", this.placeholder);
        this.placeholder = "";
      }
    });

    amountInput.addEventListener("blur", function() {
      if (this.value === "" && this.getAttribute("data-placeholder")) {
        this.placeholder = this.getAttribute("data-placeholder");
        this.removeAttribute("data-placeholder");
      }
    });
  }
}

function showTransactionForm() {
  console.log("=== showTransactionForm() called ===");
  const formSection = document.getElementById("tx-form-section");
  const filterSection = document.getElementById("filter-section");
  const listSection = document.getElementById("transactions-list-section");
  const dateInput = document.getElementById("tx-date");
  
  if (!formSection) {
    console.error("ERROR: tx-form-section not found!");
    alert("Form section not found. Please refresh the page.");
    return;
  }
  
  console.log("Form section found, showing it...");
  formSection.style.display = "block";
  formSection.style.visibility = "visible";
  
  if (filterSection) {
    filterSection.style.display = "none";
  }
  
  // Keep transactions list visible
  if (listSection) {
    listSection.style.display = "block";
  }
  
  // Scroll to form
  setTimeout(() => {
    formSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (dateInput) {
      dateInput.focus();
    }
  }, 100);
  
  console.log("✓ Transaction form should now be visible");
}

// Make functions globally available for inline onclick handlers
window.showAddTransactionForm = function() {
  console.log("Inline onclick handler triggered!");
  showTransactionForm();
  resetTxForm();
};

window.showGetTransactionForm = function() {
  console.log("Inline onclick handler triggered!");
  showFilterSection();
  loadLast10Transactions().catch(err => console.error("Error loading transactions:", err));
};

function showFilterSection() {
  console.log("=== showFilterSection() called ===");
  const formSection = document.getElementById("tx-form-section");
  const filterSection = document.getElementById("filter-section");
  const listSection = document.getElementById("transactions-list-section");
  
  if (!filterSection) {
    console.error("ERROR: filter-section not found!");
    return;
  }
  
  filterSection.style.display = "block";
  filterSection.style.visibility = "visible";
  
  if (listSection) {
    listSection.style.display = "block";
  }
  
  if (formSection) {
    formSection.style.display = "none";
  }
  
  console.log("✓ Filter section should now be visible");
}

async function loadCategoriesForFilters() {
  try {
    const data = await apiRequest("/api/categories");
    txCategories = data.categories || sampleCategories;
  } catch (err) {
    console.warn("Using sample categories:", err);
    txCategories = sampleCategories;
  }

  const filterSelect = document.getElementById("filter-category");
  const formSelect = document.getElementById("transaction-category");
  
  filterSelect.innerHTML = '<option value="">All</option>';
  formSelect.innerHTML = '<option value="">Select category</option>';
  
  txCategories.forEach((cat) => {
    const opt1 = document.createElement("option");
    opt1.value = cat.id;
    opt1.textContent = cat.name;
    filterSelect.appendChild(opt1);
    
    const opt2 = document.createElement("option");
    opt2.value = cat.id;
    opt2.textContent = cat.name;
    formSelect.appendChild(opt2);
  });
  
  await loadSubcategoriesOptions();
}

async function loadSubcategoriesOptions() {
  const categoryId = document.getElementById("transaction-category").value;
  const subSelect = document.getElementById("tx-subcategory");
  subSelect.innerHTML = '<option value="">None</option>';
  
  if (!categoryId) return;
  
  try {
    const data = await apiRequest(
      "/api/subcategories?categoryId=" + encodeURIComponent(categoryId)
    );
    (data.subcategories || []).forEach((sub) => {
      const opt = document.createElement("option");
      opt.value = sub.id;
      opt.textContent = sub.name;
      subSelect.appendChild(opt);
    });
  } catch (err) {
    // Use sample subcategories if API fails
    const filtered = sampleSubcategories.filter(s => s.categoryId == categoryId);
    filtered.forEach((sub) => {
      const opt = document.createElement("option");
      opt.value = sub.id;
      opt.textContent = sub.name;
      subSelect.appendChild(opt);
    });
  }
}

async function loadLast10Transactions() {
  const params = new URLSearchParams();
  params.set("limit", "10");
  params.set("sort", "date");
  params.set("order", "desc");
  
  try {
    const data = await apiRequest("/api/transactions?" + params.toString());
    allTransactions = data.items || [];
    await displayTransactions(allTransactions);
    updateTransactionCount(data.total || allTransactions.length);
    // Update title
    document.getElementById("transactions-list-title").textContent = "Recent Transactions";
    // Make sure transactions list is visible
    document.getElementById("transactions-list-section").style.display = "block";
  } catch (err) {
    console.error("Error loading transactions:", err);
    allTransactions = [];
    await displayTransactions([]);
    updateTransactionCount(0);
    document.getElementById("transactions-list-title").textContent = "Recent Transactions";
    // Make sure transactions list is visible even if empty
    document.getElementById("transactions-list-section").style.display = "block";
  }
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
  
  try {
    const data = await apiRequest("/api/transactions?" + params.toString());
    allTransactions = data.items || [];
    await displayTransactions(allTransactions);
    updateTransactionCount(data.total || allTransactions.length);
    // Update title to show filtered results
    document.getElementById("transactions-list-title").textContent = "Filtered Transactions";
    // Make sure transactions list is visible
    document.getElementById("transactions-list-section").style.display = "block";
  } catch (err) {
    console.error("Error loading transactions:", err);
    allTransactions = [];
    await displayTransactions([]);
    updateTransactionCount(0);
    document.getElementById("transactions-list-title").textContent = "Filtered Transactions";
    // Make sure transactions list is visible even if empty
    document.getElementById("transactions-list-section").style.display = "block";
  }
}

async function displayTransactions(transactions) {
  const tbody = document.getElementById("transactions-body");
  tbody.innerHTML = "";
  
  if (transactions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--color-text-muted);">No transactions found</td></tr>';
    return;
  }
  
  transactions.forEach((tx) => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-tx-id", tx.id);
    
    if (editingTransactionId === tx.id) {
      // Edit mode - show editable fields
      tr.innerHTML = `
        <td><input type="date" class="edit-date" value="${tx.date ? tx.date.slice(0, 10) : ''}" style="width:100%; padding:0.25rem; border-radius:4px; border:1px solid var(--color-border); background:var(--color-bg-elevated);" /></td>
        <td>
          <select class="edit-category" style="width:100%; padding:0.25rem; border-radius:4px; border:1px solid var(--color-border); background:var(--color-bg-elevated);">
            ${txCategories.map(cat => `<option value="${cat.id}" ${tx.categoryId == cat.id ? 'selected' : ''}>${cat.name}</option>`).join('')}
          </select>
        </td>
        <td>
          <select class="edit-subcategory" style="width:100%; padding:0.25rem; border-radius:4px; border:1px solid var(--color-border); background:var(--color-bg-elevated);">
            <option value="">None</option>
          </select>
        </td>
        <td>
          <select class="edit-type" style="width:100%; padding:0.25rem; border-radius:4px; border:1px solid var(--color-border); background:var(--color-bg-elevated);">
            <option value="INCOME" ${tx.type === 'INCOME' ? 'selected' : ''}>Income</option>
            <option value="SAVINGS" ${tx.type === 'SAVINGS' ? 'selected' : ''}>Savings</option>
            <option value="EXPENSE" ${tx.type === 'EXPENSE' ? 'selected' : ''}>Expense</option>
          </select>
        </td>
        <td>
          <select class="edit-mode" style="width:100%; padding:0.25rem; border-radius:4px; border:1px solid var(--color-border); background:var(--color-bg-elevated);">
            <option value="CASH" ${(tx.mode || 'CASH') === 'CASH' ? 'selected' : ''}>Cash</option>
            <option value="ONLINE" ${(tx.mode || 'CASH') === 'ONLINE' ? 'selected' : ''}>Online</option>
          </select>
        </td>
        <td><input type="number" step="0.01" class="edit-amount" value="${tx.amount || ''}" style="width:100%; padding:0.25rem; border-radius:4px; border:1px solid var(--color-border); background:var(--color-bg-elevated);" /></td>
        <td><input type="text" class="edit-details" value="${tx.details || tx.description || ''}" style="width:100%; padding:0.25rem; border-radius:4px; border:1px solid var(--color-border); background:var(--color-bg-elevated);" /></td>
        <td style="text-align:right;">
          <button type="button" class="btn btn-primary btn-xs save-edit-btn" data-save="${tx.id}">Save</button>
          <button type="button" class="btn btn-outline btn-xs cancel-edit-btn" data-cancel="${tx.id}">Cancel</button>
        </td>
      `;
      
      // Load subcategories for this row
      const categoryId = tx.categoryId;
      if (categoryId) {
        await loadSubcategoriesForEditRow(tr, categoryId, tx.subcategoryId);
      }
    } else {
      // Read-only mode
      tr.innerHTML = `
        <td>${tx.date ? new Date(tx.date).toLocaleDateString() : "-"}</td>
        <td>${tx.category ? tx.category.name : (txCategories.find(c => c.id == tx.categoryId)?.name || "-")}</td>
        <td>${tx.subcategory ? tx.subcategory.name : "-"}</td>
        <td class="${tx.type === "INCOME" ? "tag-income" : tx.type === "SAVINGS" ? "tag-savings" : "tag-expense"}">${tx.type}</td>
        <td>${tx.mode || "CASH"}</td>
        <td>${formatINR(tx.amount)}</td>
        <td>${tx.details || tx.description || "-"}</td>
        <td style="text-align:right;">
          <button type="button" class="btn btn-outline btn-xs edit-tx-btn" data-edit="${tx.id}">Edit</button>
        </td>
      `;
    }
    
    tbody.appendChild(tr);
  });
  
  // Attach event listeners
  attachTransactionEventListeners();
}

async function loadSubcategoriesForEditRow(row, categoryId, selectedSubcategoryId) {
  const subSelect = row.querySelector(".edit-subcategory");
  subSelect.innerHTML = '<option value="">None</option>';
  
  if (!categoryId) return;
  
  try {
    const data = await apiRequest(
      "/api/subcategories?categoryId=" + encodeURIComponent(categoryId)
    );
    (data.subcategories || []).forEach((sub) => {
      const opt = document.createElement("option");
      opt.value = sub.id;
      opt.textContent = sub.name;
      if (selectedSubcategoryId && sub.id == selectedSubcategoryId) {
        opt.selected = true;
      }
      subSelect.appendChild(opt);
    });
  } catch (err) {
    // Use sample subcategories if API fails
    sampleSubcategories.filter(s => s.categoryId == categoryId).forEach((sub) => {
      const opt = document.createElement("option");
      opt.value = sub.id;
      opt.textContent = sub.name;
      if (selectedSubcategoryId && sub.id == selectedSubcategoryId) {
        opt.selected = true;
      }
      subSelect.appendChild(opt);
    });
  }
}

function attachTransactionEventListeners() {
  const tbody = document.getElementById("transactions-body");
  
  tbody.addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".edit-tx-btn");
    const saveBtn = e.target.closest(".save-edit-btn");
    const cancelBtn = e.target.closest(".cancel-edit-btn");
    
    if (editBtn) {
      const txId = parseInt(editBtn.getAttribute("data-edit"));
      editingTransactionId = txId;
      await loadTransactions(); // Reload to show edit mode
    } else if (saveBtn) {
      const txId = parseInt(saveBtn.getAttribute("data-save"));
      await saveEditedTransaction(txId);
    } else if (cancelBtn) {
      editingTransactionId = null;
      await loadTransactions(); // Reload to show read-only mode
    }
  });
}

async function saveEditedTransaction(txId) {
  const row = document.querySelector(`tr[data-tx-id="${txId}"]`);
  if (!row) return;
  
    const payload = {
      date: row.querySelector(".edit-date").value,
      type: row.querySelector(".edit-type").value,
      amount: parseFloat(row.querySelector(".edit-amount").value),
      categoryId: Number(row.querySelector(".edit-category").value),
      subcategoryId: row.querySelector(".edit-subcategory").value ? Number(row.querySelector(".edit-subcategory").value) : null,
      description: row.querySelector(".edit-details").value.trim(),
      details: row.querySelector(".edit-details").value.trim(),
      mode: row.querySelector(".edit-mode").value,
    };
  
  if (!payload.date || isNaN(payload.amount) || !payload.categoryId) {
    alert("Date, amount and category are required.");
    return;
  }
  
  try {
    await apiRequest("/api/transactions/" + txId, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    editingTransactionId = null;
    await loadTransactions();
  } catch (err) {
    alert(err.message || "Failed to save transaction.");
  }
}

async function saveTransaction() {
  const errorEl = document.getElementById("tx-error");
  errorEl.style.display = "none";
  errorEl.textContent = "";
  
  try {
    const id = document.getElementById("tx-id").value;
    const payload = {
      date: document.getElementById("tx-date").value,
      type: document.getElementById("tx-type").value,
      amount: parseFloat(document.getElementById("tx-amount").value),
      categoryId: Number(document.getElementById("transaction-category").value),
      subcategoryId: document.getElementById("tx-subcategory").value
        ? Number(document.getElementById("tx-subcategory").value)
        : null,
      description: document.getElementById("tx-details").value.trim(),
      details: document.getElementById("tx-details").value.trim(),
      mode: document.getElementById("tx-mode").value,
    };
    
    if (!payload.date || isNaN(payload.amount) || !payload.categoryId) {
      throw new Error("Date, amount and category are required.");
    }
    
    const method = id ? "PUT" : "POST";
    const url = id ? "/api/transactions/" + id : "/api/transactions";
    await apiRequest(url, { method, body: JSON.stringify(payload) });
    
    // Reload recent transactions after saving
    await loadLast10Transactions();
    resetTxForm();
    alert("Transaction saved successfully!");
  } catch (err) {
    errorEl.textContent = err.message || "Failed to save transaction.";
    errorEl.style.display = "block";
  }
}

function resetTxForm() {
  document.getElementById("tx-id").value = "";
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("tx-date").value = today;
  document.getElementById("tx-type").value = "INCOME";
  document.getElementById("tx-amount").value = "";
  document.getElementById("tx-details").value = "";
  document.getElementById("tx-subcategory").value = "";
  document.getElementById("transaction-category").value = "";
  document.getElementById("tx-mode").value = "CASH";
  document.getElementById("tx-error").style.display = "none";
  
  // Restore placeholders
  const detailsInput = document.getElementById("tx-details");
  const amountInput = document.getElementById("tx-amount");
  detailsInput.placeholder = "Transaction Details";
  amountInput.placeholder = "Transaction Amount";
}

function updateTransactionCount(count) {
  const countEl = document.getElementById("tx-count");
  countEl.textContent = `${count} transaction${count === 1 ? "" : "s"}`;
}

function formatINR(x) {
  const n = Number(x || 0);
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}
