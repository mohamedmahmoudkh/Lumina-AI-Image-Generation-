# Lumina AI — Production Deploy Guide

## Quick start (local)

```bash
git clone https://github.com/YOUR_USERNAME/lumina-ai.git
cd lumina-ai
npm run setup          # install deps, seed DB, copy .env
# Edit backend/.env — set JWT_SECRET (required)
npm start              # http://localhost:4000
```

Open **http://localhost:4000** — frontend + API on one server.

---

## What’s included

| Layer | Tech |
|--------|------|
| Frontend | HTML, CSS, vanilla JS (ES modules) |
| Backend | Node.js 18+, Express |
| Database | JSON file (`backend/data/db.json`) — swap for PostgreSQL in production |
| Images | Pollinations (free), or Replicate / Stability with API keys |
| Payments | Stripe (optional) — demo checkout without keys |

---

## Environment variables

Copy `backend/.env.example` → `backend/.env`:

| Variable | Required | Purpose |
|----------|----------|---------|
| `JWT_SECRET` | **Yes** | Auth tokens — use 32+ random chars |
| `PORT` | No | Default `4000` |
| `APP_URL` | Prod | Your public URL |
| `REPLICATE_API_TOKEN` | No | Better image quality |
| `STRIPE_SECRET_KEY` | No | Real payments |
| `STRIPE_PRICE_PRO_MONTHLY` | No | Stripe Price ID for Pro |

---

## Publish to the internet

### Option A: Railway / Render / Fly.io

1. Push repo to GitHub.
2. Set root directory to `Project-Ai(image-generation)`.
3. **Build:** `cd backend && npm install`
4. **Start:** `node backend/server.js`
5. Set env vars in dashboard.
6. Set `APP_URL` and `FRONTEND_URL` to your deployed URL.

### Option B: VPS (Ubuntu)

```bash
git clone <your-repo>
cd Project-Ai(image-generation)/backend
npm install
cp .env.example .env
nano .env   # configure
npm run seed
NODE_ENV=production node server.js
```

Use **PM2** + **Nginx** reverse proxy + **Let’s Encrypt** SSL.

### Option C: Vercel (frontend only) + API elsewhere

Host API on Railway; set frontend `lib/env.js` or inject:

```html
<script>window.__ENV__ = { API_BASE_URL: 'https://api.yourdomain.com/api/v1', MOCK_MODE: 'false' };</script>
```

---

## Stripe setup (real payments)

1. Create products in [Stripe Dashboard](https://dashboard.stripe.com).
2. Copy Price IDs to `.env`.
3. Add webhook: `POST /api/stripe/webhook` (extend `billing.js` as needed).
4. Trial: Pro checkout uses `trial_period_days: 7`.

---

## Image API (production quality)

1. [Replicate](https://replicate.com) → API token → `REPLICATE_API_TOKEN`
2. Or [Stability AI](https://platform.stability.ai) → `STABILITY_API_KEY`

Without keys, **Pollinations** is used (good for demos, not for heavy commercial use).

---

## Ads & analytics

1. **Google Ads** → landing URL: `https://yourdomain.com/signup.html`
2. Set `GA_ID` in `lib/env.js` for Google Analytics.
3. Open Graph tags are on `index.html` for Meta/Twitter ads.
4. UTM links: `signup.html?utm_source=google&utm_campaign=trial`

---

## Security checklist before launch

- [ ] Change `JWT_SECRET`
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Rate limits active (built-in)
- [ ] Never commit `.env`
- [ ] Add real privacy policy / terms content

---

## Support

- API health: `GET /api/health`
- API docs: `/api/v1/auth`, `/generate`, `/gallery`, `/billing`
