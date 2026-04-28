import React, { useState, useCallback, useEffect } from 'react';
import type { StockPanel, CutPiece, OptimizationResult, CutBarPiece, LinearOptimizationResult, StockBar } from './types';
import { optimizeCuts } from './services/optimizer';
import { optimizeLinearCuts } from './services/linearOptimizer';
import InputPanel from './components/InputPanel';
import ResultDisplay from './components/ResultDisplay';
import LinearInputPanel from './components/LinearInputPanel';
import LinearResultDisplay from './components/LinearResultDisplay';
import SplashScreen from './components/SplashScreen';
import { PanelIcon } from './components/icons/PanelIcon';
import { RulerIcon } from './components/icons/RulerIcon';
import { AnimatePresence } from 'motion/react';


type OptimizerType = 'panel' | 'linear';

const App: React.FC = () => {
  const [optimizerType, setOptimizerType] = useState<OptimizerType>('panel');
  const [showSplash, setShowSplash] = useState(true);

  // State for Panel Optimizer
  const [panelResult, setPanelResult] = useState<OptimizationResult | null>(null);
  const [panelIsLoading, setPanelIsLoading] = useState<boolean>(false);
  const [panelError, setPanelError] = useState<string | null>(null);

  // State for Linear Optimizer
  const [linearResult, setLinearResult] = useState<LinearOptimizationResult | null>(null);
  const [linearIsLoading, setLinearIsLoading] = useState<boolean>(false);
  const [linearError, setLinearError] = useState<string | null>(null);

  const handlePanelOptimize = useCallback((stockPanel: StockPanel, cutList: CutPiece[], kerf: number) => {
    setPanelIsLoading(true);
    setPanelError(null);
    setPanelResult(null);

    setTimeout(() => {
      try {
        if (stockPanel.width <= 0 || stockPanel.height <= 0) {
          throw new Error("Las dimensiones del panel principal deben ser mayores que cero.");
        }
        
        const invalidPieces = cutList.filter(p => 
          (p.width > stockPanel.width && p.width > stockPanel.height) || 
          (p.height > stockPanel.width && p.height > stockPanel.height)
        );

        if (invalidPieces.length > 0) {
          throw new Error(`Hay ${invalidPieces.length} pieza(s) que son más grandes que el panel principal, incluso si se rotan.`);
        }

        if (cutList.some(p => p.width <= 0 || p.height <= 0 || p.quantity <= 0)) {
          throw new Error("Las dimensiones y la cantidad de todas las piezas deben ser mayores que cero.");
        }
        
        if (kerf < 0) {
            throw new Error("El grosor de la cuchilla no puede ser negativo.");
        }
        
        const totalPieces = cutList.reduce((acc, p) => acc + p.quantity, 0);
        if (totalPieces > 500) {
          throw new Error("Por seguridad, el límite actual es de 500 piezas totales. Por favor, reduzca la cantidad.");
        }

        const optimizationResult = optimizeCuts(stockPanel, cutList, kerf);
        setPanelResult(optimizationResult);
      } catch (e) {
        if (e instanceof Error) {
            setPanelError(e.message);
        } else {
            setPanelError("Ocurrió un error inesperado durante la optimización.");
        }
      } finally {
        setPanelIsLoading(false);
      }
    }, 50);
  }, []);

  const handlePanelClear = useCallback(() => {
    setPanelResult(null);
    setPanelError(null);
  }, []);

  const handleLinearOptimize = useCallback((inventory: StockBar[], cutList: CutBarPiece[], kerf: number) => {
    setLinearIsLoading(true);
    setLinearError(null);
    setLinearResult(null);

    setTimeout(() => {
      try {
        if (inventory.length === 0) {
          throw new Error("Debe agregar al menos una barra al inventario.");
        }
        
        const maxStockLength = Math.max(...inventory.map(s => s.length));
        const oversizePieces = cutList.filter(p => p.length > maxStockLength);
        if (oversizePieces.length > 0) {
          throw new Error(`Hay ${oversizePieces.length} pieza(s) que exceden la longitud de la barra más grande disponible (${maxStockLength}mm).`);
        }

        if (cutList.some(p => p.length <= 0 || p.quantity <= 0)) {
          throw new Error("La longitud y la cantidad de todas las piezas deben ser mayores que cero.");
        }
        
        if (kerf < 0) {
            throw new Error("El grosor de la cuchilla no puede ser negativo.");
        }

        const totalPieces = cutList.reduce((acc, p) => acc + p.quantity, 0);
        if (totalPieces > 1000) {
          throw new Error("El límite de piezas para optimización lineal es de 1000.");
        }

        const optimizationResult = optimizeLinearCuts(inventory, cutList, kerf);
        setLinearResult(optimizationResult);
      } catch(e) {
        if (e instanceof Error) {
            setLinearError(e.message);
        } else {
            setLinearError("Ocurrió un error inesperado durante la optimización.");
        }
      } finally {
        setLinearIsLoading(false);
      }
    }, 50)
  }, []);

  const handleLinearClear = useCallback(() => {
    setLinearResult(null);
    setLinearError(null);
  }, []);

  const TabButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode
  }> = ({ isActive, onClick, children }) => (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-2 px-6 py-2 text-xs font-black uppercase tracking-wider rounded transition-all focus:outline-none ${
        isActive 
          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' 
          : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {children}
    </button>
  );

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 container mx-auto p-4 md:p-12 font-sans">
      <header className="text-center mb-16">
        <h1 className="text-5xl md:text-8xl font-black text-slate-950 dark:text-white tracking-tighter uppercase leading-none">
          Cortex
        </h1>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 mt-4 uppercase tracking-[0.5em] ml-[0.5em]">
          Optimization Suite / v2.0
        </p>
      </header>

      <div className="mb-12 flex justify-center">
        <div className="bg-white dark:bg-slate-900 p-1.5 flex space-x-2 border border-slate-200 dark:border-slate-800 rounded shadow-sm">
          <TabButton isActive={optimizerType === 'panel'} onClick={() => setOptimizerType('panel')}>
            <PanelIcon />
            Paneles
          </TabButton>
          <TabButton isActive={optimizerType === 'linear'} onClick={() => setOptimizerType('linear')}>
            <RulerIcon />
            Lineal
          </TabButton>
        </div>
      </div>
      
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {optimizerType === 'panel' ? (
          <>
            <div className="lg:col-span-4">
              <InputPanel onOptimize={handlePanelOptimize} onClear={handlePanelClear} isLoading={panelIsLoading} />
            </div>
            <div className="lg:col-span-8">
              <ResultDisplay result={panelResult} isLoading={panelIsLoading} error={panelError} />
            </div>
          </>
        ) : (
          <>
            <div className="lg:col-span-4">
              <LinearInputPanel onOptimize={handleLinearOptimize} onClear={handleLinearClear} isLoading={linearIsLoading}/>
            </div>
            <div className="lg:col-span-8">
              <LinearResultDisplay result={linearResult} isLoading={linearIsLoading} error={linearError} />
            </div>
          </>
        )}
      </main>

      <footer className="text-center mt-12 text-sm text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} Optimizador de Cortes. Creado con experiencia en ingeniería.</p>
      </footer>
    </div>
    </>
  );
};

export default App;
