import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Wallet, TrendingUp, DollarSign, 
  Sparkles, History, User as UserIcon, LogOut, CloudCheck, CloudOff, RefreshCw
} from 'lucide-react';
import { DashboardCard } from './components/DashboardCard';
import { AllocationChart } from './components/AllocationChart';
import { AssetList } from './components/AssetList';
import { AssetChartModal } from './components/AssetChartModal';
import { HistoryChart } from './components/HistoryChart';
import { AuthModal } from './components/AuthModal';
import { Holding, AssetCategory, ChartDataPoint, HistoryPoint, User } from './types';
import { fetchMarketData } from './services/geminiService';

const INITIAL_HOLDINGS: Holding[] = [
  { id: '1', symbol: 'Cash', quantity: 15000, category: AssetCategory.Cash, currency: 'USD', currentPrice: 1, lastUpdated: Date.now() },
  { id: '2', symbol: 'Cash', quantity: 50000, category: AssetCategory.Cash, currency: 'CNY', currentPrice: 1, lastUpdated: Date.now() },
];

const INITIAL_WATCHLIST: Holding[] = [];

const STORAGE_KEYS = {
  USER: 'amber_treasury_user',
  HOLDINGS: 'amber_treasury_holdings',
  WATCHLIST: 'amber_treasury_watchlist',
  HISTORY: 'amber_treasury_history'
};

function App() {
  // Auth State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [holdings, setHoldings] = useState<Holding[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HOLDINGS);
    return saved ? JSON.parse(saved) : INITIAL_HOLDINGS;
  });
  
  const [watchlist, setWatchlist] = useState<Holding[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    return saved ? JSON.parse(saved) : INITIAL_WATCHLIST;
  });

  const [history, setHistory] = useState<HistoryPoint[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  // 设置默认汇率，防止 Gemini 还没返回时计算报错
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1, CNY: 7.24, HKD: 7.82 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  
  const [selectedChartSymbol, setSelectedChartSymbol] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // 持久化存储
  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.USER);
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOLDINGS, JSON.stringify(holdings));
    if (user) {
      setSyncStatus('syncing');
      setTimeout(() => setSyncStatus('synced'), 800);
    }
  }, [holdings, user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  // 核心计算逻辑
  const { totalValueUSD, totalValueCNY, allocationData } = useMemo(() => {
    let totalUSD = 0;
    const categoryTotals: Record<string, number> = {};

    holdings.forEach(h => {
      const nativeValue = h.quantity * (h.currentPrice || 0);
      const rateToUSD = rates[h.currency] || 1;
      const valUSD = nativeValue / rateToUSD;

      totalUSD += valUSD;
      categoryTotals[h.category] = (categoryTotals[h.category] || 0) + valUSD;
    });

    const totalCNY = totalUSD * (rates['CNY'] || 7.24);

    const chartData: ChartDataPoint[] = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      color: '', 
      percent: totalUSD > 0 ? value / totalUSD : 0
    })).sort((a, b) => b.value - a.value);

    return { totalValueUSD: totalUSD, totalValueCNY: totalCNY, allocationData: chartData };
  }, [holdings, rates]);

  // 核心刷新函数：这里加入了“探针”
  const handleRefreshPrices = async (currentHoldings = holdings, currentWatchlist = watchlist) => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    console.log("🚀 [探针] 开始同步市场数据...");
    
    try {
      const allAssets = [...currentHoldings, ...currentWatchlist];
      const result = await fetchMarketData(allAssets);
      
      if (!result) throw new Error("后端未返回任何数据");
      console.log("✅ [探针] 数据已送达:", result);

      const { rates: newRates, prices } = result;
      if (newRates) setRates(prev => ({ ...prev, ...newRates }));
      
      const updateList = (list: Holding[]) => list.map(h => {
         if (h.category === AssetCategory.Cash) {
           return { ...h, currentPrice: 1, lastUpdated: Date.now() };
         }
         // 增加兼容性处理，如果 prices 为空则保持原价
         let newPrice = prices ? prices[h.symbol] : undefined;
         const finalPrice = (newPrice !== undefined && newPrice > 0) ? newPrice : h.currentPrice;
         return { ...h, currentPrice: finalPrice, lastUpdated: Date.now() };
      });

      const nextHoldings = updateList(currentHoldings);
      const nextWatchlist = updateList(currentWatchlist);
      
      setHoldings(nextHoldings);
      setWatchlist(nextWatchlist);
      setLastUpdated(new Date());

      // 计算并存入历史记录
      let tUSD = 0;
      nextHoldings.forEach(h => {
        const r = (newRates && newRates[h.currency]) || 1;
        tUSD += (h.quantity * h.currentPrice) / r;
      });
      const tCNY = tUSD * ((newRates && newRates['CNY']) || 7.24);

      setHistory(prev => [...prev, { timestamp: Date.now(), valueUSD: tUSD, valueCNY: tCNY }].slice(-100));

    } catch (error) {
      console.error("❌ [探针] 刷新失败:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 首次加载自动刷新
  useEffect(() => {
    handleRefreshPrices();
  }, []);

  // Handlers
  const handleLogin = (username: string) => {
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      username,
      lastSync: Date.now()
    });
  };

  const handleLogout = () => {
    if (confirm("确定登出吗？")) {
      setUser(null);
      setIsUserMenuOpen(false);
    }
  };

  const handleAddAsset = (listType: 'portfolio' | 'watchlist', newHolding: Omit<Holding, 'id' | 'currentPrice' | 'lastUpdated'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const initialPrice = newHolding.category === AssetCategory.Cash ? 1 : 0;
    const holdingToAdd = { ...newHolding, id, currentPrice: initialPrice, lastUpdated: Date.now() };

    if (listType === 'portfolio') {
      const updated = [...holdings, holdingToAdd];
      setHoldings(updated);
      setTimeout(() => handleRefreshPrices(updated, watchlist), 100);
    } else {
      const updated = [...watchlist, holdingToAdd];
      setWatchlist(updated);
      setTimeout(() => handleRefreshPrices(holdings, updated), 100);
    }
  };

  const handleDelete = (listType: 'portfolio' | 'watchlist', id: string) => {
    if (listType === 'portfolio') setHoldings(prev => prev.filter(h => h.id !== id));
    else setWatchlist(prev => prev.filter(h => h.id !== id));
  };

  const handleUpdateQuantity = (id: string, newTotal: number) => {
    setHoldings(prev => prev.map(h => h.id === id ? { ...h, quantity: Math.max(0, newTotal) } : h));
  };

  const handleMoveToPortfolio = (holding: Holding) => {
    const existing = holdings.find(h => h.symbol === holding.symbol && h.currency === holding.currency);
    let updatedHoldings;
    if (existing) {
      updatedHoldings = holdings.map(h => h.id === existing.id ? { ...h, quantity: h.quantity + holding.quantity } : h);
    } else {
      updatedHoldings = [...holdings, { ...holding, id: Math.random().toString(36).substr(2, 9) }];
    }
    setHoldings(updatedHoldings);
    setWatchlist(prev => prev.filter(h => h.id !== holding.id));
    setTimeout(() => handleRefreshPrices(updatedHoldings, watchlist.filter(h => h.id !== holding.id)), 100);
  };

  if (!user) return <AuthModal onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {selectedChartSymbol && (
        <AssetChartModal symbol={selectedChartSymbol} onClose={() => setSelectedChartSymbol(null)} />
      )}

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative bg-slate-900 p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-indigo-400" />
              </div>
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                AMBER TREASURY
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                {syncStatus === 'synced' ? (
                  <><CloudCheck size={14} className="text-green-500" /><span className="text-[10px] font-bold text-slate-500 uppercase">Live</span></>
                ) : (
                  <><RefreshCw size={14} className="text-indigo-500 animate-spin" /><span className="text-[10px] font-bold text-slate-500 uppercase">Syncing</span></>
                )}
              </div>

              <div className="relative">
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100">
                  <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 hidden sm:inline">{user.username}</span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard title="Total (USD)" value={`$${totalValueUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} subValue="Real-time Wealth" icon={<DollarSign size={24} />} trend="up" />
          <DashboardCard title="Total (CNY)" value={`¥${totalValueCNY.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} subValue={`Rate: 1 USD = ¥${(rates['CNY'] || 7.24).toFixed(2)}`} icon={<Wallet size={24} />} trend="neutral" />
          <DashboardCard title="Primary Asset" value={allocationData[0]?.name || "None"} subValue={allocationData[0] ? `${(allocationData[0].percent * 100).toFixed(1)}% weight` : "Add assets"} icon={<TrendingUp size={24} />} trend="up" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full">
              <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2"><History size={18} className="text-indigo-500" /> Wealth Evolution</h2>
              <HistoryChart data={history} />
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-cyan-500" /> Asset Allocation</h2>
              <AllocationChart data={allocationData} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <AssetList type="portfolio" holdings={holdings} rates={rates} onDelete={(id) => handleDelete('portfolio', id)} onAdd={(h) => handleAddAsset('portfolio', h)} onRefreshPrices={() => handleRefreshPrices()} onUpdateQuantity={handleUpdateQuantity} onViewChart={setSelectedChartSymbol} isRefreshing={isRefreshing} />
          <AssetList type="watchlist" holdings={watchlist} rates={rates} onDelete={(id) => handleDelete('watchlist', id)} onAdd={(h) => handleAddAsset('watchlist', h)} onRefreshPrices={() => handleRefreshPrices()} onMoveToPortfolio={handleMoveToPortfolio} onViewChart={setSelectedChartSymbol} isRefreshing={isRefreshing} />
        </div>
      </main>
    </div>
  );
}

export default App;
