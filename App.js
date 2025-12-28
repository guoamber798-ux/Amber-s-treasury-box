// 注意：浏览器环境严禁使用 import/export 语法

const { useState, useEffect, useMemo } = React;

// --- 子组件 1：统计卡片 ---
const DashboardCard = ({ title, value, icon, subValue }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className="p-4 bg-indigo-50 rounded-2xl text-2xl">{icon}</div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
    </div>
  </div>
);

// --- 主程序 ---
function App() {
  // 1. 初始资产数据
  const [holdings] = useState([
    { id: '1', symbol: 'Cash', quantity: 15000, category: 'Fiat', currency: 'USD' },
    { id: '2', symbol: 'Cash', quantity: 50000, category: 'Fiat', currency: 'CNY' },
    { id: '3', symbol: 'AAPL', quantity: 10, category: 'Stock', currency: 'USD' }
  ]);

  // 2. 状态管理
  const [rates, setRates] = useState({ CNY: 7.24, HKD: 7.82 });
  const [prices, setPrices] = useState({ AAPL: 240 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 3. 核心计算逻辑：自动换算总资产
  const { totalValueUSD, totalValueCNY } = useMemo(() => {
    let totalUSD = 0;
    holdings.forEach(h => {
      const price = h.symbol === 'Cash' ? 1 : (prices[h.symbol] || 0);
      const valueInNative = h.quantity * price;
      const rateToUSD = h.currency === 'CNY' ? rates.CNY : (h.currency === 'HKD' ? rates.HKD : 1);
      totalUSD += valueInNative / rateToUSD;
    });
    return {
      totalValueUSD: totalUSD,
      totalValueCNY: totalUSD * rates.CNY
    };
  }, [holdings, rates, prices]);

  // 4. 数据刷新：呼叫你的 Cloudflare Worker 大脑
  const refreshData = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    console.log("🚀 探针启动：正在连接 Cloudflare Worker...");
    
    try {
      // 指向你的 Worker 地址
      const url = 'https://amber-s-treasury-box.guo-amber798.workers.dev';
      const response = await fetch(url, { 
        method: 'POST',
        body: JSON.stringify({ symbols: holdings.map(h => h.symbol).join(',') })
      });
      
      const data = await response.json();
      if (data.rates) setRates
