
import React, { useEffect, useState, useRef } from 'react';
import { Recipe, InventoryItem, Profile } from '../types';
import { getRecipeSuggestions, identifyItemFromImage, chatWithChef } from '../services/geminiService';
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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'chef', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

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
        const item = await identifyItemFromImage(base64);
        
        if (item && item.name) {
          await fetchRecipes([item.name]);
        } else {
          setVisionError("Optical sensors failed to resolve item.");
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setVisionError("AI Protocol Interrupt.");
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const msg = textOverride || chatInput;
    if (!msg.trim() || isChatLoading) return;

    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    if (!textOverride) setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await chatWithChef(msg, inventory);
      setChatMessages(prev => [...prev, { role: 'chef', text: response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'chef', text: "Connectivity lost. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const requestVariation = (recipeTitle: string) => {
    setIsChatOpen(true);
    const prompt = `Can you suggest 2 creative variations for the "${recipeTitle}" recipe using ingredients I currently have?`;
    handleSendMessage(prompt);
  };

  if (compact) {
    return (
      <Card className="bg-white/5 border-white/5 shadow-none p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl -mr-12 -mt-12 group-hover:bg-emerald-500/10 transition-colors"></div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Culinary Studio</h3>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] tracking-[0.2em]">NEURAL ACTIVE</Badge>
        </div>
        
        <div className="space-y-4 mb-6">
          {isLoading ? (
             <div className="animate-pulse space-y-3">
               <div className="h-20 bg-white/5 rounded-2xl w-full" />
               <div className="h-20 bg-white/5 rounded-2xl w-full" />
             </div>
          ) : recipes.slice(0, 2).map(recipe => (
            <div 
              key={recipe.id} 
              onClick={() => onRecipeSelect?.(recipe)}
              className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.08] transition-all"
            >
              <h4 className="text-sm font-bold text-white mb-1">{recipe.title}</h4>
              <div className="flex justify-between items-center">
                <p className="text-[9px] text-slate-500 font-bold uppercase">{recipe.cookingTime} • {recipe.difficulty}</p>
                <span className="text-[10px] font-black text-emerald-400">{recipe.matchPercentage}%</span>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => {
            const chatBtn = document.getElementById('ai-chat-trigger');
            chatBtn?.click();
          }}
          className="w-full py-4 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-600/30 transition-all flex items-center justify-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
          CONSULT CHEF AI
        </button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700 relative">
      {/* AI Chat Layer */}
      {isChatOpen && (
        <div className="absolute inset-0 z-50 bg-[#f8fafc]/90 backdrop-blur-xl rounded-[3rem] p-8 flex flex-col border border-emerald-500/10 shadow-3xl animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/></svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Culinary Consultation.</h3>
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Neural Link Established</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto mb-6 pr-4 custom-scrollbar space-y-4">
            {chatMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <p className="font-bold text-sm uppercase tracking-widest">Awaiting Input</p>
                <p className="text-xs mt-2">Ask about variations, substitutes, or techniques.</p>
              </div>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${
                  m.role === 'user' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-white border border-slate-100 text-slate-700 shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="flex gap-3">
            <input 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Query the Chef..."
              className="flex-1 bg-slate-100 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
            />
            <Button onClick={() => handleSendMessage()} className="px-8 shadow-emerald-500/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </Button>
          </div>
        </div>
      )}

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
              onClick={() => setIsChatOpen(true)}
              className="text-white/40 hover:text-emerald-400 p-2 transition-colors"
              title="Consult AI"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </button>
            <button 
              onClick={() => { setIsVisionMode(false); fetchRecipes(); }} 
              disabled={isLoading}
              className="text-white/40 hover:text-emerald-400 p-2 transition-colors disabled:opacity-50"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={isLoading ? 'animate-spin' : ''}><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            </button>
          </div>
        </div>

        {visionError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest text-center">{visionError}</p>
          </div>
        )}

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {!isLoading && recipes.map((recipe) => (
            <div 
              key={recipe.id} 
              onClick={() => setSelectedRecipe(recipe)}
              className={`p-6 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden ${
                selectedRecipe?.id === recipe.id 
                ? 'bg-emerald-600/10 border-emerald-500/50 shadow-lg' 
                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
              }`}
            >
              <Badge variant="success" className="mb-3 bg-emerald-500/20 text-emerald-400 border-none text-[9px]">
                {recipe.matchPercentage}% BIOMETRIC MATCH
              </Badge>
              <h4 className="text-xl font-bold text-white mb-1 leading-tight group-hover:text-emerald-400 transition-colors">
                {recipe.title}
              </h4>
              <div className="flex justify-between items-center mt-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase">{recipe.cookingTime} • {recipe.difficulty}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="lg:col-span-8">
        {selectedRecipe ? (
          <Card className="p-10 bg-white/[0.02] border-white/5 min-h-[70vh] flex flex-col animate-in zoom-in-95">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge className="bg-emerald-600 text-white border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                    {selectedRecipe.difficulty}
                  </Badge>
                  <Badge className="bg-amber-500/20 text-amber-500 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                    {selectedRecipe.cookingTime}
                  </Badge>
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h5 className="text-sm font-black text-white uppercase tracking-widest flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                     Ingredients
                   </div>
                   <button 
                     onClick={() => requestVariation(selectedRecipe.title)}
                     className="text-[9px] text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-[0.2em] font-black flex items-center gap-1"
                   >
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4"/></svg>
                     Remix This
                   </button>
                </h5>
                <div className="grid grid-cols-1 gap-2">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold text-slate-300 flex justify-between items-center group">
                      {ing}
                      <button 
                        onClick={() => {
                          setIsChatOpen(true);
                          handleSendMessage(`What can I use as a substitute for ${ing} in this recipe?`);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-[8px] text-slate-500 hover:text-emerald-400 transition-all font-black uppercase"
                      >
                        Substitute?
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                 <h5 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                   <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                   Macros
                </h5>
                <div className="bg-white/5 p-6 rounded-[2rem] space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Energy</span>
                      <span className="text-lg font-black text-white">{selectedRecipe.calories} kcal</span>
                   </div>
                   <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                      <div className="text-center">
                         <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Protein</p>
                         <p className="text-sm font-black text-emerald-400">{selectedRecipe.nutrition.protein}</p>
                      </div>
                      <div className="text-center">
                         <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Carbs</p>
                         <p className="text-sm font-black text-blue-400">{selectedRecipe.nutrition.carbs}</p>
                      </div>
                      <div className="text-center">
                         <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Fats</p>
                         <p className="text-sm font-black text-amber-500">{selectedRecipe.nutrition.fats}</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-12 flex justify-end">
              <Button 
                onClick={() => onRecipeSelect?.(selectedRecipe)}
                className="px-12 py-5 bg-emerald-600 rounded-2xl font-black text-base shadow-2xl"
              >
                EXECUTE COOKING
              </Button>
            </div>
          </Card>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-20 glass-card rounded-[3rem] border-white/5">
            <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Standby Mode.</h3>
            <p className="text-slate-500 font-medium max-w-sm">Initiate a strategy from the neural suggestion engine to begin processing.</p>
          </div>
        )}
      </main>
    </div>
  );
};
