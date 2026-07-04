import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config.js';
import {
  findUserByEmail,
  createUser,
  updateUser,
  sanitizeUser,
} from '../db.js';

const router = Router();

function signToken(userId) {
  return jwt.sign({ sub: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

function startTrial(user) {
  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + config.trial.days);
  return {
    plan: 'trial',
    trialEndsAt: trialEnds.toISOString(),
    credits: config.trial.credits,
    trialUsed: true,
  };
}

const signupSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  startTrial: z.boolean().optional().default(true),
});

router.post('/signup', async (req, res) => {
  try {
    const body = signupSchema.parse(req.body);
    if (findUserByEmail(body.email)) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    let user = createUser({
      name: body.name,
      email: body.email.toLowerCase(),
      passwordHash,
      plan: 'free',
      credits: config.freeMonthlyCredits,
      trialUsed: false,
      trialEndsAt: null,
    });

    if (body.startTrial !== false) {
      user = updateUser(user.id, startTrial(user));
    }

    const token = signToken(user.id);
    res.status(201).json({
      user: sanitizeUser(user),
      token,
      message: body.startTrial !== false
        ? `Pro trial started — ${config.trial.credits} credits for ${config.trial.days} days`
        : 'Account created',
    });
  } catch (e) {
    if (e.name === 'ZodError') {
      return res.status(400).json({ message: e.errors[0]?.message || 'Invalid input' });
    }
    res.status(500).json({ message: e.message || 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }).parse(req.body);

    const user = findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user.id);
    res.json({ user: sanitizeUser(user), token });
  } catch (e) {
    if (e.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/forgot', async (req, res) => {
  const { email } = req.body || {};
  if (email) findUserByEmail(email);
  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

export default router;
