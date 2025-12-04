document.addEventListener("DOMContentLoaded", async () => {
  try {
    const user = await getCurrentUser();
    const userEl = document.getElementById("settings-user");
    userEl.textContent = `${user.email} • Member since ${new Date(
      user.createdAt
    ).toLocaleDateString()}`;
    hookPasswordForm();
  } catch (err) {
    console.error(err);
  }
});

function hookPasswordForm() {
  const form = document.getElementById("password-form");
  const msgEl = document.getElementById("pwd-message");
  const errEl = document.getElementById("pwd-error");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgEl.style.display = "none";
    errEl.style.display = "none";
    msgEl.textContent = "";
    errEl.textContent = "";
    try {
      const current = document.getElementById("pwd-current").value;
      const next = document.getElementById("pwd-new").value;
      if (!current || !next) {
        throw new Error("Both fields are required.");
      }
      await apiRequest("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      msgEl.textContent = "Password updated.";
      msgEl.style.display = "block";
      form.reset();
    } catch (err) {
      errEl.textContent = err.message || "Failed to update password.";
      errEl.style.display = "block";
    }
  });
}


