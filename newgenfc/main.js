/* ============================================
   NEW GEN FC — Main JavaScript
   ============================================ */

(function () {
  'use strict';

  // ----- Auto-update copyright year -----
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ----- Check prefers-reduced-motion -----
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- Mobile Navigation -----
  var navToggle = document.getElementById('nav-toggle');
  var navMenu = document.getElementById('nav-menu');

  function closeMenu() {
    if (navMenu && navToggle) {
      navMenu.classList.remove('is-open');
      navToggle.classList.remove('is-active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  if (navToggle && navMenu) {
    // Toggle button — use both click and touchend for reliable mobile
    navToggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var isOpen = navMenu.classList.toggle('is-open');
      navToggle.classList.toggle('is-active');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when any nav link is tapped
    var allLinks = navMenu.querySelectorAll('a');
    for (var i = 0; i < allLinks.length; i++) {
      allLinks[i].addEventListener('click', function () {
        closeMenu();
      });
    }

    // Close menu when tapping outside of it
    document.addEventListener('click', function (e) {
      if (navMenu.classList.contains('is-open') && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        closeMenu();
      }
    });
  }

  // ----- Scroll-triggered Animations -----
  var animateElements = document.querySelectorAll(
    '.section__header, .about__content, .about__features, .feature-card, ' +
    '.program-card, .method__step, .coach__image-wrapper, .coach__content, ' +
    '.testimonial-card, .moments__item, .partner-tile, .faq__item, ' +
    '.contact__info, .contact__form'
  );

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    // Add the hidden state class only when we can animate
    for (var j = 0; j < animateElements.length; j++) {
      animateElements[j].classList.add('animate-on-scroll');
    }

    // Track which siblings inside a parent have already revealed so the
    // stagger index stays small (e.g. the 3rd visible item has delay 2,
    // not "position 9 of 12 in the DOM"). Also cap the delay so users
    // never wait more than ~0.18s for content to appear.
    var revealCounts = new WeakMap();
    var MAX_STAGGER_STEPS = 3;
    var STAGGER_STEP = 0.06;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var parent = entry.target.parentElement;
            var count = parent ? revealCounts.get(parent) || 0 : 0;
            var step = Math.min(count, MAX_STAGGER_STEPS);
            entry.target.style.transitionDelay = step * STAGGER_STEP + 's';
            if (parent) revealCounts.set(parent, count + 1);

            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0,
        // Expand the viewport 15% below the fold so content animates in
        // BEFORE the user scrolls to it — by the time the section is in
        // view, the reveal is already finished or mid-flight.
        rootMargin: '0px 0px 15% 0px',
      }
    );

    for (var k = 0; k < animateElements.length; k++) {
      observer.observe(animateElements[k]);
    }

    // Safety net: if anything is still hidden after the user has clearly
    // reached it (e.g. fast scroll, observer hiccup, tab was backgrounded),
    // force-show every remaining item. Re-checks on scroll with a throttle.
    var safetyTimer = null;
    function revealStuck() {
      var stuck = document.querySelectorAll('.animate-on-scroll:not(.is-visible)');
      for (var m = 0; m < stuck.length; m++) {
        var rect = stuck[m].getBoundingClientRect();
        // If any part of the element is within the viewport, reveal it.
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          stuck[m].style.transitionDelay = '0s';
          stuck[m].classList.add('is-visible');
          observer.unobserve(stuck[m]);
        }
      }
    }
    window.addEventListener('scroll', function () {
      if (safetyTimer) return;
      safetyTimer = setTimeout(function () {
        safetyTimer = null;
        revealStuck();
      }, 150);
    }, { passive: true });

    // Nuclear fallback: 2s after load, reveal anything still hidden anywhere.
    // This guarantees the page never looks broken even if IntersectionObserver
    // silently fails on some browser/configuration.
    window.addEventListener('load', function () {
      setTimeout(function () {
        document.documentElement.classList.add('reveal-all');
      }, 2000);
    });
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

  // ----- Smooth scroll for anchor links -----
  function smoothScrollTo(target) {
    if (prefersReducedMotion) {
      target.scrollIntoView();
    } else if ('scrollBehavior' in document.documentElement.style) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      var targetY = target.getBoundingClientRect().top + window.pageYOffset - 80;
      var startY = window.pageYOffset;
      var diff = targetY - startY;
      var startTime = null;
      var duration = 500;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var ease = 1 - Math.pow(1 - progress, 3);
        window.scrollTo(0, startY + diff * ease);
        if (elapsed < duration) {
          window.requestAnimationFrame(step);
        }
      }

      window.requestAnimationFrame(step);
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = anchor.getAttribute('href');
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();

        // If mobile menu is open, close it first then scroll after a delay
        if (navMenu && navMenu.classList.contains('is-open')) {
          closeMenu();
          setTimeout(function () {
            smoothScrollTo(target);
          }, 100);
        } else {
          smoothScrollTo(target);
        }

        if (history.pushState) {
          history.pushState(null, null, href);
        }
      }
    });
  });

  // ----- Google Sheets Form Submission -----
  // Replace this URL with your deployed Google Apps Script web app URL
  var GOOGLE_SHEETS_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

  var form = document.getElementById('contact-form');
  var submitBtn = document.getElementById('submit-btn');
  var formSuccess = document.getElementById('form-success');
  var formError = document.getElementById('form-error');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot check — if filled, it's a bot
      var honeypot = form.querySelector('input[name="_honey"]');
      if (honeypot && honeypot.value) return;

      // Hide any previous status
      if (formSuccess) formSuccess.classList.remove('is-visible');
      if (formError) formError.classList.remove('is-visible');

      // Disable button and show loading
      if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
      }

      // Gather form data
      var data = {
        name: form.querySelector('#name').value,
        email: form.querySelector('#email').value,
        phone: form.querySelector('#phone').value || '',
        program: form.querySelector('#program').value,
        message: form.querySelector('#message').value || '',
        submitted: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
      };

      // Send to Google Sheets via Apps Script
      fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(function () {
        // no-cors means we can't read the response, but if fetch didn't throw, it was sent
        form.reset();
        if (formSuccess) formSuccess.classList.add('is-visible');
        if (submitBtn) {
          submitBtn.textContent = 'Sent!';
          setTimeout(function () {
            submitBtn.textContent = 'Send Message';
            submitBtn.disabled = false;
          }, 3000);
        }
      })
      .catch(function () {
        if (formError) formError.classList.add('is-visible');
        if (submitBtn) {
          submitBtn.textContent = 'Send Message';
          submitBtn.disabled = false;
        }
      });
    });
  }
})();
