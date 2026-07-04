import { Router } from 'express';

const router = Router();
const ALLOWED_HOSTS = ['image.pollinations.ai', 'picsum.photos', 'replicate.delivery'];

router.get('/proxy', async (req, res) => {
  try {
    const raw = req.query.url;
    if (!raw || typeof raw !== 'string') {
      return res.status(400).json({ message: 'Missing url parameter' });
    }

    let parsed;
    try {
      parsed = new URL(raw);
    } catch {
      return res.status(400).json({ message: 'Invalid URL' });
    }

    if (!ALLOWED_HOSTS.some((h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`))) {
      return res.status(403).json({ message: 'URL not allowed' });
    }

    const upstream = await fetch(raw, {
      headers: { 'User-Agent': 'LuminaAI/1.0' },
      signal: AbortSignal.timeout(120000),
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ message: 'Failed to fetch image' });
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=604800');
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (e) {
    console.error('Image proxy error:', e.message);
    res.status(502).json({ message: 'Image proxy failed' });
  }
});

export default router;
