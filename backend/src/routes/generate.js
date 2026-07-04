import { Router } from 'express';
import { z } from 'zod';
import { authRequired } from '../middleware/auth.js';
import { updateUser, addGeneration, getUserGenerations, deleteGeneration } from '../db.js';
import { generateImages } from '../services/imageService.js';
import { config } from '../config.js';

const router = Router();

function getEffectiveCredits(user) {
  if (user.plan === 'trial' && user.trialEndsAt) {
    if (new Date(user.trialEndsAt) < new Date()) {
      return { credits: user.credits, planExpired: true };
    }
  }
  if (user.plan === 'enterprise') return { credits: 99999 };
  if (user.plan === 'pro') return { credits: user.credits ?? config.plans.pro.credits };
  return { credits: user.credits ?? config.freeMonthlyCredits };
}

const generateSchema = z.object({
  prompt: z.string().min(3).max(2000),
  style: z.string().optional().default('realistic'),
  ratio: z.string().optional().default('1:1'),
  resolution: z.string().optional().default('1024'),
  count: z.number().int().min(1).max(4).optional().default(1),
  enhance: z.boolean().optional(),
  seed: z.string().optional(),
});

router.post('/', authRequired, async (req, res) => {
  try {
    const body = generateSchema.parse({
      ...req.body,
      count: parseInt(req.body.count, 10) || 1,
    });

    const { findUserById } = await import('../db.js');
    const user = findUserById(req.userId);
    const { credits, planExpired } = getEffectiveCredits(user);

    if (planExpired) {
      return res.status(402).json({
        message: 'Your Pro trial has ended. Upgrade to continue.',
        code: 'TRIAL_EXPIRED',
      });
    }

    if (credits < body.count) {
      return res.status(402).json({
        message: 'Insufficient credits. Upgrade your plan or wait for monthly reset.',
        code: 'INSUFFICIENT_CREDITS',
        credits,
      });
    }

    const images = await generateImages({
      prompt: body.prompt,
      count: body.count,
      style: body.style,
      ratio: body.ratio,
      resolution: body.resolution,
    });

    const newCredits = Math.max(0, credits - body.count);
    updateUser(req.userId, { credits: newCredits });

    const generation = addGeneration({
      userId: req.userId,
      prompt: body.prompt,
      style: body.style,
      images,
    });

    const updated = findUserById(req.userId);
    const { sanitizeUser } = await import('../db.js');
    res.json({
      images,
      generationId: generation.id,
      creditsRemaining: newCredits,
      user: sanitizeUser(updated),
    });
  } catch (e) {
    if (e.name === 'ZodError') {
      return res.status(400).json({ message: e.errors[0]?.message || 'Invalid request' });
    }
    console.error('Generate error:', e);
    res.status(500).json({ message: e.message || 'Generation failed' });
  }
});

router.get('/history', authRequired, (req, res) => {
  const history = getUserGenerations(req.userId);
  res.json({ history });
});

router.delete('/history/:id', authRequired, (req, res) => {
  const ok = deleteGeneration(req.params.id, req.userId);
  if (!ok) return res.status(404).json({ message: 'Not found' });
  res.json({ success: true });
});

export default router;
