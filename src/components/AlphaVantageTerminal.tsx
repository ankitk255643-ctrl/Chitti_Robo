import React, { useState, useEffect, useRef } from "react";
import { 
  Key, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  Activity, 
  Globe, 
  ArrowUpRight, 
  Check, 
  AlertCircle,
  Clock,
  Sparkles
} from "lucide-react";

interface AlphaVantageTerminalProps {
  onSelectTicker: (symbol: string) => void;
  currentTicker: string;
}

export default function AlphaVantageTerminal({ onSelectTicker, currentTicker }: AlphaVantageTerminalProps) {
  const [apiKey, setApiKey] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Quote & Series state
  const [activeSymbol, setActiveSymbol] = useState("");
  const [quoteData, setQuoteData] = useState<any>(null);
  const [seriesData, setSeriesData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [intervalMode, setIntervalMode] = useState<"daily" | "intraday">("daily");
  
  // Hover chart tooltip state
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  // Fetch initial configuration on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  // Sync with parent's active assetName if it changes
  useEffect(() => {
    if (currentTicker && isConfigured && currentTicker !== activeSymbol) {
      // If it looks like a symbol (no spaces, reasonably short), fetch quote
      if (!currentTicker.includes(" ") && currentTicker.length < 15) {
        handleQueryTicker(currentTicker);
      }
    }
  }, [currentTicker, isConfigured]);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/investment/config");
      if (res.ok) {
        const data = await res.json();
        if (data.alphaVantageApiKey) {
          setApiKey(data.alphaVantageApiKey);
          setIsConfigured(true);
        }
      }
    } catch (err) {
      console.error("Failed to load Alpha Vantage key:", err);
    }
  };

  const handleSaveKey = async () => {
    setLocalError(null);
    setLocalSuccess(null);
    try {
      const res = await fetch("/api/investment/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alphaVantageApiKey: apiKey.trim() })
      });
      if (res.ok) {
        const hasKey = !!apiKey.trim();
        setIsConfigured(hasKey);
        setLocalSuccess(hasKey ? "Alpha Vantage key configured successfully!" : "Key cleared.");
        setShowSettings(false);
        if (hasKey && currentTicker) {
          handleQueryTicker(currentTicker);
        }
      } else {
        setLocalError("Failed to save configuration key.");
      }
    } catch (err) {
      setLocalError("Server connection error.");
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setLocalError(null);
    setLocalSuccess(null);
    try {
      const res = await fetch(`/api/investment/alpha-vantage/search?keywords=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.bestMatches) {
          setSearchResults(data.bestMatches);
          if (data.bestMatches.length === 0) {
            setLocalSuccess("No symbols found. Note: To search Indian stock tickers on Alpha Vantage, try searching for the company name (e.g. 'Tata', 'Reliance', 'Infosys') or type the exact ticker and click 'Direct Quote' below.");
          }
        } else if (data.Note) {
          setLocalError(`Standard API limit reached: ${data.Note}. Standard keys are limited to 5 requests per minute.`);
        } else if (data["Error Message"]) {
          setLocalError(`Alpha Vantage Error: ${data["Error Message"]}`);
        } else if (data["Information"]) {
          setLocalError(`Alpha Vantage Info: ${data["Information"]}`);
        } else {
          setLocalError("Could not retrieve search results. Ensure your Alpha Vantage API Key is correct.");
        }
      } else {
        const text = await res.text();
        setLocalError(`Search request failed: ${text || res.statusText}`);
      }
    } catch (err: any) {
      setLocalError(`Search connection failed: ${err.message || err}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQueryTicker = async (symbolStr: string, mode: "daily" | "intraday" = intervalMode) => {
    if (!symbolStr) return;
    setIsLoadingData(true);
    setLocalError(null);
    setQuoteData(null);
    setSeriesData([]);
    setActiveSymbol(symbolStr.toUpperCase());

    try {
      const cleanSymbol = symbolStr.trim().toUpperCase();
      const quoteRes = await fetch(`/api/investment/alpha-vantage/quote?symbol=${encodeURIComponent(cleanSymbol)}`);
      
      if (quoteRes.ok) {
        const qData = await quoteRes.json();
        
        if (qData["Note"]) {
          setLocalError("API limit hit (5 calls/min). Please wait a moment.");
          setIsLoadingData(false);
          return;
        }

        const quote = qData["Global Quote"];
        if (quote && Object.keys(quote).length > 0) {
          setQuoteData(quote);
          
          // Fetch series data based on chosen mode
          const endpoint = mode === "intraday"
            ? `/api/investment/alpha-vantage/intraday?symbol=${encodeURIComponent(cleanSymbol)}&interval=5min`
            : `/api/investment/alpha-vantage/series?symbol=${encodeURIComponent(cleanSymbol)}`;

          const seriesRes = await fetch(endpoint);
          if (seriesRes.ok) {
            const sData = await seriesRes.json();
            
            if (sData["Note"]) {
              setLocalError("API limit hit (5 calls/min). Intraday series could not load.");
              setIsLoadingData(false);
              return;
            }

            const dailySeries = sData["Time Series (Daily)"];
            const intradaySeries = sData["Time Series (5min)"] || sData["Time Series (1min)"] || sData["Time Series (15min)"];
            const series = mode === "intraday" ? (intradaySeries || dailySeries) : (dailySeries || intradaySeries);

            if (series) {
              const formatted = Object.keys(series)
                .slice(0, 15) // last 15 ticks/days
                .map(date => {
                  const label = mode === "intraday" && date.includes(" ")
                    ? date.split(" ")[1].substring(0, 5) // extract "HH:MM"
                    : date.substring(5); // extract "MM-DD"
                  return {
                    date: label,
                    close: parseFloat(series[date]["4. close"]),
                    open: parseFloat(series[date]["1. open"]),
                    high: parseFloat(series[date]["2. high"]),
                    low: parseFloat(series[date]["3. low"]),
                    volume: parseInt(series[date]["5. volume"]),
                  };
                })
                .reverse();
              setSeriesData(formatted);
            } else if (sData["Error Message"] || sData["Information"]) {
              setLocalError(sData["Error Message"] || sData["Information"] || "Error fetching series data.");
            }
          }
        } else {
          setLocalError(`Could not find quote for symbol "${cleanSymbol}". Ensure it is correct (e.g., RELIANCE.BSE, INFY.NSE).`);
        }
      }
    } catch (err) {
      setLocalError("Failed to fetch market data.");
    } finally {
      setIsLoadingData(false);
    }
  };

  // Custom Chart SVG Calculations
  const renderChart = () => {
    if (seriesData.length < 2) return null;

    const width = 450;
    const height = 140;
    const padding = 20;

    const prices = seriesData.map(d => d.close);
    const minPrice = Math.min(...prices) * 0.995;
    const maxPrice = Math.max(...prices) * 1.005;
    const priceRange = maxPrice - minPrice;

    const points = seriesData.map((d, index) => {
      const x = padding + (index / (seriesData.length - 1)) * (width - padding * 2);
      const y = height - padding - ((d.close - minPrice) / priceRange) * (height - padding * 2);
      return { x, y, data: d, index };
    });

    const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    
    // Area gradient path
    const areaPathData = `
      ${pathData} 
      L ${points[points.length - 1].x} ${height - padding} 
      L ${points[0].x} ${height - padding} 
      Z
    `;

    return (
      <div className="relative bg-gray-950/20 backdrop-blur-sm p-3 rounded-xl border border-gray-900/40">
        <div className="flex justify-between items-center mb-1.5 px-1">
          <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider uppercase flex items-center gap-1">
            <Activity className="w-3 h-3 animate-pulse" /> {intervalMode === "intraday" ? "Intraday (5m) Trend" : "15-Day Price Trend"} (Alpha Vantage)
          </span>
          {hoveredPoint ? (
            <span className="text-[10px] font-mono text-cyan-300">
              {hoveredPoint.date}: <strong className="text-white">₹{hoveredPoint.close.toFixed(2)}</strong>
            </span>
          ) : (
            <span className="text-[9px] font-mono text-gray-500">Hover graph to inspect price points</span>
          )}
        </div>

        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => {
            setHoveredPoint(null);
            setHoverIndex(null);
          }}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.03)" strokeDasharray="3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.03)" strokeDasharray="3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" />

          {/* Filled Area */}
          <path d={areaPathData} fill="url(#chartGradient)" />

          {/* Trend Line */}
          <path 
            d={pathData} 
            fill="none" 
            stroke="url(#strokeGradient)" 
            strokeWidth="2.5" 
            filter="url(#glow)"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Point interactive indicators */}
          {points.map((p, i) => (
            <g key={i}>
              {/* Highlight Column on hover */}
              {hoverIndex === i && (
                <line 
                  x1={p.x} 
                  y1={padding} 
                  x2={p.x} 
                  y2={height - padding} 
                  stroke="rgba(34, 211, 238, 0.15)" 
                  strokeWidth="1"
                />
              )}
              {/* Invisible touch anchor */}
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="10" 
                fill="transparent" 
                className="cursor-pointer"
                onMouseEnter={() => {
                  setHoveredPoint(p.data);
                  setHoverIndex(i);
                }}
              />
              {/* Visible dot for selected or hovered item */}
              {(hoverIndex === i || i === points.length - 1) && (
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={hoverIndex === i ? "4" : "3"} 
                  fill="#22d3ee" 
                  stroke="#020512" 
                  strokeWidth="1.5" 
                />
              )}
            </g>
          ))}
        </svg>

        {/* Min/Max indicators */}
        <div className="flex justify-between items-center mt-1 text-[9px] font-mono text-gray-500 px-1">
          <span>{seriesData[0].date} (Start)</span>
          <span>Range: ₹{minPrice.toFixed(2)} - ₹{maxPrice.toFixed(2)}</span>
          <span>{seriesData[seriesData.length - 1].date} (Latest)</span>
        </div>
      </div>
    );
  };

  return (
    <div className="glassmorphism p-4 rounded-2xl space-y-4 shadow-xl">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-gray-900/60 pb-3">
        <div className="flex items-center gap-2">
          <Globe className={`w-4 h-4 ${isConfigured ? "text-cyan-400 animate-pulse" : "text-gray-500"}`} />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-200">Alpha Vantage Node</h3>
            <span className="text-[9px] font-mono block text-gray-400">
              {isConfigured ? "● Grounded in Real-Time Market Data" : "○ Offline / Simulation Mode Only"}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`px-2 py-1 rounded border text-[10px] font-mono flex items-center gap-1 cursor-pointer transition ${
            showSettings 
              ? "bg-cyan-500/10 border-cyan-400 text-cyan-400" 
              : "bg-transparent border-gray-800 text-gray-400 hover:border-gray-700"
          }`}
        >
          <Key className="w-3 h-3" />
          {isConfigured ? "Update API Key" : "Configure Key"}
        </button>
      </div>

      {/* Settings Panel for Key Entry */}
      {showSettings && (
        <div className="p-3 bg-gray-950/40 border border-gray-900 rounded-xl space-y-3 animate-fadeIn">
          <div className="space-y-1.5">
            <label className="block text-[9px] font-mono text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>Your Alpha Vantage API Key</span>
              <a 
                href="https://www.alphavantage.co/support/#api-key" 
                target="_blank" 
                rel="noreferrer" 
                className="text-cyan-400 hover:underline text-[8px] tracking-normal lowercase font-sans font-medium"
              >
                get free API key
              </a>
            </label>
            <div className="flex gap-2">
              <input 
                type="password" 
                placeholder="Enter Alpha Vantage API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 bg-gray-950/50 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 text-gray-200 font-mono"
              />
              <button
                onClick={handleSaveKey}
                className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Local messages feedback */}
      {localError && (
        <div className="p-2.5 bg-rose-950/20 border border-rose-900/30 rounded-lg flex items-start gap-2 text-rose-300 text-[10px] animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <div>{localError}</div>
        </div>
      )}
      {localSuccess && (
        <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/30 rounded-lg flex items-start gap-2 text-emerald-300 text-[10px] animate-fadeIn">
          <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <div>{localSuccess}</div>
        </div>
      )}

      {isConfigured ? (
        <div className="space-y-4">
           {/* SEARCH COMPONENT for Tickers */}
          <div className="space-y-2">
            <form onSubmit={handleSearch} className="flex gap-1.5 flex-col sm:flex-row">
              <div className="relative flex-1">
                <input 
                  type="text"
                  placeholder="Search name or enter exact ticker (e.g. RELIANCE)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-950/50 border border-gray-800 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 text-gray-200 font-mono placeholder:text-gray-600"
                />
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
              </div>
              <div className="flex gap-1.5">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="flex-1 sm:flex-none bg-gray-900/40 border border-gray-800 text-gray-200 hover:bg-gray-850 hover:border-gray-700 text-xs px-3 py-1.5 rounded-lg font-mono tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Search Alpha Vantage's global symbol index for matching company keywords"
                >
                  {isSearching ? "..." : "Search Index"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      handleQueryTicker(searchQuery);
                    } else {
                      setLocalError("Please enter a ticker symbol first (e.g., RELIANCE.BSE)");
                    }
                  }}
                  disabled={isLoadingData}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg font-mono tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Fetch the live stock quotes directly bypassing search index"
                >
                  {isLoadingData ? "..." : "Direct Quote"}
                </button>
              </div>
            </form>

            {/* Quick Suffix Helpers and Common Indian Stock Examples */}
            <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-mono text-gray-500">
              <span className="text-gray-600 uppercase text-[8px] font-bold">Quick Format:</span>
              <button
                type="button"
                onClick={() => {
                  const val = searchQuery.trim();
                  if (val && !val.endsWith(".BSE") && !val.endsWith(".NSE")) {
                    setSearchQuery(val + ".BSE");
                  } else if (!val) {
                    setSearchQuery("RELIANCE.BSE");
                  }
                }}
                className="px-1.5 py-0.5 bg-gray-950/60 border border-gray-900 rounded text-cyan-400 hover:text-cyan-300 hover:border-cyan-800/40 cursor-pointer"
              >
                + .BSE (Bombay)
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = searchQuery.trim();
                  if (val && !val.endsWith(".BSE") && !val.endsWith(".NSE")) {
                    setSearchQuery(val + ".NSE");
                  } else if (!val) {
                    setSearchQuery("RELIANCE.NSE");
                  }
                }}
                className="px-1.5 py-0.5 bg-gray-950/60 border border-gray-900 rounded text-cyan-400 hover:text-cyan-300 hover:border-cyan-800/40 cursor-pointer"
              >
                + .NSE (National)
              </button>

              <span className="text-gray-600 mx-1">|</span>

              <span className="text-gray-600 uppercase text-[8px] font-bold">Presets:</span>
              {["RELIANCE.BSE", "TATASTEEL.NSE", "HDFCBANK.BSE", "INFY.NSE"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setSearchQuery(preset);
                    handleQueryTicker(preset);
                  }}
                  className="px-1.5 py-0.5 bg-indigo-950/25 hover:bg-indigo-950/50 border border-indigo-900/30 rounded text-indigo-300 hover:text-indigo-200 cursor-pointer transition"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Search results list */}
          {searchResults.length > 0 && (
            <div className="bg-[#020511] border border-gray-900 max-h-40 overflow-y-auto rounded-lg divide-y divide-gray-900 font-mono text-[10px]">
              <div className="p-1.5 bg-gray-950/60 text-gray-500 text-[9px] uppercase tracking-wider font-bold">Best Matches Found:</div>
              {searchResults.map((match, i) => {
                const sym = match["1. symbol"];
                const name = match["2. name"];
                const region = match["4. region"];
                const currency = match["8. currency"];
                return (
                  <button
                    key={i}
                    onClick={() => {
                      handleQueryTicker(sym);
                      setSearchResults([]);
                      setSearchQuery("");
                    }}
                    className="w-full text-left p-2 hover:bg-cyan-950/20 flex justify-between items-center transition group text-gray-300 cursor-pointer"
                  >
                    <div>
                      <span className="text-cyan-400 font-bold font-mono group-hover:underline">{sym}</span>
                      <span className="text-gray-500 ml-2 text-[9px] line-clamp-1">{name}</span>
                    </div>
                    <div className="text-[8px] text-gray-500 text-right bg-gray-950 px-1 py-0.5 rounded">
                      {region} | {currency}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ACTIVE SYMBOL & LIVE PRICE CARD */}
          {activeSymbol && (
            <div className="border border-gray-900 rounded-xl overflow-hidden bg-[#030718]">
              {isLoadingData ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <div className="w-5 h-5 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
                  <span className="text-[10px] font-mono text-gray-500">Querying live metrics...</span>
                </div>
              ) : quoteData ? (
                <div className="space-y-3">
                  
                  {/* Top Price Header */}
                  <div className="p-3 bg-gradient-to-r from-gray-950 to-indigo-950/40 border-b border-gray-900 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-mono font-bold text-white tracking-wider">{activeSymbol}</span>
                        <span className="text-[8px] bg-cyan-950/60 border border-cyan-800/30 text-cyan-400 font-mono px-1.5 py-0.5 rounded">
                          REAL-TIME NODE
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" /> Checked: {quoteData["07. latest trading day"]}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-mono font-extrabold text-white">
                        ₹{parseFloat(quoteData["05. price"]).toFixed(2)}
                      </div>
                      <div className={`flex items-center justify-end text-[10px] font-mono font-bold gap-0.5 ${
                        parseFloat(quoteData["09. change"]) >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        {parseFloat(quoteData["09. change"]) >= 0 ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {parseFloat(quoteData["09. change"]) >= 0 ? "+" : ""}
                        {parseFloat(quoteData["09. change"]).toFixed(2)} ({quoteData["10. change percent"]})
                      </div>
                    </div>
                  </div>

                  {/* Info stats grid */}
                  <div className="grid grid-cols-2 gap-2 p-3 pt-0 font-mono text-[10px]">
                    <div className="bg-gray-950/40 p-2 rounded-lg border border-gray-900/60 flex justify-between">
                      <span className="text-gray-500">Daily Open</span>
                      <span className="text-gray-300">₹{parseFloat(quoteData["02. open"]).toFixed(2)}</span>
                    </div>
                    <div className="bg-gray-950/40 p-2 rounded-lg border border-gray-900/60 flex justify-between">
                      <span className="text-gray-500">Prev Close</span>
                      <span className="text-gray-300">₹{parseFloat(quoteData["08. previous close"]).toFixed(2)}</span>
                    </div>
                    <div className="bg-gray-950/40 p-2 rounded-lg border border-gray-900/60 flex justify-between col-span-2">
                      <span className="text-gray-500">Trading Volume</span>
                      <span className="text-gray-200">{parseInt(quoteData["06. volume"]).toLocaleString()} shares</span>
                    </div>

                    {/* Visual Slider Daily High/Low Bounds */}
                    <div className="col-span-2 space-y-1.5 pt-1.5">
                      <div className="flex justify-between text-[8px] text-gray-500 uppercase tracking-wider">
                        <span>Low: ₹{parseFloat(quoteData["04. low"]).toFixed(2)}</span>
                        <span>High: ₹{parseFloat(quoteData["03. high"]).toFixed(2)}</span>
                      </div>
                      <div className="relative w-full h-1.5 bg-gray-950 rounded-full overflow-hidden border border-gray-900">
                        {/* Position bar */}
                        <div 
                          className="absolute top-0 bottom-0 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                          style={{
                            left: `${Math.max(0, Math.min(100, ((parseFloat(quoteData["05. price"]) - parseFloat(quoteData["04. low"])) / (parseFloat(quoteData["03. high"]) - parseFloat(quoteData["04. low"])) * 100)) - 10)}%`,
                            width: "20%"
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interval selector */}
                  <div className="px-3 pb-2 flex justify-between items-center border-t border-gray-900/40 pt-2.5">
                    <span className="text-[9px] font-mono text-gray-500 uppercase">Interval Profile</span>
                    <div className="flex bg-gray-950/80 rounded-lg p-0.5 border border-gray-900/60">
                      <button
                        type="button"
                        onClick={() => {
                          setIntervalMode("daily");
                          handleQueryTicker(activeSymbol, "daily");
                        }}
                        className={`px-2.5 py-1 rounded text-[9px] font-mono cursor-pointer transition ${
                          intervalMode === "daily"
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-800/30"
                            : "text-gray-500 hover:text-gray-300 border border-transparent"
                        }`}
                      >
                        15d Daily
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIntervalMode("intraday");
                          handleQueryTicker(activeSymbol, "intraday");
                        }}
                        className={`px-2.5 py-1 rounded text-[9px] font-mono cursor-pointer transition ${
                          intervalMode === "intraday"
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-800/30"
                            : "text-gray-500 hover:text-gray-300 border border-transparent"
                        }`}
                      >
                        5m Intraday
                      </button>
                    </div>
                  </div>

                  {/* Render Custom SVG line chart */}
                  {seriesData.length > 0 && (
                    <div className="p-3 pt-0">
                      {renderChart()}
                    </div>
                  )}

                  {/* Apply symbol back to Analyzer button */}
                  <div className="p-3 pt-0 flex gap-2">
                    <button
                      onClick={() => {
                        onSelectTicker(activeSymbol);
                        setLocalSuccess(`Applied "${activeSymbol}" ticker as the active analyzer asset!`);
                        setTimeout(() => setLocalSuccess(null), 3500);
                      }}
                      className="w-full bg-cyan-950/40 hover:bg-cyan-950/80 border border-cyan-800/40 text-cyan-300 hover:text-cyan-200 font-bold py-2 rounded-lg text-[10px] font-mono tracking-wider transition uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Sync Ticker with AI Analyzer Form
                    </button>
                  </div>

                </div>
              ) : (
                <div className="p-4 text-center text-xs text-gray-500 font-mono">
                  Could not load live pricing. Click on a search match or enter a valid ticker above.
                </div>
              )}
            </div>
          )}

          {/* Quick Guidance Info */}
          {!activeSymbol && (
            <div className="p-3 bg-indigo-950/10 border border-indigo-900/20 rounded-xl flex gap-2 text-[10px] text-indigo-300 font-mono leading-relaxed">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Pro-Tip for Indian Assets</strong>: Search Alpha Vantage with the company name, then pick the BSE (Bombay Stock Exchange) or NSE (National Stock Exchange) ticker (e.g. <strong>RELIANCE.BSE</strong>, <strong>INFY.NSE</strong>).
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="p-6 bg-gray-950/40 border border-gray-900 rounded-xl text-center space-y-3">
          <Key className="w-8 h-8 text-gray-600 mx-auto animate-bounce" />
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Unconfigured API Node</h4>
            <p className="text-[10px] text-gray-500 max-w-xs mx-auto leading-normal font-sans">
              Connect your free Alpha Vantage key to unlock interactive live stock charts, search Indian BSE/NSE asset quotes, and feed real-time pricing data to Gemini.
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider cursor-pointer transition inline-flex items-center gap-1"
          >
            <Key className="w-3.5 h-3.5" /> Enter Key Now
          </button>
        </div>
      )}

    </div>
  );
}
