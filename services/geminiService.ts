import { GoogleGenAI } from "@google/genai";
import { Holding } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchMarketData = async (holdings: Holding[]): Promise<{ rates: Record<string, number>; prices: Record<string, number> }> => {
  // Default rates if API fails or returns incomplete data
  const defaultRates = { USD: 1, CNY: 7.2, HKD: 7.8 };
  
  if (holdings.length === 0) {
    return { rates: defaultRates, prices: {} };
  }

  // Construct a unique request list to avoid asking for the same symbol multiple times
  const uniqueItems = new Set(holdings.filter(h => h.category !== 'Cash').map(h => `${h.symbol} (${h.currency})`));
  const itemsString = Array.from(uniqueItems).join(", ");
  
  if (!itemsString) {
    // Only cash assets
    return { rates: defaultRates, prices: {} };
  }

  const prompt = `
    I have a portfolio with the following assets: [${itemsString}].
    
    Task:
    1. Find the current market price for each asset in its specified currency.
       - Example: If "0700.HK (HKD)" is requested, provide the price in HKD.
       - Example: If "AAPL (USD)" is requested, provide the price in USD.
    
    2. Find the current market exchange rates for:
       - USD to CNY
       - USD to HKD
    
    CRITICAL OUTPUT INSTRUCTIONS:
    - Return ONLY valid JSON.
    - Do not include markdown formatting (like \`\`\`json).
    - Ensure the "symbol" field in the response EXACTLY matches the string provided in the list (e.g., "AAPL (USD)").
    
    JSON Structure:
    {
      "rates": { "CNY": number, "HKD": number }, 
      "prices": [
        { "symbol": "string", "price": number }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let text = response.text || "{}";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON response:", text);
        return { rates: defaultRates, prices: {} };
    }
    
    // Create a lookup map from the API response
    // Key: The symbol string returned by API (ideally "AAPL (USD)")
    // Value: The price
    const apiResponseMap: Record<string, number> = {};
    if (data.prices && Array.isArray(data.prices)) {
      data.prices.forEach((p: any) => {
        if (p.symbol && typeof p.price === 'number') {
           apiResponseMap[p.symbol] = p.price;
        }
      });
    }

    // Map back to the simple symbol used by the app (e.g., "AAPL")
    const finalPriceMap: Record<string, number> = {};
    
    holdings.forEach(h => {
        if (h.category === 'Cash') return;

        const fullKey = `${h.symbol} (${h.currency})`;
        
        // 1. Try Exact Match (Preferred)
        if (apiResponseMap[fullKey] !== undefined) {
            finalPriceMap[h.symbol] = apiResponseMap[fullKey];
            return;
        }

        // 2. Try matching if API returned just the ticker part (e.g. "AAPL")
        if (apiResponseMap[h.symbol] !== undefined) {
            finalPriceMap[h.symbol] = apiResponseMap[h.symbol];
            return;
        }

        // 3. Fuzzy Match: Find any key in response that contains the symbol
        const fuzzyKey = Object.keys(apiResponseMap).find(k => k.includes(h.symbol));
        if (fuzzyKey) {
            finalPriceMap[h.symbol] = apiResponseMap[fuzzyKey];
        }
    });

    return {
      rates: { ...defaultRates, ...data.rates },
      prices: finalPriceMap
    };

  } catch (error) {
    console.error("Failed to fetch market data via Gemini:", error);
    return { rates: defaultRates, prices: {} };
  }
};