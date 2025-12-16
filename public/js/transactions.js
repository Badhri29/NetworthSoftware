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
   HELPERS
================================ */
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function sampleData() {
  const today = new Date().toISOString().split("T")[0];
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
    }
  ];
}
