import { post, get } from '../services/api.js';
import { updateUserProfile, isLoggedIn } from '../store/state.js';
import { ROUTES } from '../constants/config.js';
import { toastSuccess, toastError } from '../components/toast.js';

export async function initBillingPage() {
  const upgradeBtns = document.querySelectorAll('[data-upgrade-plan]');
  const params = new URLSearchParams(window.location.search);

  if (params.get('success') === '1') {
    toastSuccess('Subscription active! Welcome to Pro.');
  }

  upgradeBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!isLoggedIn()) {
        window.location.href = `${ROUTES.signup}?plan=${btn.dataset.upgradePlan}`;
        return;
      }
      btn.disabled = true;
      try {
        const data = await post('/billing/checkout', { plan: btn.dataset.upgradePlan });
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        if (data.user) updateUserProfile(data.user);
        toastSuccess(data.message || 'Plan updated!');
        setTimeout(() => window.location.reload(), 800);
      } catch (e) {
        toastError(e.message || 'Checkout failed');
      } finally {
        btn.disabled = false;
      }
    });
  });

  if (isLoggedIn()) {
    try {
      const sub = await get('/billing/subscription');
      const el = document.getElementById('billing-status');
      if (el) {
        el.innerHTML = `
          <span class="badge">${sub.plan}</span>
          <strong style="margin-left:0.5rem">${sub.credits} credits</strong>
          ${sub.trialEndsAt ? `<span style="color:var(--color-text-muted);font-size:0.875rem;margin-left:0.5rem">Trial ends ${new Date(sub.trialEndsAt).toLocaleDateString()}</span>` : ''}
        `;
      }
    } catch { /* ignore */ }
  }
}
