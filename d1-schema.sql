-- Meals table
CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  username TEXT NOT NULL,
  dish TEXT NOT NULL
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  displayName TEXT
);

-- Insert default admin user
INSERT OR IGNORE INTO users (username, password, role, displayName)
VALUES ('admin', 'admin', 'admin', 'Admin');
