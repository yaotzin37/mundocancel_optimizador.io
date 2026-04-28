import React, { useState, useCallback } from 'react';
import type { StockPanel, CutPiece } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CalculatorIcon } from './icons/CalculatorIcon';

interface InputPanelProps {
  onOptimize: (stockPanel: StockPanel, cutList: CutPiece[], kerf: number) => void;
  onClear: () => void;
  isLoading: boolean;
}

const InputPanel: React.FC<InputPanelProps> = ({ onOptimize, onClear, isLoading }) => {
  const [stockPanel, setStockPanel] = useState<StockPanel>({ width: 3600, height: 2600 });
  const [cutList, setCutList] = useState<CutPiece[]>([
    { id: '1', width: 800, height: 1200, quantity: 2 },
  ]);
  const [kerf, setKerf] = useState<number>(3);

  const presets = [
    { name: '2600 x 3600', w: 2600, h: 3600 },
    { name: '3660 x 2140', w: 3660, h: 2140 },
    { name: '2600 x 1800', w: 2600, h: 1800 },
  ];

  const handleUpdateStock = (field: keyof StockPanel, value: number) => {
    setStockPanel({ ...stockPanel, [field]: value });
  };

  const handleUpdatePiece = (id: string, field: keyof Omit<CutPiece, 'id'>, value: number) => {
    setCutList(cutList.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addPiece = useCallback(() => {
    setCutList([...cutList, { id: Date.now().toString(), width: 0, height: 0, quantity: 1 }]);
  }, [cutList]);

  const removePiece = (id: string) => {
    setCutList(cutList.filter(p => p.id !== id));
  };
  
  const handleNumericInput = (val: string, setter: (v: number) => void) => {
    const num = parseFloat(val);
    setter(isNaN(num) ? 0 : num);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOptimize(stockPanel, cutList, kerf);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
          Lámina Principal
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Ancho (mm)</label>
            <input
              type="number"
              value={stockPanel.width || ''}
              onFocus={(e) => e.target.select()}
              onChange={(e) => handleNumericInput(e.target.value, (v) => handleUpdateStock('width', v))}
              placeholder="0"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Alto (mm)</label>
            <input
              type="number"
              value={stockPanel.height || ''}
              onFocus={(e) => e.target.select()}
              onChange={(e) => handleNumericInput(e.target.value, (v) => handleUpdateStock('height', v))}
              placeholder="0"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all font-mono text-sm"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {presets.map(p => (
                <button 
                    key={p.name}
                    type="button"
                    onClick={() => setStockPanel({ width: p.w, height: p.h })}
                    className="whitespace-nowrap px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-slate-700 dark:text-slate-300 text-[9px] font-black rounded transition-colors uppercase tracking-tight"
                >
                    {p.name}
                </button>
            ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow flex flex-col min-h-0">
        <div className="p-6 flex-grow flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Lista de Corte</h3>
            <button
              type="button"
              onClick={addPiece}
              className="p-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:scale-110 active:scale-95 transition-all shadow-md"
            >
              <PlusIcon size={16} />
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto flex-grow pr-2 custom-scrollbar min-h-[200px]">
            {cutList.map((piece, index) => (
              <div key={piece.id} className="group p-3 bg-slate-50 dark:bg-slate-900/40 rounded border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-1 text-[10px] font-black text-slate-300 self-center">#{index + 1}</div>
                  <div className="col-span-3">
                    <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Ancho</label>
                    <input
                      type="number"
                      value={piece.width || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleNumericInput(e.target.value, (v) => handleUpdatePiece(piece.id, 'width', v))}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Alto</label>
                    <input
                      type="number"
                      value={piece.height || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleNumericInput(e.target.value, (v) => handleUpdatePiece(piece.id, 'height', v))}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Cant.</label>
                    <input
                      type="number"
                      value={piece.quantity || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleNumericInput(e.target.value, (v) => handleUpdatePiece(piece.id, 'quantity', v))}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono"
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => removePiece(piece.id)}
                      className="text-slate-300 hover:text-black dark:hover:text-white p-1 transition-colors"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cuchilla (kerf)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={kerf || ''}
                  onChange={(e) => handleNumericInput(e.target.value, setKerf)}
                  className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono text-center"
                />
                <span className="text-[10px] font-bold text-slate-400">mm</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0 space-y-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white dark:border-slate-900 border-t-transparent animate-spin rounded-full"></div>
            ) : (
              <>
                <CalculatorIcon size={18} />
                Calcular Optimización
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setCutList([]);
              onClear();
            }}
            className="w-full py-2 text-[10px] font-black text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-colors"
          >
            Restablecer todo
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputPanel;
