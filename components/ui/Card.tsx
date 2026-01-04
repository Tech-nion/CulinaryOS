
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverable = false }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        glass-card rounded-[2.5rem] overflow-hidden p-6 shadow-2xl transition-all duration-500
        ${hoverable ? 'hover:shadow-emerald-500/10 hover:-translate-y-1 cursor-pointer' : ''}
        bg-white/[0.03] border-white/10
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ title: string; subtitle?: string; icon?: React.ReactNode }> = ({ title, subtitle, icon }) => (
  <div className="flex items-center justify-between mb-8">
    <div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      {subtitle && <p className="text-xs text-slate-600 mt-1 font-bold">{subtitle}</p>}
    </div>
    {icon && <div className="p-3 bg-white/5 text-emerald-700 rounded-2xl border border-white/5">{icon}</div>}
  </div>
);
