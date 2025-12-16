/**
 * Transactions Table Handling
 * Handles fetching and displaying transactions in the transactions table
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the transactions table when the page loads
    if (document.querySelector('.get-transection-content')) {
        initTransactionsTable();
        window.refreshTransactionsTable = loadTransactions; // Make it globally available
    }
});

/**
 * Initialize the transactions table
 */
function initTransactionsTable() {
    // Add event listeners for filter toggles
    const filterToggle = document.getElementById('filter-toggle');
    if (filterToggle) {
        filterToggle.addEventListener('click', () => {
            const filterSection = document.querySelector('.filter-section');
            if (filterSection) {
                filterSection.style.display = 
                    filterSection.style.display === 'none' ? 'block' : 'none';
            }
        });
    }

    // Add event listeners for view toggles
    const viewToggles = document.querySelectorAll('.view-toggle .toggle-btn');
    viewToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            const view = e.target.dataset.view;
            document.querySelectorAll('.view-toggle .toggle-btn').forEach(btn => {
                btn.classList.toggle('active', btn === e.target);
            });

            // Show/hide the appropriate content sections
            if (view === 'transactions') {
                document.querySelector('.add-transection-content').style.display = 'block';
                document.querySelector('.get-transection-content').style.display = 'none';
            } else {
                document.querySelector('.add-transection-content').style.display = 'none';
                document.querySelector('.get-transection-content').style.display = 'block';
                loadTransactions();
            }
        });
    });

    // Initial load of transactions
    loadTransactions();
}

/**
 * Load transactions from the API and populate the table
 */
async function loadTransactions() {
    const tableBody = document.getElementById('transactions-table-body');
    if (!tableBody) return;

    // Show loading state
    tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Loading transactions...</td></tr>';

    try {
        const response = await fetch('/api/transactions', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load transactions');
        }

        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No transactions found</td></tr>';
            return;
        }

        // Clear the table
        tableBody.innerHTML = '';

        // Format and add transactions to the table
        data.items.forEach((txn, index) => {
            const row = document.createElement('tr');
            row.className = `transaction-${txn.type.toLowerCase()}`;
            
            // Format date
            const date = new Date(txn.date);
            const formattedDate = date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Format amount
            const formattedAmount = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2
            }).format(txn.amount);

            // Create row HTML
            row.innerHTML = `
                <td data-label="ID">${txn.id || index + 1}</td>
                <td data-label="Date">${formattedDate}</td>
                <td data-label="Type">${txn.type.charAt(0).toUpperCase() + txn.type.slice(1).toLowerCase()}</td>
                <td data-label="Category">${txn.category ? txn.category.name : 'N/A'}</td>
                <td data-label="Subcategory">${txn.subcategory ? txn.subcategory.name : 'N/A'}</td>
                <td data-label="Details">${txn.description || 'N/A'}</td>
                <td data-label="Amount" class="amount ${txn.type.toLowerCase()}">${formattedAmount}</td>
                <td data-label="Actions">
                    <button class="action-btn edit" data-id="${txn.id}">✏️</button>
                    <button class="action-btn delete" data-id="${txn.id}">🗑️</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });

        // Add event listeners for action buttons
        tableBody.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                editTransaction(id);
            });
        });

        tableBody.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                deleteTransaction(id);
            });
        });

    } catch (error) {
        console.error('Error loading transactions:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center error">
                    Failed to load transactions. Please try again later.
                </td>
            </tr>`;
    }
}

/**
 * Edit a transaction
 * @param {string} id - The transaction ID
 */
async function editTransaction(id) {
    // Implementation for editing a transaction
    console.log('Edit transaction:', id);
    // You would typically show a modal with the transaction details for editing
}

/**
 * Delete a transaction
 * @param {string} id - The transaction ID
 */
async function deleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }

    try {
        const response = await fetch(`/api/transactions/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete transaction');
        }

        // Show success message
        showNotification('Transaction deleted successfully', 'success');
        
        // Refresh the transactions table
        loadTransactions();
    } catch (error) {
        console.error('Error deleting transaction:', error);
        showNotification('Failed to delete transaction', 'error');
    }
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Check if notification container exists, if not create it
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '1000';
        document.body.appendChild(container);
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to container and set timeout to remove
    container.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }, 100);
}
