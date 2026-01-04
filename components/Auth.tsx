
import React, { useState, useEffect } from 'react';
import { supabase, isPlaceholder } from '../lib/supabase';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface AuthProps {
  onDemoLogin?: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onDemoLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); 
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle URL errors (like expired links or access denied)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('error=access_denied') || hash.includes('error_code=otp_expired')) {
      setErrorMsg("Link Expired or Already Used. If you have already initialized your hub, please Sign In using your Password below.");
      setIsSignUp(false); // Force back to Sign In
      // Clear the hash to prevent repeating the message on refresh
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    
    if (isPlaceholder) {
      setErrorMsg("Connection Error: Hub configuration is incomplete.");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Registration Flow: Sends a verification link for 1st-time link
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { username: email.split('@')[0] }
          }
        });
        
        if (error) throw error;

        if (!data?.session && data?.user) {
          setSuccessMsg('INITIALIZATION: A one-time link has been sent to your email. Click it to activate your hub. Subsequent visits will only require your password.');
        } else if (data?.session) {
          setSuccessMsg('HUB ACTIVE: Secure link established.');
        }
      } else {
        // Returning User Access: Strictly Password and Email
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Invalid protocol. Please verify your Email and Password.");
          }
          throw error;
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to establish secure link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0f1c] overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/5 blur-[150px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md z-10 space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-900/40 animate-float border border-white/10 ring-8 ring-emerald-500/5">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 12h18"/><path d="M3 18h18"/><path d="M11 6h2"/><path d="M12 2v4"/>
            </svg>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">CulinaryOS</h1>
          <p className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px]">Secure Kitchen Gateway</p>
        </div>

        <Card className="p-10 border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-3xl ring-1 ring-white/10">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">
              {isSignUp ? 'Initialize Hub' : 'Establish Secure Link'}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              {isSignUp ? 'One-time email link verification required' : 'Standard Password-based Access'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Node Identifier (Email)</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/10 text-white focus:border-emerald-500 focus:bg-white/10 transition-all outline-none font-medium placeholder:text-slate-700"
                placeholder="chef@kitchen.io"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Access Protocol (Password)</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/10 text-white focus:border-emerald-500 focus:bg-white/10 transition-all outline-none font-medium placeholder:text-slate-700"
                placeholder="••••••••"
                required
              />
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl animate-in shake duration-300">
                <p className="text-xs font-bold text-rose-400 text-center leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in slide-in-from-top-2">
                <p className="text-xs font-bold text-emerald-400 text-center leading-relaxed">{successMsg}</p>
              </div>
            )}

            <Button 
              type="submit"
              isLoading={loading}
              className="w-full py-5 rounded-2xl font-black text-base shadow-xl group"
            >
              {isSignUp ? 'INITIALIZE (REQUEST LINK)' : 'SIGN IN WITH PASSWORD'}
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7-7 7"/></svg>
            </Button>
          </form>

          <div className="mt-8 flex flex-col gap-4 text-center border-t border-white/5 pt-8">
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-emerald-400 transition-colors"
            >
              {isSignUp ? 'Returning User? SIGN IN' : 'New Hub Node? INITIALIZE'}
            </button>
            
            <button 
              onClick={onDemoLogin}
              className="text-[10px] font-black text-slate-700 hover:text-amber-500 uppercase tracking-widest transition-colors"
            >
              Access Offline Sandbox
            </button>
          </div>
        </Card>
        
        <div className="flex justify-between px-2">
          <p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.4em]">v3.1.5 // STABLE</p>
          <p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.4em]">ENCRYPTED NODE</p>
        </div>
      </div>
    </div>
  );
};
