const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

function createDatabase(dbPath) {
  const target = dbPath || process.env.DB_PATH || path.join(__dirname, '..', 'data', 'fixora.db');
  let db;

  if (target !== ':memory:') {
    try {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      db = new DatabaseSync(target);
      db.exec('PRAGMA journal_mode = WAL;');
    } catch (err) {
      console.warn('[Fixora DB] Falling back to in-memory SQLite:', err.message);
      db = new DatabaseSync(':memory:');
    }
  } else {
    db = new DatabaseSync(':memory:');
  }

  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullname TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'CLIENT',
      city TEXT,
      job_title TEXT,
      specialty TEXT DEFAULT '',
      address TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      is_available INTEGER NOT NULL DEFAULT 1,
      service_price INTEGER NOT NULL DEFAULT 200,
      experience TEXT DEFAULT '5 سنوات',
      skills_json TEXT DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      icon_class TEXT NOT NULL,
      base_price INTEGER NOT NULL DEFAULT 150,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      fullname TEXT NOT NULL,
      job_title TEXT NOT NULL,
      specialty TEXT DEFAULT '',
      city TEXT NOT NULL,
      location_text TEXT NOT NULL,
      avatar TEXT NOT NULL,
      experience TEXT NOT NULL,
      price INTEGER NOT NULL DEFAULT 150,
      rating REAL NOT NULL DEFAULT 5.0,
      reviews_count INTEGER NOT NULL DEFAULT 0,
      is_available INTEGER NOT NULL DEFAULT 1,
      bio TEXT NOT NULL DEFAULT '',
      skills_json TEXT NOT NULL DEFAULT '[]',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      service_title TEXT NOT NULL,
      provider_name TEXT,
      client_name TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      city TEXT NOT NULL,
      scheduled_at TEXT NOT NULL,
      notes TEXT DEFAULT '',
      estimated_price INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'PENDING',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS service_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      provider_user_id INTEGER,
      client_name TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      client_email TEXT,
      service_title TEXT NOT NULL,
      provider_name TEXT,
      city TEXT NOT NULL,
      address TEXT,
      scheduled_at TEXT NOT NULL,
      notes TEXT DEFAULT '',
      estimated_price INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'NEW',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (provider_user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      author_name TEXT NOT NULL,
      city TEXT NOT NULL,
      rating REAL NOT NULL DEFAULT 5,
      comment TEXT NOT NULL,
      tag TEXT NOT NULL DEFAULT 'تجربة عميل',
      display_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_providers_city ON providers(city);
    CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(client_phone);
    CREATE INDEX IF NOT EXISTS idx_requests_phone ON service_requests(client_phone);
    CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(id DESC);
  `);

  const ensureColumn = (table, column, definition) => {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all();
    if (!cols.some((c) => c.name === column)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
    }
  };

  ensureColumn('users', 'specialty', "TEXT DEFAULT ''");
  ensureColumn('users', 'address', "TEXT DEFAULT ''");
  ensureColumn('users', 'bio', "TEXT DEFAULT ''");
  ensureColumn('users', 'is_available', 'INTEGER NOT NULL DEFAULT 1');
  ensureColumn('users', 'service_price', 'INTEGER NOT NULL DEFAULT 200');
  ensureColumn('users', 'experience', "TEXT DEFAULT '5 سنوات'");
  ensureColumn('users', 'skills_json', "TEXT DEFAULT '[]'");
  ensureColumn('providers', 'specialty', "TEXT DEFAULT ''");
  ensureColumn('bookings', 'estimated_price', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('service_requests', 'provider_name', 'TEXT');
  ensureColumn('service_requests', 'provider_user_id', 'INTEGER');
  ensureColumn('service_requests', 'estimated_price', 'INTEGER NOT NULL DEFAULT 0');

  return db;
}

const db = createDatabase();

module.exports = {
  db,
  createDatabase
};
