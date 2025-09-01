import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'weekly_meals.sqlite');
const db = new Database(dbPath);

// Create users table if not exists
const createTable = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  displayName TEXT
);`;
db.exec(createTable);

// Ensure default admin user exists
const row = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get('admin');
const adminExists = row && row.count > 0;
if (!adminExists) {
  db.prepare('INSERT INTO users (username, password, role, displayName) VALUES (?, ?, ?, ?)')
    .run('admin', 'admin', 'admin', 'Admin');
}

console.log('Database seeded.');
