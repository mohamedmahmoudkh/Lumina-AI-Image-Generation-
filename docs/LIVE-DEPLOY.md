# Deploy Lumina AI live (step-by-step)

Choose **Render** (easiest, free tier) or **Railway** (also easy).

---

## Before you deploy

1. Push your code to **GitHub** (see `docs/GITHUB.md`)
2. Get a **Replicate API token** (recommended for real images): https://replicate.com/account/api-tokens

---

## Option A — Render (recommended)

### Step 1: Create account
Go to https://render.com and sign up with GitHub.

### Step 2: New Web Service
1. Click **New +** → **Web Service**
2. Connect your GitHub repo (`lumina-ai`)
3. Settings:

| Field | Value |
|-------|--------|
| **Name** | `lumina-ai` |
| **Region** | Frankfurt (or closest to you) |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance type** | Free |

### Step 3: Environment variables

In **Environment** tab, add:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | *(Generate or paste 32+ random characters)* |
| `APP_URL` | `https://YOUR-APP-NAME.onrender.com` *(after deploy)* |
| `FRONTEND_URL` | same as APP_URL |
| `REPLICATE_API_TOKEN` | your Replicate token *(optional but recommended)* |

### Step 4: Deploy
Click **Create Web Service**. Wait 3–5 minutes.

Your live URL: `https://lumina-ai.onrender.com` (or your chosen name)

### Step 5: Update APP_URL
After first deploy, copy your exact URL and set `APP_URL` + `FRONTEND_URL` in Render env vars, then **Manual Deploy → Clear cache & deploy**.

### Step 6: Test
- Open your URL
- Sign up → Generate an image
- Check: `https://YOUR-URL.onrender.com/api/health`

**Note:** Free tier sleeps after 15 min idle — first visit may take ~30 sec to wake up.

---

## Option B — Railway

1. Go to https://railway.app → **New Project** → **Deploy from GitHub**
2. Select your repo
3. Railway reads `railway.toml` automatically
4. Add variables in **Variables** tab:

```
NODE_ENV=production
JWT_SECRET=your-long-random-secret-min-32-chars
APP_URL=https://your-app.up.railway.app
FRONTEND_URL=https://your-app.up.railway.app
REPLICATE_API_TOKEN=r8_xxxx
```

5. Deploy → copy public URL from **Settings → Networking → Generate Domain**

---

## Option C — Custom domain

### Render
1. **Settings → Custom Domains** → Add `lumina.yourdomain.com`
2. Add DNS CNAME pointing to Render
3. Update `APP_URL` and `FRONTEND_URL` to `https://lumina.yourdomain.com`

### Cloudflare (optional)
Put domain behind Cloudflare for CDN + SSL.

---

## Stripe (real payments)

1. https://dashboard.stripe.com → create **Pro** product ($29/mo)
2. Copy **Price ID** → set `STRIPE_PRICE_PRO_MONTHLY`
3. Set `STRIPE_SECRET_KEY` (live key when ready)
4. Redeploy

---

## Production checklist

- [ ] `JWT_SECRET` is random (32+ chars)
- [ ] `APP_URL` matches your live HTTPS URL
- [ ] `REPLICATE_API_TOKEN` set (for reliable images)
- [ ] Test signup + generate on live URL
- [ ] Privacy & Terms pages updated with your company info

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| App crashes on start | Set `JWT_SECRET` (32+ chars) |
| Images don't load | Add `REPLICATE_API_TOKEN` or wait 30s (Pollinations slow) |
| Logged out after generate | Redeploy latest code (token bug fixed) |
| 502 on Render free | Service waking up — wait and refresh |
| Users lost after restart | Free tier resets JSON DB — upgrade Render disk or use PostgreSQL |

---

## Upgrade path (when you grow)

- **Render paid** → persistent disk for `backend/data/db.json`
- **PostgreSQL** → replace `backend/src/db.js`
- **Replicate** → production image quality
- **Stripe** → real subscriptions
