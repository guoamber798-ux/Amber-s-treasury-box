const { useState, useEffect, useMemo } = React;
const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } = Recharts;

// 1. 复刻图标组件
const Icon = ({ name, size = 20 }) => {
  useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [name]);
  return <i data-lucide={name} style={{ width: size, height: size }}></i>;
};

function App() {
  const [holdings, setHoldings] = useState([
    { id: '1', symbol: 'Cash', quantity: 15000, category: 'Cash', currency: 'USD', price: 1 },
    { id: '2', symbol: 'Cash', quantity: 50000, category: 'Cash', currency: 'CNY', price: 1 }
  ]);
  const [rates, setRates] = useState({ CNY: 7.20 });
  const [history] = useState([
    { time: '09:00', val: 21800 }, { time: '12:00', val: 21944 }, { time: '15:00', val: 21944 }
  ]);

  const totalUSD = useMemo(() => {
    return holdings.reduce((sum, h) => sum + (h.quantity / (h.currency === 'CNY' ? rates.CNY : 1)), 0);
  }, [holdings, rates]);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white"><Icon name="sparkles" /></div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">AMBER TREASURY</h1>
        </div>
        <div className="flex gap-2">
          <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold border border-green-100 flex items-center gap-1">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> AUTO-SYNCING
          </div>
          <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-200">BOX-2EJE4B</div>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Net Worth (USD)</p>
          <h2 className="text-3xl font-extrabold text-slate-900">${Math.floor(totalUSD).toLocaleString()}</h2>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Icon name="dollar-sign" size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Net Worth (CNY)</p>
          <h2 className="text-3xl font-extrabold text-slate-900">¥{Math.floor(totalUSD * rates.CNY).toLocaleString()}</h2>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Rate: 1 USD = ¥{rates.CNY}</p>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-blue-50 text-blue-600 rounded-2xl"><Icon name="wallet" size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Primary Asset</p>
          <h2 className="text-3xl font-extrabold text-slate-900">Cash</h2>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">100.0% Weight</p>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Icon name="trending-up" size={24}/></div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-extrabold flex items-center gap-2"><Icon name="history" className="text-indigo-600"/> Wealth Evolution</h3>
            <div className="flex gap-1 bg-slate-50 p-1 rounded-lg">
              <button className="px-3 py-1 text-[10px] font-bold bg-white shadow-sm rounded-md">USD</button>
              <button className="px-3 py-1 text-[10px] font-bold text-slate-400">CNY</button>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                <Tooltip />
                <Line type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={4} dot={false} fill="url(#colorVal)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <h3 className="font-extrabold mb-8 flex items-center gap-2"><Icon name="pie-chart" className="text-indigo-600"/> Allocation</h3>
          <div className="h-[250px] flex items-center justify-center relative">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={[{name: 'Cash', value: 100}]} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  <Cell fill="#6366f1" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Cash</p>
              <p className="text-xl font-black text-slate-900">100%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Assets Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-extrabold flex items-center gap-2 text-indigo-600 text-lg">Portfolio Assets</h3>
          <div className="flex gap-2">
            <button className="bg-white border px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 hover:bg-slate-50"><Icon name="refresh-cw" size={14}/> Sync</button>
            <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-slate-200 flex items-center gap-2 hover:bg-slate-800"><Icon name="plus" size={14}/> Add Asset</button>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase">
            <tr>
              <th className="px-8 py-4">Asset</th>
              <th className="px-8 py-4">Value (USD)</th>
              <th className="px-8 py-4">Price (Native)</th>
              <th className="px-8 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {holdings.map(h => (
              <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <p className="font-bold text-slate-900">{h.symbol} <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 ml-1 uppercase">{h.currency}</span></p>
                  <p className="text-[10px] text-slate-400 font-medium">{h.quantity.toLocaleString()} units</p>
                </td>
                <td className="px-8 py-6 font-bold text-slate-700">${Math.floor(h.quantity / (h.currency === 'CNY' ? rates.CNY : 1)).toLocaleString()}</td>
                <td className="px-8 py-6">
                   <p className="font-bold text-indigo-600 text-sm">1.00</p>
                   <p className="text-[10px] text-slate-300 font-bold uppercase">per unit</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex gap-3 text-slate-300">
                    <Icon name="bar-chart-2" size={16}/> <Icon name="plus" size={16}/> <Icon name="minus" size={16}/> <Icon name="trash-2" size={16}/>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
