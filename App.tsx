
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import { StatCard } from './components/StatCard';
import { InventoryList } from './components/InventoryList';
import { RecipeSuggestions } from './components/RecipeSuggestions';
import { GroceryList } from './components/GroceryList';
import QuickActions from './components/QuickActions';
import AIChat from './components/AIChat';
import { VoiceChef } from './components/VoiceChef';
import FullStock from './components/FullStock';
import { Auth } from './components/Auth';
import { ProfileView } from './components/ProfileView';
import { RecipeInstructions } from './components/RecipeInstructions';
import { UserGuide } from './components/UserGuide';
import { ManualAdd } from './components/ManualAdd';
import { Scanner } from './components/Scanner';
import { NutritionRequirements } from './components/NutritionRequirements';
import { Badge } from './components/ui/Badge';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { Toast } from './components/ui/Toast';
import { INITIAL_INVENTORY, INITIAL_GROCERY_LIST } from './mockData';
import { InventoryItem, GroceryItem, KitchenStats, Recipe, Profile, ViewState, Category } from './types';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const [profile, setProfile] = useState<Profile>({
    id: '',
    username: 'Chef',
    family_adults: 2,
    family_kids: 1,
    diet_preference: 'Omnivore',
    allergies: []
  });
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      if (session) fetchKitchenData(session.user.id);
      setIsInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      if (session) fetchKitchenData(session.user.id);
      else {
        setInventory([]);
        setGroceryList([]);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchKitchenData = async (userId: string) => {
    setLoadingData(true);
    try {
      const { data: profData } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (profData) {
        setProfile(profData);
      } else {
        const newProf: Profile = { id: userId, username: 'New Chef', family_adults: 2, family_kids: 0, diet_preference: 'Omnivore', allergies: [] };
        await supabase.from('profiles').insert(newProf);
        setProfile(newProf);
        setShowGuide(true);
      }
      const { data: invData } = await supabase.from('inventory_items').select('*').eq('user_id', userId);
      if (invData) {
        setInventory(invData.map((item: any) => ({
          ...item,
          targetQuantity: item.target_quantity ?? item.targetQuantity,
          expiryDate: item.expiry_date ?? item.expiryDate,
          minThreshold: item.min_threshold ?? item.minThreshold
        })));
      }
      const { data: grocData } = await supabase.from('grocery_items').select('*').eq('user_id', userId);
      if (grocData) setGroceryList(grocData);
    } catch (e) {
      console.error("Sync Error:", e);
    } finally {
      setLoadingData(false);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const expiringSoon = inventory.filter(item => {
      const diff = new Date(item.expiryDate).getTime() - now.getTime();
      return diff > 0 && diff <= (86400000 * 3);
    }).length;

    const lowStock = inventory.filter(item => item.quantity <= item.minThreshold).length;

    return {
      totalItems: inventory.length,
      expiringSoon,
      lowStock,
    };
  }, [inventory]);

  const addGroceryItem = async (name: string, quantity: number, unit: string) => {
    const newItem: GroceryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      quantity,
      unit,
      checked: false
    };
    setGroceryList(prev => [newItem, ...prev]);
    if (!isDemo && session && isOnline) {
      await supabase.from('grocery_items').insert({
        user_id: session.user.id,
        name: newItem.name,
        quantity: newItem.quantity,
        unit: newItem.unit,
        checked: false
      });
    }
    showToast(`${name} added to list.`);
  };

  const addItemToInventory = async (item: Partial<InventoryItem>) => {
    const newItem: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: item.name || 'New Item',
      category: item.category || Category.PRODUCE,
      quantity: item.quantity || 1,
      targetQuantity: item.targetQuantity || (item.quantity ? item.quantity * 2 : 2),
      unit: item.unit || 'units',
      expiryDate: item.expiryDate || new Date(Date.now() + 86400000 * 7).toISOString(),
      minThreshold: item.minThreshold || 1,
      image: item.image || `https://api.dicebear.com/7.x/initials/svg?seed=${item.name}`
    };

    setInventory(prev => [newItem, ...prev]);
    if (!isDemo && session && isOnline) {
      await supabase.from('inventory_items').insert({
        user_id: session.user.id,
        name: newItem.name,
        category: newItem.category,
        quantity: newItem.quantity,
        target_quantity: newItem.targetQuantity,
        unit: newItem.unit,
        expiry_date: newItem.expiryDate,
        min_threshold: newItem.minThreshold
      });
    }
    showToast(`${newItem.name} logged successfully.`);
  };

  const updateInventory = async (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    if (!isDemo && session && isOnline) {
      const dbUpdates: any = { ...updates };
      if (updates.targetQuantity !== undefined) dbUpdates.target_quantity = updates.targetQuantity;
      if (updates.expiryDate !== undefined) dbUpdates.expiry_date = updates.expiryDate;
      if (updates.minThreshold !== undefined) dbUpdates.min_threshold = updates.minThreshold;
      await supabase.from('inventory_items').update(dbUpdates).eq('id', id);
    }
  };

  if (!isInitialized) return null;
  if (!session) return <Auth onDemoLogin={() => setIsDemo(true)} />;

  return (
    <div className="min-h-screen pb-20 selection:bg-emerald-100 bg-[#f8fafc]">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/50 blur-[150px] rounded-full -z-10 animate-float"></div>
      
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="max-w-7xl mx-auto px-6 relative z-10">
        {currentView !== 'profile' && currentView !== 'add-manual' && currentView !== 'scanner' && (
          <div className="mb-12">
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4 uppercase">
              {currentView === 'dashboard' ? 'Overview.' : currentView === 'recipes' ? 'Kitchen.' : 'Inventory.'}
            </h2>
            <p className="text-slate-500 font-medium text-lg italic">Organic logistics for your smart home.</p>
          </div>
        )}

        {currentView !== 'add-manual' && currentView !== 'scanner' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <StatCard label="Live Items" value={stats.totalItems} icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7l-8-4-8 4"/></svg>} color="border-emerald-500" />
            <StatCard label="Expiring Soon" value={stats.expiringSoon} icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>} color="border-rose-400" />
            <StatCard label="Low Supply" value={stats.lowStock} icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v2"/></svg>} color="border-amber-400" />
          </div>
        )}

        {currentView === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InventoryList items={inventory} />
                <GroceryList 
                  items={groceryList} 
                  onToggle={(id) => setGroceryList(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i))} 
                  onAdd={addGroceryItem}
                />
              </div>
              <NutritionRequirements />
            </div>
            <div className="lg:col-span-4 space-y-8">
              <RecipeSuggestions inventory={inventory} profile={profile} onRecipeSelect={setActiveRecipe} compact />
            </div>
          </div>
        )}

        {currentView === 'recipes' && <RecipeSuggestions inventory={inventory} profile={profile} onRecipeSelect={setActiveRecipe} />}
        {currentView === 'inventory' && <FullStock inventory={inventory} onUpdateTarget={(id, t) => updateInventory(id, { targetQuantity: t })} onUpdateQuantity={(id, q) => updateInventory(id, { quantity: q })} />}
        {currentView === 'profile' && <ProfileView profile={profile} onUpdate={(p) => setProfile(p)} />}
        {currentView === 'add-manual' && <ManualAdd onAdd={addItemToInventory} onClose={() => setCurrentView('dashboard')} />}
        {currentView === 'scanner' && <Scanner onAdd={addItemToInventory} onClose={() => setCurrentView('dashboard')} />}
      </main>

      {activeRecipe && <RecipeInstructions recipe={activeRecipe} onClose={() => setActiveRecipe(null)} />}
      <AIChat inventory={inventory} />
      <VoiceChef inventory={inventory} />
      <QuickActions onAdd={() => setCurrentView('add-manual')} onScan={() => setCurrentView('scanner')} />
      <UserGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
      <Toast message={toast.message} isVisible={toast.visible} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />
    </div>
  );
};

export default App;
