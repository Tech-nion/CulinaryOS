
import React, { memo } from 'react';
import { ICONS } from '../constants';

interface QuickActionsProps {
  onAdd: () => void;
  onScan: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAdd, onScan }) => {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
      <button 
        onClick={onScan}
        aria-label="Scan item label"
        className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-700 shadow-2xl border border-slate-200 hover:bg-slate-50 transition-all hover:scale-110 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
      </button>
      
      <button 
        onClick={onAdd}
        aria-label="Add item manually"
        className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all hover:scale-110 group"
      >
        <ICONS.Plus />
        <span className="absolute right-20 bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest whitespace-nowrap">
          Log Entry
        </span>
      </button>
    </div>
  );
};

export default memo(QuickActions);
