import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './src/config.js';

import authRoutes from './src/routes/auth.js';
import generateRoutes from './src/routes/generate.js';
import galleryRoutes from './src/routes/gallery.js';
import billingRoutes from './src/routes/billing.js';
import contactRoutes from './src/routes/contact.js';
import configRoutes from './src/routes/config.js';
import imageRoutes from './src/routes/images.js';
import { findUserById, sanitizeUser } from './src/db.js';
import jwt from 'jsonwebtoken';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.join(__dirname, '../frontend');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: [config.frontendUrl, config.appUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
});
app.use('/api/', limiter);

const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { message: 'Too many generations. Please wait a minute.' },
});
app.use('/api/v1/generate', generateLimiter);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/generate', generateRoutes);
app.use('/api/v1/gallery', galleryRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/config', configRoutes);
app.use('/api/v1/images', imageRoutes);

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: config.env, timestamp: new Date().toISOString() });
});

// Auth me (clean)
app.get('/api/v1/auth/me', (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const payload = jwt.verify(header.slice(7), config.jwt.secret);
    const user = findUserById(payload.sub);
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ user: sanitizeUser(user) });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Serve frontend static files (production single-server deploy)
app.use(express.static(FRONTEND_ROOT, {
  index: 'index.html',
  extensions: ['html'],
}));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (req.path.includes('.')) return next();
  res.sendFile(path.join(FRONTEND_ROOT, 'index.html'));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`
  ✦ Lumina AI is running
  → App:    ${config.appUrl}
  → API:    ${config.appUrl}/api/v1
  → Health: ${config.appUrl}/api/health
  `);
});
