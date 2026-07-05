import React from "react";
import { 
  Bot, 
  BrainCircuit, 
  CodeXml, 
  Globe, 
  Compass, 
  FileSearch, 
  FlameKindling, 
  FileOutput, 
  DatabaseBackup, 
  Zap, 
  Layers,
  Coins,
  Cpu
} from "lucide-react";
import { Agent } from "../types";

const iconsMap: any = {
  BrainCircuit: BrainCircuit,
  CodeXml: CodeXml,
  Globe: Globe,
  Compass: Compass,
  FileSearch: FileSearch,
  FlameKindling: FlameKindling,
  FileOutput: FileOutput,
  DatabaseBackup: DatabaseBackup,
  Cpu: Cpu,
  Layers: Layers,
  Bot: Bot
};

interface AgentCenterProps {
  agents: Agent[];
  manualAgentId: string;
  setManualAgentId: (id: string) => void;
  onStartChatWithAgent: (agentId: string) => void;
}

export default function AgentCenter({
  agents,
  manualAgentId,
  setManualAgentId,
  onStartChatWithAgent,
}: AgentCenterProps) {
  return (
    <div id="agent-center-container" className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-white flex items-center gap-2">
            <Cpu className="text-cyan-400 w-8 h-8" /> Specialized Agent Registry
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Browse operational status, benchmarks, and functional targets across all specialized API clusters.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-gray-800">
          <Layers className="text-purple-400 w-4 h-4" />
          <span className="text-xs font-mono text-gray-300">
            Current Router Target:{" "}
            <span className="text-cyan-400 font-bold">
              {manualAgentId === "" ? "Auto-Intelligent Router" : "Forced Manual Selection"}
            </span>
          </span>
          {manualAgentId !== "" && (
            <button
              onClick={() => setManualAgentId("")}
              className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-1.5 py-0.5 rounded ml-2 hover:bg-red-900/30 transition"
              id="clear-manual-routing-registry"
            >
              Reset to Auto
            </button>
          )}
        </div>
      </div>

      {/* Grid of Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => {
          const IconComponent = iconsMap[agent.icon] || Bot;
          const isSelected = manualAgentId === agent.id;

          const getSpeedBadgeStyle = (speed: string) => {
            switch (speed) {
              case "Ultra Fast": return "bg-emerald-950/40 text-emerald-400 border-emerald-900/30";
              case "Fast": return "bg-cyan-950/40 text-cyan-400 border-cyan-900/30";
              case "Balanced": return "bg-amber-950/40 text-amber-400 border-amber-900/30";
              default: return "bg-purple-950/40 text-purple-400 border-purple-900/30";
            }
          };

          const getCostBadgeStyle = (cost: string) => {
            switch (cost) {
              case "Free": return "text-green-400 border-green-950 bg-green-950/10";
              case "Low": return "text-emerald-300 border-emerald-950 bg-emerald-950/10";
              case "Medium": return "text-amber-400 border-amber-950 bg-amber-950/10";
              default: return "text-rose-400 border-rose-910 bg-rose-950/10";
            }
          };

          const getStatusBadgeStyle = (status: string) => {
            if (status === "online") return "bg-emerald-950/20 text-emerald-400 border-emerald-900/30";
            return "bg-rose-950/20 text-rose-400 border-rose-900/30";
          };

          return (
            <div
              key={agent.id}
              className={`
                group p-5 rounded-2xl glassmorphism transition-all duration-300 relative overflow-hidden flex flex-col justify-between
                ${isSelected 
                  ? "border-cyan-500/30 shadow-md shadow-cyan-950/10 bg-gradient-to-br from-[#0c1530] to-[#060a16]" 
                  : "hover:border-gray-700 hover:bg-slate-950/30"}
              `}
              id={`agent-registry-card-${agent.id}`}
            >
              {/* Top Row: Icon + Profile Details */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-gray-900 rounded-xl border border-gray-800 group-hover:border-slate-700 transition">
                    <IconComponent className={`w-6 h-6 ${isSelected ? 'text-cyan-400' : 'text-gray-400 group-hover:text-gray-300'}`} />
                  </div>
                  
                  {/* Status Indicator */}
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadgeStyle(agent.status)}`}>
                    {agent.status}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="font-display font-medium text-lg text-white group-hover:text-cyan-300 transition-colors">
                    {agent.name}
                  </h3>
                  <span className="text-[10px] uppercase font-mono text-cyan-500 tracking-wider font-semibold">
                    Provider: {agent.provider}
                  </span>
                  
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                    {agent.description}
                  </p>

                  <div className="mt-3 p-2 bg-slate-950/60 rounded-xl border border-gray-900 text-xs">
                    <span className="font-semibold text-gray-400 font-display">Optimal Task Profile:</span>{" "}
                    <span className="text-slate-300 font-mono">{agent.bestFor}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Operational Benchmarks */}
              <div className="mt-6 border-t border-gray-900 pt-4 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  {/* Speed Badge */}
                  <span className={`px-2 py-0.5 rounded-full border flex items-center gap-1 ${getSpeedBadgeStyle(agent.speed)}`}>
                    <Zap className="w-3 h-3" /> {agent.speed}
                  </span>
                  {/* Cost Badge */}
                  <span className={`px-2 py-0.5 rounded-full border flex items-center gap-1 ${getCostBadgeStyle(agent.costLevel)}`}>
                    <Coins className="w-3 h-3" /> {agent.costLevel}
                  </span>
                </div>

                {/* Interface Selector Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setManualAgentId(isSelected ? "" : agent.id)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-mono font-semibold select-none cursor-pointer transition
                      ${isSelected
                        ? "bg-cyan-500 text-gray-950 ring-2 ring-cyan-950/50"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"}
                    `}
                    id={`agent-manselect-btn-${agent.id}`}
                  >
                    {isSelected ? "Active Choice" : "Exert Selection"}
                  </button>
                  
                  <button
                    onClick={() => onStartChatWithAgent(agent.id)}
                    className="p-1.5 bg-cyan-950/20 hover:bg-cyan-950/50 border border-cyan-900/30 text-cyan-400 rounded-lg text-xs transition"
                    title="Initialize terminal with model"
                    id={`agent-quickchat-btn-${agent.id}`}
                  >
                    Deploy Channel
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
