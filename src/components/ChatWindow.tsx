import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff,
  Paperclip, 
  Copy, 
  Volume2, 
  VolumeX,
  Download, 
  Sparkles, 
  ArrowRight, 
  X, 
  Trash2, 
  FlameKindling, 
  HelpCircle,
  FileText,
  AlertCircle,
  Check,
  Languages,
  CodeXml,
  Compass,
  FileSearch,
  Globe,
  ExternalLink,
  RefreshCw,
  Plus,
  TrendingUp,
  LayoutDashboard,
  Brain,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Radar
} from "lucide-react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { Message, Agent, AttachedFile } from "../types";
import FileUploader from "./FileUploader";
import { speakText } from "../lib/speech";
import RotatingEarth from "./ui/wireframe-dotted-globe";

interface ChatWindowProps {
  messages: Message[];
  agents: Agent[];
  manualAgentId: string;
  setManualAgentId: (id: string) => void;
  activeChatId: string;
  onSendMessage: (text: string, file: AttachedFile | null) => Promise<any>;
  onClearChat: () => void;
  isLoading: boolean;
  onTriggerVoicePortal?: () => void;
  voiceButtonsShut?: boolean;
  onToggleVoiceButtonsShut?: () => void;
  onNavigateTab?: (tabId: string) => void;
}

export default function ChatWindow({
  messages,
  agents,
  manualAgentId,
  setManualAgentId,
  activeChatId,
  onSendMessage,
  onClearChat,
  isLoading,
  onTriggerVoicePortal,
  voiceButtonsShut = false,
  onToggleVoiceButtonsShut,
  onNavigateTab,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [showSelectorMenu, setShowSelectorMenu] = useState(false);
  const [nestedSelectorView, setNestedSelectorView] = useState<"main" | "agents">("main");
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  useEffect(() => {
    if (!showSelectorMenu) {
      setNestedSelectorView("main");
    }
  }, [showSelectorMenu]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastAgentRouted, setLastAgentRouted] = useState<Agent | null>(null);
  const [systemNotification, setSystemNotification] = useState<string | null>(null);

  // --- WhatsApp State & Actions ---
  const [friendPhone, setFriendPhone] = useState<string>("");
  const [friendName, setFriendName] = useState<string>("");
  const [isSendingWaId, setIsSendingWaId] = useState<string | null>(null);
  const [waSendSuccessId, setWaSendSuccessId] = useState<string | null>(null);
  const [waSendErrorId, setWaSendErrorId] = useState<string | null>(null);

  useEffect(() => {
    const phone = localStorage.getItem("waha_friend_phone") || "";
    const name = localStorage.getItem("waha_friend_name") || "My Friend";
    setFriendPhone(phone);
    setFriendName(name);
  }, [messages]);

  const handleSendViaWhatsAppAPI = async (messageId: string, text: string) => {
    if (!friendPhone) {
      setSystemNotification("⚠️ Please set your Friend's Phone in the WA Automation tab first!");
      setTimeout(() => setSystemNotification(null), 5000);
      return;
    }

    setIsSendingWaId(messageId);
    setWaSendErrorId(null);
    setWaSendSuccessId(null);

    try {
      const defaultHost = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const host = localStorage.getItem("waha_host") || defaultHost;
      const apiKey = localStorage.getItem("waha_api_key") || "00000000000000000000000000000000";
      const session = localStorage.getItem("waha_session") || "default";

      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host, apiKey, session, chatId: friendPhone, text })
      });
      const resData = await response.json();

      if (response.ok && resData.success) {
        setWaSendSuccessId(messageId);
        // Add to logs in localStorage
        const storedLogs = JSON.parse(localStorage.getItem("waha_logs") || "[]");
        const newLog = {
          id: `wa-log-${Date.now()}`,
          recipient: `${friendName} (${friendPhone})`,
          text: text,
          status: "success",
          timestamp: new Date().toLocaleTimeString(),
          type: "text"
        };
        localStorage.setItem("waha_logs", JSON.stringify([newLog, ...storedLogs]));
        setTimeout(() => setWaSendSuccessId(null), 3500);
      } else {
        setWaSendErrorId(messageId);
        setSystemNotification(`❌ Transmission failed: ${resData.error || "Check your WAHA container connection."}`);
        setTimeout(() => {
          setWaSendErrorId(null);
          setSystemNotification(null);
        }, 5000);
      }
    } catch (err: any) {
      setWaSendErrorId(messageId);
      setSystemNotification(`❌ Network Error: ${err.message || "Failed to reach server backend."}`);
      setTimeout(() => {
        setWaSendErrorId(null);
        setSystemNotification(null);
      }, 5000);
    } finally {
      setIsSendingWaId(null);
    }
  };

  const handleDownloadDocx = async (content: string) => {
    try {
      const lines = content.split("\n");
      const docChildren: any[] = [];

      // Document Title / Header
      docChildren.push(
        new Paragraph({
          text: "AI Generated Script / Content",
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        })
      );

      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Generated on: ", bold: true }),
            new TextRun({ text: new Date().toLocaleString() }),
          ],
          spacing: { after: 300 },
        })
      );

      // Parse lines and add them to the document
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) {
          docChildren.push(new Paragraph({ spacing: { after: 120 } }));
          return;
        }

        if (trimmed.startsWith("### ")) {
          docChildren.push(
            new Paragraph({
              text: trimmed.replace("### ", ""),
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 },
            })
          );
        } else if (trimmed.startsWith("## ")) {
          docChildren.push(
            new Paragraph({
              text: trimmed.replace("## ", ""),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 240, after: 120 },
            })
          );
        } else if (trimmed.startsWith("# ")) {
          docChildren.push(
            new Paragraph({
              text: trimmed.replace("# ", ""),
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 300, after: 150 },
            })
          );
        } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: trimmed.replace(/^[\-\*]\s+/, ""),
                }),
              ],
              bullet: { level: 0 },
              spacing: { after: 80 },
            })
          );
        } else {
          // Parse bold markers **text**
          const parts = trimmed.split(/\*\*([^*]+)\*\*/g);
          const childrenRuns: TextRun[] = [];
          
          parts.forEach((part, index) => {
            const isBold = index % 2 === 1;
            childrenRuns.push(
              new TextRun({
                text: part,
                bold: isBold,
              })
            );
          });

          docChildren.push(
            new Paragraph({
              children: childrenRuns,
              spacing: { after: 120 },
            })
          );
        }
      });

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docChildren,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `AI_Script_${Date.now()}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating Word document:", error);
      setSystemNotification("❌ Error generating Word document. Please try again.");
      setTimeout(() => setSystemNotification(null), 5000);
    }
  };

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Track the agent used most recently to show routing
  useEffect(() => {
    if (messages.length > 0) {
      const assistantMsgs = messages.filter((m) => m.role === "assistant" && m.agentUsed);
      if (assistantMsgs.length > 0) {
        const lastAgentName = assistantMsgs[assistantMsgs.length - 1].agentUsed;
        const found = agents.find((a) => a.name === lastAgentName || lastAgentName.includes(a.name.split(" ")[0]));
        if (found) setLastAgentRouted(found);
      }
    }
  }, [messages, agents]);

  const handleSend = async () => {
    if (!inputText.trim() && !attachedFile) return;
    const txtToSend = inputText;
    const fileToSend = attachedFile;
    
    setInputText("");
    setAttachedFile(null);
    setShowUploader(false);

    await onSendMessage(txtToSend, fileToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.warn("navigator.clipboard.writeText denied:", err);
    }
    // Fallback document.execCommand method
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      textArea.remove();
      return successful;
    } catch (fallbackErr) {
      console.warn("Fallback clipboard copying failed:", fallbackErr);
      return false;
    }
  };

  const handleCopy = async (text: string, msgId: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  const handleSpeak = (text: string, msgId: string) => {
    try {
      if ("speechSynthesis" in window) {
        if (speakingMsgId === msgId) {
          window.speechSynthesis.cancel();
          setSpeakingMsgId(null);
        } else {
          const utterance = speakText(text, 
            () => setSpeakingMsgId(null), 
            () => setSpeakingMsgId(null)
          );
          if (utterance) {
            setSpeakingMsgId(msgId);
          } else {
            setSpeakingMsgId(null);
          }
        }
      }
    } catch (err) {
      console.warn("SpeechSynthesis failed (Likely blocked in sandboxed iframe):", err);
      setSystemNotification("Audio synthesis is restricted by browser security policies in your workspace container.");
      setTimeout(() => setSystemNotification(null), 4000);
    }
  };

  const exportChatHistory = () => {
    try {
      let docContent = `==== CHITTI-ROBO AI COGNITIVE SESSION HISTORIES ====\n`;
      docContent += `Export Timestamp: ${new Date().toISOString()}\n`;
      docContent += `Active Thread ID: ${activeChatId}\n\n`;

      messages.forEach((m) => {
        const name = m.role === "user" ? "USER SENDER" : `${m.agentUsed || "CHITTI-ROBO INTELLIGENCE CLUSTER"}`;
        docContent += `[${new Date(m.createdAt).toLocaleTimeString()}] ${name}:\n`;
        docContent += `${m.content}\n`;
        if (m.sources && m.sources.length > 0) {
          docContent += `Sources / Citations: \n`;
          m.sources.forEach((s) => { docContent += `- ${s.title}: ${s.url}\n`; });
        }
        docContent += `--------------------------------------------------------\n\n`;
      });

      const element = document.createElement("a");
      const file = new Blob([docContent], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `chitti_robo_session_${activeChatId.substring(0, 8)}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (e) {
      setSystemNotification("Export bypassed or failed. Print is restricted.");
      setTimeout(() => setSystemNotification(null), 4000);
    }
  };

  // Simple Markdown structure highlights
  const renderMessageContent = (text: string) => {
    if (!text) return "";
    
    // Check if it has markdown formatting
    const codeBlocks = text.split(/(```[\s\S]*?```)/g);
    
    return codeBlocks.map((part, index) => {
      if (part.startsWith("```")) {
        // Extract language and cleaner code
        const fit = part.match(/```(\w*)\n([\s\S]*?)```/) || [];
        const lang = fit[1] || "code";
        const code = fit[2] || part.replace(/```/g, "");
        
        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-gray-800 bg-[#02050f]/90 font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-1.5 bg-gray-950 text-[10px] text-cyan-400 font-bold uppercase border-b border-gray-900/60 select-none">
              <span>{lang} node</span>
              <button 
                onClick={() => copyToClipboard(code)}
                className="text-gray-500 hover:text-white transition flex items-center gap-1 font-sans cursor-pointer font-normal normal-case"
              >
                Copy Complete Segment
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-[11px] leading-relaxed text-emerald-300">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Convert clean carriage returns and bullet bold mappings
      const formattedLines = part.split("\n").map((line, lIdx) => {
        let content: any = line;
        
        // Match bullet lists
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          content = (
            <li className="ml-4 list-disc pl-1 text-gray-200">
              {applyBoldAndInline(line.trim().substring(2))}
            </li>
          );
        } else {
          content = applyBoldAndInline(line);
        }

        return <div key={lIdx} className="min-h-[1.2rem]">{content}</div>;
      });

      return <div key={index} className="space-y-1.5 font-sans leading-relaxed text-gray-200 text-sm md:text-base">{formattedLines}</div>;
    });
  };

  const applyBoldAndInline = (line: string) => {
    // Basic bold parsing **text**
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-semibold text-white tracking-tight">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }
    
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : line;
  };

  // Render a mini strip of agent selectors
  const getAgentHeaderIcon = (agentId: string, isActive = false) => {
    switch (agentId) {
      case "agent-deepseek": return <CodeXml className={`w-3.5 h-3.5 transition-colors ${isActive ? "text-white" : "text-purple-400"}`} />;
      case "agent-claude": return <Compass className={`w-3.5 h-3.5 transition-colors ${isActive ? "text-white" : "text-amber-400"}`} />;
      case "agent-grok": return <Globe className={`w-3.5 h-3.5 transition-colors ${isActive ? "text-white" : "text-cyan-400"}`} />;
      case "agent-kimi": return <FileSearch className={`w-3.5 h-3.5 transition-colors ${isActive ? "text-white" : "text-emerald-400"}`} />;
      default: return <Sparkles className={`w-3.5 h-3.5 transition-colors ${isActive ? "text-white" : "text-blue-400"}`} />;
    }
  };

  return (
    <div id="central-intelligence-window" className="flex flex-col h-full min-h-0 w-full justify-between relative overflow-hidden">
      
      {/* Dynamic Earth Rotating Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.11] pointer-events-none overflow-hidden z-0">
        <RotatingEarth width={550} height={550} className="w-full max-w-[550px] aspect-square" />
      </div>
      <div className="h-14 px-4 border-b border-gray-900 glassmorphism flex items-center justify-between select-none shrink-0 z-10">
        <div className="flex items-center max-w-[70%] sm:max-w-[75%] overflow-x-auto scrollbar-none py-1">
          <div className="flex items-center bg-[#070b1a]/95 border border-[#1e295d]/30 rounded-full p-1 gap-1 flex-shrink-0 shadow-sm">
            <button
              onClick={() => setManualAgentId("")}
              className={`
                px-3 py-1.5 rounded-full text-[10px] font-mono leading-none tracking-wider font-bold transition flex-shrink-0 cursor-pointer flex items-center gap-1
                ${manualAgentId === ""
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md font-extrabold shadow-cyan-500/10"
                  : "text-gray-400 hover:text-white hover:bg-slate-900/50"}
              `}
              id="agent-set-auto-btn"
            >
              <Bot className="w-3.5 h-3.5 shrink-0" />
              <span>AUTO-ROUTER</span>
            </button>
            
            {agents.map((a) => {
              const isManual = manualAgentId === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setManualAgentId(a.id)}
                  className={`
                    px-3 py-1.5 rounded-full text-[10px] font-mono leading-none tracking-wider font-semibold transition flex items-center gap-1 flex-shrink-0 cursor-pointer
                    ${isManual
                      ? "bg-purple-500 text-white shadow-md font-extrabold shadow-purple-500/10"
                      : "text-gray-400 hover:text-white hover:bg-slate-900/50"}
                  `}
                  id={`agent-set-selector-${a.id}`}
                >
                  {getAgentHeaderIcon(a.id, isManual)}
                  <span>{a.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clear Thread & Export triggers */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onToggleVoiceButtonsShut && (
            <button
              onClick={onToggleVoiceButtonsShut}
              className={`p-2 rounded-lg border transition cursor-pointer ${
                voiceButtonsShut
                  ? "bg-rose-[#0f050b]/20 border-rose-900/40 text-rose-400 hover:bg-rose-950/20"
                  : "bg-slate-950 border-gray-900 text-gray-500 hover:text-white"
              }`}
              title={voiceButtonsShut ? "Voice is SHUT (Click to Turn ON)" : "Shut Voice Buttons / Disable Voice Option"}
              id="chat-toggle-voice-btn"
            >
              {voiceButtonsShut ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={exportChatHistory}
            className="p-2 hover:bg-slate-900 rounded-lg text-gray-500 hover:text-white transition border border-transparent hover:border-gray-800"
            title="Download TXT Session Backup"
            id="download-session-btn"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClearChat}
            className="p-2 hover:bg-rose-950/10 rounded-lg text-gray-500 hover:text-rose-500 transition border border-transparent hover:border-rose-900/10"
            title="Wipe operational logs"
            id="wipe-operational-chat-btn"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages scrolling stack */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-6">
        {systemNotification && (
          <div className="bg-cyan-950/80 border border-cyan-800/60 p-3 rounded-xl flex items-center gap-2 text-cyan-400 font-mono text-xs shadow-md animate-pulse">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="flex-1">{systemNotification}</span>
            <button onClick={() => setSystemNotification(null)} className="text-gray-400 hover:text-white transition cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto select-none mt-20">
            <div className="w-16 h-16 rounded-3xl bg-[#091129] border border-cyan-800/35 flex items-center justify-center glow-cyan">
              <Bot className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-display font-semibold text-white">Quantum Routing Activated</h2>
            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              State any technical request, load code folders, or request live SERP research summaries. Our central router will automatically map and deploy the corresponding agency cluster.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-3 md:gap-4 ${isUser ? "justify-end" : "justify-start"}`}
                id={`message-bubble-${m.id}`}
              >
                {/* Agent Icon on Assistant items */}
                {!isUser && (
                  <div className="w-9 h-9 rounded-xl flex-shrink-0 bg-gray-900/90 border border-gray-850 flex items-center justify-center select-none shadow-sm">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                )}

                {/* Message Core Box */}
                <div className={`
                  max-w-[85%] md:max-w-[75%] rounded-2xl p-4 flex flex-col
                  ${isUser 
                    ? "bg-cyan-950/30 text-white rounded-br-none border border-cyan-800/25" 
                    : "bg-[#090f23] text-gray-100 rounded-bl-none border border-gray-850/80"}
                `}>
                  
                  {/* Top Bar attributes */}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-900/40 mb-2 font-mono text-[10px] select-none text-gray-500">
                    <span className="font-semibold text-cyan-500 font-display">
                      {isUser ? "MASTER COMMANDER" : m.agentUsed || "CHITTI-ROBO CORE NODE"}
                    </span>
                    <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
                  </div>

                  {/* Render content */}
                  <div className="text-left font-sans text-xs md:text-sm text-gray-250 leading-relaxed font-normal">
                    {renderMessageContent(m.content)}
                  </div>

                  {/* Render attachments info */}
                  {m.file && (
                    <div className="mt-3 p-2 bg-[#04091a] rounded-xl border border-gray-850 text-xs font-mono text-cyan-400 max-w-fit pr-4">
                      File Attached: <span className="text-white font-bold">{m.file.name}</span> ({m.file.size})
                    </div>
                  )}

                  {/* Render Grok dynamic Grounding sources */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-4 border-t border-gray-900/50 pt-2 font-mono text-[10px]">
                      <span className="text-cyan-500 font-bold block mb-1">SERP SOURCES INDEXED:</span>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {m.sources.map((s, idx) => (
                          <a 
                            href={s.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            key={idx}
                            className="bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-900/30 px-2 py-1 rounded text-cyan-400 font-bold flex items-center gap-1 max-w-[200px] truncate transition cursor-pointer"
                          >
                            <span>{s.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Render Image prompt formats */}
                  {m.promptDetails && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-950/40 border border-gray-850 font-mono text-[11px] text-gray-300">
                      <span className="text-purple-400 font-bold block mb-2 font-display text-xs">HIGGSFIELD ART SPECIFICATIONS:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                        <div><strong className="text-gray-500">Subject:</strong> <span className="text-white">{m.promptDetails.subject}</span></div>
                        <div><strong className="text-gray-500">Style:</strong> <span className="text-gray-300">{m.promptDetails.style}</span></div>
                        <div><strong className="text-gray-500">Lighting:</strong> <span className="text-gray-300">{m.promptDetails.lighting}</span></div>
                        <div><strong className="text-gray-500">Camera Angle:</strong> <span className="text-gray-300">{m.promptDetails.camera}</span></div>
                        <div><strong className="text-gray-500">Negative Cues:</strong> <span className="text-rose-400 font-sans text-[10px] block mt-0.5">{m.promptDetails.negative}</span></div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-gray-900/65">
                        <strong className="text-cyan-400">Synthesized Prompt:</strong>
                        <p className="p-2.5 bg-gray-950 rounded border border-gray-900 text-[10px] text-gray-200 mt-1 select-all">{m.promptDetails.rawPrompt || m.promptDetails.subject}</p>
                      </div>
                    </div>
                  )}

                  {/* Render video script timeline */}
                  {m.videoDetails && m.videoDetails.scenes && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-950/40 border border-gray-850 font-mono text-[11px] text-gray-300">
                      <span className="text-purple-400 font-bold block mb-2 font-display text-xs">HIGGSFIELD DIRECTOR TIMELINE:</span>
                      <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
                        {m.videoDetails.scenes.map((sc, scIdx) => (
                          <div key={scIdx} className="bg-[#030612]/60 p-3 rounded-lg border border-gray-900 relative">
                            <span className="absolute top-2.5 right-3 text-[10px] font-bold text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-900/30">SCENE {sc.sceneNum} ({sc.duration})</span>
                            <div className="mt-2 space-y-1 font-sans text-xs">
                              <div><strong className="text-gray-500 font-mono text-[10px]">Movement:</strong> <span className="text-white">{sc.cameraMovement}</span></div>
                              <div><strong className="text-gray-500 font-mono text-[10px]">Action:</strong> <span className="text-gray-300">{sc.action}</span></div>
                              <div><strong className="text-gray-500 font-mono text-[10px]">Lights & Sound:</strong> <span className="text-purple-300 font-mono text-[10px]">{sc.lighting} | {sc.audio}</span></div>
                              <div className="mt-2 bg-slate-950 p-2 rounded text-[10px] border border-gray-900 select-all font-mono">
                                <span className="text-purple-400 font-semibold block mb-0.5">Prompt Frame:</span> "{sc.prompt}"
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bubble action tool panel */}
                  <div className="flex items-center gap-1.5 mt-3 border-t border-gray-900/50 pt-2 font-mono text-[9px] text-gray-500 select-none flex-wrap">
                    <button 
                      onClick={() => handleCopy(m.content, m.id)}
                      className="hover:text-white flex items-center gap-1 cursor-pointer"
                      id={`msg-copy-btn-${m.id}`}
                    >
                      {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === m.id ? "COPIED" : "COPY"}</span>
                    </button>
                    <span>•</span>
                    <button 
                      onClick={() => handleSpeak(m.content, m.id)}
                      className="hover:text-white flex items-center gap-1 cursor-pointer"
                      id={`msg-speak-btn-${m.id}`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{speakingMsgId === m.id ? "HALT SPEECH" : "SPEAK ANSWER"}</span>
                    </button>
                    <span>•</span>
                    <button 
                      onClick={() => handleDownloadDocx(m.content)}
                      className="hover:text-purple-300 text-purple-400 font-bold flex items-center gap-1 cursor-pointer transition"
                      id={`msg-docx-btn-${m.id}`}
                      title="Download this response or generated script as a formatted Word (.docx) document"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>DOWNLOAD WORD (.DOCX)</span>
                    </button>

                    {!isUser && (
                      <>
                        <span>•</span>
                        <button
                          onClick={() => handleSendViaWhatsAppAPI(m.id, m.content)}
                          disabled={isSendingWaId !== null}
                          className={`flex items-center gap-1 cursor-pointer transition font-bold ${
                            waSendSuccessId === m.id
                              ? "text-emerald-400 font-extrabold"
                              : waSendErrorId === m.id
                                ? "text-rose-400"
                                : "text-emerald-500 hover:text-emerald-400"
                          }`}
                          id={`msg-wa-api-btn-${m.id}`}
                          title={`Instantly send this AI response to ${friendName || "your configured friend's phone"} via WhatsApp container API`}
                        >
                          {isSendingWaId === m.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>
                            {isSendingWaId === m.id
                              ? "TRANSMITTING..."
                              : waSendSuccessId === m.id
                                ? "SENT! ✓"
                                : waSendErrorId === m.id
                                  ? "FAILED ✗"
                                  : `SEND TO ${friendName ? friendName.toUpperCase() : "FRIEND"}`}
                          </span>
                        </button>
                        <span>•</span>
                        <a
                          href={`https://wa.me/${(() => {
                            let digits = (friendPhone || "").replace(/[^0-9]/g, "");
                            if (digits.length === 10) digits = `91${digits}`;
                            return digits;
                          })()}?text=${encodeURIComponent(m.content)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-500 hover:text-cyan-400 font-bold flex items-center gap-1 transition"
                          id={`msg-wa-direct-btn-${m.id}`}
                          title="Direct link to send this AI response directly via WhatsApp Web/App"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>DIRECT CHAT</span>
                        </a>
                      </>
                    )}
                  </div>

                </div>
              </div>
            );
          })
        )}

        {/* Dynamic Loading block with router diagnostics feedback */}
        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="w-9 h-9 rounded-xl bg-[#091129] border border-cyan-800/25 flex items-center justify-center animate-spin">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            
            <div className="p-4 rounded-2xl rounded-bl-none border border-cyan-900/30 bg-[#08122c]/40 text-gray-300 max-w-[70%] font-mono text-xs">
              <span className="text-cyan-400 font-bold block mb-1 uppercase text-[10px]">CENTRAL DEPLOYMENT ROUTING...</span>
              <p className="text-[11px] font-sans text-gray-400">Deploying specialized API cluster nodes. Reconstructing vector similarity matrix frames. Please standby.</p>
            </div>
          </div>
        )}

        <div className="h-6 shrink-0" />
        <div ref={endOfMessagesRef} />
      </div>

      {/* Persistent Static Input Area */}
      <div className="p-4 border-t border-gray-900 bg-[#040816]/90 z-25 shrink-0">
        
        {/* Dynamic upload widget toggle */}
        {showUploader && (
          <div className="mb-3.5 max-w-xl mx-auto border-t border-gray-900/60 pt-2 animate-fade-in">
            <FileUploader 
              onFileLoaded={setAttachedFile} 
              attachedFile={attachedFile} 
            />
          </div>
        )}

        <div className="relative max-w-3xl mx-auto flex items-end gap-3 bg-[#080d24] border border-gray-850 rounded-2xl p-2 focus-within:border-cyan-500/65 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all duration-300">
          
          {/* Plus icon button for selecting tool/agent */}
          <button
            onClick={() => setShowSelectorMenu(!showSelectorMenu)}
            className={`
              p-2.5 rounded-xl transition flex-shrink-0 select-none cursor-pointer
              ${showSelectorMenu
                ? "bg-purple-950 text-purple-400 border border-purple-800"
                : "text-gray-500 hover:text-white hover:bg-gray-850"}
            `}
            title="Select agent or active tool"
            id="plus-selector-btn"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Floated Dropdown Menu */}
          {showSelectorMenu && (
            <div 
              className="absolute bottom-16 left-2 w-72 max-w-[calc(100vw-2rem)] bg-[#060b21]/95 border border-[#1e295d] rounded-xl shadow-2xl p-3.5 z-50 animate-fade-in text-left space-y-3.5 backdrop-blur-xl transition-all duration-300"
              id="tool-agent-selector-menu"
            >
              {nestedSelectorView === "main" ? (
                <>
                  <div>
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-2">Select Active Agent</p>
                    <button
                      onClick={() => setNestedSelectorView("agents")}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0b112c]/65 border border-[#1e295d]/35 hover:bg-[#12193b] hover:border-[#1e295d]/80 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[#050818] border border-gray-900 text-purple-400">
                          {manualAgentId === "" ? <Bot className="w-4 h-4 text-cyan-400 animate-pulse" /> : getAgentHeaderIcon(manualAgentId, false)}
                        </div>
                        <div className="text-left min-w-0 max-w-[160px]">
                          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block font-medium leading-none mb-1">Active Routing</span>
                          <span className="text-[11px] font-bold text-white block truncate">
                            {manualAgentId === "" ? "Auto-Router (Dynamic)" : (agents.find(a => a.id === manualAgentId)?.name.split(" ")[0] || "Agent Model")}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition shrink-0" />
                    </button>
                  </div>

                  <div className="border-t border-[#12193b] pt-2.5">
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-2">Quick Launch Tool</p>
                    <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto scrollbar-none">
                      {[
                        { id: "imagine", label: "Imagine Studio", icon: Sparkles, color: "text-amber-400" },
                        { id: "airspace", label: "Indian Airspace Live", icon: Radar, color: "text-rose-400" },
                        { id: "converter", label: "File Converter", icon: RefreshCw, color: "text-indigo-400" },
                        { id: "trend", label: "Trend Intelligence", icon: TrendingUp, color: "text-cyan-400" },
                        { id: "analyzer", label: "Content Analyzer", icon: Globe, color: "text-emerald-400" },
                        { id: "whatsapp", label: "WA Automation", icon: MessageSquare, color: "text-green-400" },
                        { id: "voice", label: "Voice Gateway", icon: Mic, color: "text-indigo-400" },
                        { id: "dashboard", label: "System Health", icon: LayoutDashboard, color: "text-gray-400" },
                        { id: "memory", label: "Cognitive Memory", icon: Brain, color: "text-purple-400" },
                        { id: "prompts", label: "Prism Templates", icon: FlameKindling, color: "text-rose-400" }
                      ].map((tool) => {
                        const ToolIcon = tool.icon;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => {
                              if (onNavigateTab) {
                                onNavigateTab(tool.id);
                              }
                              setShowSelectorMenu(false);
                            }}
                            className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg bg-[#0b112c]/40 hover:bg-[#12193b] border border-transparent hover:border-[#1e295d] text-xs font-medium text-gray-300 hover:text-white transition group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <ToolIcon className={`w-3.5 h-3.5 ${tool.color}`} />
                              <span className="font-sans text-[11px]">{tool.label}</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-gray-550 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#12193b]">
                    <button
                      onClick={() => setNestedSelectorView("main")}
                      className="p-1 rounded bg-[#0b112c] hover:bg-slate-800 text-gray-400 hover:text-white transition cursor-pointer"
                      title="Go Back"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">Select Agent Model</span>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 max-h-64 overflow-y-auto scrollbar-none py-1">
                    <button
                      onClick={() => {
                        setManualAgentId("");
                        setShowSelectorMenu(false);
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl text-left transition border cursor-pointer ${
                        manualAgentId === ""
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-bold"
                          : "bg-[#0b112c]/40 text-gray-400 border-transparent hover:bg-gray-800/40 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Bot className="w-4 h-4 shrink-0 text-cyan-400" />
                        <div className="truncate">
                          <span className="text-[11px] block font-semibold leading-tight text-white">Auto-Router</span>
                          <span className="text-[9px] text-gray-500 block font-normal leading-normal truncate">Smart dynamic dispatch based on query content</span>
                        </div>
                      </div>
                      {manualAgentId === "" && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />}
                    </button>

                    {agents.map((a) => {
                      const isManual = manualAgentId === a.id;
                      return (
                        <button
                          key={a.id}
                          onClick={() => {
                            setManualAgentId(a.id);
                            setShowSelectorMenu(false);
                          }}
                          className={`flex items-center justify-between p-2 rounded-xl text-left transition border cursor-pointer ${
                            isManual
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/30 font-bold"
                              : "bg-[#0b112c]/40 text-gray-400 border-transparent hover:bg-gray-800/40 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="shrink-0">{getAgentHeaderIcon(a.id, isManual)}</span>
                            <div className="truncate">
                              <span className="text-[11px] block font-semibold leading-tight text-white">{a.name}</span>
                              <span className="text-[9px] text-gray-500 block font-normal leading-normal truncate">{a.description || a.role}</span>
                            </div>
                          </div>
                          {isManual && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Paperclip attachment toggle trigger */}
          <button
            onClick={() => {
              if (attachedFile) {
                // If there's an active attached file, do not open, let uploader clear handle it
                setShowUploader(true);
              } else {
                setShowUploader(!showUploader);
              }
            }}
            className={`
              p-2.5 rounded-xl transition flex-shrink-0 select-none cursor-pointer
              ${showUploader || attachedFile
                ? "bg-cyan-950 text-cyan-400 border border-cyan-800"
                : "text-gray-500 hover:text-white hover:bg-gray-800"}
            `}
            title="Mount local attachment specification"
            id="attachment-gate-btn"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Voice portal mic fallback button */}
          {onTriggerVoicePortal && !voiceButtonsShut && (
            <button
              onClick={onTriggerVoicePortal}
              className="p-2.5 rounded-xl text-gray-550 hover:text-cyan-400 hover:bg-cyan-950/20 transition flex-shrink-0 cursor-pointer"
              title="Vocal Portal dictation entry"
              id="vocal-shortcut-btn"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}

          {/* Core Input box */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              manualAgentId === ""
                ? "Ask Chitti-Robo anything or say a voice command..."
                : `Commanding ${agents.find((a) => a.id === manualAgentId)?.name.split(" ")[0]} directly...`
            }
            rows={1}
            className="flex-1 bg-transparent border-0 text-white placeholder-gray-550 focus:outline-none focus:ring-0 max-h-40 resize-none font-sans text-sm py-2 px-1 focus:border-0"
            style={{ minHeight: "2.2rem" }}
            id="chat-terminal-input"
          />

          {/* Send buttons */}
          <button
            onClick={handleSend}
            disabled={isLoading || (!inputText.trim() && !attachedFile)}
            className={`
              p-3 rounded-xl flex items-center justify-center transition flex-shrink-0 select-none cursor-pointer
              ${isLoading || (!inputText.trim() && !attachedFile)
                ? "bg-gray-900 text-gray-600 cursor-not-allowed"
                : "bg-cyan-500 text-gray-950 hover:bg-cyan-400 glow-cyan"}
            `}
            id="chat-send-btn"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Input indicators */}
        <div className="mt-2 text-center text-[10px] font-mono text-gray-500 uppercase tracking-widest select-none flex items-center justify-center gap-1 flex-wrap">
          <span>Active Central Intelligence Gateway</span>
          <span>•</span>
          <span className="text-cyan-500 font-bold">RATE LIMIT: 100/min</span>
          {attachedFile && (
            <>
              <span>•</span>
              <span className="text-purple-400">Mount payload active: {attachedFile.name} ({attachedFile.size})</span>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
