/* ==========================================
   MAIN.JS
   - Navigation (scroll, active section, glassy)
   - Custom cursor
   - Mobile hamburger menu
   - Smooth scroll
   - Contact form (mailto)
   - Parallax effects
   ========================================== */

(function () {
  'use strict';

  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ==========================================
  // CUSTOM CURSOR
  // ==========================================
  function initCursor() {
    if (isMobile || prefersReducedMotion) return;

    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    if (!cursor || !follower) return;

    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      cursor.style.left = cursorX - 4 + 'px';
      cursor.style.top = cursorY - 4 + 'px';
    });

    function updateFollower() {
      followerX += (cursorX - followerX) * 0.12;
      followerY += (cursorY - followerY) * 0.12;
      follower.style.left = followerX - 18 + 'px';
      follower.style.top = followerY - 18 + 'px';
      requestAnimationFrame(updateFollower);
    }
    updateFollower();

    // Hover states for interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .skill-card, .project-card, .btn, .hamburger');
    hoverTargets.forEach(target => {
      target.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        follower.classList.add('hover');
      });
      target.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        follower.classList.remove('hover');
      });
    });
  }

  // ==========================================
  // NAVIGATION
  // ==========================================
  function initNav() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section, .hero');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (!navbar) return;

    // Scroll effect - glassy navbar
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // Active section highlighting
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === id);
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));

    // Mobile menu toggle
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
      });

      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('active');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }
  }

  // ==========================================
  // SMOOTH SCROLL
  // ==========================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          const navHeight = document.getElementById('navbar')?.offsetHeight || 70;
          const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
          window.scrollTo({
            top: targetPos,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });
        }
      });
    });
  }

  // ==========================================
  // CONTACT FORM (Web3Forms)
  // ==========================================
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;

      try {
        const formData = new FormData(form);
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          status.textContent = 'Message sent successfully!';
          status.className = 'form-status success';
          form.reset();
        } else {
          status.textContent = 'Something went wrong. Please try again.';
          status.className = 'form-status error';
        }
      } catch (error) {
        status.textContent = 'Network error. Please try again.';
        status.className = 'form-status error';
      }

      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      setTimeout(() => {
        status.textContent = '';
        status.className = 'form-status';
      }, 5000);
    });
  }

  // ==========================================
  // PROFILE IMAGE PARALLAX (mouse move)
  // ==========================================
  function initParallax() {
    if (isMobile || prefersReducedMotion) return;

    const profileWrapper = document.getElementById('profile-wrapper');
    if (!profileWrapper) return;

    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      profileWrapper.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  // ==========================================
  // SKILL CARD TILT
  // ==========================================
  function initCardTilt() {
    if (isMobile || prefersReducedMotion) return;

    const cards = document.querySelectorAll('.skill-card, .project-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -5;
        const rotateY = (x - centerX) / centerX * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }

  // ==========================================
  // INITIALIZE
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initNav();
    initSmoothScroll();
    initContactForm();
    initParallax();
    initCardTilt();
  });
})();
