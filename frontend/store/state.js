import { CONFIG } from '../constants/config.js';

/** Simple reactive store with localStorage persistence */
class Store {
  constructor() {
    this.listeners = new Map();
    this._cache = {};
  }

  get(key) {
    if (this._cache[key] !== undefined) return this._cache[key];
    const storageKey = CONFIG.storageKeys[key] || key;
    try {
      const raw = localStorage.getItem(storageKey);
      this._cache[key] = raw ? JSON.parse(raw) : null;
    } catch {
      this._cache[key] = null;
    }
    return this._cache[key];
  }

  set(key, value) {
    this._cache[key] = value;
    const storageKey = CONFIG.storageKeys[key] || key;
    if (value === null) localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, JSON.stringify(value));
    this.notify(key, value);
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) this.listeners.set(key, new Set());
    this.listeners.get(key).add(callback);
    return () => this.listeners.get(key)?.delete(callback);
  }

  notify(key, value) {
    this.listeners.get(key)?.forEach((cb) => cb(value));
  }
}

export const store = new Store();

export function getUser() {
  return store.get('user');
}

export function setUser(user) {
  if (!user) {
    store.set('user', null);
    store.set('token', null);
    return;
  }
  const { token, ...profile } = user;
  store.set('user', profile);
  // Only update token when explicitly provided — never clear on profile updates
  if (token) store.set('token', token);
}

/** Update credits/plan after generation or billing without touching auth token */
export function updateUserProfile(patch) {
  const user = getUser();
  if (user) store.set('user', { ...user, ...patch });
}

export function setAuthSession(user, token) {
  const { token: embedded, ...profile } = user || {};
  store.set('user', profile);
  store.set('token', token || embedded || null);
}

export function isLoggedIn() {
  return !!store.get('token');
}

export function getFavorites() {
  return store.get('favorites') || [];
}

export function toggleFavorite(id) {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(id);
  store.set('favorites', favs);
  return favs.includes(id);
}

export function getSaved() {
  return store.get('saved') || [];
}

export function toggleSaved(item) {
  const saved = getSaved();
  const idx = saved.findIndex((s) => s.id === item.id);
  if (idx >= 0) saved.splice(idx, 1);
  else saved.unshift(item);
  store.set('saved', saved);
  return saved.some((s) => s.id === item.id);
}

export function getHistory() {
  return store.get('history') || [];
}

export function addHistory(entry) {
  const history = getHistory();
  history.unshift({ ...entry, id: entry.id || Date.now().toString(), createdAt: new Date().toISOString() });
  store.set('history', history.slice(0, 100));
}

export function removeHistory(id) {
  store.set('history', getHistory().filter((h) => h.id !== id));
}

export function getFavoritePresets() {
  return store.get('presets') || [];
}

export function togglePresetFavorite(id) {
  const presets = getFavoritePresets();
  const idx = presets.indexOf(id);
  if (idx >= 0) presets.splice(idx, 1);
  else presets.push(id);
  store.set('presets', presets);
  return presets.includes(id);
}
