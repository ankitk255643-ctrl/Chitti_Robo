import React, { useState, useEffect } from "react";
import Waves from "./Waves";
import { 
  Globe, 
  Youtube, 
  Instagram, 
  Facebook, 
  Search, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Tv, 
  Volume2, 
  Video, 
  Sliders, 
  TrendingUp, 
  FileText,
  Clock,
  Eye,
  Smile,
  ShieldAlert,
  Info,
  CheckSquare,
  Square,
  Zap,
  BookOpen,
  Trophy
} from "lucide-react";

interface ScoreBreakdown {
  titleScore: number;
  hookScore: number;
  thumbnailScore: number;
  videoQualityScore: number;
  audioScore: number;
  editingScore: number;
  captionScore: number;
  hashtagScore: number;
  engagementScore: number;
  trustScore: number;
  overallScore: number;
}

interface AnalyzerReport {
  platform: string;
  detectedUrl: string;
  scores: ScoreBreakdown;
  titleAnalysis: {
    isClear: string;
    clickWorthy: string;
    emotionalTriggers: string;
    lengthEvaluation: string;
    matchesContent: string;
    suggestions: string[];
  };
  hookAnalysis: {
    evaluation: string;
    scrollingStopper: string;
    curiosityFactor: string;
    valueDelivery: string;
    suggestions: string[];
  };
  thumbnailAnalysis: {
    evaluation: string;
    isReadable: string;
    isCluttered: string;
    suggestions: string[];
  };
  videoQuality: {
    resolution: string;
    lighting: string;
    sharpness: string;
    framing: string;
    overallVisualScore: number;
  };
  audioQuality: {
    clarity: string;
    balance: string;
    improvementTips: string[];
  };
  speedAndPacing: {
    introLength: string;
    boringGaps: string;
    retentionHold: string;
    suggestions: string;
  };
  stabilityAndEditing: {
    shake: string;
    transitions: string;
    bRoll: string;
    suggestions: string[];
  };
  colorStyle: {
    grading: string;
    vibe: string;
    suggestions: string;
  };
  textOverlay: {
    readability: string;
    style: string;
    suggestions: string;
  };
  captionAnalysis: {
    availability: string;
    retentionImpact: string;
    suggestions: string;
  };
  descriptionAnalysis: {
    keywordUsage: string;
    cta: string;
    suggestion: string;
  };
  hashtagAnalysis: {
    relevance: string;
    optimizedList: string[];
  };
  introAnalysis: {
    evaluation: string;
    suggestion: string;
  };
  outroAnalysis: {
    evaluation: string;
    suggestion: string;
  };
  engagementAnalysis: {
    likePotential: string;
    commentPotential: string;
    sharePotential: string;
    savePotential: string;
    retentionPrediction: string;
  };
  accuracyAndTrust: {
    isMisleading: string;
    claimsCheck: string;
    clickbaitRisk: string;
    harmfulAdvice: string;
    originality: string;
    guidelinesMatch: string;
  };
  platformOptimization: {
    platformSpecificAdvice: string;
    additionalTips: string[];
  };
  finalSummary: {
    quickSummary: string;
    whatIsGood: string[];
    whatIsWrongOrWeak: string[];
    whatToImproveFirst: string[];
    recommendation: string;
    finalRecommendation: string;
  };
  improvementChecklist: { task: string; checked: boolean }[];
  improvedReelScript: string;
  improvedThumbnailPrompt: string;
  improvedDescription: string;
  improvedHashtags: string;
  perfectExamples?: {
    title100: string;
    hook100: string;
    thumbnail100: string;
    video100: string;
    audio100: string;
    editing100: string;
    caption100: string;
    hashtag100: string;
    engagement100: string;
    trust100: string;
  };
}

interface SavedReport {
  id: string;
  url: string;
  platform: string;
  customTitle?: string;
  customDescription?: string;
  report: AnalyzerReport;
  createdAt: string;
}

export default function OnlineContentAnalyzer() {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 450);
    return () => clearTimeout(timer);
  }, []);

  const [url, setUrl] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState<string | null>(null);

  // Loaded reports & active selection
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);

  // Checklist state (copied from active report to allow toggling)
  const [checklist, setChecklist] = useState<{ task: string; checked: boolean }[]>([]);

  // Compare mode
  const [compareMode, setCompareMode] = useState(false);
  const [compareUrl, setCompareUrl] = useState("");
  const [compareTitle, setCompareTitle] = useState("");
  const [compareDesc, setCompareDesc] = useState("");
  const [compareReport, setCompareReport] = useState<AnalyzerReport | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Copy feedbacks
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Loading texts rotation
  const loadingPhrases = [
    "Detecting platform core & API endpoints...",
    "Analyzing title phrasing and clickbait threshold...",
    "Scanning audio track clarity & ambient noise...",
    "Evaluating video speed, cutting rate and pacing gaps...",
    "Scanning color styles and visual grading patterns...",
    "Performing platform accuracy & community guidelines compliance check...",
    "Formulating growth strategics & custom viral hook models..."
  ];

  // Fetch saved reports on mount
  useEffect(() => {
    fetchReports();
  }, []);

  // Update local checklist state when active report changes
  useEffect(() => {
    if (selectedReport) {
      setChecklist(selectedReport.report.improvementChecklist || []);
    } else {
      setChecklist([]);
    }
  }, [selectedReport]);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/analyzer/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
        if (data.length > 0 && !selectedReport) {
          setSelectedReport(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    }
  };

  // Rotating loading texts
  useEffect(() => {
    let interval: any;
    if (loading) {
      let index = 0;
      setLoadingText(loadingPhrases[0]);
      interval = setInterval(() => {
        index = (index + 1) % loadingPhrases.length;
        setLoadingText(loadingPhrases[index]);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleClear = () => {
    setUrl("");
    setCustomTitle("");
    setCustomDescription("");
    setError(null);
  };

  const detectPlatform = (targetUrl: string) => {
    const lower = targetUrl.toLowerCase();
    if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "YouTube";
    if (lower.includes("instagram.com")) return "Instagram";
    if (lower.includes("facebook.com") || lower.includes("fb.watch") || lower.includes("fb.com")) return "Facebook";
    if (lower.includes("reddit.com")) return "Reddit";
    return "Generic Web";
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setSelectedReport(null);

    try {
      const response = await fetch("/api/analyzer/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          customTitle: customTitle.trim() || undefined,
          customDescription: customDescription.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      await fetchReports();
      setSelectedReport(data.report);
      setActiveTab("overview");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompareAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compareUrl.trim()) return;

    setCompareLoading(true);
    try {
      const response = await fetch("/api/analyzer/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: compareUrl.trim(),
          customTitle: compareTitle.trim() || undefined,
          customDescription: compareDesc.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Comparison URL analysis failed");
      }

      setCompareReport(data.report.report);
      await fetchReports();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCompareLoading(false);
    }
  };

  const handleDeleteReport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this analysis record?")) return;

    try {
      const res = await fetch(`/api/analyzer/reports/${id}`, { method: "DELETE" });
      if (res.ok) {
        const filtered = reports.filter(r => r.id !== id);
        setReports(filtered);
        if (selectedReport?.id === id) {
          setSelectedReport(filtered.length > 0 ? filtered[0] : null);
        }
      }
    } catch (err) {
      console.error("Failed to delete report:", err);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500 bg-emerald-950/40";
    if (score >= 60) return "text-yellow-400 border-yellow-500 bg-yellow-950/40";
    if (score >= 40) return "text-orange-400 border-orange-500 bg-orange-950/40";
    return "text-rose-400 border-rose-500 bg-rose-950/40";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">Excellent</span>;
    if (score >= 60) return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-950 text-yellow-400 border border-yellow-800">Good but needs improvement</span>;
    if (score >= 40) return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-950 text-orange-400 border border-orange-800">Weak</span>;
    return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-950 text-rose-400 border border-rose-800">Poor / Needs major improvement</span>;
  };

  const getPerfectExamples = (report: any) => {
    if (!report) return null;
    const suggestions = report.titleAnalysis?.suggestions || [];
    const hooks = report.hookAnalysis?.suggestions || [];
    const thumbs = report.thumbnailAnalysis?.suggestions || [];
    return {
      title100: report.perfectExamples?.title100 || (suggestions[0] || "No title suggestions available."),
      hook100: report.perfectExamples?.hook100 || (hooks[0] || "No hook suggestions available."),
      thumbnail100: report.perfectExamples?.thumbnail100 || (thumbs[0] || "Use a high-contrast background with bold, neon-colored sans-serif text (max 3 words) positioned on the left side, keeping the right side clear for an expressive face showing surprise or intense focus."),
      video100: report.perfectExamples?.video100 || "Upgrade resolution to 4K / 1080p 60fps. Position the main light source at a 45-degree angle to create dynamic depth, and use high-end background scenery with standard B-roll cuts every 3-5 seconds.",
      audio100: report.perfectExamples?.audio100 || "Use a directional shotgun mic, set voice peaks to -3dB, and introduce subtle background music ducked to -22dB during talking segments.",
      editing100: report.perfectExamples?.editing100 || "Implement a dynamic 3-second cut rule, zoom in slightly on key emotional statements, and overlay key action verbs on screen with subtle sound effect pops.",
      caption100: report.perfectExamples?.caption100 || (report.improvedDescription || "No optimized caption available."),
      hashtag100: report.perfectExamples?.hashtag100 || (report.improvedHashtags || "#viral #trending #contentcreator"),
      engagement100: report.perfectExamples?.engagement100 || "Ask your audience: 'Which of these 3 techniques will you try first? Drop a comment below!' and pin your own response.",
      trust100: report.perfectExamples?.trust100 || "Add a citation slide or mention: 'Data sourced directly from verified industry benchmarks as of June 2026.'"
    };
  };

  const toggleChecklist = (index: number) => {
    const updated = [...checklist];
    updated[index].checked = !updated[index].checked;
    setChecklist(updated);
  };

  const downloadReportPDF = () => {
    if (!selectedReport) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(selectedReport, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `Chitti_Robo_Analysis_Report_${selectedReport.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden" id="online-content-analyzer-wrapper">
      {/* Background Waves Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {showAnimation && (
          <Waves
            lineColor="rgba(6, 182, 212, 0.15)"
            backgroundColor="transparent"
            waveSpeedX={0.02}
            waveSpeedY={0.01}
            waveAmpX={40}
            waveAmpY={20}
            friction={0.9}
            tension={0.01}
            maxCursorMove={120}
            xGap={12}
            yGap={36}
          />
        )}
        <div className="absolute inset-0 bg-slate-950/10 pointer-events-none" />
      </div>

      <div className="relative z-10 min-h-screen text-slate-100 p-4 lg:p-8 space-y-8" id="online-content-analyzer-root">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6" id="analyzer-header">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400">
                Online Content Analyzer
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Paste any public content URL and let AI detect what is right, wrong, and how to improve it.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="toggle-compare-mode"
            onClick={() => setCompareMode(!compareMode)}
            className={`px-4 py-2 rounded-xl border font-medium text-sm flex items-center gap-2 transition-all ${
              compareMode 
                ? "bg-purple-950 text-purple-300 border-purple-800 hover:bg-purple-900" 
                : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850"
            }`}
          >
            <Sliders className="w-4 h-4" />
            {compareMode ? "Exit Comparison" : "Compare 2 URLs"}
          </button>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Control Card: URL Submission and History */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glassmorphism border border-slate-800 p-5 rounded-2xl space-y-4" id="submit-card">
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Content Parameters
            </h2>

            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Content URL <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder="Paste YouTube, Instagram, Facebook, Reddit, or public link..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-slate-950/60 text-slate-200 border border-slate-800 rounded-xl py-2.5 pl-3 pr-10 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  {url && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Platform Preview Badge */}
              {url && (
                <div className="flex items-center gap-2 py-1 px-3 bg-slate-900 border border-slate-800 rounded-lg w-fit">
                  <span className="text-[10px] text-slate-400 font-mono">Platform Detected:</span>
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                    {detectPlatform(url) === "YouTube" && <Youtube className="w-3.5 h-3.5 text-red-500" />}
                    {detectPlatform(url) === "Instagram" && <Instagram className="w-3.5 h-3.5 text-pink-500" />}
                    {detectPlatform(url) === "Facebook" && <Facebook className="w-3.5 h-3.5 text-blue-500" />}
                    {detectPlatform(url) === "Reddit" && <Globe className="w-3.5 h-3.5 text-orange-500" />}
                    {detectPlatform(url) === "Generic Web" && <Globe className="w-3.5 h-3.5 text-cyan-400" />}
                    {detectPlatform(url)}
                  </span>
                </div>
              )}

              {/* Advanced / Optional Fields */}
              <div className="space-y-3 pt-2 border-t border-slate-900">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Custom Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="Provide exact or alternative title..."
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full bg-slate-950/60 text-slate-200 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Caption/Description (Optional)</label>
                  <textarea
                    placeholder="Paste video description, reel caption, or post copy..."
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950/60 text-slate-200 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading || !url}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
                >
                  {loading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <Sparkles className="w-4.5 h-4.5" />}
                  {loading ? "Analyzing..." : "Analyze Content"}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="bg-slate-900 text-slate-300 border border-slate-800 p-2.5 rounded-xl hover:bg-slate-850 transition-colors text-xs"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* History Panel */}
          <div className="glassmorphism border border-slate-800 p-5 rounded-2xl space-y-4" id="history-panel">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Previous Reports
              </h3>
              <span className="text-[10px] bg-slate-950 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                {reports.length}
              </span>
            </div>

            {reports.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">No previous analyses saved yet.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1" id="reports-history-list">
                {reports.map((r) => {
                  const isSelected = selectedReport?.id === r.id;
                  const scoreColor = r.report.scores.overallScore >= 80 
                    ? "text-emerald-400" 
                    : r.report.scores.overallScore >= 60 
                    ? "text-yellow-400" 
                    : "text-orange-400";

                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedReport(r);
                        setCompareMode(false);
                      }}
                      className={`group p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2 justify-between ${
                        isSelected 
                          ? "bg-slate-900 border-cyan-800 shadow-md shadow-cyan-950/20" 
                          : "bg-slate-950/40 border-slate-900 hover:border-slate-850 hover:bg-slate-950/80"
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-400 transition-colors">
                          {r.customTitle || r.report.titleAnalysis.suggestions[0] || r.url}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-slate-500">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-[9px] bg-slate-950 text-cyan-400 border border-slate-800 px-1.5 rounded uppercase font-bold">
                            {r.platform}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${scoreColor}`}>
                          {r.report.scores.overallScore}
                        </span>
                        <button
                          onClick={(e) => handleDeleteReport(r.id, e)}
                          className="text-slate-600 hover:text-rose-400 p-1 rounded hover:bg-rose-950/30 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Content Area: Detailed Tab Output or Loading Screen */}
        <div className="lg:col-span-3">
          
          {/* A. Loading State */}
          {loading && (
            <div className="glassmorphism border border-slate-800 p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-6 min-h-[500px]" id="analyzer-loading">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-cyan-950 border-t-cyan-400 rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Globe className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-200">Analyzing Content Ecosystem...</h3>
                <p className="text-sm text-cyan-400 font-mono animate-pulse">{loadingText}</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto pt-4 border-t border-slate-900">
                  Chitti-Robo is running multi-channel analysis including audience retention checks, community guidelines mapping, and hook generation.
                </p>
              </div>
            </div>
          )}

          {/* B. Error State */}
          {error && !loading && (
            <div className="bg-rose-950/30 border border-rose-900/60 p-6 rounded-2xl flex items-start gap-4" id="analyzer-error">
              <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-bold text-rose-300">Analysis Encountered an Error</h3>
                <p className="text-xs text-rose-400/80">{error}</p>
                <div className="text-xs text-slate-400 pt-3 space-y-2">
                  <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-cyan-400" /> Note on Platform Security Rules:
                  </p>
                  <p>
                    Some details could not be fetched automatically. Please paste the title, caption, description, or upload a screenshot/video details for a deeper manual analysis bypass.
                  </p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="bg-rose-900 text-rose-200 text-xs px-3 py-1.5 rounded-lg hover:bg-rose-800 transition-colors font-medium mt-2"
                >
                  Dismiss and Edit Parameters
                </button>
              </div>
            </div>
          )}

          {/* C. Compare Mode Panel */}
          {compareMode && !loading && (
            <div className="space-y-6" id="compare-mode-stage">
              <div className="glassmorphism border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-400" />
                  <h3 className="font-display font-bold text-slate-200 text-lg">Compare Side-by-Side</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Analyze and compare the metrics of two content items. Paste the second URL below to load its metrics.
                </p>

                <form onSubmit={handleCompareAnalyze} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase">Second Content URL</label>
                    <input
                      type="url"
                      required
                      placeholder="Paste second URL here..."
                      value={compareUrl}
                      onChange={(e) => setCompareUrl(e.target.value)}
                      className="w-full bg-slate-950/60 text-slate-200 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase">Title (Optional)</label>
                    <input
                      type="text"
                      placeholder="Title..."
                      value={compareTitle}
                      onChange={(e) => setCompareTitle(e.target.value)}
                      className="w-full bg-slate-950/60 text-slate-200 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={compareLoading || !compareUrl}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 px-4 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {compareLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Analyze Second
                  </button>
                </form>
              </div>

              {/* Side-by-Side Comparison Output */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Column 1: Current Active Report */}
                <div className="glassmorphism border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-cyan-400">URL 1 (Active)</span>
                    <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded font-bold text-slate-400">
                      {selectedReport ? selectedReport.platform : "None"}
                    </span>
                  </div>
                  {selectedReport ? (
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-slate-200 line-clamp-2">{selectedReport.customTitle || selectedReport.report.titleAnalysis.suggestions[0]}</p>
                      
                      {/* Score dials */}
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-black text-cyan-400">{selectedReport.report.scores.overallScore}/100</p>
                          <p className="text-[10px] text-slate-500 font-mono">OVERALL SCORE</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-300 block">{selectedReport.report.finalSummary.recommendation}</span>
                          <span className="text-[10px] text-slate-500 font-mono">STATUS</span>
                        </div>
                      </div>

                      {/* Score Breakdown List */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                          <span className="text-slate-400">Title Analysis</span>
                          <span className="font-bold text-slate-200">{selectedReport.report.scores.titleScore}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                          <span className="text-slate-400">Hook Stop Rate</span>
                          <span className="font-bold text-slate-200">{selectedReport.report.scores.hookScore}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                          <span className="text-slate-400">Thumbnail Impact</span>
                          <span className="font-bold text-slate-200">{selectedReport.report.scores.thumbnailScore}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                          <span className="text-slate-400">Visual Quality</span>
                          <span className="font-bold text-slate-200">{selectedReport.report.scores.videoQualityScore}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                          <span className="text-slate-400">Audio Quality</span>
                          <span className="font-bold text-slate-200">{selectedReport.report.scores.audioScore}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                          <span className="text-slate-400">Editing Complexity</span>
                          <span className="font-bold text-slate-200">{selectedReport.report.scores.editingScore}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                          <span className="text-slate-400">Hashtag SEO</span>
                          <span className="font-bold text-slate-200">{selectedReport.report.scores.hashtagScore}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                          <span className="text-slate-400">Trust / Authenticity</span>
                          <span className="font-bold text-slate-200">{selectedReport.report.scores.trustScore}</span>
                        </div>
                      </div>

                      {/* Summary Bullet */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Core Evaluation</span>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                          {selectedReport.report.finalSummary.quickSummary}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic text-center py-10">Select a report from the history list to load here.</p>
                  )}
                </div>

                {/* Column 2: Comparison Report */}
                <div className="glassmorphism border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-purple-400">URL 2 (Target)</span>
                    {compareReport && (
                      <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded font-bold text-slate-400">
                        {compareReport.platform}
                      </span>
                    )}
                  </div>
                  {compareReport ? (
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-slate-200 line-clamp-2">{compareTitle || compareReport.titleAnalysis.suggestions[0]}</p>
                      
                      {/* Score dials */}
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-black text-purple-400">{compareReport.scores.overallScore}/100</p>
                          <p className="text-[10px] text-slate-500 font-mono">OVERALL SCORE</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-300 block">{compareReport.finalSummary.recommendation}</span>
                          <span className="text-[10px] text-slate-500 font-mono">STATUS</span>
                        </div>
                      </div>

                      {/* Score Breakdown List */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                          <span className="text-slate-400">Title Analysis</span>
                          <span className="font-bold text-slate-200">{compareReport.scores.titleScore}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                          <span className="text-slate-400">Hook Stop Rate</span>
                          <span className="font-bold text-slate-200">{compareReport.scores.hookScore}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                          <span className="text-slate-400">Thumbnail Impact</span>
                          <span className="font-bold text-slate-200">{compareReport.scores.thumbnailScore}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                          <span className="text-slate-400">Visual Quality</span>
                          <span className="font-bold text-slate-200">{compareReport.scores.videoQualityScore}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                          <span className="text-slate-400">Audio Quality</span>
                          <span className="font-bold text-slate-200">{compareReport.scores.audioScore}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                          <span className="text-slate-400">Editing Complexity</span>
                          <span className="font-bold text-slate-200">{compareReport.scores.editingScore}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                          <span className="text-slate-400">Hashtag SEO</span>
                          <span className="font-bold text-slate-200">{compareReport.scores.hashtagScore}</span>
                        </div>
                        <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                          <span className="text-slate-400">Trust / Authenticity</span>
                          <span className="font-bold text-slate-200">{compareReport.scores.trustScore}</span>
                        </div>
                      </div>

                      {/* Summary Bullet */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Core Evaluation</span>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                          {compareReport.finalSummary.quickSummary}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-800 rounded-xl p-12 text-center text-slate-600 text-xs italic">
                      Submit second URL on the card above to calculate metrics.
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* D. Main Output Dashboard View */}
          {selectedReport && !loading && !compareMode && (
            <div className="space-y-6" id="report-output-dashboard">
              
              {/* Core Report Info Header */}
              <div className="glassmorphism border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 rounded uppercase font-bold tracking-wider">
                      {selectedReport.platform}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Generated {new Date(selectedReport.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-100 truncate md:max-w-xl">
                    {selectedReport.url}
                  </h2>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadReportPDF}
                    className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-300 hover:text-cyan-400 transition-colors"
                    title="Export Full Report as JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopy(JSON.stringify(selectedReport, null, 2), "JSON report")}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedText === "JSON report" ? "Copied JSON!" : "Copy Report"}
                  </button>
                </div>
              </div>

              {/* Grid 1: Total Scoring Overview Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                
                {/* Dial Score Core Card */}
                <div className="col-span-2 bg-slate-950/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-xl shadow-cyan-950/5 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5">
                    <Sparkles className="w-32 h-32 text-cyan-400" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Overall Score</span>
                    <h3 className="text-4xl font-black text-slate-100 flex items-baseline gap-1">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                        {selectedReport.report.scores.overallScore}
                      </span>
                      <span className="text-sm font-normal text-slate-500">/100</span>
                    </h3>
                    <div className="pt-2">
                      {getScoreBadge(selectedReport.report.scores.overallScore)}
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Coach Rating</span>
                    <p className="text-sm font-bold text-cyan-400">{selectedReport.report.finalSummary.recommendation}</p>
                    <span className="text-[9px] text-slate-500 block">Status Recommendation</span>
                  </div>
                </div>

                {/* Individual Metric Cards */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between ${getScoreColor(selectedReport.report.scores.titleScore)}`}>
                  <div className="flex items-center justify-between text-xs font-mono font-bold opacity-80">
                    <span>TITLE</span>
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="pt-4">
                    <p className="text-2xl font-black">{selectedReport.report.scores.titleScore}</p>
                    <span className="text-[9px] font-mono opacity-60">Score / 100</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border flex flex-col justify-between ${getScoreColor(selectedReport.report.scores.hookScore)}`}>
                  <div className="flex items-center justify-between text-xs font-mono font-bold opacity-80">
                    <span>HOOK</span>
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  <div className="pt-4">
                    <p className="text-2xl font-black">{selectedReport.report.scores.hookScore}</p>
                    <span className="text-[9px] font-mono opacity-60">Score / 100</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border flex flex-col justify-between ${getScoreColor(selectedReport.report.scores.thumbnailScore)}`}>
                  <div className="flex items-center justify-between text-xs font-mono font-bold opacity-80">
                    <span>THUMBNAIL</span>
                    <Tv className="w-3.5 h-3.5" />
                  </div>
                  <div className="pt-4">
                    <p className="text-2xl font-black">{selectedReport.report.scores.thumbnailScore}</p>
                    <span className="text-[9px] font-mono opacity-60">Score / 100</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border flex flex-col justify-between ${getScoreColor(selectedReport.report.scores.videoQualityScore)}`}>
                  <div className="flex items-center justify-between text-xs font-mono font-bold opacity-80">
                    <span>VIDEO</span>
                    <Video className="w-3.5 h-3.5" />
                  </div>
                  <div className="pt-4">
                    <p className="text-2xl font-black">{selectedReport.report.scores.videoQualityScore}</p>
                    <span className="text-[9px] font-mono opacity-60">Score / 100</span>
                  </div>
                </div>

              </div>

              {/* Sub Metrics Strip */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-950/20 border border-slate-900 p-3.5 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-400">Audio:</span>
                  <span className="font-bold text-slate-200">{selectedReport.report.scores.audioScore}/100</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-400">Editing:</span>
                  <span className="font-bold text-slate-200">{selectedReport.report.scores.editingScore}/100</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-400">Caption SEO:</span>
                  <span className="font-bold text-slate-200">{selectedReport.report.scores.captionScore}/100</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-400">Engagement:</span>
                  <span className="font-bold text-slate-200">{selectedReport.report.scores.engagementScore}/100</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-400">Accuracy & Trust:</span>
                  <span className="font-bold text-slate-200">{selectedReport.report.scores.trustScore}/100</span>
                </div>
              </div>

              {/* Detailed Navigation Tabs */}
              <div className="flex overflow-x-auto gap-2 border-b border-slate-900 pb-3" id="analysis-tabs-navigation">
                {[
                  { id: "overview", label: "Overview", icon: BookOpen },
                  { id: "goldStandard", label: "🎯 100/100 Benchmarks", icon: Trophy },
                  { id: "title", label: "Title & Hook", icon: Flame },
                  { id: "thumbnail", label: "Thumbnail", icon: Tv },
                  { id: "quality", label: "Video & Editing Quality", icon: Video },
                  { id: "hashtags", label: "Captions & SEO", icon: Globe },
                  { id: "trust", label: "Accuracy Check", icon: ShieldAlert },
                  { id: "growth", label: "Growth Suggestions", icon: Sparkles },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                        isActive 
                          ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10" 
                          : "bg-slate-950/40 text-slate-400 border border-slate-900 hover:text-slate-200 hover:bg-slate-950/75"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tabs Content Sections */}
              <div className="space-y-6">
                
                {/* Tab 1: Overview */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="tab-overview">
                    <div className="md:col-span-2 space-y-6">
                      
                      {/* Coach Review Summary */}
                      <div className="glassmorphism border border-slate-800 p-5 rounded-2xl space-y-3">
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-900 pb-2">
                          <Eye className="w-4 h-4 text-cyan-400" />
                          Master Coach Analysis Summary
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {selectedReport.report.finalSummary.quickSummary}
                        </p>
                        <div className="bg-slate-950/40 p-3.5 border border-slate-900 rounded-xl mt-4">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 block mb-1">Final Strategic Recommendation</span>
                          <p className="text-xs text-slate-200 italic font-medium">"{selectedReport.report.finalSummary.finalRecommendation}"</p>
                        </div>
                      </div>

                      {/* What is Good / What is Weak Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl space-y-2">
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> What Is Good
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                            {selectedReport.report.finalSummary.whatIsGood.map((good, i) => (
                              <li key={i}>{good}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl space-y-2">
                          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4" /> What Is Weak / Wrong
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                            {selectedReport.report.finalSummary.whatIsWrongOrWeak.map((weak, i) => (
                              <li key={i}>{weak}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                    </div>

                    {/* Right Checklist Column */}
                    <div className="md:col-span-1 space-y-6">
                      <div className="glassmorphism border border-slate-800 p-5 rounded-2xl space-y-4">
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-900 pb-2">
                          <CheckSquare className="w-4 h-4 text-cyan-400" />
                          Improvement Checklist
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Tick off these custom tasks to optimize your video for publication.
                        </p>
                        
                        <div className="space-y-3">
                          {checklist.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => toggleChecklist(idx)}
                              className="flex items-start gap-3 p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg cursor-pointer hover:bg-slate-950/80 transition-all select-none"
                            >
                              <div className="mt-0.5">
                                {item.checked ? (
                                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-600" />
                                )}
                              </div>
                              <span className={`text-xs text-slate-300 ${item.checked ? "line-through text-slate-500" : ""}`}>
                                {item.task}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2">
                          <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 text-center">
                            <span className="text-[10px] text-slate-500 font-mono block">COMPLETION</span>
                            <span className="text-lg font-bold text-cyan-400">
                              {checklist.filter(c => c.checked).length} / {checklist.length} Tasks Done
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Title & Hook */}
                {activeTab === "title" && (() => {
                  const perfect = getPerfectExamples(selectedReport.report);
                  if (!perfect) return null;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="tab-title-hook">
                      {/* Title Gold Standard 100/100 comparison banner */}
                      <div className="md:col-span-2 bg-[#060a1e] border border-cyan-500/30 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 text-[8px] font-black tracking-wider bg-cyan-950 text-cyan-400 rounded border border-cyan-800/40 font-mono">100/100 GOLD STANDARD</span>
                            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Current Title Score: {selectedReport.report.scores.titleScore}/100</span>
                          </div>
                          <h4 className="text-xs text-slate-300 font-bold">Recommended 100/100 Title:</h4>
                          <p className="text-xs text-cyan-300 font-mono">"{perfect.title100}"</p>
                        </div>
                        <button
                          onClick={() => handleCopy(perfect.title100, "tab-title100")}
                          className="px-3 py-1.5 bg-cyan-950 border border-cyan-850 text-cyan-300 rounded hover:bg-cyan-900 transition flex items-center gap-1.5 text-xs font-mono font-bold self-start md:self-auto cursor-pointer"
                        >
                          {copiedText === "tab-title100" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          Copy 100/100 Title
                        </button>
                      </div>

                      {/* Hook Gold Standard 100/100 comparison banner */}
                      <div className="md:col-span-2 bg-[#0d071a] border border-purple-500/30 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 text-[8px] font-black tracking-wider bg-purple-950 text-purple-400 rounded border border-purple-800/40 font-mono">100/100 GOLD STANDARD</span>
                            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Current Hook Score: {selectedReport.report.scores.hookScore}/100</span>
                          </div>
                          <h4 className="text-xs text-slate-300 font-bold">Recommended 100/100 Hook:</h4>
                          <p className="text-xs text-purple-300 font-mono">"{perfect.hook100}"</p>
                        </div>
                        <button
                          onClick={() => handleCopy(perfect.hook100, "tab-hook100")}
                          className="px-3 py-1.5 bg-purple-950 border border-purple-850 text-purple-300 rounded hover:bg-purple-900 transition flex items-center gap-1.5 text-xs font-mono font-bold self-start md:self-auto cursor-pointer"
                        >
                          {copiedText === "tab-hook100" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          Copy 100/100 Hook
                        </button>
                      </div>
                      
                      {/* Title Analysis Section */}
                      <div className="glassmorphism border border-slate-800 p-5 rounded-2xl space-y-4">
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-900 pb-2">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          Title Strategy & Suggestions
                        </h3>

                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">Clarity Evaluation:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">{selectedReport.report.titleAnalysis.isClear}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">Click bait vs Authentic Value:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">{selectedReport.report.titleAnalysis.clickWorthy}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">Emotional Triggers:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">{selectedReport.report.titleAnalysis.emotionalTriggers}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">Length / Layout mapping:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">{selectedReport.report.titleAnalysis.lengthEvaluation}</p>
                          </div>
                        </div>

                        {/* 5 suggestions */}
                        <div className="space-y-3.5 pt-3 border-t border-slate-900">
                          <span className="text-[11px] font-bold text-cyan-400 block">5 Optimized Improved Alternatives:</span>
                          <div className="space-y-2">
                            {selectedReport.report.titleAnalysis.suggestions.map((suggestion, i) => (
                              <div key={i} className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-900 justify-between group">
                                <span className="text-xs text-slate-200 font-semibold">{suggestion}</span>
                                <button
                                  onClick={() => handleCopy(suggestion, `title-${i}`)}
                                  className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded text-slate-400 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  {copiedText === `title-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Hook Analysis Section */}
                      <div className="glassmorphism border border-slate-800 p-5 rounded-2xl space-y-4">
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-900 pb-2">
                          <Flame className="w-4 h-4 text-purple-400" />
                          Hook & Retention stopper
                        </h3>

                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">First 3-10 Seconds Analysis:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">{selectedReport.report.hookAnalysis.evaluation}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">Thumb-Stopping Potential:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">{selectedReport.report.hookAnalysis.scrollingStopper}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">Curiosity trigger loop:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">{selectedReport.report.hookAnalysis.curiosityFactor}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">Instant Value delivery speed:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">{selectedReport.report.hookAnalysis.valueDelivery}</p>
                          </div>
                        </div>

                        {/* Hook suggestions */}
                        <div className="space-y-3.5 pt-3 border-t border-slate-900">
                          <span className="text-[11px] font-bold text-purple-400 block">Suggested Improved Hooks:</span>
                          <div className="space-y-2">
                            {selectedReport.report.hookAnalysis.suggestions.map((suggestion, i) => (
                              <div key={i} className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-900 justify-between group">
                                <span className="text-xs text-slate-200 italic">"{suggestion}"</span>
                                <button
                                  onClick={() => handleCopy(suggestion, `hook-${i}`)}
                                  className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded text-slate-400 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  {copiedText === `hook-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })()}

                {/* Tab 3: Thumbnail */}
                {activeTab === "thumbnail" && (() => {
                  const perfect = getPerfectExamples(selectedReport.report);
                  if (!perfect) return null;
                  return (
                    <div className="glassmorphism border border-slate-800 p-5 rounded-2xl space-y-6" id="tab-thumbnail">
                      {/* Thumbnail Gold Standard 100/100 comparison banner */}
                      <div className="bg-[#050b1c] border border-cyan-500/30 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 text-[8px] font-black tracking-wider bg-cyan-950 text-cyan-400 rounded border border-cyan-800/40 font-mono">100/100 GOLD STANDARD</span>
                            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Current Thumbnail Score: {selectedReport.report.scores.thumbnailScore}/100</span>
                          </div>
                          <h4 className="text-xs text-slate-300 font-bold">Recommended 100/100 Visual Composition:</h4>
                          <p className="text-xs text-cyan-300 font-mono">"{perfect.thumbnail100}"</p>
                        </div>
                        <button
                          onClick={() => handleCopy(perfect.thumbnail100, "tab-thumb100")}
                          className="px-3 py-1.5 bg-cyan-950 border border-cyan-850 text-cyan-300 rounded hover:bg-cyan-900 transition flex items-center gap-1.5 text-xs font-mono font-bold self-start md:self-auto cursor-pointer animate-pulse"
                        >
                          {copiedText === "tab-thumb100" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          Copy 100/100 Layout
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                          <Tv className="w-4 h-4 text-cyan-400" />
                          Thumbnail Audit
                        </h3>
                        <span className="text-xs bg-slate-950 text-slate-400 border border-slate-800 px-3 py-1 rounded font-mono">
                          Score: {selectedReport.report.scores.thumbnailScore} / 100
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                          <div className="space-y-1 text-xs">
                            <span className="text-slate-400 font-mono text-[10px]">Thumbnail Critique:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl leading-relaxed">
                              {selectedReport.report.thumbnailAnalysis.evaluation}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl text-xs space-y-1">
                              <span className="text-slate-400 font-mono text-[10px]">Is Text Readable?</span>
                              <p className="text-slate-200 font-medium">{selectedReport.report.thumbnailAnalysis.isReadable}</p>
                            </div>
                            <div className="bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl text-xs space-y-1">
                              <span className="text-slate-400 font-mono text-[10px]">Is it cluttered / overcrowded?</span>
                              <p className="text-slate-200 font-medium">{selectedReport.report.thumbnailAnalysis.isCluttered}</p>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-1 space-y-4 bg-slate-950/20 p-4 border border-slate-900 rounded-xl">
                          <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                            <Sparkles className="w-4 h-4" /> Thumbnail Concept Ideas
                          </span>
                          <div className="space-y-3">
                            {selectedReport.report.thumbnailAnalysis.suggestions.map((suggestion, i) => (
                              <div key={i} className="p-3 bg-slate-950/60 border border-slate-900 rounded-lg text-xs leading-relaxed text-slate-300">
                                <span className="font-bold text-cyan-500 block mb-1">Concept {i+1}:</span>
                                {suggestion}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* AI Prompt generator strip */}
                      <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase block">AI Image Prompt Generator</span>
                          <p className="text-xs text-slate-400">Generate a high click-worthy click-rate layout in Imagen-4 or Midjourney.</p>
                        </div>
                        <button
                          onClick={() => handleCopy(selectedReport.report.improvedThumbnailPrompt, "thumbnail prompt")}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors self-start md:self-auto cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" />
                          {copiedText === "thumbnail prompt" ? "Copied Prompt!" : "Copy Thumbnail Prompt"}
                        </button>
                      </div>

                    </div>
                  );
                })()}

                {/* Tab 4: Video Quality & Style */}
                {activeTab === "quality" && (() => {
                  const perfect = getPerfectExamples(selectedReport.report);
                  if (!perfect) return null;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="tab-quality">
                      
                      {/* Video Gold Standard 100/100 banner */}
                      <div className="md:col-span-2 bg-[#040c1a] border border-cyan-500/30 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 text-[8px] font-black tracking-wider bg-cyan-950 text-cyan-400 rounded border border-cyan-800/40 font-mono">100/100 GOLD STANDARD</span>
                            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Current Production Score: {selectedReport.report.scores.videoQualityScore}/100</span>
                          </div>
                          <h4 className="text-xs text-slate-300 font-bold">Recommended 100/100 Video Quality:</h4>
                          <p className="text-xs text-cyan-300 font-mono">"{perfect.video100}"</p>
                        </div>
                        <button
                          onClick={() => handleCopy(perfect.video100, "tab-video100")}
                          className="px-3 py-1.5 bg-cyan-950 border border-cyan-850 text-cyan-300 rounded hover:bg-cyan-900 transition flex items-center gap-1.5 text-xs font-mono font-bold self-start md:self-auto cursor-pointer"
                        >
                          {copiedText === "tab-video100" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          Copy 100/100 Video Spec
                        </button>
                      </div>

                      {/* Audio Gold Standard 100/100 banner */}
                      <div className="md:col-span-2 bg-[#0f0414] border border-pink-500/30 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 text-[8px] font-black tracking-wider bg-pink-950 text-pink-400 rounded border border-pink-800/40 font-mono font-bold">100/100 GOLD STANDARD</span>
                            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Current Acoustics Score: {selectedReport.report.scores.audioScore}/100</span>
                          </div>
                          <h4 className="text-xs text-slate-300 font-bold">Recommended 100/100 Soundscape & Audio:</h4>
                          <p className="text-xs text-pink-300 font-mono">"{perfect.audio100}"</p>
                        </div>
                        <button
                          onClick={() => handleCopy(perfect.audio100, "tab-audio100")}
                          className="px-3 py-1.5 bg-pink-950 border border-pink-850 text-pink-300 rounded hover:bg-pink-900 transition flex items-center gap-1.5 text-xs font-mono font-bold self-start md:self-auto cursor-pointer"
                        >
                          {copiedText === "tab-audio100" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          Copy 100/100 Audio Spec
                        </button>
                      </div>

                      {/* Editing Gold Standard 100/100 banner */}
                      <div className="md:col-span-2 bg-[#120a04] border border-amber-500/30 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 text-[8px] font-black tracking-wider bg-amber-950 text-amber-400 rounded border border-amber-800/40 font-mono">100/100 GOLD STANDARD</span>
                            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Current Editing Score: {selectedReport.report.scores.editingScore}/100</span>
                          </div>
                          <h4 className="text-xs text-slate-300 font-bold">Recommended 100/100 Editing Style & Flow:</h4>
                          <p className="text-xs text-amber-300 font-mono">"{perfect.editing100}"</p>
                        </div>
                        <button
                          onClick={() => handleCopy(perfect.editing100, "tab-editing100")}
                          className="px-3 py-1.5 bg-amber-950 border border-amber-850 text-amber-300 rounded hover:bg-amber-900 transition flex items-center gap-1.5 text-xs font-mono font-bold self-start md:self-auto cursor-pointer"
                        >
                          {copiedText === "tab-editing100" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          Copy 100/100 Editing Spec
                        </button>
                      </div>
                      
                      {/* Visual and Resolution Specs */}
                      <div className="glassmorphism border border-slate-800 p-5 rounded-2xl space-y-4">
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-900 pb-2">
                          <Video className="w-4 h-4 text-cyan-400" />
                          Visual & Framing Audit
                        </h3>

                        <div className="space-y-3.5 text-xs">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-950 p-3 border border-slate-900 rounded-lg">
                              <span className="text-slate-400 text-[10px] block font-mono">RESOLUTION:</span>
                              <p className="text-slate-200 mt-0.5 font-semibold">{selectedReport.report.videoQuality.resolution}</p>
                            </div>
                            <div className="bg-slate-950 p-3 border border-slate-900 rounded-lg">
                              <span className="text-slate-400 text-[10px] block font-mono">LIGHTING:</span>
                              <p className="text-slate-200 mt-0.5 font-semibold">{selectedReport.report.videoQuality.lighting}</p>
                            </div>
                          </div>

                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">Sharpness / Grain assessment:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">{selectedReport.report.videoQuality.sharpness}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">Camera framing & angles:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">{selectedReport.report.videoQuality.framing}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">Color Grading & Brand style:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">
                              {selectedReport.report.colorStyle.grading} — {selectedReport.report.colorStyle.vibe}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Speed, Pacing, stability & Editing details */}
                      <div className="glassmorphism border border-slate-800 p-5 rounded-2xl space-y-4">
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-900 pb-2">
                          <Sliders className="w-4 h-4 text-purple-400" />
                          Pacing & Editing Suite
                        </h3>

                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">Video Pacing & attention gaps:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">
                              {selectedReport.report.speedAndPacing.introLength} — {selectedReport.report.speedAndPacing.boringGaps}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">Stability & shake analysis:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">{selectedReport.report.stabilityAndEditing.shake}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">Editing transitions & cuts quality:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">{selectedReport.report.stabilityAndEditing.transitions}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">Suggestions for editor / pacing:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">{selectedReport.report.speedAndPacing.suggestions}</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })()}

                {/* Tab 5: Captions, Hashtags & SEO */}
                {activeTab === "hashtags" && (() => {
                  const perfect = getPerfectExamples(selectedReport.report);
                  if (!perfect) return null;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="tab-hashtags">
                      
                      {/* Caption Gold Standard 100/100 banner */}
                      <div className="md:col-span-2 bg-[#040c15] border border-teal-500/30 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 text-[8px] font-black tracking-wider bg-teal-950 text-teal-400 rounded border border-teal-800/40 font-mono">100/100 GOLD STANDARD</span>
                            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Current Caption Score: {selectedReport.report.scores.captionScore}/100</span>
                          </div>
                          <h4 className="text-xs text-slate-300 font-bold">Recommended 100/100 Caption / Description Copy:</h4>
                          <p className="text-xs text-teal-300 font-mono whitespace-pre-wrap max-h-20 overflow-y-auto">"{perfect.caption100}"</p>
                        </div>
                        <button
                          onClick={() => handleCopy(perfect.caption100, "tab-caption100")}
                          className="px-3 py-1.5 bg-teal-950 border border-teal-850 text-teal-300 rounded hover:bg-teal-900 transition flex items-center gap-1.5 text-xs font-mono font-bold self-start md:self-auto cursor-pointer"
                        >
                          {copiedText === "tab-caption100" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          Copy 100/100 Caption
                        </button>
                      </div>

                      {/* Hashtag Gold Standard 100/100 banner */}
                      <div className="md:col-span-2 bg-[#0c0414] border border-sky-500/30 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 text-[8px] font-black tracking-wider bg-sky-950 text-sky-400 rounded border border-sky-800/40 font-mono">100/100 GOLD STANDARD</span>
                            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Current Hashtags Score: {selectedReport.report.scores.hashtagScore}/100</span>
                          </div>
                          <h4 className="text-xs text-slate-300 font-bold">Recommended 100/100 Tags list:</h4>
                          <p className="text-xs text-sky-300 font-mono">"{perfect.hashtag100}"</p>
                        </div>
                        <button
                          onClick={() => handleCopy(perfect.hashtag100, "tab-hashtag100")}
                          className="px-3 py-1.5 bg-sky-950 border border-sky-850 text-sky-300 rounded hover:bg-sky-900 transition flex items-center gap-1.5 text-xs font-mono font-bold self-start md:self-auto cursor-pointer"
                        >
                          {copiedText === "tab-hashtag100" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          Copy 100/100 Tags
                        </button>
                      </div>
                      
                      {/* Audio & Caption text */}
                      <div className="glassmorphism border border-slate-800 p-5 rounded-2xl space-y-4">
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-900 pb-2">
                          <Volume2 className="w-4 h-4 text-cyan-400" />
                          Acoustics & Captions
                        </h3>

                        <div className="space-y-3.5 text-xs">
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">Voice Clarity & Balance:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">
                              {selectedReport.report.audioQuality.clarity} — {selectedReport.report.audioQuality.balance}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">On-Screen Text overlays:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">
                              {selectedReport.report.textOverlay.readability} — {selectedReport.report.textOverlay.style}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">Subtitles & Captioning format:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">
                              {selectedReport.report.captionAnalysis.availability} — {selectedReport.report.captionAnalysis.retentionImpact}
                            </p>
                          </div>
                          <div className="bg-slate-950 p-3 border border-slate-900 rounded-lg">
                            <span className="text-cyan-400 font-mono text-[10px] block mb-1">Acoustic Improvement Action:</span>
                            <ul className="list-disc list-inside space-y-1 text-slate-300">
                              {selectedReport.report.audioQuality.improvementTips.map((tip, i) => (
                                <li key={i}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* SEO description & hashtags */}
                      <div className="glassmorphism border border-slate-800 p-5 rounded-2xl space-y-4">
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-900 pb-2">
                          <Globe className="w-4 h-4 text-purple-400" />
                          Search Engine Optimization (SEO)
                        </h3>

                        <div className="space-y-3.5 text-xs">
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">Keyword & Metadata utilization:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">{selectedReport.report.descriptionAnalysis.keywordUsage}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">CTA (Call to Action) quality:</span>
                            <p className="text-slate-200 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg mt-1">{selectedReport.report.descriptionAnalysis.cta}</p>
                          </div>

                          {/* 10 Optimized Hashtags */}
                          <div className="space-y-2 pt-2 border-t border-slate-900">
                            <div className="flex items-center justify-between">
                              <span className="text-purple-400 font-mono text-[10px] block uppercase">10 Optimized Hashtags</span>
                              <button
                                onClick={() => handleCopy(selectedReport.report.improvedHashtags, "copy-all-tags")}
                                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                {copiedText === "copy-all-tags" ? "Copied!" : "Copy All"}
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedReport.report.hashtagAnalysis.optimizedList.map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 bg-slate-950 text-purple-300 border border-slate-900 rounded font-mono text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })()}

                {/* Tab 6: Accuracy Check */}
                {activeTab === "trust" && (() => {
                  const perfect = getPerfectExamples(selectedReport.report);
                  if (!perfect) return null;
                  return (
                    <div className="glassmorphism border border-slate-800 p-5 rounded-2xl space-y-5" id="tab-trust">
                      {/* Trust Gold Standard 100/100 banner */}
                      <div className="bg-[#1a0505]/40 border border-rose-500/30 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 text-[8px] font-black tracking-wider bg-rose-950 text-rose-400 rounded border border-rose-800/40 font-mono">100/100 GOLD STANDARD</span>
                            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Current Credibility Score: {selectedReport.report.scores.trustScore}/100</span>
                          </div>
                          <h4 className="text-xs text-slate-300 font-bold">Recommended 100/100 Credibility Frame:</h4>
                          <p className="text-xs text-rose-300 font-mono">"{perfect.trust100}"</p>
                        </div>
                        <button
                          onClick={() => handleCopy(perfect.trust100, "tab-trust100")}
                          className="px-3 py-1.5 bg-rose-950 border border-rose-850 text-rose-300 rounded hover:bg-rose-900 transition flex items-center gap-1.5 text-xs font-mono font-bold self-start md:self-auto cursor-pointer"
                        >
                          {copiedText === "tab-trust100" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          Copy 100/100 Disclaimer
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                          <ShieldAlert className="w-4.5 h-4.5 text-rose-400" />
                          Security, Authenticity & Platform Policy Scan
                        </h3>
                        <span className="text-xs bg-slate-950 text-slate-400 border border-slate-800 px-3 py-1 rounded font-mono">
                          Trust Score: {selectedReport.report.scores.trustScore} / 100
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl space-y-1">
                          <span className="text-slate-500 font-mono text-[10px]">Is Information Misleading?</span>
                          <p className="text-slate-200">{selectedReport.report.accuracyAndTrust.isMisleading}</p>
                        </div>
                        <div className="bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl space-y-1">
                          <span className="text-slate-500 font-mono text-[10px]">Are claims unsupported / exaggerated?</span>
                          <p className="text-slate-200">{selectedReport.report.accuracyAndTrust.claimsCheck}</p>
                        </div>
                        <div className="bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl space-y-1">
                          <span className="text-slate-500 font-mono text-[10px]">Clickbait / Spam risk index:</span>
                          <p className="text-slate-200">{selectedReport.report.accuracyAndTrust.clickbaitRisk}</p>
                        </div>
                        <div className="bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl space-y-1">
                          <span className="text-slate-500 font-mono text-[10px]">Harmful or risky advice scan:</span>
                          <p className="text-slate-200">{selectedReport.report.accuracyAndTrust.harmfulAdvice}</p>
                        </div>
                        <div className="bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl space-y-1">
                          <span className="text-slate-500 font-mono text-[10px]">Originality & Copycat assessment:</span>
                          <p className="text-slate-200">{selectedReport.report.accuracyAndTrust.originality}</p>
                        </div>
                        <div className="bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl space-y-1">
                          <span className="text-slate-500 font-mono text-[10px]">Platform guidelines match:</span>
                          <p className="text-slate-200">{selectedReport.report.accuracyAndTrust.guidelinesMatch}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Tab 7: Growth Suggestions & Scripts */}
                {activeTab === "growth" && (() => {
                  const perfect = getPerfectExamples(selectedReport.report);
                  if (!perfect) return null;
                  return (
                    <div className="space-y-6" id="tab-growth">
                      
                      {/* Engagement Gold Standard 100/100 banner */}
                      <div className="bg-[#1c0510]/40 border border-rose-500/30 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 text-[8px] font-black tracking-wider bg-rose-950 text-rose-400 rounded border border-rose-800/40 font-mono">100/100 GOLD STANDARD</span>
                            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Current Engagement Score: {selectedReport.report.scores.engagementScore}/100</span>
                          </div>
                          <h4 className="text-xs text-slate-300 font-bold">Recommended 100/100 Engagement Trigger:</h4>
                          <p className="text-xs text-rose-300 font-mono">"{perfect.engagement100}"</p>
                        </div>
                        <button
                          onClick={() => handleCopy(perfect.engagement100, "tab-engage100")}
                          className="px-3 py-1.5 bg-rose-950 border border-rose-850 text-rose-300 rounded hover:bg-rose-900 transition flex items-center gap-1.5 text-xs font-mono font-bold self-start md:self-auto cursor-pointer"
                        >
                          {copiedText === "tab-engage100" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          Copy 100/100 Trigger
                        </button>
                      </div>

                      {/* Platform optimization advice */}
                      <div className="glassmorphism border border-slate-800 p-5 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-cyan-400" />
                            Platform-Specific Viral SEO Strategy
                          </h3>
                          <span className="text-xs bg-slate-950 text-cyan-400 px-3 py-1 rounded font-mono font-bold">
                            {selectedReport.platform} Focus
                          </span>
                        </div>

                        <div className="space-y-4 text-xs">
                          <div>
                            <span className="text-slate-400 block font-mono text-[10px]">SEO Structure recommendations:</span>
                            <p className="text-slate-200 leading-relaxed bg-slate-950/40 border border-slate-900 p-3 rounded-lg mt-1">
                              {selectedReport.report.platformOptimization.platformSpecificAdvice}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <span className="text-slate-400 block font-mono text-[10px] uppercase">Additional Strategic Growth advice:</span>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {selectedReport.report.platformOptimization.additionalTips.map((tip, i) => (
                                <div key={i} className="p-3 bg-slate-950 border border-slate-900 rounded-lg text-slate-300 leading-relaxed">
                                  {tip}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Script, description & rewrite playground */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Better description & hashtags generator */}
                        <div className="glassmorphism border border-slate-800 p-5 rounded-2xl space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                            <span className="text-xs font-semibold text-slate-200">Generated Optimized Post Copy</span>
                            <button
                              onClick={() => handleCopy(selectedReport.report.improvedDescription, "improved-desc")}
                              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              {copiedText === "improved-desc" ? "Copied description!" : "Copy Post Copy"}
                            </button>
                          </div>
                          <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 max-h-[180px] overflow-y-auto text-xs font-mono text-slate-300 whitespace-pre-wrap">
                            {selectedReport.report.improvedDescription}
                            {"\n\n"}
                            {selectedReport.report.improvedHashtags}
                          </div>
                        </div>

                        {/* Video Script Generator */}
                        <div className="glassmorphism border border-slate-800 p-5 rounded-2xl space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                              <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                              Optimized High-Retention Video Script
                            </span>
                            <button
                              onClick={() => handleCopy(selectedReport.report.improvedReelScript, "improved-script")}
                              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              {copiedText === "improved-script" ? "Copied Script!" : "Copy Script"}
                            </button>
                          </div>
                          <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 max-h-[180px] overflow-y-auto text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {selectedReport.report.improvedReelScript}
                          </div>
                        </div>

                      </div>

                    </div>
                  );
                })()}

              </div>

            </div>
          )}

          {/* E. Empty initial state when no active reports */}
          {!selectedReport && !loading && !compareMode && (
            <div className="glassmorphism border border-slate-800 p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-6 min-h-[500px]" id="empty-stage">
              <div className="p-4 bg-slate-950/80 border border-slate-800 text-slate-400 rounded-full">
                <Globe className="w-12 h-12 text-cyan-400 animate-pulse" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-bold text-slate-200">No URL Analyzed Yet</h3>
                <p className="text-sm text-slate-400">
                  Chitti-Robo's Content Strategy Engine can audit public links from YouTube, Reels, Facebook, Reddit or standard web blogs to tell you exactly how to scale views and retention.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
                      setCustomTitle("Epic Tech Product Pitch Reel");
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 transition-colors"
                  >
                    Load Sample YouTube Link
                  </button>
                  <button
                    onClick={() => {
                      setUrl("https://www.instagram.com/reel/C8r8928A_sF/");
                      setCustomTitle("AI Productivity Growth Tutorial");
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 transition-colors"
                  >
                    Load Sample Reel Link
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
    </div>
  );
}
