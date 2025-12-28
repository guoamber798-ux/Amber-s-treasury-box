const { useState, useEffect, useMemo } = React;

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

function App() {
  const [holdings] = useState([
    { id: '1', symbol: 'Cash', quantity: 15000, category: 'Fiat', currency: 'USD' },
    { id: '2', symbol: 'Cash', quantity: 50000, category: 'Fiat', currency: 'CNY' }
  ]);
  const [rates, setRates] = useState({ CNY: 7.24 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalValueUSD = useMemo(() => {
    return holdings.reduce((sum, h) => {
      const rate = h.currency === 'CNY' ? rates.CNY : 1;
      return sum + (h.quantity / rate);
    }, 0);
  }, [holdings, rates]);

  const refreshData = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const url = 'https://amber-s-treasury-box.guo-amber798.workers.dev';
      const response = await fetch(url, { method: 'POST', body: JSON.stringify({}) });
      const data = await response.json();
      if (data.rates) setRates(data.rates);
    } catch (e) {
      console.error("Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => { refreshData(); }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-slate-900">AMBER TREASURY</h1>
          <button onClick={refreshData} className="p-2 bg-white rounded-xl border">🔄</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Total (USD)" value={`$${totalValueUSD.toLocaleString()}`} icon="💰" />
          <DashboardCard title="USD/CNY Rate" value={rates.CNY} icon="📈" />
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold mb-4">Holdings</h2>
          {holdings.map(h => (
            <div key={h.id} className="flex justify-between py-2 border-b border-slate-50">
              <span className="font-bold">{h.symbol}</span>
              <span>{h.quantity.toLocaleString()} {h.currency}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
