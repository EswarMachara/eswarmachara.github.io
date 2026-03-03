/* ============================================================
   MAIN — Scroll-to-Top, Scroll Animations, Mobile Menu
   ============================================================ */

(function () {
  'use strict';

  /* ── Mobile Menu ── */
  function bindMobileMenu() {
    var hamburger = document.getElementById('hamburger');
    var overlay = document.getElementById('navOverlay');
    if (!hamburger) return;

    hamburger.addEventListener('click', function () {
      var isOpen = document.body.classList.toggle('nav-open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    if (overlay) {
      overlay.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    }

    document.addEventListener('click', function (e) {
      if (e.target.matches && e.target.matches('.navbar__link')) {
        document.body.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Scroll to Top ── */
  function bindScrollToTop() {
    var btn = document.getElementById('scrollTop');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        btn.classList.add('scroll-top--visible');
      } else {
        btn.classList.remove('scroll-top--visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Scroll Animations ── */
  function bindScrollAnimations() {
    var elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── Render Lucide Icons ── */
  function renderIcons() {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  /* ── Hero → About Split Scroll (desktop only) ── */
  function bindScrollSlide() {
    var wrapper = document.querySelector('.intro-wrapper');
    var hero = document.querySelector('.hero-section');
    var about = document.querySelector('.about-section');
    if (!wrapper || !hero || !about) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Desktop only (≥1024px)
    if (window.innerWidth < 1024) return;

    var ticking = false;
    var done = false;
    var scrollStart = null;
    var SCROLL_DISTANCE = window.innerHeight * 1.2; // 120vh scroll distance

    // Enable split layout
    wrapper.classList.add('split-active');
    hero.style.transform = 'translateX(0)';
    about.style.transform = 'translateX(100%)';

    function onScroll() {
      if (done) return;
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(function () {
        ticking = false;

        // Disable if resized to mobile
        if (window.innerWidth < 1024) {
          cleanup();
          return;
        }

        var scrollY = window.scrollY;

        // Initialize scroll start point (first scroll after hero visible)
        if (scrollStart === null) {
          scrollStart = 0;
        }

        var progress = Math.min(1, Math.max(0, (scrollY - scrollStart) / SCROLL_DISTANCE));

        if (progress < 1) {
          // During transition
          hero.style.transform = 'translateX(' + (-100 * progress) + '%)';
          about.style.transform = 'translateX(' + (100 * (1 - progress)) + '%)';
        } else {
          // Transition complete — restore normal flow
          cleanup();
        }
      });
    }

    function cleanup() {
      done = true;
      wrapper.classList.remove('split-active');
      hero.style.transform = '';
      about.style.transform = '';
      hero.style.willChange = 'auto';
      about.style.willChange = 'auto';
      window.removeEventListener('scroll', onScroll);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial check
    onScroll();
  }

  /* ── Init ── */
  function onReady() {
    bindMobileMenu();
    bindScrollToTop();
    bindScrollAnimations();
    bindScrollSlide();
    renderIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
