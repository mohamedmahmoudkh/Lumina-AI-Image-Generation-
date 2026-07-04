import { CONFIG, ROUTES } from '../constants/config.js';
import { getUser } from '../store/state.js';
import { getPageName } from '../lib/utils.js';

const SIDEBAR_LINKS = [
  { href: ROUTES.dashboard, label: 'Overview', icon: '◉' },
  { href: ROUTES.generate, label: 'Generate', icon: '✦' },
  { href: ROUTES.gallery, label: 'Gallery', icon: '▦' },
  { href: ROUTES.history, label: 'History', icon: '↺' },
  { href: ROUTES.saved, label: 'Saved', icon: '♡' },
  { href: ROUTES.presets, label: 'Presets', icon: '◈' },
  { href: ROUTES.billing, label: 'Billing', icon: '◇' },
  { href: ROUTES.settings, label: 'Settings', icon: '⚙' },
];

export function renderSidebar(container) {
  if (!container) return;
  const page = getPageName();
  const user = getUser();

  container.innerHTML = `
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar__header">
        <a href="${ROUTES.home}" class="navbar__logo">
          <span class="navbar__logo-icon">✦</span>
          ${CONFIG.appName}
        </a>
      </div>
      <nav class="sidebar__nav" aria-label="Dashboard">
        ${SIDEBAR_LINKS.map((l) => {
          const id = l.href.replace('.html', '');
          const active = page === id;
          return `<a href="${l.href}" class="sidebar__link ${active ? 'is-active' : ''}">
            <span class="sidebar__icon">${l.icon}</span>${l.label}
          </a>`;
        }).join('')}
      </nav>
      <div class="sidebar__footer">
        <div class="sidebar__credits">
          Credits remaining
          <strong>${user?.credits ?? CONFIG.defaultCredits}</strong>
        </div>
        <a href="${ROUTES.profile}" class="sidebar__link">
          <span class="sidebar__icon">👤</span>
          ${user?.name || 'Profile'}
        </a>
      </div>
    </aside>
  `;

  initSidebarBehavior();
}

export function renderDashboardHeader(container, title) {
  if (!container) return;
  container.innerHTML = `
    <header class="dashboard-header">
      <button class="navbar__menu-btn" id="sidebar-toggle" aria-label="Toggle sidebar">☰</button>
      <h1 class="dashboard-header__title">${title}</h1>
      <div class="navbar__actions">
        <a href="${ROUTES.generate}" class="btn btn--primary btn--sm">+ New</a>
      </div>
    </header>
  `;
  initSidebarBehavior();
}

function initSidebarBehavior() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  toggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('is-open');
    overlay?.classList.toggle('is-visible');
  });

  overlay?.addEventListener('click', () => {
    sidebar?.classList.remove('is-open');
    overlay?.classList.remove('is-visible');
  });
}
