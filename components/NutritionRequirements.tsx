
import React from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

const NUTRITION_DATA = [
  { group: 'Men', calories: '2,500', protein: '56g', carbs: '300g', fats: '80g', icon: '👨' },
  { group: 'Women', calories: '2,000', protein: '46g', carbs: '250g', fats: '65g', icon: '👩' },
  { group: 'Children', calories: '1,400', protein: '19g', carbs: '130g', fats: '45g', icon: '👦' },
  { group: 'Infants', calories: '800', protein: '11g', carbs: '95g', fats: '30g', icon: '👶' },
];

export const NutritionRequirements: React.FC = () => {
  return (
    <Card className="bg-white/80 border-emerald-500/10 shadow-xl p-8 rounded-[3rem]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Biometric Targets.</h3>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Daily Recommended Intake</p>
        </div>
        <Badge variant="success">STABLE</Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Group</th>
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Energy</th>
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Protein</th>
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Carbs</th>
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Fats</th>
            </tr>
          </thead>
          <tbody>
            {NUTRITION_DATA.map((row) => (
              <tr key={row.group} className="border-b border-slate-50 last:border-0 group hover:bg-emerald-50/30 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{row.icon}</span>
                    <span className="font-bold text-slate-800">{row.group}</span>
                  </div>
                </td>
                <td className="py-4 text-center font-black text-slate-600 text-sm">{row.calories} <span className="text-[9px] text-slate-400">kcal</span></td>
                <td className="py-4 text-center font-black text-emerald-600 text-sm">{row.protein}</td>
                <td className="py-4 text-center font-black text-blue-600 text-sm">{row.carbs}</td>
                <td className="py-4 text-center font-black text-amber-600 text-sm">{row.fats}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-[9px] font-medium text-slate-400 leading-relaxed italic">
        * Estimates based on moderate activity levels. Consult a clinical nutritionist for personalized biometric profiling.
      </p>
    </Card>
  );
};
