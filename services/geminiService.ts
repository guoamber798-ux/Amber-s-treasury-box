export const fetchMarketData = async (holdings: Holding[]) => {
  console.log("1. 前端函数已启动，收到资产:", holdings); // 探针 1
  
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
