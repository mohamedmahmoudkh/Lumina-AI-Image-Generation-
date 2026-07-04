import { CONFIG } from '../constants/config.js';
import { get } from './api.js';

const cache = new Map();

async function loadJSON(path) {
  if (cache.has(path)) return cache.get(path);
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  const data = await response.json();
  cache.set(path, data);
  return data;
}

async function apiOrLocal(apiPath, localFile, transform) {
  if (!CONFIG.mockMode) {
    try {
      const data = await get(apiPath);
      return transform ? transform(data) : data;
    } catch (e) {
      console.warn(`API ${apiPath} failed, using local data`, e);
    }
  }
  return loadJSON(localFile);
}

export async function getGalleryItems(page = 1, limit = 12, filters = {}) {
  if (!CONFIG.mockMode) {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(filters.category && filters.category !== 'all' && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
        ...(filters.sort && { sort: filters.sort }),
      });
      return await get(`/gallery?${params}`);
    } catch (e) {
      console.warn('Gallery API fallback', e);
    }
  }

  const all = await loadJSON('/data/gallery.json');
  let items = [...all];
  if (filters.category && filters.category !== 'all') {
    items = items.filter((i) => i.category === filters.category);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter((i) => i.prompt.toLowerCase().includes(q));
  }
  if (filters.sort === 'trending') items.sort((a, b) => b.likes - a.likes);
  else items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    total: items.length,
    hasMore: start + limit < items.length,
    page,
  };
}

export async function getStyles() {
  return loadJSON('/data/styles.json');
}

export async function getFeatures() {
  return apiOrLocal('/config/features', '/data/features.json');
}

export async function getPricing() {
  if (!CONFIG.mockMode) {
    try {
      const { plans } = await get('/billing/plans');
      return plans;
    } catch {
      /* fallback */
    }
  }
  return loadJSON('/data/pricing.json');
}

export async function getTestimonials() {
  return apiOrLocal('/config/testimonials', '/data/testimonials.json');
}

export async function getFaq() {
  return apiOrLocal('/config/faq', '/data/faq.json');
}

export async function getPresets() {
  if (!CONFIG.mockMode) {
    try {
      return await get('/gallery/presets');
    } catch { /* fallback */ }
  }
  return loadJSON('/data/presets.json');
}

export async function getPromptSuggestions() {
  return loadJSON('/data/prompt-suggestions.json');
}

export async function getPublicConfig() {
  if (!CONFIG.mockMode) {
    try {
      return await get('/config/public');
    } catch { /* ignore */ }
  }
  return { trial: { days: CONFIG.trialDays, credits: CONFIG.trialCredits } };
}
