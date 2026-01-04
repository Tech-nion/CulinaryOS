
import React from 'react';
import { InventoryItem } from '../types';
import { Card, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { ICONS } from '../constants';

interface InventoryListProps {
  items: InventoryItem[];
}

export const InventoryList: React.FC<InventoryListProps> = ({ items }) => {
  const getExpiryStatus = (date: string) => {
    const now = new Date();
    const expiry = new Date(date);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { label: 'Expired', variant: 'error' as const };
    if (days <= 2) return { label: `Expires in ${days}d`, variant: 'error' as const };
    if (days <= 5) return { label: `Expires in ${days}d`, variant: 'warning' as const };
    return { label: `Good for ${days}d`, variant: 'success' as const };
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= item.minThreshold * 0.5) return 'bg-rose-500';
    if (item.quantity <= item.minThreshold) return 'bg-amber-500';
    return 'bg-orange-500';
  };

  return (
    <Card className="h-full">
      <CardHeader 
        title="Live Inventory" 
        subtitle="Manage your stock levels in real-time"
        icon={<ICONS.Stock />}
      />
      <div className="space-y-6 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
        {items.map((item) => {
          const expiryStatus = getExpiryStatus(item.expiryDate);
          return (
            <div key={item.id} className="group p-4 rounded-2xl hover:bg-orange-50/5 transition-colors border border-transparent hover:border-orange-500/20">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-base font-bold text-white truncate">{item.name}</h4>
                    <Badge variant={expiryStatus.variant}>{expiryStatus.label}</Badge>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">{item.category}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-400">Stock: {item.quantity}{item.unit}</span>
                  <span className="text-xs font-semibold text-slate-500">Min: {item.minThreshold}{item.unit}</span>
                </div>
                <Progress 
                  value={item.quantity} 
                  max={item.minThreshold * 2} 
                  color={getStockStatus(item)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
