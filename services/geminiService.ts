
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
 * identifyIngredientsFromImage identifies multiple ingredients in a single photo for recipe generation.
 */
export const identifyIngredientsFromImage = async (base64Image: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyze this image and list all food ingredients visible. Return ONLY a JSON array of strings representing the ingredient names.`;

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
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Multi-Vision Error:", error);
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
  
  Suggest 3 creative recipes. Use Google Search to find current regional pricing estimations for any ingredients that are MISSING from the available list to complete these recipes.
  Return ONLY a JSON array.
  Include properties: id, title, description, ingredients (array), steps (array of {number, instruction, duration?}), cookingTime, difficulty, matchPercentage, calories, healthScore, estimatedPrice (a string showing estimated cost for missing items in local currency), nutrition ({protein, carbs, fats}).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              steps: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: { 
                    number: { type: Type.NUMBER }, 
                    instruction: { type: Type.STRING },
                    duration: { type: Type.STRING }
                  } 
                } 
              },
              cookingTime: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              matchPercentage: { type: Type.NUMBER },
              calories: { type: Type.NUMBER },
              healthScore: { type: Type.NUMBER },
              estimatedPrice: { type: Type.STRING },
              nutrition: {
                type: Type.OBJECT,
                properties: {
                  protein: { type: Type.STRING },
                  carbs: { type: Type.STRING },
                  fats: { type: Type.STRING }
                }
              }
            },
            required: ["id", "title", "steps", "nutrition", "estimatedPrice"]
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Recipe Error:", error);
    return [];
  }
};

export const getRelatedRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Based on these primary ingredients: ${ingredients.join(', ')}, suggest 2 creative alternative recipe "remixes". 
  Return ONLY a JSON array of recipe objects.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Related Recipe Error:", error);
    return [];
  }
};

export const chatWithChef = async (message: string, inventory: InventoryItem[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const inventoryContext = inventory.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ');
  
  const systemInstruction = `You are "Chef AI". Access to inventory: ${inventoryContext}. Be helpful and concise. Focus on using ingredients near expiry.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: { systemInstruction, temperature: 0.7 }
    });
    return response.text || "I'm sorry, I couldn't process that.";
  } catch (error) {
    return "The kitchen AI is currently recalibrating. Please try again.";
  }
};

export const findNearbyMarts = async (latitude: number, longitude: number): Promise<Mart[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Find 3 grocery stores or supermarkets near my current location for food shopping.",
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
