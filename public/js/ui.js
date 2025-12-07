function setActiveNav(pathname) {
  const links = document.querySelectorAll("[data-nav-link]");
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    if (pathname.endsWith(href) || (href === "/dashboard.html" && pathname === "/")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

const DEFAULT_AVATAR_DATAURL = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect fill='%230e1720' width='100%' height='100%'/><g fill='%23ffffff' opacity='0.9'><circle cx='60' cy='40' r='24'/><path d='M30 94c0-17 26-26 30-26s30 9 30 26v6H30v-6z'/></g></svg>";

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav(location.pathname);
  // Try to load current user and set avatar in any `#user-avatar` element
  if (typeof getCurrentUser === "function") {
    getCurrentUser().then((u) => {
      if (!u) return;
      // sidebar avatar(s): always display an image; use user.photo or default
      const avatars = document.querySelectorAll("#user-avatar");
      avatars.forEach((el) => {
        el.src = u.photo || DEFAULT_AVATAR_DATAURL;
        el.style.display = "block";
      });

      // header avatar and username
      const headerAvatar = document.getElementById("header-avatar");
      const headerName = document.getElementById("header-username");
      if (headerAvatar) {
        headerAvatar.src = u.photo || DEFAULT_AVATAR_DATAURL;
        headerAvatar.style.display = "block";
        // disable navigation when clicking the header avatar
        headerAvatar.style.cursor = 'default';
        headerAvatar.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
      }
      if (headerName) {
        if (u.name) {
          headerName.textContent = u.name;
          headerName.style.display = "inline";
        } else if (u.email) {
          headerName.textContent = u.email;
          headerName.style.display = "inline";
        } else {
          headerName.style.display = "none";
        }
        // disable navigation when clicking the header name
        headerName.style.cursor = 'default';
        headerName.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
      }
    }).catch(() => {});
  }
});

  // Attach a global logout handler for any element using id `#logout-btn` or class `.logout-link`.
document.addEventListener("click", async (ev) => {
  const target = ev.target;
  if (!target) return;
  // Support clicks on the element itself or any inner element; match by id or class
  const logoutBtn = target.id === "logout-btn" ? target : (target.closest && (target.closest("#logout-btn") || target.closest(".logout-link")));
  if (!logoutBtn) return;
  ev.preventDefault();
  try {
    // use apiRequest if available, otherwise fetch directly
    if (typeof apiRequest === "function") {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } else {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    }
  } catch (err) {
    // ignore errors — proceed to redirect to sign-in
    console.warn("Logout request failed:", err);
  } finally {
    window.location.href = "/index.html";
  }
});


