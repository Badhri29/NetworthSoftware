/* =====================================================
   GLOBAL STATE
===================================================== */

let categoryList;
let subCategoryList;
let subCategoryInput;
let typeButtons;
let section;
let currentType = "income";

/* =====================================================
   CATEGORY DATA (STATIC)
===================================================== */

const categories = {
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

  expense: {
    "Food & Dining": [
      "Groceries", "Vegetables & Fruits", "Milk & Essentials",
      "Restaurant / Hotel", "Snacks & Beverages", "Online Food Orders"
    ],
    "Housing & Utilities": [
      "House Rent", "Electricity Bill", "Water Bill", "Gas",
      "Internet Bill", "Mobile Recharge", "Maintenance"
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
      "EPF Contribution", "PPF Contribution",
      "NPS Contribution", "Pension Fund"
    ],
    "Gold & Physical Assets": [
      "Gold Savings Scheme", "Gold Coin / Bar",
      "Jewellery Investment", "Silver Investment"
    ],
    "Insurance Savings": [
      "Life Insurance Premium", "Term Insurance Savings", "ULIP Investment"
    ],
    "Goal-Based Savings": [
      "House Fund", "Education Fund",
      "Marriage Fund", "Travel Fund", "Vehicle Fund"
    ],
    "Digital & Alternate Savings": [
      "Wallet Balance Saved", "Crypto Investment", "Other Digital Assets"
    ]
  }
};

/* =====================================================
   RENDER FUNCTIONS (OUTSIDE DOM)
===================================================== */

function renderCategories(type) {
  categoryList.innerHTML = "";
  subCategoryList.innerHTML = "Select a category first";
  subCategoryInput.disabled = true;

  Object.keys(categories[type]).forEach((cat, index) => {
    const div = document.createElement("div");
    div.className = "cat-item";
    div.innerHTML = `
  <span>${index + 1}. ${cat}</span>
  <button class="cat-delete-btn" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 6h18"></path>
  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  <line x1="10" y1="11" x2="10" y2="17"></line>
  <line x1="14" y1="11" x2="14" y2="17"></line>
</svg>
</button>
`;


    div.addEventListener("click", () => {
      categoryList.querySelectorAll(".cat-item")
        .forEach(i => i.classList.remove("active"));

      div.classList.add("active");
      renderSubCategories(type, cat);
    });

    categoryList.appendChild(div);
  });
}

function renderSubCategories(type, category) {
  subCategoryList.innerHTML = "";
  subCategoryInput.disabled = false;

  categories[type][category].forEach((sub, index) => {
    const div = document.createElement("div");
    div.className = "cat-item";
    div.innerHTML = `
  <span>${index + 1}. ${sub}</span>
  <button class="cat-delete-btn" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 6h18"></path>
  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  <line x1="10" y1="11" x2="10" y2="17"></line>
  <line x1="14" y1="11" x2="14" y2="17"></line>
</svg>
</button>
`;


    div.addEventListener("click", () => {
      subCategoryList.querySelectorAll(".cat-item")
        .forEach(i => i.classList.remove("active"));
      div.classList.add("active");
    });

    subCategoryList.appendChild(div);
  });
}

/* =====================================================
   INITIALIZATION (DOM ONLY)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  categoryList = document.getElementById("categoryList");
  subCategoryList = document.getElementById("subCategoryList");
  subCategoryInput = document.getElementById("subCategoryInput");
  typeButtons = document.querySelectorAll(".cat-type-btn");
  section = document.querySelector(".edit-categories-section");

  if (!categoryList || !section) return;

  /* DEFAULT STATE */
  section.classList.add("income");
  renderCategories("income");

  /* TYPE TOGGLE */
  typeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;

      typeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      section.classList.remove("income", "expense", "savings");
      section.classList.add(type);

      currentType = type;
      renderCategories(type);
    });
  });

});
