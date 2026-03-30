import Database from 'better-sqlite3';

export const db = new Database('marketrix.db');

export function initDb() {
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL);
    CREATE TABLE IF NOT EXISTS role_permissions (role_id INTEGER NOT NULL, permission TEXT NOT NULL, PRIMARY KEY(role_id, permission), FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      image_url TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(role_id) REFERENCES roles(id)
    );
    CREATE TABLE IF NOT EXISTS trusted_devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      device_id TEXT NOT NULL,
      device_name TEXT,
      UNIQUE(user_id, device_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS device_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      device_id TEXT NOT NULL,
      device_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, device_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      buying_price REAL NOT NULL,
      selling_price REAL NOT NULL,
      status TEXT NOT NULL,
      notes TEXT
    );
    CREATE TABLE IF NOT EXISTS ad_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS ad_videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ad_entry_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      UNIQUE(ad_entry_id, url),
      FOREIGN KEY(ad_entry_id) REFERENCES ad_entries(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS content_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      platform TEXT NOT NULL,
      publish_date TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);
}
