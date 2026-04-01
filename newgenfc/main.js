/* ============================================
   NEW GEN FC — Main JavaScript
   ============================================ */

(function () {
  'use strict';

  // ----- Mobile Navigation -----
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.classList.toggle('is-active');
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu on link click
    navMenu.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ----- Scroll-triggered Animations -----
  const animateElements = document.querySelectorAll(
    '.section__header, .about__content, .about__features, .feature-card, ' +
    '.program-card, .method__step, .coach__image-wrapper, .coach__content, ' +
    '.testimonial-card, .faq__item, .contact__info, .contact__form'
  );

  animateElements.forEach((el) => el.classList.add('animate-on-scroll'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger children if they are in a grid
          const parent = entry.target.parentElement;
          if (parent) {
            const siblings = parent.querySelectorAll('.animate-on-scroll');
            siblings.forEach((sib, i) => {
              if (sib === entry.target) {
                entry.target.style.transitionDelay = `${i * 0.08}s`;
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

  animateElements.forEach((el) => observer.observe(el));

  // ----- Active Nav Link on Scroll -----
  const sections = document.querySelectorAll('.section, .hero');
  const navLinks = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.style.color = '';
            if (link.getAttribute('href') === `#${id}`) {
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

  sections.forEach((section) => sectionObserver.observe(section));

  // ----- Smooth scroll for anchor links (fallback) -----
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ----- Form Enhancement -----
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.textContent = 'Sending...';
        btn.disabled = true;
        // Re-enable after a delay in case FormSubmit redirects
        setTimeout(() => {
          btn.textContent = 'Send Message';
          btn.disabled = false;
        }, 5000);
      }
    });
  }
})();
