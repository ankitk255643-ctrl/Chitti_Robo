import React, { useEffect, useState } from "react";
import { 
  Activity, 
  Cpu, 
  Coins, 
  Layers, 
  Play, 
  ArrowRight, 
  RefreshCcw, 
  CheckCircle,
  FileCode,
  Flame,
  Globe,
  Database,
  ArrowUpRight
} from "lucide-react";
import { UsageLog } from "../types";
import CosmicParticleWave from "./ui/CosmicParticleWave";

interface DashboardStatsProps {
  onQuickAction: (actionText: string) => void;
  usageSummary: {
    totalTokens: number;
    totalCalls: number;
    byAgent: Record<string, number>;
    byType: Record<string, number>;
  };
  recentLogs: UsageLog[];
  onRefreshUsage: () => void;
}

export default function DashboardStats({
  onQuickAction,
  usageSummary,
  recentLogs,
  onRefreshUsage,
}: DashboardStatsProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 450);
    return () => clearTimeout(timer);
  }, []);

  const quickActions = [
    { title: "Write code", segment: "Create a fully functional login page with clean states.", icon: FileCode, color: "text-cyan-400" },
    { title: "Generate image prompt", segment: "Generate an image prompt: Cyberpunk cityscape high angle cinematic.", icon: Flame, color: "text-purple-400" },
    { title: "Convert file", segment: "Wants to convert file named report.pdf to target formatting txt.", icon: Layers, color: "text-blue-400" },
    { title: "Search latest news", segment: "Search latest artificial intelligence research articles.", icon: Globe, color: "text-emerald-400" },
  ];

  const agentKeys = Object.keys(usageSummary.byAgent);
  const typeKeys = Object.keys(usageSummary.byType);

  return (
    <div className="relative -m-4 md:-m-8 p-4 md:p-8 min-h-[calc(100vh-4rem)] lg:min-h-screen overflow-x-hidden">
      {/* Dynamic Cosmic Wave Background */}
      {showAnimation && <CosmicParticleWave />}

      <div id="dashboard-statistics" className="relative z-10 space-y-6 max-w-5xl mx-auto pointer-events-none">
        {/* Header and Sync Buttons */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-5 pointer-events-auto">
          <div>
            <h1 className="text-3xl font-display font-semibold text-white tracking-tight flex items-center gap-2.5">
              <Activity className="text-cyan-400 w-8 h-8 animate-pulse" /> Diagnostic Command System
            </h1>
            <p className="text-sm text-gray-400 mt-1">Live metrics, model operational health, token usage allocations, and quick deployment routers.</p>
          </div>
          <button
            onClick={onRefreshUsage}
            className="flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-950/20 border border-cyan-800/30 px-3 py-1.5 rounded-xl hover:bg-cyan-950/40 transition active:scale-95"
            id="refresh-diagnostics-btn"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Re-sync Logs
          </button>
        </div>

        {/* Main Core Indicators Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pointer-events-auto">
          {/* Total Calls */}
          <div className="bg-slate-950/20 backdrop-blur-md border border-white/10 p-5 rounded-2xl relative overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400 tracking-wider font-semibold uppercase">Cluster Calls</span>
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="mt-4">
              <h2 className="text-3xl font-display font-bold text-white font-mono">{usageSummary.totalCalls || 1}</h2>
              <p className="text-[10px] text-gray-500 font-mono mt-1">OPERATIONAL AGENT INVOCATIONS</p>
            </div>
          </div>

          {/* Total Tokens */}
          <div className="bg-slate-950/20 backdrop-blur-md border border-white/10 p-5 rounded-2xl relative overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400 tracking-wider font-semibold uppercase">Token Flow</span>
              <Database className="w-5 h-5 text-purple-400" />
            </div>
            <div className="mt-4">
              <h2 className="text-3xl font-display font-bold text-white font-mono">
                {(usageSummary.totalTokens / 1000).toFixed(1)}k
              </h2>
              <p className="text-[10px] text-gray-500 font-mono mt-1">CUMULATIVE SEMANTIC TOKENS</p>
            </div>
          </div>

          {/* Estimated Cost Mapped */}
          <div className="bg-slate-950/20 backdrop-blur-md border border-white/10 p-5 rounded-2xl relative overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400 tracking-wider font-semibold uppercase">Allocated Cost</span>
              <Coins className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="mt-4">
              <h2 className="text-3xl font-display font-bold text-white font-mono">
                ${(usageSummary.totalTokens * 0.0000015).toFixed(4)}
              </h2>
              <p className="text-[10px] text-gray-500 font-mono mt-1">PLATFORM COMPUTES ($0.01 MAX)</p>
            </div>
          </div>

          {/* Active Nodes */}
          <div className="bg-slate-950/20 backdrop-blur-md border border-white/10 p-5 rounded-2xl relative overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400 tracking-wider font-semibold uppercase">Model Clusters</span>
              <Layers className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="mt-4">
              <h2 className="text-3xl font-display font-bold text-white font-mono">8 / 8</h2>
              <p className="text-[10px] text-gray-500 font-mono mt-1">NODES COMPLETELY SYNCHRONIZED</p>
            </div>
          </div>
        </div>

        {/* Visual Resource Usage Charts (SVGs) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pointer-events-auto">
          {/* Token allocation by agent */}
          <div className="bg-slate-950/20 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <h3 className="font-display font-semibold text-base text-gray-200 mb-4">Token Allocation by Specialized Node</h3>
            
            <div className="space-y-3.5">
              {agentKeys.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 font-mono text-xs">
                  <span>No active allocations. Proceed to chat and spawn transactions.</span>
                </div>
              ) : (
                agentKeys.map((k) => {
                  const amount = usageSummary.byAgent[k] || 0;
                  const percent = Math.min(100, Math.round((amount / (usageSummary.totalTokens || 1)) * 100));
                  return (
                    <div key={k} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-gray-300 truncate max-w-[70%]">{k}</span>
                        <span className="text-gray-400 text-[10px]">{amount.toLocaleString()} t ({percent}%)</span>
                      </div>
                      {/* Visual Bar row */}
                      <div className="h-2 bg-gray-950/60 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Task category chart */}
          <div className="bg-slate-950/20 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <h3 className="font-display font-semibold text-base text-gray-200 mb-4 font-display">Specialized Intent Categorization</h3>
            
            <div className="space-y-3.5">
              {typeKeys.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 font-mono text-xs">
                  <span>Central Core auto-router awaiting tasks to index.</span>
                </div>
              ) : (
                typeKeys.map((t) => {
                  const count = usageSummary.byType[t] || 0;
                  const maxVal = Math.max(...Object.values(usageSummary.byType));
                  const widthPercent = Math.min(100, Math.round((count / (maxVal || 1)) * 100));
                  return (
                    <div key={t} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-gray-300 capitalize">{t.replace("_", " ")}</span>
                        <span className="text-cyan-400 font-bold">{count} trigger{count > 1 ? "s" : ""}</span>
                      </div>
                      {/* Visual Bar row */}
                      <div className="h-2 bg-gray-950/60 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full" 
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Quick Launch Actions */}
        <div className="space-y-3 pt-2 pointer-events-auto">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest block">Quick Operational Deployments</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((qa, i) => {
              const Icon = qa.icon;
              return (
                <button
                  key={i}
                  onClick={() => onQuickAction(qa.segment)}
                  className="text-left group p-4 rounded-xl bg-slate-950/20 backdrop-blur-md hover:bg-slate-900/35 border border-white/10 hover:border-cyan-500/30 transition-all shadow-sm flex flex-col justify-between h-32 relative overflow-hidden"
                >
                  {/* Visual border pulse on hover */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-700/50 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                  
                  <div className="flex items-start justify-between w-full">
                    <div className="p-2 bg-gray-900/50 rounded-lg border border-gray-850 group-hover:border-slate-800 transition">
                      <Icon className={`w-4 h-4 ${qa.color}`} />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-wider block font-semibold">{qa.title}</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-sans line-clamp-1 truncate block">{qa.segment}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Usage Logs History Logs */}
        <div className="bg-slate-950/20 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] pointer-events-auto">
          <h3 className="font-display font-semibold text-base text-gray-200 mb-4 flex items-center gap-2">
            <CheckCircle className="text-cyan-400 w-4 h-4" /> Live Transaction Log History
          </h3>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6 font-mono">No operational logs recorded. Interact using the Central Intelligence chat terminal.</p>
            ) : (
              recentLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition text-xs font-mono"
                >
                  <div className="flex items-center gap-3 truncate max-w-[70%]">
                    <span className="text-cyan-400 bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-900/30 font-bold uppercase text-[9px]">
                      {log.taskType}
                    </span>
                    <span className="text-white truncate font-sans text-xs">{log.description}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400 flex-shrink-0">
                    <span className="text-purple-400 bg-purple-950/25 px-2 py-0.5 rounded-full text-[10px]">{log.agentName}</span>
                    <span className="text-slate-500 text-[10px]">{log.tokensUsed} tokens</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
