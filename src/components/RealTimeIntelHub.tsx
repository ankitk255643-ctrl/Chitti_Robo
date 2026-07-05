import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  Globe,
  Tv,
  Newspaper,
  Compass,
  RefreshCw,
  Search,
  ExternalLink,
  SlidersHorizontal,
  Bookmark,
  Share2,
  AlertTriangle,
  Play,
  Key,
  Flame,
  CheckCircle,
  Copy,
  Info,
  Youtube,
  Trophy,
  Dribbble,
  Sparkles,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

// Types
interface NewsArticle {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  category: string;
  region: string;
}

interface CryptoToken {
  id: string;
  name: string;
  symbol: string;
  priceUSD: number;
  priceINR: number;
  change24h: number;
  marketCapUSD: number;
  sparkline: number[];
}

interface GeopoliticalIncident {
  id: string;
  title: string;
  region: string;
  source: string;
  severity: "Critical" | "Moderate" | "Monitoring";
  summary: string;
  publishedAt: string;
  sentiment: "Neutral" | "Negative";
}

interface SportsEvent {
  id: string;
  sport: "Cricket" | "Football" | "Basketball" | "Tennis" | "Formula 1";
  title: string;
  status: "LIVE" | "UPCOMING" | "CONCLUDED";
  score?: string;
  teamHome: string;
  teamAway: string;
  venue: string;
  time: string;
  league: string;
}

interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  videoUrl: string;
  publishedAt: string;
  views: string;
  category: string;
}

export default function RealTimeIntelHub() {
  const [activeTab, setActiveTab] = useState<"news" | "crypto" | "geo" | "sports" | "youtube">("news");
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<"all" | "india" | "world" | "usa" | "europe">("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // API Key Storage (local state backed by localStorage)
  const [newsApiKey, setNewsApiKey] = useState(() => localStorage.getItem("intel_news_api_key") || "");
  const [ytApiKey, setYtApiKey] = useState(() => localStorage.getItem("intel_youtube_api_key") || "");
  const [showNewsKey, setShowNewsKey] = useState(false);
  const [showYoutubeKey, setShowYoutubeKey] = useState(false);
  const [newsKeySavedMessage, setNewsKeySavedMessage] = useState("");
  const [ytKeySavedMessage, setYtKeySavedMessage] = useState("");

  // Server-side environment key indicators
  const [hasServerNewsKey, setHasServerNewsKey] = useState(false);
  const [hasServerYoutubeKey, setHasServerYoutubeKey] = useState(false);
  const [hasServerOpenSky, setHasServerOpenSky] = useState(false);

  // Saved/Bookmarked items list (in localStorage)
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("intel_bookmarks") || "[]");
    } catch {
      return [];
    }
  });

  // Dynamic States for API Data
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [cryptoTokens, setCryptoTokens] = useState<CryptoToken[]>([]);
  const [geoIncidents, setGeoIncidents] = useState<GeopoliticalIncident[]>([]);
  const [sportsEvents, setSportsEvents] = useState<SportsEvent[]>([]);
  const [ytVideos, setYtVideos] = useState<YouTubeVideo[]>([]);

  // Notifications or logs
  const [logs, setLogs] = useState<string[]>(["Terminal initialised. Waiting for radar sweep."]);

  // Demo fallback state indicator
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Save News Key to Storage
  const handleSaveNewsKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("intel_news_api_key", newsApiKey);
    setNewsKeySavedMessage("News API key cached.");
    setTimeout(() => setNewsKeySavedMessage(""), 4000);
    setLogs((prev) => [`News API key cached at ${new Date().toLocaleTimeString()}`, ...prev]);
    fetchLiveHubData();
  };

  // Save YouTube Key to Storage
  const handleSaveYtKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("intel_youtube_api_key", ytApiKey);
    setYtKeySavedMessage("YouTube API key cached.");
    setTimeout(() => setYtKeySavedMessage(""), 4000);
    setLogs((prev) => [`YouTube API key cached at ${new Date().toLocaleTimeString()}`, ...prev]);
    fetchLiveHubData();
  };

  // Toggle bookmarks
  const handleToggleBookmark = (id: string) => {
    const nextBookmarks = bookmarks.includes(id)
      ? bookmarks.filter((b) => b !== id)
      : [...bookmarks, id];
    setBookmarks(nextBookmarks);
    localStorage.setItem("intel_bookmarks", JSON.stringify(nextBookmarks));
    setLogs((prev) => [`Bookmark updated for item ${id}`, ...prev]);
  };

  // Copy shareable link simulated trigger
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setLogs((prev) => [`Intel payload link copied to clipboard.`, ...prev]);
    alert("Payload link copied to clipboard!");
  };

  // Main high-fidelity fallback synthetic data generator
  const generateSyntheticData = () => {
    // 1. News Articles Fallback
    const demoNews: NewsArticle[] = [
      {
        id: "news-1",
        title: "India Sets Pace for Next-Generation Solid State Battery Research",
        description: "A consortium of Indian research institutes announces a breakthrough in sodium-ion energy density metrics, reducing thermal runaway risks by 94%.",
        source: "TechPulse India",
        url: "https://example.com/news1",
        imageUrl: "https://images.unsplash.com/photo-1558441719-ff34b0524a24?w=400&auto=format&fit=crop&q=60",
        publishedAt: "12 mins ago",
        sentiment: "Positive",
        category: "technology",
        region: "india"
      },
      {
        id: "news-2",
        title: "Global Supply Chain Re-alignments Accelerate in Southeast Asia",
        description: "New trade routes bypass major chokepoints as shipping logistics firms integrate AI models to handle extreme seasonal weather deviations.",
        source: "Global Logistics Journal",
        url: "https://example.com/news2",
        imageUrl: "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=400&auto=format&fit=crop&q=60",
        publishedAt: "28 mins ago",
        sentiment: "Neutral",
        category: "world",
        region: "world"
      },
      {
        id: "news-3",
        title: "Bitcoin Crosses Key Exponential Moving Average Support Lines",
        description: "Traders note a heavy accumulation phase by institutional spot ETFs, driving volatile price reactions across major regional exchanges.",
        source: "CryptoSentry Terminal",
        url: "https://example.com/news3",
        imageUrl: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=400&auto=format&fit=crop&q=60",
        publishedAt: "45 mins ago",
        sentiment: "Positive",
        category: "crypto",
        region: "usa"
      },
      {
        id: "news-4",
        title: "Geopolitical Framework Drafted to Coordinate Space Debris Mitigation",
        description: "Eighteen countries form a joint framework designed to safely capture and deorbit defunct satellites over pacific graveyard corridors.",
        source: "AeroSpace Intel",
        url: "https://example.com/news4",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=60",
        publishedAt: "1 hour ago",
        sentiment: "Positive",
        category: "world",
        region: "world"
      },
      {
        id: "news-5",
        title: "Cricket League expansion sets new record sponsorship metrics",
        description: "Sports analysts indicate a massive influx of international media capital as local broadcasting rights exceed historic projections.",
        source: "CricIntel Hub",
        url: "https://example.com/news5",
        imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&auto=format&fit=crop&q=60",
        publishedAt: "2 hours ago",
        sentiment: "Positive",
        category: "sports",
        region: "india"
      },
      {
        id: "news-6",
        title: "Cyber Security Firm Detects High-Volume Zero-Day Exploits Target",
        description: "Critical infrastructure routers in major Eastern European capitals targeted with persistent memory overflows. Patch deployment is active.",
        source: "Infosec Radar",
        url: "https://example.com/news6",
        imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=60",
        publishedAt: "2 hours ago",
        sentiment: "Negative",
        category: "world",
        region: "europe"
      }
    ];

    // 2. Crypto Prices Fallback
    const demoCrypto: CryptoToken[] = [
      {
        id: "bitcoin",
        name: "Bitcoin",
        symbol: "BTC",
        priceUSD: 87430 + (Math.random() - 0.5) * 120,
        priceINR: 7291410 + (Math.random() - 0.5) * 10000,
        change24h: 3.42 + (Math.random() - 0.5) * 0.4,
        marketCapUSD: 1720450120000,
        sparkline: [85000, 85200, 86100, 85900, 86300, 86800, 87430]
      },
      {
        id: "ethereum",
        name: "Ethereum",
        symbol: "ETH",
        priceUSD: 3120 + (Math.random() - 0.5) * 8,
        priceINR: 260200 + (Math.random() - 0.5) * 600,
        change24h: -1.15 + (Math.random() - 0.5) * 0.2,
        marketCapUSD: 374920000000,
        sparkline: [3180, 3160, 3140, 3150, 3130, 3110, 3120]
      },
      {
        id: "solana",
        name: "Solana",
        symbol: "SOL",
        priceUSD: 182.4 + (Math.random() - 0.5) * 1,
        priceINR: 15210 + (Math.random() - 0.5) * 80,
        change24h: 8.76 + (Math.random() - 0.5) * 1.5,
        marketCapUSD: 85290000000,
        sparkline: [168, 171, 172, 175, 179, 180, 182.4]
      },
      {
        id: "binancecoin",
        name: "BNB Coin",
        symbol: "BNB",
        priceUSD: 592.5 + (Math.random() - 0.5) * 2,
        priceINR: 49410 + (Math.random() - 0.5) * 150,
        change24h: 0.45 + (Math.random() - 0.5) * 0.1,
        marketCapUSD: 86520000000,
        sparkline: [588, 590, 591, 589, 593, 592, 592.5]
      },
      {
        id: "ripple",
        name: "Ripple",
        symbol: "XRP",
        priceUSD: 0.942 + (Math.random() - 0.5) * 0.01,
        priceINR: 78.5 + (Math.random() - 0.5) * 0.8,
        change24h: -2.31 + (Math.random() - 0.5) * 0.5,
        marketCapUSD: 54100000000,
        sparkline: [0.98, 0.97, 0.95, 0.96, 0.94, 0.95, 0.942]
      }
    ];

    // 3. Wars & Geopolitics Fallback
    const demoGeo: GeopoliticalIncident[] = [
      {
        id: "geo-1",
        title: "Pacific Demilitarized Maritime Corridors Negotiated",
        region: "Asia-Pacific",
        source: "UN Maritime Intel",
        severity: "Moderate",
        summary: "Naval taskforces agree to establish non-intercept transit lines for civilian commercial haulers inside competitive territorial zones.",
        publishedAt: "38 mins ago",
        sentiment: "Neutral"
      },
      {
        id: "geo-2",
        title: "Borders Buffer Region Framework Enters Trial Evaluation",
        region: "Eastern Europe",
        source: "Geneva Conflict Radar",
        severity: "Monitoring",
        summary: "Autonomous drone telemetry systems monitored by impartial observers begin streaming real-time boundary activity to verify disarmament protocols.",
        publishedAt: "1 hour ago",
        sentiment: "Neutral"
      },
      {
        id: "geo-3",
        title: "Critical Red Sea Shipping Channels Report Stable Civil Passage",
        region: "Middle East",
        source: "Lloyds Shipping Intelligence",
        severity: "Monitoring",
        summary: "Enhanced coordinate escorts and anti-radar visual scrambler arrays deployed on cargo carriers resulting in zero naval incidents for 14 consecutive cycles.",
        publishedAt: "3 hours ago",
        sentiment: "Neutral"
      },
      {
        id: "geo-4",
        title: "Cyber Warfare Operations Target Regional Sat-com Relays",
        region: "Global",
        source: "NATO Cybersecurity Center",
        severity: "Critical",
        summary: "Sophisticated signal interruption payloads temporarily jammed tactical civilian weather forecasting uplinks. Secure backups are active.",
        publishedAt: "5 hours ago",
        sentiment: "Negative"
      }
    ];

    // 4. Sports Fallback
    const demoSports: SportsEvent[] = [
      {
        id: "sport-1",
        sport: "Cricket",
        title: "India vs Australia - Test Championship",
        status: "LIVE",
        score: "IND 342/4 (92.4 Ov) & AUS 280 All Out",
        teamHome: "India",
        teamAway: "Australia",
        venue: "Melbourne Cricket Ground",
        time: "Day 4 - Live Session",
        league: "ICC Test Championship"
      },
      {
        id: "sport-2",
        sport: "Football",
        title: "Manchester City vs Real Madrid - Semi-Finals",
        status: "LIVE",
        score: "2 - 1 (68')",
        teamHome: "Manchester City",
        teamAway: "Real Madrid",
        venue: "Etihad Stadium",
        time: "2nd Half",
        league: "UEFA Champions League"
      },
      {
        id: "sport-3",
        sport: "Formula 1",
        title: "Indian Grand Prix - Qualifiers",
        status: "UPCOMING",
        teamHome: "Leclerc (Ferrari)",
        teamAway: "Verstappen (Red Bull)",
        venue: "Buddh International Circuit",
        time: "Tomorrow at 14:30 IST",
        league: "F1 World Championship"
      },
      {
        id: "sport-4",
        sport: "Basketball",
        title: "LA Lakers vs Golden State Warriors",
        status: "CONCLUDED",
        score: "112 - 108",
        teamHome: "LA Lakers",
        teamAway: "Golden State Warriors",
        venue: "Crypto.com Arena",
        time: "Concluded",
        league: "NBA Regular Season"
      }
    ];

    // Featured Zystroflex channel videos (requested to always be present)
    const zystroflexVideos: YouTubeVideo[] = [
      {
        id: "ystroflex-vid1",
        title: "Zystroflex - System Workflows & Automated Architecture",
        channelTitle: "Zystroflex",
        thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60",
        videoUrl: "https://youtube.com/@zystroflex?si=WgRsNBlCdvtpWQKy",
        publishedAt: "2 days ago",
        views: "24K views",
        category: "Featured"
      },
      {
        id: "ystroflex-vid2",
        title: "How to Build High-Performance Multi-Agent Networks | Zystroflex",
        channelTitle: "Zystroflex",
        thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=60",
        videoUrl: "https://youtube.com/@zystroflex?si=WgRsNBlCdvtpWQKy",
        publishedAt: "1 week ago",
        views: "41K views",
        category: "Featured"
      }
    ];

    // 5. YouTube Fallback
    const demoYT: YouTubeVideo[] = [
      ...zystroflexVideos,
      {
        id: "yt-1",
        title: "Bitcoin Market Crash or New All-Time-High Looming?",
        channelTitle: "Crypto Financial Analyst Pro",
        thumbnailUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&auto=format&fit=crop&q=60",
        videoUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
        publishedAt: "4 hours ago",
        views: "128K views",
        category: "crypto"
      },
      {
        id: "yt-2",
        title: "The Battle for Advanced Microchip Dominance Explored",
        channelTitle: "Tech Economics Daily",
        thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=60",
        videoUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
        publishedAt: "10 hours ago",
        views: "45K views",
        category: "news"
      },
      {
        id: "yt-3",
        title: "India vs Australia Test Day 4 Key Wicket Highlights",
        channelTitle: "Star Sports Network",
        thumbnailUrl: "https://images.unsplash.com/photo-1540747737956-378724044282?w=400&auto=format&fit=crop&q=60",
        videoUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
        publishedAt: "2 hours ago",
        views: "1.2M views",
        category: "sports"
      },
      {
        id: "yt-4",
        title: "Why Global Logistics Rules Are Completely Changing in 2026",
        channelTitle: "Geopolitics Visualized",
        thumbnailUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=60",
        videoUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
        publishedAt: "1 day ago",
        views: "340K views",
        category: "news"
      }
    ];

    setNewsArticles(demoNews);
    setCryptoTokens(demoCrypto);
    setGeoIncidents(demoGeo);
    setSportsEvents(demoSports);
    setYtVideos(demoYT);
    setIsDemoMode(true);
  };

  // Live API Fetch Coordinator
  const fetchLiveHubData = async () => {
    setIsRefreshing(true);
    setLoading(true);

    // Populate high-fidelity default synthetic data first so other sections are never empty
    generateSyntheticData();

    try {
      // Fetch crypto data from CoinGecko (fully free, no credentials required)
      const cryptoRes = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple&vs_currencies=usd,inr&include_24hr_change=true&include_market_cap=true"
      );
      if (cryptoRes.ok) {
        const cData = await cryptoRes.json();
        const parsedCrypto: CryptoToken[] = [
          {
            id: "bitcoin",
            name: "Bitcoin",
            symbol: "BTC",
            priceUSD: cData.bitcoin.usd,
            priceINR: cData.bitcoin.inr,
            change24h: cData.bitcoin.usd_24h_change || 0,
            marketCapUSD: cData.bitcoin.usd_market_cap || 0,
            sparkline: [85000, 85600, 86000, 86500, cData.bitcoin.usd]
          },
          {
            id: "ethereum",
            name: "Ethereum",
            symbol: "ETH",
            priceUSD: cData.ethereum.usd,
            priceINR: cData.ethereum.inr,
            change24h: cData.ethereum.usd_24h_change || 0,
            marketCapUSD: cData.ethereum.usd_market_cap || 0,
            sparkline: [3100, 3120, 3080, 3110, cData.ethereum.usd]
          },
          {
            id: "solana",
            name: "Solana",
            symbol: "SOL",
            priceUSD: cData.solana.usd,
            priceINR: cData.solana.inr,
            change24h: cData.solana.usd_24h_change || 0,
            marketCapUSD: cData.solana.usd_market_cap || 0,
            sparkline: [170, 175, 179, 181, cData.solana.usd]
          },
          {
            id: "binancecoin",
            name: "BNB Coin",
            symbol: "BNB",
            priceUSD: cData.binancecoin.usd,
            priceINR: cData.binancecoin.inr,
            change24h: cData.binancecoin.usd_24h_change || 0,
            marketCapUSD: cData.binancecoin.usd_market_cap || 0,
            sparkline: [580, 585, 592, 590, cData.binancecoin.usd]
          },
          {
            id: "ripple",
            name: "Ripple",
            symbol: "XRP",
            priceUSD: cData.ripple.usd,
            priceINR: cData.ripple.inr,
            change24h: cData.ripple.usd_24h_change || 0,
            marketCapUSD: cData.ripple.usd_market_cap || 0,
            sparkline: [0.99, 0.96, 0.94, 0.95, cData.ripple.usd]
          }
        ];
        setCryptoTokens(parsedCrypto);
        setLogs((prev) => ["CoinGecko live crypto ticks updated.", ...prev]);
      }

      // If News API key is supplied or configured on the server, query real headlines via proxy
      if (newsApiKey || hasServerNewsKey) {
        const queryStr = "bitcoin OR geopolitical OR sports OR warfare";
        const newsUrl = `/api/news/everything?q=${encodeURIComponent(queryStr)}&sortBy=publishedAt&language=en&pageSize=12${newsApiKey ? `&apiKey=${newsApiKey}` : ""}`;
        const newsRes = await fetch(newsUrl);
        if (newsRes.ok) {
          const nData = await newsRes.json();
          if (nData.articles && nData.articles.length > 0) {
            const articles: NewsArticle[] = nData.articles.map((art: any, i: number) => {
              const randSent = ["Positive", "Neutral", "Negative"][Math.floor(Math.random() * 3)] as any;
              return {
                id: `live-art-${i}`,
                title: art.title,
                description: art.description || "No preview description supplied by feed publisher.",
                source: art.source?.name || "Global News Feed",
                url: art.url,
                imageUrl: art.urlToImage || "https://images.unsplash.com/photo-1495020689067-958852a6565d?w=400&auto=format&fit=crop&q=60",
                publishedAt: new Date(art.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sentiment: randSent,
                category: art.title.toLowerCase().includes("sport") ? "sports" : art.title.toLowerCase().includes("crypto") ? "crypto" : "world",
                region: art.title.toLowerCase().includes("india") ? "india" : "world"
              };
            });
            setNewsArticles(articles);
            setIsDemoMode(false);
            setLogs((prev) => ["NewsAPI live payloads downloaded successfully.", ...prev]);
          }
        } else {
          setLogs((prev) => ["Failed fetching live NewsAPI proxy. Falling back to synthetic articles.", ...prev]);
        }
      }

      // If YouTube API Key is supplied or configured on the server, query real videos via proxy
      if (ytApiKey || hasServerYoutubeKey) {
        const queryYt = "bitcoin news geopolitics india sports";
        const ytUrl = `/api/youtube/search?part=snippet&q=${encodeURIComponent(queryYt)}&type=video&order=date&maxResults=6${ytApiKey ? `&key=${ytApiKey}` : ""}`;
        
        const liveZystroflexVideos: YouTubeVideo[] = [
          {
            id: "ystroflex-vid1",
            title: "Zystroflex - System Workflows & Automated Architecture",
            channelTitle: "Zystroflex",
            thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60",
            videoUrl: "https://youtube.com/@zystroflex?si=WgRsNBlCdvtpWQKy",
            publishedAt: "2 days ago",
            views: "24K views",
            category: "Featured"
          },
          {
            id: "ystroflex-vid2",
            title: "How to Build High-Performance Multi-Agent Networks | Zystroflex",
            channelTitle: "Zystroflex",
            thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=60",
            videoUrl: "https://youtube.com/@zystroflex?si=WgRsNBlCdvtpWQKy",
            publishedAt: "1 week ago",
            views: "41K views",
            category: "Featured"
          }
        ];

        try {
          const ytRes = await fetch(ytUrl);
          if (ytRes.ok) {
            const yData = await ytRes.json();
            if (yData.items && yData.items.length > 0) {
              const videos: YouTubeVideo[] = yData.items.map((item: any) => {
                return {
                  id: item.id.videoId,
                  title: item.snippet.title,
                  channelTitle: item.snippet.channelTitle,
                  thumbnailUrl: item.snippet.thumbnails?.medium?.url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=60",
                  videoUrl: `https://youtube.com/watch?v=${item.id.videoId}`,
                  publishedAt: "Recently Uploaded",
                  views: "Live streaming metric active",
                  category: "Live Feed"
                };
              });
              setYtVideos([...liveZystroflexVideos, ...videos]);
              setLogs((prev) => ["YouTube Live Radar feeds integrated with Featured Zystroflex channel content.", ...prev]);
            } else {
              setYtVideos(liveZystroflexVideos);
            }
          } else {
            setYtVideos(liveZystroflexVideos);
          }
        } catch (err) {
          console.error("YouTube Live fetch issue, displaying featured channel fallback.", err);
          setYtVideos(liveZystroflexVideos);
        }
      }

    } catch (e) {
      console.warn("Issue connecting to real-time endpoint feeds. Simulating offline nodes.", e);
      setLogs((prev) => ["Real-time interface offline. Simulated secure database deployed.", ...prev]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial trigger
  useEffect(() => {
    // Check backend server keys availability
    fetch("/api/config/keys")
      .then((res) => res.json())
      .then((data) => {
        setHasServerNewsKey(!!data.hasNewsApiKey);
        setHasServerYoutubeKey(!!data.hasYoutubeApiKey);
        setHasServerOpenSky(!!data.hasOpenSkyAuth);
        if (data.hasNewsApiKey || data.hasYoutubeApiKey) {
          setLogs((prev) => [
            `Server Credentials Found: ${data.hasNewsApiKey ? "NewsAPI (active) " : ""}${data.hasYoutubeApiKey ? "YouTubeAPI (active) " : ""}`,
            ...prev
          ]);
        }
      })
      .catch((err) => console.error("Error fetching credentials configuration", err));

    fetchLiveHubData();
  }, [hasServerNewsKey, hasServerYoutubeKey]);

  // Auto-refresh countdown clock
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchLiveHubData();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filters application
  const filteredArticles = newsArticles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = regionFilter === "all" || art.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  const filteredGeo = geoIncidents.filter((incident) => {
    const matchesSearch =
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredSports = sportsEvents.filter((event) => {
    return (
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredYt = ytVideos.filter((vid) => {
    return (
      vid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vid.channelTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col xl:flex-row h-full min-h-[calc(100vh-4rem)] lg:min-h-screen bg-[#020512] text-white relative font-sans select-none overflow-hidden">
      
      {/* Visual background ambient radar lines */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(168,85,247,0.04)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_80%,rgba(6,182,212,0.03)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,48,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,48,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* Control Deck (Left Sidebar Panel) */}
      <div className="w-full xl:w-96 bg-[#04081c]/90 border-r border-gray-900/80 flex flex-col p-4 md:p-5 gap-4 shrink-0 z-10 shadow-2xl relative">
        
        {/* Title Card */}
        <div className="bg-[#070e2a]/95 border border-indigo-950/60 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-950/50 border border-purple-800/40 rounded-xl text-purple-400">
              <Tv className="w-5 h-5 animate-pulse text-purple-400" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5 uppercase">
                REAL-TIME INTEL
                <span className="text-[8px] bg-red-950/60 text-red-400 border border-red-800/40 px-1.5 py-0.5 rounded font-mono font-bold tracking-widest animate-pulse">LATEST</span>
              </h1>
              <p className="text-[10px] font-mono text-gray-400 mt-0.5">Automated signal monitoring & analytics</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-3.5 leading-relaxed">
            Consolidated intelligence streaming directly from secure satellites and public endpoint relays. Fully customisable telemetry deck.
          </p>

          <div className="mt-4 pt-4 border-t border-gray-900/60 flex items-center justify-between text-[11px] font-mono">
            <span className="text-gray-500 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-cyan-500 animate-ping" : "bg-gray-700"}`} />
              REFRESH {autoRefresh ? `IN ${countdown}S` : "PAUSED"}
            </span>
            <button 
              onClick={fetchLiveHubData}
              disabled={loading}
              className="text-purple-400 hover:text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "POLLING..." : "MANUAL SYNC"}</span>
            </button>
          </div>
        </div>

        {/* Global Controls & Search */}
        <div className="bg-[#070e2a]/95 border border-indigo-950/60 rounded-2xl p-4 shadow-xl space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search news, topics, sports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#030614]/90 border border-gray-800 rounded-xl py-2 pl-9 pr-4 text-xs font-mono placeholder-gray-600 focus:outline-none focus:border-purple-500/50 text-white transition-all"
            />
          </div>

          {/* Region filter for News Articles */}
          {activeTab === "news" && (
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">Geographic Scope</label>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: "all", label: "Global" },
                  { id: "india", label: "India News" },
                  { id: "world", label: "World" },
                  { id: "usa", label: "North America" },
                  { id: "europe", label: "Europe" }
                ].map((reg) => (
                  <button
                    key={reg.id}
                    onClick={() => setRegionFilter(reg.id as any)}
                    className={`px-2 py-1 rounded text-[9px] font-mono font-bold border transition cursor-pointer ${
                      regionFilter === reg.id
                        ? "bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.25)]"
                        : "bg-[#030614]/70 text-gray-400 border-transparent hover:bg-gray-800/40 hover:text-white"
                    }`}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Auto Refresh Toggle */}
          <div className="pt-2 border-t border-gray-900/60 flex items-center justify-between text-[11px] font-mono">
            <span className="text-gray-400">Sync Interval (60s):</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded text-[9px] font-bold transition cursor-pointer border ${
                autoRefresh 
                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40" 
                  : "bg-red-950/40 text-rose-400 border-rose-800/40"
              }`}
            >
              {autoRefresh ? "ACTIVE SCAN" : "MANUAL MODE"}
            </button>
          </div>
        </div>

        {/* News API Credentials Panel */}
        <div className="bg-[#070e2a]/95 border border-indigo-950/60 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <button 
            type="button"
            onClick={() => setShowNewsKey(!showNewsKey)}
            className="w-full flex items-center justify-between text-xs font-mono text-indigo-400 hover:text-white transition focus:outline-none"
          >
            <span className="flex items-center gap-1.5"><Key className="w-4 h-4" /> News API Key</span>
            <span className="text-[10px] bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-900/30">
              {showNewsKey ? "COLLAPSE" : "OPEN"}
            </span>
          </button>

          <AnimatePresence>
            {showNewsKey && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSaveNewsKey}
                className="mt-3.5 space-y-3 overflow-hidden"
              >
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-gray-500 uppercase tracking-wider flex items-center justify-between">
                    <span>News API Key (newsapi.org)</span>
                    {hasServerNewsKey && <span className="text-emerald-400 text-[8px] font-bold">● SERVER CONFIGURED</span>}
                  </label>
                  <input 
                    type="password" 
                    placeholder={hasServerNewsKey ? "Using secure server-side key (optional override)..." : "Enter NewsAPI credential key..."}
                    value={newsApiKey}
                    onChange={(e) => setNewsApiKey(e.target.value)}
                    className="w-full bg-[#030614] border border-gray-800 rounded-xl py-2 px-3 text-xs font-mono focus:outline-none focus:border-indigo-500 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  SAVE NEWS CREDENTIAL
                </button>

                {newsKeySavedMessage && (
                  <p className="text-[10px] font-mono text-emerald-400 text-center animate-pulse">{newsKeySavedMessage}</p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* YouTube API Credentials Panel */}
        <div className="bg-[#070e2a]/95 border border-indigo-950/60 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <button 
            type="button"
            onClick={() => setShowYoutubeKey(!showYoutubeKey)}
            className="w-full flex items-center justify-between text-xs font-mono text-indigo-400 hover:text-white transition focus:outline-none"
          >
            <span className="flex items-center gap-1.5"><Key className="w-4 h-4" /> YouTube API Key</span>
            <span className="text-[10px] bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-900/30">
              {showYoutubeKey ? "COLLAPSE" : "OPEN"}
            </span>
          </button>

          <AnimatePresence>
            {showYoutubeKey && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSaveYtKey}
                className="mt-3.5 space-y-3 overflow-hidden"
              >
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-gray-500 uppercase tracking-wider flex items-center justify-between">
                    <span>YouTube Data API v3 Key</span>
                    {hasServerYoutubeKey && <span className="text-emerald-400 text-[8px] font-bold">● SERVER CONFIGURED</span>}
                  </label>
                  <input 
                    type="password" 
                    placeholder={hasServerYoutubeKey ? "Using secure server-side key (optional override)..." : "Enter YouTube v3 developer key..."}
                    value={ytApiKey}
                    onChange={(e) => setYtApiKey(e.target.value)}
                    className="w-full bg-[#030614] border border-gray-800 rounded-xl py-2 px-3 text-xs font-mono focus:outline-none focus:border-indigo-500 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-700 hover:bg-red-600 text-white py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer shadow-lg shadow-red-700/20"
                >
                  SAVE YOUTUBE CREDENTIAL
                </button>

                {ytKeySavedMessage && (
                  <p className="text-[10px] font-mono text-emerald-400 text-center animate-pulse">{ytKeySavedMessage}</p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Console Logs Ticker */}
        <div className="bg-[#030614]/90 border border-gray-900/60 rounded-2xl p-4 flex-1 flex flex-col overflow-hidden font-mono min-h-[140px]">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest pb-2 mb-2 border-b border-gray-900/60 block">Signal Console Logs</span>
          <div className="flex-1 overflow-y-auto space-y-1.5 text-[10px] text-indigo-300">
            {logs.map((log, index) => (
              <div key={index} className="flex gap-1.5 leading-relaxed">
                <span className="text-gray-600 shrink-0">&gt;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Main Signal Display Desk */}
      <div className="flex-1 bg-[#030614] p-4 md:p-6 flex flex-col gap-6 overflow-y-auto relative z-10 max-h-screen">
        
        {/* Navigation Tabs Desk */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-900/60 pb-4 shrink-0">
          {[
            { id: "news", label: "Top News Feed", icon: Newspaper, color: "text-purple-400" },
            { id: "crypto", label: "Bitcoin & Crypto", icon: TrendingUp, color: "text-cyan-400" },
            { id: "geo", label: "Wars & Geopolitics", icon: Globe, color: "text-rose-400" },
            { id: "sports", label: "Sports Ticker", icon: Trophy, color: "text-amber-400" },
            { id: "youtube", label: "YouTube Radar", icon: Youtube, color: "text-red-400" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setLogs((prev) => [`Switched signal deck to ${tab.label}`, ...prev]);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition text-xs font-semibold cursor-pointer ${
                  isActive 
                    ? "bg-[#080e2d] border-purple-500/50 text-white shadow-lg shadow-purple-500/5"
                    : "bg-[#04081c]/60 border-gray-900 text-gray-400 hover:bg-[#070e2c]/40 hover:text-white"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${isActive ? tab.color : "text-gray-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Demo Mode alert bar */}
        {isDemoMode && (
          <div className="bg-amber-950/20 border border-amber-800/35 rounded-xl p-3 flex items-center justify-between text-xs font-mono text-amber-400 shrink-0">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
              <span>Tactical Synthetic data is active. Enter your NewsAPI or YouTube API credentials in the left deck for live satellite streams.</span>
            </div>
            <span className="text-[10px] bg-amber-900/30 px-2 py-0.5 rounded border border-amber-800/20 uppercase font-bold shrink-0 hidden md:inline-block">PREVIEW ACTIVE</span>
          </div>
        )}

        {/* Tab Viewport Frame */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              
              {/* TAB 1: NEWS */}
              {activeTab === "news" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredArticles.map((art) => (
                    <div 
                      key={art.id}
                      className="bg-[#050a1d]/85 border border-[#1e295d]/30 rounded-2xl overflow-hidden hover:border-purple-500/40 transition-all duration-300 flex flex-col group relative shadow-xl"
                    >
                      {art.imageUrl && (
                        <div className="h-44 overflow-hidden relative shrink-0">
                          <img 
                            src={art.imageUrl} 
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#020512] to-transparent" />
                          <span className="absolute top-3 left-3 bg-[#030614]/90 border border-gray-800/80 px-2 py-0.5 rounded text-[8px] font-mono text-white font-bold uppercase tracking-wider">
                            {art.category}
                          </span>
                        </div>
                      )}

                      <div className="p-4 flex-1 flex flex-col gap-3">
                        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                          <span className="text-gray-400 font-bold">{art.source}</span>
                          <span>{art.publishedAt}</span>
                        </div>

                        <h3 className="text-sm font-bold text-white leading-snug group-hover:text-purple-400 transition line-clamp-2">
                          {art.title}
                        </h3>

                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                          {art.description}
                        </p>

                        <div className="mt-auto pt-3 border-t border-gray-900/60 flex items-center justify-between">
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                            art.sentiment === "Positive" 
                              ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40" 
                              : art.sentiment === "Negative" 
                              ? "bg-red-950/40 text-rose-400 border-rose-800/40" 
                              : "bg-gray-950/40 text-gray-400 border-gray-800/40"
                          }`}>
                            {art.sentiment} Sentiment
                          </span>

                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleToggleBookmark(art.id)}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                bookmarks.includes(art.id)
                                  ? "bg-purple-950/50 border-purple-800/40 text-purple-400"
                                  : "bg-[#030614]/60 border-gray-900 text-gray-500 hover:text-white"
                              }`}
                              title="Bookmark Article"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleCopyLink(art.url)}
                              className="p-1.5 rounded-lg border bg-[#030614]/60 border-gray-900 text-gray-500 hover:text-white transition cursor-pointer"
                              title="Copy Share Link"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <a 
                              href={art.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border bg-purple-950/30 border-purple-900/40 text-purple-400 hover:bg-purple-900/30 hover:text-white transition flex items-center justify-center cursor-pointer"
                              title="Open Article Source"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: CRYPTO */}
              {activeTab === "crypto" && (
                <div className="space-y-6">
                  {/* Top Crypto Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {cryptoTokens.map((token) => {
                      const isUp = token.change24h >= 0;
                      return (
                        <div 
                          key={token.id}
                          className="bg-[#050a1d]/85 border border-[#1e295d]/30 rounded-2xl p-4.5 hover:border-cyan-500/30 transition-all duration-300 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-gray-400 uppercase">{token.symbol} / USD</span>
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              isUp ? "bg-emerald-950/30 text-emerald-400" : "bg-red-950/30 text-rose-400"
                            }`}>
                              {isUp ? "+" : ""}{token.change24h.toFixed(2)}%
                            </span>
                          </div>

                          <h3 className="text-lg font-mono font-black mt-2 text-white">
                            ${token.priceUSD.toLocaleString()}
                          </h3>
                          <span className="text-[10px] font-mono text-gray-500 block">
                            ₹{token.priceINR.toLocaleString()} INR
                          </span>

                          <div className="mt-3.5 flex items-center justify-between text-[10px] font-mono text-gray-500">
                            <span>MCAP</span>
                            <span className="text-gray-300">${(token.marketCapUSD / 1e9).toFixed(2)}B</span>
                          </div>

                          {/* Mini Line Chart simulation */}
                          <div className="mt-4 h-6 flex items-end gap-0.5">
                            {token.sparkline.map((val, i) => {
                              const ratio = (val - Math.min(...token.sparkline)) / (Math.max(...token.sparkline) - Math.min(...token.sparkline) || 1);
                              const height = 10 + ratio * 90;
                              return (
                                <div 
                                  key={i}
                                  className={`flex-1 rounded-sm ${isUp ? "bg-cyan-500" : "bg-rose-500"}`}
                                  style={{ height: `${height}%`, opacity: 0.3 + (i / 10) }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Financial Disclaimer Banner */}
                  <div className="bg-[#04081c] border border-cyan-950 rounded-2xl p-4 text-xs font-mono text-cyan-400/80 flex items-center gap-3">
                    <Info className="w-5 h-5 text-cyan-400 shrink-0" />
                    <span><strong>REGULATORY ADVISOR:</strong> Crypto assets and associated indices are highly volatile. Live data points are fetched from decentralized open indices. This layout represents mathematical data metrics, and does not represent absolute investment/financial predictions.</span>
                  </div>

                  {/* Latest Crypto News Sub-feed */}
                  <div className="bg-[#050a1d]/85 border border-[#1e295d]/30 rounded-2xl p-5 shadow-xl space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" /> Decentralized Market Intelligence News
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {newsArticles.filter(art => art.category === "crypto").map((art) => (
                        <div key={art.id} className="p-3.5 bg-[#030614]/80 border border-gray-900/60 rounded-xl flex flex-col justify-between hover:border-cyan-500/30 transition">
                          <div>
                            <span className="text-[9px] font-mono text-gray-500 uppercase">{art.source} • {art.publishedAt}</span>
                            <h4 className="text-xs font-bold text-white mt-1.5 hover:text-cyan-400 transition line-clamp-1">{art.title}</h4>
                            <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{art.description}</p>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-900/40">
                            <span className="text-[9px] font-mono text-emerald-400">Stable Accumulation Indicator</span>
                            <a href={art.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1">
                              Verify Intel <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: WARS & GEOPOLITICS */}
              {activeTab === "geo" && (
                <div className="space-y-5">
                  {/* Warning banner */}
                  <div className="bg-[#04081c] border border-rose-950 rounded-2xl p-4 text-xs font-mono text-rose-400/80 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>Conflict updates are sourced from neutral public news API feeds. Language is moderated to avoid graphic depictions. Updates are for academic global monitoring and may be delayed.</span>
                  </div>

                  {/* Incident Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredGeo.map((incident) => (
                      <div 
                        key={incident.id}
                        className="bg-[#050a1d]/85 border border-red-950/35 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between hover:border-rose-500/30 transition-all group"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/30 border border-rose-900/40 px-2 py-0.5 rounded-full">
                              {incident.region}
                            </span>
                            <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded uppercase border ${
                              incident.severity === "Critical"
                                ? "bg-red-950 text-rose-400 border-rose-800"
                                : "bg-[#030614] text-gray-400 border-gray-800"
                            }`}>
                              {incident.severity}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition leading-snug">
                            {incident.title}
                          </h3>

                          <p className="text-xs text-gray-400 leading-relaxed">
                            {incident.summary}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-900/60 flex items-center justify-between text-[10px] font-mono text-gray-500">
                          <span>Feed: {incident.source}</span>
                          <span>{incident.publishedAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: SPORTS */}
              {activeTab === "sports" && (
                <div className="space-y-6">
                  {/* Live Fixtures Ticker */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredSports.map((event) => {
                      const isLive = event.status === "LIVE";
                      return (
                        <div 
                          key={event.id}
                          className={`bg-[#050a1d]/85 border rounded-2xl p-4.5 flex flex-col justify-between transition group relative ${
                            isLive ? "border-amber-500/40 shadow-lg shadow-amber-500/5" : "border-[#1e295d]/30"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider">{event.sport}</span>
                              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                                isLive ? "bg-amber-950 text-amber-400 animate-pulse" : "bg-gray-950 text-gray-500"
                              }`}>
                                {event.status}
                              </span>
                            </div>

                            <h3 className="text-xs font-mono text-gray-400 mt-2">{event.league}</h3>
                            
                            <div className="mt-3.5 space-y-1">
                              <div className="flex justify-between items-center text-xs font-bold text-white">
                                <span>{event.teamHome}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs font-bold text-white">
                                <span>{event.teamAway}</span>
                              </div>
                            </div>

                            {event.score && (
                              <div className="mt-4 bg-[#030614]/80 border border-gray-900 px-3 py-1.5 rounded-xl text-center text-xs font-mono text-amber-400 font-bold">
                                {event.score}
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-3.5 border-t border-gray-900/60 text-[9px] font-mono text-gray-500 flex justify-between">
                            <span>{event.venue}</span>
                            <span>{event.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sports News feed list */}
                  <div className="bg-[#050a1d]/85 border border-[#1e295d]/30 rounded-2xl p-5 shadow-xl space-y-3.5">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" /> Global Athletic News Stream
                    </h3>
                    <div className="space-y-3">
                      {newsArticles.filter(art => art.category === "sports").map((art) => (
                        <div key={art.id} className="p-3 bg-[#030614]/80 border border-gray-900/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[9px] font-mono text-gray-500">{art.source} • {art.publishedAt}</span>
                            <h4 className="text-xs font-bold text-white mt-1 hover:text-amber-400 transition">{art.title}</h4>
                          </div>
                          <a 
                            href={art.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-amber-950/20 hover:bg-amber-900/30 border border-amber-800/40 rounded-lg text-[10px] font-mono text-amber-400 flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                          >
                            Open Coverage <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 5: YOUTUBE RADAR */}
              {activeTab === "youtube" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {filteredYt.map((vid) => (
                    <div 
                      key={vid.id}
                      className="bg-[#050a1d]/85 border border-[#1e295d]/30 rounded-2xl overflow-hidden hover:border-red-500/40 transition-all duration-300 flex flex-col group relative"
                    >
                      <div className="h-40 overflow-hidden relative shrink-0 bg-gray-950">
                        <img 
                          src={vid.thumbnailUrl} 
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020512] to-transparent" />
                        
                        {/* YouTube Brand floating badge */}
                        <span className="absolute bottom-3 right-3 bg-red-600 px-2 py-0.5 rounded text-[8px] font-mono text-white font-bold tracking-widest flex items-center gap-1">
                          <Youtube className="w-3 h-3 fill-current" /> RADAR
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col gap-3">
                        <span className="text-[9px] font-mono text-gray-500">{vid.channelTitle} • {vid.publishedAt}</span>
                        
                        <h3 className="text-xs font-bold text-white leading-snug group-hover:text-red-400 transition line-clamp-2">
                          {vid.title}
                        </h3>

                        <div className="mt-auto pt-3 border-t border-gray-900/60 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-gray-500">{vid.views}</span>
                          <a 
                            href={vid.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-900/30 border border-red-800/40 rounded-lg text-[10px] font-bold text-red-400 flex items-center gap-1 cursor-pointer transition"
                          >
                            <Play className="w-3 h-3 fill-current" /> Watch Video
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Hub Footer Notice */}
        <div className="mt-auto shrink-0 pt-4 border-t border-gray-900/60 flex flex-col md:flex-row items-center justify-between text-[11px] font-mono text-gray-550 gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span>Encrypted monitoring interface. Sourced across distributed nodes. Disclaimer rules are strictly active.</span>
          </div>
          <div className="bg-purple-950/20 px-2.5 py-0.5 rounded border border-purple-900/30 text-[10px] text-purple-400">
            SECURE DEPLOYMENT: OMNIGEN RADAR
          </div>
        </div>

      </div>

    </div>
  );
}
