import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Search, 
  Sparkles, 
  Zap, 
  Layers, 
  MapPin, 
  Clock, 
  Award, 
  Brain, 
  CheckCircle2, 
  AlertTriangle, 
  Target, 
  ArrowRight, 
  Play, 
  Volume2, 
  VolumeX, 
  Calendar, 
  Briefcase, 
  Lightbulb, 
  RefreshCw,
  Video,
  FileText,
  BadgeAlert,
  GraduationCap,
  Users
} from "lucide-react";
import { speakText } from "../lib/speech";
import RippleGrid from "./RippleGrid";

interface TrendIntelligenceProps {
  onSpeakSummary?: (text: string) => void;
}

export default function TrendIntelligence({}: TrendIntelligenceProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 450);
    return () => clearTimeout(timer);
  }, []);

  // Input fields
  const [topic, setTopic] = useState("AI content creation for students");
  const [goal, setGoal] = useState("Freelancing");
  const [level, setLevel] = useState("Beginner");
  const [location, setLocation] = useState("India");
  const [timeHorizon, setTimeHorizon] = useState("1 year");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<string>("overview");
  const [speaking, setSpeaking] = useState(false);
  const [mobileActiveView, setMobileActiveView] = useState<"input" | "output">("input");

  // Example templates for 1-click execution
  const examples = [
    { topic: "AI content creation for students", goal: "Freelancing", level: "Beginner", location: "India", timeHorizon: "1 year" },
    { topic: "Micro-SaaS using AI agents", goal: "Startup", level: "Intermediate", location: "Global", timeHorizon: "5 years" },
    { topic: "Faceless YouTube automation", goal: "Content", level: "Beginner", location: "Global", timeHorizon: "1 year" },
    { topic: "AI Prompt Engineering", goal: "Job", level: "Advanced", location: "India", timeHorizon: "3 months" }
  ];

  const handleSelectExample = (ex: any) => {
    setTopic(ex.topic);
    setGoal(ex.goal);
    setLevel(ex.level);
    setLocation(ex.location);
    setTimeHorizon(ex.timeHorizon);
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setMobileActiveView("output");
    setError(null);
    setAnalysis(null);
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }

    try {
      const response = await fetch("/api/trend-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, goal, level, location, timeHorizon })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "System failed to process trend matrix.");
      }

      setAnalysis(resData.data);
      setActiveSubTab("overview");

      // Auto play a beautiful Hinglish summary introducing the findings!
      setTimeout(() => {
        const decision = resData.data.finalRecommendation?.decision || "Yes, go ahead";
        const score = resData.data.finalRecommendation?.overallScore || "85";
        const bestFor = resData.data.finalRecommendation?.bestFor || "Freelancing";
        const summaryText = `Analysis complete for ${topic}. Overall score is ${score} out of 100. Best path is ${bestFor}. Decision recommendation: ${decision}. Next steps are outlined in your dashboard.`;
        speakText(summaryText, () => setSpeaking(false), () => setSpeaking(false));
        setSpeaking(true);
      }, 800);

    } catch (err: any) {
      setError(err.message || "An unexpected network interruption occurred.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeak = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else if (analysis) {
      const finalRec = analysis.finalRecommendation;
      const textToSpeak = `Deep analysis report summary. For ${topic}, the overall Opportunity Score is ${finalRec.overallScore} out of 100. Best fit is ${finalRec.bestFor} with ${finalRec.difficulty} difficulty level. Your primary recommendation decision is: ${finalRec.decision}. Today's immediate action step is: ${analysis.actionPlan?.today || "to start researching competitors immediately"}.`;
      speakText(textToSpeak, () => setSpeaking(false), () => setSpeaking(false));
      setSpeaking(true);
    }
  };

  return (
    <div className="relative pb-12 text-gray-100 min-h-screen" id="trend-intel-hub-wrapper">
      {/* Background RippleGrid Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-100">
        {showAnimation && (
          <RippleGrid
            enableRainbow={false}
            gridColor="#06b6d4"
            rippleIntensity={0.06}
            gridSize={11}
            gridThickness={12}
            mouseInteraction={true}
            mouseInteractionRadius={1.2}
            opacity={0.4}
          />
        )}
        <div className="absolute inset-0 bg-[#030612]/15 pointer-events-none" />
      </div>

      <div id="trend-intel-hub" className="relative z-10 space-y-6 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800/20 pb-5">
          <div>
            <h1 className="text-3xl font-display font-semibold text-white tracking-tight flex items-center gap-2.5">
              <TrendingUp className="text-cyan-400 w-8 h-8" /> Trend Intelligence Hub
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Predict future demand, career roadmap, AI impacts, competitor voids, and content strategies with precision.
            </p>
          </div>
          {analysis && (
            <button
              onClick={toggleSpeak}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition flex items-center gap-2 cursor-pointer ${
                speaking 
                  ? "bg-red-500/15 text-red-400 border border-red-500/30" 
                  : "bg-cyan-950/15 backdrop-blur-sm text-cyan-400 border border-cyan-800/25 hover:bg-cyan-900/20"
              }`}
            >
              {speaking ? <VolumeX className="w-4 h-4 animate-bounce" /> : <Volume2 className="w-4 h-4" />}
              {speaking ? "MUTE REPORT VOICE" : "SPEAK REPORT SYNTH"}
            </button>
          )}
        </div>

        {/* Mobile-only responsive tab selector to switch between Control Deck & Results Output */}
        <div className="flex md:hidden bg-gray-950/45 p-1 rounded-xl border border-gray-850/50 gap-2 select-none mb-4">
          <button
            onClick={() => setMobileActiveView("input")}
            className={`flex-1 py-2 text-xs font-mono rounded-lg transition-all ${
              mobileActiveView === "input"
                ? "bg-cyan-950/60 text-cyan-400 border border-cyan-800/30"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Niche Config
          </button>
          <button
            onClick={() => setMobileActiveView("output")}
            className={`flex-1 py-2 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mobileActiveView === "output"
                ? "bg-cyan-950/60 text-cyan-400 border border-cyan-800/30"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <span>Analysis Report</span>
            {loading && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>
        </div>

        {/* Main Form controls and Example Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Input Configuration Panel */}
          <div className={`${mobileActiveView === "input" ? "block" : "hidden"} md:block md:col-span-1 p-5 rounded-2xl bg-slate-950/15 backdrop-blur-sm border border-gray-850/40 h-fit space-y-5 shadow-[0_0_50px_-12px_rgba(6,182,212,0.1)]`}>
            <h2 className="text-sm font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5 border-b border-gray-900/20 pb-2.5">
              <Layers className="w-4 h-4" /> Config Target Niche
            </h2>

            <form onSubmit={handleRunAnalysis} className="space-y-4">
              {/* Topic Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-400 block font-semibold">Niche or Topic</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. AI content creation for students"
                    className="w-full bg-[#04091a]/15 backdrop-blur-sm border border-gray-850/40 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* Goal Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-400 block font-semibold">Primary User Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-[#04091a]/15 backdrop-blur-sm border border-gray-850/40 rounded-xl py-2.5 px-3 text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Job" className="bg-slate-950 text-gray-100">Get high-paying Job</option>
                  <option value="Freelancing" className="bg-slate-950 text-gray-100">Earn through Freelancing</option>
                  <option value="Content" className="bg-slate-950 text-gray-100">Grow as a Content Creator</option>
                  <option value="Business" className="bg-slate-950 text-gray-100">Build an Agency or Business</option>
                  <option value="Startup" className="bg-slate-950 text-gray-100">Scale a Tech Startup / SaaS</option>
                  <option value="Learning" className="bg-slate-950 text-gray-100">Skill Acquisition & Learning</option>
                  <option value="Prediction" className="bg-slate-950 text-gray-100">Pure Trend & Demand Prediction</option>
                </select>
              </div>

              {/* User Level, Location, Time Horizon */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-400 block font-semibold">Current Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-[#04091a]/15 backdrop-blur-sm border border-gray-850/40 rounded-xl py-2.5 px-3 text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Beginner" className="bg-slate-950 text-gray-100">Beginner</option>
                    <option value="Intermediate" className="bg-slate-950 text-gray-100">Intermediate</option>
                    <option value="Advanced" className="bg-slate-950 text-gray-100">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-400 block font-semibold">Target Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#04091a]/15 backdrop-blur-sm border border-gray-850/40 rounded-xl py-2.5 px-3 text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="India" className="bg-slate-950 text-gray-100">India</option>
                    <option value="Global" className="bg-slate-950 text-gray-100">Global Market</option>
                    <option value="US/Europe" className="bg-slate-950 text-gray-100">US / Europe</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-400 block font-semibold">Prediction Time Horizon</label>
                <select
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(e.target.value)}
                  className="w-full bg-[#04091a]/15 backdrop-blur-sm border border-gray-850/40 rounded-xl py-2.5 px-3 text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="3 months" className="bg-slate-950 text-gray-100">Short-term (3 Months)</option>
                  <option value="1 year" className="bg-slate-950 text-gray-100">Mid-term (1 Year)</option>
                  <option value="5 years" className="bg-slate-950 text-gray-100">Long-term (5 Years)</option>
                </select>
              </div>

              {/* Run Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-650 hover:opacity-90 text-gray-950 font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 select-none shadow-lg cursor-pointer disabled:opacity-55"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-gray-950" />
                    ANALYZING TREND GRID...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-gray-950 fill-gray-950" />
                    RUN DEEP ANALYSIS
                  </>
                )}
              </button>
            </form>

            {/* Quick preset examples */}
            <div className="space-y-2 border-t border-gray-900/20 pt-4">
              <span className="text-[10px] font-mono font-bold tracking-wider text-gray-500 uppercase block">Instant Templates</span>
              <div className="grid grid-cols-1 gap-1.5">
                {examples.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectExample(ex)}
                    className="text-left bg-slate-950/15 backdrop-blur-sm border border-gray-900/25 rounded-xl p-2 hover:border-cyan-850 hover:bg-cyan-950/10 transition text-xs text-gray-400 hover:text-white"
                  >
                    <div className="font-semibold text-[11px] truncate text-gray-300">{ex.topic}</div>
                    <div className="text-[9px] font-mono text-gray-500 mt-0.5 uppercase tracking-widest">{ex.goal} • {ex.level} • {ex.location}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results / Landing Visuals Panel */}
          <div className={`${mobileActiveView === "output" ? "block" : "hidden"} md:block md:col-span-2 flex flex-col min-h-[450px]`}>
            {loading && (
              <div className="flex-1 bg-slate-950/15 backdrop-blur-sm border border-gray-850/40 rounded-2xl flex flex-col justify-center items-center p-8 space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl animate-pulse" />
                  <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin relative" />
                </div>
                <div className="text-center max-w-sm space-y-2">
                  <h3 className="text-white font-medium font-display">Simulating Multi-Agent Intelligence Engine</h3>
                  <p className="text-xs text-gray-400 font-mono">
                    Synthesizing online content grids, salary potentials, AI automation timelines, and student opportunity roadmaps...
                  </p>
                  <div className="w-44 bg-gray-950/30 rounded-full h-1 mx-auto mt-2 overflow-hidden">
                    <div className="bg-cyan-400 h-full animate-[loading_2s_infinite] w-20 rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex-1 bg-red-950/20 border border-red-900/40 rounded-2xl p-6 flex flex-col justify-center items-center space-y-4">
                <BadgeAlert className="w-12 h-12 text-red-400" />
                <div className="text-center max-w-md">
                  <h3 className="text-white font-semibold font-display">Analysis Engine Timeout</h3>
                  <p className="text-xs text-gray-400 mt-2 font-mono">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {!analysis && !loading && !error && (
              <div className="flex-1 bg-slate-950/15 backdrop-blur-sm border border-gray-850/40 rounded-2xl p-8 flex flex-col justify-center items-center text-center space-y-5">
                <div className="p-4 bg-gray-900/15 backdrop-blur-sm rounded-2xl border border-gray-800/20">
                  <Brain className="w-10 h-10 text-purple-400" />
                </div>
                <div className="max-w-md space-y-2.5">
                  <h3 className="text-lg font-display font-medium text-white">Operational Trend Research Hub ready</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans">
                    Configure any topic, role, or student niche. Our AI Core executes detailed salary metrics, learning milestones, content virality templates, and risk mitigation profiles.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  <span className="text-[10px] font-mono uppercase bg-slate-950/15 backdrop-blur-sm px-2.5 py-1 rounded-md text-gray-400 border border-gray-900/25">13 Core Sections</span>
                  <span className="text-[10px] font-mono uppercase bg-slate-950/15 backdrop-blur-sm px-2.5 py-1 rounded-md text-gray-400 border border-gray-900/25">Custom Timelines</span>
                  <span className="text-[10px] font-mono uppercase bg-slate-950/15 backdrop-blur-sm px-2.5 py-1 rounded-md text-gray-400 border border-gray-900/25">Viral Script Ideas</span>
                </div>
              </div>
            )}

            {analysis && !loading && !error && (
              <div className="space-y-5 flex-1 flex flex-col">
                {/* Tabs Navigation Strip */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1.5 border-b border-gray-900 scrollbar-none">
                  {[
                    { id: "overview", label: "Overview", icon: Target },
                    { id: "market", label: "Market Grid", icon: TrendingUp },
                    { id: "ai", label: "AI Impact", icon: Sparkles },
                    { id: "roadmap", label: "Roadmaps", icon: Calendar },
                    { id: "content", label: "Content Ideas", icon: Video },
                    { id: "monetize", label: "Monetization", icon: Briefcase }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`
                          px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition flex-shrink-0 flex items-center gap-1.5 cursor-pointer
                          ${activeSubTab === tab.id 
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-800/40" 
                            : "text-gray-400 hover:text-white hover:bg-slate-950/15"}
                        `}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Sub Tab View Renderings */}
                <div className="flex-1 bg-slate-950/15 backdrop-blur-sm border border-gray-850/40 rounded-2xl p-5 md:p-6 text-gray-300 shadow-[0_0_50px_-12px_rgba(6,182,212,0.1)]">
                  
                  {/* 1. OVERVIEW TAB */}
                  {activeSubTab === "overview" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                        {/* Gauge Area */}
                        <div className="md:col-span-4 bg-slate-950/15 backdrop-blur-sm rounded-2xl border border-gray-900/25 p-5 text-center flex flex-col justify-center items-center relative overflow-hidden group">
                          <div className="absolute inset-0 bg-cyan-500/5 blur-xl group-hover:scale-125 transition duration-500" />
                          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">OPPORTUNITY</span>
                          <div className="relative mt-3 flex items-center justify-center">
                            {/* Circle Progress Visual */}
                            <svg className="w-24 h-24 transform -rotate-90">
                              <circle cx="48" cy="48" r="40" className="stroke-gray-850" strokeWidth="8" fill="transparent" />
                              <circle 
                                cx="48" 
                                cy="48" 
                                r="40" 
                                className="stroke-cyan-400" 
                                strokeWidth="8" 
                                fill="transparent" 
                                strokeDasharray={`${2 * Math.PI * 40}`} 
                                strokeDashoffset={`${2 * Math.PI * 40 * (1 - (analysis.finalRecommendation?.overallScore || 85) / 100)}`} 
                              />
                            </svg>
                            <span className="absolute text-2xl font-display font-semibold text-white">
                              {analysis.finalRecommendation?.overallScore || 85}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-gray-400 mt-3 font-semibold">Quality Index Rating</span>
                        </div>

                        {/* Summary Text Card */}
                        <div className="md:col-span-8 space-y-3">
                          <div className="bg-cyan-950/10 backdrop-blur-sm border border-cyan-900/20 rounded-xl p-4">
                            <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase block mb-1">Final Decision Vector</span>
                            <p className="text-sm text-gray-200 font-medium">
                              {analysis.finalRecommendation?.decision || "Deploy immediately with moderate strategic buffering."}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-950/15 backdrop-blur-sm p-3 rounded-xl border border-gray-900/25 text-xs">
                              <span className="text-gray-500 font-mono block">BEST USE PATH</span>
                              <span className="text-white font-display font-bold mt-0.5 block">{analysis.finalRecommendation?.bestFor || "Freelancing"}</span>
                            </div>
                            <div className="bg-slate-950/15 backdrop-blur-sm p-3 rounded-xl border border-gray-900/25 text-xs">
                              <span className="text-gray-500 font-mono block">DIFFICULTY RATING</span>
                              <span className="text-white font-display font-bold mt-0.5 block">{analysis.finalRecommendation?.difficulty || "Medium"}</span>
                            </div>
                            <div className="bg-slate-950/15 backdrop-blur-sm p-3 rounded-xl border border-gray-900/25 text-xs">
                              <span className="text-gray-500 font-mono block">TIME TO FIRST RESULT</span>
                              <span className="text-white font-display font-bold mt-0.5 block">{analysis.finalRecommendation?.timeToFirstResult || "30 Days"}</span>
                            </div>
                            <div className="bg-slate-950/15 backdrop-blur-sm p-3 rounded-xl border border-gray-900/25 text-xs">
                              <span className="text-gray-500 font-mono block">TIME TO EARN</span>
                              <span className="text-white font-display font-bold mt-0.5 block">{analysis.finalRecommendation?.timeToEarn || "90 Days"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Topic Understanding Detail */}
                      <div className="p-4 bg-slate-950/15 backdrop-blur-sm rounded-2xl border border-gray-900/25 space-y-2">
                        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Brain className="w-4 h-4" /> Strategic Niche Understanding
                        </span>
                        <p className="text-xs text-gray-300 leading-relaxed font-sans pt-1">
                          <strong className="text-white">Definition:</strong> {analysis.topicUnderstanding?.meaning}
                        </p>
                        <p className="text-xs text-gray-300 leading-relaxed font-sans pt-1">
                          <strong className="text-white">Why it Matters:</strong> {analysis.topicUnderstanding?.importance}
                        </p>
                        <p className="text-xs text-gray-400 font-mono text-[10px] mt-2 block uppercase tracking-wider text-right">
                          Category Profile: {analysis.topicUnderstanding?.category || "Technology Trend"}
                        </p>
                      </div>

                      {/* Next 5 Actions List */}
                      <div className="space-y-2.5">
                        <h3 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
                          Tactical Action Checkpoints
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                          {(analysis.finalRecommendation?.nextFiveActions || []).map((act: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-[#04091a]/15 backdrop-blur-sm border border-gray-850/40 hover:border-gray-800 transition">
                              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded font-bold mt-0.5">
                                0{index + 1}
                              </span>
                              <p className="text-xs text-gray-200 font-medium">
                                {act}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. MARKET GRID TAB */}
                  {activeSubTab === "market" && (
                    <div className="space-y-6">
                      <h3 className="text-sm font-mono uppercase tracking-widest text-cyan-400 font-semibold border-b border-gray-900 pb-2">
                        Quantitative Market Scorecard
                      </h3>

                      {/* Grid showing ratings */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { label: "Market Demand", score: analysis.currentMarket?.demand || 8, desc: "Volume of active query indices & buyers" },
                          { label: "Competition Level", score: analysis.currentMarket?.competition || 6, desc: "Density of sellers & noise factors" },
                          { label: "Beginner Opportunity", score: analysis.currentMarket?.beginnerOpportunity || 7, desc: "Friction to secure initial results" },
                          { label: "Long-term Value", score: analysis.currentMarket?.longTermValue || 9, desc: "Multi-year durability of skill assets" },
                          { label: "Earning Potential", score: analysis.currentMarket?.earningPotential || 8, desc: "Top-tier compensation ceilings" },
                          { label: "Future Growth Index", score: analysis.currentMarket?.futureGrowth || 9, desc: "Projected momentum & velocity" }
                        ].map((item, idx) => (
                          <div key={idx} className="p-4 bg-slate-950/15 backdrop-blur-sm border border-gray-900/25 rounded-xl space-y-2 relative group overflow-hidden">
                            <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-cyan-500 opacity-0 group-hover:opacity-100 transition" />
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-mono font-bold text-gray-400 uppercase">{item.label}</span>
                              <span className="text-sm font-mono font-bold text-cyan-400">{item.score}/10</span>
                            </div>
                            {/* Visual progress bar */}
                            <div className="w-full bg-gray-900 rounded-full h-1">
                              <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${item.score * 10}%` }} />
                            </div>
                            <p className="text-[10px] text-gray-500 font-sans leading-tight">{item.desc}</p>
                          </div>
                        ))}
                      </div>

                      {/* Ground Qualitative Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-950/15 backdrop-blur-sm rounded-xl border border-gray-900/25 space-y-1">
                          <h4 className="text-xs font-mono font-bold text-purple-400 uppercase">Demand & Platforms</h4>
                          <p className="text-xs text-gray-300 leading-relaxed font-sans">{analysis.currentMarket?.demandText}</p>
                          <p className="text-xs text-gray-400 font-mono text-[10px] pt-1">Growing Channels: {analysis.currentMarket?.platforms}</p>
                        </div>

                        <div className="p-4 bg-slate-950/15 backdrop-blur-sm rounded-xl border border-gray-900/25 space-y-1">
                          <h4 className="text-xs font-mono font-bold text-purple-400 uppercase">Void or Arbitrage Gap</h4>
                          <p className="text-xs text-gray-300 leading-relaxed font-sans">{analysis.currentMarket?.gap}</p>
                          <p className="text-xs text-gray-400 font-mono text-[10px] pt-1">User Bottleneck: {analysis.currentMarket?.problems}</p>
                        </div>
                      </div>

                      {/* Timeline of Predictions */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">Chronological Trend Outlook</h4>
                        <div className="border-l border-gray-800 ml-2 space-y-4 pt-1">
                          {[
                            { time: "Next 3 Months", desc: analysis.futurePrediction?.threeMonths },
                            { time: "Next 6 Months", desc: analysis.futurePrediction?.sixMonths },
                            { time: "Next 1 Year", desc: analysis.futurePrediction?.oneYear },
                            { time: "Next 3-5 Years", desc: analysis.futurePrediction?.threeYears || analysis.futurePrediction?.fiveYears }
                          ].map((pred, i) => (
                            <div key={i} className="relative pl-6">
                              <div className="absolute left-[-4.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-slate-950 shadow shadow-cyan-400" />
                              <h5 className="text-xs font-mono text-white font-bold">{pred.time}</h5>
                              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{pred.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. AI IMPACT TAB */}
                  {activeSubTab === "ai" && (
                    <div className="space-y-6">
                      <h3 className="text-sm font-mono uppercase tracking-widest text-cyan-400 font-semibold border-b border-gray-900 pb-2">
                        Vulnerability & Acceleration Matrix
                      </h3>

                      {/* Replace / Help / Human Bento Columns */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Replace (Red) */}
                        <div className="p-4 rounded-xl border border-rose-950/20 bg-rose-950/5 backdrop-blur-sm space-y-3">
                          <span className="text-[10px] font-mono font-bold tracking-widest text-rose-400 uppercase block bg-rose-950/20 px-2 py-0.5 border border-rose-900/30 rounded w-fit">
                            AI WILL AUTOMATE
                          </span>
                          <ul className="space-y-1.5">
                            {(analysis.aiImpact?.willReplace || []).map((t: string, idx: number) => (
                              <li key={idx} className="text-xs text-gray-300 flex items-start gap-1.5">
                                <span className="text-rose-500 mt-0.5">•</span>
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Help (Yellow/Blue) */}
                        <div className="p-4 rounded-xl border border-cyan-950/20 bg-cyan-950/5 backdrop-blur-sm space-y-3">
                          <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase block bg-cyan-950/20 px-2 py-0.5 border border-cyan-900/30 rounded w-fit">
                            AI WILL SUPERCHARGE
                          </span>
                          <ul className="space-y-1.5">
                            {(analysis.aiImpact?.willHelp || []).map((t: string, idx: number) => (
                              <li key={idx} className="text-xs text-gray-300 flex items-start gap-1.5">
                                <span className="text-cyan-400 mt-0.5">•</span>
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Humans Required (Green) */}
                        <div className="p-4 rounded-xl border border-emerald-950/20 bg-emerald-950/5 backdrop-blur-sm space-y-3">
                          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase block bg-emerald-950/20 px-2 py-0.5 border border-emerald-900/30 rounded w-fit">
                            HUMANS REMAIN CRITICAL FOR
                          </span>
                          <ul className="space-y-1.5">
                            {(analysis.aiImpact?.humansNeeded || []).map((t: string, idx: number) => (
                              <li key={idx} className="text-xs text-gray-300 flex items-start gap-1.5">
                                <span className="text-emerald-400 mt-0.5">•</span>
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* AI Strategies */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-950/15 backdrop-blur-sm border border-gray-900/25 rounded-xl space-y-1.5">
                          <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase">Entry Leverage (Beginner)</h4>
                          <p className="text-xs text-gray-300 leading-relaxed">{analysis.aiImpact?.beginnerAutomationStrategy}</p>
                        </div>

                        <div className="p-4 bg-slate-950/15 backdrop-blur-sm border border-gray-900/25 rounded-xl space-y-1.5">
                        <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase">Scaling Velocity (Advanced)</h4>
                        <p className="text-xs text-gray-300 leading-relaxed">{analysis.aiImpact?.advancedScaleStrategy}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. ROADMAPS TAB */}
                {activeSubTab === "roadmap" && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-mono uppercase tracking-widest text-cyan-400 font-semibold border-b border-gray-900 pb-2">
                      Milestone learning & career trajectories
                    </h3>

                    {/* Timeline plans */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-[#04091a]/15 backdrop-blur-sm border border-gray-850/40 rounded-xl space-y-2">
                        <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 block">7-DAY LAUNCHPAD</span>
                        <p className="text-xs text-gray-300 font-sans leading-relaxed">{analysis.skillRoadmap?.timeline?.sevenDays}</p>
                      </div>

                      <div className="p-4 bg-[#04091a]/15 backdrop-blur-sm border border-gray-850/40 rounded-xl space-y-2">
                        <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 block">30-DAY VALIDATION</span>
                        <p className="text-xs text-gray-300 font-sans leading-relaxed">{analysis.skillRoadmap?.timeline?.thirtyDays}</p>
                      </div>

                      <div className="p-4 bg-[#04091a]/15 backdrop-blur-sm border border-gray-850/40 rounded-xl space-y-2">
                        <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 block">90-DAY ACCELERATOR</span>
                        <p className="text-xs text-gray-300 font-sans leading-relaxed">{analysis.skillRoadmap?.timeline?.ninetyDays}</p>
                      </div>

                      <div className="p-4 bg-[#04091a]/15 backdrop-blur-sm border border-gray-850/40 rounded-xl space-y-2">
                        <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 block">6-MONTH SYSTEM MASTERY</span>
                        <p className="text-xs text-gray-300 font-sans leading-relaxed">{analysis.skillRoadmap?.timeline?.sixMonths}</p>
                      </div>
                    </div>

                    {/* Learning Tracks detailed */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-950/15 backdrop-blur-sm rounded-xl border border-gray-900/25">
                        <h4 className="text-xs font-mono font-bold text-gray-400 uppercase">Basics & Fundamentals</h4>
                        <p className="text-xs text-gray-300 mt-1">{analysis.skillRoadmap?.beginner}</p>
                      </div>
                      <div className="p-4 bg-slate-950/15 backdrop-blur-sm rounded-xl border border-gray-900/25">
                        <h4 className="text-xs font-mono font-bold text-gray-400 uppercase">Intermediate Workouts</h4>
                        <p className="text-xs text-gray-300 mt-1">{analysis.skillRoadmap?.intermediate}</p>
                      </div>
                      <div className="p-4 bg-slate-950/15 backdrop-blur-sm rounded-xl border border-gray-900/25">
                        <h4 className="text-xs font-mono font-bold text-gray-400 uppercase">Expert Specializations</h4>
                        <p className="text-xs text-gray-300 mt-1">{analysis.skillRoadmap?.advanced}</p>
                      </div>
                    </div>

                    {/* Proof of Work and Mistakes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-950/15 backdrop-blur-sm border border-gray-900/25 rounded-xl space-y-1.5">
                        <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase">Proof of Work (Portfolio Blueprint)</h4>
                        <p className="text-xs text-gray-300">{analysis.skillRoadmap?.portfolio}</p>
                      </div>

                      <div className="p-4 bg-rose-950/5 backdrop-blur-sm border border-rose-950/15 rounded-xl space-y-2">
                        <h4 className="text-xs font-mono font-bold text-rose-400 uppercase">Critical Mistakes to Avoid</h4>
                        <ul className="space-y-1 text-xs text-gray-400">
                          {(analysis.skillRoadmap?.mistakesToAvoid || []).map((m: string, i: number) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-rose-500">•</span> {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. CONTENT IDEAS TAB */}
                {activeSubTab === "content" && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-mono uppercase tracking-widest text-cyan-400 font-semibold border-b border-gray-900 pb-2">
                      Virality Content blueprints
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-950/15 backdrop-blur-sm rounded-xl border border-gray-900/25 text-xs">
                        <span className="font-mono text-gray-500 uppercase block">Optimal Channels</span>
                        <span className="text-white font-bold mt-0.5 block">{analysis.contentCreation?.platforms}</span>
                      </div>
                      <div className="p-3 bg-slate-950/15 backdrop-blur-sm rounded-xl border border-gray-900/25 text-xs">
                        <span className="font-mono text-gray-500 uppercase block">Viral Formats</span>
                        <span className="text-white font-bold mt-0.5 block">{analysis.contentCreation?.formats}</span>
                      </div>
                    </div>

                    {/* Short Videos Grid */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Video className="w-4 h-4" /> Shorts & Reels blueprints
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(analysis.contentCreation?.shortVideoIdeas || []).map((idea: any, idx: number) => (
                          <div key={idx} className="p-4 bg-[#04091a]/15 backdrop-blur-sm border border-gray-850/40 rounded-xl space-y-2.5 relative overflow-hidden group">
                            <div className="absolute top-2 right-2 bg-purple-950/40 text-purple-400 border border-purple-900/40 text-[9px] font-mono px-1.5 py-0.5 rounded uppercase">
                              Short Script 0{idx + 1}
                            </div>
                            <h5 className="font-display font-medium text-white text-sm pr-12">{idea.title}</h5>
                            <div className="p-2.5 bg-slate-950/15 backdrop-blur-sm rounded-lg border border-gray-900/25 text-xs text-cyan-400 font-mono">
                              <strong>Hook:</strong> "{idea.hook}"
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                              <strong>Format:</strong> {idea.format}
                            </p>
                            <div className="text-[10px] text-gray-500 font-mono border-t border-gray-900/20 pt-2">
                              Why it works: {idea.why}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Long videos or Social Post Ideas */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                        <FileText className="w-4 h-4" /> Editorial & Long-form blueprints
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(analysis.contentCreation?.longVideoIdeas || []).map((idea: any, idx: number) => (
                          <div key={idx} className="p-4 bg-[#04091a]/15 backdrop-blur-sm border border-gray-850/40 rounded-xl space-y-2.5 relative">
                            <span className="absolute top-2 right-2 text-gray-600 font-mono text-[10px]">0{idx + 1}</span>
                            <h5 className="font-display font-medium text-white text-sm pr-10">{idea.title}</h5>
                            <p className="text-xs text-gray-300 leading-relaxed font-sans">
                              <strong>Format Blueprint:</strong> {idea.format}
                            </p>
                            <div className="text-[10px] text-gray-500 font-mono">
                              Why it wins: {idea.why}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. MONETIZATION TAB */}
                {activeSubTab === "monetize" && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-mono uppercase tracking-widest text-cyan-400 font-semibold border-b border-gray-900 pb-2">
                      Economic structures & monetization pipelines
                    </h3>

                    {/* Monetization methods list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(analysis.businessMonetization?.channels || []).map((ch: any, idx: number) => (
                        <div key={idx} className="p-4 bg-slate-950/15 backdrop-blur-sm border border-gray-900/25 rounded-xl space-y-2 relative group overflow-hidden">
                          <div className="absolute top-0 right-0 bg-emerald-950/30 text-emerald-400 border border-emerald-900/30 text-[9px] font-mono px-2 py-0.5 rounded-bl">
                            Potential: {ch.potential}
                          </div>
                          <h4 className="font-display font-medium text-white text-base">{ch.method}</h4>
                          <p className="text-xs text-gray-300 font-sans leading-relaxed">{ch.howItWorks}</p>
                          <p className="text-xs text-gray-400 font-mono text-[10px] pt-1">
                            <strong>What to Sell:</strong> {ch.sell}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Opportunity gaps list */}
                    <div className="p-4 bg-purple-950/5 backdrop-blur-sm border border-purple-900/15 rounded-2xl space-y-3">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase block">
                        Arbitrage Opportunities & Gaps
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <strong className="text-white">Underrated Niches:</strong>
                          <p className="text-gray-400">{analysis.opportunityGaps?.niches}</p>
                        </div>
                        <div className="space-y-1">
                          <strong className="text-white">High-demand / Low-supply Skills:</strong>
                          <p className="text-gray-400">{analysis.opportunityGaps?.lowSupplySkills}</p>
                        </div>
                      </div>
                    </div>

                    {/* Risk parameters */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">Risk parameters</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {(analysis.riskAnalysis?.risks || []).map((risk: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-950/15 backdrop-blur-sm border border-gray-900/25 text-xs">
                            <div className="space-y-1 max-w-xl">
                              <span className="font-bold text-white block">{risk.name}</span>
                              <span className="text-gray-400 block">Mitigation: {risk.mitigation}</span>
                            </div>
                            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded border ml-4 ${
                              risk.level === "High" ? "bg-red-950/20 text-red-400 border-red-900/30" : "bg-amber-950/20 text-amber-400 border-amber-900/30"
                            }`}>
                              {risk.level} Risk
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
