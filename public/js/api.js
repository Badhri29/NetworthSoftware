async function apiRequest(path, options = {}) {
  const res = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  // Handle auth failure
  if (res.status === 401) {
    if (!location.pathname.endsWith("/index.html")) {
      window.location.href = "/index.html";
    }
    throw new Error("Unauthorized");
  }

  let data = null;

  try {
    data = await res.json();
  } catch (e) {
    // 🔥 IMPORTANT: backend succeeded but returned no JSON
    if (res.ok) return null;
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || "Request failed");
  }

  return data;
}

async function getCurrentUser() {
  const data = await apiRequest("/api/auth/me");
  return data.user;
}

window.apiRequest = apiRequest;
