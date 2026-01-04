
import React from 'react';
import { ICONS } from '../constants';
import { ViewState } from '../types';

interface HeaderProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    { id: 'discovery', label: 'Discovery', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> },
    { id: 'recipes', label: 'Studio', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/></svg> },
    { id: 'inventory', label: 'Stock', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg> },
    { id: 'profile', label: 'Profile', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg> }
  ];

  return (
    <header className="sticky top-4 z-50 mx-auto max-w-7xl px-4 mb-8">
      <div className="glass-card h-20 px-6 flex items-center justify-between border-slate-200/50">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => onViewChange('dashboard')}
        >
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <ICONS.Kitchen />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-none">CulinaryOS</h1>
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5 block">GLOBAL KITCHEN HUB</span>
          </div>
        </div>
        
        <nav className="flex items-center gap-1 sm:gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewState)}
              className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 ${
                currentView === item.id 
                ? 'bg-emerald-700 text-white shadow-md' 
                : 'text-slate-500 hover:text-emerald-700 hover:bg-white'
              }`}
            >
              <span className="hidden lg:inline">{item.label}</span>
              <span className="lg:hidden">{item.icon}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-slate-200 p-0.5 overflow-hidden ring-2 ring-emerald-500/10 hidden md:block">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Chef" alt="User" className="w-full h-full object-cover" />
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
