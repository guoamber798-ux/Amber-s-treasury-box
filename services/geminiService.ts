import { Holding } from "../types";

export const fetchMarketData = async (holdings: Holding[]) => {
  // 1. 这里的路径必须以 / 开头
  const url = '/.netlify/functions/get_data';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ 
        holdingsString: holdings.map(h => h.symbol).join(", ") 
      })
    });

    if (!response.ok) return { rates: { CNY: 7.2, HKD: 7.8 }, prices: {} };
    
    const data = await response.json();
    return data; 
  } catch (e) {
    return { rates: { CNY: 7.2, HKD: 7.8 }, prices: {} };
  }
};
