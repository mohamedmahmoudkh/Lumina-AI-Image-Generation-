import { createElement, $ } from '../lib/utils.js';

let activeModal = null;

export function openModal({ title, content, size = 'default', onClose }) {
  closeModal();

  const backdrop = createElement('div', {
    className: 'modal-backdrop',
    id: 'modal-backdrop',
    onClick: (e) => {
      if (e.target === backdrop) closeModal();
    },
  });

  const modal = createElement('div', { className: 'modal' });
  const header = createElement('div', { className: 'modal__header' });
  header.appendChild(createElement('h3', { text: title || '' }));
  const closeBtn = createElement('button', {
    className: 'modal__close',
    text: '✕',
    'aria-label': 'Close',
    onClick: () => closeModal(),
  });
  header.appendChild(closeBtn);

  const body = createElement('div', { className: 'modal__body' });
  if (typeof content === 'string') body.innerHTML = content;
  else if (content instanceof HTMLElement) body.appendChild(content);
  else if (content) body.innerHTML = content;

  modal.appendChild(header);
  modal.appendChild(body);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  document.body.style.overflow = 'hidden';

  activeModal = { backdrop, onClose };
  requestAnimationFrame(() => backdrop.classList.add('is-open'));

  const onKey = (e) => {
    if (e.key === 'Escape') closeModal();
  };
  document.addEventListener('keydown', onKey);
  backdrop._onKey = onKey;
}

export function closeModal() {
  if (!activeModal) return;
  const { backdrop, onClose } = activeModal;
  backdrop.classList.remove('is-open');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', backdrop._onKey);
  setTimeout(() => {
    backdrop.remove();
    onClose?.();
  }, 250);
  activeModal = null;
}

export function openImageModal(item) {
  const content = createElement('div', {});
  const img = createElement('img', {
    src: item.image || item.url,
    alt: item.prompt || 'Generated image',
    style: 'width:100%;border-radius:12px;margin-bottom:1rem',
  });
  const prompt = createElement('p', {
    text: item.prompt || '',
    style: 'color:var(--color-text-muted);font-size:0.9rem',
  });
  const meta = createElement('div', {
    className: 'gallery-card__meta',
    html: `<span>♥ ${item.likes || 0}</span><span>${item.author || 'Anonymous'}</span>`,
  });
  content.append(img, prompt, meta);
  openModal({ title: 'Preview', content });
}
