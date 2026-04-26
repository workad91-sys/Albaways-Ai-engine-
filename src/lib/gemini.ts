import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ItineraryItem {
  time?: string;
  activity: string;
  location: string;
  description: string;
  imageKeyword: string;
  lat: number;
  lng: number;
}

export interface DayPlan {
  day: number;
  theme: string;
  description: string;
  items: ItineraryItem[];
  overnightLocation: string;
}

export interface Itinerary {
  title: string;
  destination: string;
  duration: string;
  overview: string;
  days: DayPlan[];
  estimatedPricePerPerson: number;
  estimatedPrivateUpgrade: number;
  currencySymbol: string;
  includes: string[];
  notIncludes: string[];
  note?: string;
}

export const ITINERARY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    destination: { type: Type.STRING },
    duration: { type: Type.STRING },
    overview: { type: Type.STRING },
    estimatedPricePerPerson: { type: Type.NUMBER },
    estimatedPrivateUpgrade: { type: Type.NUMBER },
    currencySymbol: { type: Type.STRING },
    note: { type: Type.STRING },
    includes: { 
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    notIncludes: { 
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.NUMBER },
          theme: { type: Type.STRING },
          description: { type: Type.STRING },
          overnightLocation: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                activity: { type: Type.STRING },
                location: { type: Type.STRING },
                description: { type: Type.STRING },
                imageKeyword: { type: Type.STRING },
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER }
              },
              required: ["activity", "location", "description", "imageKeyword", "lat", "lng"]
            }
          }
        },
        required: ["day", "theme", "description", "items", "overnightLocation"]
      }
    }
  },
  required: ["title", "destination", "duration", "overview", "days"]
};

export async function generateItinerary(prompt: string, lang: string = "English"): Promise<Itinerary> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Generate a comprehensive, luxurious, and high-end travel itinerary in ${lang} based on this request: "${prompt}". 
        Provide the response in JSON format.
        IMPORTANT: Each day MUST contain exactly 4 distinct activities/items.
        
        NARRATIVE REQUIREMENTS:
        - Main Title: Create a compelling, poetic title that often uses " & " to separate key themes or locations.
        - Day Themes: Evocative short titles for each day.
        - Day Descriptions: Provide a beautiful 2-3 sentence overview for each day explaining the "vibe" or narrative of that specific day.
        - Activity Names: Use descriptive and enticing names for each activity.
        - Activity Descriptions: CRITICAL: Provide EXTENSIVE, non-summarized, and immersive descriptions for every activity (at least 6-8 full sentences per activity). Each description must be deep, sensory, and highly detailed about the experience, surroundings, and historical context. Avoid summaries.
        
        ESTIMATIONS:
        - Price & Currency: Detect the preferred currency from the prompt (e.g., if "Saudi Riyals" or similar is mentioned, use "SAR" or "ر.س"). If no specific currency is requested, default to "USD" or "$". Put the actual currency symbol or code in 'currencySymbol'.
        - Estimated Numbers: Provide realistic 'estimatedPricePerPerson' and 'estimatedPrivateUpgrade' numbers matching the detected currency.
        - Images: 'imageKeyword' MUST be a specific, detailed search term in English for a high-quality photo.
        - Overnight: Specify 'overnightLocation'.
        - Coordinates: Provide accurate 'lat' and 'lng' for every activity.
        - Footer: Provide a list of 'includes' (at least 6 specific items) and 'notIncludes' (at least 4 items).
        - Note: Provide a 'note' (one paragraph) at the very bottom with practical advice, local etiquette, or a welcoming message.` }]
      }
    ],
    config: {
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
      responseSchema: ITINERARY_SCHEMA
    }
  });

  return JSON.parse(response.text || "{}") as Itinerary;
}

export async function translateItinerary(itinerary: Itinerary, targetLang: string): Promise<Itinerary> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Translate the following travel itinerary into ${targetLang}. Keep the exact same JSON structure, pricing numbers, and imageKeywords. 
        Itinerary JSON: ${JSON.stringify(itinerary)}` }]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: ITINERARY_SCHEMA
    }
  });

  return JSON.parse(response.text || "{}") as Itinerary;
}

export async function draftItinerary(content: string, lang: string = "English"): Promise<Itinerary> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `STRICT DRAFTING MODE: Convert the following raw travel content into the structured Itinerary JSON format. 
        Target Language: ${lang}
        
        RULES:
        1. DO NOT invent new locations or activities. Use ONLY the information provided in the "Raw Content".
        2. If specific details are missing, generate professional completions BASED ONLY on context.
        3. CRITICAL: Expand descriptions to be detailed and evocative (at least 6-8 full sentences per activity). Avoid short summaries.
        4. Detect currency from raw content or context (e.g., if "Saudi Riyals" mentioned, use "SAR"). If no currency is requested, default to "$". Put symbol/code in 'currencySymbol'.
        5. Provide a 'note' with valuable advice or a local greeting related to the content.
        6. COORDINATES: Provide accurate latitude (lat) and longitude (lng) for EVERY activity location.
        7. Match the ITINERARY_SCHEMA exactly.
        
        Raw Content:
        "${content}"` }]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: ITINERARY_SCHEMA
    }
  });

  return JSON.parse(response.text || "{}") as Itinerary;
}
