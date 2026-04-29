import React, { useState, useCallback } from 'react';
import type { CutBarPiece, StockBar } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CalculatorIcon } from './icons/CalculatorIcon';

interface LinearInputPanelProps {
  onOptimize: (inventory: StockBar[], cutList: CutBarPiece[], kerf: number) => void;
  onClear: () => void;
  isLoading: boolean;
}

const LinearInputPanel: React.FC<LinearInputPanelProps> = ({ onOptimize, onClear, isLoading }) => {
  const [inventory, setInventory] = useState<StockBar[]>([
    { id: 'stock-1', profile: 'Marco 3"', length: 6000, quantity: 10 },
    { id: 'stock-2', profile: 'Hoja 3"', length: 6000, quantity: 10 },
    { id: 'stock-3', profile: 'Riel 3"', length: 6000, quantity: 5 }
  ]);
  const [cutList, setCutList] = useState<CutBarPiece[]>([
    { id: 'cut-1', profile: 'Marco 3"', label: 'Cabezal Sup', length: 1500, quantity: 1 },
    { id: 'cut-2', profile: 'Marco 3"', label: 'Zoclo Inf', length: 1500, quantity: 1 },
    { id: 'cut-3', profile: 'Marco 3"', label: 'Jamba Lat', length: 1200, quantity: 2 },
    { id: 'cut-4', profile: 'Hoja 3"', label: 'Cab.+Zoc Hoja', length: 730, quantity: 4 },
    { id: 'cut-5', profile: 'Hoja 3"', label: 'Cerc.+Trasl.', length: 1140, quantity: 4 },
    { id: 'cut-6', profile: 'Riel 3"', label: 'Riel Superior', length: 1500, quantity: 1 },
    { id: 'cut-7', profile: 'Riel 3"', label: 'Riel Inferior', length: 1500, quantity: 1 },
  ]);
  const [kerf, setKerf] = useState<number>(4);

  const handleUpdatePiece = (id: string, field: keyof CutBarPiece, value: any) => {
    setCutList(cutList.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addPiece = useCallback(() => {
    setCutList([...cutList, { id: `cut-${Date.now()}`, profile: 'Marco 3"', label: '', length: 0, quantity: 1 }]);
  }, [cutList]);

  const removePiece = (id: string) => {
    setCutList(cutList.filter(p => p.id !== id));
  };

  const handleUpdateStock = (id: string, field: keyof StockBar, value: any) => {
    setInventory(inventory.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addStock = useCallback(() => {
    setInventory([...inventory, { id: `stock-${Date.now()}`, profile: 'Marco 3"', length: 6000, quantity: 1 }]);
  }, [inventory]);

  const removeStock = (id: string) => {
    setInventory(inventory.filter(s => s.id !== id));
  };
  
  const handleNumericInput = (val: string, setter: (v: number) => void) => {
    const num = parseFloat(val);
    setter(isNaN(num) ? 0 : num);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOptimize(inventory, cutList, kerf);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                Inventario
            </h2>
            <button
                type="button"
                onClick={addStock}
                className="p-1.5 bg-slate-200 dark:bg-slate-700 rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
            >
                <PlusIcon size={14} />
            </button>
        </div>
        <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
            {inventory.map((stock) => (
                <div key={stock.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                        <label className="block text-[8px] font-black text-slate-400 uppercase mb-0.5">Perfil (Mat.)</label>
                        <input
                            type="text"
                            value={stock.profile || ''}
                            onChange={(e) => handleUpdateStock(stock.id, 'profile', e.target.value)}
                            className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-[9px] font-bold"
                        />
                    </div>
                    <div className="col-span-4">
                        <label className="block text-[8px] font-black text-slate-400 uppercase mb-0.5">Largo (mm)</label>
                        <input
                            type="number"
                            value={stock.length || ''}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleNumericInput(e.target.value, (v) => handleUpdateStock(stock.id, 'length', v))}
                            className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-[8px] font-black text-slate-400 uppercase mb-0.5">Cant.</label>
                        <input
                            type="number"
                            value={stock.quantity || ''}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleNumericInput(e.target.value, (v) => handleUpdateStock(stock.id, 'quantity', v))}
                            className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono"
                        />
                    </div>
                    <div className="col-span-2 flex justify-center pt-2">
                        {inventory.length > 1 && (
                            <button onClick={() => removeStock(stock.id)} className="text-slate-300 hover:text-red-500"><TrashIcon size={14}/></button>
                        )}
                    </div>
                </div>
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
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-1 text-[10px] font-black text-slate-300 pt-2">#{index + 1}</div>
                  <div className="col-span-4">
                    <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Nombre / Etiqueta</label>
                    <input
                      type="text"
                      value={piece.label || ''}
                      onChange={(e) => handleUpdatePiece(piece.id, 'label', e.target.value)}
                      placeholder="Identificador"
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-[10px] font-bold"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Perfil</label>
                    <input
                      type="text"
                      value={piece.profile || ''}
                      onChange={(e) => handleUpdatePiece(piece.id, 'profile', e.target.value)}
                      placeholder="Tipo"
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-[10px] font-bold"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Corte (mm)</label>
                    <input
                      type="number"
                      value={piece.length || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleNumericInput(e.target.value, (v) => handleUpdatePiece(piece.id, 'length', v))}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Cant.</label>
                    <input
                      type="number"
                      value={piece.quantity || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleNumericInput(e.target.value, (v) => handleUpdatePiece(piece.id, 'quantity', v))}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center items-end pb-1.5">
                    <button
                      type="button"
                      onClick={() => removePiece(piece.id)}
                      className="text-slate-300 hover:text-black dark:hover:text-white transition-colors"
                    >
                      <TrashIcon size={14} />
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

export default LinearInputPanel;
