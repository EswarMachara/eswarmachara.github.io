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
    var container = document.querySelector('.intro-container');
    var wrapper = document.querySelector('.intro-wrapper');
    var hero = document.querySelector('.hero-section');
    var about = document.querySelector('.about-section');
    
    if (!container || !wrapper || !hero || !about) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Desktop only (≥1024px)
    if (window.innerWidth < 1024) return;

    var ticking = false;
    // Scroll distance = 100vh (the extra height in intro-container)
    var scrollDistance = window.innerHeight;

    // Initial position: Hero visible, About off to the right
    hero.style.transform = 'translateX(0)';
    about.style.transform = 'translateX(100%)';

    function onScroll() {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(function () {
        ticking = false;

        // Skip on mobile
        if (window.innerWidth < 1024) {
          hero.style.transform = '';
          about.style.transform = '';
          return;
        }

        // Calculate how far we've scrolled into the container
        var containerTop = container.offsetTop;
        var scrollY = window.scrollY;
        var scrolled = scrollY - containerTop;

        // Clamp progress between 0 and 1
        var progress = Math.max(0, Math.min(1, scrolled / scrollDistance));

        // Apply transforms:
        // Hero: slides from translateX(0) to translateX(-100%)
        // About: slides from translateX(100%) to translateX(0)
        hero.style.transform = 'translateX(' + (-100 * progress) + '%)';
        about.style.transform = 'translateX(' + (100 * (1 - progress)) + '%)';
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function() {
      // Reset on resize to mobile
      if (window.innerWidth < 1024) {
        hero.style.transform = '';
        about.style.transform = '';
      }
    });
    
    // Initial position
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
