import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000";

const COMPANIES = {
  zomato: { name: "Zomato", color: "#E23744", bg: "#fff1f2", icon: "🍕" },
  swiggy: { name: "Swiggy", color: "#FC8019", bg: "#fff7ed", icon: "🛵" },
  ola:    { name: "Ola",    color: "#1FAB36", bg: "#f0fdf4", icon: "🚕" },
};

const CATEGORIES = [
  "Delivery","Food Quality","App/Tech",
  "Customer Support","Payment","Driver","Refund","Hygiene"
];

const SENTIMENTS = ["angry","frustrated","disappointed","urgent"];

// ============================================
// STAT CARD COMPONENT
// ============================================
function StatCard({ label, value, icon, color }) {
  return (
    <div className="card" style={{ borderTop: `4px solid ${color}` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <span style={{ fontSize:12, color:"#6b7280", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</span>
        <span style={{ fontSize:24 }}>{icon}</span>
      </div>
      <div style={{ fontSize:36, fontWeight:800, color:"#0f172a" }}>{value}</div>
    </div>
  );
}

// ============================================
// COMPLAINT CARD COMPONENT
// ============================================
function ComplaintCard({ complaint, onView }) {
  const co = COMPANIES[complaint.company] || COMPANIES.zomato;
  const sentimentColors = {
    angry:"#ef4444", frustrated:"#f97316",
    disappointed:"#8b5cf6", urgent:"#dc2626"
  };

  const timeAgo = (ts) => {
    const diff = (Date.now() - new Date(ts)) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  return (
    <div
      className="fade-in"
      onClick={() => onView(complaint)}
      style={{
        background:"#fff", borderRadius:14, padding:"16px 20px",
        borderLeft:`4px solid ${co.color}`, cursor:"pointer",
        border:`1.5px solid #f1f5f9`, borderLeftWidth:4,
        borderLeftColor:co.color, marginBottom:10,
        transition:"all 0.18s", boxShadow:"0 2px 12px rgba(0,0,0,0.04)"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 24px ${co.color}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
      }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          <span className="badge" style={{ background:co.bg, color:co.color }}>
            {co.icon} {co.name}
          </span>
          <span className="badge" style={{ background:"#f8fafc", color:"#64748b" }}>
            {complaint.platform}
          </span>
          <span className="badge" style={{
            background:`${sentimentColors[complaint.sentiment]}15`,
            color:sentimentColors[complaint.sentiment]
          }}>
            {complaint.sentiment}
          </span>
        </div>
        <span style={{ fontSize:11, color:"#94a3b8", whiteSpace:"nowrap" }}>
          {timeAgo(complaint.timestamp)}
        </span>
      </div>

      <div style={{ fontWeight:700, fontSize:13, color:"#374151", marginBottom:4 }}>
        {complaint.username}
      </div>
      <div style={{ fontSize:13.5, color:"#4b5563", lineHeight:1.6, marginBottom:12 }}>
        {complaint.text}
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:12, fontSize:12, color:"#94a3b8" }}>
          <span>❤️ {complaint.likes}</span>
          <span>🔁 {complaint.shares}</span>
          <span>💬 {complaint.replies}</span>
          <span>📍 {complaint.city}</span>
        </div>
        <span className="badge" style={{ background:"#f1f5f9", color:"#6b7280" }}>
          {complaint.category}
        </span>
      </div>
    </div>
  );
}

// ============================================
// DAILY CHART COMPONENT
// ============================================
function DailyChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign:"center", padding:"40px 0", color:"#94a3b8" }}>
        <div style={{ fontSize:32 }}>📊</div>
        <div style={{ fontWeight:600, marginTop:8 }}>No data yet</div>
        <div style={{ fontSize:12, marginTop:4 }}>Run the crawler to populate charts</div>
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d =>
    Math.max(d.Zomato||0, d.Swiggy||0, d.Ola||0)
  ), 1);

  return (
    <div style={{ overflowX:"auto" }}>
      <div style={{ display:"flex", alignItems:"flex-end", gap:8, minWidth:data.length*70, height:160, paddingBottom:24 }}>
        {data.map((day, i) => (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
            <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:130 }}>
              {Object.entries(COMPANIES).map(([key, co]) => (
                <div
                  key={key}
                  title={`${co.name}: ${day[co.name]||0}`}
                  style={{
                    width:14, background:co.color,
                    borderRadius:"3px 3px 0 0",
                    height:`${((day[co.name]||0)/maxVal)*100}%`,
                    minHeight: day[co.name] ? 4 : 0,
                    transition:"height 0.4s ease"
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize:9, color:"#94a3b8", whiteSpace:"nowrap" }}>
              {day.label}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap", marginTop:8 }}>
        {Object.entries(COMPANIES).map(([key, co]) => (
          <span key={key} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#6b7280" }}>
            <span style={{ width:10, height:10, borderRadius:2, background:co.color, display:"inline-block" }}/>
            {co.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const [complaints, setComplaints]     = useState([]);
  const [dailyData,  setDailyData]      = useState([]);
  const [targets,    setTargets]        = useState([]);
  const [crawling,   setCrawling]       = useState(false);
  const [activeTab,  setActiveTab]      = useState("dashboard");
  const [filterCompany,   setFilterCompany]   = useState("all");
  const [filterCategory,  setFilterCategory]  = useState("all");
  const [filterSentiment, setFilterSentiment] = useState("all");
  const [searchTerm,      setSearchTerm]      = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [crawlLog,   setCrawlLog]       = useState([]);
  const [customURL,  setCustomURL]      = useState("");
  const [customCompany, setCustomCompany] = useState("zomato");
  const logRef = useRef(null);

  // auto scroll crawl log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [crawlLog]);

  const addLog = (msg) => setCrawlLog(prev => [...prev.slice(-49), {
    msg, time: new Date().toLocaleTimeString()
  }]);

  // load complaints from backend
  const loadComplaints = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/complaints`);
      setComplaints(res.data);
    } catch (err) {
      console.error("Failed to load complaints:", err.message);
    }
  }, []);

  // load daily stats from backend
  const loadDailyStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/daily-stats`);

      // group by date for chart
      const byDate = {};
      res.data.forEach(row => {
        if (!byDate[row.date]) byDate[row.date] = { label: row.date };
        const coName = row.company.charAt(0).toUpperCase() + row.company.slice(1);
        byDate[row.date][coName] = row.count;
      });

      const sorted = Object.values(byDate)
        .sort((a,b) => new Date(a.label) - new Date(b.label))
        .slice(-14);

      setDailyData(sorted);
    } catch (err) {
      console.error("Failed to load daily stats:", err.message);
    }
  }, []);

  // load crawl targets
  const loadTargets = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/targets`);
      setTargets(res.data);
    } catch (err) {
      console.error("Failed to load targets:", err.message);
    }
  }, []);

  // load everything on start
  useEffect(() => {
    loadComplaints();
    loadDailyStats();
    loadTargets();
  }, [loadComplaints, loadDailyStats, loadTargets]);

  // run full crawler
  const runCrawler = async () => {
    setCrawling(true);
    setCrawlLog([]);
    addLog("🕷️ Starting full crawler...");

    try {
      addLog("🌐 Sending request to backend...");
      await axios.post(`${API}/api/crawl`);
      addLog("✅ Crawler started on backend!");
      addLog("⏳ Waiting 15 seconds for results...");

      // wait then reload
      setTimeout(async () => {
        await loadComplaints();
        await loadDailyStats();
        addLog("✅ Complaints loaded successfully!");
        setCrawling(false);
      }, 15000);
    } catch (err) {
      addLog(`❌ Error: ${err.message}`);
      setCrawling(false);
    }
  };

  // crawl a single custom URL
  const crawlCustomURL = async () => {
    if (!customURL) return;
    addLog(`🔗 Crawling custom URL: ${customURL}`);

    try {
      await axios.post(`${API}/api/crawl-url`, {
        url: customURL,
        company: customCompany,
        type: "generic"
      });
      addLog("✅ Custom URL crawl started!");
      setCustomURL("");

      setTimeout(async () => {
        await loadComplaints();
        await loadDailyStats();
        addLog("✅ Results loaded!");
      }, 15000);
    } catch (err) {
      addLog(`❌ Error: ${err.message}`);
    }
  };

  // filtered complaints
  const filtered = complaints.filter(c => {
    if (filterCompany   !== "all" && c.company   !== filterCompany)   return false;
    if (filterCategory  !== "all" && c.category  !== filterCategory)  return false;
    if (filterSentiment !== "all" && c.sentiment !== filterSentiment) return false;
    if (searchTerm && !c.text.toLowerCase().includes(searchTerm.toLowerCase())
      && !c.username.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // counts per company
  const counts = Object.fromEntries(
    Object.keys(COMPANIES).map(k => [k, complaints.filter(c => c.company === k).length])
  );

  // category breakdown
  const categoryBreakdown = {};
  complaints.forEach(c => {
    categoryBreakdown[c.category] = (categoryBreakdown[c.category]||0) + 1;
  });

  const tabs = [
    { id:"dashboard",  label:"📊 Dashboard"  },
    { id:"complaints", label:"📋 Complaints" },
    { id:"crawler",    label:"🕷️ Crawler"    },
    { id:"analytics",  label:"📈 Analytics"  },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc" }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {/* HEADER */}
      <div style={{ background:"#0f172a", color:"#fff", padding:"0 32px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:64 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:36, height:36, background:"linear-gradient(135deg,#ef4444,#f97316)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
              📡
            </div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, letterSpacing:"-0.03em" }}>
                ComplaintRadar
              </div>
              <div style={{ fontSize:10, color:"#64748b", letterSpacing:"0.1em", textTransform:"uppercase" }}>
                Social Complaint Intelligence
              </div>
            </div>
          </div>
          <button
            className="btn btn-danger"
            onClick={runCrawler}
            disabled={crawling}
          >
            <span style={{ display:"inline-block", animation:crawling?"spin 1s linear infinite":"none" }}>🕷️</span>
            {crawling ? " Crawling..." : " Run Crawler"}
          </button>
        </div>

        {/* TABS */}
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", gap:4 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              background:"none", border:"none",
              color: activeTab===t.id ? "#fff" : "#64748b",
              padding:"10px 16px", fontSize:13, fontWeight:600,
              cursor:"pointer",
              borderBottom: activeTab===t.id ? "2px solid #f97316" : "2px solid transparent",
              transition:"all 0.15s"
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 32px" }}>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === "dashboard" && (
          <div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, marginBottom:4 }}>
              Complaint Dashboard
            </h1>
            <p style={{ color:"#64748b", fontSize:14, marginBottom:24 }}>
              Real-time social media complaint tracking across Zomato, Swiggy & Ola
            </p>

            {/* STAT CARDS */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
              <StatCard label="Total Complaints" value={complaints.length} icon="📋" color="#6366f1"/>
              {Object.entries(COMPANIES).map(([key,co]) => (
                <StatCard key={key} label={`${co.name}`} value={counts[key]||0} icon={co.icon} color={co.color}/>
              ))}
            </div>

            {/* CHART + CATEGORY */}
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:24 }}>
              <div className="card">
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:20 }}>
                  Daily Complaint Volume
                </div>
                <DailyChart data={dailyData}/>
              </div>
              <div className="card">
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:20 }}>
                  By Category
                </div>
                {Object.entries(categoryBreakdown)
                  .sort((a,b) => b[1]-a[1])
                  .slice(0,8)
                  .map(([cat,cnt]) => (
                    <div key={cat} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:600, marginBottom:3 }}>
                        <span>{cat}</span><span>{cnt}</span>
                      </div>
                      <div style={{ background:"#f1f5f9", borderRadius:99, height:8 }}>
                        <div style={{
                          width:`${(cnt/Math.max(...Object.values(categoryBreakdown)))*100}%`,
                          background:"#6366f1", height:"100%", borderRadius:99, transition:"width 0.6s"
                        }}/>
                      </div>
                    </div>
                  ))}
                {Object.keys(categoryBreakdown).length === 0 && (
                  <div style={{ color:"#94a3b8", textAlign:"center", padding:"30px 0" }}>No data yet</div>
                )}
              </div>
            </div>

            {/* RECENT COMPLAINTS */}
            <div className="card">
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:16 }}>
                Recent Complaints
              </div>
              {complaints.slice(0,5).map(c => (
                <ComplaintCard key={c.id} complaint={c} onView={setSelectedComplaint}/>
              ))}
              {complaints.length === 0 && (
                <div style={{ textAlign:"center", padding:"40px 0", color:"#94a3b8" }}>
                  <div style={{ fontSize:40 }}>🕷️</div>
                  <div style={{ fontWeight:600, marginTop:8 }}>No complaints yet</div>
                  <div style={{ fontSize:13, marginTop:4 }}>Click Run Crawler to fetch complaints</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── COMPLAINTS TAB ── */}
        {activeTab === "complaints" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800 }}>
                All Complaints
              </h1>
              <span style={{ background:"#f1f5f9", borderRadius:8, padding:"4px 12px", fontSize:13, fontWeight:700, color:"#6b7280" }}>
                {filtered.length} results
              </span>
            </div>

            {/* FILTERS */}
            <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="🔍 Search complaints..."
                style={{ flex:1, minWidth:200, border:"1.5px solid #e2e8f0", borderRadius:10, padding:"10px 14px", fontSize:13, outline:"none" }}
              />
              <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)}
                style={{ border:"1.5px solid #e2e8f0", borderRadius:10, padding:"10px 14px", fontSize:13, background:"#fff", cursor:"pointer" }}>
                <option value="all">All Companies</option>
                {Object.entries(COMPANIES).map(([k,co]) => (
                  <option key={k} value={k}>{co.icon} {co.name}</option>
                ))}
              </select>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                style={{ border:"1.5px solid #e2e8f0", borderRadius:10, padding:"10px 14px", fontSize:13, background:"#fff", cursor:"pointer" }}>
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterSentiment} onChange={e => setFilterSentiment(e.target.value)}
                style={{ border:"1.5px solid #e2e8f0", borderRadius:10, padding:"10px 14px", fontSize:13, background:"#fff", cursor:"pointer" }}>
                <option value="all">All Sentiments</option>
                {SENTIMENTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {filtered.map(c => (
              <ComplaintCard key={c.id} complaint={c} onView={setSelectedComplaint}/>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign:"center", padding:"60px 0", color:"#94a3b8" }}>
                <div style={{ fontSize:40 }}>📭</div>
                <div style={{ fontWeight:600, marginTop:8 }}>No complaints match your filters</div>
              </div>
            )}
          </div>
        )}

        {/* ── CRAWLER TAB ── */}
        {activeTab === "crawler" && (
          <div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, marginBottom:4 }}>
              Crawler Control
            </h1>
            <p style={{ color:"#64748b", fontSize:14, marginBottom:24 }}>
              Manage your crawl targets and add custom URLs
            </p>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>

              {/* TARGETS LIST */}
              <div className="card">
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:16 }}>
                  Active Targets
                </div>
                {targets.map((t,i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #f1f5f9" }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13 }}>{t.name}</div>
                      <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{t.url.slice(0,45)}...</div>
                    </div>
                    <span style={{ background:"#f0fdf4", color:"#16a34a", borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:700 }}>
                      {t.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                ))}
              </div>

              {/* CRAWL LOG */}
              <div style={{ background:"#0f172a", borderRadius:16, padding:24 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:"#e2e8f0" }}>
                    Crawl Log
                  </span>
                  <span style={{ fontSize:10, color: crawling ? "#22c55e" : "#475569", fontWeight:600 }}>
                    {crawling ? "● LIVE" : "● IDLE"}
                  </span>
                </div>
                <div ref={logRef} style={{ height:280, overflowY:"auto", display:"flex", flexDirection:"column", gap:4 }}>
                  {crawlLog.length === 0 && (
                    <div style={{ color:"#475569", fontSize:12, fontFamily:"monospace" }}>
                      $ awaiting crawler start...
                    </div>
                  )}
                  {crawlLog.map((l,i) => (
                    <div key={i} style={{
                      fontFamily:"monospace", fontSize:11,
                      color: l.msg.startsWith("✅") ? "#86efac" : l.msg.startsWith("❌") ? "#fca5a5" : "#94a3b8"
                    }}>
                      <span style={{ color:"#475569" }}>[{l.time}] </span>{l.msg}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ADD CUSTOM URL */}
            <div className="card">
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:16 }}>
                Add Custom URL
              </div>
              <p style={{ fontSize:13, color:"#64748b", marginBottom:16 }}>
                Paste any link below and we will crawl it for complaints instantly.
              </p>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <input
                  value={customURL}
                  onChange={e => setCustomURL(e.target.value)}
                  placeholder="https://twitter.com/search?q=zomato+bad+experience"
                  style={{ flex:1, minWidth:300, border:"1.5px solid #e2e8f0", borderRadius:10, padding:"10px 14px", fontSize:13, outline:"none" }}
                />
                <select
                  value={customCompany}
                  onChange={e => setCustomCompany(e.target.value)}
                  style={{ border:"1.5px solid #e2e8f0", borderRadius:10, padding:"10px 14px", fontSize:13, background:"#fff", cursor:"pointer" }}
                >
                  {Object.entries(COMPANIES).map(([k,co]) => (
                    <option key={k} value={k}>{co.icon} {co.name}</option>
                  ))}
                </select>
                <button
                  className="btn btn-primary"
                  onClick={crawlCustomURL}
                  disabled={!customURL}
                >
                  🔗 Crawl This URL
                </button>
              </div>
              <div style={{ marginTop:12, fontSize:12, color:"#94a3b8" }}>
                💡 Tip: To add permanent links, open <strong>backend/crawler.js</strong> and add to the CRAWL_TARGETS array
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === "analytics" && (
          <div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, marginBottom:24 }}>
              Analytics
            </h1>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>

              {/* SENTIMENT */}
              <div className="card">
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:20 }}>
                  Sentiment Breakdown
                </div>
                {SENTIMENTS.map(s => {
                  const cnt = complaints.filter(c => c.sentiment===s).length;
                  const pct = complaints.length ? Math.round((cnt/complaints.length)*100) : 0;
                  const colors = { angry:"#ef4444", frustrated:"#f97316", disappointed:"#8b5cf6", urgent:"#dc2626" };
                  return (
                    <div key={s} style={{ marginBottom:14 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:600, marginBottom:4 }}>
                        <span style={{ textTransform:"capitalize" }}>{s}</span>
                        <span>{pct}% ({cnt})</span>
                      </div>
                      <div style={{ background:"#f1f5f9", borderRadius:99, height:8 }}>
                        <div style={{ width:`${pct}%`, background:colors[s], height:"100%", borderRadius:99, transition:"width 0.6s" }}/>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PLATFORM */}
              <div className="card">
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:20 }}>
                  Platform Breakdown
                </div>
                {["Twitter/X","Reddit","Google Reviews","Facebook","Quora"].map(p => {
                  const cnt = complaints.filter(c => c.platform===p).length;
                  const pct = complaints.length ? Math.round((cnt/complaints.length)*100) : 0;
                  return (
                    <div key={p} style={{ marginBottom:14 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:600, marginBottom:4 }}>
                        <span>{p}</span><span>{pct}% ({cnt})</span>
                      </div>
                      <div style={{ background:"#f1f5f9", borderRadius:99, height:8 }}>
                        <div style={{ width:`${pct}%`, background:"#6366f1", height:"100%", borderRadius:99, transition:"width 0.6s" }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CITY CLOUD */}
            <div className="card" style={{ marginBottom:20 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:16 }}>
                Top Cities
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {(() => {
                  const cityCount = {};
                  complaints.forEach(c => { if(c.city) cityCount[c.city] = (cityCount[c.city]||0)+1; });
                  const maxC = Math.max(...Object.values(cityCount),1);
                  return Object.entries(cityCount)
                    .sort((a,b) => b[1]-a[1])
                    .slice(0,20)
                    .map(([city,cnt]) => {
                      const intensity = cnt/maxC;
                      return (
                        <div key={city} style={{
                          background:`rgba(99,102,241,${0.1+intensity*0.7})`,
                          color: intensity>0.5 ? "#fff" : "#1e1b4b",
                          borderRadius:8,
                          padding:`${4+intensity*4}px ${8+intensity*6}px`,
                          fontSize:11+intensity*3,
                          fontWeight:700
                        }}>
                          {city} ({cnt})
                        </div>
                      );
                    });
                })()}
                {complaints.length===0 && (
                  <div style={{ color:"#94a3b8" }}>No data yet. Run the crawler first.</div>
                )}
              </div>
            </div>

            {/* TOP VIRAL */}
            <div className="card">
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:16 }}>
                Most Viral Complaints
              </div>
              {[...complaints]
                .sort((a,b) => (b.likes+b.shares*5)-(a.likes+a.shares*5))
                .slice(0,5)
                .map(c => <ComplaintCard key={c.id} complaint={c} onView={setSelectedComplaint}/>)}
              {complaints.length===0 && (
                <div style={{ color:"#94a3b8", textAlign:"center", padding:40 }}>No data yet</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedComplaint && (
        <div
          onClick={() => setSelectedComplaint(null)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background:"#fff", borderRadius:20, padding:32, maxWidth:560, width:"100%", maxHeight:"85vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}
          >
            {(() => {
              const c = selectedComplaint;
              const co = COMPANIES[c.company] || COMPANIES.zomato;
              return (
                <>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
                    <span className="badge" style={{ background:co.bg, color:co.color, fontSize:13, padding:"4px 12px" }}>
                      {co.icon} {co.name}
                    </span>
                    <button onClick={() => setSelectedComplaint(null)}
                      style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#94a3b8" }}>×</button>
                  </div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, marginBottom:4 }}>{c.username}</div>
                  <div style={{ fontSize:12, color:"#94a3b8", marginBottom:16 }}>
                    {c.platform} · {new Date(c.timestamp).toLocaleString("en-IN")} · {c.city}
                  </div>
                  <div style={{ fontSize:15, lineHeight:1.7, color:"#374151", marginBottom:20, padding:"16px 20px", background:"#f8fafc", borderRadius:12, borderLeft:`4px solid ${co.color}` }}>
                    {c.text}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
                    {[["❤️ Likes",c.likes],["🔁 Shares",c.shares],["💬 Replies",c.replies]].map(([l,v]) => (
                      <div key={l} style={{ background:"#f8fafc", borderRadius:10, padding:"12px 16px", textAlign:"center" }}>
                        <div style={{ fontSize:22, fontWeight:800 }}>{v}</div>
                        <div style={{ fontSize:11, color:"#94a3b8" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {[["Category",c.category],["Sentiment",c.sentiment],["City",c.city]].map(([l,v]) => (
                      <span key={l} className="badge" style={{ background:"#f1f5f9", color:"#4b5563", fontSize:12 }}>
                        {l}: {v}
                      </span>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}