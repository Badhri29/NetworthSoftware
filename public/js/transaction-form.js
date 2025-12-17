/**
 * Transaction Form Handling
 * Clean + Required UI functionality only
 */

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

  // ===== Form Submit =====
  form.addEventListener('submit', e => {
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

    showModal(formData);
  });

  // ===== Modal Actions =====
  confirmBtn.addEventListener('click', submitToServer);
  cancelBtn.addEventListener('click', closeModal);

  // ===== Form validation =====
  function validateForm() {
    if (!dateInput.value) return alert('Date required');
    if (!transactionType.value) return alert('Transaction type required');
    if (!amountInput.value || amountInput.value <= 0) return alert('Invalid amount');
    if (!paymentMode.value) return alert('Payment mode required');
    return true;
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
  async function submitToServer() {
    if (!formData) return;

    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Saving...';

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');

      alert('Transaction saved successfully');
      closeModal();
      resetForm();
    } catch (err) {
      alert(err.message);
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirm';
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
});
