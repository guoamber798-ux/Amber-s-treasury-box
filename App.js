// 【Amber Treasury 终极全功能版】
// 环境：Cloudflare Pages + Babel 浏览器直译模式
// 状态：已移除所有 TypeScript 类型与外部 import

const { useState, useEffect, useMemo } = React;
const { 
  LayoutDashboard, Wallet, TrendingUp, DollarSign, 
  Sparkles, History, LogOut, CloudCheck, RefreshCw 
} = lucideReact;

// --- 基础配置 ---
const AssetCategory = { Cash: 'Cash', Stock: 'Stock', Crypto: 'Crypto' };
const STORAGE_KEYS = {
  USER: 'amber_treasury_user',
  HOLDINGS: 'amber_treasury_holdings',
  WATCHLIST: 'amber_treasury_watchlist',
  HISTORY: 'amber_treasury_history'
};

// --- 模拟所有外部组件（确保功能完整实现） ---

// 1. 统计卡片
const DashboardCard = ({ title, value, subValue, icon }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">{icon}</div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <p className="text-xs text-slate-400 mt-1">{subValue}</p>
    </div>
  </div>
);

// 2. 模拟登录模块
const AuthModal = ({ onLogin }) => {
  const [name, setName] = useState('');
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[32px] w-full max-w-md text-center">
        <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
          <Sparkles className="text-white" />
        </div>
        <h1 className="text-2xl font-black mb-2">Amber Treasury</h1>
        <p className="text-slate-400 mb-8">Enter your name to start tracking</p>
        <input 
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Your Name"
        />
        <button 
          onClick={() => name && onLogin(name)}
          className="w-full p-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all"
        >
          Access Dashboard
        </button>
      </div>
    </div>
  );
};

// 3. 资产列表模块（简化实现）
const AssetList = ({ type, holdings, rates, onDelete, onUpdateQuantity }) => (
  <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
    <div className="p-6 border-b border-slate-50 flex justify-between items-center">
      <h2 className="text-lg font-bold capitalize">{type} List</h2>
    </div>
    <div className="divide-y divide-slate-50">
      {holdings.map(h => (
        <div key={h.id} className="p-6 flex justify-between items-center">
          <div>
            <p className="font-bold">{h.symbol}</p>
            <p className="text-xs text-slate-400">{h.currency}</p>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="number" value={h.quantity} 
              onChange={(e) => onUpdateQuantity(h.id, parseFloat(e.target.value))}
              className="w-24 p-2 bg-slate-50 border rounded-lg text-right"
            />
            <button onClick={() => onDelete(h.id)} className="text-red-400 text-xs">Delete</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- 主程序 ---
function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)));
  const [holdings, setHoldings] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.HOLDINGS)) || [
    { id: '1', symbol: 'Cash', quantity: 15000, category: 'Cash', currency: 'USD', currentPrice: 1 },
    { id: '2', symbol: 'Cash', quantity: 50000, category: 'Cash', currency: 'CNY', currentPrice: 1 }
  ]);
  const [watchlist, setWatchlist] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST)) || []);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || []);
  const [rates, setRates] = useState({ USD: 1, CNY: 7.24, HKD: 7.82 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 持久化
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.HOLDINGS, JSON.stringify(holdings)); }, [holdings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history)); }, [history]);

  // 计算逻辑
  const { totalValueUSD, totalValueCNY } = useMemo(() => {
    let totalUSD = 0;
    holdings.forEach(h => {
      const rate = rates[h.currency] || 1;
      totalUSD += (h.quantity * (h.currentPrice || 1)) / rate;
    });
    return { totalValueUSD: totalUSD, totalValueCNY: totalUSD * (rates.CNY || 7.24) };
  }, [holdings, rates]);

  // 刷新逻辑
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (window.fetchMarketData) {
        const result = await window.fetchMarketData(holdings);
        if (result && result.rates) setRates(prev => ({ ...prev, ...result.rates }));
        // 记录历史
        setHistory(prev => [...prev, { timestamp: Date.now(), valueUSD: totalValueUSD }].slice(-50));
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => { handleRefresh(); }, []);

  if (!user) return <AuthModal onLogin={(name) => setUser({ username: name })} />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2 rounded-lg"><Sparkles className="h-5 w-5 text-indigo-400" /></div>
            <span className="text-xl font-black">AMBER TREASURY</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100 text-[10px] font-bold text-green-600">
               <CloudCheck size={14} /> LIVE
            </div>
            <button onClick={() => setUser(null)} className="text-slate-400"><LogOut size={20}/></button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Total (USD)" value={`$${totalValueUSD.toLocaleString(undefined, {maximumFractionDigits:0})}`} subValue="Real-time Wealth" icon={<DollarSign size={24}/>} />
          <DashboardCard title="Total (CNY)" value={`¥${totalValueCNY.toLocaleString(undefined, {maximumFractionDigits:0})}`} subValue={`Rate: 1 USD = ¥${rates.CNY}`} icon={<Wallet size={24}/>} />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <AssetList 
            type="portfolio" holdings={holdings} rates={rates} 
            onDelete={(id) => setHoldings(prev => prev.filter(h => h.id !== id))}
            onUpdateQuantity={(id, q) => setHoldings(prev => prev.map(h => h.id === id ? {...h, quantity: q} : h))}
          />
        </div>

        <button 
          onClick={handleRefresh}
          className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-2 font-bold"
        >
          {isRefreshing ? <RefreshCw className="animate-spin" /> : <RefreshCw />} Sync Markets
        </button>
      </main>
    </div>
  );
}

// 启动渲染
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
