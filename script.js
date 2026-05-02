/* =============================================
   PAISEKIBAAT — SCRIPT.JS
   ============================================= */

(function () {
  'use strict';

  /* ---- Navbar: scroll state + mobile toggle ---- */
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  const backToTop = document.getElementById('backToTop');

  function onScroll() {
    const scrolled = window.scrollY > 40;
    navbar.classList.toggle('scrolled', scrolled);

    // Back-to-top visibility
    if (window.scrollY > 400) {
      backToTop.removeAttribute('hidden');
    } else {
      backToTop.setAttribute('hidden', '');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Mobile menu toggle
  navToggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu on nav link click
  navLinks.querySelectorAll('.nav-link, .nav-cta-btn').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on click outside
  document.addEventListener('click', function (e) {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---- Smooth scroll for ALL anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h'), 10) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ---- Back to top ---- */
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---- Intersection Observer: reveal on scroll ---- */
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---- Counter animation ---- */
  function animateCounter(el) {
    const target  = parseInt(el.dataset.count, 10);
    const suffix  = el.dataset.suffix || '';
    const duration = 2000;
    const startTime = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function frame(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOut(progress) * target);
      el.textContent = value.toLocaleString('en-IN') + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  const counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number[data-count]').forEach(function (el) {
    counterObserver.observe(el);
  });

  /* ---- FAQ Accordion ---- */
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      const answer     = document.getElementById(this.getAttribute('aria-controls'));

      // Close all others
      document.querySelectorAll('.faq-question').forEach(function (otherBtn) {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          const otherAnswer = document.getElementById(otherBtn.getAttribute('aria-controls'));
          if (otherAnswer) otherAnswer.setAttribute('hidden', '');
        }
      });

      // Toggle this one
      if (isExpanded) {
        this.setAttribute('aria-expanded', 'false');
        answer.setAttribute('hidden', '');
      } else {
        this.setAttribute('aria-expanded', 'true');
        answer.removeAttribute('hidden');
      }
    });
  });

  /* ---- Contact form ---- */
  const form        = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  function validateField(input) {
    const errorEl = input.parentElement.querySelector('.form-error');
    let   message = '';

    if (input.required && !input.value.trim()) {
      message = 'This field is required.';
    } else if (input.type === 'email' && input.value.trim()) {
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(input.value.trim())) message = 'Please enter a valid email address.';
    }

    input.classList.toggle('error', !!message);
    if (errorEl) errorEl.textContent = message;
    return !message;
  }

  // Live validation on blur
  if (form) {
    form.querySelectorAll('.form-input').forEach(function (input) {
      input.addEventListener('blur', function () { validateField(this); });
      input.addEventListener('input', function () {
        if (this.classList.contains('error')) validateField(this);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const inputs  = Array.from(form.querySelectorAll('.form-input'));
      const allValid = inputs.every(function (inp) { return validateField(inp); });
      if (!allValid) return;

      // Simulate submission
      const submitBtn = form.querySelector('.form-submit');
      const original  = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
      submitBtn.disabled  = true;

      setTimeout(function () {
        form.setAttribute('hidden', '');
        formSuccess.removeAttribute('hidden');
      }, 1400);
    });
  }

  /* ---- Floating rupee background ---- */
  const container = document.getElementById('floatingRupees');
  if (container) {
    const symbols  = ['₹', '₹', '₹', '💰', '📄', '₹'];
    const count    = 18;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'rupee-symbol';
      el.textContent = symbols[i % symbols.length];
      el.style.cssText = [
        'left:'      + (Math.random() * 100) + '%',
        'font-size:' + (Math.random() * 28 + 14) + 'px',
        'animation-duration:' + (Math.random() * 12 + 10) + 's',
        'animation-delay:'    + (Math.random() * -20) + 's'
      ].join(';');
      container.appendChild(el);
    }
  }

  /* ---- Active nav link highlight on scroll ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinkEls.forEach(function (link) {
          const isActive = link.getAttribute('href') === '#' + id;
          link.style.color    = isActive ? 'var(--primary-light)' : '';
          link.style.fontWeight = isActive ? '700' : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(function (s) { sectionObserver.observe(s); });

  /* ---- Pricing card tilt on mouse move ---- */
  document.querySelectorAll('.pricing-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const isFeatured = card.classList.contains('featured');
      const scale  = isFeatured ? 1.04 : 1;
      card.style.transform =
        'scale(' + scale + ') rotateY(' + (dx * 4) + 'deg) rotateX(' + (-dy * 4) + 'deg)';
    });
    card.addEventListener('mouseleave', function () {
      const isFeatured = card.classList.contains('featured');
      card.style.transform = isFeatured ? 'scale(1.04)' : '';
    });
  });

  /* ---- Dashboard bar animation on hero ---- */
  const bars = document.querySelectorAll('.dash-bar-chart .bar');
  setTimeout(function () {
    bars.forEach(function (bar, i) {
      setTimeout(function () {
        bar.style.transition = 'height 0.6s cubic-bezier(0.34,1.56,0.64,1)';
      }, i * 80);
    });
  }, 600);

})();
