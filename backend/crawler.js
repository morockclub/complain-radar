// ============================================
// CRAWL TARGETS
// Add your own links here anytime
// ============================================

const CRAWL_TARGETS = [
  {
    company: "zomato",
    name: "Zomato Twitter Complaints",
    url: "https://twitter.com/search?q=zomato+complaint+india&f=live",
    type: "twitter",
    enabled: true,
  },
  {
    company: "zomato",
    name: "Zomato Google Reviews",
    url: "https://www.google.com/search?q=zomato+complaints+india",
    type: "google",
    enabled: true,
  },
  {
    company: "swiggy",
    name: "Swiggy Twitter Complaints",
    url: "https://twitter.com/search?q=swiggy+complaint+india&f=live",
    type: "twitter",
    enabled: true,
  },
  {
    company: "swiggy",
    name: "Swiggy Reddit",
    url: "https://www.reddit.com/search/?q=swiggy+complaint&sort=new",
    type: "reddit",
    enabled: true,
  },
  {
    company: "ola",
    name: "Ola Twitter Complaints",
    url: "https://twitter.com/search?q=ola+cab+complaint+india&f=live",
    type: "twitter",
    enabled: true,
  },
  {
    company: "ola",
    name: "Ola Reddit",
    url: "https://www.reddit.com/search/?q=ola+cabs+complaint&sort=new",
    type: "reddit",
    enabled: true,
  },

  // ============================================
  // ADD YOUR OWN LINKS BELOW THIS LINE
  // ============================================

  // Example:
  // {
  //   company: "zomato",
  //   name: "Zomato MouthShut Reviews",
  //   url: "https://www.mouthshut.com/product-reviews/Zomato-reviews-925594485",
  //   type: "generic",
  //   enabled: true,
  // },
];

module.exports = { CRAWL_TARGETS };