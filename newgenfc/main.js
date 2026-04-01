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
      if (formSuccess) formSuccess.hidden = true;
      if (formError) formError.hidden = true;

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
        if (formSuccess) formSuccess.hidden = false;
        if (submitBtn) {
          submitBtn.textContent = 'Sent!';
          setTimeout(function () {
            submitBtn.textContent = 'Send Message';
            submitBtn.disabled = false;
          }, 3000);
        }
      })
      .catch(function () {
        if (formError) formError.hidden = false;
        if (submitBtn) {
          submitBtn.textContent = 'Send Message';
          submitBtn.disabled = false;
        }
      });
    });
  }
})();
