import { renderNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { renderSidebar, renderDashboardHeader } from '../../components/sidebar.js';
import { initAnimations } from '../../features/animations.js';
import { initAuth } from '../../features/auth.js';
import { initGalleryPage } from '../../features/gallery.js';
import { initHome } from '../../features/home.js';
import { initGenerate } from '../../features/generate.js';
import { initDashboard } from '../../features/dashboard.js';
import { initHistory } from '../../features/history.js';
import { initPresets } from '../../features/presets.js';
import { initSettings, initSaved } from '../../features/settings.js';
import { isDashboardPage, isAuthPage, getPageName, lazyLoadImages, $ } from '../../lib/utils.js';
import { isLoggedIn, setUser } from '../../store/state.js';
import { CONFIG } from '../../constants/config.js';
import { ROUTES } from '../../constants/config.js';
import { renderPromoBar } from '../../components/promo.js';
import { initBillingPage } from '../../features/billing.js';
import { post } from '../../services/api.js';
import { probeApi } from '../../services/api.js';

const PROTECTED_PAGES = [
  'dashboard', 'generate', 'saved', 'history', 'presets', 'billing', 'settings', 'profile',
];

async function bootstrap() {
  const apiLive = await probeApi();
  if (!apiLive && !CONFIG.mockMode) {
    console.warn('[Lumina] API offline. Run: npm start (from project folder)');
  }

  const page = getPageName();

  if (!isAuthPage() && page !== 'index') renderPromoBar();
  if (page === 'index') renderPromoBar();

  if (PROTECTED_PAGES.includes(page) && !isLoggedIn()) {
    window.location.href = ROUTES.login;
    return;
  }

  if (isDashboardPage()) {
    renderSidebar(document.getElementById('sidebar-root'));
    const title = document.body.dataset.pageTitle || 'Dashboard';
    renderDashboardHeader(document.getElementById('dashboard-header-root'), title);
  } else if (!isAuthPage()) {
    renderNavbar(document.getElementById('navbar-root'));
    renderFooter(document.getElementById('footer-root'));
  }

  initAnimations();
  initAuth();

  switch (page) {
    case 'index':
      await initHome();
      break;
    case 'features':
      await initFeaturesPage();
      break;
    case 'pricing':
      await initPricingPage();
      break;
    case 'gallery':
      initGalleryPage();
      break;
    case 'generate':
      initGenerate();
      applyPendingSession();
      break;
    case 'dashboard':
      await initDashboard();
      break;
    case 'history':
      await initHistory();
      break;
    case 'presets':
      await initPresets();
      break;
    case 'saved':
      initSaved();
      break;
    case 'billing':
      await initPricingPage();
      await initBillingPage();
      break;
    case 'contact':
      initContactForm();
      break;
    case 'settings':
    case 'profile':
      initSettings();
      break;
    case 'faq':
      await initHomeFaqOnly();
      break;
    default:
      break;
  }

  lazyLoadImages();
  initBillingDemo();
}

async function initFeaturesPage() {
  const { getFeatures } = await import('../../services/dataService.js');
  const grid = document.getElementById('features-grid');
  if (!grid) return;
  const features = await getFeatures();
  grid.innerHTML = features.map((f, i) => `
    <article class="card card--glass feature-card reveal reveal-delay-${(i % 4) + 1}">
      <div class="feature-card__icon">${f.icon}</div>
      <h3 class="feature-card__title">${f.title}</h3>
      <p class="feature-card__desc">${f.description}</p>
    </article>
  `).join('');
}

async function initPricingPage() {
  const { getPricing } = await import('../../services/dataService.js');
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
      <ul class="pricing-card__features">${p.features.map((f) => `<li>${f}</li>`).join('')}</ul>
      ${p.id === 'free'
        ? `<a href="${ROUTES.signup}" class="btn btn--secondary" style="width:100%">${p.cta}</a>`
        : p.id === 'enterprise'
          ? `<a href="contact.html" class="btn btn--secondary" style="width:100%">${p.cta}</a>`
          : `<button type="button" class="btn btn--primary" style="width:100%" data-upgrade-plan="pro">${p.cta}</button>`}
    </article>
  `).join('');
  if (document.getElementById('pricing-grid')) {
    import('../../features/billing.js').then((m) => m.initBillingPage());
  }
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    try {
      await post('/contact', {
        name: fd.get('name'),
        email: fd.get('email'),
        message: fd.get('message'),
      });
      const { toastSuccess } = await import('../../components/toast.js');
      toastSuccess('Message sent! We reply within 24 hours.');
      form.reset();
    } catch (err) {
      const { toastError } = await import('../../components/toast.js');
      toastError(err.message || 'Failed to send');
    }
  });
}

async function initHomeFaqOnly() {
  const { initAccordions } = await import('../../features/animations.js');
  const { getFaq } = await import('../../services/dataService.js');
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

function applyPendingSession() {
  const prompt = sessionStorage.getItem('lumina_pending_prompt');
  const style = sessionStorage.getItem('lumina_pending_style');
  if (prompt) {
    const input = $('#prompt-input');
    if (input) input.value = prompt;
    sessionStorage.removeItem('lumina_pending_prompt');
  }
  if (style) {
    document.querySelector(`[data-style="${style}"]`)?.classList.add('is-active');
    sessionStorage.removeItem('lumina_pending_style');
  }
}

function initBillingDemo() {
  document.querySelectorAll('[data-upgrade]').forEach((btn) => {
    btn.addEventListener('click', () => {
      import('../../components/toast.js').then(({ toastSuccess }) => {
        toastSuccess('Redirecting to checkout (demo)');
      });
    });
  });
}

// Demo: auto-login hint in console
if (!isLoggedIn() && CONFIG.mockMode) {
  console.info(`[${CONFIG.appName}] Demo: use any email/password (6+ chars) to sign in.`);
}

document.addEventListener('DOMContentLoaded', bootstrap);
