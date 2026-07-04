import { getHistory, removeHistory } from '../store/state.js';
import { ROUTES } from '../constants/config.js';
import { CONFIG } from '../constants/config.js';
import { formatDate, $ } from '../lib/utils.js';
import { get, del } from '../services/api.js';
import { toastSuccess, toastError } from '../components/toast.js';

export async function initHistory() {
  const container = $('#history-list');
  if (!container) return;

  await renderHistory();

  $('#history-filter')?.addEventListener('change', (e) => {
    renderHistory(e.target.value);
  });
}

async function renderHistory(filter = 'all') {
  const container = $('#history-list');
  let history = [];

  if (!CONFIG.mockMode) {
    try {
      const data = await get('/generate/history');
      history = data.history || [];
    } catch {
      history = getHistory();
    }
  } else {
    history = getHistory();
  }

  if (filter === 'week') {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    history = history.filter((h) => new Date(h.createdAt).getTime() > weekAgo);
  }

  if (!history.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">↺</div>
        <h3 class="empty-state__title">No history yet</h3>
        <p class="empty-state__desc">Your generations will appear here.</p>
        <a href="${ROUTES.generate}" class="btn btn--primary">Start Creating</a>
      </div>
    `;
    return;
  }

  container.innerHTML = history.map((entry) => `
    <article class="card reveal is-visible" style="display:grid;grid-template-columns:auto 1fr auto;gap:1rem;align-items:center;padding:1rem">
      <div style="display:flex;gap:0.5rem">
        ${(entry.images || []).slice(0, 3).map((img) => `
          <img src="${img.url}" alt="" style="width:64px;height:64px;object-fit:cover;border-radius:8px">
        `).join('')}
      </div>
      <div>
        <p style="font-weight:500;margin-bottom:0.25rem">${escape(entry.prompt)}</p>
        <p style="font-size:0.8rem;color:var(--color-text-muted)">${formatDate(entry.createdAt)} · ${entry.style || 'default'}</p>
      </div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <button class="btn btn--secondary btn--sm" data-rerun="${entry.id}">↺ Re-run</button>
        <button class="btn btn--ghost btn--sm" data-delete="${entry.id}">Delete</button>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('[data-rerun]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const entry = history.find((h) => h.id === btn.dataset.rerun);
      if (entry?.prompt) {
        sessionStorage.setItem('lumina_pending_prompt', entry.prompt);
        window.location.href = ROUTES.generate;
      }
    });
  });

  container.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        if (!CONFIG.mockMode) await del(`/generate/history/${btn.dataset.delete}`);
        else removeHistory(btn.dataset.delete);
        toastSuccess('Removed');
        await renderHistory(filter);
      } catch (e) {
        toastError(e.message || 'Delete failed');
      }
    });
  });
}

function escape(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
