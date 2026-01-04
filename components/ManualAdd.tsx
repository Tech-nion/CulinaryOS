
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Category, InventoryItem } from '../types';

interface ManualAddProps {
  onAdd: (item: Partial<InventoryItem>) => void;
  onClose: () => void;
}

const COMMON_ITEMS: Record<Category, { name: string; unit: string }[]> = {
  [Category.PRODUCE]: [
    { name: 'Potatoes', unit: 'kg' },
    { name: 'Carrots', unit: 'kg' },
    { name: 'Bell Peppers', unit: 'units' },
    { name: 'Lemons', unit: 'units' },
    { name: 'Garlic', unit: 'bulbs' },
    { name: 'Ginger', unit: 'g' },
  ],
  [Category.DAIRY]: [
    { name: 'Eggs', unit: 'dozen' },
    { name: 'Butter', unit: 'g' },
    { name: 'Yogurt', unit: 'g' },
    { name: 'Cheese', unit: 'g' },
  ],
  [Category.PROTEIN]: [
    { name: 'Tofu', unit: 'g' },
    { name: 'Lentils', unit: 'kg' },
    { name: 'Chickpeas', unit: 'kg' },
  ],
  [Category.PANTRY]: [
    { name: 'Flour', unit: 'kg' },
    { name: 'Sugar', unit: 'kg' },
    { name: 'Salt', unit: 'g' },
    { name: 'Pasta', unit: 'g' },
  ],
  [Category.BAKERY]: [
    { name: 'Bread', unit: 'loaf' },
    { name: 'Bagels', unit: 'pack' },
  ],
  [Category.BEVERAGES]: [
    { name: 'Coffee Beans', unit: 'g' },
    { name: 'Tea Bags', unit: 'pack' },
  ],
  [Category.SPICES]: [
    { name: 'Black Pepper', unit: 'g' },
    { name: 'Chili Powder', unit: 'g' },
  ],
  [Category.MEAT]: [
    { name: 'Ground Beef', unit: 'g' },
    { name: 'Chicken Thighs', unit: 'g' },
    { name: 'Salmon Fillet', unit: 'g' },
  ]
};

export const ManualAdd: React.FC<ManualAddProps> = ({ onAdd, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.PRODUCE);
  const [customName, setCustomName] = useState('');
  const [qty, setQty] = useState(1);

  const handleQuickAdd = (item: { name: string; unit: string }) => {
    onAdd({
      name: item.name,
      category: activeCategory,
      quantity: qty,
      unit: item.unit,
      targetQuantity: qty * 2,
      expiryDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      minThreshold: 1
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Stock Hub.</h2>
          <p className="text-slate-700 font-bold italic">Manually log your inventory arrivals.</p>
        </div>
        <Button variant="outline" onClick={onClose}>Back to Deck</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Menu */}
        <div className="lg:col-span-3 space-y-2">
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-4 ml-2">Manifest Categories</p>
          {Object.values(Category).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full text-left px-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-between group ${
                activeCategory === cat 
                ? 'bg-emerald-700 text-white shadow-xl shadow-emerald-500/20' 
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              {cat}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform ${activeCategory === cat ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          ))}
        </div>

        {/* Item Selection */}
        <div className="lg:col-span-9 space-y-8">
          <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-[2.5rem]">
            <div className="flex flex-col md:flex-row gap-6 items-end mb-10">
              <div className="flex-1 space-y-2 w-full">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1" htmlFor="custom-entry">Custom Entry</label>
                <input 
                  id="custom-entry"
                  type="text"
                  placeholder="Scan or type item name..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-700/30 transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="w-full md:w-32 space-y-2">
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1" htmlFor="qty-entry">Initial Qty</label>
                <input 
                  id="qty-entry"
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-700/30 transition-all"
                />
              </div>
              <Button 
                disabled={!customName}
                onClick={() => {
                  handleQuickAdd({ name: customName, unit: 'units' });
                  setCustomName('');
                }}
                className="w-full md:w-auto py-4 px-10 shadow-emerald-500/20"
              >
                Log Entry
              </Button>
            </div>

            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-6 ml-1">Rapid Deployment Menu</p>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {COMMON_ITEMS[activeCategory]?.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleQuickAdd(item)}
                  className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-700/40 hover:bg-emerald-50/30 transition-all group text-left shadow-sm"
                >
                  <p className="font-bold text-slate-900 group-hover:text-emerald-800">{item.name}</p>
                  <p className="text-[9px] font-bold text-slate-600 uppercase mt-1">{item.unit}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
