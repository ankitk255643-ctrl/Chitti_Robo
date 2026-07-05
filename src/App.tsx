import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import Sidebar from "./components/Sidebar";
import LandingPage from "./components/LandingPage";
import DashboardStats from "./components/DashboardStats";
import ChatWindow from "./components/ChatWindow";
import VoiceRecorder from "./components/VoiceRecorder";
import AgentCenter from "./components/AgentCenter";
import MemoryPanel from "./components/MemoryPanel";
import PromptLibrary from "./components/PromptLibrary";
import EmbedCenter from "./components/EmbedCenter";
import WhatsAppAutomation from "./components/WhatsAppAutomation";
import TrendIntelligence from "./components/TrendIntelligence";
import ImagineStudio from "./components/ImagineStudio";
import OnlineContentAnalyzer from "./components/OnlineContentAnalyzer";
import AIAssetAnalyzer from "./components/AIAssetAnalyzer";
import FileConverter from "./components/FileConverter";
import AITaskHub from "./components/AITaskHub";
import IndianAirspaceLive from "./components/IndianAirspaceLive";
import RealTimeIntelHub from "./components/RealTimeIntelHub";
import SubscriptionBillingHub from "./components/SubscriptionBillingHub";
import AdminControlPanel from "./components/AdminControlPanel";
import APIKeyHealth from "./components/APIKeyHealth";
import AuthPage from "./components/AuthPage";
import SimulationMaker from "./components/SimulationMaker";
import CuriosityArena from "./components/CuriosityArena";
import ClimateGlobe from "./components/ClimateGlobe";
import VirtualScreening from "./components/VirtualScreening";
import OmnigenApp from "./omnigen/OmnigenApp";
import AboutUs from "./components/AboutUs";
import AIAgentExplorer from "./components/AIAgentExplorer";
import { DEFAULT_AGENTS } from "./defaultAgents";
import { Chat, Message, Agent, Memory, UsageLog, PromptTemplate, AttachedFile } from "./types";
import { speakText } from "./lib/speech";
import { Lock, Zap, ExternalLink } from "lucide-react";

export default function App() {
  const isIframe = typeof window !== "undefined" && window.self !== window.top;
  const [currentTab, setCurrentTab] = useState<string>("landing");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("chitti_robo_authenticated") === "true";
  });
  
  // Real active States Map
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>("chat-default");
  const [messages, setMessages] = useState<Message[]>([]);
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([]);
  const [usageSummary, setUsageSummary] = useState<any>({
    totalTokens: 0,
    totalCalls: 0,
    byAgent: {},
    byType: {}
  });
  const [recentLogs, setRecentLogs] = useState<UsageLog[]>([]);
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    avatar_url: string;
    role?: string;
  }>({
    name: "Master Commander",
    email: "commander@chitti-robo.ai",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120",
    role: "user"
  });
  
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [manualAgentId, setManualAgentId] = useState<string>("agent-gpt-gemini");
  const [recentVoiceCommands, setRecentVoiceCommands] = useState<string[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<any>({ planId: "free_trial", status: "active" });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [voiceButtonsShut, setVoiceButtonsShut] = useState<boolean>(() => {
    return localStorage.getItem("voice_buttons_shut") === "true";
  });

  const handleToggleVoiceButtonsShut = () => {
    setVoiceButtonsShut((prev) => {
      const nextVal = !prev;
      localStorage.setItem("voice_buttons_shut", String(nextVal));
      return nextVal;
    });
  };

  // Periodical sync triggers
  useEffect(() => {
    fetchProfile();
    fetchAgents();
    fetchPromptLibrary();
    fetchChats();
    fetchMemories();
    fetchUsageStats();
    checkHealth();
    fetchSubscription();

    const intervalId = setInterval(() => {
      checkHealth();
      fetchUsageStats();
      fetchSubscription();
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  // Sync messages whenever activeChatId changes
  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    }
  }, [activeChatId]);

  const checkHealth = async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setIsOnline(data.status === "healthy");
    } catch (e) {
      setIsOnline(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setProfile(data);
    } catch (e) {
      console.warn("Could not sync profile metadata:", e);
    }
  };

  const handleToggleAdminRole = async () => {
    try {
      const targetRole = profile?.role === "owner_admin" ? "user" : "owner_admin";
      const res = await fetch("/api/profile/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole })
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error("Failed to toggle admin role:", err);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("chitti_robo_authenticated");
  };

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/subscription");
      const data = await res.json();
      if (data.success) {
        setActiveSubscription(data.subscription);
        if (data.profile) {
          setProfile((prev: any) => ({ ...prev, ...data.profile }));
        }
      }
    } catch (e) {
      console.warn("Could not sync subscription details:", e);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      setAgents(data);
    } catch (e) {
      console.warn("Could not register agents registry list:", e);
    }
  };

  const fetchPromptLibrary = async () => {
    try {
      const res = await fetch("/api/prompt-library");
      const data = await res.json();
      setPromptTemplates(data);
    } catch (e) {
      console.warn("Could not retrieve prompt templates library:", e);
    }
  };

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/chats");
      const data = await res.json();
      setChats(data);
      if (data.length > 0 && activeChatId === "chat-default") {
        setActiveChatId(data[0].id);
      }
    } catch (e) {
      console.warn("Could not list operational thread logs:", e);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      console.warn("Could not stream messages history stack:", e);
    }
  };

  const fetchMemories = async () => {
    try {
      const res = await fetch("/api/memories");
      const data = await res.json();
      setMemories(data);
    } catch (e) {
      console.warn("Could not retrieve cognitive preference arrays:", e);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const res = await fetch("/api/usage");
      const data = await res.json();
      setUsageSummary(data.summary);
      setRecentLogs(data.logs);
    } catch (e) {
      console.warn("Could not update diagnostics summaries:", e);
    }
  };

  // Operational Chat Handlers
  const handleNewChat = async (title?: string) => {
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || `Dynamic Socket #${chats.length + 1}` }),
      });
      const data = await res.json();
      setChats((prev) => [data, ...prev]);
      setActiveChatId(data.id);
      setCurrentTab("chat");
    } catch (e) {
      console.error("Could not spawn conversation session:", e);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await fetch(`/api/chats/${chatId}`, { method: "DELETE" });
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      // Fallback
      if (activeChatId === chatId) {
        const remaining = chats.filter((c) => c.id !== chatId);
        if (remaining.length > 0) {
          setActiveChatId(remaining[0].id);
        } else {
          handleNewChat("Chitti-Robo Operational Command");
        }
      }
    } catch (e) {
      console.error("Could not clear specific thread logs:", e);
    }
  };

  const executeSendMessage = async (text: string, file: AttachedFile | null = null) => {
    if (!text && !file) return;

    // Direct UI Feedback: Pre-render User Message representation
    const tempUserMsg: Message = {
      id: `temp-msg-${Date.now()}`,
      chatId: activeChatId,
      role: "user",
      content: text || `Uploaded a file: ${file?.name}`,
      createdAt: new Date().toISOString(),
      file: file || undefined,
    };
    
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoadingMessages(true);

    // Direct WhatsApp automation interceptor
    const lowerText = text.trim().toLowerCase();
    const isWhatsappCommand = 
      lowerText.startsWith("send message:") || 
      lowerText.startsWith("whatsapp:") ||
      lowerText.startsWith("send whatsapp:") ||
      lowerText.startsWith("send message to my friend:") ||
      lowerText.startsWith("message my friend:") ||
      lowerText.startsWith("msg friend:");
      
    if (isWhatsappCommand) {
      let msgBody = "";
      if (lowerText.startsWith("send message:")) msgBody = text.substring("send message:".length).trim();
      else if (lowerText.startsWith("whatsapp:")) msgBody = text.substring("whatsapp:".length).trim();
      else if (lowerText.startsWith("send whatsapp:")) msgBody = text.substring("send whatsapp:".length).trim();
      else if (lowerText.startsWith("send message to my friend:")) msgBody = text.substring("send message to my friend:".length).trim();
      else if (lowerText.startsWith("message my friend:")) msgBody = text.substring("message my friend:".length).trim();
      else if (lowerText.startsWith("msg friend:")) msgBody = text.substring("msg friend:".length).trim();

      if (msgBody) {
        const defaultHost = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
        const host = localStorage.getItem("waha_host") || defaultHost;
        const apiKey = localStorage.getItem("waha_api_key") || "00000000000000000000000000000000";
        const session = localStorage.getItem("waha_session") || "default";
        const friendPhone = localStorage.getItem("waha_friend_phone");
        const friendName = localStorage.getItem("waha_friend_name") || "My Friend";

        if (!friendPhone) {
          setTimeout(() => {
            const errMsg: Message = {
              id: `wa-err-${Date.now()}`,
              chatId: activeChatId,
              role: "assistant",
              content: "⚠️ **WhatsApp Command Intercepted!**\n\n*Aapka WhatsApp message process karne ke liye please first parameters set kijiye!*\n\nNavigate to **WA Automation** tab and configure your Friend's Phone Number first so I know who to transmit this to.",
              agentUsed: "WhatsApp Core Router",
              createdAt: new Date().toISOString()
            };
            setMessages((prev) => [...prev, errMsg]);
            setIsLoadingMessages(false);
          }, 600);
          return;
        }

        try {
          const response = await fetch("/api/whatsapp/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ host, apiKey, session, chatId: friendPhone, text: msgBody })
          });
          const resData = await response.json();
          
          const storedLogs = JSON.parse(localStorage.getItem("waha_logs") || "[]");
          const newLog = {
            id: `wa-log-${Date.now()}`,
            recipient: `${friendName} (${friendPhone})`,
            text: msgBody,
            status: response.ok && resData.success ? "success" : "failed",
            timestamp: new Date().toLocaleTimeString(),
            type: "text"
          };
          localStorage.setItem("waha_logs", JSON.stringify([newLog, ...storedLogs]));

          const assistantReply: Message = {
            id: `wa-assistant-${Date.now()}`,
            chatId: activeChatId,
            role: "assistant",
            content: response.ok && resData.success 
              ? `✅ **WhatsApp Message Sent successfully!**\n\n**To:** ${friendName} (${friendPhone})\n**Message:** "${msgBody}"\n\n*Aapka message broadcast ho chuka hai! Maine waha local gateway par send request trigger kar di thi.*`
              : `❌ **WhatsApp Message Transmission failed!**\n\n**Error Details:** ${resData.error || "Connection timed out."}\n\n*Check kijiye ki aapka WAHA local Docker container running hai aur settings sahi hain.*`,
            agentUsed: "WhatsApp Core Router",
            createdAt: new Date().toISOString()
          };

          setMessages((prev) => [...prev, assistantReply]);

          if ("speechSynthesis" in window) {
            speakText(response.ok && resData.success ? "Maine message update kar ke send kar diya hai!" : "WhatsApp transmission failed");
          }

        } catch (err: any) {
          const assistantReply: Message = {
            id: `wa-assistant-err-${Date.now()}`,
            chatId: activeChatId,
            role: "assistant",
            content: `❌ **WhatsApp Connection Timeout!**\n\nCould not reach the local Docker container running at \`${host}\`.\n\n**Error:** ${err.message || "Network Error"}\n\n*Please ensure you ran:* \`docker run -p 3000:3000 --name waha devlikeapro/waha\` or your custom configured host path is correct.`,
            agentUsed: "WhatsApp Core Router",
            createdAt: new Date().toISOString()
          };
          setMessages((prev) => [...prev, assistantReply]);
        } finally {
          setIsLoadingMessages(false);
        }
        return;
      }
    }

    try {
      const response = await fetch(`/api/chats/${activeChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          file: file ? { name: file.name, type: file.type, base64: file.base64, size: file.size } : null,
          manualAgentId: manualAgentId || null
        })
      });

      const responseData = await response.json();
      
      // Re-architect message histories with actual server properties
      setMessages((prev) => {
        // Exclude the temp placeholder
        const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...filtered, responseData.userMessage, responseData.assistantMessage];
      });

      // Synchronize statistics with live updates
      fetchUsageStats();
      fetchChats();

      // Trigger TTS playback if enabled on central assistant message
      if (responseData.assistantMessage && "speechSynthesis" in window) {
        try {
          speakText(responseData.assistantMessage.content.substring(0, 300));
        } catch (synthE) {
          console.warn("Speech synthesis error (likely blocked in sandboxed iframe):", synthE);
        }
      }

    } catch (err) {
      console.error("Transmission failed to complete:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleClearChatThread = async () => {
    try {
      await fetch(`/api/chats/${activeChatId}/clear`, { method: "POST" });
      fetchMessages(activeChatId);
    } catch (err) {
      console.error("Workspace reset could not execute:", err);
    }
  };

  // Memory Handlers
  const handleSaveMemory = async (content: string, type: "chat" | "project" | "file" | "user_preference") => {
    try {
      await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, type }),
      });
      fetchMemories();
      fetchUsageStats();
    } catch (err) {
      console.error("Could not inject vector memory:", err);
    }
  };

  const handleQuickLaunchActions = (text: string) => {
    setCurrentTab("chat");
    executeSendMessage(text);
  };

  // Switch templates on Vault clicks
  const handleDeployPromptTemplate = (text: string) => {
    setCurrentTab("chat");
    executeSendMessage(text);
  };

  const addVoiceCommandToLog = (cmd: string) => {
    setRecentVoiceCommands((prev) => [cmd, ...prev].slice(0, 15));
  };

  const isTabLocked = (tabId: string) => {
    const planId = activeSubscription?.planId || "free_trial";
    
    // Free Trial locks
    if (planId === "free_trial") {
      const lockedTabs = ["dashboard", "voice", "trend", "investor", "whatsapp", "memory", "embed"];
      return lockedTabs.includes(tabId);
    }
    // Starter locks
    if (planId === "starter") {
      const lockedTabs = ["whatsapp", "embed"];
      return lockedTabs.includes(tabId);
    }
    
    return false;
  };

  const renderLockOverlay = (tabId: string) => {
    const planId = activeSubscription?.planId || "free_trial";
    let requiredPlan = "Starter Workspace";
    if (["whatsapp", "embed"].includes(tabId)) {
      requiredPlan = "Pro Developer";
    }

    const labels: Record<string, string> = {
      dashboard: "System Health & Core Telemetry",
      voice: "Voice Gateway Voice Commands",
      trend: "Trend Intelligence Reports",
      investor: "AI Asset Analyzer Portfolio App",
      whatsapp: "WA Automation Webhook Rules",
      memory: "Cognitive Memory Embeddings",
      embed: "Widget Code Generation & Embeds",
    };

    const sectionName = labels[tabId] || tabId.toUpperCase();

    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6 bg-slate-900/60" id="lock-overlay">
        <div className="max-w-md w-full text-center bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/60 p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Access Locked</h2>
            <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Requires {requiredPlan} Tier</p>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The <strong className="text-slate-200">{sectionName}</strong> is a premium Chitti-Robo suite capability. Expand your limits and allocate priority compute queues now.
          </p>
          <button
            onClick={() => setCurrentTab("billing")}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <Zap className="w-4 h-4" /> Upgrade Workstation Now
          </button>
        </div>
      </div>
    );
  };

  // Screen Tab router mapping
  const renderTabContent = () => {
    if (isTabLocked(currentTab)) {
      return renderLockOverlay(currentTab);
    }
    switch (currentTab) {
      case "dashboard":
        return (
          <DashboardStats
            onQuickAction={handleQuickLaunchActions}
            usageSummary={usageSummary}
            recentLogs={recentLogs}
            onRefreshUsage={fetchUsageStats}
          />
        );
      case "chat":
        return (
          <ChatWindow
            messages={messages}
            agents={agents}
            manualAgentId={manualAgentId}
            setManualAgentId={setManualAgentId}
            activeChatId={activeChatId}
            onSendMessage={executeSendMessage}
            onClearChat={handleClearChatThread}
            isLoading={isLoadingMessages}
            onTriggerVoicePortal={() => setCurrentTab("voice")}
            voiceButtonsShut={voiceButtonsShut}
            onToggleVoiceButtonsShut={handleToggleVoiceButtonsShut}
            onNavigateTab={setCurrentTab}
          />
        );
      case "voice":
        return (
          <VoiceRecorder
            onSendMessage={executeSendMessage}
            onNavigateTab={setCurrentTab}
            onClearHistory={handleClearChatThread}
            recentCommands={recentVoiceCommands}
            addRecentCommand={addVoiceCommandToLog}
          />
        );
      case "agents":
        return (
          <AgentCenter
            agents={agents}
            manualAgentId={manualAgentId}
            setManualAgentId={setManualAgentId}
            onStartChatWithAgent={(agentId) => {
              setManualAgentId(agentId);
              setCurrentTab("chat");
            }}
          />
        );
      case "memory":
        return (
          <MemoryPanel
            memories={memories}
            onSaveMemory={handleSaveMemory}
          />
        );
      case "prompts":
        return (
          <PromptLibrary
            templates={promptTemplates}
            onDeployTemplate={handleDeployPromptTemplate}
          />
        );
      case "embed":
        return (
          <EmbedCenter />
        );
      case "airspace":
        return (
          <IndianAirspaceLive />
        );
      case "live_intel":
        return (
          <RealTimeIntelHub />
        );
      case "trend":
        return (
          <TrendIntelligence />
        );
      case "analyzer":
        return (
          <OnlineContentAnalyzer />
        );
      case "investor":
        return (
          <AIAssetAnalyzer />
        );
      case "taskhub":
        return (
          <AITaskHub 
            onNavigateTab={setCurrentTab}
            onAddTask={(taskText) => {
              handleQuickLaunchActions(`add task: ${taskText}`);
            }}
          />
        );
      case "converter":
        return (
          <FileConverter />
        );
      case "globe3d":
        return (
          <ClimateGlobe />
        );
      case "virtual_screening":
        return (
          <VirtualScreening />
        );
      case "vista3d":
        return (
          <VirtualScreening initialTab="vista3d" />
        );
      case "simulation":
        return (
          <SimulationMaker />
        );
      case "curiosity":
        return (
          <CuriosityArena />
        );
      case "whatsapp":
        return (
          <WhatsAppAutomation />
        );
      case "imagine":
        return (
          <ImagineStudio />
        );
      case "ai_agent":
        return (
          <AIAgentExplorer 
            onDeployToChat={(promptText, agentName) => {
              setCurrentTab("chat");
              executeSendMessage(`Please initialize your system directive as the "${agentName}" agent. Here is your persona: ${promptText}`);
            }}
          />
        );
      case "omnigen_ai":
        return (
          <OmnigenApp />
        );
      case "billing":
        return (
          <SubscriptionBillingHub
            currentTab={currentTab}
            onNavigate={setCurrentTab}
            onRefreshStats={fetchUsageStats}
            globalProfile={profile}
            onProfileUpdate={setProfile}
          />
        );
      case "about_us":
        return (
          <AboutUs />
        );
      case "key_health":
        return (
          <APIKeyHealth
            profile={profile}
          />
        );
      case "admin":
        if (profile?.role !== "owner_admin") {
          return (
            <div className="min-h-screen bg-[#070b19] flex items-center justify-center p-6 text-white font-mono w-full">
              <div className="max-w-md w-full bg-[#0a0f24] border border-red-500/30 p-8 rounded-xl shadow-2xl text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-red-400">Access Denied: Owner Admin Only</h2>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your current profile level is set to "{profile?.role || "user"}". Only commanders possessing the "owner_admin" override role can view or manage the global system command panel.
                </p>
                <button 
                  onClick={() => setCurrentTab("landing")}
                  className="px-4 py-2 bg-[#0c133a] hover:bg-cyan-950/20 text-xs text-cyan-400 hover:text-white rounded border border-cyan-500/30 transition cursor-pointer"
                >
                  Return to Central Command
                </button>
              </div>
            </div>
          );
        }
        return (
          <AdminControlPanel
            profile={profile}
            onNavigate={setCurrentTab}
          />
        );
      default:
        // 'landing' Page
        return (
          <LandingPage
            onStartChat={() => setCurrentTab("chat")}
            onExploreAgents={() => setCurrentTab("agents")}
            onSendMessage={handleQuickLaunchActions}
            agents={agents}
            onNavigateTab={setCurrentTab}
            onClearHistory={handleClearChatThread}
            recentCommands={recentVoiceCommands}
            addRecentCommand={addVoiceCommandToLog}
            voiceButtonsShut={voiceButtonsShut}
            onToggleVoiceButtonsShut={handleToggleVoiceButtonsShut}
          />
        );
    }
  };

  if (!isLoggedIn) {
    return (
      <AuthPage
        onLoginSuccess={(profileData) => {
          setProfile((prev) => ({ ...prev, ...profileData }));
          setIsLoggedIn(true);
          localStorage.setItem("chitti_robo_authenticated", "true");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#030612] text-gray-100 flex overflow-hidden">
      
      {/* Sidebar Core Widget */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        chats={chats}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        profile={profile}
        isOnline={isOnline}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onToggleAdminRole={handleToggleAdminRole}
        onLogout={handleLogout}
      />

      {/* Main Terminal Workspace Frame */}
      <main className={`flex-1 min-w-0 h-screen flex flex-col relative pt-16 lg:pt-0 transition-all duration-300 ${sidebarCollapsed ? "lg:pl-16" : "lg:pl-72"} ${currentTab === "chat" ? "overflow-hidden" : "overflow-y-auto"}`}>
        
        {/* Animated entering wrappers */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`w-full flex flex-col flex-1 min-h-0 relative ${currentTab === "chat" ? "h-full p-0" : "min-h-[calc(100vh-4rem)] lg:min-h-screen p-4 md:p-8 h-auto"}`}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
