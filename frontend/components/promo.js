import { CONFIG, ROUTES } from '../constants/config.js';

export function renderPromoBar() {
  if (sessionStorage.getItem('lumina_promo_closed')) return;

  const bar = document.createElement('div');
  bar.className = 'promo-bar';
  bar.setAttribute('role', 'banner');
  bar.innerHTML = `
    <span>🎁 <strong>7-Day Pro Trial</strong> — ${CONFIG.trialCredits} free credits. No credit card required.</span>
    <a href="${ROUTES.signup}">Start free trial →</a>
    <button class="promo-bar__close" type="button" aria-label="Dismiss">×</button>
  `;

  document.body.classList.add('has-promo-bar');
  document.body.prepend(bar);

  bar.querySelector('.promo-bar__close')?.addEventListener('click', () => {
    bar.remove();
    document.body.classList.remove('has-promo-bar');
    sessionStorage.setItem('lumina_promo_closed', '1');
  });
}

export function renderTrustStrip(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="trust-strip reveal">
      <div class="trust-strip__item"><strong>✓</strong> 7-day free trial</div>
      <div class="trust-strip__item"><strong>✓</strong> No credit card to start</div>
      <div class="trust-strip__item"><strong>✓</strong> Commercial license on Pro</div>
      <div class="trust-strip__item"><strong>✓</strong> Cancel anytime</div>
      <div class="trust-strip__item"><strong>SSL</strong> Secure payments</div>
    </div>
  `;
}
