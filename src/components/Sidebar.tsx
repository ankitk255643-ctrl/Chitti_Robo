import React, { useEffect, useState } from "react";
import { 
  Bot, 
  Terminal, 
  Mic, 
  LayoutDashboard, 
  Settings, 
  Brain, 
  SlidersHorizontal, 
  HeartHandshake, 
  Menu, 
  X, 
  Plus, 
  Trash2,
  Dot,
  FlameKindling,
  History,
  FileCode,
  FolderLock,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  TrendingUp,
  Sparkles,
  Globe,
  RefreshCw,
  BookOpen,
  Coins,
  Radar,
  Tv,
  CreditCard,
  Shield,
  Key,
  LogOut,
  Compass,
  HelpCircle,
  FlaskConical,
  Info,
  Activity,
  Workflow
} from "lucide-react";
import { Chat } from "../types";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  chats: Chat[];
  activeChatId: string;
  setActiveChatId: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  profile: { name: string; email: string; avatar_url: string; role?: string };
  isOnline: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onToggleAdminRole?: () => void;
  onLogout?: () => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  chats,
  activeChatId,
  setActiveChatId,
  onNewChat,
  onDeleteChat,
  profile,
  isOnline,
  isCollapsed = false,
  onToggleCollapse,
  onToggleAdminRole,
  onLogout,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { id: "landing", label: "Central Command", icon: Bot },
    { id: "ai_agent", label: "AI Agent", icon: Workflow },
    { id: "imagine", label: "Imagine Studio", icon: Sparkles },
    { id: "omnigen_ai", label: "Omnigen AI Studio", icon: Sparkles },
    { id: "taskhub", label: "Workspace Studio", icon: BookOpen },
    { id: "simulation", label: "Simulation Maker", icon: Compass },
    { id: "curiosity", label: "Curiosity Arena", icon: HelpCircle },
    { id: "dashboard", label: "System Health", icon: LayoutDashboard },
    { id: "billing", label: "Plans & Billing", icon: CreditCard },
    { id: "about_us", label: "About & Terms", icon: Info },
    { id: "chat", label: "Intelligence Core", icon: Terminal },
    { id: "voice", label: "Voice Gateway", icon: Mic },
    { id: "trend", label: "Trend Intelligence", icon: TrendingUp },
    { id: "globe3d", label: "3D Climate Globe", icon: Globe },
    { id: "virtual_screening", label: "Protein Screening", icon: FlaskConical },
    { id: "vista3d", label: "VISTA-3D Medical NIM", icon: Activity },
    { id: "analyzer", label: "Content Analyzer", icon: Compass },
    { id: "live_intel", label: "Live Intel", icon: Tv },
    { id: "airspace", label: "Indian Airspace Live", icon: Radar },
    { id: "investor", label: "AI Asset Analyzer", icon: Coins },
    { id: "whatsapp", label: "WA Automation", icon: MessageSquare },
    { id: "converter", label: "File Converter", icon: RefreshCw },
    { id: "agents", label: "Agent Directory", icon: SlidersHorizontal },
    { id: "memory", label: "Cognitive Memory", icon: Brain },
    { id: "prompts", label: "Prism Templates", icon: FlameKindling },
    { id: "embed", label: "Embed Code", icon: FileCode },
    { id: "key_health", label: "API Key Health", icon: Key },
    { id: "admin", label: "Admin Control Panel", icon: Shield, isOwnerAdminOnly: true },
  ];

  const handleTabSelect = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileOpen(false);
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChatId(chatId);
    setCurrentTab("chat");
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Sticky Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 glassmorphism z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-cyan-400" />
          <span className="font-display font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-450">CHITTI-ROBO</span>
          <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded uppercase font-mono font-bold">CORE v1.2</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
          id="mobile-menu-trigger"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Main Sidebar Wrapper */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 h-full bg-[#070b19] border-r border-[#151c35] flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0
        ${isCollapsed ? "lg:w-16 w-72" : "w-72"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo and Status Block - Fixed at top */}
        <div className="flex-shrink-0">
          <div className="h-16 px-4 flex items-center justify-between border-b border-gray-900/60">
            <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "gap-2"}`}>
              <Bot className="w-7 h-7 text-cyan-400 animate-pulse flex-shrink-0" />
              {!isCollapsed && (
                <div>
                  <span className="font-display font-semibold text-sm tracking-tight text-white block leading-none">Chitti-Robo</span>
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block mt-1">Mega Command</span>
                </div>
              )}
            </div>
            
            {/* Collapse toggle trigger button next to logo when expanded */}
            {!isCollapsed && onToggleCollapse && (
              <button 
                onClick={onToggleCollapse}
                className="p-1 px-1.5 rounded-md border border-gray-800 hover:bg-cyan-950/20 text-gray-500 hover:text-cyan-400 transition cursor-pointer"
                title="Collapse Sidebar"
                id="sidebar-collapse-btn-expanded"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Collapsed state Expand Toggle Trigger overlay */}
          {isCollapsed && onToggleCollapse && (
            <div className="flex justify-center py-2 border-b border-gray-900/45">
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-full bg-cyan-950/40 border border-cyan-900/40 text-cyan-400 hover:text-white transition cursor-pointer hover:bg-cyan-900/40"
                title="Expand Sidebar"
                id="sidebar-expand-btn-collapsed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable middle container containing Navigation & Chats - allows scrolling overflown sections */}
        <div className="flex-1 overflow-y-auto min-h-0 py-2 space-y-4 pr-1">
          {/* Navigation Links */}
          <nav className="p-2.5 space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1.5">Systems</p>
            )}
            {menuItems.filter(item => !item.isOwnerAdminOnly || profile?.role === "owner_admin").map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSelect(item.id)}
                  id={`nav-link-${item.id}`}
                  title={isCollapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center rounded-lg text-sm transition duration-200 group relative
                    ${isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-1.5"}
                    ${isActive 
                      ? "bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400" 
                      : "text-gray-400 hover:text-gray-100 hover:bg-gray-950/40"}
                  `}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-cyan-400" : "text-gray-500 group-hover:text-gray-400"}`} />
                  {!isCollapsed && <span className="font-display font-medium text-xs">{item.label}</span>}
                  
                  {/* Floating tooltip only for collapsed layout */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2 py-1 bg-gray-950 text-white text-[10px] font-mono rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none border border-gray-800 z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Chats History Cluster */}
          <div className={`flex flex-col py-2 border-t border-gray-900/40 ${isCollapsed ? "items-center" : "px-4"}`}>
            <div className={`flex items-center justify-between mb-2 mt-2 ${isCollapsed ? "flex-col gap-2" : "px-1"}`}>
              {!isCollapsed ? (
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <History className="w-3 h-3" /> Chats
                </span>
              ) : (
                <History className="w-4 h-4 text-gray-500" />
              )}
              <button 
                onClick={onNewChat}
                className={`
                  text-gray-400 hover:text-cyan-400 rounded transition border border-gray-850 hover:border-cyan-800/30 shadow-sm cursor-pointer
                  ${isCollapsed ? "p-1.5" : "p-1"}
                `}
                title="Spawn new memory socket"
                id="new-chat-sidebar-btn"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {!isCollapsed && (
              <div className="space-y-1 overflow-y-auto pr-1 mt-1 max-h-[180px]">
                {chats.length === 0 ? (
                  <p className="text-[10px] text-gray-500 text-center py-4 font-mono">No active logs.</p>
                ) : (
                  chats.map((c) => {
                    const isActive = activeChatId === c.id;
                    return (
                      <div 
                        key={c.id}
                        className={`
                          flex items-center justify-between group rounded-lg text-[11px] font-mono transition p-1.5
                          ${isActive ? "bg-gray-900 text-cyan-400" : "text-gray-400 hover:bg-gray-950/20 hover:text-white"}
                        `}
                      >
                        <button
                          onClick={() => handleChatSelect(c.id)}
                          className="flex-1 text-left truncate pr-2"
                          title={c.title}
                        >
                          {c.title}
                        </button>
                        <button
                          onClick={() => onDeleteChat(c.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-500 hover:text-rose-500 rounded transition"
                          title="Purge thread"
                          id={`purge-chat-${c.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Connected Auth / Profile Widget - Fixed at bottom */}
        <div className={`border-t border-gray-900/60 ${isCollapsed ? "p-2" : "p-3"} flex-shrink-0`}>
          <div className={`flex items-center bg-[#090f24] border border-gray-900/80 rounded-xl ${isCollapsed ? "p-1 flex-col gap-2 justify-center" : "gap-3 p-2"}`}>
            <img 
              src={profile.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
              alt="Commander Profile" 
              className="w-8 h-8 rounded-lg border border-cyan-800/25 object-cover flex-shrink-0"
              title={isCollapsed ? `${profile.name} (${profile.email}) - Role: ${profile.role}` : undefined}
            />
            {!isCollapsed ? (
              <div className="min-w-0 flex-1">
                <span className="text-xs font-display font-medium text-white block truncate">{profile.name}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-mono text-gray-500 truncate block max-w-[110px]">{profile.email}</span>
                  <span className={`text-[8px] font-mono font-extrabold px-1 py-0.2 rounded scale-90 ${profile?.role === "owner_admin" ? "bg-cyan-950 text-cyan-400 border border-cyan-800/30" : "bg-gray-800 text-gray-400"}`}>
                    {profile?.role === "owner_admin" ? "ADMIN" : "USER"}
                  </span>
                </div>
              </div>
            ) : (
              onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                  title="Disconnect Security Gateway"
                  id="collapsed-logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )
            )}
          </div>
          
          {!isCollapsed && (
            <div className="mt-2.5 space-y-1.5 px-1">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono text-gray-500 tracking-wider">SECURE LINK STATUS</span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900/20">CLIENT ACTIVE</span>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  id="sidebar-logout-btn"
                  className="w-full mt-1 px-2.5 py-1.5 rounded text-[10px] font-mono font-bold text-rose-400 bg-rose-950/20 hover:bg-rose-900/25 border border-rose-900/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Disconnect Gateway Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  DISCONNECT TERMINAL
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Backdrop Trigger for Mobile */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          className="fixed inset-0 bg-[#000]/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}
    </>
  );
}
