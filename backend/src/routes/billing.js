import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { updateUser, sanitizeUser, findUserById } from '../db.js';
import { config } from '../config.js';

const router = Router();

router.get('/plans', (_req, res) => {
  res.json({
    plans: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        period: 'month',
        description: 'Explore AI art with no credit card',
        features: ['50 credits/month', 'Standard resolution', 'Community gallery', 'Basic styles'],
        cta: 'Get Started Free',
        featured: false,
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 29,
        period: 'month',
        description: 'For creators and professionals',
        trialDays: config.trial.days,
        trialCredits: config.trial.credits,
        features: [
          `${config.trial.days}-day free trial — ${config.trial.credits} credits`,
          '2,000 credits/month after trial',
          'Up to 4K resolution',
          'All style presets',
          'Commercial license',
          'Priority generation',
          'API access',
        ],
        cta: 'Start 7-Day Free Trial',
        featured: true,
        badge: 'Best Value',
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99,
        period: 'month',
        description: 'For teams and businesses',
        features: ['Unlimited credits', 'Custom models', 'Dedicated support', 'SSO', 'SLA', 'White-label'],
        cta: 'Contact Sales',
        featured: false,
      },
    ],
  });
});

router.post('/checkout', authRequired, async (req, res) => {
  const { plan } = req.body || {};
  if (!['pro', 'enterprise'].includes(plan)) {
    return res.status(400).json({ message: 'Invalid plan' });
  }

  if (!config.stripe.secretKey) {
    const user = findUserById(req.userId);
    if (plan === 'pro' && !user.trialUsed) {
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + config.trial.days);
      const updated = updateUser(req.userId, {
        plan: 'trial',
        trialEndsAt: trialEnds.toISOString(),
        credits: config.trial.credits,
        trialUsed: true,
      });
      return res.json({
        message: 'Pro trial activated (demo mode — add Stripe keys for real payments)',
        user: sanitizeUser(updated),
        demo: true,
      });
    }
    if (plan === 'pro') {
      const updated = updateUser(req.userId, {
        plan: 'pro',
        credits: config.plans.pro.credits,
      });
      return res.json({ message: 'Upgraded to Pro (demo)', user: sanitizeUser(updated), demo: true });
    }
    return res.json({ message: 'Contact sales@lumina.ai for Enterprise', demo: true });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(config.stripe.secretKey);
    const priceId = plan === 'pro' ? config.stripe.pricePro : config.stripe.priceEnterprise;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: req.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${config.frontendUrl}/billing.html?success=1`,
      cancel_url: `${config.frontendUrl}/pricing.html?canceled=1`,
      subscription_data: plan === 'pro' ? { trial_period_days: config.trial.days } : undefined,
      metadata: { userId: req.userId, plan },
    });

    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Checkout failed' });
  }
});

router.get('/subscription', authRequired, (req, res) => {
  const user = findUserById(req.userId);
  res.json({
    plan: user.plan,
    credits: user.credits,
    trialEndsAt: user.trialEndsAt,
    trialUsed: user.trialUsed,
  });
});

export default router;
