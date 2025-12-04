document.addEventListener("DOMContentLoaded", async () => {
  try {
    await getCurrentUser();
    hookAssetForms();
    await refreshAssetsAndLiabilities();
  } catch (err) {
    console.error(err);
  }
});

async function refreshAssetsAndLiabilities() {
  const [assetsRes, liabilitiesRes] = await Promise.all([
    apiRequest("/api/assets"),
    apiRequest("/api/liabilities"),
  ]);
  const assets = assetsRes.assets || [];
  const liabilities = liabilitiesRes.liabilities || [];

  const assetsBody = document.getElementById("assets-body");
  const liabilitiesBody = document.getElementById("liabilities-body");
  assetsBody.innerHTML = "";
  liabilitiesBody.innerHTML = "";

  let totalAssets = 0;
  let totalLiabilities = 0;

  assets.forEach((a) => {
    totalAssets += Number(a.value);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${a.name}</td>
      <td>${a.type}</td>
      <td>${Number(a.value).toFixed(2)}</td>
      <td style="text-align:right">
        <button class="btn btn-outline btn-xs" data-edit-asset="${a.id}">Edit</button>
        <button class="btn btn-outline btn-xs" data-del-asset="${a.id}">✕</button>
      </td>
    `;
    assetsBody.appendChild(tr);
  });

  liabilities.forEach((l) => {
    totalLiabilities += Number(l.value);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${l.name}</td>
      <td>${l.type}</td>
      <td>${Number(l.value).toFixed(2)}</td>
      <td style="text-align:right">
        <button class="btn btn-outline btn-xs" data-edit-liability="${l.id}">Edit</button>
        <button class="btn btn-outline btn-xs" data-del-liability="${l.id}">✕</button>
      </td>
    `;
    liabilitiesBody.appendChild(tr);
  });

  document.getElementById("assets-total").textContent = formatCurrency(totalAssets);
  document.getElementById("liabilities-total").textContent =
    formatCurrency(totalLiabilities);
  document.getElementById("assets-networth").textContent = formatCurrency(
    totalAssets - totalLiabilities
  );

  assetsBody.addEventListener(
    "click",
    (e) => handleAssetsTableClick(e, assets),
    { once: true }
  );
  liabilitiesBody.addEventListener(
    "click",
    (e) => handleLiabilitiesTableClick(e, liabilities),
    { once: true }
  );
}

function hookAssetForms() {
  document
    .getElementById("asset-reset-btn")
    .addEventListener("click", () => resetAssetForm());
  document
    .getElementById("liability-reset-btn")
    .addEventListener("click", () => resetLiabilityForm());

  document
    .getElementById("asset-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById("asset-error");
      errorEl.style.display = "none";
      errorEl.textContent = "";
      try {
        const id = document.getElementById("asset-id").value;
        const payload = {
          name: document.getElementById("asset-name").value.trim(),
          type: document.getElementById("asset-type").value,
          value: parseFloat(document.getElementById("asset-value").value),
        };
        if (!payload.name || isNaN(payload.value)) {
          throw new Error("Name and value are required.");
        }
        const method = id ? "PUT" : "POST";
        const url = id ? "/api/assets/" + id : "/api/assets";
        await apiRequest(url, { method, body: JSON.stringify(payload) });
        resetAssetForm();
        await refreshAssetsAndLiabilities();
      } catch (err) {
        errorEl.textContent = err.message || "Failed to save asset.";
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
        const payload = {
          name: document.getElementById("liability-name").value.trim(),
          type: document.getElementById("liability-type").value,
          value: parseFloat(document.getElementById("liability-value").value),
        };
        if (!payload.name || isNaN(payload.value)) {
          throw new Error("Name and value are required.");
        }
        const method = id ? "PUT" : "POST";
        const url = id ? "/api/liabilities/" + id : "/api/liabilities";
        await apiRequest(url, { method, body: JSON.stringify(payload) });
        resetLiabilityForm();
        await refreshAssetsAndLiabilities();
      } catch (err) {
        errorEl.textContent = err.message || "Failed to save liability.";
        errorEl.style.display = "block";
      }
    });
}

function handleAssetsTableClick(e, assets) {
  const editId = e.target.getAttribute("data-edit-asset");
  const delId = e.target.getAttribute("data-del-asset");
  if (editId) {
    const asset = assets.find((a) => a.id === Number(editId));
    if (asset) {
      document.getElementById("asset-id").value = asset.id;
      document.getElementById("asset-name").value = asset.name;
      document.getElementById("asset-type").value = asset.type;
      document.getElementById("asset-value").value = asset.value;
    }
  } else if (delId) {
    if (!confirm("Delete this asset?")) return;
    apiRequest("/api/assets/" + delId, { method: "DELETE" })
      .then(() => refreshAssetsAndLiabilities())
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
    }
  } else if (delId) {
    if (!confirm("Delete this liability?")) return;
    apiRequest("/api/liabilities/" + delId, { method: "DELETE" })
      .then(() => refreshAssetsAndLiabilities())
      .catch(console.error);
  }
}

function resetAssetForm() {
  document.getElementById("asset-id").value = "";
  document.getElementById("asset-name").value = "";
  document.getElementById("asset-type").value = "BANK";
  document.getElementById("asset-value").value = "";
}

function resetLiabilityForm() {
  document.getElementById("liability-id").value = "";
  document.getElementById("liability-name").value = "";
  document.getElementById("liability-type").value = "LOAN";
  document.getElementById("liability-value").value = "";
}

function formatCurrency(x) {
  const n = Number(x || 0);
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}


