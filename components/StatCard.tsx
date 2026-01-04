
import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: string;
  isValueAnimated?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, color, isValueAnimated }) => {
  const [displayValue, setDisplayValue] = useState<string | number>(isValueAnimated ? 0 : value);

  useEffect(() => {
    if (isValueAnimated && typeof value === 'string' && value.startsWith('$')) {
      const target = parseFloat(value.replace('$', ''));
      let current = 0;
      const duration = 1500;
      const stepTime = 30;
      const steps = duration / stepTime;
      const increment = target / steps;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(`$${current.toFixed(2)}`);
        }
      }, stepTime);
      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, isValueAnimated]);

  return (
    <Card className={`relative overflow-hidden group border-b-4 ${color} perspective-card bg-white/80`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
          <h4 className="text-4xl font-bold text-slate-800 mt-1">{displayValue}</h4>
          {trend && (
            <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8"/></svg>
              {trend}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all duration-500`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
