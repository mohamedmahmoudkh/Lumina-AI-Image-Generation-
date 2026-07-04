import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../../frontend/data');

function readJson(name) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'));
  } catch {
    return [];
  }
}

router.get('/public', (_req, res) => {
  res.json({
    appName: 'Lumina AI',
    tagline: 'Turn Your Ideas Into Stunning AI Art in Seconds',
    trial: config.trial,
    freeCredits: config.freeMonthlyCredits,
    hasStripe: !!config.stripe.secretKey,
    hasReplicate: !!config.replicateToken,
    apiVersion: 'v1',
  });
});

router.get('/features', (_req, res) => res.json(readJson('features.json')));
router.get('/faq', (_req, res) => res.json(readJson('faq.json')));
router.get('/testimonials', (_req, res) => res.json(readJson('testimonials.json')));
router.get('/pricing', (_req, res) => res.json(readJson('pricing.json')));

export default router;
