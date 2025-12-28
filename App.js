// 【重要】严禁在此处写任何 import 语句，否则会报 require/exports 未定义错误

// 从全局对象中提取 React 的功能
const { useState, useEffect, useMemo } = React;
const { 
  Sparkles, DollarSign, Wallet, RefreshCw 
} = lucideReact; // 使用我们在 index.html 引入的图标零件

// --- 内部组件 ---
const DashboardCard = ({ title, value, subValue, icon }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600">{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <p className="text-xs text-slate-400 mt-1">{subValue}</p>
      </div>
    </div>
  </div>
);

const AssetCategory = { Cash: 'Cash', Stock: 'Stock', Crypto: 'Crypto' };

const INITIAL_HOLDINGS = [
  { id: '1', symbol: 'Cash', quantity: 15000, category: AssetCategory.Cash, currency: 'USD', currentPrice: 1, lastUpdated: Date.now() },
  { id: '2', symbol: 'Cash', quantity: 50000, category: AssetCategory.Cash, currency: 'CNY', currentPrice: 1, lastUpdated: Date.now() },
];

function App() {
  const [holdings, setHoldings] = useState(INITIAL_HOLDINGS);
  const [rates, setRates] = useState({ USD: 1, CNY: 7.24, HKD: 7.82 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 计算逻辑
  const { totalValueUSD, totalValueCNY } = useMemo(() => {
    let totalUSD = 0;
    holdings.forEach(h => {
      const valUSD = (h.quantity * (h.currentPrice || 0)) / (rates[h.currency] || 1);
      totalUSD += valUSD;
    });
    return { 
      totalValueUSD: totalUSD, 
      totalValueCNY: totalUSD * (rates['CNY'] || 7.24) 
    };
  }, [holdings, rates]);

  // 刷新逻辑：通过全局函数调用 Cloudflare Worker
  const handleRefreshPrices = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      console.log("🚀 [探针] 正在连接 Cloudflare 大脑...");
      // 注意：确保 geminiService.js 里的函数已经挂载到 window
      if (window.fetchMarketData) {
        const result = await window.fetchMarketData(holdings);
        if (result && result.rates) {
          setRates(prev => ({ ...prev, ...result.rates }));
          console.log("✅ [探针] 数据同步成功！");
        }
      }
    } catch (error) {
      console.error("❌ [探针] 刷新失败:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => { handleRefreshPrices(); }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-600" />
            <span className="text-xl font-black">AMBER TREASURY</span>
          </div>
          <button onClick={handleRefreshPrices} className="p-2 bg-indigo-600 text-white rounded-lg">
            {isRefreshing ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Refresh'}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Total (USD)" value={`$${totalValueUSD.toLocaleString(undefined, {maximumFractionDigits:0})}`} icon={<DollarSign size={24} />} />
          <DashboardCard title="Total (CNY)" value={`¥${totalValueCNY.toLocaleString(undefined, {maximumFractionDigits:0})}`} icon={<Wallet size={24} />} />
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-4">Your Assets</h2>
          <div className="space-y-4">
            {holdings.map(h => (
              <div key={h.id} className="flex justify-between border-b pb-2">
                <span className="font-medium text-slate-700">{h.symbol}</span>
                <span className="font-mono text-slate-600">{h.quantity.toLocaleString()} {h.currency}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// 最后这一行非常关键，代替了 export
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
