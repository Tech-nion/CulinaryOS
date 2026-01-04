
import React, { useState, useCallback, memo, useEffect } from 'react';
import { Recipe, Profile } from '../types';
import { searchGlobalRecipes, getPopularDishesByCountry, generateRecipeImage } from '../services/geminiService';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface RecipeDiscoveryProps {
  profile?: Profile | null;
  onRecipeSelect: (recipe: Recipe) => void;
}

const COUNTRIES = [
  "Italy", "India", "Japan", "Mexico", "France", "Thailand", "China", "Spain", "Greece", "USA", "Brazil", "Turkey", "Vietnam", "Morocco", "Korea", "Pakistan", "United Kingdom", "Germany"
];

const RecipeDiscovery: React.FC<RecipeDiscoveryProps> = ({ profile, onRecipeSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [recipes, setRecipes] = useState<(Recipe & { aiImage?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageProgress, setImageProgress] = useState<Record<string, boolean>>({});

  const enrichWithImages = async (results: Recipe[]) => {
    setRecipes(results.map(r => ({ ...r })));
    
    // Generate images sequentially to manage rate limits and show progress
    for (const recipe of results) {
      setImageProgress(prev => ({ ...prev, [recipe.id]: true }));
      const imageUrl = await generateRecipeImage(recipe.title);
      if (imageUrl) {
        setRecipes(prev => prev.map(r => r.id === recipe.id ? { ...r, aiImage: imageUrl } : r));
      }
      setImageProgress(prev => ({ ...prev, [recipe.id]: false }));
    }
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setRecipes([]);
    setSelectedCountry('');
    try {
      const results = await searchGlobalRecipes(searchQuery, profile);
      enrichWithImages(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, profile]);

  const handleCountrySelect = useCallback(async (country: string) => {
    setSelectedCountry(country);
    setSearchQuery('');
    setIsLoading(true);
    setRecipes([]);
    try {
      const results = await getPopularDishesByCountry(country, profile);
      enrichWithImages(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 space-y-2 w-full">
          <label htmlFor="global-search" className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Universal Search (Cakes, Sweets, Lunches, Juices...)</label>
          <div className="relative">
            <input 
              id="global-search"
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="E.g. authentic cheesecake, Indian sweets, healthy green juice..."
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-700/30 shadow-xl shadow-slate-200/50 transition-all placeholder:text-slate-400"
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <Button 
              onClick={handleSearch} 
              isLoading={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-3xl py-3 px-8"
              aria-label="Find Global Recipe"
            >
              Discover
            </Button>
          </div>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <label htmlFor="country-select" className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Explore by Country</label>
          <select 
            id="country-select"
            value={selectedCountry}
            onChange={(e) => handleCountrySelect(e.target.value)}
            className="w-full px-6 py-5 bg-white border border-slate-200 rounded-[2rem] font-bold text-slate-900 outline-none appearance-none shadow-xl shadow-slate-200/50 cursor-pointer focus:border-emerald-700/30 transition-all"
          >
            <option value="" disabled>Select Cuisine</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {isLoading ? 'Scanning Culinary Networks...' : (recipes.length > 0 ? `Discovering ${selectedCountry || searchQuery}.` : 'Global Culinary Patterns.')}
          </h3>
          {recipes.length > 0 && <Badge variant="success" className="px-4 py-1.5">{recipes.length} Global Matches</Badge>}
        </div>

        {isLoading && recipes.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-slate-100 rounded-[3rem] animate-pulse"></div>
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <Card 
                key={recipe.id} 
                hoverable 
                onClick={() => onRecipeSelect(recipe)}
                className="group relative overflow-hidden bg-white/90 p-0 border-slate-200 shadow-xl"
              >
                <div className="h-56 bg-slate-900 relative overflow-hidden">
                  {recipe.aiImage ? (
                    <img 
                      src={recipe.aiImage} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800">
                      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Generating Visual...</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/10 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-emerald-600 text-white border-none shadow-lg">
                      {recipe.region || 'Authentic'}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-6 right-6">
                    <h4 className="text-xl font-bold text-white leading-tight drop-shadow-md">{recipe.title}</h4>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-600 font-medium line-clamp-3 leading-relaxed italic">
                    {recipe.originDescription || recipe.description}
                  </p>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prep Time</span>
                      <span className="text-xs font-black text-slate-900">{recipe.cookingTime}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance</span>
                      <span className="text-xs font-black text-emerald-700">{recipe.matchPercentage}%</span>
                    </div>
                  </div>
                  <Button variant="primary" className="w-full py-4 text-sm rounded-2xl group-hover:bg-emerald-800 shadow-emerald-500/10">
                    GET FULL PROTOCOL
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="h-96 glass-card border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-10">
            <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600 mb-8 animate-float">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <h4 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tighter">Global Culinary Node.</h4>
            <p className="text-slate-500 max-w-sm text-sm font-medium leading-relaxed">Type any food craving or explore signature national dishes to see high-quality recipes with AI-generated visuals.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(RecipeDiscovery);
