# Upload to GitHub

## 1. Rename folder (recommended)

For a clean repo name, rename the project folder before uploading:

```
Project-Ai(image-generation)  →  lumina-ai
```

## 2. Initialize Git

```bash
cd lumina-ai
git init
git add .
git commit -m "Initial commit: Lumina AI platform"
```

## 3. Create GitHub repo

1. Go to [github.com/new](https://github.com/new)
2. Name: `lumina-ai`
3. **Do not** add README, .gitignore, or license (already in project)
4. Create repository

## 4. Push

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lumina-ai.git
git push -u origin main
```

## 5. Update repository URL

Edit `package.json` and replace `YOUR_USERNAME` with your GitHub username.

## What is NOT uploaded (`.gitignore`)

- `node_modules/`
- `backend/.env` (secrets)
- `backend/data/db.json` (local database)

## Clone & run (for others)

```bash
git clone https://github.com/YOUR_USERNAME/lumina-ai.git
cd lumina-ai
npm run setup
# Edit backend/.env → set JWT_SECRET
npm start
```

Open http://localhost:4000
