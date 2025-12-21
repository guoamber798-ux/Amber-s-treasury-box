import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface AssetChartModalProps {
  symbol: string;
  onClose: () => void;
}

declare const TradingView: any;

export const AssetChartModal: React.FC<AssetChartModalProps> = ({ symbol, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to guess the correct TradingView symbol format
  const getTVSymbol = (s: string) => {
    const upper = s.toUpperCase();
    if (upper.includes('.HK')) return `HKEX:${upper.replace('.HK', '')}`;
    if (upper.match(/^\d{6}$/)) return `SSE:${upper}`; // Shanghai simplified
    if (upper === 'CASH') return 'FX:EURUSD'; // Default fx for cash generic
    return upper; // Default for NASDAQ/NYSE (e.g. AAPL)
  };

  useEffect(() => {
    if (containerRef.current && typeof TradingView !== 'undefined') {
      new TradingView.widget({
        "width": "100%",
        "height": "100%",
        "symbol": getTVSymbol(symbol),
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "light",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview_widget",
        "studies": [
          "MASimple@tv-basicstudies",
          "RSI@tv-basicstudies"
        ]
      });
    }
  }, [symbol]);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{symbol} Analysis</h3>
            <p className="text-xs text-slate-500">Real-time technical chart</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 bg-white p-1 relative rounded-b-2xl overflow-hidden">
          <div id="tradingview_widget" ref={containerRef} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
};