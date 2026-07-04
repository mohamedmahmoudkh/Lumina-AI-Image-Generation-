import { getHistory, getSaved } from '../store/state.js';
import { getGalleryItems } from '../services/dataService.js';
import { ROUTES } from '../constants/config.js';
import { formatDate } from '../lib/utils.js';

export async function initDashboard() {
  renderStats();
  await renderRecentGenerations();
  renderQuickActions();
}

function renderStats() {
  const history = getHistory();
  const saved = getSaved();
  const stats = document.getElementById('dashboard-stats');
  if (!stats) return;

  stats.innerHTML = `
    <article class="card card--glass reveal" style="padding:1.5rem">
      <span style="color:var(--color-text-muted);font-size:0.875rem">Total Generations</span>
      <strong style="display:block;font-size:2rem;margin-top:0.25rem">${history.length}</strong>
    </article>
    <article class="card card--glass reveal reveal-delay-1" style="padding:1.5rem">
      <span style="color:var(--color-text-muted);font-size:0.875rem">Saved Images</span>
      <strong style="display:block;font-size:2rem;margin-top:0.25rem">${saved.length}</strong>
    </article>
    <article class="card card--glass reveal reveal-delay-2" style="padding:1.5rem">
      <span style="color:var(--color-text-muted);font-size:0.875rem">This Week</span>
      <strong style="display:block;font-size:2rem;margin-top:0.25rem">${Math.min(history.length, 12)}</strong>
    </article>
    <article class="card card--glass reveal reveal-delay-3" style="padding:1.5rem">
      <span style="color:var(--color-text-muted);font-size:0.875rem">Credits Left</span>
      <strong style="display:block;font-size:2rem;margin-top:0.25rem;color:var(--color-cyan)">—</strong>
    </article>
  `;
}

async function renderRecentGenerations() {
  const container = document.getElementById('recent-generations');
  if (!container) return;

  const history = getHistory().slice(0, 6);
  if (history.length) {
    container.innerHTML = history.map((h) => `
      <a href="${ROUTES.history}" class="card" style="overflow:hidden">
        <img src="${h.images?.[0]?.url || 'https://picsum.photos/200'}" alt="" style="aspect-ratio:1;object-fit:cover;width:100%">
        <div style="padding:0.75rem;font-size:0.8rem;color:var(--color-text-muted)">${formatDate(h.createdAt)}</div>
      </a>
    `).join('');
    return;
  }

  const { items } = await getGalleryItems(1, 6);
  container.innerHTML = items.map((item) => `
    <a href="${ROUTES.gallery}" class="card" style="overflow:hidden">
      <img data-src="${item.image}" alt="" style="aspect-ratio:1;object-fit:cover;width:100%">
    </a>
  `).join('');
}

function renderQuickActions() {
  const el = document.getElementById('quick-actions');
  if (!el) return;
  el.innerHTML = `
    <a href="${ROUTES.generate}" class="btn btn--primary">✦ Generate New</a>
    <a href="${ROUTES.presets}" class="btn btn--secondary">◈ Browse Presets</a>
    <a href="${ROUTES.gallery}" class="btn btn--secondary">▦ Explore Gallery</a>
  `;
}
