import { createElement } from '../lib/utils.js';

let container;

function getContainer() {
  if (!container) {
    container = createElement('div', { className: 'toast-container', id: 'toast-container' });
    document.body.appendChild(container);
  }
  return container;
}

export function toast(message, type = 'info', duration = 4000) {
  const el = createElement('div', {
    className: `toast toast--${type}`,
    html: `<span>${message}</span>`,
  });
  getContainer().appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(100%)';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

export function toastSuccess(msg) { toast(msg, 'success'); }
export function toastError(msg) { toast(msg, 'error'); }
