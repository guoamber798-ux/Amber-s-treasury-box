const { useState, useEffect, useMemo } = React;

// --- 子组件：统计卡片 ---
const DashboardCard = ({ title, value, icon, subValue }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className="p-4 bg-indigo-50 rounded-2xl text-2xl text-indigo-600">{icon}</div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      {subValue && <p className="text-xs text-slate-400 mt-1 font-medium">{subValue}</p>}
    </div>
  </div>
);

// --- 主程序 ---
function App() {
  const [holdings, setHoldings] = useState([
    { id: '1', symbol: 'Cash', quantity: 15000, category: 'Cash', currency: 'USD' },
    { id: '2', symbol: 'Cash', quantity: 50000, category: 'Cash', currency: 'CNY' },
    { id: '3', symbol: 'AAPL', quantity: 10, category: 'Stock', currency: 'USD' }
  ]);
  const [rates, setRates] = useState({ CNY: 7.24 });
  const [prices, setPrices] = useState({ AAPL: 245.5 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. 核心计算逻辑
  const { totalValueUSD, allocationData } = useMemo(() => {
    let totalUSD = 0;
    const categories = {};
    holdings.forEach(h => {
      const price = h.symbol === 'Cash' ? 1 : (prices[h.symbol] || 0);
      const valUSD = (h.quantity * price) / (h.currency === 'CNY' ? rates.CNY : 1);
      totalUSD += valUSD;
      categories[h.category] = (categories[h.category] || 0) + valUSD;
    });
    return { 
      totalValueUSD: totalUSD, 
      allocationData: Object.entries(categories).map(([name, val]) => ({ name, percent: (val/totalUSD)*100 }))
    };
  }, [holdings, rates, prices]);

  // 2. 刷新功能：连接你的 Cloudflare Worker
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const url = 'https://amber-s-treasury-box.guo-amber798.workers.dev';
      const response = await fetch(url, { method: 'POST', body: JSON.stringify({ holdings }) });
      const data = await response.json();
      if (data && data.rates) setRates(data.rates);
      if (data && data.prices) setPrices(prev => ({ ...prev, ...data.prices }));
    } catch (e) { console.error("Sync Error"); }
    finally { setIsRefreshing(false); }
  };

  useEffect(() => { refreshData(); }, []);

  // 3. 页面渲染
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight">AMBER TREASURY</h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">Status: <span className="text-green-500">Connected</span></p>
          </div>
          <button onClick={refreshData} className="p-4 bg-white rounded-2xl shadow-sm border hover:scale-105 transition-transform">
            {isRefreshing ? "⏳" : "🔄"}
          </button>
        </div>

        {/* 统计卡片区 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Total (USD)" value={"$" + Math.floor(totalValueUSD).toLocaleString()} icon="💰" />
          <DashboardCard title="Total (CNY)" value={"¥" + Math.floor(totalValueUSD * rates.CNY).toLocaleString()} icon="🏮" subValue={"Rate: 1 USD = " + rates.CNY + " CNY"} />
        </div>

        {/* 下方双栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧资产列表 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h2 className="text-lg font-bold">Asset Holdings</h2>
                <button className="text-xs font-black text-indigo-600 uppercase">+ Add Asset</button>
              </div>
              <div className="divide-y divide-slate-50">
                {holdings.map(h => (
                  <div key={h.id} className="p-6 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400">{h.symbol[0]}</div>
                      <div>
                        <p className="font-bold text-slate-800">{h.symbol}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{h.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-slate-700">{h.quantity.toLocaleString()} {h.currency}</p>
                      <p className="text-[10px] text-slate-400">Price: {h.symbol==='Cash'?'1.00':(prices[h.symbol]||'0.00')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧配比饼图 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 sticky top-24">
              <h2 className="text-lg font-bold mb-6">Allocation</h2>
              <div className="space-y-6">
                {allocationData.map(item => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                      <span>{item.name}</span>
                      <span>{item.percent.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-1000" style={{width: item.percent + '%'}}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Powered by Gemini 2.0 Flash</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
