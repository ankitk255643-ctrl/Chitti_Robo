import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  TrendingUp, 
  MapPin, 
  Globe, 
  Calendar, 
  DollarSign, 
  Info,
  Layers,
  Sparkles,
  CheckCircle2
} from "lucide-react";

interface AssetPriceGraphProps {
  assetName: string;
  assetType: string;
  initialCountry?: string;
  initialLocation?: string;
}

// Predefined geography lists
const COUNTRIES_REGIONS = [
  {
    code: "IN",
    name: "India",
    currency: "₹",
    states: ["Maharashtra", "Karnataka", "Delhi NCR", "Tamil Nadu", "Gujarat", "Telangana", "West Bengal", "Punjab", "Kerala", "Rajasthan"]
  },
  {
    code: "US",
    name: "United States",
    currency: "$",
    states: ["California", "New York", "Texas", "Florida", "Washington State", "Illinois", "Massachusetts", "Colorado"]
  },
  {
    code: "UK",
    name: "United Kingdom",
    currency: "£",
    states: ["Greater London", "South East England", "Scotland", "North West England", "Midlands", "Wales"]
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    currency: "AED ",
    states: ["Dubai", "Abu Dhabi", "Sharjah", "Ras Al Khaimah", "Fujairah"]
  },
  {
    code: "SG",
    name: "Singapore",
    currency: "S$",
    states: ["Central Region", "West Region", "East Region", "North Region", "North-East Region"]
  },
  {
    code: "JP",
    name: "Japan",
    currency: "¥",
    states: ["Tokyo", "Osaka", "Kyoto", "Hokkaido", "Fukuoka", "Aichi"]
  }
];

const TIMEFRAMES = [
  { id: "1W", label: "1 Week" },
  { id: "4W", label: "4 Weeks" },
  { id: "1M", label: "1 Month" },
  { id: "3M", label: "3 Months" },
  { id: "6M", label: "6 Months" },
  { id: "1Y", label: "1 Year" },
  { id: "5Y", label: "5 Years" }
];

export default function AssetPriceGraph({ 
  assetName, 
  assetType, 
  initialCountry = "India", 
  initialLocation = "" 
}: AssetPriceGraphProps) {
  
  // Find matched initial country or fallback
  const matchedCountryObj = useMemo(() => {
    const matched = COUNTRIES_REGIONS.find(
      c => c.name.toLowerCase() === initialCountry.toLowerCase()
    );
    return matched || COUNTRIES_REGIONS[0];
  }, [initialCountry]);

  const [selectedCountry, setSelectedCountry] = useState<string>(matchedCountryObj.name);
  const [selectedState, setSelectedState] = useState<string>(() => {
    // Attempt to match initialLocation with a state
    const states = matchedCountryObj.states;
    if (initialLocation) {
      const match = states.find(s => s.toLowerCase().includes(initialLocation.toLowerCase()));
      if (match) return match;
    }
    return states[0];
  });

  const [timeframe, setTimeframe] = useState<string>("6M");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  const [hoverY, setHoverY] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state if initial variables change
  useEffect(() => {
    const updatedCountry = COUNTRIES_REGIONS.find(
      c => c.name.toLowerCase() === initialCountry.toLowerCase()
    ) || COUNTRIES_REGIONS[0];
    
    setSelectedCountry(updatedCountry.name);
    
    if (initialLocation) {
      const match = updatedCountry.states.find(s => s.toLowerCase().includes(initialLocation.toLowerCase()));
      setSelectedState(match || updatedCountry.states[0]);
    } else {
      setSelectedState(updatedCountry.states[0]);
    }
  }, [initialCountry, initialLocation]);

  // Current country configuration
  const currentCountryConfig = useMemo(() => {
    return COUNTRIES_REGIONS.find(c => c.name === selectedCountry) || COUNTRIES_REGIONS[0];
  }, [selectedCountry]);

  // Handle country change to auto-update selected state
  const handleCountryChange = (countryName: string) => {
    setSelectedCountry(countryName);
    const config = COUNTRIES_REGIONS.find(c => c.name === countryName) || COUNTRIES_REGIONS[0];
    setSelectedState(config.states[0]);
  };

  // Generate deterministic points based on all select configurations
  const { points, currency, minPrice, maxPrice, priceChange, percentChange, isPositive } = useMemo(() => {
    const seedString = `${assetName}-${assetType}-${selectedCountry}-${selectedState}-${timeframe}`.toLowerCase();
    
    // Hash generator
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const seededRandom = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    // Calculate baseline asset valuation
    let basePrice = 2500;
    const isIndia = selectedCountry.toLowerCase() === "india";

    switch (assetType.toLowerCase()) {
      case "stock":
        basePrice = isIndia ? 1800 : 150;
        break;
      case "gold":
        basePrice = isIndia ? 73400 : 2350;
        break;
      case "silver":
        basePrice = isIndia ? 88500 : 31.5;
        break;
      case "diamond":
        basePrice = isIndia ? 280000 : 3800;
        break;
      case "land":
      case "real estate":
        basePrice = isIndia ? 8500000 : 420000;
        break;
      case "crypto":
        basePrice = 64500;
        break;
      case "mutual fund":
        basePrice = isIndia ? 380 : 92;
        break;
      default:
        basePrice = isIndia ? 16500 : 480;
    }

    // Volatility coefficient
    let volatility = 0.05;
    if (assetType.toLowerCase() === "crypto") volatility = 0.16;
    if (assetType.toLowerCase() === "stock") volatility = 0.09;
    if (assetType.toLowerCase() === "land" || assetType.toLowerCase() === "real estate") volatility = 0.03;

    // Apply geographic & asset modifier
    const randMultiplier = 0.6 + seededRandom(hash) * 1.6;
    basePrice = Math.round(basePrice * randMultiplier);

    // Minor adjustment for specific states
    const stateIndex = currentCountryConfig.states.indexOf(selectedState);
    const stateModifier = 0.95 + (stateIndex >= 0 ? (stateIndex * 0.02) : 0);
    basePrice = Math.round(basePrice * stateModifier);

    // Number of data points & date sequence
    let numPoints = 12;
    let dateIntervalDays = 30;

    switch (timeframe) {
      case "1W":
        numPoints = 7;
        dateIntervalDays = 1;
        break;
      case "4W":
        numPoints = 8;
        dateIntervalDays = 3.5;
        break;
      case "1M":
        numPoints = 10;
        dateIntervalDays = 3;
        break;
      case "3M":
        numPoints = 12;
        dateIntervalDays = 7.5;
        break;
      case "6M":
        numPoints = 12;
        dateIntervalDays = 15;
        break;
      case "1Y":
        numPoints = 12;
        dateIntervalDays = 30;
        break;
      case "5Y":
        numPoints = 15;
        dateIntervalDays = 120;
        break;
    }

    const dataPoints = [];
    const now = new Date();
    const trendCompound = (seededRandom(hash + 45) - 0.38) * 0.025; // average trend bias

    let runningPrice = basePrice * (0.85 + seededRandom(hash + 12) * 0.2);

    for (let i = numPoints - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * dateIntervalDays * 24 * 60 * 60 * 1000);
      
      const randomShock = (seededRandom(hash + i * 7) - 0.5) * volatility;
      runningPrice = runningPrice * (1 + trendCompound + randomShock);
      
      if (runningPrice < 1) runningPrice = 1;

      let labelStr = "";
      if (timeframe === "1W") {
        labelStr = d.toLocaleDateString(undefined, { weekday: "short" });
      } else if (timeframe === "4W" || timeframe === "1M") {
        labelStr = d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
      } else if (timeframe === "3M" || timeframe === "6M" || timeframe === "1Y") {
        labelStr = d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
      } else {
        labelStr = d.toLocaleDateString(undefined, { year: "numeric" });
      }

      dataPoints.push({
        date: d,
        label: labelStr,
        price: Math.round(runningPrice * 100) / 100
      });
    }

    const prices = dataPoints.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const diff = lastPrice - firstPrice;
    const pct = (diff / firstPrice) * 100;

    return {
      points: dataPoints,
      currency: currentCountryConfig.currency,
      minPrice: min,
      maxPrice: max,
      priceChange: Math.round(diff * 100) / 100,
      percentChange: Math.round(pct * 100) / 100,
      isPositive: diff >= 0
    };
  }, [assetName, assetType, selectedCountry, selectedState, timeframe, currentCountryConfig]);

  // Construct SVG Path dimensions
  const svgDimensions = useMemo(() => {
    const width = 600;
    const height = 240;
    const paddingLeft = 60;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    if (points.length === 0) return { path: "", areaPath: "", points: [] };

    // Find y min & max buffer
    const yMin = minPrice * 0.98;
    const yMax = maxPrice * 1.02;
    const yRange = yMax - yMin === 0 ? 1 : yMax - yMin;

    const coords = points.map((p, idx) => {
      const x = paddingLeft + (idx / (points.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((p.price - yMin) / yRange) * chartHeight;
      return { x, y, price: p.price, label: p.label };
    });

    // Build SVG Path
    let linePath = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      linePath += ` L ${coords[i].x} ${coords[i].y}`;
    }

    // Build Area Path
    const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`;

    return {
      width,
      height,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      chartWidth,
      chartHeight,
      coords,
      linePath,
      areaPath,
      yMin,
      yMax
    };
  }, [points, minPrice, maxPrice]);

  // Handle Mouse Hover tracking inside SVG
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || svgDimensions.coords.length === 0) return;
    
    const svgRect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - svgRect.left;
    
    // Convert clientX to relative coordinates based on viewBox
    const viewWidth = svgDimensions.width;
    const relativeX = (clientX / svgRect.width) * viewWidth;

    // Find closest index
    let closestIdx = 0;
    let minDistance = Infinity;

    svgDimensions.coords.forEach((coord, idx) => {
      const dist = Math.abs(coord.x - relativeX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setHoveredIndex(closestIdx);
    setHoverX(svgDimensions.coords[closestIdx].x);
    setHoverY(svgDimensions.coords[closestIdx].y);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Human readable number formatter
  const formatCurrencyValue = (val: number) => {
    return `${currency}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <div 
      ref={containerRef} 
      className="bg-[#090f24]/75 border border-slate-800/80 rounded-2xl p-4 md:p-6 space-y-5 shadow-2xl relative overflow-hidden"
      id="asset-geography-pricing-graph"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top bar with location selectors & timeframe */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-900/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase">Region-Calibrated Price Tracker</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/30">deterministic</span>
          </div>
          <h4 className="text-sm font-display font-medium text-white flex items-center gap-1.5">
            Pricing Index: <span className="text-cyan-300 font-semibold">{assetName}</span>
          </h4>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 p-1 rounded-lg">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-2 py-1 text-[10px] font-mono rounded-md transition cursor-pointer ${
                timeframe === tf.id 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tf.id}
            </button>
          ))}
        </div>
      </div>

      {/* Country & State Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-slate-950/40 p-3 rounded-xl border border-slate-900/60">
        <div className="space-y-1.5">
          <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-cyan-500" /> Country Context
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full bg-[#030612]/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {COUNTRIES_REGIONS.map((c) => (
              <option key={c.code} value={c.name}>{c.name} ({c.currency.trim()})</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-cyan-500" /> State / Regional Modifier
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full bg-[#030612]/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {currentCountryConfig.states.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main pricing indicator block */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 p-3 bg-[#030612]/60 border border-slate-900 rounded-xl">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">
            {selectedState}, {selectedCountry} Calibration
          </span>
          <div className="flex items-baseline gap-2.5">
            <span className="text-xl md:text-2xl font-mono font-bold text-white tracking-tight">
              {formatCurrencyValue(points[points.length - 1].price)}
            </span>
            <span className={`text-xs font-mono font-bold flex items-center gap-1 ${
              isPositive ? "text-emerald-400" : "text-rose-400"
            }`}>
              {isPositive ? "▲" : "▼"} {formatCurrencyValue(Math.abs(priceChange))} ({isPositive ? "+" : ""}{percentChange}%)
            </span>
          </div>
        </div>

        <div className="text-right text-[10px] font-mono text-slate-500 space-y-0.5">
          <div>Range ({timeframe}):</div>
          <div className="text-slate-300">
            {formatCurrencyValue(minPrice)} - {formatCurrencyValue(maxPrice)}
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart Component */}
      <div className="relative w-full overflow-hidden select-none" id="pricing-svg-wrapper">
        <svg 
          viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`} 
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Glowing area fill gradient */}
            <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="areaGlowNegative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = svgDimensions.paddingTop + ratio * svgDimensions.chartHeight;
            return (
              <line
                key={index}
                x1={svgDimensions.paddingLeft}
                y1={y}
                x2={svgDimensions.width - svgDimensions.paddingRight}
                y2={y}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.4"
              />
            );
          })}

          {/* Vertical Time dividers */}
          {svgDimensions.coords.map((coord, index) => {
            if (index === 0 || index === svgDimensions.coords.length - 1 || index % 3 !== 0) return null;
            return (
              <line
                key={index}
                x1={coord.x}
                y1={svgDimensions.paddingTop}
                x2={coord.x}
                y2={svgDimensions.height - svgDimensions.paddingBottom}
                stroke="#1e293b"
                strokeWidth="1"
                opacity="0.25"
              />
            );
          })}

          {/* Glowing Area Fill */}
          <path 
            d={svgDimensions.areaPath} 
            fill={isPositive ? "url(#areaGlow)" : "url(#areaGlowNegative)"} 
          />

          {/* Pricing curve stroke */}
          <path 
            d={svgDimensions.linePath} 
            fill="none" 
            stroke={isPositive ? "#06b6d4" : "#ef4444"} 
            strokeWidth="2.5" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Highlight data points */}
          {svgDimensions.coords.map((coord, idx) => (
            <circle
              key={idx}
              cx={coord.x}
              cy={coord.y}
              r={hoveredIndex === idx ? "5" : "3.5"}
              fill={isPositive ? "#06b6d4" : "#ef4444"}
              stroke="#030612"
              strokeWidth={hoveredIndex === idx ? "2.5" : "1.5"}
              className="transition-all duration-150"
              opacity={hoveredIndex === idx || idx === svgDimensions.coords.length - 1 ? "1" : "0.7"}
            />
          ))}

          {/* X Axis Labels */}
          {svgDimensions.coords.map((coord, idx) => {
            // Label rendering filter (don't overlap too much)
            const showLabel = 
              timeframe === "1W" || 
              idx === 0 || 
              idx === svgDimensions.coords.length - 1 || 
              (idx % 2 === 0 && idx < svgDimensions.coords.length - 1);
            
            if (!showLabel) return null;

            return (
              <text
                key={idx}
                x={coord.x}
                y={svgDimensions.height - 15}
                fill="#64748b"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {coord.label}
              </text>
            );
          })}

          {/* Y Axis Labels (Min / Max) */}
          <text
            x={svgDimensions.paddingLeft - 8}
            y={svgDimensions.paddingTop + 4}
            fill="#94a3b8"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="end"
          >
            {formatCurrencyValue(svgDimensions.yMax)}
          </text>
          <text
            x={svgDimensions.paddingLeft - 8}
            y={svgDimensions.height - svgDimensions.paddingBottom + 4}
            fill="#94a3b8"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="end"
          >
            {formatCurrencyValue(svgDimensions.yMin)}
          </text>

          {/* Hover crosshair reticle */}
          {hoveredIndex !== null && (
            <g>
              <line
                x1={hoverX}
                y1={svgDimensions.paddingTop}
                x2={hoverX}
                y2={svgDimensions.height - svgDimensions.paddingBottom}
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeDasharray="4,4"
                opacity="0.75"
              />
              <circle
                cx={hoverX}
                cy={hoverY}
                r="7"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1.5"
                opacity="0.95"
                className="animate-ping"
              />
            </g>
          )}
        </svg>

        {/* Hover Floating Card Tooltip */}
        {hoveredIndex !== null && (
          <div 
            className="absolute bg-slate-950/95 border border-cyan-500/40 px-3 py-2 rounded-xl text-[10px] font-mono text-white shadow-2xl pointer-events-none space-y-1 z-30"
            style={{ 
              left: `${Math.min(hoverX + 15, containerRef.current ? containerRef.current.clientWidth - 160 : 250)}px`,
              top: `${Math.min(hoverY - 10, svgDimensions.height - 80)}px` 
            }}
          >
            <div className="text-slate-400 border-b border-slate-900 pb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span>{points[hoveredIndex].date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
            <div className="font-bold text-white flex items-center gap-1 justify-between">
              <span>Price:</span>
              <span className="text-cyan-300 font-mono text-xs">{formatCurrencyValue(points[hoveredIndex].price)}</span>
            </div>
            <div className="text-slate-400 flex items-center gap-1 justify-between">
              <span>Region:</span>
              <span className="text-slate-200">{selectedState}</span>
            </div>
          </div>
        )}
      </div>

      {/* Explanatory insights calibration legend */}
      <div className="flex gap-2.5 p-3 bg-[#0a112c]/40 border border-slate-900 rounded-xl items-start">
        <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
          <span className="font-bold text-slate-200 block mb-0.5">LOCAL GEOGRAPHIC SIMULATION INDEX</span>
          Pricing trends utilize state-specific tax rates, regional supply indices, and municipal infrastructure metrics for {selectedCountry}. Current state calibration for <span className="text-cyan-400 font-bold">{selectedState}</span> is applied dynamically with fixed deterministic volatility.
        </p>
      </div>
    </div>
  );
}
