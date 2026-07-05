import React, { useState, useEffect, useRef } from "react";
import { 
  Award, 
  BookOpen, 
  Search, 
  FileText, 
  TrendingUp, 
  ShoppingBag, 
  Presentation, 
  Mic, 
  Sparkles, 
  Check, 
  Copy, 
  Download, 
  Cpu, 
  Zap, 
  Volume2, 
  VolumeX, 
  Play, 
  Trash2, 
  FolderLock, 
  Send,
  Loader2,
  AlertCircle
} from "lucide-react";
import { speakText } from "../lib/speech";
import FileUploader from "./FileUploader";
import { AttachedFile } from "../types";
import DottedSurface from "./ui/DottedSurface";

interface AITaskHubProps {
  onNavigateTab?: (tab: string) => void;
  onAddTask?: (taskText: string) => void;
}

export default function AITaskHub({ onNavigateTab, onAddTask }: AITaskHubProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 450);
    return () => clearTimeout(timer);
  }, []);

  // Navigation
  const [activeToolId, setActiveToolId] = useState<string>("resume_builder");
  const [activeSubToolId, setActiveSubToolId] = useState<string>("resume_maker");

  // Inputs state
  const [inputs, setInputs] = useState<Record<string, any>>({
    // Resume & Career Builder
    fullName: "",
    title: "",
    experienceLevel: "Mid-level",
    targetJob: "",
    skills: "",
    experience: "",
    education: "",
    resumeText: "",
    jobDescription: "",
    jobTitle: "",
    companyName: "",
    candidateInfo: "",
    skillsValue: "",
    jobRequirements: "",
    specialties: "",
    accomplishments: "",
    tone: "Professional",
    company: "",
    level: "Mid-level",
    currentSkills: "",
    targetGoal: "",
    portfolioDescription: "",

    // Study Assistant
    topic: "",
    audience: "Beginner / 10-year-old level",
    content: "",
    studyMaterial: "",
    subject: "",
    hours: "2 hours",
    readiness: "Beginner",
    days: "30 days",
    doubt: "",
    examLevel: "University Finals",

    // Research Assistant
    focus: "",
    sourceText: "",
    concept: "",
    claimText: "",
    context: "",
    outline: "",
    authors: "",
    sourceType: "Journal Article",
    publisher: "",
    year: "2025",
    pages: "",
    sourceA: "",
    sourceB: "",
    parameters: "",

    // Document Generator
    purpose: "",
    docTitle: "",
    recipientName: "",
    organization: "",
    customDetails: "",

    // News & Trend Analyzer
    newsText: "",
    newsTopic: "",

    // Marketplace / Product Analyzer
    productName: "",
    productDetails: "",
    targetAudience: "",

    // Presentation Maker
    slidesCount: "7",

    // Voice Command Assistant
    command: ""
  });

  // Output State
  const [generationLoading, setGenerationLoading] = useState<boolean>(false);
  const [generationOutput, setGenerationOutput] = useState<string>("");
  const [generationSuccess, setGenerationSuccess] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string>("");
  const [jarvisAction, setJarvisAction] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [isAutoFilling, setIsAutoFilling] = useState<boolean>(false);
  const [autoFillSuccessMessage, setAutoFillSuccessMessage] = useState<string>("");
  const [savedDocuments, setSavedDocuments] = useState<Array<{id: string, title: string, content: string, category: string, date: string}>>(() => {
    try {
      const saved = localStorage.getItem("task_hub_saved_docs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Form Field Updater
  const handleInputChange = (field: string, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Auto-Fill Handler when file is uploaded
  const handleFileLoaded = async (file: AttachedFile | null) => {
    setAttachedFile(file);
    setAutoFillSuccessMessage("");
    setGenerationError("");

    if (!file) {
      return;
    }

    setIsAutoFilling(true);
    try {
      const response = await fetch("/api/task-hub/auto-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: activeToolId,
          subToolId: activeSubToolId,
          attachedFile: file,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Auto-fill parsing failed.");
      }

      const resData = await response.json();
      if (resData.fields && typeof resData.fields === "object") {
        setInputs(prev => ({
          ...prev,
          ...resData.fields,
        }));
        
        const filledKeys = Object.keys(resData.fields).filter(k => !!resData.fields[k]);
        if (filledKeys.length > 0) {
          setAutoFillSuccessMessage(`Successfully auto-filled ${filledKeys.length} fields from "${file.name}"!`);
        } else {
          setAutoFillSuccessMessage(`Analyzed "${file.name}", but no matching form fields were found.`);
        }
      }
    } catch (error: any) {
      console.error("Auto-fill error:", error);
      setGenerationError("AI Auto-fill warning: " + (error.message || "Failed to parse file details."));
    } finally {
      setIsAutoFilling(false);
    }
  };

  // Saved documents storage
  useEffect(() => {
    localStorage.setItem("task_hub_saved_docs", JSON.stringify(savedDocuments));
  }, [savedDocuments]);

  // Defined Tool Metas
  const tools = [
    {
      id: "resume_builder",
      name: "Resume & Career Builder",
      desc: "Optimize your professional identity, ATS fit, and job readiness.",
      icon: Award,
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-950/20 text-blue-400 border-blue-900",
      subTools: [
        { id: "resume_maker", name: "Resume Maker", icon: FileText },
        { id: "ats_checker", name: "ATS Score Checker", icon: Check },
        { id: "cover_letter", name: "Cover Letter Generator", icon: Sparkles },
        { id: "linkedin_bio", name: "LinkedIn Bio Generator", icon: Zap },
        { id: "job_desc_analyzer", name: "Job Description Analyzer", icon: Search },
        { id: "interview_prep", name: "Interview Q&A Prep", icon: Cpu },
        { id: "skill_gap", name: "Skill Gap Analyzer", icon: TrendingUp },
        { id: "portfolio_improvement", name: "Portfolio Critic", icon: Sparkles }
      ]
    },
    {
      id: "study_assistant",
      name: "AI Study Assistant",
      desc: "Perfect educational partner to synthesize topics and solve doubts.",
      icon: BookOpen,
      color: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-950/20 text-emerald-400 border-emerald-900",
      subTools: [
        { id: "simple_explainer", name: "Explain in Simple Terms", icon: Sparkles },
        { id: "mcq_generator", name: "Generate Practice MCQs", icon: Cpu },
        { id: "short_notes", name: "Generate Revision Notes", icon: FileText },
        { id: "flashcards", name: "Generate Smart Flashcards", icon: Zap },
        { id: "timetable", name: "Study Timetable Maker", icon: TrendingUp },
        { id: "doubt_solver", name: "Doubt Solver", icon: Search },
        { id: "exam_prep", name: "Exam Preparation Mode", icon: Award }
      ]
    },
    {
      id: "research_assistant",
      name: "AI Research Assistant",
      desc: "Fact checking, deep source synthesis, summaries, and reports.",
      icon: Search,
      color: "from-purple-500 to-pink-600",
      bgLight: "bg-purple-950/20 text-purple-400 border-purple-900",
      subTools: [
        { id: "topic_research", name: "Deep Topic Research", icon: Search },
        { id: "source_summary", name: "Academic Source Summary", icon: FileText },
        { id: "pros_cons", name: "Neutral Pros & Cons Analysis", icon: TrendingUp },
        { id: "fact_checking", name: "Fact Checker & Biases Audit", icon: Check },
        { id: "report_generator", name: "Comprehensive Report Builder", icon: FileText },
        { id: "citation_generator", name: "APA/MLA Citation Generator", icon: Sparkles },
        { id: "compare_sources", name: "Compare Multiple Sources", icon: Cpu },
        { id: "deep_analysis", name: "Super Deep-Analysis Mode", icon: Zap }
      ]
    },
    {
      id: "document_generator",
      name: "AI Document Generator",
      desc: "Draft professional proposals, plans, templates, and assignments.",
      icon: FileText,
      color: "from-cyan-500 to-blue-600",
      bgLight: "bg-cyan-950/20 text-cyan-400 border-cyan-900",
      subTools: [
        { id: "formal_letter", name: "Letters & Applications", icon: FileText },
        { id: "business_plan", name: "Business Plans", icon: TrendingUp },
        { id: "project_proposal", name: "Proposals & RFPs", icon: Sparkles },
        { id: "report_draft", name: "Reports & Documentation", icon: FileText },
        { id: "complaint_draft", name: "Legal-style Complaints", icon: Check },
        { id: "assignment_draft", name: "College Assignments", icon: BookOpen },
        { id: "email_draft", name: "Email Draft Sequences", icon: Zap }
      ]
    },
    {
      id: "news_trend_analyzer",
      name: "AI News & Trend Analyzer",
      desc: "Uncover insights in India & global news, stock trends, and biases.",
      icon: TrendingUp,
      color: "from-rose-500 to-orange-600",
      bgLight: "bg-rose-950/20 text-rose-400 border-rose-900",
      subTools: [
        { id: "india_news", name: "India Trend Intel", icon: TrendingUp },
        { id: "global_news", name: "Global News Deep-dive", icon: Search },
        { id: "tech_news", name: "Tech & Silicon Trends", icon: Cpu },
        { id: "ai_news", name: "AI Industry Market Pulse", icon: Sparkles },
        { id: "stocks_crypto", name: "Stocks & Silver Analysis", icon: TrendingUp },
        { id: "news_explainer", name: "Explain News Simply", icon: BookOpen },
        { id: "fake_news_detector", name: "Fake/Biased News Detector", icon: Check }
      ]
    },
    {
      id: "marketplace_analyzer",
      name: "AI Marketplace & Products",
      desc: "Optimized Shopify descriptions, titles, SEO tags, and competitors.",
      icon: ShoppingBag,
      color: "from-amber-500 to-yellow-600",
      bgLight: "bg-amber-950/20 text-amber-400 border-amber-900",
      subTools: [
        { id: "title_generator", name: "Product Title Generator", icon: Sparkles },
        { id: "description_generator", name: "Persuasive Description", icon: FileText },
        { id: "seo_tags", name: "SEO Tags & Meta keywords", icon: Search },
        { id: "price_suggestion", name: "Pricing Strategy Optimizer", icon: TrendingUp },
        { id: "competitor_compare", name: "Competitor Analysis Matrix", icon: Cpu },
        { id: "image_prompt", name: "Product Image Prompt Design", icon: Sparkles },
        { id: "ad_script", name: "Ad Campaign Script Writer", icon: Zap },
        { id: "instagram_post", name: "Instagram Product Caption", icon: ShoppingBag }
      ]
    },
    {
      id: "presentation_maker",
      name: "AI Presentation Maker",
      desc: "Create structured topic outlines, slide scripts, and design plans.",
      icon: Presentation,
      color: "from-violet-500 to-purple-600",
      bgLight: "bg-violet-950/20 text-violet-400 border-violet-900",
      subTools: [
        { id: "ppt_outline", name: "Create PPT Outline", icon: Presentation },
        { id: "slide_text", name: "Generate Slide Bullet Text", icon: FileText },
        { id: "speaker_script", name: "Generate Speaker Scripts", icon: Mic },
        { id: "design_suggestion", name: "Design Theme Suggestions", icon: Sparkles },
        { id: "chart_suggestion", name: "Visual Chart Planners", icon: TrendingUp }
      ]
    },
    {
      id: "voice_command_assistant",
      name: "AI Jarvis Voice Commands",
      desc: "Command simulations: draft tasks, create documents, trigger apps.",
      icon: Mic,
      color: "from-cyan-500 to-teal-500",
      bgLight: "bg-cyan-950/30 text-cyan-300 border-cyan-800",
      subTools: [
        { id: "command_processor", name: "Jarvis Interactive Terminal", icon: Mic }
      ]
    }
  ];

  const activeTool = tools.find(t => t.id === activeToolId) || tools[0];

  // Keep sub-tab in sync if activeToolId changes
  useEffect(() => {
    setActiveSubToolId(activeTool.subTools[0]?.id || "");
  }, [activeToolId]);

  // Form Dispatch Submit to Gemini Backend
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGenerationLoading(true);
    setGenerationOutput("");
    setGenerationError("");
    setGenerationSuccess(false);
    setJarvisAction(null);

    try {
      const response = await fetch("/api/task-hub/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: activeToolId,
          subToolId: activeSubToolId,
          inputs: inputs,
          attachedFile: attachedFile
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "System generated an execution fault.");
      }

      const resData = await response.json();
      setGenerationOutput(resData.result || "");
      setGenerationSuccess(true);

      // Jarvis command processing interceptor
      if (activeToolId === "voice_command_assistant" && resData.parsed) {
        setJarvisAction(resData.parsed);
        executeJarvisCallback(resData.parsed);
      }
    } catch (err: any) {
      setGenerationError(err.message || "Failed to establish network pipeline with AI Command Center.");
    } finally {
      setGenerationLoading(false);
    }
  };

  // Speak Output via browser TTS
  const toggleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      // Clean markdown tags for clear narration
      const textToSpeak = generationOutput
        .replace(/[*#`_\-]/g, "")
        .substring(0, 1000); // safety cap
      speakText(textToSpeak, () => {
        setIsSpeaking(false);
      });
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Execute Jarvis Callbacks
  const executeJarvisCallback = (parsed: any) => {
    if (!parsed || !parsed.success) return;
    
    // Play the speech if vocalized
    if (parsed.speechResponse) {
      speakText(parsed.speechResponse, () => {});
    }

    // Trigger action callbacks
    if (parsed.action === "open_website" && parsed.parameters?.url) {
      setTimeout(() => {
        window.open(parsed.parameters.url, "_blank");
      }, 1500);
    } else if (parsed.action === "search_web" && parsed.parameters?.query) {
      setTimeout(() => {
        window.open(`https://google.com/search?q=${encodeURIComponent(parsed.parameters.query)}`, "_blank");
      }, 1500);
    } else if (parsed.action === "voice_to_task" && parsed.parameters?.content) {
      if (onAddTask) {
        onAddTask(parsed.parameters.content);
      }
    } else if (parsed.action === "create_file" && parsed.parameters?.filename) {
      // Save created file as a simulated saved document in local storage
      const newDoc = {
        id: "jarvis-" + Date.now(),
        title: parsed.parameters.filename,
        content: parsed.parameters.content || "Created empty via Voice sequence.",
        category: "Jarvis File System",
        date: new Date().toLocaleDateString()
      };
      setSavedDocuments(prev => [newDoc, ...prev]);
    }
  };

  // Save document to Local List
  const handleSaveDoc = () => {
    if (!generationOutput) return;
    
    let title = `${activeTool.name} - ${activeSubToolId.replace(/_/g, " ").toUpperCase()}`;
    if (activeToolId === "resume_builder" && inputs.fullName) {
      title = `${inputs.fullName}'s Resume`;
    } else if (activeToolId === "study_assistant" && inputs.topic) {
      title = `${inputs.topic} Revision notes`;
    } else if (inputs.purpose) {
      title = inputs.purpose;
    } else if (inputs.productName) {
      title = `${inputs.productName} Listing`;
    }

    const newDoc = {
      id: "doc-" + Date.now(),
      title,
      content: generationOutput,
      category: activeTool.name,
      date: new Date().toLocaleDateString()
    };

    setSavedDocuments(prev => [newDoc, ...prev]);
  };

  // Delete saved document
  const handleDeleteSavedDoc = (id: string) => {
    setSavedDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Copy to clipboard helper
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generationOutput);
  };

  // Custom high-quality markdown rendering
  const renderFormattedResult = (text: string) => {
    if (!text) return null;
    
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="text-sm font-bold text-cyan-300 mt-4 mb-2 tracking-wide uppercase font-mono">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="text-base font-semibold text-white mt-6 mb-3 border-b border-gray-900 pb-1">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("# ")) {
        return <h2 key={idx} className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mt-8 mb-4 font-display">{line.replace("# ", "")}</h2>;
      }

      // Bullets
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const content = line.substring(2);
        return (
          <div key={idx} className="flex items-start gap-2 my-1.5 pl-2 text-gray-300 text-xs sm:text-sm">
            <span className="text-cyan-500 font-mono mt-1 flex-shrink-0">•</span>
            <span>{formatBoldInline(content)}</span>
          </div>
        );
      }

      // Numbered items
      if (/^\d+\.\s/.test(line)) {
        const content = line.replace(/^\d+\.\s/, "");
        const num = line.match(/^\d+/)?.[0] || "1";
        return (
          <div key={idx} className="flex items-start gap-2 my-1.5 pl-2 text-gray-300 text-xs sm:text-sm">
            <span className="text-indigo-400 font-bold font-mono text-xs mt-0.5">{num}.</span>
            <span>{formatBoldInline(content)}</span>
          </div>
        );
      }

      // Plain paragraph or empty space
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return <p key={idx} className="text-xs sm:text-sm text-gray-300 my-2 leading-relaxed">{formatBoldInline(line)}</p>;
    });
  };

  // Inline formatting helper for bold tags
  const formatBoldInline = (str: string) => {
    if (!str.includes("**")) return str;
    const parts = str.split("**");
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="text-white font-medium bg-cyan-950/20 px-1 py-0.5 rounded text-cyan-300 border border-cyan-900/20">{part}</strong>;
      }
      return part;
    });
  };

  // Dynamic input component rendering based on current tool/subtool selected
  const renderInputForm = () => {
    switch (activeToolId) {
      case "resume_builder":
        if (activeSubToolId === "resume_maker") {
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Candidate Full Name</label>
                  <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. Rahul Sharma" value={inputs.fullName} onChange={(e) => handleInputChange("fullName", e.target.value)} required />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Target Professional Title</label>
                  <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. Senior Frontend Architect" value={inputs.title} onChange={(e) => handleInputChange("title", e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Experience Level</label>
                  <select className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" value={inputs.experienceLevel} onChange={(e) => handleInputChange("experienceLevel", e.target.value)}>
                    <option value="Entry-level">Entry-level / Student</option>
                    <option value="Mid-level">Mid-level Professional</option>
                    <option value="Senior-level">Senior-level Expert</option>
                    <option value="Executive">Executive Leadership</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Target Job Link or Role</label>
                  <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. Staff UI Engineer at Stripe" value={inputs.targetJob} onChange={(e) => handleInputChange("targetJob", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Skills (comma separated)</label>
                <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. React, TypeScript, Next.js, Tailwind, System Design" value={inputs.skills} onChange={(e) => handleInputChange("skills", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Professional Experience & Projects summary</label>
                <textarea rows={4} className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition font-mono resize-none" placeholder="Provide quick notes on your past roles, achievements, and impact..." value={inputs.experience} onChange={(e) => handleInputChange("experience", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Education Summary</label>
                <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. B.Tech in CS - IIT Delhi (2020)" value={inputs.education} onChange={(e) => handleInputChange("education", e.target.value)} />
              </div>
            </div>
          );
        } else if (activeSubToolId === "ats_checker") {
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Paste Your Current Resume Content</label>
                <textarea rows={6} className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition font-mono resize-none" placeholder="Paste all textual content from your current resume PDF..." value={inputs.resumeText} onChange={(e) => handleInputChange("resumeText", e.target.value)} required />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Target Job Description</label>
                <textarea rows={4} className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition font-mono resize-none" placeholder="Paste the complete job description of the role you are targeting..." value={inputs.jobDescription} onChange={(e) => handleInputChange("jobDescription", e.target.value)} required />
              </div>
            </div>
          );
        } else if (activeSubToolId === "cover_letter") {
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Target Job Title</label>
                  <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. Marketing Manager" value={inputs.jobTitle} onChange={(e) => handleInputChange("jobTitle", e.target.value)} required />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Company Name</label>
                  <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. Microsoft" value={inputs.companyName} onChange={(e) => handleInputChange("companyName", e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Candidate Profile summary</label>
                <textarea rows={3} className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition resize-none" placeholder="Briefly introduce yourself and your years of experience..." value={inputs.candidateInfo} onChange={(e) => handleInputChange("candidateInfo", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Target Role core requirements</label>
                <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. Leadership, SEO optimization, growth tracking" value={inputs.jobRequirements} onChange={(e) => handleInputChange("jobRequirements", e.target.value)} />
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">General prompt or input context</label>
                <textarea rows={5} className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition font-mono resize-none" placeholder="Provide extra background details or target keywords to focus on..." value={inputs.currentSkills || inputs.resumeText || ""} onChange={(e) => handleInputChange("currentSkills", e.target.value)} />
              </div>
            </div>
          );
        }

      case "study_assistant":
        if (activeSubToolId === "simple_explainer") {
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Topic or Complex Scientific Principle</label>
                <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. Quantum Entanglement or Inflationary Economics" value={inputs.topic} onChange={(e) => handleInputChange("topic", e.target.value)} required />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Target Audience simplicity level</label>
                <select className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" value={inputs.audience} onChange={(e) => handleInputChange("audience", e.target.value)}>
                  <option value="A 10-year old / absolute beginner">A 10-year old / absolute beginner</option>
                  <option value="A High School Senior">A High School Student</option>
                  <option value="Non-technical Business Executive">Non-technical Business Executive</option>
                  <option value="College Undergraduate">College Undergraduate</option>
                </select>
              </div>
            </div>
          );
        } else if (activeSubToolId === "mcq_generator") {
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Reference Notes or Topic of MCQs</label>
                <textarea rows={5} className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition font-mono resize-none" placeholder="Paste reference lecture text, article, or specify a science topic..." value={inputs.content} onChange={(e) => handleInputChange("content", e.target.value)} required />
              </div>
            </div>
          );
        } else if (activeSubToolId === "timetable") {
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Subject / Examination Goal</label>
                  <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. UPSC Prelims or JEE Advanced Chemistry" value={inputs.subject} onChange={(e) => handleInputChange("subject", e.target.value)} required />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Daily Study Budget</label>
                  <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. 4 hours" value={inputs.hours} onChange={(e) => handleInputChange("hours", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Your Readiness level</label>
                  <select className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" value={inputs.readiness} onChange={(e) => handleInputChange("readiness", e.target.value)}>
                    <option value="Beginner">Beginner (Zero foundation)</option>
                    <option value="Intermediate">Intermediate (Basic revisions needed)</option>
                    <option value="Advanced">Advanced (High-intensity test prep)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Days Remaining</label>
                  <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. 15 days" value={inputs.days} onChange={(e) => handleInputChange("days", e.target.value)} />
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Reference Notes or Doubt text</label>
                <textarea rows={5} className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition font-mono resize-none" placeholder="Provide study material or describe your query/doubt..." value={inputs.doubt || inputs.studyMaterial || ""} onChange={(e) => handleInputChange("doubt", e.target.value)} />
              </div>
            </div>
          );
        }

      case "research_assistant":
        if (activeSubToolId === "topic_research") {
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Research Subject / Topic</label>
                <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. Deep learning breakthroughs in cancer cell segmentation" value={inputs.topic} onChange={(e) => handleInputChange("topic", e.target.value)} required />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Specific Focus or Parameters</label>
                <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. Focus on accuracy vs inference cost in hospital edge servers" value={inputs.focus} onChange={(e) => handleInputChange("focus", e.target.value)} />
              </div>
            </div>
          );
        } else if (activeSubToolId === "compare_sources") {
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Viewpoint or Source A description</label>
                <textarea rows={3} className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition resize-none" placeholder="e.g. Decentralized financial platforms, emphasizing security..." value={inputs.sourceA} onChange={(e) => handleInputChange("sourceA", e.target.value)} required />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Viewpoint or Source B description</label>
                <textarea rows={3} className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition resize-none" placeholder="e.g. Centralized bank architectures, emphasizing consumer safety..." value={inputs.sourceB} onChange={(e) => handleInputChange("sourceB", e.target.value)} required />
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Topic, claim, or source to analyze</label>
                <textarea rows={5} className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition font-mono resize-none" placeholder="Provide raw research guidelines, sources, or claims..." value={inputs.sourceText || inputs.claimText || inputs.topic || ""} onChange={(e) => handleInputChange("sourceText", e.target.value)} />
              </div>
            </div>
          );
        }

      case "document_generator":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Core Document Purpose / Heading</label>
              <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. Partnership proposal with Zenith Logistics" value={inputs.purpose} onChange={(e) => handleInputChange("purpose", e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Recipient Name / Entity</label>
                <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. CEO of Zenith Logistics" value={inputs.recipientName} onChange={(e) => handleInputChange("recipientName", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Organization / Context</label>
                <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. TechFlow Solutions Ltd." value={inputs.organization} onChange={(e) => handleInputChange("organization", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Detailed Specifications & Terms</label>
              <textarea rows={4} className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition resize-none" placeholder="Provide bullet points or custom specifications that must be included in the draft..." value={inputs.customDetails} onChange={(e) => handleInputChange("customDetails", e.target.value)} />
            </div>
          </div>
        );

      case "news_trend_analyzer":
        if (activeSubToolId === "fake_news_detector") {
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Paste News Snippet or Article Text</label>
                <textarea rows={5} className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition font-mono resize-none" placeholder="Paste the claim, viral tweet, or article body to run fact audit..." value={inputs.newsText} onChange={(e) => handleInputChange("newsText", e.target.value)} required />
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Trend Analysis Query / Subject Focus</label>
                <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. Budget 2026 tax changes impact on tech startups" value={inputs.focus || inputs.newsTopic || ""} onChange={(e) => handleInputChange("focus", e.target.value)} required />
              </div>
            </div>
          );
        }

      case "marketplace_analyzer":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Product Name</label>
                <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. EcoSpark Wooden Alarm Clock" value={inputs.productName} onChange={(e) => handleInputChange("productName", e.target.value)} required />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Target Audience</label>
                <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. Eco-conscious home designers" value={inputs.targetAudience} onChange={(e) => handleInputChange("targetAudience", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Product Key USPs & Specifications</label>
              <textarea rows={4} className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition resize-none" placeholder="Provide dimensions, materials, benefits, and special pricing guidelines..." value={inputs.productDetails} onChange={(e) => handleInputChange("productDetails", e.target.value)} required />
            </div>
          </div>
        );

      case "presentation_maker":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Presentation Subject / Title</label>
              <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. Q1 Operations Review and AI Integration plans" value={inputs.topic} onChange={(e) => handleInputChange("topic", e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Target Audience Profile</label>
                <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" placeholder="e.g. Board of Directors and key stakeholders" value={inputs.audience} onChange={(e) => handleInputChange("audience", e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Target Slide Count</label>
                <select className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition" value={inputs.slidesCount} onChange={(e) => handleInputChange("slidesCount", e.target.value)}>
                  <option value="5">5 Slides</option>
                  <option value="7">7 Slides</option>
                  <option value="10">10 Slides</option>
                  <option value="15">15 Slides</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "voice_command_assistant":
        return (
          <div className="space-y-4">
            <div className="bg-[#02050f]/30 backdrop-blur-sm border border-gray-950/40 p-4 rounded-xl">
              <span className="text-[10px] font-mono text-cyan-400 block mb-2 uppercase tracking-widest">💡 Supported Interactive Sequences:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-400 font-mono">
                <div className="flex items-center gap-1.5 bg-[#030718]/40 backdrop-blur-sm p-1.5 rounded border border-gray-900/50"><span className="text-cyan-500">•</span> "Open dashboard" or "Show memory"</div>
                <div className="flex items-center gap-1.5 bg-[#030718]/40 backdrop-blur-sm p-1.5 rounded border border-gray-900/50"><span className="text-cyan-500">•</span> "Search the web for artificial intelligence"</div>
                <div className="flex items-center gap-1.5 bg-[#030718]/40 backdrop-blur-sm p-1.5 rounded border border-gray-900/50"><span className="text-cyan-500">•</span> "Add task Complete react module"</div>
                <div className="flex items-center gap-1.5 bg-[#030718]/40 backdrop-blur-sm p-1.5 rounded border border-gray-900/50"><span className="text-cyan-500">•</span> "Create a file readme.md with content Hello World"</div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">UTTER OR TYPE DIRECTIVE SEQUENCE</label>
              <div className="flex gap-2">
                <input type="text" className="w-full bg-[#02050f]/30 backdrop-blur-sm border border-cyan-950 focus:border-cyan-500 rounded-lg p-3 text-sm text-white focus:outline-none transition font-mono" placeholder="Say 'open dashboard', 'add task Buy silver coins', 'search the web'..." value={inputs.command} onChange={(e) => handleInputChange("command", e.target.value)} required />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 h-auto pb-10 relative overflow-x-hidden min-h-screen" id="ai-task-hub-workspace">
      
      {/* 3D Dotted Surface Waves Background */}
      <div className="absolute inset-0 w-full h-full opacity-80 pointer-events-none z-0 overflow-hidden">
        {showAnimation && <DottedSurface opacity={0.8} dotColor="rgba(255, 255, 255, 0.95)" />}
      </div>

      <div className="relative z-10 space-y-6">
        {/* Top Section */}
        <div className="border-b border-gray-900 pb-5">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] bg-indigo-950/70 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded-full uppercase font-mono font-bold tracking-widest inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Cognitive Workspace Hub
            </span>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-900 px-2 py-0.5 rounded-full uppercase font-mono font-bold tracking-widest inline-flex items-center gap-1">
              Realtime Synthesis Mode Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-white mt-1.5">
            Workspace Studio Suite
          </h1>
          <p className="text-xs text-gray-400 max-w-2xl mt-1 leading-relaxed">
            Unlock high-fidelity document drafting, presentation schemas, research pipelines, and Jarvis voice sequence execution.
          </p>
        </div>

        {/* Grid Layout containing Tool Category Selectors and Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand Tool Selection Panel */}
        <div className="lg:col-span-4 space-y-3">
          <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1.5 pl-1">Operational Workspaces</span>
          <div className="space-y-2">
            {tools.map(tool => {
              const Icon = tool.icon;
              const isActive = activeToolId === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    setActiveToolId(tool.id);
                    setGenerationOutput("");
                    setJarvisAction(null);
                    setAttachedFile(null);
                    setAutoFillSuccessMessage("");
                  }}
                  className={`w-full text-left p-3.5 rounded-xl transition cursor-pointer border flex items-start gap-3.5 group relative ${
                    isActive 
                      ? "bg-cyan-950/20 backdrop-blur-md border-cyan-800/50 shadow-[0_4px_20px_-4px_rgba(6,182,212,0.15)]" 
                      : "bg-[#030612]/15 backdrop-blur-sm border-gray-900/40 hover:bg-gray-900/25 hover:border-gray-800"
                  }`}
                  id={`tool-tab-${tool.id}`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? "bg-cyan-950/80 text-cyan-400" : "bg-gray-950 text-gray-500 group-hover:text-gray-300"} transition`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`block text-xs font-semibold ${isActive ? "text-white" : "text-gray-300 group-hover:text-white"} transition`}>{tool.name}</span>
                    <span className="block text-[10px] text-gray-500 mt-0.5 truncate">{tool.desc}</span>
                  </div>
                  {isActive && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Central Work Area (Inputs & Active Subtools) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-[#05091e]/25 backdrop-blur-md border border-[#141b36]/40 rounded-2xl p-4 sm:p-6 shadow-xl">
            
            {/* Sub-tools Pill Tabs Selection */}
            <div className="mb-6">
              <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2.5">Workspace Sub-modules</span>
              <div className="flex flex-wrap gap-1.5 border-b border-gray-900/60 pb-4">
                {activeTool.subTools.map(sub => {
                  const SubIcon = sub.icon;
                  const isSubActive = activeSubToolId === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveSubToolId(sub.id);
                        setGenerationOutput("");
                        setJarvisAction(null);
                        setAttachedFile(null);
                        setAutoFillSuccessMessage("");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                        isSubActive 
                          ? "bg-cyan-950/35 backdrop-blur-sm text-cyan-400 border border-cyan-800/60" 
                          : "bg-gray-950/20 backdrop-blur-sm text-gray-400 hover:text-white border border-transparent hover:border-gray-900"
                      }`}
                      id={`subtool-tab-${sub.id}`}
                    >
                      <SubIcon className="w-3.5 h-3.5" />
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Custom Form fields */}
            <form onSubmit={handleGenerate} className="space-y-6">
              
              <style>{`
                @keyframes scan {
                  0% { top: 10%; opacity: 0; }
                  10% { opacity: 1; }
                  90% { opacity: 1; }
                  100% { top: 90%; opacity: 0; }
                }
              `}</style>

              <div className="relative">
                {renderInputForm()}
                
                {isAutoFilling && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md rounded-xl flex flex-col items-center justify-center p-6 border border-cyan-500/30 z-20 animate-fade-in min-h-[180px]">
                    <div className="relative w-20 h-20 mb-3">
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/30 animate-spin" />
                      <div className="absolute inset-2 rounded-full border border-cyan-400/50 animate-pulse" />
                      <div className="absolute inset-4 rounded-full bg-cyan-950/40 flex items-center justify-center">
                        <Cpu className="w-6 h-6 text-cyan-400 animate-bounce" />
                      </div>
                      <div className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee]" style={{
                        animation: "scan 2s linear infinite",
                        position: "absolute",
                        top: "50%"
                      }} />
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase mb-1">
                      ⚡ Cognitive AI Extraction
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 text-center max-w-sm">
                      Extracting core details and parameters from your file to auto-populate the form...
                    </span>
                  </div>
                )}
              </div>

              {/* Optional File Attachment */}
              <div className="border-t border-gray-900/60 pt-5 mt-4">
                <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">
                  📁 Attachment (Optional)
                </span>
                <p className="text-[10px] text-gray-400 mb-2.5 leading-relaxed">
                  Attach any supporting PDF, Word document, text file, or image. Gemini will automatically extract its details and analyze it in context.
                </p>
                <FileUploader 
                  attachedFile={attachedFile} 
                  onFileLoaded={(file) => handleFileLoaded(file)} 
                />

                {autoFillSuccessMessage && (
                  <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl flex items-center gap-2.5 text-[11px] text-emerald-400 font-mono animate-fade-in">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
                    <span>{autoFillSuccessMessage}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-gray-900 pt-5 mt-4">
                <span className="text-[10px] font-mono text-gray-500">
                  ⚡ Model execution: gemini-3.5-flash
                </span>
                <button
                  type="submit"
                  disabled={generationLoading}
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-800 disabled:text-gray-500 text-black px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono flex items-center gap-2 transition cursor-pointer select-none active:scale-95"
                  id="task-hub-generate-btn"
                >
                  {generationLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Synthesizing...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-3.5 h-3.5" />
                      Trigger Neural Synthesis
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>

          {/* Error State */}
          {generationError && (
            <div className="bg-rose-950/15 backdrop-blur-sm border border-rose-900/40 text-rose-300 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider font-mono">Execution Error</p>
                <p className="text-xs mt-1 text-rose-300/85">{generationError}</p>
              </div>
            </div>
          )}

          {/* Output Display Terminal Pane */}
          {(generationLoading || generationOutput) && (
            <div className="bg-[#02050f]/45 backdrop-blur-md border border-cyan-950/50 rounded-2xl overflow-hidden shadow-2xl">
              
              {/* Header */}
              <div className="flex items-center justify-between bg-gray-950/40 backdrop-blur-sm border-b border-cyan-950/50 px-4 py-3 select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest font-mono">Output Signal Panel</span>
                </div>
                
                {generationOutput && (
                  <div className="flex items-center gap-1.5">
                    {/* Copy Button */}
                    <button
                      onClick={handleCopyToClipboard}
                      className="p-1.5 hover:bg-gray-900 rounded text-gray-400 hover:text-white transition cursor-pointer"
                      title="Copy Entire Content"
                      id="output-copy-btn"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {/* Speak Narration Button */}
                    <button
                      onClick={toggleSpeak}
                      className={`p-1.5 hover:bg-gray-900 rounded transition cursor-pointer ${isSpeaking ? "text-cyan-400" : "text-gray-400 hover:text-white"}`}
                      title={isSpeaking ? "Stop Narration" : "Listen via Speech Engine"}
                      id="output-speak-btn"
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5 animate-bounce" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                    {/* Save to Local Archive Button */}
                    <button
                      onClick={handleSaveDoc}
                      className="p-1.5 hover:bg-gray-900 rounded text-gray-400 hover:text-white transition cursor-pointer"
                      title="Save to Workspace Archive"
                      id="output-archive-btn"
                    >
                      <FolderLock className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5 max-h-[500px] overflow-y-auto">
                {generationLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                    <div className="text-center">
                      <span className="block text-xs font-mono text-cyan-300 font-semibold uppercase tracking-widest">Generating High Fidelity Matrix</span>
                      <span className="block text-[10px] text-gray-500 font-mono mt-1">Routing sequence variables... Estimating deep consensus...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 prose prose-invert max-w-none">
                    {/* Jarvis Simulation Feedback Block */}
                    {jarvisAction && (
                      <div className="bg-[#0a142c] border border-cyan-800/40 p-4 rounded-xl mb-4 text-xs font-mono">
                        <p className="text-cyan-400 font-bold mb-1">🤖 JARVIS SEQUENCE DECODED:</p>
                        <p className="text-gray-300">"Command Recognized: <span className="text-emerald-400 font-semibold">{jarvisAction.recognizedText}</span>"</p>
                        <p className="text-gray-400 mt-1">Action Dispatched: <span className="text-indigo-300 uppercase font-bold">{jarvisAction.action}</span></p>
                        {jarvisAction.parameters && Object.keys(jarvisAction.parameters).length > 0 && (
                          <pre className="bg-[#030612]/70 text-[10px] p-2 rounded border border-gray-900 mt-2 text-indigo-200">
                            {JSON.stringify(jarvisAction.parameters, null, 2)}
                          </pre>
                        )}
                        <div className="bg-cyan-950/30 p-2 border border-cyan-900/30 rounded mt-3 text-cyan-300">
                          {jarvisAction.speechResponse}
                        </div>
                      </div>
                    )}
                    
                    {/* Rendered Output formatting */}
                    <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line selection:bg-cyan-500 selection:text-black">
                      {renderFormattedResult(generationOutput)}
                    </div>
                  </div>
                )}
              </div>

              {/* Status bar */}
              {generationOutput && (
                <div className="bg-gray-950/40 backdrop-blur-sm border-t border-cyan-950/50 px-4 py-2 flex justify-between items-center text-[10px] font-mono text-gray-500 select-none">
                  <span>Output Length: {generationOutput.length} characters</span>
                  <span className="text-cyan-500">READY FOR EXPORT</span>
                </div>
              )}

            </div>
          )}

          {/* Saved Documents Archive Section */}
          {savedDocuments.length > 0 && (
            <div className="bg-[#030612]/35 backdrop-blur-md border border-gray-900/50 rounded-2xl p-5 shadow-xl">
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase font-mono mb-4 flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-cyan-400" /> Saved Workspace Archive ({savedDocuments.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedDocuments.map(doc => (
                  <div key={doc.id} className="bg-gray-950/20 backdrop-blur-sm border border-gray-900/40 rounded-xl p-3.5 relative hover:border-cyan-900/60 transition flex flex-col justify-between group">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[9px] bg-cyan-950/40 text-cyan-400 border border-cyan-950 px-1.5 py-0.5 rounded uppercase font-mono font-bold">{doc.category}</span>
                        <span className="text-[10px] text-gray-600 font-mono">{doc.date}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white mt-1.5 group-hover:text-cyan-300 transition truncate pr-6">{doc.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-3 leading-relaxed font-mono">{doc.content.substring(0, 150)}...</p>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-900/50">
                      <button
                        onClick={() => {
                          setGenerationOutput(doc.content);
                          setGenerationSuccess(true);
                          setJarvisAction(null);
                        }}
                        className="text-[10px] bg-cyan-950/40 hover:bg-cyan-950 text-cyan-400 px-2 py-1 rounded transition cursor-pointer border border-cyan-900/40 flex items-center gap-1 font-mono"
                      >
                        <Play className="w-2.5 h-2.5" /> Restore
                      </button>
                      <button
                        onClick={() => handleDeleteSavedDoc(doc.id)}
                        className="text-[10px] hover:bg-rose-950/20 text-gray-600 hover:text-rose-400 p-1 rounded transition cursor-pointer ml-auto"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
    </div>
  );
}
