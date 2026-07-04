# Architecture

## Overview

Lumina AI is a monorepo-style project with two main parts:

1. **frontend/** — Static multi-page site served by Express
2. **backend/** — REST API + static file hosting

A single `node server.js` command serves both at `http://localhost:4000`.

## Data flow

```
Browser → frontend/pages → services/api.js → backend/routes → db.js / imageService
```

## Image generation providers

Priority order (configured in `backend/src/services/imageService.js`):

1. Replicate (if `REPLICATE_API_TOKEN` set)
2. Stability AI (if `STABILITY_API_KEY` set)
3. Pollinations.ai (free fallback)

Images are proxied through `/api/v1/images/proxy` for reliable browser display.

## Auth

- JWT stored in `localStorage` (`lumina_token`)
- User profile in `localStorage` (`lumina_user`)
- Protected routes check token via `Authorization: Bearer` header

## Extending

- **Database:** Replace `backend/src/db.js` with PostgreSQL/MongoDB adapter
- **Payments:** Configure Stripe keys in `.env`
- **New pages:** Add HTML to `frontend/`, register logic in `frontend/assets/js/app.js`
