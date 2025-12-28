// 核心：直接从全局窗口对象获取零件，彻底消灭 "not defined" 报错
const { useState, useEffect, useMemo } = React;
const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } = window.Recharts;

// 复刻精美图标组件
const Icon = ({ name, size = 20 }) => {
  useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [name]);
  return <i data-lucide={name} style={{ width: size, height: size }}></i>;
};

function App() {
  const [holdings] = useState([
    { id: '1', symbol: 'Cash', quantity: 15000, category: 'Cash', currency: 'USD' },
    { id: '2', symbol: 'Cash', quantity: 50000, category: 'Cash', currency: 'CNY' }
  ]);
  const [rates] = useState({ CNY: 7.20 });
  const [history] = useState([
    { time: '09:00', val: 21800 }, { time: '12:00', val: 21944 }, { time: '15:00', val: 21944 }
  ]);

  const totalUSD = useMemo(() => {
    return holdings.reduce((sum, h) => sum + (h.quantity / (h.currency === 'CNY' ? rates.CNY : 1)), 0);
  }, [holdings, rates]);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* 顶部状态栏 [复刻 image_efa7d4.jpg] */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100"><Icon name="sparkles" /></div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">Amber Treasury</h1>
        </div>
        <div className="flex gap-2">
          <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold border border-green-100 flex items-center gap-1">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> AUTO-SYNCING
          </div>
        </div>
      </div>

      {/* 统计汇总 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Net Worth (USD)</p>
          <h2 className="text-4xl font-black text-slate-900">${Math.floor(totalUSD).toLocaleString()}</h2>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-indigo-50 text-indigo-600 rounded-[20px]"><Icon name="dollar-sign" size={28}/></div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Net Worth (CNY)</p>
          <h2 className="text-4xl font-black text-slate-900">¥{Math.floor(totalUSD * rates.CNY).toLocaleString()}</h2>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-blue-50 text-blue-600 rounded-[20px]"><Icon name="wallet" size={28}/></div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Primary Asset</p>
          <h2 className="text-4xl font-black text-slate-900">Cash</h2>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-indigo-50 text-indigo-600 rounded-[20px]"><Icon name="trending-up" size={28}/></div>
        </div>
      </div>

      {/* 图表展示 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <h3 className="font-extrabold mb-8 flex items-center gap-2"><Icon name="history" className="text-indigo-600"/> Wealth Evolution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                <Tooltip />
                <Line type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center">
          <h3 className="font-extrabold mb-8 self-start flex items-center gap-2"><Icon name="pie-chart" className="text-indigo-600"/> Allocation</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={[{name: 'Cash', value: 100}]} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                  <Cell fill="#6366f1" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <p className="text-3xl font-black text-slate-900">100%</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Cash</p>
            </div>
          </div>
        </div>
      </div>

      {/* 资产列表 */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-black text-slate-900 text-xl flex items-center gap-3">Portfolio Assets</h3>
          <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all">Add Asset</button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-10 py-6">Asset</th>
              <th className="px-10 py-6 text-right">Value (USD)</th>
              <th className="px-10 py-6 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {holdings.map(h => (
              <tr key={h.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="px-10 py-8">
                  <p className="font-black text-slate-900 text-lg">{h.symbol} <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-md text-slate-500 ml-2 uppercase font-bold">{h.currency}</span></p>
                  <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">{h.quantity.toLocaleString()} units</p>
                </td>
                <td className="px-10 py-8 text-right">
                  <p className="font-black text-slate-800 text-lg">${Math.floor(h.quantity / (h.currency === 'CNY' ? rates.CNY : 1)).toLocaleString()}</p>
                </td>
                <td className="px-10 py-8 text-right font-black text-indigo-600">1.00</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 启动渲染
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
