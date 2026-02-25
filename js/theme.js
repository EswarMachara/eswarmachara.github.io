/* ============================================================
   THEME — Toggle, Persistence, System Preference Detection
   ============================================================ */

(function () {
  'use strict';

  /**
   * Apply saved theme or detect system preference.
   * Called inline in <head> to prevent FOUC.
   */
  function initTheme() {
    var saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  /**
   * Bind toggle button with smooth transition.
   */
  function bindThemeToggle() {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var html = document.documentElement;
      var current = html.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';

      // Enable transition class for smooth theme switch
      html.classList.add('theme-transition');
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);

      // Remove transition class after animation completes
      setTimeout(function () {
        html.classList.remove('theme-transition');
      }, 350);
    });
  }

  // Apply theme immediately
  initTheme();

  // Bind toggle when DOM is ready (navbar is static HTML)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindThemeToggle);
  } else {
    bindThemeToggle();
  }
})();
