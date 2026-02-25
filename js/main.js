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

  /* ── Hero → About Scroll Slide (desktop only) ── */
  function bindScrollSlide() {
    var hero = document.querySelector('.hero-section');
    var about = document.querySelector('.about-section');
    if (!hero || !about) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Desktop only
    if (window.innerWidth < 1024) return;

    var ticking = false;
    var done = false;
    var SHIFT = 80;

    function onScroll() {
      if (done) return;
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(function () {
        ticking = false;

        // Disable if resized to mobile
        if (window.innerWidth < 1024) {
          hero.style.transform = '';
          about.style.transform = '';
          return;
        }

        var heroRect = hero.getBoundingClientRect();
        var aboutRect = about.getBoundingClientRect();
        var vh = window.innerHeight;

        // Start: hero bottom enters viewport (heroRect.bottom <= vh)
        // End: about top reaches 20% from top (aboutRect.top <= vh * 0.2)
        var start = heroRect.bottom;
        var end = aboutRect.top;

        if (start > vh) {
          // Hero bottom not yet in view
          hero.style.transform = 'translateX(0)';
          about.style.transform = 'translateX(' + SHIFT + 'px)';
        } else if (end <= vh * 0.2) {
          // About fully settled
          hero.style.transform = 'translateX(-' + SHIFT + 'px)';
          about.style.transform = 'translateX(0)';
          // Clean up — reset transforms and remove listener
          done = true;
          requestAnimationFrame(function () {
            hero.style.transform = '';
            about.style.transform = '';
            hero.style.willChange = 'auto';
            about.style.willChange = 'auto';
            window.removeEventListener('scroll', onScroll);
          });
        } else {
          // In transition zone
          var range = vh - vh * 0.2; // total scroll distance for transition
          var progress = Math.max(0, Math.min(1, (vh - start) / range));
          hero.style.transform = 'translateX(' + (-SHIFT * progress) + 'px)';
          about.style.transform = 'translateX(' + (SHIFT * (1 - progress)) + 'px)';
        }
      });
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
