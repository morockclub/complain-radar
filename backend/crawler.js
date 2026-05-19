const { chromium } = require("playwright");
const cheerio = require("cheerio");
const db = require("./db");

// ============================================
// ADD YOUR LINKS HERE
// ============================================
const CRAWL_TARGETS = [
  {
    company: "zomato",
    name: "Zomato MouthShut Reviews",
    url: "https://www.mouthshut.com/product-reviews/Zomato-reviews-925594485",
    type: "mouthshut",
    enabled: true,
  },
  {
    company: "swiggy",
    name: "Swiggy MouthShut Reviews",
    url: "https://www.mouthshut.com/product-reviews/Swiggy-reviews-925608254",
    type: "mouthshut",
    enabled: true,
  },
  {
    company: "ola",
    name: "Ola MouthShut Reviews",
    url: "https://www.mouthshut.com/product-reviews/OlaCabs-reviews-925574977",
    type: "mouthshut",
    enabled: true,
  },
  {
    company: "zomato",
    name: "Zomato Trustpilot",
    url: "https://www.trustpilot.com/review/www.zomato.com",
    type: "trustpilot",
    enabled: true,
  },
  {
    company: "swiggy",
    name: "Swiggy Trustpilot",
    url: "https://www.trustpilot.com/review/www.swiggy.com",
    type: "trustpilot",
    enabled: true,
  },
  {
    company: "ola",
    name: "Ola Trustpilot",
    url: "https://www.trustpilot.com/review/www.olacabs.com",
    type: "trustpilot",
    enabled: true,
  },

  // ============================================
  // ADD YOUR OWN LINKS BELOW
  // ============================================
  // {
  //   company: "zomato",
  //   name: "My Custom Link",
  //   url: "https://any-website.com/zomato-complaints",
  //   type: "generic",
  //   enabled: true,
  // },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function guessCategory(text) {
  const t = text.toLowerCase();
  if (t.includes("deliver") || t.includes("late") || t.includes("delay")) return "Delivery";
  if (t.includes("food") || t.includes("taste") || t.includes("quality") || t.includes("cold")) return "Food Quality";
  if (t.includes("app") || t.includes("crash") || t.includes("error") || t.includes("website")) return "App/Tech";
  if (t.includes("support") || t.includes("customer") || t.includes("service") || t.includes("response")) return "Customer Support";
  if (t.includes("pay") || t.includes("money") || t.includes("charge") || t.includes("bill")) return "Payment";
  if (t.includes("driver") || t.includes("cab") || t.includes("ride") || t.includes("auto")) return "Driver";
  if (t.includes("refund") || t.includes("cancel") || t.includes("return")) return "Refund";
  if (t.includes("hygiene") || t.includes("dirty") || t.includes("clean") || t.includes("cockroach")) return "Hygiene";
  return "General";
}

function guessSentiment(text) {
  const t = text.toLowerCase();
  if (t.includes("worst") || t.includes("terrible") || t.includes("horrible") || t.includes("hate") || t.includes("scam") || t.includes("fraud") || t.includes("cheat")) return "angry";
  if (t.includes("urgent") || t.includes("emergency") || t.includes("immediately") || t.includes("danger")) return "urgent";
  if (t.includes("disappoint") || t.includes("sad") || t.includes("unfortunately") || t.includes("expected better")) return "disappointed";
  return "frustrated";
}

function guessCity(text) {
  const cities = [
    "Mumbai", "Delhi", "Bengaluru", "Bangalore",
    "Hyderabad", "Chennai", "Pune", "Kolkata",
    "Bhopal", "Ahmedabad", "Jaipur", "Noida",
    "Gurgaon", "Gurugram", "Lucknow", "Surat"
  ];
  for (const city of cities) {
    if (text.includes(city)) return city;
  }
  return "India";
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// ============================================
// SCRAPER — visits URL and extracts text
// ============================================

async function scrapeURL(target) {
  console.log(`🌐 Visiting: ${target.url}`);
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // pretend to be a real browser
    await page.setExtraHTTPHeaders({
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    });

    // visit the page
    await page.goto(target.url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // wait for content to load
    await page.waitForTimeout(3000);

    // scroll to load more content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(2000);

    // get full page HTML
    const html = await page.content();

    // extract complaints based on site type
    const complaints = extractComplaints(html, target);
    console.log(`📥 Found ${complaints.length} complaints from ${target.name}`);
    return complaints;

  } catch (err) {
    console.error(`❌ Failed to scrape ${target.url}:`, err.message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

// ============================================
// EXTRACTOR — pulls complaint text from HTML
// ============================================

function extractComplaints(html, target) {
  const $ = cheerio.load(html);
  const complaints = [];
  const platforms = ["MouthShut", "Trustpilot", "Google Reviews", "Web"];

  if (target.type === "mouthshut") {
    // MouthShut review elements
    $(".reviewdata, .review-description, .review-text, p").each((i, el) => {
      const text = $(el).text().trim();
      if (
        text.length > 50 &&
        text.length < 600 &&
        i < 15
      ) {
        complaints.push({
          id: generateId(),
          company: target.company,
          platform: "MouthShut",
          username: "@user_" + generateId().slice(0, 5),
          text: text.slice(0, 300),
          category: guessCategory(text),
          sentiment: guessSentiment(text),
          timestamp: new Date().toISOString(),
          likes: Math.floor(Math.random() * 150),
          shares: Math.floor(Math.random() * 30),
          replies: Math.floor(Math.random() * 20),
          city: guessCity(text),
        });
      }
    });
  }

  else if (target.type === "trustpilot") {
    // Trustpilot review elements
    $("[data-service-review-text-typography], .typography_body-l__KUYFJ, p").each((i, el) => {
      const text = $(el).text().trim();
      if (
        text.length > 50 &&
        text.length < 600 &&
        i < 15
      ) {
        complaints.push({
          id: generateId(),
          company: target.company,
          platform: "Trustpilot",
          username: "@reviewer_" + generateId().slice(0, 5),
          text: text.slice(0, 300),
          category: guessCategory(text),
          sentiment: guessSentiment(text),
          timestamp: new Date().toISOString(),
          likes: Math.floor(Math.random() * 200),
          shares: Math.floor(Math.random() * 40),
          replies: Math.floor(Math.random() * 25),
          city: guessCity(text),
        });
      }
    });
  }

  else {
    // Generic fallback for any website
    $("p, li, div, span").each((i, el) => {
      const text = $(el).text().trim();
      const isComplaint =
        text.toLowerCase().includes("complaint") ||
        text.toLowerCase().includes("worst") ||
        text.toLowerCase().includes("pathetic") ||
        text.toLowerCase().includes("refund") ||
        text.toLowerCase().includes("horrible") ||
        text.toLowerCase().includes("terrible") ||
        text.toLowerCase().includes("scam") ||
        text.toLowerCase().includes("fraud") ||
        text.toLowerCase().includes("issue") ||
        text.toLowerCase().includes("problem");

      if (
        text.length > 50 &&
        text.length < 500 &&
        isComplaint &&
        i < 20
      ) {
        complaints.push({
          id: generateId(),
          company: target.company,
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          username: "@user_" + generateId().slice(0, 5),
          text: text.slice(0, 300),
          category: guessCategory(text),
          sentiment: guessSentiment(text),
          timestamp: new Date().toISOString(),
          likes: Math.floor(Math.random() * 100),
          shares: Math.floor(Math.random() * 20),
          replies: Math.floor(Math.random() * 15),
          city: guessCity(text),
        });
      }
    });
  }

  // remove duplicates by text
  const seen = new Set();
  return complaints.filter(c => {
    const key = c.text.slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

// ============================================
// SAVE TO DATABASE
// ============================================

function saveComplaints(complaints) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO complaints
    (id, company, platform, username, text, category,
    sentiment, timestamp, likes, shares, replies, city)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let saved = 0;
  complaints.forEach(c => {
    insert.run(
      c.id, c.company, c.platform, c.username,
      c.text, c.category, c.sentiment, c.timestamp,
      c.likes, c.shares, c.replies, c.city
    );
    saved++;
  });
  return saved;
}

// ============================================
// MAIN CRAWL FUNCTION
// ============================================

async function runCustomCrawler() {
  console.log("🕷️ Starting crawler...");
  console.log(`📋 ${CRAWL_TARGETS.filter(t => t.enabled).length} targets active`);

  let totalSaved = 0;

  for (const target of CRAWL_TARGETS) {
    if (!target.enabled) {
      console.log(`⏭️ Skipping: ${target.name}`);
      continue;
    }

    console.log(`\n🎯 Crawling: ${target.name}`);
    const complaints = await scrapeURL(target);
    const saved = saveComplaints(complaints);
    totalSaved += saved;
    console.log(`💾 Saved ${saved} complaints from ${target.name}`);

    // wait 2 seconds between sites to avoid being blocked
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n✅ Crawl complete! Total saved: ${totalSaved} new complaints`);
  return totalSaved;
}

module.exports = { runCustomCrawler, CRAWL_TARGETS };