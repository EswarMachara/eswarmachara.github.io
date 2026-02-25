/* ============================================================
   THEME — IST-Based Auto Detection, Toggle, Persistence
   ============================================================ */

(function () {
  'use strict';

  /**
   * Get current IST hour and minute from UTC.
   * Returns { hour: 0-23, minute: 0-59 }
   */
  function getIST() {
    var now = new Date();
    var utc = now.getTime() + now.getTimezoneOffset() * 60000;
    var ist = new Date(utc + 19800000); // UTC+5:30 = 19800000ms
    return { hour: ist.getHours(), minute: ist.getMinutes() };
  }

  /**
   * Determine theme and accent period from IST time.
   * 05:30–11:59 → light, morning
   * 12:00–16:59 → light, afternoon
   * 17:00–18:59 → light, evening
   * 19:00–05:29 → dark, night
   */
  function getAutoTheme() {
    var ist = getIST();
    var h = ist.hour;
    var m = ist.minute;
    var totalMin = h * 60 + m;

    if (totalMin >= 330 && totalMin < 720) {
      return { theme: 'light', period: 'morning' };
    } else if (totalMin >= 720 && totalMin < 1020) {
      return { theme: 'light', period: 'afternoon' };
    } else if (totalMin >= 1020 && totalMin < 1140) {
      return { theme: 'light', period: 'evening' };
    } else {
      return { theme: 'dark', period: 'night' };
    }
  }

  /**
   * Apply accent override based on IST period.
   * Only adjusts --accent and --accent-hover for light sub-periods.
   * Dark mode uses its own values from themes.css.
   */
  function applyAccentPeriod(period) {
    var html = document.documentElement;
    html.setAttribute('data-period', period);
  }

  /**
   * Resolve theme: manual override > IST auto.
   */
  function resolveTheme() {
    var saved = localStorage.getItem('theme');
    var auto = getAutoTheme();

    if (saved === 'dark' || saved === 'light') {
      return { theme: saved, period: saved === 'dark' ? 'night' : auto.period };
    }
    return auto;
  }

  /**
   * Apply resolved theme to <html>.
   */
  function applyTheme() {
    var resolved = resolveTheme();
    document.documentElement.setAttribute('data-theme', resolved.theme);
    applyAccentPeriod(resolved.period);
  }

  /**
   * Bind toggle button with smooth transition.
   * Manual toggle stores override and clears auto.
   */
  function bindThemeToggle() {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var html = document.documentElement;
      var current = html.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      var auto = getAutoTheme();

      html.classList.add('theme-transition');
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);

      // Update accent period
      applyAccentPeriod(next === 'dark' ? 'night' : auto.period);

      setTimeout(function () {
        html.classList.remove('theme-transition');
      }, 350);
    });
  }

  // Apply theme immediately
  applyTheme();

  // Bind toggle when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindThemeToggle);
  } else {
    bindThemeToggle();
  }
})();
