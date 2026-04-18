document.addEventListener("DOMContentLoaded", async () => {
  try {
    await getCurrentUser();
    hookHoldingForms();
    initTabs();
    initFormToggle();
    await refreshHoldingsAndLiabilities();

    // Listen for storage events (cross-tab communication)
    window.addEventListener('storage', async (e) => {
      if (e.key === 'transactionsUpdated' || e.key === 'holdingsUpdated') {
        console.log('Holdings page: Storage event detected, refreshing...');
        await refreshHoldingsAndLiabilities();
      }
    });

    // Listen for custom events (same-tab communication)
    window.addEventListener('holdingsChanged', async () => {
      console.log('Holdings page: Holdings changed event detected, refreshing...');
      await refreshHoldingsAndLiabilities();
    });

    // Also check for updates periodically (every 30 seconds)
    setInterval(async () => {
      await refreshHoldingsAndLiabilities();
    }, 30000);

  } catch (err) {
    console.error(err);
  }
});

async function refreshHoldingsAndLiabilities() {
  try {
    const [holdingsRes, liabilitiesRes] = await Promise.all([
      apiRequest("/api/holdings/assets").catch(err => {
        console.error("Failed to load assets:", err);
        return { assets: [] };
      }),
      apiRequest("/api/holdings/liabilities").catch(err => {
        console.error("Failed to load liabilities:", err);
        return { liabilities: [] };
      }),
    ]);
    
    const holdings = (holdingsRes && holdingsRes.assets) || [];
    const liabilities = (liabilitiesRes && liabilitiesRes.liabilities) || [];

    const holdingsBody = document.getElementById("holdings-body");
    const liabilitiesBody = document.getElementById("liabilities-body");
    holdingsBody.innerHTML = "";
    liabilitiesBody.innerHTML = "";

    let totalHoldings = 0;
    let totalLiabilities = 0;

    holdings.forEach((h) => {
      totalHoldings += Number(h.value);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${h.id}</td>
        <td>${h.name}</td>
        <td>${h.type}</td>
        <td>${formatCurrency(h.value)}</td>
        <td style="text-align:right; display:flex; gap:0.5rem; justify-content:flex-end;">
          <button class="btn btn-outline btn-xs" data-edit-holding="${h.id}">✎</button>
          <button class="btn btn-outline btn-xs" data-del-holding="${h.id}">🗑</button>
        </td>
      `;
      holdingsBody.appendChild(tr);
    });

    liabilities.forEach((l) => {
      totalLiabilities += Number(l.value);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${l.id}</td>
        <td>${l.name}</td>
        <td>${l.type}</td>
        <td>${formatCurrency(l.value)}</td>
        <td style="text-align:right; display:flex; gap:0.5rem; justify-content:flex-end;">
          <button class="btn btn-outline btn-xs" data-edit-liability="${l.id}">✎</button>
          <button class="btn btn-outline btn-xs" data-del-liability="${l.id}">🗑</button>
        </td>
      `;
      liabilitiesBody.appendChild(tr);
    });

    document.getElementById("holdings-total").textContent = formatCurrency(totalHoldings);
    document.getElementById("liabilities-total").textContent =
      formatCurrency(totalLiabilities);
    document.getElementById("holdings-networth").textContent = formatCurrency(
      totalHoldings - totalLiabilities
    );

    // Remove old listeners and add new ones
    const newHoldingsBody = holdingsBody.cloneNode(true);
    holdingsBody.parentNode.replaceChild(newHoldingsBody, holdingsBody);
    
    const newLiabilitiesBody = liabilitiesBody.cloneNode(true);
    liabilitiesBody.parentNode.replaceChild(newLiabilitiesBody, liabilitiesBody);
    
    // Add fresh event listeners
    document.getElementById("holdings-body").addEventListener(
      "click",
      (e) => handleHoldingsTableClick(e, holdings)
    );
    document.getElementById("liabilities-body").addEventListener(
      "click",
      (e) => handleLiabilitiesTableClick(e, liabilities)
    );
  } catch (err) {
    console.error("Error loading holdings/liabilities:", err);
  }
}

function hookHoldingForms() {
  // Removed reset button listeners - no longer used in modal design

  document
    .getElementById("holding-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById("holding-error");
      errorEl.style.display = "none";
      errorEl.textContent = "";
      try {
        const id = document.getElementById("holding-id").value;
        const name = document.getElementById("holding-name").value.trim();
        const type = document.getElementById("holding-type").value;
        const value = document.getElementById("holding-value").value;

        // Validation
        if (!name) {
          throw new Error("Asset name is required.");
        }
        if (!type) {
          throw new Error("Asset type is required.");
        }
        if (!value || isNaN(parseFloat(value))) {
          throw new Error("Asset value must be a valid number.");
        }

        const payload = {
          name,
          type,
          value: parseFloat(value),
        };

        const method = id ? "PUT" : "POST";
        const url = id ? `/api/holdings/assets/${id}` : "/api/holdings/assets";
        
        console.log("Submitting asset form:", { method, url, payload });
        const response = await apiRequest(url, { method, body: JSON.stringify(payload) });
        console.log("Asset response:", response);
        
        resetHoldingForm();
        document.getElementById("holding-form").style.display = "none";
        await refreshHoldingsAndLiabilities();
        
        // Notify other pages
        localStorage.setItem('holdingsUpdated', new Date().toISOString());
        window.dispatchEvent(new CustomEvent('holdingsChanged'));
      } catch (err) {
        console.error("Error saving holding:", err);
        errorEl.textContent = err.message || "Failed to save holding.";
        errorEl.style.display = "block";
      }
    });

  document
    .getElementById("liability-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById("liability-error");
      errorEl.style.display = "none";
      errorEl.textContent = "";
      try {
        const id = document.getElementById("liability-id").value;
        const name = document.getElementById("liability-name").value.trim();
        const type = document.getElementById("liability-type").value;
        const value = document.getElementById("liability-value").value;

        // Validation
        if (!name) {
          throw new Error("Liability name is required.");
        }
        if (!type) {
          throw new Error("Liability type is required.");
        }
        if (!value || isNaN(parseFloat(value))) {
          throw new Error("Liability value must be a valid number.");
        }

        const payload = {
          name,
          type,
          value: parseFloat(value),
        };

        const method = id ? "PUT" : "POST";
        const url = id ? `/api/holdings/liabilities/${id}` : "/api/holdings/liabilities";
        
        console.log("Submitting liability form:", { method, url, payload });
        const response = await apiRequest(url, { method, body: JSON.stringify(payload) });
        console.log("Liability response:", response);
        
        resetLiabilityForm();
        document.getElementById("liability-form").style.display = "none";
        await refreshHoldingsAndLiabilities();
        
        // Notify other pages
        localStorage.setItem('holdingsUpdated', new Date().toISOString());
        window.dispatchEvent(new CustomEvent('holdingsChanged'));
      } catch (err) {
        console.error("Error saving liability:", err);
        errorEl.textContent = err.message || "Failed to save liability.";
        errorEl.style.display = "block";
      }
    });
}

function handleHoldingsTableClick(e, holdings) {
  const editId = e.target.getAttribute("data-edit-holding");
  const delId = e.target.getAttribute("data-del-holding");
  if (editId) {
    const holding = holdings.find((h) => h.id === Number(editId));
    if (holding) {
      document.getElementById("holding-id").value = holding.id;
      document.getElementById("holding-name").value = holding.name;
      document.getElementById("holding-type").value = holding.type;
      document.getElementById("holding-value").value = holding.value;
      
      // Update form header to "Edit Asset"
      const formHeader = document.querySelector('#holding-form .form-header h3');
      formHeader.textContent = 'Edit Asset';
      
      // Update submit button to "Update Asset"
      const submitBtn = document.querySelector('#holding-form button[type="submit"]');
      submitBtn.textContent = 'Update Asset';
      
      // Show the form
      document.getElementById("holding-form").style.display = "block";
    }
  } else if (delId) {
    if (!confirm("Delete this holding?")) return;
    apiRequest("/api/holdings/assets/" + delId, { method: "DELETE" })
      .then(() => {
        refreshHoldingsAndLiabilities();
        // Notify other pages
        localStorage.setItem('holdingsUpdated', new Date().toISOString());
        window.dispatchEvent(new CustomEvent('holdingsChanged'));
      })
      .catch(console.error);
  }
}

function handleLiabilitiesTableClick(e, liabilities) {
  const editId = e.target.getAttribute("data-edit-liability");
  const delId = e.target.getAttribute("data-del-liability");
  if (editId) {
    const liability = liabilities.find((l) => l.id === Number(editId));
    if (liability) {
      document.getElementById("liability-id").value = liability.id;
      document.getElementById("liability-name").value = liability.name;
      document.getElementById("liability-type").value = liability.type;
      document.getElementById("liability-value").value = liability.value;
      
      // Update form header to "Edit Liability"
      const formHeader = document.querySelector('#liability-form .form-header h3');
      formHeader.textContent = 'Edit Liability';
      
      // Update submit button to "Update Liability"
      const submitBtn = document.querySelector('#liability-form button[type="submit"]');
      submitBtn.textContent = 'Update Liability';
      
      // Show the form
      document.getElementById("liability-form").style.display = "block";
    }
  } else if (delId) {
    if (!confirm("Delete this liability?")) return;
    apiRequest("/api/holdings/liabilities/" + delId, { method: "DELETE" })
      .then(() => {
        refreshHoldingsAndLiabilities();
        // Notify other pages
        localStorage.setItem('holdingsUpdated', new Date().toISOString());
        window.dispatchEvent(new CustomEvent('holdingsChanged'));
      })
      .catch(console.error);
  }
}

function resetHoldingForm() {
  document.getElementById("holding-id").value = "";
  document.getElementById("holding-name").value = "";
  document.getElementById("holding-type").value = "BANK";
  document.getElementById("holding-value").value = "";
  
  // Reset form header back to "Add New Asset"
  const formHeader = document.querySelector('#holding-form .form-header h3');
  formHeader.textContent = 'Add New Asset';
  
  // Reset submit button back to "Add Asset"
  const submitBtn = document.querySelector('#holding-form button[type="submit"]');
  submitBtn.textContent = 'Add Asset';
}

function resetLiabilityForm() {
  document.getElementById("liability-id").value = "";
  document.getElementById("liability-name").value = "";
  document.getElementById("liability-type").value = "LOAN";
  document.getElementById("liability-value").value = "";
  
  // Reset form header back to "Add New Liability"
  const formHeader = document.querySelector('#liability-form .form-header h3');
  formHeader.textContent = 'Add New Liability';
  
  // Reset submit button back to "Add Liability"
  const submitBtn = document.querySelector('#liability-form button[type="submit"]');
  submitBtn.textContent = 'Add Liability';
}

function formatCurrency(x) {
  const n = Number(x || 0);
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn-primary');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');

      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabContents.forEach((content) => content.classList.remove('active'));

      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');

      // Update the "Add New" button text
      const addNewBtn = document.getElementById('add-new-btn');
      if (tabName === 'assets') {
        addNewBtn.textContent = '+ Add New Asset';
      } else {
        addNewBtn.textContent = '+ Add New Liability';
      }

      // Hide forms when switching tabs
      document.getElementById('holding-form').style.display = 'none';
      document.getElementById('liability-form').style.display = 'none';
    });
  });
}

function initFormToggle() {
  const addNewBtn = document.getElementById('add-new-btn');
  const holdingForm = document.getElementById('holding-form');
  const liabilityForm = document.getElementById('liability-form');
  const assetsTab = document.getElementById('assets-tab-btn');

  // Show form on "Add New" button click
  addNewBtn.addEventListener('click', () => {
    if (assetsTab.classList.contains('active')) {
      holdingForm.style.display = 'block';
      resetHoldingForm();
    } else {
      liabilityForm.style.display = 'block';
      resetLiabilityForm();
    }
  });

  // Helper function to close a form
  const closeForm = (form) => {
    form.style.display = 'none';
  };

  // Set up close buttons for Assets form
  const holdingFormHeader = holdingForm.querySelector('.form-header');
  holdingFormHeader.querySelector('.form-close-btn').addEventListener('click', (e) => {
    e.preventDefault();
    closeForm(holdingForm);
  });

  document.getElementById('holding-cancel-btn').addEventListener('click', (e) => {
    e.preventDefault();
    closeForm(holdingForm);
  });

  // Set up close buttons for Liabilities form
  const liabilityFormHeader = liabilityForm.querySelector('.form-header');
  liabilityFormHeader.querySelector('.form-close-btn').addEventListener('click', (e) => {
    e.preventDefault();
    closeForm(liabilityForm);
  });

  document.getElementById('liability-cancel-btn').addEventListener('click', (e) => {
    e.preventDefault();
    closeForm(liabilityForm);
  });

  // Close form when clicking on overlay background
  holdingForm.addEventListener('click', (e) => {
    if (e.target.classList.contains('form-overlay')) {
      closeForm(holdingForm);
    }
  });

  liabilityForm.addEventListener('click', (e) => {
    if (e.target.classList.contains('form-overlay')) {
      closeForm(liabilityForm);
    }
  });
}


