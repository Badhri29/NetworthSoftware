/* =================ALL variables===================== */
let allTransactions = [];
let dateInput;
let transactionType;
let categorySelect;
let subcategorySelect;
let detailsTextarea;
let charCount;
let amountInput;
let paymentMode;
let cardGroup;
let cardSelect;
let clearBtn;
let modal;
let modalDetails;
let confirmBtn;
let cancelBtn;
let formData;
let toggleBtns;
let addTransactionSection;
let getTransactionSection;
let editCategoriesSection;
let filterBtn;
let inlineFilter;
let mobileModal;
let closeMobileBtn;
let applyBtn;
let resetBtn;
let applyBtnMobile;
let resetBtnMobile;
let dateFilter;

/* =================ALL CORE LOGIC===================== */
function resetAllFilters() {

  document
    .querySelectorAll(
      '#filter-section select, #filter-section input,' +
      '#mobileFilterModal select, #mobileFilterModal input'
    )
    .forEach(el => el.value = '');

  const dateFilter = document.getElementById('filter-date');
  if (dateFilter) dateFilter.value = 'month';
}
function syncMobileToDesktop() {
  document
    .querySelectorAll('#mobileFilterModal [data-sync]')
    .forEach(mobileEl => {
      const target = document.getElementById(mobileEl.dataset.sync);
      if (target) target.value = mobileEl.value;
    });
}
function handleApply(isMobile) {
  if (isMobile) syncMobileToDesktop();
  applyTransactionFilters();
  closeFilterUI();
}
function handleReset() {
  document
    .querySelectorAll('#filter-section select, #filter-section input,' +
      '#mobileFilterModal select, #mobileFilterModal input')
    .forEach(el => el.value = '');

  const desktopDate = document.getElementById('filter-date');
  if (desktopDate) desktopDate.value = 'month';
  const mobileDate = document.getElementById('mobile-filter-date');
  if (mobileDate) mobileDate.value = 'month';
  applyTransactionFilters();
}
function setDefaultDateFilters() {
  // Desktop
  const desktopDate = document.getElementById('filter-date');
  if (desktopDate) desktopDate.value = 'month';

  // Mobile
  const mobileDate = document.getElementById('mobile-filter-date');
  if (mobileDate) mobileDate.value = 'month';
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN');
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function formatDateTime(dateStr) {
  const d = new Date(dateStr);

  return {
    date: d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }),
    time: d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
  };
}
function renderTransactionsTable(transactions) {
  const tbody = document.getElementById('transactions-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!transactions.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center;color:#6b7280;padding:12px">
          No transactions found
        </td>
      </tr>
    `;
    return;
  }

  transactions.forEach(tx => {
    const tr = document.createElement('tr');

    // Row color by type
    tr.className =
      tx.type === 'income'
        ? 'transaction-income'
        : tx.type === 'expense'
          ? 'transaction-expense'
          : 'transaction-saving';

    tr.innerHTML = `
      <td data-label="ID">${tx.id}</td>
      <td data-label="Date">${formatDate(tx.date)}</td>
      <td data-label="Type"><span>${capitalize(tx.type)}</span></td>
      <td data-label="Category">${tx.category || '-'}</td>
      <td data-label="Sub-category">${tx.subcategory || '-'}</td>
      <td data-label="Details">${tx.description || '-'}</td>
      <td data-label="Amount" class="amount">₹${tx.amount}</td>
      <td data-label="Payment Mode">${tx.paymentMode}</td>
      <td data-label="Card Type">${tx.card || '-'}</td>
    `;

    tbody.appendChild(tr);
  });
}
function applyTransactionFilters() {

  const type = document.getElementById('filter-type')?.value || '';
  const category = document.getElementById('filter-category')?.value || '';
  const subcategory = document.getElementById('filter-subcategory')?.value || '';
  const dateRange = document.getElementById('filter-date')?.value || '';
  const minAmount = parseFloat(document.getElementById('filter-amount-min')?.value) || 0;
  const maxAmount = parseFloat(document.getElementById('filter-amount-max')?.value) || Infinity;
  const payment = document.getElementById('filter-payment')?.value || '';
  const card = document.getElementById('filter-card')?.value || '';

  const today = new Date();

  const filtered = allTransactions.filter(tx => {

    if (type && tx.type !== type) return false;
    if (category && tx.category !== category) return false;
    if (subcategory && tx.subcategory !== subcategory) return false;
    if (payment && tx.paymentMode !== payment) return false;
    if (card && tx.card !== card) return false;

    if (tx.amount < minAmount || tx.amount > maxAmount) return false;

    if (dateRange) {
      const txDate = new Date(tx.date);

      if (dateRange === 'today') {
        if (txDate.toDateString() !== today.toDateString()) return false;
      }

      if (dateRange === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        if (txDate < weekStart) return false;
      }

      if (dateRange === 'month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        if (txDate < monthStart) return false;
      }
    }

    return true;


  });

  renderTransactionsTable(filtered);
  renderGetTransactionsAsCards(filtered);
}
function closeFilterUI() {
  document.getElementById('filter-section')?.classList.remove('open');
  document.getElementById('mobileFilterModal')?.classList.remove('show');
}
function setupViewToggle() {
  // Default view
  addTransactionSection.style.display = 'flex';
  getTransactionSection.style.display = 'none';
  editCategoriesSection.style.display = 'none';

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      // Toggle active button
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const view = btn.dataset.view;
      addTransactionSection.style.display = 'none';
      getTransactionSection.style.display = 'none';
      if (editCategoriesSection) editCategoriesSection.style.display = 'none';

      if (view === 'add-transaction') {
        addTransactionSection.style.display = 'flex';
        getTransactionSection.style.display = 'none';
      }

      if (view === 'get-transaction') {
        addTransactionSection.style.display = 'none';
        getTransactionSection.style.display = 'block';
        setDefaultDateFilters();
        await loadAllTransactions();
        applyTransactionFilters();
      }

      if (view === 'edit-categories' && editCategoriesSection) {
        editCategoriesSection.style.display = 'block';
      }
    });
  });
}
async function loadAllTransactions() {
  try {
    const res = await fetch('/api/transactions', { credentials: 'include' });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    allTransactions = result.data || [];
  } catch (err) {
    console.error('Failed to load transactions:', err);
  }
}
function renderRecentTransactions(transactions) {
  const container = document.getElementById('recent-transactions-list');
  if (!container) return;

  if (!Array.isArray(transactions)) {
    console.warn('renderRecentTransactions expected array, got:', transactions);
    transactions = [];
  }

  container.innerHTML = '';

  if (transactions.length === 0) {
    container.innerHTML =
      '<p style="padding:12px;color:#6b7280">No recent transactions</p>';
    return;
  }
  transactions.forEach(tx => {
    // Date shown = transaction date (what user selected)
    const txDate = formatDateTime(tx.date).date;

    // Time shown = system time (when added / updated)
    const txTime = formatDateTime(tx.updatedAt).time;

    const dateTime = `${txDate} • ${txTime}`;


    const card = document.createElement('div');
    card.className = `recent-card ${tx.type}`;

    card.innerHTML = `
      <!-- ROW 1 -->
      <div class="recent-row">
        <div class="recent-box">
          <div class="recent-label">Last Modified</div>
          <div class="recent-value">${dateTime}</div>
        </div>

        <div class="recent-box">
          <div class="recent-label">Category</div>
          <div class="recent-value">${tx.category || '-'}</div>
        </div>

        <div class="recent-box">
          <div class="recent-label">Payment Type</div>
          <div class="recent-value ${tx.type}">${tx.type}</div>
        </div>
      </div>

      <!-- ROW 2 -->
      <div class="recent-row second">
        <div class="recent-box">
          <div class="recent-label">Payment Mode</div>
          <div class="recent-value">
            ${tx.paymentMode}${tx.card ? ' • ' + tx.card : ''}
          </div>
        </div>

        <div class="recent-box">
          <div class="recent-label">Sub Category</div>
          <div class="recent-value">${tx.subcategory || '-'}</div>
        </div>

        <div class="recent-box">
          <div class="recent-label">Amount</div>
          <div class="recent-value recent-amount">₹${tx.amount}</div>
        </div>
      </div>

      <!-- DETAILS -->
      <div class="recent-details">
        <div class="recent-label">Details</div>
        ${tx.description || '-'}
      </div>
    `;

    container.appendChild(card);
  });
}
function renderGetTransactionsAsCards(transactions) {
  const container = document.getElementById('mobile-transactions-list');
  if (!container) return;

  container.innerHTML = '';

  if (!transactions.length) {
    container.innerHTML =
      '<p style="padding:12px;color:#6b7280">No transactions found</p>';
    return;
  }

  transactions.forEach(tx => {

    const txDate = formatDateTime(tx.date).date;
    const txTime = formatDateTime(tx.updatedAt).time;
    const dateTime = `${txDate} • ${txTime}`;

    const card = document.createElement('div');
    card.className = `recent-card ${tx.type}`;

    card.innerHTML = `
      <div class="recent-row">
        <div class="recent-box">
          <div class="recent-label">Last Modified</div>
          <div class="recent-value">${dateTime}</div>
        </div>

        <div class="recent-box">
          <div class="recent-label">Category</div>
          <div class="recent-value">${tx.category || '-'}</div>
        </div>

        <div class="recent-box">
          <div class="recent-label">Payment Type</div>
          <div class="recent-value ${tx.type}">${tx.type}</div>
        </div>
      </div>

      <div class="recent-row second">
        <div class="recent-box">
          <div class="recent-label">Payment Mode</div>
          <div class="recent-value">
            ${tx.paymentMode}${tx.card ? ' • ' + tx.card : ''}
          </div>
        </div>

        <div class="recent-box">
          <div class="recent-label">Sub Category</div>
          <div class="recent-value">${tx.subcategory || '-'}</div>
        </div>

        <div class="recent-box">
          <div class="recent-label">Amount</div>
          <div class="recent-value recent-amount">₹${tx.amount}</div>
        </div>
      </div>

      <div class="recent-details">
        <div class="recent-label">Details</div>
        ${tx.description || '-'}
      </div>
    `;

    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('transaction-form');
  if (!form) return;

  // ===== Elements =====
  dateInput = document.getElementById('transaction-date');
  transactionType = document.getElementById('transaction-type');
  categorySelect = document.getElementById('transaction-category');
  subcategorySelect = document.getElementById('transaction-subcategory');
  detailsTextarea = document.getElementById('transaction-details');
  charCount = document.getElementById('char-count');
  amountInput = document.getElementById('transaction-amount');
  paymentMode = document.getElementById('payment-mode');
  cardGroup = document.getElementById('card-selection-group');
  cardSelect = document.getElementById('card-selection');
  clearBtn = document.getElementById('clear-form');
  modal = document.getElementById('confirmationModal');
  modalDetails = document.getElementById('transactionDetails');
  confirmBtn = document.getElementById('confirmSubmit');
  cancelBtn = document.getElementById('cancelSubmit');

  formData = null;

  // ===== Default Date =====
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;

  // Function to clear error for a specific field
  const clearFieldError = (inputElement, errorId) => {
    inputElement.classList.remove('error');
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = '';
    }
  };

  // Add input event listeners to clear errors when user types
  dateInput.addEventListener('input', () => clearFieldError(dateInput, 'date-error'));
  transactionType.addEventListener('change', () => clearFieldError(transactionType, 'type-error'));
  amountInput.addEventListener('input', () => clearFieldError(amountInput, 'amount-error'));
  paymentMode.addEventListener('change', () => clearFieldError(paymentMode, 'payment-mode-error'));
  dateInput.max = today;


  /* Type, Categories, Subcategories */
  categorySelect.disabled = true;
  subcategorySelect.disabled = true;
  const subCategories = {
    income: {
      "Salary / Wages": [
        "Basic Salary", "Bonus", "Overtime Pay", "Commission", "Allowances", "Incentives"
      ],
      "Freelance / Self-Employed": [
        "Freelance Projects", "Consulting Fees", "Contract Work", "Gig Work", "Online Services"
      ],
      "Business Income": [
        "Product Sales", "Service Charges", "Profit Share", "Partnership Income", "Franchise Income"
      ],
      "Investment Income": [
        "Bank Interest", "FD Interest", "RD Interest", "Dividend Income",
        "Mutual Fund Returns", "Stock Market Gains", "Bond Interest"
      ],
      "Rental Income": [
        "House Rent", "Shop Rent", "Land Rent", "Parking Rent"
      ],
      "Government / Benefits": [
        "Pension", "Scholarship", "Subsidy", "Government Allowance", "Insurance Claim"
      ],
      "Lending Recovery": [
        "Friend Loan Amount Received", "Family Loan Amount Received",
        "Relative Loan Amount Received", "Personal Loan Amount Received",
        "Business Loan Amount Received", "Emergency Loan Amount Received",
        "Advance Amount Received", "Interest Amount Received"
      ],
      "Gifts / Other Income": [
        "Gift Received", "Refund", "Cashback", "Reimbursement", "Prize / Lottery", "Other Income"
      ]
    },

    savings: {
      "Bank Savings": [
        "Savings Account Deposit", "Emergency Fund", "Surplus Cash Saved"
      ],
      "Fixed Income Savings": [
        "Fixed Deposit (FD)", "Recurring Deposit (RD)",
        "Post Office Deposit", "Senior Citizen Deposit"
      ],
      "Investment Savings": [
        "Mutual Fund Investment", "SIP Investment",
        "Stock Investment", "ETF Investment", "Bond Investment"
      ],
      "Retirement Savings": [
        "EPF Contribution", "PPF Contribution", "NPS Contribution", "Pension Fund"
      ],
      "Gold & Physical Assets": [
        "Gold Savings Scheme", "Gold Coin / Bar",
        "Jewellery Investment", "Silver Investment"
      ],
      "Insurance Savings": [
        "Life Insurance Premium", "Term Insurance Savings", "ULIP Investment"
      ],
      "Goal-Based Savings": [
        "House Fund", "Education Fund", "Marriage Fund", "Travel Fund", "Vehicle Fund"
      ],
      "Digital & Alternate Savings": [
        "Wallet Balance Saved", "Crypto Investment", "Other Digital Assets"
      ]
    },

    expense: {
      "Food & Dining": [
        "Groceries", "Vegetables & Fruits", "Milk & Essentials",
        "Restaurant / Hotel", "Snacks & Beverages", "Online Food Orders"
      ],
      "Housing & Utilities": [
        "House Rent", "Electricity Bill", "Water Bill",
        "Gas", "Internet Bill", "Mobile Recharge", "Maintenance"
      ],
      "Transportation": [
        "Fuel", "Public Transport", "Cab / Auto",
        "Vehicle Service", "Parking", "Toll"
      ],
      "Personal & Lifestyle": [
        "Clothing", "Footwear", "Grooming / Salon",
        "Cosmetics", "Gym / Fitness", "Entertainment"
      ],
      "Health & Medical": [
        "Doctor Fees", "Medicines", "Hospital Charges",
        "Medical Tests", "Health Insurance Premium"
      ],
      "Education": [
        "School Fees", "College Fees", "Tuition Fees",
        "Online Courses", "Books & Stationery"
      ],
      "Loan & Credit Payments": [
        "Personal Loan EMI Paid", "Home Loan EMI Paid",
        "Vehicle Loan EMI Paid", "Education Loan EMI Paid",
        "Credit Card Bill Paid", "Credit Card Interest Paid"
      ],
      "Lending / Loan Given": [
        "Friend Loan Given", "Family Loan Given",
        "Relative Loan Given", "Emergency Loan Given", "Advance Given"
      ],
      "Insurance (Expense)": [
        "Vehicle Insurance", "Home Insurance"
      ],
      "Subscriptions & Bills": [
        "OTT Subscription", "Software Subscription",
        "Cloud / Hosting", "Newspaper"
      ],
      "Travel & Vacation": [
        "Flight Tickets", "Train / Bus Tickets",
        "Hotel", "Local Travel", "Travel Food"
      ],
      "Taxes & Government": [
        "Income Tax", "Property Tax", "Road Tax", "Fines / Penalties"
      ],
      "Gifts & Donations": [
        "Gift Given", "Charity / Donation", "Festival Expenses"
      ],
      "Miscellaneous": [
        "Bank Charges", "Service Charges", "Late Fees", "Other Expenses"
      ]
    }
  };
  categorySelect.addEventListener("change", () => {
    const type = transactionType.value;
    const category = categorySelect.value;

    subcategorySelect.innerHTML = `<option value="">Select Sub-Category</option>`;
    subcategorySelect.disabled = true;

    if (!type || !category) return;

    const subs = subCategories[type][category] || [];
    subs.forEach(sub => {
      const opt = document.createElement("option");
      opt.value = sub;
      opt.textContent = sub;
      subcategorySelect.appendChild(opt);
    });

    if (subs.length) subcategorySelect.disabled = false;
  });
  transactionType.addEventListener("change", () => {
    const type = transactionType.value;

    categorySelect.innerHTML = `<option value="">Select Category</option>`;
    subcategorySelect.innerHTML = `<option value="">Select Sub-Category</option>`;
    subcategorySelect.disabled = true;

    if (!type || !subCategories[type]) {
      categorySelect.disabled = true;
      return;
    }

    categorySelect.disabled = false;

    Object.keys(subCategories[type]).forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categorySelect.appendChild(opt);
    });
  });


  // ===== Character Counter =====
  detailsTextarea.addEventListener('input', () => {
    charCount.textContent = detailsTextarea.value.length;
  });
  // ===== Payment Mode =====
  paymentMode.addEventListener('change', () => {
    cardGroup.style.display = paymentMode.value === 'credit' ? 'block' : 'none';
  });

  // ===== Amount Validation =====
  amountInput.addEventListener('keypress', e => {
    if (['e', 'E', '-'].includes(e.key)) e.preventDefault();
  });

  // ===== Clear Form =====
  clearBtn.addEventListener('click', resetForm);

  // ===== Update Transaction Type Class =====
  const updateTransactionTypeClass = (type) => {
    const modalContent = document.querySelector('.modal-content');
    // Remove all transaction type classes
    modalContent.classList.remove('transaction-type-income', 'transaction-type-expense', 'transaction-type-savings');

    // Add the appropriate class based on the selected type
    if (type) {
      modalContent.classList.add(`transaction-type-${type}`);
    }
  };




  // ===== Form Submit =====
  document.querySelector('.btn-primary').addEventListener('click', e => {
    e.preventDefault();
    if (!validateForm()) return;

    formData = {
      date: dateInput.value,
      type: transactionType.value,
      category: categorySelect.value || null,
      subcategory: subcategorySelect.value || null,
      details: detailsTextarea.value || null,
      amount: parseFloat(amountInput.value),
      paymentMode: paymentMode.value,
      card: paymentMode.value === 'credit' ? cardSelect.value : null
    };

    // Update modal class before showing
    updateTransactionTypeClass(transactionType.value);
    showModal(formData);
  });

  // ===== Modal Actions =====
  confirmBtn.addEventListener('click', submitToServer);
  cancelBtn.addEventListener('click', closeModal);

  // ===== Form validation =====
  function validateForm() {
    let isValid = true;

    // Reset error messages
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    // Validate date
    if (!dateInput.value) {
      document.getElementById('date-error').textContent = 'Date is required';
      dateInput.classList.add('error');
      isValid = false;
    }

    // Validate transaction type
    if (!transactionType.value) {
      document.getElementById('type-error').textContent = 'Transaction type is required';
      transactionType.classList.add('error');
      isValid = false;
    }

    // Validate amount
    if (!amountInput.value || amountInput.value <= 0) {
      document.getElementById('amount-error').textContent = 'Please enter a valid amount';
      amountInput.classList.add('error');
      isValid = false;
    }

    // Validate payment mode
    if (!paymentMode.value) {
      document.getElementById('payment-mode-error').textContent = 'Payment mode is required';
      paymentMode.classList.add('error');
      isValid = false;
    }

    return isValid;
  }

  //   ===== Confirmation screen display function =====
  function showModal(data) {
    modalDetails.innerHTML = `
      <p><strong>Date:</strong> ${data.date}</p>
      <p><strong>Type:</strong> ${data.type}</p>
      ${data.category ? `<p><strong>Category:</strong> ${data.category}</p>` : ''}
      ${data.subcategory ? `<p><strong>Subcategory:</strong> ${data.subcategory}</p>` : ''}
      ${data.details ? `<p><strong>Details:</strong> ${data.details}</p>` : ''}
      <p><strong>Amount:</strong> ₹${data.amount}</p>
      <p><strong>Payment:</strong> ${data.paymentMode}</p>
      ${data.card ? `<p><strong>Card:</strong> ${data.card}</p>` : ''}
    `;
    modal.classList.add('show');
  }

  function closeModal() {
    modal.classList.remove('show');
  }


  async function submitToServer() {
    if (!formData) {
      console.error('No form data available');
      return;
    }

    const confirmBtn = document.getElementById('confirmSubmit');
    if (!confirmBtn) {
      console.error('Confirm button not found');
      return;
    }

    // Save original button state
    const originalText = confirmBtn.textContent;
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Saving...';

    try {
      console.log('Submitting transaction:', formData);

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        const error = await response.json().catch(() => ({}));
        console.error('Authentication error:', error);
        alert('Your session has expired. Please log in again.');
        window.location.href = '/login';
        return;
      }

      const data = await response.json().catch(err => {
        console.error('Failed to parse JSON response:', err);
        throw new Error('Invalid server response');
      });

      // Handle non-2xx responses
      if (!response.ok) {
        console.error('Server error response:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.message || `Server error: ${response.statusText}`);
      }

      console.log('Transaction saved successfully:', data);

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'alert alert-success';
      successMessage.textContent = 'Transaction saved successfully!';
      document.body.appendChild(successMessage);

      // Remove message after 3 seconds
      setTimeout(() => {
        successMessage.remove();
      }, 3000);

      // Close modal and reset form
      closeModal();
      resetForm();
      await loadRecentTransactions();

      // Optional: Refresh transactions list if needed
      if (typeof loadTransactions === 'function') {
        loadTransactions();
      }

    } catch (error) {
      console.error('Transaction save failed:', {
        error: error.message,
        stack: error.stack
      });

      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'alert alert-error';
      errorMessage.textContent = `Error: ${error.message || 'Failed to save transaction'}`;
      document.body.appendChild(errorMessage);

      // Remove message after 5 seconds
      setTimeout(() => {
        errorMessage.remove();
      }, 5000);

    } finally {
      // Restore button state
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = originalText;
      }
    }
  }


  //   ===== form reset function =====
  function resetForm() {
    form.reset();
    dateInput.value = today;
    subcategorySelect.innerHTML = `<option value="">Select Sub-Category</option>`;
    subcategorySelect.disabled = true;
    cardGroup.style.display = 'none';
    charCount.textContent = '0';
  }

  /* =====================================================
       GET TRANSACTION TOGGLE LOGIC (FIXED FOR PRODUCTION)
    ===================================================== */

  toggleBtns = document.querySelectorAll('.toggle-btn');
  addTransactionSection = document.querySelector('.add-transection-content');
  getTransactionSection = document.querySelector('.get-transection-content');
  editCategoriesSection = document.getElementById('edit-categories-content');

  // =======================form styles stop=======================


  // =========== recent transaction style start =====================

  async function loadRecentTransactions() {
    console.log('Loading recent transactions...');
    try {
      const res = await fetch('/api/transactions?limit=5', {
        credentials: 'include'
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      renderRecentTransactions(result.data || []);
      console.log('Transaction fetched ✅');
    } catch (err) {
      console.error('Failed to load recent transactions', err);
    }
  }





  function openTransactionView(tx) {
    const modal = document.getElementById('transactionViewModal');
    const body = document.getElementById('transactionViewBody');

    const d = new Date(tx.updatedAt);
    const date = d.toLocaleDateString("en-IN");
    const time = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    body.innerHTML = `
    <div class="view-grid">
      <div class="view-box">
        <div class="view-label">Last Modified</div>
        <div class="view-value">${date} • ${time}</div>
      </div>

      <div class="view-box">
        <div class="view-label">Category</div>
        <div class="view-value">${tx.category || '-'}</div>
      </div>

      <div class="view-box">
        <div class="view-label">Payment Type</div>
        <div class="view-value">${tx.type}</div>
      </div>

      <div class="view-box">
        <div class="view-label">Payment Mode</div>
        <div class="view-value">
          ${tx.paymentMode}${tx.card ? ' • ' + tx.card : ''}
        </div>
      </div>

      <div class="view-box">
        <div class="view-label">Sub Category</div>
        <div class="view-value">${tx.subcategory || '-'}</div>
      </div>

      <div class="view-box">
        <div class="view-label">Amount</div>
        <div class="view-value">₹${tx.amount}</div>
      </div>
    </div>

    <div class="view-details">
      ${tx.description || '-'}
    </div>
  `;

    modal.classList.add('show');
  }

  document.getElementById('closeViewModal')
    .addEventListener('click', () => {
      document.getElementById('transactionViewModal')
        .classList.remove('show');
    });

  // =========== recent transaction style stop ======================


  // ========================================================================
  //      <--------------     ADD TRANSECTION Styles stop 
  // ========================================================================







  // ========================================================================
  //                          GET TRANSECTION Styles start ----------->
  // ========================================================================
  filterBtn = document.getElementById('filter-toggle');
  inlineFilter = document.getElementById('filter-section');
  mobileModal = document.getElementById('mobileFilterModal');
  closeMobileBtn = document.getElementById('closeFilterModal');
  applyBtn = document.getElementById('applyFilterBtn');
  resetBtn = document.getElementById('resetFilterBtn');
  applyBtnMobile = document.getElementById('applyFilterBtnMobile');
  resetBtnMobile = document.getElementById('resetFilterBtnMobile');
  dateFilter = document.getElementById('filter-date');

  document.getElementById('filter-date').value = 'month';
  setDefaultDateFilters();
  loadRecentTransactions();
  setupViewToggle();
  closeMobileBtn?.addEventListener('click', () => {
    mobileModal?.classList.remove('show');
  });
  applyBtn?.addEventListener('click', () => handleApply(false));
  applyBtnMobile?.addEventListener('click', () => handleApply(true));
  resetBtn?.addEventListener('click', handleReset);
  resetBtnMobile?.addEventListener('click', handleReset);
  document.getElementById('closeFilterModal')?.addEventListener('click', closeFilterUI);
  if (dateFilter) dateFilter.value = "month";
  if (typeof applyTransactionFilters === "function") {
    applyTransactionFilters();
  }
  if (filterBtn && inlineFilter) {

    // ===== FILTER BUTTON CLICK =====
    filterBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      if (window.innerWidth <= 768) {
        // ✅ MOBILE → open modal
        mobileModal?.classList.add("show");
      } else {
        // ✅ DESKTOP → toggle inline filter
        inlineFilter.classList.toggle("open");
        filterBtn.textContent = inlineFilter.classList.contains("open")
          ? "Hide Filter"
          : "Show Filter";
      }
    });

    // ===== DESKTOP → CLICK OUTSIDE TO CLOSE =====
    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) return;

      const clickedInsideFilter = inlineFilter.contains(e.target);
      const clickedFilterBtn = filterBtn.contains(e.target);

      if (!clickedInsideFilter && !clickedFilterBtn) {
        inlineFilter.classList.remove("open");
        filterBtn.textContent = "Show Filter";
      }
    });
  }
});