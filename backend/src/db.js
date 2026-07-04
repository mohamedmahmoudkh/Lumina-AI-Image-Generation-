import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const defaultDb = {
  users: [],
  generations: [],
  gallery: [],
  contacts: [],
  subscriptions: [],
};

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2));
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDb(db) {
  ensureDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export const db = {
  read: readDb,
  write: writeDb,
};

export function findUserByEmail(email) {
  const { users } = readDb();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id) {
  const { users } = readDb();
  return users.find((u) => u.id === id);
}

export function createUser(user) {
  const dbData = readDb();
  const newUser = { id: nanoid(), createdAt: new Date().toISOString(), ...user };
  dbData.users.push(newUser);
  writeDb(dbData);
  return newUser;
}

export function updateUser(id, patch) {
  const dbData = readDb();
  const idx = dbData.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  dbData.users[idx] = { ...dbData.users[idx], ...patch, updatedAt: new Date().toISOString() };
  writeDb(dbData);
  return dbData.users[idx];
}

export function addGeneration(gen) {
  const dbData = readDb();
  const record = { id: nanoid(), createdAt: new Date().toISOString(), ...gen };
  dbData.generations.push(record);
  writeDb(dbData);
  return record;
}

export function getUserGenerations(userId, limit = 50) {
  const { generations } = readDb();
  return generations
    .filter((g) => g.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

export function deleteGeneration(id, userId) {
  const dbData = readDb();
  const idx = dbData.generations.findIndex((g) => g.id === id && g.userId === userId);
  if (idx === -1) return false;
  dbData.generations.splice(idx, 1);
  writeDb(dbData);
  return true;
}

export function getPublicGallery({ page = 1, limit = 12, category, search, sort }) {
  const dbData = readDb();
  let items = [...(dbData.gallery.length ? dbData.gallery : [])];

  if (!items.length) {
    try {
      const seedPath = path.join(__dirname, '../../frontend/data/gallery.json');
      if (fs.existsSync(seedPath)) {
        items = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
      }
    } catch { /* ignore */ }
  }

  if (category && category !== 'all') {
    items = items.filter((i) => i.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    items = items.filter((i) => i.prompt?.toLowerCase().includes(q));
  }
  if (sort === 'trending') items.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  else items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    total: items.length,
    hasMore: start + limit < items.length,
    page,
  };
}

export function addContact(entry) {
  const dbData = readDb();
  const record = { id: nanoid(), createdAt: new Date().toISOString(), ...entry };
  dbData.contacts.push(record);
  writeDb(dbData);
  return record;
}

export function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}
