import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'weekly_meals.sqlite');
export const db = new Database(dbPath);

// Create users table if not exists
const createTable = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  displayName TEXT
);`;
db.exec(createTable);
