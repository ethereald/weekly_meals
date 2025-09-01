const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database('weekly_meals.sqlite');
app.use(bodyParser.json());

// Create users table if not exists
const createTable = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  displayName TEXT
);`;
db.run(createTable);

// Ensure default admin user exists
const ensureAdmin = `INSERT OR IGNORE INTO users (username, password, role, displayName) VALUES ('admin', 'admin', 'admin', 'Admin');`;
db.run(ensureAdmin);

// Get all users
app.get('/api/users', (req, res) => {
  db.all('SELECT id, username, role, displayName FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create user
app.post('/api/users', (req, res) => {
  const { username, password, role, displayName } = req.body;
  db.run('INSERT INTO users (username, password, role, displayName) VALUES (?, ?, ?, ?)', [username, password, role, displayName || username], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, username, role, displayName });
  });
});

// Delete user
app.post('/api/users/delete', (req, res) => {
  const { id } = req.body;
  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ success: this.changes > 0 });
  });
});

// Change user role
app.post('/api/users/role', (req, res) => {
  const { id, role } = req.body;
  db.run('UPDATE users SET role = ? WHERE id = ?', [role, id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ success: this.changes > 0 });
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT id, username, role, displayName FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.json({ success: true, user: row });
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  });
});

// Change password
app.post('/api/change-password', (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  db.get('SELECT id FROM users WHERE username = ? AND password = ?', [username, oldPassword], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    db.run('UPDATE users SET password = ? WHERE id = ?', [newPassword, row.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: this.changes > 0 });
    });
  });
});

// Update display name
app.post('/api/account', (req, res) => {
  const { username, displayName } = req.body;
  db.run('UPDATE users SET displayName = ? WHERE username = ?', [displayName, username], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: this.changes > 0 });
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`SQLite API server running on http://localhost:${PORT}`);
});
