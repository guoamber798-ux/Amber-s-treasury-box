// 核心：直接从浏览器全局对象拿 React 的功能
const { useState, useEffect, useMemo } = React;

// 定义内部组件
const DashboardCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600">{icon}</div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  </div>
);

function App() {
  const [holdings] = useState([
    { id: '1', symbol: 'Cash', quantity: 15000, currency: 'USD', currentPrice: 1 },
    { id: '2', symbol: 'Cash', quantity: 50000, currency: 'CNY', currentPrice: 1 }
  ]);
  const [rates, setRates] = useState({ CNY: 7.24 });

  // 这里的 fetchMarketData 稍后会在 index.html 里定义
  const refresh = async () => {
    console.log("🚀 探针启动...");
    if (window.fetchMarketData) {
      const data = await window.fetchMarketData();
      if (data && data.rates) setRates(data.rates);
    }
  };

  useEffect(() => { refresh(); }, []);

  // 在 App 函数内部的 return 处替换：
return (
  <div className="min-h-screen bg-slate-50 p-8">
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 顶部标题与刷新按钮 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">AMBER TREASURY</h1>
        <button 
          onClick={refresh}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          {isRefreshing ? "Syncing..." : "Refresh Data"}
        </button>
      </div>

      {/* 核心卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard title="Total (USD)" value={`$${totalValueUSD.toLocaleString()}`} icon="💰" />
        <DashboardCard title="USD/CNY Rate" value={rates.CNY} icon="📈" />
      </div>

      {/* 资产列表部分：把你的资产展示出来 */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h2 className="text-lg font-bold text-slate-800">My Assets</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {holdings.map(h => (
            <div key={h.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-bold text-slate-900">{h.symbol}</p>
                <p className="text-xs text-slate-400 uppercase font-semibold">{h.category || 'Currency'}</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-slate-700">{h.quantity.toLocaleString()} {h.currency}</p>
                <p className="text-xs text-green-500 font-bold">Live</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
