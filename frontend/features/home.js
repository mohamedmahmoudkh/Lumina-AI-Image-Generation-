import { getFeatures, getStyles, getPricing, getTestimonials, getFaq } from '../services/dataService.js';
import { CONFIG, ROUTES } from '../constants/config.js';
import { initGallery } from './gallery.js';
import { initAccordions } from './animations.js';
import { renderTrustStrip } from '../components/promo.js';

export async function initHome() {
  renderTrustStrip(document.getElementById('trust-strip-root'));
  await Promise.all([
    renderFeatures(),
    renderStyles(),
    renderPricing(),
    renderTestimonials(),
    renderFaq(),
  ]);

  initGallery();
  initHeroPrompt();
}

function initHeroPrompt() {
  const form = document.getElementById('hero-prompt-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const prompt = form.querySelector('textarea')?.value?.trim();
    if (prompt) {
      sessionStorage.setItem('lumina_pending_prompt', prompt);
    }
    window.location.href = ROUTES.generate;
  });
}

async function renderFeatures() {
  const grid = document.getElementById('features-grid');
  if (!grid) return;
  const features = await getFeatures();
  grid.innerHTML = features.map((f, i) => `
    <article class="card card--glass feature-card reveal is-visible reveal-delay-${(i % 4) + 1}">
      <div class="feature-card__icon">${f.icon}</div>
      <h3 class="feature-card__title">${f.title}</h3>
      <p class="feature-card__desc">${f.description}</p>
    </article>
  `).join('');
}

async function renderStyles() {
  const grid = document.getElementById('styles-grid');
  if (!grid) return;
  const styles = await getStyles();
  grid.innerHTML = styles.map((s) => `
    <article class="style-card reveal" data-style-id="${s.id}">
      <img class="style-card__img" data-src="${s.image}" alt="${s.name}" loading="lazy" width="300" height="225">
      <p class="style-card__label">${s.name}</p>
    </article>
  `).join('');

  grid.querySelectorAll('.style-card').forEach((card) => {
    card.addEventListener('click', () => {
      sessionStorage.setItem('lumina_pending_style', card.dataset.styleId);
      window.location.href = ROUTES.generate;
    });
  });
}

async function renderPricing() {
  const grid = document.getElementById('pricing-grid');
  if (!grid) return;
  const plans = await getPricing();
  grid.innerHTML = plans.map((p) => `
    <article class="card pricing-card ${p.featured ? 'pricing-card--featured' : ''} reveal is-visible">
      ${p.featured ? `<span class="pricing-card__badge">${p.badge || 'Most Popular'}</span>` : ''}
      <h3>${p.name}</h3>
      <p class="pricing-card__price">$${p.price}<span>/${p.period}</span></p>
      ${p.trialDays ? `<p class="pricing-card__trial">${p.trialDays}-day free trial · ${p.trialCredits || 200} credits</p>` : ''}
      <p style="color:var(--color-text-muted);font-size:0.875rem">${p.description}</p>
      <ul class="pricing-card__features">
        ${p.features.map((f) => `<li>${f}</li>`).join('')}
      </ul>
      <a href="${ROUTES.signup}" class="btn ${p.featured ? 'btn--primary' : 'btn--secondary'}" style="width:100%">${p.cta}</a>
    </article>
  `).join('');
}

async function renderTestimonials() {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;
  const items = await getTestimonials();
  grid.innerHTML = items.map((t) => `
    <article class="card card--glass testimonial-card reveal">
      <div class="testimonial-card__stars">★★★★★</div>
      <p class="testimonial-card__quote">"${t.quote}"</p>
      <div class="testimonial-card__author">
        <img class="avatar" src="${t.avatar}" alt="" width="48" height="48">
        <div>
          <strong>${t.name}</strong>
          <p style="font-size:0.8rem;color:var(--color-text-muted)">${t.role}</p>
        </div>
      </div>
    </article>
  `).join('');
}

async function renderFaq() {
  const container = document.getElementById('faq-accordion');
  if (!container) return;
  const faqs = await getFaq();
  container.innerHTML = faqs.map((f) => `
    <div class="accordion-item">
      <button class="accordion-trigger" type="button">${f.question}</button>
      <div class="accordion-content">
        <div class="accordion-content__inner">${f.answer}</div>
      </div>
    </div>
  `).join('');
  initAccordions();
}
