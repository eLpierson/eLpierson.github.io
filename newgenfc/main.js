/* ============================================
   NEW GEN FC — Main JavaScript
   ============================================ */

(function () {
  'use strict';

  // ----- Check prefers-reduced-motion -----
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- Mobile Navigation -----
  var navToggle = document.getElementById('nav-toggle');
  var navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('is-open');
      navToggle.classList.toggle('is-active');
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu on link click
    var navLinks = navMenu.querySelectorAll('.nav__link');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function () {
        navMenu.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    }
  }

  // ----- Scroll-triggered Animations -----
  var animateElements = document.querySelectorAll(
    '.section__header, .about__content, .about__features, .feature-card, ' +
    '.program-card, .method__step, .coach__image-wrapper, .coach__content, ' +
    '.testimonial-card, .faq__item, .contact__info, .contact__form'
  );

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    // Add the hidden state class only when we can animate
    for (var j = 0; j < animateElements.length; j++) {
      animateElements[j].classList.add('animate-on-scroll');
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Stagger children if they are in a grid
            var parent = entry.target.parentElement;
            if (parent) {
              var siblings = parent.querySelectorAll('.animate-on-scroll');
              siblings.forEach(function (sib, idx) {
                if (sib === entry.target) {
                  entry.target.style.transitionDelay = idx * 0.08 + 's';
                }
              });
            }
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    for (var k = 0; k < animateElements.length; k++) {
      observer.observe(animateElements[k]);
    }
  }
  // If IntersectionObserver is not available or reduced motion is preferred,
  // elements remain fully visible (no animate-on-scroll class added)

  // ----- Active Nav Link on Scroll -----
  var sections = document.querySelectorAll('.section, .hero');
  var allNavLinks = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            allNavLinks.forEach(function (link) {
              link.style.color = '';
              if (link.getAttribute('href') === '#' + id) {
                link.style.color = 'var(--white)';
              }
            });
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-80px 0px -50% 0px',
      }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  // ----- Smooth scroll for anchor links (JS fallback for browsers without CSS scroll-behavior) -----
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = anchor.getAttribute('href');
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        if (prefersReducedMotion) {
          // Jump instantly for users who prefer reduced motion
          target.scrollIntoView();
        } else if ('scrollBehavior' in document.documentElement.style) {
          // Browser supports smooth scroll natively
          target.scrollIntoView({ behavior: 'smooth' });
        } else {
          // Manual smooth scroll fallback
          var targetY = target.getBoundingClientRect().top + window.pageYOffset - 80;
          var startY = window.pageYOffset;
          var diff = targetY - startY;
          var startTime = null;
          var duration = 500;

          function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var elapsed = timestamp - startTime;
            var progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            var ease = 1 - Math.pow(1 - progress, 3);
            window.scrollTo(0, startY + diff * ease);
            if (elapsed < duration) {
              window.requestAnimationFrame(step);
            }
          }

          window.requestAnimationFrame(step);
        }
        // Update URL hash without jumping
        if (history.pushState) {
          history.pushState(null, null, href);
        }
      }
    });
  });

  // ----- Form Enhancement -----
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.textContent = 'Sending...';
        btn.disabled = true;
        // Re-enable after a delay in case FormSubmit redirects
        setTimeout(function () {
          btn.textContent = 'Send Message';
          btn.disabled = false;
        }, 5000);
      }
    });
  }
})();
