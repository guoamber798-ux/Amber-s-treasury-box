import React, { useState } from 'react';
import { Trash2, Plus, RefreshCw, X, Minus, ArrowRightCircle, BarChart2, Edit3 } from 'lucide-react';
import { Holding, AssetCategory, CurrencyCode } from '../types';

interface AssetListProps {
  type: 'portfolio' | 'watchlist';
  holdings: Holding[];
  rates: Record<string, number>;
  onDelete: (id: string) => void;
  onAdd: (holding: Omit<Holding, 'id' | 'currentPrice' | 'lastUpdated'>) => void;
  onRefreshPrices: () => void;
  onUpdateQuantity?: (id: string, newTotal: number) => void;
  onMoveToPortfolio?: (holding: Holding) => void;
  onViewChart: (symbol: string) => void;
  isRefreshing: boolean;
}

export const AssetList: React.FC<AssetListProps> = ({ 
  type,
  holdings, 
  rates, 
  onDelete, 
  onAdd, 
  onRefreshPrices, 
  onUpdateQuantity,
  onMoveToPortfolio,
  onViewChart,
  isRefreshing 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [moveItem, setMoveItem] = useState<Holding | null>(null);
  const [editingItem, setEditingItem] = useState<Holding | null>(null);
  const [newAsset, setNewAsset] = useState({
    symbol: '',
    quantity: 0,
    category: AssetCategory.Stock,
    currency: 'USD' as CurrencyCode
  });

  const handleOpenAdd = () => {
    setMoveItem(null);
    setEditingItem(null);
    setNewAsset({ symbol: '', quantity: 0, category: AssetCategory.Stock, currency: 'USD' });
    setIsModalOpen(true);
  };

  const handleOpenMove = (holding: Holding) => {
    setMoveItem(holding);
    setEditingItem(null);
    setNewAsset({
      symbol: holding.symbol,
      quantity: 0, // When moving, we want them to input how much they bought
      category: holding.category as AssetCategory,
      currency: holding.currency
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (holding: Holding) => {
    setEditingItem(holding);
    setMoveItem(null);
    setNewAsset({
      symbol: holding.symbol,
      quantity: holding.quantity,
      category: holding.category as AssetCategory,
      currency: holding.currency
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem && onUpdateQuantity) {
      // Logic for editing current portfolio quantity
      onUpdateQuantity(editingItem.id, Number(newAsset.quantity));
    } else if (moveItem && onMoveToPortfolio) {
      // Logic for Moving from Watchlist to Portfolio
      const qty = Number(newAsset.quantity);
      if (qty > 0) {
        onMoveToPortfolio({
          ...moveItem,
          symbol: newAsset.symbol.toUpperCase(),
          quantity: qty,
          category: newAsset.category,
          currency: newAsset.currency
        });
      }
    } else if (newAsset.symbol) {
      // Logic for Normal Add
      const qty = type === 'watchlist' && newAsset.quantity === 0 ? 0 : Number(newAsset.quantity);
      onAdd({
        symbol: newAsset.symbol.toUpperCase(),
        quantity: qty,
        category: newAsset.category,
        currency: newAsset.currency
      });
    }

    // Reset and Close
    setIsModalOpen(false);
    setMoveItem(null);
    setEditingItem(null);
  };

  // Helper to convert native value to USD and CNY
  const getValues = (holding: Holding) => {
    const quantity = holding.quantity || 0;
    const nativeValue = quantity * holding.currentPrice;
    const rateToUSD = rates[holding.currency] || 1; 
    const valueInUSD = holding.currency === 'USD' ? nativeValue : nativeValue / rateToUSD;
    const valueInCNY = valueInUSD * (rates['CNY'] || 7.2);
    
    return { nativeValue, valueInUSD, valueInCNY };
  };

  const modalTitle = editingItem 
    ? `Update ${editingItem.symbol} Position`
    : moveItem 
      ? "Buy Asset / Move to Portfolio" 
      : `Add to ${type === 'portfolio' ? 'Portfolio' : 'Watchlist'}`;

  const submitButtonText = editingItem 
    ? "Save Changes"
    : moveItem 
      ? "Confirm Purchase" 
      : "Add Item";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100/60 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-wrap gap-4 bg-gradient-to-r from-white to-slate-50/50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
           <span className={`w-1 h-5 rounded-full ${type === 'portfolio' ? 'bg-cyan-500' : 'bg-indigo-400'}`}></span>
           {type === 'portfolio' ? 'Portfolio Assets' : 'Watchlist'}
        </h2>
        <div className="flex gap-2">
          {type === 'portfolio' && (
            <button 
              onClick={onRefreshPrices}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all ${isRefreshing ? 'opacity-50' : ''}`}
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              Sync
            </button>
          )}
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all shadow-md active:scale-95"
          >
            <Plus size={14} />
            Add {type === 'portfolio' ? 'Asset' : 'Item'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-bold tracking-wider sticky top-0 backdrop-blur-sm z-10">
            <tr>
              <th className="px-6 py-3">Asset</th>
              {type === 'portfolio' && <th className="px-4 py-3 text-right">Value (USD)</th>}
              <th className="px-4 py-3 text-right">Price ({type === 'portfolio' ? 'Native' : 'Live'})</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {holdings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  <p className="text-sm">List is empty.</p>
                </td>
              </tr>
            ) : (
              holdings.map((holding) => {
                const { valueInUSD } = getValues(holding);
                return (
                  <tr 
                    key={holding.id} 
                    className="group hover:bg-indigo-50/30 transition-colors cursor-pointer"
                    onClick={() => onViewChart(holding.symbol)}
                  >
                    <td className="px-6 py-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{holding.symbol}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">{holding.currency}</span>
                        </div>
                        {type === 'portfolio' && (
                          <span className="text-xs text-slate-400 mt-0.5">{holding.quantity.toLocaleString()} units</span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">{holding.category}</span>
                      </div>
                    </td>
                    
                    {type === 'portfolio' && (
                       <td className="px-4 py-3 text-right">
                         <div className="font-semibold text-slate-900 text-sm">${valueInUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                       </td>
                    )}

                    <td className="px-4 py-3 text-right">
                      <div className="font-mono text-sm text-indigo-600 font-medium">
                        {holding.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-400">per unit</div>
                    </td>

                    <td className="px-6 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        
                        <button 
                           onClick={() => onViewChart(holding.symbol)}
                           className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                           title="View Chart"
                        >
                           <BarChart2 size={16} />
                        </button>

                        {type === 'portfolio' ? (
                          <button 
                            onClick={() => handleOpenEdit(holding)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-0.5"
                            title="Adjust Position"
                          >
                            <Plus size={14} className="text-green-500" />
                            <Minus size={14} className="text-amber-500" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleOpenMove(holding)}
                            className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Add to Portfolio"
                          >
                            <ArrowRightCircle size={16} />
                          </button>
                        )}
                        
                        <div className="w-px h-4 bg-slate-200 mx-1"></div>

                        <button 
                          onClick={() => onDelete(holding.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Move/Edit Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200 ring-1 ring-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">{modalTitle}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Symbol / Name</label>
                  <input 
                    type="text" 
                    required
                    disabled={!!editingItem}
                    placeholder="e.g. AAPL, 0700.HK, BTC"
                    className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium ${editingItem ? 'opacity-60 cursor-not-allowed' : ''}`}
                    value={newAsset.symbol}
                    onChange={(e) => setNewAsset({...newAsset, symbol: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                    <select 
                      disabled={!!editingItem}
                      className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none ${editingItem ? 'opacity-60 cursor-not-allowed' : ''}`}
                      value={newAsset.category}
                      onChange={(e) => setNewAsset({...newAsset, category: e.target.value as AssetCategory})}
                    >
                      {Object.values(AssetCategory).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Currency</label>
                    <select 
                      disabled={!!editingItem}
                      className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none ${editingItem ? 'opacity-60 cursor-not-allowed' : ''}`}
                      value={newAsset.currency}
                      onChange={(e) => setNewAsset({...newAsset, currency: e.target.value as CurrencyCode})}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="CNY">CNY (¥)</option>
                      <option value="HKD">HKD (HK$)</option>
                    </select>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {editingItem 
                      ? 'Current Holding Amount' 
                      : moveItem 
                        ? 'Quantity Purchased' 
                        : (type === 'portfolio' ? 'Quantity Owned' : 'Target Quantity (Optional)')}
                  </label>
                  <input 
                    type="number" 
                    required={moveItem !== null || type === 'portfolio' || !!editingItem}
                    step="any"
                    autoFocus={!!editingItem}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-mono"
                    value={newAsset.quantity}
                    onChange={(e) => setNewAsset({...newAsset, quantity: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-lg shadow-indigo-200"
                >
                  {submitButtonText}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};