import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  Terminal, 
  Mic, 
  MicOff,
  Cpu, 
  Zap, 
  Layers, 
  LineChart, 
  Database, 
  ArrowRight,
  Sparkles,
  FlameKindling,
  History,
  ShieldCheck,
  ShieldAlert,
  Volume2,
  VolumeX,
  Play,
  Check
} from "lucide-react";
import { Agent } from "../types";
import { WebGLHero } from "./ui/revolution-hero";

interface LandingPageProps {
  onStartChat: () => void;
  onExploreAgents: () => void;
  onSendMessage: (text: string) => void;
  agents: Agent[];
  onNavigateTab?: (tab: string) => void;
  onClearHistory?: () => void;
  recentCommands?: string[];
  addRecentCommand?: (cmd: string) => void;
  voiceButtonsShut?: boolean;
  onToggleVoiceButtonsShut?: () => void;
}

export default function LandingPage({
  onStartChat,
  onExploreAgents,
  onSendMessage,
  agents,
  onNavigateTab,
  onClearHistory,
  recentCommands = [],
  addRecentCommand,
  voiceButtonsShut = false,
  onToggleVoiceButtonsShut,
}: LandingPageProps) {
  const [askText, setAskText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [statusMessage, setStatusMessage] = useState("Vocal channel active. Tap the orb or mic icon below to command.");
  const [supported, setSupported] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      // Check for SpeechRecognition support safely
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSupported(false);
        setStatusMessage("Web Speech API not supported in this browser environment. Use text dispatching.");
        return;
      }

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setStatusMessage("Listening... State your sequence or query.");
      };

      rec.onerror = (event: any) => {
        console.warn("Speech recognition error in Landing Page", event);
        if (event.error === "not-allowed") {
          setStatusMessage("Access denied. Please grant microphone access in settings.");
        } else {
          setStatusMessage(`Error detected: ${event.error}. Try speaking again.`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          processVoiceCommand(finalTranscript);
        }
      };

      recognitionRef.current = rec;
    } catch (err) {
      console.warn("SpeechRecognition initialization failed in Landing page:", err);
      setSupported(false);
      setStatusMessage("Web Speech API permission blocked or restricted in current context.");
    }
  }, []);

  const toggleListening = () => {
    if (!supported) return;
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript("");
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error("Could not trigger speech recognition integration", err);
      }
    }
  };

  const processVoiceCommand = (commandText: string) => {
    if (!commandText.trim()) return;
    const cmd = commandText.trim().toLowerCase();
    
    if (addRecentCommand) {
      addRecentCommand(commandText);
    }
    
    setStatusMessage(`Processed sequence: "${commandText}"`);

    // Quick command shortcut intercepting
    setTimeout(() => {
      if (cmd.includes("open dashboard") || cmd.includes("show dashboard") || cmd === "dashboard") {
        if (onNavigateTab) {
          onNavigateTab("dashboard");
        }
        setStatusMessage("Redirecting to Dashboard System Health...");
      } else if (cmd.includes("show my memory") || cmd.includes("open memory") || cmd.includes("show memory") || cmd === "memory") {
        if (onNavigateTab) {
          onNavigateTab("memory");
        }
        setStatusMessage("Accessing long-term cognitive database...");
      } else if (cmd.includes("show templates") || cmd.includes("open prompts") || cmd.includes("show prompt") || cmd === "prompts") {
        if (onNavigateTab) {
          onNavigateTab("prompts");
        }
        setStatusMessage("Opening Prism Prompt templates library...");
      } else if (cmd.includes("show agents") || cmd.includes("open agents") || cmd === "agents") {
        if (onNavigateTab) {
          onNavigateTab("agents");
        }
        setStatusMessage("Activating Agent Registry...");
      } else if (cmd.includes("clear chat") || cmd.includes("wipe chat") || cmd.includes("reset chat")) {
        if (onClearHistory) {
          onClearHistory();
        }
        if (onNavigateTab) {
          onNavigateTab("chat");
        }
        setStatusMessage("Cleared active operational context.");
      } else {
        // Default to routing query to selected Agent via main handler
        onSendMessage(commandText);
        setStatusMessage("Query successfully routed to Mega AI central core.");
      }
    }, 1200);
  };

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askText.trim()) return;
    onSendMessage(askText);
    setAskText("");
  };

  const coreMetrics = [
    { label: "Centralized Mind", value: "1 Brain" },
    { label: "Agent Nodes", value: "8 Operational" },
    { label: "Auto Routing Speed", value: "<150ms" },
    { label: "Accuracy Index", value: "99.8%" }
  ];

  const valueFeatures = [
    {
      title: "Vocal Orb Gateway",
      desc: "Tap the central pulsing J.A.R.V.I.S. core or use the mic input to dictate, execute voice shortcuts, or ask questions.",
      icon: Mic,
      color: "text-purple-400 bg-purple-950/20 border-purple-900/30",
    },
    {
      title: "Omni-Intelligent Routing",
      desc: "Chitti-Robo maps the semantic structure of your voice or text to direct execution to the perfect matching agent cluster.",
      icon: Cpu,
      color: "text-cyan-400 bg-cyan-950/20 border-cyan-900/30",
    },
    {
      title: "Semantic Vector Memories",
      desc: "Maintains cosine similarity indexing under the hood to preserve guidelines and contextual learning over sessions.",
      icon: Database,
      color: "text-emerald-400 bg-emerald-950/20 border-emerald-900/30",
    }
  ];

  return (
    <div id="landing-hero-scene" className="min-h-screen relative pt-16 pb-16 px-4 md:px-8 max-w-6xl mx-auto space-y-12 flex flex-col justify-start select-none overflow-x-hidden">
      
      {/* WebGL Animated Hero Background */}
      {showAnimation && <WebGLHero backgroundOnly={true} />}
      
      {/* Absolute ambient backgrounds */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-indigo-500/15 rounded-full blur-3xl animate-orb-slow-1 pointer-events-none z-0" />
      <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-gradient-to-br from-cyan-500/5 via-emerald-500/5 to-purple-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Header Badge & Titles */}
      <div className="text-center space-y-4 relative z-10 mx-auto max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0f1938] border border-cyan-500/25 rounded-full shadow-sm text-[10px] font-mono text-cyan-400 font-bold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" /> Chitti-Robo Mega AI Central Core
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-medium tracking-tight text-white leading-tight">
          Your Personal Mega AI <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 font-bold">
            Unified Command Center
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xl mx-auto">
          One unified central deck. Eight specialized agent sub-modules. Cosmical intent routing. Speak or type, and watch Chitti-Robo execute instantly.
        </p>
      </div>

      {/* Main Combined Vocal Orb Portal */}
      <div className="flex flex-col items-center justify-center relative py-2 z-10 select-none space-y-4">
        
        {/* Toggle Switch to Shut Voice Button */}
        {onToggleVoiceButtonsShut && (
          <div className="flex items-center gap-2 px-3 py-1 bg-[#091026] border border-gray-800 rounded-full text-[10px] font-mono select-none shadow-sm z-20">
            <span className="text-gray-400">Voice Control Buttons:</span>
            <button
              type="button"
              onClick={onToggleVoiceButtonsShut}
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase cursor-pointer transition ${
                voiceButtonsShut
                  ? "text-rose-400 bg-rose-950/40 border border-rose-900/40 hover:bg-rose-900/30"
                  : "text-cyan-400 bg-cyan-950/40 border border-cyan-900/40 hover:bg-cyan-900/30"
              }`}
              id="shut-voice-button-toggle"
            >
              {voiceButtonsShut ? "• SHUT" : "• LIVE / ON"}
            </button>
          </div>
        )}

        {/* Clickable AI Speak Orb */}
        <div className="relative">
          {isListening && !voiceButtonsShut && (
            <div className="absolute -inset-4 bg-cyan-500/10 rounded-full animate-ping scale-110 pointer-events-none" />
          )}
          
          <button
            onClick={voiceButtonsShut ? onToggleVoiceButtonsShut : toggleListening}
            title={
              voiceButtonsShut
                ? "Voice is shut. Click to open/activate again."
                : supported
                ? "Click button to speak / toggle voice command portal"
                : "Web speech not supported in this browser"
            }
            className={`
              relative w-40 h-40 sm:w-48 sm:h-48 rounded-full border flex flex-col items-center justify-center transition-all duration-500 cursor-pointer select-none outline-none
              ${voiceButtonsShut
                ? "bg-[#0b0312] border-rose-900/30 hover:border-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.1)] hover:scale-101"
                : isListening 
                ? "bg-cyan-950/20 border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.25)] scale-102" 
                : "bg-[#020512] border-purple-500/30 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] hover:scale-101"}
            `}
          >
            {/* Inner orbit tracks */}
            <div className={`absolute inset-2 border border-dashed rounded-full pointer-events-none ${
              voiceButtonsShut 
                ? "border-rose-950/20" 
                : isListening 
                ? "border-cyan-400/50 animate-spin duration-15000" 
                : "border-purple-500/15 animate-spin duration-30000"
            }`} />
            <div className={`absolute inset-4 border rounded-full pointer-events-none ${
              voiceButtonsShut 
                ? "border-rose-950/10" 
                : isListening 
                ? "border-cyan-400/20" 
                : "border-purple-500/5"
            }`} />

            {/* Micro-glowing central core */}
            <div className={`
              w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-inner
              ${voiceButtonsShut
                ? "bg-gradient-to-br from-rose-950/30 via-rose-900/10 to-transparent"
                : isListening 
                ? "bg-gradient-to-br from-cyan-400/20 via-cyan-500/30 to-indigo-600/40" 
                : "bg-gradient-to-tr from-cyan-500/5 via-purple-600/15 to-indigo-500/20"}
            `}>
              {voiceButtonsShut ? (
                <MicOff className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500" />
              ) : isListening ? (
                <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400 animate-pulse" />
              ) : (
                <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300" />
              )}
            </div>

            {/* Orb interactive label */}
            <span className={`absolute bottom-4 text-[9px] font-mono tracking-widest font-bold uppercase pointer-events-none ${
              voiceButtonsShut ? "text-rose-500" : "text-gray-500"
            }`}>
              {voiceButtonsShut ? "VOICE SHUT" : isListening ? "LISTENING" : "CLICK TO TALK"}
            </span>
          </button>
        </div>

        {/* Dynamic Speech Wave animations */}
        {isListening && !voiceButtonsShut ? (
          <div className="flex items-center gap-1 h-6 justify-center">
            {[1.2, 2.7, 3.5, 1.8, 2.9, 3.8, 1.5, 2.2, 3.1, 1.1].map((delay, index) => (
              <div
                key={index}
                className="w-1 bg-gradient-to-t from-cyan-400 to-purple-400 rounded-full wave-bar animate-wave-bounce"
                style={{
                  height: "18px",
                  animationDelay: `${delay * 0.2}s`,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="h-6 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-mono">
            {voiceButtonsShut ? (
              <span className="flex items-center gap-1.5 leading-none text-rose-500/80">
                <MicOff className="w-3.5 h-3.5 text-rose-500" /> VOCAL CONTROLS ARE SHUT DOWN
              </span>
            ) : (
              <>
                <span className="flex items-center gap-1.5 leading-none">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SECURE OPERATIVE UNIT
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Zap className="text-cyan-400 w-3.5 h-3.5" /> ONLINE GATEWAY
                </span>
              </>
            )}
          </div>
        )}

        {/* Real-time floating speech transcription bubble */}
        {(transcript || isListening) && (
          <div className="bg-[#05091a]/95 border border-cyan-500/20 px-4 py-2 rounded-xl max-w-lg text-center shadow-lg transition duration-200">
            {transcript ? (
              <span className="text-xs font-mono text-cyan-300">
                &ldquo;{transcript}&rdquo;
              </span>
            ) : (
              <span className="text-xs font-mono text-gray-500 italic animate-pulse">
                System awaiting vocal sequence input...
              </span>
            )}
          </div>
        )}

        {/* Adaptive speech feedback helper */}
        <div className="text-center">
          <span className="text-xs text-slate-400 px-3 py-1 bg-[#060a1e] border border-gray-900 rounded-full font-sans tracking-wide">
            {statusMessage}
          </span>
        </div>
      </div>

      {/* Unified Text Input & Voice Commander Dispatch Box */}
      <div className="relative z-10 max-w-2xl mx-auto w-full space-y-3">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest block mb-2 px-2 text-center">
          UNIFIED DISPATCH GATEWAY &middot; TYPE OR SPEAK YOUR COMMAND
        </span>
        
        <form onSubmit={handleAskSubmit} className="flex p-1.5 bg-[#080d24] border border-gray-850 rounded-2xl focus-within:border-cyan-500/65 transition shadow-lg items-center">
          {/* Quick Vocal micro-trigger button */}
          {!voiceButtonsShut && (
            <button
              type="button"
              onClick={toggleListening}
              disabled={!supported}
              className={`
                p-2.5 rounded-xl flex items-center justify-center transition border select-none cursor-pointer flex-shrink-0
                ${!supported 
                  ? "bg-gray-900 text-gray-600 border-transparent cursor-not-allowed" 
                  : isListening 
                  ? "bg-cyan-500 text-gray-950 border-cyan-300 animate-pulse" 
                  : "bg-gray-950/40 border-gray-900 text-cyan-400 hover:text-white hover:border-cyan-500/30"}
              `}
              title="Toggle Voice Dictation"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <input
            type="text"
            value={askText}
            onChange={(e) => setAskText(e.target.value)}
            placeholder="E.g., Write a 3D personal website code, or click micro-phone to dictate..."
            className="flex-1 bg-transparent border-0 text-white placeholder-gray-550 focus:outline-none focus:ring-0 px-3 text-xs sm:text-sm focus:border-0"
            id="landing-ask-input"
          />
          
          <button
            type="submit"
            disabled={!askText.trim()}
            className={`
              p-3 rounded-xl flex items-center justify-center transition flex-shrink-0 select-none cursor-pointer
              ${!askText.trim()
                ? "bg-gray-900 text-gray-600 cursor-not-allowed"
                : "bg-cyan-500 text-gray-950 hover:bg-cyan-455 glow-cyan"}
            `}
            id="landing-submit-btn"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Handy Verbal / Command Hotkeys */}
        <div className="flex flex-wrap gap-2 justify-center pt-1.5">
          <span className="text-[10px] font-mono text-gray-550 tracking-wider uppercase flex items-center">Voice Shortcuts:</span>
          {[
            { label: "Show Dashboard", cmd: "open dashboard" },
            { label: "Check Core Agents", cmd: "show agents" },
            { label: "Retrieve Memory Bank", cmd: "show memory" },
            { label: "Templates Library", cmd: "show templates" },
          ].map((sc, scIdx) => (
            <button
              key={scIdx}
              type="button"
              onClick={() => {
                setAskText(sc.cmd);
                setStatusMessage(`Shortcut loaded: click Send or Mic.`);
              }}
              className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/15 border border-cyan-900/30 px-2 py-0.5 rounded hover:text-white hover:border-cyan-500/40 transition cursor-pointer"
            >
              &ldquo;{sc.cmd}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Recents Speech Dialog Log */}
      {recentCommands.length > 0 && (
        <div className="max-w-xl mx-auto w-full p-4 bg-[#050715]/60 rounded-2xl border border-gray-900/40 space-y-2.5 z-10 relative">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block font-bold">Recent Vocal Executions</span>
          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
            {recentCommands.slice(0, 3).map((cmd, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-mono text-slate-300 bg-[#090e24]/70 p-2 rounded-lg border border-gray-900/60 leading-none">
                <span className="truncate max-w-[80%] italic text-slate-400">&ldquo;{cmd}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => {
                    setAskText(cmd);
                    setStatusMessage(`Selected speech text to dispatch.`);
                  }}
                  className="text-[10px] text-cyan-400 hover:text-white transition uppercase font-sans font-semibold cursor-pointer"
                >
                  Reload
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 select-none max-w-4xl mx-auto w-full pt-2">
        {coreMetrics.map((met, i) => (
          <div key={i} className="glassmorphism p-4 rounded-xl border border-gray-905 text-center">
            <span className="text-[10px] font-mono text-gray-550 uppercase tracking-wider block font-semibold">{met.label}</span>
            <span className="text-lg sm:text-xl font-display font-bold text-white block mt-1 tracking-tight">{met.value}</span>
          </div>
        ))}
      </div>

      {/* Specialized Feature Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10 max-w-5xl mx-auto w-full pt-2">
        {valueFeatures.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <div 
              key={i} 
              className="p-4 bg-gradient-to-br from-[#070c1e] to-[#040715] rounded-xl border border-gray-900/80 hover:border-gray-800 transition flex flex-col gap-3 text-left"
            >
              <div className={`p-2 rounded-lg border max-w-fit ${feat.color}`}>
                <Icon className="w-4 font-bold h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-medium text-white text-sm">{feat.title}</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed font-sans">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
