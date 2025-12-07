function createLogoutModal() {
  const overlay = document.createElement('div');
  overlay.className = 'logout-modal-overlay';
  overlay.id = 'logout-modal-overlay';
  overlay.innerHTML = `
    <div class="logout-modal">
      <div class="logout-modal-title">Are you sure you want to logout?</div>
      <div class="logout-modal-actions">
        <button class="btn-yes" id="logout-confirm-yes">Yes</button>
        <button class="btn-no" id="logout-confirm-no">No</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function showLogoutConfirmation(onConfirm) {
  let overlay = document.getElementById('logout-modal-overlay');
  if (!overlay) {
    overlay = createLogoutModal();
  }
  
  overlay.classList.add('active');
  
  const yesBtn = document.getElementById('logout-confirm-yes');
  const noBtn = document.getElementById('logout-confirm-no');
  
  const closeModal = () => {
    overlay.classList.remove('active');
    yesBtn.removeEventListener('click', handleYes);
    noBtn.removeEventListener('click', handleNo);
  };
  
  const handleYes = () => {
    closeModal();
    onConfirm();
  };
  
  const handleNo = () => {
    closeModal();
  };
  
  yesBtn.addEventListener('click', handleYes);
  noBtn.addEventListener('click', handleNo);
  
  // Close modal if clicking on overlay background
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });
}

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
  
  // Sidebar toggle functionality
  const sidebar = document.querySelector(".desktop-sidebar");
  const toggleBtn = document.getElementById("sidebar-toggle");
  if (toggleBtn && sidebar) {
    // Load saved state from localStorage
    const isSidebarCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
    if (isSidebarCollapsed) {
      sidebar.classList.add("collapsed");
    }
    
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      const isCollapsed = sidebar.classList.contains("collapsed");
      localStorage.setItem("sidebarCollapsed", isCollapsed);
    });
  }
  
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
        headerAvatar.style.cursor = 'pointer';
        headerAvatar.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = '/settings.html';
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
        headerName.style.cursor = 'pointer';
        headerName.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = '/settings.html';
        });
      }
    }).catch(() => {});
  }
});

  // Attach a global logout handler for any element using id `#logout-btn` or class `.logout-link`.
document.addEventListener("click", async (ev) => {
  const target = ev.target;
  if (!target) return;
  const logoutBtn = target.id === "logout-btn" ? target : (target.closest && (target.closest("#logout-btn") || target.closest(".logout-link")));
  if (!logoutBtn) return;
  ev.preventDefault();
  
  // Show confirmation dialog
  showLogoutConfirmation(async () => {
    try {
      if (typeof apiRequest === "function") {
        await apiRequest("/api/auth/logout", { method: "POST" });
      } else {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      }
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      window.location.href = "/index.html";
    }
  });
});


