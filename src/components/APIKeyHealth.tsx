import React, { useEffect, useState } from "react";
import { 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Play, 
  FileCode, 
  Sliders, 
  ShieldCheck, 
  Flame, 
  Activity, 
  Trash2, 
  Search, 
  Info,
  Clock,
  Layers,
  Sparkles,
  HelpCircle,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProviderData {
  id: string;
  name: string;
  provider: string;
  currentKeyEnv: string;
  fallbackEnv: string | null;
  backupKeyEnvs: string[];
  isCurrentKeyFilled: boolean;
  currentKeyMasked: string;
  backups: Array<{
    envName: string;
    isFilled: boolean;
    masked: string;
    index: number;
  }>;
  backupCountFilled: number;
  activeKeyIndex: number;
  status: "Active" | "Missing" | "Backup Ready" | "Failed" | "Rate Limited";
  lastError: string;
  lastUsedAt: string;
  monthlyUsage: number;
}

interface SwitchLog {
  id: string;
  timestamp: string;
  providerId: string;
  providerName: string;
  eventType: "failover" | "exhaustion" | "health_check" | "manual_override";
  oldIndex: number;
  newIndex: number;
  message: string;
}

interface APIKeyHealthProps {
  profile: { name: string; email: string; avatar_url: string; role?: string };
}

export default function APIKeyHealth({ profile }: APIKeyHealthProps) {
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [logs, setLogs] = useState<SwitchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "missing" | "failed">("all");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "chat" | "utility" | "creative">("all");
  const [testingId, setTestingId] = useState<string | null>(null);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);
  const [localRole, setLocalRole] = useState(profile?.role || "user");

  // Keep in sync with props
  useEffect(() => {
    setLocalRole(profile?.role || "user");
  }, [profile]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/keys/status");
      const data = await res.json();
      if (data.success) {
        setProviders(data.providers);
      }

      const logsRes = await fetch("/api/keys/logs");
      const logsData = await logsRes.json();
      if (logsData.success) {
        setLogs(logsData.logs);
      }
    } catch (e) {
      console.error("Failed to fetch key manager status", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleTestConnection = async (providerId: string, simulateFailure = false) => {
    if (simulateFailure) {
      setSimulatingId(providerId);
    } else {
      setTestingId(providerId);
    }

    try {
      const res = await fetch("/api/keys/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, simulateFailure })
      });
      const data = await res.json();
      
      // Instantly refresh data & logs
      await fetchData();
    } catch (err) {
      console.error("Failed to test connection", err);
    } finally {
      setTestingId(null);
      setSimulatingId(null);
    }
  };

  const handleUpdatePriority = async (providerId: string, targetIndex: number) => {
    try {
      const res = await fetch("/api/keys/update-priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, targetIndex })
      });
      await fetchData();
    } catch (err) {
      console.error("Failed to update priority", err);
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch("/api/keys/clear-logs", { method: "POST" });
      setLogs([]);
    } catch (e) {
      console.error(e);
    }
  };

  // Category classification helper
  const getCategory = (id: string) => {
    const chatModels = ["gemini", "claude", "openai", "deepseek", "kimi", "grok", "qwen", "llama", "mistral", "zai", "smart_chat", "openrouter", "aiml", "orcarouter"];
    const creativeModels = ["picsart", "higgsfield", "noiz", "embedding"];
    if (chatModels.includes(id)) return "chat";
    if (creativeModels.includes(id)) return "creative";
    return "utility";
  };

  const filteredProviders = providers.filter(p => {
    // Tab filter
    if (activeCategory !== "all" && getCategory(p.id) !== activeCategory) return false;
    
    // Status Filter
    if (filter === "active" && p.status === "Missing") return false;
    if (filter === "missing" && p.status !== "Missing") return false;
    if (filter === "failed" && p.status !== "Failed" && p.status !== "Rate Limited") return false;

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(query) ||
        p.provider.toLowerCase().includes(query) ||
        p.currentKeyEnv.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Active":
        return {
          bg: "bg-emerald-950/40 border-emerald-500/30 text-emerald-400",
          dot: "bg-emerald-400 animate-pulse",
          text: "Active"
        };
      case "Backup Ready":
        return {
          bg: "bg-purple-950/40 border-purple-500/30 text-purple-400",
          dot: "bg-purple-400 animate-pulse",
          text: "Backup Ready"
        };
      case "Rate Limited":
        return {
          bg: "bg-amber-950/40 border-amber-500/30 text-amber-400",
          dot: "bg-amber-500 animate-pulse",
          text: "Rate Limited"
        };
      case "Failed":
        return {
          bg: "bg-red-950/40 border-red-500/30 text-red-400",
          dot: "bg-red-500",
          text: "Failed"
        };
      default:
        return {
          bg: "bg-slate-900 border-slate-700/60 text-slate-400",
          dot: "bg-slate-500",
          text: "Missing"
        };
    }
  };

  const missingKeysCount = providers.filter(p => p.status === "Missing").length;

  return (
    <div id="api-key-health-hub" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-white flex items-center gap-3">
            <Key className="text-cyan-400 w-8 h-8 animate-pulse" /> Secure API Agent Key Manager
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Monitor, override, and test API health buffers across all 29 intelligent server clusters.
            Implements strict multi-tier failover recovery logic.
          </p>
        </div>

        {/* Admin Switcher Preview */}
        <div className="flex items-center gap-3 bg-[#0a1026] px-4 py-2 rounded-xl border border-gray-800">
          <Activity className="text-cyan-400 w-4 h-4 animate-pulse" />
          <div className="text-xs font-mono">
            <span className="text-gray-400">Security Node Level: </span>
            <span className={`${localRole === "owner_admin" ? "text-cyan-400 font-bold" : "text-purple-400"}`}>
              {localRole === "owner_admin" ? "Owner Admin Override Enabled" : "Read-Only Operator"}
            </span>
          </div>
        </div>
      </div>

      {/* Global Alert Notification Banner */}
      {missingKeysCount > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-amber-300 text-xs shadow-md">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500" />
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider block">Critical Operator Alert: Missing Credentials Detected</span>
            <p className="text-amber-400/80 leading-relaxed">
              {missingKeysCount} provider agents are currently inactive because their environment variables are not filled. Paste them inside your local <code className="bg-amber-950/60 px-1 rounded font-mono text-[10px] border border-amber-900/45">.env</code> file to immediately activate these clusters.
            </p>
          </div>
        </div>
      )}

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#080d22] border border-gray-800/80 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-900/40">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Total Clusters</span>
            <div className="text-xl font-bold font-mono text-white">{providers.length || 29}</div>
          </div>
        </div>

        <div className="p-4 bg-[#080d22] border border-gray-800/80 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/40">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Active & Ready</span>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {providers.filter(p => p.status === "Active" || p.status === "Backup Ready").length}
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#080d22] border border-gray-800/80 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-950/40 text-purple-400 border border-purple-900/40">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Active Backups Filled</span>
            <div className="text-xl font-bold font-mono text-purple-400">
              {providers.reduce((acc, p) => acc + p.backupCountFilled, 0)}
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#080d22] border border-gray-800/80 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-red-950/40 text-red-400 border border-red-900/40">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Disabled / Missing</span>
            <div className="text-xl font-bold font-mono text-rose-500">{missingKeysCount}</div>
          </div>
        </div>
      </div>

      {/* Main Filter & Action Controls Grid */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Category Tabs */}
        <div className="flex bg-[#05091a] p-1 rounded-xl border border-gray-800/80 self-start">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${activeCategory === "all" ? "bg-cyan-950 text-cyan-400 border border-cyan-900/30 font-bold" : "text-gray-400 hover:text-gray-200"}`}
          >
            All Clusters
          </button>
          <button
            onClick={() => setActiveCategory("chat")}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${activeCategory === "chat" ? "bg-cyan-950 text-cyan-400 border border-cyan-900/30 font-bold" : "text-gray-400 hover:text-gray-200"}`}
          >
            Core LLMs
          </button>
          <button
            onClick={() => setActiveCategory("creative")}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${activeCategory === "creative" ? "bg-cyan-950 text-cyan-400 border border-cyan-900/30 font-bold" : "text-gray-400 hover:text-gray-200"}`}
          >
            Creative & Audio
          </button>
          <button
            onClick={() => setActiveCategory("utility")}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${activeCategory === "utility" ? "bg-cyan-950 text-cyan-400 border border-cyan-900/30 font-bold" : "text-gray-400 hover:text-gray-200"}`}
          >
            Utility Feeds
          </button>
        </div>

        {/* Search and Quick Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search cluster, env, provider..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#05091a] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono w-60"
            />
          </div>

          <select
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            className="px-3 py-2 bg-[#05091a] border border-gray-800 rounded-xl text-xs text-gray-300 font-mono focus:outline-none"
          >
            <option value="all">Filter: All</option>
            <option value="active">Filter: Filled Keys</option>
            <option value="missing">Filter: Missing Keys</option>
            <option value="failed">Filter: Warnings & Failed</option>
          </select>
        </div>
      </div>

      {/* Grid of Agent Providers */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-xs text-gray-500 font-mono">Synchronizing Secure Registry Node...</span>
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="p-12 text-center bg-[#070b1a] border border-gray-800/80 rounded-2xl text-gray-500 font-mono text-xs">
          <Info className="w-8 h-8 text-cyan-500/40 mx-auto mb-3" />
          No operational API clusters matched your current search parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProviders.map(p => {
              const statusStyle = getStatusStyle(p.status);
              const totalBackupSlots = p.backupKeyEnvs.length;
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={p.id}
                  className="bg-[#070b1d] border border-gray-850 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-700 transition-all duration-300 relative overflow-hidden"
                  id={`key-card-${p.id}`}
                >
                  {/* Card Background Gradient Glow if Active */}
                  {p.status === "Active" && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                  )}

                  {/* Header Row */}
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-base font-semibold text-white tracking-tight">{p.name}</h3>
                        <span className="text-[10px] text-cyan-400 font-mono tracking-wider block mt-0.5 uppercase">
                          Provider: {p.provider}
                        </span>
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${statusStyle.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                        {statusStyle.text}
                      </span>
                    </div>

                    {/* Env keys details section */}
                    <div className="space-y-2 mt-4 bg-[#040815]/90 p-3 rounded-xl border border-gray-900 text-[11px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Current Key:</span>
                        <span className="text-gray-300 select-all" title={p.currentKeyEnv}>{p.currentKeyMasked}</span>
                      </div>
                      
                      {totalBackupSlots > 0 && (
                        <div className="pt-1 border-t border-gray-900 flex justify-between items-center">
                          <span className="text-gray-500">Backup Slots:</span>
                          <span className="text-xs text-purple-400 font-bold">
                            {p.backupCountFilled} / {totalBackupSlots} filled
                          </span>
                        </div>
                      )}

                      {/* Backup dots indicator */}
                      {totalBackupSlots > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          {p.backups.map(b => (
                            <div 
                              key={b.envName}
                              className={`w-2.5 h-2.5 rounded-full border transition-all ${
                                b.isFilled 
                                  ? "bg-purple-500/20 border-purple-500" 
                                  : "bg-slate-900 border-gray-800"
                              }`}
                              title={`${b.envName}: ${b.masked}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Operational parameters */}
                    <div className="space-y-1.5 mt-4 text-[10px] font-mono text-gray-400">
                      <div className="flex justify-between">
                        <span>Used this month:</span>
                        <span className="text-gray-200">{p.monthlyUsage.toLocaleString()} calls</span>
                      </div>
                      
                      {p.lastUsedAt && (
                        <div className="flex justify-between items-center">
                          <span>Last Activity:</span>
                          <span className="text-gray-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-500" />
                            {new Date(p.lastUsedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-1">
                        <span>Active Key Index:</span>
                        <span className={`px-1.5 py-0.2 rounded font-bold ${p.activeKeyIndex === 0 ? "bg-cyan-950 text-cyan-400" : "bg-purple-950 text-purple-400"}`}>
                          {p.activeKeyIndex === 0 ? "0 (Current Key)" : `${p.activeKeyIndex} (Backup ${p.activeKeyIndex})`}
                        </span>
                      </div>
                    </div>

                    {/* Display Failure messages if any */}
                    {p.lastError && (
                      <div className="mt-4 p-2.5 bg-red-950/20 border border-red-900/40 rounded-xl text-[10px] text-red-400 font-mono leading-relaxed max-h-16 overflow-y-auto">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 inline mr-1" />
                        <strong>Error:</strong> {p.lastError}
                      </div>
                    )}
                  </div>

                  {/* Admin controls and test action triggers */}
                  <div className="mt-5 space-y-2 pt-4 border-t border-gray-900">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleTestConnection(p.id)}
                        disabled={testingId === p.id}
                        className="px-3 py-1.5 bg-[#0a122e] hover:bg-[#121c43] text-cyan-400 font-semibold rounded-lg text-[10px] transition border border-cyan-900/30 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {testingId === p.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3 text-cyan-400" />
                        )}
                        Test Ping
                      </button>

                      <button
                        onClick={() => handleTestConnection(p.id, true)}
                        disabled={simulatingId === p.id || p.status === "Missing"}
                        title="Simulate rate limit / response failure to trigger backup key switch events"
                        className="px-3 py-1.5 bg-amber-950/20 hover:bg-amber-900/20 text-amber-400 font-semibold rounded-lg text-[10px] transition border border-amber-900/30 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {simulatingId === p.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                        ) : (
                          <Sliders className="w-3 h-3 text-amber-500" />
                        )}
                        Fail Key
                      </button>
                    </div>

                    {/* Admin overriding controls */}
                    {localRole === "owner_admin" && (totalBackupSlots > 0 || p.isCurrentKeyFilled) && (
                      <div className="mt-2.5 pt-2.5 border-t border-gray-900 flex flex-col gap-1.5">
                        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Admin Override Priority
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {p.isCurrentKeyFilled && (
                            <button
                              onClick={() => handleUpdatePriority(p.id, 0)}
                              className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition border cursor-pointer ${
                                p.activeKeyIndex === 0
                                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 shadow-sm"
                                  : "bg-slate-900 text-gray-400 border-transparent hover:border-gray-800"
                              }`}
                            >
                              Idx 0 (Current)
                            </button>
                          )}
                          
                          {p.backups.map(b => (
                            <button
                              key={b.envName}
                              disabled={!b.isFilled}
                              onClick={() => handleUpdatePriority(p.id, b.index)}
                              className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition border cursor-pointer disabled:opacity-40 ${
                                p.activeKeyIndex === b.index
                                  ? "bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-sm"
                                  : "bg-slate-900 text-gray-400 border-transparent hover:border-gray-800"
                              }`}
                              title={b.isFilled ? `Set Backup Key ${b.index} active` : `Backup Key ${b.index} is not set`}
                            >
                              Idx {b.index} (B{b.index})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Real-time Crypto Gateway switch event logs */}
      <div className="bg-[#05091a] border border-gray-850 rounded-2xl p-6">
        <div className="flex justify-between items-center border-b border-gray-900 pb-4 mb-4">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Activity className="text-cyan-400 w-4 h-4" /> Cryptographic Failover Stream
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Live audit logs of automatic and manual key switch actions, rate limit failures, and test requests.
            </p>
          </div>

          <button
            onClick={handleClearLogs}
            disabled={logs.length === 0}
            className="px-3 py-1.5 bg-gray-950 hover:bg-gray-900 text-gray-400 hover:text-white rounded-xl text-xs font-mono transition border border-gray-900 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" /> Purge Stream
          </button>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-mono text-xs">
              Waiting for cryptographic connection signals... Try testing a connection or triggering a simulation.
            </div>
          ) : (
            logs.map(log => {
              const badgeStyle = () => {
                switch (log.eventType) {
                  case "failover":
                    return "bg-purple-950 text-purple-400 border-purple-900/40";
                  case "exhaustion":
                    return "bg-rose-950 text-rose-400 border-rose-900/40";
                  case "manual_override":
                    return "bg-cyan-950 text-cyan-400 border-cyan-900/40";
                  default:
                    return "bg-slate-900 text-slate-400 border-gray-850";
                }
              };

              return (
                <div
                  key={log.id}
                  className="p-3 bg-[#070b1e] border border-gray-900 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 hover:border-gray-850 transition"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${badgeStyle()}`}>
                      {log.eventType}
                    </span>
                    <p className="text-xs font-mono text-gray-300 leading-relaxed max-w-3xl">
                      {log.message}
                    </p>
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono flex-shrink-0 self-end md:self-center">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
