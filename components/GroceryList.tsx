
import React from 'react';
import { GroceryItem } from '../types';
import { Card, CardHeader } from './ui/Card';
import { Button } from './ui/Button';

interface GroceryListProps {
  items: GroceryItem[];
  onToggle: (id: string) => void;
}

export const GroceryList: React.FC<GroceryListProps> = ({ items, onToggle }) => {
  return (
    <Card className="h-full bg-amber-50/30 border-amber-100 shadow-amber-100/50">
      <CardHeader 
        title="Grocery List" 
        subtitle="Auto-populated from low stock items"
        icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
      />
      
      <div className="space-y-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onToggle(item.id)}
            className={`
              flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all
              ${item.checked ? 'bg-white/50 opacity-60' : 'bg-white shadow-sm hover:scale-[1.02]'}
            `}
          >
            <div className="flex items-center gap-4">
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}
              `}>
                {item.checked && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div>
                <p className={`font-bold text-slate-800 ${item.checked ? 'line-through' : ''}`}>
                  {item.name}
                </p>
                <p className="text-xs font-semibold text-slate-400">
                  Needed: {item.quantity} {item.unit}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-center py-10 bg-white/40 rounded-3xl border-2 border-dashed border-amber-200">
            <p className="text-amber-600/60 font-medium">All items stocked up!</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-amber-200">
        <Button variant="secondary" className="w-full py-4 text-base rounded-2xl shadow-xl">
          Order for Delivery
        </Button>
      </div>
    </Card>
  );
};
