import { Holding } from "../types";

export const fetchMarketData = async (holdings: Holding[]) => {
  console.log("🚀 探针启动：正在向后端请求资产行情...");

  try {
    // 关键：这里直接请求你已经通了的那个后端地址
    const response = await fetch('/.netlify/functions/get_data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        holdingsString: holdings.map(h => `${h.symbol} (${h.currency})`).join(", ") 
      })
    });

    if (!response.ok) {
        console.error("❌ 后端响应错误，状态码:", response.status);
        return { rates: { CNY: 7.24, HKD: 7.82 }, prices: {} };
    }

    const data = await response.json();
    console.log("✅ 拿到实时数据啦:", data);

    // 映射逻辑：把后端返回的格式转换成 UI 需要的格式
    const finalPriceMap: Record<string, number> = {};
    if (data.prices && Array.isArray(data.prices)) {
      data.prices.forEach((p: any) => {
        const simpleSymbol = p.symbol.split(' ')[0]; // 把 "AAPL (USD)" 变回 "AAPL"
        finalPriceMap[simpleSymbol] = p.price;
      });
    }

    return {
      rates: data.rates || { CNY: 7.24, HKD: 7.82 },
      prices: finalPriceMap
    };
  } catch (error) {
    console.error("❌ 前端连接失败:", error);
    return { rates: { CNY: 7.24, HKD: 7.82 }, prices: {} };
  }
};
