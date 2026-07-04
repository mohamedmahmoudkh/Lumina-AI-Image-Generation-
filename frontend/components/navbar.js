import { CONFIG, ROUTES } from '../constants/config.js';
import { isLoggedIn } from '../store/state.js';
import { getPageName } from '../lib/utils.js';

const NAV_LINKS = [
  { href: ROUTES.home, label: 'Home' },
  { href: ROUTES.features, label: 'Features' },
  { href: ROUTES.gallery, label: 'Gallery' },
  { href: ROUTES.pricing, label: 'Pricing' },
  { href: ROUTES.about, label: 'About' },
  { href: ROUTES.contact, label: 'Contact' },
];

export function renderNavbar(container) {
  if (!container) return;
  const page = getPageName();
  const loggedIn = isLoggedIn();

  container.innerHTML = `
    <header class="navbar" id="navbar">
      <div class="container navbar__inner">
        <a href="${ROUTES.home}" class="navbar__logo">
          <span class="navbar__logo-icon">✦</span>
          ${CONFIG.appName}
        </a>
        <nav class="navbar__nav" aria-label="Main">
          ${NAV_LINKS.map((l) => `
            <a href="${l.href}" class="navbar__link ${page === l.href.replace('.html', '') || (page === 'index' && l.href === ROUTES.home) ? 'is-active' : ''}">${l.label}</a>
          `).join('')}
        </nav>
        <div class="navbar__actions">
          ${loggedIn
            ? `<a href="${ROUTES.dashboard}" class="btn btn--primary btn--sm">Dashboard</a>`
            : `<a href="${ROUTES.login}" class="btn btn--ghost btn--sm">Log in</a>
               <a href="${ROUTES.signup}" class="btn btn--primary btn--sm">Free Trial</a>`}
          <button class="navbar__menu-btn" id="mobile-menu-btn" aria-label="Open menu" aria-expanded="false">☰</button>
        </div>
      </div>
    </header>
    <nav class="mobile-menu" id="mobile-menu" aria-label="Mobile">
      ${NAV_LINKS.map((l) => `<a href="${l.href}" class="mobile-menu__link">${l.label}</a>`).join('')}
      ${loggedIn
        ? `<a href="${ROUTES.dashboard}" class="mobile-menu__link">Dashboard</a>`
        : `<a href="${ROUTES.login}" class="mobile-menu__link">Log in</a>
           <a href="${ROUTES.signup}" class="mobile-menu__link">Get Started</a>`}
    </nav>
  `;

  initNavbarBehavior();
}

function initNavbarBehavior() {
  const navbar = document.getElementById('navbar');
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('is-scrolled', window.scrollY > 20);
  }, { passive: true });

  menuBtn?.addEventListener('click', () => {
    const open = mobileMenu?.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  mobileMenu?.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => mobileMenu.classList.remove('is-open'));
  });
}
