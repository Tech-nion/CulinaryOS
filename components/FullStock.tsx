
import React, { useState, useMemo } from 'react';
import { InventoryItem, Mart, Category, OccasionType } from '../types';
import { Card, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import { Badge } from './ui/Badge';
import { findNearbyMarts } from '../services/geminiService';

interface FullStockProps {
  inventory: InventoryItem[];
  onUpdateTarget: (id: string, target: number) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const FullStock: React.FC<FullStockProps> = ({ inventory, onUpdateTarget, onUpdateQuantity }) => {
  const [familyAdults, setFamilyAdults] = useState(2);
  const [familyKids, setFamilyKids] = useState(1);
  const [occasion, setOccasion] = useState<OccasionType>('Daily');
  const [marts, setMarts] = useState<Mart[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  // Group inventory by category
  const categorizedInventory = useMemo(() => {
    return inventory.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<Category, InventoryItem[]>);
  }, [inventory]);

  // Occasion multipliers
  const occasionMultiplier = useMemo(() => {
    switch(occasion) {
      case 'Weekend': return 1.2;
      case 'Party': return 2.5;
      case 'Festive': return 1.8;
      default: return 1.0;
    }
  }, [occasion]);

  const orderList = inventory
    .filter(item => (item.targetQuantity * occasionMultiplier) > item.quantity)
    .map(item => ({
      ...item,
      scaledTarget: Math.round(item.targetQuantity * occasionMultiplier),
      orderQty: Math.max(0, Math.round(item.targetQuantity * occasionMultiplier) - item.quantity)
    }));

  const handleFindMarts = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const found = await findNearbyMarts(pos.coords.latitude, pos.coords.longitude);
        setMarts(found);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setMarts([{ name: "Cloud Grocer", address: "Online", uri: "https://example.com" }]);
      }
    );
  };

  const handleSendToMart = (mart: Mart) => {
    const header = `CULINARY OS - ORDER MANIFEST\nOccasion: ${occasion} | Family: ${familyAdults}A, ${familyKids}K\n---------------------------\n`;
    const manifest = orderList.map(i => `[ ] ${i.orderQty}${i.unit} ${i.name} (${i.category})`).join('\n');
    alert(`Connecting to ${mart.name} API...\n\n${header}${manifest}`);
    window.open(mart.uri, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Dynamic Context Header */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-2xl overflow-visible">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 flex-1">
            <h3 className="text-2xl font-black tracking-tight">Kitchen Planning Context</h3>
            <div className="flex flex-wrap gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-slate-300 tracking-widest">Adults</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setFamilyAdults(Math.max(1, familyAdults-1))} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" aria-label="Decrease Adults">-</button>
                  <span className="text-xl font-bold w-4 text-center">{familyAdults}</span>
                  <button onClick={() => setFamilyAdults(familyAdults+1)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" aria-label="Increase Adults">+</button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-slate-300 tracking-widest">Children</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setFamilyKids(Math.max(0, familyKids-1))} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" aria-label="Decrease Children">-</button>
                  <span className="text-xl font-bold w-4 text-center">{familyKids}</span>
                  <button onClick={() => setFamilyKids(familyKids+1)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" aria-label="Increase Children">+</button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-slate-300 tracking-widest">Current Occasion</p>
                <div className="flex gap-2">
                  {(['Daily', 'Weekend', 'Party', 'Festive'] as OccasionType[]).map(type => (
                    <button 
                      key={type}
                      onClick={() => setOccasion(type)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        occasion === type ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-auto bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20 text-center">
            <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1">Scale Multiplier</p>
            <p className="text-4xl font-black text-emerald-500">x{occasionMultiplier.toFixed(1)}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Master Inventory Table */}
        <div className="lg:col-span-8 space-y-8">
          {(Object.entries(categorizedInventory) as [Category, InventoryItem[]][]).map(([category, items]) => (
            <Card key={category} className="p-0 overflow-hidden border-slate-100 shadow-xl">
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h4 className="font-extrabold text-slate-900 flex items-center gap-3">
                  <span className="w-2 h-6 bg-emerald-700 rounded-full"></span>
                  {category}
                </h4>
                <Badge className="bg-white text-slate-700 border border-slate-300">{items.length} items</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-200">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-600 tracking-widest">Item</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-600 tracking-widest text-center">Current</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-600 tracking-widest text-center">Target</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-600 tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => {
                      const scaledTarget = Math.round(item.targetQuantity * occasionMultiplier);
                      const isLow = item.quantity < scaledTarget;
                      return (
                        <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                              </div>
                              <span className="font-bold text-slate-800">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-3">
                              <button onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))} className="w-6 h-6 rounded bg-slate-100 text-slate-500 hover:bg-slate-300" aria-label={`Decrease ${item.name} quantity`}>-</button>
                              <span className="text-sm font-bold w-12 text-center text-slate-900">{item.quantity} {item.unit}</span>
                              <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded bg-slate-100 text-slate-500 hover:bg-slate-300" aria-label={`Increase ${item.name} quantity`}>+</button>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-3">
                              <button onClick={() => onUpdateTarget(item.id, Math.max(0, item.targetQuantity - 1))} className="w-6 h-6 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100" aria-label={`Decrease ${item.name} target`}>-</button>
                              <span className="text-sm font-bold w-12 text-center text-emerald-800">{scaledTarget}</span>
                              <button onClick={() => onUpdateTarget(item.id, item.targetQuantity + 1)} className="w-6 h-6 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100" aria-label={`Increase ${item.name} target`}>+</button>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="w-full flex items-center gap-3">
                              <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-700 ${isLow ? 'bg-amber-600' : 'bg-emerald-600'}`}
                                  style={{ width: `${Math.min(100, (item.quantity / scaledTarget) * 100)}%` }}
                                />
                              </div>
                              {isLow && <div className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></div>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>

        {/* Ordering Panel */}
        <div className="lg:col-span-4 space-y-8 sticky top-28">
          <Card className="bg-emerald-800 text-white shadow-xl shadow-emerald-200 border-none">
            <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              Smart Order Summary
            </h4>
            <p className="text-emerald-100 text-sm mb-6 leading-relaxed font-bold">
              Scaled for your {familyAdults+familyKids} person family during a {occasion} period.
            </p>
            
            <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {orderList.length > 0 ? orderList.map(item => (
                <div key={item.id} className="bg-white/10 p-3 rounded-2xl flex justify-between items-center backdrop-blur-sm border border-white/5">
                  <div>
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-[10px] font-bold text-emerald-100 uppercase">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black">+{item.orderQty} {item.unit}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 opacity-80 italic text-sm font-bold">Everything is perfectly stocked!</div>
              )}
            </div>

            <Button 
              variant="primary" 
              className="w-full bg-white text-emerald-800 hover:bg-emerald-50 font-black py-4 rounded-2xl shadow-lg"
              onClick={handleFindMarts}
              isLoading={isLocating}
            >
              LOCATE NEAREST MARTS
            </Button>
          </Card>

          {marts.length > 0 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
              <h5 className="font-black text-slate-900 text-sm px-2 uppercase tracking-widest">Connect to Partner Marts</h5>
              {marts.map((mart, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSendToMart(mart)}
                  className="w-full text-left bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-900">{mart.name}</p>
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">Instant Delivery Available</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullStock;
