
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { chatWithChef } from '../services/geminiService';
import { InventoryItem } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface AIChatProps {
  inventory: InventoryItem[];
}

const AIChat: React.FC<AIChatProps> = ({ inventory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'chef', text: string}[]>([
    { role: 'chef', text: "Systems online. I'm your Culinary Assistant. How can I optimize your kitchen today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatWithChef(userMsg, inventory);
      setMessages(prev => [...prev, { role: 'chef', text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'chef', text: "Connection issues detected. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, inventory]);

  return (
    <div className="fixed bottom-32 right-8 z-50">
      {isOpen ? (
        <Card className="w-80 md:w-96 h-[550px] flex flex-col p-0 shadow-3xl border-slate-200 overflow-hidden animate-in slide-in-from-bottom-8 duration-300 bg-white/95 backdrop-blur-3xl ring-8 ring-emerald-500/5">
          <div className="p-6 bg-[#0f172a] text-white flex justify-between items-center border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/></svg>
              </div>
              <div>
                <p className="font-bold tracking-tight text-sm text-white">Culinary AI Hub</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Linked</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="hover:bg-white/10 p-2 rounded-xl transition-colors text-slate-400 hover:text-white"
              aria-label="Close AI Chat"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium shadow-sm ${
                  m.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for suggestions..."
              aria-label="Ask for culinary suggestions"
              className="flex-1 bg-slate-50 rounded-xl px-5 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 border border-slate-200 focus:border-emerald-700/30 text-slate-800"
            />
            <Button size="icon" onClick={handleSend} disabled={isLoading} aria-label="Send Message" className="w-12 h-12 rounded-xl shadow-none bg-emerald-600 text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </Button>
          </div>
        </Card>
      ) : (
        <button 
          id="ai-chat-trigger"
          onClick={() => setIsOpen(true)}
          aria-label="Open Culinary AI Chat"
          className="w-18 h-18 bg-[#0f172a] text-emerald-500 border border-emerald-500/30 rounded-[2rem] flex items-center justify-center shadow-2xl hover:scale-110 hover:rotate-3 transition-all duration-300 relative group ring-8 ring-emerald-500/10"
        >
          <div className="absolute inset-0 bg-emerald-400/10 rounded-[2rem] animate-ping group-hover:hidden"></div>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
        </button>
      )}
    </div>
  );
};

export default memo(AIChat);
