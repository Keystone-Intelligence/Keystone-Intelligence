/* ============================================================
   KEYSTONE INTELLIGENCE GROUP · SITE SCRIPT
   Version: 1.0
   Includes: mobile nav toggle, contact form client-side validation
   ============================================================ */

(function () {
  'use strict';

  /* ─── MOBILE NAV TOGGLE ─── */
  function initMobileNav() {
    var nav = document.querySelector('.k-nav');
    var toggle = document.querySelector('.k-nav__mobile-toggle');
    var linksList = document.querySelector('.k-nav__links');
    if (!nav || !toggle || !linksList) return;

    // Ensure linksList has an id for aria-controls
    if (!linksList.id) linksList.id = 'k-nav-links';
    toggle.setAttribute('aria-controls', linksList.id);
    toggle.setAttribute('aria-expanded', 'false');

    function closeMenu() {
      nav.classList.remove('k-nav--open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }
    function openMenu() {
      nav.classList.add('k-nav--open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (nav.classList.contains('k-nav--open')) closeMenu();
      else openMenu();
    });

    // Close when a nav link is tapped (mobile)
    linksList.addEventListener('click', function (e) {
      var target = e.target;
      if (target && target.tagName === 'A') closeMenu();
    });

    // Close on Escape (a11y)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('k-nav--open')) {
        closeMenu();
        toggle.focus();
      }
    });

    // Close if the viewport widens past the mobile breakpoint
    var mq = window.matchMedia('(min-width: 769px)');
    var onMQChange = function (e) { if (e.matches) closeMenu(); };
    if (mq.addEventListener) mq.addEventListener('change', onMQChange);
    else if (mq.addListener) mq.addListener(onMQChange);
  }

  /* ─── CONTACT FORM VALIDATION ─── */
  function initContactForm() {
    var form = document.querySelector('form.k-contact-form');
    if (!form) return;

    var statusEl = form.querySelector('[data-form-status]');

    function showFieldError(field, message) {
      field.setAttribute('aria-invalid', 'true');
      var errorId = field.id + '-error';
      var errorEl = document.getElementById(errorId);
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.id = errorId;
        errorEl.className = 'form-error';
        errorEl.setAttribute('role', 'alert');
        field.setAttribute('aria-describedby', errorId);
        field.parentNode.appendChild(errorEl);
      }
      errorEl.textContent = message;
    }

    function clearFieldError(field) {
      field.removeAttribute('aria-invalid');
      var errorId = field.id + '-error';
      var errorEl = document.getElementById(errorId);
      if (errorEl) errorEl.textContent = '';
    }

    function validateField(field) {
      var value = (field.value || '').trim();
      var type = field.type;
      var required = field.hasAttribute('required') || field.getAttribute('aria-required') === 'true';

      if (required && !value) {
        showFieldError(field, 'This field is required.');
        return false;
      }
      if (value && type === 'email') {
        // Basic email pattern; backend should do the real check.
        var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!emailOk) {
          showFieldError(field, 'Please enter a valid email address.');
          return false;
        }
      }
      if (value && type === 'tel') {
        // Permissive: digits, spaces, +, -, parentheses. Length >=7.
        var telOk = /^[\d\s()+\-]{7,}$/.test(value);
        if (!telOk) {
          showFieldError(field, 'Please enter a valid phone number.');
          return false;
        }
      }
      clearFieldError(field);
      return true;
    }

    var fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      var allValid = true;
      var firstInvalid = null;
      fields.forEach(function (field) {
        var ok = validateField(field);
        if (!ok && !firstInvalid) firstInvalid = field;
        if (!ok) allValid = false;
      });
      if (!allValid) {
        e.preventDefault();
        if (statusEl) {
          statusEl.textContent = 'Please correct the highlighted fields and try again.';
          statusEl.setAttribute('data-state', 'error');
        }
        if (firstInvalid) firstInvalid.focus();
      } else {
        // Form is valid. The actual submission is handled by the WP form plugin /
        // CRM integration the designer wires up. We just communicate intent here.
        if (statusEl) {
          statusEl.textContent = 'Sending. We will confirm a time within 24 hours.';
          statusEl.setAttribute('data-state', 'sending');
        }
      }
    });
  }

  /* ─── SCROLL-REVEAL STAGGER ─── */
  /* Fades grid children in with a 50ms stagger as the container enters the
     viewport. JS-driven so no-JS visitors see content immediately (we only
     hide elements after JS confirms the browser supports IntersectionObserver
     and the user hasn't requested reduced motion). */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var containerSelectors = [
      '.problem-grid',
      '.offer-grid',
      '.process-steps',
      '.industries-grid',
      '.blog-grid',
      '.pricing-grid',
      '.founders-grid',
      '.why-grid',
      '.hero__proof'
    ];
    var containers = document.querySelectorAll(containerSelectors.join(','));
    if (!containers.length) return;

    var STAGGER_MS = 50;

    containers.forEach(function (container) {
      var children = container.children;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.nodeType !== 1) continue;
        child.classList.add('k-reveal-pending');
        child.style.setProperty('--k-reveal-delay', (i * STAGGER_MS) + 'ms');
      }
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var container = entry.target;
        var children = container.children;
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          if (child.classList && child.classList.contains('k-reveal-pending')) {
            child.classList.remove('k-reveal-pending');
            child.classList.add('k-reveal-visible');
          }
        }
        observer.unobserve(container);
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });

    containers.forEach(function (c) { observer.observe(c); });
  }

  /* ─── INIT ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initMobileNav();
      initContactForm();
      initScrollReveal();
    });
  } else {
    initMobileNav();
    initContactForm();
    initScrollReveal();
  }
})();
