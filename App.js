import React, { useState, useEffect, useMemo } from 'react';
// 注意：以下图标库引入在浏览器环境可能需要对应的 CDN 或打包环境，
// 如果依然白屏，请告诉我，我们需要将图标换成简单的文字。
import { 
  LayoutDashboard, Wallet, TrendingUp, DollarSign, 
  Sparkles, History, User as UserIcon, LogOut, CloudCheck, CloudOff, RefreshCw
} from 'lucide-react';
import { fetchMarketData } from './geminiService.js';

// --- 模拟组件（防止因为找不到 components 文件夹而报错） ---
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

// --- 基础配置 ---
const AssetCategory = { Cash: 'Cash', Stock: 'Stock', Crypto: 'Crypto' };

const INITIAL_HOLDINGS = [
  { id: '1', symbol: 'Cash', quantity: 15000, category: AssetCategory.Cash, currency: 'USD', currentPrice: 1, lastUpdated: Date.now() },
  { id: '2', symbol: 'Cash', quantity: 50000, category: AssetCategory.Cash, currency: 'CNY', currentPrice: 1, lastUpdated: Date.now() },
];

const STORAGE_KEYS = {
  USER: 'amber_treasury_user',
  HOLDINGS: 'amber_treasury_holdings',
  HISTORY: 'amber_treasury_history'
};

function App() {
  // 状态管理（去类型化）
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : { username: 'Amber', id: '1' }; // 默认登录
  });

  const [holdings, setHoldings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HOLDINGS);
    return saved ? JSON.parse(saved) : INITIAL_HOLDINGS;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  const [rates, setRates] = useState({ USD: 1, CNY: 7.24, HKD: 7.82 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 计算逻辑
  const { totalValueUSD, totalValueCNY } = useMemo(() => {
    let totalUSD = 0;
    holdings.forEach(h => {
      const valUSD = (h.quantity * (h.currentPrice || 0)) / (rates[h.currency] || 1);
      totalUSD += valUSD;
    });
    return { totalValueUSD: totalUSD, totalValueCNY: totalUSD * (rates['CNY'] || 7.24) };
  }, [holdings, rates]);

  // 刷新逻辑：连接你的 Cloudflare Worker 大脑
  const handleRefreshPrices = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      console.log("🚀 [探针] 正在通过 Cloudflare 呼叫 Gemini 2.0 Flash...");
      const result = await fetchMarketData(holdings);
      if (result && result.rates) {
        setRates(prev => ({ ...prev, ...result.rates }));
        console.log("✅ [探针] 数据同步成功！");
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
            {isRefreshing ? <RefreshCw className="animate-spin" /> : 'Refresh'}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Total (USD)" value={`$${totalValueUSD.toLocaleString()}`} icon={<DollarSign />} />
          <DashboardCard title="Total (CNY)" value={`¥${totalValueCNY.toLocaleString()}`} icon={<Wallet />} />
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-4">Your Assets</h2>
          <div className="space-y-4">
            {holdings.map(h => (
              <div key={h.id} className="flex justify-between border-b pb-2">
                <span>{h.symbol}</span>
                <span className="font-mono">{h.quantity.toLocaleString()} {h.currency}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// 导出组件
ReactDOM.render(<App />, document.getElementById('root'));
