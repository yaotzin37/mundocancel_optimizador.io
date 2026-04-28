export interface StockPanel {
  width: number;
  height: number;
}

export interface CutPiece {
  id: string;
  width: number;
  height: number;
  quantity: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlacedPiece {
  id: string;
  originalId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isRotated: boolean;
  panelId?: number;
  sequence?: number;
}

export interface CutLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  sequence: number;
  panelId: number;
}

export interface OptimizationResult {
  placedPieces: PlacedPiece[];
  unplacedPieces: CutPiece[];
  stockPanel: StockPanel;
  wastePercentage: number;
  usedArea: number;
  totalPieces: number;
  panelsUsed: number;
  offcuts: Rectangle[];
  cuts: CutLine[];
}

// --- Tipos para Optimizador Lineal ---

export interface StockBar {
  id: string;
  label?: string;
  profile?: string;
  length: number;
  quantity: number;
}

export interface CutBarPiece {
  id: string;
  label?: string;
  profile?: string;
  length: number;
  quantity: number;
}

export interface PlacedBarPiece {
  id: string;
  originalId: string;
  label?: string;
  length: number;
  sequence?: number;
}

export interface UsedBar {
  id: number;
  stockId: string;
  profile: string;
  totalLength: number;
  pieces: PlacedBarPiece[];
  totalLengthUsed: number;
  remainingLength: number;
}

export interface LinearOptimizationResult {
  usedBars: UsedBar[];
  unplacedPieces: CutBarPiece[];
  inventory: StockBar[];
  totalEfficiency: number;
  totalPieces: number;
  placedPiecesCount: number;
  offcutsCount: number;
  totalOffcutLength: number;
}
