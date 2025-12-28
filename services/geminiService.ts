export const fetchMarketData = async (holdings: Holding[]) => {
  console.log("1. 前端函数已启动，收到资产:", holdings); // 探针 1
  import { Holding } from "../types";

export const fetchMarketData = async (holdings: Holding[]) => {
  const defaultRates = { USD: 1, CNY: 7.2, HKD: 7.8 };
  
  if (holdings.length === 0) return { rates: defaultRates, prices: {} };

  const uniqueItems = new Set(holdings.filter(h => h.category !== 'Cash').map(h => `${h.symbol} (${h.currency})`));
  const itemsString = Array.from(uniqueItems).join(", ");

  try {
    // 关键：这里去呼叫你那个已经通了的后端链接
    const response = await fetch('/.netlify/functions/get_data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ holdingsString: itemsString })
    });

    if (!response.ok) throw new Error('Backend unresponsive');
    
    // 这里拿到的是你刚才在网页里看到的那串 JSON
    const data = await response.json();
    
    // 重新映射回 App 需要的格式
    const finalPriceMap: Record<string, number> = {};
    if (data.prices && Array.isArray(data.prices)) {
      holdings.forEach(h => {
        if (h.category === 'Cash') return;
        // 模糊匹配 symbol，确保数据能对上
        const match = data.prices.find((p: any) => p.symbol.includes(h.symbol));
        if (match) finalPriceMap[h.symbol] = match.price;
      });
    }

    return {
      rates: { ...defaultRates, ...data.rates },
      prices: finalPriceMap
    };
  } catch (error) {
    console.error("前端解析数据失败，检查后端返回格式:", error);
    return { rates: defaultRates, prices: {} };
  }
};
  try {
    const response = await fetch('/.netlify/functions/get_data', {
      method: 'POST',
      body: JSON.stringify({ holdingsString: "AAPL, BTC" }) // 先写死测试
    });
    
    console.log("2. 后端响应状态:", response.status); // 探针 2
    const data = await response.json();
    console.log("3. 拿到的原始数据:", data); // 探针 3
    
    return {
      rates: data.rates || { USD: 1, CNY: 7.2, HKD: 7.8 },
      prices: data.prices || {}
    };
  } catch (error) {
    console.error("4. 抓取过程中断:", error);
    return { rates: { USD: 1, CNY: 7.2, HKD: 7.8 }, prices: {} };
  }
};
