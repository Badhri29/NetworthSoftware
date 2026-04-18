/* Add event listeners BEFORE anything else */
window.addEventListener('transactionsChanged', async () => {
  console.log('Dashboard: Transaction changed event detected, refreshing...');
  await loadSummary();
  await loadMonthlyOverview();
});

window.addEventListener('holdingsChanged', async () => {
  console.log('Dashboard: Holdings changed event detected, refreshing...');
  await loadSummary();
  await loadMonthlyOverview();
});

window.addEventListener('storage', async (e) => {
  if (e.key === 'transactionsUpdated' || e.key === 'holdingsUpdated') {
    console.log('Dashboard: Storage event detected, refreshing...');
    await loadSummary();
    await loadMonthlyOverview();
  }
});

/* Initialize dashboard on load */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await getCurrentUser();
    await loadSummary();
    await loadNetWorthSeries();
    await loadMonthlyOverview();

    // Also check for updates periodically (every 30 seconds)
    setInterval(async () => {
      await loadSummary();
      await loadMonthlyOverview();
    }, 30000);

  } catch (err) {
    console.error(err);
  }
});

async function loadSummary() {
  try {
    const data = await apiRequest("/api/dashboard/summary");
    console.log('Dashboard summary data:', data);
    
    document.getElementById("summary-networth").textContent =
      formatCurrency(data.netWorth);
    document.getElementById("summary-assets").textContent = formatCurrency(
      data.totalAssets
    );
    document.getElementById("summary-liabilities").textContent = formatCurrency(
      data.totalLiabilities
    );


  } catch (err) {
    console.error('Error loading dashboard summary:', err);
  }
}

let netWorthChart;
async function loadNetWorthSeries() {
  try {
    // Check if Chart is available
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded, skipping chart rendering');
      return;
    }

    const data = await apiRequest("/api/dashboard/net-worth-series");
    const ctx = document.getElementById("networth-chart");
    if (!ctx) return;
    
    const labels = data.points.map((p) => p.month);
    const values = data.points.map((p) => p.netWorth);

    if (netWorthChart) netWorthChart.destroy();
    netWorthChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Net worth",
            data: values,
            borderColor: "#38bdf8",
            backgroundColor: "rgba(56, 189, 248, 0.18)",
            tension: 0.35,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            ticks: { color: "#9ca3af" },
            grid: { display: false },
          },
          y: {
            ticks: { color: "#9ca3af" },
            grid: { color: "rgba(31, 41, 55, 0.8)" },
          },
        },
      },
    });
  } catch (err) {
    console.error('Error loading net worth series:', err);
  }
}

let incomeExpenseChart;
async function loadMonthlyOverview() {
  try {
    // Check if Chart is available
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded, skipping chart rendering');
      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const data = await apiRequest(`/api/dashboard/monthly?year=${year}`);
    const labels = data.data.map((m) => m.month.slice(5));
    const income = data.data.map((m) => m.income);
    const expense = data.data.map((m) => m.expense);

    const ctx = document.getElementById("income-expense-chart");
    if (!ctx) return;

    if (incomeExpenseChart) incomeExpenseChart.destroy();
    incomeExpenseChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Income",
            data: income,
            backgroundColor: "#22c55e",
          },
          {
            label: "Expenses",
            data: expense,
            backgroundColor: "#f97316",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "#9ca3af" },
          },
        },
        scales: {
          x: {
            ticks: { color: "#9ca3af" },
            grid: { display: false },
          },
          y: {
            ticks: { color: "#9ca3af" },
            grid: { color: "rgba(31, 41, 55, 0.8)" },
          },
        },
      },
    });
  } catch (err) {
    console.error('Error loading monthly overview:', err);
  }
}

function formatCurrency(x) {
  const n = Number(x || 0);
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}


