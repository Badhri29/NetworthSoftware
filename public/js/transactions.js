/* ===============================
   STATE
================================ */
let transactions = [];

/* ===============================
   DOM
================================ */
const listEl = document.getElementById("transactions-list");
const toggleBtns = document.querySelectorAll(".toggle-btn");
const addTransactionContent = document.querySelector(".add-transection-content");
const getTransactionContent = document.querySelector(".get-transection-content");

/* ===============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", () => {
  loadTransactions();
  setupViewToggle();
  setupFilterToggle();
  renderTransactions();
});

/* ===============================
   VIEW TOGGLE
================================ */
function setupViewToggle() {
  // Initially hide get transaction content
  getTransactionContent.style.display = 'none';
  
  toggleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      toggleBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const view = btn.dataset.view;
      if (view === 'transactions') {
        addTransactionContent.style.display = 'flex';
        getTransactionContent.style.display = 'none';
      } else if (view === 'categories') {
        addTransactionContent.style.display = 'none';
        getTransactionContent.style.display = 'block';
      }
    });
  });
}

/* ===============================
   TRANSACTIONS
================================ */
function loadTransactions() {
  const saved = localStorage.getItem("transactions");
  transactions = saved ? JSON.parse(saved) : sampleData();
}

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function renderTransactions() {
  listEl.innerHTML = "";

  if (!transactions.length) {
    listEl.innerHTML = `<p>No transactions found</p>`;
    return;
  }

  transactions.forEach(tx => {
    listEl.appendChild(createTransactionEl(tx));
  });
}

function createTransactionEl(tx) {
  const el = document.createElement("div");
  el.className = "transaction-item";

  el.innerHTML = `
    <div class="transaction-row">
      <span>${formatDate(tx.date)}</span>
      <span>${tx.type}</span>
      <span>${tx.category}</span>
      <span class="${tx.type === "income" ? "income" : "expense"}">
        ₹${tx.amount}
      </span>
      <button data-id="${tx.id}" class="delete-btn">🗑</button>
    </div>
  `;

  el.querySelector(".delete-btn").onclick = () => {
    transactions = transactions.filter(t => t.id !== tx.id);
    saveTransactions();
    renderTransactions();
  };

  return el;
}

/* ===============================
   date formate change
================================ */
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

/* ===============================
   FILTER FUNCTIONALITY
================================ */
function setupFilterToggle() {
  const filterToggle = document.getElementById('filter-toggle');
  const filterSection = document.getElementById('filter-section');
  const applyFilterBtn = document.getElementById('apply-filter');
  const resetFilterBtn = document.getElementById('reset-filter');
filterSection.style.display = 'none';
filterToggle.textContent = 'Show Filter'
  // Toggle filter section visibility
  filterToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = filterSection.style.display === 'none';
    filterSection.style.display = isHidden ? 'block' : 'none';
    filterToggle.textContent = isHidden ? 'Hide Filter' : 'Show Filter';
  });

  // Close filter when clicking outside
document.addEventListener('click', (e) => {
  if (!filterSection.contains(e.target) && e.target !== filterToggle) {
    filterSection.style.display = 'none';
    filterToggle.textContent = 'Show Filter';
  }
});

  // Apply filter
  applyFilterBtn.addEventListener('click', () => {
    const type = document.getElementById('filter-type').value;
    const category = document.getElementById('filter-category').value;
    const dateRange = document.getElementById('filter-date').value;
    
    // Filter logic will be implemented here
    const filteredTransactions = filterTransactions(type, category, dateRange);
    renderFilteredTransactions(filteredTransactions);
    
    // Close the filter section after applying
    filterSection.style.display = 'none';
  });

  // Reset filter
  resetFilterBtn.addEventListener('click', () => {
    document.getElementById('filter-type').value = 'all';
    document.getElementById('filter-category').value = 'all';
    document.getElementById('filter-date').value = 'all';
    renderTransactions(); // Reset to show all transactions
    filterSection.style.display = 'none';
  });

  // Populate categories
  updateCategoryFilter();
}

function filterTransactions(type, category, dateRange) {
  return transactions.filter(tx => {
    // Filter by type
    if (type !== 'all' && tx.type !== type) return false;
    
    // Filter by category
    if (category !== 'all' && tx.category !== category) return false;
    
    // Filter by date range
    if (dateRange !== 'all') {
      const txDate = new Date(tx.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateRange === 'today') {
        const txDateOnly = new Date(tx.date);
        txDateOnly.setHours(0, 0, 0, 0);
        if (txDateOnly.getTime() !== today.getTime()) return false;
      } else if (dateRange === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        if (txDate < weekStart) return false;
      } else if (dateRange === 'month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        if (txDate < monthStart) return false;
      }
    }
    
    return true;
  });
}

function updateCategoryFilter() {
  const categorySelect = document.getElementById('filter-category');
  // Clear existing options except the first one
  while (categorySelect.options.length > 1) {
    categorySelect.remove(1);
  }
  
  // Get unique categories from transactions
  const categories = [...new Set(transactions.map(tx => tx.category))];
  
  // Add categories to the select
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

function renderFilteredTransactions(filteredTransactions) {
  const listEl = document.querySelector('.get-section-content');
  listEl.innerHTML = '';
  
  if (!filteredTransactions.length) {
    listEl.innerHTML = '<p>No transactions match the selected filters</p>';
    return;
  }
  
  filteredTransactions.forEach(tx => {
    listEl.appendChild(createTransactionEl(tx));
  });
}

function sampleData() {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  
  return [
    {
      id: "1",
      date: today,
      type: "expense",
      category: "Food",
      amount: 250
    },
    {
      id: "2",
      date: today,
      type: "income",
      category: "Salary",
      amount: 50000
    },
    {
      id: "3",
      date: yesterdayStr,
      type: "expense",
      category: "Shopping",
      amount: 1200
    },
    {
      id: "4",
      date: yesterdayStr,
      type: "expense",
      category: "Transport",
      amount: 150
    }
  ];
}
