import { post } from '../services/api.js';
import { setUser, store, setAuthSession } from '../store/state.js';
import { ROUTES } from '../constants/config.js';
import { $ } from '../lib/utils.js';
import { toastSuccess, toastError } from '../components/toast.js';

export function initAuth() {
  initLogin();
  initSignup();
  initForgotPassword();
}

function initLogin() {
  const form = $('#login-form');
  if (!form) return;

  initPasswordToggle(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value;

    if (!validateEmail(email)) {
      showError(form.email, 'Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      showError(form.password, 'Password must be at least 6 characters');
      return;
    }

    const btn = form.querySelector('[type="submit"]');
    setLoading(btn, true);

    try {
      const data = await post('/auth/login', { email, password });
      setAuthSession(data.user, data.token);
      toastSuccess('Welcome back!');
      window.location.href = ROUTES.dashboard;
    } catch (err) {
      toastError(err.message || 'Login failed');
    } finally {
      setLoading(btn, false);
    }
  });
}

function initSignup() {
  const form = $('#signup-form');
  if (!form) return;

  initPasswordToggle(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirm = form.confirm?.value;

    clearErrors(form);

    if (!name) return showError(form.name, 'Name is required');
    if (!validateEmail(email)) return showError(form.email, 'Valid email required');
    if (password.length < 8) return showError(form.password, 'Min 8 characters');
    if (password !== confirm) return showError(form.confirm, 'Passwords do not match');

    const btn = form.querySelector('[type="submit"]');
    setLoading(btn, true);

    try {
      const startTrial = form.startTrial?.checked !== false;
      const data = await post('/auth/signup', { name, email, password, startTrial });
      setAuthSession(data.user, data.token);
      toastSuccess(data.message || (startTrial ? '7-day Pro trial started!' : 'Account created!'));
      window.location.href = ROUTES.dashboard;
    } catch (err) {
      toastError(err.message || 'Signup failed');
    } finally {
      setLoading(btn, false);
    }
  });
}

function initForgotPassword() {
  const form = $('#forgot-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    if (!validateEmail(email)) return showError(form.email, 'Valid email required');

    const btn = form.querySelector('[type="submit"]');
    setLoading(btn, true);

    try {
      await post('/auth/forgot', { email });
      toastSuccess('Reset link sent to your email');
      form.reset();
    } catch (err) {
      toastError(err.message || 'Request failed');
    } finally {
      setLoading(btn, false);
    }
  });
}

function initPasswordToggle(form) {
  form.querySelectorAll('[data-toggle-password]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = form.querySelector(btn.dataset.togglePassword);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.textContent = isPassword ? '🙈' : '👁';
    });
  });
}

function storeToken(token) {
  store.set('token', token);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(input, message) {
  input.classList.add('form-input--error');
  let err = input.parentElement?.querySelector('.form-error');
  if (!err) {
    err = document.createElement('p');
    err.className = 'form-error';
    input.parentElement?.appendChild(err);
  }
  err.textContent = message;
}

function clearErrors(form) {
  form.querySelectorAll('.form-input--error').forEach((i) => i.classList.remove('form-input--error'));
  form.querySelectorAll('.form-error').forEach((e) => e.remove());
}

function setLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn.classList.toggle('btn--loading', loading);
}
