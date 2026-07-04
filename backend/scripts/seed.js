import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gallerySrc = path.join(__dirname, '../../frontend/data/gallery.json');
const dbPath = path.join(__dirname, '../data/db.json');

const gallery = JSON.parse(fs.readFileSync(gallerySrc, 'utf8'));
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
fs.writeFileSync(
  dbPath,
  JSON.stringify({ users: [], generations: [], gallery, contacts: [], subscriptions: [] }, null, 2)
);
console.log('Seeded gallery with', gallery.length, 'items');
