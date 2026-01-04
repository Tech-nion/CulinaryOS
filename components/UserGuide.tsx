
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: "1. Hub Initialization",
    description: "To start, enter your email and password. Click 'Initialize Hub'. IMPORTANT: Check your email inbox and click the verification link to activate your secure kitchen node.",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>,
    color: "bg-emerald-500"
  },
  {
    title: "2. Setting the Context",
    description: "Navigate to 'Registry'. Tell the system how many adults/kids you feed. Change the 'Occasion' to 'Party' if you're hosting; the hub will automatically scale your target stock levels.",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    color: "bg-blue-500"
  },
  {
    title: "3. Smart Cooking",
    description: "The 'Studio' uses Gemini AI to analyze your expiring items. It suggests recipes that minimize waste. Click 'Begin Phase' for a guided, step-by-step cooking experience.",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
    color: "bg-amber-500"
  },
  {
    title: "4. Neural Logistics",
    description: "When items hit critical low levels, they appear on your Grocery List. Use the 'Locate Nearest Marts' button to find delivery-ready stores grounded by Google Maps.",
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    color: "bg-rose-500"
  }
];

export const UserGuide: React.FC<UserGuideProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#0a0f1c]/90 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl p-0 overflow-hidden border-white/10 shadow-3xl bg-[#111827] ring-1 ring-white/10">
        <div className="p-10 text-center">
          <div className={`w-24 h-24 ${STEPS[currentStep].color} rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-10 shadow-2xl animate-float border-4 border-white/10`}>
            {STEPS[currentStep].icon}
          </div>
          
          <p className="text-emerald-500 font-black uppercase tracking-[0.4em] text-[10px] mb-2">Manual Phase {currentStep + 1}</p>
          <h2 className="text-4xl font-black text-white mb-6 tracking-tight">
            {STEPS[currentStep].title}
          </h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-lg mx-auto">
            {STEPS[currentStep].description}
          </p>

          <div className="flex justify-center gap-3 mt-12">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-500 ${currentStep === i ? 'w-12 bg-emerald-500' : 'w-3 bg-slate-800'}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/5">
            <button 
              onClick={onClose}
              className="text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors"
            >
              Skip Briefing
            </button>
            <div className="flex gap-4">
              {currentStep > 0 && (
                <Button variant="ghost" onClick={() => setCurrentStep(prev => prev - 1)} className="text-slate-400 hover:text-white">
                  Previous
                </Button>
              )}
              {currentStep < STEPS.length - 1 ? (
                <Button onClick={() => setCurrentStep(prev => prev + 1)} className="bg-emerald-600 px-12 py-4 rounded-2xl font-black shadow-xl shadow-emerald-600/20">
                  Next Protocol
                </Button>
              ) : (
                <Button onClick={onClose} className="bg-emerald-600 px-12 py-4 rounded-2xl font-black shadow-xl shadow-emerald-600/20">
                  Initialize Hub
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
