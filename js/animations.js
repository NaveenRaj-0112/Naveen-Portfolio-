/* ==========================================
   ANIMATIONS.JS
   - GSAP ScrollTrigger animations
   - Scroll reveal system
   - Profile image gravity animation
   - Orbit particles
   ========================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ==========================================
  // LOADER
  // ==========================================
  function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
      setTimeout(() => {
        loader.classList.add('hidden');
        // Start profile animation immediately
        setTimeout(startProfileAnimation, 100);
      }, 800);
    }
  }

  // ==========================================
  // PROFILE IMAGE ANIMATION
  // ==========================================
  function startProfileAnimation() {
    const profileImg = document.getElementById('profile-img');
    if (profileImg) {
      profileImg.classList.add('animate-in');

      // After entry animation, add floating (keep animate-in for opacity)
      setTimeout(() => {
        profileImg.classList.add('floating');
      }, 1400);
    }

    // Animate hero text elements
    animateHeroText();
  }

  function animateHeroText() {
    if (typeof gsap === 'undefined') return;

    const helloEl = document.querySelector('.hero-hello');
    const nameEl = document.querySelector('.hero-name');
    const titleEl = document.querySelector('.hero-title');
    const tagsEl = document.querySelector('.hero-tags');
    const summaryEl = document.querySelector('.hero-summary');
    const buttonsEl = document.querySelector('.hero-buttons');

    const elements = [helloEl, nameEl, titleEl, tagsEl, summaryEl, buttonsEl].filter(Boolean);

    elements.forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: 0.1 * i,
          ease: 'power2.out'
        }
      );
    });
  }

  // ==========================================
  // ORBIT PARTICLES AROUND PROFILE
  // ==========================================
  function createOrbitParticles() {
    const container = document.getElementById('orbit-particles');
    if (!container) return;

    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('orbit-particle');
      particle.style.animationDelay = `${(i / particleCount) * 6}s`;
      particle.style.animationDuration = `${4 + Math.random() * 4}s`;
      const scale = 0.5 + Math.random() * 1;
      particle.style.transform = `scale(${scale})`;
      container.appendChild(particle);
    }
  }

  // ==========================================
  // SCROLL REVEAL
  // ==========================================
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-text');

    if (prefersReducedMotion) {
      revealElements.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // ==========================================
  // SKILL LEVEL BARS
  // ==========================================
  function initSkillBars() {
    const bars = document.querySelectorAll('.level-bar');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const level = entry.target.getAttribute('data-level');
          entry.target.style.width = level + '%';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    bars.forEach(bar => observer.observe(bar));
  }

  // ==========================================
  // METRIC COUNTERS
  // ==========================================
  function initCounters() {
    const counters = document.querySelectorAll('.metric-number');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }

  function animateCounter(el) {
    if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
      const target = parseInt(el.getAttribute('data-target'));
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = Math.round(obj.val);
        }
      });
    } else {
      el.textContent = el.getAttribute('data-target');
    }
  }

  // ==========================================
  // GSAP SCROLL ANIMATIONS
  // ==========================================
  function initGSAPAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    // Section headers
    gsap.utils.toArray('.section-header').forEach(header => {
      gsap.from(header, {
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power2.out'
      });
    });

    // Timeline cards
    gsap.utils.toArray('.timeline-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        x: -30,
        duration: 0.7,
        delay: i * 0.15,
        ease: 'power2.out'
      });
    });

    // Timeline dots
    gsap.utils.toArray('.timeline-dot').forEach((dot, i) => {
      gsap.from(dot, {
        scrollTrigger: {
          trigger: dot,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        scale: 0,
        duration: 0.4,
        delay: i * 0.15 + 0.2,
        ease: 'back.out(2)'
      });
    });
  }

  // ==========================================
  // INITIALIZE
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    hideLoader();
    createOrbitParticles();
    initScrollReveal();
    initSkillBars();
    initCounters();

    // Wait a bit for GSAP to be ready
    setTimeout(initGSAPAnimations, 100);

    // Safety fallback - ensure image is visible even if animation fails
    setTimeout(() => {
      const img = document.getElementById('profile-img');
      if (img && getComputedStyle(img).opacity === '0') {
        img.style.opacity = '1';
        img.style.transform = 'none';
      }
    }, 2500);
  });
})();
