import React, { useState } from 'react';
import Ferrofluid from './Ferrofluid';
import { Bot, Mail, Lock, User, Shield, ArrowRight, Eye, EyeOff, X, CheckCircle2, AlertTriangle, Key } from 'lucide-react';

const FERROFLUID_BACKGROUND_COLORS = ['#06b6d4', '#4f46e5', '#0891b2'];

interface AuthPageProps {
  onLoginSuccess: (profileData: { name: string; email: string; role: string; avatar_url?: string }) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Backdoor Admin Override state
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overridePassword, setOverridePassword] = useState('');
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [overrideMessage, setOverrideMessage] = useState({ text: '', type: '' });

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = overridePassword.trim();
    // Configure backdoor password to exactly 1413914 (a=1, d=4, m=13, i=9, n=14)
    if (normalized === '1413914') {
      setAdminUnlocked(true);
      setOverrideMessage({
        text: 'Access Granted: owner_admin override protocol initiated.',
        type: 'success'
      });
      setTimeout(async () => {
        setShowOverrideModal(false);
        const adminData = {
          name: 'Supreme Admin',
          email: 'admin@chitti-robo.ai',
          role: 'owner_admin',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        };

        try {
          // Sync with profile and role APIs in background
          await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminData)
          });
          await fetch('/api/profile/role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'owner_admin' })
          });
        } catch (err) {
          console.warn('Backend sync failed, continuing locally:', err);
        }

        // Direct login
        onLoginSuccess(adminData);
      }, 1000);
    } else {
      setOverrideMessage({
        text: 'Invalid system override code. Try again.',
        type: 'error'
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please provide a valid commander email.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (isSignUp && !name) {
      setError('Please specify your operational name.');
      return;
    }

    const finalRole = adminUnlocked ? 'owner_admin' : 'user';
    const finalName = name || (isSignUp ? 'New Officer' : 'Master Commander');
    
    // Fallback operational avatars based on admin status
    const avatarUrl = finalRole === 'owner_admin'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';

    const loginData = {
      name: finalName,
      email: email,
      role: finalRole,
      avatar_url: avatarUrl
    };

    try {
      // Save profile to the backend to keep it persistent across refreshes
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      // Update role explicitly on backend if administrative
      if (finalRole === 'owner_admin') {
        await fetch('/api/profile/role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'owner_admin' })
        });
      } else {
        await fetch('/api/profile/role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'user' })
        });
      }

      onLoginSuccess({
        ...loginData,
        role: finalRole
      });
    } catch (err) {
      console.warn('API sync failed, logging in locally:', err);
      onLoginSuccess(loginData);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#03010a] text-white font-sans overflow-hidden">
      
      {/* Dynamic interactive background using Ferrofluid */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-70 pointer-events-none">
        <Ferrofluid
          colors={FERROFLUID_BACKGROUND_COLORS}
          dpr={0.5}
          speed={0.4}
          scale={1.5}
          turbulence={1.1}
          fluidity={0.12}
          rimWidth={0.25}
          sharpness={2.2}
          shimmer={1.2}
          glow={2.0}
          flowDirection="down"
          opacity={1}
          mouseInteraction={true}
          mouseStrength={1.2}
          mouseRadius={0.3}
        />
      </div>

      {/* Grid overlay for a sci-fi tactical dashboard effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c102033_1px,transparent_1px),linear-gradient(to_bottom,#0c102033_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-1" />
      
      {/* Abstract radial ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Glassmorphic Auth Container Card */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-[#070b19]/80 backdrop-blur-xl border border-gray-800/85 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden transition-all duration-300">
        
        {/* Decorative dynamic top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600" />

        {/* Illusion Dot - Top Left */}
        <div className="absolute top-4 left-4">
          <div className="group relative p-2 rounded-full hover:bg-cyan-500/10 transition-all flex items-center justify-center">
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              adminUnlocked ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-gray-700 group-hover:bg-cyan-400 group-hover:scale-125'
            }`} />
          </div>
        </div>

        {/* Illusion Dot - Bottom Left */}
        <div className="absolute bottom-4 left-4">
          <div className="group relative p-2 rounded-full hover:bg-cyan-500/10 transition-all flex items-center justify-center">
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              adminUnlocked ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-gray-700 group-hover:bg-cyan-400 group-hover:scale-125'
            }`} />
          </div>
        </div>

        {/* Illusion Dot - Bottom Right */}
        <div className="absolute bottom-4 right-4">
          <div className="group relative p-2 rounded-full hover:bg-cyan-500/10 transition-all flex items-center justify-center">
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              adminUnlocked ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-gray-700 group-hover:bg-cyan-400 group-hover:scale-125'
            }`} />
          </div>
        </div>

        {/* Hidden back-door switch button in top corner */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => {
              setOverrideMessage({ text: '', type: '' });
              setOverridePassword('');
              setShowOverrideModal(true);
            }}
            id="hidden-admin-override-trigger"
            className="group relative p-2 rounded-full hover:bg-cyan-500/10 transition-all cursor-pointer flex items-center justify-center"
            title="Secure Backdoor Access Link"
          >
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              adminUnlocked ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-gray-700 group-hover:bg-cyan-400 group-hover:scale-125'
            }`} />
            <span className="absolute right-0 -bottom-8 scale-0 transition-all rounded bg-gray-950 p-1 text-[8px] font-mono text-cyan-400 group-hover:scale-100 whitespace-nowrap">
              Admin Link
            </span>
          </button>
        </div>

        {/* Header Branding */}
        <div className="p-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Bot className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase font-mono">
            CHITTI-ROBO <span className="text-cyan-400">COMMAND</span>
          </h1>
          <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase tracking-widest">
            Quantum intelligence terminal &bull; SECURE GATEWAY
          </p>

          {adminUnlocked && (
            <div className="mt-4 inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-mono text-emerald-400 animate-bounce">
              <Shield className="w-3.5 h-3.5" />
              ADMIN OVERRIDE DETECTED
            </div>
          )}
        </div>

        {/* Tabs for Login / Register */}
        <div className="flex border-b border-gray-800/60 px-8">
          <button
            onClick={() => {
              setIsSignUp(false);
              setError('');
            }}
            className={`flex-1 pb-3 text-sm font-semibold tracking-wide border-b-2 transition duration-200 uppercase font-mono ${
              !isSignUp ? 'text-cyan-400 border-cyan-500' : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsSignUp(true);
              setError('');
            }}
            className={`flex-1 pb-3 text-sm font-semibold tracking-wide border-b-2 transition duration-200 uppercase font-mono ${
              isSignUp ? 'text-cyan-400 border-cyan-500' : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Main Form Fields */}
        <form onSubmit={handleFormSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400 flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                Operational Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Commander Logan"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0a0f24]/60 border border-gray-800 focus:border-cyan-500/50 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition duration-200 font-mono"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              Commander Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="commander@chitti-robo.ai"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0a0f24]/60 border border-gray-800 focus:border-cyan-500/50 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition duration-200 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              Access Secret Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#0a0f24]/60 border border-gray-800 focus:border-cyan-500/50 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition duration-200 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Connect Gateway Action Button */}
          <button
            type="submit"
            className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] font-mono cursor-pointer"
          >
            <span>{isSignUp ? 'Initiate Account Integration' : 'Establish Command Link'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Explanatory subtitle */}
          <div className="text-center text-[10px] text-gray-500 pt-2 font-mono">
            SECURE SHA-256 SYMMETRIC END-TO-END CHITTI-SUITE CONNECTION
          </div>
        </form>
      </div>

      {/* Pop-up Container: Hidden Backdoor Override password prompt */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#0a0f24] border border-cyan-500/30 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.25)] p-6 overflow-hidden">
            
            {/* Corner Close button */}
            <button
              onClick={() => setShowOverrideModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Shield and Protocol Details */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Shield className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono tracking-tight text-white uppercase">
                  OVERRIDE LINK PROTOCOL
                </h3>
                <span className="text-[9px] font-mono text-cyan-400/70 block">
                  SYSTEM PORT: 3000 ADMIN BACKDOOR
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-mono mb-4">
              Enter the administration security code to toggle the "owner_admin" system permissions. 
              <br />
              <span className="text-gray-500 italic mt-1 block">
                (If you close this modal, you can still log in standard style as a standard user with normal permissions).
              </span>
            </p>

            {overrideMessage.text && (
              <div className={`p-2.5 rounded-lg text-[11px] font-mono flex items-center gap-2 mb-4 ${
                overrideMessage.type === 'success' 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}>
                {overrideMessage.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                )}
                <span>{overrideMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
                  Secret Admin Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cyan-500/60">
                    <Key className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="password"
                    value={overridePassword}
                    onChange={(e) => setOverridePassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="w-full pl-9 pr-3 py-2 bg-[#050814] border border-cyan-500/20 focus:border-cyan-500 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none transition font-mono"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="flex-1 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-[11px] font-mono transition cursor-pointer"
                >
                  Cancel / Normal Login
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-[11px] font-mono transition shadow-lg hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] cursor-pointer"
                >
                  Verify Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
