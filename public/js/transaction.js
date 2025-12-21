// ========================================================================
//                          ADD TRANSECTION Styles start ----------->
// ========================================================================




// =====================form styles start=========================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('transaction-form');
  if (!form) return;

  // ===== Elements =====
  const dateInput = document.getElementById('transaction-date');
  const transactionType = document.getElementById('transaction-type');
  const categorySelect = document.getElementById('transaction-category');
  const subcategorySelect = document.getElementById('transaction-subcategory');
  const detailsTextarea = document.getElementById('transaction-details');
  const charCount = document.getElementById('char-count');
  const amountInput = document.getElementById('transaction-amount');
  const paymentMode = document.getElementById('payment-mode');
  const cardGroup = document.getElementById('card-selection-group');
  const cardSelect = document.getElementById('card-selection');
  const clearBtn = document.getElementById('clear-form');

  // ===== Modal =====
  const modal = document.getElementById('confirmationModal');
  const modalDetails = document.getElementById('transactionDetails');
  const confirmBtn = document.getElementById('confirmSubmit');
  const cancelBtn = document.getElementById('cancelSubmit');

  let formData = null;

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

  // ===== Subcategory Map =====
  const subcategories = {
    food: ['Groceries', 'Dining Out', 'Snacks'],
    travel: ['Fuel', 'Bus', 'Train', 'Flight'],
    rent: ['House Rent'],
    utilities: ['Electricity', 'Water', 'Internet'],
    salary: ['Monthly Salary'],
    investment: ['Stocks', 'Mutual Funds']
  };

  // ===== Character Counter =====
  detailsTextarea.addEventListener('input', () => {
    charCount.textContent = detailsTextarea.value.length;
  });

  // ===== Category Change =====
  categorySelect.addEventListener('change', () => {
    const value = categorySelect.value;
    subcategorySelect.innerHTML = `<option value="">Select Sub-Category</option>`;
    subcategorySelect.disabled = true;

    if (subcategories[value]) {
      subcategories[value].forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub.toLowerCase().replace(/\s+/g, '-');
        opt.textContent = sub;
        subcategorySelect.appendChild(opt);
      });
      subcategorySelect.disabled = false;
    }
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

  // Listen for transaction type changes
  transactionType.addEventListener('change', (e) => {
    updateTransactionTypeClass(e.target.value);
  });

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

//   ===== Frontend sends POST API request =====
  // async function submitToServer() {
  //   if (!formData) return;

  //   confirmBtn.disabled = true;
  //   confirmBtn.textContent = 'Saving...';

  //   try {
  //     const res = await fetch('/api/transactions', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       credentials: 'include',
  //       body: JSON.stringify(formData)
  //     });
  //     if (res.status === 401) {
  //       alert('Session expired. Please login again.');
  //       window.location.href = '/';
  //       return;
  //     }

  //     const data = await res.json();
  //     if (!res.ok) {
  //       throw new Error(data.message || 'Transaction saving failed');
  //     }

  //     alert('Transaction saved successfully');
  //     closeModal();
  //     resetForm();

  //   } catch (err) {
  //     console.error('Transaction save failed:', err);
  //     alert(err.message);
  //   } finally {
  //     confirmBtn.disabled = false;
  //     confirmBtn.textContent = 'Confirm';
  //   }
  // }

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

  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const addTransactionContent = document.querySelector('.add-transection-content');
  const getTransactionContent = document.querySelector('.get-transection-content');

  if (toggleBtns.length && addTransactionContent && getTransactionContent) {
    addTransactionContent.style.display = 'flex';
    getTransactionContent.style.display = 'none';

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (btn.dataset.view === 'transactions') {
          addTransactionContent.style.display = 'flex';
          getTransactionContent.style.display = 'none';
        } else {
          addTransactionContent.style.display = 'none';
          getTransactionContent.style.display = 'block';
        }
      });
    });
  }

  /* =====================================================
     FILTER TOGGLE (SAFE)
  ===================================================== */

  const filterToggle = document.getElementById('filter-toggle');
  const filterSection = document.getElementById('filter-section');

  if (filterToggle && filterSection) {
    filterSection.style.display = 'none';

    filterToggle.addEventListener('click', e => {
      e.stopPropagation();
      const open = filterSection.style.display === 'block';
      filterSection.style.display = open ? 'none' : 'block';
      filterToggle.textContent = open ? 'Show Filter' : 'Hide Filter';
    });

    document.addEventListener('click', e => {
      if (!filterSection.contains(e.target) && e.target !== filterToggle) {
        filterSection.style.display = 'none';
        filterToggle.textContent = 'Show Filter';
      }
    });
  }

});

// =======================form styles stop=======================


// =========== recent transaction style start =====================

async function loadRecentTransactions() {
  console.log('Loading recent transactions...');
  try {
    const res = await fetch('/api/transactions', {
      credentials: 'include'
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    renderRecentTransactions(result.data);
  } catch (err) {
    console.error('Failed to load recent transactions', err);
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

  // 🔥 DO NOT slice, DO NOT sort
  transactions.forEach(tx => {
    const d = new Date(tx.updatedAt);
    const dateTime = `${d.toLocaleDateString('en-IN')} • ${d.toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    )}`;

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

/* ===========STATE===========*/
// let transactions = [];

/* ============DOM=========== */
const listEl = document.getElementById("transactions-list");
const toggleBtns = document.querySelectorAll(".toggle-btn");
const addTransactionContent = document.querySelector(".add-transection-content");
const getTransactionContent = document.querySelector(".get-transection-content");

/* ==========INIT============ */
document.addEventListener("DOMContentLoaded", () => {
  loadRecentTransactions();
  setupViewToggle();
  setupFilterToggle();
});

/* ========VIEW TOGGLE======= */
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

/* =======FILTER FUNCTIONALITY=============== */
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

// ========================================================================
//      <--------------     GET TRANSECTION Styles stop 
// ========================================================================
