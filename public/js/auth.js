const authState = {
  mode: "login",
};

function setAuthMode(mode) {
  authState.mode = mode;
  const title = document.getElementById("auth-title");
  const submitBtn = document.getElementById("auth-submit");
  const switchText = document.getElementById("auth-switch-text");
  if (mode === "login") {
    title.textContent = "Welcome back";
    submitBtn.textContent = "Sign in";
    if (switchText) switchText.textContent = "New here?";
  } else {
    title.textContent = "Create your account";
    submitBtn.textContent = "Sign up";
    if (switchText) switchText.textContent = "Already have an account?";
  }
  const errEl = document.getElementById("auth-error");
  if (errEl) {
    errEl.textContent = "";
    errEl.style.display = "none";
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  const errorEl = document.getElementById("auth-error");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.style.display = "none";
  }

  if (!email || !password) {
    if (errorEl) {
      errorEl.textContent = "Email and password are required.";
      errorEl.style.display = "block";
    }
    return;
  }

  try {
    const path =
      authState.mode === "login" ? "/api/auth/login" : "/api/auth/register";
    await apiRequest(path, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    window.location.href = "/dashboard.html";
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = err.message || "Authentication failed.";
      errorEl.style.display = "block";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("auth-form");
  if (form) {
    form.addEventListener("submit", handleAuthSubmit);
  }
  const switchBtn = document.getElementById("auth-switch-btn");
  if (switchBtn) {
    switchBtn.addEventListener("click", () => {
      setAuthMode(authState.mode === "login" ? "register" : "login");
    });
  }
  setAuthMode("login");
});


