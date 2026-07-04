import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPublicGallery } from '../db.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.get('/', optionalAuth, (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 12, 48);
  const result = getPublicGallery({
    page,
    limit,
    category: req.query.category,
    search: req.query.search,
    sort: req.query.sort || 'latest',
  });
  res.json(result);
});

router.get('/presets', (_req, res) => {
  try {
    const presetsPath = path.join(__dirname, '../../../frontend/data/presets.json');
    const data = JSON.parse(fs.readFileSync(presetsPath, 'utf8'));
    res.json(data);
  } catch {
    res.json([]);
  }
});

export default router;
