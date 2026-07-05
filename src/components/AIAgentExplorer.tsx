import React, { useState, useEffect } from "react";
import { 
  Bot, 
  Terminal, 
  Search, 
  SlidersHorizontal, 
  Zap, 
  Copy, 
  Check, 
  Sparkles, 
  Play, 
  Plus, 
  X, 
  ChevronRight, 
  Shield, 
  Cpu, 
  Layers, 
  Code,
  Globe,
  Terminal as CliIcon,
  Workflow,
  MessageSquare,
  Bookmark,
  Share2
} from "lucide-react";

// Massive agency agents data curated from msitarzewski/agency-agents
interface AgencyAgent {
  id: string;
  name: string;
  emoji: string;
  division: string;
  specialty: string;
  whenToUse: string;
  prompt: string;
}

const AGENCY_AGENTS: AgencyAgent[] = [
  // --- ENGINEERING ---
  {
    id: "eng-frontend",
    name: "Frontend Developer",
    emoji: "🎨",
    division: "Engineering",
    specialty: "React/Vue/Angular, UI implementation, performance, Tailwind CSS",
    whenToUse: "Modern web apps, pixel-perfect UIs, Core Web Vitals optimization",
    prompt: "You are the Frontend Developer agent from The Agency. Your mission is to implement pristine, beautiful, and fluid user interfaces using modern web frameworks. You emphasize desktop-first precision, mobile-first design, accessible styling (Tailwind, Radix), and smooth interactive states. Always output production-grade, modular code with responsive layouts, optimal performance benchmarks, and semantic elements."
  },
  {
    id: "eng-backend",
    name: "Backend Architect",
    emoji: "🏗️",
    division: "Engineering",
    specialty: "API design, database schema, scalability, node/express, rust, go",
    whenToUse: "Server-side systems, microservices, cloud database architectures",
    prompt: "You are the Backend Architect agent from The Agency. Your task is to design resilient, secure, and blazing fast server-side application logic. You handle secure API routes, data validation, database schemas, optimized index queries, and OAuth credential management. Always structure your responses with system robustness, rate limiting, secure cookies, and clear error protocols."
  },
  {
    id: "eng-mobile",
    name: "Mobile App Builder",
    emoji: "📱",
    division: "Engineering",
    specialty: "iOS/Android, React Native, Flutter, native APIs",
    whenToUse: "Native and cross-platform mobile application development",
    prompt: "You are the Mobile App Builder agent from The Agency. Your goal is to design highly responsive, gesture-rich mobile applications. You write clear Kotlin, Swift, or TypeScript React Native components with optimized thread allocation, secure local storage, and seamless offline data syncing capability."
  },
  {
    id: "eng-ai",
    name: "AI Engineer",
    emoji: "🤖",
    division: "Engineering",
    specialty: "ML models, LLM pipelines, vector search, embeddings integration",
    whenToUse: "Machine learning integration, advanced semantic processing, Gemini SDK",
    prompt: "You are the AI Engineer agent from The Agency. You specialize in implementing advanced machine learning workflows, RAG systems, dynamic embeddings creation, semantic database searches, and multi-agent routing. You write pure, secure API layers avoiding front-end key leaks."
  },
  {
    id: "eng-devops",
    name: "DevOps Automator",
    emoji: "🚀",
    division: "Engineering",
    specialty: "CI/CD pipelines, Docker, Kubernetes, Cloud Run, monitoring",
    whenToUse: "Infrastructure deployment, automated testing workflows, log tracking",
    prompt: "You are the DevOps Automator agent from The Agency. Your focus is system delivery pipelines and operational health. You automate container compilation, secure secret extraction, multi-stage building, and system logging. You make infrastructure declarative, repeatable, and scalable."
  },
  {
    id: "eng-reviewer",
    name: "Code Reviewer",
    emoji: "👁️",
    division: "Engineering",
    specialty: "Constructive reviews, bug finding, styling, security audits",
    whenToUse: "PR validation, code quality checks, refactoring feedback",
    prompt: "You are the Code Reviewer agent from The Agency. Your role is to perform rigorous, objective, and empathetic code reviews. You look for off-by-one errors, resource leaks, API key exposures, security vulnerabilities, styling anomalies, and unhandled promises. Suggest clear, modular refactoring with line-by-line diffs."
  },
  {
    id: "eng-db",
    name: "Database Optimizer",
    emoji: "🗄️",
    division: "Engineering",
    specialty: "PostgreSQL, MongoDB, indexing, replication, schema migration",
    whenToUse: "Slow query diagnosis, schema restructuring, high-load scaling",
    prompt: "You are the Database Optimizer agent from The Agency. You diagnose execution plan stalls, redundant locks, un-indexed scans, and bloated schemas. You write precise, transaction-wrapped migration scripts and optimized join queries."
  },
  {
    id: "eng-prompt",
    name: "Prompt Engineer",
    emoji: "🧬",
    division: "Engineering",
    specialty: "LLM formatting, structured output schemas, dynamic instruction tuning",
    whenToUse: "System instructions creation, reducing model hallucinations",
    prompt: "You are the Prompt Engineer agent from The Agency. Your specialty is translating vague specifications into highly reliable, deterministic model prompts with clear rules, structural limits, input-output variables, and robust escape boundary controls."
  },

  // --- DESIGN ---
  {
    id: "des-ui",
    name: "UI Designer",
    emoji: "🎯",
    division: "Design",
    specialty: "Visual hierarchy, typography, colors, component design systems",
    whenToUse: "Interface mockups, clean aesthetic layouts, responsive style guides",
    prompt: "You are the UI Designer agent from The Agency. Your mandate is to establish cohesive, polished, and breathtaking visual languages. You paired precise typography weights, balanced negative margins, high-contrast grids, and responsive touch-target density. Every design choice is highly deliberate."
  },
  {
    id: "des-researcher",
    name: "UX Researcher",
    emoji: "🔍",
    division: "Design",
    specialty: "User behavior analysis, cognitive flow, usability testing",
    whenToUse: "Interpreting user feedback, identifying interface friction",
    prompt: "You are the UX Researcher agent from The Agency. Your goal is to analyze customer mental models, isolate interaction friction, run virtual cognitive walkthroughs, and translate behavioral insights into clean, low-latency navigation structures."
  },
  {
    id: "des-whimsy",
    name: "Whimsy Injector",
    emoji: "✨",
    division: "Design",
    specialty: "Micro-interactions, emotional design, playful loading animations, delight",
    whenToUse: "Reducing user friction, adding personality, rewarding completions",
    prompt: "You are the Whimsy Injector agent from The Agency. Your unique specialty is infusing digital interfaces with deep emotional resonance, subtle delightful micro-animations, playful visual cues, and clever easter eggs, all while strictly preserving functional speed and user clarity."
  },

  // --- MARKETING ---
  {
    id: "mkt-growth",
    name: "Growth Hacker",
    emoji: "🚀",
    division: "Marketing",
    specialty: "Viral loops, referral systems, SEO discovery, rapid A/B experiments",
    whenToUse: "Scaling acquisition, lowering customer acquisition cost (CAC)",
    prompt: "You are the Growth Hacker agent from The Agency. You design creative growth loops, automated invite/referral mechanisms, structured attribution funnels, and programmatic SEO models to rapidly acquire and retain customers with minimal spend."
  },
  {
    id: "mkt-reddit",
    name: "Reddit Community Builder",
    emoji: "🤝",
    division: "Marketing",
    specialty: "Authentic sub-community building, value-driven discussion seeding",
    whenToUse: "Building initial brand trust, grassroots organic audience scale",
    prompt: "You are the Reddit Community Builder agent from The Agency. Your mission is to foster organic advocacy. You avoid spammy self-promotion; instead, you craft deep, value-driven technical guides, engage authentically in relevant subreddits, and coordinate product updates organically."
  },
  {
    id: "mkt-seo",
    name: "SEO Specialist",
    emoji: "🔍",
    division: "Marketing",
    specialty: "Technical audits, keyword gap analysis, structured schema data",
    whenToUse: "Boosting organic search visibility, resolving crawl error loops",
    prompt: "You are the SEO Specialist agent from The Agency. You audit robot indexing flags, write responsive JSON-LD schema objects, map semantic intent to keywords, and structure canonical content directories to establish sustainable search authority."
  },

  // --- SALES ---
  {
    id: "sls-outbound",
    name: "Outbound Strategist",
    emoji: "🎯",
    division: "Sales",
    specialty: "Signal-based prospecting, tailored sequences, high-convert outreach",
    whenToUse: "B2B client acquisition, high-value pipeline expansion",
    prompt: "You are the Outbound Strategist agent from The Agency. You draft hyper-personalized, multi-channel outreach campaigns based on business expansion triggers, hiring surges, and tech stack transitions, prioritizing relevance over spam volume."
  },
  {
    id: "sls-engineer",
    name: "Sales Engineer",
    emoji: "🛠️",
    division: "Sales",
    specialty: "Technical solution mapping, sandbox POC scoping, feature matrices",
    whenToUse: "Technical pre-sales calls, security validation, architecture mapping",
    prompt: "You are the Sales Engineer agent from The Agency. You bridge business deliverables and technical capabilities. You construct secure, functional proofs of concept, map feature compatibility grids, and handle technical due diligence."
  },

  // --- PAID MEDIA ---
  {
    id: "pmd-ppc",
    name: "PPC Campaign Strategist",
    emoji: "💰",
    division: "Paid Media",
    specialty: "Google/Meta Ads, budget allocation, account architecture, bidding",
    whenToUse: "Launching paid traffic, restructuring chaotic ad accounts",
    prompt: "You are the PPC Campaign Strategist agent from The Agency. You configure granular campaign structures (Alpha/Beta, Single Keyword Ad Groups, Performance Max), allocate search budgets, optimize target acquisition bids, and audit cost-per-click efficiency."
  },

  // --- PRODUCT ---
  {
    id: "prd-manager",
    name: "Product Manager",
    emoji: "🧭",
    division: "Product",
    specialty: "Product Requirement Documents (PRDs), backlog priority, scope curation",
    whenToUse: "Fleshing out a startup idea, defining sprints, writing PRDs",
    prompt: "You are the Product Manager agent from The Agency. Your duty is defining a clear product scope, writing thorough PRDs with clear user stories, defining strict success metrics, and maintaining feature prioritizations via RICE/Kano frameworks."
  },

  // --- PROJECT MANAGEMENT ---
  {
    id: "pm-shepherd",
    name: "Project Shepherd",
    emoji: "🐑",
    division: "Project Management",
    specialty: "Milestone tracking, blockers removal, cross-team synchronization",
    whenToUse: "Complex release planning, coordinating diverse stakeholder tasks",
    prompt: "You are the Project Shepherd agent from The Agency. You monitor Gantt milestones, identify dependencies, resolve blocker logs, and host crisp, asynchronous status reviews to keep delivery timelines on schedule."
  },

  // --- TESTING ---
  {
    id: "tst-checker",
    name: "Reality Checker",
    emoji: "🔍",
    division: "Testing",
    specialty: "Production certification, edge-case testing, evidence validation",
    whenToUse: "Signing off releases, validating system flows under load",
    prompt: "You are the Reality Checker agent from The Agency. Your mission is to ruthlessly stress-test assumptions. You test security boundary loops, unhandled API rejections, network latency edge cases, and ensure strict compliance metrics before release signoff."
  },

  // --- SECURITY ---
  {
    id: "sec-architect",
    name: "Security Architect",
    emoji: "🛡️",
    division: "Security",
    specialty: "Threat modeling, secure-by-design boundaries, zero trust setup",
    whenToUse: "Designing authorization frameworks, review of microservice keys",
    prompt: "You are the Security Architect agent from The Agency. You map application trust boundaries, trace inputs from user land to SQL interfaces, enforce zero-trust identity checks, and construct defensive code policies."
  },

  // --- SUPPORT ---
  {
    id: "spt-responder",
    name: "Support Responder",
    emoji: "💬",
    division: "Support",
    specialty: "SLA management, empathetic troubleshooting, triage playbooks",
    whenToUse: "Structuring customer success workflows, handling tricky ticket queues",
    prompt: "You are the Support Responder agent from The Agency. You construct clear troubleshooting step paths, respond to user incidents with immense empathy and high technical accuracy, and document root causes for engineering triage."
  },

  // --- SPATIAL COMPUTING ---
  {
    id: "spc-architect",
    name: "XR Interface Architect",
    emoji: "🏗️",
    division: "Spatial Computing",
    specialty: "3D navigation, immersive canvas controls, Unity/WebXR layout systems",
    whenToUse: "Designing spatial dashboards, virtual room layouts, eye-gaze targets",
    prompt: "You are the XR Interface Architect agent from The Agency. You define responsive volumetric layouts, gaze-and-pinch gesture parameters, and ergonomic depth thresholds to ensure highly immersive spatial computer navigation."
  },

  // --- FINANCE ---
  {
    id: "fin-analyst",
    name: "Financial Analyst",
    emoji: "📊",
    division: "Finance",
    specialty: "Cash-flow modeling, three-statement projections, unit economics audits",
    whenToUse: "Fundraising preparation, designing dynamic cost forecast indices",
    prompt: "You are the Financial Analyst agent from The Agency. You model dynamic capital runway models, analyze cost of goods sold (COGS), structure SaaS unit economics, and output precise formulas for forecast index sheets."
  },

  // --- GAME DEVELOPMENT ---
  {
    id: "gmd-designer",
    name: "Game Designer",
    emoji: "🎯",
    division: "Game Development",
    specialty: "Gameplay loop systems, GDD creation, virtual economy balancing",
    whenToUse: "Balancing core game loop levels, scripting custom item pricing",
    prompt: "You are the Game Designer agent from The Agency. You map positive and negative feedback loops, draft clear game design documents, design player retention triggers, and optimize system difficulty curves."
  },

  // --- ACADEMIC ---
  {
    id: "acd-psychologist",
    name: "Psychologist",
    emoji: "🧠",
    division: "Academic",
    specialty: "Cognitive mental models, psychological profiles, behavioral triggers",
    whenToUse: "Validating user empathy models, character creation depth",
    prompt: "You are the Psychologist agent from The Agency. You map cognitive behaviors, design healthy motivation triggers, analyze interaction habits, and help construct multidimensional, realistic character profiles."
  },

  // --- GIS ---
  {
    id: "gis-developer",
    name: "Web GIS Developer",
    emoji: "🌐",
    division: "GIS",
    specialty: "MapLibre GL JS, PostGIS queries, real-time spatial dashboards",
    whenToUse: "Overlaying high-volume coordinates, building operational mapping canvases",
    prompt: "You are the Web GIS Developer agent from The Agency. You construct scalable spatial queries, manage map coordinate reference systems (CRS), configure vector tilesets, and implement real-time coordinate plotting canvases."
  }
];

// List of unique divisions
const DIVISIONS = ["All", ...Array.from(new Set(AGENCY_AGENTS.map(a => a.division)))];

export default function AIAgentExplorer({ onDeployToChat }: { onDeployToChat: (promptText: string, agentName: string) => void }) {
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgencyAgent | null>(null);
  
  // CLI command template tabs
  const [activeCliTab, setActiveCliTab] = useState<"claude" | "cursor" | "antigravity" | "copilot">("claude");
  const [isCloning, setIsCloning] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

  // Simulation State
  const [simulationMission, setSimulationMission] = useState("Draft an elite landing page spec for a decentralized Web3 bank");
  const [selectedSimAgents, setSelectedSimAgents] = useState<string[]>(["eng-frontend", "des-ui", "prd-manager"]);
  const [simulationLogs, setSimulationLogs] = useState<{ agentName: string; emoji: string; text: string; role: string }[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Trigger clone simulation
  const handleSimulateClone = () => {
    setIsCloning(true);
    setTerminalOutput(["$ gh repo clone msitarzewski/agency-agents"]);
    
    setTimeout(() => {
      setTerminalOutput(prev => [...prev, "Cloning into 'agency-agents'..."]);
    }, 400);

    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev, 
        "remote: Enumerating objects: 4529, done.",
        "remote: Counting objects: 100% (4529/4529), done.",
        "remote: Compressing objects: 100% (1482/1482), done.",
        "Receiving objects: 100% (4529/4529), 5.40 MiB | 18.22 MiB/s, done.",
        "Resolving deltas: 100% (2841/2841), done."
      ]);
    }, 1000);

    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev, 
        "\n$ ./scripts/install.sh --tool " + activeCliTab,
        "Scanning workstation dependencies...",
        "Found active installation context. Deploying roster files..."
      ]);
    }, 1800);

    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev, 
        "✅ SUCCESS: Registered 232 agency agents with " + activeCliTab + "!",
        "Ready to execute. You can now use " + (activeCliTab === "claude" ? "'Hey Claude, activate UI Designer'" : "'@ui-designer' in Cursor rules")
      ]);
      setIsCloning(false);
    }, 2800);
  };

  // Run dynamic multi-agent simulation conversation
  const handleRunSimulation = () => {
    if (selectedSimAgents.length === 0) return;
    setIsSimulating(true);
    setSimulationLogs([]);

    const agentsList = selectedSimAgents.map(id => AGENCY_AGENTS.find(a => a.id === id)).filter(Boolean) as AgencyAgent[];
    let turn = 0;
    const maxTurns = agentsList.length * 2;

    const phrases: Record<string, string[]> = {
      "Engineering": [
        "Let's look at the implementation structure. We will want modular TypeScript routes with secure encryption wrappers.",
        "I will set up the responsive Tailwind framework with zero-latency visual rendering.",
        "Excellent. Let's make sure the state is fully persistent via local storage or real-time Firestore sync pipelines."
      ],
      "Design": [
        "For the visual architecture, let's establish high visual contrast with deep indigo backgrounds and space-saving grid cards.",
        "We need delightful feedback. I will introduce micro-transitions to reduce user cognitive load.",
        "I'll structure a clear visual hierarchy with generous negative padding, prioritizing typography weight pairings."
      ],
      "Product": [
        "First, let's clearly scope the MVP targets. We should list key deliverables in a high-fidelity PRD.",
        "Let's rank these features using RICE prioritization so we deliver the absolute ceiling of user intent.",
        "We must trace all user actions back to clear business success KPIs."
      ],
      "GIS": [
        "I will configure the coordinate reference system (CRS) projections to support high-density real-time WebGL maps.",
        "We'll map spatial coordinate datasets with optimized index joints."
      ]
    };

    const getSimPhrase = (agent: AgencyAgent, turnIndex: number) => {
      const categoryPhrases = phrases[agent.division] || [
        "I will coordinate this. Let's ensure high scalability, pristine execution, and clear structural code formatting.",
        "This sounds like a vital objective. Here is my strategic blueprint to complete this mission successfully."
      ];
      return categoryPhrases[turnIndex % categoryPhrases.length] || categoryPhrases[0];
    };

    const runTurn = () => {
      if (turn >= maxTurns) {
        setIsSimulating(false);
        // Final compilation output log
        setSimulationLogs(prev => [
          ...prev,
          {
            agentName: "System Compiler",
            emoji: "⚙️",
            role: "compiler",
            text: `[COMPILE COMPLETED] Combined dispatch outputs successfully. Generated functional system specifications for: "${simulationMission}". Workspace status set to STABLE.`
          }
        ]);
        return;
      }

      const activeAgent = agentsList[turn % agentsList.length];
      const speech = getSimPhrase(activeAgent, Math.floor(turn / agentsList.length));

      setSimulationLogs(prev => [
        ...prev,
        {
          agentName: activeAgent.name,
          emoji: activeAgent.emoji,
          role: activeAgent.division.toLowerCase(),
          text: `"${speech} Regarding '${simulationMission}', I advise we implement clear functional pipelines."`
        }
      ]);

      turn++;
      setTimeout(runTurn, 1500);
    };

    setTimeout(runTurn, 500);
  };

  const handleCopyPrompt = (agent: AgencyAgent) => {
    navigator.clipboard.writeText(agent.prompt);
    setCopiedId(agent.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter logic
  const filteredAgents = AGENCY_AGENTS.filter(agent => {
    const matchesDiv = selectedDivision === "All" || agent.division === selectedDivision;
    const matchesQuery = 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.whenToUse.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDiv && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-gray-100 font-sans" id="ai-agent-explorer">
      
      {/* Visual Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#0c1535] via-[#070b1a] to-[#040610] border border-purple-500/20 relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-widest font-black">
            <Cpu className="w-4 h-4 animate-spin text-purple-400" style={{ animationDuration: "12s" }} />
            The Agency: Specialized AI Specialist Roster
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-display leading-tight">
            AI Agent <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">Command Center</span>
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            Meticulously mapped AI specialist personas inspired by the legendary <strong className="text-purple-300">msitarzewski/agency-agents</strong> repository. Browse custom prompts, simulate collaboration pipelines, or deploy directly to the Intelligence Core.
          </p>
        </div>
        <div className="flex gap-2 relative z-10 shrink-0">
          <a 
            href="https://github.com/msitarzewski/agency-agents" 
            target="_blank" 
            rel="noopener noreferrer"
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-purple-300 border border-purple-950/40 hover:border-purple-500/30 font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-950/10"
          >
            <Code className="w-4 h-4" />
            GitHub Repository
          </a>
        </div>
      </div>

      {/* CLONE SIMULATOR & CLI INSTALLER CONTROL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[#02040a]/90 rounded-2xl border border-purple-500/10 p-5 font-mono text-xs flex flex-col justify-between shadow-xl relative min-h-[280px]">
          <div>
            <div className="flex items-center justify-between border-b border-purple-950/30 pb-3 mb-3">
              <span className="text-[10px] text-purple-400 font-bold flex items-center gap-1.5">
                <CliIcon className="w-3.5 h-3.5 text-cyan-400" />
                DOCKER & AGENT CLI SIMULATOR
              </span>
              <div className="flex gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
              </div>
            </div>

            {/* Selector tabs for CLI commands */}
            <div className="flex border-b border-gray-900 pb-2 mb-3 gap-1.5 overflow-x-auto scrollbar-thin">
              {["claude", "cursor", "antigravity", "copilot"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCliTab(tab as any)}
                  className={`py-1 px-3 rounded uppercase text-[9px] font-mono font-bold transition cursor-pointer shrink-0 ${
                    activeCliTab === tab 
                      ? "bg-purple-950/60 text-purple-300 border border-purple-800/40" 
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab === "claude" ? "Claude Code" : tab === "cursor" ? "Cursor MDC" : tab === "antigravity" ? "Antigravity" : "Copilot"}
                </button>
              ))}
            </div>

            {/* Scrolling virtual terminal output logs */}
            <div className="space-y-1 bg-black/40 p-3 rounded-lg border border-purple-950/20 max-h-[140px] overflow-y-auto min-h-[120px] text-gray-300 pr-1 scrollbar-thin">
              {terminalOutput.length === 0 ? (
                <div className="text-gray-600 italic">
                  <p># Ready to clone and link msitarzewski/agency-agents</p>
                  <p># Select target integration platform above and click Link Repository</p>
                </div>
              ) : (
                terminalOutput.map((log, index) => (
                  <p key={index} className={log.startsWith("✅") ? "text-emerald-400 font-bold" : log.startsWith("$") ? "text-cyan-400 font-semibold" : "text-gray-400"}>
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-950/20 flex items-center justify-between gap-2">
            <span className="text-[10px] text-gray-500 font-mono">
              Targets: <span className="text-purple-300">~/.{activeCliTab}/agents/</span>
            </span>
            <button
              onClick={handleSimulateClone}
              disabled={isCloning}
              className="py-1.5 px-4 rounded-lg bg-purple-500 hover:bg-purple-400 disabled:opacity-40 text-gray-950 font-bold text-[10px] tracking-wider transition cursor-pointer flex items-center gap-1 active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.25)] shrink-0"
            >
              <Play className="w-3 h-3 fill-current" />
              {isCloning ? "LINKING REPO..." : "LINK AGENCY REPO"}
            </button>
          </div>
        </div>

        {/* INTERACTIVE MULTI-AGENT COLLABORATION SANDBOX */}
        <div className="lg:col-span-7 bg-gradient-to-b from-[#0a0f24] to-[#040713] rounded-2xl border border-purple-500/15 p-5 flex flex-col justify-between shadow-xl min-h-[280px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-purple-950/30 pb-3">
              <span className="text-[10px] text-purple-400 font-mono font-bold flex items-center gap-1.5">
                <Workflow className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                AGENCY COLLABORATIVE SIMULATOR (MULTIPLAYER DISPATCH)
              </span>
              <span className="text-[9px] bg-cyan-950/40 text-cyan-400 border border-cyan-800/20 px-1.5 py-0.5 rounded font-mono">
                Multi-Agent Mode
              </span>
            </div>

            {/* Custom input fields */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
              <div className="md:col-span-8 space-y-1">
                <label className="text-[10px] text-gray-400 font-mono">MISSION TARGET OBJECTIVE:</label>
                <input
                  type="text"
                  value={simulationMission}
                  onChange={(e) => setSimulationMission(e.target.value)}
                  placeholder="What is the agency building?"
                  className="w-full bg-[#030612] border border-purple-900/30 rounded-lg py-1.5 px-3 text-gray-200 placeholder-gray-700 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-[10px] text-gray-400 font-mono">DISPATCH AGENTS:</label>
                <div className="relative">
                  <select
                    multiple
                    value={selectedSimAgents}
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions, o => o.value);
                      setSelectedSimAgents(options.slice(0, 3)); // cap to 3
                    }}
                    className="w-full bg-[#030612] border border-purple-900/30 rounded-lg py-1 px-2 text-gray-300 focus:outline-none focus:border-purple-500 text-[10px] h-[34px] overflow-y-auto scrollbar-thin"
                  >
                    {AGENCY_AGENTS.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.emoji} {a.name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-2 bottom-1 text-[8px] text-gray-500 pointer-events-none">
                    Max 3
                  </span>
                </div>
              </div>
            </div>

            {/* Real-time simulation chat stream logs */}
            <div className="bg-[#020408]/80 p-3 rounded-lg border border-purple-950/20 h-[100px] overflow-y-auto text-[11px] font-mono space-y-2 pr-1 scrollbar-thin">
              {simulationLogs.length === 0 ? (
                <p className="text-gray-600 italic text-center pt-6">
                  Select up to 3 agents, declare your target mission, and dispatch the simulation thread.
                </p>
              ) : (
                simulationLogs.map((log, index) => (
                  <div key={index} className="space-y-0.5 border-l border-purple-900/30 pl-2">
                    <span className="font-bold text-cyan-400 text-[10px] flex items-center gap-1">
                      <span>{log.emoji}</span>
                      <span>{log.agentName}</span>
                      <span className="text-[8px] text-gray-600 font-normal">({log.role})</span>
                    </span>
                    <p className="text-gray-300 leading-relaxed">{log.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-950/20 flex items-center justify-between gap-2">
            <div className="flex gap-1 overflow-x-auto max-w-md scrollbar-thin">
              {selectedSimAgents.map(id => {
                const a = AGENCY_AGENTS.find(x => x.id === id);
                if (!a) return null;
                return (
                  <span key={id} className="text-[9px] bg-purple-950/20 text-purple-300 border border-purple-900/40 px-2 py-0.5 rounded-full shrink-0">
                    {a.emoji} {a.name.split(" ")[0]}
                  </span>
                );
              })}
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={isSimulating || selectedSimAgents.length === 0}
              className="py-1.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-gray-950 font-bold text-[10px] tracking-wider transition cursor-pointer flex items-center gap-1 active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.25)] shrink-0"
            >
              <Zap className="w-3 h-3 fill-current" />
              {isSimulating ? "SIMULATING DISPATCH..." : "DISPATCH SIMULATION"}
            </button>
          </div>
        </div>
      </div>

      {/* CORE BROWSER REGISTRY VIEW */}
      <div className="space-y-6">
        
        {/* Search and Filters Hub */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-900 pb-5">
          {/* Custom scroller filters */}
          <div className="flex gap-2.5 overflow-x-auto w-full sm:max-w-4xl pb-1 scrollbar-thin scrollbar-thumb-purple-900">
            {DIVISIONS.map((division) => (
              <button
                key={division}
                onClick={() => setSelectedDivision(division)}
                className={`py-1.5 px-4 rounded-xl text-xs font-semibold tracking-wider font-mono transition border select-none cursor-pointer shrink-0 ${
                  selectedDivision === division
                    ? "bg-purple-500 text-gray-950 border-purple-400 shadow-md"
                    : "bg-slate-950/60 text-gray-400 border-gray-900 hover:border-gray-800 hover:text-white"
                }`}
              >
                {division}
                <span className={`text-[9px] ml-1.5 px-1.5 py-0.2 rounded font-black ${
                  selectedDivision === division ? "bg-purple-600 text-white" : "bg-gray-900 text-gray-500"
                }`}>
                  {division === "All" 
                    ? AGENCY_AGENTS.length 
                    : AGENCY_AGENTS.filter(a => a.division === division).length}
                </span>
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search specialties..."
              className="w-full bg-[#040816]/70 border border-purple-950/40 rounded-xl pl-9.5 pr-4 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2 text-gray-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* BENTO CARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.length === 0 ? (
            <div className="col-span-full py-16 text-center text-gray-500 font-mono border border-dashed border-gray-900 rounded-2xl">
              <SlidersHorizontal className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p>No agency agents matching the current criteria.</p>
              <button onClick={() => { setSearchQuery(""); setSelectedDivision("All"); }} className="text-purple-400 hover:underline mt-1 text-xs">
                Clear all filters
              </button>
            </div>
          ) : (
            filteredAgents.map((agent) => {
              const isSelected = selectedAgent?.id === agent.id;
              return (
                <div
                  key={agent.id}
                  className={`group p-5 rounded-2xl border border-[#151c35] bg-[#070b19]/60 hover:bg-[#0a0f25]/50 transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer hover:border-purple-500/20 hover:shadow-xl hover:shadow-purple-950/5 hover:-translate-y-0.5 ${
                    isSelected ? "ring-2 ring-purple-500/40 border-purple-500/30" : ""
                  }`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="space-y-4">
                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-gray-950 rounded-xl border border-gray-900 group-hover:border-purple-950 transition flex items-center justify-center text-xl shadow-inner">
                        {agent.emoji}
                      </div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-950/40 border border-purple-900/30 text-purple-400">
                        {agent.division}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-base text-white group-hover:text-purple-300 transition duration-150">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {agent.specialty}
                      </p>
                    </div>

                    {/* Best practice target */}
                    <div className="p-2.5 bg-black/40 rounded-xl border border-purple-950/20 text-[11px] leading-relaxed text-gray-400">
                      <span className="font-semibold text-gray-300 font-display block mb-0.5">When To Deploy:</span>
                      <span className="font-mono text-cyan-300/90">{agent.whenToUse}</span>
                    </div>
                  </div>

                  {/* Actions footer wrapper */}
                  <div className="mt-5 pt-3.5 border-t border-gray-950 flex items-center justify-between gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyPrompt(agent);
                      }}
                      className="py-1 px-2.5 rounded bg-purple-950/20 hover:bg-purple-950/40 border border-purple-900/30 hover:border-purple-500/30 text-[10px] text-purple-300 font-mono font-bold transition flex items-center gap-1 active:scale-95"
                    >
                      {copiedId === agent.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          COPIED
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          COPY PROMPT
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeployToChat(agent.prompt, agent.name);
                      }}
                      className="py-1 px-3 rounded bg-purple-500 hover:bg-purple-400 text-gray-950 font-bold text-[10px] tracking-wider transition flex items-center gap-1 active:scale-95"
                    >
                      <Sparkles className="w-3 h-3 fill-current" />
                      DEPLOY IN CHAT
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* AGENT DETAIL DRAWER / OVERLAY MODAL */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-[#070b1a] border border-purple-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin">
            <button
              onClick={() => setSelectedAgent(null)}
              className="absolute top-6 right-6 p-1.5 rounded-full bg-gray-950 hover:bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Core Info Row */}
            <div className="flex items-start gap-4">
              <span className="p-4 bg-slate-950 rounded-2xl border border-purple-950/40 text-3xl shadow-inner shrink-0">
                {selectedAgent.emoji}
              </span>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-950/40 border border-purple-900/30 text-purple-400">
                    {selectedAgent.division}
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">ID: {selectedAgent.id}</span>
                </div>
                <h2 className="text-2xl font-black text-white font-display leading-none">
                  {selectedAgent.name} Agent
                </h2>
              </div>
            </div>

            {/* Specialties & Targets layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-950/15 space-y-1">
                <span className="text-purple-400 font-bold block">SPECIALTIES & TECHNOLOGIES:</span>
                <p className="text-gray-300 font-sans">{selectedAgent.specialty}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-950/15 space-y-1">
                <span className="text-cyan-400 font-bold block">RECOMMENDED TARGETS:</span>
                <p className="text-gray-300 font-sans">{selectedAgent.whenToUse}</p>
              </div>
            </div>

            {/* Main Prompt Instruction Frame */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-purple-400">
                <span className="flex items-center gap-1.5 font-bold">
                  <Bookmark className="w-3.5 h-3.5" />
                  AGENCY SYSTEM PROMPT CODE:
                </span>
                <button
                  onClick={() => handleCopyPrompt(selectedAgent)}
                  className="hover:text-white transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === selectedAgent.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      COPIED TO CLIPBOARD
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      COPY PROMPT
                    </>
                  )}
                </button>
              </div>

              <div className="bg-[#020409] border border-purple-950/30 rounded-2xl p-4 font-mono text-xs text-gray-300 leading-relaxed max-h-48 overflow-y-auto pr-1 scrollbar-thin shadow-inner select-all">
                {selectedAgent.prompt}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-purple-950/25 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedAgent.prompt);
                  setSelectedAgent(null);
                  onDeployToChat(selectedAgent.prompt, selectedAgent.name);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-gray-950 font-bold text-xs tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-97 shadow-[0_0_20px_rgba(168,85,247,0.3)] font-mono uppercase"
              >
                <Sparkles className="w-4 h-4 fill-current animate-pulse" />
                Deploy Persona inside Intelligence Core
              </button>
              
              <button
                onClick={() => {
                  if (!selectedSimAgents.includes(selectedAgent.id)) {
                    setSelectedSimAgents(prev => [...prev.slice(0, 2), selectedAgent.id]);
                  }
                  setSelectedAgent(null);
                }}
                className="py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-950/40 text-gray-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-97"
              >
                <Plus className="w-4 h-4" />
                Add to Sim Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
