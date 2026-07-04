import { CONFIG } from '../constants/config.js';
import { store } from '../store/state.js';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function request(endpoint, options = {}) {
  const url = `${CONFIG.apiBaseUrl}${endpoint}`;
  const token = store.get('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  if (CONFIG.mockMode) {
    return mockRequest(endpoint, options);
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new ApiError(data.message || 'Request failed', response.status, data);
    err.data = data;
    throw err;
  }

  return data;
}

async function mockRequest(endpoint, options) {
  await delay(300 + Math.random() * 300);
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  if (endpoint.includes('/auth/login') && method === 'POST') {
    return { user: demoUser(body.email), token: 'mock-jwt' };
  }
  if (endpoint.includes('/auth/signup') && method === 'POST') {
    return {
      user: { ...demoUser(body.email), name: body.name, plan: body.startTrial !== false ? 'trial' : 'free', credits: body.startTrial !== false ? 200 : 50 },
      token: 'mock-jwt',
      message: 'Trial started',
    };
  }
  if (endpoint.includes('/auth/forgot')) return { message: 'Reset link sent' };
  if (endpoint.includes('/generate') && method === 'POST') {
    const count = body.count || 1;
    return {
      images: Array.from({ length: count }, (_, i) => ({
        id: `gen-${Date.now()}-${i}`,
        url: `https://image.pollinations.ai/prompt/${encodeURIComponent(body.prompt)}?width=512&height=512&seed=${Date.now() + i}&nologo=true`,
        prompt: body.prompt,
      })),
      creditsRemaining: 40,
    };
  }
  if (endpoint.includes('/billing/checkout')) {
    return { message: 'Trial activated', demo: true, user: demoUser() };
  }
  return { success: true };
}

function demoUser(email = 'demo@lumina.ai') {
  return { id: '1', name: 'Demo User', email, credits: 200, plan: 'trial' };
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function get(endpoint) {
  return request(endpoint, { method: 'GET' });
}

export function post(endpoint, body) {
  return request(endpoint, { method: 'POST', body: JSON.stringify(body) });
}

export function del(endpoint) {
  return request(endpoint, { method: 'DELETE' });
}

/** Check if live API is available */
export async function probeApi() {
  try {
    const base = CONFIG.apiBaseUrl.replace(/\/api\/v1\/?$/, '');
    const res = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
