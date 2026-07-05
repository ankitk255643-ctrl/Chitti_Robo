import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bot, Sparkles, Shield, Zap, Eye, BookOpen, 
  HelpCircle, Globe, RefreshCw, Mail, Check, 
  ChevronRight, Users, Activity, PhoneCall, Award, 
  Moon, Sun, ShieldAlert, FileText, ArrowRight,
  Lock, AlertTriangle, Scale, Info, Search
} from "lucide-react";

// --- Custom Animated Counter Component ---
function AnimatedCounter({ value, duration = 2000, suffix = "" }: { value: string, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  const isFloat = value.includes('.');

  useEffect(() => {
    let start = 0;
    const end = numericValue;
    if (isNaN(end)) return;
    
    const totalSteps = 60;
    const stepTime = duration / totalSteps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      const current = end * progress;
      
      if (step >= totalSteps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [numericValue, duration]);

  return (
    <span>
      {isFloat ? count.toFixed(1) : Math.floor(count)}
      {suffix}
    </span>
  );
}

// --- Interactive SVG Neural Network Background ---
function NeuralNetworkBackground({ isDark }: { isDark: boolean }) {
  const [nodes, setNodes] = useState<{ id: number; x: number; y: number; vx: number; vy: number; radius: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const width = 1200;
    const height = 800;
    const initialNodes = Array.from({ length: 30 }, (_, id) => ({
      id,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 3 + 2
    }));
    setNodes(initialNodes);

    let animationId: number;
    const update = () => {
      setNodes(prev => prev.map(node => {
        let nx = node.x + node.vx;
        let ny = node.y + node.vy;

        // Boundary checks
        if (nx < 0 || nx > width) node.vx *= -1;
        if (ny < 0 || ny > height) node.vy *= -1;

        return {
          ...node,
          x: Math.max(0, Math.min(width, nx)),
          y: Math.max(0, Math.min(height, ny))
        };
      }));
      animationId = requestAnimationFrame(update);
    };

    animationId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        {/* Draw Links */}
        {nodes.map((node1, i) => 
          nodes.slice(i + 1).map(node2 => {
            const dx = node1.x - node2.x;
            const dy = node1.y - node2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              return (
                <line
                  key={`${node1.id}-${node2.id}`}
                  x1={node1.x}
                  y1={node1.y}
                  x2={node2.x}
                  y2={node2.y}
                  stroke={isDark ? "rgba(0, 212, 255, 0.12)" : "rgba(139, 92, 246, 0.15)"}
                  strokeWidth={(1 - dist / 150) * 1.5}
                />
              );
            }
            return null;
          })
        )}
        {/* Draw Nodes */}
        {nodes.map(node => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={node.radius}
            fill={isDark ? (node.id % 2 === 0 ? "#00D4FF" : "#8B5CF6") : (node.id % 2 === 0 ? "#8B5CF6" : "#00FFB2")}
            className="animate-pulse"
            style={{ animationDuration: `${2 + (node.id % 3)}s` }}
          />
        ))}
      </svg>
    </div>
  );
}

// --- Floating AI Particles Component ---
function FloatingParticles() {
  const particles = Array.from({ length: 15 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            background: i % 2 === 0 
              ? "radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)" 
              : "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
            width: Math.random() * 200 + 100,
            height: Math.random() * 200 + 100,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 60 - 30, 0],
            y: [0, Math.random() * 60 - 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 8 + Math.random() * 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function AboutUs() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<"about" | "terms">("about");
  const [termsSearch, setTermsSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection within the section container
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleScroll = () => {
    if (containerRef.current) {
      setScrolled(containerRef.current.scrollTop > 50);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const values = [
    {
      title: "Innovation",
      text: "Constantly exploring new AI technologies to deliver unmatched value and utility.",
      icon: Sparkles,
      color: "from-cyan-500 to-blue-500",
      accent: "text-cyan-400"
    },
    {
      title: "Privacy",
      text: "Your data remains secure, private, and fully protected under modern encryption standards.",
      icon: Shield,
      color: "from-purple-500 to-indigo-500",
      accent: "text-purple-400"
    },
    {
      title: "Transparency",
      text: "We make code explanations and decision flows readable, letting users know how the AI operates.",
      icon: Eye,
      color: "from-green-500 to-emerald-500",
      accent: "text-green-400"
    },
    {
      title: "Accessibility",
      text: "AI should be open and helpful to everyone, bypassing technological complexity with humble UX.",
      icon: BookOpen,
      color: "from-blue-500 to-indigo-500",
      accent: "text-blue-400"
    },
    {
      title: "Reliability",
      text: "Striving for bulletproof, robust architectures that achieve 99.9% availability and stable results.",
      icon: Zap,
      color: "from-yellow-500 to-amber-500",
      accent: "text-yellow-400"
    },
    {
      title: "Continuous Improvement",
      text: "We run ongoing iterations and tuning based heavily on user feedback and community input.",
      icon: RefreshCw,
      color: "from-pink-500 to-rose-500",
      accent: "text-pink-400"
    }
  ];

  const timelineData = [
    {
      year: "2025",
      title: "Started AI Research",
      description: "Assembled an elite squad of cognitive systems developers and researchers to lay down standard pipelines.",
      icon: Bot,
      color: "from-cyan-500 to-blue-500"
    },
    {
      year: "2026",
      title: "Released AI Platform",
      description: "Launched the multi-model hub, connecting advanced logic cores and intuitive generators into one hub.",
      icon: Sparkles,
      color: "from-purple-500 to-indigo-500"
    },
    {
      year: "2027",
      title: "Global Expansion",
      description: "Empowering millions of creators and enterprises across five continents with optimized offline systems.",
      icon: Globe,
      color: "from-green-500 to-emerald-500"
    }
  ];

  const termsSections = [
    {
      id: "sec-1",
      num: "1",
      title: "Acceptance of Terms",
      text: "By accessing and using this website, you agree to comply with and be bound by these Terms and Conditions. If you disagree with any part of these terms, please discontinue using our platforms and AI services immediately.",
      icon: Check
    },
    {
      id: "sec-2",
      num: "2",
      title: "Use of Services",
      text: "Users are strictly required to use this platform for lawful, ethical, and productive purposes. Any form of exploitation is prohibited.",
      prohibitions: [
        "Uploading, installing or injecting malicious software, spyware, or malicious scripts.",
        "Attempting unauthorized system access, structural penetration testing, or brute-forcing accounts.",
        "Copying, reverse-engineering, or scraping proprietary model templates, algorithms, and workspace systems.",
        "Disrupting, overloading, or compromising server stability and standard network gateway parameters."
      ],
      icon: Scale
    },
    {
      id: "sec-3",
      num: "3",
      title: "User Accounts",
      text: "When registering, you are responsible for keeping all security keys, session credentials, and passwords fully secure. You agree to provide accurate and active email configurations, and take full responsibility for any operations initiated through your secure session token.",
      icon: Lock
    },
    {
      id: "sec-4",
      num: "4",
      title: "Intellectual Property",
      text: "All material displayed or hosted on the application, including neural interfaces, graphical outputs, custom vectors, logos, codebase structures, proprietary models, and visual design signatures belong completely to our enterprise unless expressly stated otherwise in writing.",
      icon: Award
    },
    {
      id: "sec-5",
      num: "5",
      title: "AI Generated Content",
      text: "All calculations, chat responses, templates, and multimedia representations rendered by the AI models are generated dynamically. They may contain inconsistencies, bias, or computational inaccuracies.",
      warnings: [
        "Users are strongly urged to cross-examine and verify critical files, data streams, and legal papers before making actions.",
        "The platform assumes no liability or financial responsibility for actions, loss of service, or decisions taken based on AI predictions."
      ],
      icon: AlertTriangle
    },
    {
      id: "sec-6",
      num: "6",
      title: "Privacy",
      text: "Protecting your information is a core value of our company. All telemetry logs, custom data, and user conversations are stored using rigid local or database state parameters. Processing strictly follows our comprehensive, standard Privacy Policy guidelines.",
      icon: Shield
    },
    {
      id: "sec-7",
      num: "7",
      title: "Limitation of Liability",
      text: "Under no legal conditions shall our team, partners, or developers be held responsible for any indirect, special, punitive, incidental, or consequential damages resulting from the use or inability to access our operational tools.",
      icon: ShieldAlert
    },
    {
      id: "sec-8",
      num: "8",
      title: "Service Availability",
      text: "We constantly target a seamless 99.9% server uptime and minimal delay. However, we cannot guarantee completely uninterrupted operations, live availability, or instant execution response speeds during scheduled server maintenance periods.",
      icon: Activity
    },
    {
      id: "sec-9",
      num: "9",
      title: "Changes to Terms",
      text: "We reserve the absolute right to alter or update these Terms and Conditions at any time. We will publish updates clearly on this dashboard. Your continuous, active utilization of our platforms represents complete consensus to all changes.",
      icon: RefreshCw
    },
    {
      id: "sec-10",
      num: "10",
      title: "Contact Information",
      text: "If you have any constructive questions, feedback, or need clarification regarding these official guidelines, please contact our core support branch:",
      contacts: [
        { label: "Core Email Support", value: "support@example.com" },
        { label: "Official Web Portal", value: "www.example.com" }
      ],
      icon: Mail
    }
  ];

  const filteredTerms = termsSections.filter(sec => 
    sec.title.toLowerCase().includes(termsSearch.toLowerCase()) ||
    sec.text.toLowerCase().includes(termsSearch.toLowerCase()) ||
    (sec.prohibitions && sec.prohibitions.some(p => p.toLowerCase().includes(termsSearch.toLowerCase())))
  );

  return (
    <div 
      ref={containerRef}
      id="about-us-module"
      className={`relative w-full h-full overflow-y-auto font-sans transition-colors duration-500 select-none
        ${isDarkMode ? "bg-[#0B1020] text-gray-200" : "bg-[#F8FAFC] text-slate-800"}`}
    >
      {/* 1. Header Sticky Navigation */}
      <nav className={`sticky top-0 z-30 transition-all duration-300 w-full px-6 py-4 flex items-center justify-between
        ${scrolled 
          ? (isDarkMode ? "bg-[#0B1020]/90 backdrop-blur-md border-b border-cyan-500/10 shadow-lg" : "bg-[#F8FAFC]/90 backdrop-blur-md border-b border-slate-200/80 shadow-md") 
          : "bg-transparent border-b border-transparent"}`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 blur-sm opacity-70 animate-pulse"></div>
            <Bot className={`relative w-6 h-6 ${isDarkMode ? "text-[#00D4FF]" : "text-[#8B5CF6]"}`} />
          </div>
          <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            OMNIGEN CORE
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className={`p-1 rounded-full flex gap-1 border 
          ${isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-slate-100 border-slate-200"}`}
        >
          <button
            onClick={() => setActiveTab("about")}
            className={`px-5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 flex items-center gap-2
              ${activeTab === "about"
                ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md shadow-cyan-500/15"
                : (isDarkMode ? "text-gray-400 hover:text-white" : "text-slate-600 hover:text-slate-900")}`}
          >
            <Info className="w-3.5 h-3.5" /> About Us
          </button>
          <button
            onClick={() => setActiveTab("terms")}
            className={`px-5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 flex items-center gap-2
              ${activeTab === "terms"
                ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md shadow-cyan-500/15"
                : (isDarkMode ? "text-gray-400 hover:text-white" : "text-slate-600 hover:text-slate-900")}`}
          >
            <FileText className="w-3.5 h-3.5" /> Terms & Conditions
          </button>
        </div>

        {/* Mode Toggle Button */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer
            ${isDarkMode 
              ? "bg-slate-900/50 border-slate-800 text-yellow-400 hover:bg-slate-900" 
              : "bg-white border-slate-200 text-purple-600 hover:bg-slate-50 shadow-sm"}`}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </nav>

      {/* Background Visual Artifacts */}
      <NeuralNetworkBackground isDark={isDarkMode} />
      <FloatingParticles />

      {/* --- CONTENT BLOCK --- */}
      <AnimatePresence mode="wait">
        {activeTab === "about" ? (
          <motion.div
            key="about-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="relative max-w-7xl mx-auto px-6 py-12 space-y-24 z-10"
          >
            {/* 2. Hero Section */}
            <header className="text-center max-w-3xl mx-auto space-y-6 pt-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border bg-cyan-500/5 border-cyan-500/20 text-cyan-400"
              >
                <Sparkles className="w-3 h-3 text-[#00D4FF]" /> Cognitive Synergy Hub
              </motion.div>
              
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300">
                Building the Future with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400">
                  Artificial Intelligence
                </span>
              </h1>
              
              <p className={`text-base sm:text-lg leading-relaxed font-normal
                ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}
              >
                We create intelligent AI-powered solutions that simplify learning, automate work, and help businesses grow faster.
              </p>
            </header>

            {/* 3. Mission & Vision (Glassmorphism Cards) */}
            <section className="grid md:grid-cols-2 gap-8">
              {/* Mission */}
              <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ duration: 0.3 }}
                className={`relative group p-8 rounded-[20px] overflow-hidden border transition-all duration-300
                  ${isDarkMode 
                    ? "bg-[#111936]/45 backdrop-blur-md border-[#1F2954]/60 shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:border-cyan-500/30" 
                    : "bg-white/80 backdrop-blur-md border-slate-200 shadow-xl shadow-slate-200/50 hover:border-purple-500/30"}`}
              >
                {/* Border glowing aura */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all duration-500" />
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-2xl mb-3 tracking-tight">
                      Our Mission
                    </h3>
                    <p className={`leading-relaxed text-sm sm:text-base
                      ${isDarkMode ? "text-gray-300" : "text-slate-600"}`}
                    >
                      Our mission is to make Artificial Intelligence accessible to everyone by creating innovative tools that improve productivity, education, and creativity.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Vision */}
              <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ duration: 0.3 }}
                className={`relative group p-8 rounded-[20px] overflow-hidden border transition-all duration-300
                  ${isDarkMode 
                    ? "bg-[#111936]/45 backdrop-blur-md border-[#1F2954]/60 shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:border-[#8B5CF6]/30" 
                    : "bg-white/80 backdrop-blur-md border-slate-200 shadow-xl shadow-slate-200/50 hover:border-purple-500/30"}`}
              >
                {/* Border glowing aura */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500" />
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-2xl mb-3 tracking-tight">
                      Our Vision
                    </h3>
                    <p className={`leading-relaxed text-sm sm:text-base
                      ${isDarkMode ? "text-gray-300" : "text-slate-600"}`}
                    >
                      We envision a future where AI works alongside humans to solve complex problems while remaining ethical, transparent, and beneficial for society.
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* 4. Values Section (6 Cards with gradient overlays) */}
            <section className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
                  Our Core Values
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 mx-auto rounded-full" />
                <p className={`max-w-2xl mx-auto text-sm sm:text-base
                  ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}
                >
                  The fundamental pillars that anchor our designs, logic models, and technical innovations.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {values.map((v, i) => {
                  const IconComp = v.icon;
                  return (
                    <motion.div
                      key={v.title}
                      whileHover={{ y: -5, scale: 1.02 }}
                      transition={{ duration: 0.25 }}
                      className={`relative overflow-hidden p-6 rounded-[20px] border transition-all duration-300 flex flex-col justify-between h-56
                        ${isDarkMode 
                          ? "bg-[#111936]/35 backdrop-blur-md border-[#1F2954]/50 hover:border-cyan-500/20 shadow-lg" 
                          : "bg-white border-slate-200 hover:border-purple-500/20 shadow-md shadow-slate-100"}`}
                    >
                      {/* Animated gradient border on dark theme */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="space-y-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${v.color} text-white shadow-md`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <h4 className="font-display font-bold text-lg tracking-tight">
                          {v.title}
                        </h4>
                        <p className={`text-xs sm:text-sm leading-relaxed
                          ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                        >
                          {v.text}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* 5. Statistics Section (Animated counters) */}
            <section className={`rounded-[24px] p-8 md:p-12 border relative overflow-hidden
              ${isDarkMode 
                ? "bg-gradient-to-r from-[#111936] to-[#0A0E23] border-[#1F2954]/60 shadow-[0_10px_40px_rgba(0,0,0,0.5)]" 
                : "bg-gradient-to-r from-white to-slate-50 border-slate-200 shadow-xl shadow-slate-200/50"}`}
            >
              {/* background design line */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-green-400 opacity-60" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center relative z-10">
                <div className="space-y-2">
                  <div className="font-display font-black text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    <AnimatedCounter value="100000" suffix="K+" />
                  </div>
                  <p className={`text-xs sm:text-sm uppercase tracking-wider font-semibold font-mono
                    ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                  >
                    Active Users
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="font-display font-black text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                    <AnimatedCounter value="250" suffix="+" />
                  </div>
                  <p className={`text-xs sm:text-sm uppercase tracking-wider font-semibold font-mono
                    ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                  >
                    AI Features
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="font-display font-black text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                    <AnimatedCounter value="99.9" suffix="%" />
                  </div>
                  <p className={`text-xs sm:text-sm uppercase tracking-wider font-semibold font-mono
                    ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                  >
                    Uptime
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="font-display font-black text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 animate-pulse">
                    <span className="font-mono">24/7</span>
                  </div>
                  <p className={`text-xs sm:text-sm uppercase tracking-wider font-semibold font-mono
                    ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                  >
                    Support Line
                  </p>
                </div>
              </div>
            </section>

            {/* 6. Timeline */}
            <section className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
                  Our Journey
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 mx-auto rounded-full" />
                <p className={`max-w-2xl mx-auto text-sm sm:text-base
                  ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}
                >
                  From inception to standard scale: how we created global intelligence architectures.
                </p>
              </div>

              {/* Vertical / Horizontal Timeline Layout */}
              <div className="relative border-l-2 border-slate-800/60 ml-4 md:ml-0 md:border-l-0 md:grid md:grid-cols-3 gap-8 py-4">
                {timelineData.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={item.year} className="relative pl-8 md:pl-0 md:text-center space-y-4 mb-12 md:mb-0">
                      {/* Anchor Node */}
                      <div className="absolute left-[-11px] md:left-1/2 md:-translate-x-1/2 top-1.5 w-5 h-5 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-400/35">
                        <div className="w-2 h-2 rounded-full bg-cyan-400" />
                      </div>
                      
                      <div className="space-y-2">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
                          {item.year}
                        </span>
                        <h4 className="font-display font-extrabold text-xl tracking-tight">
                          {item.title}
                        </h4>
                        <p className={`text-xs sm:text-sm leading-relaxed max-w-md md:mx-auto
                          ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 7. CTA Section */}
            <section className={`relative rounded-[24px] p-8 md:p-12 overflow-hidden border text-center space-y-8
              ${isDarkMode 
                ? "bg-gradient-to-br from-[#121b3a] via-[#0b1022] to-[#0d132a] border-cyan-500/15" 
                : "bg-gradient-to-br from-white via-slate-50 to-slate-100 border-slate-200 shadow-xl shadow-slate-200/50"}`}
            >
              <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="max-w-xl mx-auto space-y-4 relative z-10">
                <h3 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
                  Ready to Build with AI?
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed
                  ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}
                >
                  Tap into the computing synergy core. Initiate workflows, build interactive maps, process structures, and translate systems in seconds.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
                <button
                  onClick={() => alert("Welcome to the Neural Network Core!")}
                  className="px-8 py-3 rounded-full text-sm font-bold tracking-wide text-white bg-gradient-to-r from-[#00D4FF] via-[#8B5CF6] to-[#00FFB2] hover:opacity-90 active:scale-95 transition-all duration-300 shadow-[0_4px_20px_rgba(0,212,255,0.3)] cursor-pointer"
                >
                  Get Started
                </button>
                <button
                  onClick={() => setActiveTab("terms")}
                  className={`px-8 py-3 rounded-full text-sm font-bold tracking-wide border transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer
                    ${isDarkMode 
                      ? "border-slate-800 text-gray-300 bg-slate-900/40 hover:bg-slate-900" 
                      : "border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-sm"}`}
                >
                  Learn More
                </button>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="terms-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="relative max-w-5xl mx-auto px-6 py-12 space-y-12 z-10"
          >
            {/* Terms Hero */}
            <header className="text-center max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border bg-purple-500/5 border-purple-500/20 text-purple-400">
                <Scale className="w-3.5 h-3.5 text-[#8B5CF6]" /> Official Guidelines
              </div>
              <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight">
                Terms & Conditions
              </h1>
              <p className={`text-xs sm:text-sm leading-relaxed
                ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
              >
                Last updated: July 2026. Please read these platform guidelines carefully to understand account responsibilities, data security standards, and AI processing parameters.
              </p>
            </header>

            {/* Live Search Term guidelines */}
            <div className="max-w-md mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-500" />
              </div>
              <input
                type="text"
                value={termsSearch}
                onChange={(e) => setTermsSearch(e.target.value)}
                placeholder="Search terms, keyword or section..."
                className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 transition-all duration-300
                  ${isDarkMode 
                    ? "bg-slate-900/55 border-slate-800 text-gray-200 placeholder-slate-500 focus:border-cyan-500/40 focus:ring-cyan-500/40" 
                    : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-purple-500/40 focus:ring-purple-500/40 shadow-sm"}`}
              />
              {termsSearch && (
                <button
                  onClick={() => setTermsSearch("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-500 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Terms List Stack */}
            <div className="space-y-6">
              {filteredTerms.length > 0 ? (
                filteredTerms.map((sec, index) => {
                  const SvgIcon = sec.icon;
                  return (
                    <motion.div
                      key={sec.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative p-6 rounded-[20px] border transition-all duration-300
                        ${isDarkMode 
                          ? "bg-[#111936]/35 backdrop-blur-md border-[#1F2954]/50 shadow-lg hover:border-cyan-500/15" 
                          : "bg-white border-slate-200 hover:border-purple-500/15 shadow-sm"}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-xl text-white shadow-md flex-shrink-0
                          ${isDarkMode ? "bg-gradient-to-br from-cyan-500/10 to-purple-600/10 text-cyan-400 border border-slate-800" : "bg-gradient-to-br from-purple-500 to-indigo-600"}`}>
                          <SvgIcon className="w-5 h-5" />
                        </div>
                        
                        <div className="space-y-3 w-full">
                          <h3 className="font-display font-bold text-lg tracking-tight flex items-center gap-2">
                            <span className="text-cyan-400 font-mono text-xs px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/30">
                              {sec.num}
                            </span>
                            {sec.title}
                          </h3>
                          
                          <p className={`text-xs sm:text-sm leading-relaxed
                            ${isDarkMode ? "text-gray-300" : "text-slate-600"}`}
                          >
                            {sec.text}
                          </p>

                          {/* Specific list render for Service Use prohibitions */}
                          {sec.prohibitions && (
                            <ul className="grid sm:grid-cols-2 gap-2 mt-3 pl-1">
                              {sec.prohibitions.map((p, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-rose-400/90 leading-tight">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* Specific list render for AI Generated Content warnings */}
                          {sec.warnings && (
                            <ul className="space-y-2 mt-3 pl-1 border-l-2 border-yellow-500/30">
                              {sec.warnings.map((w, i) => (
                                <li key={i} className={`flex items-start gap-2 text-xs leading-relaxed pl-3
                                  ${isDarkMode ? "text-yellow-400/80" : "text-amber-800/90"}`}>
                                  <Info className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                  <span>{w}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* Specific list render for Contact Details */}
                          {sec.contacts && (
                            <div className="grid sm:grid-cols-2 gap-4 mt-3">
                              {sec.contacts.map((c, i) => (
                                <div key={i} className={`p-3 rounded-xl border flex flex-col justify-center
                                  ${isDarkMode ? "bg-slate-900/55 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                                  <span className={`text-[10px] font-mono uppercase tracking-wider
                                    ${isDarkMode ? "text-gray-500" : "text-slate-400"}`}>
                                    {c.label}
                                  </span>
                                  <span className="text-xs sm:text-sm font-bold text-cyan-400 font-mono">
                                    {c.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-900/40 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-400">No guidelines match "{termsSearch}". Try another keywords.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FOOTER SECTION --- */}
      <footer className={`border-t relative z-10 py-12 px-6
        ${isDarkMode ? "bg-[#070B19] border-[#151C35]" : "bg-slate-100 border-slate-200"}`}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <span className="font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400">
                OMNIGEN AI
              </span>
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed max-w-sm
              ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>
              Optimizing business systems and cognitive automation workflows with transparent, resilient, and secure offline AI.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-display font-bold text-sm tracking-wide">Quick Nav</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => { setActiveTab("about"); containerRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }} 
                  className={`hover:text-cyan-400 transition ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab("terms"); containerRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }} 
                  className={`hover:text-cyan-400 transition ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-slate-400"}`}>API Integration</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-display font-bold text-sm tracking-wide">Contact Branch</h5>
            <ul className="space-y-2 text-xs font-mono">
              <li className={isDarkMode ? "text-gray-400" : "text-slate-600"}>support@example.com</li>
              <li className={isDarkMode ? "text-gray-400" : "text-slate-600"}>www.example.com</li>
              <li className="text-cyan-400 font-bold">24/7 Global Core</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-slate-800/40 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Omnigen AI Inc. All rights reserved globally.</p>
          <div className="flex gap-4">
            <span className="hover:text-cyan-400 transition cursor-pointer">Security Protocol</span>
            <span className="hover:text-cyan-400 transition cursor-pointer">SLA Core</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
