
export enum Category {
  PRODUCE = 'Produce',
  DAIRY = 'Dairy',
  PROTEIN = 'Protein',
  PANTRY = 'Pantry',
  BAKERY = 'Bakery',
  BEVERAGES = 'Beverages',
  SPICES = 'Spices & Masalas',
  MEAT = 'Meat & Poultry'
}

export type DietPreference = 'Omnivore' | 'Vegetarian' | 'Vegan' | 'Keto' | 'Paleo' | 'Gluten-Free';

export interface Profile {
  id: string;
  username: string;
  family_adults: number;
  family_kids: number;
  diet_preference: DietPreference;
  allergies: string[];
  goal_calories?: number;
  setup_complete?: boolean;
}

export interface InventoryItem {
  id: string;
  user_id?: string;
  name: string;
  category: Category;
  quantity: number;
  targetQuantity: number;
  unit: string;
  expiryDate: string;
  minThreshold: number;
  image?: string;
}

export interface RecipeStep {
  number: number;
  instruction: string;
  duration?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: RecipeStep[];
  cookingTime: string;
  difficulty: 'Easy' | 'Medium' | 'Expert';
  matchPercentage: number;
  calories: number;
  healthScore: number;
  estimatedPrice?: string;
  nutrition: {
    protein: string;
    carbs: string;
    fats: string;
  };
}

export interface GroceryItem {
  id: string;
  user_id?: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
}

export interface KitchenStats {
  totalItems: number;
  expiringSoon: number;
  lowStock: number;
  inventoryValue: string;
}

export interface Mart {
  name: string;
  address: string;
  contact?: string;
  uri: string;
  distance?: string;
}

export type OccasionType = 'Daily' | 'Weekend' | 'Party' | 'Festive';
export type ViewState = 'dashboard' | 'recipes' | 'inventory' | 'profile' | 'shopping' | 'add-manual' | 'scanner';
