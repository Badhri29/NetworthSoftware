const authState = {
  mode: "login",
};

function setAuthMode(mode) {
  authState.mode = mode;

  document.getElementById("auth-title").textContent =
    mode === "login" ? "Welcome back" : "Create your account";

  document.getElementById("auth-submit").textContent =
    mode === "login" ? "Sign in" : "Sign up";

  const switchText = document.getElementById("auth-switch-text");
  if (switchText) {
    switchText.textContent =
      mode === "login" ? "New here?" : "Already have an account?";
  }

  const errEl = document.getElementById("auth-error");
  errEl.textContent = "";
  errEl.style.display = "none";
}

async function handleAuthSubmit(e) {
  e.preventDefault();

  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  const errorEl = document.getElementById("auth-error");

  errorEl.textContent = "";
  errorEl.style.display = "none";

  if (!email || !password) {
    errorEl.textContent = "Email and password are required.";
    errorEl.style.display = "block";
    return;
  }

  try {
    const path =
      authState.mode === "login"
        ? "/api/auth/login"
        : "/api/auth/register";

    await apiRequest(path, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // ✅ CORRECT PAGE
    window.location.href = "/transactions.html";
  } catch (err) {
    errorEl.textContent = err.message || "Authentication failed.";
    errorEl.style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("auth-form")
    .addEventListener("submit", handleAuthSubmit);

  document
    .getElementById("auth-switch-btn")
    .addEventListener("click", () => {
      setAuthMode(authState.mode === "login" ? "register" : "login");
    });

  setAuthMode("login");
});
