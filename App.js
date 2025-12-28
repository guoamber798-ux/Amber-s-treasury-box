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

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-black text-slate-900">AMBER TREASURY</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Total (USD)" value="$65,000" icon="💰" />
          <DashboardCard title="USD/CNY Rate" value={rates.CNY} icon="📈" />
        </div>
      </div>
    </div>
  );
}

// 使用 React 18 的新渲染方式，且不使用 export
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
