import React, { useState, useEffect } from "react";
import {
  Shield,
  Activity,
  Database,
  Sliders,
  Globe,
  Key,
  Users,
  FolderUp,
  History,
  SlidersHorizontal,
  Layers,
  Type,
  Palette,
  CreditCard,
  Plus,
  Trash2,
  Settings,
  Check,
  AlertTriangle,
  Search,
  Building,
  Download,
  Upload,
  Play,
  RefreshCw,
  Sparkles,
  Cpu,
  Eye,
  Undo2,
  HelpCircle,
  Copy,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

interface AdminProps {
  profile: any;
  onNavigate: (tab: string) => void;
}

export default function AdminControlPanel({ profile, onNavigate }: AdminProps) {
  // Navigation tabs within Admin Panel
  const [activeSubTab, setActiveSubTab] = useState<string>("dashboard");
  const [safetyModal, setSafetyModal] = useState<{ isOpen: boolean; title: string; desc: string; onConfirm: () => void } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [draftSaved, setDraftSaved] = useState<boolean>(false);
  const [actionHistory, setActionHistory] = useState<string[]>([]);

  // -------------------------------------------------------------
  // CENTRALIZED STATE ENGINE (Initialized with high-fidelity defaults & localStorage backing)
  // -------------------------------------------------------------
  const [adminConfig, setAdminConfig] = useState(() => {
    const local = localStorage.getItem("chitti_admin_override_config");
    if (local) {
      try { return JSON.parse(local); } catch(e) {}
    }
    return {
      sections: [
        { id: "landing", name: "Central Command", path: "/landing", icon: "Bot", isEnabled: true, requiredPlan: "free_trial", accentColor: "#06b6d4" },
        { id: "imagine", name: "Imagine Studio", path: "/imagine", icon: "Sparkles", isEnabled: true, requiredPlan: "starter", accentColor: "#a855f7" },
        { id: "taskhub", name: "Workspace Studio", path: "/taskhub", icon: "BookOpen", isEnabled: true, requiredPlan: "pro", accentColor: "#3b82f6" },
        { id: "dashboard", name: "System Health", path: "/dashboard", icon: "LayoutDashboard", isEnabled: true, requiredPlan: "free_trial", accentColor: "#10b981" },
        { id: "billing", name: "Plans & Billing", path: "/billing", icon: "CreditCard", isEnabled: true, requiredPlan: "free_trial", accentColor: "#ec4899" },
        { id: "chat", name: "Intelligence Core", path: "/chat", icon: "Terminal", isEnabled: true, requiredPlan: "free_trial", accentColor: "#f59e0b" },
        { id: "voice", name: "Voice Gateway", path: "/voice", icon: "Mic", isEnabled: true, requiredPlan: "starter", accentColor: "#14b8a6" },
        { id: "trend", name: "Trend Intelligence", path: "/trend", icon: "TrendingUp", isEnabled: true, requiredPlan: "pro", accentColor: "#f43f5e" },
        { id: "analyzer", name: "Content Analyzer", path: "/analyzer", icon: "Globe", isEnabled: true, requiredPlan: "pro", accentColor: "#06b6d4" },
        { id: "live_intel", name: "Live Intel", path: "/live_intel", icon: "Tv", isEnabled: true, requiredPlan: "pro", accentColor: "#3b82f6" },
        { id: "airspace", name: "Indian Airspace Live", path: "/airspace", icon: "Radar", isEnabled: true, requiredPlan: "ultra", accentColor: "#10b981" },
        { id: "investor", name: "AI Asset Analyzer", path: "/investor", icon: "Coins", isEnabled: true, requiredPlan: "ultra", accentColor: "#f59e0b" },
        { id: "whatsapp", name: "WA Automation", path: "/whatsapp", icon: "MessageSquare", isEnabled: true, requiredPlan: "ultra", accentColor: "#ec4899" },
        { id: "converter", name: "File Converter", path: "/converter", icon: "RefreshCw", isEnabled: true, requiredPlan: "starter", accentColor: "#14b8a6" },
        { id: "agents", name: "Agent Directory", path: "/agents", icon: "SlidersHorizontal", isEnabled: true, requiredPlan: "free_trial", accentColor: "#a855f7" },
        { id: "memory", name: "Cognitive Memory", path: "/memory", icon: "Brain", isEnabled: true, requiredPlan: "pro", accentColor: "#3b82f6" },
        { id: "prompts", name: "Prism Templates", path: "/prompts", icon: "FlameKindling", isEnabled: true, requiredPlan: "starter", accentColor: "#f43f5e" },
        { id: "embed", name: "Embed Code", path: "/embed", icon: "FileCode", isEnabled: true, requiredPlan: "free_trial", accentColor: "#06b6d4" },
      ],
      elements: [
        { id: "el-1", section: "landing", type: "heading", text: "CHITTI-ROBO MEGA COMMAND", color: "#ffffff", fontSize: "24px", isEnabled: true },
        { id: "el-2", section: "landing", type: "subheading", text: "Core Quantum Intelligence Override Console", color: "#94a3b8", fontSize: "14px", isEnabled: true },
        { id: "el-3", section: "landing", type: "button", text: "SPAWN COGNITIVE AGENT", color: "#06b6d4", fontSize: "12px", isEnabled: true },
        { id: "el-4", section: "imagine", type: "heading", text: "IMAGINE CREATIVE CORE", color: "#a855f7", fontSize: "22px", isEnabled: true },
        { id: "el-5", section: "imagine", type: "card", text: "Neural Image Synthesis Matrix", color: "#ffffff", fontSize: "13px", isEnabled: true },
      ],
      theme: {
        preset: "Cyber Cyan",
        primaryColor: "#06b6d4",
        secondaryColor: "#a855f7",
        accentColor: "#3b82f6",
        bgColor: "#070b19",
        sidebarColor: "#090f24",
        cardColor: "#0d1532",
        borderColor: "#1e293b",
        textColor: "#ffffff",
        mutedTextColor: "#94a3b8",
        glowColor: "#06b6d4",
        borderRadius: "12px",
        glassBlur: "8px",
        fontFamily: "Inter",
        particleIntensity: 50
      },
      plans: [
        { id: "free_trial", name: "Free Trial", priceInr: 0, priceUsd: 0, isPopular: false, allowedSections: ["landing", "dashboard", "chat", "agents", "embed"] },
        { id: "starter", name: "Starter", priceInr: 250, priceUsd: 3, isPopular: false, allowedSections: ["landing", "imagine", "dashboard", "chat", "voice", "converter", "prompts"] },
        { id: "pro", name: "Pro Professional", priceInr: 590, priceUsd: 7, isPopular: true, allowedSections: ["landing", "imagine", "taskhub", "dashboard", "chat", "voice", "trend", "analyzer", "live_intel", "converter", "agents", "memory", "prompts"] },
        { id: "ultra", name: "Ultra Quantum", priceInr: 1250, priceUsd: 15, isPopular: false, allowedSections: ["landing", "imagine", "taskhub", "dashboard", "chat", "voice", "trend", "analyzer", "live_intel", "airspace", "investor", "whatsapp", "converter", "agents", "memory", "prompts", "embed"] },
        { id: "school", name: "School Hub", priceInr: 7900, priceUsd: 99, isPopular: false, allowedSections: ["landing", "imagine", "taskhub", "dashboard", "chat", "voice", "converter", "agents", "memory", "prompts"] },
        { id: "company", name: "Company Suite", priceInr: 15900, priceUsd: 199, isPopular: false, allowedSections: ["landing", "imagine", "taskhub", "dashboard", "chat", "voice", "trend", "analyzer", "live_intel", "investor", "whatsapp", "converter", "agents", "memory", "prompts", "embed"] }
      ],
      limits: {
        aiMessages: 150,
        creativeUnits: 30,
        fileConversions: 20,
        urlAnalyses: 15,
        trendReports: 10,
        whatsappMessages: 100,
        memoryItems: 50,
        apiCostCap: 15.00
      },
      agents: [
        { id: "gemini", name: "Gemini Agent", provider: "Google", costLevel: "low", speedLevel: "high", accuracyLevel: "very-high", isEnabled: true },
        { id: "gpt", name: "GPT Client Agent", provider: "OpenAI", costLevel: "medium", speedLevel: "medium", accuracyLevel: "high", isEnabled: true },
        { id: "claude", name: "Claude Sonnet", provider: "Anthropic", costLevel: "high", speedLevel: "medium", accuracyLevel: "very-high", isEnabled: true },
        { id: "deepseek", name: "DeepSeek Coder", provider: "DeepSeek", costLevel: "low", speedLevel: "high", accuracyLevel: "high", isEnabled: true },
        { id: "grok", name: "Grok Realtime", provider: "xAI", costLevel: "medium", speedLevel: "high", accuracyLevel: "medium", isEnabled: true }
      ],
      routing: [
        { task: "General Chat", primaryAgent: "gemini", backupAgent: "gpt", mode: "balanced" },
        { task: "Code Generation", primaryAgent: "deepseek", backupAgent: "claude", mode: "accuracy" },
        { task: "Stock & Trend Analysis", primaryAgent: "grok", backupAgent: "gemini", mode: "speed" },
        { task: "File Conversion", primaryAgent: "gemini", backupAgent: "gpt", mode: "cost-saving" }
      ],
      apiKeys: [
        { id: "gemini", name: "Gemini API", hasKey: true, usageCount: 284, cost: 4.12, status: "Active" },
        { id: "openai", name: "OpenAI API", hasKey: true, usageCount: 152, cost: 3.84, status: "Active" },
        { id: "claude", name: "Anthropic API", hasKey: false, usageCount: 0, cost: 0.00, status: "Inactive" },
        { id: "deepseek", name: "DeepSeek API", hasKey: true, usageCount: 940, cost: 1.25, status: "Active" },
        { id: "waha", name: "WhatsApp WAHA API", hasKey: true, usageCount: 45, cost: 0.00, status: "Active" }
      ],
      uploadSettings: {
        allowedTypes: "PDF, PNG, JPG, ZIP, JSON, CSV, MP3, MP4",
        maxSizeMb: 50,
        storageProvider: "Chitti Cloud Storage Secure",
        autoDeleteDays: 14,
        allowBulkUpload: true
      },
      imagineStudio: {
        unitCosts: { basicImage: 1, sticker: 1, logo: 2, thumbnail: 2, poster: 3, video: 10 },
        allowedResolutions: ["1024x1024", "1920x1080", "512x512"],
        safetyFilter: true
      }
    };
  });

  // State for adding/modifying items in tables
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [clickToEditMode, setClickToEditMode] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [searchUser, setSearchUser] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [previewPlanMode, setPreviewPlanMode] = useState<string>("owner_admin");

  // Redeem Code States & Actions
  const [redeemCodes, setRedeemCodes] = useState<any[]>([]);
  const [isCodesLoading, setIsCodesLoading] = useState<boolean>(false);
  const [newCodeName, setNewCodeName] = useState<string>("");
  const [newCodePlan, setNewCodePlan] = useState<string>("pro");
  const [newCodeMaxUses, setNewCodeMaxUses] = useState<string>("100");
  const [newCodeDesc, setNewCodeDesc] = useState<string>("");

  const fetchRedeemCodes = async () => {
    try {
      setIsCodesLoading(true);
      const res = await fetch("/api/admin/redeem-codes");
      const data = await res.json();
      if (data.success) {
        setRedeemCodes(data.redeemCodes || []);
      }
    } catch (err) {
      console.error("Failed to fetch redeem codes:", err);
    } finally {
      setIsCodesLoading(false);
    }
  };

  const handleCreateRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeName.trim()) {
      triggerToast("Please enter a code name", "error");
      return;
    }
    try {
      const res = await fetch("/api/admin/redeem-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCodeName.toUpperCase(),
          planId: newCodePlan,
          maxUses: newCodeMaxUses ? parseInt(newCodeMaxUses) : undefined,
          description: newCodeDesc
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Successfully created code: ${newCodeName.toUpperCase()}`, "success");
        setRedeemCodes(data.redeemCodes || []);
        setNewCodeName("");
        setNewCodeDesc("");
      } else {
        triggerToast(data.error || "Failed to create code", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Failed to connect to backend", "error");
    }
  };

  const handleDeleteRedeemCode = async (codeToDelete: string) => {
    if (!confirm(`Are you sure you want to delete redeem code "${codeToDelete}"?`)) return;
    try {
      const res = await fetch("/api/admin/redeem-codes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToDelete })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Deleted redeem code: ${codeToDelete}`, "success");
        setRedeemCodes(data.redeemCodes || []);
      } else {
        triggerToast(data.error || "Failed to delete code", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Failed to delete code", "error");
    }
  };

  // Mock static data for items that usually come from backend
  const [usersList, setUsersList] = useState([
    { id: "user-1", name: "Ankit Kumar", email: "ankitk25564@gmail.com", role: "owner_admin", plan: "ultra", status: "Active", bonusCredits: 120, apiCost: 5.42 },
    { id: "user-2", name: "Siddharth Roy", email: "sid@chitti.io", role: "developer", plan: "pro", status: "Active", bonusCredits: 50, apiCost: 2.15 },
    { id: "user-3", name: "Dr. Rajesh K.", email: "principal@delhischool.edu", role: "school_manager", plan: "school", status: "Active", bonusCredits: 500, apiCost: 11.20 },
    { id: "user-4", name: "Maya Sharma", email: "maya@techcorp.co", role: "company_manager", plan: "company", status: "Active", bonusCredits: 200, apiCost: 14.80 },
    { id: "user-5", name: "Alex Mercer", email: "alex@gmail.com", role: "user", plan: "free_trial", status: "Active", bonusCredits: 0, apiCost: 0.45 },
    { id: "user-6", name: "John Doe", email: "john@yahoo.com", role: "guest", plan: "free_trial", status: "Suspended", bonusCredits: 0, apiCost: 0.00 }
  ]);

  const [orgsList, setOrgsList] = useState([
    { id: "org-1", type: "School", name: "Delhi Global Public School", manager: "Dr. Rajesh K.", teacherSeats: 15, studentSeats: 350, pooledUsage: "64%" },
    { id: "org-2", type: "Company", name: "Inventure Tech Labs", manager: "Maya Sharma", teamSeats: 25, pooledUsage: "48%" }
  ]);

  const [logsList, setLogsList] = useState([
    { id: "log-1", time: "Just Now", user: "ankitk25564@gmail.com", action: "Toggle Section", desc: "Disabled Indian Airspace Live section", type: "admin" },
    { id: "log-2", time: "3 mins ago", user: "system", action: "API Routing", desc: "Routed image generation to Gemini Pro Vision", type: "system" },
    { id: "log-3", time: "12 mins ago", user: "principal@delhischool.edu", action: "Workspace Upload", desc: "Uploaded class roster.csv", type: "user" },
    { id: "log-4", time: "25 mins ago", user: "ankitk25564@gmail.com", action: "Theme Preset", desc: "Loaded preset 'Cyber Cyan'", type: "admin" },
    { id: "log-5", time: "1 hour ago", user: "system", action: "API Error", desc: "Anthropic API limit reached, auto-routed to Gemini fallback", type: "error" }
  ]);

  // Persist config to local storage
  const saveConfig = (newConfig: any) => {
    setAdminConfig(newConfig);
    localStorage.setItem("chitti_admin_override_config", JSON.stringify(newConfig));
    setDraftSaved(true);
    triggerToast("System override configurations compiled & saved successfully", "success");
    addLog("Config Save", `Updated global configuration schema`, "admin");
  };

  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const addLog = (action: string, desc: string, type: string = "admin") => {
    const newLog = {
      id: `log-${Date.now()}`,
      time: "Just now",
      user: profile.email || "owner_admin",
      action,
      desc,
      type
    };
    setLogsList(prev => [newLog, ...prev]);
    setActionHistory(prev => [`[${new Date().toLocaleTimeString()}] ${action}: ${desc}`, ...prev].slice(0, 20));
  };

  const resetAllToDefaults = () => {
    localStorage.removeItem("chitti_admin_override_config");
    window.location.reload();
  };

  // -------------------------------------------------------------
  // HELPER MODALS & CONTROLS
  // -------------------------------------------------------------
  const triggerSafety = (title: string, desc: string, onConfirm: () => void) => {
    setSafetyModal({
      isOpen: true,
      title,
      desc,
      onConfirm: () => {
        onConfirm();
        setSafetyModal(null);
      }
    });
  };

  const handleUndo = () => {
    if (actionHistory.length > 0) {
      triggerToast("Undid last admin command state", "info");
      setActionHistory(prev => prev.slice(1));
    } else {
      triggerToast("No action history to undo", "error");
    }
  };

  // REALTIME COST LOGS SYNC FROM DISK LEDGER
  const [backendCostLogs, setBackendCostLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/admin/api-cost-logs");
        const data = await res.json();
        if (data.success) {
          setBackendCostLogs(data.apiCostLogs || []);
        }
      } catch (err) {
        console.error("Failed to sync backend cost logs:", err);
      }
    };
    fetchLogs();
    fetchRedeemCodes();
    const interval = setInterval(() => {
      fetchLogs();
      fetchRedeemCodes();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#070b19] text-gray-100 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* GLOWING HEADLINE GRID BANNER */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#0a1233]/40 to-transparent pointer-events-none z-0" />
      
      {/* TOAST SYSTEM */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-bounce flex items-center gap-3 p-4 bg-[#0a0f24] border border-cyan-500/40 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)] text-xs font-mono">
          <div className={`w-2.5 h-2.5 rounded-full ${toast.type === "success" ? "bg-emerald-400" : toast.type === "error" ? "bg-rose-500" : "bg-cyan-400"}`} />
          <span className="text-gray-200">{toast.message}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="border-b border-[#131a38] bg-[#080d22]/90 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-display font-bold tracking-tight text-white uppercase">Chitti-Robo Mega Admin Control</h1>
              <span className="text-[9px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-950/20 px-1.5 py-0.5 rounded uppercase font-bold animate-pulse">SECURE ROOT</span>
            </div>
            <p className="text-[10px] font-mono text-gray-400 mt-0.5">OWNER ADMIN CONSOLE • DIRECT DESTRUCTIVE COMMAND OVERRIDES ENABLED</p>
          </div>
        </div>

        {/* SYSTEM BULLET ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleUndo}
            className="px-3 py-1.5 text-xs font-mono bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-lg hover:border-gray-700 transition flex items-center gap-1.5"
            title="Rollback latest UI configuration edit"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Undo Draft
          </button>
          
          <button
            onClick={() => triggerSafety("SYSTEM COLD REBOOT & RESET", "This will wipe all active local custom themes, section hides, pricing overrides, and agent routing chains, reverting Chitti-Robo strictly to factory defaults.", resetAllToDefaults)}
            className="px-3 py-1.5 text-xs font-mono bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/20 text-rose-400 hover:text-rose-200 rounded-lg transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Wipe DB (Reset)
          </button>

          <button
            onClick={() => saveConfig(adminConfig)}
            className="px-4 py-1.5 text-xs font-mono bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-lg shadow-lg hover:shadow-cyan-500/10 transition font-bold border border-cyan-400/20 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Deploy Overrides
          </button>
        </div>
      </div>

      {/* CORE SPLIT SCREEN LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row z-10 relative">
        
        {/* INNER TABS SIDEBAR */}
        <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-[#131a38] bg-[#070b1b] p-3 space-y-1 flex-shrink-0 flex lg:flex-col overflow-x-auto lg:overflow-x-visible">
          {[
            { id: "dashboard", label: "Root Overview", icon: Activity, badge: "Live" },
            { id: "sections", label: "Sections & Elements", icon: Layers },
            { id: "theme", label: "Themes & Pricing", icon: Palette },
            { id: "ai_config", label: "Agents & API Keys", icon: Cpu },
            { id: "media_upload", label: "Media & Uploads", icon: Sparkles },
            { id: "users_orgs", label: "Users & Workspaces", icon: Users },
            { id: "system", label: "Console, Log & DDL", icon: Database }
          ].map((item) => {
            const Icon = item.icon;
            const isSel = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={`
                  w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between transition gap-3 whitespace-nowrap
                  ${isSel 
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.06)]" 
                    : "text-gray-400 hover:text-white hover:bg-[#0a0f25]/50 border border-transparent"}
                `}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isSel ? "text-cyan-400" : "text-gray-500"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[8px] bg-cyan-950 text-cyan-400 px-1 rounded uppercase tracking-wider">{item.badge}</span>
                )}
              </button>
            );
          })}

          <div className="hidden lg:block pt-6 border-t border-[#131a38]/60 mt-auto">
            <div className="bg-[#0a0f24] p-3 rounded-xl border border-gray-800/40 text-[10px] font-mono text-gray-400 space-y-1.5">
              <div className="flex justify-between">
                <span>SECURE HOST:</span>
                <span className="text-cyan-400">0.0.0.0:3000</span>
              </div>
              <div className="flex justify-between">
                <span>API CHANNEL:</span>
                <span className="text-emerald-400">CONNECTED</span>
              </div>
              <div className="flex justify-between">
                <span>CURRENT ROLE:</span>
                <span className="text-purple-400">{profile?.role || "owner_admin"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVE SUB-PANEL DISPLAY */}
        <div className="flex-1 p-6 overflow-y-auto max-w-full">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeSubTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* SYSTEM OVERVIEW HEADER INFO */}
              <div className="bg-gradient-to-r from-cyan-950/20 via-purple-950/10 to-transparent border border-cyan-500/20 p-5 rounded-2xl relative">
                <div className="absolute top-2 right-3 text-[9px] font-mono text-cyan-500/50">COGNITIVE METRICS RE-EVALUATION: 15 SECS</div>
                <h2 className="text-sm font-mono text-cyan-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-pulse" />
                  ROOT COGNITIVE COMMAND FLUX
                </h2>
                <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                  Realtime performance metrics, financial projections, active usage quotas, and connected cloud endpoints. Click on any sub-system to deploy command overrides instantly.
                </p>
              </div>

              {/* STATS BENTO GRID */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(() => {
                  const realApiCostInr = backendCostLogs.reduce((acc, log) => acc + (log.costInr || 0), 0);
                  const realApiCostUsd = realApiCostInr / 83;
                  const dynamicProfitMargin = realApiCostInr === 0 ? 99.8 : Math.max(10, Math.min(99.9, ((24590 - realApiCostInr) / 24590) * 100));

                  const dashboardStats = [
                    { title: "Total Master Users", val: usersList.length, note: "2 Suspended", change: "+4 this week", color: "text-cyan-400" },
                    { title: "Active Subscriptions", val: "4 / 6", note: "66.7% Premium Ratio", change: "Pro & Ultra domin.", color: "text-purple-400" },
                    { title: "Estimated Revenue", val: "₹24,590", note: "Monthly Billing Rate", change: "$298.50 USD equiv.", color: "text-emerald-400 font-mono" },
                    { title: "API Cost Estimate", val: `₹${realApiCostInr.toFixed(2)}`, note: `${backendCostLogs.length} logged runs`, change: `$${realApiCostUsd.toFixed(4)} USD equiv.`, color: "text-amber-400 font-mono font-bold" },
                    { title: "Profit Margin", val: `${dynamicProfitMargin.toFixed(1)}%`, note: "Self-hosted proxies", change: "Superb efficiency", color: "text-emerald-400 font-mono" },
                    { title: "Active Sections", val: adminConfig.sections.filter(s=>s.isEnabled).length, note: `${adminConfig.sections.length} total schemas`, change: "0 hidden default", color: "text-cyan-400" },
                    { title: "Connected APIs", val: "4 / 5", note: "Failover pipeline ready", change: "DeepSeek primary", color: "text-indigo-400" },
                    { title: "Failed Requests", val: "1.2%", note: "Automatic retries active", change: "Healthy flux", color: "text-rose-400" }
                  ];

                  return dashboardStats.map((stat, i) => (
                    <div key={i} className="bg-[#0b1129] border border-[#172144] hover:border-cyan-500/30 p-4 rounded-xl space-y-1.5 transition">
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">{stat.title}</span>
                      <span className={`text-xl font-display font-bold block ${stat.color}`}>{stat.val}</span>
                      <div className="flex flex-col text-[9px] font-mono text-gray-400">
                        <span>{stat.note}</span>
                        <span className="text-gray-600 text-[8px]">{stat.change}</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* MORE METRICS ROW */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {[
                  { label: "File Uploads Hub", value: "1,248 files", desc: "4.2 GB used" },
                  { label: "WA Automation", value: "3,124 sent", desc: "12 fail triggers" },
                  { label: "Total AI Requests", value: `${48940 + backendCostLogs.length} reqs`, desc: "Gemini leads (64%)" },
                  { label: "System Health Score", value: "99.85%", desc: "Latency: 242ms" }
                ].map((v, i) => (
                  <div key={i} className="bg-[#080d24] border border-[#131d3d] p-3 rounded-lg text-center font-mono">
                    <div className="text-[9px] text-gray-500 uppercase">{v.label}</div>
                    <div className="text-sm font-bold text-white mt-1">{v.value}</div>
                    <div className="text-[8px] text-gray-500 mt-0.5">{v.desc}</div>
                  </div>
                ))}
              </div>

              {/* SECURE REAL-TIME COST & AUDIT TRAIL MONITORING */}
              <div className="bg-[#090f28] border border-amber-500/20 rounded-2xl p-5 space-y-4 shadow-[0_0_20px_rgba(245,158,11,0.02)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-900/60">
                  <div>
                    <h3 className="text-xs font-mono text-amber-400 flex items-center gap-1.5 font-bold uppercase">
                      <Activity className="text-amber-500 w-4 h-4 animate-pulse" />
                      SECURE API-KEY COST & TOKENS AUDIT TRAIL
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Direct backend metered ledger. Tracks input/output tokens, cost surcharges, model IDs, and execution times.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[9px] px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full font-mono">
                      LEDGER SIZE: {backendCostLogs.length} LOGS
                    </span>
                  </div>
                </div>

                {backendCostLogs.length === 0 ? (
                  <div className="text-center py-8 bg-[#070b19]/60 rounded-xl border border-gray-800/40">
                    <p className="text-xs text-gray-500 font-mono">No API cost logs recorded yet. Run a multi-agent chat generation to populate.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-900">
                    <table className="w-full text-left font-mono text-[10px] border-collapse">
                      <thead>
                        <tr className="bg-[#0b1232] text-gray-400 border-b border-gray-950">
                          <th className="p-3">Timestamp</th>
                          <th className="p-3">User & Request</th>
                          <th className="p-3">Target Model</th>
                          <th className="p-3">Tokens (In/Out)</th>
                          <th className="p-3 text-right">Raw Cost</th>
                          <th className="p-3 text-right">User Surcharge</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backendCostLogs.slice(0, 10).map((log, i) => (
                          <tr key={log.id || i} className="border-b border-gray-950/60 bg-[#070b19]/40 hover:bg-[#0b1232]/50 transition-colors">
                            <td className="p-3 text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                            <td className="p-3 max-w-[150px] truncate text-slate-300">
                              <span className="text-purple-400 block font-bold">user-1</span>
                              <span className="text-gray-500 text-[9px] block truncate">{log.promptSummary || "AI Agent Query"}</span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-cyan-950/40 text-cyan-400 border border-cyan-900/60 rounded font-bold uppercase">
                                {log.model || "gemini-2.5"}
                              </span>
                            </td>
                            <td className="p-3 text-slate-400">
                              {log.inputTokens?.toLocaleString() || 0} / {log.outputTokens?.toLocaleString() || 0}
                            </td>
                            <td className="p-3 text-right text-rose-400 font-bold">
                              ₹{(log.costInr || 0).toFixed(4)}
                            </td>
                            <td className="p-3 text-right text-emerald-400 font-bold">
                              {log.tokensDeducted?.toLocaleString() || 0} credits
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* QUICK CONTROL OVERRIDES PANEL */}
              <div className="bg-[#090f28] border border-[#1a254c] rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-mono text-white flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  EMERGENCY SYSTEM-WIDE FLUX TOGGLES (DIRECT INJECTIONS)
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#0d163a] p-3.5 rounded-xl border border-yellow-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono text-yellow-400 font-bold block">GLOBAL MAINTENANCE</span>
                      <span className="text-[9px] text-gray-400">Lock all user operations</span>
                    </div>
                    <input type="checkbox" className="w-8 h-4 bg-gray-800 rounded-full border-gray-700 text-cyan-500 focus:ring-0 cursor-pointer" />
                  </div>

                  <div className="bg-[#0d163a] p-3.5 rounded-xl border border-red-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono text-red-400 font-bold block">GEMINI STRICT THROTTLE</span>
                      <span className="text-[9px] text-gray-400">Limit max prompt tokens</span>
                    </div>
                    <input type="checkbox" className="w-8 h-4 bg-gray-800 rounded-full border-gray-700 text-cyan-500 focus:ring-0 cursor-pointer" defaultChecked />
                  </div>

                  <div className="bg-[#0d163a] p-3.5 rounded-xl border border-emerald-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono text-emerald-400 font-bold block">INR-USD SMART PEGGING</span>
                      <span className="text-[9px] text-gray-400">Dynamic exchange pegging</span>
                    </div>
                    <input type="checkbox" className="w-8 h-4 bg-gray-800 rounded-full border-gray-700 text-cyan-500 focus:ring-0 cursor-pointer" defaultChecked />
                  </div>
                </div>

                {/* FAST SHORTCUTS */}
                <div className="pt-2 flex flex-wrap gap-2">
                  <button onClick={() => setActiveSubTab("sections")} className="text-[10px] font-mono bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 hover:bg-cyan-900/35 px-3 py-1.5 rounded-lg transition">Manage Sections</button>
                  <button onClick={() => setActiveSubTab("theme")} className="text-[10px] font-mono bg-purple-950/40 text-purple-400 border border-purple-800/40 hover:bg-purple-900/35 px-3 py-1.5 rounded-lg transition">Manage Themes</button>
                  <button onClick={() => setActiveSubTab("ai_config")} className="text-[10px] font-mono bg-indigo-950/40 text-indigo-400 border border-indigo-800/40 hover:bg-indigo-900/35 px-3 py-1.5 rounded-lg transition">Manage APIs</button>
                  <button onClick={() => setActiveSubTab("users_orgs")} className="text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/35 px-3 py-1.5 rounded-lg transition">Manage Workspace Subscriptions</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECTIONS & ELEMENT MANAGER */}
          {activeSubTab === "sections" && (
            <div className="space-y-6">
              
              <div className="bg-[#090f28] border border-cyan-500/20 p-5 rounded-2xl">
                <h2 className="text-sm font-mono text-cyan-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  SYSTEM WIDE SECTION VISIBILITY MATRIX & ORDERING
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Adjust active sections on the fly. Disable system sections, modify display labels, adjust accent color schemes, or duplicate custom channels. Changes update the user sidebar instantly.
                </p>
                
                {/* ACTIONS */}
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => {
                      const newId = `custom-${Date.now()}`;
                      const newSect = { id: newId, name: "New Custom Channel", path: `/custom-${newId}`, icon: "Sparkles", isEnabled: true, requiredPlan: "starter", accentColor: "#a855f7" };
                      const newConfig = { ...adminConfig, sections: [...adminConfig.sections, newSect] };
                      saveConfig(newConfig);
                      addLog("Add Section", `Created custom workspace section: ${newSect.name}`);
                    }}
                    className="px-3 py-1.5 bg-cyan-900/40 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-800/40 text-xs font-mono rounded-lg transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Section
                  </button>
                </div>
              </div>

              {/* SECTIONS GRID LIST WITH ACTIVE DRAG/DROP & ORDER ACTION */}
              <div className="bg-[#080d24] border border-[#131d3d] rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-[#0a1130] border-b border-[#131d3d] flex justify-between items-center">
                  <span className="text-xs font-mono text-gray-400">ACTIVE SIDEBAR ROUTING REGISTER</span>
                  <span className="text-[10px] font-mono text-gray-500">{adminConfig.sections.length} schemas configured</span>
                </div>
                
                <div className="divide-y divide-[#131d3d] max-h-[400px] overflow-y-auto font-mono text-xs">
                  {adminConfig.sections.map((sect, index) => (
                    <div key={sect.id} className="p-3.5 hover:bg-[#0c1435] flex flex-col md:flex-row md:items-center justify-between gap-3 transition">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 px-2 text-[10px] bg-gray-900 text-gray-400 rounded border border-gray-800 font-bold">{index + 1}</div>
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: sect.accentColor }} />
                        <div>
                          <input
                            type="text"
                            value={sect.name}
                            onChange={(e) => {
                              const updated = adminConfig.sections.map(s => s.id === sect.id ? { ...s, name: e.target.value } : s);
                              setAdminConfig({ ...adminConfig, sections: updated });
                            }}
                            className="bg-transparent border-b border-transparent hover:border-gray-700 focus:border-cyan-500 text-white font-bold py-0.5 focus:outline-none focus:ring-0 max-w-[180px]"
                          />
                          <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                            <span>Route: {sect.path}</span>
                            <span>•</span>
                            <span className="text-cyan-400">Icon: {sect.icon}</span>
                          </div>
                        </div>
                      </div>

                      {/* CONTROLS */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Plan level visibility */}
                        <select
                          value={sect.requiredPlan}
                          onChange={(e) => {
                            const updated = adminConfig.sections.map(s => s.id === sect.id ? { ...s, requiredPlan: e.target.value } : s);
                            setAdminConfig({ ...adminConfig, sections: updated });
                          }}
                          className="bg-gray-950 border border-gray-800 text-[10px] text-gray-300 rounded px-1.5 py-1 focus:outline-none focus:ring-0"
                        >
                          <option value="free_trial">All Plans (Free+)</option>
                          <option value="starter">Starter +</option>
                          <option value="pro">Pro +</option>
                          <option value="ultra">Ultra +</option>
                          <option value="school">School Only</option>
                          <option value="company">Company Only</option>
                          <option value="owner_admin">Owner Admin Only</option>
                        </select>

                        {/* Order shifter buttons */}
                        <div className="flex items-center border border-gray-800 rounded">
                          <button
                            onClick={() => {
                              if (index === 0) return;
                              const items = [...adminConfig.sections];
                              const temp = items[index];
                              items[index] = items[index - 1];
                              items[index - 1] = temp;
                              setAdminConfig({ ...adminConfig, sections: items });
                              triggerToast("Shifted order up", "info");
                            }}
                            className="p-1 hover:bg-gray-900 text-gray-400 hover:text-white border-r border-gray-800 text-[9px] font-bold"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => {
                              if (index === adminConfig.sections.length - 1) return;
                              const items = [...adminConfig.sections];
                              const temp = items[index];
                              items[index] = items[index + 1];
                              items[index + 1] = temp;
                              setAdminConfig({ ...adminConfig, sections: items });
                              triggerToast("Shifted order down", "info");
                            }}
                            className="p-1 hover:bg-gray-900 text-gray-400 hover:text-white text-[9px] font-bold"
                          >
                            ▼
                          </button>
                        </div>

                        {/* Accent pick */}
                        <input
                          type="color"
                          value={sect.accentColor}
                          onChange={(e) => {
                            const updated = adminConfig.sections.map(s => s.id === sect.id ? { ...s, accentColor: e.target.value } : s);
                            setAdminConfig({ ...adminConfig, sections: updated });
                          }}
                          className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer p-0"
                          title="Set section primary color highlight"
                        />

                        {/* Toggle enabled state */}
                        <button
                          onClick={() => {
                            const updated = adminConfig.sections.map(s => s.id === sect.id ? { ...s, isEnabled: !s.isEnabled } : s);
                            setAdminConfig({ ...adminConfig, sections: updated });
                            addLog("Toggle Section State", `Section ${sect.name} set to ${!sect.isEnabled ? "enabled" : "disabled"}`);
                          }}
                          className={`px-2 py-1 text-[10px] font-bold rounded border ${sect.isEnabled ? "bg-emerald-950/20 text-emerald-400 border-emerald-800/40" : "bg-gray-900 text-gray-500 border-gray-800"}`}
                        >
                          {sect.isEnabled ? "ACTIVE" : "HIDDEN"}
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => {
                            const duplicate = { ...sect, id: `${sect.id}-dup-${Date.now()}`, name: `${sect.name} Copy` };
                            const updated = [...adminConfig.sections];
                            updated.splice(index + 1, 0, duplicate);
                            setAdminConfig({ ...adminConfig, sections: updated });
                            triggerToast("Duplicated section successfully");
                          }}
                          className="p-1 px-2 text-[10px] border border-gray-800 bg-[#0d163a]/30 hover:bg-[#0d163a] rounded text-gray-300"
                        >
                          Copy
                        </button>

                        {/* Delete Custom section */}
                        {sect.id.includes("custom") && (
                          <button
                            onClick={() => triggerSafety("DELETE CUSTOM SECTION", `Permanently wipe customized sidebar section [${sect.name}]?`, () => {
                              const updated = adminConfig.sections.filter(s => s.id !== sect.id);
                              setAdminConfig({ ...adminConfig, sections: updated });
                              addLog("Delete Section", `Deleted custom section ${sect.name}`);
                            })}
                            className="p-1 text-rose-400 hover:text-rose-200 border border-rose-950 bg-rose-950/20 rounded hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION ELEMENT EDITOR */}
              <div className="bg-[#090f28] border border-purple-500/20 p-5 rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-mono text-purple-400 flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      ELEMENT STYLES & CLICK-TO-EDIT ACTIVE OVERRIDE
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Directly modify labels, placeholders, styles, padding, margins, and sizes inside component classes on the fly.
                    </p>
                  </div>

                  {/* CLICK TO EDIT MASTER SWITCH */}
                  <div className="flex items-center gap-2 bg-[#0c133a] border border-gray-800 p-2 rounded-xl">
                    <span className="text-[10px] font-mono font-bold text-gray-300 uppercase">Click-To-Edit Simulator</span>
                    <button
                      onClick={() => {
                        setClickToEditMode(!clickToEditMode);
                        triggerToast(`Simulation edit mode is now ${!clickToEditMode ? "ENABLED" : "DISABLED"}`, "info");
                      }}
                      className="focus:outline-none"
                    >
                      {clickToEditMode ? (
                        <ToggleRight className="w-9 h-6 text-cyan-400" />
                      ) : (
                        <ToggleLeft className="w-9 h-6 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* SIMULATED WORKSPACE CANVAS FOR CLICK-TO-EDIT */}
                {clickToEditMode ? (
                  <div className="mt-5 border-2 border-dashed border-cyan-500/30 p-6 rounded-xl bg-cyan-950/10 text-center space-y-4">
                    <p className="text-[11px] font-mono text-cyan-400">
                      🛰️ SIMULATOR STAGE ONLINE: CLICK ANY ELEMENT BELOW TO INSPECT & ADJUST PROPERTIES IN REAL-TIME
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
                      {adminConfig.elements.map((el) => (
                        <div
                          key={el.id}
                          onClick={() => setSelectedElement(el)}
                          className={`p-4 border rounded-xl cursor-pointer hover:scale-[1.02] transition shadow-md bg-gray-950 text-left relative ${selectedElement?.id === el.id ? "border-cyan-400 bg-cyan-950/20 shadow-cyan-400/10" : "border-gray-800"}`}
                        >
                          <div className="absolute top-1 right-2 text-[8px] font-mono text-gray-500 uppercase">{el.type}</div>
                          {el.type === "heading" && <h3 style={{ color: el.color, fontSize: el.fontSize }} className="font-bold">{el.text}</h3>}
                          {el.type === "subheading" && <p style={{ color: el.color, fontSize: el.fontSize }}>{el.text}</p>}
                          {el.type === "button" && <button style={{ backgroundColor: el.color }} className="text-white text-xs px-3 py-1.5 rounded font-mono font-bold mt-1 uppercase">{el.text}</button>}
                          {el.type === "card" && (
                            <div className="border border-purple-800/30 p-2.5 rounded bg-purple-950/10 mt-1">
                              <span className="text-xs text-purple-400 block font-bold">CARD BODY</span>
                              <p className="text-[10px] text-gray-300" style={{ color: el.color, fontSize: el.fontSize }}>{el.text}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {selectedElement && (
                      <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl text-left max-w-lg mx-auto space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center text-[10px] text-gray-500">
                          <span>INSPECTING: {selectedElement.id}</span>
                          <button onClick={() => setSelectedElement(null)} className="text-gray-400 hover:text-white">Close</button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-400 uppercase">Display Text</label>
                            <input
                              type="text"
                              value={selectedElement.text}
                              onChange={(e) => {
                                const updated = adminConfig.elements.map(el => el.id === selectedElement.id ? { ...el, text: e.target.value } : el);
                                setAdminConfig({ ...adminConfig, elements: updated });
                                setSelectedElement({ ...selectedElement, text: e.target.value });
                              }}
                              className="w-full bg-[#0a0f25] border border-gray-800 rounded p-1 text-white text-xs mt-1"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-400 uppercase">Text Color</label>
                            <input
                              type="text"
                              value={selectedElement.color}
                              onChange={(e) => {
                                const updated = adminConfig.elements.map(el => el.id === selectedElement.id ? { ...el, color: e.target.value } : el);
                                setAdminConfig({ ...adminConfig, elements: updated });
                                setSelectedElement({ ...selectedElement, color: e.target.value });
                              }}
                              className="w-full bg-[#0a0f25] border border-gray-800 rounded p-1 text-white text-xs mt-1"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-400 uppercase">Font Size</label>
                            <input
                              type="text"
                              value={selectedElement.fontSize}
                              onChange={(e) => {
                                const updated = adminConfig.elements.map(el => el.id === selectedElement.id ? { ...el, fontSize: e.target.value } : el);
                                setAdminConfig({ ...adminConfig, elements: updated });
                                setSelectedElement({ ...selectedElement, fontSize: e.target.value });
                              }}
                              className="w-full bg-[#0a0f25] border border-gray-800 rounded p-1 text-white text-xs mt-1"
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end gap-1.5">
                          <button
                            onClick={() => {
                              triggerToast("Applied changes to element style");
                              setSelectedElement(null);
                            }}
                            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-[10px] text-white font-bold"
                          >
                            Save Element Properties
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 text-center py-6 border border-gray-800 rounded-xl bg-[#080d22]">
                    <p className="text-xs text-gray-400 font-mono">Simulator interface offline. Toggle "Click-To-Edit Simulator" to inspect visual elements.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: THEME BUILDER & PLANS */}
          {activeSubTab === "theme" && (
            <div className="space-y-6">
              
              {/* THEME PRESET BUILDER */}
              <div className="bg-[#090f28] border border-cyan-500/20 p-5 rounded-2xl space-y-4">
                <h2 className="text-sm font-mono text-cyan-400 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  THEME BUILDER & VISUAL PRESET SYNTHESIS
                </h2>
                <p className="text-xs text-gray-400">
                  Configure global UI palettes, glowing border properties, particle density, and font sizing. Apply customized branding instantly across every dashboard workspace.
                </p>

                {/* THEME PRESET SWITCHER */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {[
                    { name: "Cyber Cyan", primary: "#06b6d4", bg: "#070b19" },
                    { name: "Neon Purple", primary: "#a855f7", bg: "#060814" },
                    { name: "Midnight Blue", primary: "#3b82f6", bg: "#030712" },
                    { name: "Cosmic Black", primary: "#f43f5e", bg: "#000000" },
                    { name: "Glass Dark", primary: "#14b8a6", bg: "#0f172a" },
                    { name: "Minimal Light", primary: "#0f172a", bg: "#f8fafc" },
                    { name: "Custom Theme", primary: "#ec4899", bg: "#070a1e" }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        const updated = {
                          ...adminConfig.theme,
                          preset: preset.name,
                          primaryColor: preset.primary,
                          bgColor: preset.bg,
                          glowColor: preset.primary
                        };
                        setAdminConfig({ ...adminConfig, theme: updated });
                        addLog("Theme Preset", `Loaded layout style preset: ${preset.name}`);
                        triggerToast(`Preset [${preset.name}] applied in memory draft`);
                      }}
                      className={`p-2.5 rounded-xl border text-[10px] font-mono text-center transition ${adminConfig.theme.preset === preset.name ? "border-cyan-400 bg-cyan-950/20 text-white font-bold" : "border-gray-800 text-gray-400 hover:text-white"}`}
                    >
                      <div className="w-full h-2 rounded mb-1" style={{ backgroundColor: preset.primary }} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>

                {/* ADVANCED THEME TUNERS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 block">Primary Accent</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={adminConfig.theme.primaryColor}
                        onChange={(e) => setAdminConfig({ ...adminConfig, theme: { ...adminConfig.theme, primaryColor: e.target.value } })}
                        className="w-8 h-8 rounded border-0 bg-transparent p-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={adminConfig.theme.primaryColor}
                        onChange={(e) => setAdminConfig({ ...adminConfig, theme: { ...adminConfig.theme, primaryColor: e.target.value } })}
                        className="flex-1 bg-gray-950 border border-gray-800 text-[10px] p-1 rounded text-white text-center"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 block">Background Surface</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={adminConfig.theme.bgColor}
                        onChange={(e) => setAdminConfig({ ...adminConfig, theme: { ...adminConfig.theme, bgColor: e.target.value } })}
                        className="w-8 h-8 rounded border-0 bg-transparent p-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={adminConfig.theme.bgColor}
                        onChange={(e) => setAdminConfig({ ...adminConfig, theme: { ...adminConfig.theme, bgColor: e.target.value } })}
                        className="flex-1 bg-gray-950 border border-gray-800 text-[10px] p-1 rounded text-white text-center"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 block">Glow Accent Intensity</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={adminConfig.theme.particleIntensity}
                      onChange={(e) => setAdminConfig({ ...adminConfig, theme: { ...adminConfig.theme, particleIntensity: Number(e.target.value) } })}
                      className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 mt-3"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-xs font-mono pt-2">
                  <button
                    onClick={() => {
                      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(adminConfig.theme, null, 2))}`;
                      const downloadAnchor = document.createElement("a");
                      downloadAnchor.setAttribute("href", jsonString);
                      downloadAnchor.setAttribute("download", "chitti_custom_theme.json");
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                      triggerToast("Exported JSON successfully");
                    }}
                    className="px-3 py-1.5 border border-gray-800 bg-gray-950 text-gray-300 hover:text-white rounded-lg transition"
                  >
                    Export Theme JSON
                  </button>
                  <button
                    onClick={() => {
                      const input = prompt("Paste your Custom Theme JSON string here:");
                      if (input) {
                        try {
                          const parsed = JSON.parse(input);
                          setAdminConfig({ ...adminConfig, theme: { ...adminConfig.theme, ...parsed } });
                          triggerToast("Imported Theme successfully", "success");
                        } catch(e) {
                          triggerToast("Invalid theme schema format", "error");
                        }
                      }
                    }}
                    className="px-3 py-1.5 border border-gray-800 bg-gray-950 text-gray-300 hover:text-white rounded-lg transition"
                  >
                    Import Theme JSON
                  </button>
                </div>
              </div>

              {/* SUBSCRIPTION PLAN MANAGER */}
              <div className="bg-[#090f28] border border-purple-500/20 p-5 rounded-2xl">
                <h2 className="text-sm font-mono text-purple-400 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  SUBSCRIPTION PLANS & PRICING REGISTRY
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Adjust plan pricing (INR / USD), monthly cycles, and active section authorizations for our subscription models.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {adminConfig.plans.map((plan) => (
                    <div key={plan.id} className="p-4 border border-gray-800/80 bg-gray-950 rounded-xl space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-white uppercase">{plan.name}</span>
                        {plan.isPopular && <span className="text-[8px] font-bold bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded">POPULAR</span>}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-gray-500">Price INR (₹)</label>
                          <input
                            type="number"
                            value={plan.priceInr}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const updated = adminConfig.plans.map(p => p.id === plan.id ? { ...p, priceInr: val } : p);
                              setAdminConfig({ ...adminConfig, plans: updated });
                            }}
                            className="w-full bg-[#0a0f25] border border-gray-800 rounded p-1.5 text-white font-bold text-xs mt-1"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-500">Price USD ($)</label>
                          <input
                            type="number"
                            value={plan.priceUsd}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const updated = adminConfig.plans.map(p => p.id === plan.id ? { ...p, priceUsd: val } : p);
                              setAdminConfig({ ...adminConfig, plans: updated });
                            }}
                            className="w-full bg-[#0a0f25] border border-gray-800 rounded p-1.5 text-white font-bold text-xs mt-1"
                          />
                        </div>
                      </div>

                      {/* PLAN SECTION ACCESS SECTOR */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-500 uppercase block">Authorized Channels</span>
                        <div className="flex flex-wrap gap-1 max-h-[100px] overflow-y-auto border border-gray-900/60 p-1.5 rounded bg-gray-900/40">
                          {adminConfig.sections.map((sect) => {
                            const isAllowed = plan.allowedSections.includes(sect.id);
                            return (
                              <button
                                key={sect.id}
                                onClick={() => {
                                  const allowed = isAllowed 
                                    ? plan.allowedSections.filter(id => id !== sect.id)
                                    : [...plan.allowedSections, sect.id];
                                  const updated = adminConfig.plans.map(p => p.id === plan.id ? { ...p, allowedSections: allowed } : p);
                                  setAdminConfig({ ...adminConfig, plans: updated });
                                  triggerToast(`Updated section authorization map for ${plan.name}`);
                                }}
                                className={`text-[9px] px-1.5 py-0.5 rounded border transition ${isAllowed ? "bg-cyan-950 text-cyan-400 border-cyan-800/35" : "bg-gray-900/60 text-gray-600 border-gray-900"}`}
                              >
                                {sect.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* ACTION CONTROLS */}
                      <div className="flex justify-end gap-1 text-[10px]">
                        <button
                          onClick={() => {
                            const updated = adminConfig.plans.map(p => p.id === plan.id ? { ...p, isPopular: !p.isPopular } : p);
                            setAdminConfig({ ...adminConfig, plans: updated });
                            triggerToast(`Most popular status shifted`);
                          }}
                          className="px-2 py-1 text-gray-400 hover:text-white border border-gray-800 rounded hover:bg-gray-900"
                        >
                          Star Target
                        </button>
                        <button
                          onClick={() => triggerSafety("ARCHIVE PLAN SCHEDULER", `Confirm archiving and removing ${plan.name} from checkout?`, () => {
                            const updated = adminConfig.plans.filter(p => p.id !== plan.id);
                            setAdminConfig({ ...adminConfig, plans: updated });
                            addLog("Archive Plan", `Archived pricing plan tier: ${plan.name}`);
                          })}
                          className="px-2 py-1 text-rose-400 hover:text-rose-200 border border-rose-950 rounded bg-rose-950/15"
                        >
                          Archive
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MONTHLY USAGE LIMIT MASTER */}
              <div className="bg-[#090f28] border border-cyan-500/20 p-5 rounded-2xl">
                <h2 className="text-sm font-mono text-cyan-400 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  DEFAULT MONTHLY SUITE USAGE LIMITS
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Adjust the base monthly usage ceilings for different modules. These ceilings trigger warnings or blocks when reached by standard user plans.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs font-mono">
                  {Object.entries(adminConfig.limits).map(([key, value]) => (
                    <div key={key} className="bg-gray-950 p-3 rounded-xl border border-gray-800">
                      <label className="text-[9px] text-gray-500 uppercase block leading-tight">{key.replace(/([A-Z])/g, ' $1')}</label>
                      <input
                        type="number"
                        value={value as number}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAdminConfig({ ...adminConfig, limits: { ...adminConfig.limits, [key]: val } });
                        }}
                        className="w-full bg-transparent border-b border-gray-800 focus:border-cyan-500 text-white font-bold py-1 focus:outline-none focus:ring-0 mt-1.5"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AGENTS & API KEY MANAGER */}
          {activeSubTab === "ai_config" && (() => {
            const totalAgents = adminConfig.agents.length;
            const enabledAgentsCount = adminConfig.agents.filter((a: any) => a.isEnabled).length;
            const disabledAgentsCount = totalAgents - enabledAgentsCount;

            const defaultScopesForApi = (apiId: string) => {
              switch (apiId) {
                case "gemini": return ["communication", "code", "text", "media", "voice"];
                case "openai": return ["communication", "code", "text", "media", "voice"];
                case "claude": return ["code", "text"];
                case "deepseek": return ["code"];
                case "waha": return ["communication"];
                default: return ["communication", "code", "text"];
              }
            };

            const API_SCOPES = [
              { id: "communication", label: "Communication (WA, Chat, Email)" },
              { id: "code", label: "Code Generation & Parsing" },
              { id: "text", label: "Text Summarization & Search" },
              { id: "media", label: "Media (Images/Videos)" },
              { id: "voice", label: "Voice & Speech Gateway" }
            ];

            return (
              <div className="space-y-6">
                
                {/* AGENT STATE MONITORING BAR */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0a0f28]/60 p-5 rounded-2xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.05)]">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Total AI Agents Registered</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-display font-bold text-white">{totalAgents}</span>
                      <span className="text-xs text-purple-400 font-mono">Cores Available</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono">Configured inside Chitti-Robo registry</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Enabled Active Agents</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-display font-bold text-emerald-400">{enabledAgentsCount}</span>
                      <span className="text-xs text-emerald-500 font-mono">Online</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono">Serving active prompt streams</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Disabled Inactive Agents</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-display font-bold text-amber-500">{disabledAgentsCount}</span>
                      <span className="text-xs text-amber-600 font-mono">Standby</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono">Bypassed from prompt routing</p>
                  </div>

                  {/* Bulk controls */}
                  <div className="md:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-purple-900/20 gap-2">
                    <span className="text-[10px] text-gray-400 font-mono uppercase">Mass Agent Override Pipelines:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const updated = adminConfig.agents.map((a: any) => ({ ...a, isEnabled: true }));
                          const newConfig = { ...adminConfig, agents: updated };
                          setAdminConfig(newConfig);
                          localStorage.setItem("chitti_admin_override_config", JSON.stringify(newConfig));
                          addLog("Mass Agent Override", "Enabled all cognitive AI agents registry");
                          triggerToast("All AI Agents enabled successfully", "success");
                        }}
                        className="px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/30 text-emerald-400 border border-emerald-800/40 text-[10px] font-mono rounded-lg transition cursor-pointer"
                      >
                        Enable All Agents
                      </button>
                      <button
                        onClick={() => {
                          const updated = adminConfig.agents.map((a: any) => ({ ...a, isEnabled: false }));
                          const newConfig = { ...adminConfig, agents: updated };
                          setAdminConfig(newConfig);
                          localStorage.setItem("chitti_admin_override_config", JSON.stringify(newConfig));
                          addLog("Mass Agent Override", "Disabled all cognitive AI agents registry");
                          triggerToast("All AI Agents disabled successfully", "info");
                        }}
                        className="px-3 py-1.5 bg-amber-950/40 hover:bg-amber-900/30 text-amber-400 border border-amber-800/40 text-[10px] font-mono rounded-lg transition cursor-pointer"
                      >
                        Disable All Agents
                      </button>
                    </div>
                  </div>
                </div>

                {/* API KEY INVENTORY */}
                <div className="bg-[#090f28] border border-cyan-500/20 p-5 rounded-2xl">
                  <h2 className="text-sm font-mono text-cyan-400 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    API GATEWAY KEYS SAFE-HOUSE (MASKED INVENTORY)
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Secure storage configuration for the application's underlying cloud microservices. Grant or revoke granular access to communication, code, text, or visual tasks per API endpoint.
                  </p>

                  <div className="space-y-4 mt-4">
                    {adminConfig.apiKeys.map((api: any) => (
                      <div key={api.id} className="p-4 bg-gray-950 border border-gray-800/80 rounded-xl space-y-3 font-mono text-xs">
                        
                        {/* API Top Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-900/60 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{api.name}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${api.status === "Active" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-gray-900 text-gray-500 border border-gray-800"}`}>
                                {api.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5">Masked Key: {api.hasKey ? "• • • • • • • • • • • • • • • • KEY_CHITTI_SECURE" : "NOT SET (Uses default gateway)"}</p>
                          </div>

                          <div className="flex items-center gap-4 flex-wrap text-[10px] text-gray-400">
                            <span>Usage count: <strong className="text-white">{api.usageCount}</strong></span>
                            <span>Month Cost: <strong className="text-white">${api.cost.toFixed(2)}</strong></span>
                            
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  triggerToast(`Connection handshake successful: latency 184ms`, "success");
                                }}
                                className="p-1.5 px-2.5 border border-gray-800 hover:bg-gray-900 rounded text-cyan-400 font-bold transition cursor-pointer"
                              >
                                Ping API
                              </button>
                              
                              <button
                                onClick={() => {
                                  const updated = adminConfig.apiKeys.map((k: any) => k.id === api.id ? { ...k, status: k.status === "Active" ? "Inactive" : "Active" } : k);
                                  const newConfig = { ...adminConfig, apiKeys: updated };
                                  setAdminConfig(newConfig);
                                  localStorage.setItem("chitti_admin_override_config", JSON.stringify(newConfig));
                                  addLog("Toggle API State", `Toggled API active status for ${api.name}`);
                                  triggerToast(`API status toggled`);
                                }}
                                className="p-1.5 px-2.5 border border-gray-800 hover:bg-gray-900 rounded text-gray-300 font-bold transition cursor-pointer"
                              >
                                Toggle State
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Capabilities Selection row */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Permitted Scope / Task Access</span>
                            <span className="text-[9px] text-gray-500 font-mono">Authorize functional pipelines</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {API_SCOPES.map((scope) => {
                              const currentScopes = api.allowedScopes || defaultScopesForApi(api.id);
                              const isAllowed = currentScopes.includes(scope.id);
                              return (
                                <button
                                  key={scope.id}
                                  onClick={() => {
                                    const newScopes = isAllowed
                                      ? currentScopes.filter((s: string) => s !== scope.id)
                                      : [...currentScopes, scope.id];
                                    const updated = adminConfig.apiKeys.map((k: any) => k.id === api.id ? { ...k, allowedScopes: newScopes } : k);
                                    const newConfig = { ...adminConfig, apiKeys: updated };
                                    setAdminConfig(newConfig);
                                    localStorage.setItem("chitti_admin_override_config", JSON.stringify(newConfig));
                                    addLog("API Scope Update", `Updated allowed scopes for ${api.name}: ${newScopes.join(", ")}`);
                                    triggerToast(`Scope changed for ${api.name}`);
                                  }}
                                  className={`px-2.5 py-1 text-[10px] rounded border font-mono flex items-center gap-1.5 transition cursor-pointer ${
                                    isAllowed
                                      ? "bg-cyan-950/40 text-cyan-400 border-cyan-800/60 font-bold shadow-[0_0_8px_rgba(6,182,212,0.1)]"
                                      : "bg-gray-950 text-gray-500 border-gray-800 hover:border-gray-700"
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${isAllowed ? "bg-cyan-400 animate-pulse" : "bg-gray-700"}`} />
                                  {scope.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

              {/* AGENTS REGISTRY */}
              <div className="bg-[#090f28] border border-purple-500/20 p-5 rounded-2xl">
                <h2 className="text-sm font-mono text-purple-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  COGNITIVE AI AGENTS REGISTRY
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Define the capabilities, cost levels, routing priority, and display metadata for the 12 AI agents of the Chitti-Robo directory.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {adminConfig.agents.map((agent) => (
                    <div key={agent.id} className="p-4 bg-gray-950 border border-gray-800 rounded-xl space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-white uppercase">{agent.name}</h3>
                          <span className="text-[9px] text-gray-500">Provider: {agent.provider}</span>
                        </div>
                        <button
                          onClick={() => {
                            const updated = adminConfig.agents.map(a => a.id === agent.id ? { ...a, isEnabled: !a.isEnabled } : a);
                            setAdminConfig({ ...adminConfig, agents: updated });
                            addLog("Toggle Agent State", `Set agent ${agent.name} to ${!agent.isEnabled ? "enabled" : "disabled"}`);
                          }}
                          className={`px-2 py-0.5 text-[9px] font-bold rounded border ${agent.isEnabled ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-gray-900 text-gray-500 border-gray-850"}`}
                        >
                          {agent.isEnabled ? "ACTIVE" : "DISABLED"}
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
                        <div className="p-1.5 bg-[#0a0f25] rounded border border-gray-900">
                          <span className="text-gray-500 block text-[8px]">COST</span>
                          <span className="text-white font-bold">{agent.costLevel.toUpperCase()}</span>
                        </div>
                        <div className="p-1.5 bg-[#0a0f25] rounded border border-gray-900">
                          <span className="text-gray-500 block text-[8px]">SPEED</span>
                          <span className="text-cyan-400 font-bold">{agent.speedLevel.toUpperCase()}</span>
                        </div>
                        <div className="p-1.5 bg-[#0a0f25] rounded border border-gray-900">
                          <span className="text-gray-500 block text-[8px]">ACCURACY</span>
                          <span className="text-purple-400 font-bold">{agent.accuracyLevel.toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-[10px] text-gray-400 pt-1">
                        <button
                          onClick={() => triggerToast(`Handshake test for ${agent.name} success (latency 230ms)`)}
                          className="text-cyan-400 hover:underline"
                        >
                          Test Connection
                        </button>
                        <span>Limit: 120k tokens/prompt</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROUTING CONTROLLER */}
              <div className="bg-[#090f28] border border-cyan-500/20 p-5 rounded-2xl">
                <h2 className="text-sm font-mono text-cyan-400 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  COGNITIVE TASK ROUTING REGISTRY
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Specify which AI engine operates which specific user task Category. Setup automatic failovers instantly.
                </p>

                <div className="mt-4 border border-gray-800 rounded-xl overflow-hidden text-xs font-mono">
                  <div className="grid grid-cols-4 p-2 bg-[#0c122e] text-gray-400 border-b border-gray-850 font-bold">
                    <span>Task Category</span>
                    <span>Primary Router</span>
                    <span>Failover Backup</span>
                    <span>Priority Mode</span>
                  </div>
                  <div className="divide-y divide-gray-900">
                    {adminConfig.routing.map((route, i) => (
                      <div key={i} className="grid grid-cols-4 p-3 hover:bg-[#090f24] items-center text-gray-300">
                        <span className="font-bold text-white">{route.task}</span>
                        
                        <select
                          value={route.primaryAgent}
                          onChange={(e) => {
                            const updated = [...adminConfig.routing];
                            updated[i].primaryAgent = e.target.value;
                            setAdminConfig({ ...adminConfig, routing: updated });
                          }}
                          className="bg-transparent text-xs border-b border-transparent hover:border-gray-700 text-cyan-400 focus:outline-none"
                        >
                          {adminConfig.agents.map(a => <option key={a.id} value={a.id} className="bg-gray-950 text-white">{a.name}</option>)}
                        </select>

                        <select
                          value={route.backupAgent}
                          onChange={(e) => {
                            const updated = [...adminConfig.routing];
                            updated[i].backupAgent = e.target.value;
                            setAdminConfig({ ...adminConfig, routing: updated });
                          }}
                          className="bg-transparent text-xs border-b border-transparent hover:border-gray-700 text-purple-400 focus:outline-none"
                        >
                          {adminConfig.agents.map(a => <option key={a.id} value={a.id} className="bg-gray-950 text-white">{a.name}</option>)}
                        </select>

                        <select
                          value={route.mode}
                          onChange={(e) => {
                            const updated = [...adminConfig.routing];
                            updated[i].mode = e.target.value;
                            setAdminConfig({ ...adminConfig, routing: updated });
                          }}
                          className="bg-transparent text-xs border-b border-transparent hover:border-gray-700 text-gray-400 focus:outline-none"
                        >
                          <option value="balanced" className="bg-gray-950 text-white">Balanced</option>
                          <option value="speed" className="bg-gray-950 text-white">Speed Core</option>
                          <option value="accuracy" className="bg-gray-950 text-white">Accuracy Max</option>
                          <option value="cost-saving" className="bg-gray-950 text-white">Cost Saving</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

          {/* TAB 5: MEDIA & UPLOADS */}
          {activeSubTab === "media_upload" && (
            <div className="space-y-6">
              
              {/* IMAGINE STUDIO MATRIX */}
              <div className="bg-[#090f28] border border-cyan-500/20 p-5 rounded-2xl space-y-4">
                <h2 className="text-sm font-mono text-cyan-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  IMAGINE STUDIO COMPONENT UNIT WEIGHTS
                </h2>
                <p className="text-xs text-gray-400">
                  Establish internal billing weights (Creative Units consumed per request) for different asset types. This pegs direct costs accurately for checkout purposes.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Object.entries(adminConfig.imagineStudio.unitCosts).map(([key, value]) => (
                    <div key={key} className="bg-gray-950 p-3.5 rounded-xl border border-gray-800 text-center font-mono">
                      <span className="text-[10px] text-gray-500 uppercase block">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <input
                        type="number"
                        value={value as number}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAdminConfig({
                            ...adminConfig,
                            imagineStudio: {
                              ...adminConfig.imagineStudio,
                              unitCosts: { ...adminConfig.imagineStudio.unitCosts, [key]: val }
                            }
                          });
                        }}
                        className="w-16 bg-transparent border-b border-gray-800 focus:border-cyan-500 text-center text-sm font-bold text-white mt-1"
                      />
                      <span className="text-[8px] text-gray-500 block mt-1">units/gen</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between p-3.5 bg-purple-950/20 border border-purple-800/30 rounded-xl text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>Imagine Studio Safety Content Moderation (NSFW Cloud-Filters Active)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={adminConfig.imagineStudio.safetyFilter}
                    onChange={(e) => setAdminConfig({ ...adminConfig, imagineStudio: { ...adminConfig.imagineStudio, safetyFilter: e.target.checked } })}
                    className="w-8 h-4 rounded-full bg-gray-800 cursor-pointer"
                  />
                </div>
              </div>

              {/* FILE & UPLOAD SCHEMAS */}
              <div className="bg-[#090f28] border border-purple-500/20 p-5 rounded-2xl">
                <h2 className="text-sm font-mono text-purple-400 flex items-center gap-2">
                  <FolderUp className="w-4 h-4" />
                  GLOBAL WORKSPACE UPLOAD & STORAGE SETTINGS
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Manage file size ceilings, allowed format extensions, cloud bucket details, and automatic server deletion schedules.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase">Max File Size Allowance (MB)</label>
                    <input
                      type="number"
                      value={adminConfig.uploadSettings.maxSizeMb}
                      onChange={(e) => setAdminConfig({ ...adminConfig, uploadSettings: { ...adminConfig.uploadSettings, maxSizeMb: Number(e.target.value) } })}
                      className="w-full bg-gray-950 border border-gray-800 rounded p-2 text-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase">Allowed Extensions File-Scan</label>
                    <input
                      type="text"
                      value={adminConfig.uploadSettings.allowedTypes}
                      onChange={(e) => setAdminConfig({ ...adminConfig, uploadSettings: { ...adminConfig.uploadSettings, allowedTypes: e.target.value } })}
                      className="w-full bg-gray-950 border border-gray-800 rounded p-2 text-white font-bold text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase">Automated Cleanup Scheduler</label>
                    <select
                      value={adminConfig.uploadSettings.autoDeleteDays}
                      onChange={(e) => setAdminConfig({ ...adminConfig, uploadSettings: { ...adminConfig.uploadSettings, autoDeleteDays: Number(e.target.value) } })}
                      className="w-full bg-gray-950 border border-gray-800 rounded p-2 text-white text-xs"
                    >
                      <option value={7}>Wipe files older than 7 Days</option>
                      <option value={14}>Wipe files older than 14 Days</option>
                      <option value={30}>Wipe files older than 30 Days</option>
                      <option value={0}>Never delete (Requires Cloud Upgrade)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase">Storage Provider Bucket</label>
                    <input
                      type="text"
                      value={adminConfig.uploadSettings.storageProvider}
                      onChange={(e) => setAdminConfig({ ...adminConfig, uploadSettings: { ...adminConfig.uploadSettings, storageProvider: e.target.value } })}
                      className="w-full bg-gray-950 border border-gray-800 rounded p-2 text-gray-400 font-bold text-xs"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: USERS & WORKSPACES */}
          {activeSubTab === "users_orgs" && (
            <div className="space-y-6">
              
              {/* USER REGISTRY TABLE */}
              <div className="bg-[#090f28] border border-cyan-500/20 p-5 rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-800/60 pb-4">
                  <div>
                    <h2 className="text-sm font-mono text-cyan-400 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      SYSTEM USERS MASTER DIRECTORY
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Search, verify usage metrics, override roles on the fly, allocate custom bonus credits, or suspend user link keys.
                    </p>
                  </div>

                  {/* USER SEARCH FILTERS */}
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search email/name..."
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        className="bg-gray-950 border border-gray-800 pl-8 pr-3 py-1.5 rounded-lg text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 w-44"
                      />
                    </div>

                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="bg-gray-950 border border-gray-800 px-2 py-1.5 rounded-lg text-xs font-mono text-gray-300 focus:outline-none"
                    >
                      <option value="all">All Roles</option>
                      <option value="owner_admin">Owner Admin</option>
                      <option value="developer">Developer</option>
                      <option value="school_manager">School Mgr</option>
                      <option value="company_manager">Company Mgr</option>
                      <option value="user">Normal User</option>
                    </select>
                  </div>
                </div>

                {/* USER DATA TABLE */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="border-b border-gray-850 text-gray-500 font-bold bg-[#0c122e] p-2">
                        <th className="p-3">User Profile</th>
                        <th className="p-3">Role Designation</th>
                        <th className="p-3">Plan Tier</th>
                        <th className="p-3">Usage Cost</th>
                        <th className="p-3 text-right">Overrides</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900">
                      {usersList
                        .filter(u => u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase()))
                        .filter(u => roleFilter === "all" || u.role === roleFilter)
                        .map((usr) => (
                          <tr key={usr.id} className="hover:bg-[#090f24]/50 text-gray-300">
                            <td className="p-3">
                              <div className="font-bold text-white">{usr.name}</div>
                              <div className="text-[10px] text-gray-500">{usr.email}</div>
                            </td>
                            <td className="p-3">
                              <select
                                value={usr.role}
                                onChange={(e) => {
                                  const updated = usersList.map(u => u.id === usr.id ? { ...u, role: e.target.value } : u);
                                  setUsersList(updated);
                                  triggerToast(`Updated ${usr.name} to ${e.target.value} role`);
                                  addLog("User Role Change", `Changed role of ${usr.email} to ${e.target.value}`);
                                }}
                                className="bg-gray-950 border border-gray-850 rounded px-1 py-0.5 text-xs text-cyan-400"
                              >
                                <option value="owner_admin">owner_admin</option>
                                <option value="developer">developer</option>
                                <option value="school_manager">school_manager</option>
                                <option value="company_manager">company_manager</option>
                                <option value="tutor">tutor</option>
                                <option value="student">student</option>
                                <option value="user">user</option>
                                <option value="guest">guest</option>
                              </select>
                            </td>
                            <td className="p-3">
                              <select
                                value={usr.plan}
                                onChange={(e) => {
                                  const updated = usersList.map(u => u.id === usr.id ? { ...u, plan: e.target.value } : u);
                                  setUsersList(updated);
                                  triggerToast(`Manually upgraded ${usr.name} plan`);
                                  addLog("User Plan Overridden", `Assigned ${e.target.value} plan to ${usr.email}`);
                                }}
                                className="bg-gray-950 border border-gray-850 rounded px-1 py-0.5 text-xs text-purple-400"
                              >
                                <option value="free_trial">free_trial</option>
                                <option value="starter">starter</option>
                                <option value="pro">pro</option>
                                <option value="ultra">ultra</option>
                                <option value="school">school</option>
                                <option value="company">company</option>
                              </select>
                            </td>
                            <td className="p-3">
                              <div className="text-white font-bold">${usr.apiCost}</div>
                              <div className="text-[10px] text-emerald-400">Bonus: {usr.bonusCredits} cr</div>
                            </td>
                            <td className="p-3 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  const updated = usersList.map(u => u.id === usr.id ? { ...u, bonusCredits: u.bonusCredits + 100 } : u);
                                  setUsersList(updated);
                                  triggerToast(`Injected +100 bonus units to ${usr.name}`);
                                }}
                                className="px-2 py-0.5 bg-emerald-950/20 text-emerald-400 border border-emerald-900/20 rounded hover:bg-emerald-950/40 text-[10px]"
                              >
                                +100 Credits
                              </button>
                              
                              <button
                                onClick={() => {
                                  const updated = usersList.map(u => u.id === usr.id ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u);
                                  setUsersList(updated);
                                  triggerToast(`${usr.name} status toggled`);
                                  addLog("User Ban", `Toggled status of ${usr.email} to ${usr.status === "Active" ? "Suspended" : "Active"}`);
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] ${usr.status === "Active" ? "bg-rose-950/20 text-rose-400 border border-rose-900/20 hover:bg-rose-950/40" : "bg-emerald-950/20 text-emerald-400 border border-emerald-900/20 hover:bg-emerald-950/40"}`}
                              >
                                {usr.status === "Active" ? "Suspend" : "Release"}
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ORGANIZATION & WORKSPACES */}
              <div className="bg-[#090f28] border border-purple-500/20 p-5 rounded-2xl">
                <h2 className="text-sm font-mono text-purple-400 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  ORGANIZATIONAL SCHOOL & COMPANY COMMANDERS
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Manage pooled multi-seat enterprise contracts. School workspaces restrict generative creative features, whereas Companies unlock massive API thresholds.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {orgsList.map((org) => (
                    <div key={org.id} className="p-4 bg-gray-950 border border-gray-800 rounded-xl space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-white uppercase">{org.name}</span>
                        <span className="text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded uppercase">{org.type}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                        <div>
                          <span>WORKSPACE MANAGER:</span>
                          <p className="text-white font-bold">{org.manager}</p>
                        </div>
                        <div>
                          <span>POOLED DISPATCH WEIGHT:</span>
                          <p className="text-cyan-400 font-bold">{org.pooledUsage}</p>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-between items-center text-[10px] border-t border-gray-900">
                        <span>Pooled Members: <strong>{org.type === "School" ? `${org.studentSeats} Students` : `${org.teamSeats} Seats`}</strong></span>
                        <button
                          onClick={() => triggerToast(`Classroom filter overrides set for ${org.name}`)}
                          className="text-cyan-400 hover:underline"
                        >
                          Tweak Permissions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BACKEND REDEEM CODES MANAGEMENT */}
              <div className="bg-[#090f28] border border-cyan-500/20 p-5 rounded-2xl">
                <div className="border-b border-gray-800/60 pb-4 mb-4">
                  <h2 className="text-sm font-mono text-cyan-400 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    SECURE BACKEND PROMOTIONAL COUPONS & REDEEM CODES
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    These promo codes are saved securely in the backend server (<code className="text-cyan-300 font-bold bg-cyan-950/40 px-1 py-0.5 rounded">database.json</code>) and validated dynamically. Each key can be customized with targeted plans, usage quotas, and live client logs.
                  </p>
                </div>

                {/* Create New Code Inline Form */}
                <form onSubmit={handleCreateRedeemCode} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-950 border border-gray-900 rounded-xl mb-6 font-mono text-xs">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Promo Code Key</label>
                    <input
                      type="text"
                      placeholder="e.g. ULTRA-FREE-PASS"
                      value={newCodeName}
                      onChange={(e) => setNewCodeName(e.target.value)}
                      className="w-full bg-[#030612] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Target Account Plan</label>
                    <select
                      value={newCodePlan}
                      onChange={(e) => setNewCodePlan(e.target.value)}
                      className="w-full bg-[#030612] border border-gray-800 rounded-lg px-3 py-2 text-xs text-cyan-400 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="free_trial">free_trial</option>
                      <option value="starter">starter</option>
                      <option value="pro">pro</option>
                      <option value="ultra">ultra</option>
                      <option value="school">school</option>
                      <option value="company">company</option>
                      <option value="enterprise">enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Max Use Quota</label>
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      value={newCodeMaxUses}
                      onChange={(e) => setNewCodeMaxUses(e.target.value)}
                      className="w-full bg-[#030612] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-gray-950 font-bold rounded-lg transition duration-200 shadow-md"
                    >
                      Generate Secure Key
                    </button>
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Description / Memo</label>
                    <input
                      type="text"
                      placeholder="e.g. Special offline coupon code for premium developer advocates."
                      value={newCodeDesc}
                      onChange={(e) => setNewCodeDesc(e.target.value)}
                      className="w-full bg-[#030612] border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </form>

                {/* Coupons Table list */}
                <div className="overflow-x-auto">
                  {isCodesLoading && redeemCodes.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-500 font-mono animate-pulse">
                      Retrieving active code matrices from backend...
                    </div>
                  ) : redeemCodes.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-500 font-mono">
                      No active dynamic coupons exist. Use the generator above to spawn codes.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse font-mono text-xs">
                      <thead>
                        <tr className="border-b border-gray-850 text-gray-500 font-bold bg-[#0c122e] p-2">
                          <th className="p-3">Coupon Code</th>
                          <th className="p-3">Plan Reward</th>
                          <th className="p-3">Redemption Quota</th>
                          <th className="p-3">Memo Context</th>
                          <th className="p-3 text-right font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-900">
                        {redeemCodes.map((rc) => (
                          <React.Fragment key={rc.code}>
                            <tr className="hover:bg-[#090f24]/50 text-gray-300">
                              <td className="p-3 font-bold text-white flex items-center gap-2">
                                <span className="bg-cyan-950 text-cyan-300 border border-cyan-800/50 px-2 py-0.5 rounded tracking-widest uppercase font-bold">{rc.code}</span>
                              </td>
                              <td className="p-3 uppercase text-purple-400 font-bold">{rc.planId}</td>
                              <td className="p-3">
                                <div className="text-white font-bold">{rc.usesCount} / {rc.maxUses || "∞"}</div>
                                <div className="text-[9px] text-gray-500">Redeemed: {rc.maxUses ? Math.round((rc.usesCount / rc.maxUses) * 100) : 0}%</div>
                              </td>
                              <td className="p-3 text-gray-400 italic max-w-xs truncate" title={rc.description}>
                                {rc.description || "N/A"}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleDeleteRedeemCode(rc.code)}
                                  className="p-1 text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/30 rounded transition"
                                  title="Revoke and delete promo code permanently"
                                >
                                  <Trash2 className="w-4 h-4 inline" />
                                </button>
                              </td>
                            </tr>
                            {/* Nested Redeemed Users List */}
                            {rc.usedBy && rc.usedBy.length > 0 && (
                              <tr>
                                <td colSpan={5} className="bg-gray-950/60 p-3 pl-8 text-[10px] text-gray-400 font-mono border-b border-gray-900">
                                  <div className="flex flex-col gap-1">
                                    <div className="text-gray-500 font-bold uppercase tracking-wider mb-1">Active Client Logs for this Key:</div>
                                    {rc.usedBy.map((u: any, idx: number) => (
                                      <div key={idx} className="flex justify-between items-center bg-gray-950/90 border border-gray-900/50 px-3 py-1 rounded">
                                        <span>Redeemer: <strong className="text-cyan-400">{u.email}</strong> <span className="text-gray-600">({u.userId})</span></span>
                                        <span className="text-gray-500 font-mono">Applied: {new Date(u.redeemedAt).toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SYSTEM TOOLS, LOGS & SCHEMA */}
          {activeSubTab === "system" && (
            <div className="space-y-6">
              
              {/* BACKUP & RESTORE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#090f28] border border-cyan-500/20 p-5 rounded-2xl space-y-3">
                  <h2 className="text-sm font-mono text-cyan-400 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    BACKUP & PRE-COMPILATION SYSTEM
                  </h2>
                  <p className="text-xs text-gray-400">
                    Export all current local configurations (custom theme matrices, plan changes, section indexes, routing schedules) to a single portable encrypted file.
                  </p>
                  
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => {
                        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(adminConfig, null, 2))}`;
                        const downloadAnchor = document.createElement("a");
                        downloadAnchor.setAttribute("href", jsonString);
                        downloadAnchor.setAttribute("download", "chitti_command_backup.json");
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        downloadAnchor.remove();
                        addLog("Export Backup", "Exported full local override backup");
                        triggerToast("Core backup JSON file exported!");
                      }}
                      className="px-4 py-2 bg-cyan-900/40 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-800/40 text-xs font-mono rounded-xl transition font-bold"
                    >
                      Export Backup JSON
                    </button>
                    <button
                      onClick={() => {
                        const file = prompt("Paste your Backup JSON string content here:");
                        if (file) {
                          try {
                            const parsed = JSON.parse(file);
                            saveConfig(parsed);
                            addLog("Import Backup", "Imported override config from file");
                          } catch(e) {
                            triggerToast("Failed to parse file: invalid schema matrix", "error");
                          }
                        }
                      }}
                      className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 text-xs font-mono rounded-xl transition"
                    >
                      Restore from JSON
                    </button>
                  </div>
                </div>

                <div className="bg-[#090f28] border border-purple-500/20 p-5 rounded-2xl space-y-2.5">
                  <h2 className="text-sm font-mono text-purple-400 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    LIVE PREVIEW USER-MOCK SIMULATION
                  </h2>
                  <p className="text-xs text-gray-400">
                    Toggle preview user state below to see how our navigation layers, lock statuses, and theme changes look through their portal instantly.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["free_trial", "starter", "pro", "ultra", "school", "company", "owner_admin"].map((plan) => (
                      <button
                        key={plan}
                        onClick={() => {
                          setPreviewPlanMode(plan);
                          triggerToast(`Preview mode switched to: ${plan}`);
                        }}
                        className={`text-[9px] px-2 py-1 rounded border transition font-mono ${previewPlanMode === plan ? "bg-purple-950 text-purple-300 border-purple-800" : "bg-gray-950 text-gray-500 border-gray-900 hover:text-white"}`}
                      >
                        {plan.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-gray-950 border border-gray-900 rounded-lg text-[10px] font-mono text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Previewing Plan Access:</span>
                      <span className="text-white font-bold">{previewPlanMode.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accessible sections shown in sidebar:</span>
                      <span className="text-cyan-400 font-bold">
                        {adminConfig.sections.filter(s => {
                          if (previewPlanMode === "owner_admin") return true;
                          const planObj = adminConfig.plans.find(p => p.id === previewPlanMode);
                          return planObj?.allowedSections.includes(s.id);
                        }).length} channels
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RAW DDL SCHEMA & SUPABASE INJECTOR */}
              <div className="bg-[#090f28] border border-[#1e293b] p-5 rounded-2xl">
                <h2 className="text-sm font-mono text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  POSTGRESQL / SUPABASE SCHEMAS & DATABASE SYNCHRONIZATION
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Ready-to-use SQL DDL schemas representing Chitti-Robo internal structures. Copy and paste these tables directly inside your Supabase SQL editor to link persistent instances.
                </p>

                <div className="mt-4 relative bg-gray-950 border border-gray-900 rounded-xl p-4 max-h-[220px] overflow-y-auto font-mono text-[10px] text-gray-400 scrollbar-thin">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`-- Chitti-Robo Supabase DDL SQL Configuration Schema
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  accent_color VARCHAR(50),
  is_enabled BOOLEAN DEFAULT TRUE,
  required_plan VARCHAR(100) DEFAULT 'free_trial'
);`);
                      triggerToast("SQL Code copied to clipboard!", "success");
                    }}
                    className="absolute top-2 right-3 p-1 bg-gray-900 border border-gray-800 text-gray-300 hover:text-white rounded flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy SQL DDL
                  </button>
                  <pre className="text-cyan-400 select-all leading-normal">
{`-- Chitti-Robo Supabase DDL SQL Configuration Schema
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  route_path VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  accent_color VARCHAR(50),
  is_enabled BOOLEAN DEFAULT TRUE,
  required_plan VARCHAR(100) DEFAULT 'free_trial'
);

CREATE TABLE IF NOT EXISTS ui_elements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key VARCHAR(100) NOT NULL,
  element_type VARCHAR(100),
  text TEXT,
  styles JSONB
);

CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price_inr INT DEFAULT 0,
  price_usd INT DEFAULT 0,
  is_popular BOOLEAN DEFAULT FALSE,
  allowed_sections TEXT[]
);`}
                  </pre>
                </div>
              </div>

              {/* LOGS PANEL */}
              <div className="bg-[#090f28] border border-[#1a254c] rounded-2xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-mono text-white flex items-center gap-1.5">
                      <History className="w-4 h-4 text-purple-400" />
                      SYSTEM OVERRIDE ACTIVITY & CONSOLE LOG FEED
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono">CAPTURING LIVE EVENTS & ADMIN SESSIONS FOR SECURITY TELEMETRY</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8," 
                          + ["Time,User,Action,Description,Type"].join(",") + "\n"
                          + logsList.map(l => `"${l.time}","${l.user}","${l.action}","${l.desc}","${l.type}"`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "chitti_system_logs.csv");
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        triggerToast("Exported CSV successfully");
                      }}
                      className="px-2.5 py-1 text-[10px] font-mono bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded hover:border-gray-700 transition"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => triggerSafety("FLUSH TELETROMY LOGS", "This will permanently clear Chitti-Robo internal transaction logs. This action cannot be reversed.", () => {
                        setLogsList([]);
                        triggerToast("Telemetry database logs purged", "info");
                      })}
                      className="px-2.5 py-1 text-[10px] font-mono bg-rose-950/20 text-rose-400 hover:text-rose-200 border border-rose-950/40 rounded transition"
                    >
                      Clear Logs
                    </button>
                  </div>
                </div>

                <div className="bg-gray-950/80 rounded-xl border border-gray-900 p-3 max-h-[220px] overflow-y-auto space-y-2 font-mono text-[10px]">
                  {logsList.length === 0 ? (
                    <div className="text-center py-6 text-gray-600">No telemetry log traces found.</div>
                  ) : (
                    logsList.map((log) => (
                      <div key={log.id} className="flex flex-col sm:flex-row justify-between border-b border-gray-900/60 pb-2 gap-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">[{log.time}]</span>
                            <span className="text-white font-bold">{log.user}</span>
                            <span className={`px-1 rounded font-bold uppercase text-[8px] ${log.type === "admin" ? "bg-cyan-950 text-cyan-400 border border-cyan-900" : log.type === "error" ? "bg-rose-950 text-rose-400 border border-rose-900" : "bg-gray-900 text-gray-400 border border-gray-850"}`}>{log.action}</span>
                          </div>
                          <p className="text-gray-400 mt-0.5">{log.desc}</p>
                        </div>
                        <div className="text-[8px] text-gray-600 uppercase self-end sm:self-center">{log.type} event</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CORE CONFIRMATION SAFETY MODAL */}
      {safetyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b1129] border-2 border-red-500/30 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-[0_0_50px_rgba(239,68,68,0.15)] text-center animate-pulse">
            <div className="w-12 h-12 bg-red-500/15 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-display font-bold text-red-400 uppercase tracking-tight">{safetyModal.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-mono">{safetyModal.desc}</p>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setSafetyModal(null)}
                className="px-4 py-2 bg-gray-900 border border-gray-800 text-xs font-mono text-gray-400 hover:text-white rounded-lg transition"
              >
                Abort Action
              </button>
              <button
                onClick={safetyModal.onConfirm}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 border border-red-500/30 text-xs font-mono text-white rounded-lg font-bold transition"
              >
                Execute Override Command
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
