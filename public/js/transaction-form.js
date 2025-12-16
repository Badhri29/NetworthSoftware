/**
 * Transaction Form Handling
 * Handles all form interactions including validation, submission, and dynamic behavior
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transaction-form');
    if (!form) return;

    // Form elements
    const transactionType = document.getElementById('transaction-type');
    const categorySelect = document.getElementById('transaction-category');
    const subcategorySelect = document.getElementById('transaction-subcategory');
    const detailsTextarea = document.getElementById('transaction-details');
    const charCount = document.getElementById('char-count');
    const paymentMode = document.getElementById('payment-mode');
    const cardSelectionGroup = document.getElementById('card-selection-group');
    const clearButton = document.getElementById('clear-form');
    const dateInput = document.getElementById('transaction-date');
    const amountInput = document.getElementById('transaction-amount');

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today; // Prevent future dates

    // Subcategory options mapping
    const subcategories = {
        food: ['Groceries', 'Dining Out', 'Snacks', 'Beverages'],
        travel: ['Airfare', 'Accommodation', 'Local Transport', 'Fuel'],
        rent: ['House Rent', 'Office Rent', 'Storage'],
        utilities: ['Electricity', 'Water', 'Internet', 'Mobile', 'Cable TV'],
        salary: ['Monthly Salary', 'Bonus', 'Commission'],
        investment: ['Stocks', 'Mutual Funds', 'Fixed Deposit', 'Crypto']
    };

    // Update character count for details textarea
    detailsTextarea.addEventListener('input', (e) => {
        const count = e.target.value.length;
        charCount.textContent = count;
    });

    // Handle category change to update subcategories
    categorySelect.addEventListener('change', (e) => {
        const category = e.target.value;
        updateSubcategories(category);
    });

    // Handle payment mode change to show/hide card selection
    paymentMode.addEventListener('change', (e) => {
        cardSelectionGroup.style.display = e.target.value === 'credit' ? 'block' : 'none';
    });

    // Clear form
    clearButton.addEventListener('click', resetForm);

    // Form submission
    form.addEventListener('submit', handleSubmit);

    // Prevent non-numeric input in amount field
    amountInput.addEventListener('keypress', (e) => {
        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
            e.preventDefault();
        }
    });

    // Format amount on blur
    amountInput.addEventListener('blur', (e) => {
        if (e.target.value) {
            e.target.value = parseFloat(e.target.value).toFixed(2);
        }
    });

    /**
     * Update subcategories based on selected category
     * @param {string} category - The selected category
     */
    function updateSubcategories(category) {
        // Clear existing options except the first one
        subcategorySelect.innerHTML = '<option value="">Select Sub-Category</option>';
        
        if (category && subcategories[category]) {
            // Enable and populate subcategories
            subcategorySelect.disabled = false;
            subcategories[category].forEach(subcategory => {
                const option = document.createElement('option');
                option.value = subcategory.toLowerCase().replace(/\s+/g, '-');
                option.textContent = subcategory;
                subcategorySelect.appendChild(option);
            });
            // Force a reflow to ensure styles are updated
            subcategorySelect.style.display = 'none';
            subcategorySelect.offsetHeight; // Trigger reflow
            subcategorySelect.style.display = '';
        } else {
            // Disable if no category selected or no subcategories
            subcategorySelect.disabled = true;
        }
    }

    /**
     * Reset the form to its initial state
     */
    function resetForm() {
        form.reset();
        dateInput.value = today; // Reset to today's date
        subcategorySelect.disabled = true;
        subcategorySelect.innerHTML = '<option value="">Select Sub-Category</option>';
        cardSelectionGroup.style.display = 'none';
        charCount.textContent = '0';
        
        // Clear error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        
        // Clear any error classes
        document.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
    }

    /**
     * Validate form fields
     * @returns {boolean} - True if form is valid, false otherwise
     */
    function validateForm() {
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        document.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });

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
        if (!amountInput.value || parseFloat(amountInput.value) <= 0) {
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

    // Modal elements
    const modal = document.getElementById('confirmationModal');
    const transactionDetails = document.getElementById('transactionDetails');
    const confirmBtn = document.getElementById('confirmSubmit');
    const cancelBtn = document.getElementById('cancelSubmit');
    
    let formData = null;

    // Show modal with transaction details
    function showConfirmationModal(data) {
        // Format the transaction details for display
        const formattedDate = new Date(data.date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const formattedAmount = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(data.amount);

        // Create the details HTML
        transactionDetails.innerHTML = `
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Type:</strong> ${data.type.charAt(0).toUpperCase() + data.type.slice(1)}</p>
            ${data.category ? `<p><strong>Category:</strong> ${data.category.charAt(0).toUpperCase() + data.category.slice(1)}</p>` : ''}
            ${data.subcategory ? `<p><strong>Subcategory:</strong> ${data.subcategory.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>` : ''}
            ${data.details ? `<p><strong>Details:</strong> ${data.details}</p>` : ''}
            <p><strong>Amount:</strong> <span class="${data.type === 'income' ? 'income' : 'expense'}">${formattedAmount}</span></p>
            <p><strong>Payment Mode:</strong> ${data.paymentMode.charAt(0).toUpperCase() + data.paymentMode.slice(1)}</p>
            ${data.card ? `<p><strong>Card:</strong> ${data.card.charAt(0).toUpperCase() + data.card.slice(1)}</p>` : ''}
        `;
        
        // Show the modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    // Hide modal
    function hideConfirmationModal() {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Re-enable scrolling
    }

    // Handle form submission
    function handleSubmit(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Prepare form data
        formData = {
            date: dateInput.value,
            type: transactionType.value,
            category: categorySelect.value || null,
            subcategory: subcategorySelect.value || null,
            details: detailsTextarea.value || null,
            amount: parseFloat(amountInput.value).toFixed(2),
            paymentMode: paymentMode.value,
            card: paymentMode.value === 'credit' ? document.getElementById('card-selection').value : null,
            timestamp: new Date().toISOString()
        };

        // Show confirmation modal instead of submitting directly
        showConfirmationModal(formData);
    }

    // Confirm submission
    async function confirmSubmission() {
        if (!formData) return;
        
        try {
            // Show loading state
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
            
            // Close the modal immediately
            hideConfirmationModal();
            
            // Send the data to the server
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify({
                    date: formData.date,
                    type: formData.type,
                    category: formData.category,
                    subcategory: formData.subcategory,
                    details: formData.details,
                    amount: parseFloat(formData.amount),
                    paymentMode: formData.paymentMode,
                    card: formData.card
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add transaction');
            }
            
            // Show success message
            showNotification('Transaction added successfully!', 'success');
            
            // Reset form
            resetForm();
            
            // Switch to Get Transactions tab and refresh the table
            const getTransactionsTab = document.querySelector('button[data-bs-target="#getTransactions"]');
            if (getTransactionsTab) {
                // Activate the tab
                const tab = new bootstrap.Tab(getTransactionsTab);
                tab.show();
                
                // Refresh the transactions table after a short delay
                setTimeout(() => {
                    if (window.refreshTransactionsTable) {
                        window.refreshTransactionsTable();
                    }
                }, 300);
            }
            
        } catch (error) {
            console.error('Error submitting transaction:', error);
            showNotification(error.message || 'Failed to add transaction. Please try again.', 'error');
        } finally {
            // Reset button state
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Confirm';
            }
        }
    }

    // Event listeners for modal buttons
    confirmBtn.addEventListener('click', confirmSubmission);
    cancelBtn.addEventListener('click', hideConfirmationModal);
    
    // Close modal when clicking outside the content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideConfirmationModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            hideConfirmationModal();
        }
    });

    // Global function to refresh transactions table
    window.refreshTransactionsTable = async function() {
        try {
            const response = await fetch('/api/transactions', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }
            
            const transactions = await response.json();
            const tbody = document.querySelector('#transactionsTable tbody');
            
            if (!tbody) {
                console.log('Transactions table not found');
                return;
            }
            
            // Clear existing rows
            tbody.innerHTML = '';
            
            if (!transactions || transactions.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="9" class="text-center">No transactions found</td>';
                tbody.appendChild(row);
                return;
            }
            
            // Add each transaction to the table
            transactions.forEach(transaction => {
                const row = document.createElement('tr');
                
                // Format date
                const date = new Date(transaction.date);
                const formattedDate = date.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
                
                // Format amount with INR symbol
                const formattedAmount = new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 2
                }).format(transaction.amount);
                
                row.innerHTML = `
                    <td>${transaction.id || ''}</td>
                    <td>${formattedDate}</td>
                    <td>${transaction.type ? transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1) : ''}</td>
                    <td>${transaction.category ? transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1) : ''}</td>
                    <td>${transaction.subcategory ? transaction.subcategory.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ') : ''}</td>
                    <td>${transaction.details || ''}</td>
                    <td class="${transaction.type === 'income' ? 'text-success' : 'text-danger'}">
                        ${formattedAmount}
                    </td>
                    <td>${transaction.paymentMode ? transaction.paymentMode.charAt(0).toUpperCase() + transaction.paymentMode.slice(1) : ''}</td>
                    <td>${transaction.card ? transaction.card.charAt(0).toUpperCase() + transaction.card.slice(1) : ''}</td>
                `;
                
                tbody.appendChild(row);
            });
            
        } catch (error) {
            console.error('Error refreshing transactions:', error);
            const tbody = document.querySelector('#transactionsTable tbody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9" class="text-danger text-center">
                            Error loading transactions: ${error.message}
                        </td>
                    </tr>
                `;
            }
        }
    };
});