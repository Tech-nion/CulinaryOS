
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, Recipe, Mart, Profile, Category } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * generateRecipeImage uses gemini-2.5-flash-image to create a photorealistic food image.
 */
export const generateRecipeImage = async (dishName: string): Promise<string | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{
        parts: [{ text: `A photorealistic, professional food photography shot of ${dishName}. High-end culinary magazine style, top-down or 45-degree angle, soft natural lighting, beautiful plating on a ceramic dish, blurred kitchen background.` }]
      }],
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};

/**
 * Search global recipes using Gemini 3 Flash with Google Search grounding.
 */
export const searchGlobalRecipes = async (query: string, profile?: Profile | null): Promise<Recipe[]> => {
  const ai = getAI();
  const dietContext = profile ? `Context: User follows a ${profile.diet_preference} diet. Allergies: ${profile.allergies.join(', ')}.` : '';

  const prompt = `Act as an expert global culinary researcher. Search for the specific recipe of: "${query}". 
  Crucial: Provide authentic recipes for sweets, cakes, lunches, juices, or any dish requested. 
  Ensure you look for traditional and modern versions globally using Google Search.
  ${dietContext}
  Return a JSON array of 3 recipe objects.
  Properties: id, title, description, region, originDescription, ingredients (array), steps (array of {number, instruction, duration?}), cookingTime, difficulty, matchPercentage, calories, healthScore, nutrition ({protein, carbs, fats}).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      }
    });
    
    const recipes: Recipe[] = JSON.parse(response.text || '[]');
    return recipes;
  } catch (error) {
    console.error("Global Search Error:", error);
    return [];
  }
};

/**
 * Get popular dishes by country using Gemini 3 Flash and Google Search.
 */
export const getPopularDishesByCountry = async (country: string, profile?: Profile | null): Promise<Recipe[]> => {
  const ai = getAI();
  const prompt = `Find the top 5 most famous dishes (including main courses, desserts/sweets, and drinks/juices) from ${country}. 
  Provide authentic preparation steps using Google Search.
  Return a JSON array of recipe objects. Include 'region' as '${country}'.`;

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
 * identifyItemFromImage uses Gemini 3 Flash Vision to identify food items from a camera frame.
 */
export const identifyItemFromImage = async (base64Image: string): Promise<Partial<InventoryItem> | null> => {
  const ai = getAI();
  const prompt = `Identify the food item or grocery product in this image. Return JSON with: name, category, quantity, unit, expiryDays.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: base64Image } }]
      }],
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

export const chatWithChef = async (message: string, inventory: InventoryItem[]): Promise<string> => {
  const ai = getAI();
  const inventoryContext = inventory.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ');
  const systemInstruction = `You are "Chef AI". Access to inventory: ${inventoryContext}. Use Google Search for real-time recipe info.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: { 
        systemInstruction, 
        tools: [{ googleSearch: {} }] 
      }
    });
    return response.text || "Connection lost to the culinary brain.";
  } catch (error) {
    return "Chef AI is offline.";
  }
};

export const getRecipeSuggestions = async (inventory: InventoryItem[] | string[], profile?: Profile | null): Promise<Recipe[]> => {
  const ai = getAI();
  const prompt = `Suggest 3 recipes based on available stock. Return JSON array.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
};

export const getRelatedRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
  const ai = getAI();
  const prompt = `Remix recipes for: ${ingredients.join(', ')}. Return JSON array.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
};

export const findNearbyMarts = async (latitude: number, longitude: number): Promise<Mart[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Grocery stores near me.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: { retrievalConfig: { latLng: { latitude, longitude } } },
      },
    });
    return (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
      .filter(c => c.maps)
      .map(c => ({ name: c.maps.title || "Mart", address: "Nearby", uri: c.maps.uri || "#" }));
  } catch (error) {
    return [];
  }
};
