// Theme switching functionality
(function () {
  const THEME_KEY = 'app-theme';
  const DARK_THEME = 'dark';
  const LIGHT_THEME = 'light';

  function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || DARK_THEME;
    applyTheme(savedTheme);
    updateThemeToggle(savedTheme);
  }

  function applyTheme(theme) {
    const root = document.documentElement;

    // ✅ ALWAYS set data-theme
    root.setAttribute('data-theme', theme);

    localStorage.setItem(THEME_KEY, theme);
  }

  function updateThemeToggle(theme) {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.checked = theme === LIGHT_THEME;
    }
  }

  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme');
  }

  function handleThemeToggle(e) {
    const newTheme = e.target.checked ? LIGHT_THEME : DARK_THEME;
    applyTheme(newTheme);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('change', handleThemeToggle);
    }
  });

  window.themeManager = {
    applyTheme,
    getCurrentTheme,
    DARK_THEME,
    LIGHT_THEME
  };
})();
