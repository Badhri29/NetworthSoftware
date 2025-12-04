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

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav(location.pathname);
});


