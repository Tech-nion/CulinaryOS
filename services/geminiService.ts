
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, Recipe, Mart, Profile, Category } from "../types";

/**
 * identifyItemFromImage uses Gemini 3 Flash Vision to identify food items from a camera frame.
 */
export const identifyItemFromImage = async (base64Image: string): Promise<Partial<InventoryItem> | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Act as a computer vision expert for a smart kitchen. 
  Identify the food item or grocery product in this image. 
  Return ONLY a JSON object with: 
  - name (string)
  - category (must be one of: Produce, Dairy, Protein, Pantry, Bakery, Beverages, Spices & Masalas, Meat & Poultry)
  - quantity (number, default to 1)
  - unit (string, e.g., kg, units, bulbs, g)
  - expiryDays (number of days this item usually lasts from fresh)`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            quantity: { type: Type.NUMBER },
            unit: { type: Type.STRING },
            expiryDays: { type: Type.NUMBER }
          },
          required: ["name", "category", "unit"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    if (!data.name) return null;

    return {
      name: data.name,
      category: data.category as Category,
      quantity: data.quantity || 1,
      unit: data.unit || 'units',
      expiryDate: new Date(Date.now() + 86400000 * (data.expiryDays || 7)).toISOString(),
      targetQuantity: (data.quantity || 1) * 2,
      minThreshold: 1
    };
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return null;
  }
};

/**
 * Search global recipes using Gemini 3 Flash with Google Search grounding.
 */
export const searchGlobalRecipes = async (query: string, profile?: Profile | null): Promise<Recipe[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const dietContext = profile ? `Context: User follows a ${profile.diet_preference} diet. Allergies: ${profile.allergies.join(', ')}.` : '';

  const prompt = `Act as a global culinary researcher. Search for the recipe of: "${query}". 
  Include authentic sweets, cakes, lunches, or juices if specified.
  ${dietContext}
  Use Google Search for authentic ingredients and instructions from local experts.
  Return a JSON array of 3 recipe objects.
  Properties: id, title, description, ingredients (array), steps (array of {number, instruction, duration?}), cookingTime, difficulty, matchPercentage (relative to user diet), calories, healthScore, nutrition ({protein, carbs, fats}), estimatedPrice.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Global Search Error:", error);
    return [];
  }
};

/**
 * Get popular dishes by country using Gemini 3 Flash and Google Search.
 */
export const getPopularDishesByCountry = async (country: string, profile?: Profile | null): Promise<Recipe[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Act as an international food critic. Find the top 5 most popular dishes from ${country}. 
  Provide detailed recipes for them in a structured JSON format. 
  Include lunches, desserts, and traditional beverages.
  Return a JSON array of recipe objects.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Country Discovery Error:", error);
    return [];
  }
};

/**
 * getRecipeSuggestions uses Gemini 3 Flash and Google Search to suggest recipes with real-time regional pricing.
 */
export const getRecipeSuggestions = async (inventory: InventoryItem[] | string[], profile?: Profile | null): Promise<Recipe[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let availableIngredients = '';
  if (inventory.length > 0 && typeof inventory[0] === 'string') {
    availableIngredients = (inventory as string[]).join(', ');
  } else {
    availableIngredients = (inventory as InventoryItem[])
      .filter(item => item.quantity > 0)
      .map(item => `${item.name}`)
      .join(', ');
  }
  
  const dietContext = profile ? `Follow a ${profile.diet_preference} diet. EXCLUDE: ${profile.allergies.join(', ')}.` : '';
  
  const prompt = `Act as a Michelin-star chef. 
  Available Ingredients: ${availableIngredients}. 
  Dietary Context: ${dietContext}
  
  Suggest 3 creative recipes. Use Google Search to find current regional pricing estimations for any ingredients that are MISSING from the available list.
  Return ONLY a JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Recipe Error:", error);
    return [];
  }
};

/**
 * getRelatedRecipes finds variations or similar recipes based on a set of ingredients.
 * This function resolves the missing export error in RecipeInstructions.tsx.
 */
export const getRelatedRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const ingredientsStr = ingredients.join(', ');
  
  const prompt = `Act as a creative chef. Suggest 3 recipes that are related to or remixes of a dish containing these ingredients: ${ingredientsStr}.
  Use Google Search to find trendy variations or authentic regional alternatives that match these base ingredients.
  Return ONLY a JSON array of 3 recipe objects.
  Properties: id, title, description, ingredients (array), steps (array of {number, instruction, duration?}), cookingTime, difficulty, matchPercentage, calories, healthScore, nutrition ({protein, carbs, fats}), estimatedPrice.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Related Recipes Error:", error);
    return [];
  }
};

/**
 * chatWithChef provides a conversational interface for kitchen assistance.
 */
export const chatWithChef = async (message: string, inventory: InventoryItem[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const inventoryContext = inventory.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ');
  const systemInstruction = `You are "Chef AI". Access to inventory: ${inventoryContext}. Be helpful and concise.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: { systemInstruction, temperature: 0.7 }
    });
    return response.text || "I'm sorry, I couldn't process that.";
  } catch (error) {
    return "The kitchen AI is recalibrating. Try again.";
  }
};

/**
 * findNearbyMarts uses Gemini 2.5 Flash with Google Maps grounding to find local grocery nodes.
 */
export const findNearbyMarts = async (latitude: number, longitude: number): Promise<Mart[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Find 3 grocery stores or supermarkets near my location.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude, longitude },
          },
        },
      },
    });

    const marts: Mart[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    for (const chunk of chunks) {
      if (chunk.maps) {
        marts.push({
          name: chunk.maps.title || "Nearby Mart",
          address: "Location verified via Google Maps",
          uri: chunk.maps.uri || "https://www.google.com/maps",
        });
      }
    }
    return marts.length > 0 ? marts : [{ name: "Local Store", address: "Nearby", uri: "https://maps.google.com" }];
  } catch (error) {
    return [{ name: "Local Store", address: "Nearby", uri: "https://maps.google.com" }];
  }
};
