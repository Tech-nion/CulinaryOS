
import { Category, InventoryItem, GroceryItem } from './types';

export const INITIAL_INVENTORY: InventoryItem[] = [
  // Produce
  { id: 'p1', name: 'Tomatoes', category: Category.PRODUCE, quantity: 2, targetQuantity: 5, unit: 'kg', expiryDate: new Date(Date.now() + 86400000 * 4).toISOString(), minThreshold: 1, image: 'https://picsum.photos/seed/tomato/200/200' },
  { id: 'p2', name: 'Onions', category: Category.PRODUCE, quantity: 3, targetQuantity: 10, unit: 'kg', expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(), minThreshold: 2, image: 'https://picsum.photos/seed/onion/200/200' },
  { id: 'p3', name: 'Spinach', category: Category.PRODUCE, quantity: 0, targetQuantity: 2, unit: 'Bunches', expiryDate: new Date(Date.now() + 86400000 * 2).toISOString(), minThreshold: 1, image: 'https://picsum.photos/seed/spinach/200/200' },
  
  // Spices / Masalas
  { id: 's1', name: 'Turmeric Powder', category: Category.SPICES, quantity: 100, targetQuantity: 250, unit: 'g', expiryDate: new Date(Date.now() + 86400000 * 365).toISOString(), minThreshold: 50, image: 'https://picsum.photos/seed/turmeric/200/200' },
  { id: 's2', name: 'Garam Masala', category: Category.SPICES, quantity: 40, targetQuantity: 200, unit: 'g', expiryDate: new Date(Date.now() + 86400000 * 365).toISOString(), minThreshold: 50, image: 'https://picsum.photos/seed/spice/200/200' },
  { id: 's3', name: 'Cumin Seeds', category: Category.SPICES, quantity: 150, targetQuantity: 200, unit: 'g', expiryDate: new Date(Date.now() + 86400000 * 365).toISOString(), minThreshold: 50, image: 'https://picsum.photos/seed/cumin/200/200' },

  // Dairy & Proteins
  { id: 'd1', name: 'Organic Milk', category: Category.DAIRY, quantity: 1, targetQuantity: 4, unit: 'Litre', expiryDate: new Date(Date.now() + 86400000 * 2).toISOString(), minThreshold: 2, image: 'https://picsum.photos/seed/milk/200/200' },
  { id: 'pr1', name: 'Chicken Breast', category: Category.PROTEIN, quantity: 500, targetQuantity: 2000, unit: 'g', expiryDate: new Date(Date.now() + 86400000 * 3).toISOString(), minThreshold: 1000, image: 'https://picsum.photos/seed/chicken/200/200' },
  
  // Pantry
  { id: 'pa1', name: 'Basmati Rice', category: Category.PANTRY, quantity: 2, targetQuantity: 5, unit: 'kg', expiryDate: new Date(Date.now() + 86400000 * 180).toISOString(), minThreshold: 1, image: 'https://picsum.photos/seed/rice/200/200' },
  { id: 'pa2', name: 'Olive Oil', category: Category.PANTRY, quantity: 0.5, targetQuantity: 2, unit: 'Litre', expiryDate: new Date(Date.now() + 86400000 * 200).toISOString(), minThreshold: 0.5, image: 'https://picsum.photos/seed/oil/200/200' },
];

export const INITIAL_GROCERY_LIST: GroceryItem[] = [];
