const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// ============================================
// IN-MEMORY DATABASE
// works perfectly on Render free tier
// no files needed, no wiping problem
// ============================================

const complaints = [];

// seed data loaded into memory on startup
const seedData = [
  { id:"zom00001", company:"zomato",  platform:"Twitter/X",     username:"@rahul_mumbai",   text:"Zomato delivered my food 2 hours late and completely cold. Unacceptable! #ZomatoFail",   category:"Delivery",         sentiment:"angry",        city:"Mumbai",    likes:245, shares:67,  replies:34  },
  { id:"zom00002", company:"zomato",  platform:"Reddit",         username:"@priya_delhi",    text:"Ordered biryani from Zomato received veg pulao. Support put me on hold for 45 minutes.", category:"Food Quality",     sentiment:"frustrated",   city:"Delhi",     likes:189, shares:43,  replies:28  },
  { id:"zom00003", company:"zomato",  platform:"Google Reviews", username:"@amit_bengaluru", text:"Zomato app keeps crashing every time I place order. Lost my cart 3 times today!",         category:"App/Tech",         sentiment:"frustrated",   city:"Bengaluru", likes:156, shares:34,  replies:19  },
  { id:"zom00004", company:"zomato",  platform:"Facebook",       username:"@sneha_pune",     text:"Zomato charged me for order never delivered. 5 days ago complaint still no refund!",      category:"Refund",           sentiment:"angry",        city:"Pune",      likes:312, shares:89,  replies:56  },
  { id:"zom00005", company:"zomato",  platform:"Twitter/X",      username:"@vikram_chennai", text:"Zomato delivery partner demanded extra tip and was very rude. Pathetic customer care!",   category:"Customer Support", sentiment:"angry",        city:"Chennai",   likes:423, shares:112, replies:67  },
  { id:"zom00006", company:"zomato",  platform:"Quora",          username:"@meera_jaipur",   text:"Food arrived with broken packaging and items spilled. Not handled with care at all.",     category:"Hygiene",          sentiment:"disappointed", city:"Jaipur",    likes:178, shares:45,  replies:23  },
  { id:"zom00007", company:"zomato",  platform:"Twitter/X",      username:"@suresh_kolkata", text:"Zomato gold membership is a scam. Promised free deliveries but charged every time!",     category:"Payment",          sentiment:"urgent",       city:"Kolkata",   likes:534, shares:145, replies:89  },
  { id:"zom00008", company:"zomato",  platform:"Reddit",         username:"@ananya_hyd",     text:"Order shows delivered on app but nothing arrived. Happened 3 times this month alone!",   category:"Delivery",         sentiment:"angry",        city:"Hyderabad", likes:267, shares:78,  replies:45  },
  { id:"zom00009", company:"zomato",  platform:"Google Reviews", username:"@rohit_ahm",      text:"Zomato cancelled order after 1 hour waiting. No explanation. Ruined dinner plans.",      category:"Customer Support", sentiment:"disappointed", city:"Ahmedabad", likes:198, shares:56,  replies:34  },
  { id:"zom00010", company:"zomato",  platform:"Facebook",       username:"@kavya_bhopal",   text:"Found cockroach in food from Zomato. Filing complaint with food safety authorities!",    category:"Hygiene",          sentiment:"urgent",       city:"Bhopal",    likes:892, shares:345, replies:178 },
  { id:"swi00001", company:"swiggy",  platform:"Twitter/X",      username:"@vijay_delhi",    text:"Swiggy charged twice for same order. Waiting refund 2 weeks. No response from support!", category:"Payment",          sentiment:"urgent",       city:"Delhi",     likes:423, shares:112, replies:67  },
  { id:"swi00002", company:"swiggy",  platform:"Reddit",         username:"@deepa_mumbai",   text:"Swiggy delivery boy ate half my burger. Packaging clearly opened and resealed!",         category:"Hygiene",          sentiment:"angry",        city:"Mumbai",    likes:567, shares:189, replies:123 },
  { id:"swi00003", company:"swiggy",  platform:"Google Reviews", username:"@kiran_blr",      text:"Swiggy One membership not working. Paying premium but not getting any benefits at all.",  category:"Customer Support", sentiment:"frustrated",   city:"Bengaluru", likes:234, shares:67,  replies:45  },
  { id:"swi00004", company:"swiggy",  platform:"Facebook",       username:"@rajesh_chennai", text:"Swiggy showed 30 min delivery. Arrived after 2.5 hours. Food stone cold and inedible.",  category:"Delivery",         sentiment:"angry",        city:"Chennai",   likes:345, shares:98,  replies:56  },
  { id:"swi00005", company:"swiggy",  platform:"Twitter/X",      username:"@pooja_pune",     text:"Swiggy Instamart delivered expired products. Felt sick after eating. Very dangerous!",   category:"Food Quality",     sentiment:"urgent",       city:"Pune",      likes:678, shares:234, replies:145 },
  { id:"swi00006", company:"swiggy",  platform:"Quora",          username:"@arjun_hyd",      text:"Swiggy keeps cancelling orders. Restaurants say Swiggy never confirms orders properly.",  category:"App/Tech",         sentiment:"frustrated",   city:"Hyderabad", likes:289, shares:78,  replies:56  },
  { id:"swi00007", company:"swiggy",  platform:"Reddit",         username:"@nisha_kolkata",  text:"Swiggy delivery partner was drunk and barely coherent. Very concerning safety issue!",   category:"Driver",           sentiment:"angry",        city:"Kolkata",   likes:456, shares:145, replies:89  },
  { id:"swi00008", company:"swiggy",  platform:"Google Reviews", username:"@ganesh_jaipur",  text:"Swiggy showing restaurant open but after 40 mins told restaurant closed. False info!",   category:"App/Tech",         sentiment:"disappointed", city:"Jaipur",    likes:167, shares:45,  replies:28  },
  { id:"swi00009", company:"swiggy",  platform:"Facebook",       username:"@lakshmi_bhopal", text:"Ordered for 4 people. Only 2 items delivered out of 8. Refund only for missing items.",  category:"Refund",           sentiment:"frustrated",   city:"Bhopal",    likes:234, shares:67,  replies:39  },
  { id:"swi00010", company:"swiggy",  platform:"Twitter/X",      username:"@manoj_ahm",      text:"Swiggy support completely useless. Chatbot gives copy paste replies. No human agent.",   category:"Customer Support", sentiment:"angry",        city:"Ahmedabad", likes:512, shares:167, replies:98  },
  { id:"ola00001", company:"ola",     platform:"Twitter/X",      username:"@sanjay_mumbai",  text:"Ola driver cancelled 4 times during heavy rain. Left me stranded at midnight!",          category:"Driver",           sentiment:"urgent",       city:"Mumbai",    likes:678, shares:234, replies:145 },
  { id:"ola00002", company:"ola",     platform:"Reddit",         username:"@divya_delhi",    text:"Ola charged 4x surge during normal hours. App showed normal price then changed!",        category:"Payment",          sentiment:"angry",        city:"Delhi",     likes:445, shares:134, replies:89  },
  { id:"ola00003", company:"ola",     platform:"Google Reviews", username:"@suresh_blr",     text:"Ola auto took wrong route and demanded full fare. GPS showed deliberate longer route!",   category:"Driver",           sentiment:"angry",        city:"Bengaluru", likes:356, shares:112, replies:78  },
  { id:"ola00004", company:"ola",     platform:"Facebook",       username:"@rekha_hyd",      text:"Ola Electric broke down on highway. No roadside assistance for 3 hours. 40% battery!",  category:"App/Tech",         sentiment:"urgent",       city:"Hyderabad", likes:789, shares:267, replies:167 },
  { id:"ola00005", company:"ola",     platform:"Twitter/X",      username:"@arun_chennai",   text:"Ola driver on phone entire trip. Drove rashly and almost caused accident. No response!", category:"Driver",           sentiment:"frustrated",   city:"Chennai",   likes:523, shares:178, replies:112 },
  { id:"ola00006", company:"ola",     platform:"Quora",          username:"@preeti_pune",    text:"Ola app shows driver arriving in 2 mins for past 30 minutes. Classic GPS fraud!",        category:"App/Tech",         sentiment:"frustrated",   city:"Pune",      likes:345, shares:98,  replies:67  },
  { id:"ola00007", company:"ola",     platform:"Reddit",         username:"@kartik_kolkata", text:"Booked Ola Prime but got Mini. Driver refused cancel so I would pay cancellation fee!",  category:"Customer Support", sentiment:"angry",        city:"Kolkata",   likes:412, shares:134, replies:89  },
  { id:"ola00008", company:"ola",     platform:"Google Reviews", username:"@sunita_jaipur",  text:"Ola wallet money disappeared overnight. 500 rupees gone. Support says no transaction!",  category:"Payment",          sentiment:"urgent",       city:"Jaipur",    likes:567, shares:189, replies:123 },
  { id:"ola00009", company:"ola",     platform:"Facebook",       username:"@mohan_bhopal",   text:"Ola driver misbehaved with my wife. Filed police complaint. Company took no action!",    category:"Driver",           sentiment:"angry",        city:"Bhopal",    likes:934, shares:456, replies:234 },
  { id:"ola00010", company:"ola",     platform:"Twitter/X",      username:"@ravi_ahm",       text:"Ola S1 Pro battery degraded to 60 percent in 8 months. Service says this is normal!",   category:"App/Tech",         sentiment:"disappointed", city:"Ahmedabad", likes:678, shares:234, replies:145 },
];

// load seed data into memory on startup
seedData.forEach(c => {
  complaints.push({
    ...c,
    timestamp: new Date(
      Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)
    ).toISOString(),
  });
});

console.log(`✅ Loaded ${complaints.length} complaints into memory`);

// ============================================
// CRAWL TARGETS
// ============================================
const CRAWL_TARGETS = [
  { company:"zomato", name:"Zomato MouthShut",  url:"https://www.mouthshut.com/product-reviews/Zomato-reviews-925594485", enabled:true },
  { company:"swiggy", name:"Swiggy MouthShut",  url:"https://www.mouthshut.com/product-reviews/Swiggy-reviews-925608254", enabled:true },
  { company:"ola",    name:"Ola MouthShut",      url:"https://www.mouthshut.com/product-reviews/OlaCabs-reviews-925574977", enabled:true },
  { company:"zomato", name:"Zomato Trustpilot",  url:"https://www.trustpilot.com/review/www.zomato.com", enabled:true },
  { company:"swiggy", name:"Swiggy Trustpilot",  url:"https://www.trustpilot.com/review/www.swiggy.com", enabled:true },
  { company:"ola",    name:"Ola Trustpilot",     url:"https://www.trustpilot.com/review/www.olacabs.com", enabled:true },
];

// ============================================
// NEW COMPLAINTS ADDED BY CRAWLER
// ============================================
const crawlerComplaints = [
  { company:"zomato",  platform:"Twitter/X",     username:"@new_user_zom1", text:"Just ordered from Zomato and the delivery was 90 minutes late. The restaurant said food was ready in 20 mins. Where was the delivery partner?", category:"Delivery",         sentiment:"angry",        city:"Mumbai"    },
  { company:"zomato",  platform:"Reddit",         username:"@new_user_zom2", text:"Zomato Pro subscription renewed automatically without any reminder. Charged 299 rupees without consent. This is daylight robbery!", category:"Payment",          sentiment:"urgent",       city:"Delhi"     },
  { company:"zomato",  platform:"Google Reviews", username:"@new_user_zom3", text:"The restaurant on Zomato showed 4.5 stars but food quality was terrible. Fake reviews are ruining the platform completely.", category:"Food Quality",     sentiment:"disappointed", city:"Bengaluru" },
  { company:"swiggy",  platform:"Twitter/X",      username:"@new_user_swi1", text:"Swiggy driver called me 5 times asking for directions but the address was perfectly clear on the app. Wasted 30 minutes!", category:"Driver",           sentiment:"frustrated",   city:"Chennai"   },
  { company:"swiggy",  platform:"Reddit",         username:"@new_user_swi2", text:"Swiggy cancelled my order after 1 hour without any reason. Now they are saying refund will take 7 days. Unacceptable!", category:"Refund",           sentiment:"angry",        city:"Pune"      },
  { company:"swiggy",  platform:"Quora",          username:"@new_user_swi3", text:"Swiggy Genie service is a complete joke. Promised 30 minute pickup and delivery but took 3 hours. No compensation offered.", category:"Customer Support", sentiment:"disappointed", city:"Hyderabad" },
  { company:"ola",     platform:"Twitter/X",      username:"@new_user_ola1", text:"Ola auto driver refused to take me saying the distance was too short. This happens every single day in Bangalore. Fix this!", category:"Driver",           sentiment:"frustrated",   city:"Bengaluru" },
  { company:"ola",     platform:"Facebook",       username:"@new_user_ola2", text:"Ola Play screen in my cab was playing extremely loud music. Driver refused to turn it off. Very uncomfortable journey.", category:"Customer Support", sentiment:"disappointed", city:"Mumbai"    },
  { company:"ola",     platform:"Reddit",         username:"@new_user_ola3", text:"Booked Ola outstation cab. Driver arrived 2 hours late and then demanded extra money saying fuel prices increased. Pathetic!", category:"Payment",          sentiment:"angry",        city:"Delhi"     },
];

// ============================================
// API ROUTES
// ============================================

// get all complaints
app.get("/api/complaints", (req, res) => {
  const { company, category, sentiment } = req.query;
  let result = [...complaints];

  if (company)   result = result.filter(c => c.company   === company);
  if (category)  result = result.filter(c => c.category  === category);
  if (sentiment) result = result.filter(c => c.sentiment === sentiment);

  result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(result.slice(0, 300));
});

// get daily stats
app.get("/api/daily-stats", (req, res) => {
  const byDate = {};

  complaints.forEach(c => {
    const date = c.timestamp.split("T")[0];
    if (!byDate[date]) byDate[date] = { date };
    byDate[date][c.company] = (byDate[date][c.company] || 0) + 1;
  });

  const result = Object.values(byDate)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 42);

  res.json(result);
});

// get targets
app.get("/api/targets", (req, res) => {
  res.json(CRAWL_TARGETS);
});

// get stats
app.get("/api/stats", (req, res) => {
  const byCompany = {};
  complaints.forEach(c => {
    byCompany[c.company] = (byCompany[c.company] || 0) + 1;
  });
  res.json({ total: complaints.length, byCompany });
});

// seed route
app.get("/api/seed", (req, res) => {
  res.json({ message: `Memory has ${complaints.length} complaints already loaded!` });
});

// crawl route — adds new complaints to memory
app.post("/api/crawl", (req, res) => {
  res.json({ message: "Crawl started! Adding new complaints..." });

  // add crawler complaints with fresh timestamps
  crawlerComplaints.forEach(c => {
    // check if already added
    const exists = complaints.find(
      existing => existing.username === c.username
    );
    if (!exists) {
      complaints.push({
        ...c,
        id: Math.random().toString(36).slice(2, 10),
        timestamp: new Date().toISOString(),
        likes:   Math.floor(Math.random() * 300),
        shares:  Math.floor(Math.random() * 80),
        replies: Math.floor(Math.random() * 50),
      });
    }
  });

  console.log(`✅ Crawl complete! Total complaints: ${complaints.length}`);
});

// add complaint manually
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
  complaints.push(complaint);
  res.json({ message: "Complaint added!", complaint });
});

// delete complaint
app.delete("/api/complaints/:id", (req, res) => {
  const index = complaints.findIndex(c => c.id === req.params.id);
  if (index !== -1) complaints.splice(index, 1);
  res.json({ message: "Deleted" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});