const express = require("express");
const cors = require("cors");
const db = require("./db");
const { runCustomCrawler, CRAWL_TARGETS } = require("./crawler");

const app = express();
app.use(cors());
app.use(express.json());

// Get all complaints
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

// Get daily stats
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

// Get crawl targets
app.get("/api/targets", (req, res) => {
  res.json(CRAWL_TARGETS);
});

// Get stats
app.get("/api/stats", (req, res) => {
  const total = db.prepare("SELECT COUNT(*) as count FROM complaints").get();
  const byCompany = db.prepare("SELECT company, COUNT(*) as count FROM complaints GROUP BY company").all();
  res.json({ total: total.count, byCompany });
});

// ============================================
// CRAWL BUTTON — this runs when user
// clicks Run Crawler in the frontend
// ============================================
app.post("/api/crawl", async (req, res) => {
  console.log("🕷️ Crawl triggered from frontend!");
  res.json({ message: "Crawl started! Check back in 30 seconds." });

  // run crawler in background
  try {
    const count = await runCustomCrawler();
    console.log(`✅ Crawl finished! ${count} new complaints saved.`);
  } catch (err) {
    console.error("❌ Crawl error:", err.message);
  }
});

app.listen(5000, () => {
  console.log("🚀 Backend running on http://localhost:5000");
});