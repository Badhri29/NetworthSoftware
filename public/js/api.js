async function apiRequest(path, options = {}) {
  const res = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (res.status === 401) {
    // Not authenticated, go to login
    if (!location.pathname.endsWith("/index.html")) {
      window.location.href = "/index.html";
    }
    throw new Error("Unauthorized");
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data && data.error ? data.error : "Request failed";
    throw new Error(message);
  }

  return data;
}

async function getCurrentUser() {
  const data = await apiRequest("/api/auth/me");
  return data.user;
}


