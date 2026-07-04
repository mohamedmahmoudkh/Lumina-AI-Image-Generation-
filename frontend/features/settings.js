import { getUser, updateUserProfile } from '../store/state.js';
import { $ } from '../lib/utils.js';
import { toastSuccess } from '../components/toast.js';

export function initSettings() {
  initSettingsNav();
  initProfileForm();
  initThemeToggle();
  initNotifications();
}

function initSettingsNav() {
  const links = document.querySelectorAll('[data-settings-section]');
  const sections = document.querySelectorAll('.settings-section');

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.dataset.settingsSection;
      links.forEach((l) => l.classList.remove('is-active'));
      sections.forEach((s) => s.classList.remove('is-active'));
      link.classList.add('is-active');
      document.getElementById(`settings-${id}`)?.classList.add('is-active');
    });
  });
}

function initProfileForm() {
  const form = $('#profile-form');
  const user = getUser();
  if (form && user) {
    form.name.value = user.name || '';
    form.email.value = user.email || '';
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = { ...getUser(), name: form.name.value, email: form.email.value };
    updateUserProfile(updated);
    toastSuccess('Profile updated');
  });
}

function initThemeToggle() {
  const select = $('#theme-select');
  const saved = localStorage.getItem('lumina_theme') || 'dark';
  if (select) select.value = saved;

  select?.addEventListener('change', (e) => {
    localStorage.setItem('lumina_theme', e.target.value);
    toastSuccess('Theme preference saved');
  });
}

function initNotifications() {
  $('#notifications-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    toastSuccess('Notification preferences saved');
  });

  $('#security-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    toastSuccess('Security settings updated');
  });

  $('#api-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    toastSuccess('API key regenerated (demo)');
  });
}

export function initSaved() {
  const grid = $('#saved-grid');
  if (!grid) return;

  import('../store/state.js').then(({ getSaved, toggleSaved }) => {
    const saved = getSaved();
    if (!saved.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state__icon">♡</div>
          <h3 class="empty-state__title">No saved images</h3>
          <p class="empty-state__desc">Save images from the gallery or generator.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = saved.map((item) => `
      <div class="output-card reveal is-visible">
        <img src="${item.url || item.image}" alt="">
        <div class="output-card__actions">
          <button class="btn btn--secondary btn--sm" data-unsave="${item.id}">Remove</button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('[data-unsave]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = saved.find((s) => s.id === btn.dataset.unsave);
        if (item) toggleSaved(item);
        initSaved();
      });
    });
  });
}
