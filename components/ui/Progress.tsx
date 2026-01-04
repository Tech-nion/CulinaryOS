
import React from 'react';

interface ProgressProps {
  value: number;
  max?: number;
  color?: string;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, max = 100, color = 'bg-emerald-500', className = '' }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className={`w-full bg-slate-100 rounded-full h-2.5 overflow-hidden ${className}`}>
      <div 
        className={`${color} h-full transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
