/**
 * Theme toggle: Light (default) / Dark
 * Saves preference in localStorage and applies on load.
 */

(function () {
  const STORAGE_KEY = "data-visualizer-theme";
  const THEME_LIGHT = "light";
  const THEME_DARK = "dark";

  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  function getSavedTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === THEME_DARK ? THEME_DARK : THEME_LIGHT;
    } catch {
      return THEME_LIGHT;
    }
  }

  function applyTheme(theme) {
    const isLight = theme === THEME_LIGHT;
    document.body.classList.toggle("theme-light", isLight);
    btn.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
    btn.textContent = isLight ? "Dark" : "Light";
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) {}
  }

  function toggleTheme() {
    const current = getSavedTheme();
    const next = current === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
    applyTheme(next);
  }

  btn.addEventListener("click", toggleTheme);
  applyTheme(getSavedTheme());
})();
