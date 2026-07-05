import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Settings, 
  Phone, 
  Key, 
  User, 
  Server, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  Play, 
  Mic, 
  Bot, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Sparkles,
  Database,
  CheckCircle2,
  ListFilter,
  Trello,
  Terminal,
  ArrowRight,
  Trash2,
  Plus,
  Cpu,
  Copy,
  ExternalLink,
  Code
} from "lucide-react";
import { speakText } from "../lib/speech";

interface WhatsAppSettings {
  host: string;
  apiKey: string;
  session: string;
  friendPhone: string;
  friendName: string;
}

interface MessageLog {
  id: string;
  recipient: string;
  text: string;
  status: "success" | "failed" | "sending";
  timestamp: string;
  type: "text" | "voice";
}

interface WacrmLead {
  id: string;
  name: string;
  phone: string;
  stage: string;
  tags: string[];
  notes: string[];
  lastInteraction: string;
  createdAt: string;
}

interface WacrmEvent {
  id: string;
  eventType: string;
  leadPhone: string;
  leadName: string;
  details: string;
  timestamp: string;
}

interface WacrmRule {
  id: string;
  trigger: string;
  triggerValue: string;
  action: string;
  actionValue: string;
}

export default function WhatsAppAutomation() {
  const [activeTab, setActiveTab] = useState<"waha" | "wacrm">("wacrm");

  // --- WAHA Settings ---
  const [settings, setSettings] = useState<WhatsAppSettings>(() => {
    const defaultHost = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    return {
      host: localStorage.getItem("waha_host") || defaultHost,
      apiKey: localStorage.getItem("waha_api_key") || "00000000000000000000000000000000",
      session: localStorage.getItem("waha_session") || "default",
      friendPhone: localStorage.getItem("waha_friend_phone") || "",
      friendName: localStorage.getItem("waha_friend_name") || "My Friend",
    };
  });

  const [messageText, setMessageText] = useState("");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connected" | "error">("disconnected");
  const [connectionError, setConnectionError] = useState("");
  const [wahaSessions, setWahaSessions] = useState<any[]>([]);
  const [isSimulated, setIsSimulated] = useState<boolean>(() => {
    const defaultHost = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const host = localStorage.getItem("waha_host") || defaultHost;
    return host.includes("localhost") || host.includes("127.0.0.1") || host.includes("run.app") || (typeof window !== "undefined" && host.includes(window.location.host));
  });
  
  const [logs, setLogs] = useState<MessageLog[]>(() => {
    try {
      const stored = localStorage.getItem("waha_logs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // --- WACRM Integration States ---
  const [leads, setLeads] = useState<WacrmLead[]>([]);
  const [events, setEvents] = useState<WacrmEvent[]>([]);
  const [rules, setRules] = useState<WacrmRule[]>([]);
  const [isLoadingWacrm, setIsLoadingWacrm] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulateResult, setSimulateResult] = useState("");

  // WACRM Rule Form State
  const [newRuleTrigger, setNewRuleTrigger] = useState("stage_changed");
  const [newRuleTriggerValue, setNewRuleTriggerValue] = useState("Proposal");
  const [newRuleAction, setNewRuleAction] = useState("ai_draft");
  const [newRuleActionValue, setNewRuleActionValue] = useState("Draft an elite pricing proposal for enterprise level features");

  // Save settings helper
  const handleSaveSetting = (key: keyof WhatsAppSettings, value: string) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem(`waha_${key}`, value);
    if (key === "host") {
      const isSim = value.includes("localhost") || value.includes("127.0.0.1") || value.includes("run.app") || (typeof window !== "undefined" && value.includes(window.location.host));
      setIsSimulated(isSim);
    }
  };

  const saveLogs = (updatedLogs: MessageLog[]) => {
    setLogs(updatedLogs);
    localStorage.setItem("waha_logs", JSON.stringify(updatedLogs));
  };

  // Check connection to WAHA API
  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus("disconnected");
    setConnectionError("");
    try {
      const response = await fetch("/api/whatsapp/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: settings.host,
          apiKey: settings.apiKey,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setConnectionStatus("connected");
        setWahaSessions(data.sessions || []);
        setIsSimulated(!!data.simulatedFallback || settings.host.includes("localhost") || settings.host.includes("127.0.0.1") || settings.host.includes("run.app") || (typeof window !== "undefined" && settings.host.includes(window.location.host)));
      } else {
        setConnectionStatus("error");
        setConnectionError(data.error || "Could not retrieve sessions.");
        setIsSimulated(false);
      }
    } catch (err: any) {
      setConnectionStatus("error");
      setConnectionError(err.message || "Network timeout / server is unreachable.");
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Fetch WACRM details from backend database
  const fetchWacrmData = async () => {
    setIsLoadingWacrm(true);
    try {
      const [leadsRes, eventsRes, rulesRes] = await Promise.all([
        fetch("/api/wacrm/leads"),
        fetch("/api/wacrm/events"),
        fetch("/api/wacrm/rules")
      ]);

      const [leadsData, eventsData, rulesData] = await Promise.all([
        leadsRes.json(),
        eventsRes.json(),
        rulesRes.json()
      ]);

      if (leadsData.success) setLeads(leadsData.leads);
      if (eventsData.success) setEvents(eventsData.events);
      if (rulesData.success) setRules(rulesData.rules);
    } catch (err) {
      console.error("Error loading WACRM sync data", err);
    } finally {
      setIsLoadingWacrm(false);
    }
  };

  // Send WhatsApp message handler via WAHA
  const handleSendMessage = async (textToSend: string, isVoice = false) => {
    const text = textToSend.trim();
    if (!text) return;
    if (!settings.friendPhone) {
      setStatusMsg("Error: Please configure your friend's phone number first.");
      return;
    }

    setIsSending(true);
    setStatusMsg("Establishing link...");

    // Create a temporary log
    const newLog: MessageLog = {
      id: `wa-log-${Date.now()}`,
      recipient: `${settings.friendName} (${settings.friendPhone})`,
      text: text,
      status: "sending",
      timestamp: new Date().toLocaleTimeString(),
      type: isVoice ? "voice" : "text",
    };

    const updatedLogs = [newLog, ...logs];
    saveLogs(updatedLogs);

    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: settings.host,
          apiKey: settings.apiKey,
          session: settings.session,
          chatId: settings.friendPhone,
          text: text,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Update log status to success
        const finalLogs = updatedLogs.map((l) => 
          l.id === newLog.id ? { ...l, status: "success" as const } : l
        );
        saveLogs(finalLogs);
        setStatusMsg(`Successfully sent message to ${settings.friendName}!`);
        setMessageText("");

        if ("speechSynthesis" in window) {
          speakText(`Message successfully sent to ${settings.friendName}`);
        }
      } else {
        throw new Error(data.error || "WAHA refused to transmit message.");
      }
    } catch (err: any) {
      const finalLogs = updatedLogs.map((l) => 
        l.id === newLog.id ? { ...l, status: "failed" as const } : l
      );
      saveLogs(finalLogs);
      setStatusMsg(`Transmission failed: ${err.message || "Network issue"}`);
    } finally {
      setIsSending(false);
    }
  };

  // Simulate WACRM Webhook Post
  const handleSimulateWebhook = async (presetType: "new" | "negotiate" | "won") => {
    setIsSimulating(true);
    setSimulateResult("");

    let payload: any = {};
    if (presetType === "new") {
      const mockPhone = `9198${Math.floor(10000000 + Math.random() * 90000000)}`;
      payload = {
        event: "lead_added",
        lead: {
          phone: mockPhone,
          name: ["Amit Patel", "Ananya Iyer", "Rahul Verma", "Priya Nair", "Arjun Mehta"][Math.floor(Math.random() * 5)],
          stage: "New",
          tags: ["Ad Campaign", "Tech Setup"],
          notes: ["Requested onboarding support for WhatsApp automation extension"]
        }
      };
    } else if (presetType === "negotiate") {
      const activePhone = leads.length > 0 ? leads[Math.floor(Math.random() * leads.length)].phone : "919812345678";
      payload = {
        event: "stage_changed",
        lead: {
          phone: activePhone,
          name: leads.find(l => l.phone === activePhone)?.name || "Aarav Sharma",
          stage: "Proposal",
          tags: ["urgent", "SaaS Enterprise"],
          notes: ["Offered custom bundle pack with 10 API credentials"]
        }
      };
    } else {
      const activePhone = leads.length > 0 ? leads[Math.floor(Math.random() * leads.length)].phone : "919823456789";
      payload = {
        event: "stage_changed",
        lead: {
          phone: activePhone,
          name: leads.find(l => l.phone === activePhone)?.name || "Diya Patel",
          stage: "Won",
          tags: ["Paid Tier", "Converted"],
          notes: ["Payment received. Fully activated integration node."]
        }
      };
    }

    try {
      const response = await fetch("/api/wacrm/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSimulateResult(`Successfully simulated! Registered: "${data.lead.name}" under stage "${data.lead.stage}"`);
        fetchWacrmData();
        
        // Voice status alert
        if ("speechSynthesis" in window) {
          speakText(`Webhook simulation completed. Lead ${data.lead.name} synced.`);
        }
      } else {
        throw new Error(data.error || "Simulation webhook rejected.");
      }
    } catch (err: any) {
      setSimulateResult(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  // Add rule
  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/wacrm/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trigger: newRuleTrigger,
          triggerValue: newRuleTriggerValue,
          action: newRuleAction,
          actionValue: newRuleActionValue
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        fetchWacrmData();
        setNewRuleTriggerValue("");
        setNewRuleActionValue("");
      }
    } catch (err) {
      console.error("Failed to add rule", err);
    }
  };

  // Delete rule
  const handleDeleteRule = async (id: string) => {
    try {
      const response = await fetch(`/api/wacrm/rules/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        fetchWacrmData();
      }
    } catch (err) {
      console.error("Failed to delete rule", err);
    }
  };

  // Clear Leads
  const handleClearLeads = async () => {
    if (!confirm("Are you sure you want to clear all synced WACRM leads?")) return;
    try {
      const response = await fetch("/api/wacrm/leads/clear", {
        method: "POST"
      });
      if (response.ok) {
        fetchWacrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Copy Webhook URL Helper
  const copyWebhookUrl = () => {
    const url = `${window.location.origin}/api/wacrm/webhook`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Clear logs helper
  const clearLogs = () => {
    saveLogs([]);
    setStatusMsg("Message history wiped.");
  };

  // Load everything on mount
  useEffect(() => {
    if (settings.host) {
      testConnection();
    }
    fetchWacrmData();
  }, []);

  // Webhook endpoint path
  const webhookUrlEndpoint = typeof window !== "undefined" 
    ? `${window.location.origin}/api/wacrm/webhook` 
    : "https://your-domain.com/api/wacrm/webhook";

  // Filter columns for Kanban representation
  const columns = [
    { title: "New Contacts", key: "New", color: "border-blue-500/40 text-blue-400 bg-blue-950/25" },
    { title: "Prospects", key: "Prospect", color: "border-purple-500/40 text-purple-400 bg-purple-950/25" },
    { title: "Proposal / Neg", key: "Proposal", color: "border-amber-500/40 text-amber-400 bg-amber-950/25" },
    { title: "Closed Won 🎉", key: "Won", color: "border-emerald-500/40 text-emerald-400 bg-emerald-950/25" }
  ];

  return (
    <div id="whatsapp-automation-root" className="space-y-6 max-w-7xl mx-auto px-1 animate-fade-in pb-12">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-green-950 text-green-400 border border-green-800 px-2 py-0.5 rounded uppercase font-mono font-bold tracking-widest">WACRM COMPATIBLE</span>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded uppercase font-mono font-bold tracking-widest">REAL-TIME WEBHOOKS</span>
          </div>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-white flex items-center gap-2.5 mt-2">
            <MessageSquare className="text-emerald-400 w-8 h-8" /> WhatsApp Automation Control
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl font-sans">
            Sync leads, automate replies, and build intelligent workflows with the local WhatsApp HTTP API (WAHA) or the free open-source Chrome Extension <code className="text-emerald-400 font-mono">ArnasDon/wacrm</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-950 p-1.5 rounded-xl border border-gray-850">
          <button
            onClick={() => setActiveTab("wacrm")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 select-none cursor-pointer ${
              activeTab === "wacrm" ? "bg-emerald-500 text-gray-950" : "text-gray-400 hover:text-white"
            }`}
          >
            <Trello className="w-3.5 h-3.5" /> WACRM PIPELINE
          </button>
          <button
            onClick={() => setActiveTab("waha")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 select-none cursor-pointer ${
              activeTab === "waha" ? "bg-emerald-500 text-gray-950" : "text-gray-400 hover:text-white"
            }`}
          >
            <Server className="w-3.5 h-3.5" /> WAHA API ENGINE
          </button>
        </div>
      </div>

      {/* -------------------- TAB 1: WACRM PIPELINE INTEGRATION -------------------- */}
      {activeTab === "wacrm" && (
        <div className="space-y-6">
          
          {/* Top webhook connector guide & simulation banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Live Webhook Link box */}
            <div className="lg:col-span-7 bg-[#070b19]/80 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-gray-900">
                <div className="flex items-center gap-2">
                  <Cpu className="text-emerald-400 w-4 h-4 animate-pulse" />
                  <h2 className="text-sm font-mono uppercase tracking-widest text-gray-200 font-bold">WACRM EXTENSION INTERPRETER</h2>
                </div>
                <span className="text-[10px] bg-green-950 text-green-400 border border-green-900 px-2 py-0.5 rounded uppercase font-mono font-bold">
                  ACTIVE WEBHOOKS
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Use your local <strong className="text-white">ArnasDon/wacrm</strong> Chrome Extension to sync active WhatsApp chats into our system. Enter this Webhook URL inside the extension settings:
                </p>

                <div className="flex items-center gap-2 bg-gray-950 border border-gray-850 rounded-xl p-2.5">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrlEndpoint}
                    className="flex-1 bg-transparent border-none text-xs text-emerald-400 font-mono outline-none select-all"
                  />
                  <button
                    onClick={copyWebhookUrl}
                    className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-gray-950 transition cursor-pointer"
                    title="Copy to clipboard"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Simulation action bank */}
                <div className="bg-gray-950/40 border border-gray-850/60 rounded-xl p-3.5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-bold">Don't have extension loaded? Sandbox Simulator:</span>
                    <button
                      onClick={fetchWacrmData}
                      disabled={isLoadingWacrm}
                      className="text-[9px] font-mono text-gray-500 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingWacrm ? "animate-spin" : ""}`} /> REFRESH BOARD
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => handleSimulateWebhook("new")}
                      disabled={isSimulating}
                      className="px-3 py-1.5 text-xs font-mono font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-gray-950 rounded-xl transition cursor-pointer"
                    >
                      + SIMULATE LEAD RECEIVED
                    </button>
                    <button
                      onClick={() => handleSimulateWebhook("negotiate")}
                      disabled={isSimulating || leads.length === 0}
                      className="px-3 py-1.5 text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-gray-950 rounded-xl transition cursor-pointer disabled:opacity-40"
                    >
                      ✎ SIMULATE PROPOSAL STAGE
                    </button>
                    <button
                      onClick={() => handleSimulateWebhook("won")}
                      disabled={isSimulating || leads.length === 0}
                      className="px-3 py-1.5 text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-gray-950 rounded-xl transition cursor-pointer disabled:opacity-40"
                    >
                      🏆 SIMULATE LEAD WON
                    </button>
                  </div>

                  {simulateResult && (
                    <p className="text-[10px] font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-900/30 p-2 rounded-lg animate-pulse">
                      ⚡ {simulateResult}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Extension Setup Guide */}
            <div className="lg:col-span-5 bg-[#070b19]/80 border border-gray-800 rounded-2xl p-5 space-y-3.5 shadow-xl">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-900">
                <Code className="text-emerald-400 w-4 h-4" />
                <h2 className="text-sm font-mono uppercase tracking-widest text-gray-200">DEVELOPER REPO SETUP</h2>
              </div>
              
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                Set up and run <strong className="text-white">ArnasDon/wacrm</strong> locally to hook it directly into your live WhatsApp browser:
              </p>

              <div className="bg-black/50 p-2.5 rounded-xl border border-gray-850 text-[10px] text-cyan-400 font-mono space-y-1">
                <div><span className="text-gray-500"># 1. Clone CRM codebase</span></div>
                <div className="select-all">git clone https://github.com/ArnasDon/wacrm.git</div>
                <div><span className="text-gray-500"># 2. Boot dependencies & compile bundle</span></div>
                <div className="select-all">cd wacrm && npm install && npm run build</div>
                <div><span className="text-gray-500"># 3. Load extension in Chrome</span></div>
                <div className="text-gray-400">Open chrome://extensions/, select "Developer Mode", and click "Load unpacked" on build folder.</div>
              </div>

              <a
                href="https://github.com/ArnasDon/wacrm.git"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-mono text-emerald-400 hover:underline flex items-center gap-1 justify-end font-bold"
              >
                GitHub Code Repository <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>

          {/* Interactive Kanban Pipeline board */}
          <div className="bg-[#070b19]/80 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-gray-900">
              <div className="flex items-center gap-2">
                <Trello className="text-emerald-400 w-4 h-4" />
                <h2 className="text-sm font-mono uppercase tracking-widest text-gray-200 font-bold">WACRM PIPELINE BOARD</h2>
              </div>
              {leads.length > 0 && (
                <button
                  onClick={handleClearLeads}
                  className="text-[10px] font-mono text-gray-500 hover:text-rose-400 transition"
                >
                  CLEAR BOARD LEADS
                </button>
              )}
            </div>

            {leads.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-gray-900 rounded-xl text-gray-500">
                <Trello className="w-12 h-12 text-gray-800 mx-auto mb-3" />
                <h3 className="text-sm font-mono font-semibold text-gray-400">No Webhook Leads Registered</h3>
                <p className="text-xs text-gray-600 max-w-sm mx-auto mt-1 leading-relaxed">
                  Use the simulation buttons above to inject sample pipeline stages, or load your compiled Chrome Extension pointing here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
                {columns.map((col) => {
                  const filteredLeads = leads.filter(l => {
                    const lStage = (l.stage || "New").toLowerCase();
                    const cKey = col.key.toLowerCase();
                    if (cKey === "new" && lStage === "new") return true;
                    if (cKey === "prospect" && (lStage === "prospect" || lStage === "contacted")) return true;
                    if (cKey === "proposal" && (lStage === "proposal" || lStage === "negotiation")) return true;
                    if (cKey === "won" && (lStage === "won" || lStage === "converted" || lStage === "closed won")) return true;
                    return false;
                  });

                  return (
                    <div key={col.key} className="bg-gray-950/40 rounded-xl border border-gray-850 p-3 space-y-3 flex flex-col min-h-[300px]">
                      <div className={`flex justify-between items-center px-2 py-1.5 border border-dashed rounded-lg ${col.color}`}>
                        <span className="text-xs font-mono font-bold tracking-wider uppercase">{col.title}</span>
                        <span className="text-xs font-mono font-bold font-bold rounded px-1.5 bg-black/40">
                          {filteredLeads.length}
                        </span>
                      </div>

                      <div className="space-y-2 flex-1 overflow-y-auto max-h-[350px] pr-0.5">
                        {filteredLeads.map((lead) => (
                          <div
                            key={lead.id}
                            className="p-3 bg-gray-950 border border-gray-850 rounded-xl space-y-2 hover:border-emerald-500/40 transition shadow-md group relative"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-xs font-bold text-gray-200 group-hover:text-emerald-400 transition">{lead.name}</h4>
                                <p className="text-[10px] font-mono text-gray-500 mt-0.5">{lead.phone}</p>
                              </div>
                              
                              {/* Display trigger rule badge if active */}
                              {lead.tags.includes("urgent") && (
                                <span className="text-[8px] font-mono font-bold bg-rose-950/60 border border-rose-900/40 text-rose-400 px-1 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                  URGENT
                                </span>
                              )}
                            </div>

                            {lead.notes && lead.notes.length > 0 && (
                              <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                                "{lead.notes[0]}"
                              </p>
                            )}

                            {lead.tags && lead.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {lead.tags.map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[8px] bg-gray-900 border border-gray-800 text-gray-400 px-1 py-0.5 rounded font-mono uppercase"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="text-[8px] text-gray-500 font-mono text-right pt-1.5 border-t border-gray-900/50">
                              Synced: {new Date(lead.lastInteraction).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}

                        {filteredLeads.length === 0 && (
                          <div className="py-8 text-center text-[10px] font-mono text-gray-600 border border-dashed border-gray-950 rounded-xl">
                            Empty stage slot
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Grid for Rules Builder & Live Event Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* AI Auto-response Rules Configuration */}
            <div className="lg:col-span-5 bg-[#070b19]/80 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-900">
                <Bot className="text-emerald-400 w-4 h-4 animate-pulse" />
                <h2 className="text-sm font-mono uppercase tracking-widest text-gray-200 font-bold">WACRM COGNITIVE RULES</h2>
              </div>

              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                Configure auto-responder workflows. When incoming Chrome Extension webhooks match a specified stage or tag, Gemini automatically constructs priority replies or signals:
              </p>

              {/* Active Rules List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-3 bg-gray-950 border border-gray-850 rounded-xl flex justify-between items-start gap-2 text-xs font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded uppercase">
                          IF: {rule.trigger.replace("_", " ")}
                        </span>
                        <span className="text-gray-400 text-[10px] font-semibold">== "{rule.triggerValue}"</span>
                      </div>
                      <p className="text-[10px] text-cyan-400 leading-relaxed font-sans italic pt-1">
                        → Action: {rule.actionValue}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 rounded text-gray-500 hover:text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {rules.length === 0 && (
                  <p className="text-[10px] font-mono text-gray-500 text-center py-4">No custom rules active.</p>
                )}
              </div>

              {/* Create Rule Form */}
              <form onSubmit={handleAddRule} className="bg-gray-950/40 border border-gray-850 rounded-xl p-3.5 space-y-3.5">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Configure Custom Workflow</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-500 uppercase block">Trigger event</label>
                    <select
                      value={newRuleTrigger}
                      onChange={(e) => setNewRuleTrigger(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-850 text-[11px] text-white rounded p-1.5 outline-none font-mono"
                    >
                      <option value="stage_changed">Stage Changed</option>
                      <option value="tag_added">Tag Added</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-500 uppercase block">Trigger value</label>
                    <input
                      type="text"
                      value={newRuleTriggerValue}
                      onChange={(e) => setNewRuleTriggerValue(e.target.value)}
                      placeholder="e.g. Proposal or urgent"
                      className="w-full bg-gray-950 border border-gray-850 text-[11px] text-white rounded p-1.5 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-gray-500 uppercase block">Neural AI Instructions</label>
                  <input
                    type="text"
                    value={newRuleActionValue}
                    onChange={(e) => setNewRuleActionValue(e.target.value)}
                    placeholder="E.g. Draft custom onboarding package"
                    className="w-full bg-gray-950 border border-gray-850 text-[11px] text-white rounded p-2 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-gray-950 font-bold font-mono text-xs cursor-pointer transition uppercase"
                >
                  Save Integration Rule
                </button>
              </form>
            </div>

            {/* Live Webhook POST Event Logger */}
            <div className="lg:col-span-7 bg-[#070b19]/80 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-gray-900">
                <div className="flex items-center gap-2">
                  <Terminal className="text-emerald-400 w-4 h-4" />
                  <h2 className="text-sm font-mono uppercase tracking-widest text-gray-200">LIVE WEBHOOK LOGS</h2>
                </div>
              </div>

              {events.length === 0 ? (
                <div className="py-12 text-center text-gray-600 font-mono text-xs border border-dashed border-gray-950 rounded-xl">
                  Awaiting browser extension webhook triggers.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {events.map((evt) => (
                    <div key={evt.id} className="p-3 bg-black/40 border border-gray-900 rounded-xl space-y-1 font-mono text-xs">
                      <div className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">
                            {evt.eventType}
                          </span>
                          <span className="text-gray-400 font-bold">{evt.leadName} ({evt.leadPhone})</span>
                        </div>
                        <span className="text-gray-500 text-[9px]">{evt.timestamp}</span>
                      </div>
                      <p className="text-gray-400 text-[11px] leading-relaxed pt-1">
                        {evt.details}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* -------------------- TAB 2: WAHA LOCAL CONTAINER GATEWAY -------------------- */}
      {activeTab === "waha" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Left config side */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* WAHA Gateway Credentials Card */}
            <div className="bg-[#070b19]/80 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-900">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-mono uppercase tracking-widest text-gray-200">WAHA CONTAINER CONFIG</h2>
                </div>

                <button
                  onClick={testConnection}
                  disabled={isTestingConnection}
                  className="text-[9px] font-mono text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isTestingConnection ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <RefreshCw className="w-2.5 h-2.5" />} PINCH CONTAINER
                </button>
              </div>

              {/* Connection alert box */}
              {connectionStatus === "connected" ? (
                isSimulated ? (
                  <div className="p-3.5 bg-cyan-950/40 border border-cyan-800/40 rounded-xl flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                    <div className="text-xs">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        Virtual WAHA Simulator Active
                      </span>
                      <p className="text-cyan-400/80 font-mono text-[10px] mt-0.5">
                        Chitti-Robo cloud environment detected. Running high-fidelity automated API simulations for secure and zero-infrastructure local sandbox testing.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                    <div className="text-xs">
                      <span className="font-semibold text-white block">WhatsApp Engine Online</span>
                      <p className="text-emerald-400/80 font-mono text-[10px] mt-0.5">
                        Successfully pinged WhatsApp local container. Active Sessions: {wahaSessions.length}
                      </p>
                    </div>
                  </div>
                )
              ) : connectionStatus === "error" ? (
                <div className="p-3.5 bg-rose-950/30 border border-rose-900/40 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-white block">Container Connection Offline</span>
                    <p className="text-rose-400/80 mt-1 leading-relaxed">
                      {connectionError}
                    </p>
                    <div className="bg-black/40 p-2 rounded mt-2 text-[10px] text-gray-400 font-mono border border-gray-900">
                      Run locally: <br />
                      <span className="text-cyan-400 select-all">docker run -d -p 3000:3000 devlikeapro/waha</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-gray-950/60 border border-gray-850 rounded-xl flex items-start gap-2.5">
                  <RefreshCw className="w-5 h-5 text-gray-400 shrink-0 mt-0.5 animate-spin" />
                  <div className="text-xs">
                    <span className="font-semibold text-white block">Awaiting Status Check</span>
                    <p className="text-gray-500 font-mono text-[10px] mt-0.5">Testing connectivity frame.</p>
                  </div>
                </div>
              )}

              {/* WAHA Host Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-gray-500" /> Host Endpoint URL
                </label>
                <input
                  type="text"
                  value={settings.host}
                  onChange={(e) => handleSaveSetting("host", e.target.value)}
                  placeholder="http://localhost:3000"
                  className="w-full bg-gray-950 border border-gray-850 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-white font-mono outline-none"
                />
                <span className="text-[9px] text-gray-500 block">Where your devlikeapro/waha container is hosted.</span>
              </div>

              {/* API Key Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-gray-500" /> WAHA API Key / Token
                </label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => handleSaveSetting("apiKey", e.target.value)}
                  placeholder="00000000000000000000000000000000"
                  className="w-full bg-gray-950 border border-gray-850 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-white font-mono outline-none"
                />
                <span className="text-[9px] text-gray-500 block">Matches the API key declared in environment.</span>
              </div>

              {/* Session Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-gray-500" /> WAHA Session ID
                </label>
                <input
                  type="text"
                  value={settings.session}
                  onChange={(e) => handleSaveSetting("session", e.target.value)}
                  placeholder="default"
                  className="w-full bg-gray-950 border border-gray-850 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            {/* Recipient Details (Friend) */}
            <div className="bg-[#070b19]/80 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-900">
                <User className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-mono uppercase tracking-widest text-gray-200">RECIPIENT (FRIEND'S DEVICE)</h2>
              </div>

              {/* Friend's Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block">Friend's Name / Label</label>
                <input
                  type="text"
                  value={settings.friendName}
                  onChange={(e) => handleSaveSetting("friendName", e.target.value)}
                  placeholder="E.g. Johnny"
                  className="w-full bg-gray-950 border border-gray-850 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>

              {/* Friend's Phone */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block">Friend's WhatsApp Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={settings.friendPhone}
                    onChange={(e) => handleSaveSetting("friendPhone", e.target.value)}
                    placeholder="E.g. 9876543210"
                    className="w-full bg-gray-950 border border-gray-850 focus:border-emerald-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white font-mono outline-none"
                  />
                </div>
                <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1.5 mt-1 bg-cyan-950/20 px-2.5 py-1 rounded border border-cyan-900/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>🇮🇳 India Mode Active: Enter a 10-digit number (e.g. 98765 43210) & the system auto-prepends +91!</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right messaging panel & logs console */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Direct message send test pad */}
            <div className="bg-[#070b19]/80 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-mono uppercase tracking-widest text-gray-200 font-bold">MANUAL OVERRIDE CONSOLE</h2>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-900/30 px-2 py-0.5 rounded uppercase">
                  To: {settings.friendName}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage(messageText)}
                    placeholder={`Type a secure message to transmit to ${settings.friendName}...`}
                    className="flex-1 bg-gray-950 border border-gray-850 focus:border-emerald-500 rounded-xl p-3 text-xs text-white outline-none"
                    id="waha-msg-text-input"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSendMessage(messageText)}
                      disabled={isSending || !messageText.trim()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-gray-950 font-bold text-xs font-mono transition cursor-pointer flex items-center gap-1.5 select-none shrink-0 disabled:opacity-40"
                      id="waha-msg-send-btn"
                    >
                      {isSending ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          TRANSMIT <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    <a
                      href={`https://wa.me/${(() => {
                        let digits = (settings.friendPhone || "").replace(/[^0-9]/g, "");
                        if (digits.length === 10) digits = `91${digits}`;
                        return digits;
                      })()}?text=${encodeURIComponent(messageText || "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-gray-950 font-bold text-xs font-mono transition flex items-center gap-1.5 shrink-0 select-none ${!messageText.trim() ? "opacity-40 pointer-events-none" : ""}`}
                      title="Directly open message in WhatsApp Web/App (Zero infrastructure setup required)"
                    >
                      DIRECT CHAT <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Status message output */}
                {statusMsg && (
                  <p className="text-[11px] font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-900/30 p-2.5 rounded-xl animate-pulse">
                    System Response: {statusMsg}
                  </p>
                )}
              </div>

              {/* Quick Sample templates */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Operational Quick Templates</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Hi! This is an automated ping from Chitti-Robo Mega AI Central Core.",
                    "Hello buddy, I successfully deployed the waha local server automation!",
                    "Acknowledge secure transmission node linked successfully.",
                    "System alert: Code successfully compiled on developer cloud run cluster!"
                  ].map((txt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMessageText(txt)}
                      className="text-[10px] text-left p-2 bg-gray-950 border border-gray-850 rounded-xl hover:border-emerald-500/50 hover:text-emerald-300 transition text-gray-400 max-w-xs truncate"
                    >
                      {txt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Secure Transmission logs history */}
            <div className="bg-[#070b19]/80 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-900">
                <div className="flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-mono uppercase tracking-widest text-gray-200">TRANSMISSION LOGS</h2>
                </div>
                
                {logs.length > 0 && (
                  <button
                    onClick={clearLogs}
                    className="text-[9px] font-mono text-gray-500 hover:text-rose-400 hover:underline transition uppercase"
                  >
                    WIPE LOGS
                  </button>
                )}
              </div>

              {logs.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-gray-900 rounded-xl text-gray-500">
                  <MessageSquare className="w-8 h-8 text-gray-700 mx-auto mb-2.5" />
                  <p className="text-xs font-mono">No telemetry logs on this node. Broadcast a message above or say a voice command.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div key={log.id} className="p-3 bg-gray-950 border border-gray-900 rounded-xl flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30 shrink-0">
                            {log.type === "voice" ? "🎙️ VOICE CMD" : "✉️ TEXT CMD"}
                          </span>
                          <span className="text-gray-500 font-mono shrink-0">{log.timestamp}</span>
                          <span className="text-gray-400 font-semibold truncate">→ {log.recipient}</span>
                        </div>
                        <p className="text-gray-300 font-sans leading-relaxed break-words">"{log.text}"</p>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1.5 justify-center">
                        {log.status === "success" ? (
                          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-2 py-0.5 rounded flex items-center gap-1">
                            <Check className="w-3 h-3" /> SENT
                          </span>
                        ) : log.status === "failed" ? (
                          <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-950/30 border border-rose-900/30 px-2 py-0.5 rounded">
                            FAILED
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/30 border border-cyan-900/30 px-2 py-0.5 rounded animate-pulse">
                            SENDING...
                          </span>
                        )}
                        <a
                          href={`https://wa.me/${(() => {
                            let digits = log.recipient.replace(/[^0-9]/g, "");
                            if (digits.length === 10) digits = `91${digits}`;
                            return digits;
                          })()}?text=${encodeURIComponent(log.text)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-0.5 bg-cyan-950/20 border border-cyan-900/30 px-1.5 py-0.5 rounded transition hover:underline"
                          title="Open this specific message in WhatsApp Web/App directly"
                        >
                          <ExternalLink className="w-2.5 h-2.5" /> Direct Link
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Vocal integration guideline */}
            <div className="p-4 bg-emerald-950/15 border border-emerald-900/30 rounded-2xl flex items-start gap-3">
              <Mic className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="text-xs space-y-1">
                <h4 className="font-bold text-white font-mono uppercase tracking-wide">Direct Voice Command Engine Enabled</h4>
                <p className="text-gray-400 leading-relaxed">
                  You can transmit messages directly using standard speech protocols! Just speak into the Voice tab: say <strong className="text-emerald-400">"send message: [your message]"</strong> or <strong className="text-emerald-400">"whatsapp hello buddy"</strong>. The neural system automatically identifies the target recipient, triggers the WAHA local server endpoint, and broadcasts your message without manually clicking send!
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
