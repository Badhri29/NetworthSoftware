document.addEventListener("DOMContentLoaded", async () => {
  try {
    await getCurrentUser();
    await loadSummary();
    await loadNetWorthSeries();
    await loadMonthlyOverview();
  } catch (err) {
    console.error(err);
  }
});

async function loadSummary() {
  const data = await apiRequest("/api/dashboard/summary");
  document.getElementById("summary-networth").textContent =
    formatCurrency(data.netWorth);
  document.getElementById("summary-assets").textContent = formatCurrency(
    data.totalAssets
  );
  document.getElementById("summary-liabilities").textContent = formatCurrency(
    data.totalLiabilities
  );

  const tbody = document.getElementById("recent-transactions-body");
  tbody.innerHTML = "";
  data.recentTransactions.forEach((tx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${new Date(tx.date).toLocaleDateString()}</td>
      <td>${tx.category ? tx.category.name : "-"}</td>
      <td class="${
        tx.type === "INCOME" ? "tag-income" : "tag-expense"
      }">${tx.type}</td>
      <td>${formatCurrency(tx.amount)}</td>
    `;
    tbody.appendChild(tr);
  });
}

let netWorthChart;
async function loadNetWorthSeries() {
  const data = await apiRequest("/api/dashboard/net-worth-series");
  const ctx = document.getElementById("networth-chart").getContext("2d");
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
}

let incomeExpenseChart;
async function loadMonthlyOverview() {
  const now = new Date();
  const year = now.getFullYear();
  const data = await apiRequest(`/api/dashboard/monthly?year=${year}`);
  const labels = data.data.map((m) => m.month.slice(5));
  const income = data.data.map((m) => m.income);
  const expense = data.data.map((m) => m.expense);

  const ctx = document.getElementById("income-expense-chart").getContext("2d");
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
}

function formatCurrency(x) {
  const n = Number(x || 0);
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}


