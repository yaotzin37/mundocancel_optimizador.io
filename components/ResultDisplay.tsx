import React from 'react';
import type { OptimizationResult } from '../types';

interface ResultDisplayProps {
  result: OptimizationResult | null;
  isLoading: boolean;
  error: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLoading, error }) => {
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
    
    const { stockPanel, placedPieces, wastePercentage, unplacedPieces, totalPieces, panelsUsed, offcuts, cuts } = result;
    const aspectRatio = stockPanel.width / stockPanel.height;

    // Group pieces by panelId
    const panels: { [key: number]: typeof placedPieces } = {};
    placedPieces.forEach(p => {
      const pid = p.panelId || 0;
      if (!panels[pid]) panels[pid] = [];
      panels[pid].push(p);
    });

    // Group cuts by panelId
    const panelCuts: { [key: number]: typeof cuts } = {};
    if (cuts) {
      cuts.forEach(c => {
        const pid = c.panelId || 0;
        if (!panelCuts[pid]) panelCuts[pid] = [];
        panelCuts[pid].push(c);
      });
    }

    return (
      <div className="space-y-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Uso Total</h4>
                <p className="text-4xl font-black text-slate-950 dark:text-white leading-none">{(100 - wastePercentage).toFixed(1)}%</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Desperdicio</h4>
                <p className="text-4xl font-black text-slate-400 leading-none">{wastePercentage.toFixed(1)}%</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Piezas</h4>
                <p className="text-4xl font-black text-slate-950 dark:text-white leading-none">{placedPieces.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Láminas</h4>
                <p className="text-4xl font-black text-slate-950 dark:text-white leading-none">{panelsUsed}</p>
            </div>
        </div>

        <div className="space-y-16">
          {Object.entries(panels).map(([id, pieces]) => (
            <div key={id} className="space-y-6">
              <div className="flex justify-between items-end border-b-2 border-slate-950 dark:border-white pb-3">
                <h3 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-widest flex items-center gap-3">
                  Esquema de Corte 0{parseInt(id) + 1} <span className="text-slate-400 font-mono tracking-tighter">/ {stockPanel.width}x{stockPanel.height} MM</span>
                </h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Guillotine System Active</span>
              </div>

              <div className="relative w-full overflow-hidden bg-white dark:bg-slate-950 rounded-lg p-2 border border-slate-200 dark:border-slate-800" style={{ aspectRatio: `${aspectRatio}` }}>
                <svg className="w-full h-full" viewBox={`0 0 ${stockPanel.width} ${stockPanel.height}`} preserveAspectRatio="xMidYMid meet">
                  <rect x="0" y="0" width={stockPanel.width} height={stockPanel.height} fill="none" stroke="#f1f5f9" strokeWidth="1" />
                  
                  {/* Placed Pieces */}
                  {pieces.map((piece) => (
                    <g key={piece.id}>
                      <rect
                        x={piece.x}
                        y={piece.y}
                        width={piece.width}
                        height={piece.height}
                        fill="#000"
                        fillOpacity="0.04"
                        stroke="#000"
                        strokeWidth="0.5"
                        strokeDasharray="2,2"
                      />
                      {piece.width > 200 && piece.height > 100 && (
                        <text
                          x={piece.x + piece.width / 2}
                          y={piece.y + piece.height / 2}
                          fontSize={Math.min(piece.width / 15, piece.height / 10, 14)}
                          fontWeight="800"
                          fill="#94a3b8"
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="pointer-events-none select-none uppercase tracking-tighter font-mono"
                        >
                          {piece.width} x {piece.height}
                        </text>
                      )}
                    </g>
                  ))}

                  {/* Cut Lines (Physical sequence) */}
                  {(panelCuts[parseInt(id)] || []).map((cut, idx) => {
                    const midX = (cut.x1 + cut.x2) / 2;
                    const midY = (cut.y1 + cut.y2) / 2;
                    
                    return (
                      <g key={idx}>
                        <line 
                          x1={cut.x1} y1={cut.y1} x2={cut.x2} y2={cut.y2} 
                          stroke="#000" strokeWidth="3" 
                          className="dark:stroke-white"
                          strokeLinecap="square"
                        />
                        <g>
                          <rect x={midX-14} y={midY-14} width="28" height="28" fill="#000" className="dark:fill-white" />
                          <text 
                            x={midX} y={midY} 
                            fontSize="16" 
                            fontWeight="900" 
                            fill="#fff" 
                            className="dark:fill-black font-mono"
                            textAnchor="middle" 
                            dominantBaseline="central"
                          >
                            {cut.sequence}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                  <circle cx="0" cy="0" r="8" fill="#000" className="dark:fill-white" />
                </svg>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-100 border border-slate-300"></div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sobrante / Merma</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-[2px] bg-black dark:bg-white"></div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Línea de Corte Secuencial</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {offcuts.length > 0 && (
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
                    Retales Reutilizables
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {offcuts.map((rect, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded">
                            <span className="block text-slate-900 dark:text-white font-black text-xs font-mono">{rect.width}x{rect.height} MM</span>
                        </div>
                    ))}
                </div>
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

export default ResultDisplay;
