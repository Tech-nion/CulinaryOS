**🍳 CulinaryOS – Intelligent IoT Kitchen Platform**

CulinaryOS is a high-performance, premium IoT kitchen platform that bridges the gap between physical grocery management and intelligent meal planning. It’s designed to function as a Smart Home OS, not just a list app, offering AI-powered inventory management, recipe generation, and smart cooking guidance.

**✨ Features**
Dashboard (Command Center)

Snapshot of your kitchen’s health

Expiring items & low-stock alerts

Animated Stat Cards & Stock Wealth progress ring

Stock Hub / Registry (Inventory Management)

Full CRUD for pantry items

Dynamic stock targets with Occasion Multipliers

Low-stock notifications

AI Studio (Recipe Generation)

Suggests meals based on your current inventory

Prioritizes items near expiration to reduce waste

Checks real-time ingredient prices via web grounding

Vision Protocol (Scanner)

Hands-free item entry using camera

Converts images to structured JSON via Gemini 3 Flash

Captures name, category, and shelf-life estimates

Settings (Identity Module)

Customize AI with dietary restrictions (Vegan, Keto, etc.)

Allergies and preferences passed to AI for recipe suggestions

**🧠 AI Features & APIs:**
Feature	Model	Purpose
Smart Scanning	gemini-3-flash-preview	Converts food images into structured data
Recipe Synthesis	gemini-3-flash-preview	Suggests recipes and checks ingredient prices
Nearby Marts	gemini-2.5-flash	Finds supermarkets using GPS
Chef AI Chat	gemini-3-flash-preview	Conversational assistant for cooking & inventory
⚡ Advanced Logistics

Auto-Grocery List: Low-stock items automatically added using Supabase triggers

Step-by-Step Execution: Recipe Focus Mode with progress bars and timers for each step

**🛠 Tech Stack:**

Frontend: React 19 + TypeScript, Tailwind CSS, Glassmorphism UI

Backend & Auth: Supabase + PostgreSQL, Row-Level Security

Real-Time Sync: Multi-device inventory updates

Intelligence Engine: Google Gemini API (Gemini 3 Flash & Gemini 2.5 Flash)

PWA Support: Service Worker + Manifest for installable web app

**📌 Core Terminology:**

Registry: Master database of physical food items

AI Studio: Laboratory for AI-powered recipe strategies

Neural Scan: Vision-based item identification

Stock Wealth: Monetary & nutritional value algorithm

Biometric Impact: Health Score & nutritional breakdown

Grounding: Linking AI outputs to real-world data (prices, locations)

**💡 Conclusion:**

CulinaryOS is more than a kitchen app—it’s an intelligent assistant that understands the value, location, and expiration of every item in your kitchen, helping you cook smarter, reduce waste, and plan meals efficiently.

I can also make a GitHub-ready version with badges, screenshots, and collapsible sections so your README looks professional and eye-catching.


## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
