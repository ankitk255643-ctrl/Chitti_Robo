import React, { useState, useEffect } from "react";
import { FlameKindling, Search, ArrowRight, Sparkles, Check, HelpCircle } from "lucide-react";
import { PromptTemplate } from "../types";
import Strands from "./Strands";

interface PromptLibraryProps {
  templates: PromptTemplate[];
  onDeployTemplate: (promptText: string) => void;
}

export default function PromptLibrary({
  templates,
  onDeployTemplate,
}: PromptLibraryProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 450);
    return () => clearTimeout(timer);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [deployedId, setDeployedId] = useState<string | null>(null);

  // Derive categories dynamically
  const categories = ["All", ...Array.from(new Set(templates.map((t) => t.category)))];

  const handleDeploy = (tpl: PromptTemplate) => {
    onDeployTemplate(tpl.prompt);
    setDeployedId(tpl.id);
    setTimeout(() => setDeployedId(null), 1500);
  };

  const filtered = templates.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden" id="prism-prompts-wrapper">
      {/* Background Strands Animation */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {showAnimation && (
          <Strands
            colors={["#F97316", "#7C3AED", "#06B6D4"]}
            count={3}
            speed={0.5}
            amplitude={1}
            waviness={1}
            thickness={0.7}
            glow={2.6}
            taper={3}
            spread={1}
            intensity={0.6}
            saturation={1.5}
            opacity={0.35}
            scale={1.5}
            glass={false}
            refraction={1}
            dispersion={1}
            glassSize={1}
          />
        )}
        <div className="absolute inset-0 bg-slate-950/10 pointer-events-none" />
      </div>

      <div id="prism-prompts-library" className="relative z-10 space-y-6 max-w-4xl mx-auto p-1">
        {/* Header banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-3xl font-display font-semibold text-white tracking-tight flex items-center gap-2.5">
              <FlameKindling className="text-purple-400 w-8 h-8 animate-pulse" /> Prism Prompt Vault
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Predefined structural template formulas calibrated to trigger optimized outputs across specialize core agents.
            </p>
          </div>
        </div>

        {/* Searching filters and categories strip */}
        <div className="space-y-4">
          {/* Search Input bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search prompt formulas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#04091a]/15 backdrop-blur-sm border border-gray-850/40 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500 text-gray-300"
              id="prompt-vault-search"
            />
          </div>

          {/* Category tags strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-3 py-1.5 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider transition flex-shrink-0 cursor-pointer
                  ${selectedCategory === cat
                    ? "bg-purple-500 text-gray-950 font-bold"
                    : "bg-slate-950/15 backdrop-blur-sm border border-gray-900/40 text-gray-400 hover:text-white hover:border-gray-800/60"}
                `}
                id={`prompt-cat-filter-${cat.replace(/\s+/g, "-")}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Lists of Templates Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((tpl) => (
            <div
              key={tpl.id}
              className="p-5 rounded-2xl glassmorphism border border-gray-850/40 hover:border-gray-700/60 flex flex-col justify-between group bg-slate-950/15 backdrop-blur-sm"
              id={`prompt-vault-card-${tpl.id}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-950/20 px-2 py-0.5 rounded border border-purple-900/30">
                    {tpl.category}
                  </span>
                  
                  <HelpCircle className="w-4 h-4 text-gray-600 block" />
                </div>

                <h3 className="font-display font-medium text-white text-base mt-3 group-hover:text-cyan-300 transition-colors">
                  {tpl.title}
                </h3>
                
                <p className="text-xs text-gray-400 mt-1.5 font-sans">
                  {tpl.description}
                </p>

                <div className="mt-3.5 p-3 rounded-xl bg-slate-950/15 backdrop-blur-sm border border-gray-900/40 text-xs font-mono select-none">
                  <p className="text-gray-300 line-clamp-3">"{tpl.prompt}"</p>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-900/40 pt-3 flex items-center justify-end">
                <button
                  onClick={() => handleDeploy(tpl)}
                  className={`
                    px-4 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition flex items-center gap-1.5 select-none cursor-pointer
                    ${deployedId === tpl.id
                      ? "bg-emerald-500 text-gray-950 font-bold"
                      : "bg-purple-950/10 hover:bg-purple-950/30 text-purple-400 border border-purple-900/40 hover:border-purple-400"}
                  `}
                  id={`deploy-prompt-formula-${tpl.id}`}
                >
                  {deployedId === tpl.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> DEPLOYED CORE
                    </>
                  ) : (
                    <>
                      Deploy Formula <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
