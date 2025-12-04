let analysisIncomeExpenseChart;
let analysisSavingsChart;
let analysisTopCategoriesChart;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await getCurrentUser();
    initYearSelect();
    await reloadAnalysis();
    document
      .getElementById("analysis-year")
      .addEventListener("change", () => reloadAnalysis());
  } catch (err) {
    console.error(err);
  }
});

function initYearSelect() {
  const select = document.getElementById("analysis-year");
  const current = new Date().getFullYear();
  for (let y = current; y >= current - 5; y--) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    if (y === current) opt.selected = true;
    select.appendChild(opt);
  }
}

async function reloadAnalysis() {
  const year = document.getElementById("analysis-year").value;
  const monthly = await apiRequest(`/api/dashboard/monthly?year=${year}`);
  const labels = monthly.data.map((m) => m.month.slice(5));
  const income = monthly.data.map((m) => m.income);
  const expense = monthly.data.map((m) => m.expense);
  const savings = monthly.data.map((m) => m.savings);

  const ctx1 = document
    .getElementById("analysis-income-expense")
    .getContext("2d");
  if (analysisIncomeExpenseChart) analysisIncomeExpenseChart.destroy();
  analysisIncomeExpenseChart = new Chart(ctx1, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Income", data: income, backgroundColor: "#22c55e" },
        { label: "Expenses", data: expense, backgroundColor: "#f97316" },
      ],
    },
    options: baseChartOptions(),
  });

  const ctx2 = document.getElementById("analysis-savings").getContext("2d");
  if (analysisSavingsChart) analysisSavingsChart.destroy();
  analysisSavingsChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Savings",
          data: savings,
          borderColor: "#38bdf8",
          backgroundColor: "rgba(56, 189, 248, 0.18)",
          tension: 0.35,
          fill: true,
        },
      ],
    },
    options: baseChartOptions(true),
  });

  const top = await apiRequest("/api/dashboard/top-categories?limit=5");
  const ctx3 = document
    .getElementById("analysis-top-categories")
    .getContext("2d");
  if (analysisTopCategoriesChart) analysisTopCategoriesChart.destroy();
  analysisTopCategoriesChart = new Chart(ctx3, {
    type: "doughnut",
    data: {
      labels: top.categories.map((c) => c.name),
      datasets: [
        {
          data: top.categories.map((c) => c.total),
          backgroundColor: [
            "#38bdf8",
            "#22c55e",
            "#f97316",
            "#a855f7",
            "#f97373",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#9ca3af" },
        },
      },
    },
  });
}

function baseChartOptions(hideLegend) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: !hideLegend, labels: { color: "#9ca3af" } },
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
  };
}


