import { Holding } from "../types";

export const fetchMarketData = async (holdings: Holding[]): Promise<{ rates: Record<string, number>; prices: Record<string, number> }> => {
  const defaultRates = { USD: 1, CNY: 7.2, HKD: 7.8 };
  
  if (holdings.length === 0) return { rates: defaultRates, prices: {} };

  // 整理资产列表发送给后端
  const uniqueItems = new Set(holdings.filter(h => h.category !== 'Cash').map(h => `${h.symbol} (${h.currency})`));
  const itemsString = Array.from(uniqueItems).join(", ");
  
  if (!itemsString) return { rates: defaultRates, prices: {} };

  try {
    // 关键点：去敲我们自己的 Netlify Function 后门
    const response = await fetch('/.netlify/functions/get_data', {
      method: 'POST',
      body: JSON.stringify({ holdingsString: itemsString })
    });

    const data = await response.json();
    
    // 以下保留你原本的映射逻辑，确保 UI 依然能正常显示
    const finalPriceMap: Record<string, number> = {};
    if (data.prices && Array.isArray(data.prices)) {
      holdings.forEach(h => {
        if (h.category === 'Cash') return;
        const match = data.prices.find((p: any) => p.symbol.includes(h.symbol));
        if (match) finalPriceMap[h.symbol] = match.price;
      });
    }

    return {
      rates: { ...defaultRates, ...data.rates },
      prices: finalPriceMap
    };

  } catch (error) {
    console.error("安全连接失败，使用默认汇率:", error);
    return { rates: defaultRates, prices: {} };
  }
};
