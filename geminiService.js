export const fetchMarketData = async (holdings) => {
  // 1. 换成你截图 image_ee5241.png 中的 Worker 地址
  const url = 'https://amber-s-treasury-box.guo-amber798.workers.dev';
  
  console.log("🚀 探针已激活！正在连接 Cloudflare 边缘网络...");

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // 发送资产列表给 Gemini 2.0 Flash
      body: JSON.stringify({ 
        holdingsString: holdings.map(h => h.symbol).join(", ") 
      })
    });

    if (!response.ok) throw new Error("Cloudflare 响应异常");

    const data = await response.json();
    console.log("✅ 实时数据已从 Gemini 2.0 Flash 送达:", data);
    return data;
  } catch (e) {
    console.error("❌ 获取失败，使用保底汇率:", e);
    return { rates: { CNY: 7.24, HKD: 7.82 }, prices: {} };
  }
};
