
import React, { useState, useEffect } from 'react';
import { Profile, DietPreference } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { supabase } from '../lib/supabase';
import { Badge } from './ui/Badge';

interface ProfileViewProps {
  profile: Profile;
  onUpdate: (profile: Profile) => void;
}

const DIET_OPTIONS: DietPreference[] = ['Omnivore', 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Gluten-Free'];
const ALLERGY_OPTIONS = ['Peanuts', 'Dairy', 'Shellfish', 'Soy', 'Tree Nuts', 'Egg', 'Gluten', 'Seafood'];

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdate }) => {
  const [draft, setDraft] = useState<Profile>({ ...profile });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Sync draft if profile changes from parent (e.g. on initial load)
  useEffect(() => {
    setDraft({ ...profile });
  }, [profile.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const updateDraft = (updates: Partial<Profile>) => {
    const newDraft = { ...draft, ...updates };
    setDraft(newDraft);
    // Deep check for changes
    const changed = JSON.stringify(newDraft) !== JSON.stringify(profile);
    setHasChanges(changed);
  };

  const commitChanges = async () => {
    setSaving(true);
    try {
      await onUpdate(draft);
      setHasChanges(false);
      setLastSaved(new Date().toLocaleTimeString());
      // Visual feedback delay
      setTimeout(() => setSaving(false), 800);
    } catch (error) {
      console.error("Failed to sync profile:", error);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 px-3 py-1">IDENTITY MODULE ACTIVE</Badge>
          <h2 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">Settings.</h2>
          <p className="text-slate-700 font-bold max-w-md">Configure your kitchen's neural parameters. These settings dictate recipe matching and automated logistics.</p>
        </div>
        <div className="flex items-center gap-4">
          {lastSaved && !hasChanges && (
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest animate-pulse">
              Last Sync: {lastSaved}
            </span>
          )}
          <Button variant="outline" onClick={handleLogout} className="border-slate-300 text-slate-700 hover:text-rose-600 hover:border-rose-600/50 px-8 py-4 rounded-2xl font-black">
            DEACTIVATE NODE
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Profile Card */}
        <Card className="lg:col-span-1 p-8 space-y-8 bg-white/[0.02] border-white/5 shadow-2xl h-fit sticky top-28">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-[2rem] bg-gradient-to-br from-emerald-600 to-emerald-800 p-1 mb-6 shadow-2xl shadow-emerald-500/20">
               <div className="w-full h-full rounded-[1.8rem] bg-slate-900 overflow-hidden border-2 border-white/10">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${draft.username}`} alt="Profile" />
               </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">{draft.username}</h3>
            <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Master Chef</p>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/5">
            <div className="flex justify-between items-center">
               <span className="text-xs font-bold text-slate-600 uppercase">Status</span>
               <span className="text-xs font-black text-emerald-600">ENCRYPTED</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-xs font-bold text-slate-600 uppercase">Hub ID</span>
               <span className="text-[10px] font-mono text-slate-700">{draft.id.slice(0, 12)}...</span>
            </div>
          </div>

          {hasChanges && (
            <div className="pt-6 animate-in zoom-in duration-300">
              <Button 
                onClick={commitChanges} 
                isLoading={saving}
                className="w-full py-5 bg-emerald-700 rounded-2xl font-black shadow-xl shadow-emerald-600/20 hover:scale-105 transition-transform"
              >
                SYNC CONFIGURATION
              </Button>
              <p className="text-[9px] text-center text-amber-700 font-black uppercase tracking-[0.2em] mt-3">Unsaved changes detected</p>
            </div>
          )}
        </Card>

        {/* Configuration Sections */}
        <div className="lg:col-span-2 space-y-8">
          {/* Family Scaling */}
          <Card className="p-10 bg-white/10 border-slate-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-700 border border-blue-500/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Family Scaling</h4>
                <p className="text-xs font-bold text-slate-600">Inventory targets will adjust based on head count.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex justify-between items-center bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                <div>
                  <p className="font-bold text-slate-900">Adults</p>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Full Portions</p>
                </div>
                <div className="flex items-center gap-5">
                  <button onClick={() => updateDraft({family_adults: Math.max(1, draft.family_adults - 1)})} className="w-10 h-10 bg-slate-100 rounded-xl text-slate-700 font-black hover:bg-emerald-700 hover:text-white transition-colors" aria-label="Decrease Adults">-</button>
                  <span className="w-4 text-center font-black text-xl text-slate-900">{draft.family_adults}</span>
                  <button onClick={() => updateDraft({family_adults: draft.family_adults + 1})} className="w-10 h-10 bg-slate-100 rounded-xl text-slate-700 font-black hover:bg-emerald-700 hover:text-white transition-colors" aria-label="Increase Adults">+</button>
                </div>
              </div>
              <div className="flex justify-between items-center bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                <div>
                  <p className="font-bold text-slate-900">Children</p>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Eco Portions</p>
                </div>
                <div className="flex items-center gap-5">
                  <button onClick={() => updateDraft({family_kids: Math.max(0, draft.family_kids - 1)})} className="w-10 h-10 bg-slate-100 rounded-xl text-slate-700 font-black hover:bg-emerald-700 hover:text-white transition-colors" aria-label="Decrease Kids">-</button>
                  <span className="w-4 text-center font-black text-xl text-slate-900">{draft.family_kids}</span>
                  <button onClick={() => updateDraft({family_kids: draft.family_kids + 1})} className="w-10 h-10 bg-slate-100 rounded-xl text-slate-700 font-black hover:bg-emerald-700 hover:text-white transition-colors" aria-label="Increase Kids">+</button>
                </div>
              </div>
            </div>
          </Card>

          {/* Diet Preferences */}
          <Card className="p-10 bg-white/10 border-slate-200">
             <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-700 border border-emerald-500/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M2 12h20M5.45 5.45l13.1 13.1M18.55 5.45L5.45 18.55"/></svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Dietary Protocol</h4>
                <p className="text-xs font-bold text-slate-600">Gemini AI will filter Studio results based on this selection.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DIET_OPTIONS.map(diet => (
                <button 
                  key={diet}
                  onClick={() => updateDraft({ diet_preference: diet })}
                  className={`p-4 rounded-2xl text-xs font-bold transition-all border-2 ${
                    draft.diet_preference === diet 
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xl shadow-emerald-700/20' 
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-700/30'
                  }`}
                >
                  {diet}
                </button>
              ))}
            </div>
          </Card>

          {/* Allergies / Sensitivities */}
          <Card className="p-10 bg-white/10 border-slate-200">
             <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-700 border border-rose-500/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Restricted Ingredients</h4>
                <p className="text-xs font-bold text-slate-600">Strict exclusions for your health and safety.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {ALLERGY_OPTIONS.map(allergy => {
                const isActive = draft.allergies.includes(allergy);
                return (
                  <button 
                    key={allergy}
                    onClick={() => {
                      const newAllergies = isActive 
                        ? draft.allergies.filter(a => a !== allergy)
                        : [...draft.allergies, allergy];
                      updateDraft({ allergies: newAllergies });
                    }}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      isActive 
                      ? 'bg-rose-700 text-white border-rose-700 shadow-xl shadow-rose-700/20' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-rose-700/30'
                    }`}
                  >
                    {allergy}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Floating Save Action */}
      {hasChanges && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
          <Button 
            onClick={commitChanges} 
            isLoading={saving}
            className="px-12 py-5 bg-emerald-700 rounded-3xl font-black text-white shadow-[0_20px_50px_rgba(5,150,105,0.4)] ring-4 ring-white/10 hover:scale-110 active:scale-95 transition-all flex items-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            SYNC CHANGES
          </Button>
        </div>
      )}
    </div>
  );
};
