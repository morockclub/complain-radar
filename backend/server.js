const express = require("express");
const cors = require("cors");
const db = require("./db");
const { CRAWL_TARGETS } = require("./crawler");

const app = express();
app.use(cors());
app.use(express.json());

// Get all complaints with optional filters
app.get("/api/complaints", (req, res) => {
  const { company, category, sentiment } = req.query;
  let query = "SELECT * FROM complaints WHERE 1=1";
  const params = [];

  if (company)   { query += " AND company = ?";   params.push(company); }
  if (category)  { query += " AND category = ?";  params.push(category); }
  if (sentiment) { query += " AND sentiment = ?"; params.push(sentiment); }

  query += " ORDER BY timestamp DESC LIMIT 300";
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

// Get daily stats for chart
app.get("/api/daily-stats", (req, res) => {
  const rows = db.prepare(`
    SELECT DATE(timestamp) as date, company, COUNT(*) as count
    FROM complaints
    GROUP BY DATE(timestamp), company
    ORDER BY date DESC
    LIMIT 42
  `).all();
  res.json(rows);
});

// Get all crawl targets
app.get("/api/targets", (req, res) => {
  res.json(CRAWL_TARGETS);
});

// Add a single complaint manually
app.post("/api/add-complaint", (req, res) => {
  const { company, platform, username, text, category, sentiment, city } = req.body;

  if (!company || !text) {
    return res.status(400).json({ error: "company and text are required" });
  }

  const complaint = {
    id: Math.random().toString(36).slice(2, 10),
    company: company.toLowerCase(),
    platform: platform || "Manual Entry",
    username: username || "@anonymous",
    text,
    category: category || "General",
    sentiment: sentiment || "frustrated",
    timestamp: new Date().toISOString(),
    likes: 0,
    shares: 0,
    replies: 0,
    city: city || "India",
  };

  db.prepare(`
    INSERT OR IGNORE INTO complaints
    (id, company, platform, username, text, category,
    sentiment, timestamp, likes, shares, replies, city)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    complaint.id, complaint.company, complaint.platform,
    complaint.username, complaint.text, complaint.category,
    complaint.sentiment, complaint.timestamp, complaint.likes,
    complaint.shares, complaint.replies, complaint.city
  );

  res.json({ message: "Complaint added successfully", complaint });
});

// Delete a complaint
app.delete("/api/complaints/:id", (req, res) => {
  db.prepare("DELETE FROM complaints WHERE id = ?").run(req.params.id);
  res.json({ message: "Complaint deleted" });
});

// Get stats summary
app.get("/api/stats", (req, res) => {
  const total = db.prepare("SELECT COUNT(*) as count FROM complaints").get();
  const byCompany = db.prepare(`
    SELECT company, COUNT(*) as count
    FROM complaints
    GROUP BY company
  `).all();
  const byCategory = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM complaints
    GROUP BY category
    ORDER BY count DESC
  `).all();
  const bySentiment = db.prepare(`
    SELECT sentiment, COUNT(*) as count
    FROM complaints
    GROUP BY sentiment
  `).all();

  res.json({ total: total.count, byCompany, byCategory, bySentiment });
});

app.listen(5000, () => {
  console.log("🚀 Backend running on http://localhost:5000");
});