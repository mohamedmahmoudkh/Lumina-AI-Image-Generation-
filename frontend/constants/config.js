/**
 * Application configuration
 */
const env = window.__ENV__ || {};

export const CONFIG = {
  appName: 'Lumina AI',
  tagline: 'Turn Your Ideas Into Stunning AI Art in Seconds',
  apiBaseUrl: env.API_BASE_URL || '/api/v1',
  mockMode: env.MOCK_MODE === 'true',
  appUrl: env.APP_URL || '',
  trialDays: parseInt(env.TRIAL_DAYS || '7', 10),
  trialCredits: parseInt(env.TRIAL_CREDITS || '200', 10),
  storageKeys: {
    user: 'lumina_user',
    token: 'lumina_token',
    theme: 'lumina_theme',
    favorites: 'lumina_favorites',
    saved: 'lumina_saved',
    history: 'lumina_history',
    presets: 'lumina_presets',
  },
  pagination: { gallery: 12, history: 10 },
  promptMaxLength: 2000,
  defaultCredits: 50,
};

export const ROUTES = {
  home: 'index.html',
  about: 'about.html',
  features: 'features.html',
  pricing: 'pricing.html',
  gallery: 'gallery.html',
  contact: 'contact.html',
  faq: 'faq.html',
  terms: 'terms.html',
  privacy: 'privacy.html',
  login: 'login.html',
  signup: 'signup.html',
  forgotPassword: 'forgot-password.html',
  dashboard: 'dashboard.html',
  generate: 'generate.html',
  saved: 'saved.html',
  history: 'history.html',
  presets: 'presets.html',
  billing: 'billing.html',
  settings: 'settings.html',
  profile: 'profile.html',
};

export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 };
