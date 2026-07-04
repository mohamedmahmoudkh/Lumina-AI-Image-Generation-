import { post } from '../services/api.js';
import { CONFIG } from '../constants/config.js';
import { addHistory, getUser, updateUserProfile } from '../store/state.js';
import { getPromptSuggestions } from '../services/dataService.js';
import { getDisplayImageUrl } from '../lib/imageUrl.js';
import { $, clamp } from '../lib/utils.js';
import { toastSuccess, toastError } from '../components/toast.js';
import { toggleSaved } from '../store/state.js';

let generateState = {
  style: 'realistic',
  ratio: '1:1',
  resolution: '1024',
  count: 1,
  creativity: 50,
  seed: '',
  enhance: true,
};

export async function initGenerate() {
  const form = $('#generate-form');
  if (!form) return;

  initPromptBox();
  initControls();
  syncControlsFromDOM();
  await initSuggestions();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await runGeneration();
  });
}

function syncControlsFromDOM() {
  generateState.count = parseInt($('#count-select')?.value, 10) || 1;
  generateState.resolution = $('#resolution-select')?.value || '1024';
  generateState.enhance = $('#enhance-toggle')?.checked !== false;
  generateState.seed = $('#seed-input')?.value || '';
  generateState.creativity = parseInt($('#creativity-range')?.value, 10) || 50;

  const activeStyle = document.querySelector('[data-style].is-active');
  if (activeStyle) generateState.style = activeStyle.dataset.style;

  const activeRatio = document.querySelector('[data-ratio].is-active');
  if (activeRatio) generateState.ratio = activeRatio.dataset.ratio;
}

function initPromptBox() {
  const textarea = $('#prompt-input');
  const counter = $('#prompt-count');
  if (!textarea || !counter) return;

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    counter.textContent = `${len} / ${CONFIG.promptMaxLength}`;
    counter.style.color = len > CONFIG.promptMaxLength ? 'var(--color-error)' : '';
  });
}

async function initSuggestions() {
  const container = $('#prompt-suggestions');
  if (!container) return;

  try {
    const suggestions = await getPromptSuggestions();
    container.innerHTML = suggestions
      .slice(0, 6)
      .map((s) => `<button type="button" class="preset-chip" data-suggestion="${s}">${s}</button>`)
      .join('');

    container.querySelectorAll('[data-suggestion]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = $('#prompt-input');
        if (input) input.value = btn.dataset.suggestion;
        input?.dispatchEvent(new Event('input'));
      });
    });
  } catch { /* ignore */ }
}

function initControls() {
  document.querySelectorAll('[data-style]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-style]').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      generateState.style = btn.dataset.style;
    });
  });

  document.querySelectorAll('[data-ratio]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-ratio]').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      generateState.ratio = btn.dataset.ratio;
    });
  });

  $('#resolution-select')?.addEventListener('change', (e) => {
    generateState.resolution = e.target.value;
  });

  $('#count-select')?.addEventListener('change', (e) => {
    generateState.count = parseInt(e.target.value, 10) || 1;
  });

  $('#creativity-range')?.addEventListener('input', (e) => {
    generateState.creativity = parseInt(e.target.value, 10);
    const label = $('#creativity-value');
    if (label) label.textContent = e.target.value;
  });

  $('#seed-input')?.addEventListener('input', (e) => {
    generateState.seed = e.target.value;
  });

  $('#enhance-toggle')?.addEventListener('change', (e) => {
    generateState.enhance = e.target.checked;
  });
}

async function runGeneration() {
  syncControlsFromDOM();

  const prompt = $('#prompt-input')?.value?.trim();
  if (!prompt) {
    toastError('Please enter a prompt');
    return;
  }
  if (prompt.length > CONFIG.promptMaxLength) {
    toastError('Prompt is too long');
    return;
  }

  const output = $('#output-grid');
  const btn = $('#generate-btn');
  if (!output || !btn) return;

  btn.disabled = true;
  btn.classList.add('btn--loading');

  output.innerHTML = `
    <div class="generating-animation" style="grid-column:1/-1">
      <div class="generating-animation__orb"></div>
      <h3>Creating your vision...</h3>
      <p style="color:var(--color-text-muted);margin-top:0.5rem">This may take 10–30 seconds</p>
      <div class="progress-bar" style="width:200px;margin-top:1.5rem">
        <div class="progress-bar__fill" id="gen-progress" style="width:0%"></div>
      </div>
    </div>
  `;

  animateProgress();

  try {
    const data = await post('/generate', {
      prompt,
      ...generateState,
      count: generateState.count,
      enhance: generateState.enhance,
    });

    const images = data.images || [];
    if (!images.length) {
      throw new Error('No images returned from server');
    }

    output.innerHTML = '';
    images.forEach((img) => {
      output.appendChild(createOutputCard(img, prompt));
    });

    addHistory({ prompt, images, style: generateState.style });

    if (data.user) {
      updateUserProfile(data.user);
    } else if (data.creditsRemaining != null) {
      updateUserProfile({ credits: data.creditsRemaining });
    } else {
      const user = getUser();
      if (user) {
        updateUserProfile({ credits: Math.max(0, (user.credits || 0) - generateState.count) });
      }
    }

    toastSuccess('Generation complete!');
  } catch (err) {
    output.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>${escapeHtml(err.message)}</p></div>`;
    if (err.status === 401) {
      toastError('Session expired — please log in again');
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    } else if (err.status === 402 || err.data?.code === 'TRIAL_EXPIRED' || err.data?.code === 'INSUFFICIENT_CREDITS') {
      toastError(err.message);
      setTimeout(() => { window.location.href = 'billing.html'; }, 1500);
    } else {
      toastError(err.message || 'Generation failed');
    }
  } finally {
    btn.disabled = false;
    btn.classList.remove('btn--loading');
  }
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function animateProgress() {
  const bar = $('#gen-progress');
  if (!bar) return;
  let w = 0;
  const interval = setInterval(() => {
    w = clamp(w + Math.random() * 12, 0, 90);
    bar.style.width = `${w}%`;
    if (w >= 90) clearInterval(interval);
  }, 400);
}

function createOutputCard(img, prompt) {
  const card = document.createElement('div');
  card.className = 'output-card reveal is-visible';
  const displayUrl = getDisplayImageUrl(img.url);
  const safePrompt = prompt.replace(/"/g, '&quot;');

  card.innerHTML = `
    <img src="${displayUrl}" alt="${safePrompt}" loading="eager" referrerpolicy="no-referrer">
    <div class="output-card__actions">
      <a href="${displayUrl}" download="lumina-${img.id || 'image'}.jpg" class="btn btn--secondary btn--sm">↓</a>
      <button type="button" class="btn btn--secondary btn--sm btn-fav">♡</button>
      <button type="button" class="btn btn--secondary btn--sm btn-upscale">↑ HD</button>
      <button type="button" class="btn btn--secondary btn--sm btn-regen">↺</button>
    </div>
  `;

  card.innerHTML = card.innerHTML.replace('</div>', '</div>');

  const imgEl = card.querySelector('img');
  imgEl?.addEventListener('error', () => {
    if (img.url && imgEl.src !== img.url) {
      imgEl.src = img.url;
    } else {
      imgEl.alt = 'Failed to load — try again';
    }
  });

  card.querySelector('.btn-fav')?.addEventListener('click', () => {
    toggleSaved({ id: img.id, url: img.url, prompt });
    toastSuccess('Saved to collection');
  });

  card.querySelector('.btn-upscale')?.addEventListener('click', () => {
    toastSuccess('Upscaling started (demo)');
  });

  card.querySelector('.btn-regen')?.addEventListener('click', () => {
    const input = $('#prompt-input');
    if (input) input.value = prompt;
    runGeneration();
  });

  return card;
}
