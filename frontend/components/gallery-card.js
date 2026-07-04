import { formatNumber } from '../lib/utils.js';
import { toggleFavorite, getFavorites, toggleSaved, getSaved } from '../store/state.js';
import { openImageModal } from './modal.js';
import { toastSuccess } from './toast.js';

export function createGalleryCard(item) {
  const card = document.createElement('article');
  card.className = 'gallery-card reveal';
  card.dataset.id = item.id;

  const isLiked = getFavorites().includes(item.id);
  const isSaved = getSaved().some((s) => s.id === item.id);

  card.innerHTML = `
    <img class="gallery-card__img" data-src="${item.image}" alt="${escapeHtml(item.prompt)}" loading="lazy" width="400" height="400">
    <div class="gallery-card__overlay">
      <div class="gallery-card__actions">
        <button class="btn btn--secondary btn--sm btn-like ${isLiked ? 'is-liked' : ''}" aria-label="Like">♥ ${formatNumber(item.likes)}</button>
        <button class="btn btn--secondary btn--sm btn-save ${isSaved ? 'is-saved' : ''}" aria-label="Save">☆ Save</button>
        <button class="btn btn--secondary btn--sm btn-expand" aria-label="Expand">⤢</button>
      </div>
      <p class="gallery-card__prompt">${escapeHtml(item.prompt)}</p>
      <div class="gallery-card__meta">
        <img class="avatar" src="${item.avatar}" alt="" width="24" height="24">
        <span>${escapeHtml(item.author)}</span>
      </div>
    </div>
  `;

  card.querySelector('.btn-like')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const liked = toggleFavorite(item.id);
    e.currentTarget.classList.toggle('is-liked', liked);
    toastSuccess(liked ? 'Added to favorites' : 'Removed from favorites');
  });

  card.querySelector('.btn-save')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const saved = toggleSaved(item);
    e.currentTarget.classList.toggle('is-saved', saved);
    e.currentTarget.textContent = saved ? '★ Saved' : '☆ Save';
    toastSuccess(saved ? 'Saved to collection' : 'Removed from saved');
  });

  card.querySelector('.btn-expand')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openImageModal(item);
  });

  card.addEventListener('click', () => openImageModal(item));

  return card;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
