CulinaryOS is a high-performance, premium IoT kitchen platform designed to bridge the gap between physical grocery management and intelligent meal planning. As a senior engineer, I’ve architected this system to feel like a "Smart Home OS" rather than a simple list app.
Here is a breakdown of the terminology, tech stack, and engineering choices used in the application.
1. The Tech Stack
Frontend Core: React 19 with TypeScript. We use functional components and hooks (useMemo, useEffect) to ensure smooth performance during heavy AI data processing.
Styling: Tailwind CSS. The interface uses a "Glassmorphism" aesthetic (translucent cards, heavy blurs) to mimic modern IoT interfaces like Apple Home or Nest.
Backend & Auth: Supabase.
PostgreSQL: Handles inventory and profiles.
Row Level Security (RLS): Ensures your "Kitchen Node" is private and only accessible to you.
Real-time engine: Automatically syncs inventory across multiple devices (e.g., scan on your phone, see it on your tablet).
Intelligence Engine: Google Gemini API.
Gemini 3 Flash: Used for high-speed Vision (scanning) and Chat.
Gemini 2.5 Flash: Used for Location Grounding (finding stores).
PWA (Progressive Web App): Includes a Service Worker (sw.js) and Manifest for "Install to Home Screen" support, making it feel like a native mobile app.
2. Core Terminology & Concepts
To give the app a premium, professional feel, we use specific terminology:
Registry: The master database of your physical food items.
AI Studio: The laboratory where Gemini analyzes your registry to synthesize recipe strategies.
Neural Scan: The computer-vision protocol that uses your camera to identify physical items.
Stock Wealth: A proprietary algorithm that calculates the monetary and nutritional value of your current stock.
Biometric Impact: The nutritional breakdown (Kcal, Macros) and "Health Score" of a suggested recipe.
Grounding: The process of connecting AI answers to real-world data (like current prices or store locations).
3. Page & Module Breakdown
A. Dashboard (The Command Center)
Function: Provides a "Snapshot" of your kitchen's health.
Key UI: Stat Cards with animated value counters and the "Stock Wealth" progress ring.
Logic: High-level summaries of expiring items and low-stock alerts.
B. Stock Hub / Registry (Inventory Management)
Function: Full CRUD (Create, Read, Update, Delete) management of food.
Features: Scalable "Occasion Multipliers." If you set the occasion to "Party," the app automatically recalculates your target stock levels and flags items as "Low" based on the higher demand.
C. AI Studio (Recipe Generation)
Function: Suggests meals based on what you actually have.
AI Logic: It prioritize items nearing their Expiry Date to reduce food waste.
Grounding: Uses Google Search to check regional prices for missing ingredients so you know exactly what a meal will cost before you shop.
D. Vision Protocol (The Scanner)
Function: Hands-free entry.
Logic: Uses a raw media stream. When you capture a frame, it is sent as a base64 string to Gemini 3 Flash. The AI returns JSON containing the item name, category, and estimated shelf life.
E. Settings (Identity Module)
Function: Customizes the AI's "Neural Parameters."
Logic: Updates your dietary restrictions (Vegan, Keto, etc.) and allergies. These are passed as System Instructions to Gemini in every recipe request.
4. Key AI Features & APIs
Feature	Model Used	API Purpose
Smart Scanning	gemini-3-flash-preview	Vision: Converts a photo of a tomato into a structured data object.
Recipe Synthesis	gemini-3-flash-preview	Search Grounding: Finds recipes and searches the web for current ingredient prices.
Nearby Marts	gemini-2.5-flash	Maps Grounding: Takes your GPS coordinates and finds real supermarkets near you.
Chef AI Chat	gemini-3-flash-preview	Conversational: Acts as a consultant for cooking tips and inventory questions.
5. Advanced Logistics
Auto-Grocery List: When Registry items fall below the MinThreshold, they are automatically injected into the Grocery List using Supabase triggers/logic.
Step-by-Step Execution: When you start a recipe, the app enters a "Focus Mode" (RecipeInstructions.tsx) with a progress bar and duration timers for each phase.
This architecture ensures that CulinaryOS isn't just a list—it's an intelligent assistant that understands the value, location, and expiration of everything in your kitchen.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
