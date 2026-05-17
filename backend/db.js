const Database = require("better-sqlite3");
const db = new Database("complaints.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    platform TEXT,
    username TEXT,
    text TEXT,
    category TEXT,
    sentiment TEXT,
    timestamp TEXT,
    likes INTEGER,
    shares INTEGER,
    replies INTEGER,
    city TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;