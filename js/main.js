/* ============================================================
   MAIN.JS — Bootstrap Academic Portfolio
   Back-to-top button, smooth scrolling, tooltip initialization
   ============================================================ */

(function($) {
  'use strict';

  $(document).ready(function() {

    // ── Back-to-top button visibility ──
    var $topper = $('#topper');
    
    $(window).scroll(function() {
      if ($(window).scrollTop() > 300) {
        $topper.fadeIn(300);
      } else {
        $topper.fadeOut(300);
      }
    });

    // ── Smooth scroll for back-to-top and scroll-link class ──
    $topper.click(function(e) {
      e.preventDefault();
      $('html, body').animate({ scrollTop: 0 }, 500);
    });

    $('.scroll-link').click(function(e) {
      e.preventDefault();
      var target = $(this).attr('href');
      if (target === '#top' || target === '#') {
        $('html, body').animate({ scrollTop: 0 }, 500);
      } else {
        var $target = $(target);
        if ($target.length) {
          $('html, body').animate({ scrollTop: $target.offset().top - 70 }, 500);
        }
      }
    });

    // ── Initialize Bootstrap tooltips ──
    $('[data-toggle="tooltip"]').tooltip();

    // ── Animate elements on scroll (fade-in) ──
    function animateOnScroll() {
      $('.fade-in').each(function() {
        var elementTop = $(this).offset().top;
        var viewportBottom = $(window).scrollTop() + $(window).height();
        if (elementTop < viewportBottom - 50) {
          $(this).addClass('visible');
        }
      });
    }

    // Run on load and scroll
    animateOnScroll();
    $(window).scroll(animateOnScroll);

  });

})(jQuery);
