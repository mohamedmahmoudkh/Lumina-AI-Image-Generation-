# Lumina AI

Premium AI image generation web platform — production-ready **vanilla HTML/CSS/JS** frontend with a **Node.js Express** backend.

![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- Landing page with free trial marketing
- User auth (signup, login, JWT)
- AI image generation with credits system
- 7-day Pro trial (200 credits)
- Gallery, history, presets, billing
- Stripe-ready payments
- Image proxy for reliable display

## Project structure

```
lumina-ai/
├── frontend/              # Static website (HTML, CSS, JS modules)
│   ├── index.html         # Landing page
│   ├── generate.html      # AI generator (dashboard)
│   ├── assets/            # CSS, JS, images
│   ├── components/        # Navbar, sidebar, modal, toast…
│   ├── features/          # Page logic (auth, gallery, generate…)
│   ├── services/          # API client & data layer
│   ├── store/             # LocalStorage state
│   ├── data/              # Seed JSON (gallery, pricing, FAQ…)
│   └── …                  # Other pages & modules
├── backend/               # Express API + static file server
│   ├── server.js          # Entry point
│   ├── src/
│   │   ├── routes/        # auth, generate, gallery, billing…
│   │   ├── services/      # Image generation providers
│   │   ├── middleware/    # JWT auth
│   │   └── db.js          # JSON database
│   ├── scripts/seed.js    # Seed gallery data
│   └── .env.example       # Environment template
├── docs/
│   └── DEPLOY.md          # Production deployment guide
├── package.json           # Root scripts
├── LICENSE
└── README.md
```

## Quick start

### Requirements

- [Node.js](https://nodejs.org/) 18 or later
- npm

### Install & run

```bash
git clone https://github.com/YOUR_USERNAME/lumina-ai.git
cd lumina-ai

npm run setup
```

Edit `backend/.env` and set a strong **`JWT_SECRET`**.

```bash
npm start
```

Open **http://localhost:4000**

### First-time setup (manual)

```bash
npm run install:all
copy backend\.env.example backend\.env    # Windows
# cp backend/.env.example backend/.env     # Mac/Linux
npm run seed
npm start
```

## Usage

1. Open http://localhost:4000
2. **Sign up** — 7-day Pro trial starts automatically
3. Go to **Generate** — enter a prompt, wait 10–30 seconds
4. Images appear in the output panel

## Environment variables

See `backend/.env.example`. Minimum for local dev:

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Random string (32+ chars) |
| `PORT` | No | Default `4000` |
| `REPLICATE_API_TOKEN` | No | Better image quality |
| `STRIPE_SECRET_KEY` | No | Real payments |

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/v1/auth/signup` | Register |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/generate` | Generate images (auth) |
| GET | `/api/v1/gallery` | Public gallery |
| POST | `/api/v1/billing/checkout` | Upgrade plan |

## Deploy

See [docs/DEPLOY.md](docs/DEPLOY.md) for Railway, VPS, Stripe, and production checklist.

## Upload to GitHub

See [docs/GITHUB.md](docs/GITHUB.md) for step-by-step instructions.

## Tech stack

**Frontend:** HTML5, CSS3, Vanilla JavaScript (ES modules)  
**Backend:** Node.js, Express, JWT, bcrypt, Zod  
**Database:** JSON file (swap for PostgreSQL in production)

## License

MIT — see [LICENSE](LICENSE).
