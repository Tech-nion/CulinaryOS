
import React, { useState, useCallback, memo } from 'react';
import { Recipe, Profile } from '../types';
import { searchGlobalRecipes, getPopularDishesByCountry } from '../services/geminiService';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface RecipeDiscoveryProps {
  profile?: Profile | null;
  onRecipeSelect: (recipe: Recipe) => void;
}

const COUNTRIES = [
  "Italy", "India", "Japan", "Mexico", "France", "Thailand", "China", "Spain", "Greece", "USA", "Brazil", "Turkey"
];

const RecipeDiscovery: React.FC<RecipeDiscoveryProps> = ({ profile, onRecipeSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setSelectedCountry('');
    try {
      const results = await searchGlobalRecipes(searchQuery, profile);
      setRecipes(results);
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
    try {
      const results = await getPopularDishesByCountry(country, profile);
      setRecipes(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
      {/* Search & Filter Section */}
      <div className="flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 space-y-2 w-full">
          <label htmlFor="global-search" className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Global Recipe Search</label>
          <div className="relative">
            <input 
              id="global-search"
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for cakes, desserts, lunches, juices..."
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-700/30 shadow-xl shadow-slate-200/50 transition-all placeholder:text-slate-400"
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <Button 
              onClick={handleSearch} 
              isLoading={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-3xl py-3 px-8"
              aria-label="Submit Global Search"
            >
              Search
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

      {/* Results Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {isLoading ? 'Scanning Culinary Networks...' : (recipes.length > 0 ? 'International Selections.' : 'Trending Globally.')}
          </h3>
          {recipes.length > 0 && (
            <Badge variant="success" className="px-4 py-1.5">{recipes.length} Global Matches</Badge>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-slate-100 rounded-[3rem] animate-pulse"></div>
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <Card 
                key={recipe.id} 
                hoverable 
                onClick={() => onRecipeSelect(recipe)}
                className="group relative overflow-hidden bg-white/80 p-0 border-slate-200/50"
              >
                <div className="h-48 bg-slate-900 relative overflow-hidden">
                  <img 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${recipe.title}&backgroundColor=10b981`} 
                    alt="" 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
                  <div className="absolute bottom-4 left-6 right-6">
                    <Badge className="bg-white/20 text-white backdrop-blur-md border-none text-[8px] mb-2">
                      {recipe.matchPercentage}% DIET COMPLIANT
                    </Badge>
                    <h4 className="text-xl font-bold text-white leading-tight">{recipe.title}</h4>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-600 font-medium line-clamp-2 italic">"{recipe.description}"</p>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</span>
                      <span className="text-xs font-black text-slate-900">{recipe.cookingTime}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Energy</span>
                      <span className="text-xs font-black text-emerald-700">{recipe.calories} kcal</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full py-3 text-xs rounded-xl group-hover:bg-emerald-700 group-hover:text-white group-hover:border-emerald-700">
                    EXECUTE RECIPE
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="h-96 glass-card border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-10">
            <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m16 16-4-4-4 4"/></svg>
            </div>
            <h4 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Global Index Ready.</h4>
            <p className="text-slate-500 max-w-sm text-sm font-medium">Search for specific delicacies or select a cuisine protocol to begin culinary exploration.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(RecipeDiscovery);
