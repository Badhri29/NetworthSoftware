// Theme switching functionality
(function () {
  const THEME_KEY = 'app-theme';
  const DARK_THEME = 'dark';
  const LIGHT_THEME = 'light';

  // Initialize theme on page load
  function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || DARK_THEME;
    applyTheme(savedTheme);
    updateThemeToggle(savedTheme);
  }

  // Apply theme to document
  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === LIGHT_THEME) {
      root.setAttribute('data-theme', LIGHT_THEME);
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  // Update toggle switch state
  function updateThemeToggle(theme) {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.checked = theme === LIGHT_THEME;
    }
  }

  // Get current theme
  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || DARK_THEME;
  }

  // Handle theme toggle change
  function handleThemeToggle(e) {
    const newTheme = e.target.checked ? LIGHT_THEME : DARK_THEME;
    applyTheme(newTheme);
  }

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('change', handleThemeToggle);
    }
  });

  // Expose functions globally if needed
  window.themeManager = {
    applyTheme,
    getCurrentTheme,
    DARK_THEME,
    LIGHT_THEME
  };
})();
