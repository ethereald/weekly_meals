import { db } from './db';

// Ensure default admin user exists
const row = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get('admin') as { count: number };
const adminExists = row && row.count > 0;
if (!adminExists) {
  db.prepare('INSERT INTO users (username, password, role, displayName) VALUES (?, ?, ?, ?)')
    .run('admin', 'admin', 'admin', 'Admin');
}
