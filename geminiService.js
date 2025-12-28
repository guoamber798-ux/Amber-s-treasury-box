export const fetchMarketData = async (holdings: any) => {
  // 直接弹窗，确认识别到代码更新
  window.alert("🚀 探针已激活！正在连接 Netlify 后端...");
  
  try {
    const response = await fetch('/.netlify/functions/get_data', { method: 'POST' });
    const data = await response.json();
    console.log("✅ 实时数据已送达:", data);
    return data;
  } catch (e) {
    console.error("❌ 获取失败:", e);
    return { rates: { CNY: 7.24, HKD: 7.82 }, prices: {} };
  }
};
