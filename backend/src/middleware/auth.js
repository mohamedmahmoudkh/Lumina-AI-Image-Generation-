import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { findUserById, sanitizeUser } from '../db.js';

export function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, config.jwt.secret);
    const user = findUserById(payload.sub);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = sanitizeUser(user);
    req.userId = user.id;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  try {
    const payload = jwt.verify(header.slice(7), config.jwt.secret);
    const user = findUserById(payload.sub);
    if (user) {
      req.user = sanitizeUser(user);
      req.userId = user.id;
    }
  } catch { /* ignore */ }
  next();
}
