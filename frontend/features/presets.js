import { getPresets } from '../services/dataService.js';
import { getFavoritePresets, togglePresetFavorite } from '../store/state.js';
import { ROUTES } from '../constants/config.js';
import { $ } from '../lib/utils.js';
import { toastSuccess } from '../components/toast.js';

export async function initPresets() {
  const grid = $('#presets-grid');
  if (!grid) return;

  const presets = await getPresets();
  const favorites = getFavoritePresets();

  grid.innerHTML = presets.map((p) => `
    <article class="card style-card reveal" data-preset-id="${p.id}">
      <img class="style-card__img" data-src="${p.image}" alt="${p.name}" loading="lazy">
      <div class="style-card__label" style="display:flex;justify-content:space-between;align-items:center">
        <span>${p.name}</span>
        <button class="btn btn--ghost btn--sm btn-fav-preset ${favorites.includes(p.id) ? 'is-active' : ''}" data-fav="${p.id}" aria-label="Favorite">★</button>
      </div>
      <div style="padding:0 1rem 1rem;display:flex;gap:0.5rem">
        <button class="btn btn--primary btn--sm btn-apply" data-apply="${p.id}" style="flex:1">Apply</button>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.btn-fav-preset').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const active = togglePresetFavorite(btn.dataset.fav);
      btn.classList.toggle('is-active', active);
      toastSuccess(active ? 'Added to favorites' : 'Removed');
    });
  });

  grid.querySelectorAll('.btn-apply').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = presets.find((p) => p.id === btn.dataset.apply);
      sessionStorage.setItem('lumina_pending_style', preset?.style || preset?.id);
      if (preset?.promptHint) {
        sessionStorage.setItem('lumina_pending_prompt', preset.promptHint);
      }
      toastSuccess(`Applied ${preset?.name} preset`);
      setTimeout(() => { window.location.href = ROUTES.generate; }, 600);
    });
  });
}
