import { $$, lazyLoadImages } from '../lib/utils.js';

export function initScrollReveal() {
  const reveals = $$('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach((el) => observer.observe(el));
}

export function initHeroCarousel() {
  const carousel = document.getElementById('hero-carousel');
  if (!carousel) return;

  const images = carousel.querySelectorAll('img');
  if (images.length < 2) return;

  let current = 0;
  images[0]?.classList.add('is-active');

  setInterval(() => {
    images[current]?.classList.remove('is-active');
    current = (current + 1) % images.length;
    images[current]?.classList.add('is-active');
  }, 4000);
}

export function initAccordions() {
  $$('.accordion-item').forEach((item) => {
    const trigger = item.querySelector('.accordion-trigger');
    trigger?.addEventListener('click', () => {
      const wasOpen = item.classList.contains('is-open');
      item.parentElement?.querySelectorAll('.accordion-item').forEach((i) => i.classList.remove('is-open'));
      if (!wasOpen) item.classList.add('is-open');
    });
  });
}

export function initTabs(container = document) {
  const tabGroups = container.querySelectorAll('[data-tabs]');
  tabGroups.forEach((group) => {
    const tabs = group.querySelectorAll('.tab');
    const panels = group.querySelectorAll('.tab-panel');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach((t) => t.classList.remove('is-active'));
        panels.forEach((p) => p.classList.remove('is-active'));
        tab.classList.add('is-active');
        group.querySelector(`[data-panel="${target}"]`)?.classList.add('is-active');
      });
    });
  });
}

export function initDropdowns() {
  $$('.dropdown').forEach((dropdown) => {
    const trigger = dropdown.querySelector('[data-dropdown-trigger]');
    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      $$('.dropdown').forEach((d) => {
        if (d !== dropdown) d.classList.remove('is-open');
      });
      dropdown.classList.toggle('is-open');
    });
  });

  document.addEventListener('click', () => {
    $$('.dropdown.is-open').forEach((d) => d.classList.remove('is-open'));
  });
}

export function initParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;

  for (let i = 0; i < 20; i++) {
    const p = document.createElement('span');
    p.className = 'hero-particle';
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${Math.random() * 100}%`;
    p.style.animationDelay = `${Math.random() * 5}s`;
    p.style.opacity = `${0.2 + Math.random() * 0.4}`;
    container.appendChild(p);
  }
}

export function initAnimations() {
  initScrollReveal();
  initHeroCarousel();
  initAccordions();
  initTabs();
  initDropdowns();
  initParticles();
  lazyLoadImages();
}
