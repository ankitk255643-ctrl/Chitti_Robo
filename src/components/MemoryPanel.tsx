import React, { useState, useEffect } from "react";
import { Brain, Plus, Trash2, Calendar, FileText, CheckCircle2, Shield, Search } from "lucide-react";
import { Memory } from "../types";
import CognitiveBlackholeBackground from "./CognitiveBlackholeBackground";

interface MemoryPanelProps {
  memories: Memory[];
  onSaveMemory: (content: string, type: "chat" | "project" | "file" | "user_preference") => Promise<void>;
  onDeleteMemory?: (id: string) => void;
}

export default function MemoryPanel({
  memories,
  onSaveMemory,
  onDeleteMemory,
}: MemoryPanelProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 450);
    return () => clearTimeout(timer);
  }, []);

  const [content, setContent] = useState("");
  const [type, setType] = useState<"chat" | "project" | "file" | "user_preference">("chat");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await onSaveMemory(content, type);
      setContent("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getMemoryTypeIcon = (type: string) => {
    switch (type) {
      case "user_preference": return <Shield className="w-4 h-4 text-emerald-400" />;
      case "project": return <FileText className="w-4 h-4 text-cyan-400" />;
      default: return <Brain className="w-4 h-4 text-purple-400" />;
    }
  };

  const filteredMemories = memories.filter((m) =>
    m.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative p-6 md:p-8 rounded-3xl border border-purple-900/20 bg-[#020308]/40 backdrop-blur-lg shadow-[0_0_60px_-15px_rgba(147,51,234,0.4)] overflow-hidden">
      {/* Background Blackhole Core Animation */}
      {showAnimation && <CognitiveBlackholeBackground />}

      <div id="vector-cognitive-database" className="space-y-6 max-w-4xl mx-auto relative z-10">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-purple-950pb-5">
          <div>
            <h1 className="text-3xl font-display font-semibold tracking-tight text-white flex items-center gap-2.5">
              <Brain className="text-cyan-400 w-8 h-8" /> Cognitive Memory Matrix
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Store critical preferences, guidelines, or constraints. Cognitive facts are semantic vectorized to automatically anchor AI prompts.
            </p>
          </div>
        </div>

        {/* Grid: Create fact vs Browse cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Create Fact */}
          <div className="bg-[#02040b]/60 backdrop-blur-sm p-5 rounded-2xl h-fit border border-purple-950/40 relative z-10">
            <h3 className="font-display font-semibold text-gray-250 mb-3.5 text-base">Inject Cognitive Fact</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest block mb-2">Fact Segment</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="E.g., User is designing responsive portfolio models. Prefers modern layouts with slate accents."
                  rows={4}
                  className="w-full bg-[#030612]/80 border border-gray-850 focus:border-cyan-500 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 text-gray-200 font-sans resize-none"
                  id="memory-insert-input"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest block mb-1.5">Context Categorization</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full bg-[#030612]/80 border border-gray-850 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-gray-300 focus:outline-none"
                >
                  <option value="chat">Conversational Fragment</option>
                  <option value="user_preference">User Preference</option>
                  <option value="project">Project / Architecture Spec</option>
                  <option value="file">Local File Context</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !content.trim()}
                className={`
                  w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-mono text-xs font-bold transition select-none cursor-pointer
                  ${loading || !content.trim()
                    ? "bg-gray-900/60 text-gray-600 cursor-not-allowed border border-gray-800"
                    : "bg-cyan-500 text-gray-950 hover:bg-cyan-400"}
                `}
                id="memory-submit-btn"
              >
                {loading ? (
                  <span>Calculating Vector Matrix...</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Embed & Store Fact
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Search & Display cognitive keys */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search bar inside database */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Filter memory index semantic keys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#02040b]/60 border border-purple-950/40 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500 text-gray-300"
                id="memory-search-input"
              />
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredMemories.length === 0 ? (
                <div className="p-8 rounded-2xl border border-gray-900 border-dashed text-center flex flex-col items-center justify-center space-y-2 mt-4 text-gray-500 font-mono text-xs bg-slate-950/20">
                  <span>No congruent memory fragments logged. Set your parameters now!</span>
                </div>
              ) : (
                filteredMemories.map((mem) => (
                  <div
                    key={mem.id}
                    className="p-4 rounded-xl bg-[#02040b]/40 backdrop-blur-sm border border-purple-950/45 hover:border-purple-800/40 transition flex items-start gap-3 justify-between group"
                    id={`memory-card-${mem.id}`}
                  >
                    <div className="flex items-start gap-3 truncate max-w-[85%]">
                      <div className="p-2.5 bg-[#030612]/80 rounded-lg mt-0.5 border border-purple-950/55">
                        {getMemoryTypeIcon(mem.type)}
                      </div>
                      
                      <div className="text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/20 px-1.5 py-0.5 rounded border border-cyan-900/30">
                            {mem.type.replace("_", " ")}
                          </span>
                          
                          <span className="text-[9px] font-mono text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {new Date(mem.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-xs text-gray-205 mt-2 line-clamp-3 font-sans break-all">
                          {mem.content}
                        </p>
                        
                        <div className="text-[9px] text-gray-550 font-mono mt-1.5 flex items-center gap-1.5 uppercase font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Vector Generated (Cosine Similarity Ready)
                        </div>
                      </div>
                    </div>

                    {onDeleteMemory && (
                      <button
                        onClick={() => onDeleteMemory(mem.id)}
                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-950/10 rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Purge fact"
                        id={`purge-memory-btn-${mem.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
