import type { StockPanel, CutPiece, PlacedPiece, OptimizationResult, Rectangle, CutLine } from '../types';

// Function to expand the cut list based on quantity
function expandCutList(cutList: CutPiece[]): Omit<CutPiece, 'quantity'>[] {
  const expanded: Omit<CutPiece, 'quantity'>[] = [];
  cutList.forEach(piece => {
    for (let i = 0; i < piece.quantity; i++) {
      expanded.push({
        id: `${piece.id}-${i}`,
        width: piece.width,
        height: piece.height,
      });
    }
  });
  return expanded;
}

type SortStrategy = 'area' | 'maxSide' | 'shortSide' | 'width' | 'height';

export const optimizeCuts = (stockPanel: StockPanel, cutList: CutPiece[], kerf: number): OptimizationResult => {
  const strategies: SortStrategy[] = ['area', 'maxSide', 'shortSide', 'width', 'height'];
  let bestResult: OptimizationResult | null = null;

  for (const strategy of strategies) {
    const result = runOptimization(stockPanel, cutList, kerf, strategy);
    
    if (!bestResult || 
        result.panelsUsed < bestResult.panelsUsed || 
        (result.panelsUsed === bestResult.panelsUsed && result.wastePercentage < bestResult.wastePercentage)) {
      bestResult = result;
    }
  }

  return bestResult!;
};

const runOptimization = (stockPanel: StockPanel, cutList: CutPiece[], kerf: number, strategy: SortStrategy): OptimizationResult => {
  const piecesToPlace = expandCutList(cutList);

  // Apply sorting strategy
  piecesToPlace.sort((a, b) => {
    switch (strategy) {
      case 'area': return (b.width * b.height) - (a.width * a.height);
      case 'maxSide': return Math.max(b.width, b.height) - Math.max(a.width, a.height);
      case 'shortSide': return Math.min(b.width, b.height) - Math.min(a.width, a.height);
      case 'width': return b.width - a.width;
      case 'height': return b.height - a.height;
      default: return 0;
    }
  });

  const usedPanels: { id: number; placedPieces: PlacedPiece[]; freeRects: Rectangle[]; cuts: CutLine[] }[] = [];
  const unplacedPieces: Omit<CutPiece, 'quantity'>[] = [];

  for (const piece of piecesToPlace) {
    let placed = false;

    for (const panel of usedPanels) {
      const fit = findBestFit(piece, panel.freeRects, kerf);
      if (fit) {
        placePieceInPanel(piece, panel, fit, kerf);
        placed = true;
        break;
      }
    }

    if (!placed) {
      const newPanel = {
        id: usedPanels.length,
        placedPieces: [],
        freeRects: [{ x: 0, y: 0, width: stockPanel.width, height: stockPanel.height }],
        cuts: []
      };
      
      const fit = findBestFit(piece, newPanel.freeRects, kerf);
      if (fit) {
        placePieceInPanel(piece, newPanel, fit, kerf);
        usedPanels.push(newPanel);
        placed = true;
      } else {
        unplacedPieces.push(piece);
      }
    }
  }

  // Final sequencing of pieces for labeling
  let globalPieceSeq = 1;
  usedPanels.forEach(panel => {
    panel.placedPieces.sort((a, b) => (a.y - b.y) || (a.x - b.x));
    panel.placedPieces.forEach(p => {
      p.sequence = globalPieceSeq++;
    });
  });

  const allPlacedPieces = usedPanels.flatMap(panel => 
    panel.placedPieces.map(p => ({ ...p, panelId: panel.id }))
  );

  const allCuts = usedPanels.flatMap(panel => 
    panel.cuts.map(c => ({ ...c, panelId: panel.id }))
  );

  const totalStockArea = usedPanels.length * stockPanel.width * stockPanel.height;
  const usedArea = allPlacedPieces.reduce((acc, p) => acc + p.width * p.height, 0);
  const wastePercentage = totalStockArea > 0 ? ((totalStockArea - usedArea) / totalStockArea) * 100 : 0;

  const finalUnplaced = cutList.map(p => {
    const unplacedCount = unplacedPieces.filter(up => up.id.startsWith(p.id)).length;
    return { ...p, quantity: unplacedCount };
  }).filter(p => p.quantity > 0);

  const allOffcuts = usedPanels.flatMap(panel => 
    panel.freeRects.filter(rect => rect.width >= 100 && rect.height >= 100)
  );

  return {
    placedPieces: allPlacedPieces,
    unplacedPieces: finalUnplaced,
    stockPanel,
    wastePercentage,
    usedArea,
    totalPieces: piecesToPlace.length,
    panelsUsed: usedPanels.length,
    offcuts: allOffcuts,
    cuts: allCuts,
  };
};

function findBestFit(piece: any, freeRects: Rectangle[], kerf: number) {
  let bestFit: { rectIndex: number; x: number; y: number; isRotated: boolean; score: number } | null = null;
  
  const dimensions = [
    { width: piece.width, height: piece.height, rotated: false },
    { width: piece.height, height: piece.width, rotated: true },
  ];

  for (const dim of dimensions) {
    for (let i = 0; i < freeRects.length; i++) {
      const rect = freeRects[i];
      if (dim.width <= rect.width && dim.height <= rect.height) {
        const leftoverW = rect.width - dim.width;
        const leftoverH = rect.height - dim.height;
        const shortSideFit = Math.min(leftoverW, leftoverH);
        const longSideFit = Math.max(leftoverW, leftoverH);
        const score = shortSideFit * 1000 + longSideFit;

        if (bestFit === null || score < bestFit.score) {
          bestFit = { rectIndex: i, x: rect.x, y: rect.y, isRotated: dim.rotated, score };
        }
      }
    }
  }
  return bestFit;
}

function placePieceInPanel(piece: any, panel: any, fit: any, kerf: number) {
  const { rectIndex, x, y, isRotated } = fit;
  const placedWidth = isRotated ? piece.height : piece.width;
  const placedHeight = isRotated ? piece.width : piece.height;

  panel.placedPieces.push({
    id: piece.id,
    originalId: piece.id.split('-')[0],
    x,
    y,
    width: placedWidth,
    height: placedHeight,
    isRotated,
  });

  const rect = panel.freeRects.splice(rectIndex, 1)[0];
  
  const pw = placedWidth + kerf;
  const ph = placedHeight + kerf;

  const splitHorizontally = (rect.width * (rect.height - ph)) > (rect.height * (rect.width - pw));

  if (splitHorizontally) {
    if (rect.height > ph) {
      // Physical cut line: Across the entire rectangle width at Y position
      panel.cuts.push({
        x1: rect.x,
        y1: rect.y + ph - (kerf/2),
        x2: rect.x + rect.width,
        y2: rect.y + ph - (kerf/2),
        sequence: panel.cuts.length + 1,
        panelId: panel.id
      });

      panel.freeRects.push({
        x: rect.x, y: rect.y + ph, width: rect.width, height: rect.height - ph,
      });
    }
    if (rect.width > pw) {
      // Sub-cut: Across the height of the bottom strip
      panel.cuts.push({
        x1: rect.x + pw - (kerf/2),
        y1: rect.y,
        x2: rect.x + pw - (kerf/2),
        y2: rect.y + ph,
        sequence: panel.cuts.length + 1,
        panelId: panel.id
      });

      panel.freeRects.push({
        x: rect.x + pw, y: rect.y, width: rect.width - pw, height: ph,
      });
    }
  } else {
    if (rect.width > pw) {
      // Physical cut line: Across the entire rectangle height at X position
      panel.cuts.push({
        x1: rect.x + pw - (kerf/2),
        y1: rect.y,
        x2: rect.x + pw - (kerf/2),
        y2: rect.y + rect.height,
        sequence: panel.cuts.length + 1,
        panelId: panel.id
      });

      panel.freeRects.push({
        x: rect.x + pw, y: rect.y, width: rect.width - pw, height: rect.height,
      });
    }
    if (rect.height > ph) {
      // Sub-cut: Across the width of the left strip
      panel.cuts.push({
        x1: rect.x,
        y1: rect.y + ph - (kerf/2),
        x2: rect.x + pw,
        y2: rect.y + ph - (kerf/2),
        sequence: panel.cuts.length + 1,
        panelId: panel.id
      });

      panel.freeRects.push({
        x: rect.x, y: rect.y + ph, width: pw, height: rect.height - ph,
      });
    }
  }
  
  panel.freeRects.sort((a, b) => (b.width * b.height) - (a.width * a.height));
}
