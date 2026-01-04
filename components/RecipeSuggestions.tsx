
import React, { useEffect, useState, useRef } from 'react';
import { Recipe, InventoryItem, Profile } from '../types';
import { getRecipeSuggestions, identifyIngredientsFromImage, identifyItemFromImage } from '../services/geminiService';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface RecipeSuggestionsProps {
  inventory: InventoryItem[];
  profile?: Profile | null;
  onRecipeSelect?: (recipe: Recipe) => void;
  compact?: boolean;
}

export const RecipeSuggestions: React.FC<RecipeSuggestionsProps> = ({ inventory, profile, onRecipeSelect, compact }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisionMode, setIsVisionMode] = useState(false);
  const [visionError, setVisionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRecipes = async (ingredientsOverride?: string[]) => {
    setIsLoading(true);
    setVisionError(null);
    const data = await getRecipeSuggestions(ingredientsOverride || inventory, profile);
    setRecipes(data);
    if (data.length > 0) {
      setSelectedRecipe(data[0]);
    }
    setIsLoading(false);
    setIsVisionMode(!!ingredientsOverride);
  };

  useEffect(() => {
    fetchRecipes();
  }, [profile?.diet_preference, profile?.allergies]);

  const handleVisionSearch = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setVisionError(null);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        // Using identifyItemFromImage as requested, but also a helper for multi-ingredient if possible
        // Actually, identifiedItemFromImage returns Partial<InventoryItem> which has .name
        const item = await identifyItemFromImage(base64);
        
        if (item && item.name) {
          // Find recipes for this specific identified item
          await fetchRecipes([item.name]);
        } else {
          setVisionError("AI could not identify specific ingredients in this image.");
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setVisionError("Error processing image protocol.");
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <Card className="bg-white/5 border-white/5 shadow-none p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Quick Suggestions</h3>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase text-[9px] tracking-widest">AI ACTIVE</Badge>
        </div>
        <div className="space-y-4">
          {isLoading ? (
             <div className="animate-pulse bg-white/5 rounded-2xl h-24 w-full" />
          ) : recipes.slice(0, 2).map(recipe => (
            <div 
              key={recipe.id} 
              onClick={() => onRecipeSelect?.(recipe)}
              className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.08] transition-all group"
            >
              <h4 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{recipe.title}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase">{recipe.cookingTime} • {recipe.difficulty}</p>
              {recipe.estimatedPrice && (
                <p className="text-[9px] text-amber-400 font-black mt-2">EST: {recipe.estimatedPrice}</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
      <aside className="lg:col-span-4 space-y-6">
        <div className="flex items-center justify-between px-2">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">AI Studio.</h3>
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">
              {isVisionMode ? 'Vision Results' : 'Inventory Insights'}
            </p>
          </div>
          <div className="flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={onFileChange} 
              accept="image/*" 
              className="hidden" 
              capture="environment"
            />
            <button 
              onClick={handleVisionSearch}
              className="text-white/40 hover:text-amber-400 p-2 transition-colors"
              title="Search by Photo"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </button>
            <button 
              onClick={() => { setIsVisionMode(false); fetchRecipes(); }} 
              disabled={isLoading}
              className="text-white/40 hover:text-emerald-400 p-2 transition-colors disabled:opacity-50"
              title="Refresh Registry Suggestions"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={isLoading ? 'animate-spin' : ''}><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            </button>
          </div>
        </div>

        {visionError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-in slide-in-from-top-2">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest text-center">{visionError}</p>
          </div>
        )}

        {isVisionMode && (
          <div className="px-2">
            <button 
              onClick={() => { setIsVisionMode(false); fetchRecipes(); }}
              className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Inventory Suggestions
            </button>
          </div>
        )}

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {isLoading && Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-white/5 border border-white/5 rounded-[2rem] h-32 w-full" />
          ))}
          
          {!isLoading && recipes.map((recipe) => (
            <div 
              key={recipe.id} 
              onClick={() => setSelectedRecipe(recipe)}
              className={`p-6 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden ${
                selectedRecipe?.id === recipe.id 
                ? 'bg-emerald-600/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5' 
                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
              }`}
            >
              <Badge variant="success" className="mb-3 bg-emerald-500/20 text-emerald-400 border-none text-[9px]">
                {recipe.matchPercentage}% MATCH
              </Badge>
              <h4 className="text-xl font-bold text-white mb-1 leading-tight group-hover:text-emerald-400 transition-colors">
                {recipe.title}
              </h4>
              <div className="flex justify-between items-center mt-3">
                <div className="flex gap-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{recipe.cookingTime}</span>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">|</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{recipe.difficulty}</span>
                </div>
                {recipe.estimatedPrice && <span className="text-[10px] font-black text-amber-500">EST: {recipe.estimatedPrice}</span>}
              </div>
            </div>
          ))}
          
          {!isLoading && recipes.length === 0 && (
            <div className="text-center py-20 opacity-30">
              <p className="font-bold text-white uppercase tracking-widest text-sm">No Strategy Found</p>
            </div>
          )}
        </div>
      </aside>

      <main className="lg:col-span-8">
        {selectedRecipe ? (
          <Card className="p-10 bg-white/[0.02] border-white/5 min-h-[70vh] flex flex-col animate-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge className="bg-emerald-600 text-white border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                    {selectedRecipe.difficulty}
                  </Badge>
                  <Badge className="bg-amber-500/20 text-amber-500 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                    {selectedRecipe.cookingTime}
                  </Badge>
                  {selectedRecipe.estimatedPrice && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                      Estimated Cost: {selectedRecipe.estimatedPrice}
                    </Badge>
                  )}
                </div>
                <h2 className="text-6xl font-black text-white tracking-tighter leading-[1.05] font-serif-italic">
                  {selectedRecipe.title}
                </h2>
                <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                  {selectedRecipe.description}
                </p>
              </div>
              <div className="bg-emerald-600/10 border border-emerald-500/20 p-6 rounded-[2.5rem] text-center min-w-[140px]">
                 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Health Score</p>
                 <p className="text-5xl font-black text-white">{selectedRecipe.healthScore}</p>
                 <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${selectedRecipe.healthScore}%` }}></div>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18"/><path d="M3 18h18"/><path d="M11 6h2"/><path d="M12 2v4"/></svg>
                  </div>
                  <h5 className="text-sm font-black text-white uppercase tracking-widest">Ingredient Payload</h5>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-colors">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                      <span className="text-sm font-bold text-slate-300">{ing}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
                  </div>
                  <h5 className="text-sm font-black text-white uppercase tracking-widest">Biometric Impact</h5>
                </div>
                <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Energy</p>
                      <p className="text-3xl font-black text-white">{selectedRecipe.calories} <span className="text-xs text-slate-500">KCAL</span></p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Protein</p>
                      <p className="text-sm font-black text-emerald-400">{selectedRecipe.nutrition.protein}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Carbs</p>
                      <p className="text-sm font-black text-blue-400">{selectedRecipe.nutrition.carbs}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Fats</p>
                      <p className="text-sm font-black text-amber-500">{selectedRecipe.nutrition.fats}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-white/5 flex justify-end">
              <Button 
                onClick={() => onRecipeSelect?.(selectedRecipe)}
                className="px-12 py-5 bg-emerald-600 rounded-2xl font-black text-base shadow-2xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                EXECUTE COOKING PROTOCOL
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-20 glass-card rounded-[3rem] border-white/5">
            <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Standby Mode.</h3>
            <p className="text-slate-500 font-medium max-w-sm">Select a recipe strategy from the AI suggestions to view full biometric impact and ingredient requirements.</p>
          </div>
        )}
      </main>
    </div>
  );
};
