
import React, { useState, memo } from 'react';
import { GroceryItem } from '../types';
import { Card, CardHeader } from './ui/Card';
import { Button } from './ui/Button';

interface GroceryListProps {
  items: GroceryItem[];
  onToggle: (id: string) => void;
  onAdd?: (name: string, qty: number, unit: string) => void;
}

export const GroceryList: React.FC<GroceryListProps> = memo(({ items, onToggle, onAdd }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);

  const handleAdd = () => {
    if (newItemName.trim() && onAdd) {
      onAdd(newItemName, newItemQty, 'units');
      setNewItemName('');
      setNewItemQty(1);
    }
  };

  return (
    <Card className="h-full bg-amber-50/30 border-amber-100 shadow-amber-100/50">
      <CardHeader 
        title="Grocery Manifest" 
        subtitle="Manual and auto-populated logistics"
        icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
      />
      
      {/* Manual Add Input */}
      <div className="mb-6 flex gap-2">
        <div className="flex-1 space-y-1">
          <label htmlFor="grocery-name-input" className="sr-only">Item Name</label>
          <input 
            id="grocery-name-input"
            type="text" 
            placeholder="Add item..." 
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="w-full px-4 py-2 bg-white/80 border border-amber-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        <div className="w-16 space-y-1">
          <label htmlFor="grocery-qty-input" className="sr-only">Qty</label>
          <input 
            id="grocery-qty-input"
            type="number" 
            value={newItemQty}
            onChange={(e) => setNewItemQty(Number(e.target.value))}
            className="w-full px-2 py-2 bg-white/80 border border-amber-200 rounded-xl text-sm font-bold outline-none text-center"
          />
        </div>
        <button 
          onClick={handleAdd}
          aria-label="Add to grocery manifest"
          className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {items.map((item) => (
          <button 
            key={item.id} 
            onClick={() => onToggle(item.id)}
            aria-label={`Toggle ${item.name}`}
            className={`
              w-full flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all text-left
              ${item.checked ? 'bg-white/50 opacity-60' : 'bg-white shadow-sm hover:scale-[1.02]'}
            `}
          >
            <div className="flex items-center gap-4">
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}
              `}>
                {item.checked && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div>
                <p className={`font-bold text-slate-800 ${item.checked ? 'line-through' : ''}`}>
                  {item.name}
                </p>
                <p className="text-xs font-semibold text-slate-400">
                  Required: {item.quantity} {item.unit}
                </p>
              </div>
            </div>
          </button>
        ))}
        
        {items.length === 0 && (
          <div className="text-center py-10 bg-white/40 rounded-3xl border-2 border-dashed border-amber-200">
            <p className="text-amber-600/60 font-medium">Logistics clear. No items pending.</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-amber-200">
        <Button variant="secondary" className="w-full py-4 text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M1 1l4 4-4 4M23 1l-4 4 4 4M1 23l4-4-4-4M23 23l-4-4 4-4"/></svg>
          SYNC WITH INSTACART
        </Button>
      </div>
    </Card>
  );
});
