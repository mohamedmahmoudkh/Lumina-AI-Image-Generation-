import 'dotenv/config';

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  appUrl: process.env.APP_URL || 'http://localhost:4000',
  frontendUrl: process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:4000',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-only-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  trial: {
    days: parseInt(process.env.TRIAL_DAYS || '7', 10),
    credits: parseInt(process.env.TRIAL_CREDITS || '200', 10),
  },
  freeMonthlyCredits: parseInt(process.env.FREE_MONTHLY_CREDITS || '50', 10),
  replicateToken: process.env.REPLICATE_API_TOKEN || '',
  stabilityKey: process.env.STABILITY_API_KEY || '',
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    pricePro: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    priceEnterprise: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || '',
  },
  plans: {
    free: { id: 'free', credits: 50, name: 'Free' },
    trial: { id: 'trial', credits: 200, name: 'Pro Trial' },
    pro: { id: 'pro', credits: 2000, name: 'Pro', price: 29 },
    enterprise: { id: 'enterprise', credits: 99999, name: 'Enterprise', price: 99 },
  },
};
