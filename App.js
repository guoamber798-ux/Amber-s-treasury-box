const { useState, useEffect, useMemo } = React;

// 1. 修复图标引用：直接从全局 lucide 对象获取
const Icon = ({ name, size = 24, className = "" }) => {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [name]);
  return <i data-lucide={name} style={{ width: size, height: size }} className={className}></i>;
};

// 2. 统计卡片组件
const DashboardCard = ({ title, value, iconName, subValue }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
      <Icon name={iconName} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      {subValue && <p className="text-xs text-slate-400 mt-1 font-medium">{subValue}</p>}
    </div>
  </div>
);

// 3. 主程序
function App() {
  const [holdings, setHoldings] = useState([
    { id: '1', symbol: 'Cash', quantity: 15000, category: 'Cash', currency: 'USD' },
    { id: '2', symbol: 'Cash', quantity: 50000, category: 'Cash', currency: 'CNY' },
    { id: '3', symbol: 'Gold', quantity: 100, category: 'Commodity', currency: 'USD' }
  ]);
  const [rates, setRates] = useState({ CNY: 7.24 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 核心计算
  const stats = useMemo(() => {
    let totalUSD = 0;
    const categories = {};
    holdings.forEach(h => {
      const valUSD = h.quantity / (h.currency === 'CNY' ? rates.CNY : 1);
      totalUSD += valUSD;
      categories[h.category] = (categories[h.category] || 0) + valUSD;
    });
    return {
      usd: Math.floor(totalUSD).toLocaleString(),
      cny: Math.floor(totalUSD * rates.CNY).toLocaleString(),
      allocation: Object.entries(categories).map(([name, val]) => ({
        name,
        percent: ((val / totalUSD) * 100).toFixed(1)
      }))
    };
  }, [holdings, rates]);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const url = 'https://amber-s-treasury-box.guo-amber798.workers.dev';
      const res = await fetch(url, { method: 'POST', body: JSON.stringify({}) });
      const data = await res.json();
      if (data && data.rates) setRates(data.rates);
    } catch (e) { console.error("Sync error"); }
    finally { setIsRefreshing(false); }
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight">AMBER TREASURY</h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Live Portfolio Tracking</p>
          </div>
          <button onClick={refresh} className="p-4 bg-white rounded-2xl shadow-sm border hover:bg-slate-50">
            <Icon name="refresh-cw" className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Total (USD)" value={"$" + stats.usd} iconName="dollar-sign" />
          <DashboardCard title="Total (CNY)" value={"¥" + stats.cny} iconName="wallet" subValue={"Rate: 1 USD = " + rates.CNY + " CNY"} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 资产列表 */}
          <div className="lg:col-span-2 bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between">
              <h2 className="text-lg font-bold">Asset Holdings</h2>
              <Icon name="layout-dashboard" className="text-indigo-600" />
            </div>
            <div className="divide-y divide-slate-50">
              {holdings.map(h => (
                <div key={h.id} className="p-6 flex justify-between hover:bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400">{h.symbol[0]}</div>
                    <p className="font-bold text-slate-800">{h.symbol}</p>
                  </div>
                  <p className="font-mono font-bold text-slate-700">{h.quantity.toLocaleString()} {h.currency}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 配比进度条 [取代复杂的饼图以增强稳定性] */}
          <div className="lg:col-span-1 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 h-fit">
            <h2 className="text-lg font-bold mb-6 flex justify-between">Allocation <Icon name="trending-up" className="text-cyan-500"/></h2>
            <div className="space-y-6">
              {stats.allocation.map(item => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>{item.name}</span>
                    <span>{item.percent}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: item.percent + '%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
