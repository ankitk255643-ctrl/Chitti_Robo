import React, { useState } from "react";
import { 
  Code2, 
  Copy, 
  Check, 
  Settings2, 
  ExternalLink, 
  Laptop, 
  Smartphone, 
  Tablet, 
  Eye, 
  Sparkles, 
  BookOpen, 
  Sliders, 
  Layers,
  ChevronRight,
  Maximize2,
  Minimize2
} from "lucide-react";
import GhostCursor from "./GhostCursor";

export default function EmbedCenter() {
  const [theme, setTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("#22d3ee"); // cyan-400
  const [frameWidth, setFrameWidth] = useState("100%");
  const [frameHeight, setFrameHeight] = useState("650px");
  const [agentId, setAgentId] = useState("default");
  const [showVoice, setShowVoice] = useState(true);
  const [collapsedSidebarDefault, setCollapsedSidebarDefault] = useState(false);
  
  const [activeCodeTab, setActiveCodeTab] = useState<"iframe" | "script" | "react" | "link">("iframe");
  const [copied, setCopied] = useState(false);
  const [isFullHeight, setIsFullHeight] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const appUrl = window.location.origin || "https://omni-gen-ai.cloud";

  // Build the embed query string
  const queryParams = new URLSearchParams();
  if (theme !== "dark") queryParams.append("theme", theme);
  if (accentColor !== "#22d3ee") queryParams.append("accent", accentColor.replace("#", ""));
  if (agentId !== "default") queryParams.append("agent", agentId);
  if (!showVoice) queryParams.append("voice", "false");
  if (collapsedSidebarDefault) queryParams.append("collapsed", "true");

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  const finalEmbedUrl = `${appUrl}${queryString}`;

  // Embedded Code Blocks
  const embedCodes = {
    iframe: `<iframe 
  src="${finalEmbedUrl}" 
  width="${frameWidth}" 
  height="${frameHeight}" 
  style="border: 1px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);" 
  allow="microphone; camera"
  id="chitti-robo-frame"
></iframe>`,

    script: `<!-- Chitti-Robo Embed Target container -->
<div id="chitti-robo-chat" style="width: ${frameWidth}; height: ${frameHeight};"></div>

<!-- Chitti-Robo Embed Handler Script -->
<script>
  (function() {
    var container = document.getElementById('chitti-robo-chat');
    if (container) {
      var iframe = document.createElement('iframe');
      iframe.src = "${finalEmbedUrl}";
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.style.border = "none";
      iframe.style.borderRadius = "12px";
      iframe.allow = "microphone; camera";
      container.appendChild(iframe);
    }
  })();
</script>`,

    react: `import React from 'react';

export function ChittiRoboAIChat() {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      <iframe 
        src="${finalEmbedUrl}" 
        width="${frameWidth}" 
        height="${frameHeight}" 
        style={{ border: 'none' }}
        allow="microphone; camera"
        title="Chitti-Robo Embedded Console"
      />
    </div>
  );
}`,

    link: `${finalEmbedUrl}`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCodes[activeCodeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock site colors based on theme selection
  const mockPrimaryBg = theme === "dark" ? "bg-[#040817]" : theme === "cyberpunk" ? "bg-[#0f051d]" : "bg-white";
  const mockText = theme === "light" ? "text-gray-900" : "text-white";

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden" id="chitti-robo-embed-wrapper">
      {/* Background Ghost Cursor Animation */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <GhostCursor
          color={accentColor}
          brightness={1}
          edgeIntensity={0}
          trailLength={50}
          inertia={0.5}
          grainIntensity={0.05}
          bloomStrength={0.2}
          bloomRadius={1.0}
          bloomThreshold={0.025}
          fadeDelayMs={1000}
          fadeDurationMs={1500}
          zIndex={0}
        />
        <div className="absolute inset-0 bg-slate-950/10 pointer-events-none" />
      </div>

      <div id="chitti-robo-embed-center" className="relative z-10 space-y-6 max-w-7xl mx-auto px-1">

      {/* Elegant Display Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded uppercase font-mono font-bold tracking-widest">WIDGET MATRIX</span>
            <span className="text-[10px] bg-purple-950 text-purple-400 border border-purple-800 px-2 py-0.5 rounded uppercase font-mono font-bold tracking-widest">DEPLOY READY</span>
          </div>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-white flex items-center gap-2.5 mt-2">
            <Code2 className="text-cyan-400 w-8 h-8 animate-pulse" /> Embed & Deploy Center
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            Integrate your custom Chitti-Robo Mega AI Command terminal seamlessly into any site, client dashboard, CRM, or external portal in seconds.
          </p>
        </div>

        <a 
          href={finalEmbedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold hover:bg-cyan-500 hover:text-gray-950 transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/20"
        >
          OPEN STANDALONE LINK <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - Configure Params & Design */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#070b19]/15 backdrop-blur-sm border border-gray-800/40 rounded-2xl p-5 space-y-5 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-900">
              <Settings2 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-mono uppercase tracking-widest text-gray-200">WIDGET CONFIGURATION</h2>
            </div>

            {/* Accent Theme Select */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-mono uppercase tracking-wider block">Visual Theme Accent</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "dark", label: "Midnight Blue", bg: "bg-slate-950 border-slate-800" },
                  { id: "light", label: "Minimal Light", bg: "bg-white border-gray-200 text-gray-950" },
                  { id: "cyberpunk", label: "Neon Glow", bg: "bg-purple-950 border-purple-800" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`p-2.5 rounded-xl border text-[10px] font-bold text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                      theme === t.id 
                        ? "border-cyan-400 text-cyan-400 bg-cyan-950/20 shadow-[0_0_10px_rgba(34,211,238,0.15)]" 
                        : "border-gray-800 hover:border-gray-700 text-gray-400"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${t.id === "dark" ? "bg-cyan-500" : t.id === "light" ? "bg-indigo-600" : "bg-fuchsia-500"}`} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Theme Accent Color Picker */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-mono uppercase tracking-wider block">System Brand Accent</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={accentColor} 
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded border border-gray-800 bg-transparent p-1 cursor-pointer"
                />
                <input 
                  type="text" 
                  value={accentColor} 
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="bg-gray-950 border border-gray-850 rounded-lg p-2 text-xs font-mono text-cyan-400 flex-1 outline-none"
                />
              </div>
            </div>

            {/* Framework Layout Features */}
            <div className="space-y-3 pt-3 border-t border-gray-900/40">
              <label className="text-xs text-gray-400 font-mono uppercase tracking-wider block">Interface Features</label>
              
              {/* Show Voice Component */}
              <div className="flex items-center justify-between p-2.5 bg-gray-950/15 backdrop-blur-sm rounded-xl border border-gray-900/40">
                <div>
                  <span className="text-xs font-medium text-white block">Vocal Synthesis Option</span>
                  <span className="text-[10px] text-gray-500 font-mono">Include voice control button</span>
                </div>
                <button
                  onClick={() => setShowVoice(!showVoice)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${showVoice ? 'bg-cyan-500' : 'bg-gray-800'}`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${showVoice ? 'translate-x-4.5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Sidebar Collapsed state default */}
              <div className="flex items-center justify-between p-2.5 bg-gray-950/15 backdrop-blur-sm rounded-xl border border-gray-900/40">
                <div>
                  <span className="text-xs font-medium text-white block">Compact Mini Sidebar</span>
                  <span className="text-[10px] text-gray-500 font-mono">Collapse sidebar panels by default</span>
                </div>
                <button
                  onClick={() => setCollapsedSidebarDefault(!collapsedSidebarDefault)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${collapsedSidebarDefault ? 'bg-cyan-500' : 'bg-gray-800'}`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${collapsedSidebarDefault ? 'translate-x-4.5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Responsive Frame Sizes */}
            <div className="space-y-3 pt-3 border-t border-gray-900/40">
              <label className="text-xs text-gray-400 font-mono uppercase tracking-wider block">Responsive Dimensions</label>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-mono">FRAME WIDTH</span>
                  <input 
                    type="text" 
                    value={frameWidth} 
                    onChange={(e) => setFrameWidth(e.target.value)}
                    placeholder="100%"
                    className="w-full bg-gray-950 border border-gray-850 rounded-lg p-2 text-xs font-mono text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-mono">FRAME HEIGHT</span>
                  <input 
                    type="text" 
                    value={frameHeight} 
                    onChange={(e) => setFrameHeight(e.target.value)}
                    placeholder="650px"
                    className="w-full bg-gray-950 border border-gray-850 rounded-lg p-2 text-xs font-mono text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Default Agent selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs text-gray-400 font-mono uppercase tracking-wider block">Preselected Agent Link</label>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-850 rounded-lg p-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
              >
                <option value="default">Chitti-Robo Core (Dynamic Classifier)</option>
                <option value="agent-gpt-gemini">General AI Specialist</option>
                <option value="agent-higgsfield">Image Creation Specialist</option>
                <option value="agent-deepsearch">Web Information Agent</option>
                <option value="agent-grok">Interactive Grok Sandbox</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column - Code Output and Interactive Virtual Sandbox */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Code snippet display block */}
          <div className="bg-[#070b19]/15 backdrop-blur-sm border border-gray-800/40 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            
            {/* Tab switchers */}
            <div className="bg-gray-950/15 backdrop-blur-sm px-4 pt-3 flex items-center justify-between border-b border-gray-900/45">
              <div className="flex gap-1.5">
                {[
                  { id: "iframe", label: "IFrame Integration" },
                  { id: "script", label: "JS Widget Script" },
                  { id: "react", label: "React Component" },
                  { id: "link", label: "Raw Terminal Link" }
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setActiveCodeTab(b.id as any)}
                    className={`px-3 py-2 text-xs font-mono transition border-b-2 font-semibold cursor-pointer ${
                      activeCodeTab === b.id 
                        ? "text-cyan-400 border-cyan-400" 
                        : "text-gray-500 border-transparent hover:text-gray-300"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Code section actions */}
              <div className="flex items-center gap-2 mb-2">
                {/* Full view toggle */}
                <button
                  onClick={() => setIsFullHeight(!isFullHeight)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 text-gray-300 hover:text-white hover:border-slate-700 text-[10px] font-mono font-bold rounded-lg transition cursor-pointer"
                  title={isFullHeight ? "Collapse height" : "Show full height"}
                >
                  {isFullHeight ? (
                    <>
                      <Minimize2 className="w-3 h-3 text-cyan-400" /> COMPACT VIEW
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3 h-3 text-cyan-400" /> FULL VIEW
                    </>
                  )}
                </button>

                {/* Easy Copy code action trigger */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/50 border border-cyan-800/40 text-cyan-400 text-[10px] font-mono font-bold rounded-lg hover:bg-cyan-950 transition cursor-pointer"
                  id="copy-embed-code-btn"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> COPIED!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> COPY BLOCK
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Snippet Code block wrapper */}
            <div className="p-4 bg-gray-950/15 backdrop-blur-sm relative">
              <pre className={`text-gray-300 text-[11px] font-mono overflow-x-auto overflow-y-auto whitespace-pre p-4 rounded-xl bg-gray-950 border border-gray-900 transition-all duration-300 ${isFullHeight ? "max-h-none h-auto" : "max-h-[500px]"}`}>
                <code>{embedCodes[activeCodeTab]}</code>
              </pre>
            </div>
          </div>

          {/* Interactive Virtual Sandbox mock client website */}
          <div className="bg-[#070b19]/15 backdrop-blur-sm border border-gray-800/40 rounded-2xl p-5 space-y-4 shadow-xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-900">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-mono uppercase tracking-widest text-gray-200">INTERACTIVE VIRTUAL SANDBOX</h2>
              </div>

              {/* Screen device size selector to simulate responsiveness */}
              <div className="flex bg-gray-950/15 backdrop-blur-sm border border-gray-850/45 rounded-xl p-1 shrink-0 gap-1.5">
                {[
                  { id: "desktop", label: "Desktop View", icon: Laptop },
                  { id: "tablet", label: "Tablet View", icon: Tablet },
                  { id: "mobile", label: "Mobile Device", icon: Smartphone }
                ].map((device) => {
                  const Icon = device.icon;
                  return (
                    <button
                      key={device.id}
                      onClick={() => setPreviewDevice(device.id as any)}
                      className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition cursor-pointer ${
                        previewDevice === device.id
                          ? "bg-cyan-950/55 text-cyan-400 border border-cyan-900/40"
                          : "text-gray-500 hover:text-gray-300 border border-transparent"
                      }`}
                      title={device.label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[10px]">{device.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Virtual Simulated browser mockup card */}
            <div className="bg-gray-950/15 backdrop-blur-sm rounded-xl border border-gray-850/40 p-4 relative overflow-hidden flex flex-col items-center">
              
              {/* Fake web browser framing */}
              <div className="w-full bg-[#050917]/25 backdrop-blur-sm border border-gray-900/40 rounded-xl shadow-lg flex flex-col overflow-hidden max-w-full transition-all duration-300"
                style={{
                  width: previewDevice === "mobile" ? "375px" : previewDevice === "tablet" ? "720px" : "100%"
                }}
              >
                {/* Browser tab line */}
                <div className="bg-[#090e21]/45 backdrop-blur-sm px-4 py-2 border-b border-gray-900/40 flex items-center gap-2 select-none shrink-0">
                  <div className="flex gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <div className="bg-[#040817]/45 px-3 py-0.5 rounded border border-gray-900/40 text-[10px] font-mono text-gray-400 flex items-center gap-1.5 flex-1 max-w-sm mx-auto justify-center">
                    https://yourclientwebsite.com/dashboard
                  </div>
                </div>

                {/* Simulated client page content with embed inside */}
                <div className="p-4 bg-[#05081c]/35 backdrop-blur-sm min-h-[380px] space-y-4 text-white overflow-y-auto">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="text-[10px] font-mono text-purple-400 tracking-wider font-bold">CLIENT ENTERPRISE HUB</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold tracking-tight">Main Command Dashboard</h3>
                    <p className="text-[11px] text-gray-400">
                      Welcome to your operations room. Chitti-Robo helper has been embedded below so you can ask complex tasks natively.
                    </p>
                  </div>

                  {/* Real Live Iframe widget inside mock browser */}
                  <div className="border border-cyan-800/40 rounded-xl overflow-hidden shadow-2xl relative bg-black/15 backdrop-blur-sm"
                    style={{
                      height: "300px"
                    }}
                  >
                    {/* Embedded iframe simulator */}
                    <iframe 
                      src={finalEmbedUrl}
                      title="Simulated Live Preview Widget"
                      className="w-full h-full border-none"
                      allow="microphone; camera"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Integration Guides section */}
          <div className="bg-[#070b19]/15 backdrop-blur-sm border border-gray-850/40 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-900/45">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-mono uppercase tracking-widest text-gray-200">QUICK INTEGRATION GUIDES</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "1. Web (HTML / JS)",
                  desc: "Simply paste the standard Iframe block anywhere in your main body HTML markup, or load it dynamically inside any target container."
                },
                {
                  title: "2. WordPress / Webflow",
                  desc: "Add a custom HTML widget, Embed Block, or Custom Code element, and paste the generated Iframe snippet inside. Done."
                },
                {
                  title: "3. React / Angular / Vue",
                  desc: "Include the standard responsive JSX wrapper or use iframe with sandbox permissions safely loaded via component state handles."
                }
              ].map((guide, idx) => (
                <div key={idx} className="p-3 bg-gray-950/15 backdrop-blur-sm rounded-xl border border-gray-900/40 hover:border-gray-850/60 transition">
                  <h4 className="text-xs font-semibold text-white mb-1">{guide.title}</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{guide.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
    </div>
  );
}
