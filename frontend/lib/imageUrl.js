import { CONFIG } from '../constants/config.js';

/** Serve external AI images through our API proxy (avoids ad-blockers & hotlink issues) */
export function getDisplayImageUrl(originalUrl) {
  if (!originalUrl) return '';
  if (originalUrl.startsWith('data:')) return originalUrl;

  try {
    const parsed = new URL(originalUrl);
    if (parsed.hostname === 'image.pollinations.ai' || parsed.hostname.includes('replicate.delivery')) {
      const base = CONFIG.apiBaseUrl.replace(/\/api\/v1\/?$/, '');
      return `${base}/api/v1/images/proxy?url=${encodeURIComponent(originalUrl)}`;
    }
  } catch { /* use px */ }

  return originalUrl;
}
