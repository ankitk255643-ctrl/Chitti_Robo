import React, { useState, useEffect } from "react";
import { 
  Coins, 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  FileText, 
  Download, 
  Copy, 
  Share2, 
  Bookmark, 
  Trash2, 
  ArrowRightLeft, 
  Layers, 
  Gauge, 
  Calendar, 
  ChevronRight, 
  Zap, 
  DollarSign, 
  Globe, 
  Newspaper,
  Award,
  BookOpen,
  PieChart,
  Info
} from "lucide-react";
import AlphaVantageTerminal from "./AlphaVantageTerminal";
import Ferrofluid from "./Ferrofluid";
import AssetPriceGraph from "./AssetPriceGraph";

interface Report {
  id: string;
  createdAt: string;
  assetType: string;
  assetName: string;
  investmentAmount?: string;
  investmentDuration?: string;
  riskLevel?: string;
  goal?: string;
  report: {
    quickSummary: {
      status: "strong" | "weak" | "risky" | "stable";
      furtherResearchRequired: boolean;
      mainOpportunity: string;
      mainRisk: string;
    };
    scores: {
      growthPotential: number;
      priceStability: number;
      risk: number;
      liquidity: number;
      longTermSafety: number;
      shortTermOpportunity: number;
      newsSentiment: number;
      overallInvestment: number;
    };
    confidenceLevel: {
      percentage: number;
      category: string;
      limitedSourcesWarning: string | null;
    };
    priceMaintenance: {
      oneMonth: string;
      threeMonths: string;
      sixMonths: string;
      twelveMonths: string;
      twentyFourMonths: string;
    };
    scenarios: {
      bestCase: string;
      normalCase: string;
      worstCase: string;
      riskTriggers: string[];
      driversOfRise: string[];
      driversOfFall: string[];
    };
    recommendations: string[];
    warnings: string[];
    comparisonTable?: {
      assetName: string;
      expectedReturn: string;
      risk: "Low" | "Medium" | "High";
      liquidity: "High" | "Medium" | "Low";
      holdingPeriod: string;
      priceStability: "High" | "Medium" | "Low";
      entryDifficulty: "Easy" | "Moderate" | "Hard";
      exitDifficulty: "Easy" | "Moderate" | "Hard";
      taxImpact: string;
      bestFor: string;
      finalRank: number;
    }[];
    finalAnswer: {
      bestOption: string;
      secondBest: string;
      mostRisky: string;
      safest: string;
      bestHoldingDuration: string;
      mainReason: string;
      mainWarning: string;
      text: string;
    };
    historicalTrend?: {
      oneMonth: string;
      threeMonths: string;
      sixMonths: string;
      oneYear: string;
      fiveYears: string;
    };
    sourcesCount: number;
  };
}

export default function AIAssetAnalyzer() {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 450);
    return () => clearTimeout(timer);
  }, []);

  const [assetType, setAssetType] = useState<string>("Stock");
  const [assetName, setAssetName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [country, setCountry] = useState<string>("India");
  const [investmentAmount, setInvestmentAmount] = useState<string>("");
  const [investmentDuration, setInvestmentDuration] = useState<string>("6 months");
  const [riskLevel, setRiskLevel] = useState<string>("Medium");
  const [goal, setGoal] = useState<string>("Profit");
  const [compareWith, setCompareWith] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [savedReports, setSavedReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mobileActiveView, setMobileActiveView] = useState<"input" | "output">("input");

  // Load Saved Reports on init
  useEffect(() => {
    fetchSavedReports();
  }, []);

  const fetchSavedReports = async () => {
    try {
      const res = await fetch("/api/investment/reports");
      if (res.ok) {
        const data = await res.json();
        setSavedReports(data);
      }
    } catch (err) {
      console.error("Failed to load saved reports:", err);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) {
      setErrorMsg("Please enter an asset name to begin.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setMobileActiveView("output");

    const steps = [
      "Accessing global economic indicators database...",
      "Crawling 100+ high-authority financial indices and news sources...",
      "Extracting local market data, supply-demand variables, and inflation impacts...",
      "Simulating pricing stability projections & Monte Carlo scenarios...",
      "Evaluating regulatory, geopolitical, and systemic risk indexes...",
      "Compiling final deep research report..."
    ];

    let stepIndex = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length - 1) {
        stepIndex++;
        setLoadingStep(steps[stepIndex]);
      }
    }, 1500);

    try {
      const response = await fetch("/api/investment/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetType,
          assetName,
          location,
          country,
          investmentAmount,
          investmentDuration,
          riskLevel,
          goal,
          compareWith
        })
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Analysis failed.");
      }

      const data = await response.json();
      
      const newReport: Report = {
        id: "temp-" + Date.now(),
        createdAt: new Date().toISOString(),
        assetType,
        assetName,
        investmentAmount,
        investmentDuration,
        riskLevel,
        goal,
        report: data.report
      };

      setCurrentReport(newReport);
      setActiveTab("overview");
      setSuccessMsg("Deep market intelligence compiled successfully!");
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMsg(err.message || "Failed to analyze. Please check server connections.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!currentReport) return;
    try {
      const response = await fetch("/api/investment/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetType: currentReport.assetType,
          assetName: currentReport.assetName,
          investmentAmount: currentReport.investmentAmount,
          investmentDuration: currentReport.investmentDuration,
          riskLevel: currentReport.riskLevel,
          goal: currentReport.goal,
          report: currentReport.report
        })
      });

      if (response.ok) {
        setSuccessMsg("Report saved to your dashboard portfolio successfully!");
        fetchSavedReports();
      } else {
        throw new Error("Could not save to server.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save report.");
    }
  };

  const handleDeleteSavedReport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to purge this analysis report?")) return;

    try {
      const response = await fetch(`/api/investment/reports/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setSavedReports(prev => prev.filter(r => r.id !== id));
        if (currentReport?.id === id || (currentReport && id.includes(currentReport.id))) {
          setCurrentReport(null);
        }
        setSuccessMsg("Report purged successfully.");
      }
    } catch (err) {
      setErrorMsg("Failed to delete the report.");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setSuccessMsg(`Copied ${label} to clipboard!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const exportReportAsTxt = () => {
    if (!currentReport) return;
    const r = currentReport.report;
    const textContent = `
=========================================
AI INVESTMENT & ASSET ANALYZER REPORT
=========================================
Asset: ${currentReport.assetName} (${currentReport.assetType})
Target Goal: ${currentReport.goal} | Target Duration: ${currentReport.investmentDuration}
Sources Consulted: ${r.sourcesCount}+ financial channels

QUICK SUMMARY:
Status: ${r.quickSummary.status.toUpperCase()}
Main Opportunity: ${r.quickSummary.mainOpportunity}
Main Risk: ${r.quickSummary.mainRisk}

SCORES (Out of 100):
- Overall Investment: ${r.scores.overallInvestment}
- Growth Potential: ${r.scores.growthPotential}
- Price Stability: ${r.scores.priceStability}
- Liquidity: ${r.scores.liquidity}
- Safety Rank: ${r.scores.longTermSafety}

SCENARIOS:
- Best-case: ${r.scenarios.bestCase}
- Normal expected: ${r.scenarios.normalCase}
- Worst-case: ${r.scenarios.worstCase}

FINAL STRATEGIC GUIDANCE:
${r.finalAnswer.text}

-----------------------------------------
DISCLAIMER: This analysis is for educational and research purposes only. It is not guaranteed financial advice. All investments carry risks.
=========================================
`;
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${currentReport.assetName.replace(/\s+/g, "_")}_AI_Research_Report.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "strong": return "text-emerald-400 bg-emerald-950/45 border-emerald-800/30";
      case "stable": return "text-cyan-400 bg-cyan-950/45 border-cyan-800/30";
      case "risky": return "text-amber-400 bg-amber-950/45 border-amber-800/30";
      case "weak": return "text-rose-400 bg-rose-950/45 border-rose-800/30";
      default: return "text-gray-400 bg-gray-900";
    }
  };

  return (
    <div className="relative pb-12 text-gray-100 min-h-screen" id="ai-investor-root">
      {/* Background Ferrofluid Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-100">
        {showAnimation && (
          <Ferrofluid
            colors={["#06b6d4", "#a855f7", "#6366f1", "#1d4ed8"]}
            speed={0.45}
            scale={1.1}
            turbulence={0.9}
            fluidity={0.3}
            rimWidth={0.22}
            sharpness={2.0}
            shimmer={1.2}
            glow={2.5}
            flowDirection="down"
            opacity={1.0}
            mouseInteraction={true}
            mouseStrength={1.2}
            mouseRadius={0.4}
          />
        )}
        {/* Extremely light overlay for optimal text contrast without blurring or dimming the animation */}
        <div className="absolute inset-0 bg-[#030612]/15" />
      </div>
      
      {/* Main Content wrapper to stay above background */}
      <div className="relative z-10 space-y-6">
        
        {/* Upper Header Grid */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-900/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Coins className="w-6 h-6 text-cyan-400 animate-pulse" />
            <h1 className="text-xl font-display font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-300">
              AI Investment & Asset Analyzer
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            Analyze stocks, land, gold, silver, diamond, and other assets using market trends, news, risk parameters, and future possibilities.
          </p>
        </div>
        
        {/* Toggle between Active Analysis / Saved Reports quickly */}
        <div className="flex gap-2">
          <button 
            onClick={() => { setActiveTab("saved"); }} 
            className="px-3 py-1.5 rounded-lg text-xs font-mono border border-gray-800 hover:border-cyan-800/30 bg-[#090f24] hover:text-cyan-400 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5" />
            Saved Reports ({savedReports.length})
          </button>
        </div>
      </div>

      {/* Global Toast Message Feedback */}
      {errorMsg && (
        <div className="p-3 bg-rose-950/30 border border-rose-800/30 rounded-lg flex items-start gap-2.5 text-rose-300 text-xs animate-fadeIn">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-950/30 border border-emerald-800/30 rounded-lg flex items-start gap-2.5 text-emerald-300 text-xs animate-fadeIn">
          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>{successMsg}</div>
        </div>
      )}

      {/* Mobile-only responsive tab selector to switch between Control Deck & Results Output */}
      <div className="flex md:hidden bg-gray-950/45 p-1 rounded-xl border border-gray-850/50 gap-2 select-none">
        <button
          onClick={() => setMobileActiveView("input")}
          className={`flex-1 py-2 text-xs font-mono rounded-lg transition-all ${
            mobileActiveView === "input"
              ? "bg-cyan-950/60 text-cyan-400 border border-cyan-800/30"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Input Parameters
        </button>
        <button
          onClick={() => setMobileActiveView("output")}
          className={`flex-1 py-2 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileActiveView === "output"
              ? "bg-cyan-950/60 text-cyan-400 border border-cyan-800/30"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <span>Output Reports</span>
          {isLoading && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          )}
        </button>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Input Control Panel */}
        <div className={`${mobileActiveView === "input" ? "block" : "hidden"} md:block md:col-span-5 lg:col-span-4 space-y-6`}>
          <div className="glassmorphism p-5 rounded-2xl border border-gray-850 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-900/60 pb-3">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">Market Intelligence Input</h2>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-4">
              
              {/* Asset Type Select */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider">Asset Category</label>
                <select 
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="w-full bg-gray-950/40 backdrop-blur-sm border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-gray-200"
                >
                  {["Stock", "Gold", "Silver", "Diamond", "Land", "Real Estate", "Mutual Fund", "Crypto", "Bond", "Commodity", "Business Investment", "Other"].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Asset Name Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider">Asset Name / Symbol</label>
                <input 
                  type="text"
                  placeholder="e.g. Silver, Tata Motors, Bitcoin, Mumbai Sector-5"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full bg-gray-950/40 backdrop-blur-sm border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-gray-200 font-mono"
                  required
                />
              </div>

              {/* Optional Location field for Real Estate/Land */}
              {(assetType === "Land" || assetType === "Real Estate") && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider">Location / Infrastructure Zone</label>
                  <input 
                    type="text"
                    placeholder="e.g. Near Navi Mumbai Airport, Sector 15"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-gray-950/40 backdrop-blur-sm border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-gray-200"
                  />
                </div>
              )}

              {/* Country Market */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider">Country/Market context</label>
                <input 
                  type="text"
                  placeholder="e.g. India, Global, USA"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-gray-950/40 backdrop-blur-sm border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-gray-200"
                />
              </div>

              {/* Investment Amount */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider">Investment Capital (e.g. INR/USD)</label>
                <input 
                  type="text"
                  placeholder="e.g. 5,00,000 INR"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="w-full bg-gray-950/40 backdrop-blur-sm border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-gray-200 font-mono"
                />
              </div>

              {/* Investment Duration */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider">Holding Horizon</label>
                <select 
                  value={investmentDuration}
                  onChange={(e) => setInvestmentDuration(e.target.value)}
                  className="w-full bg-gray-950/40 backdrop-blur-sm border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-gray-200"
                >
                  <option value="1 month">1 Month (Short-term)</option>
                  <option value="3 months">3 Months (Medium-short)</option>
                  <option value="6 months">6 Months (Tactical)</option>
                  <option value="12 months">12 Months (Medium-term)</option>
                  <option value="24 months">2 Years (Long-term trade)</option>
                  <option value="5 years">5+ Years (Strategic hold)</option>
                </select>
              </div>

              {/* Risk Level Preference */}
              <div className="grid grid-cols-3 gap-2">
                {["Low", "Medium", "High"].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setRiskLevel(level)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono border transition ${
                      riskLevel === level 
                        ? "bg-cyan-500/10 border-cyan-400 text-cyan-400" 
                        : "bg-transparent border-gray-800 hover:border-gray-700 text-gray-400"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>

              {/* Goals */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider">Target Objective</label>
                <select 
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-gray-950/40 backdrop-blur-sm border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-gray-200"
                >
                  <option value="Safe holding">Safe holding / Wealth Preservation</option>
                  <option value="Profit">Maximize Capital Profit</option>
                  <option value="Long-term growth">Long-term Compounding Growth</option>
                  <option value="Short-term trade">Short-term Momentum Swing</option>
                  <option value="Wealth protection">Inflation & Crisis Hedging</option>
                </select>
              </div>

              {/* Comparison Mode Field */}
              <div className="space-y-1.5 pt-2 border-t border-gray-900/60">
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] font-mono text-gray-300 uppercase tracking-wider">Compare Option (Optional)</span>
                </div>
                <input 
                  type="text"
                  placeholder="e.g. Gold, Silver, Mutual Funds"
                  value={compareWith}
                  onChange={(e) => setCompareWith(e.target.value)}
                  className="w-full bg-gray-950/40 backdrop-blur-sm border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-gray-400 font-mono"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-gray-950 font-bold py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Coins className="w-4 h-4" />
                {isLoading ? "Running Simulation..." : "Deploy Deep AI Analysis"}
              </button>

            </form>
          </div>

          {/* Quick Disclaimer Sticky */}
          <div className="p-4 bg-gray-950/40 border border-gray-900 rounded-xl flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div className="text-[10px] text-gray-400 leading-relaxed">
              <span className="font-bold text-gray-300 block mb-0.5">COMPLIANCE NOTICE</span>
              This model utilizes heuristic simulations over web indices and historical price trends. It does not provide certified financial advice or guaranteed capital outcomes. Always perform self due-diligence.
            </div>
          </div>

          {/* Alpha Vantage Market Intelligence Terminal */}
          <AlphaVantageTerminal 
            onSelectTicker={(sym) => { 
              setAssetName(sym); 
              setAssetType("Stock"); 
            }} 
            currentTicker={assetName} 
          />
        </div>

        {/* RIGHT COLUMN: Output Reports / Saved History */}
        <div className={`${mobileActiveView === "output" ? "block" : "hidden"} md:block md:col-span-7 lg:col-span-8 flex flex-col space-y-6`}>
          
          {/* If Loading: show high tech loading animation state */}
          {isLoading ? (
            <div className="glassmorphism p-10 rounded-2xl border border-gray-850 h-[500px] flex flex-col items-center justify-center space-y-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/10 border-t-cyan-400 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-indigo-500/10 border-b-indigo-400 animate-spin-slow"></div>
                <div className="absolute inset-4 rounded-full border-4 border-purple-500/15 border-l-purple-400 animate-pulse flex items-center justify-center">
                  <Coins className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-mono text-cyan-400 text-xs tracking-wider animate-pulse font-bold">SYSTEM ACTIVE: COMPILING MARKET INTELLIGENCE</p>
                <p className="text-[11px] text-gray-400 font-mono max-w-md mx-auto">{loadingStep}</p>
              </div>
            </div>
          ) : activeTab === "saved" ? (
            
            /* SAVED REPORTS VIEW */
            <div className="glassmorphism p-5 rounded-2xl border border-gray-850 min-h-[500px] space-y-4">
              <div className="flex items-center justify-between border-b border-gray-900/60 pb-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">Saved Research Vault</h3>
                </div>
                <span className="text-[10px] font-mono text-gray-500">{savedReports.length} Analyses Archived</span>
              </div>

              {savedReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <FileText className="w-12 h-12 text-gray-750" />
                  <p className="text-xs text-gray-500 font-mono text-center">Your Investment Research Vault is empty.<br />Run an analysis and click "Save Report" to persist here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedReports.map((saved) => (
                    <div 
                      key={saved.id}
                      onClick={() => {
                        setCurrentReport(saved);
                        setActiveTab("overview");
                        setMobileActiveView("output");
                      }}
                      className="p-4 bg-gray-950/60 border border-gray-900 hover:border-cyan-900/40 rounded-xl transition cursor-pointer flex justify-between items-start group"
                    >
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-900/35 px-2 py-0.5 rounded-md uppercase font-bold">
                            {saved.assetType}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border uppercase font-bold ${getStatusColor(saved.report.quickSummary.status)}`}>
                            {saved.report.quickSummary.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-display font-semibold text-white truncate">{saved.assetName}</h4>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono text-gray-400">
                          <div>Goal: {saved.goal}</div>
                          <div>Duration: {saved.investmentDuration}</div>
                          <div className="col-span-2 text-gray-500 text-[9px] mt-1">
                            Analyzed: {new Date(saved.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => handleDeleteSavedReport(saved.id, e)}
                        className="p-1.5 text-gray-500 hover:text-rose-400 rounded-md hover:bg-gray-900 transition flex-shrink-0 cursor-pointer"
                        title="Purge Report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          ) : currentReport ? (
            
            /* ACTIVE REPORT DISPLAY WITH SEVERAL SUB-TABS */
            <div className="space-y-6">
              
              {/* Report Header Widget */}
              <div className="glassmorphism p-5 rounded-2xl border border-gray-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-900/30 px-2 py-0.5 rounded uppercase font-bold">
                      {currentReport.assetType} Analysis
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${getStatusColor(currentReport.report.quickSummary.status)}`}>
                      {currentReport.report.quickSummary.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-semibold text-white tracking-tight truncate">
                    {currentReport.assetName} Intelligence Report
                  </h3>
                  <div className="flex items-center gap-2.5 text-[10px] font-mono text-gray-400 mt-1">
                    <span>Target: {currentReport.goal}</span>
                    <span>•</span>
                    <span>Horizon: {currentReport.investmentDuration}</span>
                    <span>•</span>
                    <span>Risk Tolerance: {currentReport.riskLevel}</span>
                  </div>
                </div>

                {/* Quick Utility Options: Save, Copy, Download */}
                <div className="flex gap-1.5 flex-wrap self-stretch md:self-auto">
                  <button 
                    onClick={handleSaveReport}
                    className="flex-1 md:flex-none px-3 py-1.5 rounded-lg text-[10px] font-mono border border-gray-800 hover:border-cyan-800/35 bg-transparent hover:text-cyan-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    Save
                  </button>
                  <button 
                    onClick={() => copyToClipboard(currentReport.report.finalAnswer.text, "Final Recommendation")}
                    className="flex-1 md:flex-none px-3 py-1.5 rounded-lg text-[10px] font-mono border border-gray-800 hover:border-cyan-800/35 bg-transparent hover:text-cyan-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Copy AI recommendation"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                  <button 
                    onClick={exportReportAsTxt}
                    className="flex-1 md:flex-none px-3 py-1.5 rounded-lg text-[10px] font-mono border border-gray-800 hover:border-cyan-800/35 bg-transparent hover:text-cyan-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Export report as text file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export
                  </button>
                </div>
              </div>

              {/* Sub tabs Navigator */}
              <div className="flex border-b border-gray-900/60 overflow-x-auto gap-1 no-scrollbar">
                {[
                  { id: "overview", label: "Overview", icon: Layers },
                  { id: "trends", label: "Price Trend", icon: TrendingUp },
                  { id: "news", label: "News & Sentiment", icon: Newspaper },
                  { id: "risk", label: "Risk Analysis", icon: ShieldAlert },
                  { id: "growth", label: "Growth Possibility", icon: PieChart },
                  { id: "comparison", label: "Comparison", icon: ArrowRightLeft },
                  { id: "final", label: "Final Report", icon: FileText }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-xs font-mono font-medium border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                        activeTab === tab.id 
                          ? "border-cyan-400 text-cyan-400 bg-cyan-950/5" 
                          : "border-transparent text-gray-400 hover:text-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* ACTIVE TAB CONTENTS */}
              <div className="space-y-6">

                {/* TAB 1: OVERVIEW */}
                {activeTab === "overview" && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* BENTO ROW: Main Summary & Intelligence scores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Summary text Card */}
                      <div className="glassmorphism p-5 rounded-2xl border border-gray-850 space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-900/60 pb-3">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">Executive Summary</h4>
                        </div>
                        <div className="space-y-3">
                          <p className="text-xs text-gray-300 leading-relaxed">
                            {currentReport.report.finalAnswer.text.substring(0, 300)}...
                          </p>
                          <div className="p-3 bg-cyan-950/20 border border-cyan-900/30 rounded-xl space-y-2">
                            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">Key Focus Highlight</span>
                            <div className="text-xs text-gray-300">
                              <span className="font-semibold text-white block">Main Opportunity:</span>
                              {currentReport.report.quickSummary.mainOpportunity}
                            </div>
                            <div className="text-xs text-gray-300 pt-1.5 border-t border-gray-900/40">
                              <span className="font-semibold text-rose-300 block">Main Systemic Risk:</span>
                              {currentReport.report.quickSummary.mainRisk}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Score Metrics Grid */}
                      <div className="glassmorphism p-5 rounded-2xl border border-gray-850 space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-900/60 pb-3">
                          <Gauge className="w-4 h-4 text-cyan-400" />
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">Market Risk & Investment Scores</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: "Overall Rating", val: currentReport.report.scores.overallInvestment, color: "text-cyan-400", bg: "bg-cyan-950/30" },
                            { label: "Growth Potential", val: currentReport.report.scores.growthPotential, color: "text-indigo-400", bg: "bg-indigo-950/30" },
                            { label: "Price Stability", val: currentReport.report.scores.priceStability, color: "text-purple-400", bg: "bg-purple-950/30" },
                            { label: "Liquidity Index", val: currentReport.report.scores.liquidity, color: "text-emerald-400", bg: "bg-emerald-950/30" },
                          ].map(score => (
                            <div key={score.label} className={`p-3 rounded-xl border border-gray-900 ${score.bg} flex justify-between items-center`}>
                              <span className="text-[10px] font-mono text-gray-400 block">{score.label}</span>
                              <span className={`text-sm font-mono font-bold ${score.color}`}>{score.val}/100</span>
                            </div>
                          ))}
                        </div>

                        {/* Sources Check counter */}
                        <div className="p-3 bg-gray-950/50 border border-gray-900 rounded-xl flex items-center justify-between text-xs font-mono">
                          <span className="text-gray-400">Sources Analyzed:</span>
                          <span className="text-cyan-400 font-bold">{currentReport.report.sourcesCount}+ financial channels</span>
                        </div>
                      </div>

                    </div>

                    {/* ROW 2: Confidence level Indicator and Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Confidence Meter Visual */}
                      <div className="glassmorphism p-5 rounded-2xl border border-gray-850 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center border-b border-gray-900/60 pb-3">
                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">Confidence Score Meter</h4>
                            <span className="text-xs font-mono text-cyan-400 font-bold">
                              {currentReport.report.confidenceLevel.percentage}%
                            </span>
                          </div>
                          
                          {/* visual progress slider bar */}
                          <div className="space-y-1.5 pt-3">
                            <div className="h-2 w-full bg-gray-950 rounded-full overflow-hidden flex">
                              <div 
                                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-500 transition-all duration-500" 
                                style={{ width: `${currentReport.report.confidenceLevel.percentage}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] font-mono text-gray-500">
                              <span>Low Confidence (50%)</span>
                              <span>Target (90%)</span>
                              <span>Max Safety (95%)</span>
                            </div>
                          </div>
                          
                          <p className="text-[11px] font-mono text-gray-300">
                            Confidence Bracket: <span className="text-cyan-400 font-bold">{currentReport.report.confidenceLevel.category}</span>
                          </p>
                        </div>

                        {currentReport.report.confidenceLevel.limitedSourcesWarning && (
                          <div className="mt-3 p-2.5 bg-amber-950/20 border border-amber-900/30 rounded-lg text-[10px] text-amber-300 font-mono">
                            ⚠️ {currentReport.report.confidenceLevel.limitedSourcesWarning}
                          </div>
                        )}
                      </div>

                      {/* Strategic Recommendation categories */}
                      <div className="glassmorphism p-5 rounded-2xl border border-gray-850 space-y-3">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300 border-b border-gray-900/60 pb-3">AI Strategic Classifications</h4>
                        
                        <div className="flex flex-wrap gap-2 pt-2">
                          {currentReport.report.recommendations.map((rec, i) => (
                            <span 
                              key={i} 
                              className="px-3 py-1 bg-cyan-950/40 text-cyan-400 border border-cyan-900/40 text-[10px] font-mono rounded-lg"
                            >
                              ✓ {rec}
                            </span>
                          ))}
                        </div>

                        <div className="p-3 bg-gray-950/50 border border-gray-900 rounded-xl space-y-1 mt-4">
                          <span className="text-[9px] font-mono text-gray-400 uppercase block">Warnings / Red Flags Check</span>
                          {currentReport.report.warnings.length === 0 ? (
                            <p className="text-[10px] font-mono text-emerald-400">✓ No immediate severe red flags detected.</p>
                          ) : (
                            <div className="space-y-1">
                              {currentReport.report.warnings.map((warn, index) => (
                                <div key={index} className="flex items-center gap-1.5 text-[10px] font-mono text-rose-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                                  <span>{warn}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* TAB 2: PRICE TREND */}
                {activeTab === "trends" && (
                  <div className="glassmorphism p-5 rounded-2xl border border-gray-850 space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-gray-900/60 pb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">Historical Price Movement & Maintenance Projection</h4>
                      </div>
                    </div>

                    {/* Historical trends if available */}
                    {currentReport.report.historicalTrend && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                          { period: "Last 1 Month", dir: currentReport.report.historicalTrend.oneMonth },
                          { period: "Last 3 Months", dir: currentReport.report.historicalTrend.threeMonths },
                          { period: "Last 6 Months", dir: currentReport.report.historicalTrend.sixMonths },
                          { period: "Last 1 Year", dir: currentReport.report.historicalTrend.oneYear },
                          { period: "5-Year Trend", dir: currentReport.report.historicalTrend.fiveYears }
                        ].map((hist, i) => (
                          <div key={i} className="p-3 bg-gray-950/60 border border-gray-900 rounded-xl text-center">
                            <span className="text-[9px] font-mono text-gray-500 uppercase block">{hist.period}</span>
                            <span className={`text-xs font-mono font-bold block mt-1.5 ${
                              hist.dir === "Up" ? "text-emerald-400" : hist.dir === "Down" ? "text-rose-400" : "text-gray-400"
                            }`}>
                              {hist.dir === "Up" ? "📈 UPWARDS" : hist.dir === "Down" ? "📉 DOWNWARDS" : "➡️ STABLE"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Interactive Geographic pricing graph */}
                    <AssetPriceGraph 
                      assetName={currentReport.assetName}
                      assetType={currentReport.assetType}
                      initialCountry={country || "India"}
                      initialLocation={location || ""}
                    />

                    {/* Price Maintenance predictions */}
                    <div className="space-y-3">
                      <h5 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Asset Price Stability Projections</h5>
                      
                      <div className="space-y-2">
                        {[
                          { time: "Can hold current valuation for 1 Month", val: currentReport.report.priceMaintenance.oneMonth },
                          { time: "Can hold current valuation for 3 Months", val: currentReport.report.priceMaintenance.threeMonths },
                          { time: "Can hold current valuation for 6 Months", val: currentReport.report.priceMaintenance.sixMonths },
                          { time: "Can hold current valuation for 12 Months", val: currentReport.report.priceMaintenance.twelveMonths },
                          { time: "Can hold current valuation for 24 Months", val: currentReport.report.priceMaintenance.twentyFourMonths }
                        ].map((proj, idx) => {
                          const level = proj.val;
                          const dotColor = level === "High chance" ? "bg-emerald-400" : level === "Medium chance" ? "bg-amber-400" : "bg-rose-500";
                          return (
                            <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-950/30 border border-gray-900 rounded-lg">
                              <span className="text-xs text-gray-300 font-mono">{proj.time}</span>
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                                <span className="text-xs font-mono text-white font-semibold">{level}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: NEWS & SENTIMENT */}
                {activeTab === "news" && (
                  <div className="glassmorphism p-5 rounded-2xl border border-gray-850 space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-gray-900/60 pb-3">
                      <div className="flex items-center gap-2">
                        <Newspaper className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">News Sentiment & Price Drivers</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Positive Drivers */}
                      <div className="p-4 bg-emerald-950/10 border border-emerald-900/20 rounded-xl space-y-3">
                        <div className="flex items-center gap-1.5 border-b border-emerald-900/20 pb-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-mono font-bold text-emerald-300">Bullish Price Drivers</span>
                        </div>
                        <ul className="space-y-2">
                          {currentReport.report.scenarios.driversOfRise.map((driver, i) => (
                            <li key={i} className="text-xs text-gray-300 flex items-start gap-2 leading-relaxed">
                              <span className="text-emerald-400 font-bold mt-0.5">•</span>
                              <span>{driver}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Negative Drivers */}
                      <div className="p-4 bg-rose-950/10 border border-rose-900/20 rounded-xl space-y-3">
                        <div className="flex items-center gap-1.5 border-b border-rose-900/20 pb-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <span className="text-xs font-mono font-bold text-rose-300">Bearish Price Risks</span>
                        </div>
                        <ul className="space-y-2">
                          {currentReport.report.scenarios.driversOfFall.map((driver, i) => (
                            <li key={i} className="text-xs text-gray-300 flex items-start gap-2 leading-relaxed">
                              <span className="text-rose-400 font-bold mt-0.5">•</span>
                              <span>{driver}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Overall news sentiment slider */}
                    <div className="p-4 bg-gray-950/60 border border-gray-900 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-xs font-mono text-gray-300">
                        <span>Overall Public Sentiment Index</span>
                        <span className="text-cyan-400 font-bold">{currentReport.report.scores.newsSentiment}/100</span>
                      </div>
                      <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-500"
                          style={{ width: `${currentReport.report.scores.newsSentiment}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-gray-500">
                        <span>Fearful / Negative</span>
                        <span>Neutral</span>
                        <span>Highly Greed / Optimistic</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: RISK ANALYSIS */}
                {activeTab === "risk" && (
                  <div className="glassmorphism p-5 rounded-2xl border border-gray-850 space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-gray-900/60 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">Systemic Risk Triggers & Red Flags</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Left: General warnings list */}
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">General Red Flags Checklist</h5>
                        <div className="space-y-2">
                          {["Overpriced asset", "Weak fundamentals", "Legal risk", "Low liquidity", "High volatility", "Fake hype", "Poor resale value", "Policy risk", "Global risk"].map((flag, idx) => {
                            const isPresent = currentReport.report.warnings.some(w => w.toLowerCase().includes(flag.toLowerCase()));
                            return (
                              <div 
                                key={idx} 
                                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono ${
                                  isPresent 
                                    ? "bg-rose-950/20 border-rose-900/40 text-rose-300" 
                                    : "bg-gray-950/25 border-gray-900/50 text-gray-500"
                                }`}
                              >
                                <span>{flag}</span>
                                <span className="font-bold">{isPresent ? "⚠️ DETECTED" : "✓ CLEAR"}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Risk trigger events */}
                      <div className="p-4 bg-gray-950/50 border border-gray-900 rounded-xl space-y-4">
                        <h5 className="text-[10px] font-mono text-gray-300 uppercase tracking-widest">Worst-Case Trigger Events</h5>
                        <div className="space-y-3">
                          {currentReport.report.scenarios.riskTriggers.map((trigger, i) => (
                            <div key={i} className="flex gap-2 text-xs text-gray-300 items-start leading-relaxed bg-gray-900/40 p-2.5 border border-gray-900 rounded-lg">
                              <span className="text-rose-400 font-bold">0{i+1}.</span>
                              <span>{trigger}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* TAB 5: GROWTH POSSIBILITY */}
                {activeTab === "growth" && (
                  <div className="glassmorphism p-5 rounded-2xl border border-gray-850 space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-gray-900/60 pb-3">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">Scenario Projections & Compounding Possibility</h4>
                      </div>
                    </div>

                    <div className="space-y-4">
                      
                      {/* Best Case */}
                      <div className="p-4 bg-emerald-950/10 border border-emerald-900/20 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">Best-Case Scenario</span>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {currentReport.report.scenarios.bestCase}
                        </p>
                      </div>

                      {/* Normal Case */}
                      <div className="p-4 bg-cyan-950/10 border border-cyan-900/20 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">Normal Expected Case</span>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {currentReport.report.scenarios.normalCase}
                        </p>
                      </div>

                      {/* Worst Case */}
                      <div className="p-4 bg-rose-950/10 border border-rose-900/20 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest block font-bold">Worst-Case Capital Loss Scenario</span>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {currentReport.report.scenarios.worstCase}
                        </p>
                      </div>

                    </div>
                  </div>
                )}

                {/* TAB 6: COMPARISON */}
                {activeTab === "comparison" && (
                  <div className="glassmorphism p-5 rounded-2xl border border-gray-850 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-gray-900/60 pb-3">
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">Cross-Asset Comparison Table</h4>
                      </div>
                    </div>

                    {currentReport.report.comparisonTable && currentReport.report.comparisonTable.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] tracking-wider">
                              <th className="py-2.5 px-3">Asset Name</th>
                              <th className="py-2.5 px-3">Est. Return</th>
                              <th className="py-2.5 px-3">Risk</th>
                              <th className="py-2.5 px-3">Liquidity</th>
                              <th className="py-2.5 px-3">Entry Difficulty</th>
                              <th className="py-2.5 px-3">Price Stability</th>
                              <th className="py-2.5 px-3">Best For Whom</th>
                              <th className="py-2.5 px-3">Rank</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-900 text-gray-300">
                            {currentReport.report.comparisonTable.map((item, i) => (
                              <tr key={i} className="hover:bg-gray-950/40 transition">
                                <td className="py-2.5 px-3 font-semibold text-white">{item.assetName}</td>
                                <td className="py-2.5 px-3 text-cyan-400 font-bold">{item.expectedReturn}</td>
                                <td className="py-2.5 px-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                    item.risk === "Low" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/40" :
                                    item.risk === "Medium" ? "bg-amber-950 text-amber-400 border border-amber-900/40" :
                                    "bg-rose-950 text-rose-400 border border-rose-900/40"
                                  }`}>
                                    {item.risk}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3">{item.liquidity}</td>
                                <td className="py-2.5 px-3">{item.entryDifficulty}</td>
                                <td className="py-2.5 px-3">{item.priceStability}</td>
                                <td className="py-2.5 px-3 max-w-[150px] truncate" title={item.bestFor}>{item.bestFor}</td>
                                <td className="py-2.5 px-3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                                  #{item.finalRank}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-gray-950/40 border border-gray-900 rounded-xl space-y-2">
                        <p className="text-xs text-gray-400 font-mono">No comparisons were requested or generated for this asset.</p>
                        <p className="text-[10px] text-gray-500 font-mono">To compare, add comma-separated values in the "Compare Option" field on the left, e.g., "Silver, Tata Motors Stock".</p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 7: FINAL REPORT */}
                {activeTab === "final" && (
                  <div className="glassmorphism p-5 rounded-2xl border border-gray-850 space-y-6 animate-fadeIn">
                    
                    <div className="flex items-center justify-between border-b border-gray-900/60 pb-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">AI Direct Final Strategic Assessment</h4>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-950/20 border border-gray-900/55 rounded-2xl space-y-4 backdrop-blur-sm">
                      
                      {/* Grid parameters */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-900/60 pb-4">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono text-gray-500 uppercase block">Optimal Recommendation</span>
                          <span className="text-xs font-mono text-cyan-400 font-bold">{currentReport.report.finalAnswer.bestOption}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono text-gray-500 uppercase block">Safest Choice</span>
                          <span className="text-xs font-mono text-emerald-400 font-bold">{currentReport.report.finalAnswer.safest}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono text-gray-500 uppercase block">Optimal Duration</span>
                          <span className="text-xs font-mono text-white font-bold">{currentReport.report.finalAnswer.bestHoldingDuration}</span>
                        </div>
                      </div>

                      {/* Detailed reasoning text block */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">Core Rationale</span>
                        <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">
                          {currentReport.report.finalAnswer.text}
                        </p>
                      </div>

                      {/* Warnings */}
                      <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl space-y-1">
                        <span className="text-[10px] font-mono text-rose-300 uppercase tracking-widest block font-bold">Principal Risk Factor</span>
                        <p className="text-xs text-gray-300">
                          {currentReport.report.finalAnswer.mainWarning}
                        </p>
                      </div>

                    </div>
                  </div>
                )}

              </div>

              {/* STICKY BOTTOM SAFETY DISCLAIMER */}
              <div className="p-4 bg-rose-950/15 border border-rose-950/35 rounded-xl text-center text-[10px] font-mono text-rose-300 leading-relaxed max-w-4xl mx-auto">
                🚨 <span className="font-bold">COMPLIANCE & RISK DISCLAIMER:</span> This analysis is compiled automatically for educational and research purposes only. It is not guaranteed financial advice. Investments in stocks, land, gold, diamonds, mutual funds, or cryptocurrencies involve high volatility and capital risk. Please consult a licensed professional financial advisor before executing any capital allocation.
              </div>

            </div>
          ) : (
            
            /* EMPTY INITIAL VIEW */
            <div className="glassmorphism p-10 rounded-2xl border border-gray-850 h-[500px] flex flex-col items-center justify-center space-y-5">
              <div className="p-4 bg-cyan-950/20 rounded-full border border-cyan-800/25">
                <Coins className="w-10 h-10 text-cyan-400 animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-sm font-display font-semibold text-white">System Ready: Asset Deep Research Terminal</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto font-mono">
                  Input any asset category and name in the controller on the left to invoke simulated pricing models, risk meters, and Cross-Asset comparisons.
                </p>
              </div>
            </div>

          )}

        </div>

      </div>

      </div>
    </div>
  );
}
