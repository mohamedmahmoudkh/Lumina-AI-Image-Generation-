import { Router } from 'express';
import { z } from 'zod';
import { addContact } from '../db.js';

const router = Router();

router.post('/', (req, res) => {
  try {
    const body = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      message: z.string().min(10).max(5000),
    }).parse(req.body);

    addContact(body);
    res.json({ message: 'Thank you! We will get back to you within 24 hours.' });
  } catch (e) {
    if (e.name === 'ZodError') {
      return res.status(400).json({ message: e.errors[0]?.message || 'Invalid input' });
    }
    res.status(500).json({ message: 'Failed to send message' });
  }
});

export default router;
