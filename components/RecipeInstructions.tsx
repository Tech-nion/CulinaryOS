
import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { getRelatedRecipes } from '../services/geminiService';

interface RecipeInstructionsProps {
  recipe: Recipe;
  onClose: () => void;
}

export const RecipeInstructions: React.FC<RecipeInstructionsProps> = ({ recipe, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [relatedRecipes, setRelatedRecipes] = useState<Recipe[]>([]);
  const [selectedRelated, setSelectedRelated] = useState<Recipe | null>(null);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  useEffect(() => {
    const fetchRelated = async () => {
      setIsLoadingRelated(true);
      const suggestions = await getRelatedRecipes(recipe.ingredients);
      setRelatedRecipes(suggestions);
      if (suggestions.length > 0) setSelectedRelated(suggestions[0]);
      setIsLoadingRelated(false);
    };
    fetchRelated();
  }, [recipe.id]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300 overflow-hidden">
      <Card className="w-full max-w-7xl h-[90vh] flex flex-col md:flex-row p-0 overflow-hidden border-white shadow-2xl rounded-[3rem] bg-white/95">
        
        {/* Left: Info Sidebar */}
        <div className="hidden lg:flex w-80 bg-slate-50 border-r border-slate-200 p-8 flex-col flex-shrink-0">
          <button onClick={onClose} className="mb-8 text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Registry Exit
          </button>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-6 leading-tight font-serif-italic">{recipe.title}</h2>
          
          <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Macro Analysis</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-sm">
                  <p className="text-base font-bold text-slate-800">{recipe.calories}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Kcal</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-sm">
                  <p className="text-base font-bold text-emerald-600">{recipe.nutrition.protein}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Protein</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Resource Payload</p>
              <div className="space-y-2">
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-white/50 p-2.5 rounded-xl border border-slate-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    {ing}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Health Index</span>
              <span className="text-xs font-bold text-emerald-600">{recipe.healthScore}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500" style={{width: `${recipe.healthScore}%`}}></div>
            </div>
          </div>
        </div>

        {/* Center: Main Instruction Flow */}
        <div className="flex-1 p-12 bg-white flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-xl">
                {currentStep + 1}
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Phase</p>
                <p className="text-base font-bold text-slate-900">Step {currentStep + 1} of {recipe.steps.length}</p>
              </div>
            </div>
            <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-emerald-500 transition-all duration-700 ease-out"
                style={{ width: `${((currentStep + 1) / recipe.steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-slate-900 leading-tight mb-10 drop-shadow-sm font-serif-italic">
              {recipe.steps[currentStep].instruction}
            </h3>
            {recipe.steps[currentStep].duration && (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-50 text-amber-600 mx-auto font-bold text-sm border border-amber-100 shadow-sm animate-float">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                {recipe.steps[currentStep].duration}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-auto gap-4">
            <Button 
              variant="outline" 
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="rounded-xl px-8 py-3"
            >
              Previous
            </Button>
            {currentStep === recipe.steps.length - 1 ? (
              <Button 
                variant="primary" 
                onClick={onClose}
                className="rounded-xl px-10 py-3 bg-emerald-600 shadow-lg shadow-emerald-200"
              >
                Complete Mission
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="rounded-xl px-10 py-3 shadow-lg shadow-emerald-200"
              >
                Next Phase
              </Button>
            )}
          </div>
        </div>

        {/* Right Sidebar: AI Suggestions & Ingredient Mapping */}
        <div className="hidden xl:flex w-96 bg-slate-50 border-l border-slate-200 p-8 flex-col flex-shrink-0 animate-in slide-in-from-right-8 duration-500">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
              AI Suggestions
            </h4>
            <Badge variant="warning" className="text-[8px] animate-pulse">Neural Active</Badge>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {/* Related Recipe List */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Remix Variations</p>
              {isLoadingRelated ? (
                <div className="space-y-3">
                  <div className="h-20 bg-slate-200/50 rounded-2xl animate-pulse" />
                  <div className="h-20 bg-slate-200/50 rounded-2xl animate-pulse" />
                </div>
              ) : (
                relatedRecipes.map((rel) => (
                  <div 
                    key={rel.id} 
                    onClick={() => setSelectedRelated(rel)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                      selectedRelated?.id === rel.id 
                      ? 'bg-amber-500/10 border-amber-500/30 ring-2 ring-amber-500/5' 
                      : 'bg-white border-slate-100 hover:border-amber-200'
                    }`}
                  >
                    <h5 className={`text-sm font-bold mb-1 transition-colors ${selectedRelated?.id === rel.id ? 'text-amber-700' : 'text-slate-800 group-hover:text-amber-600'}`}>
                      {rel.title}
                    </h5>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{rel.cookingTime} • {rel.difficulty}</span>
                      <Badge variant="success" className="text-[8px] py-0">{rel.matchPercentage}% MATCH</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Selected Ingredient Analysis */}
            {selectedRelated && (
              <div className="space-y-4 pt-6 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-4">
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Remix Payload (Ingredients)</p>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">
                    This remix utilizes the base profile but requires:
                  </p>
                  <div className="space-y-2">
                    {selectedRelated.ingredients.map((ing, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">{ing}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="text-emerald-500"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                    ))}
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="w-full text-[10px] tracking-widest font-black uppercase rounded-xl py-4 bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
                  onClick={() => alert(`Switching to ${selectedRelated.title} protocol...`)}
                >
                  Adopt This Strategy
                </Button>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-slate-900 rounded-2xl">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Neural Optimization</p>
            <p className="text-[10px] font-bold text-emerald-400 text-center italic">"Waste minimized by 42% via cross-recipe ingredient mapping."</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
