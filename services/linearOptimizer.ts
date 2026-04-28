import type { CutBarPiece, PlacedBarPiece, UsedBar, LinearOptimizationResult, StockBar } from '../types';

// Helper para expandir la lista de cortes según la cantidad
function expandCutBarList(cutList: CutBarPiece[]): { originalId: string; instanceId: string; length: number; label?: string }[] {
  const expanded: { originalId: string; instanceId: string; length: number; label?: string }[] = [];
  cutList.forEach(piece => {
    for (let i = 0; i < piece.quantity; i++) {
        expanded.push({
            originalId: piece.id,
            instanceId: `${piece.id}-${i}`,
            length: piece.length,
            label: piece.label
        });
    }
  });
  return expanded;
}

// Helper para expandir el inventario (aunque lo manejaremos con contadores para eficiencia)
function cloneInventory(inventory: StockBar[]): StockBar[] {
    return inventory.map(item => ({ ...item }));
}

export const optimizeLinearCuts = (inventory: StockBar[], cutList: CutBarPiece[], kerf: number): LinearOptimizationResult => {
    // Group cut items by profile
    const profileGroups = new Set<string>();
    cutList.forEach(p => profileGroups.add(p.profile || 'General'));
    inventory.forEach(s => profileGroups.add(s.profile || 'General'));

    const allUsedBars: UsedBar[] = [];
    const allUnplaced: CutBarPiece[] = [];
    
    profileGroups.forEach(profile => {
        const groupInventory = inventory.filter(s => (s.profile || 'General') === profile);
        const groupCutList = cutList.filter(p => (p.profile || 'General') === profile);

        if (groupCutList.length > 0) {
            const groupResult = runLinearOptimization(groupInventory.length > 0 ? groupInventory : inventory.filter(s => !s.profile || s.profile === 'General'), groupCutList, kerf, 'bestFit');
            
            // Adjust bar IDs to be unique across all profiles and assign profile name
            const offset = allUsedBars.length;
            groupResult.usedBars.forEach(bar => {
                bar.id += offset;
                bar.profile = profile;
                allUsedBars.push(bar);
            });
            allUnplaced.push(...groupResult.unplacedPieces);
        }
    });

    const totalPieces = cutList.reduce((sum, p) => sum + p.quantity, 0);
    const totalPlaced = allUsedBars.reduce((sum, bar) => sum + bar.pieces.length, 0);
    const totalEfficiency = allUsedBars.length > 0 
        ? (allUsedBars.reduce((sum, b) => sum + b.totalLengthUsed, 0) / allUsedBars.reduce((sum, b) => sum + b.totalLength, 0)) * 100 
        : 0;

    return {
        usedBars: allUsedBars,
        unplacedPieces: allUnplaced.filter(p => p.quantity > 0),
        inventory,
        totalEfficiency,
        totalPieces,
        placedPiecesCount: totalPlaced,
        offcutsCount: allUsedBars.filter(b => b.remainingLength > 100).length // Offcuts > 100mm considered useful
    };
};

const runLinearOptimization = (inventory: StockBar[], cutList: CutBarPiece[], kerf: number, strategy: 'firstFit' | 'bestFit'): LinearOptimizationResult => {
    const piecesToPlace = expandCutBarList(cutList);
    // Standard FFD heuristic
    piecesToPlace.sort((a, b) => b.length - a.length);

    const availableInventory = cloneInventory(inventory);
    // Sort inventory by length ascending to try and use smaller bars first if they fit
    availableInventory.sort((a, b) => a.length - b.length);

    const usedBars: { id: number, stockId: string, totalLength: number, pieces: PlacedBarPiece[], remainingLength: number }[] = [];
    const unplacedPieces: typeof piecesToPlace = [];
    
    for (const piece of piecesToPlace) {
        const requiredLength = piece.length + kerf;

        let bestBarIdx = -1;
        
        if (strategy === 'firstFit') {
            for (let i = 0; i < usedBars.length; i++) {
                if (usedBars[i].remainingLength >= requiredLength) {
                    bestBarIdx = i;
                    break;
                }
            }
        } else {
            // Best Fit: find the bar that leaves the least remainder
            let minRemainder = Infinity;
            for (let i = 0; i < usedBars.length; i++) {
                if (usedBars[i].remainingLength >= requiredLength) {
                    const remainder = usedBars[i].remainingLength - requiredLength;
                    if (remainder < minRemainder) {
                        minRemainder = remainder;
                        bestBarIdx = i;
                    }
                }
            }
        }

        if (bestBarIdx !== -1) {
            usedBars[bestBarIdx].pieces.push({ 
                id: piece.instanceId, 
                originalId: piece.originalId, 
                length: piece.length,
                label: piece.label 
            });
            usedBars[bestBarIdx].remainingLength -= requiredLength;
        } else {
            // Need a new bar from inventory
            // Find the best bar in inventory. Here "best" means the smallest bar that can fit the requirement.
            let stockToUse: StockBar | null = null;
            for (const stock of availableInventory) {
                if (stock.quantity > 0 && stock.length >= piece.length) {
                    stockToUse = stock;
                    break;
                }
            }

            if (stockToUse) {
                stockToUse.quantity--;
                const newBar = {
                    id: usedBars.length,
                    stockId: stockToUse.id,
                    totalLength: stockToUse.length,
                    pieces: [{ 
                        id: piece.instanceId, 
                        originalId: piece.originalId, 
                        length: piece.length,
                        label: piece.label
                    }],
                    remainingLength: stockToUse.length - requiredLength,
                };
                usedBars.push(newBar);
            } else {
                unplacedPieces.push(piece);
            }
        }
    }

    // Re-assign sequences
    let globalSequence = 1;
    usedBars.forEach(bar => {
        bar.pieces.forEach(p => {
            p.sequence = globalSequence++;
        });
    });

    const totalPieces = piecesToPlace.length;
    let totalLengthOfPlacedPieces = 0;
    let totalStockLengthUsed = 0;
    
    const finalUsedBars: UsedBar[] = usedBars.map(bar => {
        const totalLengthUsed = bar.pieces.reduce((sum, p) => sum + p.length, 0);
        totalLengthOfPlacedPieces += totalLengthUsed;
        totalStockLengthUsed += bar.totalLength;
        return {
            id: bar.id,
            stockId: bar.stockId,
            totalLength: bar.totalLength,
            pieces: bar.pieces,
            totalLengthUsed,
            remainingLength: bar.remainingLength,
        };
    });

    const totalEfficiency = totalStockLengthUsed > 0 ? (totalLengthOfPlacedPieces / totalStockLengthUsed) * 100 : 0;
    const placedPiecesCount = totalPieces - unplacedPieces.length;

    const finalUnplaced = cutList.map(p => {
        const unplacedCount = unplacedPieces.filter(up => up.originalId === p.id).length;
        return { ...p, quantity: unplacedCount };
    }).filter(p => p.quantity > 0);

    const offcutBars = usedBars.filter(bar => bar.remainingLength >= 150);
    const totalOffcutLength = offcutBars.reduce((sum, bar) => sum + bar.remainingLength, 0);

    return {
        usedBars: finalUsedBars,
        unplacedPieces: finalUnplaced,
        inventory,
        totalEfficiency,
        totalPieces,
        placedPiecesCount,
        offcutsCount: offcutBars.length,
        totalOffcutLength,
    };
};
