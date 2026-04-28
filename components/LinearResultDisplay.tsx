import React from 'react';
import type { LinearOptimizationResult } from '../types';

interface LinearResultDisplayProps {
  result: LinearOptimizationResult | null;
  isLoading: boolean;
  error: string | null;
}

const getColor = (id: string) => {
  return "#000000"; 
};

const LinearResultDisplay: React.FC<LinearResultDisplayProps> = ({ result, isLoading, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 border-4 border-slate-900 dark:border-white border-t-transparent animate-spin rounded-full mb-4"></div>
          <p className="text-slate-500 font-black uppercase tracking-widest animate-pulse text-[10px]">Calculando Eficiencia...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-slate-200 dark:border-slate-800 rounded text-red-600 dark:text-red-400 flex items-center gap-3">
          <p className="font-black uppercase tracking-widest text-xs">{error}</p>
        </div>
      );
    }

    if (!result) {
      return (
        <div className="text-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-300">
          <h3 className="text-sm font-black uppercase tracking-[0.3em]">A la espera de datos</h3>
          <p className="mt-2 text-[9px] uppercase font-bold tracking-widest">Configure las medidas y ejecute la optimización.</p>
        </div>
      );
    }

    const { usedBars, unplacedPieces, placedPiecesCount, offcutsCount, totalEfficiency } = result;

    // Group bars by profile
    const barsByProfile: Record<string, typeof usedBars> = {};
    usedBars.forEach(bar => {
        if (!barsByProfile[bar.profile]) barsByProfile[bar.profile] = [];
        barsByProfile[bar.profile].push(bar);
    });

    return (
      <div className="space-y-12 w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Uso Promedio</h4>
                <p className="text-4xl font-black text-slate-950 dark:text-white leading-none">{totalEfficiency.toFixed(1)}%</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Barras Totales</h4>
                <p className="text-4xl font-black text-slate-400 leading-none">{usedBars.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Piezas Cortadas</h4>
                <p className="text-4xl font-black text-slate-950 dark:text-white leading-none">{placedPiecesCount}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Retales Útiles</h4>
                <p className="text-4xl font-black text-slate-950 dark:text-white leading-none">{offcutsCount}</p>
            </div>
        </div>

        <div className="space-y-10">
            {Object.entries(barsByProfile).map(([profile, bars]) => (
                <div key={profile} className="space-y-4">
                    <div className="flex items-center gap-4 border-b-2 border-slate-950 dark:border-white pb-2 mb-6">
                        <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-[0.2em]">Perfil: {profile}</h3>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
                            {bars.length} Barra(s)
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {bars.map((bar) => {
                            const efficiency = (bar.totalLengthUsed / bar.totalLength) * 100;
                            return (
                                <div key={bar.id} className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center text-[10px] font-black italic">{bar.id + 1}</span>
                                            <h4 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-widest">Base: {bar.totalLength} MM</h4>
                                        </div>
                                        <div className="flex gap-4 text-[10px] font-black uppercase tracking-tighter">
                                            <span className="text-emerald-600 dark:text-emerald-400">Eficiencia: {efficiency.toFixed(1)}%</span>
                                            <span className="text-slate-400">Resto: {bar.remainingLength.toFixed(1)}mm</span>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full bg-slate-100 dark:bg-slate-950 h-20 flex items-center overflow-hidden border border-slate-200 dark:border-slate-800 p-1 relative rounded-sm">
                                        {bar.pieces.map((piece, idx) => (
                                            <div key={`${piece.id}-${idx}`}
                                                style={{ 
                                                    width: `${(piece.length / bar.totalLength) * 100}%`, 
                                                    backgroundColor: '#000',
                                                }}
                                                className="h-full flex flex-col items-center justify-center text-white font-black border-r-2 border-white dark:border-slate-900 opacity-30 hover:opacity-100 transition-opacity cursor-help overflow-hidden px-1"
                                                title={`${piece.label || 'Pieza'} - ${piece.length}mm - Corte #${piece.sequence}`}>
                                                <span className="text-[10px] leading-none mb-1">{piece.length}</span>
                                                {piece.label && <span className="text-[8px] opacity-60 leading-tight truncate w-full text-center px-0.5 uppercase tracking-tighter">{piece.label}</span>}
                                                <div className="absolute bottom-1 right-1 text-[6px] opacity-40 font-mono">C{piece.sequence}</div>
                                            </div>
                                        ))}
                                        {bar.remainingLength > 0.01 && (
                                            <div
                                                style={{ width: `${(bar.remainingLength / bar.totalLength) * 100}%` }}
                                                className="h-full bg-slate-50 dark:bg-white/5 flex flex-col items-center justify-center text-[10px] text-slate-400 italic font-mono border-l-2 border-dashed border-slate-300 dark:border-slate-700"
                                                title={`Retal / Sobra: ${bar.remainingLength.toFixed(1)}mm`}>
                                                <span className="text-[9px] font-black opacity-50 uppercase tracking-tighter">{bar.remainingLength.toFixed(0)}</span>
                                                {bar.remainingLength > 100 && <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter mt-1">Sobra</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
        
        {unplacedPieces.length > 0 && (
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
                    Piezas No Colocadas
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {unplacedPieces.map((p, i) => (
                        <li key={i} className="bg-red-50 dark:bg-red-900/10 border border-slate-200 dark:border-slate-800 p-3 rounded flex justify-between items-center">
                           <span className="text-red-600 font-black text-xs font-mono">{p.length} MM</span>
                           <span className="text-[10px] font-black text-red-400 uppercase">Q: {p.quantity}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 p-6 md:p-12 rounded-xl h-full min-h-[400px] flex justify-center border border-slate-200 dark:border-slate-900">
      {renderContent()}
    </div>
  );
};

export default LinearResultDisplay;
